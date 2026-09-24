import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SANRI_COOKIE, verificarSessao } from './auth';
import { LOGIN_HREF } from './config';
import { getUsuarios } from './queries';

/**
 * Cookie válido E e-mail ainda na User Manager (lista em cache de 5 min) —
 * tirar alguém da aba corta o acesso sem esperar os 30 dias do cookie. Se a
 * planilha não puder ser lida, vale só o cookie: uma falha momentânea do
 * Sheets não deve derrubar quem já estava logado.
 */
async function emailDaSessao(): Promise<string | null> {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(SANRI_COOKIE)?.value);
  if (!email) return null;
  const usuarios = await getUsuarios();
  if (usuarios && !usuarios.some((u) => u.email === email)) return null;
  return email;
}

/** Gate de página/layout — chamado no layout E em cada page (navegação client-side não re-executa o layout). */
export async function exigirSessao(): Promise<string> {
  const email = await emailDaSessao();
  if (!email) redirect(LOGIN_HREF);
  return email;
}

/** Mesma checagem pra route handler: devolve null e quem chama responde 401. */
export async function sessaoApi(): Promise<string | null> {
  return emailDaSessao();
}
