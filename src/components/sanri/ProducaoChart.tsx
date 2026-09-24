'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDia, formatNumber } from '@/lib/painel/format';
import type { DiaProducao } from '@/lib/sanri/producao';

function rotuloDia(v: number): string {
  return formatDia(v).slice(0, 5);
}

/**
 * Uma série só (litros/dia), em baio — média por cabra fica no tooltip e na
 * tabela, nunca num 2º eixo. Barra de até 24px com a ponta arredondada e a
 * base reta; grade em fio `rule`, recessiva.
 */
export function ProducaoChart({ dias }: { dias: DiaProducao[] }) {
  const dados = dias
    .filter((d) => d.producao != null)
    .map((d) => ({ data: d.data, producao: d.producao, media: d.media, animais: d.animais }))
    .sort((a, b) => a.data - b.data);

  if (dados.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-ink-2">Sem produção calculada no período.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="var(--rule-hair)" vertical={false} />
          <XAxis
            dataKey="data"
            tickFormatter={rotuloDia}
            axisLine={{ stroke: 'var(--rule-hair)' }}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--ink-2)' }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            width={44}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--ink-2)' }}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ fill: 'var(--paper-2)', opacity: 0.6 }}
            contentStyle={{
              background: 'var(--paper-0)',
              border: '1px solid var(--rule-hair)',
              borderRadius: 10,
              color: 'var(--ink-0)',
              fontSize: 13,
              boxShadow: '0 8px 24px -12px rgb(20 16 13 / 0.25)',
            }}
            labelStyle={{ color: 'var(--ink-2)', marginBottom: 2 }}
            itemStyle={{ color: 'var(--ink-0)' }}
            labelFormatter={(v) => `Ordenha de ${formatDia(Number(v))}`}
            formatter={(valor, _nome, item) => {
              const p = item.payload as { media: number | null; animais: number | null };
              const extra = p.media != null ? ` · ${formatNumber(p.media)} L/cabra (${p.animais} cabras)` : '';
              return [`${formatNumber(Number(valor))} L${extra}`, 'Produção'];
            }}
          />
          <Bar dataKey="producao" name="Produção" fill="var(--bay-600)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
