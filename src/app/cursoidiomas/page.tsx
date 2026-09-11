import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CURSO_COOKIE, segredoConfigurado, verificarSessao } from '@/lib/cursoidiomas/auth';

export const dynamic = 'force-dynamic';

const ERROS: Record<string, string> = {
  vazio: 'Digite o e-mail.',
  'nao-encontrado': 'Este e-mail não tem acesso.',
  config: 'Login indisponível: falta configuração.',
};

/** Form puro (sem JS) — POST direto para /cursoidiomas/api/login. */
export default async function CursoLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const cookieStore = await cookies();
  if (verificarSessao(cookieStore.get(CURSO_COOKIE)?.value)) redirect('/cursoidiomas/inicio');

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;
  const configOk = segredoConfigurado();
  const mostrarDetalhe = process.env.NODE_ENV !== 'production';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Deutsch · Français · English</p>
        <h1 className="mt-1 text-3xl">Curso de idiomas</h1>

        {!configOk && mostrarDetalhe && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
            CURSOIDIOMAS_SESSION_SECRET ausente ou com menos de 32 caracteres
          </p>
        )}

        <form action="/cursoidiomas/api/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={120}
            autoFocus
            required
            disabled={!configOk}
          />
          {mensagemErro && <p className="text-sm text-destructive">{mensagemErro}</p>}
          <Button type="submit" className="mt-2" disabled={!configOk}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
