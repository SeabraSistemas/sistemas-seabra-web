'use client';

import { useMemo, useState } from 'react';
import { formatDia, formatNumber, somarDias } from '@/lib/painel/format';
import { calcularProducao, type DiaProducao, type Leitura, type Saida, type StatusDia } from '@/lib/sanri/producao';
import { cn } from '@/lib/utils';
import { DataTable, type DataTableColumn } from './DataTable';
import { EstadoPlanilha } from './EstadoPlanilha';
import { Exportar, type CsvColumn } from './Exportar';
import { MetricCard, type MetricDef } from './MetricCard';
import { ProducaoChart } from './ProducaoChart';

const PERIODOS = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
  { dias: 0, label: 'Tudo' },
];

const STATUS: Record<StatusDia, string> = {
  ok: '',
  aguardando: 'Aguardando régua do dia seguinte',
  'sem-leitura': 'Sem régua neste dia',
  'regua-invalida': 'Régua sem litros na tabela',
};

function litros(n: number | null): string {
  return n == null ? '—' : `${formatNumber(n)} L`;
}

function saidaOuTraco(n: number): string {
  return n === 0 ? '—' : formatNumber(n);
}

const COLUNAS: DataTableColumn<DiaProducao>[] = [
  { key: 'data', header: 'Ordenha', cell: (d) => formatDia(d.data), sortValue: (d) => d.data },
  { key: 'animais', header: 'Cabras', cell: (d) => formatNumber(d.animais), sortValue: (d) => d.animais, className: 'text-right' },
  { key: 'inicio', header: 'Tanque (manhã)', cell: (d) => litros(d.volumeInicio), sortValue: (d) => d.volumeInicio, className: 'text-right' },
  { key: 'fim', header: 'Tanque (dia seguinte)', cell: (d) => litros(d.volumeFim), sortValue: (d) => d.volumeFim, className: 'text-right' },
  { key: 'cab', header: 'Cabritinhos', cell: (d) => saidaOuTraco(d.saidas.cabritinhos), sortValue: (d) => d.saidas.cabritinhos, className: 'text-right' },
  { key: 'lat', header: 'Laticínio', cell: (d) => saidaOuTraco(d.saidas.laticinio), sortValue: (d) => d.saidas.laticinio, className: 'text-right' },
  { key: 'venda', header: 'Venda', cell: (d) => saidaOuTraco(d.saidas.venda), sortValue: (d) => d.saidas.venda, className: 'text-right' },
  {
    key: 'producao',
    header: 'Produção',
    cell: (d) =>
      d.producao != null ? (
        <span className={cn('font-semibold', d.producao < 0 && 'text-erro')}>{litros(d.producao)}</span>
      ) : (
        // Quebra em 2 linhas: numa linha só, "Aguardando régua do dia seguinte" empurra a última coluna pra fora da tela.
        <span className="inline-block max-w-36 whitespace-normal text-xs leading-snug text-ink-2">{STATUS[d.status]}</span>
      ),
    sortValue: (d) => d.producao,
    className: 'text-right',
  },
  { key: 'media', header: 'L/cabra', cell: (d) => (d.media == null ? '—' : formatNumber(d.media)), sortValue: (d) => d.media, className: 'text-right' },
];

const CSV: CsvColumn<DiaProducao>[] = [
  { key: 'data', header: 'Data da ordenha', value: (d) => formatDia(d.data) },
  { key: 'animais', header: 'Cabras', value: (d) => (d.animais == null ? '' : String(d.animais)) },
  { key: 'inicio', header: 'Tanque manhã (L)', value: (d) => (d.volumeInicio == null ? '' : formatNumber(d.volumeInicio)) },
  { key: 'fim', header: 'Tanque dia seguinte (L)', value: (d) => (d.volumeFim == null ? '' : formatNumber(d.volumeFim)) },
  { key: 'cab', header: 'Cabritinhos (L)', value: (d) => formatNumber(d.saidas.cabritinhos) },
  { key: 'lat', header: 'Laticínio (L)', value: (d) => formatNumber(d.saidas.laticinio) },
  { key: 'venda', header: 'Venda (L)', value: (d) => formatNumber(d.saidas.venda) },
  { key: 'producao', header: 'Produção (L)', value: (d) => (d.producao == null ? '' : formatNumber(d.producao)) },
  { key: 'media', header: 'L por cabra', value: (d) => (d.media == null ? '' : formatNumber(d.media)) },
];

