'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDia, formatNumber } from '@/lib/painel/format';

export interface PontoPeso {
  /** "aaaammdd" — mesma base compacta de diaDe/formatDia (format.ts). */
  dia: number;
  pesoKg: number;
}

/** "aaaammdd" -> timestamp, pro eixo X ser proporcional ao TEMPO (ver comentário do componente). */
function tsDe(dia: number): number {
  const ano = Math.floor(dia / 10000);
  const mes = Math.floor((dia % 10000) / 100);
  const d = dia % 100;
  return new Date(ano, mes - 1, d).getTime();
}

function rotuloCurto(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${String(d.getFullYear()).slice(2)}`;
}

/**
 * Curva de peso de UM animal (ficha da Pesagem, 21/09/2026) — peso × data
 * das pesagens dele.
 *
 * Duas decisões que valem registrar:
 * - **Eixo X proporcional ao tempo** (`type="number"` em timestamp), não
 *   categórico: as pesagens são irregulares (às vezes 13 dias, às vezes 6
 *   meses). Com espaçamento igual, a INCLINAÇÃO da curva mentiria — e a
 *   inclinação é exatamente o que o produtor lê aqui (ganho por dia).
 * - **Área ancorada no zero**: área preenchida a partir de uma base
 *   cortada exagera a variação. Numa curva de crescimento o zero é um
 *   ponto real (o animal nasceu pequeno), então a área fica honesta.
 *
 * Série única => sem legenda (o título do card já nomeia), e a lista de
 * pesagens embaixo da curva serve de "table view".
 */
export function CurvaPeso({ pontos, cor = '#c98500' }: { pontos: PontoPeso[]; cor?: string }) {
  const linhas = useMemo(
    () =>
      pontos
        .map((p) => ({ ts: tsDe(p.dia), dia: p.dia, pesoKg: p.pesoKg }))
        .sort((a, b) => a.ts - b.ts),
    [pontos],
  );

  if (linhas.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Sem pesagem registrada.</div>;
  }

  return (
    <div className="w-full tabular-nums" style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={linhas} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="curvaPesoFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={rotuloCurto}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            minTickGap={28}
          />
          <YAxis
            width={48}
            domain={[0, 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            separator=": "
            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--popover-foreground)',
              fontSize: 13,
            }}
            labelFormatter={(ts) => formatDia(linhas.find((l) => l.ts === ts)?.dia ?? null)}
            formatter={(valor) => [`${formatNumber(Number(valor))} kg`, 'Peso']}
          />
          <Area
            dataKey="pesoKg"
            name="Peso"
            stroke={cor}
            strokeWidth={2}
            fill="url(#curvaPesoFill)"
            isAnimationActive={false}
            dot={{ r: 4, fill: 'var(--card)', stroke: cor, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: 'var(--card)', stroke: cor, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
