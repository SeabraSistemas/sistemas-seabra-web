import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { SessaoAdm } from '@/lib/adm/types';

/**
 * Sessão do /adm: cookie assinado por HMAC-SHA256, sem lib de sessão e sem
 * Supabase Auth. Evolução direta de src/lib/katmandu/auth.ts — com o que falta lá.
 *
 * POR QUE NÃO SUPABASE AUTH
 * O gate natural seria "JWT → usuarios.uuid → regra_de_acesso = 'administrador'".
 * Só que a policy `update_own_user` de `public.usuarios` é `USING(true)` SEM
 * `WITH CHECK`: qualquer pessoa de posse da anon key (que vai dentro do APK)
 * dá PATCH na própria linha e se promove a administrador. O gate do /adm seria
 * uma coluna que o mundo pode escrever. Mantendo o segredo em env var da Vercel,
 * um comprometimento do banco não abre o painel.
 *
 * POR QUE 8h + 30min E NÃO OS 30 DIAS DO KATMANDU
 * O cookie do /katmandu vive 30 dias (SESSION_DAYS=30) e o logout só apaga o
 * cookie — o token continua válido. Lá o dado é a planilha de um cliente; aqui é
 * a base inteira, com contato e CPF de 40 pessoas. Um cookie roubado num
 * notebook esquecido daria um MÊS de acesso. Daí:
 *   absExp  = 8h  → uma jornada. Depois disso, senha e TOTP de novo, sem exceção.
 *   idleExp = 30min→ desliza a cada request; 30 min de café encerram a sessão.
 * E NÃO existe "manter conectado": a caixinha do /katmandu troca segurança por
 * conveniência, e aqui o preço do vazamento é alto demais para essa troca.
 */

export const ADM_COOKIE = 'adm_session';

export const DURACAO_ABSOLUTA_MS = 8 * 60 * 60 * 1000;
export const DURACAO_IDLE_MS = 30 * 60 * 1000;

/**
 * Versão global da sessão. Incrementar `ADM_SESSION_VERSION` na Vercel derruba
 * TODA sessão viva sem trocar o segredo (que também derrubaria, mas invalidaria
 * qualquer coisa futura assinada com a chave antiga). É o botão de pânico barato.
 */
export const VERSAO_SESSAO = Number.parseInt(process.env.ADM_SESSION_VERSION ?? '1', 10) || 1;

/** Cookie maior que isto é lixo ou ataque — nem tenta parsear o JSON. */
const TAMANHO_MAXIMO_COOKIE = 4096;

function segredo(): string | null {
  const valor = process.env.ADM_SESSION_SECRET;
  // Segredo curto demais não é segredo. 32 hex = 16 bytes é o piso aceitável;
  // o script gera 32 bytes. Melhor recusar a assinar do que assinar fraco.
  if (!valor || valor.length < 32) return null;
  return valor;
}

function assinar(payload: string, chave: string): string {
  return createHmac('sha256', chave).update(payload).digest('hex');
}

/** Sessão nova, recém-autenticada (senha + TOTP já conferidos pelo handler). */
export function criarSessao(sub: string, agoraMs: number = Date.now()): SessaoAdm {
  return {
    sub,
    // sid aleatório: é a âncora que liga cada linha da auditoria a UMA sessão, e
    // o que permite revogar uma sessão específica sem trocar o segredo global.
    sid: randomBytes(16).toString('hex'),
    iat: agoraMs,
    absExp: agoraMs + DURACAO_ABSOLUTA_MS,
    idleExp: agoraMs + DURACAO_IDLE_MS,
    v: VERSAO_SESSAO,
  };
}

/** Valor do cookie: b64url(json) + '.' + hmac. null se faltar ADM_SESSION_SECRET. */
export function assinarSessao(sessao: SessaoAdm): string | null {
  const chave = segredo();
  if (!chave) return null;
  const payload = Buffer.from(JSON.stringify(sessao), 'utf8').toString('base64url');
  return `${payload}.${assinar(payload, chave)}`;
}

/**
 * Verifica assinatura E os dois prazos E a versão. Qualquer falha devolve null —
 * nunca uma sessão "meio válida". Sem ADM_SESSION_SECRET também é null: sem
 * segredo não há como distinguir cookie legítimo de forjado, então falha fechada.
 */
