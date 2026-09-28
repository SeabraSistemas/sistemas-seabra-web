import { inicioDaSemana, somarDias } from '@/lib/tres-irmaos/datas';
import type { Comprador } from '@/lib/tres-irmaos/projecao';

/**
 * O realizado, semana a semana (terça a segunda, a semana da Rose): quanto o
 * tanque recebeu e quanto cada comprador levou. Uma linha de
 * `leite_acompanhamento` é ou produção (tipo 'producao', pode ser do dia ou
 * um total de vários dias — soma na semana da data) ou uma coleta.
 */

export interface Lancamento {
  id: number;
  data: string;
  tipo: 'producao' | 'coleta';
  comprador: string | null;
  litros: number;
  observacao: string | null;
  criado_por: string | null;
}

export interface ColetaDaSemana {
  compradorId: string;
  litros: number;
  abaixoDoMinimo: boolean;
  acimaDoMaximo: boolean;
}

export interface SemanaRealizada {
  inicio: string;
  fim: string;
  producao: number;
  diasComProducao: number;
  coletas: ColetaDaSemana[];
  /** Coletas de comprador que não está mais na lista (renomeado/removido): não somem da conta. */
  coletasOutros: number;
  vendido: number;
  /** Produção − vendido. Positivo: ficou no tanque/sem comprador. */
  saldo: number;
  vendidoAcimaDoTeto: number;
  producaoAcimaDoTeto: number;
}

export function agruparPorSemana(lancamentos: Lancamento[], compradores: Comprador[], teto: number): SemanaRealizada[] {
  const semanas = new Map<string, { producao: number; dias: Set<string>; coletas: Map<string, number> }>();
  for (const l of lancamentos) {
    const chave = inicioDaSemana(l.data);
    let s = semanas.get(chave);
    if (!s) {
      s = { producao: 0, dias: new Set(), coletas: new Map() };
      semanas.set(chave, s);
    }
    const litros = Number(l.litros) || 0;
    if (l.tipo === 'producao') {
      s.producao += litros;
      s.dias.add(l.data);
    } else if (l.comprador) {
      s.coletas.set(l.comprador, (s.coletas.get(l.comprador) ?? 0) + litros);
    }
  }

  const ids = new Set(compradores.map((c) => c.id));
  return [...semanas.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([inicio, s]) => {
      const coletas = compradores.map((c) => {
        const litros = s.coletas.get(c.id) ?? 0;
        return {
          compradorId: c.id,
          litros,
          abaixoDoMinimo: litros + 1e-9 < c.minSemanal,
          acimaDoMaximo: litros > c.maxSemanal + 1e-9,
        };
      });
      let coletasOutros = 0;
      for (const [id, litros] of s.coletas) if (!ids.has(id)) coletasOutros += litros;
      const vendido = coletas.reduce((t, c) => t + c.litros, 0) + coletasOutros;
      return {
        inicio,
        fim: somarDias(inicio, 6),
        producao: s.producao,
        diasComProducao: s.dias.size,
        coletas,
        coletasOutros,
        vendido,
        saldo: s.producao - vendido,
        vendidoAcimaDoTeto: Math.max(0, vendido - teto),
        producaoAcimaDoTeto: Math.max(0, s.producao - teto),
      };
    });
}
