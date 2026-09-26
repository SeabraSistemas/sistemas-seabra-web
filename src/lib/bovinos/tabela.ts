import { t } from '@/lib/bovinos/texto';

/**
 * Uma aba lida da planilha, com as colunas localizadas PELO NOME do
 * cabeçalho. As três planilhas usam o mesmo modelo do AppSheet, mas as
 * colunas mudam de posição (o "ID P" é a coluna CG na Benoni e CF na Bonito
 * e na Santo Antônio) — nenhum código daqui usa letra ou índice fixo.
 */
export interface Tabela {
  aba: string;
  /** Cabeçalho normalizado (ver `normalizarCabecalho`). */
  cabecalho: string[];
  /** Linhas de dados; `linhas[k]` é a linha `k + 2` da planilha. */
  linhas: string[][];
  /** Nomes de cabeçalho que aparecem mais de uma vez — nunca escrever neles. */
  duplicadas: Set<string>;
}

/**
 * Cabeçalho como comparável: sem espaço nas pontas e com qualquer sequência
 * de espaço/quebra de linha virando um espaço só. A planilha real tem
 * "Método " (espaço no fim), "Dias  1° pesagem" (espaço duplo) e cabeçalhos
 * com quebra de linha ("Avós Paternos\nBISAVÓ MATERNO").
 */
export function normalizarCabecalho(h: unknown): string {
  return t(h).replace(/\s+/g, ' ');
}

/** 0 → A, 25 → Z, 26 → AA, 95 → CR. */
export function letraColuna(i: number): string {
  let s = '';
  let n = i + 1;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function montarTabela(aba: string, valores: string[][] | null | undefined): Tabela | null {
  if (!valores || valores.length === 0) return null;
  const cabecalho = (valores[0] ?? []).map(normalizarCabecalho);
  const vistas = new Set<string>();
  const duplicadas = new Set<string>();
  for (const h of cabecalho) {
    if (!h) continue;
    if (vistas.has(h)) duplicadas.add(h);
    vistas.add(h);
  }
  return { aba, cabecalho, linhas: valores.slice(1), duplicadas };
}

/**
 * Índice da coluna pelo nome (ou o primeiro alias que existir). -1 se não
 * houver. Um nome duplicado conta como ausente: ler a "primeira" de duas
 * colunas homônimas já rendeu dado errado em silêncio no FI_FCG.
 */
export function coluna(tab: Tabela, ...nomes: string[]): number {
  for (const nome of nomes) {
    const alvo = normalizarCabecalho(nome);
    if (tab.duplicadas.has(alvo)) continue;
    const i = tab.cabecalho.indexOf(alvo);
    if (i >= 0) return i;
  }
  return -1;
}

/** Célula (aparada) de uma linha de dados; '' se a coluna não existir. */
export function celula(linha: string[] | undefined, i: number): string {
  return i < 0 || !linha ? '' : t(linha[i]);
}
