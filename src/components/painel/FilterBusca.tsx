'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/** Busca por texto — usada em colunas com muitos valores distintos (ID, Mãe, Pai), onde um select seria inutilizável. */
export function FilterBusca({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Buscar...'}
          className="h-8 w-full pl-7 sm:w-40"
        />
      </div>
    </div>
  );
}
