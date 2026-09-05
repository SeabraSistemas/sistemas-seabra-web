import type {
  ComponenteHealth,
  FatiaDistribuicao,
  HealthScore,
  PontoSerie,
  StatusEfetivo,
  VisaoGeralPropriedade,
} from '@/lib/adm/types';
import { diaCivil, formatarDiasRelativo, formatarInteiro, formatarPercentual } from '@/lib/adm/format';

/**
 * Métricas do /adm. Módulo PURO: nenhuma leitura de banco, nenhum Date.now(),
 * nenhum acesso a env. Tudo que depende de "agora" recebe o instante por
 * parâmetro — é o que torna estas funções testáveis e, principalmente, o que
 * impede o mesmo card de mudar de valor entre o render do servidor e o do
 * cliente.
 *
 * Divisão de trabalho com queries.ts: agregado de CARTEIRA e de GRÁFICO é somado
 * em SQL (sobre a base inteira), nunca aqui sobre uma página já paginada. O que
 * mora aqui é (a) o health score, que é uma fórmula de negócio e não uma soma,
 * (b) a normalização de MRR por ciclo e (c) o preenchimento de séries.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Normalização
// ─────────────────────────────────────────────────────────────────────────────

export function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Interpolação linear com clamp entre o valor que vale 0 e o que vale 1.
 * Aceita `aZero > aUm` de propósito: recência é invertida (30 dias vale 0,
 * 2 dias vale 1) e escrever a inversão como um segundo caso seria duas
 * fórmulas para manter em sincronia.
 */
export function interpolar(valor: number | null | undefined, aZero: number, aUm: number): number {
  if (valor == null || !Number.isFinite(valor) || aZero === aUm) return 0;
  return clamp01((valor - aZero) / (aUm - aZero));
}

// ─────────────────────────────────────────────────────────────────────────────
// Health score — 5 componentes, 0-100
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escada discreta do componente de cobrança. Não é interpolável: os estados são
 * qualitativamente diferentes, não pontos de uma reta.
 *
 * 'cortesia' vale 1,0 e não 0: cortesia até 2099 é risco de RECEITA (e a
 * carteira mede isso no card "acesso sem pagamento"), não risco de churn — o
 * cliente de cortesia é o que menos ameaça sair. Confundir os dois faz o score
 * pintar de vermelho justamente as contas que nunca vão embora.
 */
export type EstadoCobranca = 'em-dia' | 'inadimplente' | 'so-extensao' | 'cortesia' | 'sem-acesso';

export const COBRANCA_NORM: Record<EstadoCobranca, number> = {
  'em-dia': 1,
  cortesia: 1,
  'so-extensao': 0.4,
  inadimplente: 0.3,
  'sem-acesso': 0,
};

const COBRANCA_DETALHE: Record<EstadoCobranca, string> = {
  'em-dia': 'acesso em dia',
  cortesia: 'cortesia (sem receita)',
  'so-extensao': 'só extensão manual',
  inadimplente: 'pagamento vencido',
  'sem-acesso': 'sem acesso',
};

/** Pesos somam 100. Recência + frequência = 60% porque num app de lançamento
 *  diário PARAR DE LANÇAR é o churn; o cancelamento só o formaliza semanas
 *  depois. Cobrança pesa só 15 de propósito: é sintoma, não causa — e com 19
 *  cortesias 2099 na base um peso alto de cobrança faria o score dizer que está
 *  todo mundo bem. */
export const PESOS_HEALTH = {
  recencia: 35,
  frequencia: 25,
  amplitude: 15,
  cobranca: 15,
  profundidade: 10,
} as const;

/** Os extremos de cada componente. Ficam aqui, nomeados, porque é o que o Felipe
 *  vai querer calibrar depois de olhar a primeira lista ordenada por score. */
export const METAS_HEALTH = {
  /** ≥30 dias sem lançar → 0. */
  recenciaPior: 30,
  /** ≤2 dias → 1. */
  recenciaMelhor: 2,
  /** 12 dias distintos com lançamento em 30d → 1. */
  frequenciaMeta: 12,
  /** 4 módulos distintos (de 8) em 90d → 1. */
  amplitudeMeta: 4,
  /** 60% do rebanho vivo com evento em 90d → 1. */
  profundidadeMeta: 0.6,
  /** Guard-rail: abaixo disso a conta é "nova", não "em risco". */
  diasMinimosDeVida: 14,
} as const;

