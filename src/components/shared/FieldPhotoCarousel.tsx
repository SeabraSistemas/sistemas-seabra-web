'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type SlideCarrossel } from '@/data/fotos';
import { cn } from '@/lib/utils';

interface FieldPhotoCarouselProps {
  slides: SlideCarrossel[];
  /** Passe as larguras reais de renderização — evita baixar imagem grande demais. */
  sizes: string;
  className?: string;
  priority?: boolean;
  intervalMs?: number;
  /**
   * `cover` (padrão): foto full-bleed com dessaturação e véu escuro cheio —
   * pro carrossel de funcionalidades (hero).
   * `contain`: produto isolado (PNG com transparência) centralizado sobre o
   * fundo do card, sem cobrir o quadro — pro carrossel de produtos.
   */
  fit?: 'cover' | 'contain';
}

/**
 * Carrossel de fotos de campo, uma funcionalidade por slide, com pontos de
 * navegação. Mesmo tratamento visual do FieldPhoto (dessaturação, véu escuro
 * na base) — a diferença é que aqui cada slide já vem com o ícone da
 * funcionalidade composto na própria imagem, feito fora do site.
 *
 * Slides sem `src` mostram o placeholder com o briefing, igual ao FieldPhoto.
 */
export function FieldPhotoCarousel({
  slides,
  sizes,
  className,
  priority,
  intervalMs = 5000,
  fit = 'cover',
}: FieldPhotoCarouselProps) {
  const [active, setActive] = useState(0);

  // Depender de `active` reinicia o timer a cada troca — inclusive as manuais
  // (seta ou ponto), pra um clique não ser "roubado" pelo autoplay logo em seguida.
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [active, slides.length, intervalMs]);

  // O carrossel pode estar dentro de um <Link> (caso do card "Produtos") —
  // sem parar a propagação, o clique nas setas/pontos borbulha pro link e
  // navega junto em vez de só trocar o slide.
  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((i) => (i - 1 + slides.length) % slides.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((i) => (i + 1) % slides.length);
  };
  const goTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(i);
  };

  return (
    // z-0 (não só `relative`) cria contexto de empilhamento próprio — sem
    // isso, os pontos/setas (z-10) vazam por cima de texto que o chamador
    // sobreponha por fora (ex.: título/CTA do card "Produtos"), mesmo com o
    // texto vindo depois no DOM.
    <div className={cn('relative z-0 overflow-hidden', className)}>
      {slides.map((slide, i) => (
        <div
          key={slide.funcionalidade}
          aria-hidden={i !== active}
          className={cn(
            'absolute inset-0 transition-opacity duration-700 ease-out',
            i === active ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          {slide.src ? (
            fit === 'contain' ? (
              <>
                <div className="absolute inset-0 bg-card" />
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes={sizes}
                  priority={priority && i === 0}
                  className="object-contain p-10 sm:p-12"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-card from-12% via-card/75 via-40% to-transparent to-74%"
                />
              </>
            ) : (
              <>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes={sizes}
                  priority={priority && i === 0}
                  className="object-cover saturate-[0.75] contrast-[1.05]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                />
              </>
            )
          ) : (
            <div className="flex h-full items-end border border-dashed border-input bg-secondary">
              <div className="p-5 sm:p-6">
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Foto pendente — {slide.funcionalidade}
                </p>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {slide.briefing}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Slide anterior"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/45 hover:text-white sm:left-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo slide"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/45 hover:text-white sm:right-3"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.funcionalidade}
              type="button"
              onClick={(e) => goTo(e, i)}
              aria-label={slide.funcionalidade}
              aria-current={i === active}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
