import { CATEGORIAS_FORMULADOR } from '@/data/nutricao/exigencias-formulador';
import type { CategoriaFormulador, Exigencia } from '@/lib/nutricao/tipos';

export function categoriasFormulador(): CategoriaFormulador[] {
  return CATEGORIAS_FORMULADOR;
}

export function categoriaPorId(id: string): CategoriaFormulador | undefined {
  return CATEGORIAS_FORMULADOR.find((c) => c.id === id);
}

/**
 * Exigência da tabela fixa do formulador: concentração na MS e consumo fixos
 * por categoria. O absoluto é DERIVADO (concentração × consumo fixo), só para
 * poder comparar na mesma unidade das outras fontes.
 */
export function exigenciaDoFormulador(c: CategoriaFormulador): Exigencia {
  const absoluto = (frac: number, fator: number) => frac * c.cmsKg * fator;
  return {
    fonte: 'formulador',
    rotulo: `Formulador · ${c.nome}`,
    cmsKg: c.cmsKg,
    ndt: { frac: c.ndt, absoluto: absoluto(c.ndt, 1) },
    pb: { frac: c.pb, absoluto: absoluto(c.pb, 1000) },
    ca: { frac: c.ca, absoluto: absoluto(c.ca, 1000) },
    p: { frac: c.p, absoluto: absoluto(c.p, 1000) },
    avisos: ['Tabela fixa por categoria: não muda com o peso nem com o leite.'],
  };
}
