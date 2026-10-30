import { Laboratorio } from '@/components/nutricao/Laboratorio';
import { sessaoNutricao } from '@/lib/nutricao/acesso/sessao';

export const dynamic = 'force-dynamic';

const ERROS: Record<string, string> = {
  credenciais: 'E-mail ou senha incorretos.',
  bloqueado: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  config: 'Login indisponível: falta configuração no servidor (NUTRICAO_SESSION_SECRET).',
};

/**
 * Sem sessão: login (form puro, POST para /nutricao/api/login — e-mail e senha
 * do SeabraApp). Com sessão: o laboratório. Os dados do animal e os rascunhos
 * ficam só no navegador; nada vai para o banco.
 */
export default async function NutricaoPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const email = await sessaoNutricao();
  if (email) return <Laboratorio email={email} />;

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;
  const campo =
    'h-12 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30';

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl">Laboratório de nutrição</h1>
        <p className="mt-1 text-sm text-muted-foreground">Uso pessoal. Entre com o e-mail e a senha do SeabraApp.</p>

        <form action="/nutricao/api/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input id="email" name="email" type="email" autoComplete="username" autoFocus required className={campo} />

          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <input id="senha" name="senha" type="password" autoComplete="current-password" required className={campo} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="manter" value="1" defaultChecked className="size-5 rounded border-input accent-primary" />
            Manter conectado
          </label>

          {mensagemErro && (
            <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
              {mensagemErro}
            </p>
          )}

          <button type="submit" className="mt-2 h-12 rounded-lg bg-primary text-base font-semibold text-primary-foreground active:opacity-90">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
