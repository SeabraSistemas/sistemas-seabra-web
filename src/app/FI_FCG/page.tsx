import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FI_FCG_COOKIE, verificarSessao } from '@/lib/fi-fcg/auth';
import { HOME_HREF } from '@/lib/fi-fcg/config';

const ERROS: Record<string, string> = {
  vazio: 'Digite um e-mail.',
  'nao-encontrado': 'E-mail não encontrado.',
  config: 'Login temporariamente indisponível. Fale com o suporte.',
};

/** Form puro (sem JS) — POST direto pra /FI_FCG/api/login, que valida contra a allowlist. Mesmo padrão de /katmandu e /cursoidiomas. */
export default async function FiFcgLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const cookieStore = await cookies();
  const email = verificarSessao(cookieStore.get(FI_FCG_COOKIE)?.value);
  if (email) redirect(HOME_HREF);

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">FI_FCG</h1>
        <p className="mt-1 text-sm text-muted-foreground">Dashboards do rebanho — Inhumas e Campina grande.</p>

        <form action="/FI_FCG/api/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            E-mail
          </label>
          <Input id="email" name="email" type="email" autoComplete="username" autoFocus required />

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="manter" value="1" defaultChecked className="size-4 rounded border-input accent-primary" />
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