export function ProducaoView({
  leituras,
  saidas,
  hoje,
  configurado,
  ok,
  carregadoEm,
}: {
  leituras: Leitura[];
  saidas: Saida[];
  hoje: number;
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const [periodo, setPeriodo] = useState(30);
  const todos = useMemo(() => calcularProducao(leituras, saidas), [leituras, saidas]);
  const dias = useMemo(() => {
    if (periodo === 0) return todos;
    const inicio = somarDias(hoje, -(periodo - 1))!;
    return todos.filter((d) => d.data >= inicio);
  }, [todos, periodo, hoje]);

  const metricas = useMemo<MetricDef[]>(() => {
    const calculados = dias.filter((d) => d.producao != null);
    const ultimo = calculados[0];
    const somaProd = calculados.reduce((s, d) => s + d.producao!, 0);
    const comMedia = calculados.filter((d) => d.media != null);
    const somaSaidas = { cab: 0, lat: 0, venda: 0 };
    for (const d of dias) {
      somaSaidas.cab += d.saidas.cabritinhos;
      somaSaidas.lat += d.saidas.laticinio;
      somaSaidas.venda += d.saidas.venda;
    }
    return [
      {
        id: 'ultima',
        label: 'Última produção',
        value: ultimo ? litros(ultimo.producao) : '—',
        detalhe: ultimo ? `ordenha de ${formatDia(ultimo.data)}` : 'precisa da régua de 2 dias seguidos',
        tom: ultimo && ultimo.producao! < 0 ? 'ruim' : 'neutro',
      },
      {
        id: 'media-cabra',
        label: 'Litros por cabra',
        value: ultimo?.media != null ? formatNumber(ultimo.media) : '—',
        detalhe: comMedia.length > 0 ? `média do período ${formatNumber(comMedia.reduce((s, d) => s + d.media!, 0) / comMedia.length)}` : undefined,
      },
      {
        id: 'media-dia',
        label: 'Média por dia',
        value: calculados.length > 0 ? litros(somaProd / calculados.length) : '—',
        detalhe: `${calculados.length} ${calculados.length === 1 ? 'dia calculado' : 'dias calculados'}`,
      },
      {
        id: 'saidas',
        label: 'Saídas no período',
        value: litros(somaSaidas.cab + somaSaidas.lat + somaSaidas.venda),
        detalhe: `Cab ${formatNumber(somaSaidas.cab)} · Lat ${formatNumber(somaSaidas.lat)} · Venda ${formatNumber(somaSaidas.venda)}`,
      },
    ];
  }, [dias]);

  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div role="group" aria-label="Período" className="flex flex-wrap gap-1.5">
        {PERIODOS.map((p) => (
          <button
            key={p.dias}
            type="button"
            aria-pressed={periodo === p.dias}
            onClick={() => setPeriodo(p.dias)}
            className={cn(
              'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
              periodo === p.dias ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricas.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      <section className="rounded-card border border-rule bg-paper p-4 shadow-card sm:p-5">
        <h2 className="text-base font-semibold text-ink">Produção por dia de ordenha (litros)</h2>
        <p className="mb-4 mt-1 text-sm text-ink-2">
          Régua do dia seguinte − régua do dia + saídas do dia. O dia de hoje só fecha quando a régua de amanhã for lançada.
        </p>
        <ProducaoChart dias={dias} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-ink">Dia a dia</h2>
          <Exportar columns={CSV} rows={dias} filename="sanri-producao" />
        </div>
        <DataTable columns={COLUNAS} rows={dias} rowKey={(d) => String(d.data)} pageSize={31} />
      </section>
    </div>
  );
}
