import { redirect } from 'next/navigation';
import { getAdmSession } from '@/lib/adm/guard';

/**
 * A porta: /adm não tem tela própria, só decide para onde mandar.
 *
 * Usa getAdmSession() (que devolve null) e não requireAdmSession() (que já
 * redireciona para /adm/login) porque aqui os dois destinos importam — sem
 * sessão vai para o login, com sessão vai para a carteira. Chamar a versão que
 * redireciona esconderia metade da regra dentro do helper.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdmIndexPage() {
  const sessao = await getAdmSession();
  redirect(sessao ? '/adm/carteira' : '/adm/login');
}
