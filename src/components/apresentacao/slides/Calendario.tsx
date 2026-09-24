import { Cabecalho, SeloIlustrativo } from '../partes';
import type { SlideCalendario } from '../tipos';

/**
 * Fases em ordem no tempo → rampa ordinal de um só azul (escuro → claro) e o
 * ocre só no abate, que é o que o frigorífico enxerga. Validado com o
 * validate_palette da skill dataviz: --ordinal passa; azul × azul ΔE 19.
 */
const COR = {
  gestacao: '#1c5cab',
  terminacao: '#5598e7',
  abate: 'var(--ocre)',
};

const ROTULO = 170; // coluna com o nome do lote, em px
const LINHA = 38;
const BARRA = 22;

interface Trecho {
  inicio: number; // mês (0–11), já dentro do ano
  meses: number;
  cor: string;
}

/** Quebra um trecho que passa de dezembro em dois (fim do ano + começo). */
function noAno(inicio: number, meses: number, cor: string): Trecho[] {
  const i = inicio % 12;
  if (i + meses <= 12) return [{ inicio: i, meses, cor }];
  return [
    { inicio: i, meses: 12 - i, cor },
    { inicio: 0, meses: i + meses - 12, cor },
  ];
}

export function Calendario({ slide, secao }: { slide: SlideCalendario; secao?: string }) {
  const mes = 100 / 12; // largura de um mês, em % da faixa de meses
  const lotes = slide.meses.map((_, m) => {
    const trechos = [
      ...noAno(m, slide.gestacao, COR.gestacao),
      ...noAno(m + slide.gestacao, slide.terminacao, COR.terminacao),
      ...noAno(m + slide.gestacao + slide.terminacao, 1, COR.abate),
    ];
    return { nome: `Lote ${String(m + 1).padStart(2, '0')}`, cobertura: m, trechos };
  });
  // Quantos lotes chegam ao abate em cada mês — é a linha de baixo.
  const abates = slide.meses.map(
    (_, m) => lotes.filter((l) => (l.cobertura + slide.gestacao + slide.terminacao) % 12 === m).length
  );

  return (
    <div className="absolute inset-0 flex flex-col px-[120px] pb-[96px] pt-[100px]">
      <div className="flex items-start justify-between gap-[40px]">
        <Cabecalho secao={secao} titulo={slide.titulo} lead={slide.lead} />
        {slide.ilustrativo && <SeloIlustrativo className="shrink-0" />}
      </div>

      <div className="mt-auto">
        {/* Legenda */}
        <div className="mb-[18px] flex items-center gap-[36px] text-[22px] text-foreground/80" style={{ paddingLeft: ROTULO }}>
          <span className="flex items-center gap-[10px]">
            <span className="size-[14px] rounded-full bg-foreground" /> Cobertura
          </span>
          <span className="flex items-center gap-[10px]">
            <span className="h-[14px] w-[28px] rounded-[3px]" style={{ background: COR.gestacao }} /> Gestação
          </span>
          <span className="flex items-center gap-[10px]">
            <span className="h-[14px] w-[28px] rounded-[3px]" style={{ background: COR.terminacao }} /> Cria e terminação
          </span>
          <span className="flex items-center gap-[10px]">
            <span className="h-[14px] w-[28px] rounded-[3px]" style={{ background: COR.abate }} /> Abate
          </span>
        </div>

        {/* Meses */}
        <div className="flex text-[20px] uppercase tracking-[0.1em] text-muted-foreground">
          <span style={{ width: ROTULO }} />
          {slide.meses.map((m) => (
            <span key={m} className="flex-1 text-center">
              {m}
            </span>
          ))}
        </div>

        {/* Um lote por linha */}
        <div className="mt-[8px]">
          {lotes.map((lote) => (
            <div key={lote.nome} className="flex items-center" style={{ height: LINHA }}>
              <span className="text-[20px] text-foreground/70" style={{ width: ROTULO }}>
                {lote.nome}
              </span>
              <div className="relative h-full flex-1 border-t border-white/[0.06]">
                {lote.trechos.map((t) => (
                  <span
                    key={`${t.cor}-${t.inicio}`}
                    className="absolute rounded-[4px]"
                    style={{
                      left: `calc(${t.inicio * mes}% + 1px)`,
                      width: `calc(${t.meses * mes}% - 2px)`,
                      top: (LINHA - BARRA) / 2,
                      height: BARRA,
                      background: t.cor,
                    }}
                  />
                ))}
                <span
                  className="absolute size-[14px] -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
                  style={{ left: `calc(${lote.cobertura * mes}% + 2px)`, top: (LINHA - 14) / 2 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Soma: lotes em abate por mês */}
        <div className="mt-[14px] flex items-center border-t border-white/25 pt-[14px]">
          <span className="text-[20px] font-semibold text-foreground" style={{ width: ROTULO }}>
            Abate no mês
          </span>
          {abates.map((qtd, m) => (
            <span key={slide.meses[m]} className="flex flex-1 justify-center">
              <span
                className="flex h-[40px] w-[70%] items-center justify-center rounded-[4px] text-[20px] font-semibold text-black"
                style={{ background: qtd ? COR.abate : 'transparent' }}
              >
                {qtd ? `${qtd} lote` : ''}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
