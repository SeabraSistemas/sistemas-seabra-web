'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FatiaDistribuicao } from '@/lib/adm/types';
import { formatarPercentual } from '@/lib/adm/format';
import {
  CLASSES_VAZIO,
  COR_OUTROS,
  CURSOR_BARRA,
  EIXO_BASE,
  MENSAGEM_VAZIA,
  TOOLTIP_ESTILO,
  TOOLTIP_ITEM_ESTILO,
  TOOLTIP_ROTULO_ESTILO,
  agregarOutros,
  comoNumero,
  corSerie,
  encurtar,
  formatarValorPadrao,
} from './theme';

interface Props {
  dados: FatiaDistribuicao[];
  /** Teto de barras antes de o resto virar "Outros (n)". Default 8. */
  maximo?: number;
  /** Default: calculada pelo número de barras — 34px por linha. */
  altura?: number;
  /** Largura reservada aos rótulos. Suba para nome de propriedade, desça para UF. */
  larguraRotulo?: number;
  formatarValor?: (valor: number) => string;
  /** Acrescenta o percentual do total ao lado do valor. */
  mostrarPercentual?: boolean;
  mensagemVazia?: string;
}

interface LinhaBarra {
  rotulo: string;
  valor: number;
  etiqueta: string;
  cor: string;
}

/**
 * Distribuição em barras horizontais, ordenada do maior para o menor.
 *
 * Horizontal e não vertical porque as categorias daqui são nomes — raça, estado,
 * plano, módulo — e nome em barra vertical vira rótulo de 45°, que ninguém lê.
 * Deitada, o rótulo fica na horizontal e a ordenação por valor faz o olho descer
 * a lista como se fosse um ranking, que é exatamente o que ela é.
 *
 * Uma cor só: é UMA medida repartida em categorias, não várias séries. Pintar
 * cada barra de uma cor sugeriria um significado que a cor não carrega. A única
 * exceção é "Outros", em cinza, porque ele de fato não é uma categoria.
 */
export function DistribuicaoBarras({
  dados,
  maximo = 8,
  altura,
  larguraRotulo = 132,
  formatarValor = formatarValorPadrao,
  mostrarPercentual = false,
  mensagemVazia = MENSAGEM_VAZIA,
}: Props) {
  const linhas = useMemo<LinhaBarra[]>(() => {
    const fatias = agregarOutros(dados, maximo);
    const total = fatias.reduce((acc, f) => acc + f.valor, 0);

    return fatias.map((f) => ({
      rotulo: f.rotulo,
      valor: f.valor,
      // A etiqueta é pré-formatada como texto no dataset em vez de sair de um
      // formatter do LabelList: assim ela pode carregar valor E percentual, que
      // o formatter (que só recebe o número) não conseguiria montar.
      etiqueta:
        mostrarPercentual && total > 0
          ? `${formatarValor(f.valor)} · ${formatarPercentual(f.valor / total)}`
          : formatarValor(f.valor),
      cor: f.outros ? COR_OUTROS : corSerie(0),
    }));
  }, [dados, maximo, mostrarPercentual, formatarValor]);

  const alturaFinal = altura ?? Math.max(120, linhas.length * 34 + 16);

  if (linhas.length === 0) {
    return (
      <div className={CLASSES_VAZIO} style={{ height: altura ?? 120 }}>
        {mensagemVazia}
      </div>
    );
  }

  return (
    <div className="w-full tabular-nums" style={{ height: alturaFinal }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={linhas}
          layout="vertical"
          // A margem à direita é o espaço da etiqueta de valor na ponta da barra:
          // sem ela o número da maior barra sai cortado na borda do card.
          margin={{ top: 4, right: 64, bottom: 4, left: 0 }}
          barCategoryGap="22%"
        >
          {/* Eixo de valor escondido: com o número impresso na ponta de cada
              barra, uma régua embaixo seria a mesma informação duas vezes. */}
          <XAxis type="number" dataKey="valor" hide domain={[0, 'dataMax']} />

          <YAxis
            {...EIXO_BASE}
            type="category"
            dataKey="rotulo"
            width={larguraRotulo}
            axisLine={false}
            tickFormatter={(v: string) => encurtar(v, Math.floor(larguraRotulo / 7))}
          />

          <Tooltip
            cursor={CURSOR_BARRA}
            contentStyle={TOOLTIP_ESTILO}
            labelStyle={TOOLTIP_ROTULO_ESTILO}
            itemStyle={TOOLTIP_ITEM_ESTILO}
            // O tooltip é onde o rótulo aparece INTEIRO — o do eixo pode ter sido
            // cortado, e cortar sem oferecer o texto completo em algum lugar é
            // esconder dado.
            formatter={(valor) => {
              const n = comoNumero(valor);
              return [n == null ? '—' : formatarValor(n), 'Total'];
            }}
          />

          <Bar dataKey="valor" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {linhas.map((l) => (
              <Cell key={l.rotulo} fill={l.cor} />
            ))}
            <LabelList
              dataKey="etiqueta"
              position="right"
              offset={8}
              fill="var(--foreground)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
