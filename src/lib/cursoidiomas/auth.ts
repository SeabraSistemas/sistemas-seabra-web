import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sessão do /cursoidiomas: cookie assinado (HMAC-SHA256), sem lib de sessão.
 * O gate é "e-mail está na lista" (allowlist.ts), não senha — então não há
 * segredo do usuário para guardar, só a integridade do cookie. Cópia fiel do
 * modelo do /katmandu (src/lib/katmandu/auth.ts) com segredo próprio, para
 * que revogar um não derrube o outro.
 */
export const SESSAO_DIAS = 90;
export const CURSO_COOKIE = 'cursoidiomas_session';
/** Cookie só viaja para /cursoidiomas/* (inclui /cursoidiomas/api/*). */
export const CURSO_COOKIE_PATH = '/cursoidiomas';

function segredo(): string | null {
  const s = process.env.CURSOIDIOMAS_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function segredoConfigurado(): boolean {
  return segredo() !== null;
}

function assinar(payload: string, chave: string): string {
  return createHmac('sha256', chave).update(payload).digest('hex');
}

/** Gera o valor do cookie para um e-mail já validado. null se faltar o segredo. */
export function assinarSessao(email: string, agora = Date.now()): string | null {
  const chave = segredo();
  if (!chave) return null;
  const expiraEm = agora + SESSAO_DIAS * 24 * 60 * 60 * 1000;
  const payload = `${Buffer.from(email.trim().toLowerCase(), 'utf8').toString('base64url')}.${expiraEm}`;
  return `${payload}.${assinar(payload, chave)}`;
}

/** Valida o cookie e devolve o e-mail, ou null se ausente/inválido/expirado. */
export function verificarSessao(valor: string | undefined | null, agora = Date.now()): string | null {
  const chave = segredo();
  if (!chave || !valor) return null;

  const partes = valor.split('.');
  if (partes.length !== 3) return null;
  const [emailB64, expiraEmBruto, assinatura] = partes;
  const payload = `${emailB64}.${expiraEmBruto}`;
  const esperada = assinar(payload, chave);

  const a = Buffer.from(assinatura, 'hex');
  const b = Buffer.from(esperada, 'hex');
  if (a.length === 0 || a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiraEm = Number(expiraEmBruto);
  if (!Number.isFinite(expiraEm) || agora > expiraEm) return null;

  try {
    return Buffer.from(emailB64, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}
