/**
 * API sobre o catálogo de tabelas — o motor do escape hatch `/adm/u/[id]/tabelas/[tabela]`.
 *
 * A regra que organiza este arquivo: **nada que venha da URL vira nome de coluna
 * sem passar por aqui**. `?cols=`, `?sort=` e `?f.<coluna>=` são texto de fora, e
 * o /adm fala com o Postgres pela `service_role`, que ignora RLS — a única coisa
 * entre um query param malformado e um `select` errado é a validação deste módulo.
 * Por isso a checagem é ALLOWLIST (a coluna precisa estar declarada no catálogo),
 * não denylist; a denylist de `colunasBloqueadas` é a segunda tranca, não a primeira.
 *
 * Módulo puro: sem I/O, sem env, sem segredo — de propósito, para que um seletor
 * de colunas no cliente possa importá-lo sem arrastar nada de servidor junto.
 */

import type { ColunaRegistro } from '@/lib/adm/types';
import { CATALOGO, COLUNAS_SEMPRE_BLOQUEADAS, AREAS, type TabelaCatalogo } from '@/lib/adm/tabelas-dados';

export { CATALOGO, COLUNAS_SEMPRE_BLOQUEADAS, AREAS };
export type { TabelaCatalogo };

/** Presets aceitos no lugar de uma lista de colunas em `?cols=`. */
export type PresetColunas = 'essencial' | 'detalhe' | 'tecnica' | 'tudo';

const PRESETS: readonly string[] = ['essencial', 'detalhe', 'tecnica', 'tudo'];

// ─────────────────────────────────────────────────────────────────────────────
// Índice
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A chave da rota. Quase sempre é o nome real da tabela; `descarte` é a exceção
 * (aponta para `manejo` com filtro fixo), e é ela que obriga a existir um nome
 * de rota separado do nome físico.
 */
export function chaveRota(registro: TabelaCatalogo): string {
  return registro.slug ?? registro.nome;
}

const POR_CHAVE: ReadonlyMap<string, TabelaCatalogo> = new Map(
  CATALOGO.map((registro) => [chaveRota(registro), registro]),
);

/** Devolve o registro de uma tabela, ou null. Nunca lança: `[tabela]` vem da URL. */
export function getRegistro(nome: string): TabelaCatalogo | null {
  return POR_CHAVE.get(nome) ?? null;
}

/** Todo o catálogo, na ordem de declaração. */
export function listarRegistros(): readonly TabelaCatalogo[] {
  return CATALOGO;
}

/**
 * O catálogo agrupado para o índice de tabelas. A ordem das áreas é a de `AREAS`
 * (do trabalho diário para o administrativo, não alfabética); uma área declarada
 * numa tabela mas ausente de `AREAS` ainda aparece, no fim — um registro novo
 * nunca some da tela só porque alguém esqueceu de atualizar a constante.
 */
