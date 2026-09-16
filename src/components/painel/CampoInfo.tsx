'use client';

import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface InfoCampo {
  oQue: string;
  ajuda: string;
  como: string;
}

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

/** Label padrão de campo (`text-xs text-muted-foreground`) com o InfoTip embutido — troca direto um `<span>` de label solto. */
export function CampoLabel({ texto, info }: { texto: string; info: InfoCampo }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      {texto}
      <InfoTip info={info} />
    </span>
  );
}
