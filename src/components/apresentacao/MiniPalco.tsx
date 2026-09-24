'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Um slide em miniatura: o palco de 1920×1080 escalado para a largura do
 * contêiner. `ativo` liga as animações de entrada (mesmo seletor da projeção);
 * quem usa troca a `key` a cada slide para elas recomeçarem.
 */
export function MiniPalco({
  children,
  ativo,
  className,
}: {
  children: ReactNode;
  ativo?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => setEscala(entrada.contentRect.width / 1920));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('relative aspect-video w-full overflow-hidden rounded-lg bg-black ring-1 ring-white/10', className)}
    >
      {escala > 0 && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: 1920, height: 1080, transform: `scale(${escala})` }}
          data-ativo={ativo || undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
