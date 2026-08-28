import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/katmandu/DashboardNav';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';

/**
 * Gate do /katmandu autenticado: fica aqui, não em src/middleware.ts, pra não
 * mexer no middleware compartilhado de i18n (fora do matcher dele de qualquer
 * forma). Sem cookie válido => volta pro login.
 */
export default async function KatmanduAppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const usuario = verifySession(cookieStore.get(KATMANDU_COOKIE)?.value);
  if (!usuario) redirect('/katmandu');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <DashboardNav usuario={usuario} />
      <main className="mt-6">{children}</main>
    </div>
  );
}
