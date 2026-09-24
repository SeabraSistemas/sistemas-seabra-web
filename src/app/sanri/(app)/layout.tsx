import { PainelNav } from '@/components/sanri/PainelNav';
import { exigirSessao } from '@/lib/sanri/sessao';
import { LINKS } from '@/lib/sanri/config';

export default async function PainelAppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirSessao();

  return (
    <>
      <PainelNav links={LINKS} usuario={usuario} logoutHref="/sanri/api/logout" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
