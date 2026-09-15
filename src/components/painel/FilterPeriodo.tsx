'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { FilterSelect } from './FilterSelect';

/**
 * Período como dois <input type="date"> independentes (Data inicial/final),
 * não um slider — mesmo motivo do Katmandu (BaixaView.tsx): um `FilterRange`
 * só aparece quando há 2+ valores distintos, e com poucos registros no
 * período o filtro sumia por completo. Os valores já vêm/saem no formato
 * "aaaa-mm-dd" do input; quem converte pra "aaaammdd" é `diaDeInput`.
 *
 * `anos` (opcional) liga o atalho "Ano" — um select com só os anos que
 * EXISTEM no dado (não um intervalo genérico tipo 2020-2030), que escreve
 * 1º de janeiro/31 de dezembro daquele ano nos dois campos de data de uma
 * vez. O select reflete o estado atual dos dois inputs (mostra o ano
 * quando inicio/fim batem exatamente com ele; "Todos" caso contrário —
 * range parcial ou escolhido à mão nos dois campos), nunca guarda estado
 * próprio.
 */
export function FilterPeriodo({
  inicio,
  fim,
  onInicioChange,
  onFimChange,
  anos,
}: {
  inicio: string;
  fim: string;
  onInicioChange: (v: string) => void;
  onFimChange: (v: string) => void;
  /** Anos presentes no dado, mais recente primeiro — ver `anosPresentes` em lib/painel/format.ts. */
  anos?: number[];
}) {
  const anoSelecionado = useMemo(() => {
    if (!inicio || !fim) return '';
    const anoInicio = inicio.slice(0, 4);
    if (fim.slice(0, 4) !== anoInicio) return '';
    return inicio === `${anoInicio}-01-01` && fim === `${anoInicio}-12-31` ? anoInicio : '';
  }, [inicio, fim]);

  function selecionarAno(v: string) {
    if (!v) {
      onInicioChange('');
      onFimChange('');
      return;
    }
    onInicioChange(`${v}-01-01`);
    onFimChange(`${v}-12-31`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {anos && anos.length > 0 && (
        <FilterSelect label="Ano" value={anoSelecionado} onChange={selecionarAno} options={anos.map(String)} triggerClassName="w-full sm:w-24" />
      )}
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
