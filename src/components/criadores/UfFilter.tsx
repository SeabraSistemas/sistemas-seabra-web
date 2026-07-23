'use client';

import { MapPin } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';

/**
 * Filtro de estado (UF) do índice. Navega via query string (?uf=XX); "Todos"
 * limpa o filtro. O filtro em si é aplicado no servidor (page.tsx) — este
 * componente só dispara a navegação.
 */
export function UfFilter({
  ufs,
  atual,
  label,
  todosLabel,
}: {
  ufs: string[];
  atual: string;
  label: string;
  todosLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value;
    router.push(uf ? `${pathname}?uf=${uf}` : pathname);
  }

  return (
    <div className="idx-filter">
      <span className="fl">{label}</span>
      <div className="ufsel">
        <MapPin size={13} strokeWidth={1.8} />
        <select value={atual} onChange={onChange} aria-label={label}>
          <option value="">{todosLabel}</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
