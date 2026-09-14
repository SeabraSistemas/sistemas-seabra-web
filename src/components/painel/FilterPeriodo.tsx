'use client';

import { Input } from '@/components/ui/input';

/**
 * Período como dois <input type="date"> independentes (Data inicial/final),
 * não um slider — mesmo motivo do Katmandu (BaixaView.tsx): um `FilterRange`
 * só aparece quando há 2+ valores distintos, e com poucos registros no
 * período o filtro sumia por completo. Os valores já vêm/saem no formato
 * "aaaa-mm-dd" do input; quem converte pra "aaaammdd" é `diaDeInput`.
 */
export function FilterPeriodo({
  inicio,
  fim,
  onInicioChange,
  onFimChange,
}: {
  inicio: string;
  fim: string;
  onInicioChange: (v: string) => void;
  onFimChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs text-muted-foreground">Data inicial</span>
        <Input type="date" value={inicio} onChange={(e) => onInicioChange(e.target.value)} className="h-8 w-full sm:w-36" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs text-muted-foreground">Data final</span>
        <Input type="date" value={fim} onChange={(e) => onFimChange(e.target.value)} className="h-8 w-full sm:w-36" />
      </div>
    </div>
  );
}
