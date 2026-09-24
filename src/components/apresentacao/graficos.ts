/**
 * Tema e escala dos gráficos do deck. Módulo sem 'use client' de propósito:
 * os layouts (servidor) calculam a escala e escolhem o tema; o componente de
 * gráfico (cliente) só desenha.
 */

export interface TemaGrafico {
  serie: string;
  /** Colunas abaixo da referência, quando destacadas. */
  abaixo: string;
  grade: string;
  eixo: string;
  referencia: string;
  fundoDica: string;
  textoDica: string;
  bordaDica: string;
  /** Corpo do texto dos eixos, em px do palco. */
  fonte: number;
}

/**
 * Deck escuro: azul do sistema no preto. Azul × ocre validado no
 * validate_palette da skill dataviz (ΔE 25, contraste ≥ 3:1 no #000 e no
 * #121212). O laranja de "abaixo da meta" é o status "serious" da mesma paleta.
 */
export const TEMA_ESCURO: TemaGrafico = {
  serie: '#3987e5',
  abaixo: '#ec835a',
  grade: '#262626',
  eixo: '#999999',
  referencia: '#f5f5f5',
  fundoDica: '#2a2a2a',
  textoDica: '#f5f5f5',
  bordaDica: '#262626',
  fonte: 22,
};

/** Tela do sistema: clara, como o app. */
export const TEMA_CLARO: TemaGrafico = {
  serie: '#2a78d6',
  abaixo: '#ec835a',
  grade: '#eceef2',
  eixo: '#6b7280',
  referencia: '#374151',
  fundoDica: '#ffffff',
  textoDica: '#111827',
  bordaDica: '#e5e7eb',
  fonte: 17,
};

/**
 * Marcas do eixo de 0 ao topo em passo "redondo" (1, 2, 2,5 ou 5 × 10ⁿ), com
 * 4 a 7 marcas. Sem isso o Recharts escolhe 0 · 3 · 6 · 10 para um topo de 10.
 */
export function ticksRedondos(topo: number): number[] {
  const redondo = (passo: number) => {
    const base = 10 ** Math.floor(Math.log10(passo));
    return [1, 2, 2.5, 5, 10].some((u) => Math.abs(passo - u * base) < 1e-9 * base);
  };
  const partes = [5, 4, 3, 6].find((n) => redondo(topo / n)) ?? 4;
  return Array.from({ length: partes + 1 }, (_, i) => +((i * topo) / partes).toFixed(6));
}

/** Topo do eixo: o próximo número "redondo" acima do maior valor. */
export function dominioRedondo(maximo: number): number {
  const passo = 10 ** Math.floor(Math.log10(maximo));
  for (const u of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    const topo = u * passo;
    if (topo >= maximo) return topo;
  }
  return 10 * passo;
}
