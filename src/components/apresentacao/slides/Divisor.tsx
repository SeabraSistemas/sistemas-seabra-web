import { Foto } from '../Foto';
import type { SlideDivisor } from '../tipos';

/** Abertura de seção: número grande, título e uma frase. Foto opcional ao fundo. */
export function Divisor({ slide, numero }: { slide: SlideDivisor; numero?: string }) {
  return (
    <div className="absolute inset-0">
      {slide.foto && (
        <>
          <Foto foto={slide.foto} sizes="100vw" className="absolute inset-0" />
          <div aria-hidden className="absolute inset-0 bg-black/65" />
        </>
      )}
      <div className="absolute inset-0 flex flex-col justify-center px-[120px]">
        {numero && <p className="deck-titulo text-[240px] leading-none text-primary">{numero}</p>}
        <h2 className="deck-titulo mt-[28px] max-w-[1600px] text-[128px] text-foreground">
          {slide.titulo}
        </h2>
        {slide.subtitulo && (
          <p className="mt-[40px] max-w-[1300px] text-balance text-[40px] leading-snug text-foreground/75">
            {slide.subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}
