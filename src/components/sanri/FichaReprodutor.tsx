'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDia } from '@/lib/painel/format';
import {
  ROTULO_CONFIANCA,
  agruparPorReprodutor,
  comLeite,
  fixo,
  ehBaixa,
  mediaCorrigidaDe,
  noPlantel,
  resumir,
  type AnimalApp,
  type LactacaoApp,
} from '@/lib/sanri/reprodutores';
import { cn } from '@/lib/utils';
import { DataTable, type DataTableColumn } from './DataTable';
import { EstadoApp } from './EstadoApp';
import { Exportar, type CsvColumn } from './Exportar';
import { MetricCard, type MetricDef } from './MetricCard';
import { Selo } from './MontaComum';

interface Linha {
  chave: string;
  filha: AnimalApp;
  /** Posição entre as lactações encerradas da filha que estão na tela. */
  ordem: number;
  lactacao: LactacaoApp;
}

function num(n: number | null): string {
  return fixo(n, 2);
}

function rotulo(a: Pick<AnimalApp, 'nome' | 'numero'>, padrao = 'Sem nome'): string {
  return a.nome ?? a.numero ?? padrao;
}

const CLASSE_CONFIANCA = {
  DEFINITIVO: 'bg-sage-100 text-sage',
  INFERIDO: 'bg-paper-2 text-ink-1',
  ESTIMATIVA: 'bg-aviso-fundo text-aviso',
  OUTRA: 'bg-paper-2 text-ink-1',
} as const;

