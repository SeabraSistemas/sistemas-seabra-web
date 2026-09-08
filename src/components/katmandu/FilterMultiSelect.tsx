'use client';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Irmão multi-seleção do FilterSelect: nenhuma opção marcada = "todas" (mesma
 * convenção do "" do FilterSelect — filtro inativo, não recorte vazio).
 *
 * Radix Select não faz múltipla escolha, então o trigger é um button cru com
 * as mesmas classes do SelectTrigger size="sm" — é o que mantém os dois
 * filtros alinhados na mesma linha do Movimentar.
 */
const TRIGGER_BASE =
  "flex h-8 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50";

export function FilterMultiSelect({
  label,
  values,
  onChange,
  options,
  labelDe,
  placeholder = 'Todos',
  triggerClassName = 'w-full sm:w-40',
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  /** Rótulo exibido de cada opção — separa valor de exibição (ex: sentinela "Sem lote"). */
  labelDe?: (value: string) => string;
  placeholder?: string;
  triggerClassName?: string;
}) {
  const rotulo = (v: string) => (labelDe ? labelDe(v) : v);
  const marcados = options.filter((o) => values.includes(o));
  const texto =
    marcados.length === 0
      ? placeholder
      : marcados.length === 1
        ? rotulo(marcados[0])
        : `${marcados.length} selecionados`;

  function alternar(opt: string) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={options.length === 0}
          className={cn(TRIGGER_BASE, triggerClassName, marcados.length === 0 && 'text-muted-foreground')}
          title={marcados.length > 1 ? marcados.map(rotulo).join(', ') : undefined}
        >
          <span className="truncate">{texto}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
          {options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt}
              checked={values.includes(opt)}
              // Sem isto o menu fecha a cada clique e escolher 3 lotes vira 3 aberturas.
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => alternar(opt)}
            >
              {rotulo(opt)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
