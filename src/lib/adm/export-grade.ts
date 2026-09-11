/**
 * EXPORTAÇÃO DA GRADE — as decisões puras que fazem o arquivo bater com a tela.
 *
 * A grade filtra, ordena e pagina EM MEMÓRIA (modo cliente), sobre as linhas
 * que a página carregou, com rótulo de FK resolvido e texto sem acento. A rota
 * de exportação, para entregar o mesmo conjunto, precisa:
 *
 *   1. PROJETAR além das colunas pedidas: as colunas das facetas ativas e das
 *      ordenações — senão não há valor para filtrar nem para ordenar.
 *   2. PRÉ-FILTRAR no servidor só o que é SEGURO e SUPERCONJUNTO: a data, com
 *      um dia de folga para cada lado (a grade compara em dia civil de São
 *      Paulo; o banco em UTC). Nunca o enum de FK (a grade compara o rótulo, o
 *      banco tem o uuid) nem o texto (o banco não ignora acento).
 *   3. FILTRAR em memória com `filtrarLinhas` — a MESMA função da grade.
 *   4. Para "só a página atual", buscar exatamente as CHAVES que a grade
 *      mostra, na ordem em que mostra — e não "as primeiras N na ordem do banco".
 *
 * Tudo aqui é entrada → saída, testável sem banco.
 */

import type { FacetaDef, Filtros } from '@/lib/adm/facetas';
import type { Ordem } from '@/lib/adm/ordenacao';
import type { TabelaCatalogo } from '@/lib/adm/tabelas';
import type { FiltroTabela, OpcoesTabela } from '@/lib/adm/queries';

/** Teto de chaves numa exportação "só a página atual" — a maior página da grade. */
export const MAX_IDS_PAGINA = 250;

/**
 * As colunas a buscar: as pedidas para o arquivo, mais as que os filtros ativos
 * e a ordenação precisam ler. A chave entra sempre (é o cursor da paginação).
 * Só chaves do catálogo — o chamador valida antes.
 */
export function projecaoParaExport(
  chave: string,
  pedidas: readonly string[],
  filtros: Filtros,
  ordens: readonly Ordem[],
): string[] {
  const conjunto = new Set<string>([chave, ...pedidas, ...Object.keys(filtros), ...ordens.map((o) => o.coluna)]);
  return [...conjunto];
}

const UM_DIA_MS = 86_400_000;

function deslocarDia(iso: string, dias: number): string {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms + dias * UM_DIA_MS).toISOString().slice(0, 10);
}

/**
 * O pré-filtro de servidor: só datas, e só como SUPERCONJUNTO (um dia de folga
 * de cada lado). O filtro exato é o da memória, depois — isto existe para a
 * varredura de `controle_leiteiro` não ler 22 mil linhas quando a tela pede 30
 * dias.
 */
export function preFiltroServidor<T>(
  registro: TabelaCatalogo,
  facetas: readonly FacetaDef<T>[],
  filtros: Filtros,
): Pick<OpcoesTabela, 'filtros' | 'periodo'> {
  const filtrosServidor: FiltroTabela[] = [];
  let periodo: OpcoesTabela['periodo'];

  for (const faceta of facetas) {
    const filtro = filtros[faceta.chave];
    if (!filtro || filtro.tipo !== 'data') continue;
    const de = filtro.de ? deslocarDia(filtro.de, -1) : null;
    const ate = filtro.ate ? deslocarDia(filtro.ate, 1) : null;
    if (!de && !ate) continue;

    if (faceta.chave === registro.colunaData) {
      periodo = { de, ate };
      continue;
    }
    if (de) filtrosServidor.push({ coluna: faceta.chave, op: 'gte', valor: de });
    if (ate) filtrosServidor.push({ coluna: faceta.chave, op: 'lte', valor: ate });
  }

  return { filtros: filtrosServidor, periodo };
}

/** `?ids=1,2,3` → chaves únicas, sem vazio, até o teto. Texto de fora: nada lança. */
export function lerIds(bruto: string | null): string[] {
  if (!bruto) return [];
  const vistos = new Set<string>();
  for (const parte of bruto.split(',')) {
    const texto = parte.trim();
    if (texto === '') continue;
    vistos.add(texto);
    if (vistos.size >= MAX_IDS_PAGINA) break;
  }
  return [...vistos];
}

/**
 * As linhas na ordem das chaves pedidas — a ordem da TELA, que o banco não
 * conhece. Chave sem linha (apagada entre o carregamento e o clique) some.
 */
export function naOrdemDosIds<T extends Record<string, unknown>>(
  linhas: readonly T[],
  chave: string,
  ids: readonly string[],
): T[] {
  const porChave = new Map<string, T>();
  for (const linha of linhas) {
    const k = linha[chave];
    if (k != null) porChave.set(String(k), linha);
  }
  return ids.map((id) => porChave.get(id)).filter((l): l is T => l !== undefined);
}
