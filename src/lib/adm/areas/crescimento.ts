import 'server-only';

import { VIEWS_FASE_2, type LinhaCrescimento } from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * ÁREA CRESCIMENTO — a leitura da view `adm.propriedade_crescimento` e as regras
 * de negócio que a aba e o dossiê compartilham.
 *
 * NENHUM NOME DE VIEW É DIGITADO AQUI. `VIEWS_FASE_2.crescimento` vem do
 * contrato (src/lib/adm/areas/contrato.ts), que é o mesmo arquivo que o SQL
 * implementa e que `adm_05_verificacao.sql` confere. Foi exatamente a divergência
 * entre o nome escrito no SQL e o nome escrito no TS que, na Fase 1, deixou dez
 * telas compilando, passando no lint e abrindo vazias.
 *
 * A PROJEÇÃO TAMBÉM É CONFERIDA EM COMPILAÇÃO: `PROJECAO` é um objeto declarado
 * como `satisfies Record<keyof LinhaCrescimento, true>`, então esquecer uma
 * coluna do contrato — ou inventar uma que ele não tem — é erro de `tsc`, não uma
 * coluna que chega `undefined` e vira um card com traço.
 *
 * Somente leitura (decisão D3): este módulo só faz SELECT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// O que a aba abre por baixo dos cards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A tabela do catálogo que a aba mostra na <TabelaGenerica>. É a chave de rota
 * de `src/lib/adm/tabelas-dados.ts`, não um nome solto: a aba curada é um preset
 * bonito sobre o mesmo motor do escape hatch, e as colunas visíveis default são
 * a família 'essencial' declarada lá — uma fonte só para as duas telas.
 */
export const TABELA_CRESCIMENTO = 'pesagem';

/** A área do catálogo, para os atalhos "outras tabelas de crescimento" (engorda). */
export const AREA_CATALOGO_CRESCIMENTO = 'Crescimento';

/** Quantos animais a lista de ação mostra. O contrato já corta em 20 no SQL; a
 *  constante existe para a tela dizer o número certo sem contar o array. */
export const PIORES_GMD_LIMITE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Projeção — conferida contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

const PROJECAO = {
  propriedade_id: true,
  pesagens_12m: true,
  animais_pesados_12m: true,
  gmd_medio: true,
  peso_medio_desmame: true,
  abaixo_da_meta: true,
  peso_ideal_desmame: true,
  idade_desmame: true,
  peso_ideal_entrada_reproducao: true,
  nuvem_peso_idade: true,
  piores_gmd: true,
} satisfies Record<keyof LinhaCrescimento, true>;

/** Nunca `select('*')`: a projeção explícita é o que impede uma coluna nova da
 *  view de entrar no payload RSC sem ninguém ter decidido que ela pode. */
const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estes ajudantes são gêmeos dos de `src/lib/adm/queries.ts`, e a duplicação é
 * deliberada: lá eles são privados do módulo (que tem 54 KB e não é desta área),
 * e importar o arquivo inteiro para usar `numero()` traria junto a lista mestra,
 * a carteira e o escape hatch. Se o painel acabar com oito áreas repetindo isto,
 * o passo certo é extrair um `areas/leitura.ts` — não abrir exceção agora.
 */
type Linha = Record<string, unknown>;

type ErroPostgrest = { message: string; code?: string };

type Consulta = {
  eq(coluna: string, valor: unknown): Consulta;
  limit(quantidade: number): Consulta;
} & PromiseLike<{ data: unknown[] | null; error: ErroPostgrest | null }>;

/** PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 *  42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma:
 *  o banco não foi preparado. Isso é 'sem-config', não 'erro' — e a diferença
 *  importa, porque um cliente com a aba vazia por falta de migration parece um
 *  cliente que nunca pesou um animal. */
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
  // `numeric` do Postgres chega como STRING quando a precisão não cabe em
  // double. Ignorar isso transformaria GMD médio em null sem aviso nenhum.
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

/** Coluna jsonb que veio como array de objetos; qualquer outra coisa é vazio. */
function arranjo(v: unknown): Linha[] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is Linha => typeof item === 'object' && item !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Propriedade sem uma linha na view — recém-criada, ou que nunca pesou um animal.
 * Isso é VAZIO, não quebrado: devolver zeros deixa a aba abrir e contar a
 * história certa ("este criador nunca usou o módulo de pesagem"), que é
 * informação de adoção e de venda, não falha de tela.
 */
