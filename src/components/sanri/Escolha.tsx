'use client';

import { cn } from '@/lib/utils';

/** Botões grandes de escolha única — mesmo jeito do AppSheet, bom pra tocar no celular. */
export function Escolha({ opcoes, valor, onChange }: { opcoes: { valor: string; label: string }[]; valor: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={cn(
            'min-w-28 flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            valor === o.valor ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
