import 'server-only';
import { auditoriaClient, publicClient } from '@/lib/adm/supabase-admin';
import { createHmac } from 'node:crypto';

import { normalizarIp } from '@/lib/adm/audit';

/**
 * Rate limit do login do /adm, com estado no Postgres.
 *
 * POR QUE NÃO UM Map EM MEMÓRIA
 * Na Vercel cada invocação pode cair numa lambda diferente e um cold start zera
 * tudo. Um contador em memória de processo é rate limit de mentira: quem
 * distribui as tentativas nunca esbarra nele, e quem é legítimo pode esbarrar
 * por acaso. Sem Redis/KV (dependência e custo novos), o lugar certo é o banco
 * que já existe — a tabela fica no schema `auditoria`, que já está revogado de
 * public/anon/authenticated.
 *
 * Contrato esperado do SQL (dono: adm_02_auditoria_e_sessoes.sql / adm_03_rpcs.sql):
 *
 *   auditoria.adm_tentativas_login(id, ocorrido_em timestamptz default now(),
 *                                  ip inet, usuario_tentado text,
 *                                  sucesso boolean not null, motivo text)
 *   public.adm_registrar_tentativa(p_ip, p_usuario_tentado, p_sucesso, p_motivo)
 *   public.adm_tentativas_recentes(p_desde timestamptz)
 *        returns table(ocorrido_em timestamptz, ip inet, usuario_tentado text, sucesso boolean)
 *   -- ambas SECURITY DEFINER, com `revoke execute from public, anon, authenticated`
 *   -- (o default do Postgres é EXECUTE para PUBLIC — sem o revoke, a anon key do
 *   -- APK chama a RPC).
 *
 * A janela toda é lida numa query só e contada aqui em TS: com o volume real
 * (um operador, dezenas de linhas por mês) isso é mais barato e MUITO mais
 * legível do que três agregações em SQL.
 */

/** Janela deslizante de análise. Falha mais velha que isso não conta mais. */
const JANELA_MS = 60 * 60 * 1000;

/** Teto de linhas lidas — proteção contra uma janela cheia de ruído. */
const LIMITE_LINHAS = 500;

/**
 * Lockout progressivo: a primeira sequência de erros custa pouco (o Felipe
 * errando a senha), a insistência custa caro (alguém varrendo). Avaliada de
 * cima para baixo — a primeira faixa que casar vence.
 */
const ESCADA = [
  { falhas: 12, bloqueioMs: 60 * 60 * 1000 },
  { falhas: 8, bloqueioMs: 15 * 60 * 1000 },
  { falhas: 5, bloqueioMs: 5 * 60 * 1000 },
];

/**
 * Trava global: 20 falhas de QUALQUER origem em 60 min é o desenho de um ataque
 * distribuído, em que o limite por IP nunca dispara. Com um único operador
 * válido, fechar tudo por 30 min custa quase nada e corta o ataque pela raiz.
 */
const GLOBAL_FALHAS = 20;
const GLOBAL_BLOQUEIO_MS = 30 * 60 * 1000;

/**
 * Piso de latência de toda tentativa de login, sucesso ou falha. Sem ele o
 * endpoint vira cronômetro: resposta rápida = usuário inexistente, resposta
 * lenta = usuário certo com senha errada.
 */
export const PISO_LATENCIA_MS = 400;

export type MotivoTentativa = 'ok' | 'senha' | 'usuario' | 'totp' | 'bloqueado' | 'config';

export interface BloqueioLogin {
  bloqueado: boolean;
  /** Quanto falta para liberar, em segundos (0 quando não há bloqueio). */
  esperaSegundos: number;
  motivo: 'ip' | 'usuario' | 'global' | null;
}

interface Tentativa {
  ocorridoMs: number;
  ip: string | null;
  usuario: string | null;
  sucesso: boolean;
}

interface LinhaTentativa {
  ocorrido_em: string;
  ip: string | null;
  ator: string | null;
  sucesso: boolean;
}

const LIVRE: BloqueioLogin = { bloqueado: false, esperaSegundos: 0, motivo: null };

const RPC_REGISTRAR = 'adm_registrar_tentativa_login';
const RPC_RECENTES = 'adm_tentativas_recentes';
const TABELA = 'adm_tentativas_login';

/** Mesma memoização de audit.ts: evita duas idas ao banco quando a RPC não existe. */
let caminhoLeitura: 'rpc' | 'tabela' | null = null;
let caminhoEscrita: 'rpc' | 'tabela' | null = null;

