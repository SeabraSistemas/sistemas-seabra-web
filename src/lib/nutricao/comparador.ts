import { calculavel } from '@/lib/nutricao/alimentos';
import type { Alimento } from '@/lib/nutricao/tipos';

/**
 * Comparador de insumos: preço do kg de matéria seca e do kg de cada nutriente.
 *   R$/kg MS = R$/kg MN ÷ %MS        R$/kg nutriente = R$/kg MS ÷ fração do nutriente na MS
 */
export const NUTRIENTES_COMPARADOR = ['pb', 'ndt', 'ca', 'p'] as const;
export type NutrienteComparador = (typeof NUTRIENTES_COMPARADOR)[number];

export type CustoInsumo = {
  alimento: Alimento;
  precoKgMn: number | null;
  /** null se faltar preço ou matéria seca. */
  porKgMs: number | null;
  /** null se faltar o preço ou o nutriente for zero/ausente. */
  porKgNutriente: Record<NutrienteComparador, number | null>;
};

export function custoDoInsumo(alimento: Alimento, precoKgMn: number | null = alimento.preco): CustoInsumo {
  const porKgMs = precoKgMn != null && calculavel(alimento) ? precoKgMn / (alimento.ms as number) : null;
  const porKgNutriente = Object.fromEntries(
    NUTRIENTES_COMPARADOR.map((n) => {
      const frac = alimento[n];
      return [n, porKgMs != null && frac != null && frac > 0 ? porKgMs / frac : null];
    }),
  ) as Record<NutrienteComparador, number | null>;
  return { alimento, precoKgMn, porKgMs, porKgNutriente };
}

/** Qual dos dois é mais barato em cada coluna ('a' | 'b' | 'empate' | null se faltar dado). */
export function maisBarato(a: number | null, b: number | null): 'a' | 'b' | 'empate' | null {
  if (a == null || b == null) return null;
  if (Math.abs(a - b) < 1e-12) return 'empate';
  return a < b ? 'a' : 'b';
}
