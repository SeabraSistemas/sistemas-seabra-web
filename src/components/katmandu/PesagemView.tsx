'use client';

import { useMemo, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { FilterSelect } from './FilterSelect';
import { FilterRange } from './FilterRange';
import { WeightLossBadge } from './WeightLossBadge';
import { CsvExport, type CsvColumn } from './CsvExport';
import { SiglasInfo } from './SiglasInfo';
import { getPesagemMetrics } from '@/lib/katmandu/metrics';
import { formatKg, formatNumber, numberBounds } from '@/lib/katmandu/format';
import {
  DESTINO_LABEL,
  destinosPresentes,
  filtrarPor,
  opcoesExcluindo,
  type Condicao,
} from '@/lib/katmandu/filters';
import type { PesagemRegistro } from '@/lib/katmandu/types';

export function PesagemView({ registros }: { registros: PesagemRegistro[] }) {
  const [lote, setLote] = useState('');
  const [destino, setDestino] = useState('');
  const [dataPesagem, setDataPesagem] = useState('');
  const [venda, setVenda] = useState('');
  const [manejos, setManejos] = useState('');
  const [soPerdaPeso, setSoPerdaPeso] = useState(false);

  const pesoBounds = useMemo(() => numberBounds(registros.map((r) => r.pesoKg)), [registros]);
  const [pesoRange, setPesoRange] = useState<[number, number] | null>(null);

  // Cada filtro entra aqui uma vez; as opções de um select vêm dos registros
  // que passam em TODOS os outros filtros ativos (exceto o dele mesmo) — é
  // isso que faz escolher uma Data estreitar o Lote, e vice-versa.
  const condicoes = useMemo((): Condicao<PesagemRegistro>[] => {
    const [lo, hi] = pesoRange ?? pesoBounds ?? [0, 0];
    return [
      { key: 'lote', test: (r) => !lote || r.lote === lote },
      {
        key: 'destino',
        test: (r) => !destino || (r.destino ? DESTINO_LABEL[r.destino] : null) === destino,
      },
      { key: 'dataPesagem', test: (r) => !dataPesagem || r.dataPesagem === dataPesagem },
      { key: 'venda', test: (r) => !venda || r.venda === venda },
      { key: 'manejos', test: (r) => !manejos || r.manejos === manejos },
      { key: 'soPerdaPeso', test: (r) => !soPerdaPeso || (r.diferencaKg != null && r.diferencaKg < 0) },
      { key: 'peso', test: (r) => !pesoBounds || r.pesoKg == null || (r.pesoKg >= lo && r.pesoKg <= hi) },
    ];
  }, [lote, destino, dataPesagem, venda, manejos, soPerdaPeso, pesoRange, pesoBounds]);

  const lotes = useMemo(() => opcoesExcluindo(registros, condicoes, 'lote', (r) => r.lote), [registros, condicoes]);
  const datas = useMemo(
    () => opcoesExcluindo(registros, condicoes, 'dataPesagem', (r) => r.dataPesagem),
    [registros, condicoes],
  );
  const vendas = useMemo(() => opcoesExcluindo(registros, condicoes, 'venda', (r) => r.venda), [registros, condicoes]);
  const manejosOpcoes = useMemo(
    () => opcoesExcluindo(registros, condicoes, 'manejos', (r) => r.manejos),
    [registros, condicoes],
  );
  const destinos = useMemo(
    () => destinosPresentes(registros, condicoes, 'destino', (r) => r.destino),
    [registros, condicoes],
  );

  const filtrados = useMemo(() => filtrarPor(registros, condicoes), [registros, condicoes]);

  const metricas = useMemo(() => getPesagemMetrics(filtrados), [filtrados]);

  const diferencaColumn: DataTableColumn<PesagemRegistro> = {
    key: 'diferenca',
    header: 'Diferença',
    cell: (r) => (
      <span className="inline-flex items-center gap-2">
        {formatNumber(r.diferencaKg)}
        <WeightLossBadge diferencaKg={r.diferencaKg} />
      </span>
    ),
    sortValue: (r) => r.diferencaKg,
  };

  const resumoColumns: DataTableColumn<PesagemRegistro>[] = [
    { key: 'id', header: 'N° manejo', cell: (r) => r.idAnimal, sortValue: (r) => r.idAnimal },
    { key: 'peso', header: 'Peso/kg', cell: (r) => formatNumber(r.pesoKg), sortValue: (r) => r.pesoKg },
    diferencaColumn,
    { key: 'entrada', header: 'Peso entrada', cell: (r) => formatNumber(r.pesoEntradaKg), sortValue: (r) => r.pesoEntradaKg },
    { key: 'dias', header: 'Dias em engorda', cell: (r) => formatNumber(r.diasEmEngorda), sortValue: (r) => r.diasEmEngorda },
    { key: 'gmd', header: 'GMD', cell: (r) => formatNumber(r.gmd), sortValue: (r) => r.gmd },
    { key: 'pdi', header: 'PDI', cell: (r) => formatNumber(r.pdi), sortValue: (r) => r.pdi },
    { key: 'gpdi', header: 'GPDI', cell: (r) => formatNumber(r.gpdi), sortValue: (r) => r.gpdi },
    { key: 'lote', header: 'Lote', cell: (r) => r.lote ?? '—', sortValue: (r) => r.lote },
  ];

  const completaColumns: DataTableColumn<PesagemRegistro>[] = [
    { key: 'id', header: 'N° manejo', cell: (r) => r.idAnimal, sortValue: (r) => r.idAnimal },
    { key: 'peso', header: 'Peso/kg', cell: (r) => formatNumber(r.pesoKg), sortValue: (r) => r.pesoKg },
    { key: 'ultima', header: 'Última pesagem', cell: (r) => formatKg(r.ultimaPesagemKg), sortValue: (r) => r.ultimaPesagemKg },
    diferencaColumn,
    { key: 'entrada', header: 'Peso entrada', cell: (r) => formatNumber(r.pesoEntradaKg), sortValue: (r) => r.pesoEntradaKg },
    { key: 'dias', header: 'Dias em engorda', cell: (r) => formatNumber(r.diasEmEngorda), sortValue: (r) => r.diasEmEngorda },
    { key: 'gmd', header: 'GMD', cell: (r) => formatNumber(r.gmd), sortValue: (r) => r.gmd },
    { key: 'pdi', header: 'PDI', cell: (r) => formatNumber(r.pdi), sortValue: (r) => r.pdi },
    { key: 'gpdi', header: 'GPDI', cell: (r) => formatNumber(r.gpdi), sortValue: (r) => r.gpdi },
    { key: 'lote', header: 'Lote', cell: (r) => r.lote ?? '—', sortValue: (r) => r.lote },
    {
      key: 'destino',
      header: 'Destino',
      cell: (r) => (r.destino ? DESTINO_LABEL[r.destino] : '—'),
      sortValue: (r) => r.destino,
    },
  ];

  const csvColumns: CsvColumn<PesagemRegistro>[] = [
    { key: 'id', header: 'N° manejo', value: (r) => r.idAnimal },
    { key: 'peso', header: 'Peso/kg', value: (r) => formatNumber(r.pesoKg) },
    { key: 'ultima', header: 'Última pesagem', value: (r) => formatNumber(r.ultimaPesagemKg) },
    { key: 'diferenca', header: 'Diferença', value: (r) => formatNumber(r.diferencaKg) },
    { key: 'entrada', header: 'Peso entrada', value: (r) => formatNumber(r.pesoEntradaKg) },
    { key: 'dias', header: 'Dias em engorda', value: (r) => formatNumber(r.diasEmEngorda) },
    { key: 'gmd', header: 'GMD', value: (r) => formatNumber(r.gmd) },
    { key: 'pdi', header: 'PDI', value: (r) => formatNumber(r.pdi) },
    { key: 'gpdi', header: 'GPDI', value: (r) => formatNumber(r.gpdi) },
    { key: 'lote', header: 'Lote', value: (r) => r.lote ?? '' },
    { key: 'destino', header: 'Destino', value: (r) => (r.destino ? DESTINO_LABEL[r.destino] : '') },
    { key: 'data', header: 'Data da pesagem', value: (r) => r.dataPesagem ?? '' },
    { key: 'manejos', header: 'Manejos', value: (r) => r.manejos ?? '' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
        <FilterSelect label="Lote" value={lote} onChange={setLote} options={lotes} />
        <FilterSelect
          label="Destino"
          value={destino}
          onChange={setDestino}
          options={destinos.map((d) => DESTINO_LABEL[d])}
        />
        <FilterSelect label="Manejos" value={manejos} onChange={setManejos} options={manejosOpcoes} />
        <FilterSelect label="Data da pesagem" value={dataPesagem} onChange={setDataPesagem} options={datas} />
        <FilterSelect label="Venda" value={venda} onChange={setVenda} options={vendas} />
        {pesoBounds && (
          <FilterRange
            label="Peso/kg"
            bounds={pesoBounds}
            value={pesoRange ?? pesoBounds}
            onChange={setPesoRange}
            className="col-span-2"
          />
        )}
        <Button
          type="button"
          variant={soPerdaPeso ? 'default' : 'outline'}
          size="sm"
          aria-pressed={soPerdaPeso}
          onClick={() => setSoPerdaPeso((v) => !v)}
          className="col-span-2 gap-1.5 sm:col-span-1"
        >
          <TrendingDown className="size-3.5" />
          Perdendo peso
        </Button>
      </div>

      <Tabs defaultValue="resumo">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="completa">Tabela completa</TabsTrigger>
          </TabsList>
          <CsvExport columns={csvColumns} rows={filtrados} requiredKeys={['id']} filename="pesagem" />
        </div>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {metricas.map((m) => (
              <MetricCard key={m.id} {...m} />
            ))}
          </div>
          <SiglasInfo />
          <DataTable columns={resumoColumns} rows={filtrados} rowKey={(r) => `${r.idAnimal}-${r.dataPesagem ?? ''}`} />
        </TabsContent>

        <TabsContent value="completa">
          <DataTable columns={completaColumns} rows={filtrados} rowKey={(r) => `${r.idAnimal}-${r.dataPesagem ?? ''}`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
