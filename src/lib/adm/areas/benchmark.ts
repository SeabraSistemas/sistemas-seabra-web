import 'server-only';

import {
  BENCHMARK_INFO,
  METRICAS_BENCHMARK,
  MINIMO_BENCHMARK,
  VIEWS_FASE_3,
  type LinhaBenchmarkPropriedade,
  type LinhaBenchmarkReferencia,
  type MetricaBenchmark,
  type MetricaInfo,
} from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { SEGMENTO_ROTULO, erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * ÁREA BENCHMARK — como ESTE criador se compara com o resto da carteira, dentro
 * do segmento dele.
 *
 * É a peça mais vendável do painel e, por isso mesmo, a mais fácil de tornar
 * desonesta: toda linha desta tela é uma AFIRMAÇÃO SOBRE O NEGÓCIO DE UM CLIENTE
 * REAL, dita pela Sistema Seabra, provavelmente numa ligação de consultoria. As
 * quatro regras abaixo são o que impede a tela de afirmar mais do que os dados
 * sustentam — e nenhuma delas é decoração:
 *
 * 1. AMOSTRA MÍNIMA (MINIMO_BENCHMARK = 7). Abaixo disso a comparação não é
 *    publicada: `publicavel` fica false e a tela mostra o valor do criador sem
 *    régua nenhuma. Com três fazendas, "a mediana da carteira" é o valor do
 *    vizinho vestido de estatística — e o criador não tem como saber disso.
 *
 * 2. AUSÊNCIA NÃO É ZERO. `valor: null` quer dizer "este criador não tem o dado",
 *    nunca "o dado dele é zero". Custo por litro zero seria um milagre; produção
 *    por lactante zero seria um rebanho seco. Por isso todo null vem acompanhado
 *    de `faltando`: a frase que diz o que precisa ser lançado no app para a
 *    métrica passar a existir. Essa frase é a oportunidade comercial da tela.
 *
 * 3. NINGUÉM É IDENTIFICADO. As duas views trazem só quartis e contagem — não há
 *    nome, id nem cidade de outro criador em lugar nenhum deste módulo, e nada
 *    aqui faz join que possa reintroduzi-los. Benchmark que deixa adivinhar o
 *    vizinho é vazamento entre clientes.
 *
 * 4. JANELA E AMOSTRA SEMPRE JUNTAS DO NÚMERO. `janela` e `n` viajam dentro de
 *    cada `ComparacaoMetrica` justamente para a tela não conseguir mostrar o
 *    número sem eles: "custo 24% acima da mediana" sem dizer de quantas fazendas
 *    e de que período é uma frase que não dá para checar.
 *
 * SEGMENTO É INEGOCIÁVEL. Comparar caprino leiteiro com ovino de corte não é
 * benchmark, é ruído — e o número resultante daria uma conversa comercial errada
 * com os dois criadores. Por isso a referência é sempre lida com filtro de
 * segmento, e uma propriedade sem segmento declarado é um estado próprio da tela
 * (`semSegmento`), não uma comparação contra a base inteira.
 *
 * NENHUM NOME DE VIEW É DIGITADO AQUI: vêm de `VIEWS_FASE_3`, no contrato — o
 * mesmo arquivo que o SQL implementa. Foi a divergência entre o nome escrito no
 * SQL e o escrito no TS que, na Fase 1, deixou dez telas compilando e abrindo
 * vazias, como se os clientes não tivessem dados.
 *
 * Somente leitura (decisão D3): este módulo só faz SELECT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato de leitura
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_PROPRIEDADE = VIEWS_FASE_3.benchmarkPropriedade;
const VIEW_REFERENCIA = VIEWS_FASE_3.benchmarkReferencia;

/**
 * A mensagem de falta de configuração cita o CONTRATO, e não um nome de arquivo
 * SQL: as views da Fase 3 nascem junto com esta tela, e chutar um
 * `adm_09_*.sql` que talvez se chame outra coisa manda o operador procurar um
 * arquivo que não existe. O contrato existe exatamente para ser o endereço
 * estável dos dois lados.
 */
const ONDE_ESTA_O_SQL =
  'Rode o SQL da Fase 3 em supabase/adm/ — o arquivo que implementa VIEWS_FASE_3 de ' +
  'src/lib/adm/areas/contrato.ts';

/**
 * Projeções conferidas EM COMPILAÇÃO contra o contrato. `satisfies Record<keyof
 * Linha*, true>` faz o `tsc` recusar tanto a coluna esquecida quanto a coluna
 * inventada — a divergência SQL↔TypeScript passa a quebrar no build, e não em
 * runtime com um `undefined` virando 0 na frente do cliente.
 */
const PROJECAO_PROPRIEDADE = {
  propriedade_id: true,
  segmento: true,
  metrica: true,
  valor: true,
} satisfies Record<keyof LinhaBenchmarkPropriedade, true>;

const PROJECAO_REFERENCIA = {
  segmento: true,
  metrica: true,
  n: true,
  p25: true,
  mediana: true,
  p75: true,
} satisfies Record<keyof LinhaBenchmarkReferencia, true>;

/** Nunca `select('*')`: a projeção explícita é o que impede uma coluna nova da
 *  view de entrar no payload RSC sem ninguém ter decidido que ela pode. */
const SELECT_PROPRIEDADE = Object.keys(PROJECAO_PROPRIEDADE).join(',');
const SELECT_REFERENCIA = Object.keys(PROJECAO_REFERENCIA).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Janela e diagnóstico de ausência — por métrica
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A janela de cada métrica, para a tela dizer ao lado do número (regra 4).
 *
 * ⚠️ ESTES RÓTULOS PRECISAM BATER COM O SQL. Eles espelham as janelas das views
 * da Fase 2 de onde as métricas nascem: produção por lactante em 90 dias (como
 * `adm.propriedade_visao_geral`), custo por litro pelo snapshot mais recente de
 * `estimativa_custo_snapshot`, e o resto em 12 meses (reprodução, sanidade,
 * crescimento). É a mesma janela que `BENCHMARK_INFO[m].explicacao` conta ao
 * criador — se a view da Fase 3 escolher outra, ESTE mapa é o que muda junto,
 * senão a tela passa a datar o número errado.
 */
/**
 * A janela REAL de cada métrica, com a linha da view que a define — não a
 * janela "de memória". Duas destas estavam erradas na primeira escrita
 * (produção dizia 90 e a view calcula 30; IPP dizia 12 meses e a view usa 24),
 * e o sintoma é o pior que esta tela pode ter: o número certo com o período
 * errado escrito ao lado, dito ao criador numa ligação.
 *
 *   produção por lactante/dia  adm_01_schema_e_views.sql:723  (current_date - 29)
 *   custo por litro            adm_07_areas.sql (snapshot mais recente)
 *   taxa de prenhez            adm_07_areas.sql (12 meses)
 *   GMD médio                  adm_07_areas.sql (12 meses)
 *   mortalidade                adm_07_areas.sql (12 meses)
 *   intervalo entre partos     adm_07_areas.sql:203           (24 months)
 */
const JANELA: Record<MetricaBenchmark, string> = {
  producao_por_lactante_dia: 'últimos 30 dias',
  custo_litro: 'estimativa mais recente',
  taxa_prenhez: 'últimos 12 meses',
  gmd_medio: 'últimos 12 meses',
  taxa_mortalidade: 'últimos 12 meses',
  intervalo_partos_dias: 'últimos 24 meses',
};

/**
 * O QUE FALTA LANÇAR para a métrica existir — a frase da regra 2, e a única
 * parte desta tela que vira ação para o cliente no mesmo dia.
 *
 * Cada uma nomeia o DENOMINADOR que falta, não um módulo genérico: quase toda
 * ausência aqui é denominador zero (o contrato diz que média e taxa viram null
 * quando não dá para dividir), e "use mais o app" não é uma instrução. "Pese o
 * mesmo animal duas vezes" é.
 */
const FALTA_LANCAR: Record<MetricaBenchmark, string> = {
  producao_por_lactante_dia:
    'Faltam lançamentos de controle leiteiro ou de produção diária nos últimos 30 dias — e fêmeas marcadas como lactantes, que são o denominador da conta.',
  custo_litro:
    'Falta rodar a estimativa de custo no app: sem um snapshot salvo não existe custo por litro, e nenhum outro lançamento produz esse número.',
  taxa_prenhez:
    'Faltam diagnósticos de gestação registrados. Cobertura sozinha não vira taxa: o denominador é o diagnóstico feito.',
  gmd_medio:
    'Falta pesar o mesmo animal duas vezes. O ganho diário nasce do intervalo entre duas pesagens — com uma só, não há o que dividir.',
  taxa_mortalidade:
    'Falta rebanho ativo cadastrado no período. Óbito registrado sem rebanho para dividir não vira taxa — e rebanho vazio costuma ser cadastro em atraso, não fazenda vazia.',
  intervalo_partos_dias:
    'Faltam dois partos registrados da mesma fêmea. Com um parto só o intervalo não existe, por definição.',
};

// ─────────────────────────────────────────────────────────────────────────────
// O domínio da tela
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Onde o valor do criador cai em relação aos quartis do segmento. É GEOMETRIA
 * PURA — não diz se é bom ou ruim, porque isso depende da métrica.
 */
export type FaixaBenchmark = 'abaixo_p25' | 'p25_mediana' | 'mediana_p75' | 'acima_p75';

/**
 * A leitura moral da mesma posição, já com `BENCHMARK_INFO[m].maiorEhMelhor`
 * aplicado. Existe separada da faixa porque é exatamente aqui que uma tela de
 * benchmark mente sem querer: custo por litro no quartil de cima é o PIOR lugar
 * da distribuição, e produção por lactante no quartil de cima é o melhor.
 * Pintar as duas da mesma cor inverte a mensagem para metade das métricas.
 */
export type QualidadeBenchmark = 'destaque' | 'tipico' | 'atencao';

export interface ComparacaoMetrica {
  metrica: MetricaBenchmark;
  /** Rótulo, unidade, casas, direção e a frase para o criador — tudo do contrato. */
  info: MetricaInfo;
  /** "últimos 12 meses". Anda junto do número por obrigação (regra 4). */
  janela: string;
  /** O valor DESTE criador. null = não tem o dado; jamais tratar como zero. */
  valor: number | null;
  /** Quantas propriedades do segmento entraram no cálculo desta métrica. */
  n: number;
  p25: number | null;
  mediana: number | null;
  p75: number | null;
  /**
   * A comparação pode ser publicada? Exige amostra >= MINIMO_BENCHMARK E uma
   * mediana calculada. False significa: mostre o valor do criador, não desenhe
   * régua nenhuma e diga o tamanho da amostra.
   */
  publicavel: boolean;
  /** null quando não é publicável ou o criador não tem o valor. */
  faixa: FaixaBenchmark | null;
  qualidade: QualidadeBenchmark | null;
  /**
   * (valor − mediana) / |mediana|, em FRAÇÃO como todo percentual do /adm.
   * null quando falta um dos dois ou quando a mediana é zero (dividir por zero
   * daria um infinito que a tela imprimiria como se fosse resultado).
   */
  desvioMediana: number | null;
  /** Já com a direção aplicada. null quando falta valor ou mediana. */
  melhorQueMediana: boolean | null;
  /** O que precisa ser lançado para a métrica existir. Só quando `valor` é null. */
  faltando: string | null;
}

export interface Benchmark {
  propriedade_id: number;
  /** O segmento em que esta fazenda é comparada. null = não há segmento. */
  segmento: string | null;
  /** Outros segmentos declarados na mesma fazenda (`propriedades.segmentos` é text[]). */
  outrosSegmentos: string[];
  /** Uma por métrica do contrato, sempre as seis, sempre nesta ordem. */
  metricas: ComparacaoMetrica[];
  /** Métricas em que dá para afirmar alguma coisa: publicável E com valor do criador. */
  comparaveis: number;
  /** Dessas, em quantas ele está melhor que a mediana (direção já aplicada). */
  acimaDaMediana: number;
  /**
   * A maior amostra entre as métricas do segmento. É um PISO do tamanho do
   * segmento, não o tamanho dele — uma fazenda que não calculou nenhuma das seis
   * métricas não aparece em amostra nenhuma. A tela precisa dizer isso assim.
   */
  maiorAmostra: number;
  /**
   * Esta fazenda não tem segmento: nem a view a classificou, nem o cadastro
   * declara um. Sem segmento não existe grupo de comparação — e é um estado
   * diferente de "o segmento é pequeno demais".
   */
  semSegmento: boolean;
  /**
   * Nomes de métrica que vieram das views e que o contrato NÃO declara.
   * Diagnóstico de operador, não de cliente: a lista de métricas é fechada de
   * propósito, e uma métrica nova aparecendo aqui significa que o SQL andou sem
   * o contrato — o mesmo tipo de divergência silenciosa que derrubou a Fase 1.
   */
  metricasDesconhecidas: string[];
  /**
   * Métricas de '%' cujo número veio acima de 1,5 — ou seja, provavelmente em
   * escala 0-100 quando o painel inteiro trata taxa como FRAÇÃO. Sem este aviso
   * a tela mostraria "6.200%" e alguém acharia que é dado sujo do cliente.
   */
  escalaSuspeita: MetricaBenchmark[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gêmeos dos ajudantes de `queries.ts` e das outras áreas, pelo mesmo motivo já
 * escrito em `crescimento.ts` e `consultoria.ts`: lá eles são privados de
 * módulos grandes, e importar o arquivo inteiro para usar `numero()` traria a
 * lista mestra e o escape hatch junto. Se um dia isto virar `areas/leitura.ts`,
 * este arquivo é um dos primeiros a trocar — o que não pode é o COMPORTAMENTO
 * divergir: mesmo `Resultado`, mesma tradução de código do PostgREST.
 */
type Linha = Record<string, unknown>;

type ErroPostgrest = { message: string; code?: string };

type Consulta = {
  eq(coluna: string, valor: unknown): Consulta;
  in(coluna: string, valores: readonly unknown[]): Consulta;
  limit(quantidade: number): Consulta;
} & PromiseLike<{ data: unknown[] | null; error: ErroPostgrest | null }>;

/** PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 *  42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma:
 *  o banco não foi preparado. Isso é 'sem-config' e nunca 'vazio' — um cliente
 *  sem comparação por falta de migration parece um cliente fora de qualquer
 *  segmento, que é uma afirmação falsa sobre ele. */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). ${ONDE_ESTA_O_SQL}, confirme que o ` +
        'schema "adm" está em Settings → API → Exposed schemas e recarregue o cache do PostgREST ' +
        '(Settings → API → Reload schema cache) — view nova em schema já exposto só aparece depois disso.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

/**
 * Teto de linhas das duas leituras. O contrato diz que cada view tem uma linha
 * por (segmento, métrica): são 4 segmentos × 6 métricas = 24 no pior caso legítimo.
 *
 * Bater no teto NÃO é truncar em silêncio, é ERRO: o PostgREST corta a resposta
 * e devolve HTTP 200, e um conjunto truncado de quartis produziria uma mediana
 * plausível e errada — exatamente o tipo de número que ninguém confere porque
 * parece certo. Melhor a tela dizer que a view está fora do contrato.
 */
const TETO_LINHAS = 100;

async function varias(consulta: Consulta, view: string): Promise<Resultado<Linha[]>> {
  const { data, error } = await consulta.limit(TETO_LINHAS);
  if (error) return falha<Linha[]>(view, error);
  const linhas = (data ?? []).filter((v): v is Linha => typeof v === 'object' && v !== null);
  if (linhas.length >= TETO_LINHAS) {
    return erro(
      `[adm] ${view}: devolveu ${TETO_LINHAS} linhas ou mais, e o contrato prevê no máximo uma por ` +
        '(segmento, métrica). O resultado seria truncado, então nada é publicado — confira a view.',
    );
  }
  return ok(linhas);
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres chega como STRING quando a precisão não cabe em
  // double — e mediana e quartis são exatamente colunas numeric. Ignorar isso
  // transformaria a régua inteira em null sem nenhum aviso.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Contagem: 0 significa "nenhuma fazenda", nunca "não sei". */
function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v.trim();
  return null;
}

/**
 * A lista de métricas é FECHADA no contrato. Nome que não está lá é descartado
 * do cálculo e devolvido em `metricasDesconhecidas`: publicar uma métrica que
 * ninguém definiu — sem rótulo, sem unidade, sem saber se maior é melhor —
 * seria desenhar uma régua cuja direção o painel não conhece.
 */
const METRICAS_VALIDAS = new Set<string>(METRICAS_BENCHMARK);

function metricaValida(v: unknown): MetricaBenchmark | null {
  const nome = texto(v);
  return nome != null && METRICAS_VALIDAS.has(nome) ? (nome as MetricaBenchmark) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Posição relativa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Em qual faixa da distribuição o valor caiu.
 *
 * NÃO INTERPOLAMOS PERCENTIL. Com p25, mediana e p75 dá para dizer "no quarto de
 * cima"; dizer "no percentil 83" exigiria supor que a distribuição é uniforme
 * dentro de cada quartil, o que ninguém verificou. Um número inventado com uma
 * casa decimal é mais convincente do que um verdadeiro sem ela — e este painel
 * fala com o cliente.
 *
 * Empate com a mediana cai em 'mediana_p75', a faixa típica: quem está
 * exatamente na mediana não está nem acima nem abaixo, e a tela diz isso com
 * palavra, não com cor.
 */
function faixaDe(
  valor: number,
  p25: number | null,
  mediana: number | null,
  p75: number | null,
): FaixaBenchmark | null {
  if (mediana == null) return null;
  if (valor < mediana) return p25 != null && valor < p25 ? 'abaixo_p25' : 'p25_mediana';
  return p75 != null && valor > p75 ? 'acima_p75' : 'mediana_p75';
}

/**
 * A faixa lida com a direção da métrica. Só os quartis extremos ganham tom:
 * metade da carteira está abaixo da mediana POR DEFINIÇÃO, e pintar metade dos
 * clientes de vermelho não informa nada — o que informa é estar fora da faixa
 * onde vivem as duas quartas partes do meio.
 */
function qualidadeDe(faixa: FaixaBenchmark, maiorEhMelhor: boolean): QualidadeBenchmark {
  if (faixa === 'acima_p75') return maiorEhMelhor ? 'destaque' : 'atencao';
  if (faixa === 'abaixo_p25') return maiorEhMelhor ? 'atencao' : 'destaque';
  return 'tipico';
}

// ─────────────────────────────────────────────────────────────────────────────
// Rótulos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 'caprino_leiteiro' → 'Caprino leiteiro'. Valor fora dos quatro conhecidos sai
 * como veio (mesmo fallback de <TabelaGenerica>): se o SQL agrupar por outra
 * coisa amanhã, a tela mostra o nome cru em vez de esconder o segmento.
 */
export function rotuloSegmento(segmento: string | null): string {
  if (!segmento) return 'Sem segmento';
  return (SEGMENTO_ROTULO as Record<string, string | undefined>)[segmento] ?? segmento;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/** Uma comparação sem nada: nem valor do criador, nem referência do segmento. */
function comparacaoVazia(metrica: MetricaBenchmark): ComparacaoMetrica {
  return {
    metrica,
    info: BENCHMARK_INFO[metrica],
    janela: JANELA[metrica],
    valor: null,
    n: 0,
    p25: null,
    mediana: null,
    p75: null,
    publicavel: false,
    faixa: null,
    qualidade: null,
    desvioMediana: null,
    melhorQueMediana: null,
    faltando: FALTA_LANCAR[metrica],
  };
}

/**
 * Uma fazenda que não caiu em nenhum segmento. NÃO é erro e não é banco
 * despreparado: `propriedades.segmentos` é text[] e pode estar vazio, e aí não
 * existe grupo de comparação nenhum. A tela tem uma frase própria para isso, e é
 * uma boa frase comercial — declarar o segmento no app liga a tela inteira.
 */
function benchmarkSemSegmento(propriedadeId: number): Benchmark {
  return {
    propriedade_id: propriedadeId,
    segmento: null,
    outrosSegmentos: [],
    metricas: METRICAS_BENCHMARK.map(comparacaoVazia),
    comparaveis: 0,
    acimaDaMediana: 0,
    maiorAmostra: 0,
    semSegmento: true,
    metricasDesconhecidas: [],
    escalaSuspeita: [],
  };
}

/**
 * A comparação de UMA propriedade contra o segmento dela.
 *
 * `segmentosDeclarados` é a lista de `propriedades.segmentos` que o escopo já
 * carregou (PropriedadeEscopo.segmentos). Serve de rede para o caso em que a
 * fazenda tem segmento cadastrado mas NENHUMA linha em
 * `adm.benchmark_propriedade` — o que acontece com quem ainda não calculou
 * nenhuma das seis métricas. Sem essa rede, a tela diria "esta fazenda não tem
 * segmento declarado", que seria uma afirmação FALSA sobre o cadastro do
 * cliente; com ela, a tela mostra a régua do segmento sem o marcador e diz o que
 * falta lançar — que é a versão útil da mesma situação.
 *
 * São duas leituras e não uma: quartis do segmento e valor da fazenda vivem em
 * views diferentes de propósito (uma agrega N fazendas, a outra é por fazenda), e
 * nenhum join do PostgREST atravessaria isso sem trazer as linhas das outras.
 */
export async function getBenchmark(
  propriedadeId: number,
  segmentosDeclarados: readonly string[] = [],
): Promise<Resultado<Benchmark>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const propRes = await varias(
    (supa.from(VIEW_PROPRIEDADE).select(SELECT_PROPRIEDADE) as unknown as Consulta).eq(
      'propriedade_id',
      propriedadeId,
    ),
    VIEW_PROPRIEDADE,
  );
  if (!propRes.ok) return propRes;

  const desconhecidas = new Set<string>();

  // segmento → métrica → valor do criador. Duas linhas para o mesmo par são
  // ignoradas depois da primeira: a view deve ter uma só, e escolher a segunda
  // (ou somá-las) publicaria um número que ninguém sabe de onde veio.
  const valores = new Map<string, Map<MetricaBenchmark, number | null>>();
  for (const l of propRes.dados) {
    const segmento = texto(l.segmento);
    const metrica = metricaValida(l.metrica);
    if (metrica == null) {
      const cru = texto(l.metrica);
      if (cru) desconhecidas.add(cru);
      continue;
    }
    if (!segmento) continue;
    const porMetrica = valores.get(segmento) ?? new Map<MetricaBenchmark, number | null>();
    if (!porMetrica.has(metrica)) porMetrica.set(metrica, numero(l.valor));
    valores.set(segmento, porMetrica);
  }

  const segmentos =
    valores.size > 0
      ? [...valores.keys()]
      : [...new Set(segmentosDeclarados.map((s) => s.trim()).filter((s) => s !== ''))];

  if (segmentos.length === 0) {
    const vazio = benchmarkSemSegmento(propriedadeId);
    return ok({ ...vazio, metricasDesconhecidas: [...desconhecidas].sort() });
  }

  const refRes = await varias(
    (supa.from(VIEW_REFERENCIA).select(SELECT_REFERENCIA) as unknown as Consulta).in('segmento', segmentos),
    VIEW_REFERENCIA,
  );
  if (!refRes.ok) return refRes;

  // segmento → métrica → régua do segmento.
  const referencia = new Map<string, Map<MetricaBenchmark, LinhaBenchmarkReferencia>>();
  for (const l of refRes.dados) {
    const segmento = texto(l.segmento);
    const metrica = metricaValida(l.metrica);
    if (metrica == null) {
      const cru = texto(l.metrica);
      if (cru) desconhecidas.add(cru);
      continue;
    }
    if (!segmento) continue;
    const porMetrica = referencia.get(segmento) ?? new Map<MetricaBenchmark, LinhaBenchmarkReferencia>();
    if (!porMetrica.has(metrica)) {
      porMetrica.set(metrica, {
        segmento,
        metrica,
        n: inteiro(l.n),
        p25: numero(l.p25),
        mediana: numero(l.mediana),
        p75: numero(l.p75),
      });
    }
    referencia.set(segmento, porMetrica);
  }

  const principal = escolherSegmento(segmentos, referencia);
  const reguas = referencia.get(principal) ?? new Map<MetricaBenchmark, LinhaBenchmarkReferencia>();
  const doCriador = valores.get(principal) ?? new Map<MetricaBenchmark, number | null>();

  const metricas = METRICAS_BENCHMARK.map((metrica) =>
    montarComparacao(metrica, doCriador.get(metrica) ?? null, reguas.get(metrica) ?? null),
  );

  const comparaveis = metricas.filter((c) => c.publicavel && c.valor != null);

  return ok({
    propriedade_id: propriedadeId,
    segmento: principal,
    outrosSegmentos: segmentos.filter((s) => s !== principal).sort(),
    metricas,
    comparaveis: comparaveis.length,
    acimaDaMediana: comparaveis.filter((c) => c.melhorQueMediana === true).length,
    maiorAmostra: metricas.reduce((maior, c) => Math.max(maior, c.n), 0),
    semSegmento: false,
    metricasDesconhecidas: [...desconhecidas].sort(),
    escalaSuspeita: metricas.filter(escalaSuspeita).map((c) => c.metrica),
  });
}

/**
 * Qual segmento usar quando a fazenda está em mais de um (`segmentos` é text[]:
 * uma propriedade pode ser caprino leiteiro E caprino de corte).
 *
 * O critério é a MAIOR AMOSTRA — o segmento em que a comparação é mais sólida —
 * e nunca "onde o cliente aparece melhor". Escolher pelo resultado seria
 * cherry-picking: bastaria o criador estar em dois segmentos para o painel
 * sempre contar a versão lisonjeira, e a tela viraria propaganda com cara de
 * estatística. Empate desempata por nome, para a tela não trocar de segmento
 * entre dois carregamentos iguais. Os outros segmentos são nomeados na tela.
 */
function escolherSegmento(
  segmentos: string[],
  referencia: Map<string, Map<MetricaBenchmark, LinhaBenchmarkReferencia>>,
): string {
  const amostraDe = (segmento: string) => {
    const reguas = referencia.get(segmento);
    if (!reguas) return 0;
    let maior = 0;
    for (const r of reguas.values()) maior = Math.max(maior, r.n);
    return maior;
  };

  return [...segmentos].sort((a, b) => {
    const d = amostraDe(b) - amostraDe(a);
    return d !== 0 ? d : a.localeCompare(b, 'pt-BR');
  })[0];
}

function montarComparacao(
  metrica: MetricaBenchmark,
  valor: number | null,
  regua: LinhaBenchmarkReferencia | null,
): ComparacaoMetrica {
  const info = BENCHMARK_INFO[metrica];
  const n = regua?.n ?? 0;
  const p25 = regua?.p25 ?? null;
  const mediana = regua?.mediana ?? null;
  const p75 = regua?.p75 ?? null;

  // As DUAS condições são necessárias. A amostra mínima é a regra de negócio; a
  // mediana existir é a régua de fato — n >= 7 com mediana nula significa que a
  // view não conseguiu calcular, e desenhar uma faixa sem centro seria pior do
  // que não desenhar nada.
  const publicavel = n >= MINIMO_BENCHMARK && mediana != null;

  const faixa = publicavel && valor != null ? faixaDe(valor, p25, mediana, p75) : null;

  return {
    metrica,
    info,
    janela: JANELA[metrica],
    valor,
    n,
    p25,
    mediana,
    p75,
    publicavel,
    faixa,
    qualidade: faixa ? qualidadeDe(faixa, info.maiorEhMelhor) : null,
    // Mediana zero não vira divisão: o resultado seria Infinity, e a tela
    // imprimiria "+∞%" como se fosse um desempenho.
    desvioMediana:
      valor != null && mediana != null && mediana !== 0 ? (valor - mediana) / Math.abs(mediana) : null,
    melhorQueMediana:
      valor != null && mediana != null ? (info.maiorEhMelhor ? valor > mediana : valor < mediana) : null,
    // A frase de ausência só aparece quando o criador realmente não tem o dado.
    // Com valor presente ela seria uma cobrança sobre algo que já foi lançado.
    faltando: valor == null ? FALTA_LANCAR[metrica] : null,
  };
}

/**
 * Taxa no /adm é FRAÇÃO (0,62 = 62%) — é a convenção de `formatarPercentual()` e
 * do contrato (`taxa_prenhez` = positivos ÷ diagnósticos). Prenhez e mortalidade
 * não podem passar de 1; um número acima de 1,5 nessas duas só pode ser a view
 * devolvendo 0-100, e sem este aviso a tela mostraria 6.200% e alguém culparia o
 * cadastro do cliente por um erro de escala do SQL.
 */
function escalaSuspeita(c: ComparacaoMetrica): boolean {
  if (c.info.unidade !== '%') return false;
  return [c.valor, c.p25, c.mediana, c.p75].some((v) => v != null && v > 1.5);
}
