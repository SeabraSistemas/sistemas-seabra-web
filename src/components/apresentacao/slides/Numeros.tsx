import { cn } from '@/lib/utils';
import { Cabecalho, SeloIlustrativo } from '../partes';
import type { SlideNumeros } from '../tipos';

/**
 * KPIs em destaque. Valor na mesma sans do deck, semibold e com algarismos
 * proporcionais — tabular deixa "150" frouxo em tamanho de display.
 */
export function Numeros({ slide, secao }: { slide: SlideNumeros; secao?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[110px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
      {slide.ilustrativo && <SeloIlustrativo className="absolute right-[120px] top-[100px]" />}
      <div
        className="grid flex-1 items-center"
        style={{ gridTemplateColumns: `repeat(${slide.numeros.length}, 1fr)` }}
      >
        {slide.numeros.map((numero, i) => (
          <div key={numero.rotulo} className={cn('pr-[32px]', i > 0 && 'border-l border-white/15 pl-[44px]')}>
            <p className="text-[30px] leading-snug text-foreground/70">{numero.rotulo}</p>
            <p className="mt-[18px] flex items-baseline gap-[14px] text-foreground">
              <span className="text-[140px] font-semibold leading-none tracking-tight">{numero.valor}</span>
              {numero.unidade && <span className="text-[40px] text-foreground/70">{numero.unidade}</span>}
            </p>
            {numero.detalhe && (
              <p className="mt-[16px] text-[24px] leading-snug text-muted-foreground">{numero.detalhe}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
