import 'server-only';

import { VIEWS_FASE_3, type LinhaCobranca } from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import {
  numeroDe,
  paginarView,
  textoDe,
  type Consulta,
  type Linha as LinhaBruta,
} from '@/lib/adm/areas/leitura';
import { ok, type Resultado } from '@/lib/adm/types';
import { SEPARADOR_VALORES } from '@/lib/adm/url';

/**
 * ÁREA COBRANÇAS — a leitura de `adm.cobrancas_lista` e o VOCABULÁRIO DE DINHEIRO
 * do painel. Serve duas telas: `/adm/carteira/receita` (a tabela e os cards de
 * caixa) e o balde inadimplente de `/adm/carteira/risco` (o valor vencido).
 *
 * NENHUM NOME DE VIEW É DIGITADO AQUI. `VIEWS_FASE_3.cobrancas` vem do contrato
 * (src/lib/adm/areas/contrato.ts), que é o mesmo arquivo que o SQL implementa e
 * que `adm_05_verificacao.sql` confere. Foi exatamente a divergência entre o nome
 * escrito no SQL e o nome escrito no TS que, na Fase 1, deixou dez telas
 * compilando, passando no lint e abrindo vazias.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE ESTE MÓDULO **NÃO** CALCULA: MRR.
 *
 * MRR é uma FOTO DE HOJE (quanto entra por mês se ninguém mexer em nada) e mora
 * em `adm.carteira_kpis`, chegando à tela por `getCarteira()`. Cobrança é
 * HISTÓRICO DE CAIXA (o que foi emitido e o que foi pago). São perguntas
 * diferentes com respostas diferentes, e um segundo motor de MRR aqui dentro
 * produziria dois números para a mesma pergunta em duas telas do mesmo painel —
 * o defeito clássico deste tipo de dashboard, e o mais difícil de perceber,
 * porque os dois números parecem plausíveis.
 *
 * POR QUE OS TOTAIS SÃO SOMADOS EM TypeScript, e não em SQL.
 *
 * A regra do painel é "card e gráfico são agregados em SQL" (queries.ts), e ela
 * existe para impedir o erro de somar uma coluna sobre uma PÁGINA já paginada —
 * é assim que um KPI fica 40% menor que a verdade sem dar erro nenhum. Aqui a
 * exceção é deliberada e tem três apoios:
 *
 *   1. `listarCobrancas()` devolve a lista COMPLETA ou falha alto. O `paginar()`
 *      abaixo varre página a página e, se estourar o teto, devolve erro em vez de
 *      truncar em silêncio. Somar sobre uma lista completa é aritmética, não
 *      amostragem.
 *   2. Os totais precisam ser EXATAMENTE a soma das linhas exibidas ao lado. Um
 *      agregado em SQL sobre um recorte ligeiramente diferente (outro filtro de
 *      status, outra janela) daria uma tela em que o card e a tabela discordam —
 *      e aí não se confia em nenhum dos dois.
 *   3. O volume é conhecido e pequeno: `pagamentos` é uma cobrança por mês por
 *      assinante, sobre ~31 assinaturas — centenas a poucos milhares de linhas.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OS ESTADOS DE UMA COBRANÇA, e por que `inadimplente` NÃO é `status = 'OVERDUE'`.
 *
 * `pagamentos.status` é o espelho do Asaas: PENDING · CONFIRMED · RECEIVED ·
 * OVERDUE · REFUNDED · RECEIVED_IN_CASH · DELETED. Pago é o trio
 * CONFIRMED/RECEIVED/RECEIVED_IN_CASH (a constante STATUS_PAGOS de
 * `supabase/functions/_shared/asaas.ts`), e em aberto é PENDING/OVERDUE.
 *
 * Só que OVERDUE é um EVENTO DE WEBHOOK, não um cálculo: a linha só vira OVERDUE
 * quando o Asaas manda `PAYMENT_OVERDUE`. Uma cobrança PENDING cujo vencimento
 * passou ontem ainda é PENDING no banco e já é dinheiro atrasado na vida real.
 * Por isso o contrato define `inadimplente` como "vencida e não paga", calculado
 * na view contra o relógio do banco — e é dele que sai a situação `vencida` aqui.
 * Ler `status = 'OVERDUE'` deixaria de fora justamente as cobranças que acabaram
 * de vencer, que são as que ainda dá para salvar com um telefonema.
 *
 * SOMENTE LEITURA (decisão D3): este módulo só faz SELECT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato — nome de view e projeção
// ─────────────────────────────────────────────────────────────────────────────

const VIEW = VIEWS_FASE_3.cobrancas;

/**
 * Citado na mensagem de erro. Não é um nome de arquivo chutado: é a descrição do
 * arquivo pela sua função ("o que implementa VIEWS_FASE_3"), porque o SQL da
 * Fase 3 é o mais novo da obra e apontar um nome errado custa meia hora de
 * procura — enquanto apontar o CONTRATO leva direto ao lugar certo, hoje e
 * depois de qualquer renomeação.
 */
