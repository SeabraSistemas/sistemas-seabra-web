import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';

const ERROS: Record<string, string> = {
  vazio: 'Digite um usuário.',
  'nao-encontrado': 'Usuário não encontrado.',
  config: 'Login temporariamente indisponível. Fale com o suporte.',
};

/** Form puro (sem JS) — POST direto pra /api/katmandu/login, que valida contra User Manager!C. */
export default async function KatmanduLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const cookieStore = await cookies();
  const usuario = verifySession(cookieStore.get(KATMANDU_COOKIE)?.value);
  if (usuario) redirect('/katmandu/rebanho');

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Katmandu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dashboards do seu rebanho.</p>

        <form action="/api/katmandu/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="usuario" className="text-sm text-muted-foreground">
            Usuário
          </label>
          <Input id="usuario" name="usuario" autoComplete="username" autoFocus required />

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="manter"
              value="1"
              defaultChecked
              className="size-4 rounded border-input accent-primary"
            />
            Manter conectado
          </label>

          {mensagemErro && <p className="text-sm text-destructive">{mensagemErro}</p>}
          <Button type="submit" className="mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
