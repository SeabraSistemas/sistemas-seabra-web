/**
 * Distribuição de custo por mês — puro, sem leitura de planilha nem
 * Date.now() ("hoje" entra como parâmetro, pra ser testável). Usado pela
 * aba Custos do Financeiro (15/09/2026).
 *
 * Regra combinada com o Felipe: **Mensal** entra o valor CHEIO em cada mês
 * do intervalo; **Anual** entra o valor ÷ 12 em cada mês do intervalo —
 * sem prorateio por dia, sem juntar meio mês (mesmo espírito "simples e
 * prática" do resto do Financeiro: o mês conta inteiro, como já faz
 * `agruparPorMes` em financeiro.ts pra receita/perdas).
 *
 * Um custo sem `dataFim` está "em aberto" (ainda vigente) — distribui até
 * o mês de `hoje`, nunca projeta pro futuro.
 */
import type { Custo, DiaCompacto } from './types';
import type { PontoMes } from './financeiro';

/** "aaaammdd" => "aaaamm". Exportado — também usado por projecaoRebanho.ts pro bucket de mês. */
export function mesDe(dia: DiaCompacto): string {
  return String(Math.floor(dia / 100));
}

/** Exportado — também usado por projecaoRebanho.ts pra gerar os meses do horizonte. */
export function proximoMes(mes: string): string {
  const ano = Number(mes.slice(0, 4));
  const m = Number(mes.slice(4, 6));
  return m === 12 ? `${ano + 1}01` : `${ano}${String(m + 1).padStart(2, '0')}`;
}

/**
 * Lista de "aaaamm" entre dataInicio e (dataFim ou hoje), inclusive nos dois
 * extremos — comparação de string funciona igual à numérica porque "aaaamm"
 * é sempre 6 dígitos. [] se dataInicio faltar ou vier depois do fim efetivo
 * (custo que começa no futuro, ou já veio com dataFim antes de dataInicio).
 */
function mesesDoIntervalo(dataInicio: DiaCompacto | null, dataFim: DiaCompacto | null, hoje: DiaCompacto): string[] {
  if (dataInicio == null) return [];
  const mesFim = mesDe(dataFim ?? hoje);
  const meses: string[] = [];
  let mesAtual = mesDe(dataInicio);
  while (mesAtual <= mesFim) {
    meses.push(mesAtual);
    mesAtual = proximoMes(mesAtual);
  }
  return meses;
}

/** Distribui UM custo pelos meses que ele cobre. [] se faltar valor, tipo ou data início. */
export function distribuirCusto(custo: Custo, hoje: DiaCompacto): PontoMes[] {
  if (custo.valor == null || custo.tipo == null || custo.dataInicio == null) return [];
  const valorPorMes = custo.tipo === 'Anual' ? custo.valor / 12 : custo.valor;
  return mesesDoIntervalo(custo.dataInicio, custo.dataFim, hoje).map((mes) => ({ mes, valor: valorPorMes }));
}

/** Soma a distribuição de vários custos, mês a mês — alimenta a 3ª série do gráfico Receita×Perdas×Custos. */
export function custosMensais(custos: Custo[], hoje: DiaCompacto): PontoMes[] {
  const mapa = new Map<string, number>();
  for (const c of custos) {
    for (const p of distribuirCusto(c, hoje)) {
      mapa.set(p.mes, (mapa.get(p.mes) ?? 0) + p.valor);
    }
  }
  return Array.from(mapa, ([mes, valor]) => ({ mes, valor }));
}

/**
 * Total de custo dentro de um período (dois "aaaammdd", cada um opcional =
 * sem limite naquele lado) — pro card "Custos do período" respeitar o
 * mesmo filtro de Data inicial/final/Ano da tela, mês inteiro por mês
 * inteiro (sem prorateio por dia, mesma regra de `distribuirCusto`).
 */
export function custosNoPeriodo(custos: Custo[], hoje: DiaCompacto, inicio: DiaCompacto | null, fim: DiaCompacto | null): number {
  const mesInicio = inicio != null ? mesDe(inicio) : null;
  const mesFim = fim != null ? mesDe(fim) : null;
  return custosMensais(custos, hoje)
    .filter((p) => (mesInicio == null || p.mes >= mesInicio) && (mesFim == null || p.mes <= mesFim))
    .reduce((soma, p) => soma + p.valor, 0);
}
