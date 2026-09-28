'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Previsao } from '@/lib/tres-irmaos/projecao';

/** Lista editável de (data, quantidade) — partos, secagens ou coberturas previstos. */
export function EditorPrevisoes({
  titulo,
  ajuda,
  itens,
  aoMudar,
  dataInicial,
  rotuloQuantidade = 'Cabras',
}: {
  titulo: string;
  ajuda: string;
  itens: Previsao[];
  aoMudar: (itens: Previsao[]) => void;
  dataInicial: string;
  rotuloQuantidade?: string;
}) {
  const total = itens.reduce((t, i) => t + (Number(i.quantidade) || 0), 0);
  const trocar = (indice: number, parcial: Partial<Previsao>) => aoMudar(itens.map((it, i) => (i === indice ? { ...it, ...parcial } : it)));

  return (
    <div className="painel flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-sans text-sm font-semibold">{titulo}</h3>
        {itens.length > 0 && <span className="text-xs text-muted-foreground tabular-nums">total {total.toLocaleString('pt-BR')}</span>}
      </div>
      <p className="text-xs text-muted-foreground">{ajuda}</p>
      {itens.length > 0 && (
        <div className="grid grid-cols-[1fr_5.5rem_2rem] gap-2 text-xs text-muted-foreground">
          <span>Data</span>
          <span>{rotuloQuantidade}</span>
          <span />
        </div>
      )}
      {itens.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_5.5rem_2rem] items-center gap-2">
          <Input type="date" value={item.data} onChange={(e) => trocar(i, { data: e.target.value })} aria-label={`${titulo}: data`} />
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={Number.isFinite(item.quantidade) ? item.quantidade : ''}
            onChange={(e) => trocar(i, { quantidade: Number(e.target.value) })}
            aria-label={`${titulo}: ${rotuloQuantidade.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={() => aoMudar(itens.filter((_, j) => j !== i))}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Remover linha"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => aoMudar([...itens, { data: itens.at(-1)?.data ?? dataInicial, quantidade: 1 }])}
        className="mt-1 flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm text-primary hover:bg-accent"
      >
        <Plus className="size-4" /> Adicionar
      </button>
    </div>
  );
}
