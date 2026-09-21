'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTip, type InfoCampo } from '@/components/painel/CampoInfo';

const TODOS = '__todos__';

/**
 * Select de filtro com opção "Todos" — Radix não aceita value="" num SelectItem.
 * Cópia de src/components/katmandu/FilterSelect.tsx em pasta neutra.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  labelDe,
  placeholder = 'Todos',
  triggerClassName = 'w-full sm:w-40',
  info,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labelDe?: (value: string) => string;
  placeholder?: string;
  triggerClassName?: string;
  /** Quando passado, mostra o "i" ao lado do label (mesma altura dos outros filtros da linha). */
  info?: InfoCampo;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {info && <InfoTip info={info} />}
      </span>
      <Select value={value || TODOS} onValueChange={(v) => onChange(v === TODOS ? '' : v)}>
        <SelectTrigger size="sm" className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {labelDe ? labelDe(opt) : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
