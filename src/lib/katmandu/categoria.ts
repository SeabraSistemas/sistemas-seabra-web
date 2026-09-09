import type { Sexo } from './types';

/**
 * Espelha a fórmula da coluna "Categoria" da RebanhoProd (confirmada célula a
 * célula na planilha real): quando a coluna "Atualizar categoria" está vazia
 * (caso comum), a categoria é só idade em dias + sexo, em 4 faixas fixas.
 * `diasMin` é o primeiro dia de cada faixa — é pra lá que "Alterar categoria"
 * empurra a Data de nascimento (hoje − diasMin) quando o usuário quer forçar
 * um animal pra essa faixa.
 */
export type FaixaCategoria = 'bezerro' | 'garrote' | 'boi' | 'touro';

export const FAIXAS_CATEGORIA: {
  valor: FaixaCategoria;
  diasMin: number;
  labelMacho: string;
  labelFemea: string;
  label: string;
}[] = [
  { valor: 'bezerro', diasMin: 0, labelMacho: 'Bezerro', labelFemea: 'Bezerra', label: 'Bezerro / Bezerra (0–365 dias)' },
  { valor: 'garrote', diasMin: 366, labelMacho: 'Garrote', labelFemea: 'Recria', label: 'Garrote / Recria (366–730 dias)' },
  { valor: 'boi', diasMin: 731, labelMacho: 'Boi', labelFemea: 'Novilha', label: 'Boi / Novilha (731–1095 dias)' },
  {
    valor: 'touro',
    diasMin: 1096,
    labelMacho: 'Touro',
    labelFemea: 'Vaca',
    label: 'Touro / Vaca (a partir de 1096 dias)',
  },
];

/** Rótulo que a fórmula da planilha vai produzir pra essa faixa, dado o sexo do animal (padrão macho se sexo vier vazio). */
export function categoriaLabel(faixa: FaixaCategoria, sexo: Sexo): string {
  const config = FAIXAS_CATEGORIA.find((f) => f.valor === faixa);
  if (!config) return '—';
  return sexo === 'femea' ? config.labelFemea : config.labelMacho;
}
