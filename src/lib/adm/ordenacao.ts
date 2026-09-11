/**
 * ORDENAÇÃO em memória da grade — como módulo puro, pelo mesmo motivo de
 * `facetas.ts`: a exportação precisa ordenar o arquivo do jeito que a tela
 * ordena, e a tela é um Client Component que o servidor não pode importar.
 *
 * A grafia de `?sort=` é a mesma que `validarOrdenacao()` aceita no servidor:
 * '-peso_atual,numero_animal' → [{peso_atual desc}, {numero_animal asc}].
 */

export interface Ordem {
  coluna: string;
  ascendente: boolean;
}

/** Até 3 níveis. Além disso ninguém consegue prever o resultado olhando a tela. */
export const MAX_ORDENS = 3;

export function lerOrdens(bruto: string | null, chavesValidas: ReadonlySet<string>): Ordem[] {
  if (!bruto) return [];
  const ordens: Ordem[] = [];
  for (const parte of bruto.split(',')) {
    const texto = parte.trim();
    if (texto === '') continue;
    const ascendente = !texto.startsWith('-');
    const coluna = ascendente ? texto.replace(/^\+/, '') : texto.slice(1);
    if (!chavesValidas.has(coluna) || ordens.some((o) => o.coluna === coluna)) continue;
    ordens.push({ coluna, ascendente });
    if (ordens.length === MAX_ORDENS) break;
  }
  return ordens;
}

export function escreverOrdens(ordens: Ordem[]): string | null {
  if (ordens.length === 0) return null;
  return ordens.map((o) => (o.ascendente ? o.coluna : `-${o.coluna}`)).join(',');
}

export type ChaveDeOrdem = number | string | boolean | null;

/** Comparador estável de valores mistos. NULO SEMPRE POR ÚLTIMO, nos dois
 *  sentidos — herdado do DataTable do katmandu: inverter a direção não pode
 *  encher a primeira página de linhas vazias. */
export function comparar(a: ChaveDeOrdem, b: ChaveDeOrdem, sinal: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'pt-BR') * sinal;
  if (a < b) return -1 * sinal;
  if (a > b) return 1 * sinal;
  return 0;
}

/** O mínimo que uma coluna precisa ter para ordenar: a chave no dado e, se
 *  quiser, a própria função de chave. `AdmColuna` satisfaz isto por estrutura. */
export interface ColunaOrdenavel<T> {
  chave: string;
  ordenar?: (linha: T) => ChaveDeOrdem;
}

export function chaveDeOrdem<T>(coluna: ColunaOrdenavel<T>, linha: T): ChaveDeOrdem {
  if (coluna.ordenar) return coluna.ordenar(linha);
  const bruto = ((linha ?? {}) as Record<string, unknown>)[coluna.chave];
  if (bruto === null || bruto === undefined) return null;
  if (typeof bruto === 'number' || typeof bruto === 'boolean' || typeof bruto === 'string') return bruto;
  return String(bruto);
}

/**
 * Ordena uma cópia das linhas pelos níveis pedidos. Nível cuja coluna não
 * existe é ignorado; sem nível válido a ordem de entrada é mantida.
 */
export function ordenarLinhas<T>(
  linhas: readonly T[],
  ordens: readonly Ordem[],
  colunas: readonly ColunaOrdenavel<T>[],
): T[] {
  const usadas = ordens
    .map((ordem) => ({ ordem, coluna: colunas.find((c) => c.chave === ordem.coluna) }))
    .filter((x): x is { ordem: Ordem; coluna: ColunaOrdenavel<T> } => x.coluna !== undefined);
  if (usadas.length === 0) return [...linhas];

  return [...linhas].sort((a, b) => {
    for (const { ordem, coluna } of usadas) {
      const r = comparar(chaveDeOrdem(coluna, a), chaveDeOrdem(coluna, b), ordem.ascendente ? 1 : -1);
      if (r !== 0) return r;
    }
    return 0;
  });
}
