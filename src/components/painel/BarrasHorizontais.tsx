'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber } from '@/lib/painel/format';

const COR_BARRA = '#3987e5';
const COR_OUTROS = 'var(--ink-2)';

interface LinhaBarra {
  rotulo: string;
  valor: number;
  etiqueta: string;
  outros: boolean;
}

/**
 * Distribuição em barras horizontais, ordenada do maior para o menor — mesma
 * lógica de src/components/adm/charts/DistribuicaoBarras.tsx, portada sem o
 * tema do /adm (esse componente é acoplado a `lib/adm/types`/`format`, que o
 * FI_FCG não usa). Horizontal porque a categoria aqui é um nome (touro,
 * inseminador, causa) — em barra vertical o rótulo viraria 45° ilegível.
 */
export function BarrasHorizontais({
  dados,
  maximo = 12,
  larguraRotulo = 132,
  formatoValor,
}: {
  dados: { rotulo: string; valor: number }[];
  /** Teto de barras antes de o resto virar "Outros (n)". */
  maximo?: number;
  larguraRotulo?: number;
  formatoValor?: (v: number) => string;
}) {
  const fmt = formatoValor ?? formatNumber;

  const linhas = useMemo<LinhaBarra[]>(() => {
    const ordenado = [...dados].sort((a, b) => b.valor - a.valor);
    const principais = ordenado.slice(0, maximo);
    const resto = ordenado.slice(maximo);
    const restoTotal = resto.reduce((acc, d) => acc + d.valor, 0);
    const linhasPrincipais = principais.map((d) => ({ rotulo: d.rotulo, valor: d.valor, etiqueta: fmt(d.valor), outros: false }));
    return restoTotal > 0
      ? [...linhasPrincipais, { rotulo: `Outros (${resto.length})`, valor: restoTotal, etiqueta: fmt(restoTotal), outros: true }]
      : linhasPrincipais;
  }, [dados, maximo, fmt]);

  if (linhas.length === 0) {
    return <div className="flex h-28 items-center justify-center text-sm text-muted-foreground">Sem dados.</div>;
  }

  const altura = Math.max(120, linhas.length * 34 + 16);

  return (
    <div className="w-full tabular-nums" style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={linhas} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 0 }} barCategoryGap="22%">
          <XAxis type="number" dataKey="valor" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="rotulo"
            width={larguraRotulo}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--popover-foreground)',
              fontSize: 13,
            }}
            formatter={(valor) => [fmt(Number(valor)), 'Total']}
          />
          <Bar dataKey="valor" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {linhas.map((l) => (
              <Cell key={l.rotulo} fill={l.outros ? COR_OUTROS : COR_BARRA} />
            ))}
            <LabelList dataKey="etiqueta" position="right" offset={8} fill="var(--foreground)" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
