import { Foto } from '../Foto';
import { Cabecalho } from '../partes';
import type { Secao, SlideAgenda } from '../tipos';

/** As seções saem dos divisores: reordenar o deck atualiza a agenda. */
export function Agenda({ slide, secoes }: { slide: SlideAgenda; secoes: Secao[] }) {
  return (
    <div className={slide.foto ? 'absolute inset-0 grid grid-cols-[1fr_700px]' : 'absolute inset-0'}>
      <div className="flex h-full flex-col px-[120px] pb-[110px] pt-[100px]">
        <Cabecalho titulo={slide.titulo} />
        <ol className="mt-[56px] flex flex-1 flex-col justify-center gap-[22px]">
          {secoes.map((secao) => (
            <li key={secao.numero} className="flex items-baseline gap-[36px]">
              <span className="deck-titulo w-[80px] shrink-0 text-[56px] text-primary">{secao.numero}</span>
              <span className="text-[44px] leading-tight text-foreground">{secao.titulo}</span>
            </li>
          ))}
        </ol>
      </div>
      {slide.foto && <Foto foto={slide.foto} sizes="37vw" className="h-full" />}
    </div>
  );
}
