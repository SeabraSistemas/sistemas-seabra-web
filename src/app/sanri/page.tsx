import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SANRI_COOKIE, verificarSessao } from '@/lib/sanri/auth';
import { HOME_HREF } from '@/lib/sanri/config';

const ERROS: Record<string, string> = {
  vazio: 'Digite um e-mail.',
  'nao-encontrado': 'E-mail não cadastrado na User Manager.',
  planilha: 'Não foi possível consultar a planilha agora. Tente de novo em instantes.',
  config: 'Login temporariamente indisponível. Fale com o suporte.',
};

/** Form puro (sem JS) — POST pra /sanri/api/login, que confere o e-mail na aba User Manager. */
export default async function SanriLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const cookieStore = await cookies();
  if (verificarSessao(cookieStore.get(SANRI_COOKIE)?.value)) redirect(HOME_HREF);

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Capril Sanri</h1>
        <p className="mt-1 text-sm text-muted-foreground">Produção de leite — régua do tanque e saídas.</p>

        <form action="/sanri/api/login" method="POST" className="mt-6 flex flex-col gap-3">
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
