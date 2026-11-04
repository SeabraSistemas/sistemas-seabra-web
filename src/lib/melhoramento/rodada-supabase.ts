/**
 * A `PortaBanco` das rodadas feita sobre o cliente do supabase-js — o que o
 * script scripts/melhoramento/rodar.ts usa com a service_role.
 *
 * Recebe o cliente PRONTO (o script cria, com `db: { schema: 'adm' }`) e usa
 * só a superfície mínima abaixo, o que deixa o teste passar um cliente falso
 * em memória. Mesmas travas da leitura do /adm (src/lib/adm/areas/leitura.ts):
 * página de 1.000 linhas, ordem total, e teto que vira ERRO em vez de lista
 * truncada.
 */

import type { FiltroLeitura, PortaBanco } from '@/lib/melhoramento/rodada';
import type { Linha } from '@/lib/melhoramento/traducao';

type Resposta = { data: unknown[] | null; error: { message: string; code?: string } | null };

/** O pedaço do query builder do supabase-js que a porta usa. */
export interface ConsultaMinima extends PromiseLike<Resposta> {
  eq(coluna: string, valor: unknown): ConsultaMinima;
  in(coluna: string, valores: readonly unknown[]): ConsultaMinima;
  order(coluna: string, opcoes?: { ascending?: boolean }): ConsultaMinima;
  range(de: number, ate: number): ConsultaMinima;
  select(colunas?: string): ConsultaMinima;
}

export interface ClienteMinimo {
  from(view: string): {
    select(colunas: string): ConsultaMinima;
    insert(linhas: readonly Linha[]): ConsultaMinima;
    update(valores: Linha): ConsultaMinima;
  };
}

const PAGINA = 1000;
const TETO_PAGINAS = 200; // 200 mil linhas: muito acima de qualquer fazenda

function aplicar(q: ConsultaMinima, filtros: FiltroLeitura): ConsultaMinima {
  let s = q;
  for (const [coluna, valor] of Object.entries(filtros)) {
    s = Array.isArray(valor) ? s.in(coluna, valor) : s.eq(coluna, valor);
  }
  return s;
}

function falha(onde: string, e: { message: string; code?: string }): Error {
  return new Error(`${onde}: ${e.code ? `${e.code} ` : ''}${e.message}`);
}

export function portaSupabase(cliente: ClienteMinimo): PortaBanco {
  return {
    async ler(view, select, filtros, ordem) {
      const saida: Linha[] = [];
      for (let p = 0; p < TETO_PAGINAS; p++) {
        let q = aplicar(cliente.from(view).select(select), filtros);
        for (const c of ordem) q = q.order(c, { ascending: true });
        const { data, error } = await q.range(p * PAGINA, p * PAGINA + PAGINA - 1);
        if (error) throw falha(`ler adm.${view}`, error);
        const linhas = (data ?? []).filter((x): x is Linha => typeof x === 'object' && x !== null);
        saida.push(...linhas);
        if (linhas.length < PAGINA) return saida;
      }
      throw new Error(`ler adm.${view}: passou de ${TETO_PAGINAS * PAGINA} linhas; filtre antes`);
    },
    async inserir(view, linhas, retornar) {
      if (linhas.length === 0) return [];
      const base = cliente.from(view).insert(linhas);
      const { data, error } = await (retornar ? base.select(retornar) : base);
      if (error) throw falha(`gravar adm.${view}`, error);
      return (data ?? []).filter((x): x is Linha => typeof x === 'object' && x !== null);
    },
    async atualizar(view, filtros, valores) {
      const { error } = await aplicar(cliente.from(view).update(valores), filtros);
      if (error) throw falha(`atualizar adm.${view}`, error);
    },
  };
}
