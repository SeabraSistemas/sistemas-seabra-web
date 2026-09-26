/**
 * Compara fórmulas de planilha de linhas diferentes. "=IF(H2=\"\";...)" na
 * linha 2 e "=IF(H7=\"\";...)" na linha 7 são a MESMA fórmula copiada — a
 * referência relativa à própria linha vira "#". Referências com "$" (fixas)
 * e texto entre aspas ficam como estão.
 */
export function normalizarFormula(f: string, linhaPropria: number): string {
  const partes = String(f ?? '').trim().split('"');
  return partes
    .map((trecho, i) =>
      i % 2 === 1
        ? trecho
        : trecho.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (m, c1: string, col: string, c2: string, num: string) =>
            !c2 && Number(num) === linhaPropria ? `${c1}${col}#` : m,
          ),
    )
    .join('"');
}

export function ehFormula(v: string | undefined | null): boolean {
  return String(v ?? '').trim().startsWith('=');
}
