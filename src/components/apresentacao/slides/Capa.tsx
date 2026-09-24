import { Foto } from '../Foto';
import { FichaLogo } from '../partes';
import type { SlideCapa } from '../tipos';

export function Capa({ slide }: { slide: SlideCapa }) {
  return (
    <div className="absolute inset-0 grid grid-cols-[1100px_1fr]">
      <div className="flex flex-col justify-between px-[120px] pb-[100px] pt-[110px]">
        {slide.evento ? <p className="deck-rotulo">{slide.evento}</p> : <span />}

        <div>
          <h1 className="deck-titulo text-[108px] text-foreground">{slide.titulo}</h1>
          <div className="mt-[52px] h-[3px] w-[96px] bg-primary" />
          <p className="deck-serifa mt-[36px] text-[54px] leading-tight text-foreground">
            {slide.apresentador}
          </p>
          {slide.cargo && (
            <p className="mt-[10px] text-[28px] text-muted-foreground">{slide.cargo}</p>
          )}
        </div>

        {slide.logo ? <FichaLogo logo={slide.logo} altura={76} className="w-fit" /> : <span />}
      </div>

      {slide.foto ? (
        <Foto foto={slide.foto} sizes="45vw" className="h-full" preload />
      ) : (
        <div className="bg-card" />
      )}
    </div>
  );
}
