'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IDIOMAS, IDIOMA_IDS } from '@/data/cursoidiomas/estrutura';
import { cn } from '@/lib/utils';

/**
 * Desktop: marca + pílulas numa linha, e-mail e "Sair" à direita.
 * Celular: marca e "Sair" na primeira linha, pílulas na segunda — numa
 * linha só a marca quebrava em duas e o "Sair" caía para baixo.
 */
export function NavCurso({ email }: { email: string }) {
  const pathname = usePathname();
  const links = [
    { href: '/cursoidiomas/inicio', label: 'Início', ativo: pathname === '/cursoidiomas/inicio' },
    ...IDIOMA_IDS.map((id) => ({
      href: `/cursoidiomas/${id}`,
      label: IDIOMAS[id].nome,
      ativo: pathname.startsWith(`/cursoidiomas/${id}`),
    })),
  ];

  const pilulas = links.map((l) => (
    <Link
      key={l.href}
      href={l.href}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
        l.ativo ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {l.label}
    </Link>
  ));

  return (
    <header className="border-b border-border pb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href="/cursoidiomas/inicio" className="mr-3 font-display text-lg tracking-tight whitespace-nowrap">
            Curso de idiomas
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">{pilulas}</nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="hidden md:inline">{email}</span>
          <form action="/cursoidiomas/api/logout" method="POST">
            <button type="submit" className="underline underline-offset-2 hover:text-foreground">
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav className="mt-3 flex items-center gap-1 sm:hidden">{pilulas}</nav>
    </header>
  );
}
