/**
 * Filtros faceted do /FI_FCG — núcleo genérico do /katmandu
 * (src/lib/katmandu/filters.ts), copiado (não importado, Katmandu está
 * congelado) sem as partes específicas de Destino/Movimentar, que o FI_FCG
 * não tem. Ganha `dentroFaixa`/`dentroPeriodo`, que nas Views do Katmandu
 * viviam inline repetidas em cada tela.
 */

export interface Condicao<T> {
  key: string;
  test: (item: T) => boolean;
}

export function filtrarPor<T>(items: T[], condicoes: Condicao<T>[]): T[] {
  return items.filter((item) => condicoes.every((c) => c.test(item)));
}

export function opcoes(valores: (string | null)[], comparador?: (a: string, b: string) => number): string[] {
  const uniq = Array.from(new Set(valores.filter((v): v is string => v != null)));
  return uniq.sort(comparador);
}

/**
 * Opções de um filtro select, restritas aos itens que passam nos OUTROS
 * filtros ativos (todos exceto `chave`) — escolher um filtro estreita as
 * opções dos demais em vez de sempre listar tudo que já existiu.
 */
export function opcoesExcluindo<T>(
  items: T[],
  condicoes: Condicao<T>[],
  chave: string,
  valor: (item: T) => string | null,
  comparador?: (a: string, b: string) => number,
): string[] {
  const outras = condicoes.filter((c) => c.key !== chave);
  return opcoes(items.filter((item) => outras.every((c) => c.test(item))).map(valor), comparador);
}

/** Mesmo comparador de opcoesExcluindo, mas ordenando "aaaammdd" do mais recente pro mais antigo. */
export function comparadorDataDesc(a: string, b: string): number {
  return Number(b) - Number(a);
}

/**
 * Campo que pode vir vazio (ex: Lote/Local no Katmandu — aqui nenhum campo do
 * FI_FCG usa isto ainda, mas o padrão fica pronto): "" = todos, a sentinela =
 * só quem não tem valor, o resto = igualdade.
 */
export function casaComVazio(valor: string | null, filtro: string, sentinela: string): boolean {
  if (!filtro) return true;
  return filtro === sentinela ? valor == null : valor === filtro;
}

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

/**
 * Filtro de faixa numérica (slider). `bounds` null (sem dado real, ou só um
 * valor distinto) => sempre passa, o controle nem aparece. `faixa` null
 * (usuário não mexeu) => usa `bounds` inteiro, ou seja passa tudo. Um item
 * SEM valor (`valor == null`) sempre passa, mesmo com a faixa estreitada —
 * mesma regra que RebanhoView já usava inline: a faixa nunca esconde "sem
 * dado", só recorta quem tem dado fora do intervalo escolhido.
 */
export function dentroFaixa(valor: number | null, bounds: [number, number] | null, faixa: [number, number] | null): boolean {
  if (!bounds) return true;
  if (valor == null) return true;
  const [lo, hi] = faixa ?? bounds;
  return valor >= lo && valor <= hi;
}

/**
 * Filtro de período (Data inicial/final, dois <input type=date> como no
 * Katmandu). Ambos vazios => passa tudo. Um item SEM data válida é EXCLUÍDO
 * assim que o período está ativo — diferente de `dentroFaixa`: aqui "sem
 * data" não é "sem dado opcional", é um registro que não se pode dizer se
 * está dentro do período, então some da resposta em vez de contar como
 * "dentro" por padrão.
 */
export function dentroPeriodo(dia: number | null, inicio: number | null, fim: number | null): boolean {
  if (inicio == null && fim == null) return true;
  if (dia == null) return false;
  if (inicio != null && dia < inicio) return false;
  if (fim != null && dia > fim) return false;
  return true;
}
