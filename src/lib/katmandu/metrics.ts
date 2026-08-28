import { formatKg, formatNumber } from './format';
import type { AnimalRebanho, PesagemRegistro } from './types';

export interface MetricDef {
  id: string;
  label: string;
  value: string;
}

function media(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function soma(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0);
}

const compactKg = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

/** Contagem de animais vivos (sem baixa) por categoria — base dos cards e do donut. */
export function contagemPorCategoria(animais: AnimalRebanho[]): { categoria: string; total: number }[] {
  const vivos = animais.filter((a) => a.baixa == null);
  const porCategoria = new Map<string, number>();
  for (const a of vivos) {
    const cat = a.categoria ?? 'Sem categoria';
    porCategoria.set(cat, (porCategoria.get(cat) ?? 0) + 1);
  }
  return Array.from(porCategoria, ([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total);
}

/**
 * Cards do resumo de Rebanho: total de vivos + um card por categoria
 * realmente presente nos dados — nunca um card fantasma de categoria que o
 * usuário não tem.
 */
export function getRebanhoMetrics(animais: AnimalRebanho[]): MetricDef[] {
  const vivos = animais.filter((a) => a.baixa == null);
  const porCategoria = contagemPorCategoria(animais);
  return [
    { id: 'total-vivos', label: 'Estoque', value: formatNumber(vivos.length) },
    ...porCategoria.map(({ categoria, total }) => ({
      id: `cat-${categoria}`,
      label: categoria,
      value: formatNumber(total),
    })),
  ];
}

/** Cards do resumo de Pesagem — cada média só aparece se existir algum valor real. */
export function getPesagemMetrics(registros: PesagemRegistro[]): MetricDef[] {
  const totalKg = soma(registros.map((r) => r.pesoKg));
  const defs: (MetricDef | null)[] = [
    { id: 'total', label: 'Total', value: formatNumber(registros.length) },
    (() => {
      const v = media(registros.map((r) => r.pesoKg));
      return v == null ? null : { id: 'media-kg', label: 'Média/Kg', value: formatKg(v) };
    })(),
    totalKg == null ? null : { id: 'total-kg', label: 'Total/Kg', value: compactKg.format(totalKg) },
    (() => {
      const v = media(registros.map((r) => r.gmd));
      return v == null ? null : { id: 'media-gmd', label: 'Média/GMD', value: formatNumber(v) };
    })(),
    (() => {
      const v = media(registros.map((r) => r.pdi));
      return v == null ? null : { id: 'media-pdi', label: 'Média/PDI', value: formatNumber(v) };
    })(),
    (() => {
      const v = media(registros.map((r) => r.gpdi));
      return v == null ? null : { id: 'media-gpdi', label: 'Média/GPDI', value: formatNumber(v) };
    })(),
  ];
  return defs.filter((d): d is MetricDef => d != null);
}
