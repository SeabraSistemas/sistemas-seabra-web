import { cn } from '@/lib/utils';
import { Foto } from '../Foto';
import { Cabecalho } from '../partes';
import type { SlideColunas } from '../tipos';

/**
 * Comparação lado a lado, 2 ou 3 colunas, cada uma com foto. Grade de duas
 * linhas (fotos, depois textos): o texto mais longo empurra todas as fotos
 * igualmente, e os títulos ficam alinhados entre as colunas.
 */
export function Colunas({ slide, secao }: { slide: SlideColunas; secao?: string }) {
  const tres = slide.colunas.length >= 3;
  const temFoto = slide.colunas.some((c) => c.foto);
  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[100px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
      <div
        className={cn(
          'mt-[48px] grid min-h-0 flex-1 gap-x-[40px]',
          tres ? 'grid-cols-3' : 'grid-cols-2',
          temFoto && 'grid-rows-[minmax(0,1fr)_auto]'
        )}
      >
        {temFoto &&
          slide.colunas.map((coluna) =>
            coluna.foto ? (
              <Foto
                key={`foto-${coluna.titulo}`}
                foto={coluna.foto}
                sizes={tres ? '30vw' : '45vw'}
                className="min-h-0 rounded-[6px]"
              />
            ) : (
              <span key={`foto-${coluna.titulo}`} />
            )
          )}
        {slide.colunas.map((coluna) => (
          <div key={coluna.titulo}>
            <h3 className="mt-[28px] font-sans text-[44px] font-semibold leading-tight text-foreground">
              {coluna.titulo}
            </h3>
            {coluna.subtitulo && <p className="deck-rotulo mt-[14px]">{coluna.subtitulo}</p>}
            {coluna.itens && (
              <ul className="mt-[18px] space-y-[8px]">
                {coluna.itens.map((item) => (
                  <li key={item} className="text-[28px] leading-snug text-foreground/75">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
