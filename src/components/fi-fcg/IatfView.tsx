'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { Donut } from '@/components/painel/Donut';
import { BarrasHorizontais } from '@/components/painel/BarrasHorizontais';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { contagemPor, media } from '@/lib/painel/agregacao';
import { comparadorDataDesc, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { formatDia, formatNumber } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegIatf } from '@/lib/fi-fcg/types';

export function IatfView({ dados }: { dados: PacoteLeitura<RegIatf> }) {
  const itens = useMemo(() => desempacotar<RegIatf>(dados.pacote), [dados.pacote]);

  const [data, setData] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [busca, setBusca] = useState('');
  const [touro, setTouro] = useState('');
  const [inseminador, setInseminador] = useState('');
  const [ecc, setEcc] = useState('');
  const [lote, setLote] = useState('');

  const condicoes = useMemo((): Condicao<RegIatf>[] => [
    { key: 'data', test: (r) => !data || String(r.data) === data },
    { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
    { key: 'busca', test: (r) => !busca || r.id.toLowerCase().includes(busca.toLowerCase()) },
    { key: 'touro', test: (r) => !touro || r.partida === touro },
    { key: 'inseminador', test: (r) => !inseminador || r.inseminador === inseminador },
    { key: 'ecc', test: (r) => !ecc || r.ecc === ecc },
    { key: 'lote', test: (r) => !lote || r.lote === lote },
  ], [data, fazenda, busca, touro, inseminador, ecc, lote]);

  const datas = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'data', (r) => (r.data != null ? String(r.data) : null), comparadorDataDesc),
    [itens, condicoes],
  );
  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (r) => r.fazenda), [itens, condicoes]);
  const touros = useMemo(() => opcoesExcluindo(itens, condicoes, 'touro', (r) => r.partida), [itens, condicoes]);
  const inseminadores = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'inseminador', (r) => r.inseminador),
    [itens, condicoes],
  );
  const eccs = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'ecc', (r) => r.ecc, (a, b) => Number(a.replace(',', '.')) - Number(b.replace(',', '.'))),
    [itens, condicoes],
  );
  const lotes = useMemo(() => opcoesExcluindo(itens, condicoes, 'lote', (r) => r.lote), [itens, condicoes]);

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  const total = filtrados.length;
  const escoreMedio = useMemo(() => media(filtrados.map((r) => r.eccNum)), [filtrados]);
  const pesoMedio = useMemo(() => media(filtrados.map((r) => r.pesoKg)), [filtrados]);

  const porPartida = useMemo(() => contagemPor(filtrados, (r) => r.partida), [filtrados]);

  const colunas: DataTableColumn<RegIatf>[] = [
    { key: 'fazenda', header: 'Fazenda', cell: (r) => r.fazenda ?? '—', sortValue: (r) => r.fazenda },
    { key: 'lote', header: 'Lote', cell: (r) => r.lote ?? '—', sortValue: (r) => r.lote },
    { key: 'id', header: 'ID animal', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'partida', header: 'Partida (sêmen)', cell: (r) => r.partida ?? '—', sortValue: (r) => r.partida },
    { key: 'ecc', header: 'ECC', cell: (r) => r.ecc ?? '—', sortValue: (r) => r.eccNum },
    { key: 'inseminador', header: 'Inseminador', cell: (r) => r.inseminador ?? '—', sortValue: (r) => r.inseminador },
  ];

  const csvColunas: CsvColumn<RegIatf>[] = [
    { key: 'data', header: 'Data IATF', value: (r) => formatDia(r.data) },
    { key: 'fazenda', header: 'Fazenda', value: (r) => r.fazenda ?? '' },
    { key: 'lote', header: 'Lote', value: (r) => r.lote ?? '' },
    { key: 'id', header: 'ID animal', value: (r) => r.id },
    { key: 'partida', header: 'Partida (sêmen)', value: (r) => r.partida ?? '' },
    { key: 'ecc', header: 'ECC', value: (r) => r.ecc ?? '' },
    { key: 'inseminador', header: 'Inseminador', value: (r) => r.inseminador ?? '' },
    { key: 'protocolo', header: 'Protocolo', value: (r) => r.protocolo ?? '' },
    { key: 'metodo', header: 'Método', value: (r) => r.metodo ?? '' },
    { key: 'peso', header: 'Peso/kg', value: (r) => formatNumber(r.pesoKg) },
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
        <FilterSelect label="Data IATF" value={data} onChange={setData} options={datas} labelDe={(v) => formatDia(Number(v))} />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        <FilterBusca label="ID animal" value={busca} onChange={setBusca} placeholder="Buscar ID..." />
        <FilterSelect label="Touro" value={touro} onChange={setTouro} options={touros} triggerClassName="w-full sm:w-48" />
        <FilterSelect label="Inseminador" value={inseminador} onChange={setInseminador} options={inseminadores} />
        <FilterSelect label="ECC" value={ecc} onChange={setEcc} options={eccs} />
        <FilterSelect label="Lote" value={lote} onChange={setLote} options={lotes} triggerClassName="w-full sm:w-56" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="total" label="Total" value={formatNumber(total)} />
        <MetricCard id="escore" label="Escore" value={formatNumber(escoreMedio)} />
        <MetricCard id="peso" label="Peso/Kg" value={formatNumber(pesoMedio)} />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="completa">Tabela completa</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Por partida (sêmen)</h3>
              <Donut dados={porPartida} maxFatias={9} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Total por partida</h3>
              <BarrasHorizontais dados={porPartida} maximo={12} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_iatf" />
          </div>
          <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
        </TabsContent>

        <TabsContent value="completa" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_iatf" />
          </div>
          <DataTable
            columns={[
              { key: 'data', header: 'Data IATF', cell: (r) => formatDia(r.data), sortValue: (r) => r.data },
              ...colunas,
              { key: 'protocolo', header: 'Protocolo', cell: (r) => r.protocolo ?? '—', sortValue: (r) => r.protocolo },
              { key: 'metodo', header: 'Método', cell: (r) => r.metodo ?? '—', sortValue: (r) => r.metodo },
              { key: 'peso', header: 'Peso/kg', cell: (r) => formatNumber(r.pesoKg), sortValue: (r) => r.pesoKg },
            ]}
            rows={filtrados}
            rowKey={(r) => r.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
