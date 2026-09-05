import 'server-only';

import { admClient, publicClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import {
  erro,
  ok,
  semConfig,
  PAPEIS,
  ORIGEM_ACESSO_ROTULO,
  SEGMENTO_ROTULO,
  type AssinaturaResumo,
  type Carteira,
  type FatiaDistribuicao,
  type KpisCarteira,
  type OrigemAcesso,
  type PagamentoLinha,
  type Papel,
  type PontoSerie,
  type PropriedadeEscopo,
  type Resultado,
  type Segmento,
  type StatusEfetivo,
  type UsuarioLista,
  type VisaoGeralPropriedade,
  type Escopo,
} from '@/lib/adm/types';
import { idsDoEscopo, resolverEscopo, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { mesesAte, preencherSerie } from '@/lib/adm/metricas';
import {
  colunaFiltroTenant,
  colunaOrdenacaoPadrao,
  colunasVisiveisPadrao,
  getColuna,
  referenciasDe,
  validarColunas,
  type TabelaCatalogo,
} from '@/lib/adm/tabelas';

/**
 * Camada de LEITURA do /adm. Espelho de src/lib/criadores/queries.ts, com três
 * diferenças que vêm do que o /adm é:
 *
 * 1. Nunca lança. Toda função devolve `Resultado<T>`, e falta de env ou de view
 *    vira `motivo: 'sem-config'` com a instrução de qual SQL rodar — é o que
 *    permite `npm run dev` numa máquina sem a service_role: a página mostra um
 *    aviso, não um 500.
 * 2. Todo acesso passa pelo client pinado no schema `adm`, que só tem VIEWS e só
 *    tem SELECT. É o teto estrutural do painel: `colaborador_senha` (6 senhas em
 *    texto plano) e os CPFs ficam fora de alcance por construção, não por
 *    disciplina de quem escreve o `select`.
 * 3. Card e gráfico são agregados em SQL. Nada aqui soma uma coluna em JS sobre
 *    uma página já paginada — esse é o jeito clássico de um KPI ficar 40% menor
 *    que a verdade sem dar erro nenhum.
 *
 * ⚠️ PAGINAÇÃO NÃO É OPCIONAL. O PostgREST corta a resposta no `db-max-rows` e
 * devolve HTTP 200: a tabela vem truncada e parece completa. O maior rebanho da
 * base tem 4.820 animais — sem `.range()`/keyset, o /adm mostraria 1.000 e o
 * Felipe acharia que o cliente perdeu 3.820 cabras.
 *
 * ⚠️ CONTRATO COM supabase-admin.ts (arquivo de outro agente): assumo
 * `admClient(): SupabaseClient | null`, criado com `SUPABASE_SERVICE_ROLE_KEY`
 * (sem NEXT_PUBLIC_), `db: { schema: 'adm' }` e `null` quando falta env.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato com o schema `adm`
// ─────────────────────────────────────────────────────────────────────────────

/** O SQL que cria tudo isto. O nome aparece na mensagem de erro de propósito:
 *  "view não existe" sem dizer o que rodar custa meia hora de investigação. */
const SQL_VIEWS = 'migrations/adm_01_schema_e_views.sql';

/**
 * As views que este módulo consome. Uma view por PERGUNTA, não por tabela — o
 * agregado mora no Postgres (ver ponto 3 do cabeçalho) e chega aqui pronto.
 */
const VIEW = {
  /** 1 linha por usuário, com contato JÁ MASCARADO e o health score calculado. */
  usuarios: 'usuarios_lista',
  /** Exatamente 1 linha, com todos os KPIs da carteira (adm_06_carteira.sql). */
  carteiraKpis: 'carteira_kpis',
  /** (serie, periodo 'YYYY-MM', valor) — 'receita' e 'novos_clientes'. */
  carteiraSerie: 'carteira_serie_mensal',
  /** (dimensao, rotulo, valor) — 'segmento', 'estado', 'plano'. */
  carteiraDistribuicao: 'carteira_distribuicao',
  /** 1 linha por (usuario, propriedade alcançada): as 5 pernas de escopo já resolvidas. */
  escopo: 'propriedades_escopo',
  /** 1 linha por propriedade, com os cards da aba Visão geral. */
  visaoGeral: 'propriedade_visao_geral',
  // As distribuições e a série de produção da propriedade NÃO são views: vêm
  // como colunas jsonb dentro de adm.propriedade_visao_geral (adm_01:648-651).
  // Uma leitura em vez de três, e o recorte de 90 dias já vem resolvido no SQL.
  /** 1 linha por usuário dono de assinatura, com DISTINCT ON já aplicado. */
  assinatura: 'assinatura_normalizada',
  /** Cobranças com o usuario_id já resolvido pelo join com assinaturas. */
  pagamentos: 'pagamentos_conta',
} as const;

/**
 * Projeção explícita, nunca `select('*')`.
 *
 * Motivo concreto: `adm.usuarios_lista` carrega uma coluna `busca` com o texto
 * de pesquisa (nome + e-mail + propriedade + dígitos de whatsapp e CPF, sem
 * acento) que existe SÓ para o `ilike` do campo de busca. Ela nunca pode ser
 * projetada — se entrar no resultado, o e-mail cru viaja no payload RSC e está
 * no DevTools, e a máscara feita em SQL vira decoração.
 */
const COLUNAS_USUARIO = [
  'id',
  'nome',
  'email_mascarado',
  'whatsapp_mascarado',
  'whatsapp_pais',
  'papel',
  'ativo',
  'is_tester',
  'is_demo',
  'tem_cpf',
  'sem_auth',
  'onboarding_finalizado',
  'data_cadastro',
  'associacao_id',
  'associacao_nome',
  'propriedade_id',
  'propriedade_nome',
  'numero_criador',
  'estado',
  'segmentos',
  'total_propriedades',
  'animais_ativos',
  'plano_nome',
  'status_efetivo',
  'acesso_ativo',
  'origem_acesso',
  'valor_real_mensal',
  'data_vencimento',
  'ultimo_lancamento_em',
  'ultimo_modulo',
  'lancamentos_30d',
  'dias_sem_lancar',
  'health_score',
].join(',');

// A view projeta a propriedade como `id`, não `propriedade_id` (adm_01:70) —
// mapearPropriedade() aceita os dois, mas o SELECT precisa pedir o nome real.
const COLUNAS_ESCOPO =
  'usuario_id,id,nome,numero_criador,estado,cidade,segmentos,vinculo,dono_nome,animais_ativos,prioridade_vinculo';

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing: erro, paginação, coerção
// ─────────────────────────────────────────────────────────────────────────────

/** Forma estrutural do erro do PostgREST — evita depender do tipo exportado. */
type ErroPostgrest = { message: string; code?: string; details?: string | null; hint?: string | null };

type Resposta = { data: unknown[] | null; error: ErroPostgrest | null; count?: number | null };

/**
 * Superfície mínima do query builder do supabase-js que este módulo usa. Existe
 * para os helpers poderem receber uma consulta pela metade (montar filtro uma
 * vez e reusar na contagem) sem espalhar `any` pelo arquivo.
 */
type Consulta = {
  eq(coluna: string, valor: unknown): Consulta;
  neq(coluna: string, valor: unknown): Consulta;
  gt(coluna: string, valor: unknown): Consulta;
  gte(coluna: string, valor: unknown): Consulta;
  lt(coluna: string, valor: unknown): Consulta;
  lte(coluna: string, valor: unknown): Consulta;
  in(coluna: string, valores: readonly unknown[]): Consulta;
  contains(coluna: string, valor: readonly unknown[]): Consulta;
  is(coluna: string, valor: null | boolean): Consulta;
  not(coluna: string, operador: string, valor: unknown): Consulta;
  ilike(coluna: string, padrao: string): Consulta;
  overlaps(coluna: string, valores: readonly string[]): Consulta;
  or(filtro: string): Consulta;
  order(coluna: string, opcoes?: { ascending?: boolean; nullsFirst?: boolean }): Consulta;
  limit(quantidade: number): Consulta;
  range(de: number, ate: number): Consulta;
} & PromiseLike<Resposta>;

/**
 * Códigos que significam "o banco não está preparado", não "o painel quebrou":
 * PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 * 42501 sem privilégio · 3F000 schema inexistente. Todos viram 'sem-config'
 * com a instrução do que rodar, porque a ação do Felipe é a mesma nos cinco.
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(label: string, e: ErroPostgrest, schema: 'adm' | 'public' = 'adm'): Resultado<T> {
  console.error('[adm] falha de leitura', `${schema}.${label}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    // A instrução muda com o schema, e dar a errada custa meia hora: a view de
    // `adm` falta rodar; a tabela de `public` existe e o que falta é privilégio
    // (ou o nome no catálogo está errado).
    return semConfig(
      schema === 'adm'
        ? `A view "adm.${label}" não está acessível (${e.code}). Rode ${SQL_VIEWS} no Supabase e ` +
            'confirme que o schema "adm" está em Settings → API → Exposed schemas.'
        : `A tabela "public.${label}" não está acessível (${e.code}). Confira o nome no catálogo ` +
            '(src/lib/adm/tabelas-dados.ts) e o privilégio de SELECT da service_role.',
    );
  }
  return erro(`[adm] ${label}: ${e.message}`);
}

/** 1000 = o db-max-rows do PostgREST; pedir mais numa página não traz mais nada. */
const PAGE = 1000;
/** 15.000 linhas. Acima disso é bug de filtro, não crescimento — e a tela precisa
 *  DIZER isso: uma lista truncada em silêncio é pior que uma lista que falha. */
const HARD_CAP = 15;

async function paginar<T>(
  fabrica: (de: number, ate: number) => Consulta,
  label: string,
): Promise<Resultado<T[]>> {
  const saida: T[] = [];
  for (let pagina = 0; pagina < HARD_CAP; pagina++) {
    const de = pagina * PAGE;
    const { data, error } = await fabrica(de, de + PAGE - 1);
    if (error) return falha<T[]>(label, error);
    if (!data || data.length === 0) break;
    saida.push(...(data as T[]));
    if (data.length < PAGE) break;
    if (pagina === HARD_CAP - 1) {
      return erro(
        `[adm] ${label}: passou de ${HARD_CAP * PAGE} linhas e o resultado seria truncado. ` +
          'Refine o filtro ou use a exportação em streaming.',
      );
    }
  }
  return ok(saida);
}

async function umaLinha<T>(consulta: Consulta, label: string): Promise<Resultado<T | null>> {
  const { data, error } = await consulta.limit(1);
  if (error) return falha<T | null>(label, error);
  const linha = (data as T[] | null)?.[0];
  return ok(linha ?? null);
}

type Linha = Record<string, unknown>;

function comoLinhas(valores: unknown[]): Linha[] {
  return valores.filter((v): v is Linha => typeof v === 'object' && v !== null);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // numeric do Postgres pode chegar como string quando a precisão não cabe em
  // double — ignorar isso transforma MRR em null sem aviso.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function booleano(v: unknown): boolean {
  return v === true || v === 't' || v === 'true';
}

/** Valor de coluna enum: fora da lista fechada vira null, nunca uma string solta
 *  que a UI tentaria usar como chave de Record e renderizaria `undefined`. */
function umDe<T extends string>(v: unknown, validos: readonly T[]): T | null {
  const s = texto(v);
  return s != null && (validos as readonly string[]).includes(s) ? (s as T) : null;
}

function arrayDe<T extends string>(v: unknown, validos: readonly T[]): T[] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is T => typeof item === 'string' && (validos as readonly string[]).includes(item));
}

