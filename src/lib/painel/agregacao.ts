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

/**
 * Contagem por categoria — a base de todo Donut/BarrasHorizontais do
 * FI_FCG (partida, diagnóstico, sexo, método...). Único lugar que decide
 * "sem valor não vira fatia": um item com `campo(item)` vazio/null é
 * SEMPRE descartado da contagem, nunca aparece como categoria "" ou
 * "null" no gráfico. Existia como função idêntica duplicada em 3 Views
 * (Toque/Rebanho/Partos) — consolidado aqui pra a regra valer em todo
 * gráfico novo por construção, não por cada View lembrar de repetir o
 * `if (!v) continue`.
 */
export function contagemPor<T>(itens: T[], campo: (item: T) => string | null): { rotulo: string; valor: number }[] {
  const mapa = new Map<string, number>();
  for (const item of itens) {
    const v = campo(item);
    if (!v) continue;
    mapa.set(v, (mapa.get(v) ?? 0) + 1);
  }
  return Array.from(mapa, ([rotulo, valor]) => ({ rotulo, valor }));
}
