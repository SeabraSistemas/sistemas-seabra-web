'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MetricCard } from './MetricCard';
import { DataTable, type DataTableColumn } from './DataTable';
import { FilterSelect } from './FilterSelect';
import { FilterRange } from './FilterRange';
import { CsvExport, type CsvColumn } from './CsvExport';
import { filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/katmandu/filters';
import { formatDateBR, numberBounds, parseDateBR } from '@/lib/katmandu/format';
import type { Baixa } from '@/lib/katmandu/types';

export function BaixaView({ baixas }: { baixas: Baixa[] }) {
  const [busca, setBusca] = useState('');
  const [lote, setLote] = useState('');
  const [local, setLocal] = useState('');
  const [categoria, setCategoria] = useState('');
  const [causa, setCausa] = useState('');

  const dataBounds = useMemo(() => numberBounds(baixas.map((b) => parseDateBR(b.data))), [baixas]);
  const [dataRange, setDataRange] = useState<[number, number] | null>(null);

  const condicoes = useMemo((): Condicao<Baixa>[] => {
    const [lo, hi] = dataRange ?? dataBounds ?? [0, 0];
    return [
      { key: 'busca', test: (b) => !busca || b.idAnimal.toLowerCase().includes(busca.toLowerCase()) },
      { key: 'lote', test: (b) => !lote || b.lote === lote },
      { key: 'local', test: (b) => !local || b.local === local },
      { key: 'categoria', test: (b) => !categoria || b.categoria === categoria },
      { key: 'causa', test: (b) => !causa || b.causa === causa },
      {
        key: 'data',
        test: (b) => {
          if (!dataBounds) return true;
          const ts = parseDateBR(b.data);
          return ts == null || (ts >= lo && ts <= hi);
        },
      },
    ];
  }, [busca, lote, local, categoria, causa, dataRange, dataBounds]);

  const lotes = useMemo(() => opcoesExcluindo(baixas, condicoes, 'lote', (b) => b.lote), [baixas, condicoes]);
  const locais = useMemo(() => opcoesExcluindo(baixas, condicoes, 'local', (b) => b.local), [baixas, condicoes]);
  const categorias = useMemo(
    () => opcoesExcluindo(baixas, condicoes, 'categoria', (b) => b.categoria),
    [baixas, condicoes],
  );
  const causas = useMemo(() => opcoesExcluindo(baixas, condicoes, 'causa', (b) => b.causa), [baixas, condicoes]);

  const filtrados = useMemo(() => filtrarPor(baixas, condicoes), [baixas, condicoes]);

  const colunas: DataTableColumn<Baixa>[] = [
    { key: 'id', header: 'N° manejo', cell: (b) => b.idAnimal, sortValue: (b) => b.idAnimal },
    { key: 'data', header: 'Data', cell: (b) => b.data ?? '—', sortValue: (b) => parseDateBR(b.data) },
    { key: 'categoria', header: 'Categoria', cell: (b) => b.categoria ?? '—', sortValue: (b) => b.categoria },
    { key: 'lote', header: 'Lote', cell: (b) => b.lote ?? '—', sortValue: (b) => b.lote },
    { key: 'local', header: 'Local', cell: (b) => b.local ?? '—', sortValue: (b) => b.local },
    { key: 'causa', header: 'Causa', cell: (b) => b.causa ?? '—', sortValue: (b) => b.causa },
    { key: 'obs', header: 'Observação', cell: (b) => b.obs ?? '—', sortValue: (b) => b.obs },
  ];

  const csvColumns: CsvColumn<Baixa>[] = [
    { key: 'id', header: 'N° manejo', value: (b) => b.idAnimal },
    { key: 'data', header: 'Data', value: (b) => b.data ?? '' },
    { key: 'categoria', header: 'Categoria', value: (b) => b.categoria ?? '' },
    { key: 'lote', header: 'Lote', value: (b) => b.lote ?? '' },
    { key: 'local', header: 'Local', value: (b) => b.local ?? '' },
    { key: 'causa', header: 'Causa', value: (b) => b.causa ?? '' },
    { key: 'obs', header: 'Observação', value: (b) => b.obs ?? '' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">N° manejo</span>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar…"
            className="h-9 w-full sm:w-40"
          />
        </div>
        <FilterSelect label="Lote" value={lote} onChange={setLote} options={lotes} />
        <FilterSelect label="Local" value={local} onChange={setLocal} options={locais} />
        <FilterSelect label="Categoria" value={categoria} onChange={setCategoria} options={categorias} />
        <FilterSelect label="Causa" value={causa} onChange={setCausa} options={causas} />
        {dataBounds && (
          <FilterRange
            label="Data"
            bounds={dataBounds}
            value={dataRange ?? dataBounds}
            onChange={setDataRange}
            formatValue={formatDateBR}
          />
        )}
      </div>

      <div className="max-w-40">
        <MetricCard id="total" label="Total" value={String(filtrados.length)} />
      </div>

      <div className="flex justify-end">
        <CsvExport columns={csvColumns} rows={filtrados} requiredKeys={['id']} filename="baixa" />
      </div>

      <DataTable columns={colunas} rows={filtrados} rowKey={(b) => `${b.idAnimal}-${b.data ?? ''}`} />
    </div>
  );
}
