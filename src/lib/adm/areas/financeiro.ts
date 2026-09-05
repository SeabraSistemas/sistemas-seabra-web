import 'server-only';

import { VIEWS_FASE_2, type LinhaFinanceiro } from '@/lib/adm/areas/contrato';
import { fundirFatias, soma } from '@/lib/adm/metricas';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import {
  erro,
  ok,
  semConfig,
  type FatiaDistribuicao,
  type PontoSerie,
  type Resultado,
} from '@/lib/adm/types';

/**
 * Área FINANCEIRO — a economia DA FAZENDA (aba 8).
 *
 * ⚠️ NÃO É A ASSINATURA. As duas abas se chamam quase a mesma coisa e medem
 * coisas opostas: aqui é o livro-caixa do produtor (o leite que ele vendeu, a
 * ração que ele comprou); a aba Assinatura é o que a Sistema Seabra cobra dele
 * pelo SeabraApp. Trocar uma pela outra numa conversa comercial é o erro
 * clássico desta tela em software de agro — daí o aviso no topo da página, e
 * daí este parágrafo aqui, para quem chegar pelo código antes de chegar pela
 * tela.
 *
 * ⚠️ MÓDULO OCULTO PARA O CONSULTOR NO APP. Decisão de produto já travada:
 * `financeiro_lancamentos`, `financeiro_setores` e `config_financeiro` ficam
 * deliberadamente fora do modo consultor (PLANO_EVOLUCAO_TECNICO_CONSULTOR.md
 * :492-531 do seabra-app-main). Ou seja: o /adm mostra ao Felipe um dado que o
 * técnico dele NÃO vê no app do cliente. Isso precisa estar escrito na tela,
 * senão a primeira reação de quem abre é achar que o app está com bug.
 *
 * TRÊS ARMADILHAS DE DADO QUE ESTE MÓDULO RESOLVE, e que ninguém pega olhando a
 * tela pronta:
 *
 * 1. ZERO DE CUSTO POR LITRO É MENTIRA. `custo_litro` só existe se o produtor
 *    rodou a estimativa no app e gerou uma linha em `estimativa_custo_snapshot`
 *    — e a adoção do módulo é baixa. Sem snapshot, "R$ 0,00 por litro" é uma
 *    AFIRMAÇÃO FALSA sobre o negócio do cliente (custo zero seria um milagre),
 *    enquanto "sem estimativa de custo calculada" é verdade e ainda vira gancho
 *    de consultoria. Por isso `semEstimativa` é um campo do domínio, e não uma
 *    comparação com zero espalhada pela tela.
 *
 * 2. `financeiro_lancamentos.valor` É ASSINADO — a despesa entra negativa no
 *    banco (migrations/create_financeiro_tables.sql:21-35). Se a view repassar
 *    o sinal, um card "Despesa 12m: -R$ 84.300" confunde, e — pior — o gráfico
 *    de barras SOME: `agregarOutros()` (charts/theme.ts:320) descarta fatia com
 *    valor <= 0 em silêncio, e a distribuição por setor apareceria vazia num
 *    cliente que tem despesa lançada. Aqui a despesa vira magnitude, uma vez só.
 *
 * 3. MÉDIA NÃO SE SOMA. Custo por litro e lucro por lactante são razões: somar
 *    os de três fazendas dá um número que não pertence a fazenda nenhuma. Na
 *    consolidação eles viram null e a série de custo/litro fica vazia — a tela
 *    pede para escolher uma fazenda em vez de desenhar uma curva inventada.
 *
 * Somente leitura (D3). Nenhuma escrita, aqui ou em qualquer lugar do /adm.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato de leitura — nome de view e de coluna vêm de contrato.ts, só de lá
// ─────────────────────────────────────────────────────────────────────────────

/** Nome da view. NUNCA digitado como string: na Fase 1 foi assim que dez views
 *  consumidas viraram seis criadas com outro nome, e só uma tela abria. */
const VIEW = VIEWS_FASE_2.financeiro;

/**
 * Projeção explícita e TIPADA PELO CONTRATO. O tipo `keyof LinhaFinanceiro` faz
 * o `tsc` recusar uma coluna que o contrato não declara — a divergência
 * SQL↔TypeScript passa a falhar na compilação, e não em runtime com a tela
 * vazia fingindo que o cliente não tem dado.
 */
const COLUNAS: (keyof LinhaFinanceiro)[] = [
  'propriedade_id',
  'receita_12m',
  'despesa_12m',
  'margem_12m',
  'custo_litro',
  'lucro_lactante_mes',
  'data_snapshot',
  'lancamentos_12m',
  'custo_litro_serie',
  'despesa_por_setor',
];

/**
 * A linha como ela CHEGA do PostgREST: as chaves são as do contrato (um typo não
 * compila), os valores são `unknown` (o banco não conhece o tipo do TypeScript —
 * `numeric` chega como string quando a precisão não cabe em double).
 */
