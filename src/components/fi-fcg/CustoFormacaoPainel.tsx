'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/painel/DataTable';
import { CampoLabel, InfoTip, type InfoCampo } from '@/components/painel/CampoInfo';
import { SerieMensal, type PontoMensal } from '@/components/painel/SerieMensal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatDia, formatMoeda, formatNumber } from '@/lib/painel/format';
import {
  PERCENTUAL_TOLERANCIA_MAX,
  PERCENTUAL_TOLERANCIA_MIN,
  type FunilCalculado,
  type RetratoCategoria,
} from '@/lib/fi-fcg/custoFormacao';
import { projetarRebanho, type PartoEstimadoViaToque, type PrenhaSemDataConhecida } from '@/lib/fi-fcg/projecaoRebanho';
import {
  TIPOS_INSUMO,
  type ConsumoCategoria,
  type DiaCompacto,
  type GmdCategoria,
  type Insumo,
  type ItemDieta,
  type MarcoIdade,
  type RegIatf,
  type RegRebanho,
  type RegToque,
} from '@/lib/fi-fcg/types';

const MES_LABEL = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
/** "aaaamm" => "mmm/aaaa". */
function formatMes(mes: string): string {
  const ano = mes.slice(0, 4);
  const m = Number(mes.slice(4, 6));
  return `${MES_LABEL[m - 1]}/${ano}`;
}

/**
 * Mesma ordem das 7 linhas semeadas em "GMD por Categoria" (mutations.ts,
 * criação da aba) — as categorias do funil bovino (ver custoFormacao.ts).
 */
const CATEGORIAS_FUNIL = ['Bezerro', 'Bezerra', 'Garrote', 'Novilha', 'Boi', 'Vaca', 'Touro'];

const INFO_MARCO_PADRAO: InfoCampo = {
  oQue: 'Com quantos dias de vida um animal muda de categoria no seu rebanho.',
  ajuda: 'Alimenta a Projeção de rebanho (mês em que a mudança acontece) e o Funil acumulado de custo de formação.',
  como: 'Digite a idade em dias dessa transição, baseada na idade média real dos seus animais.',
};
const INFO_MARCOS: Record<string, InfoCampo> = {
  'Novilha -> Vaca (1a cobertura)': {
    oQue: 'Com quantos dias de vida a Novilha é coberta pela primeira vez.',
    ajuda:
      'Mostrado no Retrato do momento pra você ver o custo de formação até a 1ª cobertura — sozinho NÃO muda a categoria do animal (isso só acontece no 1º parto, marco abaixo).',
    como: 'Digite a idade média em dias da 1ª cobertura das suas Novilhas.',
  },
  'Novilha -> Vaca (1o parto)': {
    oQue: 'Com quantos dias de vida a Novilha pare pela primeira vez e vira Vaca.',
    ajuda:
      'É ESTE marco (não o da 1ª cobertura) que faz a Novilha migrar pra Vaca na Projeção de rebanho — biologicamente ela só "é" Vaca depois de parir.',
    como: 'Digite a idade média em dias do 1º parto das suas Novilhas.',
  },
};

const INFO_GMD_CATEGORIA: InfoCampo = {
  oQue: 'Quantos kg essa categoria ganha de peso, em média, por dia (GMD — Ganho Médio Diário).',
  ajuda:
    'Base do Funil acumulado (peso/GMD): sem ela não dá pra calcular quantos dias o animal leva em cada fase nem o custo por @ formada.',
  como:
    'Se aparecer "Sugestão", é a média real calculada a partir das pesagens registradas — pode usar ela ou digitar outro valor manualmente.',
};

const INFO_INSUMO_NOME: InfoCampo = {
  oQue: 'O nome do insumo usado na dieta (ex: Milho moído, Farelo de soja, Sal mineral).',
  ajuda: 'Identifica o insumo pra você montar a Dieta por Categoria.',
  como: 'Digite um nome claro — é ele que vai aparecer no campo Insumo da seção Dieta por Categoria.',
};
const INFO_INSUMO_TIPO: InfoCampo = {
  oQue: 'Concentrado, Volumoso ou Sal mineral — igual ao "Nutrição & Custo" do seabra-app-main.',
  ajuda: 'Define o "balde" onde esse insumo entra na Dieta por Categoria — cada tipo tem seu próprio consumo total (kg/dia) e a % de cada insumo é dentro do seu tipo, não da dieta inteira.',
  como: 'Escolha o tipo que melhor descreve o insumo. É obrigatório — sem ele, o insumo não aparece na Dieta por Categoria.',
};
const INFO_INSUMO_VALOR: InfoCampo = {
  oQue: 'Quanto custa 1 kg desse insumo, em reais.',
  ajuda: 'Multiplicado pelo Kg/dia da Dieta por Categoria, forma o custo diário de alimentação de cada categoria (Retrato do momento e Funil).',
  como: 'Digite o preço por kg — se você compra em saca, divida o valor da saca pelo peso dela em kg.',
};