export function FichaReprodutor({
  reprodutor,
  pai,
  mae,
  animais,
  lactacoes,
  configurado,
  ok,
  carregadoEm,
}: {
  reprodutor: AnimalApp;
  pai: AnimalApp | null;
  mae: AnimalApp | null;
  /** O reprodutor e as filhas dele. */
  animais: AnimalApp[];
  /** Encerradas das filhas dele. */
  lactacoes: LactacaoApp[];
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const [soDefinitivas, setSoDefinitivas] = useState(false);

  const filhas = useMemo(
    () => agruparPorReprodutor(animais, lactacoes, { soDefinitivas }).find((g) => g.paiId === reprodutor.id)?.filhas ?? [],
    [animais, lactacoes, soDefinitivas, reprodutor.id],
  );
  const r = useMemo(() => resumir(filhas), [filhas]);
  const linhas = useMemo<Linha[]>(
    () => filhas.flatMap((f) => f.lactacoes.map((l, i) => ({ chave: `${f.animal.id}:${l.id}`, filha: f.animal, ordem: i + 1, lactacao: l }))),
    [filhas],
  );

  const metricas: MetricDef[] = [
    { id: 'filhas', label: 'Filhas com lactação', value: String(r.filhas), detalhe: r.baixas > 0 ? `${r.baixas} com baixa` : undefined },
    { id: 'corrigida', label: 'Média corrigida', value: `${num(r.mediaCorrigida)} L/dia`, detalhe: `bruta ${num(r.mediaBruta)} L/dia` },
    { id: 'acumulado', label: 'Acumulado médio', value: `${fixo(r.acumuladoMedio, 1)} L`, detalhe: `${fixo(r.diasMedios, 0)} dias em média` },
    { id: 'partos', label: 'Partos (média das filhas)', value: fixo(r.partosMedios, 1) },
  ];

  const colunas: DataTableColumn<Linha>[] = [
    {
      key: 'filha',
      header: 'Filha',
      cell: (l) => (
        <span className="flex flex-col leading-tight">
          <span className="flex items-center gap-2 font-semibold text-ink">
            {rotulo(l.filha)}
            {ehBaixa(l.filha) && <Selo className="bg-erro-fundo text-erro">{l.filha.categoria}</Selo>}
          </span>
          {l.filha.nome && l.filha.numero && <span className="text-xs text-ink-2">{l.filha.numero}</span>}
        </span>
      ),
      sortValue: (l) => rotulo(l.filha),
    },
    { key: 'ordem', header: 'Lact.', cell: (l) => `${l.ordem}ª`, sortValue: (l) => l.ordem, className: 'text-right' },
    { key: 'inicio', header: 'Início', cell: (l) => formatDia(l.lactacao.inicio), sortValue: (l) => l.lactacao.inicio },
    { key: 'fim', header: 'Fim', cell: (l) => formatDia(l.lactacao.fim), sortValue: (l) => l.lactacao.fim },
    { key: 'dias', header: 'Dias', cell: (l) => fixo(l.lactacao.dias, 0), sortValue: (l) => l.lactacao.dias, className: 'text-right' },
    {
      key: 'total',
      header: 'Total (L)',
      cell: (l) => (comLeite(l.lactacao) ? fixo(l.lactacao.total, 1) : <span className="text-xs text-ink-2">sem leite</span>),
      sortValue: (l) => l.lactacao.total,
      className: 'text-right',
    },
    { key: 'bruta', header: 'Média (L/dia)', cell: (l) => (comLeite(l.lactacao) ? num(l.lactacao.media) : '—'), sortValue: (l) => l.lactacao.media, className: 'text-right' },
    {
      key: 'corrigida',
      header: 'Corrigida (L/dia)',
      cell: (l) => (comLeite(l.lactacao) ? <span className="font-semibold text-ink">{num(mediaCorrigidaDe(l.lactacao))}</span> : '—'),
      sortValue: (l) => (comLeite(l.lactacao) ? mediaCorrigidaDe(l.lactacao) : null),
      className: 'text-right',
    },
    {
      key: 'origem',
      header: 'Origem',
      cell: (l) => <Selo className={CLASSE_CONFIANCA[l.lactacao.confianca]}>{ROTULO_CONFIANCA[l.lactacao.confianca]}</Selo>,
      sortValue: (l) => l.lactacao.confianca,
    },
  ];

  const csv: CsvColumn<Linha>[] = [
    { key: 'numero', header: 'Nº da filha', value: (l) => l.filha.numero ?? '' },
    { key: 'nome', header: 'Nome da filha', value: (l) => l.filha.nome ?? '' },
    { key: 'situacao', header: 'Categoria atual', value: (l) => l.filha.categoria ?? '' },
    { key: 'ordem', header: 'Lactação (posição)', value: (l) => String(l.ordem) },
    { key: 'inicio', header: 'Início', value: (l) => formatDia(l.lactacao.inicio) },
    { key: 'fim', header: 'Fim', value: (l) => formatDia(l.lactacao.fim) },
    { key: 'dias', header: 'Dias', value: (l) => fixo(l.lactacao.dias, 0) },
    { key: 'total', header: 'Total (L)', value: (l) => fixo(l.lactacao.total, 1) },
    { key: 'bruta', header: 'Média (L/dia)', value: (l) => num(l.lactacao.media) },
    { key: 'corrigida', header: 'Média corrigida (L/dia)', value: (l) => (comLeite(l.lactacao) ? num(mediaCorrigidaDe(l.lactacao)) : '') },
    { key: 'origem', header: 'Origem', value: (l) => ROTULO_CONFIANCA[l.lactacao.confianca] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div>
        <Link href="/sanri/reproducao/reprodutores" className="text-sm font-medium text-bay underline underline-offset-2">
          ← Reprodutores
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-ink">{rotulo(reprodutor, 'Sem nome cadastrado')}</h2>
          {noPlantel(reprodutor) && <Selo className="bg-sage-100 text-sage">Plantel</Selo>}
        </div>
        <p className="mt-1 text-sm text-ink-2">
          {reprodutor.numero && `${reprodutor.numero} · `}
          Pai: {pai ? `${rotulo(pai)}${pai.nome && pai.numero ? ` (${pai.numero})` : ''}` : 'não identificado'} · Mãe:{' '}
          {mae ? `${rotulo(mae)}${mae.nome && mae.numero ? ` (${mae.numero})` : ''}` : 'não identificada'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricas.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      <p className="text-sm text-ink-2">
        {r.lactacoes} {r.lactacoes === 1 ? 'lactação encerrada' : 'lactações encerradas'}: {r.definitivas} definitivas, {r.inferidas} inferidas, {r.estimadas} estimadas
        {r.semLeite > 0 ? ` · ${r.semLeite} sem leite registrado (fora das médias)` : ''}.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          aria-pressed={soDefinitivas}
          onClick={() => setSoDefinitivas(!soDefinitivas)}
          className={cn(
            'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
            soDefinitivas ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
          )}
        >
          Só lactações definitivas
        </button>
        <Exportar columns={csv} rows={linhas} filename={`sanri-reprodutor-${reprodutor.numero ?? reprodutor.id}`} />
      </div>

      <DataTable columns={colunas} rows={linhas} rowKey={(l) => l.chave} pageSize={40} />
      <p className="text-xs text-ink-2">“Lact.” é a posição entre as lactações encerradas da filha que aparecem aqui — não a ordem de parto real quando ela já tinha parido antes do sistema.</p>
    </div>
  );
}
