'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavLink } from './PainelNav';

/**
 * Sub-abas dentro de uma aba do painel (Produção → Resumo | Régua | Saídas).
 * Cada uma continua sendo uma rota própria — o link antigo de /regua e
 * /saidas segue funcionando —, só que agora aparecem juntas sob "Produção".
 */
export function SubAbas({ links, rotulo }: { links: NavLink[]; rotulo: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={rotulo} className="max-w-full self-start overflow-x-auto">
      <div className="inline-flex gap-1 rounded-pill bg-paper-2 p-1">
        {links.map((link) => {
          const ativo = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors',
                ativo ? 'bg-paper text-ink shadow-card' : 'text-ink-1 hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
