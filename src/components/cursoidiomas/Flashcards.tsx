'use client';

import { ArrowLeftRight, RotateCcw, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { ItemVocabulario } from '@/data/cursoidiomas/types';
import { falar } from '@/lib/cursoidiomas/voz';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Cartões de memorização: frente na língua estudada, verso em português.
 * "Sabia / Não sabia" só conta nesta rodada — os que errou voltam no fim.
 */
export function Flashcards({ itens, lang }: { itens: ItemVocabulario[]; lang: string }) {
  const [fila, setFila] = useState<number[]>(() => itens.map((_, i) => i));
  const [virado, setVirado] = useState(false);
  const [invertido, setInvertido] = useState(false);
  const [sabia, setSabia] = useState(0);
  const [vistos, setVistos] = useState(0);
  const [errados, setErrados] = useState<number[]>([]);

  const atual = fila.length > 0 ? itens[fila[0]] : null;

  function responder(acertou: boolean) {
    if (!atual) return;
    setVistos((v) => v + 1);
    if (acertou) setSabia((s) => s + 1);
    else setErrados((e) => [...e, fila[0]]);
    setFila((f) => f.slice(1));
    setVirado(false);
  }

  function reiniciar(somenteErrados: boolean) {
    setFila(somenteErrados ? errados : itens.map((_, i) => i));
    setErrados([]);
    setSabia(0);
    setVistos(0);
    setVirado(false);
  }

  if (!atual) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-4 py-8 text-center">
        <p className="text-lg">
          {sabia} de {vistos} na ponta da língua
        </p>
        <div className="flex gap-2">
          {errados.length > 0 && (
            <Button type="button" size="sm" onClick={() => reiniciar(true)}>
              Revisar os {errados.length} que faltaram
            </Button>
          )}
          <Button type="button" size="sm" variant="secondary" onClick={() => reiniciar(false)}>
            <RotateCcw /> Recomeçar
          </Button>
        </div>
      </div>
    );
  }

  const frente = invertido ? atual.traducao : atual.termo;
  const verso = invertido ? atual.termo : atual.traducao;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">
          {vistos + 1}/{vistos + fila.length}
        </span>
        <button
          type="button"
          onClick={() => {
            setInvertido((v) => !v);
            setVirado(false);
          }}
          className="flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
        >
          <ArrowLeftRight className="size-3" /> {invertido ? 'português → língua' : 'língua → português'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setVirado((v) => !v)}
        className={cn(
          'flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border px-6 py-8 text-center transition-colors',
          virado ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-accent/40',
        )}
      >
        <span className="text-xs tracking-wide text-muted-foreground uppercase">{virado ? 'verso' : 'frente'}</span>
        <span className="font-display text-3xl" lang={virado === invertido ? lang : undefined}>
          {virado ? verso : frente}
        </span>
        {virado && atual.exemplo && (
          <span className="mt-2 text-sm text-muted-foreground" lang={lang}>
            {atual.exemplo}
          </span>
        )}
        {virado && atual.nota && <span className="text-xs text-muted-foreground">{atual.nota}</span>}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => falar(atual.termo, lang)}>
          <Volume2 /> Ouvir
        </Button>
        {virado ? (
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => responder(false)}>
              Não sabia
            </Button>
            <Button type="button" size="sm" onClick={() => responder(true)}>
              Sabia
            </Button>
          </>
        ) : (
          <Button type="button" variant="secondary" size="sm" onClick={() => setVirado(true)}>
            Virar
          </Button>
        )}
      </div>
    </div>
  );
}
