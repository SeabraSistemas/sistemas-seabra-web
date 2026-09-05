import 'server-only';
import { auditoriaClient, publicClient } from '@/lib/adm/supabase-admin';
import type { EventoAuditoria } from '@/lib/adm/types';

/**
 * Trilha de auditoria do /adm — a ÚNICA escrita que o painel faz (decisão D3:
 * as tabelas do app são somente leitura).
 *
 * POR QUE EXISTE (não é capricho)
 * 1. OBRIGAÇÃO. Marco Civil art. 15 manda guardar registros de acesso à
 *    aplicação por 6 meses; LGPD art. 37 manda manter registro das operações de
 *    tratamento — e abrir a ficha completa de um produtor identificado É uma
 *    operação de tratamento.
 * 2. DETECÇÃO. É o único jeito de perceber que a credencial do /adm foi roubada
 *    (uma sessão que abriu 30 clientes às 3h da manhã).
 * 3. RESPOSTA A INCIDENTE. A diferença entre "não sabemos o escopo, avise todo
 *    mundo" e "exatamente estes 4 clientes foram acessados".
 * No app as ESCRITAS já têm trilha (pagamentos_log, admin_delete_actions). O
 * /adm é o primeiro lugar onde LER é o risco.
 *
 * MINIMIZAÇÃO (LGPD): `detalhes` carrega ID, contagem e nome de tabela — NUNCA
 * valor. Nada de e-mail, telefone ou CPF aqui: o log da Vercel tem retenção e
 * busca próprias, fora do controle de retenção do banco.
 */

/**
 * Contrato esperado do SQL (dono: a migration adm_02_auditoria_e_sessoes.sql):
 *
 *   auditoria.adm_acessos(id, ocorrido_em, sessao_sid, ator, acao,
 *                         alvo_tipo, alvo_id, detalhes jsonb, ip inet, user_agent)
 *   public.adm_registrar_acesso(p_sid, p_ator, p_acao, p_alvo_tipo, p_alvo_id,
 *                               p_detalhes, p_ip, p_user_agent)  -- SECURITY DEFINER
 *
 * A RPC é o caminho principal porque o schema `auditoria` fica FORA do
 * db-schemas do PostgREST de propósito — é o que o torna inalcançável pela API
 * REST. O acesso direto à tabela só funciona se alguém expuser o schema, e fica
 * aqui como rede de segurança, não como plano A.
 */
const RPC_REGISTRAR_ACESSO = 'adm_registrar_acesso';
const TABELA_ACESSOS = 'adm_acessos';

/** Detalhes maiores que isto viram ruído e engordam a linha à toa. */
const LIMITE_DETALHES_BYTES = 4000;
const LIMITE_USER_AGENT = 400;

export interface DetalheAuditoria {
  /** SessaoAdm.sid — a âncora que liga a linha a uma sessão específica. */
  sid?: string | null;
  /** Default: ADM_USUARIO. */
  ator?: string | null;
  alvoTipo?: 'usuario' | 'propriedade' | 'tabela' | null;
  alvoId?: number | null;
  /** Só id, contagem e rótulo. Nunca valor de campo pessoal. */
  detalhes?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Qual caminho funcionou na última tentativa. Memoizado para não pagar duas
 * idas ao banco a cada evento quando a RPC não existe. Reinicia no cold start,
 * que é exatamente quando vale reavaliar (a migration pode ter rodado).
 */
let caminhoConhecido: 'rpc' | 'tabela' | null = null;

function recortarDetalhes(detalhes: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!detalhes) return null;
  try {
    const json = JSON.stringify(detalhes);
    if (json.length <= LIMITE_DETALHES_BYTES) return detalhes;
    return { truncado: true, bytes: json.length };
  } catch {
    // Referência circular ou BigInt: o evento importa mais que o detalhe.
    return { truncado: true };
  }
}

async function viaRpc(linha: LinhaAcesso): Promise<boolean> {
  const supa = publicClient();
  if (!supa) return false;
  const { error } = await supa.rpc(RPC_REGISTRAR_ACESSO, {
    p_sessao_sid: linha.sessao_sid,
    p_ator: linha.ator,
    p_acao: linha.acao,
    p_alvo_tipo: linha.alvo_tipo,
    p_alvo_id: linha.alvo_id,
    p_detalhes: linha.detalhes,
    p_ip: linha.ip,
    p_user_agent: linha.user_agent,
  });
  return !error;
}

