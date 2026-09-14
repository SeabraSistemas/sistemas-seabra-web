'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { BarrasHorizontais } from '@/components/painel/BarrasHorizontais';
import { SerieMensal } from '@/components/painel/SerieMensal';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterPeriodo } from '@/components/painel/FilterPeriodo';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { dentroPeriodo, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { desempacotar } from '@/lib/painel/pacote';
import { diaDeInput, formatDia, formatMoeda, formatNumber, formatPct, hojeCompacto } from '@/lib/painel/format';
import {
  aConferir,
  baixadasMensal,
  perdasMensais,
  receitaMensal,
  receitaPor,
  resumoFinanceiro,
  vendidasMensal,
  type EventoFin,
  type ItemConferir,
  type ProblemaFin,
} from '@/lib/fi-fcg/financeiro';
import type { PacoteFinanceiro } from '@/lib/fi-fcg/pacotes';
import type { LancamentoFinanceiro } from '@/lib/fi-fcg/types';

const PROBLEMA_LABEL: Record<ProblemaFin, string> = {
  'venda-sem-valor': 'Venda sem valor',
  'venda-valor-suspeito': 'Venda com valor suspeito',
  'venda-sem-peso': 'Venda sem peso',
  'data-invalida-ou-futura': 'Data inválida ou futura',
  'baixa-sem-valor': 'Baixa (Morte/Matula) sem valor',
  'sem-lancamento': 'Sem lançamento no livro-caixa',
  'lancamento-orfao': 'Lançamento sem evento correspondente',
  'valor-diverge': 'Valor diverge do livro-caixa',
};

export function FinanceiroView({ dados }: { dados: PacoteFinanceiro }) {
  const eventos = useMemo(() => desempacotar<EventoFin>(dados.eventos), [dados.eventos]);
  const orfaos = useMemo(() => desempacotar<LancamentoFinanceiro>(dados.orfaos), [dados.orfaos]);
  const hoje = useMemo(() => hojeCompacto(), []);

  const [fazenda, setFazenda] = useState('');
  const [cliente, setCliente] = useState('');
  const [tipo, setTipo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const condicoes = useMemo((): Condicao<EventoFin>[] => {
    const inicio = diaDeInput(dataInicio);
    const fim = diaDeInput(dataFim);
    return [
      { key: 'fazenda', test: (e) => !fazenda || e.fazenda === fazenda },
      { key: 'cliente', test: (e) => !cliente || e.cliente === cliente },
      { key: 'tipo', test: (e) => !tipo || e.tipo === tipo },
      { key: 'periodo', test: (e) => dentroPeriodo(e.data, inicio, fim) },
    ];
  }, [fazenda, cliente, tipo, dataInicio, dataFim]);

  const fazendas = useMemo(() => opcoesExcluindo(eventos, condicoes, 'fazenda', (e) => e.fazenda), [eventos, condicoes]);
  const clientes = useMemo(() => opcoesExcluindo(eventos, condicoes, 'cliente', (e) => e.cliente), [eventos, condicoes]);
  const tipos = useMemo(() => opcoesExcluindo(eventos, condicoes, 'tipo', (e) => e.tipo), [eventos, condicoes]);

  const filtrados = useMemo(() => filtrarPor(eventos, condicoes), [eventos, condicoes]);

  // Os órfãos não têm Fazenda/Cliente confiáveis (a Fazenda do livro-caixa é
  // sempre "Inhumas" — ver financeiro.ts), então só o Período se aplica a eles.
  const orfaosFiltrados = useMemo(() => {
    const inicio = diaDeInput(dataInicio);
    const fim = diaDeInput(dataFim);
    return orfaos.filter((o) => dentroPeriodo(o.data, inicio, fim));
  }, [orfaos, dataInicio, dataFim]);

  const resumo = useMemo(() => resumoFinanceiro(filtrados), [filtrados]);
  const serieReceita = useMemo(() => receitaMensal(filtrados), [filtrados]);
  const seriePerdas = useMemo(() => perdasMensais(filtrados), [filtrados]);
  const serieVendidas = useMemo(() => vendidasMensal(filtrados), [filtrados]);
  const serieBaixadas = useMemo(() => baixadasMensal(filtrados), [filtrados]);
  const porCliente = useMemo(() => receitaPor(filtrados, (e) => e.cliente, 'Sem cliente'), [filtrados]);
  const porFazenda = useMemo(() => receitaPor(filtrados, (e) => e.fazenda, 'Sem fazenda'), [filtrados]);

  const [problema, setProblema] = useState('');
  const conferir = useMemo(() => aConferir(filtrados, orfaosFiltrados, hoje), [filtrados, orfaosFiltrados, hoje]);
  const conferirFiltrado = useMemo(
    () => (problema ? conferir.filter((i) => i.problema === problema) : conferir),
    [conferir, problema],
  );
  const problemasPresentes = useMemo(() => {
    const set = new Set(conferir.map((i) => PROBLEMA_LABEL[i.problema]));
    return Array.from(set).sort();
  }, [conferir]);

  const vendasFiltradas = useMemo(() => filtrados.filter((e) => e.tipo === 'Venda'), [filtrados]);
  const perdasFiltradas = useMemo(
    () => filtrados.filter((e) => e.tipo === 'Morte' || e.tipo === 'Matula' || e.tipo === 'Aborto'),
    [filtrados],
  );

  const colunasVendas: DataTableColumn<EventoFin>[] = [
    { key: 'data', header: 'Data', cell: (e) => formatDia(e.data), sortValue: (e) => e.data },
    { key: 'id', header: 'ID animal', cell: (e) => e.idAnimal ?? e.id, sortValue: (e) => e.idAnimal ?? e.id },
    { key: 'cliente', header: 'Cliente', cell: (e) => e.cliente ?? '—', sortValue: (e) => e.cliente },
    { key: 'fazenda', header: 'Fazenda', cell: (e) => e.fazenda ?? '—', sortValue: (e) => e.fazenda },
    { key: 'peso', header: 'Peso/kg', cell: (e) => formatNumber(e.pesoKg), sortValue: (e) => e.pesoKg },
    {
      key: 'valor',
      header: 'Valor',
      cell: (e) => (
        <span className={e.statusValorVenda === 'ok' ? undefined : 'text-amber-400'}>
          {e.valorEvento != null ? formatMoeda(e.valorEvento) : 'Sem valor'}
        </span>
      ),
      sortValue: (e) => e.valorEvento,
    },
  ];

  const colunasPerdas: DataTableColumn<EventoFin>[] = [
    { key: 'data', header: 'Data', cell: (e) => formatDia(e.data), sortValue: (e) => e.data },
    { key: 'tipo', header: 'Tipo', cell: (e) => e.tipo, sortValue: (e) => e.tipo },
    { key: 'id', header: 'ID animal', cell: (e) => e.idAnimal ?? e.id, sortValue: (e) => e.idAnimal ?? e.id },
    { key: 'categoria', header: 'Categoria', cell: (e) => e.categoria ?? '—', sortValue: (e) => e.categoria },
    { key: 'causa', header: 'Causa', cell: (e) => e.causa ?? '—', sortValue: (e) => e.causa },
    { key: 'fazenda', header: 'Fazenda', cell: (e) => e.fazenda ?? '—', sortValue: (e) => e.fazenda },
    {
      key: 'valor',
      header: 'Valor',
      cell: (e) => (e.valorMetrica != null ? formatMoeda(e.valorMetrica) : <span className="text-amber-400">Sem valor</span>),
      sortValue: (e) => e.valorMetrica,
    },
  ];

  const colunasConferir: DataTableColumn<ItemConferir>[] = [
    { key: 'problema', header: 'Problema', cell: (i) => PROBLEMA_LABEL[i.problema], sortValue: (i) => PROBLEMA_LABEL[i.problema] },
    {
      key: 'origem',
      header: 'Origem/Tipo',
      cell: (i) => i.evento?.tipo ?? 'Livro-caixa',
    },
    { key: 'id', header: 'ID', cell: (i) => i.evento?.idAnimal ?? i.evento?.id ?? i.lancamentoOrfao?.identificacao ?? '—' },
    {
      key: 'data',
      header: 'Data',
      cell: (i) => formatDia(i.evento?.data ?? i.lancamentoOrfao?.data ?? null),
      sortValue: (i) => i.evento?.data ?? i.lancamentoOrfao?.data ?? null,
    },
    {
      key: 'valorEvento',
      header: 'Valor (evento)',
      cell: (i) => (i.evento ? formatMoeda(i.evento.valorEvento) : '—'),
    },
    {
      key: 'valorLancado',
      header: 'Valor (livro-caixa)',
      cell: (i) => formatMoeda(i.evento?.valorLancado ?? i.lancamentoOrfao?.valor ?? null),
    },
  ];

  const csvColunasConferir: CsvColumn<ItemConferir>[] = [
    { key: 'problema', header: 'Problema', value: (i) => PROBLEMA_LABEL[i.problema] },
    { key: 'origem', header: 'Origem/Tipo', value: (i) => i.evento?.tipo ?? 'Livro-caixa' },
    { key: 'id', header: 'ID', value: (i) => i.evento?.idAnimal ?? i.evento?.id ?? i.lancamentoOrfao?.identificacao ?? '' },
    { key: 'data', header: 'Data', value: (i) => formatDia(i.evento?.data ?? i.lancamentoOrfao?.data ?? null) },
    { key: 'valorEvento', header: 'Valor (evento)', value: (i) => (i.evento ? formatMoeda(i.evento.valorEvento) : '') },
    { key: 'valorLancado', header: 'Valor (livro-caixa)', value: (i) => formatMoeda(i.evento?.valorLancado ?? i.lancamentoOrfao?.valor ?? null) },
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
        <FilterPeriodo inicio={dataInicio} fim={dataFim} onInicioChange={setDataInicio} onFimChange={setDataFim} />
        <FilterSelect label="Fazenda" value={fazenda} onChange={setFazenda} options={fazendas} />
        <FilterSelect label="Cliente" value={cliente} onChange={setCliente} options={clientes} />
        <FilterSelect label="Tipo" value={tipo} onChange={setTipo} options={tipos} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard id="cabecasVendidas" label="Cabeças vendidas" value={formatNumber(resumo.cabecasVendidas)} />
        <MetricCard
          id="kgVendidos"
          label="Kg vendidos"
          value={formatNumber(resumo.kgVendidos)}
          detalhe={`com peso ${formatNumber(resumo.vendasComPeso)} de ${formatNumber(resumo.cabecasVendidas)}`}
        />
        <MetricCard
          id="receita"
          label="Receita registrada"
          value={formatMoeda(resumo.receitaRegistrada)}
          detalhe={`vendas com valor ${formatNumber(resumo.vendasComValorOk)} de ${formatNumber(resumo.cabecasVendidas)}`}
          tom="bom"
        />
        <MetricCard id="ticket" label="Ticket médio" value={formatMoeda(resumo.ticketMedio)} />
        <MetricCard
          id="perdas"
          label="Perdas registradas"
          value={formatMoeda(resumo.perdasRegistradas)}
          detalhe={`Morte/Matula ${formatMoeda(resumo.perdasMorteMatula)} + Aborto ${formatMoeda(resumo.perdasAborto)}`}
          tom="ruim"
        />
        <MetricCard id="baixadas" label="Cabeças baixadas" value={formatNumber(resumo.cabecasBaixadas)} />
        <MetricCard id="abortos" label="Abortos" value={formatNumber(resumo.abortos)} />
        <MetricCard
          id="resultado"
          label="Resultado registrado"
          value={formatMoeda(resumo.resultadoRegistrado)}
          tom={resumo.resultadoRegistrado >= 0 ? 'bom' : 'ruim'}
        />
        <MetricCard
          id="percentual"
          label="Perdas/Receita"
          value={formatPct(resumo.percentualPerdasReceita)}
          detalhe={`cobertura ${formatNumber(resumo.vendasComValorOk)} de ${formatNumber(resumo.cabecasVendidas)} vendas`}
          tom="ruim"
        />
      </div>

      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="perdas">Perdas</TabsTrigger>
          <TabsTrigger value="conferir">A conferir{conferir.length > 0 ? ` (${conferir.length})` : ''}</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Receita × Perdas (R$), por mês</h3>
              <SerieMensal
                series={[
                  { chave: 'receita', nome: 'Receita', cor: '#199e70', pontos: serieReceita },
                  { chave: 'perdas', nome: 'Perdas', cor: '#d95926', pontos: seriePerdas },
                ]}
                formatoValor={formatMoeda}
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Vendidas × Baixadas (cabeças), por mês</h3>
              <SerieMensal
                series={[
                  { chave: 'vendidas', nome: 'Vendidas', cor: '#3987e5', pontos: serieVendidas },
                  { chave: 'baixadas', nome: 'Baixadas', cor: '#d55181', pontos: serieBaixadas },
                ]}
                formatoValor={formatNumber}
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Receita por cliente</h3>
              <BarrasHorizontais dados={porCliente} formatoValor={formatMoeda} />
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">Receita por fazenda</h3>
              <BarrasHorizontais dados={porFazenda} formatoValor={formatMoeda} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vendas" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{vendasFiltradas.length} vendas</h2>
            <CsvExport
              columns={[
                { key: 'data', header: 'Data', value: (e: EventoFin) => formatDia(e.data) },
                { key: 'id', header: 'ID animal', value: (e: EventoFin) => e.idAnimal ?? e.id },
                { key: 'cliente', header: 'Cliente', value: (e: EventoFin) => e.cliente ?? '' },
                { key: 'fazenda', header: 'Fazenda', value: (e: EventoFin) => e.fazenda ?? '' },
                { key: 'peso', header: 'Peso/kg', value: (e: EventoFin) => formatNumber(e.pesoKg) },
                { key: 'valor', header: 'Valor', value: (e: EventoFin) => formatMoeda(e.valorEvento) },
              ]}
              rows={vendasFiltradas}
              requiredKeys={['id']}
              filename="fi_fcg_vendas"
            />
          </div>
          <DataTable columns={colunasVendas} rows={vendasFiltradas} rowKey={(e) => e.id} />
        </TabsContent>

        <TabsContent value="perdas" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{perdasFiltradas.length} baixas com perda</h2>
            <CsvExport
              columns={[
                { key: 'data', header: 'Data', value: (e: EventoFin) => formatDia(e.data) },
                { key: 'tipo', header: 'Tipo', value: (e: EventoFin) => e.tipo },
                { key: 'id', header: 'ID animal', value: (e: EventoFin) => e.idAnimal ?? e.id },
                { key: 'categoria', header: 'Categoria', value: (e: EventoFin) => e.categoria ?? '' },
                { key: 'causa', header: 'Causa', value: (e: EventoFin) => e.causa ?? '' },
                { key: 'fazenda', header: 'Fazenda', value: (e: EventoFin) => e.fazenda ?? '' },
                { key: 'valor', header: 'Valor', value: (e: EventoFin) => formatMoeda(e.valorMetrica) },
              ]}
              rows={perdasFiltradas}
              requiredKeys={['id']}
              filename="fi_fcg_perdas"
            />
          </div>
          <DataTable columns={colunasPerdas} rows={perdasFiltradas} rowKey={(e) => e.id} />
        </TabsContent>

        <TabsContent value="conferir" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <FilterSelect label="Problema" value={problema} onChange={setProblema} options={problemasPresentes} triggerClassName="w-full sm:w-64" />
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">{conferirFiltrado.length} itens</h2>
              <CsvExport columns={csvColunasConferir} rows={conferirFiltrado} requiredKeys={['problema']} filename="fi_fcg_a_conferir" />
            </div>
          </div>
          <DataTable
            columns={colunasConferir}
            rows={conferirFiltrado}
            rowKey={(i) => `${i.problema}-${i.evento?.id ?? i.lancamentoOrfao?.id ?? ''}`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
