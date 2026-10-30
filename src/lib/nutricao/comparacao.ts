import type { ResultadoDieta } from '@/lib/nutricao/dieta';
import { NUTRIENTES_EXIGIDOS, type Exigencia, type NutrienteExigido } from '@/lib/nutricao/tipos';

/**
 * Faixa "verde" (dentro do esperado). A do formulador original é ±0,1 ponto
 * percentual nos nutrientes e ±0,2 kg no consumo de MS: estreita demais para
 * acertar à mão — a tolerância é um parâmetro, decidida pelo produtor.
 */
export type Tolerancia =
  /** ±pct% do valor exigido (vale para nutrientes, consumo e quantidades absolutas). */
  | { modo: 'relativa'; pct: number }
  /** ±pp pontos percentuais nos nutrientes e ±kg no consumo de MS (como o formulador). */
  | { modo: 'absoluta'; pp: number; kg: number };

export const TOLERANCIA_FORMULADOR: Tolerancia = { modo: 'absoluta', pp: 0.1, kg: 0.2 };

export type Status = 'dentro' | 'abaixo' | 'acima' | 'sem-exigencia';

type TipoValor = 'fracao' | 'consumo' | 'absoluto';

/** Status do valor da dieta contra o exigido. `fracao` em fração da MS (0,15 = 15%). */
export function avaliar(dieta: number | null, exigido: number | null, tol: Tolerancia, tipo: TipoValor): Status {
  if (dieta == null || exigido == null) return 'sem-exigencia';
  const diff = dieta - exigido;
  let limite: number;
  if (tol.modo === 'relativa') limite = Math.abs(exigido) * (tol.pct / 100);
  else if (tipo === 'fracao') limite = tol.pp / 100;
  else if (tipo === 'consumo') limite = tol.kg;
  else return 'sem-exigencia'; // quantidades absolutas só têm faixa na tolerância relativa
  // folga de 1e-9 para o limite exato não cair fora por arredondamento de ponto flutuante
  if (diff < -limite - 1e-9) return 'abaixo';
  if (diff > limite + 1e-9) return 'acima';
  return 'dentro';
}

export type LinhaComparacao = {
  chave: 'cms' | NutrienteExigido;
  rotulo: string;
  /** Concentração na MS (fração) — ou kg de MS no consumo. */
  dieta: number | null;
  exigido: number | null;
  /** dieta − exigido (mesma unidade). */
  diferenca: number | null;
  status: Status;
  /** Quantidade diária (kg de NDT; g de PB, Ca, P). */
  dietaAbs: number | null;
  exigidoAbs: number | null;
  diferencaAbs: number | null;
  statusAbs: Status;
};

export const ROTULO_EXIGIDO: Record<NutrienteExigido, string> = { ndt: 'NDT', pb: 'PB', ca: 'Ca', p: 'P' };

export function compararComExigencia(res: ResultadoDieta, exig: Exigencia, tol: Tolerancia): LinhaComparacao[] {
  const linhas: LinhaComparacao[] = [];
  const cmsDieta = res.total.kgMs > 0 ? res.total.kgMs : null;
  const diff = (a: number | null, b: number | null) => (a != null && b != null ? a - b : null);

  linhas.push({
    chave: 'cms',
    rotulo: 'Consumo de MS',
    dieta: cmsDieta,
    exigido: exig.cmsKg,
    diferenca: diff(cmsDieta, exig.cmsKg),
    status: avaliar(cmsDieta, exig.cmsKg, tol, 'consumo'),
    dietaAbs: null,
    exigidoAbs: null,
    diferencaAbs: null,
    statusAbs: 'sem-exigencia',
  });

  for (const n of NUTRIENTES_EXIGIDOS) {
    const frac = res.total.conc[n];
    const kg = res.total.kg[n];
    const dietaAbs = res.total.kgMs > 0 ? (n === 'ndt' ? kg : kg * 1000) : null;
    const e = exig[n];
    linhas.push({
      chave: n,
      rotulo: ROTULO_EXIGIDO[n],
      dieta: frac,
      exigido: e.frac,
      diferenca: diff(frac, e.frac),
      status: avaliar(frac, e.frac, tol, 'fracao'),
      dietaAbs,
      exigidoAbs: e.absoluto,
      diferencaAbs: diff(dietaAbs, e.absoluto),
      statusAbs: avaliar(dietaAbs, e.absoluto, tol, 'absoluto'),
    });
  }
  return linhas;
}
