/**
 * O DIALETO DA URL do /adm — a gramática que a tela, os filtros e a exportação
 * falam entre si.
 *
 * POR QUE ESTE MÓDULO EXISTE E NÃO É PARTE DO AdmFilters: o dialeto nasceu lá,
 * mas o servidor também precisa dele — a rota de exportação lê a MESMA query
 * string da tela para que o arquivo baixado seja exatamente o que está na grade.
 * E um módulo `'use client'` não pode ser importado por código de servidor: os
 * exports viram referências de cliente, então `PREFIXO_FILTRO` chegaria como um
 * objeto opaco em vez da string `'f.'`, e o parser silenciosamente não casaria
 * nada. Duplicar a constante nos dois lados resolveria hoje e divergiria na
 * primeira vez que alguém mudasse um dos dois.
 *
 * Este arquivo não importa nada e não tem diretiva: serve aos dois mundos.
 *
 * A GRAMÁTICA:
 *
 *   ?f.papel=produtor,tecnico            enum multi-seleção (OU dentro da faceta)
 *   ?f.peso=40..80                       intervalo numérico, aberto dos dois lados
 *   ?f.nascimento=30d                    período relativo, reavaliado a cada visita
 *   ?f.nascimento=2024-01-01..2025-12-31 período absoluto
 *   ?f.ativo=sim                         booleano tri-state (ausente = todos)
 *   ?f.nome=boa vista                    texto contém, sem acento e sem caixa
 *   ?sort=-peso_atual                    ordenação (o '-' é descendente)
 *   ?cols=essencial | a,b,c              projeção
 *   ?page=2&size=50&cursor=<opaco>       paginação
 *   ?prop=12                             propriedade em foco
 */

/** Prefixo das chaves de faceta. Isola o filtro de `page`, `sort`, `cols`, `prop`. */
export const PREFIXO_FILTRO = 'f.';

/**
 * Sentinela para "esta linha não tem valor nesta coluna". `numero_criador` vazio
 * é informação de negócio (criador sem registro na associação), não ausência de
 * dado — e o Felipe precisa conseguir filtrar exatamente por esse caso.
 */
export const SEM_VALOR = '(vazio)';

/** Separador de valores dentro de uma faceta de enum. */
export const SEPARADOR_VALORES = ',';

/** Separador de extremos num intervalo (numérico ou de data). */
export const SEPARADOR_INTERVALO = '..';

/** Os períodos relativos aceitos em faceta de data. */
export const PERIODOS_RELATIVOS = ['7d', '30d', '90d', '12m'] as const;
export type PeriodoRelativo = (typeof PERIODOS_RELATIVOS)[number];

export function ehPeriodoRelativo(valor: string): valor is PeriodoRelativo {
  return (PERIODOS_RELATIVOS as readonly string[]).includes(valor);
}

/**
 * Converte um período relativo na data de início correspondente.
 * Recebe `agora` por parâmetro para ser determinístico e testável — e para que
 * servidor e cliente cheguem ao mesmo corte na mesma renderização.
 */
export function inicioDoPeriodo(periodo: PeriodoRelativo, agora: Date): Date {
  const d = new Date(agora.getTime());
  switch (periodo) {
    case '7d':
      d.setDate(d.getDate() - 7);
      break;
    case '30d':
      d.setDate(d.getDate() - 30);
      break;
    case '90d':
      d.setDate(d.getDate() - 90);
      break;
    case '12m':
      d.setMonth(d.getMonth() - 12);
      break;
  }
  return d;
}

/** Valores aceitos num tri-state. Ausência da chave significa "todos". */
export const BOOLEANO_SIM = 'sim';
export const BOOLEANO_NAO = 'nao';
