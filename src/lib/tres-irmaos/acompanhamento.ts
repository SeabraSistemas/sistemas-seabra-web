import { inicioDaSemana, somarDias } from '@/lib/tres-irmaos/datas';
import type { Comprador } from '@/lib/tres-irmaos/projecao';

/**
 * O realizado, semana a semana (terça a segunda, a semana da Rose): quanto o
 * tanque recebeu e quanto cada comprador levou.
 *
 * Duas origens, somadas: o que o Lucas já lança no APP (Produção Diária e
 * Saída de Leite — lidas, nunca escritas daqui) e o que for lançado no site
 * (`leite_acompanhamento`), para o que não passa pelo app. Uma linha é ou
 * produção (pode ser do dia ou um total de vários dias — soma na semana da
 * data) ou uma coleta.
 */

export interface Lancamento {
  /** Positivo: linha do site (apagável). Negativo: linha do app (só leitura). */
  id: number;
  origem: 'site' | 'app';
  data: string;
  tipo: 'producao' | 'coleta';
  comprador: string | null;
  litros: number;
  observacao: string | null;
  criado_por: string | null;
}

export interface ProducaoDoApp {
  id: number;
  data: string;
  lactantes: number | null;
  litros: number;
}

export interface SaidaDoApp {
  id: number;
  data: string;
  litros: number;
  destinos: string[];
  observacao: string | null;
}

/** Comprador de uma saída do app: o primeiro destino que casar com `destinosApp`; senão, o próprio nome do destino. */
export function compradorDaSaida(destinos: string[], compradores: Comprador[]): string {
  const norm = (t: string) => t.trim().toLowerCase();
  for (const d of destinos) {
    const c = compradores.find((x) => x.destinosApp.some((a) => norm(a) === norm(d)));
    if (c) return c.id;
  }
  return destinos[0]?.trim() || 'sem destino';
}

/** Converte a Produção Diária e a Saída de Leite do app em lançamentos (ids negativos, origem 'app'). */
export function lancamentosDoApp(producoes: ProducaoDoApp[], saidas: SaidaDoApp[], compradores: Comprador[]): Lancamento[] {
  return [
    ...producoes.map<Lancamento>((p) => ({
      id: -p.id,
      origem: 'app',
      data: p.data,
      tipo: 'producao',
      comprador: null,
      litros: p.litros,
      observacao: p.lactantes ? `${p.lactantes} lactantes` : null,
      criado_por: null,
    })),
    ...saidas.map<Lancamento>((s) => ({
      id: -(1_000_000_000 + s.id),
      origem: 'app',
      data: s.data,
      tipo: 'coleta',
      comprador: compradorDaSaida(s.destinos, compradores),
      litros: s.litros,
      observacao: s.observacao,
      criado_por: null,
    })),
  ];
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
  /** Coletas de destino que não é de nenhum comprador da lista: não somem da conta. */
  coletasOutros: number;
  /** Nomes desses destinos, para mostrar. */
  destinosOutros: string[];
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
      const destinosOutros: string[] = [];
      for (const [id, litros] of s.coletas) {
        if (ids.has(id)) continue;
        coletasOutros += litros;
        destinosOutros.push(id);
      }
      const vendido = coletas.reduce((t, c) => t + c.litros, 0) + coletasOutros;
      return {
        inicio,
        fim: somarDias(inicio, 6),
        producao: s.producao,
        diasComProducao: s.dias.size,
        coletas,
        coletasOutros,
        destinosOutros,
        vendido,
        saldo: s.producao - vendido,
        vendidoAcimaDoTeto: Math.max(0, vendido - teto),
        producaoAcimaDoTeto: Math.max(0, s.producao - teto),
      };
    });
}
