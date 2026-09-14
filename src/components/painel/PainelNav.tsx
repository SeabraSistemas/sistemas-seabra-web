'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Header com abas em vez de página de menu — mesmo padrão do
 * src/components/katmandu/DashboardNav.tsx, generalizado pra receber `links`
 * (o Katmandu tinha o array fixo dentro do componente) e `logoutHref` (cada
 * painel tem seu próprio cookie/rota). `overflow-x-auto` porque o FI_FCG tem
 * uma aba a mais que o Katmandu (Financeiro) e precisa caber no celular.
 */
export function PainelNav({ titulo, links, usuario, logoutHref }: { titulo: string; links: NavLink[]; usuario: string; logoutHref: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex items-center gap-4 overflow-x-auto">
        <span className="shrink-0 text-sm font-semibold text-foreground">{titulo}</span>
        <nav className="flex shrink-0 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{usuario}</span>
        <form action={logoutHref} method="POST">
          <button type="submit" className="underline underline-offset-2 hover:text-foreground">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
