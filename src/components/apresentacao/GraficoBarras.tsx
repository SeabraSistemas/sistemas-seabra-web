'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CSSProperties } from 'react';
import type { TemaGrafico } from './graficos';

/**
 * Colunas (ou linha) mês a mês, com linha de referência opcional. Tamanho fixo
 * em px do palco: o slide tem 1920×1080 sempre, e medir o contêiner
 * (ResponsiveContainer) só atrapalharia sob o transform/zoom do deck.
 *
 * Série única → sem caixa de legenda: quem chama nomeia a série no título e
 * põe a chave da referência em HTML acima do gráfico (skill dataviz).
 */

interface Props {
  forma?: 'colunas' | 'linha';
  rotulos: string[];
  valores: number[];
  unidade: string;
  largura: number;
  altura: number;
  /** Escala do eixo Y. Painéis lado a lado recebem o mesmo domínio. */
  dominio: [number, number];
  /** Marcas do eixo Y (ticksRedondos). */
  ticks: number[];
  referencia?: number;
  /** Colunas abaixo da referência ganham a cor de alerta. */
  destacarAbaixo?: boolean;
  tema: TemaGrafico;
  /** Atraso da animação de entrada, em ms (painéis lado a lado entram em sequência). */
  atraso?: number;
}

export function GraficoBarras({
  forma = 'colunas',
  rotulos,
  valores,
  unidade,
  largura,
  altura,
  dominio,
  ticks,
  referencia,
  destacarAbaixo,
  tema,
  atraso = 0,
}: Props) {
  const dados = rotulos.map((rotulo, i) => ({ rotulo, valor: valores[i] }));
  const formato = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  const eixos = (
    <>
      <CartesianGrid stroke={tema.grade} vertical={false} />
      <XAxis
        dataKey="rotulo"
        tickLine={false}
        axisLine={{ stroke: tema.grade }}
        tick={{ fill: tema.eixo, fontSize: tema.fonte }}
        interval={0}
        tickMargin={10}
      />
      <YAxis
        domain={dominio}
        ticks={ticks}
        interval={0}
        tickLine={false}
        axisLine={false}
        tick={{ fill: tema.eixo, fontSize: tema.fonte }}
        tickFormatter={(v: number) => formato.format(v)}
        width={tema.fonte * 3.2}
      />
      <Tooltip
        cursor={forma === 'linha' ? { stroke: tema.eixo, strokeWidth: 1 } : { fill: 'rgb(127 127 127 / 0.1)' }}
        contentStyle={{
          background: tema.fundoDica,
          border: `1px solid ${tema.bordaDica}`,
          borderRadius: 10,
          color: tema.textoDica,
          fontSize: tema.fonte,
        }}
        formatter={(v) => [`${formato.format(Number(v))} ${unidade}`, '']}
        separator=""
      />
      {referencia !== undefined && (
        <ReferenceLine y={referencia} stroke={tema.referencia} strokeWidth={2} ifOverflow="extendDomain" />
      )}
    </>
  );

  const margem = { top: 12, right: 12, bottom: 0, left: 0 };
  const animacao = { '--atraso': `${atraso}ms` } as CSSProperties;

  if (forma === 'linha') {
    return (
      <div className="anim-grafico" style={animacao}>
        <LineChart width={largura} height={altura} data={dados} margin={margem}>
          {eixos}
          <Line
            dataKey="valor"
            stroke={tema.serie}
            strokeWidth={2}
            dot={{ r: 5, fill: tema.serie, stroke: tema.fundoDica, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
    );
  }

  return (
    <div className="anim-grafico" style={animacao}>
      <BarChart width={largura} height={altura} data={dados} margin={margem} barCategoryGap="30%">
        {eixos}
        <Bar dataKey="valor" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {dados.map((d) => (
            <Cell
              key={d.rotulo}
              fill={destacarAbaixo && referencia !== undefined && d.valor < referencia ? tema.abaixo : tema.serie}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}
