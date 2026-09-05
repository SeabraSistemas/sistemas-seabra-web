import 'server-only';

import { VIEWS_FASE_2, type LinhaAvaliacoes } from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { getRegistro } from '@/lib/adm/tabelas';
import { erro, ok, semConfig, type FatiaDistribuicao, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * ÁREA AVALIAÇÕES — leitura da view `adm.propriedade_avaliacoes` e as regras que
 * a aba, o radar e o dossiê comercial compartilham.
 *
 * Esta é a área que a Sistema Seabra VENDE: a AML (Avaliação Morfológica Linear)
 * é serviço prestado por técnico habilitado, e a maioria dos criadores tem ZERO
 * linha. Isso muda o que a tela precisa fazer bem: o estado vazio aqui não é uma
 * falha a esconder, é a oferta comercial mais direta do catálogo, e precisa estar
 * escrito assim.
 *
 * ⚠️ A GRAFIA DOS PONTOS DA AML É INCONSISTENTE NO BANCO:
 * `ponto_5_profundidadedeúbere` e `ponto_12_ligamentosuspensóriomedio` têm
 * ACENTO, e os `class_5_profundidadedeubere` / `class_12_ligamentosuspensoriomedio`
 * correspondentes NÃO têm. Consequência prática, e a razão de este módulo existir
 * do jeito que existe: NINGUÉM GERA ESSAS CHAVES POR TEMPLATE. Um laço de
 * `ponto_${i}_${nome}` compila, não dá erro em runtime e devolve nulo em dois dos
 * dezesseis eixos — um radar com dois bicos afundados que ninguém sabe explicar.
 * A view entrega `media_por_ponto` PRONTO; aqui só se lê o que ela mandou.
 *
 * Somente leitura (decisão D3).
 */

// ─────────────────────────────────────────────────────────────────────────────
// O que a aba abre por baixo dos cards
// ─────────────────────────────────────────────────────────────────────────────

/** A tabela do catálogo que vai na <TabelaGenerica> — chave de rota, não nome solto. */
export const TABELA_AVALIACOES = 'avaliacao_morfologica_linear';

/** A área do catálogo, para os atalhos: medidas e AML de corte. */
export const AREA_CATALOGO_AVALIACOES = 'Avaliação';

/**
 * O teto da escala de um ponto da AML. É escala BIOLÓGICA de 1 a 9, não nota: 9
 * em "ângulo de garupa" não é melhor que 5, é diferente. O radar fixa o domínio
 * nesta constante para que dois criadores tenham polígonos comparáveis.
 */
export const ESCALA_AML = 9;

/** A pontuação total da AML é convertida para uma escala de até 100. */
export const PONTUACAO_MAXIMA = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Projeção — conferida contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

const PROJECAO = {
  propriedade_id: true,
  amls_total: true,
  amls_12m: true,
  medidas_total: true,
  pontuacao_media: true,
  aml_corte_total: true,
  pontuacao_mensal: true,
  media_por_ponto: true,
} satisfies Record<keyof LinhaAvaliacoes, true>;

/** `satisfies` acima é o que transforma "esqueci uma coluna" em erro de `tsc`.
 *  Nunca `select('*')`: coluna nova da view não entra no payload RSC sem decisão. */
const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gêmeos dos ajudantes privados de `src/lib/adm/queries.ts` — ver a nota igual em
 * `areas/crescimento.ts`. Duplicados de propósito enquanto forem duas áreas; com
 * oito, o certo é extrair `areas/leitura.ts`, e não abrir exceção antes disso.
 */
type Linha = Record<string, unknown>;

type ErroPostgrest = { message: string; code?: string };

type Consulta = {
  eq(coluna: string, valor: unknown): Consulta;
  limit(quantidade: number): Consulta;
} & PromiseLike<{ data: unknown[] | null; error: ErroPostgrest | null }>;

const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode o SQL das views da Fase 2 em ` +
        'supabase/adm/ — o que implementa VIEWS_FASE_2 de src/lib/adm/areas/contrato.ts — e confirme ' +
        'que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

async function umaLinha(consulta: Consulta, view: string): Promise<Resultado<Linha | null>> {
  const { data, error } = await consulta.limit(1);
  if (error) return falha<Linha | null>(view, error);
  const linha = data?.[0];
  return ok(typeof linha === 'object' && linha !== null ? (linha as Linha) : null);
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres chega como string quando a precisão não cabe em double.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

function arranjo(v: unknown): Linha[] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is Linha => typeof item === 'object' && item !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Propriedade sem linha na view. Aqui o vazio é a regra, não a exceção: AML é
 * serviço de técnico habilitado e a maioria dos criadores nunca contratou um.
 */
export function avaliacoesVazio(propriedadeId = 0): LinhaAvaliacoes {
  return {
    propriedade_id: propriedadeId,
    amls_total: 0,
    amls_12m: 0,
    medidas_total: 0,
    pontuacao_media: null,
    aml_corte_total: 0,
    pontuacao_mensal: null,
    media_por_ponto: null,
  };
}

export async function getAvaliacoes(propriedadeId: number): Promise<Resultado<LinhaAvaliacoes>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FASE_2.avaliacoes;

  // UMA leitura: a série mensal e a média por ponto vêm como colunas jsonb da
  // mesma linha, no padrão de `adm.propriedade_visao_geral`. Card, radar e série
  // saem do mesmo SELECT — é o que garante que o número do card e a forma do
  // radar falem do mesmo recorte.
  const res = await umaLinha(
    (supa.from(view).select(SELECT) as unknown as Consulta).eq('propriedade_id', propriedadeId),
    view,
  );
  if (!res.ok) return res;

  const l = res.dados;
  if (!l) return ok(avaliacoesVazio(propriedadeId));

  return ok({
    propriedade_id: inteiro(l.propriedade_id) || propriedadeId,
    amls_total: inteiro(l.amls_total),
    amls_12m: inteiro(l.amls_12m),
    medidas_total: inteiro(l.medidas_total),
    // null e não 0: "pontuação média zero" seria um rebanho reprovado, e o que
    // existe é um rebanho não avaliado. São duas conversas comerciais opostas.
    pontuacao_media: numero(l.pontuacao_media),
    aml_corte_total: inteiro(l.aml_corte_total),
    pontuacao_mensal: mapearSerie(arranjo(l.pontuacao_mensal)),
    media_por_ponto: mapearFatias(arranjo(l.media_por_ponto)),
  });
}

function mapearSerie(linhas: Linha[]): PontoSerie[] | null {
  const pontos = linhas
    .map((p) => ({ periodo: texto(p.periodo) ?? '', valor: numero(p.valor) }))
    .filter((p): p is PontoSerie => p.periodo !== '' && p.valor !== null);
  return pontos.length > 0 ? pontos : null;
}

function mapearFatias(linhas: Linha[]): FatiaDistribuicao[] | null {
  const fatias = linhas
    .map((f) => ({ rotulo: texto(f.rotulo) ?? '', valor: numero(f.valor) }))
    .filter((f): f is FatiaDistribuicao => f.rotulo !== '' && f.valor !== null);
  return fatias.length > 0 ? fatias : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de várias propriedades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mesma regra de `consolidarVisoes()` em metricas.ts: contagem soma, média vira
 * null.
 *
 * O CAMINHO NÃO TOMADO, de propósito: dava para ponderar a média por ponto pelo
 * `amls_total` de cada fazenda e fundir os radares. A conta só fecha se toda AML
 * tiver os 16 pontos preenchidos — e uma avaliação interrompida no meio é comum.
 * O erro entraria calado, num gráfico que existe justamente para ser mostrado ao
 * cliente. Então, com escopo consolidado, o radar não é desenhado e a tela manda
 * escolher uma fazenda. Melhor um gráfico a menos que um gráfico errado numa
 * peça comercial.
 */
export function consolidarAvaliacoes(linhas: LinhaAvaliacoes[]): LinhaAvaliacoes {
  if (linhas.length === 1) return linhas[0];
  if (linhas.length === 0) return avaliacoesVazio();

  const soma = (pegar: (l: LinhaAvaliacoes) => number) => linhas.reduce((acc, l) => acc + pegar(l), 0);

  return {
    // 0 = consolidado; não é id de propriedade nenhuma.
    propriedade_id: 0,
    amls_total: soma((l) => l.amls_total),
    amls_12m: soma((l) => l.amls_12m),
    medidas_total: soma((l) => l.medidas_total),
    pontuacao_media: null,
    aml_corte_total: soma((l) => l.aml_corte_total),
    pontuacao_mensal: null,
    media_por_ponto: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// O radar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Um eixo do radar, já resolvido: número, rótulo por extenso e média.
 *
 * Estruturalmente igual a `PontoRadar` de
 * `src/components/adm/charts/RadarAml.tsx`, e declarado aqui de novo em vez de
 * importado de lá: este módulo abre com `import 'server-only'`, e um caminho de
 * import entre ele e um Client Component — mesmo que só de tipo — é uma armadilha
 * esperando alguém trocar `import type` por `import`. TypeScript é estrutural: os
 * dois casam sem se conhecerem.
 */
export interface PontoAml {
  numero: number;
  rotulo: string;
  valor: number;
}

/**
 * Rótulo humano de cada `ponto_*`, VINDO DO CATÁLOGO
 * (src/lib/adm/tabelas-dados.ts), que já carrega os 16 nomes com a grafia certa —
 * inclusive os dois acentuados. Reusar o catálogo em vez de manter uma segunda
 * lista aqui é o que impede as duas divergirem; e a tradução é por LOOKUP do que
 * a view mandou, nunca por template.
 */
const ROTULO_DO_PONTO: ReadonlyMap<string, string> = new Map(
  (getRegistro(TABELA_AVALIACOES)?.colunas ?? [])
    .filter((coluna) => coluna.chave.startsWith('ponto_'))
    .map((coluna) => [coluna.chave, coluna.rotulo] as const),
);

/**
 * Traduz `media_por_ponto` para os eixos do radar.
 *
 * O `rotulo` que a view manda pode ser o nome cru da coluna
 * (`ponto_5_profundidadedeúbere`) ou já o nome humano — as duas formas são
 * aceitas, e é por isso que o número sai de uma BUSCA por dígitos no rótulo, com
 * a posição na lista como último recurso. Nada aqui monta nome de coluna.
 */
export function pontosDoRadar(fatias: FatiaDistribuicao[] | null | undefined): PontoAml[] {
  if (!fatias) return [];

  return fatias
    .filter((f) => typeof f.valor === 'number' && Number.isFinite(f.valor))
    .map((f, i) => {
      const rotulo = ROTULO_DO_PONTO.get(f.rotulo) ?? f.rotulo;
      return { numero: numeroDoPonto(rotulo, f.rotulo, i), rotulo, valor: f.valor };
    });
}

/** O primeiro número do rótulo (1..16). `ponto_10_...` dá 10, '5 · Profundidade'
 *  dá 5; sem dígito nenhum, a posição na lista — que é a ordem em que a view
 *  entregou, e ela entrega em ordem. */
function numeroDoPonto(rotulo: string, rotuloCru: string, indice: number): number {
  const achado = /(\d{1,2})/.exec(rotulo) ?? /(\d{1,2})/.exec(rotuloCru);
  const n = achado ? Number(achado[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : indice + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura comercial
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nunca recebeu avaliação nenhuma — nem AML de leite, nem medida, nem AML de
 * corte. É a informação de VENDA da aba, e por isso é uma função com nome, e não
 * um `=== 0` solto no meio do JSX.
 */
export function semAvaliacao(l: LinhaAvaliacoes): boolean {
  return l.amls_total === 0 && l.medidas_total === 0 && l.aml_corte_total === 0;
}

/** Avaliou um dia e parou: tem histórico, mas nada nos últimos 12 meses. É a
 *  outra conversa comercial — reativação, não primeira venda. */
export function avaliacaoParada(l: LinhaAvaliacoes): boolean {
  return l.amls_total > 0 && l.amls_12m === 0;
}
