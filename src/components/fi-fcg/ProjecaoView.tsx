'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { CampoLabel, InfoTip, type InfoCampo } from '@/components/painel/CampoInfo';
import { SerieMensal, type PontoMensal } from '@/components/painel/SerieMensal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EstadoCarga } from '@/components/painel/EstadoCarga';
import { DIAS_POR_UNIDADE, LABEL_UNIDADE_IDADE, formatDia, formatNumber, type UnidadeIdade } from '@/lib/painel/format';
import { projetarRebanho, type PartoEstimadoViaToque, type PrenhaSemDataConhecida } from '@/lib/fi-fcg/projecaoRebanho';
import { desempacotar } from '@/lib/painel/pacote';
import type { PacoteProjecao } from '@/lib/fi-fcg/pacotes';
import type { DiaCompacto, MarcoIdade, RegIatf, RegRebanho, RegToque } from '@/lib/fi-fcg/types';

const MES_LABEL = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
/** "aaaamm" => "mmm/aaaa". */
function formatMes(mes: string): string {
  const ano = mes.slice(0, 4);
  const m = Number(mes.slice(4, 6));
  return `${MES_LABEL[m - 1]}/${ano}`;
}

/** Mesma ordem das 7 linhas semeadas em "GMD por Categoria" (Financeiro/Custo de formação) — as categorias do funil bovino. */
const CATEGORIAS_FUNIL = ['Bezerro', 'Bezerra', 'Garrote', 'Novilha', 'Boi', 'Vaca', 'Touro'];

const HORIZONTE_MIN_MESES = 1;
const HORIZONTE_MAX_MESES = 6;
const DIAS_POR_MES_PROJECAO = 30;

const INFO_HORIZONTE_PROJECAO: InfoCampo = {
  oQue: 'Até quantos meses no futuro a projeção olha, a partir de hoje (mínimo 1, máximo 6).',
  ajuda: 'Define o alcance do gráfico de partos e das mudanças de categoria — quanto maior, mais longe no futuro você enxerga (e menos confiável fica).',
  como: 'Digite um número de 1 a 6. Fora desse intervalo, o campo trava no limite mais próximo.',
};
const INFO_IDADE_MIN_PROJECAO: InfoCampo = {
  oQue: 'A idade mínima que um animal precisa ter, na data final da projeção, pra entrar na contagem de mudança de categoria.',
  ajuda: 'Filtra fora quem for jovem demais pra esse recorte — esses animais simplesmente não aparecem nas mudanças de categoria previstas (os partos previstos não são afetados).',
  como: 'Deixe em branco pra não aplicar limite mínimo. Escolha a unidade (dias/meses/anos) ao lado.',
};
const INFO_IDADE_MAX_PROJECAO: InfoCampo = {
  oQue: 'A idade máxima que um animal pode ter, na data final da projeção, pra entrar na contagem de mudança de categoria.',
  ajuda: 'Filtra fora quem for velho demais pra esse recorte (ex: só quer ver quem ainda está se formando) — esses animais simplesmente não aparecem.',
  como: 'Deixe em branco pra não aplicar limite máximo. Escolha a unidade (dias/meses/anos) ao lado.',
};
const INFO_SECAO_PROJECAO: InfoCampo = {
  oQue: 'Uma previsão de quantos partos vão acontecer e quantos animais vão mudar de categoria, mês a mês, dentro do horizonte escolhido.',
  ajuda: 'Ajuda a planejar: quantos bezerros vão nascer, quantas novilhas vão virar vaca etc, nos próximos meses.',
  como: 'Ajuste o Horizonte e, se quiser, a faixa de Idade mínima/máxima pra restringir quais animais entram na mudança de categoria.',
};

const COLUNAS_ESTIMADOS_TOQUE: DataTableColumn<PartoEstimadoViaToque>[] = [
  { key: 'id', header: 'Animal', cell: (a) => a.id },
  { key: 'fazenda', header: 'Fazenda', cell: (a) => a.fazenda ?? '—' },
  { key: 'dataToque', header: 'Data do Toque', cell: (a) => formatDia(a.dataToque), sortValue: (a) => a.dataToque ?? 0 },
  { key: 'diagnostico', header: 'Diagnóstico', cell: (a) => a.diagnostico },
  {
    key: 'partoPrevisto',
    header: 'Parto previsto (estimado)',
    cell: (a) => formatDia(a.partoPrevisto),
    sortValue: (a) => a.partoPrevisto ?? 0,
  },
];