/**
 * A CHAVE do balde por usuário — não o login digitado.
 *
 * O balde só precisa de algo estável para agrupar tentativas. Guardar o texto
 * cru significa que uma varredura de dicionário enche a trilha com logins de
 * terceiros: e-mails de gente que nunca teve conta aqui viram dado pessoal sob
 * nossa guarda, sem finalidade nenhuma. `audit.ts` já recusa fazer isso.
 *
 * O login do PRÓPRIO operador é exceção e fica legível: é ele que precisa
 * aparecer na trilha quando o Felipe erra a senha, e não é PII de terceiro.
 * Todo o resto vira HMAC — agrupa igual, não identifica ninguém.
 */
function normalizarUsuario(usuario: string | null | undefined): string | null {
  const limpo = (usuario ?? '').trim().toLowerCase();
  if (limpo.length === 0) return null;

  const operador = (process.env.ADM_USUARIO ?? '').trim().toLowerCase();
  if (operador.length > 0 && limpo === operador) return limpo;

  const chave = process.env.ADM_SESSION_SECRET ?? '';
  if (chave.length < 32) return `anon:${limpo.length}`;
  return `h:${createHmac('sha256', chave).update(limpo).digest('hex').slice(0, 32)}`;
}

async function lerRecentes(desdeMs: number): Promise<Tentativa[] | null> {
  const desdeIso = new Date(desdeMs).toISOString();

  const porRpc = async (): Promise<Tentativa[] | null> => {
    const supa = publicClient();
    if (!supa) return null;
    const { data, error } = await supa.rpc(RPC_RECENTES, { p_desde: desdeIso });
    if (error || !Array.isArray(data)) return null;
    return converter(data as LinhaTentativa[]);
  };

  const porTabela = async (): Promise<Tentativa[] | null> => {
    const supa = auditoriaClient();
    if (!supa) return null;
    const { data, error } = await supa
      .from(TABELA)
      .select('ocorrido_em, ip, ator, sucesso')
      .gte('ocorrido_em', desdeIso)
      .order('ocorrido_em', { ascending: false })
      .limit(LIMITE_LINHAS);
    if (error || !data) return null;
    return converter(data as LinhaTentativa[]);
  };

  if (caminhoLeitura === 'tabela') {
    const viaTabela = await porTabela();
    if (viaTabela) return viaTabela;
    caminhoLeitura = null;
  }

  const viaRpc = await porRpc();
  if (viaRpc) {
    caminhoLeitura = 'rpc';
    return viaRpc;
  }

  const viaTabela = await porTabela();
  if (viaTabela) {
    caminhoLeitura = 'tabela';
    return viaTabela;
  }
  return null;
}

/** O valor que já veio do banco, só higienizado — nunca re-derivado. */
function chaveGravada(valor: string | null | undefined): string | null {
  const limpo = (valor ?? '').trim().toLowerCase();
  return limpo.length > 0 ? limpo : null;
}

function converter(linhas: LinhaTentativa[]): Tentativa[] {
  return linhas
    .map((l) => ({
      ocorridoMs: Date.parse(l.ocorrido_em),
      ip: normalizarIp(l.ip),
      // NÃO re-normalizar: o que está gravado JÁ é a chave do balde. Passar
      // de novo por normalizarUsuario() aplicaria HMAC sobre o HMAC e nenhum
      // balde voltaria a casar — o rate limit contaria sempre 1 tentativa.
      usuario: chaveGravada(l.ator),
      sucesso: l.sucesso === true,
    }))
    .filter((t) => Number.isFinite(t.ocorridoMs));
}

/**
 * Avalia um balde (IP, usuário ou global). Falhas ANTERIORES ao último sucesso
 * do mesmo balde são descartadas: sem isso, um login bem-sucedido deixaria o
 * Felipe a duas tentativas do lockout pelo resto da hora.
 */
function avaliarBalde(
  tentativas: Tentativa[],
  agoraMs: number,
  gatilhoGlobal = false,
): { bloqueado: boolean; esperaSegundos: number } {
  const ultimoSucesso = tentativas.reduce((max, t) => (t.sucesso && t.ocorridoMs > max ? t.ocorridoMs : max), 0);
  const falhas = tentativas.filter((t) => !t.sucesso && t.ocorridoMs > ultimoSucesso);
  if (falhas.length === 0) return { bloqueado: false, esperaSegundos: 0 };

  const ultimaFalha = falhas.reduce((max, t) => Math.max(max, t.ocorridoMs), 0);

  const bloqueioMs = gatilhoGlobal
    ? falhas.length >= GLOBAL_FALHAS
      ? GLOBAL_BLOQUEIO_MS
      : 0
    : (ESCADA.find((faixa) => falhas.length >= faixa.falhas)?.bloqueioMs ?? 0);

  if (bloqueioMs === 0) return { bloqueado: false, esperaSegundos: 0 };

  const liberaEm = ultimaFalha + bloqueioMs;
  if (agoraMs >= liberaEm) return { bloqueado: false, esperaSegundos: 0 };
  return { bloqueado: true, esperaSegundos: Math.ceil((liberaEm - agoraMs) / 1000) };
}

