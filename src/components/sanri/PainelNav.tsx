'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SELO_FAZENDA } from '@/components/sanri/selo';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Barra do topo com abas (não página de menu). `next/link` direto, não o de
 * `@/i18n/routing`: o painel fica fora do [locale] e não tem idioma.
 */
export function PainelNav({ links, usuario, logoutHref }: { links: NavLink[]; usuario: string; logoutHref: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src={SELO_FAZENDA.src} alt={SELO_FAZENDA.alt} width={SELO_FAZENDA.width} height={SELO_FAZENDA.height} className="h-9 w-auto" priority />
          <span className="text-sm font-semibold text-ink">Capril Sanri</span>
        </div>
        <div className="flex min-w-0 items-center gap-3 text-sm text-ink-2">
          <span className="truncate">{usuario}</span>
          <form action={logoutHref} method="POST">
            <button type="submit" className="font-medium text-bay underline underline-offset-2 hover:text-ink">
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-3 sm:px-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-pill px-5 py-2 text-sm font-semibold transition-colors',
              pathname === link.href ? 'bg-ink text-paper' : 'text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