const INFO_HORIZONTE_PROJECAO: InfoCampo = {
  oQue: 'Até quantos meses no futuro a projeção olha, a partir de hoje (mínimo 1, máximo 6).',
  ajuda: 'Define o alcance do gráfico de partos e das mudanças de categoria — quanto maior, mais longe no futuro você enxerga (e menos confiável fica).',
  como: 'Digite um número de 1 a 6. Fora desse intervalo, o campo trava no limite mais próximo.',
};
const INFO_IDADE_MIN_PROJECAO: InfoCampo = {
  oQue: 'A idade mínima (em dias de vida) que um animal precisa ter, na data final da projeção, pra entrar na contagem de mudança de categoria.',
  ajuda: 'Filtra fora quem for jovem demais pra esse recorte — esses animais simplesmente não aparecem nas mudanças de categoria previstas (os partos previstos não são afetados).',
  como: 'Deixe em branco pra não aplicar limite mínimo (equivale a 0 dias).',
};
const INFO_IDADE_MAX_PROJECAO: InfoCampo = {
  oQue: 'A idade máxima (em dias de vida) que um animal pode ter, na data final da projeção, pra entrar na contagem de mudança de categoria.',
  ajuda: 'Filtra fora quem for velho demais pra esse recorte (ex: só quer ver quem ainda está se formando) — esses animais simplesmente não aparecem.',
  como: 'Deixe em branco pra não aplicar limite máximo (sem teto).',
};

const INFO_CONSUMO_TIPO: InfoCampo = {
  oQue: 'Quantos kg desse tipo (Concentrado/Volumoso/Sal mineral) inteiro a categoria come por dia, por cabeça.',
  ajuda: 'Multiplicado pelo preço médio da mistura (a % de cada insumo × seu valor/kg), forma o custo diário desse tipo — somado aos outros 2 tipos, dá o custo de dieta da categoria.',
  como: 'Digite a quantidade total diária em kg (pode usar vírgula, ex: 15,5). Independe de quantos insumos compõem a mistura.',
};
const INFO_PERCENTUAL_INSUMO: InfoCampo = {
  oQue: 'Quanto (%) esse insumo representa dentro da mistura do tipo — não é kg/dia direto.',
  ajuda: 'A soma das % de todos os insumos do mesmo tipo precisa fechar perto de 100% pra "Salvar formulação" funcionar.',
  como: 'Digite a % desse insumo na mistura (ex: 55). Some com os outros insumos do mesmo tipo até fechar 100%.',
};

const INFO_SECAO_RETRATO: InfoCampo = {
  oQue: 'Uma foto do custo de cada categoria HOJE, baseada na idade real de cada animal (nascimento até hoje) × custo diário atual (dieta + fixo).',
  ajuda: 'Mostra quanto já custou formar, em média, um animal de cada categoria até agora — e o custo por @ real (peso de verdade) vs a referência (Categoria@).',
  como: 'Não precisa configurar nada além de Custos, Insumos, Dieta por Categoria e Idades por Marco — ela recalcula sozinha.',
};
const INFO_SECAO_FUNIL: InfoCampo = {
  oQue: 'A cadeia de formação de cada tipo de animal (ex: Bezerro → Garrote → Boi), com o custo acumulado fase a fase até virar @ formada.',
  ajuda: 'Diferente do Retrato do momento: usa o GMD (ganho de peso por dia) pra estimar quantos dias o animal leva em cada fase, não a idade real dele.',
  como: 'Precisa do GMD por Categoria preenchido pra cada categoria da cadeia — sem isso, a fase fica com "—" e o card avisa em amarelo.',
};
const INFO_SECAO_PROJECAO: InfoCampo = {
  oQue: 'Uma previsão de quantos partos vão acontecer e quantos animais vão mudar de categoria, mês a mês, dentro do horizonte escolhido.',
  ajuda: 'Ajuda a planejar: quantos bezerros vão nascer, quantas novilhas vão virar vaca etc, nos próximos meses.',
  como: 'Ajuste o Horizonte e, se quiser, a faixa de Idade mínima/máxima pra restringir quais animais entram na mudança de categoria.',
};
const INFO_SECAO_MARCOS: InfoCampo = {
  oQue: 'A idade em dias que marca a transição entre categorias no seu rebanho (ex: quando um Bezerro vira Garrote).',
  ajuda: 'Alimenta a Projeção de rebanho (quando cada animal muda de categoria) e o Retrato do momento (marcos como 1ª cobertura/1º parto).',
  como: 'Preencha a idade real das transições na sua fazenda — tem uma sugestão pré-preenchida baseada numa fórmula padrão, ajuste se souber o valor real.',
};
const INFO_SECAO_GMD: InfoCampo = {
  oQue: 'Quanto cada categoria ganha de peso, em média, por dia.',
  ajuda: 'Alimenta o Funil acumulado — sem isso, não dá pra calcular quantos dias o animal leva em cada fase nem o custo por @.',
  como: 'Use a sugestão (média real das pesagens) ou digite um valor manual por categoria.',
};
const INFO_SECAO_INSUMOS: InfoCampo = {
  oQue: 'Os itens que compõem a dieta dos animais (ex: Milho moído, Farelo de soja, Sal mineral), cada um com seu preço por kg.',
  ajuda: 'É a base de preço usada pra calcular o custo da dieta de cada categoria — sem insumo cadastrado, não dá pra montar a Dieta por Categoria.',
  como: 'Cadastre cada insumo separadamente, um por linha, com nome e valor por kg. O Tipo é só organizacional, não entra em nenhuma conta.',
};
const INFO_SECAO_DIETA: InfoCampo = {
  oQue: 'Quanto de cada insumo (volumoso, concentrado, sal mineral, o que for) uma categoria come por dia — uma linha por insumo.',
  ajuda:
    'O custo diário da dieta de uma categoria é a SOMA de todas as suas linhas: (kg/dia × valor/kg) de cada insumo, somados. Isso alimenta o Retrato do momento e o Funil.',
  como:
    'Pra cada categoria, adicione uma linha por insumo que ela consome (ex: Vaca + Silagem + 20kg/dia, depois Vaca + Sal mineral + 0,1kg/dia). Pode misturar quantos insumos quiser — o sistema soma tudo.',
};

