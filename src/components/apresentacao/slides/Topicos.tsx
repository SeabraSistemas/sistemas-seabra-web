import { cn } from '@/lib/utils';
import { Foto } from '../Foto';
import { Cabecalho, ListaTopicos } from '../partes';
import type { SlideTopicos } from '../tipos';

/**
 * `topicos`: texto domina, foto à direita em 40% do slide.
 * `texto-foto`: foto domina, mais da metade do slide.
 */
export function Topicos({ slide, secao }: { slide: SlideTopicos; secao?: string }) {
  const fotoGrande = slide.tipo === 'texto-foto';
  return (
    <div
      className={cn(
        'absolute inset-0 grid',
        slide.foto && (fotoGrande ? 'grid-cols-[1fr_1000px]' : 'grid-cols-[1fr_760px]')
      )}
    >
      <div className="flex h-full flex-col px-[120px] pb-[110px] pt-[100px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
        {slide.itens && slide.itens.length > 0 && (
          <div className="mt-[48px] flex flex-1 flex-col justify-center">
            <ListaTopicos
              itens={slide.itens}
              estilo={slide.estilo ?? 'lista'}
              tamanho={fotoGrande ? 'medio' : 'grande'}
            />
          </div>
        )}
      </div>
      {slide.foto && (
        <Foto
          foto={slide.foto}
          sizes={fotoGrande ? '52vw' : '40vw'}
          className={cn('h-full', slide.foto.ajuste === 'conter' && 'm-[80px] h-auto')}
        />
      )}
    </div>
  );
}
