'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { FatiaDistribuicao } from '@/lib/adm/types';
import { formatarPercentual } from '@/lib/adm/format';
import {
  CLASSES_VAZIO,
  COR_FUNDO,
  COR_OUTROS,
  MENSAGEM_VAZIA,
  SERIES,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  agregarOutros,
  comoNumero,
  corSerie,
  formatarValorPadrao,
} from './theme';

interface Props {
  dados: FatiaDistribuicao[];
  /**
   * Teto de fatias antes de o resto virar "Outros (n)". Default: o tamanho da
   * escala. Pedir mais fatias que cores repetiria uma cor no anel, e duas fatias
   * da mesma cor num donut leem como uma categoria partida ao meio.
   */
  maximo?: number;
  /** Lado do donut em px. Default 200. */
  altura?: number;
  /** O que o total no centro conta — 'animais', 'contas', 'propriedades'. */
  rotuloTotal?: string;
  formatarValor?: (valor: number) => string;
  mensagemVazia?: string;
}

/**
 * Donut de composição, com legenda ao lado e o total no miolo.
 *
 * O buraco do meio não é enfeite: é onde vai o total, e o total é o que dá
 * sentido a cada percentual. "38% caprino leiteiro" sozinho não diz nada; "38%
 * de 4.820 animais" diz.
 *
 * Teto de 5 fatias porque acima disso o olho não compara ângulos — vira mancha.
 * O resto some em "Outros", em cinza neutro, e quem quiser a cauda inteira abre
 * a tabela (que é o ponto do escape hatch: gráfico resume, tabela detalha).
 */
export function DistribuicaoDonut({
  dados,
  maximo = SERIES.length,
  altura = 200,
  rotuloTotal,
  formatarValor = formatarValorPadrao,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  const { fatias, total } = useMemo(() => {
    const agregadas = agregarOutros(dados, Math.min(maximo, SERIES.length));
    return {
      fatias: agregadas.map((f, i) => ({
        rotulo: f.rotulo,
        valor: f.valor,
        cor: f.outros ? COR_OUTROS : corSerie(i),
      })),
      total: agregadas.reduce((acc, f) => acc + f.valor, 0),
    };
  }, [dados, maximo]);

  if (fatias.length === 0 || total === 0) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura }}>
        {mensagemVazia}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 tabular-nums sm:flex-row sm:gap-8">
      <div className="relative shrink-0" style={{ height: altura, width: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fatias}
              dataKey="valor"
              nameKey="rotulo"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={3}
              // O "vão" entre fatias é o fundo do card, não uma cor de borda:
              // qualquer outra coisa desenharia um anel que não existe.
              stroke={COR_FUNDO}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {fatias.map((f) => (
                <Cell key={f.rotulo} fill={f.cor} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_ESTILO}
              labelStyle={TOOLTIP_ROTULO_ESTILO}
              itemStyle={TOOLTIP_ITEM_ESTILO}
              formatter={(valor, nome) => {
                const n = comoNumero(valor);
                if (n == null) return ['—', String(nome ?? '')];
                return [`${formatarValor(n)} · ${formatarPercentual(n / total)}`, String(nome ?? '')];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Sobreposto em HTML, e não como <text> dentro do SVG: assim o número
            herda a fonte, o tabular-nums e o token de cor do resto da página.
            pointer-events-none para não roubar o hover das fatias. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-medium tabular-nums text-foreground">{formatarValor(total)}</span>
          {rotuloTotal && <span className="text-xs text-muted-foreground">{rotuloTotal}</span>}
        </div>
      </div>

      <ul className="grid w-full gap-y-1.5 text-sm sm:w-auto sm:min-w-52">
        {fatias.map((f) => (
          <li key={f.rotulo} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground">{f.rotulo}</span>
            <span className="tabular-nums text-foreground">{formatarValor(f.valor)}</span>
            <span className="w-12 text-right tabular-nums text-muted-foreground">
              {formatarPercentual(f.valor / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
