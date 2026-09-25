'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { diasEntre, formatDia, formatNumber } from '@/lib/painel/format';
import type { Acompanhamento, Animal, Estacao, Indicadores, Situacao } from '@/lib/sanri/monta';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, botao } from './Controles';
import { DataTable, type DataTableColumn } from './DataTable';
import { EstadoPlanilha } from './EstadoPlanilha';
import { Exportar, type CsvColumn } from './Exportar';
import { MetricCard, type MetricDef } from './MetricCard';
import { NomeAnimal, SITUACAO, SeloEstacao, SeloSituacao, pct, periodoEstacao, tituloEstacao } from './MontaComum';

type Filtro = 'todas' | 'diagnosticar' | Situacao | 'repasse';

const FILTROS: { valor: Filtro; rotulo: string; teste: (l: Acompanhamento) => boolean }[] = [
  { valor: 'todas', rotulo: 'Todas', teste: () => true },
  { valor: 'diagnosticar', rotulo: 'A diagnosticar', teste: (l) => l.situacao === 'aguardando-us' || l.situacao === 'us-atrasado' },
  { valor: 'gestante', rotulo: 'Gestantes', teste: (l) => l.situacao === 'gestante' },
  { valor: 'vazia', rotulo: 'Vazias', teste: (l) => l.situacao === 'vazia' },
  { valor: 'confirmar', rotulo: 'Reconfirmar', teste: (l) => l.situacao === 'confirmar' },
  { valor: 'pariu', rotulo: 'Paridas', teste: (l) => l.situacao === 'pariu' },
  { valor: 'repasse', rotulo: 'Repasse', teste: (l) => l.coberturas.length >= 2 },
  { valor: 'sem-cobertura', rotulo: 'Sem cobertura', teste: (l) => l.situacao === 'sem-cobertura' },
];

/** Ordem da lista: o que pede ação primeiro. */
const PRIORIDADE: Record<Situacao, number> = {
  'us-atrasado': 0,
  'sem-cobertura': 1,
  confirmar: 2,
  'aguardando-us': 3,
  gestante: 4,
  vazia: 5,
  pariu: 6,
};

function curto(d: number | null): string {
  return d == null ? '—' : formatDia(d).slice(0, 5);
}

