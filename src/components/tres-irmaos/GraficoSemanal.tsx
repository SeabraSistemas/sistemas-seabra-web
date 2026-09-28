'use client';

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { diaMes } from '@/lib/tres-irmaos/datas';
import { litros } from '@/components/tres-irmaos/formato';

/**
 * Barras empilhadas por semana: o que cada comprador leva, e por cima o que
 * sobra sem comprador. A linha tracejada é o teto semanal — o número que não
 * pode ser passado.
 *
 * Cores: a ordem do empilhamento (Rose embaixo, Marina, excedente em cima)
 * foi validada com o validate_palette do dataviz para o fundo escuro —
 * aqua↔azul e azul↔vermelho passam CVD; laranja ao lado do vermelho reprovava.
 * Vermelho fica só para o excedente, que é o alerta.
 */
export const COR_SERIES = ['#199e70', '#3987e5', '#9085e9'];
export const COR_EXCEDENTE = '#e66767';

export interface SerieGrafico {
  chave: string;
  nome: string;
  cor: string;
}

export function GraficoSemanal({
  linhas,
  series,
  teto,
  altura = 280,
}: {
  linhas: Array<Record<string, number | string>>;
  series: SerieGrafico[];
  teto: number;
  altura?: number;
}) {
  if (linhas.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Sem semanas para mostrar.</div>;
  }
  const ultimaVisivel = [...series].reverse();

  return (
    <div className="w-full tabular-nums">
      <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {series.map((s) => (
          <li key={s.chave} className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.cor }} aria-hidden />
            <span className="text-foreground">{s.nome}</span>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-0 w-4 border-t-2 border-dashed border-foreground/70" aria-hidden />
          <span className="text-foreground">Teto {litros(teto)}</span>
        </li>
      </ul>
      <div style={{ height: altura }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={linhas} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap="18%" maxBarSize={48}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="inicio"
              tickFormatter={(v: string) => diaMes(v)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              width={52}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(v: number) => v.toLocaleString('pt-BR')}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--popover-foreground)',
                fontSize: 13,
              }}
              labelFormatter={(v) => `Semana de ${diaMes(String(v))}`}
              formatter={(valor, nome) => [litros(Number(valor)), String(nome ?? '')]}
              itemSorter={(item) => -ultimaVisivel.findIndex((s) => s.chave === item.dataKey)}
            />
            <ReferenceLine y={teto} stroke="var(--foreground)" strokeOpacity={0.7} strokeDasharray="5 4" strokeWidth={1.5} ifOverflow="extendDomain" />
            {series.map((s, i) => (
              <Bar
                key={s.chave}
                dataKey={s.chave}
                name={s.nome}
                stackId="semana"
                fill={s.cor}
                stroke="var(--background)"
                strokeWidth={1}
                radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