const SQL_FASE_3 =
  'o SQL das views da Fase 3 em supabase/adm/ — o que implementa VIEWS_FASE_3 de ' +
  'src/lib/adm/areas/contrato.ts';

/**
 * Projeção explícita, conferida contra o contrato em COMPILAÇÃO: esquecer uma
 * coluna, ou inventar uma que o contrato não tem, é erro de `tsc` — não uma
 * célula que chega `undefined` e vira "R$ 0,00" numa tabela de dinheiro.
 *
 * Nunca `select('*')`: uma coluna nova na view entraria no payload RSC sem
 * ninguém ter decidido que ela pode.
 */
const PROJECAO = {
  pagamento_id: true,
  usuario_id: true,
  usuario_nome: true,
  plano_nome: true,
  valor: true,
  status: true,
  metodo_pagamento: true,
  data_vencimento: true,
  data_pagamento: true,
  inadimplente: true,
  dias_de_atraso: true,
} satisfies Record<keyof LinhaCobranca, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing — agora COMPARTILHADO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Isto era um bloco de ~85 linhas copiado aqui dentro, com a justificativa de
 * que importar `queries.ts` (54 KB) para usar `numero()` arrastaria junto a
 * lista mestra, a carteira e o catálogo do escape hatch — e que "no dia em que
 * isto virar um módulo próprio, este arquivo é um dos primeiros a trocar".
 *
 * Esse dia chegou quando `areas/pagamentos-cliente.ts` precisou do MESMO
 * comportamento e a cópia viraria a terceira. `areas/leitura.ts` é o módulo
 * pequeno que faltava: só a leitura paginada e a classificação de erro, sem
 * arrastar nada da lista mestra junto.
 */
type Linha = LinhaBruta;

const paginar = (fabrica: (de: number, ate: number) => Consulta) =>
  paginarView(VIEW, SQL_FASE_3, fabrica);

const texto = textoDe;
const numero = numeroDe;


function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function booleano(v: unknown): boolean {
  return v === true || v === 't' || v === 'true';
}

// ─────────────────────────────────────────────────────────────────────────────
// O vocabulário: os estados do Asaas e as situações da tela
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PAGO. Espelha a constante STATUS_PAGOS de `supabase/functions/_shared/asaas.ts`
 * — a mesma lista que a Edge Function usa para liberar acesso. Divergir dela
 * significaria o painel dizer "não pagou" para quem o app já considera pagante.
 */
export const STATUS_PAGO: ReadonlySet<string> = new Set(['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']);

/** EM ABERTO: emitida e ainda não confirmada. Vencida ou não, é dinheiro que a
 *  empresa espera receber — o que separa os dois casos é `inadimplente`. */
export const STATUS_EM_ABERTO: ReadonlySet<string> = new Set(['PENDING', 'OVERDUE']);

/**
 * As situações que a TELA usa. Não são os status do Asaas: sete estados técnicos
 * viram cinco perguntas de negócio, mais uma sexta que é a rede de segurança.
 *
 * `outra` existe de propósito e não é decoração defensiva: se o Asaas ganhar um
 * status novo amanhã, ele cai aqui em vez de ser contado como dinheiro em aberto.
 * Inflar "a receber" com um estado que ninguém entendeu ainda é pior do que uma
 * linha classificada como desconhecida — esta pelo menos aparece na tela e vira
 * pergunta.
 */
export type SituacaoCobranca = 'paga' | 'em_aberto' | 'vencida' | 'estornada' | 'cancelada' | 'outra';

