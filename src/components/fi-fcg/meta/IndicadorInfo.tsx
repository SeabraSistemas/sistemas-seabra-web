'use client';

import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ExplicaIndicador {
  oQue: string;
  serve: string;
  calculo: string;
}

/** O "i" de um indicador da aba Meta: abre por clique, toque ou teclado (Enter/Espaço). */
export function IndicadorInfo({ nome, info }: { nome: string; info: ExplicaIndicador }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`O que é ${nome}`}
          className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground/70 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-xs">
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="font-medium text-foreground">O que é</dt>
            <dd className="text-muted-foreground">{info.oQue}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Para que serve</dt>
            <dd className="text-muted-foreground">{info.serve}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Como calculo</dt>
            <dd className="text-muted-foreground">{info.calculo}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}