/** Espelham as uniões de types.ts. Existem porque união de tipo não sobrevive ao
 *  runtime e o dado vem do banco, que não conhece o contrato. */
const STATUS_EFETIVOS: readonly StatusEfetivo[] = ['ativa', 'trial', 'pendente', 'cancelada', 'vencida'];
const ORIGENS: readonly OrigemAcesso[] = Object.keys(ORIGEM_ACESSO_ROTULO) as OrigemAcesso[];
const SEGMENTOS: readonly Segmento[] = Object.keys(SEGMENTO_ROTULO) as Segmento[];
const VINCULOS: readonly PropriedadeEscopo['vinculo'][] = ['dono', 'herdado', 'consultoria', 'associacao'];

function mapearUsuario(l: Linha): UsuarioLista {
  return {
    id: inteiro(l.id),
    nome: texto(l.nome) ?? 'Sem nome',
    email_mascarado: texto(l.email_mascarado),
    whatsapp_mascarado: texto(l.whatsapp_mascarado),
    whatsapp_pais: texto(l.whatsapp_pais),
    papel: umDe<Papel>(l.papel, PAPEIS),
    ativo: booleano(l.ativo),
    is_tester: booleano(l.is_tester),
    is_demo: booleano(l.is_demo),
    tem_cpf: booleano(l.tem_cpf),
    sem_auth: booleano(l.sem_auth),
    onboarding_finalizado: booleano(l.onboarding_finalizado),
    data_cadastro: texto(l.data_cadastro),
    associacao_id: numero(l.associacao_id),
    associacao_nome: texto(l.associacao_nome),
    propriedade_id: numero(l.propriedade_id),
    propriedade_nome: texto(l.propriedade_nome),
    numero_criador: texto(l.numero_criador),
    estado: texto(l.estado),
    segmentos: arrayDe<Segmento>(l.segmentos, SEGMENTOS),
    total_propriedades: inteiro(l.total_propriedades),
    animais_ativos: inteiro(l.animais_ativos),
    plano_nome: texto(l.plano_nome),
    status_efetivo: umDe<StatusEfetivo>(l.status_efetivo, STATUS_EFETIVOS),
    acesso_ativo: booleano(l.acesso_ativo),
    origem_acesso: umDe<OrigemAcesso>(l.origem_acesso, ORIGENS),
    valor_real_mensal: numero(l.valor_real_mensal),
    data_vencimento: texto(l.data_vencimento),
    ultimo_lancamento_em: texto(l.ultimo_lancamento_em),
    ultimo_modulo: texto(l.ultimo_modulo),
    lancamentos_30d: inteiro(l.lancamentos_30d),
    dias_sem_lancar: numero(l.dias_sem_lancar),
    health_score: numero(l.health_score),
  };
}

