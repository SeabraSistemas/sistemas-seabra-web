'use client';

import { useMemo, useState } from 'react';
import { MetricCard } from '@/components/painel/MetricCard';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterMaiorQue } from '@/components/painel/FilterMaiorQue';
import { FilterBusca } from '@/components/painel/FilterBusca';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { FichaAnimalHistorico } from '@/components/fi-fcg/FichaAnimalHistorico';
import { filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { diasEntre, formatDia, formatIdadeQuebrada, formatNumber, idadeQuebrada } from '@/lib/painel/format';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteMonitor } from '@/lib/fi-fcg/pacotes';
import type { AnimalMonitorado } from '@/lib/fi-fcg/manejo';
import type { DiaCompacto } from '@/lib/fi-fcg/types';

/** Mesmos limiares de cor do achado original (Bloco D) — acima disso a linha fica vermelha/âmbar. */
const DIAS_ALERTA = 90;
const DIAS_AVISO = 30;

function corDias(dias: number | null): string | undefined {
  if (dias == null) return 'text-destructive';
  if (dias > DIAS_ALERTA) return 'text-destructive';
  if (dias > DIAS_AVISO) return 'text-amber-400';
  return undefined;
}

/**
 * "Monitorar" (21/09/2026) — animais ATIVOS há muitos dias sem manejo. O
 * filtro de "Dias sem manejo" é "maior que" (`FilterMaiorQue`), não um
 * de/até: essa métrica não tem teto natural. Por padrão a lista já vem
 * ordenada do pior caso pro melhor (nunca manejado primeiro, depois quem
 * está há mais dias) — clicar num cabeçalho de coluna assume o controle do
 * sort a partir daí (mesmo `DataTable` de sempre).
 */
