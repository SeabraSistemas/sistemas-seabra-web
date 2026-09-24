'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDia, formatNumber } from '@/lib/painel/format';
import type { DiaProducao } from '@/lib/sanri/producao';

const COR = '#c98500';

function rotuloDia(v: number): string {
  return formatDia(v).slice(0, 5);
}

/** Uma série só (litros/dia) — média por cabra fica no tooltip e na tabela, nunca num 2º eixo. */
export function ProducaoChart({ dias }: { dias: DiaProducao[] }) {
  const dados = dias
    .filter((d) => d.producao != null)
    .map((d) => ({ data: d.data, producao: d.producao, media: d.media, animais: d.animais }))
    .sort((a, b) => a.data - b.data);

  if (dados.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Sem produção calculada no período.</div>;
  }

  return (
    <div className="h-64 w-full tabular-nums">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="data"
            tickFormatter={rotuloDia}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            width={48}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(v: number) => formatNumber(v)}
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
            labelFormatter={(v) => formatDia(Number(v))}
            formatter={(valor, _nome, item) => {
              const p = item.payload as { media: number | null; animais: number | null };
              const extra = p.media != null ? ` · ${formatNumber(p.media)} L/cabra (${p.animais} cabras)` : '';
              return [`${formatNumber(Number(valor))} L${extra}`, 'Produção'];
            }}
          />
          <Bar dataKey="producao" name="Produção" fill={COR} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
