'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { agruparPorReprodutor, fixo, ranking, resumir, rotuloReprodutor, type AnimalApp, type LactacaoApp, type LinhaReprodutor } from '@/lib/sanri/reprodutores';
import { cn } from '@/lib/utils';
import { PainelCampo } from './Controles';
import { DataTable, type DataTableColumn } from './DataTable';
import { EstadoApp } from './EstadoApp';
import { Exportar, type CsvColumn } from './Exportar';
import { MetricCard, type MetricDef } from './MetricCard';
import { Selo } from './MontaComum';

type Escopo = 'todos' | 'plantel';

const MINIMOS = [
  { valor: 1, rotulo: 'Todos' },
  { valor: 3, rotulo: '3+ filhas' },
  { valor: 5, rotulo: '5+ filhas' },
];

function Pilula({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
        ativo ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function ldia(n: number | null): string {
  return fixo(n, 2);
}

/** Pai e mãe do reprodutor numa linha, do jeito que o relatório em PDF mostrava. */
function genealogia(r: LinhaReprodutor): string {
  const p = r.paiNome ?? r.paiNumero;
  const m = r.maeNome ?? r.maeNumero;
  if (!p && !m) return '—';
  return `${p ?? 'não identificado'} × ${m ?? 'não identificada'}`;
}

export function ReprodutoresView({
  animais,
  lactacoes,
  configurado,
  ok,
  carregadoEm,
}: {
  animais: AnimalApp[];
  lactacoes: LactacaoApp[];
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const [soDefinitivas, setSoDefinitivas] = useState(false);
  const [escopo, setEscopo] = useState<Escopo>('todos');
  const [minimo, setMinimo] = useState(1);
  const [busca, setBusca] = useState('');

  const todas = useMemo(() => ranking(animais, lactacoes, { soDefinitivas }), [animais, lactacoes, soDefinitivas]);
  const geral = useMemo(
    () => resumir(agruparPorReprodutor(animais, lactacoes, { soDefinitivas }).flatMap((g) => g.filhas)),
    [animais, lactacoes, soDefinitivas],
  );

  const linhas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return todas.filter(
      (r) =>
        (escopo === 'todos' || r.noPlantel) &&
        r.resumo.filhas >= minimo &&
        (!q || `${r.nome ?? ''} ${r.numero ?? ''}`.toLowerCase().includes(q)),
    );
  }, [todas, escopo, minimo, busca]);

  const metricas: MetricDef[] = [
    { id: 'reprodutores', label: 'Reprodutores', value: String(linhas.length), detalhe: linhas.length !== todas.length ? `de ${todas.length} com filha encerrada` : 'com filha com lactação encerrada' },
    { id: 'filhas', label: 'Filhas', value: String(geral.filhas), detalhe: `${geral.baixas} com baixa` },
    { id: 'lactacoes', label: 'Lactações', value: String(geral.lactacoes), detalhe: geral.semLeite > 0 ? `encerradas · ${geral.semLeite} sem leite` : 'encerradas' },
    { id: 'media', label: 'Média corrigida geral', value: `${ldia(geral.mediaCorrigida)} L/dia`, detalhe: `bruta ${ldia(geral.mediaBruta)}` },
  ];

  const colunas: DataTableColumn<LinhaReprodutor>[] = [
    {
      key: 'reprodutor',
      header: 'Reprodutor',
      cell: (r) => (
        <Link href={`/sanri/lactacoes/${r.paiId}`} className="flex flex-col leading-tight hover:underline">
          <span className="flex items-center gap-2 font-semibold text-ink">
            {rotuloReprodutor(r)}
            {r.noPlantel && <Selo className="bg-sage-100 text-sage">Plantel</Selo>}
          </span>
          {r.nome && r.numero && <span className="text-xs text-ink-2">{r.numero}</span>}
          <span className="max-w-64 truncate text-xs font-normal text-ink-2" title={`Pai × mãe: ${genealogia(r)}`}>
            {genealogia(r)}
          </span>
          {/* No celular a tabela rola de lado e este é o número que interessa: repete aqui. */}
          <span className="mt-0.5 text-xs font-semibold text-ink sm:hidden">
            {ldia(r.resumo.mediaCorrigida)} L/dia · {r.resumo.filhas} {r.resumo.filhas === 1 ? 'filha' : 'filhas'}
          </span>
        </Link>
      ),
      sortValue: (r) => rotuloReprodutor(r),
    },
    { key: 'filhas', header: 'Filhas', cell: (r) => r.resumo.filhas, sortValue: (r) => r.resumo.filhas, className: 'text-right' },
    {
      key: 'lactacoes',
      header: 'Lactações',
      cell: (r) => (
        <span className="flex flex-col items-end leading-tight">
          <span>{r.resumo.comLeite}</span>
          {r.resumo.semLeite > 0 && <span className="text-xs text-ink-2">+{r.resumo.semLeite} sem leite</span>}
        </span>
      ),
      sortValue: (r) => r.resumo.comLeite,
      className: 'text-right',
    },
    {
      key: 'corrigida',
      header: 'Média corrigida (L/dia)',
      cell: (r) => (
        <span className="flex flex-col items-end leading-tight">
          <span className="font-semibold text-ink">{ldia(r.resumo.mediaCorrigida)}</span>
          <span className="text-xs text-ink-2">bruta {ldia(r.resumo.mediaBruta)}</span>
        </span>
      ),
      sortValue: (r) => r.resumo.mediaCorrigida,
      className: 'text-right',
    },
    { key: 'acumulado', header: 'Acumulado (L)', cell: (r) => fixo(r.resumo.acumuladoMedio, 1), sortValue: (r) => r.resumo.acumuladoMedio, className: 'text-right' },
    { key: 'dias', header: 'Dias', cell: (r) => fixo(r.resumo.diasMedios, 0), sortValue: (r) => r.resumo.diasMedios, className: 'text-right' },
    { key: 'partos', header: 'Partos', cell: (r) => fixo(r.resumo.partosMedios, 1), sortValue: (r) => r.resumo.partosMedios, className: 'text-right' },
    {
      key: 'baixas',
      header: 'Com baixa',
      cell: (r) => (
        <span className="flex flex-col items-end leading-tight">
          <span>{r.resumo.baixas}</span>
          <span className="text-xs text-ink-2">{Math.round((r.resumo.baixas / r.resumo.filhas) * 100)}%</span>
        </span>
      ),
      sortValue: (r) => r.resumo.baixas,
      className: 'text-right',
    },
  ];

  const csv: CsvColumn<LinhaReprodutor>[] = [
    { key: 'numero', header: 'Nº do reprodutor', value: (r) => r.numero ?? '' },
    { key: 'nome', header: 'Nome', value: (r) => r.nome ?? '' },
    { key: 'plantel', header: 'No plantel', value: (r) => (r.noPlantel ? 'sim' : 'não') },
    { key: 'pai', header: 'Pai', value: (r) => [r.paiNome, r.paiNumero].filter(Boolean).join(' ') },
    { key: 'mae', header: 'Mãe', value: (r) => [r.maeNome, r.maeNumero].filter(Boolean).join(' ') },
    { key: 'filhas', header: 'Filhas com lactação encerrada', value: (r) => String(r.resumo.filhas) },
    { key: 'lact', header: 'Lactações com leite', value: (r) => String(r.resumo.comLeite) },
    { key: 'semleite', header: 'Lactações sem leite', value: (r) => String(r.resumo.semLeite) },
    { key: 'corrigida', header: 'Média corrigida (L/dia)', value: (r) => ldia(r.resumo.mediaCorrigida) },
    { key: 'bruta', header: 'Média bruta (L/dia)', value: (r) => ldia(r.resumo.mediaBruta) },
    { key: 'acumulado', header: 'Acumulado médio (L)', value: (r) => fixo(r.resumo.acumuladoMedio, 1) },
    { key: 'dias', header: 'Dias médios', value: (r) => fixo(r.resumo.diasMedios, 0) },
    { key: 'partos', header: 'Partos (média)', value: (r) => fixo(r.resumo.partosMedios, 1) },
    { key: 'baixas', header: 'Filhas com baixa', value: (r) => String(r.resumo.baixas) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div>
        <p className="t-mono">Lactações</p>
        <h2 className="mt-1 text-lg font-semibold text-ink">Por reprodutor</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Lactações encerradas no app, agrupadas pelo reprodutor (pai) das filhas. O painel só lê.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricas.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Filtros" className="flex flex-wrap items-center gap-1.5">
          <Pilula ativo={escopo === 'todos'} onClick={() => setEscopo('todos')}>
            Todos os reprodutores
          </Pilula>
          <Pilula ativo={escopo === 'plantel'} onClick={() => setEscopo('plantel')}>
            Só o plantel atual
          </Pilula>
          <span className="mx-1 hidden h-5 w-px bg-rule sm:block" aria-hidden />
          {MINIMOS.map((m) => (
            <Pilula key={m.valor} ativo={minimo === m.valor} onClick={() => setMinimo(m.valor)}>
              {m.rotulo}
            </Pilula>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-rule sm:block" aria-hidden />
          <Pilula ativo={soDefinitivas} onClick={() => setSoDefinitivas(!soDefinitivas)}>
            Só lactações definitivas
          </Pilula>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PainelCampo
            type="search"
            placeholder="Buscar por nome ou número"
            aria-label="Buscar reprodutor"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-xs"
          />
          <Exportar columns={csv} rows={linhas} filename="sanri-reprodutores" />
        </div>
      </div>

      <DataTable columns={colunas} rows={linhas} rowKey={(r) => String(r.paiId)} pageSize={30} />

      <section className="rounded-card border border-rule bg-paper p-4 text-sm text-ink-1 shadow-card sm:p-5">
        <h3 className="text-base font-semibold text-ink">Como é calculado</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-ink-2">
          <li>
            <span className="font-medium text-ink-1">Filha:</span> fêmea do rebanho com o reprodutor como pai. Entra quem tem ao menos uma lactação encerrada; todas as lactações encerradas contam.
          </li>
          <li>
            <span className="font-medium text-ink-1">Média corrigida:</span> a média diária da lactação já ajustada pela ordem de parto (1ª ×1,22 · 2ª ×1,10 · 3ª em diante ×1,00), calculada pelo app ao encerrar. Cada filha pesa igual: primeiro a média das lactações dela, depois a média entre as filhas.
          </li>
          <li>
            <span className="font-medium text-ink-1">Sem leite:</span> lactação encerrada sem leite registrado (total zerado) fica fora das médias e aparece contada — zero de importação não é produção zero.
          </li>
          <li>
            <span className="font-medium text-ink-1">Acumulado e dias:</span> média direta sobre as lactações com leite. <span className="font-medium text-ink-1">Partos:</span> média dos partos das filhas.
          </li>
          <li>
            <span className="font-medium text-ink-1">Com baixa:</span> filhas vendidas, descartadas ou mortas. <span className="font-medium text-ink-1">Definitiva:</span> lactação fechada com dado do app; inferida e estimada vêm da reconstrução do histórico.
          </li>
          <li>Poucas filhas dão média instável — use “3+ filhas” ou “5+ filhas” para comparar.</li>
        </ul>
      </section>
    </div>
  );
}
