import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TRES_IRMAOS_COOKIE, verificarSessao } from '@/lib/tres-irmaos/auth';
import { emailPermitido } from '@/lib/tres-irmaos/allowlist';
import { LOGIN_HREF } from '@/lib/tres-irmaos/config';

/**
 * Gate de página/layout: sem cookie válido, volta pro login. Chamado no
 * layout autenticado E em cada page — em navegação client-side o Next não
 * re-executa um layout compartilhado (mesma decisão de src/lib/bovinos/sessao.ts).
 * A allowlist é conferida de novo aqui: tirar um e-mail da lista derruba a
 * sessão aberta dele no próximo acesso, sem esperar os 30 dias do cookie.
 */
export async function exigirSessao(): Promise<string> {
  const email = await sessaoApi();
  if (!email) redirect(LOGIN_HREF);
  return email;
}

/** Mesma leitura para route handler: nunca redireciona, devolve null (o chamador responde 401). */
export async function sessaoApi(): Promise<string | null> {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(TRES_IRMAOS_COOKIE)?.value);
  return email && emailPermitido(email) ? email : null;
}
