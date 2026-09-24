import Image from 'next/image';
import { Foto } from '../Foto';
import type { SlideBio } from '../tipos';

export function Bio({ slide }: { slide: SlideBio }) {
  return (
    <div className="absolute inset-0 grid grid-cols-[700px_1fr]">
      {slide.foto ? (
        <Foto foto={slide.foto} sizes="37vw" className="h-full" />
      ) : (
        <div className="bg-card" />
      )}

      <div className="flex flex-col px-[100px] pb-[90px] pt-[100px]">
        <p className="deck-rotulo">{slide.rotulo}</p>
        <h2 className="deck-serifa mt-[26px] text-[68px] leading-[1.05] text-foreground">
          {slide.nome}
        </h2>

        <ul className="mt-[44px] border-t border-border">
          {slide.itens.map((item) => (
            <li
              key={`${item.texto}-${item.instituicao ?? ''}`}
              className="flex items-baseline justify-between gap-[32px] border-b border-border py-[19px]"
            >
              <span className="text-[34px] leading-tight text-foreground">{item.texto}</span>
              {item.instituicao && (
                <span className="shrink-0 text-[28px] font-semibold text-primary">
                  {item.instituicao}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Logos em fichas claras: a maioria foi feita para fundo branco e
            some no preto. */}
        {slide.logos && slide.logos.length > 0 && (
          <div className="mt-auto flex items-center gap-[18px]">
            {slide.logos.map((logo) => (
              <div
                key={logo.src}
                className="flex h-[104px] flex-1 items-center justify-center rounded-[14px] bg-foreground px-[18px]"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.largura}
                  height={logo.altura}
                  loading="eager"
                  className="h-auto max-h-[76px] w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
