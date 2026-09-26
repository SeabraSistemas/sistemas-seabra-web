import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BOVINOS_COOKIE, verificarSessao } from '@/lib/bovinos/auth';
import { LOGIN_HREF } from '@/lib/bovinos/config';

/**
 * Gate de página/layout: sem cookie válido, volta pro login. Chamado no
 * layout autenticado E em cada page — em navegação client-side o Next não
 * re-executa um layout compartilhado (mesma decisão de src/lib/fi-fcg/sessao.ts).
 */
export async function exigirSessao(): Promise<string> {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(BOVINOS_COOKIE)?.value);
  if (!email) redirect(LOGIN_HREF);
  return email;
}

/** Mesma leitura para route handler: nunca redireciona, devolve null (o chamador responde 401). */
export async function sessaoApi(): Promise<string | null> {
  const cookieStore = await cookies();
  return verificarSessao(cookieStore.get(BOVINOS_COOKIE)?.value);
}
