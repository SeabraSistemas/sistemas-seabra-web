import { categoriaPorId, exigenciaDoFormulador } from '@/lib/nutricao/formulador';
import {
  calcularRodrigues,
  consumoMsEstimado,
  exigenciaRodrigues,
  type ConsumoMs,
  type OrdemLactacao,
  type ResultadoRodrigues,
} from '@/lib/nutricao/lactacao';
import { consultarNrc, exigenciaDoNrc, serieNrcPorId, type ConsultaNrc } from '@/lib/nutricao/nrc';
import type { CategoriaFormulador, Exigencia, SerieNrc } from '@/lib/nutricao/tipos';

/** As três exigências lado a lado, a partir do que o produtor digitou. */
export type EntradaAnimal = {
  pesoKg: number | null;
  leiteKg: number | null;
  categoriaId: string;
  serieNrcId: string;
  degrau: 'abaixo' | 'acima';
  ordem: OrdemLactacao;
  gorduraPct: number | null;
  proteinaPct: number | null;
  lactosePct: number | null;
};

export type TresExigencias = {
  /** Fases sem leite (mantença, bodes) usam a equação de mantença no consumo estimado. */
  prenheOuLactacao: boolean;
  categoria: CategoriaFormulador | null;
  formulador: Exigencia | null;
  serie: SerieNrc | null;
  consulta: ConsultaNrc | null;
  nrc: Exigencia | null;
  consumo: ConsumoMs | null;
  rodrigues: ResultadoRodrigues | null;
  rodriguesExig: Exigencia | null;
};

const FASES_SEM_LEITE = new Set(['mantenca', 'bodes']);

export function calcularExigencias(e: EntradaAnimal): TresExigencias {
  const categoria = categoriaPorId(e.categoriaId) ?? null;
  const serie = serieNrcPorId(e.serieNrcId) ?? null;
  const peso = e.pesoKg != null && e.pesoKg > 0 ? e.pesoKg : null;
  const prenheOuLactacao = serie ? !FASES_SEM_LEITE.has(serie.fase) : false;

  const consulta = serie && peso != null ? consultarNrc(serie, peso, e.degrau) : null;
  const consumo = peso != null ? consumoMsEstimado(peso, e.leiteKg ?? 0, prenheOuLactacao) : null;
  const comLeite = (e.leiteKg ?? 0) > 0 && e.gorduraPct != null && e.proteinaPct != null && e.lactosePct != null;
  const rodrigues = comLeite
    ? calcularRodrigues({ ordem: e.ordem, leiteKg: e.leiteKg as number, gorduraPct: e.gorduraPct as number, proteinaPct: e.proteinaPct as number, lactosePct: e.lactosePct as number })
    : null;

  return {
    prenheOuLactacao,
    categoria,
    formulador: categoria ? exigenciaDoFormulador(categoria) : null,
    serie,
    consulta,
    nrc: consulta ? exigenciaDoNrc(consulta) : null,
    consumo,
    rodrigues,
    rodriguesExig: consumo ? exigenciaRodrigues(consumo, rodrigues, e.ordem) : null,
  };
}