export function verificarSessao(
  valorCookie: string | null | undefined,
  agoraMs: number = Date.now(),
): SessaoAdm | null {
  const chave = segredo();
  if (!chave || !valorCookie || valorCookie.length > TAMANHO_MAXIMO_COOKIE) return null;

  const separador = valorCookie.lastIndexOf('.');
  if (separador <= 0) return null;
  const payload = valorCookie.slice(0, separador);
  const assinatura = valorCookie.slice(separador + 1);

  const esperada = assinar(payload, chave);
  const a = Buffer.from(assinatura, 'hex');
  const b = Buffer.from(esperada, 'hex');
  // Comprimento diferente já reprova; timingSafeEqual exige buffers iguais e
  // comparar hex com === vazaria a assinatura correta byte a byte.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let bruto: unknown;
  try {
    bruto = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof bruto !== 'object' || bruto === null) return null;

  const { sub, sid, iat, absExp, idleExp, v } = bruto as Record<string, unknown>;
  if (typeof sub !== 'string' || sub.length === 0) return null;
  if (typeof sid !== 'string' || sid.length === 0) return null;
  if (typeof iat !== 'number' || typeof absExp !== 'number' || typeof idleExp !== 'number') return null;
  if (typeof v !== 'number') return null;

  // A assinatura garante que estes números vieram de nós; ainda assim os dois
  // prazos são checados aqui, e não só na renovação — este é o único ponto por
  // onde toda página e todo route handler passam.
  if (v !== VERSAO_SESSAO) return null;
  if (agoraMs >= absExp) return null;
  if (agoraMs >= idleExp) return null;

  return { sub, sid, iat, absExp, idleExp, v };
}

/**
 * Desliza os 30 min de inatividade SEM mexer no absExp — é isso que faz o teto
 * de 8h ser um teto de verdade: renovar o absoluto junto transformaria a sessão
 * em eterna enquanto houvesse atividade. null quando a sessão já morreu.
 */
export function renovarIdle(sessao: SessaoAdm, agoraMs: number = Date.now()): SessaoAdm | null {
  if (agoraMs >= sessao.absExp || agoraMs >= sessao.idleExp) return null;
  return {
    ...sessao,
    // Teto no absExp: sem o Math.min, o cookie sobreviveria alguns minutos além
    // da jornada, e o cliente ficaria dizendo "válido" para algo que o servidor
    // já recusa.
    idleExp: Math.min(agoraMs + DURACAO_IDLE_MS, sessao.absExp),
  };
}

/**
 * Atributos do cookie, num lugar só — o handler de login, o de logout e o guard
 * precisam ser idênticos, senão o navegador guarda DOIS cookies com o mesmo nome
 * (path diferente) e o bug é impossível de enxergar.
 *
 * sameSite 'strict' (o /katmandu usa 'lax'): o /adm não recebe link de lugar
 * nenhum, então nada se perde — e strict bloqueia CSRF até em navegação
 * top-level. secure sempre true, inclusive em dev: navegador moderno aceita
 * cookie Secure em http://localhost (contexto seguro), então não atrapalha.
 * path '/adm': o cookie NÃO é anexado a nenhuma requisição do site
 * institucional — não aparece em log de CDN nem de analytics. Isso exige que os
 * route handlers do painel morem em src/app/adm/api/*, e não em src/app/api/adm/*.
 */
export function opcoesCookie(sessao: SessaoAdm, agoraMs: number = Date.now()) {
  const fim = Math.min(sessao.idleExp, sessao.absExp);
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    path: '/adm',
    maxAge: Math.max(0, Math.floor((fim - agoraMs) / 1000)),
  };
}

/** Mesmos atributos com maxAge 0 — o logout precisa casar path/sameSite para apagar de fato. */
export const OPCOES_COOKIE_LIMPEZA = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/adm',
  maxAge: 0,
};

/**
 * Recusa POST vindo de outro site (login e logout, os dois únicos POSTs do
 * /adm sem sessão para conferir). O cookie é sameSite 'strict', então um form
 * de terceiro nunca autentica ninguém — mas sem esta checagem qualquer página
 * do mundo dispara tentativa em nome do visitante, queimando o rate limit
 * dele e enchendo a auditoria de ruído.
 *
 * MORA AQUI, e não duplicada em cada route.ts: existiu como duas cópias
 * idênticas (login e logout) até o dia em que só o login ganhou o ajuste do
 * `Origin: null` abaixo — o logout ficou com a versão velha, e "Sair" passou
 * a devolver 403 pro próprio Felipe sem ninguém perceber que era o MESMO bug
 * já corrigido em outro lugar. Duas cópias de uma checagem de segurança são
 * duas chances de UMA delas ficar pra trás.
 *
 * Origin ausente é aceito: navegador antigo omite o header em POST de mesma
 * origem, e recusar aí trancaria o Felipe para fora por causa do navegador.
 *
 * `Origin: null` (a STRING literal "null", não o header ausente) é a mesma
 * história com outra cara: Chrome manda esse valor em certas configurações de
 * proteção de rastreamento, inclusive em POST de mesma origem — confirmado em
 * produção (aba normal E anônima, ambas com `origin=null` no log). `new
 * URL('null')` lançaria e cairia no `catch`, recusando um POST legítimo.
 */
export function mesmaOrigem(request: Request, url: URL): boolean {
  const origem = request.headers.get('origin');
  if (!origem || origem === 'null') return true;
  try {
    // Atrás do proxy da Vercel o host real chega em x-forwarded-host; comparar
    // com url.host puro daria falso negativo em produção.
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}
