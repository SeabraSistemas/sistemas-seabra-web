import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sessão do /katmandu: cookie assinado (HMAC), sem lib de sessão nova — o
 * gate é "usuário está na lista da aba User Manager", não login com senha,
 * então não há segredo do usuário pra guardar, só a integridade do cookie.
 */
const SESSION_DAYS = 30;
export const KATMANDU_COOKIE = 'katmandu_session';

function secret(): string | null {
  return process.env.KATMANDU_SESSION_SECRET ?? null;
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('hex');
}

/** Gera o valor do cookie para um usuário validado. null se faltar KATMANDU_SESSION_SECRET. */
export function signSession(usuario: string): string | null {
  const key = secret();
  if (!key) return null;
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${Buffer.from(usuario, 'utf8').toString('base64url')}.${expiresAt}`;
  return `${payload}.${sign(payload, key)}`;
}

/** Valida o cookie e devolve o usuário, ou null se ausente/inválido/expirado. */
export function verifySession(cookieValue: string | undefined | null): string | null {
  const key = secret();
  if (!key || !cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 3) return null;
  const [usuarioB64, expiresAtRaw, signature] = parts;
  const payload = `${usuarioB64}.${expiresAtRaw}`;
  const expected = sign(payload, key);

  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  try {
    return Buffer.from(usuarioB64, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}