export interface EntradaHealthScore {
  /** Dias desde o último lançamento em qualquer módulo. null = nunca lançou. */
  diasSemLancar: number | null;
  /** Dias DISTINTOS com ≥1 lançamento nos últimos 30 dias (0..30). */
  diasComLancamento30d: number;
  /** Módulos distintos usados em 90 dias (de 8 tabelas de trabalho diário). */
  modulos90d: number;
  cobranca: EstadoCobranca;
  /** Animais vivos com ≥1 evento (manejo/pesagem/controle leiteiro) em 90d. */
  animaisComEvento90d: number;
  animaisVivos: number;
}

export function faixaDeScore(total: number): HealthScore['faixa'] {
  if (total >= 70) return 'saudavel';
  if (total >= 40) return 'atencao';
  return 'risco';
}

/**
 * Score 0-100 de risco de churn. O `detalhe` de cada componente existe para a
 * tela poder explicar o número — um score sem explicação vira superstição e o
 * Felipe deixa de confiar nele na primeira divergência com a intuição dele.
 *
 * Quem NÃO deve receber score: conta com menos de 14 dias de vida ou sem
 * nenhum animal (ver contaMaduraParaScore) e contas is_tester/is_demo. Nesses
 * casos a tela mostra "conta nova" — nunca vermelho. O corte não está aqui
 * dentro porque a função precisa continuar pura e total: quem decide exibir é
 * quem tem o contexto.
 */
export function calcularHealthScore(entrada: EntradaHealthScore): HealthScore {
  const normRecencia = interpolar(entrada.diasSemLancar, METAS_HEALTH.recenciaPior, METAS_HEALTH.recenciaMelhor);
  const normFrequencia = interpolar(entrada.diasComLancamento30d, 0, METAS_HEALTH.frequenciaMeta);
  const normAmplitude = interpolar(entrada.modulos90d, 0, METAS_HEALTH.amplitudeMeta);
  const normCobranca = COBRANCA_NORM[entrada.cobranca] ?? 0;

  // Rebanho zerado dá divisão por zero: profundidade vira 0, não NaN. Um NaN
  // aqui contamina a soma e o score inteiro some da tela sem erro nenhum.
  const razaoProfundidade =
    entrada.animaisVivos > 0 ? entrada.animaisComEvento90d / entrada.animaisVivos : 0;
  const normProfundidade = interpolar(razaoProfundidade, 0, METAS_HEALTH.profundidadeMeta);

  const componentes: ComponenteHealth[] = [
    {
      chave: 'recencia',
      rotulo: 'Recência',
      peso: PESOS_HEALTH.recencia,
      norm: normRecencia,
      detalhe: entrada.diasSemLancar == null ? 'nunca lançou' : formatarDiasRelativo(entrada.diasSemLancar),
    },
    {
      chave: 'frequencia',
      rotulo: 'Frequência 30d',
      peso: PESOS_HEALTH.frequencia,
      norm: normFrequencia,
      detalhe: `${formatarInteiro(entrada.diasComLancamento30d)} de ${METAS_HEALTH.frequenciaMeta} dias`,
    },
    {
      chave: 'amplitude',
      rotulo: 'Amplitude 90d',
      peso: PESOS_HEALTH.amplitude,
      norm: normAmplitude,
      detalhe: `${formatarInteiro(entrada.modulos90d)} de 8 módulos`,
    },
    {
      chave: 'cobranca',
      rotulo: 'Cobrança',
      peso: PESOS_HEALTH.cobranca,
      norm: normCobranca,
      detalhe: COBRANCA_DETALHE[entrada.cobranca] ?? COBRANCA_DETALHE['sem-acesso'],
    },
    {
      chave: 'profundidade',
      rotulo: 'Profundidade',
      peso: PESOS_HEALTH.profundidade,
      norm: normProfundidade,
      detalhe:
        entrada.animaisVivos > 0
          ? `${formatarPercentual(razaoProfundidade)} do rebanho`
          : 'sem rebanho',
    },
  ];

  const total = Math.round(componentes.reduce((acc, c) => acc + c.peso * c.norm, 0));
  return { total, componentes, faixa: faixaDeScore(total) };
}

/**
 * Guard-rail obrigatório: sem isto o score mente nas duas pontas. Quem cadastrou
 * ontem tem recência boa e frequência péssima (score baixo, e não é risco), e
 * quem não tem animal nenhum não pode ter profundidade.
 */
