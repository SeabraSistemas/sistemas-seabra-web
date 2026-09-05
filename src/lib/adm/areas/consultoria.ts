import 'server-only';

import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';
import {
  VIEWS_FASE_2,
  type LinhaCarteiraConsultor,
  type LinhaConsultor,
} from '@/lib/adm/areas/contrato';

/**
 * ÁREA DE CONSULTORIA — a leitura de `/adm/consultores` e `/adm/c/[id]`.
 *
 * O QUE É UM CONSULTOR NESTE BANCO. Não existe `regra_de_acesso = 'consultor'`.
 * Consultor é um MODO do técnico, e uma conta `tecnico` tem duas capacidades
 * independentes que o painel precisa manter separadas porque VENDEM DIFERENTE:
 *
 *   AML/Medidas   grátis, a convite do produtor. O gate é
 *                 `perfil_tecnico.habilitacao_aml_status` e NUNCA a assinatura.
 *   Consultoria   pago, iniciativa do técnico. O gate é assinatura de plano
 *                 `tipo='tecnico'` + vínculo ativo em `tecnico_propriedades`.
 *
 * Daí a tela ter chip de habilitação E barra de vínculos: um técnico habilitado
 * com zero vínculos não é um cadastro morto, é a lista de prospecção — e é por
 * isso que `adm.consultores_lista` inclui quem tem carteira vazia.
 *
 * POR QUE ESTE ARQUIVO TEM PLUMBING PRÓPRIO. `paginar()`, `umaLinha()` e as
 * coerções de `src/lib/adm/queries.ts` são privadas daquele módulo. Reproduzi-las
 * aqui é menos ruim do que importar meio arquivo de lá (e arrastar o catálogo de
 * tabelas junto): o que NÃO pode divergir é o comportamento — mesma paginação
 * obrigatória, mesmo `Resultado`, mesma tradução de código do PostgREST para
 * 'sem-config'. Se um dia esse plumbing virar `src/lib/adm/pg.ts`, este é o
 * primeiro arquivo a trocar.
 *
 * ⚠️ PAGINAÇÃO NÃO É OPCIONAL, nem numa tabela de três linhas. O PostgREST corta
 * a resposta no `db-max-rows` e devolve HTTP 200 — uma carteira truncada chega
 * aqui parecendo completa, e a tela diria que o técnico atende menos fazendas do
 * que atende.
 *
 * SOMENTE LEITURA (decisão D3): nada aqui escreve. O vínculo de consultoria é
 * write-only-via-RPC no app (`vincular_propriedade_cliente`), e a habilitação AML
 * tem um trigger que rejeita UPDATE direto inclusive de service_role.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato — nomes de view
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os nomes das duas views da área vêm de VIEWS_FASE_2, nunca de uma string
 * digitada aqui. É a regra que nasceu do defeito nº 1 da Fase 1: dez views
 * consumidas, seis criadas, quatro com outro nome — compilando, passando no
 * lint, e só uma tela abrindo.
 */
const VIEW_CONSULTORES = VIEWS_FASE_2.consultores;
const VIEW_CARTEIRA = VIEWS_FASE_2.carteiraConsultor;

/**
 * A ÚNICA string de nome de view deste arquivo, e ela merece explicação.
 *
 * `adm.propriedades_escopo` é da Fase 1 (adm_01_schema_e_views.sql:129) e o nome
 * dela mora num `const VIEW` privado de queries.ts — não há de onde importar. É
 * a ponte consultor → produtor: a carteira devolve `propriedade_id` e o NOME do
 * proprietário, mas nenhum `usuarios.id` de dono (ver `resolverProdutores`).
 *
 * Se um dia as views da Fase 1 entrarem no contrato, este é o lugar a trocar.
 */
const VIEW_ESCOPO = 'propriedades_escopo';

/** Citados na mensagem de erro: "view não existe" sem dizer o que rodar custa
 *  meia hora de investigação, e o arquivo tem nome. */
const SQL_CONSULTORIA = 'supabase/adm/adm_08_consultoria.sql';
const SQL_ESCOPO = 'supabase/adm/adm_01_schema_e_views.sql';

// ─────────────────────────────────────────────────────────────────────────────
// Projeções — o SQL projeta exatamente estes nomes (contrato.ts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Projeção explícita, nunca `select('*')`. Aqui isso é mais do que higiene: a
 * view mascara o e-mail em SQL, e um `*` amanhã traria de graça qualquer coluna
 * nova que o SQL acrescente — inclusive uma que ninguém pretendia mostrar.
 */
const COLUNAS_CONSULTOR = [
  'usuario_id',
  'nome',
  'email_mascarado',
  'profissao',
  'especialidade',
  'habilitacao_aml_status',
  'vinculos_ativos',
  'limite_propriedades',
  'plano_nome',
  'status_efetivo',
  'valor_real_mensal',
  'animais_sob_consultoria',
  'amls_90d',
  'medidas_90d',
  'visitas_90d',
  'ativo',
  'carteira_cheia',
].join(',');

