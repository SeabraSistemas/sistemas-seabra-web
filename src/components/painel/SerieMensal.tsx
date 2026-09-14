'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber } from '@/lib/painel/format';

export interface PontoMensal {
  /** "aaaamm" — mesma base compacta de diaDe/formatDia (format.ts), truncada ao mês. */
  mes: string;
  valor: number;
}

export interface SerieMensalDef {
  chave: string;
  nome: string;
  cor: string;
  pontos: PontoMensal[];
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function rotuloMes(aaaamm: string): string {
  const ano = aaaamm.slice(2, 4);
  const mes = Number(aaaamm.slice(4, 6));
  return `${MESES_ABREV[mes - 1] ?? '?'}/${ano}`;
}

/**
 * Preenche todo mês entre o primeiro e o último presente em QUALQUER série
 * com 0 — um mês sem venda vendeu zero (mesma regra de `buracos: 'zero'` de
 * src/components/adm/charts/SerieTemporal.tsx: para contagem e dinheiro, o
 * vazio É o dado, nunca deve virar um buraco no eixo).
 */
function eixoDeMeses(presentes: string[]): string[] {
  if (presentes.length === 0) return [];
  const ordenados = [...new Set(presentes)].sort();
  const min = ordenados[0];
  const max = ordenados[ordenados.length - 1];
  let ano = Number(min.slice(0, 4));
  let mes = Number(min.slice(4, 6));
  const anoMax = Number(max.slice(0, 4));
  const mesMax = Number(max.slice(4, 6));
  const out: string[] = [];
  while (ano < anoMax || (ano === anoMax && mes <= mesMax)) {
    out.push(`${ano}${String(mes).padStart(2, '0')}`);
    mes++;
    if (mes > 12) {
      mes = 1;
      ano++;
    }
  }
  return out;
}

/**
 * Barras agrupadas por mês, 1..n séries — usado no Financeiro (receita ×
 * perdas, cabeças vendidas × baixadas). Diferente de
 * src/components/adm/charts/SerieTemporal.tsx (área/linha, granularidade
 * dia/mês): aqui é sempre mês, e barra lado a lado lê melhor que linha
 * quando o que importa é comparar duas contagens mês a mês, não uma
 * tendência contínua.
 */
export function SerieMensal({ series, formatoValor }: { series: SerieMensalDef[]; formatoValor?: (v: number) => string }) {
  const fmt = formatoValor ?? formatNumber;

  const { linhas, comDados } = useMemo(() => {
    const validas = series.filter((s) => s.pontos.length > 0);
    const eixo = eixoDeMeses(validas.flatMap((s) => s.pontos.map((p) => p.mes)));
    const mapas = validas.map((s) => new Map(s.pontos.map((p) => [p.mes, p.valor])));
    const dados = eixo.map((mes) => {
      const linha: Record<string, string | number> = { mes };
      validas.forEach((s, i) => {
        linha[s.chave] = mapas[i].get(mes) ?? 0;
      });
      return linha;
    });
    return { linhas: dados, comDados: validas };
  }, [series]);

  if (comDados.length === 0 || linhas.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">Sem dados no período.</div>;
  }

  return (
    <div className="w-full tabular-nums">
      <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {comDados.map((s) => (
          <li key={s.chave} className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: s.cor }} aria-hidden />
            <span className="text-foreground">{s.nome}</span>
          </li>
        ))}
      </ul>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={linhas} margin={{ top: 8, right: 12, bottom: 4, left: 4 }} barGap={2}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="mes"
              tickFormatter={rotuloMes}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              width={56}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(v: number) => fmt(v)}
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
              labelFormatter={(v) => rotuloMes(String(v))}
              formatter={(valor, nome) => [fmt(Number(valor)), String(nome ?? '')]}
            />
            {comDados.map((s) => (
              <Bar key={s.chave} dataKey={s.chave} name={s.nome} fill={s.cor} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
