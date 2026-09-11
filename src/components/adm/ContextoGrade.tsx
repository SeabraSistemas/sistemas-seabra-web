'use client';

import { createContext, useContext } from 'react';

/**
 * O que a grade sabe e a exportação precisa saber: quais linhas estão na página
 * visível e quantas os filtros deixaram passar.
 *
 * Vai por contexto, e não por prop, porque quem monta o <ExportMenu> é a página
 * (TabelaGenerica), e a página não vê a paginação em memória da AdmTable —
 * `page`, `size` e `sort` são lidos da URL DENTRO da tabela. Sem isto o menu
 * dizia "Só a página atual · 50" e mandava o servidor buscar as 50 primeiras
 * linhas na ordem DELE, que raramente eram as 50 da tela.
 */
export interface EstadoGrade {
  /** As chaves (`chave(linha)`) das linhas exatamente como estão na página. */
  chavesDaPagina: string[];
  /** Quantas linhas os filtros deixaram — no modo cliente, contadas sobre as carregadas. */
  totalFiltrado: number;
  /** Quantas linhas a página carregou do servidor (o teto do modo cliente). */
  totalCarregado: number;
  filtrando: boolean;
}

export const ContextoGrade = createContext<EstadoGrade | null>(null);

/** null fora de uma AdmTable — o menu cai nos totais que recebeu por prop. */
export function useContextoGrade(): EstadoGrade | null {
  return useContext(ContextoGrade);
}
