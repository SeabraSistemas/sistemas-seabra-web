'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/katmandu/rebanho', label: 'Rebanho' },
  { href: '/katmandu/pesagem', label: 'Pesagem' },
  { href: '/katmandu/lote', label: 'Lote' },
];

export function DashboardNav({ usuario }: { usuario: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <nav className="flex gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{usuario}</span>
        <form action="/api/katmandu/logout" method="POST">
          <button type="submit" className="underline underline-offset-2 hover:text-foreground">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
