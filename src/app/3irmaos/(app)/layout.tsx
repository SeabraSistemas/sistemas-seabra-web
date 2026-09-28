import { PainelNav } from '@/components/painel/PainelNav';
import { LINKS } from '@/lib/tres-irmaos/config';
import { exigirSessao } from '@/lib/tres-irmaos/sessao';

/** Gate do /3irmaos autenticado (o middleware de i18n nem casa /3irmaos). Cada page chama exigirSessao() de novo. */
export default async function TresIrmaosAppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirSessao();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PainelNav titulo="3 Irmãos" links={LINKS} usuario={usuario} logoutHref="/3irmaos/api/logout" />
      <main className="mt-6">{children}</main>
    </div>
  );
}
