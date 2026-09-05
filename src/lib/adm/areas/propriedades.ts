import 'server-only';

import { VIEWS_FASE_3, type LinhaPropriedade, DIAS_SILENCIO } from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * O DIRETÓRIO DE PROPRIEDADES — a leitura de `adm.propriedades_lista` e as
 * regras puras da tela `/adm/propriedades`.
 *
 * POR QUE ESTA ÁREA EXISTE, nas palavras do Felipe (05/09/2026): "não quero
 * acompanhar nada de colaborador, somente da propriedade que eu quero ver, nela
 * posso até ter a relação dos colaboradores".
 *
 * Isso troca a entidade principal do painel. O tenant real do banco é
 * `propriedade_id` — 93 tabelas o carregam —, e é a FAZENDA que ele gere; o
 * usuário é só quem loga nela. A lista de usuários responde a pergunta errada em
 * dois casos que existem hoje na base:
 *
 *   1. uma conta com DUAS fazendas aparece como uma linha só, e os números dela
 *      são a soma de dois rebanhos que não se parecem;
 *   2. uma fazenda de CONSULTORIA (`propriedades.produtor_id` NULL) não aparece
 *      em lugar nenhum da lista mestra, porque não há conta para listar — o
 *      técnico cadastrou o cliente que não usa o app.
 *
 * NENHUM NOME DE VIEW É DIGITADO AQUI. `VIEWS_FASE_3.propriedades` vem do
 * contrato (src/lib/adm/areas/contrato.ts), que é o mesmo arquivo que o SQL
 * implementa e que `adm_05_verificacao.sql` confere. Foi a divergência entre o
 * nome escrito no SQL e o escrito no TS que, na Fase 1, deixou dez telas
 * compilando, passando no lint e abrindo vazias.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O QUE ESTE MÓDULO **NÃO** FAZ: uma segunda ficha de propriedade.
 *
 * A linha da tela navega para a ficha que já existe, `/adm/u/<dono>?prop=<id>`,
 * com as 13 abas de `ABAS_CLIENTE`. Duplicá-las ancoradas em `propriedade_id`
 * custaria treze telas para ganhar nada — o seletor de propriedade da ficha já
 * faz o recorte. `fichaDaPropriedade()` abaixo é o único lugar do painel que
 * escreve essa URL.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE A ORDEM DE APRESENTAÇÃO É EM TypeScript, e não no `order()` do banco
 * (que é o que `queries.ts` faz na lista mestra).
 *
 * Três motivos, e o terceiro é o que decide:
 *
 *   1. Lá existe `limite` — as três listas de risco da carteira pedem 5 linhas
 *      cada, e aí a ordem PRECISA ser do banco, senão o LIMIT corta as linhas
 *      erradas. Aqui a lista é sempre completa: ordenar em memória sobre ela dá
 *      exatamente o mesmo resultado.
 *   2. A ordem que o banco recebe tem outra função e não pode ser negociada: ela
 *      é a ordem TOTAL por chave primária que torna a paginação por `range()`
 *      correta. Uma ordem por `health_score` (cheia de empates e de nulos) pode
 *      repetir e pular linha entre páginas.
 *   3. A ordem inicial precisa ser REPRODUZÍVEL POR UM CLIQUE no cabeçalho, e
 *      quem ordena no clique é a <AdmTable>, em JavaScript. `nome` ordenado pela
 *      colação do Postgres e reordenado por `localeCompare('pt-BR')` dá listas
 *      diferentes — o operador clica "Fazenda", clica de novo para voltar, e não
 *      volta. `ordenarPropriedades()` usa a MESMA regra do `comparar()` da
 *      tabela: nulo por último nos dois sentidos, texto por localeCompare.
 *
 * De quebra, a regra vira função pura testável — e "nulo por último" é
 * exatamente onde mora a armadilha do JavaScript: `null` vira 0 numa subtração,
 * então uma fazenda sem health score se disfarçaria da pior da carteira.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * LIMITE CONHECIDO — conta de teste e demo.
 *
 * A lista mestra corta `is_tester`/`is_demo` na query. Aqui não dá: o contrato
 * de `LinhaPropriedade` não tem bandeira, e filtrar por uma coluna que o
 * contrato não declara é exatamente o tipo de string solta que este arquivo
 * existe para não ter. Enquanto for assim, a fazenda da conta demo entra na
 * contagem — são poucas e conhecidas, e o caminho de correção é o CONTRATO
 * ganhar o campo, não este arquivo ganhar um `not()`.
 *
 * SOMENTE LEITURA (decisão D3): este módulo só faz SELECT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato — nome de view e projeção