export function MonitorarView({ dados, hoje }: { dados: PacoteMonitor; hoje: DiaCompacto }) {
  const itens = useMemo(() => desempacotar<AnimalMonitorado>(dados.animais), [dados.animais]);

  const [busca, setBusca] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [diasMin, setDiasMin] = useState<number | null>(150);
  const [animalAberto, setAnimalAberto] = useState<AnimalMonitorado | null>(null);

  const condicoes = useMemo((): Condicao<AnimalMonitorado>[] => [
    { key: 'busca', test: (a) => !busca || a.id.toLowerCase().includes(busca.toLowerCase()) },
    { key: 'fazenda', test: (a) => !fazenda || a.fazenda === fazenda },
    { key: 'categoria', test: (a) => !categoria || a.categoria === categoria },
    {
      key: 'dias',
      test: (a) => {
        if (diasMin == null) return true;
        return a.diasSemManejo == null || a.diasSemManejo > diasMin;
      },
    },
  ], [busca, fazenda, categoria, diasMin]);

  const fazendas = useMemo(() => opcoesExcluindo(itens, condicoes, 'fazenda', (a) => a.fazenda), [itens, condicoes]);
  const categorias = useMemo(() => opcoesExcluindo(itens, condicoes, 'categoria', (a) => a.categoria), [itens, condicoes]);

  const filtrados = useMemo(() => filtrarPor(itens, condicoes), [itens, condicoes]);

  // Base pra "Animais ativos monitorados": mesmos filtros de Fazenda/Categoria/ID,
  // mas SEM o corte de "Dias sem manejo" — é o rebanho de onde `filtrados` é um recorte.
  const condicoesSemDias = useMemo(() => condicoes.filter((c) => c.key !== 'dias'), [condicoes]);
  const totalAtivos = useMemo(() => filtrarPor(itens, condicoesSemDias).length, [itens, condicoesSemDias]);

  // Pior caso primeiro: nunca manejado (null) antes de qualquer número, depois do maior pro menor.
  const ordenados = useMemo(
    () =>
      [...filtrados].sort((a, b) => {
        if (a.diasSemManejo == null && b.diasSemManejo == null) return 0;
        if (a.diasSemManejo == null) return -1;
        if (b.diasSemManejo == null) return 1;
        return b.diasSemManejo - a.diasSemManejo;
      }),
    [filtrados],
  );

  const totalNuncaManejado = useMemo(() => filtrados.filter((a) => a.diasSemManejo == null).length, [filtrados]);

  const colunas: DataTableColumn<AnimalMonitorado>[] = [
    { key: 'fazenda', header: 'Fazenda', cell: (a) => a.fazenda ?? '—', sortValue: (a) => a.fazenda },
    { key: 'id', header: 'ID animal', cell: (a) => a.id, sortValue: (a) => a.id },
    { key: 'categoria', header: 'Categoria', cell: (a) => a.categoria ?? '—', sortValue: (a) => a.categoria },
    { key: 'sexo', header: 'Sexo', cell: (a) => a.sexo ?? '—', sortValue: (a) => a.sexo },
    {
      key: 'idade',
      header: 'Idade',
      cell: (a) => formatIdadeQuebrada(idadeQuebrada(a.nascimento, hoje)),
      sortValue: (a) => diasEntre(a.nascimento, hoje),
    },
    {
      key: 'ultimoManejo',
      header: 'Último|manejo',
      cell: (a) => (a.ultimoManejo != null ? formatDia(a.ultimoManejo) : '—'),
      sortValue: (a) => a.ultimoManejo,
    },
    {
      key: 'diasSemManejo',
      header: 'Dias sem|manejo',
      cell: (a) => (
        <span className={corDias(a.diasSemManejo)}>{a.diasSemManejo != null ? formatNumber(a.diasSemManejo) : 'nunca'}</span>
      ),
      sortValue: (a) => a.diasSemManejo,
    },
  ];

  const csvColunas: CsvColumn<AnimalMonitorado>[] = [
    { key: 'fazenda', header: 'Fazenda', value: (a) => a.fazenda ?? '' },
    { key: 'id', header: 'ID animal', value: (a) => a.id },
    { key: 'categoria', header: 'Categoria', value: (a) => a.categoria ?? '' },
    { key: 'sexo', header: 'Sexo', value: (a) => a.sexo ?? '' },
    { key: 'nascimento', header: 'Data de nascimento', value: (a) => (a.nascimento != null ? formatDia(a.nascimento) : '') },
    { key: 'idade', header: 'Idade', value: (a) => formatIdadeQuebrada(idadeQuebrada(a.nascimento, hoje)) },
    { key: 'ultimoManejo', header: 'Último manejo', value: (a) => (a.ultimoManejo != null ? formatDia(a.ultimoManejo) : '') },
    { key: 'diasSemManejo', header: 'Dias sem manejo', value: (a) => formatNumber(a.diasSemManejo) },
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
        <FilterMaiorQue
          label="Dias sem manejo"
          value={diasMin}
          onChange={setDiasMin}
          info={{
            oQue: 'Quantos dias sem nenhum lançamento um animal precisa ter pra entrar nessa lista.',
            ajuda: 'A partir do número de dias que você colocar, o sistema busca os animais que não têm nenhum lançamento registrado de lá pra cá.',
            como: 'Digite os dias e clique em Salvar. Já vem com 150 preenchido — pode editar quando quiser.',
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard id="total" label="Animais ativos monitorados" value={formatNumber(totalAtivos)} />
        <MetricCard
          id="semManejo"
          label={diasMin != null ? `Sem manejo há mais de ${formatNumber(diasMin)} dias` : 'Sem manejo'}
          value={formatNumber(filtrados.length)}
          detalhe={`de ${formatNumber(totalAtivos)}`}
          tom={filtrados.length > 0 ? 'ruim' : undefined}
        />
        <MetricCard
          id="nunca"
          label="Nunca teve manejo registrado"
          value={formatNumber(totalNuncaManejado)}
          detalhe={`de ${formatNumber(filtrados.length)}`}
          tom={totalNuncaManejado > 0 ? 'ruim' : undefined}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {formatNumber(filtrados.length)} animais · clique numa linha pra ver o histórico
        </h2>
        <CsvExport columns={csvColunas} rows={ordenados} requiredKeys={['id']} filename="fi_fcg_monitorar" />
      </div>
      <DataTable columns={colunas} rows={ordenados} rowKey={(a) => a.id} onRowClick={(a) => setAnimalAberto(a)} />

      <FichaAnimalHistorico animal={animalAberto} hoje={hoje} onFechar={() => setAnimalAberto(null)} />
    </div>
  );
}
