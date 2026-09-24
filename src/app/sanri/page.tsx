import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Aviso, PainelCampo, botao } from '@/components/sanri/Controles';
import { SELO_FAZENDA } from '@/components/sanri/selo';
import { SANRI_COOKIE, verificarSessao } from '@/lib/sanri/auth';
import { HOME_HREF } from '@/lib/sanri/config';

const ERROS: Record<string, string> = {
  vazio: 'Digite um e-mail.',
  'nao-encontrado': 'E-mail não cadastrado na User Manager.',
  planilha: 'Não foi possível consultar a planilha agora. Tente de novo em instantes.',
  config: 'Login temporariamente indisponível. Fale com o suporte.',
};

/** Form puro (sem JS) — POST pra /sanri/api/login, que confere o e-mail na aba User Manager. */
export default async function PainelLoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const cookieStore = await cookies();
  if (verificarSessao(cookieStore.get(SANRI_COOKIE)?.value)) redirect(HOME_HREF);

  const { erro } = await searchParams;
  const mensagemErro = erro ? (ERROS[erro] ?? 'Não foi possível entrar.') : null;

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-card border border-rule bg-paper p-6 shadow-card sm:p-8">
        <Image src={SELO_FAZENDA.src} alt={SELO_FAZENDA.alt} width={SELO_FAZENDA.width} height={SELO_FAZENDA.height} className="h-11 w-auto" priority />
        <h1 className="mt-6 text-xl font-semibold text-ink">Capril Sanri</h1>

        <form action="/sanri/api/login" method="POST" className="mt-6 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium text-ink-1">
            E-mail
          </label>
          <PainelCampo id="email" name="email" type="email" autoComplete="username" autoFocus required />

          <label className="flex items-center gap-2.5 text-sm text-ink-1">
            <input type="checkbox" name="manter" value="1" defaultChecked className="size-5 accent-ink" />
            Manter conectado
          </label>

          {mensagemErro && <Aviso tom="erro">{mensagemErro}</Aviso>}

          <button type="submit" className={`${botao.solido} mt-2 w-full`}>
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