// ─────────────────────────────────────────────────────────────────────────────

const VIEW = VIEWS_FASE_3.propriedades;

/**
 * Citado na mensagem de erro. Não é um nome de arquivo chutado: é a descrição do
 * arquivo pela sua FUNÇÃO ("o que implementa VIEWS_FASE_3"), que continua certa
 * depois de qualquer renomeação — e leva direto ao contrato, que é de onde o
 * nome da view sai.
 */
const SQL_FASE_3 =
  'o SQL das views da Fase 3 em supabase/adm/ — o que implementa VIEWS_FASE_3 de ' +
  'src/lib/adm/areas/contrato.ts';

/**
 * Projeção explícita, conferida contra o contrato em COMPILAÇÃO: esquecer uma
 * coluna, ou inventar uma que o contrato não tem, é erro de `tsc` — não uma
 * célula que chega `undefined` e vira "0 animais" numa fazenda com 4.820.
 *
 * Nunca `select('*')`: uma coluna nova na view entraria no payload RSC sem
 * ninguém ter decidido que ela pode (e este é o schema onde moram CPF e senha —
 * fora do alcance por desenho, e é assim que fica).
 */
const PROJECAO = {
  id: true,
  nome: true,
  numero_criador: true,
  cidade: true,
  estado: true,
  segmentos: true,
  produtor_id: true,
  produtor_nome: true,
  animais_ativos: true,
  lactantes: true,
  ultimo_lancamento_em: true,
  ultimo_modulo: true,
  lancamentos_30d: true,
  dias_sem_lancar: true,
  colaboradores: true,
  tecnicos_vinculados: true,
  plano_nome: true,
  status_efetivo: true,
  acesso_ativo: true,
  health_score: true,
} satisfies Record<keyof LinhaPropriedade, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gêmeo do plumbing de `queries.ts`, `areas/consultoria.ts` e `areas/cobrancas.ts`,
 * e a duplicação é a mesma decisão de lá: aquelas funções são privadas dos seus
 * módulos, e importar `queries.ts` (56 KB) para usar `numero()` arrastaria junto
 * a lista mestra, a carteira e o catálogo do escape hatch. O que NÃO pode
 * divergir é o comportamento — mesma paginação obrigatória, mesmo `Resultado`,
 * mesma tradução de código do PostgREST para 'sem-config'. No dia em que isto
 * virar `src/lib/adm/pg.ts`, este arquivo é um dos primeiros a trocar.
 */
type Linha = Record<string, unknown>;

type ErroPostgrest = { message: string; code?: string };

type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** Superfície mínima do query builder do supabase-js usada aqui. */
type Consulta = {
  order(coluna: string, opcoes?: { ascending?: boolean; nullsFirst?: boolean }): Consulta;
  range(de: number, ate: number): Consulta;
} & PromiseLike<Resposta>;

/**
 * PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 * 42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma: o
 * banco não foi preparado. Isso é 'sem-config', não 'erro' — e a diferença
 * importa: um diretório de fazendas vazio por falta de migration é
 * indistinguível de uma carteira que não tem cliente nenhum.
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${VIEW}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${VIEW}" não está acessível (${e.code}). Rode ${SQL_FASE_3}, confirme que o ` +
        'schema "adm" está em Settings → API → Exposed schemas e recarregue o cache do PostgREST ' +
        '(Settings → API → Reload schema cache) — view nova em schema já exposto só aparece depois disso.',
    );
  }
  return erro(`[adm] ${VIEW}: ${e.message}`);
}

/** 1000 = o `db-max-rows` do PostgREST; pedir mais numa página não traz mais nada. */
const PAGE = 1000;

/**
 * 5.000 fazendas. São 31 hoje (medido em produção em 04/09/2026), então isto é
 * folga de duas ordens de grandeza — e o teto existe para o dia em que não for:
 * acima dele a função devolve ERRO em vez de uma lista truncada. Um diretório
 * cortado pela metade continua parecendo um diretório, e é dele que saem as
 * contagens dos cards.
 */
const HARD_CAP = 5;

