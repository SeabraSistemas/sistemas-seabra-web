'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Cópia de src/components/katmandu/FilterRange.tsx em pasta neutra — aqui
 * porém como dois campos digitados (de/até), não mais slider: o produtor
 * pediu pra digitar o valor exato em vez de arrastar uma barra. `bounds`
 * (numberBounds dos dados reais) preenche o valor inicial; o campo continua
 * editável livremente, inclusive além do que existe hoje no dado.
 */
export function FilterRange({
  label,
  bounds,
  value,
  onChange,
  className,
}: {
  label: string;
  bounds: [number, number];
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
}) {
  const [minTexto, setMinTexto] = useState(() => String(value[0]));
  const [maxTexto, setMaxTexto] = useState(() => String(value[1]));

  // Só resincroniza quando os LIMITES REAIS mudam (recarga de dados) — nunca
  // por causa da própria digitação, senão o usuário nunca conseguiria apagar
  // o campo pra escrever outro número.
  useEffect(() => {
    setMinTexto(String(bounds[0]));
    setMaxTexto(String(bounds[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds[0], bounds[1]]);

  const aplicarMin = (texto: string) => {
    setMinTexto(texto);
    const n = Number(texto);
    if (texto.trim() !== '' && !Number.isNaN(n)) onChange([n, value[1]]);
  };
  const aplicarMax = (texto: string) => {
    setMaxTexto(texto);
    const n = Number(texto);
    if (texto.trim() !== '' && !Number.isNaN(n)) onChange([value[0], n]);
  };
  const finalizarMin = () => {
    if (minTexto.trim() === '' || Number.isNaN(Number(minTexto))) {
      setMinTexto(String(bounds[0]));
      onChange([bounds[0], value[1]]);
    }
  };
  const finalizarMax = () => {
    if (maxTexto.trim() === '' || Number.isNaN(Number(maxTexto))) {
      setMaxTexto(String(bounds[1]));
      onChange([value[0], bounds[1]]);
    }
  };

  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          step="any"
          value={minTexto}
          onChange={(e) => aplicarMin(e.target.value)}
          onBlur={finalizarMin}
          className="h-8 w-20 px-2 text-xs tabular-nums"
        />
        <span className="text-xs text-muted-foreground">até</span>
        <Input
          type="number"
          step="any"
          value={maxTexto}
          onChange={(e) => aplicarMax(e.target.value)}
          onBlur={finalizarMax}
          className="h-8 w-20 px-2 text-xs tabular-nums"
        />
      </div>
    </div>
  );
}
