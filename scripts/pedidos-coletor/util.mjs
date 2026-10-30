/**
 * Número de uma tela da AliExpress, em português ("4.636,37", "334,94") ou inglês ("4,636.37", "334.94").
 * Decide pelo SEPARADOR FINAL: vírgula + 1-2 dígitos = português; ponto + 1-2 dígitos = inglês;
 * qualquer outra coisa ("4.636") é inteiro com separador de milhar.
 */
export function numeroBR(texto) {
  const t = String(texto ?? '').trim();
  if (!t) return null;
  let n;
  if (/,\d{1,2}$/.test(t)) n = Number(t.replace(/\./g, '').replace(',', '.'));
  else if (/\.\d{1,2}$/.test(t)) n = Number(t.replace(/,/g, ''));
  else n = Number(t.replace(/[.,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** 4636.37 -> "R$4.636,37" (sempre em português, qualquer que seja o idioma da tela). */
export const reaisTexto = (n) => (n == null ? null : `R$${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

/** "R$4.636,37" (ou "R$ 4,636.37") -> 4636.37 */
export const reaisParaNumero = (texto) => numeroBR(/R\$\s?([\d.,]+)/.exec(texto ?? '')?.[1]);
