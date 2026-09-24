import { Foto } from '../Foto';
import type { SlideFotoCheia } from '../tipos';

export function FotoCheia({ slide, secao }: { slide: SlideFotoCheia; secao?: string }) {
  return (
    <div className="absolute inset-0">
      <Foto foto={slide.foto} sizes="100vw" className="absolute inset-0" />
      {/* Véu na base: o texto lê em cima de qualquer foto, clara ou escura. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-35% to-transparent to-65%"
      />
      <div className="absolute inset-x-[120px] bottom-[110px]">
        {secao && <p className="deck-rotulo">{secao}</p>}
        <h2 className="deck-titulo mt-[24px] text-[150px] text-foreground">{slide.titulo}</h2>
        {slide.legenda && (
          <p className="mt-[28px] max-w-[1300px] text-balance text-[38px] leading-snug text-foreground/90">
            {slide.legenda}
          </p>
        )}
      </div>
    </div>
  );
}
