import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { FichaLogo } from '../partes';
import type { SlideFechamento } from '../tipos';

/** +55 21 99936-6784 — o mesmo formato do rodapé do site. */
function telefone(numero: string): string {
  return `+${numero.slice(0, 2)} ${numero.slice(2, 4)} ${numero.slice(4, 9)}-${numero.slice(9)}`;
}

/**
 * Fica na tela durante as perguntas: o QR code precisa estar grande, em fundo
 * branco e com margem (zona de silêncio) para ler de longe.
 */
export function Fechamento({ slide }: { slide: SlideFechamento }) {
  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_720px]">
      <div className="flex h-full flex-col justify-between px-[120px] pb-[100px] pt-[110px]">
        <span />
        <div>
          <h2 className="deck-titulo text-[200px] text-foreground">{slide.titulo}</h2>
          {slide.subtitulo && (
            <p className="deck-serifa mt-[24px] text-[72px] leading-tight text-foreground/85">{slide.subtitulo}</p>
          )}
        </div>
        <div className="flex items-center gap-[36px]">
          <p className="deck-serifa text-[44px] leading-tight text-foreground">{slide.apresentador}</p>
          {slide.logoApresentador && <FichaLogo logo={slide.logoApresentador} altura={64} />}
        </div>
      </div>

      <div className="flex items-center justify-center pr-[100px]">
        <div className="flex w-full flex-col items-center rounded-[32px] bg-white px-[56px] pb-[48px] pt-[56px] text-[#111827]">
          <Image
            src={slide.qr}
            alt={`QR code para ${slide.site}`}
            width={400}
            height={400}
            unoptimized
            className="size-[400px]"
          />
          <p className="mt-[30px] text-[36px] font-semibold tracking-tight">{slide.site}</p>
          {slide.whatsapp && (
            <p className="mt-[12px] flex items-center gap-[12px] text-[28px] text-[#374151]">
              <MessageCircle className="size-[28px]" aria-hidden />
              {telefone(WHATSAPP_NUMBER)}
            </p>
          )}
          <Image
            src={slide.logoSistema.src}
            alt={slide.logoSistema.alt}
            width={slide.logoSistema.largura}
            height={slide.logoSistema.altura}
            loading="eager"
            className="mt-[36px] h-auto w-[360px]"
          />
        </div>
      </div>
    </div>
  );
}
