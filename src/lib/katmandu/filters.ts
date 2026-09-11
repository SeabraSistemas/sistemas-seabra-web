import { SEM_LOCAL, SEM_LOCAL_LABEL, SEM_LOTE, SEM_LOTE_LABEL, type Destino } from '@/lib/katmandu/types';

export const DESTINO_LABEL: Record<NonNullable<Destino>, string> = {
  cabeceira: 'Cabeceira',
  meio: 'Meio',
  fundo: 'Fundo',
};

/** Ordem dos botões no app: do melhor lote pro pior. Nunca alfabética. */
export const DESTINO_ORDEM = Object.keys(DESTINO_LABEL) as NonNullable<Destino>[];

/**
 * Chave de ordenação da coluna Destino. Ordenar pelo valor cru daria ordem
 * alfabética (Cabeceira, Fundo, Meio) — sem sentido pra uma escala.
 */
export function destinoOrdinal(d: Destino): number | null {
  return d == null ? null : DESTINO_ORDEM.indexOf(d);
}

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

/**
 * Lote e Local podem vir vazios (animal ainda não alocado). Nesses filtros a
 * sentinela SEM_LOTE/SEM_LOCAL é uma opção de verdade, "Sem lote"/"Sem local":
 * "" = todos, a sentinela = só quem não tem valor, o resto = igualdade.
 */
export function casaComVazio(valor: string | null, filtro: string, sentinela: string): boolean {
  if (!filtro) return true;
  return filtro === sentinela ? valor == null : valor === filtro;
}

/**
 * opcoesExcluindo + a sentinela no fim, quando algum item que passa nos outros
 * filtros não tem valor. Só oferece "Sem X" havendo valor real pra contrastar
 * (mesma regra do Movimentar): sozinha, ela seria igual a "Todos".
 */
export function opcoesComVazio<T>(
  items: T[],
  condicoes: Condicao<T>[],
  chave: string,
  valor: (item: T) => string | null,
  sentinela: string,
): string[] {
  const reais = opcoesExcluindo(items, condicoes, chave, valor);
  const outras = condicoes.filter((c) => c.key !== chave);
  const temVazio = items.some((item) => valor(item) == null && outras.every((c) => c.test(item)));
  return reais.length > 0 && temVazio ? [...reais, sentinela] : reais;
}

export function rotuloLote(v: string): string {
  return v === SEM_LOTE ? SEM_LOTE_LABEL : v;
}

export function rotuloLocal(v: string): string {
  return v === SEM_LOCAL ? SEM_LOCAL_LABEL : v;
}

/**
 * Opções de ORIGEM do Movimentar. Saem do DADO, não do cadastro: um lote
 * removido da aba Lotes que ainda tem animal (caso real: "Bezerro desmama",
 * 95 ativos) sumia do "De" e não havia como esvaziá-lo. Cadastrados primeiro,
 * na ordem da aba; os fora do cadastro depois, em ordem alfabética; a
 * sentinela no fim, mesmo sozinha — senão animal sem lote não teria como sair.
 * O "Para" NÃO usa isto: destino continua só cadastrado, porque gravar nome
 * fora do lookup quebra a referência no AppSheet.
 */
export function opcoesDeOrigem(cadastro: string[], contagem: Record<string, number>, sentinela: string): string[] {
  const cadastrados = cadastro.filter((l) => contagem[l]);
  const foraDoCadastro = Object.keys(contagem)
    .filter((l) => l !== sentinela && !cadastro.includes(l))
    .sort();
  const reais = [...cadastrados, ...foraDoCadastro];
  return contagem[sentinela] ? [...reais, sentinela] : reais;
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
