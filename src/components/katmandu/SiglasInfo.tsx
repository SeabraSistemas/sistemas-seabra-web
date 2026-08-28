'use client';

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';

const SIGLAS = [
  ['GPDi', 'Ganho de Peso Diário entre pesagens — quanto o animal ganhou por dia desde a pesagem anterior (kg/dia)'],
  ['GPD', 'Ganho de Peso Diário — ganho médio por dia desde o nascimento (kg/dia)'],
  ['PDI', 'Peso Diário de Idade — peso do animal dividido pelos dias de vida (kg/dia)'],
  ['GMD', 'Ganho Médio Diário — ganho por dia desde o início da engorda (kg/dia)'],
] as const;

/** Barra "o que significa cada sigla" — recolhida por padrão, abre no clique do "i". */
export function SiglasInfo() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
      >
        <Info className="size-4 shrink-0" />
        <span>O que significa cada sigla</span>
        <ChevronDown className={`ml-auto size-4 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      {aberto && (
        <dl className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm">
          {SIGLAS.map(([sigla, texto]) => (
            <div key={sigla} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="w-fit shrink-0 rounded-md bg-secondary px-2 py-0.5 font-medium text-foreground">
                {sigla}
              </dt>
              <dd className="text-muted-foreground">{texto}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
