'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Donut categórico genérico — generaliza
 * src/components/katmandu/CategoriaDonut.tsx (que ficou específico de
 * "categoria" de animal) pra qualquer rótulo/valor. Paleta categórica
 * validada (skill dataviz), ordem fixa, dark-mode. Dobra em "Outros" acima
 * de `maxFatias` categorias em vez de gerar mais uma cor.
 */
const SERIES_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#0891b2',
  '#a3542e',
];
const OUTROS_COLOR = 'var(--ink-2)';

export function Donut({
  dados,
  maxFatias = 7,
  formatoValor,
}: {
  dados: { rotulo: string; valor: number }[];
  maxFatias?: number;
  /** Como o tooltip mostra o valor — default: inteiro cru. */
  formatoValor?: (v: number) => string;
}) {
  const total = dados.reduce((acc, d) => acc + d.valor, 0);
  if (total === 0) return null;

  const paleta = SERIES_DARK.slice(0, Math.min(maxFatias, SERIES_DARK.length));
  const ordenado = [...dados].sort((a, b) => b.valor - a.valor);
  const principais = ordenado.slice(0, maxFatias);
  const resto = ordenado.slice(maxFatias);
  const restoTotal = resto.reduce((acc, d) => acc + d.valor, 0);

  const fatias = [
    ...principais.map((d, i) => ({ name: d.rotulo, value: d.valor, color: paleta[i % paleta.length] })),
    ...(restoTotal > 0 ? [{ name: `Outros (${resto.length})`, value: restoTotal, color: OUTROS_COLOR }] : []),
  ];

  const fmt = formatoValor ?? ((v: number) => `${v}`);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fatias}
              dataKey="value"
              nameKey="name"
              innerRadius="54%"
              outerRadius="86%"
              paddingAngle={2}
              cornerRadius={3}
              stroke="var(--card)"
              strokeWidth={2}
              label={({ percent }) => ((percent ?? 0) >= 0.08 ? `${((percent ?? 0) * 100).toFixed(1).replace('.', ',')}%` : '')}
              labelLine={false}
            >
              {fatias.map((f) => (
                <Cell key={f.name} fill={f.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--popover-foreground)',
                fontSize: 13,
              }}
              formatter={(value, name) => [fmt(Number(value)), `${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:w-auto">
        {fatias.map((f) => (
          <li key={f.name} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.color }} aria-hidden />
            <span className="text-foreground">{f.name}</span>
            <span className="tabular-nums">{fmt(f.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
