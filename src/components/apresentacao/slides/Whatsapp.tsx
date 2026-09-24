import type { CSSProperties } from 'react';
import Image from 'next/image';
import { CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Cabecalho, ListaTopicos, SeloIlustrativo } from '../partes';
import type { SlideWhatsapp } from '../tipos';

/**
 * Simulação de conversa. Cores próximas do tema escuro do WhatsApp para ser
 * reconhecível de longe; não é captura de tela, é ilustração.
 */
export function Whatsapp({ slide, secao }: { slide: SlideWhatsapp; secao?: string }) {
  return (
    <div className="absolute inset-0 grid grid-cols-[1fr_760px]">
      <div className="flex h-full flex-col px-[120px] pb-[110px] pt-[100px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
        {slide.itens && (
          <div className="mt-[48px] flex flex-1 flex-col justify-center">
            <ListaTopicos itens={slide.itens.map((texto) => ({ texto }))} estilo="lista" tamanho="medio" />
          </div>
        )}
        {slide.ilustrativo && <SeloIlustrativo className="w-fit" />}
      </div>

      <div className="flex items-center justify-center">
        {/* Aparelho */}
        <div className="flex h-[960px] w-[560px] flex-col overflow-hidden rounded-[56px] border-[10px] border-[#1c1c1c] bg-[#0b141a] shadow-2xl">
          <div className="flex items-center gap-[16px] bg-[#1f2c34] px-[26px] pb-[18px] pt-[34px]">
            <div className="flex size-[58px] items-center justify-center rounded-full bg-white">
              <Image src="/images/logo-icon.png" alt="" width={1011} height={1011} className="size-[44px]" />
            </div>
            <div>
              <p className="text-[26px] font-semibold leading-tight text-[#e9edef]">{slide.contato}</p>
              <p className="text-[18px] text-[#8696a0]">conta comercial</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-[14px] px-[22px] py-[24px]">
            {slide.mensagens.map((m, i) => (
              <div
                key={`${m.hora}-${m.texto}`}
                // Uma mensagem a cada 1,1 s: dá tempo de ler em voz alta.
                style={{ '--atraso': `${600 + i * 1100}ms` } as CSSProperties}
                className={cn(
                  'anim-mensagem max-w-[86%] rounded-[16px] px-[18px] pb-[10px] pt-[12px]',
                  m.de === 'sistema' ? 'self-start rounded-tl-[4px] bg-[#202c33]' : 'self-end rounded-tr-[4px] bg-[#005c4b]'
                )}
              >
                <p className="whitespace-pre-line text-[22px] leading-snug text-[#e9edef]">{m.texto}</p>
                <p className="mt-[4px] flex items-center justify-end gap-[6px] text-[16px] text-[#8696a0]">
                  {m.hora}
                  {m.de === 'produtor' && <CheckCheck className="size-[18px] text-[#53bdeb]" aria-hidden />}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-[18px] mb-[22px] rounded-full bg-[#1f2c34] px-[24px] py-[16px] text-[20px] text-[#8696a0]">
            Mensagem
          </div>
        </div>
      </div>
    </div>
  );
}
