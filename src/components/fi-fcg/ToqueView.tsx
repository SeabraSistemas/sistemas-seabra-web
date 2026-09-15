'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { Donut } from '@/components/painel/Donut';
import { BarrasHorizontais } from '@/components/painel/BarrasHorizontais';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { contagemPor, contar, media, percentual } from '@/lib/painel/agregacao';
import { comparadorDataDesc, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { formatDia, formatNumber, formatPct } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegToque } from '@/lib/fi-fcg/types';

export function ToqueView({ dados }: { dados: PacoteLeitura<RegToque> }) {
  const itens = useMemo(() => desempacotar<RegToque>(dados.pacote), [dados.pacote]);

  const [data, setData] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [status, setStatus] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [destino, setDestino] = useState('');
  const [ecc, setEcc] = useState('');

  const condicoes = useMemo((): Condicao<RegToque>[] => [
    { key: 'data', test: (r) => !data || String(r.data) === data },
    { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
    { key: 'status', test: (r) => !status || r.status === status },
    { key: 'diagnostico', test: (r) => !diagnostico || r.diagnostico === diagnostico },
    { key: 'destino', test: (r) => !destino || r.destino === destino },
    { key: 'ecc', test: (r) => !ecc || r.escore === ecc },
  ], [data, fazenda, status, diagnostico, destino, ecc]);

  const datas = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'data', (r) => (r.data != null ? String(r.data) : null), comparadorDataDesc),
    [itens, condicoes],
  );
  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (r) => r.fazenda), [itens, condicoes]);
  const statuses = useMemo(() => opcoesExcluindo(itens, condicoes, 'status', (r) => r.status), [itens, condicoes]);
  const diagnosticos = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'diagnostico', (r) => r.diagnostico),
    [itens, condicoes],
  );
  const destinos = useMemo(() => opcoesExcluindo(itens, condicoes, 'destino', (r) => r.destino), [itens, condicoes]);
  const eccs = useMemo(
    () => opcoesExcluindo(itens, condicoes, 'ecc', (r) => r.escore, (a, b) => Number(a.replace(',', '.')) - Number(b.replace(',', '.'))),
    [itens, condicoes],
  );

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  const total = filtrados.length;
  const escoreMedio = useMemo(() => media(filtrados.map((r) => r.escoreNum)), [filtrados]);
  const idadeMedia = useMemo(() => media(filtrados.map((r) => r.idadeAnos)), [filtrados]);
  // Looker exclui do Diagnóstico os toques sem Data preenchida (63 linhas) — replicamos aqui
  // para o "Vazia"/"Prenha" bater com o dashboard antigo (2.988 -> 2.926 vazias).
  const comDataParaDiagnostico = useMemo(() => filtrados.filter((r) => r.data != null), [filtrados]);
  const vaziaCount = useMemo(
    () => contar(comDataParaDiagnostico, (r) => r.diagnostico === 'Vazia'),
    [comDataParaDiagnostico],
  );
  const prenhaPct = percentual(comDataParaDiagnostico.length - vaziaCount, comDataParaDiagnostico.length);
  const vaziaPct = percentual(vaziaCount, comDataParaDiagnostico.length);

  const porDiagnostico = useMemo(() => contagemPor(comDataParaDiagnostico, (r) => r.diagnostico), [comDataParaDiagnostico]);
  const porStatus = useMemo(() => contagemPor(filtrados, (r) => r.status), [filtrados]);
  const porDestino = useMemo(() => contagemPor(filtrados, (r) => r.destino), [filtrados]);

  const colunas: DataTableColumn<RegToque>[] = [
    { key: 'id', header: 'ID', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'status', header: 'Status', cell: (r) => r.status ?? '—', sortValue: (r) => r.status },
    { key: 'idade', header: 'Idade (a...)', cell: (r) => formatNumber(r.idadeAnos), sortValue: (r) => r.idadeAnos },
    { key: 'destino', header: 'Destino', cell: (r) => r.destino ?? '—', sortValue: (r) => r.destino },
    {
      key: 'dg',
      header: 'DG',
      cell: (r) =>
        r.diagnostico ? (
          <span className={r.diagnostico === 'Vazia' ? 'text-destructive' : 'text-emerald-400'}>{r.diagnostico}</span>
        ) : (
          '—'
        ),
      sortValue: (r) => r.diagnostico,
    },
    { key: 'escore', header: 'Escore', cell: (r) => r.escore ?? '—', sortValue: (r) => r.escoreNum },
    { key: 'obs', header: 'Observação', cell: (r) => r.observacao ?? '—' },
  ];

  const csvColunas: CsvColumn<RegToque>[] = [
    { key: 'data', header: 'Data do toque', value: (r) => formatDia(r.data) },
    { key: 'id', header: 'ID', value: (r) => r.id },
    { key: 'fazenda', header: 'Fazenda', value: (r) => r.fazenda ?? '' },
    { key: 'lote', header: 'Lote', value: (r) => r.lote ?? '' },
    { key: 'status', header: 'Status', value: (r) => r.status ?? '' },
    { key: 'idade', header: 'Idade (anos)', value: (r) => formatNumber(r.idadeAnos) },
    { key: 'destino', header: 'Destino', value: (r) => r.destino ?? '' },
    { key: 'diagnostico', header: 'Diagnóstico', value: (r) => r.diagnostico ?? '' },
    { key: 'escore', header: 'Escore', value: (r) => r.escore ?? '' },
    { key: 'reproducao', header: 'Reprodução', value: (r) => r.reproducao ?? '' },
    { key: 'touroIatf', header: 'Touro IATF', value: (r) => r.touroIatf ?? '' },
    { key: 'peso', header: 'Peso/kg', value: (r) => formatNumber(r.pesoKg) },
    { key: 'obs', header: 'Observação', value: (r) => r.observacao ?? '' },
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
        <FilterSelect label="Data do toque" value={data} onChange={setData} options={datas} labelDe={(v) => formatDia(Number(v))} />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={statuses} />
        <FilterSelect label="Diagnóstico" value={diagnostico} onChange={setDiagnostico} options={diagnosticos} />
        <FilterSelect label="Destino" value={destino} onChange={setDestino} options={destinos} triggerClassName="w-full sm:w-48" />
        <FilterSelect label="ECC" value={ecc} onChange={setEcc} options={eccs} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard id="total" label="Total" value={formatNumber(total)} />
        <MetricCard id="escore" label="Escore" value={formatNumber(escoreMedio)} />
        <MetricCard id="idade" label="Idade (anos)" value={formatNumber(idadeMedia)} />
        <MetricCard id="prenha" label="Prenha" value={formatPct(prenhaPct, 2)} tom="bom" />
        <MetricCard id="vazia" label="Vazia" value={formatPct(vaziaPct, 2)} tom="ruim" />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="completa">Tabela completa</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Diagnóstico</h3>
              <Donut dados={porDiagnostico} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Status</h3>
              <Donut dados={porStatus} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Destino</h3>
              <Donut dados={porDestino} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Total por diagnóstico</h3>
              <BarrasHorizontais dados={porDiagnostico} maximo={8} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_toque" />
          </div>
          <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
        </TabsContent>

        <TabsContent value="completa" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{filtrados.length} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_toque" />
          </div>
          <DataTable
            columns={[
              { key: 'data', header: 'Data', cell: (r) => formatDia(r.data), sortValue: (r) => r.data },
              ...colunas,
              { key: 'fazenda', header: 'Fazenda', cell: (r) => r.fazenda ?? '—', sortValue: (r) => r.fazenda },
              { key: 'lote', header: 'Lote', cell: (r) => r.lote ?? '—', sortValue: (r) => r.lote },
              { key: 'reproducao', header: 'Reprodução', cell: (r) => r.reproducao ?? '—', sortValue: (r) => r.reproducao },
              { key: 'touroIatf', header: 'Touro IATF', cell: (r) => r.touroIatf ?? '—', sortValue: (r) => r.touroIatf },
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
