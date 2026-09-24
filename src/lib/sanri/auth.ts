import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sessão do /sanri: cookie assinado (HMAC-SHA256), mesmo modelo de
 * src/lib/fi-fcg/auth.ts, com segredo PRÓPRIO (revogar um painel não derruba
 * os outros). Quem pode entrar vem da aba "User Manager" — ver usuarios.ts.
 */
export const SESSAO_DIAS = 30;
export const SANRI_COOKIE = 'sanri_session';
export const SANRI_COOKIE_PATH = '/sanri';

function segredo(): string | null {
  const s = process.env.SANRI_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

function assinar(payload: string, chave: string): string {
  return createHmac('sha256', chave).update(payload).digest('hex');
}

/** Valor do cookie para um e-mail já conferido na User Manager. null se faltar o segredo. */
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
