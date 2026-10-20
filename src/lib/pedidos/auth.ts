import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sessão do /pedidos: cookie assinado (HMAC-SHA256), segredo PRÓPRIO
 * (PEDIDOS_SESSION_SECRET) — revogar este painel não derruba o /adm.
 *
 * LOGIN SÓ POR GESTO, decisão do Felipe (20/10/2026): é o gesto de rotina dele, o mesmo hash
 * do /adm (ADM_GESTO_HASH), sem usuário e senha. Trade-off assumido: um padrão de 9 pontos tem
 * bem menos combinações que senha forte — o que segura é o rate limit do /adm (compartilhado) e o
 * fato de o painel guardar compras de microchip, sem CPF, endereço nem dado de cliente.
 *
 * Fora da Vercel (npm run dev no Mac) não há login: a página só existe em localhost. Para
 * forçar o login também lá, PEDIDOS_EXIGIR_LOGIN=1.
 */
export const PEDIDOS_COOKIE = 'pedidos_sessao';
export const PEDIDOS_COOKIE_PATH = '/pedidos';
export const SESSAO_DIAS = 30;

function segredo(): string | null {
  const s = process.env.PEDIDOS_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

const assinar = (payload: string, chave: string) => createHmac('sha256', chave).update(payload).digest('hex');

/** Valor do cookie de uma sessão que acaba de passar pelo gesto. null se faltar o segredo. */
export function assinarSessao(agora = Date.now()): string | null {
  const chave = segredo();
  if (!chave) return null;
  const payload = `p1.${agora + SESSAO_DIAS * 86_400_000}`;
  return `${payload}.${assinar(payload, chave)}`;
}

export function verificarSessao(valor: string | undefined | null, agora = Date.now()): boolean {
  const chave = segredo();
  if (!chave || !valor) return false;
  const partes = valor.split('.');
  if (partes.length !== 3 || partes[0] !== 'p1') return false;
  const payload = `${partes[0]}.${partes[1]}`;
  const a = Buffer.from(partes[2], 'hex');
  const b = Buffer.from(assinar(payload, chave), 'hex');
  if (a.length === 0 || a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expiraEm = Number(partes[1]);
  return Number.isFinite(expiraEm) && agora <= expiraEm;
}

export function opcoesCookie() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: PEDIDOS_COOKIE_PATH, maxAge: SESSAO_DIAS * 86_400 };
}

/** Na nuvem (Vercel) os dados vêm do Supabase e exigem login; no Mac vêm dos arquivos locais. */
export const modoNuvem = () => Boolean(process.env.VERCEL);
export const exigeLogin = () => modoNuvem() || process.env.PEDIDOS_EXIGIR_LOGIN === '1';

/** Comparação em tempo constante do segredo do coletor (cabeçalho Authorization: Bearer …). */
export function segredoDoColetorConfere(cabecalho: string | null): boolean {
  const esperado = process.env.PEDIDOS_COLETOR_SECRET;
  if (!esperado || esperado.length < 32 || !cabecalho?.startsWith('Bearer ')) return false;
  const a = Buffer.from(cabecalho.slice(7));
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