export function crescimentoVazio(propriedadeId = 0): LinhaCrescimento {
  return {
    propriedade_id: propriedadeId,
    pesagens_12m: 0,
    animais_pesados_12m: 0,
    gmd_medio: null,
    peso_medio_desmame: null,
    abaixo_da_meta: 0,
    peso_ideal_desmame: null,
    idade_desmame: null,
    peso_ideal_entrada_reproducao: null,
    nuvem_peso_idade: null,
    piores_gmd: null,
  };
}

export async function getCrescimento(propriedadeId: number): Promise<Resultado<LinhaCrescimento>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FASE_2.crescimento;

  // UMA leitura, não quatro: a nuvem e a lista dos piores GMD chegam como colunas
  // jsonb da própria linha, no mesmo padrão de `adm.propriedade_visao_geral`. É a
  // decisão que evita o clássico "um card certo e um gráfico de outro recorte":
  // cards, nuvem e ranking saem do MESMO SELECT, na mesma janela de tempo.
  const res = await umaLinha(
    (supa.from(view).select(SELECT) as unknown as Consulta).eq('propriedade_id', propriedadeId),
    view,
  );
  if (!res.ok) return res;

  const l = res.dados;
  if (!l) return ok(crescimentoVazio(propriedadeId));

  return ok({
    propriedade_id: inteiro(l.propriedade_id) || propriedadeId,
    pesagens_12m: inteiro(l.pesagens_12m),
    animais_pesados_12m: inteiro(l.animais_pesados_12m),
    // Média e taxa mantêm null (contrato): "0 kg/dia de ganho" é um rebanho
    // parando de crescer, "—" é um rebanho que ninguém pesou duas vezes. Trocar
    // um pelo outro faz o consultor cobrar a coisa errada.
    gmd_medio: numero(l.gmd_medio),
    peso_medio_desmame: numero(l.peso_medio_desmame),
    abaixo_da_meta: inteiro(l.abaixo_da_meta),
    peso_ideal_desmame: numero(l.peso_ideal_desmame),
    idade_desmame: numero(l.idade_desmame),
    peso_ideal_entrada_reproducao: numero(l.peso_ideal_entrada_reproducao),
    nuvem_peso_idade: mapearNuvem(arranjo(l.nuvem_peso_idade)),
    piores_gmd: mapearPiores(arranjo(l.piores_gmd)),
  });
}

function mapearNuvem(linhas: Linha[]): LinhaCrescimento['nuvem_peso_idade'] {
  const pontos = linhas
    .map((p) => ({
      idade_dias: numero(p.idade_dias),
      peso_kg: numero(p.peso_kg),
      sexo: texto(p.sexo),
    }))
    // Ponto sem idade ou sem peso não é ponto: no gráfico ele viraria um animal
    // ancorado no (0,0), puxando o domínio dos dois eixos.
    .filter((p): p is { idade_dias: number; peso_kg: number; sexo: string | null } =>
      p.idade_dias !== null && p.peso_kg !== null,
    );
  return pontos.length > 0 ? pontos : null;
}