/** Ordem de exibição dos chips: primeiro o que entrou, depois o que falta, depois
 *  o que deu errado. É a ordem em que se lê uma tela de caixa. */
export const SITUACOES: readonly SituacaoCobranca[] = [
  'paga',
  'em_aberto',
  'vencida',
  'estornada',
  'cancelada',
  'outra',
];

export const SITUACAO_ROTULO: Record<SituacaoCobranca, string> = {
  paga: 'Paga',
  em_aberto: 'Em aberto',
  vencida: 'Vencida',
  estornada: 'Estornada',
  cancelada: 'Cancelada',
  outra: 'Outra',
};

/**
 * A REGRA de cada situação, escrita por extenso. Vai para o `title` do chip na
 * tela: um filtro cujo critério ninguém sabe é um filtro em que ninguém confia —
 * e numa tela de dinheiro isso vira "esse número está errado" na primeira dúvida.
 */
export const SITUACAO_REGRA: Record<SituacaoCobranca, string> = {
  paga: 'Confirmada pelo Asaas: CONFIRMED, RECEIVED ou RECEIVED_IN_CASH.',
  em_aberto: 'Emitida, ainda não paga e dentro do prazo.',
  vencida: 'Emitida, não paga e com o vencimento no passado — inadimplência de verdade.',
  estornada: 'REFUNDED: o dinheiro entrou e voltou.',
  cancelada: 'DELETED: a cobrança foi apagada no Asaas e nunca vai ser paga.',
  outra: 'Status que o painel ainda não classifica — não entra em nenhuma soma de caixa.',
};

/**
 * Lê `?f.situacao=` da URL — a MESMA leitura para a tela e para a exportação.
 *
 * Nasceu dentro de `/adm/carteira/receita/page.tsx` e foi movida para cá pelo
 * mesmo motivo de `lerSituacoesClienteDaUrl` em `pagamentos-cliente.ts`: a
 * exportação (CSV/XLSX) precisa do idêntico recorte, e duas cópias da mesma
 * allowlist divergem na primeira vez que só uma for editada.
 *
 * Allowlist: valor desconhecido é DESCARTADO em silêncio, e não vira erro — um
 * link salvo meses atrás, com uma situação renomeada desde então, deve abrir
 * sem filtro em vez de dar erro.
 */
export function lerSituacoesDaUrl(bruto: string | null): SituacaoCobranca[] {
  if (!bruto) return [];
  const pedidas = bruto.split(SEPARADOR_VALORES).map((v) => v.trim());
  return SITUACOES.filter((s) => pedidas.includes(s));
}

/**
 * Status técnico → situação de negócio.
 *
 * A ORDEM DOS TESTES É A REGRA. Pago vence tudo: uma cobrança paga com 40 dias de
 * atraso é uma cobrança PAGA, e mostrá-la como vencida mandaria o operador cobrar
 * quem já pagou — o pior erro possível desta tela. Só depois de descartar o
 * pagamento é que `inadimplente` decide entre vencida e em aberto.
 */