type Crua<T> = { [K in keyof T]?: unknown };

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing — espelha o de queries.ts, que mantém os helpers privados
// ─────────────────────────────────────────────────────────────────────────────

type ErroPostgrest = { message: string; code?: string };
type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** "O banco não está preparado", não "o painel quebrou": PGRST106 schema fora do
 *  Exposed schemas · PGRST205/42P01 view inexistente · 42501 sem privilégio ·
 *  3F000 schema inexistente. Nos cinco a ação é a mesma — rodar o SQL. */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${VIEW}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${VIEW}" não está acessível (${e.code}). Rode as migrations de ` +
        'supabase/adm/ (adm_05_verificacao.sql acusa exatamente qual view falta) e confirme ' +
        'que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${VIEW}: ${e.message}`);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  return null;
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres vem como string quando não cabe em double. Ignorar
  // isso transformaria a receita do cliente em "—" sem nenhum aviso.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

/** Ver armadilha 2 do cabeçalho: despesa pode chegar com sinal negativo. */
function magnitude(v: number | null): number | null {
  return v == null ? null : Math.abs(v);
}

function objeto(v: unknown): Record<string, unknown> | null {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null;
}

/** Coluna jsonb que veio como array de objetos; qualquer outra coisa é vazio. */
function arranjo(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.map(objeto).filter((l): l is Record<string, unknown> => l !== null) : [];
}

function mapearFatias(linhas: Record<string, unknown>[]): FatiaDistribuicao[] {
  return linhas.map((l) => ({
    rotulo: texto(l.rotulo) ?? 'Sem setor',
    valor: magnitude(numero(l.valor)) ?? 0,
  }));
}

function mapearSerie(linhas: Record<string, unknown>[]): PontoSerie[] {
  return linhas
    .map((l) => ({ periodo: texto(l.periodo) ?? '', valor: numero(l.valor) ?? 0 }))
    .filter((p) => p.periodo !== '')
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// ─────────────────────────────────────────────────────────────────────────────
// O domínio da aba
// ─────────────────────────────────────────────────────────────────────────────

export interface FinanceiroProdutor {
  /** Soma dos lançamentos de receita dos últimos 12 meses. null = nenhum lançamento. */
  receita12m: number | null;
  /** SEMPRE magnitude (>= 0), mesmo que o banco guarde a despesa negativa. */
  despesa12m: number | null;
  /** receita - despesa. Negativa é informação: a fazenda está no vermelho. */
  margem12m: number | null;
  lancamentos12m: number;

  /** Do snapshot mais recente de `estimativa_custo_snapshot`. */
  custoLitro: number | null;
  lucroLactanteMes: number | null;
  /** Data do snapshot. Um snapshot de 8 meses atrás não descreve o custo de hoje. */
  dataSnapshot: string | null;
  /**
   * true quando NÃO existe estimativa nenhuma. A tela diz "sem estimativa de
   * custo calculada" — nunca R$ 0,00, que seria uma afirmação falsa sobre o
   * negócio do cliente (ver armadilha 1 no cabeçalho).
   */
  semEstimativa: boolean;

  /** Custo por litro ao longo do tempo — a única série financeira pronta no banco. */
  custoLitroSerie: PontoSerie[];
  /** Despesa por setor, já em magnitude. */
  despesaPorSetor: FatiaDistribuicao[];

  /** true quando o objeto é a soma de mais de uma propriedade — razões viram null. */
  consolidado: boolean;
}

/**
 * Propriedade sem linha na view. É VAZIO, não quebrado: um criador que nunca
 * abriu o módulo financeiro é um fato comercial (e uma oportunidade), não um
 * erro de leitura. `semEstimativa` nasce true pelo mesmo motivo.
 */
export function financeiroVazio(): FinanceiroProdutor {
  return {
    receita12m: null,
    despesa12m: null,
    margem12m: null,
    lancamentos12m: 0,
    custoLitro: null,
    lucroLactanteMes: null,
    dataSnapshot: null,
    semEstimativa: true,
    custoLitroSerie: [],
    despesaPorSetor: [],
    consolidado: false,
  };
}

function mapear(l: Crua<LinhaFinanceiro>): FinanceiroProdutor {
  const receita = numero(l.receita_12m);
  const despesa = magnitude(numero(l.despesa_12m));
  const margemDaView = numero(l.margem_12m);
  const custoLitro = numero(l.custo_litro);
  const lucroLactanteMes = numero(l.lucro_lactante_mes);
  const dataSnapshot = texto(l.data_snapshot);
  const serie = mapearSerie(arranjo(l.custo_litro_serie));

  return {
    receita12m: receita,
    despesa12m: despesa,
    // A view é a fonte da margem. O cálculo local só entra quando ela vem nula
    // E os dois lados são conhecidos: aí a margem É calculável, e devolver "—"
    // com receita e despesa na tela ao lado pareceria bug, não ausência de dado.
    margem12m: margemDaView ?? (receita != null && despesa != null ? receita - despesa : null),
    lancamentos12m: inteiro(l.lancamentos_12m),
    custoLitro,
    lucroLactanteMes,
    dataSnapshot,
    // Quatro sinais, não um: basta um deles existir para haver estimativa. Testar
    // só `custo_litro` daria "sem estimativa" para um snapshot em que o produtor
    // preencheu a receita e não fechou o custo.
    semEstimativa:
      dataSnapshot == null && custoLitro == null && lucroLactanteMes == null && serie.length === 0,
    custoLitroSerie: serie,
    despesaPorSetor: mapearFatias(arranjo(l.despesa_por_setor)),
    consolidado: false,
  };
}

/**
 * Uma linha por propriedade — cardinalidade garantida pelo contrato, por isso
 * `.limit(1)` e nenhuma decisão sobre duplicata aqui.
 */
export async function getFinanceiro(propriedadeId: number): Promise<Resultado<FinanceiroProdutor>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const consulta = supa
    .from(VIEW)
    .select(COLUNAS.join(','))
    .eq('propriedade_id', propriedadeId)
    .limit(1) as unknown as PromiseLike<Resposta>;

  const { data, error } = await consulta;
  if (error) return falha(error);

  const linha = objeto(data?.[0]);
  return ok(linha ? mapear(linha) : financeiroVazio());
}