/**
 * O login está bloqueado para este IP/usuário agora?
 *
 * TRADE-OFF DELIBERADO: se o banco estiver fora, esta função devolve LIVRE e
 * registra no console. Ou seja, uma falha de infra NÃO tranca o Felipe para
 * fora do painel — ela apenas remove temporariamente a proteção contra força
 * bruta, que ainda tem senha + TOTP + piso de latência atrás dela. A escolha
 * inversa (falhar fechado) transformaria qualquer instabilidade do Supabase
 * numa negação de serviço do /adm inteiro, e o atacante consegue provocar isso.
 */
export async function verificarBloqueio(
  ip: string | null | undefined,
  usuario: string | null | undefined,
  agoraMs: number = Date.now(),
): Promise<BloqueioLogin> {
  const tentativas = await lerRecentes(agoraMs - JANELA_MS);
  if (!tentativas) {
    console.warn('[adm] rate limit indisponível (banco fora ou migration não rodou) — tentativa liberada');
    return LIVRE;
  }

  const ipNormalizado = normalizarIp(ip);
  const usuarioNormalizado = normalizarUsuario(usuario);

  const candidatos: BloqueioLogin[] = [];

  if (ipNormalizado) {
    const r = avaliarBalde(tentativas.filter((t) => t.ip === ipNormalizado), agoraMs);
    if (r.bloqueado) candidatos.push({ ...r, motivo: 'ip' });
  }
  if (usuarioNormalizado) {
    const r = avaliarBalde(tentativas.filter((t) => t.usuario === usuarioNormalizado), agoraMs);
    if (r.bloqueado) candidatos.push({ ...r, motivo: 'usuario' });
  }
  const global = avaliarBalde(tentativas, agoraMs, true);
  if (global.bloqueado) candidatos.push({ ...global, motivo: 'global' });

  if (candidatos.length === 0) return LIVRE;
  // O balde mais restritivo manda.
  return candidatos.reduce((pior, atual) => (atual.esperaSegundos > pior.esperaSegundos ? atual : pior));
}

/**
 * Registra a tentativa (inclusive a bem-sucedida — é ela que zera a contagem do
 * balde). Nunca lança: perder o registro é ruim, derrubar o login por causa dele
 * é pior.
 */
export async function registrarTentativa(entrada: {
  ip: string | null | undefined;
  usuario: string | null | undefined;
  sucesso: boolean;
  motivo: MotivoTentativa;
}): Promise<void> {
  const linha = {
    ip: normalizarIp(entrada.ip),
    // A coluna física é `ator` (adm_03:63); o nome local fica descritivo.
    ator: normalizarUsuario(entrada.usuario),
    sucesso: entrada.sucesso,
    motivo: entrada.motivo,
  };

  const porRpc = async (): Promise<boolean> => {
    const supa = publicClient();
    if (!supa) return false;
    // Os nomes têm que bater EXATAMENTE com adm_03_auditoria.sql:206 — o
    // PostgREST resolve a função pelo nome dos argumentos, não pela posição,
    // e um nome errado vira PGRST202 silencioso em 100% das chamadas.
    const { error } = await supa.rpc(RPC_REGISTRAR, {
      p_ator: linha.ator,
      p_sucesso: linha.sucesso,
      p_motivo: linha.motivo,
      p_ip: linha.ip,
    });
    return !error;
  };

  const porTabela = async (): Promise<boolean> => {
    const supa = auditoriaClient();
    if (!supa) return false;
    const { error } = await supa.from(TABELA).insert(linha);
    return !error;
  };

  try {
    if (caminhoEscrita === 'tabela') {
      if (await porTabela()) return;
      caminhoEscrita = null;
    }
    if (await porRpc()) {
      caminhoEscrita = 'rpc';
      return;
    }
    if (await porTabela()) {
      caminhoEscrita = 'tabela';
      return;
    }
    console.error('[adm] tentativa de login não registrada', { sucesso: linha.sucesso, motivo: linha.motivo });
  } catch (e) {
    console.error('[adm] rate limit lançou exceção:', e instanceof Error ? e.message : 'erro');
  }
}

/**
 * Segura a resposta até completar o piso. Chamar no FIM de toda tentativa —
 * sucesso, falha, bloqueio e erro de configuração — com o instante em que o
 * handler começou.
 */
export async function aplicarPisoDeLatencia(inicioMs: number, pisoMs: number = PISO_LATENCIA_MS): Promise<void> {
  const restante = pisoMs - (Date.now() - inicioMs);
  if (restante <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, restante));
}