const COLUNAS_SEM_DATA: DataTableColumn<PrenhaSemDataConhecida>[] = [
  { key: 'id', header: 'Animal', cell: (a) => a.id },
  { key: 'fazenda', header: 'Fazenda', cell: (a) => a.fazenda ?? '—' },
  {
    key: 'ultimaIatf',
    header: 'Último IATF',
    cell: (a) => (a.ultimaIatf != null ? formatDia(a.ultimaIatf) + ' (velho demais)' : '—'),
    sortValue: (a) => a.ultimaIatf ?? 0,
  },
  {
    key: 'ultimoToque',
    header: 'Último Toque',
    cell: (a) => (a.ultimoToque != null ? formatDia(a.ultimoToque) + ' (velho demais)' : '—'),
    sortValue: (a) => a.ultimoToque ?? 0,
  },
];

/** Popup (Sheet) acionado pelos avisos da Projeção — ver quem são os animais, não só a contagem. */
function PainelAnimaisSuspeitos({
  aberto,
  onOpenChange,
  animaisEstimadosViaToque,
  animaisSemDataConhecida,
}: {
  aberto: 'toque' | 'semdata' | null;
  onOpenChange: (v: 'toque' | 'semdata' | null) => void;
  animaisEstimadosViaToque: PartoEstimadoViaToque[];
  animaisSemDataConhecida: PrenhaSemDataConhecida[];
}) {
  return (
    <Sheet open={aberto !== null} onOpenChange={(v) => !v && onOpenChange(null)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{aberto === 'toque' ? 'Partos estimados pelo Toque' : 'Prenhas sem data confiável'}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          {aberto === 'toque' ? (
            <DataTable columns={COLUNAS_ESTIMADOS_TOQUE} rows={animaisEstimadosViaToque} rowKey={(a) => a.id} />
          ) : (
            <DataTable columns={COLUNAS_SEM_DATA} rows={animaisSemDataConhecida} rowKey={(a) => a.id} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Página "Projeção" (21/09/2026) — extraída de Financeiro/Custo de formação,
 * porque não tem relação com dinheiro. Mesmo motor (`projetarRebanho`,
 * lib/fi-fcg/projecaoRebanho.ts), agora com seu próprio seletor de Fazenda
 * (antes compartilhado com o resto de Custo de formação) e uma unidade
 * escolhível (dias/meses/anos) pro filtro de idade mínima/máxima.
 */
export function ProjecaoView({ dados, fazendas, hoje }: { dados: PacoteProjecao; fazendas: string[]; hoje: DiaCompacto }) {
  const rebanhoProjecao = useMemo(() => desempacotar<RegRebanho>(dados.rebanhoProjecao), [dados.rebanhoProjecao]);
  const iatfProjecao = useMemo(() => desempacotar<RegIatf>(dados.iatfProjecao), [dados.iatfProjecao]);
  const toqueProjecao = useMemo(() => desempacotar<RegToque>(dados.toqueProjecao), [dados.toqueProjecao]);
  const marcosIdade = useMemo(() => desempacotar<MarcoIdade>(dados.marcosIdade), [dados.marcosIdade]);

  const [fazendaSelecionada, setFazendaSelecionada] = useState<string | null>(null);

  const [horizonteTexto, setHorizonteTexto] = useState('6');
  const horizonteMeses = Math.min(HORIZONTE_MAX_MESES, Math.max(HORIZONTE_MIN_MESES, Math.round(Number(horizonteTexto)) || 1));
  const horizonteDias = horizonteMeses * DIAS_POR_MES_PROJECAO;

  const [unidadeIdade, setUnidadeIdade] = useState<UnidadeIdade>('dias');
  const [idadeMinTexto, setIdadeMinTexto] = useState('');
  const [idadeMaxTexto, setIdadeMaxTexto] = useState('');
  const filtroIdade = useMemo(() => {
    if (idadeMinTexto.trim() === '' && idadeMaxTexto.trim() === '') return null;
    const mult = DIAS_POR_UNIDADE[unidadeIdade];
    const minDias = idadeMinTexto.trim() === '' ? 0 : Math.max(0, (Number(idadeMinTexto) || 0) * mult);
    const maxDias = idadeMaxTexto.trim() === '' ? Infinity : Math.max(0, (Number(idadeMaxTexto) || 0) * mult);
    return { minDias, maxDias };
  }, [idadeMinTexto, idadeMaxTexto, unidadeIdade]);

  /** Troca de unidade limpa os campos — "30" em dias e "30" em anos não são o mesmo número, então não dá pra converter o texto às cegas. */
  function trocarUnidadeIdade(u: UnidadeIdade) {
    setUnidadeIdade(u);
    setIdadeMinTexto('');
    setIdadeMaxTexto('');
  }

  const [categoriasVisiveis, setCategoriasVisiveis] = useState<Set<string>>(
    () => new Set(CATEGORIAS_FUNIL.filter((c) => c !== 'Touro')),
  );
  const [painelAberto, setPainelAberto] = useState<'toque' | 'semdata' | null>(null);

  function alternarCategoria(c: string) {
    setCategoriasVisiveis((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(c)) proximo.delete(c);
      else proximo.add(c);
      return proximo;
    });
  }

  const projecao = useMemo(
    () =>
      projetarRebanho(rebanhoProjecao, iatfProjecao, toqueProjecao, marcosIdade, fazendaSelecionada, horizonteDias, hoje, filtroIdade),
    [rebanhoProjecao, iatfProjecao, toqueProjecao, marcosIdade, fazendaSelecionada, horizonteDias, hoje, filtroIdade],
  );

  const totalPartos = useMemo(() => projecao.meses.reduce((s, m) => s + m.partosPrevistos, 0), [projecao.meses]);
  const pontosPartos: PontoMensal[] = useMemo(
    () => projecao.meses.map((m) => ({ mes: m.mes, valor: m.partosPrevistos })),
    [projecao.meses],
  );
  const mesesComMigracao = useMemo(
    () =>
      projecao.meses
        .map((m) => ({
          mes: m.mes,
          migracoes: m.migracoes.filter((mig) => categoriasVisiveis.has(mig.de) || categoriasVisiveis.has(mig.para)),
        }))
        .filter((m) => m.migracoes.length > 0),
    [projecao.meses, categoriasVisiveis],
  );

  return (
    <div className="flex flex-col gap-6">
      <EstadoCarga
        configurado={dados.configurado}
        stale={dados.stale}
        carregadoEm={dados.carregadoEm}
        atualizarHref="/FI_FCG/api/atualizar"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={fazendaSelecionada === null ? 'default' : 'outline'}
          onClick={() => setFazendaSelecionada(null)}
        >
          Consolidado
        </Button>
        {fazendas.map((f) => (
          <Button
            type="button"
            key={f}
            size="sm"
            variant={fazendaSelecionada === f ? 'default' : 'outline'}
            onClick={() => setFazendaSelecionada(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          Projeção de rebanho
          <InfoTip info={INFO_SECAO_PROJECAO} />
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Horizonte (meses)" info={INFO_HORIZONTE_PROJECAO} />
            <Input
              type="number"
              min={HORIZONTE_MIN_MESES}
              max={HORIZONTE_MAX_MESES}
              value={horizonteTexto}
              onChange={(e) => setHorizonteTexto(e.target.value)}
              className="h-8 w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Unidade da idade</span>
            <div className="flex gap-1">
              {(Object.keys(LABEL_UNIDADE_IDADE) as UnidadeIdade[]).map((u) => (
                <Button
                  type="button"
                  key={u}
                  size="sm"
                  variant={unidadeIdade === u ? 'default' : 'outline'}
                  onClick={() => trocarUnidadeIdade(u)}
                >
                  {LABEL_UNIDADE_IDADE[u]}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto={`Idade mínima (${unidadeIdade})`} info={INFO_IDADE_MIN_PROJECAO} />
            <Input
              type="number"
              min={0}
              placeholder="sem limite"
              value={idadeMinTexto}
              onChange={(e) => setIdadeMinTexto(e.target.value)}
              className="h-8 w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto={`Idade máxima (${unidadeIdade})`} info={INFO_IDADE_MAX_PROJECAO} />
            <Input
              type="number"
              min={0}
              placeholder="sem limite"
              value={idadeMaxTexto}
              onChange={(e) => setIdadeMaxTexto(e.target.value)}
              className="h-8 w-28"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS_FUNIL.map((c) => (
              <Button
                type="button"
                key={c}
                size="sm"
                variant={categoriasVisiveis.has(c) ? 'default' : 'outline'}
                onClick={() => alternarCategoria(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {projecao.partosEstimadosViaToque > 0 && (
          <p className="text-xs text-amber-400">
            {formatNumber(projecao.partosEstimadosViaToque)} parto(s) previsto(s) estimado(s) pelo Diagnóstico do Toque, não
            pelo IATF — a Data IATF dessa(s) vaca(s) é antiga demais (provável repasse com touro solto não lançado). Data
            aproximada, não exata.{' '}
            <button type="button" className="underline hover:text-amber-300" onClick={() => setPainelAberto('toque')}>
              Ver quem são
            </button>
            .
          </p>
        )}

        {projecao.partosSemDataConhecida > 0 && (
          <p className="text-xs text-amber-400">
            {formatNumber(projecao.partosSemDataConhecida)} vaca(s) prenha(s) sem nenhuma data confiável (IATF ou Toque
            recente) — não entram na previsão de parto (não inventamos a data).{' '}
            <button type="button" className="underline hover:text-amber-300" onClick={() => setPainelAberto('semdata')}>
              Ver quem são
            </button>
            .
          </p>
        )}

        <PainelAnimaisSuspeitos
          aberto={painelAberto}
          onOpenChange={setPainelAberto}
          animaisEstimadosViaToque={projecao.animaisEstimadosViaToque}
          animaisSemDataConhecida={projecao.animaisSemDataConhecida}
        />

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">Partos previstos por mês</h3>
          <SerieMensal series={[{ chave: 'partos', nome: 'Partos previstos', cor: '#c98500', pontos: pontosPartos }]} />
          <p className="mt-3 rounded-lg bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{formatNumber(totalPartos)}</span> parto(s) previsto(s) ao todo em{' '}
            {horizonteMeses} {horizonteMeses === 1 ? 'mês' : 'meses'}
            {projecao.partosEstimadosViaToque > 0 && (
              <>
                {' '}
                — <span className="font-semibold text-foreground">{formatNumber(projecao.partosEstimadosViaToque)}</span>{' '}
                estimado(s) via Toque
              </>
            )}
            .
          </p>
        </div>

        {mesesComMigracao.length === 0 ? (
          totalPartos === 0 && (
            <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Nenhuma mudança de categoria prevista nesse horizonte — confira se &quot;Idades por Marco&quot; (Financeiro) está
              preenchido.
            </p>
          )
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mesesComMigracao.map((m) => (
              <div key={m.mes} className="rounded-xl border border-border bg-card p-4 text-xs">
                <p className="text-sm font-medium capitalize text-foreground">{formatMes(m.mes)}</p>
                {m.migracoes.map((mig) => (
                  <p key={`${mig.de}-${mig.para}`} className="mt-1 text-muted-foreground">
                    {mig.de} → {mig.para}: <span className="font-semibold text-foreground">{formatNumber(mig.quantidade)}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
          {CATEGORIAS_FUNIL.filter((c) => categoriasVisiveis.has(c)).map((c) => (
            <div key={c} className="rounded-xl border border-border bg-card p-3 text-xs">
              <p className="text-sm font-medium text-foreground">{c}</p>
              <p className="mt-1 text-muted-foreground">
                Hoje: <span className="font-semibold text-foreground">{formatNumber(projecao.efetivoPorCategoriaHoje[c] ?? 0)}</span>
              </p>
              <p className="text-muted-foreground">
                Em {horizonteMeses} {horizonteMeses === 1 ? 'mês' : 'meses'}:{' '}
                <span className="font-semibold text-foreground">{formatNumber(projecao.efetivoPorCategoriaFinal[c] ?? 0)}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
