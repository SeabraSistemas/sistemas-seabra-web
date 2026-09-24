import { Cabecalho } from '../partes';
import type { SlideTabela } from '../tipos';

export function Tabela({ slide, secao }: { slide: SlideTabela; secao?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[110px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
      <div className="flex flex-1 flex-col justify-center">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {slide.colunas.map((coluna, i) => (
                <th
                  key={coluna || `c${i}`}
                  scope="col"
                  className="deck-rotulo pb-[22px] pr-[32px] font-semibold"
                  style={i === 0 ? { width: 360 } : undefined}
                >
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.linhas.map((linha) => (
              <tr key={linha[0]} className="border-t border-white/15">
                {linha.map((celula, i) =>
                  i === 0 ? (
                    <th
                      key={i}
                      scope="row"
                      className="py-[26px] pr-[32px] align-top text-[32px] font-semibold text-foreground"
                    >
                      {celula}
                    </th>
                  ) : (
                    <td key={i} className="py-[26px] pr-[32px] align-top text-[32px] leading-snug text-foreground/85">
                      {celula}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {slide.nota && <p className="text-[24px] text-muted-foreground">{slide.nota}</p>}
    </div>
  );
}
