import { PainelNav } from '@/components/painel/PainelNav';
import { exigirSessao } from '@/lib/bovinos/sessao';
import { LINKS } from '@/lib/bovinos/config';

/** Gate do /bovinos autenticado (o middleware de i18n nem casa /bovinos). Cada page chama exigirSessao() de novo. */
export default async function BovinosAppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirSessao();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PainelNav titulo="Bovinos" links={LINKS} usuario={usuario} logoutHref="/bovinos/api/logout" />
      <main className="mt-6">{children}</main>
    </div>
  );
}
