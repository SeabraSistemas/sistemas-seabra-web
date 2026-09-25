'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ABAS = [
  { href: '/sanri/reproducao', label: 'Monta livre', dentro: (p: string) => !p.startsWith('/sanri/reproducao/reprodutores') },
  { href: '/sanri/reproducao/reprodutores', label: 'Reprodutores', dentro: (p: string) => p.startsWith('/sanri/reproducao/reprodutores') },
];

/** Sub-abas da Reprodução — sublinhadas, para não competirem com as abas principais (pílulas). */
export function ReproducaoAbas() {
  const pathname = usePathname();
  return (
    <div role="tablist" aria-label="Reprodução" className="mb-5 flex gap-5 border-b border-rule">
      {ABAS.map((a) => {
        const ativa = a.dentro(pathname);
        return (
          <Link
            key={a.href}
            href={a.href}
            role="tab"
            aria-selected={ativa}
            className={cn(
              '-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors',
              ativa ? 'border-ink text-ink' : 'border-transparent text-ink-2 hover:text-ink',
            )}
          >
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
