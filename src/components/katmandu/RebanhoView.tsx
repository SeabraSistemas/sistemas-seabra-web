'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from './MetricCard';
import { CategoriaDonut } from './CategoriaDonut';
import { DataTable, type DataTableColumn } from './DataTable';
import { FilterSelect } from './FilterSelect';
import { FilterRange } from './FilterRange';
import { CsvExport, type CsvColumn } from './CsvExport';
import { contagemPorCategoria, getRebanhoMetrics } from '@/lib/katmandu/metrics';
import { formatNumber, numberBounds } from '@/lib/katmandu/format';
import type { AnimalRebanho } from '@/lib/katmandu/types';

const DESTINO_LABEL = { melhor: 'Melhor', mediano: 'Mediano', pior: 'Pior' } as const;

function opcoes(valores: (string | null)[]): string[] {
  return Array.from(new Set(valores.filter((v): v is string => v != null))).sort();
}

function sexoLabel(a: AnimalRebanho): string {
  return a.sexo === 'macho' ? 'Macho' : a.sexo === 'femea' ? 'Fêmea' : '—';
}

function destinoLabel(a: AnimalRebanho): string {
  return a.destino ? DESTINO_LABEL[a.destino] : '—';
}

/** /katmandu/rebanho é o estoque atual — animais com baixa (óbito/venda/etc) nunca entram aqui. */
export function RebanhoView({ animais: todos }: { animais: AnimalRebanho[] }) {
  const animais = useMemo(() => todos.filter((a) => a.baixa == null), [todos]);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [sexo, setSexo] = useState('');
  const [status, setStatus] = useState('');
  const [destino, setDestino] = useState('');
  const [lote, setLote] = useState('');
  const [entrada, setEntrada] = useState('');
  const [ultimoManejo, setUltimoManejo] = useState('');

  const idadeBounds = useMemo(() => numberBounds(animais.map((a) => a.idadeDias)), [animais]);
  const [idadeRange, setIdadeRange] = useState<[number, number] | null>(null);

  const diasBounds = useMemo(() => numberBounds(animais.map((a) => a.diasEmEngorda)), [animais]);
  const [diasRange, setDiasRange] = useState<[number, number] | null>(null);

  const gmdBounds = useMemo(() => numberBounds(animais.map((a) => a.gmd)), [animais]);
  const [gmdRange, setGmdRange] = useState<[number, number] | null>(null);

  const categorias = useMemo(() => opcoes(animais.map((a) => a.categoria)), [animais]);
  const statuses = useMemo(() => opcoes(animais.map((a) => a.status)), [animais]);
  const lotes = useMemo(() => opcoes(animais.map((a) => a.lote)), [animais]);
  const entradas = useMemo(() => opcoes(animais.map((a) => a.entradaEngorda)), [animais]);
  const manejos = useMemo(() => opcoes(animais.map((a) => a.ultimoManejo)), [animais]);
  const destinos = useMemo(
    () => Array.from(new Set(animais.map((a) => a.destino).filter((d): d is NonNullable<typeof d> => d != null))),
    [animais],
  );

  const filtrados = useMemo(() => {
    const [idadeLo, idadeHi] = idadeRange ?? idadeBounds ?? [0, 0];
    const [diasLo, diasHi] = diasRange ?? diasBounds ?? [0, 0];
    const [gmdLo, gmdHi] = gmdRange ?? gmdBounds ?? [0, 0];
    return animais.filter((a) => {
      if (categoria && a.categoria !== categoria) return false;
      if (busca && !a.idAnimal.toLowerCase().includes(busca.toLowerCase())) return false;
      if (sexo && sexoLabel(a) !== sexo) return false;
      if (status && a.status !== status) return false;
      if (destino && destinoLabel(a) !== destino) return false;
      if (lote && a.lote !== lote) return false;
      if (entrada && a.entradaEngorda !== entrada) return false;
      if (ultimoManejo && a.ultimoManejo !== ultimoManejo) return false;
      if (idadeBounds && a.idadeDias != null && (a.idadeDias < idadeLo || a.idadeDias > idadeHi)) return false;
      if (diasBounds && a.diasEmEngorda != null && (a.diasEmEngorda < diasLo || a.diasEmEngorda > diasHi)) return false;
      if (gmdBounds && a.gmd != null && (a.gmd < gmdLo || a.gmd > gmdHi)) return false;
      return true;
    });
  }, [
    animais,
    categoria,
    busca,
    sexo,
    status,
    destino,
    lote,
    entrada,
    ultimoManejo,
    idadeRange,
    idadeBounds,
    diasRange,
    diasBounds,
    gmdRange,
    gmdBounds,
  ]);

  const metricas = useMemo(() => getRebanhoMetrics(filtrados), [filtrados]);
  const porCategoria = useMemo(() => contagemPorCategoria(filtrados), [filtrados]);

  const resumoColumns: DataTableColumn<AnimalRebanho>[] = [
    { key: 'id', header: 'N° manejo', cell: (a) => a.idAnimal, sortValue: (a) => a.idAnimal },
    { key: 'categoria', header: 'Categoria', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
    { key: 'idade', header: 'Idade (dias)', cell: (a) => formatNumber(a.idadeDias), sortValue: (a) => a.idadeDias },
    { key: 'status', header: 'Status', cell: (a) => a.status ?? '—', sortValue: (a) => a.status },
  ];

  const completaColumns: DataTableColumn<AnimalRebanho>[] = [
    { key: 'id', header: 'N° manejo', cell: (a) => a.idAnimal, sortValue: (a) => a.idAnimal },
    { key: 'sexo', header: 'Sexo', cell: sexoLabel },
    { key: 'categoria', header: 'Categoria', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
    { key: 'meses', header: 'Meses', cell: (a) => formatNumber(a.idadeMeses), sortValue: (a) => a.idadeMeses },
    { key: 'escore', header: 'Escore', cell: (a) => formatNumber(a.escore), sortValue: (a) => a.escore },
    { key: 'status', header: 'Status', cell: (a) => a.status ?? '—', sortValue: (a) => a.status },
    { key: 'gmd', header: 'GMD', cell: (a) => formatNumber(a.gmd), sortValue: (a) => a.gmd },
    { key: 'pdi', header: 'PDI', cell: (a) => formatNumber(a.pdi), sortValue: (a) => a.pdi },
    { key: 'lote', header: 'Lote', cell: (a) => a.lote ?? '—', sortValue: (a) => a.lote },
    { key: 'entrada', header: 'Entrada GMD', cell: (a) => a.entradaEngorda ?? '—', sortValue: (a) => a.entradaEngorda },
    { key: 'dias', header: 'Dias GMD', cell: (a) => formatNumber(a.diasEmEngorda), sortValue: (a) => a.diasEmEngorda },
    { key: 'destino', header: 'Destino', cell: destinoLabel, sortValue: (a) => a.destino },
    { key: 'manejo', header: 'Último manejo', cell: (a) => a.ultimoManejo ?? '—', sortValue: (a) => a.ultimoManejo },
  ];

  const csvColumns: CsvColumn<AnimalRebanho>[] = [
    { key: 'id', header: 'N° manejo', value: (a) => a.idAnimal },
    { key: 'sexo', header: 'Sexo', value: sexoLabel },
    { key: 'categoria', header: 'Categoria', value: (a) => a.categoria ?? '' },
    { key: 'idade', header: 'Idade (dias)', value: (a) => formatNumber(a.idadeDias) },
    { key: 'meses', header: 'Meses', value: (a) => formatNumber(a.idadeMeses) },
    { key: 'escore', header: 'Escore', value: (a) => formatNumber(a.escore) },
    { key: 'status', header: 'Status', value: (a) => a.status ?? '' },
    { key: 'gmd', header: 'GMD', value: (a) => formatNumber(a.gmd) },
    { key: 'pdi', header: 'PDI', value: (a) => formatNumber(a.pdi) },
    { key: 'lote', header: 'Lote', value: (a) => a.lote ?? '' },
    { key: 'entrada', header: 'Entrada GMD', value: (a) => a.entradaEngorda ?? '' },
    { key: 'dias', header: 'Dias GMD', value: (a) => formatNumber(a.diasEmEngorda) },
    { key: 'destino', header: 'Destino', value: destinoLabel },
    { key: 'manejo', header: 'Último manejo', value: (a) => a.ultimoManejo ?? '' },
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
        <FilterSelect label="Categoria" value={categoria} onChange={setCategoria} options={categorias} />
        <FilterSelect label="Sexo" value={sexo} onChange={setSexo} options={['Macho', 'Fêmea']} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statuses} />
        <FilterSelect label="Lote" value={lote} onChange={setLote} options={lotes} />
        <FilterSelect label="Entrada GMD" value={entrada} onChange={setEntrada} options={entradas} />
        <FilterSelect label="Último manejo" value={ultimoManejo} onChange={setUltimoManejo} options={manejos} />
        <FilterSelect
          label="Destino"
          value={destino}
          onChange={setDestino}
          options={destinos.map((d) => DESTINO_LABEL[d])}
        />
        {idadeBounds && (
          <FilterRange label="Idade (dias)" bounds={idadeBounds} value={idadeRange ?? idadeBounds} onChange={setIdadeRange} />
        )}
        {diasBounds && (
          <FilterRange label="Dias GMD" bounds={diasBounds} value={diasRange ?? diasBounds} onChange={setDiasRange} />
        )}
        {gmdBounds && <FilterRange label="GMD" bounds={gmdBounds} value={gmdRange ?? gmdBounds} onChange={setGmdRange} />}
      </div>

      <Tabs defaultValue="resumo">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="completa">Tabela completa</TabsTrigger>
          </TabsList>
          <CsvExport columns={csvColumns} rows={filtrados} requiredKeys={['id']} filename="rebanho" />
        </div>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
            {metricas.map((m) => (
              <MetricCard key={m.id} {...m} />
            ))}
          </div>
          {porCategoria.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <CategoriaDonut data={porCategoria} />
            </div>
          )}
          <DataTable columns={resumoColumns} rows={filtrados} rowKey={(a) => a.idAnimal} />
        </TabsContent>

        <TabsContent value="completa">
          <DataTable columns={completaColumns} rows={filtrados} rowKey={(a) => a.idAnimal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
