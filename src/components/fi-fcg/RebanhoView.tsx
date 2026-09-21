'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { Donut } from '@/components/painel/Donut';
import { BarrasHorizontais } from '@/components/painel/BarrasHorizontais';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterRange } from '@/components/painel/FilterRange';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { contagemPor, contar } from '@/lib/painel/agregacao';
import { dentroFaixa, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { formatNumber, numberBounds } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegRebanho } from '@/lib/fi-fcg/types';

/** Não está na venda/baixa da própria RebanhoProd — o "estoque" do rebanho (mesmo conceito de /katmandu, onde isto vinha de um campo `baixa` à parte). */
function vivo(r: RegRebanho): boolean {
  return r.categoria !== 'Venda' && r.categoria !== 'Baixa';
}

export function RebanhoView({ dados }: { dados: PacoteLeitura<RegRebanho> }) {
  const itens = useMemo(() => desempacotar<RegRebanho>(dados.pacote), [dados.pacote]);

  const [busca, setBusca] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [causaBaixa, setCausaBaixa] = useState('');

  const idadeBounds = useMemo(() => numberBounds(itens.map((r) => r.idadeMeses)), [itens]);
  const [idadeRange, setIdadeRange] = useState<[number, number] | null>(null);

  const condicoes = useMemo((): Condicao<RegRebanho>[] => [
    { key: 'busca', test: (r) => !busca || r.id.toLowerCase().includes(busca.toLowerCase()) },
    { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
    { key: 'categoria', test: (r) => !categoria || r.categoria === categoria },
    { key: 'causaBaixa', test: (r) => !causaBaixa || r.causaBaixa === causaBaixa },
    { key: 'idade', test: (r) => dentroFaixa(r.idadeMeses, idadeBounds, idadeRange) },
  ], [busca, fazenda, categoria, causaBaixa, idadeBounds, idadeRange]);

  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (r) => r.fazenda), [itens, condicoes]);
  const categorias = useMemo(() => opcoesExcluindo(itens, condicoes, 'categoria', (r) => r.categoria), [itens, condicoes]);
  const causasBaixa = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'causaBaixa', (r) => r.causaBaixa),
    [itens, condicoes],
  );

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);
  // As métricas de "rebanho vivo" (cards, donut de Fazenda, barras) sempre excluem
  // Venda/Baixa — a TABELA continua mostrando o recorte filtrado inteiro (inclusive
  // venda/baixa), pro usuário conseguir localizar um animal que já saiu do rebanho.
  const vivos = useMemo(() => filtrados.filter(vivo), [filtrados]);

  const totalVivos = vivos.length;
  const vacas = useMemo(() => contar(vivos, (r) => r.categoria === 'Vaca'), [vivos]);
  const leiteiras = useMemo(() => contar(vivos, (r) => r.categoria === 'Leiteira'), [vivos]);
  const novilhas = useMemo(() => contar(vivos, (r) => r.categoria === 'Novilha'), [vivos]);
  const touros = useMemo(() => contar(vivos, (r) => r.categoria === 'Touro'), [vivos]);
  const garrotes = useMemo(() => contar(vivos, (r) => r.categoria === 'Garrote'), [vivos]);
  const bezerros = useMemo(() => contar(vivos, (r) => r.categoria === 'Bezerro'), [vivos]);
  const bezerras = useMemo(() => contar(vivos, (r) => r.categoria === 'Bezerra'), [vivos]);

  const vivosPorFazenda = useMemo(() => contagemPor(vivos, (r) => r.fazenda), [vivos]);
  const porCategoria = useMemo(() => contagemPor(filtrados, (r) => r.categoria), [filtrados]);

  const colunas: DataTableColumn<RegRebanho>[] = [
    { key: 'fazenda', header: 'Fazenda', cell: (r) => r.fazenda ?? '—', sortValue: (r) => r.fazenda },
    { key: 'id', header: 'ID animal', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'categoria', header: 'Categoria', cell: (r) => r.categoria ?? '—', sortValue: (r) => r.categoria },
    { key: 'meses', header: 'Meses', cell: (r) => formatNumber(r.idadeMeses), sortValue: (r) => r.idadeMeses },
    { key: 'baixa', header: 'Baixa', cell: (r) => r.causaBaixa ?? '-', sortValue: (r) => r.causaBaixa },
  ];

  const csvColunas: CsvColumn<RegRebanho>[] = [
    { key: 'fazenda', header: 'Fazenda', value: (r) => r.fazenda ?? '' },
    { key: 'id', header: 'ID animal', value: (r) => r.id },
    { key: 'eletronica', header: 'ID eletrônica', value: (r) => r.eletronica ?? '' },
    { key: 'categoria', header: 'Categoria', value: (r) => r.categoria ?? '' },
    { key: 'sexo', header: 'Sexo', value: (r) => r.sexo ?? '' },
    { key: 'meses', header: 'Idade (meses)', value: (r) => formatNumber(r.idadeMeses) },
    { key: 'lote', header: 'Lote', value: (r) => r.lote ?? '' },
    { key: 'status', header: 'Status', value: (r) => r.status ?? '' },
    { key: 'baixa', header: 'Causa da baixa', value: (r) => r.causaBaixa ?? '' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <EstadoCarga
        configurado={dados.configurado}
        stale={dados.stale}
        carregadoEm={dados.carregadoEm}
        atualizarHref="/FI_FCG/api/atualizar"
      />

      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        <FilterSelect label="Categoria" value={categoria} onChange={setCategoria} options={categorias} />
        <FilterBusca label="ID animal" value={busca} onChange={setBusca} placeholder="Buscar ID..." />
        <FilterSelect label="Causa da baixa" value={causaBaixa} onChange={setCausaBaixa} options={causasBaixa} />
        {idadeBounds && (
          <FilterRange label="Idade (meses)" bounds={idadeBounds} value={idadeRange ?? idadeBounds} onChange={setIdadeRange} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="vivos" label="Total de animais vivos" value={formatNumber(totalVivos)} />
        <MetricCard id="vacas" label="Vacas" value={formatNumber(vacas)} />
        <MetricCard id="leiteiras" label="Leiteiras" value={formatNumber(leiteiras)} />
        <MetricCard id="novilhas" label="Novilhas" value={formatNumber(novilhas)} />
        <MetricCard id="touros" label="Touros" value={formatNumber(touros)} />
        <MetricCard id="garrotes" label="Garrotes" value={formatNumber(garrotes)} />
        <MetricCard id="bezerros" label="Bezerros" value={formatNumber(bezerros)} />
        <MetricCard id="bezerras" label="Bezerras" value={formatNumber(bezerras)} />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="completa">Tabela completa</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Vivos por fazenda</h3>
              <Donut dados={vivosPorFazenda} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Por categoria</h3>
              <Donut dados={porCategoria} maxFatias={8} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Total de animais vivos por fazenda</h3>
            <BarrasHorizontais dados={vivosPorFazenda} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_rebanho" />
          </div>
          <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
        </TabsContent>

        <TabsContent value="completa" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_rebanho" />
          </div>
          <DataTable
            columns={[
              ...colunas,
              { key: 'eletronica', header: 'ID eletrônica', cell: (r) => r.eletronica ?? '—', sortValue: (r) => r.eletronica },
              { key: 'sexo', header: 'Sexo', cell: (r) => r.sexo ?? '—', sortValue: (r) => r.sexo },
              { key: 'lote', header: 'Lote', cell: (r) => r.lote ?? '—', sortValue: (r) => r.lote },
              { key: 'status', header: 'Status', cell: (r) => r.status ?? '—', sortValue: (r) => r.status },
              { key: 'reproducao', header: 'Reprodução', cell: (r) => r.reproducao ?? '—', sortValue: (r) => r.reproducao },
              { key: 'destino', header: 'Destino', cell: (r) => r.destino ?? '—', sortValue: (r) => r.destino },
            ]}
            rows={filtrados}
            rowKey={(r) => r.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