export function registrosPorArea(): { area: string; registros: TabelaCatalogo[] }[] {
  const grupos = new Map<string, TabelaCatalogo[]>();
  for (const registro of CATALOGO) {
    const atual = grupos.get(registro.area);
    if (atual) atual.push(registro);
    else grupos.set(registro.area, [registro]);
  }

  const ordenadas = [
    ...AREAS.filter((area) => grupos.has(area)),
    ...[...grupos.keys()].filter((area) => !AREAS.includes(area)),
  ];
  return ordenadas.map((area) => ({ area, registros: grupos.get(area) ?? [] }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Colunas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma coluna bloqueada nunca é projetável, mesmo que alguém a declare por engano
 * no catálogo. A comparação é em minúsculas porque a denylist protege um NOME de
 * dado sensível ('cpf'), não uma grafia — e o Postgres aceitaria `"CPF"` como
 * outra coluna.
 */
function bloqueada(registro: TabelaCatalogo, chave: string): boolean {
  const alvo = chave.trim().toLowerCase();
  if (COLUNAS_SEMPRE_BLOQUEADAS.some((c) => c.toLowerCase() === alvo)) return true;
  return registro.colunasBloqueadas.some((c) => c.toLowerCase() === alvo);
}

/** As colunas realmente utilizáveis: as declaradas menos as bloqueadas. */
export function colunasPermitidas(registro: TabelaCatalogo): ColunaRegistro[] {
  return registro.colunas.filter((coluna) => !bloqueada(registro, coluna.chave));
}

/** A definição de uma coluna, se ela existir e não estiver bloqueada. */
export function getColuna(registro: TabelaCatalogo, chave: string): ColunaRegistro | null {
  if (bloqueada(registro, chave)) return null;
  return registro.colunas.find((coluna) => coluna.chave === chave) ?? null;
}

/** As colunas de uma família, na ordem do catálogo. */
export function colunasDaFamilia(registro: TabelaCatalogo, familia: ColunaRegistro['familia']): ColunaRegistro[] {
  return colunasPermitidas(registro).filter((coluna) => coluna.familia === familia);
}

/**
 * O preset visível inicial: a família 'essencial', limitada a 8 colunas.
 *
 * O teto não é estético — é o que separa uma grade auditável de uma parede de
 * texto com scroll horizontal. Uma tabela sem nenhuma essencial (não deveria
 * existir; `auditarCatalogo()` acusa) cai para as 6 primeiras permitidas, para
 * que a tela nunca nasça sem coluna nenhuma.
 */
export function colunasVisiveisPadrao(registro: TabelaCatalogo): string[] {
  const essenciais = colunasDaFamilia(registro, 'essencial').slice(0, 8);
  if (essenciais.length > 0) return essenciais.map((coluna) => coluna.chave);
  return colunasPermitidas(registro)
    .slice(0, 6)
    .map((coluna) => coluna.chave);
}

export interface ColunasValidadas {
  /** As colunas seguras, na ordem do catálogo. Nunca vazia. */
  colunas: string[];
  /** O que foi descartado — inexistente, bloqueada ou repetida. Serve para avisar na tela. */
  rejeitadas: string[];
  /** True quando nada do que foi pedido sobreviveu e o preset padrão assumiu. */
  usouPadrao: boolean;
}

/**
 * Filtra uma lista de colunas vinda de fora (`?cols=`) contra o catálogo.
 *
 * ALLOWLIST: só passa o que está declarado neste registro. Um nome inventado, uma
 * coluna de outra tabela, uma tentativa de injeção (`id,cpf`, `*`, `senha`) cai em
 * `rejeitadas` e nunca chega ao `select`. Se nada sobreviver, devolve o preset
 * padrão — a tela mostra dado em vez de um vazio inexplicável, e `usouPadrao`
 * conta ao operador o que aconteceu.
 *
 * A ordem devolvida é a do CATÁLOGO, não a do pedido: mantém o cabeçalho estável
 * entre recargas e faz duas exportações da mesma tabela comparáveis coluna a coluna.
 */
export function validarColunas(registro: TabelaCatalogo, pedidas: readonly string[]): ColunasValidadas {
  const permitidas = colunasPermitidas(registro);
  const indice = new Set(permitidas.map((coluna) => coluna.chave));

  const aceitas = new Set<string>();
  const rejeitadas: string[] = [];
  for (const bruta of pedidas) {
    const chave = typeof bruta === 'string' ? bruta.trim() : '';
    if (chave === '') continue;
    if (!indice.has(chave) || bloqueada(registro, chave) || aceitas.has(chave)) {
      rejeitadas.push(chave);
      continue;
    }
    aceitas.add(chave);
  }

  if (aceitas.size === 0) {
    return { colunas: colunasVisiveisPadrao(registro), rejeitadas, usouPadrao: true };
  }
  return {
    colunas: permitidas.filter((coluna) => aceitas.has(coluna.chave)).map((coluna) => coluna.chave),
    rejeitadas,
    usouPadrao: false,
  };
}

/**
 * Traduz o parâmetro `?cols=` cru para colunas seguras. Aceita `essencial`,
 * `detalhe`, `tecnica`, `tudo` ou uma lista separada por vírgula; ausente ou
 * ilegível devolve o preset padrão.
 */
export function parseColunasParam(
  registro: TabelaCatalogo,
  param: string | string[] | undefined | null,
): ColunasValidadas {
  const bruto = Array.isArray(param) ? param.join(',') : (param ?? '');
  const texto = bruto.trim();
  if (texto === '') return { colunas: colunasVisiveisPadrao(registro), rejeitadas: [], usouPadrao: true };

  if (PRESETS.includes(texto)) {
    const preset = texto as PresetColunas;
    const chaves =
      preset === 'tudo'
        ? colunasPermitidas(registro).map((coluna) => coluna.chave)
        : colunasDaFamilia(registro, preset).map((coluna) => coluna.chave);
    if (chaves.length === 0) return { colunas: colunasVisiveisPadrao(registro), rejeitadas: [], usouPadrao: true };
    return { colunas: chaves, rejeitadas: [], usouPadrao: false };
  }

  return validarColunas(registro, texto.split(','));
}

// ─────────────────────────────────────────────────────────────────────────────
// Escopo, ordenação e facetas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O nome FÍSICO da coluna por onde se filtra o tenant — o que vai no `.eq()`.
 *
 * Ler `registro.colunaTenant` direto como nome de coluna funciona para a maioria
 * e QUEBRA em quatro casos reais: `usuarios`/`propriedades` (o tenant é a própria
 * PK `id`), `pagamentos` (chega pelo `assinatura_id`) e `analise_leite` (a coluna
 * é `id_animal`, e é TEXTO). Devolve null para catálogo global (`categoria_animal`),
 * onde não há filtro de tenant nenhum.
 */
export function colunaFiltroTenant(registro: TabelaCatalogo): string | null {
  if (registro.colunaTenant === 'nenhuma') return null;
  return registro.colunaTenantFisica ?? registro.colunaTenant;
}

/**
 * A coluna de ordenação inicial: a de data, quando existe (mais recente primeiro
 * é sempre o que se quer auditando lançamento). `setores` e `baias` não têm data
 * nenhuma — aí cai na primeira coluna essencial, que existe com certeza.
 */
export function colunaOrdenacaoPadrao(registro: TabelaCatalogo): string | null {
  if (registro.colunaData && getColuna(registro, registro.colunaData)) return registro.colunaData;
  return colunasVisiveisPadrao(registro)[0] ?? null;
}

/** Valida uma coluna de ordenação vinda da URL (`?sort=-peso_atual`). */
export function validarOrdenacao(
  registro: TabelaCatalogo,
  param: string | null | undefined,
): { coluna: string | null; ascendente: boolean } {
  const bruto = (param ?? '').trim();
  const ascendente = !bruto.startsWith('-');
  const chave = ascendente ? bruto : bruto.slice(1);
  if (chave !== '' && getColuna(registro, chave)) return { coluna: chave, ascendente };
  // Sem pedido válido: data mais recente primeiro.
  return { coluna: colunaOrdenacaoPadrao(registro), ascendente: false };
}

/** As colunas que viram chip de filtro facetado. */
export function colunasComFaceta(registro: TabelaCatalogo): ColunaRegistro[] {
  return colunasPermitidas(registro).filter((coluna) => coluna.faceta !== undefined);
}

/**
 * As FKs que precisam de lookup para virar rótulo legível — o caso que decide se
 * a tela do rebanho mostra "Lactante" ou um UUID de 36 caracteres.
 */
export interface ReferenciaResolvivel {
  coluna: ColunaRegistro;
  referencia: NonNullable<ColunaRegistro['referencia']>;
}

export function referenciasDe(registro: TabelaCatalogo): ReferenciaResolvivel[] {
  const saida: ReferenciaResolvivel[] = [];
  for (const coluna of colunasPermitidas(registro)) {
    if (coluna.referencia) saida.push({ coluna, referencia: coluna.referencia });
  }
  return saida;
}

// ─────────────────────────────────────────────────────────────────────────────
// Integridade do catálogo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Confere o catálogo e DEVOLVE os problemas — não lança.
 *
 * Lançar no import derrubaria o /adm inteiro por causa de um rótulo duplicado,
 * exatamente o oposto da regra de degradação do projeto (sem env, nada estoura).
 * Serve para uma rota de diagnóstico ou um teste; em produção, o pior que um
 * problema daqui causa é uma coluna a menos.
 */
export function auditarCatalogo(): string[] {
  const problemas: string[] = [];
  const chaves = new Set<string>();

  for (const registro of CATALOGO) {
    const chave = chaveRota(registro);
    if (chaves.has(chave)) problemas.push(`chave de rota duplicada: ${chave}`);
    chaves.add(chave);

    const vistas = new Set<string>();
    for (const coluna of registro.colunas) {
      if (vistas.has(coluna.chave)) problemas.push(`${chave}: coluna repetida ${coluna.chave}`);
      vistas.add(coluna.chave);
      if (bloqueada(registro, coluna.chave)) {
        problemas.push(`${chave}: coluna ${coluna.chave} declarada E bloqueada — será omitida`);
      }
    }

    for (const obrigatoria of COLUNAS_SEMPRE_BLOQUEADAS) {
      if (!registro.colunasBloqueadas.some((c) => c.toLowerCase() === obrigatoria.toLowerCase())) {
        problemas.push(`${chave}: colunasBloqueadas não inclui ${obrigatoria}`);
      }
    }

    const essenciais = colunasDaFamilia(registro, 'essencial');
    if (essenciais.length === 0) problemas.push(`${chave}: nenhuma coluna essencial`);
    if (essenciais.length > 8) problemas.push(`${chave}: ${essenciais.length} colunas essenciais (máximo 8)`);

    if (registro.colunaData && !vistas.has(registro.colunaData)) {
      problemas.push(`${chave}: colunaData ${registro.colunaData} não está declarada`);
    }
    const tenant = colunaFiltroTenant(registro);
    if (tenant && !vistas.has(tenant)) {
      problemas.push(`${chave}: coluna de tenant ${tenant} não está declarada`);
    }
    if (registro.filtroFixo && !vistas.has(registro.filtroFixo.coluna)) {
      problemas.push(`${chave}: filtroFixo aponta para ${registro.filtroFixo.coluna}, que não está declarada`);
    }
    if (!AREAS.includes(registro.area)) problemas.push(`${chave}: área desconhecida "${registro.area}"`);
  }

  return problemas;
}
