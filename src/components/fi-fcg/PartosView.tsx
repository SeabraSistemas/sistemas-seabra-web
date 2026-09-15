'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { Donut } from '@/components/painel/Donut';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterPeriodo } from '@/components/painel/FilterPeriodo';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { contagemPor } from '@/lib/painel/agregacao';
import { dentroPeriodo, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { anosPresentes, diaDeInput, formatDia, formatNumber } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegParto } from '@/lib/fi-fcg/types';

export function PartosView({ dados }: { dados: PacoteLeitura<RegParto> }) {
  const itens = useMemo(() => desempacotar<RegParto>(dados.pacote), [dados.pacote]);

  const [fazenda, setFazenda] = useState('');
  const [marca, setMarca] = useState('');
  const [sexo, setSexo] = useState('');
  const [buscaEletronica, setBuscaEletronica] = useState('');
  const [buscaMae, setBuscaMae] = useState('');
  const [buscaPai, setBuscaPai] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const condicoes = useMemo((): Condicao<RegParto>[] => {
    const inicio = diaDeInput(dataInicio);
    const fim = diaDeInput(dataFim);
    return [
      { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
      { key: 'marca', test: (r) => !marca || r.marca === marca },
      { key: 'sexo', test: (r) => !sexo || r.sexo === sexo },
      { key: 'eletronica', test: (r) => !buscaEletronica || (r.eletronica ?? '').toLowerCase().includes(buscaEletronica.toLowerCase()) },
      { key: 'mae', test: (r) => !buscaMae || (r.idMae ?? '').toLowerCase().includes(buscaMae.toLowerCase()) },
      { key: 'pai', test: (r) => !buscaPai || (r.idPai ?? '').toLowerCase().includes(buscaPai.toLowerCase()) },
      { key: 'periodo', test: (r) => dentroPeriodo(r.nascimento, inicio, fim) },
    ];
  }, [fazenda, marca, sexo, buscaEletronica, buscaMae, buscaPai, dataInicio, dataFim]);

  const anos = useMemo(() => anosPresentes(itens.map((r) => r.nascimento)), [itens]);

  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (r) => r.fazenda), [itens, condicoes]);
  const marcas = useMemo(() => opcoesExcluindo(itens, condicoes, 'marca', (r) => r.marca), [itens, condicoes]);
  const sexos = useMemo(() => opcoesExcluindo(itens, condicoes, 'sexo', (r) => r.sexo), [itens, condicoes]);

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  const total = filtrados.length;
  const porSexo = useMemo(() => contagemPor(filtrados, (r) => r.sexo), [filtrados]);
  const porMetodo = useMemo(() => contagemPor(filtrados, (r) => r.metodo), [filtrados]);

  const colunas: DataTableColumn<RegParto>[] = [
    { key: 'nascimento', header: 'Data de nascimento', cell: (r) => formatDia(r.nascimento), sortValue: (r) => r.nascimento },
    { key: 'eletronica', header: 'ID eletrônica', cell: (r) => r.eletronica ?? '—', sortValue: (r) => r.eletronica },
    { key: 'marca', header: 'Marca', cell: (r) => r.marca ?? '—', sortValue: (r) => r.marca },
    { key: 'sexo', header: 'Sexo', cell: (r) => r.sexo ?? '—', sortValue: (r) => r.sexo },
    { key: 'mae', header: 'ID Mãe', cell: (r) => r.idMae ?? '—', sortValue: (r) => r.idMae },
    { key: 'pai', header: 'ID Pai', cell: (r) => r.idPai ?? '—', sortValue: (r) => r.idPai },
  ];

  const csvColunas: CsvColumn<RegParto>[] = [
    { key: 'nascimento', header: 'Data de nascimento', value: (r) => formatDia(r.nascimento) },
    { key: 'id', header: 'ID animal', value: (r) => r.id },
    { key: 'eletronica', header: 'ID eletrônica', value: (r) => r.eletronica ?? '' },
    { key: 'marca', header: 'Marca', value: (r) => r.marca ?? '' },
    { key: 'sexo', header: 'Sexo', value: (r) => r.sexo ?? '' },
    { key: 'mae', header: 'ID Mãe', value: (r) => r.idMae ?? '' },
    { key: 'pai', header: 'ID Pai', value: (r) => r.idPai ?? '' },
    { key: 'metodo', header: 'Método', value: (r) => r.metodo ?? '' },
    { key: 'peso', header: 'Peso ao nascimento', value: (r) => formatNumber(r.pesoNascimento) },
    { key: 'fazenda', header: 'Fazenda', value: (r) => r.fazenda ?? '' },
    { key: 'categoria', header: 'Categoria', value: (r) => r.categoria ?? '' },
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
        <FilterBusca label="ID eletrônica" value={buscaEletronica} onChange={setBuscaEletronica} placeholder="Buscar..." />
        <FilterSelect label="Marca" value={marca} onChange={setMarca} options={marcas} />
        <FilterSelect label="Sexo" value={sexo} onChange={setSexo} options={sexos} />
        <FilterPeriodo inicio={dataInicio} fim={dataFim} onInicioChange={setDataInicio} onFimChange={setDataFim} anos={anos} />
        <FilterBusca label="Mãe" value={buscaMae} onChange={setBuscaMae} placeholder="Buscar ID mãe..." />
        <FilterBusca label="Pai" value={buscaPai} onChange={setBuscaPai} placeholder="Buscar ID pai..." />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="total" label="Total" value={formatNumber(total)} />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="completa">Tabela completa</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Sexo</h3>
              <Donut dados={porSexo} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Método</h3>
              <Donut dados={porMetodo} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_partos" />
          </div>
          <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
        </TabsContent>

        <TabsContent value="completa" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_partos" />
          </div>
          <DataTable
            columns={[
              ...colunas,
              { key: 'id', header: 'ID animal', cell: (r) => r.id, sortValue: (r) => r.id },
              { key: 'metodo', header: 'Método', cell: (r) => r.metodo ?? '—', sortValue: (r) => r.metodo },
              { key: 'peso', header: 'Peso ao nascimento', cell: (r) => formatNumber(r.pesoNascimento), sortValue: (r) => r.pesoNascimento },
              { key: 'fazenda', header: 'Fazenda', cell: (r) => r.fazenda ?? '—', sortValue: (r) => r.fazenda },
              { key: 'categoria', header: 'Categoria', cell: (r) => r.categoria ?? '—', sortValue: (r) => r.categoria },
            ]}
            rows={filtrados}
            rowKey={(r) => r.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
