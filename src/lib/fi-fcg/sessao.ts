import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FI_FCG_COOKIE, verificarSessao } from './auth';
import { LOGIN_HREF } from './config';

/**
 * Gate de página/layout: sem cookie válido, redireciona pro login. Chamado no
 * layout autenticado E em cada page (não só no layout) — em navegação
 * client-side o Next não re-executa um layout compartilhado, então um gate só
 * no layout tem uma brecha (mesma lacuna que o /katmandu tem e ainda não
 * fechou; aqui fechamos desde o início).
 */
export async function exigirSessao(): Promise<string> {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(FI_FCG_COOKIE)?.value);
  if (!email) redirect(LOGIN_HREF);
  return email;
}

/** Mesma leitura, mas pra route handler (API): nunca redireciona, devolve null pro chamador decidir (401). */
export async function sessaoApi(): Promise<string | null> {
  const cookieStore = await cookies();
  return verificarSessao(cookieStore.get(FI_FCG_COOKIE)?.value);
}
