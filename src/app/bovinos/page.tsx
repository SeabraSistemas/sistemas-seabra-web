import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BOVINOS_COOKIE, verificarSessao } from '@/lib/bovinos/auth';
import { HOME_HREF } from '@/lib/bovinos/config';

const ERROS: Record<string, string> = {
  credenciais: 'E-mail ou senha incorretos.',
  bloqueado: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  config: 'Login indisponível: falta configuração no servidor.',
};

/** Form puro (sem JS) — POST para /bovinos/api/login. E-mail da allowlist + a mesma senha do /adm. */
export default async function BovinosLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const cookieStore = await cookies();
  if (verificarSessao(cookieStore.get(BOVINOS_COOKIE)?.value)) redirect(HOME_HREF);

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Bovinos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conferência das planilhas dos clientes.</p>

        <form action="/bovinos/api/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            E-mail
          </label>
          <Input id="email" name="email" type="email" autoComplete="username" autoFocus required />

          <label htmlFor="senha" className="text-sm text-muted-foreground">
            Senha <span className="text-xs">(a mesma do /adm)</span>
          </label>
          <Input id="senha" name="senha" type="password" autoComplete="current-password" required />

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