export function contaMaduraParaScore(entrada: { diasDesdeCadastro: number | null; animaisVivos: number }): boolean {
  if (entrada.animaisVivos <= 0) return false;
  if (entrada.diasDesdeCadastro == null) return false;
  return entrada.diasDesdeCadastro >= METAS_HEALTH.diasMinimosDeVida;
}

/**
 * Score de um consultor = MEDIANA dos scores das propriedades que ele atende,
 * nunca a soma nem a média. Soma faria um consultor com 7 clientes parecer 7×
 * mais saudável; média deixa um cliente morto sumir dentro de seis vivos.
 */
export function scoreConsolidado(scores: (number | null | undefined)[]): number | null {
  return mediana(scores);
}

// ─────────────────────────────────────────────────────────────────────────────
// MRR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cortesia é marcada por data de vencimento absurda (o padrão adotado em
 * 21/07/2026 é 2099-12-31). Qualquer vencimento a partir de 2090 é cortesia:
 * ninguém contrata 64 anos de assinatura.
 */
export const CORTESIA_A_PARTIR_DE = '2090-01-01';

export function ehCortesia(dataVencimento: string | null | undefined): boolean {
  if (!dataVencimento) return false;
  // Comparação lexicográfica de ISO funciona e não instancia Date — de novo,
  // fuso não pode mudar a classificação comercial de uma assinatura.
  return dataVencimento >= CORTESIA_A_PARTIR_DE;
}

export interface EntradaMrr {
  /** assinaturas.ciclo — 'mensal' | 'anual'. SEM CHECK no banco: qualquer outra
   *  string se comporta como mensal, que é o que o app já faz (`=== 'anual'`). */
  ciclo: string | null;
  /** usuarios.valor_mensal_promocional — o preço congelado no signup via associação. */
  valorMensalPromocional: number | null;
  /** planos.valor_mensal — preço de TABELA do ciclo mensal. */
  planoValorMensal: number | null;
  /** planos.valor_anual — preço de TABELA do ano inteiro (12 meses com 15% off). */
  planoValorAnual: number | null;
  /** assinaturas.data_vencimento — usada só para detectar cortesia. */
  dataVencimento: string | null;
  statusEfetivo: StatusEfetivo | null;
  acessoAtivo: boolean;
}

/**
 * MRR honesto de UMA assinatura, em reais por mês.
 *
 * Corrige os DOIS defeitos que se somam no número que o app mostra hoje:
 *
 * DEFEITO 1 — a Edge `asaas-admin-actions` soma `view_status_assinatura.valor_mensal`,
 * que é PREÇO DE TABELA do plano. Ignora o desconto de associação (que vive em
 * `usuarios.valor_mensal_promocional`), ignora o ciclo anual e ainda conta as
 * cortesias de 2099, que rendem R$ 0.
 *
 * DEFEITO 2 — a correção óbvia também erra: apesar do nome e do próprio
 * comentário da coluna, `valor_mensal_promocional` guarda o valor ANUAL quando
 * `ciclo = 'anual'` (o gravador está em `_shared/asaas.ts`). Somar direto
 * superestima o assinante anual em ~12×. Por isso a divisão por 12 é aplicada
 * ao COALESCE inteiro, e não só ao preço de tabela.
 *
 * Consequência a dizer em voz alta antes da tela existir: o número honesto vai
 * ser MENOR que o que o Felipe vê hoje. A carteira mostra os dois lado a lado
 * (`mrrTabela` e `mrrReal`) exatamente para essa troca ser confiável.
 */
export function mrrDeAssinatura(entrada: EntradaMrr): number {
  if (ehCortesia(entrada.dataVencimento)) return 0;
  // Trial, pendente, vencida e cancelada não são receita recorrente — só 'ativa'
  // com acesso vigente entra no MRR.
  if (!entrada.acessoAtivo || entrada.statusEfetivo !== 'ativa') return 0;

  const anual = entrada.ciclo === 'anual';
  const bruto = anual
    ? entrada.valorMensalPromocional ?? entrada.planoValorAnual
    : entrada.valorMensalPromocional ?? entrada.planoValorMensal;

  if (bruto == null || !Number.isFinite(bruto)) return 0;
  return anual ? bruto / 12 : bruto;
}

/** MRR de tabela — o número que o app mostra hoje. Existe só para exibir ao lado
 *  do real, na coluna "tabela R$ X · real R$ Y". Não usar em decisão. */
export function mrrDeTabela(entrada: Pick<EntradaMrr, 'planoValorMensal' | 'acessoAtivo'>): number {
  return entrada.acessoAtivo ? entrada.planoValorMensal ?? 0 : 0;
}

