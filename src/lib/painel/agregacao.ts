/**
 * Agregação numérica genérica pros KPIs dos cards — usada direto nas Views
 * (cada card calcula sua fórmula com `useMemo`, perto do JSX que a mostra,
 * o que facilita auditar contra o número do Looker). Ignora `null` sempre:
 * é a mesma regra de format.ts — um agregado só existe se houver pelo menos
 * um valor real, nunca conta null como 0.
 */

export function media(valores: (number | null)[]): number | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function soma(valores: (number | null)[]): number | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0);
}

export function contar<T>(itens: T[], teste: (item: T) => boolean): number {
  return itens.filter(teste).length;
}

/** numerador/denominador em %, 0-100. null se o denominador for 0 (não faz sentido "0%" nem "—" silencioso vira 0). */
export function percentual(numerador: number, denominador: number): number | null {
  if (denominador === 0) return null;
  return (numerador / denominador) * 100;
}
