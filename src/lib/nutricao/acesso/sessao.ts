import { cookies } from 'next/headers';
import { NUTRICAO_COOKIE, verificarSessao } from '@/lib/nutricao/acesso/auth';
import { emailPermitido } from '@/lib/nutricao/acesso/allowlist';

/**
 * E-mail da sessão válida, ou null. A allowlist é conferida a cada acesso:
 * tirar um e-mail da lista derruba a sessão aberta dele no próximo acesso,
 * sem esperar os 30 dias do cookie.
 */
export async function sessaoNutricao(): Promise<string | null> {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(NUTRICAO_COOKIE)?.value);
  return email && emailPermitido(email) ? email : null;
}