export function situacaoDaCobranca(l: LinhaCobranca): SituacaoCobranca {
  const status = l.status?.trim().toUpperCase() ?? '';
  if (status === '') return 'outra';
  if (STATUS_PAGO.has(status)) return 'paga';
  if (status === 'REFUNDED') return 'estornada';
  if (status === 'DELETED') return 'cancelada';
  if (STATUS_EM_ABERTO.has(status)) return l.inadimplente ? 'vencida' : 'em_aberto';
  return 'outra';
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

function mapearCobranca(l: Linha): LinhaCobranca {
  return {
    pagamento_id: inteiro(l.pagamento_id),
    // null é informação de negócio, não dado faltando: a assinatura de uma
    // ASSOCIAÇÃO não tem `usuario_id` (o CHECK do banco exige exatamente um dos
    // dois donos). A cobrança existe, o dinheiro é real, e não há ficha de
    // cliente para abrir — a tela precisa saber disso para não montar um link
    // para /adm/u/0.
    usuario_id: numero(l.usuario_id),
    usuario_nome: texto(l.usuario_nome),
    plano_nome: texto(l.plano_nome),
    // Valor fica NULL quando é null de verdade. Trocar por 0 esconderia uma linha
    // com defeito de dado dentro de um total que continuaria parecendo íntegro.
    valor: numero(l.valor),
    status: texto(l.status),
    metodo_pagamento: texto(l.metodo_pagamento),
    data_vencimento: texto(l.data_vencimento),
    data_pagamento: texto(l.data_pagamento),
    inadimplente: booleano(l.inadimplente),
    // Contagem de dias: 0 significa "vence hoje", null significa "não se aplica"
    // (paga, cancelada, ou ainda no prazo). São coisas diferentes na tela.
    dias_de_atraso: numero(l.dias_de_atraso),
  };
}

/**
 * TODAS as cobranças, da mais recente para a mais antiga por vencimento.
 *
 * Sem filtro de período de propósito: os cards da tela de receita falam da
 * carteira inteira ("em aberto", "inadimplente" não têm janela — dinheiro parado
 * de 2024 continua parado hoje), e a tabela recorta em memória o que o operador
 * pedir. Filtrar no banco por período faria o card e a tabela responderem a
 * perguntas diferentes com a mesma aparência.
 *
 * A paginação é obrigatória mesmo com dezenas de linhas: o PostgREST corta a
 * resposta no `db-max-rows` e devolve HTTP 200 — uma lista truncada chega aqui
 * parecendo completa.
 */
export async function listarCobrancas(): Promise<Resultado<LinhaCobranca[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginar((de, ate) =>
    (supa.from(VIEW).select(SELECT) as unknown as Consulta)
      // A ordem é do BANCO e precisa ser TOTAL: `paginar()` usa range/offset, e
      // range sobre consulta sem desempate pode repetir e pular linha entre
      // páginas. `pagamento_id` é a chave, então fecha a ordem.
      .order('data_vencimento', { ascending: false, nullsFirst: false })
      .order('pagamento_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;

  return ok(res.dados.map(mapearCobranca));
}

// ─────────────────────────────────────────────────────────────────────────────
// Recorte — o que a tabela mostra
// ─────────────────────────────────────────────────────────────────────────────

export interface FiltroCobrancas {
  /** Vazio ou ausente = todas. Dentro da faceta os valores são OU. */
  situacoes?: readonly SituacaoCobranca[];
  /**
   * Corte por DATA DE VENCIMENTO ('YYYY-MM-DD'), inclusivo nos dois extremos.
   *
   * Vencimento, e não pagamento: `data_pagamento` é NULL em toda cobrança em
   * aberto, então filtrar por ela sumiria com exatamente as linhas que a tela
   * existe para mostrar.
   */
  de?: string | null;
  ate?: string | null;
}

/** 'YYYY-MM-DD' de um `date` ou de um timestamp — os dois chegam como texto pelo
 *  PostgREST, e comparar os dez primeiros caracteres é comparação de dia civil
 *  sem passar por `new Date()` (que reinterpretaria a data no fuso do servidor). */
function dia(iso: string | null): string | null {
  return iso == null ? null : iso.slice(0, 10);
}

export function filtrarCobrancas(
  linhas: readonly LinhaCobranca[],
  filtro: FiltroCobrancas = {},
): LinhaCobranca[] {
  const situacoes = filtro.situacoes && filtro.situacoes.length > 0 ? new Set(filtro.situacoes) : null;
  const de = filtro.de ?? null;
  const ate = filtro.ate ?? null;

  return linhas.filter((l) => {
    if (situacoes && !situacoes.has(situacaoDaCobranca(l))) return false;
    if (de == null && ate == null) return true;
    const vencimento = dia(l.data_vencimento);
    // Cobrança sem vencimento não pode ser afirmada dentro NEM fora da janela.
    // Fica de fora quando há recorte, e o resumo conta essas linhas à parte.
    if (vencimento == null) return false;
    if (de != null && vencimento < de) return false;
    if (ate != null && vencimento > ate) return false;
    return true;
  });
}

/** Contagem por situação, para os chips do filtro. Um filtro que oferece um
 *  valor com zero linhas é um beco sem saída; com a contagem ao lado, o operador
 *  já sabe o que vai encontrar antes de clicar. */
export function contarPorSituacao(linhas: readonly LinhaCobranca[]): Record<SituacaoCobranca, number> {
  const contagem: Record<SituacaoCobranca, number> = {
    paga: 0,
    em_aberto: 0,
    vencida: 0,
    estornada: 0,
    cancelada: 0,
    outra: 0,
  };
  for (const l of linhas) contagem[situacaoDaCobranca(l)] += 1;
  return contagem;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação — nasceu na página, mora aqui pelo mesmo motivo de lerSituacoesDaUrl
//
// A exportação (CSV/XLSX) precisa produzir o arquivo na MESMA ordem que a
// tabela em `/adm/carteira/receita/page.tsx` está mostrando — senão o operador
// baixa um arquivo em ordem diferente da que está olhando na tela, e some a
// garantia central desta área: "a URL da tela mais o formato".
// ─────────────────────────────────────────────────────────────────────────────

export type ChaveOrdemCobranca = 'usuario' | 'plano' | 'valor' | 'situacao' | 'vencimento' | 'pagamento' | 'atraso';

const ORDENADORES_COBRANCA: Record<ChaveOrdemCobranca, (l: LinhaCobranca) => string | number | null> = {
  usuario: (l) => l.usuario_nome,
  plano: (l) => l.plano_nome,
  valor: (l) => l.valor,
  // Ordena pelo RÓTULO e não pela chave: é a ordem alfabética que o operador vê
  // na coluna. Ordenar pela chave interna daria quase o mesmo resultado por
  // acidente e outro qualquer no dia em que um rótulo mudar.
  situacao: (l) => SITUACAO_ROTULO[situacaoDaCobranca(l)],
  vencimento: (l) => l.data_vencimento,
  pagamento: (l) => l.data_pagamento,
  atraso: (l) => l.dias_de_atraso,
};

export const ORDEM_PADRAO_COBRANCA: { chave: ChaveOrdemCobranca; ascendente: boolean } = {
  chave: 'vencimento',
  ascendente: false,
};

function ehChaveOrdemCobranca(valor: string): valor is ChaveOrdemCobranca {
  return Object.prototype.hasOwnProperty.call(ORDENADORES_COBRANCA, valor);
}

/** '-valor' → { valor, desc }. Mesma grafia do `?sort=` da `<AdmTable>` (o '-'
 *  é descendente), aceitando um nível só: aqui não há Shift+clique para empilhar. */
export function lerOrdemCobrancaDaUrl(bruto: string | null): { chave: ChaveOrdemCobranca; ascendente: boolean } {
  const texto = (bruto ?? '').split(SEPARADOR_VALORES)[0]?.trim() ?? '';
  if (texto === '') return ORDEM_PADRAO_COBRANCA;
  const ascendente = !texto.startsWith('-');
  const chave = ascendente ? texto.replace(/^\+/, '') : texto.slice(1);
  // Chave desconhecida (link velho, coluna renomeada) volta ao default em vez de
  // virar erro: um favorito do Felipe não pode quebrar uma tela de dinheiro.
  return ehChaveOrdemCobranca(chave) ? { chave, ascendente } : ORDEM_PADRAO_COBRANCA;
}

/** NULO SEMPRE POR ÚLTIMO, nos dois sentidos — a regra herdada do `DataTable` do
 *  /katmandu e mantida na `<AdmTable>`: inverter a direção não pode encher a
 *  primeira página de linhas vazias. */
function compararOrdemCobranca(a: string | number | null, b: string | number | null, sinal: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'pt-BR') * sinal;
  if (a < b) return -1 * sinal;
  if (a > b) return 1 * sinal;
  return 0;
}

export function ordenarCobrancas(
  linhas: readonly LinhaCobranca[],
  ordem: { chave: ChaveOrdemCobranca; ascendente: boolean },
): LinhaCobranca[] {
  const pegar = ORDENADORES_COBRANCA[ordem.chave];
  const sinal = ordem.ascendente ? 1 : -1;
  return [...linhas].sort((a, b) => {
    const r = compararOrdemCobranca(pegar(a), pegar(b), sinal);
    // Desempate pela chave: sem ele, duas cobranças do mesmo dia trocam de lugar
    // entre uma página e a seguinte, e a paginação passa a pular e repetir linha.
    return r !== 0 ? r : b.pagamento_id - a.pagamento_id;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo — os números dos cards
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoCobrancas {
  cobrancas: number;

  pagas: number;
  /**
   * Quantas das pagas têm valor conhecido — o DIVISOR do ticket médio.
   * Separado de `pagas` porque uma cobrança paga sem valor não vale R$ 0: vale
   * um número que o banco não guardou, e contá-la dilui o ticket.
   */
  pagasComValor: number;
  /** Soma das pagas, o histórico inteiro. Não é MRR nem receita de 12 meses. */
  recebido: number;
  /** Média das pagas COM VALOR. null quando não há nenhuma — nunca 0. */
  ticketMedio: number | null;

  emAberto: number;
  emAbertoValor: number;

  vencidas: number;
  vencidasValor: number;
  /** Contas DISTINTAS com ao menos uma cobrança vencida — é para quantas pessoas
   *  se liga, e não quantos boletos existem. */
  contasInadimplentes: number;
  /** O maior atraso da carteira, em dias. null quando não há vencida. */
  maiorAtraso: number | null;

  /** Linhas com `valor` nulo: qualidade do dado, à vista. Elas ficam FORA de toda
   *  soma acima, e escondê-las faria um total incompleto parecer completo. */
  semValor: number;
  /** Cobranças sem data de vencimento — invisíveis a qualquer recorte de período. */
  semVencimento: number;
}

/**
 * Os totais da tela, somados sobre a lista COMPLETA (ver o cabeçalho do arquivo).
 *
 * Nenhuma conta aqui usa o relógio: `inadimplente` e `dias_de_atraso` vêm
 * calculados da view, contra o relógio do BANCO. Recalcular atraso em JS
 * introduziria a divergência clássica — o servidor renderiza "vencido há 1 dia"
 * e o cliente hidrata com "vence hoje" na virada da meia-noite.
 */
export function resumirCobrancas(linhas: readonly LinhaCobranca[]): ResumoCobrancas {
  const resumo: ResumoCobrancas = {
    cobrancas: linhas.length,
    pagas: 0,
    pagasComValor: 0,
    recebido: 0,
    ticketMedio: null,
    emAberto: 0,
    emAbertoValor: 0,
    vencidas: 0,
    vencidasValor: 0,
    contasInadimplentes: 0,
    maiorAtraso: null,
    semValor: 0,
    semVencimento: 0,
  };

  const contas = new Set<number>();

  for (const l of linhas) {
    if (l.valor == null) resumo.semValor += 1;
    if (l.data_vencimento == null) resumo.semVencimento += 1;

    const valor = l.valor ?? 0;

    switch (situacaoDaCobranca(l)) {
      case 'paga':
        resumo.pagas += 1;
        resumo.recebido += valor;
        // O DIVISOR do ticket médio conta só quem tem valor CONHECIDO. Uma
        // cobrança paga sem valor não vale R$ 0 — ela vale um número que o
        // banco não guardou; jogá-la no divisor dilui o ticket para baixo e
        // afirma um preço que o produto não tem. É a mesma família do
        // `ticketMedio` ser null em vez de zero, três linhas abaixo.
        if (l.valor != null) resumo.pagasComValor += 1;
        break;
      case 'em_aberto':
        resumo.emAberto += 1;
        resumo.emAbertoValor += valor;
        break;
      case 'vencida':
        resumo.vencidas += 1;
        resumo.vencidasValor += valor;
        // A cobrança de associação não tem usuario_id (ver mapearCobranca) e não
        // entra na contagem de CONTAS — mas o valor dela entra, porque o dinheiro
        // está parado do mesmo jeito.
        if (l.usuario_id != null) contas.add(l.usuario_id);
        if (l.dias_de_atraso != null) {
          resumo.maiorAtraso = Math.max(resumo.maiorAtraso ?? 0, l.dias_de_atraso);
        }
        break;
      default:
        // Estornada, cancelada e desconhecida não são caixa: não somam em lugar
        // nenhum, de propósito.
        break;
    }
  }

  resumo.contasInadimplentes = contas.size;
  // null e não 0: "nenhuma cobrança paga" e "ticket médio de R$ 0,00" são coisas
  // diferentes, e a segunda seria uma afirmação falsa sobre o preço do produto.
  resumo.ticketMedio = resumo.pagasComValor > 0 ? resumo.recebido / resumo.pagasComValor : null;

  return resumo;
}
