'use client';

import { cn } from '@/lib/utils';

/** Botões grandes de escolha única — mesmo jeito do AppSheet, bom pra tocar no celular. */
export function Escolha({
  rotulo,
  opcoes,
  valor,
  onChange,
  className,
}: {
  rotulo: string;
  opcoes: { valor: string; label: string }[];
  valor: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={rotulo} className={cn('flex flex-col gap-1.5 text-sm', className)}>
      <span className="font-medium text-ink-1">{rotulo}</span>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            aria-pressed={valor === o.valor}
            onClick={() => onChange(o.valor)}
            className={cn(
              'h-12 min-w-28 flex-1 rounded-campo border px-4 text-sm font-semibold transition-colors',
              valor === o.valor ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