/**
 * Funde N propriedades numa visão só.
 *
 * Dinheiro SOMA (receita, despesa, margem e contagem de lançamento de três
 * fazendas somam de verdade). Razão NÃO SOMA e também não vira média de médias:
 * custo por litro e lucro por lactante ficam nulos, e a série some — a tela pede
 * uma fazenda no seletor em vez de desenhar uma curva que não é de ninguém.
 *
 * A despesa por setor é fundida por NOME do setor. `financeiro_setores` é um
 * catálogo por propriedade, então "Nutrição" de uma fazenda e "Nutrição" de
 * outra são linhas diferentes com o mesmo rótulo; somá-las é o comportamento
 * útil (é uma taxonomia de custo, quase sempre vinda do mesmo cadastro padrão),
 * mas a tela avisa que está somando.
 */
export function consolidarFinanceiro(itens: FinanceiroProdutor[]): FinanceiroProdutor {
  if (itens.length === 0) return financeiroVazio();
  if (itens.length === 1) return itens[0];

  // Soma que preserva o "não sei": se NENHUMA fazenda tem o número, o total
  // continua null e a tela mostra "—". Se pelo menos uma tem, as outras entram
  // como zero — que é o que "sem lançamento no período" significa para dinheiro.
  const somaOuNulo = (pegar: (f: FinanceiroProdutor) => number | null): number | null => {
    const conhecidos = itens.map(pegar).filter((v): v is number => v != null);
    return conhecidos.length === 0 ? null : soma(conhecidos);
  };

  return {
    receita12m: somaOuNulo((f) => f.receita12m),
    despesa12m: somaOuNulo((f) => f.despesa12m),
    margem12m: somaOuNulo((f) => f.margem12m),
    lancamentos12m: itens.reduce((acc, f) => acc + f.lancamentos12m, 0),
    custoLitro: null,
    lucroLactanteMes: null,
    dataSnapshot: null,
    // "Nenhuma das fazendas tem estimativa" é uma frase verdadeira; "alguma tem"
    // não autoriza mostrar número consolidado, e por isso o card fica em "—".
    semEstimativa: itens.every((f) => f.semEstimativa),
    custoLitroSerie: [],
    despesaPorSetor: fundirFatias(itens.flatMap((f) => f.despesaPorSetor)),
    consolidado: true,
  };
}

/**
 * Margem sobre receita, em FRAÇÃO (0,18 = 18%) como o resto do /adm.
 *
 * Null quando não há receita: dividir por zero daria Infinity, e uma fazenda que
 * só lançou despesa tem margem negativa conhecida em reais — mas percentual
 * indefinido. São duas informações diferentes e a tela mostra as duas assim.
 */
export function margemPercentual(f: FinanceiroProdutor): number | null {
  if (f.margem12m == null || f.receita12m == null || f.receita12m <= 0) return null;
  return f.margem12m / f.receita12m;
}

/** Houve movimento no livro-caixa nos últimos 12 meses? Distingue "fazenda sem
 *  financeiro" de "fazenda com financeiro zerado" — a primeira é venda, a
 *  segunda é suporte. */
export function temLancamentos(f: FinanceiroProdutor): boolean {
  return f.lancamentos12m > 0 || f.receita12m != null || f.despesa12m != null;
}
