'use client';

import { Volume2 } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { aquecerVozes, falar, gravarLento, useVozDisponivel, useVozLenta } from '@/lib/cursoidiomas/voz';

export function BotaoFalar({
  texto,
  lang,
  className,
  tamanho = 'sm',
}: {
  texto: string;
  lang: string;
  className?: string;
  tamanho?: 'sm' | 'md';
}) {
  const suportado = useVozDisponivel();
  useEffect(() => {
    aquecerVozes();
  }, []);
  if (!suportado) return null;
  return (
    <button
      type="button"
      onClick={() => falar(texto, lang)}
      aria-label={`Ouvir: ${texto}`}
      title="Ouvir"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        tamanho === 'sm' ? 'size-7' : 'size-9',
        className,
      )}
    >
      <Volume2 className={tamanho === 'sm' ? 'size-4' : 'size-5'} />
    </button>
  );
}

/** Interruptor "áudio lento" — vale para todos os botões de ouvir. */
export function ToggleVozLenta() {
  const suportado = useVozDisponivel();
  const lento = useVozLenta();
  if (suportado === null) return null;
  if (!suportado) {
    return <span className="text-xs text-muted-foreground">Seu navegador não tem síntese de voz.</span>;
  }
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
      <input type="checkbox" className="size-3.5 accent-primary" checked={lento} onChange={(e) => gravarLento(e.target.checked)} />
      Áudio lento
    </label>
  );
}