export function arpu(mrr: number, pagantes: number): number {
  // Dividir pelo total de contas (com trial e cortesia dentro) é como o ARPU
  // some sem ninguém perceber: o denominador é só quem paga.
  return pagantes > 0 ? mrr / pagantes : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Séries temporais
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os N períodos mensais terminando no mês de `ate`, em 'YYYY-MM' crescente.
 * Aritmética de string + UTC: converter para o dia civil de São Paulo uma única
 * vez (diaCivil) e depois só somar inteiros evita que o mês vire outro em cima
 * da virada do dia 1º.
 */
export function mesesAte(quantidade: number, ate: Date | string): string[] {
  const civil = diaCivil(ate);
  if (!civil || quantidade <= 0) return [];
  const ano = Number(civil.slice(0, 4));
  const mes = Number(civil.slice(5, 7)); // 1-12
  const saida: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    // Meses absolutos desde o ano 0: a conta não tem caso especial de virada de ano.
    const absoluto = ano * 12 + (mes - 1) - i;
    const a = Math.floor(absoluto / 12);
    const m = (absoluto % 12) + 1;
    saida.push(`${String(a).padStart(4, '0')}-${String(m).padStart(2, '0')}`);
  }
  return saida;
}

/** Os N dias terminando em `ate`, em 'YYYY-MM-DD' crescente. */
export function diasAte(quantidade: number, ate: Date | string): string[] {
  const civil = diaCivil(ate);
  if (!civil || quantidade <= 0) return [];
  const base = Date.parse(`${civil}T00:00:00Z`);
  if (Number.isNaN(base)) return [];
  const saida: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    saida.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  }
  return saida;
}

/**
 * Completa com 0 os períodos que o GROUP BY não devolveu.
 *
 * Vale para série de CONTAGEM (receita do mês, novos clientes, lançamentos por
 * dia): mês sem linha significa mesmo zero, e sem o preenchimento o gráfico
 * "pula" de março para maio e sugere continuidade onde houve queda.
 *
 * 🔴 NÃO vale para série de MEDIÇÃO — produção diária de leite em particular.
 * Dia sem lançamento significa "não foi medido", não "produziu 0 L"; preencher
 * com zero desenha uma queda a pique que nunca existiu. Essa série fica esparsa
 * de propósito e o gráfico usa connectNulls={false}: a lacuna É a informação.
 */
export function preencherSerie(pontos: PontoSerie[], periodos: string[]): PontoSerie[] {
  const mapa = new Map(pontos.map((p) => [p.periodo, p.valor]));
  return periodos.map((periodo) => ({ periodo, valor: mapa.get(periodo) ?? 0 }));
}

export function preencherMeses(pontos: PontoSerie[], quantidade: number, ate: Date | string): PontoSerie[] {
  return preencherSerie(pontos, mesesAte(quantidade, ate));
}

export function preencherDias(pontos: PontoSerie[], quantidade: number, ate: Date | string): PontoSerie[] {
  return preencherSerie(pontos, diasAte(quantidade, ate));
}

/** Soma corrida — efetivo de rebanho é saldo acumulado, não o saldo do mês. */
export function acumularSerie(pontos: PontoSerie[], inicial = 0): PontoSerie[] {
  let acumulado = inicial;
  return pontos.map((p) => {
    acumulado += p.valor;
    return { periodo: p.periodo, valor: acumulado };
  });
}

/** Variação relativa como FRAÇÃO (0,12 = +12%). null quando não há base de
 *  comparação: 0 → 5 não é "+500%", é "veio do nada" e a tela precisa saber. */
export function variacaoPercentual(atual: number | null | undefined, anterior: number | null | undefined): number | null {
  if (atual == null || anterior == null || !Number.isFinite(atual) || !Number.isFinite(anterior)) return null;
  if (anterior === 0) return null;
  return (atual - anterior) / Math.abs(anterior);
}

export function soma(valores: (number | null | undefined)[]): number {
  return valores.reduce<number>((acc, v) => (v != null && Number.isFinite(v) ? acc + v : acc), 0);
}

