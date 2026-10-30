/** Formatação pt-BR dos números do laboratório. */

export function numero(n: number | null | undefined, casas = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Fração → porcentagem (0,1621 → "16,21%"). */
export function pct(frac: number | null | undefined, casas = 1): string {
  if (frac == null || !Number.isFinite(frac)) return '—';
  return `${numero(frac * 100, casas)}%`;
}

export function reais(n: number | null | undefined, casas = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `R$ ${numero(n, casas)}`;
}

/** Diferença com sinal verdadeiro ("−1,2" / "+0,4"). */
export function comSinal(n: number | null | undefined, casas = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const abs = numero(Math.abs(n), casas);
  if (Number(abs.replace(',', '.')) === 0) return abs;
  return `${n < 0 ? '−' : '+'}${abs}`;
}

/** Texto digitado em pt-BR → número ("2,77" e "2.77"); vazio ou lixo → null. */
export function lerNumero(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '').replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

/** Número → texto de campo, sem zeros à direita e sem separador de milhar ("2,5"). */
export function paraCampo(n: number | null | undefined, casas = 4): string {
  if (n == null || !Number.isFinite(n)) return '';
  const arred = Number(n.toFixed(casas));
  return String(arred).replace('.', ',');
}