const COLUNAS_CARTEIRA = [
  'usuario_id',
  'propriedade_id',
  'propriedade_nome',
  'nome_proprietario',
  'estado',
  'status_vinculo',
  'data_vinculo',
  'animais_ativos',
  'ultimo_lancamento_em',
  'amls_90d',
].join(',');

/** Da `propriedades_escopo`: a propriedade sai como `id` (adm_01:196), não como
 *  `propriedade_id`. Pedir o nome errado devolve 400, não linha vazia. */
const COLUNAS_DONO = 'id,usuario_id';

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing — erro, paginação, coerção
// ─────────────────────────────────────────────────────────────────────────────

type ErroPostgrest = { message: string; code?: string; details?: string | null; hint?: string | null };

type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** Superfície mínima do query builder do supabase-js usada aqui. Existe para
 *  passar uma consulta pela metade entre helpers sem espalhar `any`. */
type Consulta = {
  eq(coluna: string, valor: unknown): Consulta;
  in(coluna: string, valores: readonly unknown[]): Consulta;
  order(coluna: string, opcoes?: { ascending?: boolean; nullsFirst?: boolean }): Consulta;
  limit(quantidade: number): Consulta;
  range(de: number, ate: number): Consulta;
} & PromiseLike<Resposta>;

/**
 * Códigos que significam "o banco não está preparado", não "o painel quebrou":
 * PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 * 42501 sem privilégio · 3F000 schema inexistente. Viram 'sem-config' com a
 * instrução do que rodar, porque a ação é a mesma nos cinco.
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(label: string, e: ErroPostgrest, sql: string): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${label}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${label}" não está acessível (${e.code}). Rode ${sql} no Supabase, confirme que o ` +
        'schema "adm" está em Settings → API → Exposed schemas e recarregue o cache do PostgREST ' +
        "(Settings → API → Reload schema cache) — view nova em schema já exposto só aparece depois disso.",
    );
  }
  return erro(`[adm] ${label}: ${e.message}`);
}

/** 1000 = o `db-max-rows` do PostgREST; pedir mais numa página não traz mais nada. */
const PAGE = 1000;
/** 5.000 linhas. Consultores são unidades e carteira é dezenas — passar disso é
 *  bug de filtro, e a tela precisa DIZER isso em vez de truncar em silêncio. */
const HARD_CAP = 5;

async function paginar<T>(
  fabrica: (de: number, ate: number) => Consulta,
  label: string,
  sql: string,
): Promise<Resultado<T[]>> {
  const saida: T[] = [];
  for (let pagina = 0; pagina < HARD_CAP; pagina++) {
    const de = pagina * PAGE;
    const { data, error } = await fabrica(de, de + PAGE - 1);
    if (error) return falha<T[]>(label, error, sql);
    if (!data || data.length === 0) break;
    saida.push(...(data as T[]));
    if (data.length < PAGE) break;
    if (pagina === HARD_CAP - 1) {
      return erro(
        `[adm] ${label}: passou de ${HARD_CAP * PAGE} linhas e o resultado seria truncado. Refine o filtro.`,
      );
    }
  }
  return ok(saida);
}

