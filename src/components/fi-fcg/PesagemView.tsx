'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/painel/MetricCard';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { FilterSelect } from '@/components/painel/FilterSelect';
import { FilterRange } from '@/components/painel/FilterRange';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { WeightLossBadge } from '@/components/painel/WeightLossBadge';
import { media, soma } from '@/lib/painel/agregacao';
import { comparadorDataDesc, dentroFaixa, filtrarPor, opcoesExcluindo, type Condicao } from '@/lib/painel/filters';
import { desempacotar } from '@/lib/painel/pacote';
import { formatCompacto, formatDia, formatNumber, hojeCompacto, numberBounds } from '@/lib/painel/format';
import { montarLotesEngorda, type AnimalDoLote } from '@/lib/fi-fcg/engorda';
import type { PacoteLeitura } from '@/lib/fi-fcg/pacotes';
import type { RegPesagem, RegRebanho } from '@/lib/fi-fcg/types';

const SITUACAO_LABEL: Record<AnimalDoLote['situacao'], string> = {
  ativo: 'Ativo',
  vendido: 'Vendido',
  baixado: 'Baixado',
};
const SITUACAO_VARIANTE: Record<AnimalDoLote['situacao'], 'outline' | 'secondary' | 'destructive'> = {
  ativo: 'outline',
  vendido: 'secondary',
  baixado: 'destructive',
};

