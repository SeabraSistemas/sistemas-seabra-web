import type { Destino } from './types';

export const DESTINO_LABEL: Record<NonNullable<Destino>, string> = {
  melhor: 'Melhor',
  mediano: 'Mediano',
  pior: 'Pior',
};

export const DESTINO_ORDEM = Object.keys(DESTINO_LABEL) as NonNullable<Destino>[];

export function opcoes(valores: (string | null)[]): string[] {
  return Array.from(new Set(valores.filter((v): v is string => v != null))).sort();
}

export interface Condicao<T> {
  key: string;
  test: (item: T) => boolean;
}

export function filtrarPor<T>(items: T[], condicoes: Condicao<T>[]): T[] {
  return items.filter((item) => condicoes.every((c) => c.test(item)));
}

/**
 * Opções de um filtro select, restritas aos itens que passam nos OUTROS
 * filtros ativos (todos exceto `chave`) — assim escolher um filtro estreita
 * as opções dos demais em vez de sempre listar tudo que já existiu.
 */
export function opcoesExcluindo<T>(
  items: T[],
  condicoes: Condicao<T>[],
  chave: string,
  valor: (item: T) => string | null,
): string[] {
  const outras = condicoes.filter((c) => c.key !== chave);
  return opcoes(items.filter((item) => outras.every((c) => c.test(item))).map(valor));
}

/** Mesma lógica de opcoesExcluindo, mas pro enum Destino (ordem fixa, não alfabética). */
export function destinosPresentes<T>(
  items: T[],
  condicoes: Condicao<T>[],
  chave: string,
  destinoDe: (item: T) => Destino,
): NonNullable<Destino>[] {
  const outras = condicoes.filter((c) => c.key !== chave);
  const presentes = new Set(
    items
      .filter((item) => outras.every((c) => c.test(item)))
      .map(destinoDe)
      .filter((d): d is NonNullable<Destino> => d != null),
  );
  return DESTINO_ORDEM.filter((d) => presentes.has(d));
}
