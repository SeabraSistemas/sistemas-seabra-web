/**
 * Os clientes de bovino acompanhados pelo /bovinos. Cada um é uma planilha
 * Google por trás de um app AppSheet, todas do mesmo modelo — o que muda
 * está aqui: abas de parto, fazendas válidas e colunas com fórmula de
 * planilha linha a linha no RebanhoProd.
 */
export type SlugCliente = 'benoni' | 'bonito' | 'santo-antonio';

export interface Cliente {
  slug: SlugCliente;
  nome: string;
  descricao: string;
  /** Variável de ambiente com o id da planilha. */
  envPlanilha: string;
  /** Abas com os nascimentos (a Benoni separa Campina grande em "Parto CG"). */
  abasParto: string[];
  /** Valores aceitos na coluna "Fazenda" de qualquer aba. */
  fazendas: string[];
  /** Valor errado → valor certo, para a correção em massa (ex.: "Bonito" gravado na Santo Antônio). */
  aliasesFazenda: Record<string, string>;
  /**
   * Colunas do RebanhoProd com fórmula de planilha em CADA linha — as que o
   * AppSheet copia da linha de cima ao incluir um animal, e que param de ser
   * copiadas depois de uma linha em branco. Na Benoni a Idade é uma
   * ARRAYFORMULA única na linha 2, então só a Categoria é linha a linha.
   */
  colunasFormula: string[];
  /** Datas de nascimento que sabidamente são "de mentira" (cadastro colado em lote). */
  datasPlaceholder: string[];
}

const FORMULAS_MODELO = ['Dias em engorda', 'Categoria', 'Idade (dias)', 'Idade (meses)', 'Idade (anos)', 'Carimbo'];

export const CLIENTES: Cliente[] = [
  {
    slug: 'benoni',
    nome: 'Benoni',
    descricao: 'Inhumas e Campina grande',
    envPlanilha: 'FI_FCG_SPREADSHEET_ID',
    abasParto: ['Parto', 'Parto CG'],
    fazendas: ['Inhumas', 'Campina grande'],
    aliasesFazenda: {},
    colunasFormula: ['Categoria'],
    datasPlaceholder: [],
  },
  {
    slug: 'bonito',
    nome: 'Bonito',
    descricao: 'Fazenda Bonito',
    envPlanilha: 'BONITO_SPREADSHEET_ID',
    abasParto: ['Parto'],
    fazendas: ['Bonito'],
    aliasesFazenda: {},
    colunasFormula: FORMULAS_MODELO,
    datasPlaceholder: [],
  },
  {
    slug: 'santo-antonio',
    nome: 'Santo Antônio',
    descricao: 'Fazenda Santo Antônio',
    envPlanilha: 'SANTO_ANTONIO_SPREADSHEET_ID',
    abasParto: ['Parto'],
    fazendas: ['Santo Antônio'],
    // O app da Santo foi montado a partir do da Bonito e herdou o valor.
    aliasesFazenda: { Bonito: 'Santo Antônio' },
    colunasFormula: FORMULAS_MODELO,
    datasPlaceholder: ['01/01/2015'],
  },
];

export function clientePorSlug(slug: string): Cliente | null {
  return CLIENTES.find((c) => c.slug === slug) ?? null;
}

/** Id da planilha do cliente, ou null se a variável de ambiente não estiver configurada. */
export function planilhaDe(c: Cliente): string | null {
  const id = process.env[c.envPlanilha];
  return id && id.trim() ? id.trim() : null;
}
