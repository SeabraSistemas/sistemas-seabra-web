import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NavCurso } from '@/components/cursoidiomas/NavCurso';
import { ProgressoProvider } from '@/components/cursoidiomas/Progresso';
import { CURSO_COOKIE, verificarSessao } from '@/lib/cursoidiomas/auth';

/**
 * Gate da área logada: fica aqui, não em src/middleware.ts (o middleware de
 * i18n nem casa /cursoidiomas). Sem cookie válido => login.
 */
export default async function CursoAppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(CURSO_COOKIE)?.value);
  if (!email) redirect('/cursoidiomas');

  return (
    <ProgressoProvider email={email}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <NavCurso email={email} />
        <main className="mt-8 pb-16">{children}</main>
      </div>
    </ProgressoProvider>
  );
}
