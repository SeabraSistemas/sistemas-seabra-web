import { GraficoBarras } from '../GraficoBarras';
import { TEMA_ESCURO, dominioRedondo, ticksRedondos } from '../graficos';
import { Cabecalho, SeloIlustrativo } from '../partes';
import type { SlideGrafico } from '../tipos';

const LARGURA_UTIL = 1680;
const VAO = 80;
const ALTURA = 470;

/**
 * Um painel por cenário, lado a lado e na MESMA escala — é a comparação que
 * conta a história (picos e vazios × oferta contínua). Nunca dois eixos.
 */
export function Grafico({ slide, secao }: { slide: SlideGrafico; secao?: string }) {
  const n = slide.paineis.length;
  const largura = Math.floor((LARGURA_UTIL - VAO * (n - 1)) / n);
  const maximo = Math.max(...slide.paineis.flatMap((p) => p.valores), slide.referencia?.valor ?? 0);
  const dominio: [number, number] = [0, dominioRedondo(maximo)];

  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[100px] pt-[100px]">
      <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
      {slide.ilustrativo && <SeloIlustrativo className="absolute right-[120px] top-[100px]" />}

      <div className="mt-auto">
        {slide.referencia && (
          <p className="mb-[26px] flex items-center gap-[14px] text-[24px] text-foreground/80">
            <span aria-hidden className="h-[2px] w-[40px] bg-foreground" />
            {slide.referencia.rotulo}
            <span className="text-muted-foreground">
              · {slide.referencia.valor.toLocaleString('pt-BR')} {slide.unidade}
            </span>
          </p>
        )}
        <div className="flex" style={{ gap: VAO }}>
          {slide.paineis.map((painel, p) => (
            <figure key={painel.titulo} style={{ width: largura }}>
              <figcaption className="mb-[18px] text-[30px] font-semibold text-foreground">
                {painel.titulo}
              </figcaption>
              <GraficoBarras
                rotulos={slide.rotulos}
                valores={painel.valores}
                unidade={slide.unidade}
                largura={largura}
                altura={ALTURA}
                dominio={dominio}
                ticks={ticksRedondos(dominio[1])}
                referencia={slide.referencia?.valor}
                tema={TEMA_ESCURO}
                atraso={p * 1300}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
