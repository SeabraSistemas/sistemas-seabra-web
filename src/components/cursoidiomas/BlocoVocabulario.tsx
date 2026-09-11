'use client';

import { useState } from 'react';
import type { ItemVocabulario } from '@/data/cursoidiomas/types';
import { cn } from '@/lib/utils';
import { BotaoFalar } from './Falar';
import { Flashcards } from './Flashcards';

export function BlocoVocabulario({
  titulo,
  itens,
  lang,
}: {
  titulo?: string;
  itens: ItemVocabulario[];
  lang: string;
}) {
  const [modo, setModo] = useState<'lista' | 'cartoes'>('lista');

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">{titulo ?? 'Vocabulário'}</h2>
        <div className="flex gap-1 text-xs">
          {(['lista', 'cartoes'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(m)}
              className={cn(
                'rounded-full px-3 py-1 transition-colors',
                modo === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'lista' ? 'Lista' : 'Cartões'}
            </button>
          ))}
        </div>
      </div>

      {modo === 'cartoes' ? (
        <Flashcards key={itens.length} itens={itens} lang={lang} />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {itens.map((item) => (
            <li key={item.termo} className="flex items-start gap-2 px-4 py-2.5">
              <BotaoFalar texto={item.termo} lang={lang} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-medium" lang={lang}>
                    {item.termo}
                  </span>
                  <span className="text-sm text-muted-foreground">{item.traducao}</span>
                  {item.nota && <span className="text-xs text-muted-foreground/80">· {item.nota}</span>}
                </div>
                {item.exemplo && (
                  <div className="mt-0.5 flex items-baseline gap-2 text-sm">
                    <span lang={lang}>{item.exemplo}</span>
                    {item.exemploTraducao && <span className="text-muted-foreground">— {item.exemploTraducao}</span>}
                    <BotaoFalar texto={item.exemplo} lang={lang} className="size-6 self-center" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
