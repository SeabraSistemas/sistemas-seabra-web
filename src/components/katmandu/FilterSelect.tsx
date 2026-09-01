'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TODOS = '__todos__';

/**
 * Select de filtro com opção "Todos" — Radix não aceita value="" num SelectItem.
 * `labelDe` separa o valor do rótulo pros casos em que a opção é uma chave
 * interna (ex: métrica 'gpdi' exibida como "GPDi").
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  labelDe,
  placeholder = 'Todos',
  triggerClassName = 'w-full sm:w-40',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labelDe?: (value: string) => string;
  placeholder?: string;
  /** Sobrescreve a largura padrão do trigger — útil quando `labelDe` gera rótulos mais longos. */
  triggerClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
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