function mapearPiores(linhas: Linha[]): LinhaCrescimento['piores_gmd'] {
  const itens = linhas
    .map((p) => ({
      numero_animal: texto(p.numero_animal) ?? '—',
      nome_animal: texto(p.nome_animal),
      gmd: numero(p.gmd),
    }))
    .filter((p): p is { numero_animal: string; nome_animal: string | null; gmd: number } => p.gmd !== null);
  return itens.length > 0 ? itens : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de várias propriedades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Junta N propriedades numa linha só — o caso do técnico e do admin, que
 * alcançam várias fazendas.
 *
 * A REGRA, a mesma de `consolidarVisoes()` em metricas.ts:
 *
 *   contagem      soma. São eventos, e eventos somam.
 *   média         VIRA NULL. Média de médias sem peso é um número inventado que
 *                 parece exato; a tela mostra "—" e manda escolher uma fazenda.
 *   nuvem         CONCATENA. Aqui não há aproximação nenhuma: cada ponto é um
 *                 animal individual, e a união de dois rebanhos é exatamente o
 *                 conjunto dos dois.
 *   piores GMD    concatena, reordena pelo pior e corta em 20 — também exato,
 *                 pelo mesmo motivo.
 *   parâmetro de meta   só sobrevive se TODAS as fazendas declararem o MESMO
 *                 valor. Peso ideal ao desmame é decisão de manejo de cada
 *                 propriedade; desenhar a banda de uma fazenda por cima dos
 *                 animais da outra acusaria de atrasado quem está na meta dela.
 */
export function consolidarCrescimento(linhas: LinhaCrescimento[]): LinhaCrescimento {
  if (linhas.length === 1) return linhas[0];
  if (linhas.length === 0) return crescimentoVazio();

  const soma = (pegar: (l: LinhaCrescimento) => number) => linhas.reduce((acc, l) => acc + pegar(l), 0);

  const nuvem = linhas.flatMap((l) => l.nuvem_peso_idade ?? []);
  const piores = linhas
    .flatMap((l) => l.piores_gmd ?? [])
    .sort((a, b) => a.gmd - b.gmd)
    .slice(0, PIORES_GMD_LIMITE);

  return {
    // 0 = consolidado. Não é um id de propriedade e nada deve tratá-lo como um:
    // a tela que precisa de uma propriedade específica usa o escopo, não isto.
    propriedade_id: 0,
    pesagens_12m: soma((l) => l.pesagens_12m),
    animais_pesados_12m: soma((l) => l.animais_pesados_12m),
    gmd_medio: null,
    peso_medio_desmame: null,
    abaixo_da_meta: soma((l) => l.abaixo_da_meta),
    peso_ideal_desmame: mesmoValor(linhas.map((l) => l.peso_ideal_desmame)),
    idade_desmame: mesmoValor(linhas.map((l) => l.idade_desmame)),
    peso_ideal_entrada_reproducao: mesmoValor(linhas.map((l) => l.peso_ideal_entrada_reproducao)),
    nuvem_peso_idade: nuvem.length > 0 ? nuvem : null,
    piores_gmd: piores.length > 0 ? piores : null,
  };
}

/** O valor quando todas as propriedades concordam; null quando divergem ou
 *  quando alguma não declarou. Concordância parcial é divergência: a fazenda que
 *  deixou o parâmetro em branco não aceitou tacitamente o da vizinha. */
function mesmoValor(valores: (number | null)[]): number | null {
  const primeiro = valores[0];
  if (primeiro == null) return null;
  return valores.every((v) => v === primeiro) ? primeiro : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagnóstico — as frases que a aba e o dossiê contam
// ─────────────────────────────────────────────────────────────────────────────

/** Há banda de meta para desenhar? Sem nenhum dos três parâmetros a nuvem vira
 *  "peso cresce com idade", e essa não é uma conclusão de consultoria. */
export function temBandaDeMeta(l: LinhaCrescimento): boolean {
  return l.peso_ideal_desmame != null || l.idade_desmame != null || l.peso_ideal_entrada_reproducao != null;
}

export interface ResumoNuvem {
  /** Animais na nuvem (um ponto por animal). */
  total: number;
  /**
   * Passaram da idade de desmame declarada E ainda não chegaram ao peso ideal
   * de desmame. É o cruzamento das duas metas — nem idade nem peso sozinhos
   * apontam atraso — e é a conta que sustenta a conversa com o cliente.
   */
  atrasados: number | null;
  /** Quantos entraram na nuvem sem sexo cadastrado: qualidade do cadastro, à vista. */
  semSexo: number;
}

export function resumoDaNuvem(l: LinhaCrescimento): ResumoNuvem {
  const pontos = l.nuvem_peso_idade ?? [];
  const idade = l.idade_desmame;
  const peso = l.peso_ideal_desmame;

  // null, e não 0: sem os dois parâmetros a conta não pode ser feita, e "0
  // animais atrasados" seria uma boa notícia inventada.
  const atrasados =
    idade != null && peso != null
      ? pontos.filter((p) => p.idade_dias >= idade && p.peso_kg < peso).length
      : null;

  return {
    total: pontos.length,
    atrasados,
    semSexo: pontos.filter((p) => p.sexo == null || p.sexo.trim() === '').length,
  };
}