async function paginar(fabrica: (de: number, ate: number) => Consulta): Promise<Resultado<Linha[]>> {
  const saida: Linha[] = [];
  for (let pagina = 0; pagina < HARD_CAP; pagina++) {
    const de = pagina * PAGE;
    const { data, error } = await fabrica(de, de + PAGE - 1);
    if (error) return falha<Linha[]>(error);
    if (!data || data.length === 0) break;
    saida.push(...comoLinhas(data));
    if (data.length < PAGE) break;
    if (pagina === HARD_CAP - 1) {
      return erro(
        `[adm] ${VIEW}: passou de ${HARD_CAP * PAGE} propriedades e o resultado seria truncado. ` +
          'A tela precisa passar a filtrar no banco antes de contar qualquer coisa.',
      );
    }
  }
  return ok(saida);
}

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
  // `numeric` do Postgres chega como STRING pelo PostgREST quando a precisão não
  // cabe em double. Ignorar isso zeraria a coluna sem uma linha de erro.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Contagem: 0 significa "nenhum", nunca "não sei" (convenção do contrato). */
function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function booleano(v: unknown): boolean {
  return v === true || v === 't' || v === 'true';
}

/** `text[]` do Postgres. Elemento vazio fora, `null` vira lista vazia — a tela
 *  nunca precisa distinguir "sem segmento" de "coluna nula". */