export function media(valores: (number | null | undefined)[]): number | null {
  const nums = valores.filter((v): v is number => v != null && Number.isFinite(v));
  return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Mediana — resistente ao outlier de um criador com 4.820 animais no meio de
 *  trinta com 200. É a estatística certa para benchmark entre clientes. */
export function mediana(valores: (number | null | undefined)[]): number | null {
  const nums = valores.filter((v): v is number => v != null && Number.isFinite(v)).sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const meio = Math.floor(nums.length / 2);
  return nums.length % 2 === 1 ? nums[meio] : (nums[meio - 1] + nums[meio]) / 2;
}

/** Top N + "outras (n)" — a cauda longa de raças vira 15 fatias ilegíveis num
 *  gráfico; agrupar preserva o total, que é o que impede a soma de mentir. */
export function topComResto<T extends { rotulo: string; valor: number }>(
  fatias: T[],
  limite: number,
  rotuloResto = 'outras',
): { rotulo: string; valor: number }[] {
  const ordenadas = [...fatias].sort((a, b) => b.valor - a.valor);
  if (ordenadas.length <= limite) return ordenadas.map(({ rotulo, valor }) => ({ rotulo, valor }));
  const topo = ordenadas.slice(0, limite).map(({ rotulo, valor }) => ({ rotulo, valor }));
  const resto = ordenadas.slice(limite);
  const total = soma(resto.map((f) => f.valor));
  return [...topo, { rotulo: `${rotuloResto} (${resto.length})`, valor: total }];
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de várias propriedades numa visão só
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Soma fatias de mesmo rótulo. Exportada porque a consolidação de gráficos é
 * útil fora da visão geral.
 */
export function fundirFatias(fatias: FatiaDistribuicao[]): FatiaDistribuicao[] {
  const mapa = new Map<string, number>();
  for (const fatia of fatias) mapa.set(fatia.rotulo, (mapa.get(fatia.rotulo) ?? 0) + fatia.valor);
  return [...mapa].map(([rotulo, valor]) => ({ rotulo, valor }));
}

/** Soma pontos de mesmo período e devolve a série ordenada. */
export function fundirSerie(pontos: PontoSerie[]): PontoSerie[] {
  const mapa = new Map<string, number>();
  for (const ponto of pontos) mapa.set(ponto.periodo, (mapa.get(ponto.periodo) ?? 0) + ponto.valor);
  return [...mapa]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

/**
 * Funde as visões de N propriedades numa só. Soma o que é contagem; deixa NULA
 * toda média (média de médias não é a média do conjunto e não pertence a fazenda
 * nenhuma). A exceção é a média por dia, que é recalculada da série já fundida —
 * aí ela é a média de verdade do conjunto, não uma média de médias.
 */
export function consolidarVisoes(visoes: VisaoGeralPropriedade[]): VisaoGeralPropriedade {
  if (visoes.length === 1) return visoes[0];

  const soma = (pegar: (v: VisaoGeralPropriedade) => number) =>
    visoes.reduce((acc, v) => acc + pegar(v), 0);

  const somaOuNulo = (pegar: (v: VisaoGeralPropriedade) => number | null) => {
    const validos = visoes.map(pegar).filter((n): n is number => n !== null);
    return validos.length > 0 ? validos.reduce((acc, n) => acc + n, 0) : null;
  };

  const serie = fundirSerie(visoes.flatMap((v) => v.producaoDiaria90d));
  const litros = serie.reduce((acc, p) => acc + p.valor, 0);

  const diasSemLancar = visoes
    .map((v) => v.diasSemLancar)
    .filter((n): n is number => n !== null)
    .reduce<number | null>((acc, n) => (acc === null ? n : Math.min(acc, n)), null);

  return {
    animaisAtivos: soma((v) => v.animaisAtivos),
    animaisInativos: soma((v) => v.animaisInativos),
    femeas: soma((v) => v.femeas),
    machos: soma((v) => v.machos),
    lactantes: soma((v) => v.lactantes),
    gestantes: soma((v) => v.gestantes),
    mediaDel: null,
    producao30d: somaOuNulo((v) => v.producao30d),
    mediaProducaoDia: serie.length > 0 ? litros / serie.length : null,
    mediaPorLactanteDia: null,
    lancamentos30d: soma((v) => v.lancamentos30d),
    diasSemLancar,
    colaboradores: soma((v) => v.colaboradores),
    tecnicosVinculados: soma((v) => v.tecnicosVinculados),
    porCategoria: fundirFatias(visoes.flatMap((v) => v.porCategoria)),
    porRaca: fundirFatias(visoes.flatMap((v) => v.porRaca)),
    // Ordem de chegada preservada: a primeira propriedade define a ordem das
    // faixas, que vem cronológica do SQL.
    piramideEtaria: fundirFatias(visoes.flatMap((v) => v.piramideEtaria)),
    producaoDiaria90d: serie,
  };
}