async function viaTabela(linha: LinhaAcesso): Promise<boolean> {
  const supa = auditoriaClient();
  if (!supa) return false;
  const { error } = await supa.from(TABELA_ACESSOS).insert(linha);
  return !error;
}

interface LinhaAcesso {
  sessao_sid: string | null;
  ator: string;
  acao: EventoAuditoria;
  alvo_tipo: string | null;
  alvo_id: number | null;
  detalhes: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
}

/**
 * Grava um evento. NUNCA lança e nunca retorna erro: auditoria quebrada não pode
 * derrubar a página que o Felipe está abrindo. Falha vira console.error — que é
 * visível na Vercel e é o sinal de que a migration não rodou.
 *
 * Onde chamar: no `abriu_usuario`, ANTES de carregar os dados do cliente. Se
 * gravar depois, um erro no meio do carregamento deixa o acesso sem rastro.
 */
export async function registrarAcesso(evento: EventoAuditoria, detalhe: DetalheAuditoria = {}): Promise<void> {
  const linha: LinhaAcesso = {
    sessao_sid: detalhe.sid ?? null,
    ator: detalhe.ator ?? process.env.ADM_USUARIO ?? 'desconhecido',
    acao: evento,
    alvo_tipo: detalhe.alvoTipo ?? null,
    alvo_id: detalhe.alvoId ?? null,
    detalhes: recortarDetalhes(detalhe.detalhes),
    ip: normalizarIp(detalhe.ip),
    user_agent: detalhe.userAgent ? detalhe.userAgent.slice(0, LIMITE_USER_AGENT) : null,
  };

  try {
    if (caminhoConhecido === 'tabela') {
      if (await viaTabela(linha)) return;
      caminhoConhecido = null;
    }

    if (await viaRpc(linha)) {
      caminhoConhecido = 'rpc';
      return;
    }

    if (await viaTabela(linha)) {
      caminhoConhecido = 'tabela';
      return;
    }

    // Sem PII na mensagem: evento e alvo_id bastam para diagnosticar.
    console.error('[adm] auditoria não gravada', { acao: linha.acao, alvo_id: linha.alvo_id });
  } catch (e) {
    console.error('[adm] auditoria lançou exceção:', e instanceof Error ? e.message : 'erro');
  }
}

/**
 * IP do cliente. Na Vercel o primeiro item de x-forwarded-for é o IP real e o
 * header é injetado pela plataforma (fora dela o header é forjável — o valor só
 * é confiável porque estamos atrás do proxy da Vercel).
 */
export function extrairIp(headers: Headers): string | null {
  const encaminhado = headers.get('x-forwarded-for');
  if (encaminhado) return normalizarIp(encaminhado.split(',')[0]);
  return normalizarIp(headers.get('x-real-ip'));
}

export function extrairUserAgent(headers: Headers): string | null {
  const ua = headers.get('user-agent');
  return ua ? ua.slice(0, LIMITE_USER_AGENT) : null;
}

/**
 * A coluna é `inet`: mandar lixo faz o INSERT inteiro falhar e a auditoria some
 * justamente quando alguém está sondando com header forjado. Valor duvidoso
 * vira null — perde-se o IP, não o registro do evento.
 */
export function normalizarIp(valor: string | null | undefined): string | null {
  if (!valor) return null;
  // Tira colchetes de IPv6 literal e a máscara que o Postgres devolve quando a
  // linha foi gravada com prefixo ('1.2.3.4/32') — sem isso a leitura do rate
  // limit não casaria com o IP da requisição atual.
  const limpo = valor.trim().replace(/^\[|\]$/g, '').replace(/\/\d{1,3}$/, '');
  if (limpo.length === 0 || limpo.length > 45) return null;
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  if (ipv4.test(limpo)) {
    return limpo.split('.').every((octeto) => Number(octeto) <= 255) ? limpo : null;
  }
  return ipv6.test(limpo) && limpo.includes(':') ? limpo : null;
}
