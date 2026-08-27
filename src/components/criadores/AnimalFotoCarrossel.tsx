'use client';

import { useRef, useState, type TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimalFoto } from './AnimalFoto';

/**
 * Carrossel de fotos da ficha do animal (até 3, vindas de `animal.fotos`).
 * Sem lib externa: setas + bolinhas clicáveis e swipe por toque, no mesmo
 * espírito do scroll nativo já usado em CarrosselEncerradas.
 */
export function AnimalFotoCarrossel({
  fotos,
  alt,
  blurDataURL,
  sizes,
}: {
  fotos: string[];
  alt: string;
  blurDataURL?: string | null;
  sizes: string;
}) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef(0);

  if (fotos.length <= 1) {
    return (
      <AnimalFoto src={fotos[0] ?? null} alt={alt} blurDataURL={blurDataURL} priority sizes={sizes} />
    );
  }

  const ir = (novo: number) => setIdx((novo + fotos.length) % fotos.length);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) ir(idx + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="fcarrossel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AnimalFoto
        src={fotos[idx] ?? null}
        alt={alt}
        blurDataURL={idx === 0 ? blurDataURL : null}
        priority={idx === 0}
        sizes={sizes}
      />
      <button
        type="button"
        className="fcarrossel-nav prev"
        aria-label="Foto anterior"
        onClick={(e) => {
          e.preventDefault();
          ir(idx - 1);
        }}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="fcarrossel-nav next"
        aria-label="Próxima foto"
        onClick={(e) => {
          e.preventDefault();
          ir(idx + 1);
        }}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
      <div className="fcarrossel-dots">
        {fotos.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`Foto ${i + 1}`}
            className={i === idx ? 'on' : undefined}
            onClick={(e) => {
              e.preventDefault();
              setIdx(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
