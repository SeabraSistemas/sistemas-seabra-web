'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Filtro de limiar ("maior que") — pra métricas sem teto natural (ex.: dias
 * sem manejo, dias sem pesagem), onde um `FilterRange` de/até obriga o
 * usuário a digitar um "até" arbitrário só pra dizer "sem limite máximo".
 * Vazio = sem filtro. Não usa `FilterRange` porque ali as DUAS pontas têm
 * significado real (peso, idade) — aqui só o mínimo importa.
 */
export function FilterMaiorQue({
  label,
  value,
  onChange,
  placeholder = 'sem mínimo',
  className,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">maior que</span>
        <Input
          type="number"
          step="any"
          value={value ?? ''}
          onChange={(e) => {
            const texto = e.target.value;
            onChange(texto.trim() === '' ? null : Number(texto));
          }}
          placeholder={placeholder}
          className="h-8 w-24 px-2 text-xs tabular-nums"
        />
      </div>
    </div>
  );
}