function mapearPropriedade(l: Linha): PropriedadeEscopo {
  return {
    id: inteiro(l.propriedade_id ?? l.id),
    nome: texto(l.nome) ?? 'Sem nome',
    numero_criador: texto(l.numero_criador),
    estado: texto(l.estado),
    cidade: texto(l.cidade),
    segmentos: arrayDe<Segmento>(l.segmentos, SEGMENTOS),
    vinculo: umDe(l.vinculo, VINCULOS) ?? 'dono',
    dono_nome: texto(l.dono_nome),
    animais_ativos: inteiro(l.animais_ativos),
  };
}

function mapearFatias(linhas: Linha[]): FatiaDistribuicao[] {
  return linhas.map((l) => ({ rotulo: texto(l.rotulo) ?? 'Não informado', valor: numero(l.valor) ?? 0 }));
}

function mapearSerie(linhas: Linha[]): PontoSerie[] {
  return linhas
    .map((l) => ({ periodo: texto(l.periodo) ?? '', valor: numero(l.valor) ?? 0 }))
    .filter((p) => p.periodo !== '');
}

/**
 * Escapa um valor para dentro de um filtro `or=(...)` do PostgREST. Vírgula,
 * ponto e parêntese são a GRAMÁTICA do filtro: um nome de fazenda com vírgula
 * quebraria a expressão inteira e o servidor devolveria outro conjunto de linhas
 * — sem erro.
 */
