import { PainelNav } from '@/components/painel/PainelNav';
import { exigirSessao } from '@/lib/sanri/sessao';
import { LINKS } from '@/lib/sanri/config';

export default async function SanriAppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirSessao();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <PainelNav titulo="Capril Sanri" links={LINKS} usuario={usuario} logoutHref="/sanri/api/logout" />
      <main className="mt-6">{children}</main>
    </div>
  );
}
