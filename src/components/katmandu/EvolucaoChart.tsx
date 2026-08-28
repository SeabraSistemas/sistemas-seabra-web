'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber } from '@/lib/katmandu/format';
import type { PontoEvolucao } from '@/lib/katmandu/coorte';

/**
 * Evolução do lote ao longo das pesagens. Série única (é sempre um lote e uma
 * métrica de cada vez), então não há legenda — o título do card nomeia a série,
 * conforme o skill dataviz. Área só como reforço visual da mesma cor da linha.
 */
const COR = '#3987e5'; // slot 1 da paleta categórica (modo escuro)

export function EvolucaoChart({ dados, label }: { dados: PontoEvolucao[]; label: string }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dados} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="evolucaoFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COR} stopOpacity={0.28} />
              <stop offset="100%" stopColor={COR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
          <XAxis
            dataKey="rotulo"
            stroke="var(--ink-2)"
            tick={{ fill: 'var(--ink-1)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--line-subtle)' }}
          />
          {/* Escala ajustada aos dados, não ancorada em zero: o gráfico existe pra
              mostrar a VARIAÇÃO do lote entre pesagens, e com baseline zero um
              ganho de 240→340 kg vira uma reta quase plana. Linha (não barra)
              pode dispensar o zero — a área é só reforço visual da mesma série. */}
          <YAxis
            stroke="var(--ink-2)"
            tick={{ fill: 'var(--ink-1)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={64}
            domain={['dataMin', 'dataMax']}
            padding={{ top: 16, bottom: 16 }}
            // As médias são float (339.3333…): sem formatar, o tick sai cru e estoura a largura.
            tickFormatter={(v: number) => formatNumber(v)}
          />
          <Tooltip
            cursor={{ stroke: 'var(--line-strong)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--popover-foreground)',
              fontSize: 13,
            }}
            formatter={(valor, _nome, item) => {
              const ponto = item?.payload as PontoEvolucao | undefined;
              const n = typeof valor === 'number' ? valor : null;
              return [`${formatNumber(n)} · ${ponto?.animais ?? 0} animais`, label];
            }}
            labelFormatter={(_r, payload) => (payload?.[0]?.payload as PontoEvolucao | undefined)?.data ?? ''}
          />
          <Area type="monotone" dataKey="valor" stroke="none" fill="url(#evolucaoFill)" connectNulls />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={COR}
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--card)', stroke: COR, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
