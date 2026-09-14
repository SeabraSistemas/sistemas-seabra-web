'use client';

import { useMemo, useState } from 'react';
import { MetricCard } from '@/components/painel/MetricCard';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterRange } from '@/components/painel/FilterRange';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { media, soma } from '@/lib/painel/agregacao';
import { comparadorDataDesc, dentroFaixa, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { desempacotar } from '@/lib/painel/pacote';
import { formatCompacto, formatDia, formatNumber, numberBounds } from '@/lib/painel/format';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegPesagem } from '@/lib/fi-fcg/types';

export function PesagemView({ dados }: { dados: PacoteLeitura<RegPesagem> }) {
  const itens = useMemo(() => desempacotar<RegPesagem>(dados.pacote), [dados.pacote]);

  const [data, setData] = useState('');
  const [fazenda, setFazenda] = useState('');

  const pesoBounds = useMemo(() => numberBounds(itens.map((r) => r.pesoKg)), [itens]);
  const [pesoRange, setPesoRange] = useState<[number, number] | null>(null);

  const diasBounds = useMemo(() => numberBounds(itens.map((r) => r.diasEngorda)), [itens]);
  const [diasRange, setDiasRange] = useState<[number, number] | null>(null);

  const condicoes = useMemo((): Condicao<RegPesagem>[] => [
    { key: 'data', test: (r) => !data || String(r.data) === data },
    { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
    { key: 'peso', test: (r) => dentroFaixa(r.pesoKg, pesoBounds, pesoRange) },
    { key: 'dias', test: (r) => dentroFaixa(r.diasEngorda, diasBounds, diasRange) },
  ], [data, fazenda, pesoBounds, pesoRange, diasBounds, diasRange]);

  const datas = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'data', (r) => (r.data != null ? String(r.data) : null), comparadorDataDesc),
    [itens, condicoes],
  );
  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (r) => r.fazenda), [itens, condicoes]);

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  const total = filtrados.length;
  const mediaKg = useMemo(() => media(filtrados.map((r) => r.pesoKg)), [filtrados]);
  const totalKg = useMemo(() => soma(filtrados.map((r) => r.pesoKg)), [filtrados]);
  const mediaGmd = useMemo(() => media(filtrados.map((r) => r.gmd)), [filtrados]);
  const mediaPdi = useMemo(() => media(filtrados.map((r) => r.pdi)), [filtrados]);
  const mediaGpdi = useMemo(() => media(filtrados.map((r) => r.gpdi)), [filtrados]);

  const colunas: DataTableColumn<RegPesagem>[] = [
    { key: 'id', header: 'Animal', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'peso', header: 'Peso|Kg', cell: (r) => formatNumber(r.pesoKg), sortValue: (r) => r.pesoKg },
    { key: 'entrada', header: 'Entrada|Engorda', cell: (r) => formatNumber(r.entradaKg), sortValue: (r) => r.entradaKg },
    { key: 'gmd', header: 'GMD', cell: (r) => formatNumber(r.gmd), sortValue: (r) => r.gmd },
    { key: 'dias', header: 'Dias|Engorda', cell: (r) => formatNumber(r.diasEngorda), sortValue: (r) => r.diasEngorda },
    {
      key: 'gpdi',
      header: 'GPDi',
      cell: (r) => (
        <span className={r.gpdi != null && r.gpdi < 0 ? 'text-destructive' : undefined}>{formatNumber(r.gpdi)}</span>
      ),
      sortValue: (r) => r.gpdi,
    },
    { key: 'pdi', header: 'PDI', cell: (r) => formatNumber(r.pdi), sortValue: (r) => r.pdi },
    { key: 'gpd', header: 'GPD', cell: (r) => formatNumber(r.gpd), sortValue: (r) => r.gpd },
  ];

  const csvColunas: CsvColumn<RegPesagem>[] = [
    { key: 'data', header: 'Data da pesagem', value: (r) => formatDia(r.data) },
    { key: 'id', header: 'Animal', value: (r) => r.id },
    { key: 'fazenda', header: 'Fazenda', value: (r) => r.fazenda ?? '' },
    { key: 'lote', header: 'Lote', value: (r) => r.lote ?? '' },
    { key: 'sexo', header: 'Sexo', value: (r) => r.sexo ?? '' },
    { key: 'peso', header: 'Peso/kg', value: (r) => formatNumber(r.pesoKg) },
    { key: 'entrada', header: 'Peso entrada engorda', value: (r) => formatNumber(r.entradaKg) },
    { key: 'dias', header: 'Dias em engorda', value: (r) => formatNumber(r.diasEngorda) },
    { key: 'gmd', header: 'GMD', value: (r) => formatNumber(r.gmd) },
    { key: 'gpd', header: 'GPD', value: (r) => formatNumber(r.gpd) },
    { key: 'pdi', header: 'PDI', value: (r) => formatNumber(r.pdi) },
    { key: 'gpdi', header: 'GPDi', value: (r) => formatNumber(r.gpdi) },
    { key: 'destino', header: 'Destino', value: (r) => r.destino ?? '' },
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
        <FilterSelect
          label="Data da pesagem"
          value={data}
          onChange={setData}
          options={datas}
          labelDe={(v) => formatDia(Number(v))}
          triggerClassName="w-full sm:w-36"
        />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        {pesoBounds && (
          <FilterRange label="Intervalo do Peso/Kg" bounds={pesoBounds} value={pesoRange ?? pesoBounds} onChange={setPesoRange} />
        )}
        {diasBounds && (
          <FilterRange label="Dias em engorda" bounds={diasBounds} value={diasRange ?? diasBounds} onChange={setDiasRange} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard id="total" label="Total" value={formatCompacto(total)} />
        <MetricCard id="mediaKg" label="Média/Kg" value={formatNumber(mediaKg)} />
        <MetricCard id="totalKg" label="Total/Kg" value={formatCompacto(totalKg)} />
        <MetricCard id="mediaGmd" label="Média/GMD" value={formatNumber(mediaGmd)} />
        <MetricCard id="mediaPdi" label="Média/PDI" value={formatNumber(mediaPdi)} />
        <MetricCard id="mediaGpdi" label="Média/GPDi" value={formatNumber(mediaGpdi)} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{formatNumber(filtrados.length)} registros</h2>
        <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_pesagem" />
      </div>
      <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
    </div>
  );
}