function valorOr(v: string | number | boolean | null): string {
  if (v === null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Metacaracteres da gramática de select/filtro do PostgREST. Nome de coluna
 * nunca tem um; se aparecer, é tentativa de injeção — e some.
 */
const METACARACTERES = /[",().:\s*]/g;

/** Nome de coluna dentro de select/order/filtro. Nomes com acento ou maiúscula
 *  existem de verdade no schema (`categoria_animal."Label"`, `visitas_tecnicas."endereço"`)
 *  e precisam de aspas — o identificador simples passa direto. */
function campo(nome: string): string {
  if (/^[a-z_][a-z0-9_]*$/.test(nome)) return nome;
  return `"${nome.replace(METACARACTERES, '')}"`;
}

// ─────────────────────────────────────────────────────────────────────────────
// listarUsuarios — a lista mestra
// ─────────────────────────────────────────────────────────────────────────────

export type FiltroAtividade = '7d' | '30d' | '90d' | 'silencioso' | 'nunca';

export type BandeiraUsuario =
  | 'tester'
  | 'demo'
  | 'sem_auth'
  | 'inativo'
  | 'onboarding_pendente'
  | 'cortesia'
  | 'extensao'
  | 'sem_acesso';

/**
 * Ordem default é 'risco' e não alfabética: quando o Felipe abre a tela, a
 * primeira linha tem que ser um problema.
 */
export type OrdemUsuarios = 'risco' | 'nome' | 'recente' | 'atividade' | 'animais' | 'valor';

export interface FiltrosUsuarios {
  /** Campo único: id exato, nome, e-mail, propriedade, nº de criador, telefone. */
  busca?: string;
  papeis?: Papel[];
  status?: StatusEfetivo[];
  origens?: OrigemAcesso[];
  segmentos?: Segmento[];
  estados?: string[];
  planos?: string[];
  associacaoId?: number;
  atividade?: FiltroAtividade;
  bandeiras?: BandeiraUsuario[];
  /**
   * is_tester e is_demo ficam FORA por default — a conta demo (11973) é a do
   * reviewer da Apple e as de teste são internas. Contá-las na carteira infla
   * base e engajamento com gente que não é cliente.
   */
  incluirTestes?: boolean;
  ordem?: OrdemUsuarios;
  limite?: number;
}

function aplicarOrdem(q: Consulta, ordem: OrdemUsuarios): Consulta {
  switch (ordem) {
    case 'nome':
      return q.order('nome', { ascending: true });
    case 'recente':
      return q.order('data_cadastro', { ascending: false, nullsFirst: false });
    case 'atividade':
      return q.order('ultimo_lancamento_em', { ascending: false, nullsFirst: false });
    case 'animais':
      return q.order('animais_ativos', { ascending: false, nullsFirst: false });
    case 'valor':
      return q.order('valor_real_mensal', { ascending: false, nullsFirst: false });
    case 'risco':
    default:
      // health_score crescente = pior primeiro. Score NULL é conta nova demais
      // para pontuar (guard-rail de metricas.ts) e vai para o fim: conta nova
      // não é conta em risco, e misturar as duas gera alarme falso todo dia.
      return q.order('health_score', { ascending: true, nullsFirst: false }).order('id', { ascending: true });
  }
}

function aplicarFiltrosUsuario(inicial: Consulta, f: FiltrosUsuarios): Consulta {
  let q = inicial;

  // `not.is.true` e não `is.false`: no banco is_demo/ativo/onboarding_finalizado
  // são booleanos NULLABLE. `is.false` deixaria de fora toda linha com NULL — e
  // sumir com metade da base num filtro de exclusão é o tipo de erro que ninguém
  // percebe, porque a lista continua parecendo uma lista.
  if (!f.incluirTestes) q = q.not('is_tester', 'is', true).not('is_demo', 'is', true);
  if (f.papeis?.length) q = q.in('papel', f.papeis);
  if (f.status?.length) q = q.in('status_efetivo', f.status);
  if (f.origens?.length) q = q.in('origem_acesso', f.origens);
  if (f.estados?.length) q = q.in('estado', f.estados);
  if (f.planos?.length) q = q.in('plano_nome', f.planos);
  if (f.associacaoId != null) q = q.eq('associacao_id', f.associacaoId);
  // segmentos é text[]: interseção (`ov`), não igualdade — uma propriedade pode
  // ser caprino_leiteiro E ovino_corte ao mesmo tempo.
  if (f.segmentos?.length) q = q.overlaps('segmentos', f.segmentos);

  switch (f.atividade) {
    case '7d':
      q = q.lte('dias_sem_lancar', 7);
      break;
    case '30d':
      q = q.lte('dias_sem_lancar', 30);
      break;
    case '90d':
      q = q.lte('dias_sem_lancar', 90);
      break;
    case 'silencioso':
      // Silencioso = sumiu MAS ainda paga. Sem o acesso_ativo, a lista se enche
      // de conta cancelada há um ano, que não é ação nenhuma.
      q = q.gte('dias_sem_lancar', 30).is('acesso_ativo', true);
      break;
    case 'nunca':
      q = q.is('ultimo_lancamento_em', null);
      break;
    default:
      break;
  }

  for (const bandeira of f.bandeiras ?? []) {
    switch (bandeira) {
      case 'tester':
        q = q.is('is_tester', true);
        break;
      case 'demo':
        q = q.is('is_demo', true);
        break;
      case 'sem_auth':
        q = q.is('sem_auth', true);
        break;
      case 'inativo':
        q = q.not('ativo', 'is', true);
        break;
      case 'onboarding_pendente':
        q = q.not('onboarding_finalizado', 'is', true);
        break;
      case 'cortesia':
        q = q.eq('origem_acesso', 'cortesia');
        break;
      case 'extensao':
        q = q.eq('origem_acesso', 'extensao');
        break;
      case 'sem_acesso':
        q = q.not('acesso_ativo', 'is', true);
        break;
    }
  }

  const termo = f.busca?.trim();
  if (termo) {
    const alternativas: string[] = [];
    // "11954" tem que achar o usuário 11954 na hora (D1: o id É a identidade do
    // painel), sem deixar de casar como texto em quem tem 11954 no número de criador.
    if (/^\d+$/.test(termo)) alternativas.push(`id.eq.${Number(termo)}`);
    alternativas.push(`busca.ilike.${valorOr(`%${termo}%`)}`);
    const digitos = termo.replace(/\D/g, '');
    if (digitos.length >= 4 && digitos !== termo) alternativas.push(`busca.ilike.${valorOr(`%${digitos}%`)}`);
    q = q.or(alternativas.join(','));
  }

  return q;
}

/**
 * A lista mestra. Hoje são ~40 linhas, mas passa pelo `paginar()` mesmo assim:
 * a tela que não pagina é sempre a que ninguém lembra de consertar quando a base
 * cresce, e o truncamento do PostgREST não avisa.
 */
export async function listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<Resultado<UsuarioLista[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const limite = filtros.limite;
  const resultado = await paginar<Linha>((de, ate) => {
    let q = aplicarFiltrosUsuario(
      supa.from(VIEW.usuarios).select(COLUNAS_USUARIO) as unknown as Consulta,
      filtros,
    );
    q = aplicarOrdem(q, filtros.ordem ?? 'risco');
    // Com limite explícito (as listas curtas da carteira), o range respeita o
    // teto pedido em vez de varrer a view inteira e cortar depois.
    return limite != null ? q.range(de, Math.min(ate, de + limite - 1)) : q.range(de, ate);
  }, VIEW.usuarios);

  if (!resultado.ok) return resultado;
  const linhas = comoLinhas(resultado.dados).map(mapearUsuario);
  return ok(limite != null ? linhas.slice(0, limite) : linhas);
}

// ─────────────────────────────────────────────────────────────────────────────
// getCarteira — a home do painel
// ─────────────────────────────────────────────────────────────────────────────

/** 12 meses no gráfico da home. 24 é o histórico completo, e mora na tela
 *  /adm/carteira/receita — na home, dois anos de barras ninguém lê. */
const MESES_CARTEIRA = 12;
/** Listas de ação: 8 linhas. Mais que isso vira relatório e ninguém age. */
const LINHAS_DE_RISCO = 8;

function kpisVazios(): KpisCarteira {
  return {
    acesso: { pagante: 0, trial: 0, cortesia: 0, extensao: 0 },
    contasComAcesso: 0,
    contasTotal: 0,
    mrrReal: 0,
    mrrTabela: 0,
    arpu: 0,
    receitaEmRisco: 0,
    vencendo7d: 0,
    inadimplentes: 0,
    propriedades: 0,
    animaisAtivos: 0,
    mau: 0,
    wau: 0,
    dau: 0,
    silenciosos: 0,
    nuncaLancaram: 0,
  };
}

function mapearKpis(l: Linha | null): KpisCarteira {
  if (!l) return kpisVazios();
  return {
    acesso: {
      pagante: inteiro(l.acesso_pagante),
      trial: inteiro(l.acesso_trial),
      cortesia: inteiro(l.acesso_cortesia),
      extensao: inteiro(l.acesso_extensao),
    },
    contasComAcesso: inteiro(l.contas_com_acesso),
    contasTotal: inteiro(l.contas_total),
    mrrReal: numero(l.mrr_real) ?? 0,
    mrrTabela: numero(l.mrr_tabela) ?? 0,
    arpu: numero(l.arpu) ?? 0,
    receitaEmRisco: numero(l.receita_em_risco) ?? 0,
    vencendo7d: inteiro(l.vencendo_7d),
    inadimplentes: inteiro(l.inadimplentes),
    propriedades: inteiro(l.propriedades),
    animaisAtivos: inteiro(l.animais_ativos),
    mau: inteiro(l.mau),
    wau: inteiro(l.wau),
    dau: inteiro(l.dau),
    silenciosos: inteiro(l.silenciosos),
    nuncaLancaram: inteiro(l.nunca_lancaram),
  };
}

/**
 * A visão agregada. Seis leituras em paralelo, todas já agregadas em SQL.
 *
 * `agora` é parâmetro para a série ser reproduzível em teste; em produção o
 * default basta, porque quem renderiza é o servidor e o cliente só recebe o
 * array pronto.
 */
export async function getCarteira(agora: Date = new Date()): Promise<Resultado<Carteira>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const meses = mesesAte(MESES_CARTEIRA, agora);
  const primeiroMes = meses[0] ?? '';

  const [kpisRes, serieRes, distRes, silencioRes, cobrancaRes, trialRes] = await Promise.all([
    umaLinha<Linha>(supa.from(VIEW.carteiraKpis).select('*') as unknown as Consulta, VIEW.carteiraKpis),
    paginar<Linha>(
      (de, ate) =>
        (supa.from(VIEW.carteiraSerie).select('serie,periodo,valor') as unknown as Consulta)
          .gte('periodo', primeiroMes)
          .order('periodo', { ascending: true })
          .range(de, ate),
      VIEW.carteiraSerie,
    ),
    paginar<Linha>(
      (de, ate) =>
        (supa.from(VIEW.carteiraDistribuicao).select('dimensao,rotulo,valor') as unknown as Consulta)
          .order('valor', { ascending: false })
          .range(de, ate),
      VIEW.carteiraDistribuicao,
    ),
    // As três listas de ação saem da MESMA view da lista mestra — o que aparece
    // aqui é exatamente o que o filtro correspondente mostra em /adm/usuarios.
    listarUsuarios({ atividade: 'silencioso', ordem: 'atividade', limite: LINHAS_DE_RISCO }),
    listarUsuarios({ status: ['vencida', 'pendente'], ordem: 'valor', limite: LINHAS_DE_RISCO }),
    listarUsuarios({ status: ['trial'], ordem: 'risco', limite: LINHAS_DE_RISCO }),
  ]);

  if (!kpisRes.ok) return kpisRes;
  if (!serieRes.ok) return serieRes;
  if (!distRes.ok) return distRes;
  if (!silencioRes.ok) return silencioRes;
  if (!cobrancaRes.ok) return cobrancaRes;
  if (!trialRes.ok) return trialRes;

  const serie = comoLinhas(serieRes.dados);
  const porSerie = (nome: string) => mapearSerie(serie.filter((l) => texto(l.serie) === nome));

  const dist = comoLinhas(distRes.dados);
  const porDimensao = (nome: string) => mapearFatias(dist.filter((l) => texto(l.dimensao) === nome));

  return ok({
    kpis: mapearKpis(kpisRes.dados),
    // Séries de CONTAGEM: mês sem linha é mês de R$ 0 / 0 clientes. Preencher é
    // obrigatório — um gráfico que pula de março para maio sugere continuidade
    // onde houve queda.
    receitaMensal: preencherSerie(porSerie('receita'), meses),
    novosClientesMensal: preencherSerie(porSerie('novos_clientes'), meses),
    porSegmento: porDimensao('segmento'),
    porEstado: porDimensao('estado'),
    porPlano: porDimensao('plano'),
    riscoSilencio: silencioRes.dados,
    riscoCobranca: cobrancaRes.dados,
    riscoTrial: trialRes.dados,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// getEscopo — de "um usuário" para "quais propriedades"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Duas leituras: o usuário e as propriedades que ele alcança. A regra por papel
 * está resolvida em `adm.escopo_propriedades` (as 5 pernas em SQL, com
 * service_role) e a decisão de qual mostrar está em escopo.ts — nenhuma das
 * duas mora aqui, e é de propósito: esta função só costura.
 */
export async function getEscopo(
  usuarioId: number,
  propriedadeSelecionada?: SelecaoPropriedade,
): Promise<Resultado<Escopo>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const [usuarioRes, propsRes] = await Promise.all([
    umaLinha<Linha>(
      (supa.from(VIEW.usuarios).select(COLUNAS_USUARIO) as unknown as Consulta).eq('id', usuarioId),
      VIEW.usuarios,
    ),
    paginar<Linha>(
      (de, ate) =>
        (supa.from(VIEW.escopo).select(COLUNAS_ESCOPO) as unknown as Consulta)
          .eq('usuario_id', usuarioId)
          .order('animais_ativos', { ascending: false, nullsFirst: false })
          .range(de, ate),
      VIEW.escopo,
    ),
  ]);

  if (!usuarioRes.ok) return usuarioRes;
  if (!propsRes.ok) return propsRes;
  if (!usuarioRes.dados) return erro(`[adm] usuário ${usuarioId} não existe.`);

  const propriedades = comoLinhas(propsRes.dados).map(mapearPropriedade);
  return ok(resolverEscopo(mapearUsuario(usuarioRes.dados), propriedades, propriedadeSelecionada));
}

// ─────────────────────────────────────────────────────────────────────────────
// getVisaoGeral — a aba 1 do dashboard do cliente
// ─────────────────────────────────────────────────────────────────────────────


function visaoVazia(): VisaoGeralPropriedade {
  return {
    animaisAtivos: 0,
    animaisInativos: 0,
    femeas: 0,
    machos: 0,
    lactantes: 0,
    gestantes: 0,
    mediaDel: null,
    producao30d: null,
    mediaProducaoDia: null,
    mediaPorLactanteDia: null,
    lancamentos30d: 0,
    diasSemLancar: null,
    colaboradores: 0,
    tecnicosVinculados: 0,
    porCategoria: [],
    porRaca: [],
    piramideEtaria: [],
    producaoDiaria90d: [],
  };
}

export async function getVisaoGeral(
  propriedadeId: number,
): Promise<Resultado<VisaoGeralPropriedade>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  // UMA leitura, não três: as distribuições e a série de 90 dias chegam como
  // colunas jsonb da própria linha (adm_01:648-651). O recorte da janela é
  // feito no SQL, em dia civil de São Paulo — calcular a borda aqui, em UTC,
  // deslocaria em 3 horas e, entre 21h e meia-noite, incluiria ou perderia um
  // dia inteiro bem no horário da 2ª ordenha.
  const cardsRes = await umaLinha<Linha>(
    (supa.from(VIEW.visaoGeral).select('*') as unknown as Consulta).eq('propriedade_id', propriedadeId),
    VIEW.visaoGeral,
  );
  if (!cardsRes.ok) return cardsRes;

  // Propriedade recém-criada não tem linha na view. Isso é "vazio", não
  // "quebrado": devolver zeros deixa a tela abrir e mostrar um cliente que
  // ainda não lançou nada — informação comercial, não erro.
  const l = cardsRes.dados;
  const base = l ? mapearVisao(l) : visaoVazia();

  /** Coluna jsonb que veio como array de objetos; qualquer outra coisa é vazio. */
  const arranjo = (valor: unknown): Linha[] => (Array.isArray(valor) ? comoLinhas(valor) : []);

  return ok({
    ...base,
    porCategoria: mapearFatias(arranjo(l?.por_categoria)),
    porRaca: mapearFatias(arranjo(l?.por_raca)),
    piramideEtaria: mapearFatias(arranjo(l?.piramide_etaria)),
    // ⚠️ Série ESPARSA de propósito: dia sem lançamento não é dia de 0 litro, é
    // dia não medido. Preencher com zero desenharia uma queda a pique que não
    // existiu. O gráfico usa connectNulls={false} — a lacuna é a informação.
    producaoDiaria90d: mapearSerie(arranjo(l?.producao_diaria_90d)),
  });
}

function mapearVisao(l: Linha): VisaoGeralPropriedade {
  return {
    animaisAtivos: inteiro(l.animais_ativos),
    animaisInativos: inteiro(l.animais_inativos),
    femeas: inteiro(l.femeas),
    machos: inteiro(l.machos),
    lactantes: inteiro(l.lactantes),
    gestantes: inteiro(l.gestantes),
    mediaDel: numero(l.media_del),
    producao30d: numero(l.producao_30d),
    mediaProducaoDia: numero(l.media_producao_dia),
    mediaPorLactanteDia: numero(l.media_por_lactante_dia),
    lancamentos30d: inteiro(l.lancamentos_30d),
    diasSemLancar: numero(l.dias_sem_lancar),
    colaboradores: inteiro(l.colaboradores),
    tecnicosVinculados: inteiro(l.tecnicos_vinculados),
    porCategoria: [],
    porRaca: [],
    piramideEtaria: [],
    producaoDiaria90d: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// getAssinatura — a aba 10
// ─────────────────────────────────────────────────────────────────────────────

function assinaturaVazia(): AssinaturaResumo {
  return {
    planoNome: null,
    planoPendenteNome: null,
    statusEfetivo: null,
    acessoAtivo: false,
    origemAcesso: null,
    valorRealMensal: null,
    valorTabelaMensal: null,
    ciclo: null,
    dataInicio: null,
    dataVencimento: null,
    extensaoManualAte: null,
    diasRestantes: null,
    totalPago: 0,
    emAberto: 0,
    descontoAssociacao: false,
  };
}

/**
 * Assinatura + histórico de cobrança de um usuário.
 *
 * Duas regras que a view já aplica e que esta camada nunca deve desfazer:
 *  · `status_efetivo`, JAMAIS `assinaturas.status` cru — o cru não é rebaixado
 *    para 'vencida' automaticamente e não enxerga extensão manual;
 *  · `plano_id_pendente` chega em `planoPendenteNome` e nunca como plano atual:
 *    é upgrade CONTRATADO E NÃO PAGO, e exibi-lo como vigente repete um
 *    vazamento já identificado em auditoria.
 *
 * Ausência de linha é caso legítimo (colaborador nunca tem assinatura própria —
 * ele herda a do produtor dono): devolve resumo zerado, não erro.
 */
export async function getAssinatura(
  usuarioId: number,
): Promise<Resultado<{ resumo: AssinaturaResumo; pagamentos: PagamentoLinha[] }>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const [resumoRes, pagamentosRes] = await Promise.all([
    umaLinha<Linha>(
      (supa.from(VIEW.assinatura).select('*') as unknown as Consulta).eq('usuario_id', usuarioId),
      VIEW.assinatura,
    ),
    paginar<Linha>(
      (de, ate) =>
        (
          supa
            .from(VIEW.pagamentos)
            .select(
              'id,asaas_payment_id,valor,status,metodo_pagamento,data_vencimento,data_pagamento,tipo_cobranca',
            ) as unknown as Consulta
        )
          .eq('usuario_id', usuarioId)
          .order('data_vencimento', { ascending: false, nullsFirst: false })
          .range(de, ate),
      VIEW.pagamentos,
    ),
  ]);

  if (!resumoRes.ok) return resumoRes;
  if (!pagamentosRes.ok) return pagamentosRes;

  const l = resumoRes.dados;
  const resumo: AssinaturaResumo = l
    ? {
        planoNome: texto(l.plano_nome),
        planoPendenteNome: texto(l.plano_pendente_nome),
        statusEfetivo: umDe<StatusEfetivo>(l.status_efetivo, STATUS_EFETIVOS),
        acessoAtivo: booleano(l.acesso_ativo),
        origemAcesso: umDe<OrigemAcesso>(l.origem_acesso, ORIGENS),
        valorRealMensal: numero(l.valor_real_mensal),
        valorTabelaMensal: numero(l.valor_tabela_mensal),
        ciclo: texto(l.ciclo),
        dataInicio: texto(l.data_inicio),
        dataVencimento: texto(l.data_vencimento),
        extensaoManualAte: texto(l.extensao_manual_ate),
        diasRestantes: numero(l.dias_restantes),
        totalPago: numero(l.total_pago) ?? 0,
        emAberto: numero(l.em_aberto) ?? 0,
        descontoAssociacao: booleano(l.desconto_associacao),
      }
    : assinaturaVazia();

  const pagamentos: PagamentoLinha[] = comoLinhas(pagamentosRes.dados).map((p) => ({
    id: inteiro(p.id),
    asaas_payment_id: texto(p.asaas_payment_id),
    valor: numero(p.valor),
    status: texto(p.status),
    metodo_pagamento: texto(p.metodo_pagamento),
    data_vencimento: texto(p.data_vencimento),
    data_pagamento: texto(p.data_pagamento),
    tipo_cobranca: texto(p.tipo_cobranca),
  }));

  return ok({ resumo, pagamentos });
}

// ─────────────────────────────────────────────────────────────────────────────
// listarTabela — o motor do escape hatch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O escape hatch lê as TABELAS CRUAS pelo `publicClient()`, não pelas views de
 * `adm`. É a única leitura do /adm fora do schema `adm`, e a troca é consciente:
 * são 93 tabelas, e uma view espelho para cada uma seria um segundo schema para
 * manter em sincronia — que é exatamente como uma coluna nova nasce invisível.
 *
 * O que substitui o teto do schema aqui são duas travas de tabelas.ts, nesta
 * ordem: (1) ALLOWLIST — só entra no `select` coluna declarada no catálogo;
 * (2) DENYLIST — `COLUNAS_SEMPRE_BLOQUEADAS` derruba `cpf`, `colaborador_senha`
 * e `colaborador_senha_hash` em toda tabela, exista a coluna ou não. Nada vindo
 * da URL vira nome de coluna sem passar por `validarColunas()`.
 */

/** Sufixo da coluna sintética com o rótulo de uma FK resolvida.
 *  `categoria` (uuid) vem acompanhada de `categoria__rotulo` ('lactante'). */
export const SUFIXO_ROTULO = '__rotulo';

/** Alias do embed usado para escopar por tabela vizinha. Some das linhas antes
 *  de sair daqui — é andaime de query, não dado da tabela. */
const EMBED = '__tenant';

/** Distintos por lote na resolução de FK. Acima disso a coluna não é referência,
 *  é dado — e um `in` com 500 uuids estoura o comprimento da URL. */
const MAX_REFERENCIAS = 200;

/**
 * Tabelas em que `count: 'exact'` é caro demais: COUNT(*) real varre tudo, e um
 * ano de controle leiteiro de um criador grande passa de 70.000 linhas. Nelas a
 * contagem vem do planner (aproximada, e a UI precisa rotulá-la como "~").
 */
const TABELAS_VOLUMOSAS = new Set([
  'controle_leiteiro',
  'manejo',
  'rebanho_log',
  'manejo_log',
  'pagamentos_log',
  'notificacoes',
  'medidas',
  'lactacao',
  'movimentacoes',
]);

export function contagemAproximada(registro: TabelaCatalogo): boolean {
  return TABELAS_VOLUMOSAS.has(registro.nome);
}

/**
 * Tenant INDIRETO: a tabela não carrega a coluna de tenant, chega nela por uma
 * FK. Resolvido com join embutido do PostgREST (`vizinha!inner(coluna)`), que é
 * uma consulta só.
 *
 * A alternativa — buscar antes os ids e mandar num `IN` — é inviável de fato: o
 * maior rebanho tem 4.820 animais e a URL passaria de 25 KB.
 *
 * O que NÃO está aqui é tão importante quanto o que está: `analise_leite` liga
 * pelo texto livre `id_animal`, que não é FK e pode ser um nome cadastrado à
 * mão. Sem entrada aqui, listarTabela recusa a tabela com a nota do catálogo em
 * vez de devolver linhas de outro criador.
 */
const TENANT_INDIRETO: Record<string, { vizinha: string; coluna: string }> = {
  animal_id: { vizinha: 'rebanho', coluna: 'propriedade_id' },
  assinatura_id: { vizinha: 'assinaturas', coluna: 'usuario_id' },
};

export type FiltroTabela =
  | { coluna: string; op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'; valor: string | number | boolean }
  | { coluna: string; op: 'in'; valores: (string | number)[] }
  | { coluna: string; op: 'ilike'; valor: string }
  | { coluna: string; op: 'contem'; valor: string }
  | { coluna: string; op: 'nulo' | 'nao_nulo' };

export interface OpcoesTabela {
  /** Subconjunto de colunas a projetar. Vazio => o preset padrão do catálogo. */
  colunas?: string[];
  ordem?: { coluna: string; ascendente: boolean };
  /** Cursor opaco de codificarCursor(). Ausente = primeira página. */
  cursor?: string | null;
  limite?: number;
  filtros?: FiltroTabela[];
  /** Janela sobre registro.colunaData. */
  periodo?: { de?: string | null; ate?: string | null };
  /** Contagem custa uma segunda ida ao banco; a exportação não precisa dela. */
  contarTotal?: boolean;
}

/** Cursor keyset: o valor da coluna de ordenação + o desempate pela chave. */
export interface CursorTabela {
  v: string | number | boolean | null;
  id: string | number;
}

export function codificarCursor(cursor: CursorTabela): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodificarCursor(bruto: string | null | undefined): CursorTabela | null {
  if (!bruto) return null;
  try {
    const obj: unknown = JSON.parse(Buffer.from(bruto, 'base64url').toString('utf8'));
    if (typeof obj !== 'object' || obj === null) return null;
    const c = obj as Partial<CursorTabela>;
    if (typeof c.id !== 'string' && typeof c.id !== 'number') return null;
    const v = c.v;
    if (v !== null && v !== undefined && typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'boolean') {
      return null;
    }
    return { v: v ?? null, id: c.id };
  } catch {
    // Cursor é dado de URL: colado errado, truncado, de outra ordenação. Voltar
    // para a primeira página é o comportamento certo — nunca estourar a tela.
    return null;
  }
}

/**
 * A chave estável de desempate da paginação. `id` em quase todo o schema;
 * `animal_id` nas 1:1 com rebanho (rebanho_ultimo, que não tem `id`). A escolha
 * é derivada do catálogo porque `TabelaRegistro` ainda não declara a PK — se um
 * dia declarar, este helper some.
 */
export function chaveDaTabela(registro: TabelaCatalogo): string {
  const tem = (c: string) => registro.colunas.some((k) => k.chave === c);
  if (!tem('id') && tem('animal_id')) return 'animal_id';
  return 'id';
}

/**
 * O cursor para a PRÓXIMA página, a partir da última linha desta. A página que
 * volta incompleta não tem próxima — quem chama compara `linhas.length` com o
 * limite antes de usar.
 */
export function cursorDaLinha(
  registro: TabelaCatalogo,
  ordem: OpcoesTabela['ordem'],
  linha: Linha | undefined,
): string | null {
  if (!linha) return null;
  const chave = chaveDaTabela(registro);
  const id = linha[chave];
  if (typeof id !== 'string' && typeof id !== 'number') return null;
  const colunaOrdem = ordem?.coluna ?? chave;
  const bruto = linha[colunaOrdem];
  const v =
    bruto === null || bruto === undefined
      ? null
      : typeof bruto === 'string' || typeof bruto === 'number' || typeof bruto === 'boolean'
        ? bruto
        : String(bruto);
  return codificarCursor({ v, id });
}

function aplicarFiltrosTabela(inicial: Consulta, registro: TabelaCatalogo, opcoes: OpcoesTabela): Consulta {
  let q = inicial;

  // Filtro fixo do catálogo ANTES de qualquer coisa vinda da URL: é ele que faz
  // a tela "Descartes" ser descarte e não o manejo inteiro do criador (descarte
  // não é tabela — é uma linha de `manejo` com 'descarte' no array tipo_manejo).
  const fixo = registro.filtroFixo;
  if (fixo) {
    const c = campo(fixo.coluna);
    q = fixo.op === 'contem' ? q.contains(c, [fixo.valor]) : q.eq(c, fixo.valor);
  }

  for (const f of opcoes.filtros ?? []) {
    // getColuna() é a allowlist: coluna inexistente, de outra tabela ou
    // bloqueada devolve null e o filtro é descartado — nunca aplicado às cegas.
    if (!getColuna(registro, f.coluna)) continue;
    const c = campo(f.coluna);
    switch (f.op) {
      case 'eq':
        q = q.eq(c, f.valor);
        break;
      case 'neq':
        q = q.neq(c, f.valor);
        break;
      case 'gt':
        q = q.gt(c, f.valor);
        break;
      case 'gte':
        q = q.gte(c, f.valor);
        break;
      case 'lt':
        q = q.lt(c, f.valor);
        break;
      case 'lte':
        q = q.lte(c, f.valor);
        break;
      case 'in':
        if (f.valores.length > 0) q = q.in(c, f.valores);
        break;
      case 'ilike':
        q = q.ilike(c, `%${f.valor}%`);
        break;
      case 'contem':
        q = q.contains(c, [f.valor]);
        break;
      case 'nulo':
        q = q.is(c, null);
        break;
      case 'nao_nulo':
        q = q.not(c, 'is', null);
        break;
    }
  }

  const dataCol = registro.colunaData;
  if (dataCol && getColuna(registro, dataCol) && opcoes.periodo) {
    if (opcoes.periodo.de) q = q.gte(campo(dataCol), opcoes.periodo.de);
    if (opcoes.periodo.ate) q = q.lte(campo(dataCol), opcoes.periodo.ate);
  }

  return q;
}

/**
 * Predicado keyset. Nunca offset: `.range(50000, 50049)` faz o Postgres
 * descartar 50.000 linhas para devolver 50 e, pior, a página PULA linhas quando
 * algo é inserido entre duas navegações — numa tela de auditoria isso é um
 * registro que desaparece sem deixar rastro.
 *
 * Com ordenação por outra coluna, a chave entra como desempate e o predicado
 * vira composto: `col > v OR (col = v AND chave > id) OR col IS NULL`. O ramo
 * `IS NULL` está lá porque a ordenação usa nulls last nos DOIS sentidos — todo
 * nulo vem depois de qualquer valor, então continua sendo "o que falta ler".
 */
function aplicarKeyset(
  q: Consulta,
  chave: string,
  colunaOrdem: string,
  ascendente: boolean,
  cursor: CursorTabela,
): Consulta {
  const chaveCampo = campo(chave);
  if (colunaOrdem === chave) {
    return ascendente ? q.gt(chaveCampo, cursor.id) : q.lt(chaveCampo, cursor.id);
  }
  const col = campo(colunaOrdem);
  if (cursor.v === null) {
    // Já estamos dentro do bloco de nulos (o fim da lista): só resta desempatar.
    return q.is(col, null).gt(chaveCampo, cursor.id);
  }
  const comparador = ascendente ? 'gt' : 'lt';
  const v = valorOr(cursor.v);
  // `id` passa por valorOr() como o `v`: ele vem de um cursor base64url da URL,
  // e vírgula ou parêntese dentro dele reescreveriam a gramática do `or=`
  // inteira — devolvendo outro conjunto de linhas SEM erro nenhum.
  const idSeguro = valorOr(cursor.id);
  return q.or(`${col}.${comparador}.${v},and(${col}.eq.${v},${chaveCampo}.gt.${idSeguro}),${col}.is.null`);
}

/**
 * Resolve as FKs declaradas no catálogo para rótulo legível, em UMA consulta por
 * referência (nunca N+1 — o padrão da Edge `asaas-admin-actions`, que não deve
 * ser replicado).
 *
 * É isto que desarma a armadilha nº 1 do schema: `rebanho.categoria` guarda o
 * UUID da categoria, não o nome. Sem o lookup, a coluna mostra
 * '3f2a…-9b1c' e qualquer comparação com 'lactante' devolve zero linhas — sem
 * erro, só uma tela vazia que parece um criador sem rebanho.
 */
async function resolverReferencias(
  supa: NonNullable<ReturnType<typeof publicClient>>,
  registro: TabelaCatalogo,
  linhas: Linha[],
): Promise<void> {
  for (const { coluna, referencia } of referenciasDe(registro)) {
    const distintos = Array.from(
      new Set(
        linhas
          .map((l) => l[coluna.chave])
          .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number'),
      ),
    );
    if (distintos.length === 0 || distintos.length > MAX_REFERENCIAS) continue;

    const { data, error } = await (
      supa
        .from(referencia.tabela)
        .select(`${campo(referencia.chave)},${campo(referencia.rotulo)}`) as unknown as Consulta
    ).in(campo(referencia.chave), distintos);

    // Referência que não resolve degrada para o valor cru — a tabela ainda abre.
    if (error || !data) {
      console.error('[adm] referência não resolvida', registro.nome, coluna.chave, error?.message ?? '');
      continue;
    }

    const mapa = new Map<string, string>();
    for (const l of comoLinhas(data)) {
      const k = l[referencia.chave];
      if (k == null) continue;
      mapa.set(String(k), texto(l[referencia.rotulo]) ?? String(k));
    }
    for (const l of linhas) {
      const bruto = l[coluna.chave];
      if (bruto == null) continue;
      l[`${coluna.chave}${SUFIXO_ROTULO}`] = mapa.get(String(bruto)) ?? null;
    }
  }
}

/** Como esta tabela se amarra ao escopo, resolvido uma vez e usado nas duas
 *  consultas (linhas e contagem). */
type Amarra =
  | { modo: 'nenhuma' }
  | { modo: 'direta'; coluna: string; valores: (number | string)[] }
  | { modo: 'embed'; vizinha: string; coluna: string; valores: (number | string)[] }
  | { modo: 'impossivel'; motivo: string };

function amarrarTenant(registro: TabelaCatalogo, escopo: Escopo, ids: number[]): Amarra {
  if (registro.colunaTenant === 'nenhuma') return { modo: 'nenhuma' };

  const fisica = colunaFiltroTenant(registro);
  if (!fisica) return { modo: 'nenhuma' };

  const valores: (number | string)[] =
    registro.colunaTenant === 'usuario_id' ? [escopo.usuario.id] : ids;

  // Coluna física que JÁ é o tenant (inclui `id` em usuarios/propriedades, onde
  // o tenant é a própria PK).
  const direta = fisica === 'propriedade_id' || fisica === 'usuario_id' || fisica === 'id';
  if (direta) return { modo: 'direta', coluna: fisica, valores };

  const indireto = TENANT_INDIRETO[fisica];
  if (indireto) return { modo: 'embed', vizinha: indireto.vizinha, coluna: indireto.coluna, valores };

  // Nenhum caminho seguro: recusar é a única opção honesta. Devolver a tabela
  // sem filtro mostraria os dados de todos os criadores dentro da ficha de um.
  return {
    modo: 'impossivel',
    motivo:
      registro.notaEscopo ??
      `A tabela "${registro.nome}" não tem caminho de escopo declarado (coluna de tenant: ${fisica}).`,
  };
}

/**
 * O motor do escape hatch: qualquer tabela do catálogo, escopada no tenant,
 * filtrada, ordenada e paginada por keyset.
 *
 * ⚠️ A trava mais importante do arquivo está logo no começo: escopo VAZIO
 * devolve lista vazia e NÃO consulta. Um `.in('propriedade_id', [])` que
 * escorregasse para "consulta sem WHERE" devolveria a base inteira — todos os
 * clientes — dentro da tela de um colaborador. Vazio é vazio.
 */
export async function listarTabela(
  registro: TabelaCatalogo,
  escopo: Escopo,
  opcoes: OpcoesTabela = {},
): Promise<Resultado<{ linhas: Linha[]; total: number }>> {
  const supa = publicClient();
  if (!supa) return semConfigSupabase();

  const ids = idsDoEscopo(escopo);
  const amarra = amarrarTenant(registro, escopo, ids);
  if (amarra.modo === 'impossivel') return erro(`[adm] ${registro.nome}: ${amarra.motivo}`);
  if (amarra.modo !== 'nenhuma' && amarra.valores.length === 0) return ok({ linhas: [], total: 0 });

  const chave = chaveDaTabela(registro);
  const projecao = opcoes.colunas?.length
    ? validarColunas(registro, opcoes.colunas).colunas
    : colunasVisiveisPadrao(registro);

  // A chave sempre viaja, mesmo fora do preset: sem ela não há cursor para a
  // próxima página. O embed de escopo entra no select porque `!inner` só filtra
  // se a relação estiver projetada.
  const partes = Array.from(new Set([chave, ...projecao])).map(campo);
  if (amarra.modo === 'embed') partes.push(`${EMBED}:${amarra.vizinha}!inner(${campo(amarra.coluna)})`);
  const selecionadas = partes.join(',');

  const pedida = opcoes.ordem?.coluna;
  const colunaOrdem =
    pedida && getColuna(registro, pedida) ? pedida : colunaOrdenacaoPadrao(registro) ?? chave;
  // Sem ordem pedida: mais recente primeiro quando há data, chave crescente quando não há.
  const ascendente = opcoes.ordem ? opcoes.ordem.ascendente : colunaOrdem === chave;

  const limite = Math.min(Math.max(opcoes.limite ?? 50, 1), PAGE);
  const cursor = decodificarCursor(opcoes.cursor);

  const montar = (select: string, contagem?: { count: 'exact' | 'planned'; head: true }): Consulta => {
    let q = (
      contagem ? supa.from(registro.nome).select(select, contagem) : supa.from(registro.nome).select(select)
    ) as unknown as Consulta;

    if (amarra.modo === 'direta') q = q.in(campo(amarra.coluna), amarra.valores);
    if (amarra.modo === 'embed') q = q.in(`${EMBED}.${campo(amarra.coluna)}`, amarra.valores);

    return aplicarFiltrosTabela(q, registro, opcoes);
  };

  let consulta = montar(selecionadas)
    .order(campo(colunaOrdem), { ascending: ascendente, nullsFirst: false })
    .limit(limite);
  // Desempate SEMPRE ascendente pela chave — o predicado keyset composto assume
  // exatamente isso; inverter aqui e não lá faria a paginação pular linhas.
  if (colunaOrdem !== chave) consulta = consulta.order(campo(chave), { ascending: true });
  if (cursor) consulta = aplicarKeyset(consulta, chave, colunaOrdem, ascendente, cursor);

  const contagem =
    opcoes.contarTotal === false
      ? null
      : montar(amarra.modo === 'embed' ? selecionadas : campo(chave), {
          count: contagemAproximada(registro) ? 'planned' : 'exact',
          head: true,
        });

  const [linhasRes, totalRes] = await Promise.all([consulta, contagem]);

  if (linhasRes.error) return falha(registro.nome, linhasRes.error, 'public');
  const linhas = comoLinhas(linhasRes.data ?? []);
  // O embed é andaime da query, não coluna da tabela: sai antes de virar célula.
  if (amarra.modo === 'embed') for (const l of linhas) delete l[EMBED];

  await resolverReferencias(supa, registro, linhas);

  // Contagem que falha não derruba a grade: o total vira o que já se sabe.
  const total = totalRes && !totalRes.error ? totalRes.count ?? linhas.length : linhas.length;
  return ok({ linhas, total });
}