export function PesagemView({
  dados,
  engorda,
}: {
  dados: PacoteLeitura<RegPesagem>;
  engorda: PacoteLeitura<RegRebanho>;
}) {
  const itens = useMemo(() => desempacotar<RegPesagem>(dados.pacote), [dados.pacote]);
  const animaisEmEngorda = useMemo(() => desempacotar<RegRebanho>(engorda.pacote), [engorda.pacote]);

  const [data, setData] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [soPerdaPeso, setSoPerdaPeso] = useState(false);

  const pesoBounds = useMemo(() => numberBounds(itens.map((r) => r.pesoKg)), [itens]);
  const [pesoRange, setPesoRange] = useState<[number, number] | null>(null);

  const diasBounds = useMemo(() => numberBounds(itens.map((r) => r.diasEngorda)), [itens]);
  const [diasRange, setDiasRange] = useState<[number, number] | null>(null);

  const condicoes = useMemo((): Condicao<RegPesagem>[] => [
    { key: 'data', test: (r) => !data || String(r.data) === data },
    { key: 'fazenda', test: (r) => !fazenda || r.fazenda === fazenda },
    { key: 'peso', test: (r) => dentroFaixa(r.pesoKg, pesoBounds, pesoRange) },
    { key: 'dias', test: (r) => dentroFaixa(r.diasEngorda, diasBounds, diasRange) },
    { key: 'soPerdaPeso', test: (r) => !soPerdaPeso || (r.diferencaKg != null && r.diferencaKg < 0) },
  ], [data, fazenda, pesoBounds, pesoRange, diasBounds, diasRange, soPerdaPeso]);

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

  const hoje = useMemo(() => hojeCompacto(), []);
  const lotesEngorda = useMemo(() => montarLotesEngorda(animaisEmEngorda, hoje), [animaisEmEngorda, hoje]);
  const [lotesAbertos, setLotesAbertos] = useState<Set<string>>(new Set());
  const alternarLote = (chave: string) =>
    setLotesAbertos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });

  const colunasAnimalLote: DataTableColumn<AnimalDoLote>[] = [
    { key: 'id', header: 'Animal', cell: (a) => a.id, sortValue: (a) => a.id },
    {
      key: 'situacao',
      header: 'Situação',
      cell: (a) => (
        <span className="inline-flex items-center gap-2">
          <Badge variant={SITUACAO_VARIANTE[a.situacao]}>{SITUACAO_LABEL[a.situacao]}</Badge>
          {a.situacao === 'baixado' && a.causaBaixa && (
            <span className="text-xs text-muted-foreground">{a.causaBaixa}</span>
          )}
        </span>
      ),
      sortValue: (a) => a.situacao,
    },
    { key: 'gmd', header: 'GMD atual', cell: (a) => formatNumber(a.gmdAtual), sortValue: (a) => a.gmdAtual },
    {
      key: 'pesoEntrada',
      header: 'Peso entrada',
      cell: (a) => formatNumber(a.pesoEntradaEngorda),
      sortValue: (a) => a.pesoEntradaEngorda,
    },
  ];

  const colunas: DataTableColumn<RegPesagem>[] = [
    { key: 'id', header: 'Animal', cell: (r) => r.id, sortValue: (r) => r.id },
    { key: 'peso', header: 'Peso|Kg', cell: (r) => formatNumber(r.pesoKg), sortValue: (r) => r.pesoKg },
    {
      key: 'diferenca',
      header: 'Diferença',
      cell: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className={r.diferencaKg != null && r.diferencaKg < 0 ? 'text-destructive' : undefined}>
            {formatNumber(r.diferencaKg)}
          </span>
          <WeightLossBadge diferencaKg={r.diferencaKg} />
        </span>
      ),
      sortValue: (r) => r.diferencaKg,
    },
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
    { key: 'diferenca', header: 'Diferença (última pesagem)', value: (r) => formatNumber(r.diferencaKg) },
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
        <Button
          type="button"
          variant={soPerdaPeso ? 'default' : 'outline'}
          size="sm"
          aria-pressed={soPerdaPeso}
          onClick={() => setSoPerdaPeso((v) => !v)}
          className="gap-1.5"
        >
          <TrendingDown className="size-3.5" />
          Perdendo peso
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard id="total" label="Total" value={formatCompacto(total)} />
        <MetricCard id="mediaKg" label="Média/Kg" value={formatNumber(mediaKg)} />
        <MetricCard id="totalKg" label="Total/Kg" value={formatCompacto(totalKg)} />
        <MetricCard id="mediaGmd" label="Média/GMD" value={formatNumber(mediaGmd)} />
        <MetricCard id="mediaPdi" label="Média/PDI" value={formatNumber(mediaPdi)} />
        <MetricCard id="mediaGpdi" label="Média/GPDi" value={formatNumber(mediaGpdi)} />
      </div>

      <Tabs defaultValue="tabela">
        <TabsList>
          <TabsTrigger value="tabela">Tabela</TabsTrigger>
          <TabsTrigger value="lotes">Lotes de engorda</TabsTrigger>
        </TabsList>

        <TabsContent value="tabela" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{formatNumber(filtrados.length)} registros</h2>
            <CsvExport columns={csvColunas} rows={filtrados} requiredKeys={['id']} filename="fi_fcg_pesagem" />
          </div>
          <DataTable columns={colunas} rows={filtrados} rowKey={(r) => r.id} />
        </TabsContent>

        <TabsContent value="lotes" className="flex flex-col gap-3">
          {lotesEngorda.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Nenhum animal com &quot;Entrada engorda&quot; preenchida no momento.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lotesEngorda.map((lote) => {
                const chave = `${lote.fazenda}|${lote.entrada}`;
                const aberto = lotesAbertos.has(chave);
                return (
                  <div
                    key={chave}
                    className={`rounded-xl border border-border bg-card p-5 ${aberto ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground">{lote.nome}</h3>
                      <span className="text-xs text-muted-foreground">{lote.fazenda}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Entrada {formatDia(lote.entrada)}
                      {lote.diasDesdeEntrada != null && ` · ${formatNumber(lote.diasDesdeEntrada)} dias atrás`}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Animais</p>
                        <p className="text-lg font-semibold tabular-nums">{formatNumber(lote.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ainda em engorda</p>
                        <p className="text-lg font-semibold tabular-nums">{formatNumber(lote.ativos)}</p>
                        {(lote.vendidos > 0 || lote.baixados > 0) && (
                          <p className="mt-0.5 flex flex-wrap gap-1">
                            {lote.vendidos > 0 && (
                              <Badge variant="secondary">{formatNumber(lote.vendidos)} vendidos</Badge>
                            )}
                            {lote.baixados > 0 && (
                              <Badge variant="destructive">{formatNumber(lote.baixados)} baixados</Badge>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">GMD médio</p>
                        <p className="text-lg font-semibold tabular-nums">{formatNumber(lote.gmdMedio)}</p>
                        <p className="text-xs text-muted-foreground">{lote.comGmd} de {lote.total} pesados</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Peso médio de entrada</p>
                        <p className="text-lg font-semibold tabular-nums">{formatNumber(lote.pesoEntradaMedio)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3 gap-1.5 text-muted-foreground"
                      onClick={() => alternarLote(chave)}
                    >
                      {aberto ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      {aberto ? 'Fechar acompanhamento' : `Ver os ${lote.total} animais`}
                    </Button>
                    {aberto && (
                      <div className="mt-3">
                        <DataTable columns={colunasAnimalLote} rows={lote.animais} rowKey={(a) => a.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
