'use client';

import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface InfoCampo {
  oQue: string;
  ajuda: string;
  como: string;
}

/** Um termo do glossário: [sigla, o que significa] — ver `GlossarioTip`. */
export type TermoGlossario = readonly [string, string];

/**
 * Botão "i" que abre um popover explicando um campo de formulário — o que
 * ele é, pra que ajuda a ver, como preencher (pedido do Felipe, 16/09/2026:
 * todo campo que o usuário preenche precisa disso, prático e sem rodeios).
 */
export function InfoTip({ info }: { info: InfoCampo }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Mais informações sobre este campo"
          className="inline-flex shrink-0 text-muted-foreground/70 hover:text-foreground"
        >
          <Info className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-xs">
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="font-medium text-foreground">O que é</dt>
            <dd className="text-muted-foreground">{info.oQue}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Pra que ajuda</dt>
            <dd className="text-muted-foreground">{info.ajuda}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Como preencher</dt>
            <dd className="text-muted-foreground">{info.como}</dd>
          </div>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Mesmo botão "i", mas pra um glossário de siglas em vez de um campo —
 * o usuário que não sabe o que é GMD/GPD/PDI/GPDi consulta ali mesmo, ao
 * lado dos cards (pedido do Felipe, 21/09/2026; o texto de cada sigla é o
 * mesmo já usado no app e no /katmandu, ver SiglasInfo.tsx).
 */
export function GlossarioTip({ titulo, termos }: { titulo: string; termos: readonly TermoGlossario[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={titulo}
          className="inline-flex shrink-0 text-muted-foreground/70 hover:text-foreground"
        >
          <Info className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 text-xs">
        <p className="mb-2 font-medium text-foreground">{titulo}</p>
        <dl className="flex flex-col gap-2">
          {termos.map(([sigla, texto]) => (
            <div key={sigla} className="flex gap-2">
              {/* largura fixa: sem isso cada chip tem um tamanho e as definições ficam desalinhadas. */}
              <dt className="w-12 shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-center font-medium text-foreground">
                {sigla}
              </dt>
              <dd className="flex-1 text-muted-foreground">{texto}</dd>
            </div>
          ))}
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/** Label padrão de campo (`text-xs text-muted-foreground`) com o InfoTip embutido — troca direto um `<span>` de label solto. */
export function CampoLabel({ texto, info }: { texto: string; info: InfoCampo }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      {texto}
      <InfoTip info={info} />
    </span>
  );
}