async function umaLinha<T>(consulta: Consulta, label: string, sql: string): Promise<Resultado<T | null>> {
  const { data, error } = await consulta.limit(1);
  if (error) return falha<T | null>(label, error, sql);
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
  // `numeric` do Postgres chega como string quando a precisão não cabe em double
  // — ignorar isso transformaria a receita da assinatura técnica em null sem aviso.
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

// ─────────────────────────────────────────────────────────────────────────────
// Mapeadores
// ─────────────────────────────────────────────────────────────────────────────

function mapearConsultor(l: Linha): LinhaConsultor {
  return {
    usuario_id: inteiro(l.usuario_id),
    nome: texto(l.nome) ?? 'Sem nome',
    email_mascarado: texto(l.email_mascarado),
    profissao: texto(l.profissao),
    especialidade: texto(l.especialidade),
    // Deixado como veio, sem cair num default: 'nao_solicitada' e null são
    // estados DIFERENTES (um criou o perfil e não pediu; o outro nunca criou
    // perfil nenhum), e a tela distingue os dois.
    habilitacao_aml_status: texto(l.habilitacao_aml_status),
    vinculos_ativos: inteiro(l.vinculos_ativos),
    // null = nenhum plano técnico com acesso ativo. NÃO vira 0: zero seria "um
    // plano que não permite fazenda nenhuma", e a diferença muda a conversa
    // comercial (vender o primeiro plano ≠ vender um upgrade).
    limite_propriedades: numero(l.limite_propriedades),
    plano_nome: texto(l.plano_nome),
    status_efetivo: texto(l.status_efetivo),
    valor_real_mensal: numero(l.valor_real_mensal),
    animais_sob_consultoria: inteiro(l.animais_sob_consultoria),
    amls_90d: inteiro(l.amls_90d),
    medidas_90d: inteiro(l.medidas_90d),
    visitas_90d: inteiro(l.visitas_90d),
    ativo: booleano(l.ativo),
    carteira_cheia: booleano(l.carteira_cheia),
  };
}

function mapearCarteira(l: Linha): LinhaCarteiraConsultor {
  return {
    usuario_id: inteiro(l.usuario_id),
    propriedade_id: inteiro(l.propriedade_id),
    propriedade_nome: texto(l.propriedade_nome) ?? 'Sem nome',
    nome_proprietario: texto(l.nome_proprietario),
    estado: texto(l.estado),
    status_vinculo: texto(l.status_vinculo),
    data_vinculo: texto(l.data_vinculo),
    animais_ativos: inteiro(l.animais_ativos),
    ultimo_lancamento_em: texto(l.ultimo_lancamento_em),
    amls_90d: inteiro(l.amls_90d),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ordem da lista — carteira mais cheia primeiro
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Quanto da carteira contratada já está ocupada. É a chave de ordenação da tela,
 * e ela é uma RAZÃO: 6 de 7 vagas vale mais atenção comercial do que 6 de 15.
 *
 * Sem limite conhecido (nenhuma assinatura técnica com acesso ativo) as vagas
 * contratadas são ZERO — então qualquer vínculo já é carteira sem vaga, e a
 * linha sobe junto com as cheias. Não é sutileza: um técnico atendendo três
 * fazendas sem plano ativo é a conversa mais urgente da tela, e não uma linha
 * neutra no meio da lista.
 */
function preenchimento(l: LinhaConsultor): number {
  const limite = l.limite_propriedades;
  if (limite == null || limite <= 0) return l.vinculos_ativos > 0 ? 1 : -1;
  return l.vinculos_ativos / limite;
}

/**
 * A ordem de negócio. Feita em memória, e isso é deliberado: o PostgREST não
 * ordena por expressão (`vinculos_ativos / limite_propriedades` não é coluna), e
 * a lista chega INTEIRA — são unidades de técnicos, não uma página de um milhão.
 *
 * Isto é ORDENAR, não agregar. Somar em JS sobre uma página já paginada é o que
 * faz um KPI ficar 40% menor que a verdade; ordenar uma lista completa não muda
 * número nenhum.
 */
function ordenarPorCarteira(linhas: LinhaConsultor[]): LinhaConsultor[] {
  return [...linhas].sort((a, b) => {
    const dp = preenchimento(b) - preenchimento(a);
    if (dp !== 0) return dp;
    const dv = b.vinculos_ativos - a.vinculos_ativos;
    if (dv !== 0) return dv;
    const da = b.animais_sob_consultoria - a.animais_sob_consultoria;
    if (da !== 0) return da;
    const dn = a.nome.localeCompare(b.nome, 'pt-BR');
    return dn !== 0 ? dn : a.usuario_id - b.usuario_id;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// A ponte consultor → produtor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma linha da carteira somada ao `usuarios.id` do produtor dono — o que
 * transforma a tabela em navegação.
 *
 * `produtor_usuario_id` NÃO é coluna da view: `LinhaCarteiraConsultor` tem o
 * NOME do proprietário e nenhum id de usuário, e inventar uma coluna que o SQL
 * não projeta é exatamente o defeito que a Fase 1 pagou caro (compila, passa no
 * lint, e o PostgREST devolve 400 em runtime). O id é derivado aqui, por leitura,
 * e o campo carrega o sufixo que denuncia isso.
 *
 * `null` é informação de negócio, não dado faltando: a fazenda de consultoria
 * nasce com `propriedades.produtor_id` NULL — o técnico cadastra o cliente que
 * NÃO usa o app. Esse é outro tipo de cliente e muda o que dá para fazer com ele
 * (não há conta para cobrar, não há ficha para abrir, e há um lead na mesa).
 */
export interface LinhaCarteiraNavegavel extends LinhaCarteiraConsultor {
  produtor_usuario_id: number | null;
}

/**
 * propriedade_id → `usuarios.id` do dono, pela perna `dono` de
 * `adm.propriedades_escopo` (prioridade 1: `propriedades.produtor_id` ou o
 * `usuarios.propriedade_id` de um produtor).
 *
 * Duas propriedades podem, em tese, ter dois "donos" (as duas colunas já
 * divergiram em produção). O primeiro por `usuario_id` ganha, para o link ser
 * estável entre dois carregamentos — um destino que muda sozinho é pior do que
 * um destino discutível.
 */
async function resolverProdutores(propriedadeIds: number[]): Promise<Resultado<Map<number, number>>> {
  const mapa = new Map<number, number>();
  if (propriedadeIds.length === 0) return ok(mapa);

  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginar<Linha>(
    (de, ate) =>
      (supa.from(VIEW_ESCOPO).select(COLUNAS_DONO) as unknown as Consulta)
        .in('id', propriedadeIds)
        .eq('vinculo', 'dono')
        // Ordem determinística: `paginar()` usa range/offset, e range sobre
        // consulta sem ORDER BY pode repetir e pular linha entre páginas.
        .order('id')
        .order('usuario_id')
        .range(de, ate),
    VIEW_ESCOPO,
    SQL_ESCOPO,
  );
  if (!res.ok) return res;

  for (const linha of comoLinhas(res.dados)) {
    const propriedade = inteiro(linha.id);
    const usuario = inteiro(linha.usuario_id);
    if (propriedade > 0 && usuario > 0 && !mapa.has(propriedade)) mapa.set(propriedade, usuario);
  }
  return ok(mapa);
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todos os técnicos, carteira mais cheia primeiro.
 *
 * Inclui quem tem zero vínculos de propósito (a view já decide isso): o técnico
 * habilitado que nunca virou consultor é o funil de prospecção, e filtrá-lo aqui
 * esconderia justamente a lista de quem falta converter.
 */
export async function listarConsultores(): Promise<Resultado<LinhaConsultor[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginar<Linha>(
    (de, ate) =>
      (supa.from(VIEW_CONSULTORES).select(COLUNAS_CONSULTOR) as unknown as Consulta)
        // Ordem do BANCO = chave única, só para a paginação ser determinística.
        // A ordem de NEGÓCIO entra depois, em ordenarPorCarteira().
        .order('usuario_id')
        .range(de, ate),
    VIEW_CONSULTORES,
    SQL_CONSULTORIA,
  );
  if (!res.ok) return res;

  return ok(ordenarPorCarteira(comoLinhas(res.dados).map(mapearConsultor)));
}

/**
 * Um consultor. `null` (e não erro) quando o id existe mas não é técnico — a
 * tela transforma isso num caminho de saída para `/adm/u/<id>`, que é onde
 * aquele usuário realmente mora. 404 seco mandaria o Felipe de volta ao começo.
 */
export async function getConsultor(usuarioId: number): Promise<Resultado<LinhaConsultor | null>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await umaLinha<Linha>(
    (supa.from(VIEW_CONSULTORES).select(COLUNAS_CONSULTOR) as unknown as Consulta).eq('usuario_id', usuarioId),
    VIEW_CONSULTORES,
    SQL_CONSULTORIA,
  );
  if (!res.ok) return res;
  return ok(res.dados ? mapearConsultor(res.dados) : null);
}

/**
 * A carteira de um consultor, já navegável.
 *
 * Traz vínculo INATIVO junto (a view decide isso): inativo libera a vaga do
 * plano mas preserva os dados, e rotatividade é informação comercial — três
 * clientes desvinculados num trimestre é perda de cliente, não economia de vaga.
 * A ordem coloca os ativos primeiro e, dentro deles, a fazenda maior no topo.
 *
 * Se a resolução dos produtores falhar, a função inteira falha. É a decisão
 * menos confortável e a certa: devolver a carteira com todo mundo marcado como
 * "sem produtor no app" inventaria uma categoria comercial a partir de um erro
 * de leitura — e essa categoria muda o que o Felipe faz com a linha.
 */
export async function getCarteiraConsultor(usuarioId: number): Promise<Resultado<LinhaCarteiraNavegavel[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginar<Linha>(
    (de, ate) =>
      (supa.from(VIEW_CARTEIRA).select(COLUNAS_CARTEIRA) as unknown as Consulta)
        .eq('usuario_id', usuarioId)
        // 'ativo' antes de 'inativo' por ordem alfabética — coincidência que os
        // dois únicos valores do CHECK tornam estável, e o desempate por
        // propriedade_id garante a determinística que o range() exige.
        .order('status_vinculo')
        .order('animais_ativos', { ascending: false, nullsFirst: false })
        .order('propriedade_id')
        .range(de, ate),
    VIEW_CARTEIRA,
    SQL_CONSULTORIA,
  );
  if (!res.ok) return res;

  const linhas = comoLinhas(res.dados).map(mapearCarteira);
  const donos = await resolverProdutores(linhas.map((l) => l.propriedade_id));
  if (!donos.ok) return donos;

  return ok(
    linhas.map((l) => ({ ...l, produtor_usuario_id: donos.dados.get(l.propriedade_id) ?? null })),
  );
}
