'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Donut de rebanho vivo por categoria. Paleta categórica validada (8 matizes,
 * ordem fixa, dark-mode) do skill dataviz — dobra pra "Outros" acima de 7
 * categorias em vez de gerar uma 9ª cor. "Outros" usa cinza neutro, não um
 * matiz da série, pra não competir como se fosse categoria real.
 */
const SERIES_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9'];
const OUTROS_COLOR = 'var(--ink-2)';
const MAX_FATIAS = 7;

export function CategoriaDonut({ data }: { data: { categoria: string; total: number }[] }) {
  const total = data.reduce((acc, d) => acc + d.total, 0);
  if (total === 0) return null;

  const ordenado = [...data].sort((a, b) => b.total - a.total);
  const principais = ordenado.slice(0, MAX_FATIAS);
  const resto = ordenado.slice(MAX_FATIAS);
  const restoTotal = resto.reduce((acc, d) => acc + d.total, 0);

  const fatias = [
    ...principais.map((d, i) => ({ name: d.categoria, value: d.total, color: SERIES_DARK[i] })),
    ...(restoTotal > 0 ? [{ name: 'Outros', value: restoTotal, color: OUTROS_COLOR }] : []),
  ];

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fatias}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
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
              formatter={(value, name) => [`${value}`, `${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:w-auto">
        {fatias.map((f) => (
          <li key={f.name} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.color }} aria-hidden />
            <span className="text-foreground">{f.name}</span>
            <span className="tabular-nums">{f.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
