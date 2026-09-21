'use client';

import { useMemo, useState } from 'react';
import { MetricCard } from '@/components/painel/MetricCard';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterPeriodo } from '@/components/painel/FilterPeriodo';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { media } from '@/lib/painel/agregacao';
import { dentroPeriodo, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { anosPresentes, diaDeInput, formatDia, formatNumber } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegBaixa } from '@/lib/fi-fcg/types';

export function BaixasView({ dados }: { dados: PacoteLeitura<RegBaixa> }) {
  const itens = useMemo(() => desempacotar<RegBaixa>(dados.pacote), [dados.pacote]);

  const [fazenda, setFazenda] = useState('');
  const [busca, setBusca] = useState('');
  const [causaObito, setCausaObito] = useState('');
  const [tipo, setTipo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const condicoes = useMemo((): Condicao<RegBaixa>[] => {
    const inicio = diaDeInput(dataInicio);
    const fim = diaDeInput(dataFim);
    return [
      { key: 'fazenda', test: (b) => !fazenda || b.fazenda === fazenda },
      { key: 'busca', test: (b) => !busca || b.id.toLowerCase().includes(busca.toLowerCase()) },
      { key: 'causaObito', test: (b) => !causaObito || b.causaObito === causaObito },
      { key: 'tipo', test: (b) => !tipo || b.tipo === tipo },
      { key: 'periodo', test: (b) => dentroPeriodo(b.data, inicio, fim) },
    ];
  }, [fazenda, busca, causaObito, tipo, dataInicio, dataFim]);

  const anos = useMemo(() => anosPresentes(itens.map((b) => b.data)), [itens]);

  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (b) => b.fazenda), [itens, condicoes]);
  const causas = useMemo(() => opcoesExcluindo(itens, condicoes, 'causaObito', (b) => b.causaObito), [itens, condicoes]);
  const tipos = useMemo(() => opcoesExcluindo(itens, condicoes, 'tipo', (b) => b.tipo), [itens, condicoes]);

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  const total = filtrados.length;
  const mediaIdade = useMemo(() => media(filtrados.map((b) => b.idadeDias)), [filtrados]);

  const colunas: DataTableColumn<RegBaixa>[] = [
    { key: 'data', header: 'Data', cell: (b) => formatDia(b.data), sortValue: (b) => b.data },
    { key: 'id', header: 'Animal', cell: (b) => b.id, sortValue: (b) => b.id },
    { key: 'categoria', header: 'Categoria', cell: (b) => b.categoria ?? '—', sortValue: (b) => b.categoria },
    { key: 'tipo', header: 'Tipo', cell: (b) => b.tipo ?? '—', sortValue: (b) => b.tipo },
    { key: 'causa', header: 'Causa', cell: (b) => b.causaObito ?? '—', sortValue: (b) => b.causaObito },
    { key: 'fazenda', header: 'Fazenda', cell: (b) => b.fazenda ?? '—', sortValue: (b) => b.fazenda },
    { key: 'idade', header: 'Idade|dias', cell: (b) => formatNumber(b.idadeDias), sortValue: (b) => b.idadeDias },
    { key: 'obs', header: 'Observação', cell: (b) => b.obs ?? '—' },
  ];

  const csvColunas: CsvColumn<RegBaixa>[] = [
    { key: 'data', header: 'Data', value: (b) => formatDia(b.data) },
    { key: 'id', header: 'Animal', value: (b) => b.id },
    { key: 'categoria', header: 'Categoria', value: (b) => b.categoria ?? '' },
    { key: 'tipo', header: 'Tipo', value: (b) => b.tipo ?? '' },
    { key: 'causa', header: 'Causa', value: (b) => b.causaObito ?? '' },
    { key: 'fazenda', header: 'Fazenda', value: (b) => b.fazenda ?? '' },
    { key: 'idade', header: 'Idade (dias)', value: (b) => formatNumber(b.idadeDias) },
    { key: 'obs', header: 'Observação', value: (b) => b.obs ?? '' },
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
        <FilterPeriodo inicio={dataInicio} fim={dataFim} onInicioChange={setDataInicio} onFimChange={setDataFim} anos={anos} />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        <FilterBusca label="Animal" value={busca} onChange={setBusca} placeholder="Buscar ID..." />
        <FilterSelect label="Causa do óbito" value={causaObito} onChange={setCausaObito} options={causas} />
        <FilterSelect label="Tipo" value={tipo} onChange={setTipo} options={tipos} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="total" label="Total" value={formatNumber(total)} />
        <MetricCard id="idade" label="Média|Idade (dias)" value={formatNumber(mediaIdade)} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
        <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_baixas" />
      </div>
      <DataTable columns={colunas} rows={filtrados} rowKey={(b) => b.id} />
    </div>
  );
}