/**
 * Aba "Custo de formação" do Financeiro (16/09/2026) — réplica adaptada do
 * motor do seabra-app-main (ver custoFormacao.ts pro porquê e a fórmula).
 * 4 seções: o resultado do funil (por Fazenda), e os 3 cadastros que
 * alimentam ele (GMD por Categoria, Insumos, Dieta por Categoria).
 */
export function CustoFormacaoPainel({
  fazendas,
  funisPorFazenda,
  retratoPorFazenda,
  gmdCategoria,
  gmdSugerido,
  marcosIdade,
  insumos,
  dieta,
  consumoCategoria,
  rebanhoProjecao,
  iatfProjecao,
  toqueProjecao,
  hoje,
}: {
  fazendas: string[];
  funisPorFazenda: { fazenda: string | null; funis: FunilCalculado[] }[];
  retratoPorFazenda: { fazenda: string | null; retrato: RetratoCategoria[] }[];
  gmdCategoria: GmdCategoria[];
  gmdSugerido: [string, number][];
  marcosIdade: MarcoIdade[];
  insumos: Insumo[];
  dieta: ItemDieta[];
  consumoCategoria: ConsumoCategoria[];
  rebanhoProjecao: RegRebanho[];
  iatfProjecao: RegIatf[];
  toqueProjecao: RegToque[];
  hoje: DiaCompacto;
}) {
  const router = useRouter();
  const [fazendaSelecionada, setFazendaSelecionada] = useState<string | null>(null);
  const funis = funisPorFazenda.find((f) => f.fazenda === fazendaSelecionada)?.funis ?? [];
  const retrato = retratoPorFazenda.find((f) => f.fazenda === fazendaSelecionada)?.retrato ?? [];
  const sugestaoPorCategoria = useMemo(() => new Map(gmdSugerido), [gmdSugerido]);

  return (
    <div className="flex flex-col gap-8">
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
          Retrato do momento
          <InfoTip info={INFO_SECAO_RETRATO} />
        </h2>
        <p className="text-xs text-muted-foreground">
          Idade real de cada animal (nascimento até hoje) × custo diário atual da categoria — não depende de GMD nem de cadeia.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {retrato.map((r) => (
            <RetratoCard key={r.categoria} retrato={r} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          Funil acumulado (peso/GMD)
          <InfoTip info={INFO_SECAO_FUNIL} />
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {funis.map((funil) => (
            <FunilCard key={funil.nome} funil={funil} />
          ))}
        </div>
      </section>

      <ProjecaoSecao
        rebanhoProjecao={rebanhoProjecao}
        iatfProjecao={iatfProjecao}
        toqueProjecao={toqueProjecao}
        marcosIdade={marcosIdade}
        fazendaSelecionada={fazendaSelecionada}
        retrato={retrato}
        hoje={hoje}
      />

      <MarcosIdadeSecao marcosIdade={marcosIdade} onChanged={() => router.refresh()} />

      <GmdCategoriaSecao
        gmdCategoria={gmdCategoria}
        sugestaoPorCategoria={sugestaoPorCategoria}
        onChanged={() => router.refresh()}
      />

      <InsumosSecao insumos={insumos} onChanged={() => router.refresh()} />

      <DietaSecao dieta={dieta} insumos={insumos} consumoCategoria={consumoCategoria} onChanged={() => router.refresh()} />
    </div>
  );
}

function RetratoCard({ retrato }: { retrato: RetratoCategoria }) {
  const arrobaReal = retrato.pesoMedioKg != null ? retrato.pesoMedioKg / 15 : null;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{retrato.categoria}</h3>
        <span className="text-xs text-muted-foreground">{formatNumber(retrato.efetivo)} cabeças</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Idade média: {retrato.idadeMediaDias != null ? `${formatNumber(retrato.idadeMediaDias)} dias` : '—'}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-y-3 text-xs">
        <div>
          <p className="text-muted-foreground">Custo/dia (dieta+fixo)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoTotalDia)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Acumulado até hoje</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoAcumuladoHoje)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Custo por @ (real)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoPorArrobaReal)}</p>
          {arrobaReal != null && <p className="text-muted-foreground">{formatNumber(arrobaReal)}@ reais</p>}
        </div>
        <div>
          <p className="text-muted-foreground">Custo por @ (referência)</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoeda(retrato.custoPorArrobaReferencia)}</p>
          {retrato.arrobaReferencia != null && <p className="text-muted-foreground">{formatNumber(retrato.arrobaReferencia)}@ Categoria@</p>}
        </div>
      </div>
      {retrato.marcos.length > 0 && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border/60 pt-2 text-xs">
          {retrato.marcos.map((m) => (
            <div key={m.nome} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {m.nome.replace(`${retrato.categoria} -> `, '')} ({formatNumber(m.idadeDias)}d)
              </span>
              <span className="tabular-nums text-foreground">{formatMoeda(m.custoAcumulado)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Projeção de rebanho (16/09/2026, horizonte em MESES — 1 a 6, decisão do
 * Felipe): partos previstos (Prenha + Data IATF mais recente + 283 dias) e
 * mudança de categoria por idade (Idades por Marco), assim como as
 * categorias que quer ver. O cálculo em si é por dia exato (30 dias por
 * mês, ver `horizonteDias` abaixo e projecaoRebanho.ts) — só a ESCOLHA do
 * horizonte na tela é em meses, redonda e limitada (evita horizontes longos
 * demais, onde a projeção por idade fica pouco confiável). `filtroIdade`
 * (idade mínima/máxima em dias, opcional) é inspirado na ferramenta
 * "Projeção/Estoque" de outro sistema do ecossistema: animal fora da faixa
 * etária (na data final) não aparece na mudança de categoria — só ali, não
 * nos partos previstos (não depende da idade da mãe).
 * Roda no CLIENTE (`projetarRebanho`, puro) sobre um subconjunto já
 * reduzido pelo servidor (ver CAMPOS_REBANHO_PROJECAO) — mudar o horizonte
 * não pede um round-trip. "Efetivo hoje" vem do `retrato` (todas as
 * categorias, sempre certo); "final" soma as migrações projetadas em cima
 * dele — nascimento não entra na composição (sexo do bezerro é desconhecido
 * antes de nascer), só na contagem de partos à parte.
 */
const HORIZONTE_MIN_MESES = 1;
const HORIZONTE_MAX_MESES = 6;
const DIAS_POR_MES_PROJECAO = 30;

function ProjecaoSecao({
  rebanhoProjecao,
  iatfProjecao,
  toqueProjecao,
  marcosIdade,
  fazendaSelecionada,
  retrato,
  hoje,
}: {
  rebanhoProjecao: RegRebanho[];
  iatfProjecao: RegIatf[];
  toqueProjecao: RegToque[];
  marcosIdade: MarcoIdade[];
  fazendaSelecionada: string | null;
  retrato: RetratoCategoria[];
  hoje: DiaCompacto;
}) {
  const [horizonteTexto, setHorizonteTexto] = useState('6');
  const horizonteMeses = Math.min(HORIZONTE_MAX_MESES, Math.max(HORIZONTE_MIN_MESES, Math.round(Number(horizonteTexto)) || 1));
  const horizonteDias = horizonteMeses * DIAS_POR_MES_PROJECAO;
  const [idadeMinTexto, setIdadeMinTexto] = useState('');
  const [idadeMaxTexto, setIdadeMaxTexto] = useState('');
  const filtroIdade = useMemo(() => {
    if (idadeMinTexto.trim() === '' && idadeMaxTexto.trim() === '') return null;
    const minDias = idadeMinTexto.trim() === '' ? 0 : Math.max(0, Number(idadeMinTexto) || 0);
    const maxDias = idadeMaxTexto.trim() === '' ? Infinity : Math.max(0, Number(idadeMaxTexto) || 0);
    return { minDias, maxDias };
  }, [idadeMinTexto, idadeMaxTexto]);
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

  const efetivoHoje = useMemo(() => new Map(retrato.map((r) => [r.categoria, r.efetivo])), [retrato]);
  const efetivoFinal = useMemo(() => {
    const mapa = new Map(efetivoHoje);
    for (const mes of projecao.meses) {
      for (const mig of mes.migracoes) {
        mapa.set(mig.de, (mapa.get(mig.de) ?? 0) - mig.quantidade);
        mapa.set(mig.para, (mapa.get(mig.para) ?? 0) + mig.quantidade);
      }
    }
    return mapa;
  }, [efetivoHoje, projecao.meses]);

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
          <CampoLabel texto="Idade mínima (dias)" info={INFO_IDADE_MIN_PROJECAO} />
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
          <CampoLabel texto="Idade máxima (dias)" info={INFO_IDADE_MAX_PROJECAO} />
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
          {formatNumber(projecao.partosEstimadosViaToque)} parto(s) previsto(s) estimado(s) pelo Toque, não pelo IATF — a Data
          IATF dessa(s) vaca(s) é antiga demais (provável repasse com touro solto não lançado). Data aproximada, não exata.{' '}
          <button type="button" className="underline hover:text-amber-300" onClick={() => setPainelAberto('toque')}>
            Ver quem são
          </button>
          .
        </p>
      )}

      {projecao.partosSemDataConhecida > 0 && (
        <p className="text-xs text-amber-400">
          {formatNumber(projecao.partosSemDataConhecida)} vaca(s) prenha(s) sem nenhuma data confiável (IATF ou Toque recente)
          — não entram na previsão de parto (não inventamos a data).{' '}
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
            Nenhuma mudança de categoria prevista nesse horizonte — confira se &quot;Idades por Marco&quot; está preenchido.
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
              Hoje: <span className="font-semibold text-foreground">{formatNumber(efetivoHoje.get(c) ?? 0)}</span>
            </p>
            <p className="text-muted-foreground">
              Em {horizonteMeses} {horizonteMeses === 1 ? 'mês' : 'meses'}:{' '}
              <span className="font-semibold text-foreground">{formatNumber(efetivoFinal.get(c) ?? 0)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

const COLUNAS_ESTIMADOS_TOQUE: DataTableColumn<PartoEstimadoViaToque>[] = [
  { key: 'id', header: 'Animal', cell: (a) => a.id },
  { key: 'fazenda', header: 'Fazenda', cell: (a) => a.fazenda ?? '—' },
  { key: 'dataToque', header: 'Data do Toque', cell: (a) => formatDia(a.dataToque), sortValue: (a) => a.dataToque ?? 0 },
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

/** Popup (Sheet) acionado pelos avisos da Projeção de rebanho — Felipe pediu (16/09/2026) pra dar pra ver quem são os animais, não só a contagem. */
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
          <SheetTitle>
            {aberto === 'toque' ? 'Partos estimados pelo Toque' : 'Prenhas sem data confiável'}
          </SheetTitle>
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
 * Valor inicial sugerido pros marcos que também existem, com outro nome, na
 * fórmula de Categoria por idade de outro cliente AppSheet (Katmandu, ver
 * `lib/katmandu/categoria.ts`, 4 faixas de ~365 dias confirmadas célula a
 * célula na planilha dele) — pedido do Felipe (16/09/2026): usar como ponto
 * de partida em vez de deixar o campo vazio, já que ninguém tinha
 * preenchido ainda. "1ª cobertura" não tem equivalente lá (é evento
 * reprodutivo, não faixa de categoria), fica sem sugestão.
 */
const DEFAULT_IDADE_MARCO: Record<string, number> = {
  'Bezerro -> Garrote': 366,
  'Bezerra -> Novilha': 366,
  'Garrote -> Boi': 731,
  'Novilha -> Vaca (1o parto)': 1096,
};

function MarcosIdadeSecao({ marcosIdade, onChanged }: { marcosIdade: MarcoIdade[]; onChanged: () => void }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  function valorInicial(m: MarcoIdade): string {
    if (m.idadeDias != null) return String(m.idadeDias);
    const sugestao = m.marco != null ? DEFAULT_IDADE_MARCO[m.marco] : undefined;
    return sugestao != null ? String(sugestao) : '';
  }

  async function salvar(m: MarcoIdade) {
    const bruto = valores[m.id] ?? valorInicial(m);
    const num = Number(bruto.replace(',', '.'));
    if (!Number.isFinite(num) || num <= 0) return;
    setSalvandoId(m.id);
    try {
      const res = await fetch('/FI_FCG/api/marcos-idade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, idadeDias: num }),
      });
      if (res.ok) onChanged();
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        Idades por Marco (dias)
        <InfoTip info={INFO_SECAO_MARCOS} />
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {marcosIdade.map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              {m.marco}
              <InfoTip info={(m.marco != null && INFO_MARCOS[m.marco]) || INFO_MARCO_PADRAO} />
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={valores[m.id] ?? valorInicial(m)}
                onChange={(e) => setValores((v) => ({ ...v, [m.id]: e.target.value }))}
                placeholder="dias"
                className="h-8"
                inputMode="numeric"
              />
              <Button type="button" size="sm" disabled={salvandoId === m.id} onClick={() => salvar(m)}>
                Salvar
              </Button>
            </div>
            {m.idadeDias == null && m.marco != null && DEFAULT_IDADE_MARCO[m.marco] != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Sugestão (faixa padrão de categoria por idade) — ajuste pra sua fazenda e clique Salvar.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FunilCard({ funil }: { funil: FunilCalculado }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-foreground">{funil.nome}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {funil.fases.map((fase) => (
          <div key={fase.categoria} className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 text-xs last:border-0">
            <div>
              <p className="font-medium text-foreground">{fase.categoria}</p>
              <p className="text-muted-foreground">
                {fase.dias != null ? `${formatNumber(fase.dias)} dias` : '—'}
                {fase.pesoInicialKg != null && fase.pesoFinalKg != null && fase.pesoInicialKg !== fase.pesoFinalKg
                  ? ` · ${formatNumber(fase.pesoInicialKg)} → ${formatNumber(fase.pesoFinalKg)} kg`
                  : ''}
              </p>
            </div>
            <p className="tabular-nums text-foreground">{fase.custoFase != null ? formatMoeda(fase.custoFase) : '—'}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">Custo por @ formada</span>
        <span className="text-xl font-semibold tabular-nums text-foreground">
          {funil.custoPorArroba != null ? formatMoeda(funil.custoPorArroba) : '—'}
        </span>
      </div>
      {funil.custoTotal == null && (
        <p className="mt-1 text-xs text-amber-400">Falta GMD de alguma categoria da cadeia — ver seção GMD por Categoria.</p>
      )}
    </div>
  );
}

function GmdCategoriaSecao({
  gmdCategoria,
  sugestaoPorCategoria,
  onChanged,
}: {
  gmdCategoria: GmdCategoria[];
  sugestaoPorCategoria: Map<string, number>;
  onChanged: () => void;
}) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  async function salvar(g: GmdCategoria) {
    const bruto = valores[g.id];
    const num = Number((bruto ?? '').replace(',', '.'));
    if (!Number.isFinite(num) || num <= 0) return;
    setSalvandoId(g.id);
    try {
      const res = await fetch('/FI_FCG/api/gmd-categoria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: g.id, gmdKgDia: num }),
      });
      if (res.ok) onChanged();
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        GMD por Categoria (kg/dia)
        <InfoTip info={INFO_SECAO_GMD} />
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIAS_FUNIL.map((categoria) => {
          const g = gmdCategoria.find((x) => x.categoria === categoria);
          if (!g) return null;
          const sugestao = sugestaoPorCategoria.get(categoria) ?? null;
          const valorAtual = valores[g.id] ?? (g.gmdKgDia != null ? String(g.gmdKgDia) : '');
          return (
            <div key={g.id} className="rounded-xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {categoria}
                <InfoTip info={INFO_GMD_CATEGORIA} />
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  value={valorAtual}
                  onChange={(e) => setValores((v) => ({ ...v, [g.id]: e.target.value }))}
                  placeholder={sugestao != null ? formatNumber(sugestao) : '0,0'}
                  className="h-8"
                  inputMode="decimal"
                />
                <Button type="button" size="sm" disabled={salvandoId === g.id} onClick={() => salvar(g)}>
                  Salvar
                </Button>
              </div>
              {g.gmdKgDia == null && sugestao != null && (
                <p className="mt-1 text-xs text-muted-foreground">Sugestão (média real): {formatNumber(sugestao)}</p>
              )}
              {g.gmdKgDia == null && sugestao == null && (
                <p className="mt-1 text-xs text-amber-400">Sem dado real — preencha manualmente.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsumosSecao({ insumos, onChanged }: { insumos: Insumo[]; onChanged: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [valorKg, setValorKg] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function limpar() {
    setNome('');
    setTipo('');
    setValorKg('');
    setEditandoId(null);
    setErro(null);
  }

  function iniciarEdicao(i: Insumo) {
    setEditandoId(i.id);
    setNome(i.nome);
    setTipo(i.tipo ?? '');
    setValorKg(i.valorKg != null ? String(i.valorKg) : '');
    setErro(null);
  }

  async function salvar() {
    const valorNum = Number(valorKg.replace(',', '.'));
    if (!nome.trim() || !tipo || !Number.isFinite(valorNum) || valorNum <= 0) {
      setErro('Preencha nome, tipo e valor por kg (maior que zero).');
      return;
    }
    setSalvando(true);
    try {
      const corpo = { nome, tipo, valorKg: valorNum };
      const res = await fetch('/FI_FCG/api/insumos', {
        method: editandoId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editandoId ? { id: editandoId, ...corpo } : corpo),
      });
      if (!res.ok) {
        setErro('Não foi possível salvar — tenta de novo.');
        return;
      }
      limpar();
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Apagar este insumo?')) return;
    const res = await fetch('/FI_FCG/api/insumos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) onChanged();
  }

  const colunas: DataTableColumn<Insumo>[] = [
    { key: 'nome', header: 'Nome', cell: (i) => i.nome, sortValue: (i) => i.nome },
    { key: 'tipo', header: 'Tipo', cell: (i) => i.tipo ?? '—', sortValue: (i) => i.tipo },
    { key: 'valor', header: 'Valor/kg', cell: (i) => formatMoeda(i.valorKg), sortValue: (i) => i.valorKg },
    {
      key: 'acoes',
      header: '',
      cell: (i) => (
        <span className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => iniciarEdicao(i)} aria-label="Editar">
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive"
            onClick={() => excluir(i.id)}
            aria-label="Apagar"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        Insumos
        <InfoTip info={INFO_SECAO_INSUMOS} />
      </h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Nome" info={INFO_INSUMO_NOME} />
            <Input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Tipo" info={INFO_INSUMO_TIPO} />
            <Select value={tipo || undefined} onValueChange={setTipo}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_INSUMO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <CampoLabel texto="Valor por kg" info={INFO_INSUMO_VALOR} />
            <Input placeholder="Valor por kg" inputMode="decimal" value={valorKg} onChange={(e) => setValorKg(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" onClick={salvar} disabled={salvando} className="flex-1">
              {editandoId ? 'Salvar alterações' : 'Adicionar'}
            </Button>
            {editandoId && (
              <Button type="button" variant="ghost" size="icon" onClick={limpar} aria-label="Cancelar">
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
      </div>
      <DataTable columns={colunas} rows={insumos} rowKey={(i) => i.id} />
    </section>
  );
}

/**
 * Dieta por Categoria (rebuilt 16/09/2026 — alinhado ao "Nutrição & Custo"
 * do seabra-app-main, pedido do Felipe): por Categoria escolhida, 3 blocos
 * fixos (Concentrado/Volumoso/Sal mineral — `TIPOS_INSUMO`), cada um com o
 * consumo total do tipo (kg/dia) + a % de cada insumo DENTRO do tipo. "Ver
 * quem são" nesse contexto é o "Salvar formulação" por bloco — salva todos
 * os insumos do tipo de uma vez (cria/atualiza/apaga conforme a %), e
 * bloqueia se a soma não fechar 99–101% (mesma tolerância do app, ver
 * `PERCENTUAL_TOLERANCIA_MIN/MAX`). Soma 0% é permitida (limpa a
 * formulação desse tipo — "não uso esse tipo pra essa categoria").
 */
function DietaSecao({
  dieta,
  insumos,
  consumoCategoria,
  onChanged,
}: {
  dieta: ItemDieta[];
  insumos: Insumo[];
  consumoCategoria: ConsumoCategoria[];
  onChanged: () => void;
}) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(CATEGORIAS_FUNIL[0]);

  const colunas: DataTableColumn<ItemDieta>[] = [
    { key: 'categoria', header: 'Categoria', cell: (d) => d.categoria ?? '—', sortValue: (d) => d.categoria },
    { key: 'insumo', header: 'Insumo', cell: (d) => d.insumo ?? '—', sortValue: (d) => d.insumo },
    { key: 'percentual', header: '%', cell: (d) => `${formatNumber(d.percentual)}%`, sortValue: (d) => d.percentual },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        Dieta por Categoria
        <InfoTip info={INFO_SECAO_DIETA} />
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIAS_FUNIL.map((c) => (
          <Button
            type="button"
            key={c}
            size="sm"
            variant={categoriaSelecionada === c ? 'default' : 'outline'}
            onClick={() => setCategoriaSelecionada(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {TIPOS_INSUMO.map((tipo) => (
          <BlocoTipoDieta
            key={`${categoriaSelecionada}-${tipo}`}
            categoria={categoriaSelecionada}
            tipo={tipo}
            dieta={dieta}
            insumosDoTipo={insumos.filter((i) => i.tipo === tipo)}
            consumoAtual={consumoCategoria.find((c) => c.categoria === categoriaSelecionada && c.tipo === tipo) ?? null}
            onChanged={onChanged}
          />
        ))}
      </div>
      <DataTable columns={colunas} rows={dieta} rowKey={(d) => d.id} />
    </section>
  );
}

function BlocoTipoDieta({
  categoria,
  tipo,
  dieta,
  insumosDoTipo,
  consumoAtual,
  onChanged,
}: {
  categoria: string;
  tipo: string;
  dieta: ItemDieta[];
  insumosDoTipo: Insumo[];
  consumoAtual: ConsumoCategoria | null;
  onChanged: () => void;
}) {
  const linhasExistentes = useMemo(
    () => dieta.filter((d) => d.categoria === categoria && d.insumo != null && insumosDoTipo.some((i) => i.nome === d.insumo)),
    [dieta, categoria, insumosDoTipo],
  );
  const [percentuais, setPercentuais] = useState<Record<string, string>>({});
  const [consumoTexto, setConsumoTexto] = useState('');
  const [salvandoConsumo, setSalvandoConsumo] = useState(false);
  const [salvandoFormulacao, setSalvandoFormulacao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function percentualDe(nomeInsumo: string): string {
    if (percentuais[nomeInsumo] != null) return percentuais[nomeInsumo];
    const linha = linhasExistentes.find((d) => d.insumo === nomeInsumo);
    return linha?.percentual != null ? String(linha.percentual) : '';
  }

  const somaPercentual = insumosDoTipo.reduce((soma, i) => soma + (Number(percentualDe(i.nome).replace(',', '.')) || 0), 0);
  const misturaValida = somaPercentual === 0 || (somaPercentual >= PERCENTUAL_TOLERANCIA_MIN && somaPercentual <= PERCENTUAL_TOLERANCIA_MAX);

  const consumoAtualTexto = consumoAtual?.kgDia != null ? String(consumoAtual.kgDia) : '';

  async function salvarConsumo() {
    if (!consumoAtual) return;
    const num = Number((consumoTexto || consumoAtualTexto).replace(',', '.'));
    if (!Number.isFinite(num) || num < 0) return;
    setSalvandoConsumo(true);
    try {
      const res = await fetch('/FI_FCG/api/consumo-categoria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: consumoAtual.id, kgDia: num }),
      });
      if (res.ok) onChanged();
    } finally {
      setSalvandoConsumo(false);
    }
  }

  async function salvarFormulacao() {
    if (insumosDoTipo.length === 0) return;
    if (!misturaValida) {
      setErro(
        `A soma das % precisa ficar entre ${PERCENTUAL_TOLERANCIA_MIN}% e ${PERCENTUAL_TOLERANCIA_MAX}% (ou 0% pra limpar) — hoje está em ${formatNumber(somaPercentual)}%.`,
      );
      return;
    }
    setErro(null);
    setSalvandoFormulacao(true);
    try {
      for (const ins of insumosDoTipo) {
        const num = Number(percentualDe(ins.nome).replace(',', '.'));
        const existente = linhasExistentes.find((d) => d.insumo === ins.nome);
        if (!Number.isFinite(num) || num <= 0) {
          if (existente) {
            await fetch('/FI_FCG/api/dieta', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: existente.id }),
            });
          }
          continue;
        }
        const corpo = { categoria, insumo: ins.nome, percentual: num };
        await fetch('/FI_FCG/api/dieta', {
          method: existente ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(existente ? { id: existente.id, ...corpo } : corpo),
        });
      }
      setPercentuais({});
      onChanged();
    } finally {
      setSalvandoFormulacao(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">{tipo}</h3>

      <div className="mt-2 flex flex-col gap-1">
        <CampoLabel texto="Consumo total (kg/dia)" info={INFO_CONSUMO_TIPO} />
        <div className="flex items-center gap-2">
          <Input
            placeholder="Consumo total, kg/dia"
            inputMode="decimal"
            value={consumoTexto || consumoAtualTexto}
            onChange={(e) => setConsumoTexto(e.target.value)}
            className="h-8"
            disabled={!consumoAtual}
          />
          <Button type="button" size="sm" disabled={!consumoAtual || salvandoConsumo} onClick={salvarConsumo}>
            Salvar
          </Button>
        </div>
      </div>

      {insumosDoTipo.length === 0 ? (
        <p className="mt-3 text-xs text-amber-400">Cadastre insumos do tipo &quot;{tipo}&quot; na seção Insumos primeiro.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <CampoLabel texto="% de cada insumo na mistura" info={INFO_PERCENTUAL_INSUMO} />
          {insumosDoTipo.map((ins) => (
            <div key={ins.nome} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate text-foreground">{ins.nome}</span>
              <Input
                className="h-7 w-20"
                inputMode="decimal"
                placeholder="%"
                value={percentualDe(ins.nome)}
                onChange={(e) => setPercentuais((v) => ({ ...v, [ins.nome]: e.target.value }))}
              />
            </div>
          ))}
          <p className={`text-xs ${misturaValida ? 'text-emerald-400' : 'text-amber-400'}`}>
            Total: {formatNumber(somaPercentual)}%
            {!misturaValida &&
              (somaPercentual > 100
                ? ` — excesso de ${formatNumber(somaPercentual - 100)}%`
                : ` — faltam ${formatNumber(100 - somaPercentual)}%`)}
          </p>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
          <Button type="button" size="sm" disabled={salvandoFormulacao} onClick={salvarFormulacao}>
            Salvar formulação
          </Button>
        </div>
      )}
    </div>
  );
}
