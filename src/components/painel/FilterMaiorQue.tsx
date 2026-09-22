'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampoLabel, type InfoCampo } from '@/components/painel/CampoInfo';
import { cn } from '@/lib/utils';

/**
 * Filtro de limiar ("maior que") — pra métricas sem teto natural (ex.: dias
 * sem manejo), onde um `FilterRange` de/até obriga o usuário a digitar um
 * "até" arbitrário só pra dizer "sem limite máximo". Não usa `FilterRange`
 * porque ali as DUAS pontas têm significado real (peso, idade) — aqui só o
 * mínimo importa.
 *
 * Diferente dos outros filtros do dashboard (que aplicam a cada tecla): este
 * só aplica no clique de "Salvar" (ou Enter) — pedido do Felipe, 22/09/2026,
 * pra deixar explícito pro produtor que precisa confirmar o número antes de
 * ver a lista mudar. Destacado com borda/fundo (é o filtro principal da
 * página Monitorar), campo + botão nunca quebram linha, e o `i` explica o
 * campo sem citar as fontes técnicas (pedido do Felipe, 22/09/2026).
 */
export function FilterMaiorQue({
  label,
  value,
  onChange,
  info,
  placeholder,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  /** Popover "i" explicando o campo — ver CampoInfo.tsx. */
  info?: InfoCampo;
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
      {info ? <CampoLabel texto={label} info={info} /> : <span className="text-xs font-medium text-foreground">{label}</span>}
      <div className="flex flex-nowrap items-center gap-1.5">
        <Input
          type="number"
          step="any"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && salvar()}
          placeholder={placeholder ?? 'sem mínimo'}
          className="h-8 w-20 shrink-0 px-2 text-xs tabular-nums"
        />
        <Button type="button" size="sm" className="h-8 shrink-0 px-3" onClick={salvar}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
