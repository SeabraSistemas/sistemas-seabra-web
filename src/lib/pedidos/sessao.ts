import 'server-only';
import { cookies } from 'next/headers';
import { exigeLogin, PEDIDOS_COOKIE, verificarSessao } from '@/lib/pedidos/auth';

/** Há sessão válida do /pedidos? Fora da Vercel (dev no Mac) não exige login — ver auth.ts. */
export async function sessaoValida(): Promise<boolean> {
  if (!exigeLogin()) return true;
  return verificarSessao((await cookies()).get(PEDIDOS_COOKIE)?.value);
}
