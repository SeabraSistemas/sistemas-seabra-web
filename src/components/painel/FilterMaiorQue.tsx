'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Filtro de limiar ("maior que") — pra métricas sem teto natural (ex.: dias
 * sem manejo, dias sem pesagem), onde um `FilterRange` de/até obriga o
 * usuário a digitar um "até" arbitrário só pra dizer "sem limite máximo".
 * Vazio = sem filtro. Não usa `FilterRange` porque ali as DUAS pontas têm
 * significado real (peso, idade) — aqui só o mínimo importa.
 *
 * Diferente dos outros filtros do dashboard (que aplicam a cada tecla): este
 * só aplica no clique de "Salvar" (ou Enter) — pedido do Felipe, 22/09/2026,
 * pra deixar explícito pro produtor que precisa confirmar o número antes de
 * ver a lista mudar. Destacado com borda/fundo (é o filtro principal da
 * página Monitorar) e a linha "maior que + campo + botão" nunca quebra.
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
  const [texto, setTexto] = useState(() => (value != null ? String(value) : ''));

  function salvar() {
    const n = Number(texto);
    onChange(texto.trim() === '' || Number.isNaN(n) ? null : n);
  }

  return (
    <div className={cn('flex min-w-0 shrink-0 flex-col gap-1 rounded-lg border border-primary/50 bg-primary/5 px-2.5 py-1.5', className)}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="flex flex-nowrap items-center gap-1.5">
        <span className="shrink-0 text-xs text-muted-foreground">maior que</span>
        <Input
          type="number"
          step="any"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && salvar()}
          placeholder={placeholder}
          className="h-8 w-16 shrink-0 px-2 text-xs tabular-nums"
        />
        <Button type="button" size="sm" className="h-8 shrink-0 px-3" onClick={salvar}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
