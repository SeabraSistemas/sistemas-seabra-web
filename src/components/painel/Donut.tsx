'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from 'recharts';

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
const LIMIAR_ROTULO = 0.08;
const RADIAN = Math.PI / 180;

/**
 * Rótulo de % DENTRO do anel (raio médio entre innerRadius/outerRadius) —
 * nunca fora dele. A posição padrão do recharts pro `label` de uma Pie é
 * FORA do outerRadius (mesmo com `labelLine={false}`, só a linha some, o
 * texto continua deslocado pra fora); pra fatias perto do topo/base do
 * círculo esse deslocamento passa da borda do <svg>, que clipa por padrão
 * (comportamento do próprio elemento, não CSS) — o número saía cortado e a
 * fatia parecia "não fechar" onde o texto flutuava por cima do traço entre
 * fatias. Calculando a posição manualmente a partir de cx/cy/midAngle, o
 * texto nunca sai do raio do próprio anel, então nunca é cortado nem
 * sobrepõe o contorno. Contraste do texto (branco + contorno escuro via
 * paint-order) garante leitura em qualquer cor da paleta, sem depender de
 * qual fatia é mais clara ou mais escura.
 */
function rotuloFatia({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) {
  if ((percent ?? 0) < LIMIAR_ROTULO) return null;
  if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null) return null;
  const raio = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + raio * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + raio * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      fill="#fff"
      style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.55)', strokeWidth: 3, strokeLinejoin: 'round' }}
    >
      {`${((percent ?? 0) * 100).toFixed(1).replace('.', ',')}%`}
    </text>
  );
}

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
              label={rotuloFatia}
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
      <ul className="flex w-full min-w-0 flex-col gap-1.5 text-sm sm:w-auto">
        {fatias.map((f) => (
          <li key={f.name} className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground" title={f.name}>
              {f.name}
            </span>
            <span className="shrink-0 tabular-nums">{fmt(f.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
