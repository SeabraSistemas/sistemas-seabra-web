import { PainelNav } from '@/components/painel/PainelNav';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { LINKS } from '@/lib/fi-fcg/config';

/**
 * Gate do /FI_FCG autenticado: fica aqui, não em src/middleware.ts (o
 * middleware de i18n nem casa /FI_FCG). Sem cookie válido => volta pro
 * login. Cada page chama `exigirSessao()` de novo (ver o comentário lá) —
 * este layout garante o usuário logado E monta o header comum.
 */
export default async function FiFcgAppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirSessao();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PainelNav titulo="FI · FCG" links={LINKS} usuario={usuario} logoutHref="/FI_FCG/api/logout" />
      <main className="mt-6">{children}</main>
    </div>
  );
}
