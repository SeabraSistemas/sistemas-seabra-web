import { createHmac, timingSafeEqual } from 'node:crypto';
import { decodificarLote, paraB64url, type Lote } from '@/lib/bovinos/lote';

/**
 * Assinatura do lote (HMAC-SHA256 com o segredo de sessão do /bovinos e um
 * contexto próprio, para um token de lote nunca valer como cookie e
 * vice-versa). Sem guardar nada no servidor: a prévia e a gravação podem
 * cair em instâncias diferentes da Vercel.
 */
const CONTEXTO = 'bovinos:lote:v1\n';

function assinar(payload: string, segredo: string): string {
  return createHmac('sha256', segredo).update(CONTEXTO + payload).digest('hex');
}

export function assinarLote(l: Lote, segredo: string): string {
  const payload = paraB64url(JSON.stringify(l));
  return `${payload}.${assinar(payload, segredo)}`;
}

export type FalhaLote = 'formato' | 'assinatura' | 'expirado' | 'email';

export function verificarLote(token: string, segredo: string, email: string, agora = Date.now()): { ok: true; lote: Lote } | { ok: false; motivo: FalhaLote } {
  const partes = String(token ?? '').split('.');
  if (partes.length !== 2 || !segredo) return { ok: false, motivo: 'formato' };
  const [payload, sig] = partes;
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(assinar(payload, segredo), 'hex');
  if (a.length === 0 || a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, motivo: 'assinatura' };
  const lote = decodificarLote(token);
  if (!lote) return { ok: false, motivo: 'formato' };
  if (agora > lote.expiraEm) return { ok: false, motivo: 'expirado' };
  if (lote.email.toLowerCase() !== email.toLowerCase()) return { ok: false, motivo: 'email' };
  return { ok: true, lote };
}