function listaDeTexto(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(texto).filter((s): s is string => s !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

function mapearPropriedade(l: Linha): LinhaPropriedade {
  const id = inteiro(l.id);
  return {
    id,
    // `propriedades.nome_propriedade` é NOT NULL no banco; o fallback existe só
    // para uma linha nunca chegar à tela como célula em branco, que parece
    // defeito de render em vez de defeito de dado.
    nome: texto(l.nome) ?? `Propriedade #${id}`,
    numero_criador: texto(l.numero_criador),
    cidade: texto(l.cidade),
    estado: texto(l.estado),
    segmentos: listaDeTexto(l.segmentos),

    // NULL é INFORMAÇÃO DE NEGÓCIO: fazenda de consultoria, cadastrada pelo
    // técnico para um cliente que não usa o app. Trocar por 0 montaria um link
    // para /adm/u/0 — e apagaria a categoria comercial inteira.
    produtor_id: numero(l.produtor_id),
    produtor_nome: texto(l.produtor_nome),

    animais_ativos: inteiro(l.animais_ativos),
    lactantes: inteiro(l.lactantes),

    ultimo_lancamento_em: texto(l.ultimo_lancamento_em),
    ultimo_modulo: texto(l.ultimo_modulo),
    lancamentos_30d: inteiro(l.lancamentos_30d),
    // null = nunca lançou. 0 = lançou HOJE. São coisas opostas, e a diferença
    // aparece na tela como "nunca" contra "hoje".
    dias_sem_lancar: numero(l.dias_sem_lancar),

    colaboradores: inteiro(l.colaboradores),
    tecnicos_vinculados: inteiro(l.tecnicos_vinculados),

    plano_nome: texto(l.plano_nome),
    status_efetivo: texto(l.status_efetivo),
    acesso_ativo: booleano(l.acesso_ativo),

    // null = conta nova demais para pontuar (guard-rail de metricas.ts). Não é
    // zero: zero seria a pior fazenda da carteira.
    health_score: numero(l.health_score),
  };
}

/** As ordens iniciais que a tela sabe pedir. Fechada de propósito: cada uma é
 *  uma afirmação sobre o que é urgente, e a tabela já deixa reordenar por
 *  qualquer coluna no clique. */
export const ORDENS_PROPRIEDADE = ['risco', 'nome', 'animais'] as const;

export type OrdemPropriedade = (typeof ORDENS_PROPRIEDADE)[number];

export interface FiltrosPropriedades {
  /** Ordem de apresentação. Default 'risco' — o painel existe para achar quem
   *  está parando, não para ler a carteira em ordem alfabética. */
  ordem?: OrdemPropriedade;
}

/**
 * TODAS as propriedades, já ordenadas.
 *
 * Sem recorte no banco DE PROPÓSITO. São dezenas de linhas, e todo filtro da
 * tela (estado, segmento, atividade, produtor, plano) roda em memória no
 * cliente: filtrar no servidor numa rota `force-dynamic` significaria uma query
 * no Supabase por clique de chip, e faria os cards do topo — que falam da
 * carteira inteira — discordarem da tabela logo abaixo.
 *
 * A paginação é obrigatória mesmo com 31 fazendas: o PostgREST corta a resposta
 * no `db-max-rows` e devolve HTTP 200, então uma lista truncada chegaria aqui
 * parecendo completa.
 */
export async function listarPropriedades(
  filtros: FiltrosPropriedades = {},
): Promise<Resultado<LinhaPropriedade[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginar((de, ate) =>
    (supa.from(VIEW).select(SELECT) as unknown as Consulta)
      // A ordem pedida ao banco é a da PAGINAÇÃO, não a da tela: `range()` sobre
      // uma consulta sem desempate único pode repetir e pular linha entre
      // páginas. `id` é a chave primária, então fecha a ordem sozinho. A ordem
      // de apresentação vem depois, em memória — ver o cabeçalho do arquivo.
      .order('id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;

  return ok(ordenarPropriedades(res.dados.map(mapearPropriedade), filtros.ordem ?? 'risco'));
}

// ─────────────────────────────────────────────────────────────────────────────
// A fazenda sem produtor — a regra que a tela inteira gira em torno
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A ficha da propriedade, que é a ficha do DONO com a fazenda em foco — ou
 * `null` quando não há dono no sistema.
 *
 * `produtor_id` NULL não é dado faltando: é a fazenda de CONSULTORIA. O técnico
 * cadastrou um cliente que não usa o app, e o "proprietário" é texto livre que
 * ele digitou. Não existe conta para abrir, e a linha não pode ser clicável —
 * `/adm/u/null` daria 404, e `/adm/u/0` daria uma ficha vazia de um usuário que
 * não existe, que é pior, porque parece ter funcionado.
 *
 * Essa fazenda é alcançável pela ficha do TÉCNICO que a atende
 * (`/adm/c/<tecnico>` → carteira → `/adm/u/<tecnico>?prop=<id>`), e a tela diz
 * isso na célula do produtor. É informação comercial — um cliente que existe e
 * não é conta —, não um erro a esconder.
 *
 * Esta é a ÚNICA função do painel que escreve esta URL para o diretório: a tela
 * recebe o campo já resolvido, do mesmo jeito que a carteira do consultor recebe
 * `produtor_usuario_id` resolvido por leitura.
 */
export function fichaDaPropriedade(l: LinhaPropriedade): string | null {
  if (l.produtor_id == null) return null;
  return `/adm/u/${l.produtor_id}?prop=${l.id}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação — a MESMA regra do comparar() da <AdmTable>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nulo por último NOS DOIS SENTIDOS, texto por `localeCompare('pt-BR')`.
 *
 * Os dois pontos são a razão de a função existir, e nenhum deles é o default do
 * JavaScript: `(a, b) => a - b` transforma `null` em 0 — uma fazenda sem health
 * score se disfarçaria da pior da carteira e roubaria o topo da lista de quem
 * realmente está parando. E inverter a direção não pode encher a primeira página
 * de célula vazia, senão o operador clica para ver "os maiores" e vê os
 * desconhecidos.
 *
 * É a cópia deliberada do `comparar()` de <AdmTable> — é o que faz a ordem
 * inicial ser reproduzível por um clique no cabeçalho.
 */
function comparar(a: number | string | null, b: number | string | null, sinal: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'pt-BR') * sinal;
  if (a < b) return -1 * sinal;
  if (a > b) return 1 * sinal;
  return 0;
}

/**
 * Cada ordem termina no `id` para ser TOTAL: sem o desempate, duas fazendas
 * empatadas podem trocar de lugar entre o render do servidor e o do cliente, e a
 * lista "muda sozinha" na hidratação.
 */
const CRITERIOS: Record<OrdemPropriedade, (a: LinhaPropriedade, b: LinhaPropriedade) => number> = {
  // Pior primeiro. Score crescente porque 0 é o pior; nulo (conta nova demais
  // para pontuar) vai para o FIM — conta nova não é conta em risco, e misturar
  // as duas gera alarme falso todo dia. Empate desce para quem está parado há
  // mais tempo.
  risco: (a, b) =>
    comparar(a.health_score, b.health_score, 1) ||
    comparar(a.dias_sem_lancar, b.dias_sem_lancar, -1) ||
    a.id - b.id,
  nome: (a, b) => comparar(a.nome, b.nome, 1) || a.id - b.id,
  animais: (a, b) => comparar(a.animais_ativos, b.animais_ativos, -1) || comparar(a.nome, b.nome, 1) || a.id - b.id,
};

/** Não muda a lista recebida: `sort()` do JavaScript ordena no lugar, e ordenar
 *  o array do chamador é como uma segunda contagem passa a discordar da primeira. */
export function ordenarPropriedades(
  linhas: readonly LinhaPropriedade[],
  ordem: OrdemPropriedade = 'risco',
): LinhaPropriedade[] {
  return [...linhas].sort(CRITERIOS[ordem] ?? CRITERIOS.risco);
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo — os cinco cards do topo
// ─────────────────────────────────────────────────────────────────────────────

/** Reexportado de contrato.ts — a constante mora lá porque o Client Component
 *  da lista também precisa dela, e não pode importar deste módulo server-only. */
export { DIAS_SILENCIO };

/**
 * SUMIU MAS AINDA PAGA. A regra é idêntica à do filtro `atividade=silencioso` de
 * `queries.ts` — sem o acesso ativo, a lista se enche de conta cancelada há um
 * ano, que não é ação nenhuma.
 *
 * NUNCA LANÇOU não entra aqui: `dias_sem_lancar` nulo é uma fazenda que nunca
 * começou, e isso é uma ligação de ONBOARDING, não de retenção. São conversas
 * diferentes, e o resumo conta as duas em campos separados.
 *
 * A <ListaPropriedades> repete esta regra na faceta `atividade` (um Client
 * Component não pode importar deste módulo, que é `server-only` por desenho).
 * As duas precisam concordar: o card leva para a faceta, e um card que abre uma
 * lista com outra quantidade destrói a confiança nos dois números.
 */
export function ehSilenciosa(l: LinhaPropriedade): boolean {
  return l.dias_sem_lancar != null && l.dias_sem_lancar >= DIAS_SILENCIO && l.acesso_ativo;
}

export interface ResumoPropriedades {
  /** Fazendas na lista — o total do diretório. */
  propriedades: number;
  /** Contas de produtor DISTINTAS por trás delas. Menor que `propriedades`
   *  sempre que alguém tem duas fazendas: é a diferença que justifica esta tela
   *  existir ao lado da lista de usuários. */
  produtores: number;
  /** Quantas dessas contas têm mais de uma fazenda. */
  contasComMaisDeUmaFazenda: number;

  /** Acesso do DONO (o contrato é explícito: a fazenda não assina, o produtor
   *  assina). Fazenda de consultoria não tem assinatura própria — por isso ela
   *  tem um card só dela em vez de aparecer como "sem acesso". */
  comAcessoAtivo: number;

  animais: number;
  lactantes: number;

  /** Ver ehSilenciosa(): +30 dias sem lançar E com acesso ativo. */
  silenciosas: number;
  /** Nunca lançaram nada — o funil de onboarding, contado à parte. */
  nuncaLancaram: number;

  /** `produtor_id` NULL: as fazendas de consultoria. */
  semProdutor: number;
}

/**
 * Os números dos cards, somados sobre a lista COMPLETA que `listarPropriedades()`
 * devolveu — nunca sobre uma página.
 *
 * A regra geral do painel é "card e gráfico são agregados em SQL" (queries.ts), e
 * ela existe para impedir a soma sobre um recorte já paginado. A exceção aqui é
 * deliberada e tem os mesmos apoios de `resumirCobrancas()`: a lista chega
 * completa ou a função falha alto, os cards precisam ser EXATAMENTE a contagem
 * das linhas da tabela ao lado, e o volume é conhecido (dezenas).
 *
 * Nenhuma conta usa o relógio: `dias_sem_lancar` e `acesso_ativo` chegam
 * calculados contra o relógio do BANCO. Recalcular aqui reintroduziria a
 * divergência clássica — servidor renderiza "há 30 dias", cliente hidrata com
 * "há 29" na virada da meia-noite.
 */
export function resumirPropriedades(linhas: readonly LinhaPropriedade[]): ResumoPropriedades {
  const resumo: ResumoPropriedades = {
    propriedades: linhas.length,
    produtores: 0,
    contasComMaisDeUmaFazenda: 0,
    comAcessoAtivo: 0,
    animais: 0,
    lactantes: 0,
    silenciosas: 0,
    nuncaLancaram: 0,
    semProdutor: 0,
  };

  /** produtor_id → quantas fazendas. O Map é o que separa "31 fazendas" de "30
   *  produtores": contar linha por linha diria 31 produtores e apagaria o fato. */
  const fazendasPorProdutor = new Map<number, number>();

  for (const l of linhas) {
    if (l.produtor_id == null) resumo.semProdutor += 1;
    else fazendasPorProdutor.set(l.produtor_id, (fazendasPorProdutor.get(l.produtor_id) ?? 0) + 1);

    if (l.acesso_ativo) resumo.comAcessoAtivo += 1;

    resumo.animais += l.animais_ativos;
    resumo.lactantes += l.lactantes;

    if (l.ultimo_lancamento_em == null) resumo.nuncaLancaram += 1;
    if (ehSilenciosa(l)) resumo.silenciosas += 1;
  }

  resumo.produtores = fazendasPorProdutor.size;
  for (const quantas of fazendasPorProdutor.values()) {
    if (quantas > 1) resumo.contasComMaisDeUmaFazenda += 1;
  }

  return resumo;
}