export function EstacaoDetalhe({
  estacao,
  ativa,
  linhas,
  ind,
  animais,
  novas,
  hoje,
  configurado,
  ok,
  carregadoEm,
}: {
  estacao: Estacao;
  ativa: boolean;
  linhas: Acompanhamento[];
  ind: Indicadores;
  animais: Animal[];
  /** Coberturas do reprodutor no período, lançadas no app, de fêmeas que não estão na estação. */
  novas: number;
  hoje: number;
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
}) {
  const router = useRouter();
  const porChave = useMemo(() => new Map(animais.map((a) => [a.chave, a])), [animais]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ordenadas = useMemo(
    () => [...linhas].sort((a, b) => PRIORIDADE[a.situacao] - PRIORIDADE[b.situacao] || (a.usPrevisto ?? 0) - (b.usPrevisto ?? 0)),
    [linhas],
  );
  const testeAtual = FILTROS.find((f) => f.valor === filtro)!.teste;
  const visiveis = ordenadas.filter(testeAtual);

  async function acao(nome: 'finalizar' | 'reabrir' | 'excluir', confirmacao: string) {
    if (!window.confirm(confirmacao)) return;
    setOcupado(true);
    setErro(null);
    try {
      const res = await fetch('/sanri/api/estacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: nome, estacaoId: estacao.id }),
      });
      if (!res.ok) {
        const { erro: msg } = (await res.json().catch(() => ({}))) as { erro?: string };
        setErro(msg ? `Não foi possível: ${msg}.` : 'Não foi possível — tente de novo.');
        return;
      }
      if (nome === 'excluir') router.push('/sanri/reproducao');
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  const metricas: MetricDef[] = [
    { id: 'femeas', label: 'Fêmeas', value: String(ind.femeas), detalhe: ind.repasses > 0 ? `${ind.repasses} com repasse` : undefined },
    { id: 'prenhez', label: 'Prenhez', value: pct(ind.taxaPrenhez), detalhe: `${ind.prenhes} de ${ind.cobertas} cobertas` },
    {
      id: 'gestantes',
      label: 'Gestantes',
      value: String(ind.gestantes),
      detalhe:
        [ind.partoAtrasado > 0 ? `${ind.partoAtrasado} com parto atrasado` : null, ind.confirmar > 0 ? `${ind.confirmar} a reconfirmar` : null]
          .filter(Boolean)
          .join(' · ') || undefined,
    },
    { id: 'vazias', label: 'Vazias', value: String(ind.vazias), tom: ind.vazias > 0 ? 'ruim' : 'neutro' },
    {
      id: 'aguardando',
      label: 'Aguardando US',
      value: String(ind.aguardandoDg),
      detalhe: ind.usAtrasado > 0 ? `${ind.usAtrasado} com US atrasado` : undefined,
      tom: ind.usAtrasado > 0 ? 'ruim' : 'neutro',
    },
    { id: 'paridas', label: 'Paridas', value: String(ind.paridas), detalhe: ind.prenhes > 0 ? `de ${ind.prenhes} prenhes` : undefined },
    {
      id: 'crias',
      label: 'Crias',
      value: String(ind.crias),
      detalhe: ind.crias > 0 ? `${ind.criasMachos} M · ${ind.criasFemeas} F · prolificidade ${formatNumber(ind.prolificidade)}` : undefined,
    },
    { id: 'parto', label: 'Próximo parto', value: ind.proximoParto ? formatDia(ind.proximoParto) : '—' },
  ];

  const colunas: DataTableColumn<Acompanhamento>[] = [
    { key: 'femea', header: 'Fêmea', cell: (l) => <NomeAnimal animal={porChave.get(l.femea)} chave={l.femea} />, sortValue: (l) => porChave.get(l.femea)?.nome ?? l.femea },
    { key: 'baia', header: 'Baia', cell: (l) => porChave.get(l.femea)?.baia ?? '—', sortValue: (l) => porChave.get(l.femea)?.baia ?? '' },
    {
      key: 'cobertura',
      header: 'Cobertura',
      cell: (l) => (l.coberturas.length === 0 ? '—' : l.coberturas.map(curto).join(' · ')),
      sortValue: (l) => l.coberturas[l.coberturas.length - 1] ?? null,
    },
    {
      key: 'us',
      header: 'US previsto',
      cell: (l) => {
        const atraso = l.situacao === 'us-atrasado' ? diasEntre(l.usPrevisto, hoje) : null;
        return (
          <span className={cn(atraso != null && 'font-semibold text-aviso')}>
            {curto(l.usPrevisto)}
            {atraso != null && <span className="block text-xs">atrasado {atraso} d</span>}
          </span>
        );
      },
      sortValue: (l) => l.usPrevisto,
    },
    {
      key: 'dg',
      header: 'DG',
      cell: (l) =>
        l.dg ? (
          <span className="flex flex-col leading-tight">
            <span>{l.dg.texto}</span>
            <span className="text-xs text-ink-2">
              {curto(l.dg.data)}
              {l.dg.diasGestacao != null && ` · ${l.dg.diasGestacao} d`}
            </span>
          </span>
        ) : (
          '—'
        ),
      sortValue: (l) => l.dg?.data ?? null,
    },
    {
      key: 'previsto',
      header: 'Parto previsto',
      cell: (l) => {
        if (l.partoPrevisto == null) return '—';
        // Sem DG medido é janela (1ª cobertura + 150 até fim da estação + 150); atraso só depois da janela.
        const janela = l.partoPrevistoAte != null && l.partoPrevistoAte !== l.partoPrevisto;
        const atraso = diasEntre(l.partoPrevistoAte ?? l.partoPrevisto, hoje) ?? 0;
        return (
          <span className={cn('flex flex-col leading-tight', atraso > 0 && 'font-semibold text-aviso')}>
            <span>{janela ? `${curto(l.partoPrevisto)} a ${curto(l.partoPrevistoAte)}` : formatDia(l.partoPrevisto)}</span>
            {atraso > 0 && <span className="text-xs">atrasado {atraso} d</span>}
          </span>
        );
      },
      sortValue: (l) => l.partoPrevisto,
    },
    {
      key: 'parto',
      header: 'Parto',
      cell: (l) => {
        if (!l.parto) return '—';
        const m = l.parto.crias.filter((c) => c.sexo === 'macho').length;
        const f = l.parto.crias.filter((c) => c.sexo === 'femea').length;
        return (
          <span className="flex flex-col leading-tight">
            <span>{formatDia(l.parto.data)}</span>
            <span className="text-xs text-ink-2">
              {l.parto.crias.length} {l.parto.crias.length === 1 ? 'cria' : 'crias'} · {m} M · {f} F
            </span>
            {!l.parto.paiConfere && <span className="text-xs font-semibold text-aviso">pai lançado é outro</span>}
          </span>
        );
      },
      sortValue: (l) => l.parto?.data ?? null,
    },
    {
      key: 'situacao',
      header: 'Situação',
      cell: (l) => (
        <span className="flex flex-col items-start gap-1">
          <SeloSituacao situacao={l.situacao} />
          {l.coberturaForaDaEstacao && <span className="max-w-40 whitespace-normal text-xs leading-snug text-aviso">DG mede cobertura fora do período</span>}
        </span>
      ),
      sortValue: (l) => PRIORIDADE[l.situacao],
    },
  ];

  const csv: CsvColumn<Acompanhamento>[] = [
    { key: 'numero', header: 'Nº', value: (l) => porChave.get(l.femea)?.numero ?? l.femea.replace(/^[nc]:/, '') },
    { key: 'nome', header: 'Nome', value: (l) => porChave.get(l.femea)?.nome ?? '' },
    { key: 'baia', header: 'Baia', value: (l) => porChave.get(l.femea)?.baia ?? '' },
    { key: 'cobertura', header: 'Coberturas', value: (l) => l.coberturas.map(formatDia).join(' / ') },
    { key: 'us', header: 'US previsto', value: (l) => (l.usPrevisto ? formatDia(l.usPrevisto) : '') },
    { key: 'dg', header: 'DG', value: (l) => (l.dg ? `${l.dg.texto} (${formatDia(l.dg.data)})` : '') },
    { key: 'previsto', header: 'Parto previsto (de)', value: (l) => (l.partoPrevisto ? formatDia(l.partoPrevisto) : '') },
    { key: 'previstoAte', header: 'Parto previsto (até)', value: (l) => (l.partoPrevistoAte ? formatDia(l.partoPrevistoAte) : '') },
    { key: 'parto', header: 'Parto', value: (l) => (l.parto ? formatDia(l.parto.data) : '') },
    { key: 'crias', header: 'Crias', value: (l) => (l.parto ? String(l.parto.crias.length) : '') },
    { key: 'situacao', header: 'Situação', value: (l) => SITUACAO[l.situacao].rotulo },
  ];

  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/sanri/reproducao" className="text-sm font-medium text-bay underline underline-offset-2">
            ← Monta livre
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-ink">{tituloEstacao(estacao)}</h2>
            <SeloEstacao ativa={ativa} />
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {estacao.reprodutorNumero && `${estacao.reprodutorNumero} · `}
            {periodoEstacao(estacao)}
          </p>
          <p className="text-xs text-ink-2">
            Formada em {formatDia(estacao.criadaEm)}
            {estacao.alteradaPor ? ` · última alteração ${formatDia(estacao.alteradaEm)} por ${estacao.alteradaPor}` : ''}
          </p>
          {estacao.obs && <p className="mt-1 text-sm text-ink-1">{estacao.obs}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/sanri/reproducao/${estacao.id}/editar`} className={botao.pequeno}>
            Editar
          </Link>
          {estacao.finalizadaEm == null ? (
            <PainelBotao variante="pequeno" disabled={ocupado} onClick={() => acao('finalizar', 'Finalizar a estação? O reprodutor saiu hoje — coberturas depois de hoje não contam.')}>
              Finalizar
            </PainelBotao>
          ) : (
            <PainelBotao variante="pequeno" disabled={ocupado} onClick={() => acao('reabrir', 'Reabrir a estação?')}>
              Reabrir
            </PainelBotao>
          )}
          <PainelBotao variante="perigo" disabled={ocupado} onClick={() => acao('excluir', 'Excluir esta estação? Só a view some — nada no app é apagado.')}>
            Excluir
          </PainelBotao>
        </div>
      </div>

      {erro && <Aviso tom="erro">{erro}</Aviso>}
      {novas > 0 && (
        <Aviso tom="aviso">
          {novas} {novas === 1 ? 'cobertura nova lançada' : 'coberturas novas lançadas'} no app com este reprodutor no período, de fêmeas fora da estação.{' '}
          <Link href={`/sanri/reproducao/${estacao.id}/editar`} className="font-semibold underline underline-offset-2">
            Revisar e incluir
          </Link>
        </Aviso>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricas.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      <div role="group" aria-label="Situação" className="flex flex-wrap gap-1.5">
        {FILTROS.filter((f) => f.valor === 'todas' || linhas.some(f.teste)).map((f) => (
          <button
            key={f.valor}
            type="button"
            aria-pressed={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={cn(
              'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
              filtro === f.valor ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {f.rotulo} <span className="tabular-nums opacity-70">{linhas.filter(f.teste).length}</span>
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">Fêmeas da estação</h3>
          <Exportar columns={csv} rows={visiveis} filename={`estacao-${estacao.reprodutorNumero ?? estacao.id}`} />
        </div>
        <DataTable columns={colunas} rows={visiveis} rowKey={(l) => l.femea} pageSize={50} />
      </section>
    </div>
  );
}
