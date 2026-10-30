/**
 * MÉTRICAS DA VALIDAÇÃO PARA FRENTE.
 *
 * Cada modelo, ajustado só com os dados até a penúltima lactação de cada
 * fêmea, prevê o desvio da última. Aqui se mede quão bem:
 *
 *   correlação      ordem: quem o modelo diz melhor saiu melhor? É a métrica
 *                   que decide seleção. IC de 95% pela transformação z de
 *                   Fisher (z = atanh r ± z₀,₉₇₅/√(n − 3)).
 *   regressão       dispersão: realizado = a + b·previsto. b ≈ 1 é previsão na
 *                   escala certa; b < 1, o modelo exagera as diferenças (o
 *                   clássico de quem não encolhe); b > 1, encolhe demais. IC
 *                   pela t de Student com n − 2 graus de liberdade.
 *   viés            média de (realizado − previsto), com IC t (n − 1 gl).
 *   n               fêmeas na validação. Tudo acima vem junto dele.
 *
 * Quantis da normal e da t são os do motor (numerico.ts), conferidos contra os
 * vetores do Python.
 *
 * A REGRA DO VENCEDOR é conservadora de propósito: com uma fazenda, poucas
 * fêmeas e modelos que usam quase a mesma informação, as correlações ficam a
 * centésimos umas das outras e os intervalos se sobrepõem. Dizer "o BLUP
 * ganhou" nessa situação é ler ruído. Só se declara vencedor quando há fêmeas
 * suficientes E o intervalo do melhor fica inteiro acima do intervalo de todos
 * os outros — não sobrepor é suficiente (embora não necessário) para a
 * diferença ser real, e é uma regra que qualquer um confere olhando a tabela.
 */

import { norm_ppf, t_quantil } from '@/lib/melhoramento/numerico';

export type Intervalo = [number, number];

export interface MetricasValidacao {
  n: number;
  correlacao: number | null;
  icCorrelacao: Intervalo | null;
  regressao: number | null;
  icRegressao: Intervalo | null;
  vies: number | null;
  icVies: Intervalo | null;
}

const CONFIANCA = 0.95;

export function metricasValidacao(previsto: readonly number[], realizado: readonly number[]): MetricasValidacao {
  const n = previsto.length;
  if (realizado.length !== n) throw new RangeError('previsto e realizado precisam ter o mesmo tamanho');
  const vazio: MetricasValidacao = {
    n,
    correlacao: null,
    icCorrelacao: null,
    regressao: null,
    icRegressao: null,
    vies: null,
    icVies: null,
  };
  if (n === 0) return vazio;

  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += previsto[i];
    my += realizado[i];
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  let sdd = 0;
  for (let i = 0; i < n; i++) {
    const dx = previsto[i] - mx;
    const dy = realizado[i] - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const vies = my - mx;
  for (let i = 0; i < n; i++) sdd += (realizado[i] - previsto[i] - vies) ** 2;

  const saida: MetricasValidacao = { ...vazio, vies };
  if (n >= 2) {
    const dp = Math.sqrt(sdd / (n - 1));
    const meia = (t_quantil(1 - (1 - CONFIANCA) / 2, n - 1) * dp) / Math.sqrt(n);
    saida.icVies = [vies - meia, vies + meia];
  }

  // Previsão constante (variância zero) não tem correlação nem regressão: o
  // modelo não ordenou ninguém. Dividir por zero daria um NaN que a tela
  // imprimiria como número.
  const constante = sxx <= 1e-24 * Math.max(1, mx * mx);
  if (constante || syy <= 0) return saida;

  const r = sxy / Math.sqrt(sxx * syy);
  saida.correlacao = r;
  if (n >= 4 && Math.abs(r) < 1) {
    const z = Math.atanh(r);
    const meia = norm_ppf(1 - (1 - CONFIANCA) / 2) / Math.sqrt(n - 3);
    saida.icCorrelacao = [Math.tanh(z - meia), Math.tanh(z + meia)];
  }

  const b = sxy / sxx;
  saida.regressao = b;
  if (n >= 3) {
    const sse = Math.max(0, syy - b * sxy);
    const se = Math.sqrt(sse / (n - 2) / sxx);
    const meia = t_quantil(1 - (1 - CONFIANCA) / 2, n - 2) * se;
    saida.icRegressao = [b - meia, b + meia];
  }
  return saida;
}

export interface Vencedor {
  /** Chave do modelo, ou null quando não há vencedor declarável. */
  modelo: string | null;
  motivo: string;
}

/**
 * Declara um vencedor só se `n ≥ minimo` e o IC da correlação do melhor
 * estiver inteiro acima do IC de todos os outros. Senão, diz por que não.
 */
export function vencedorDaValidacao(
  porModelo: readonly { modelo: string; metricas: MetricasValidacao }[],
  minimo: number,
): Vencedor {
  const comR = porModelo.filter((m) => m.metricas.correlacao != null && m.metricas.icCorrelacao != null);
  if (comR.length === 0) return { modelo: null, motivo: 'nenhum modelo tem correlação calculável' };
  const n = Math.max(...comR.map((m) => m.metricas.n));
  if (n < minimo) {
    return {
      modelo: null,
      motivo: `só ${n} fêmeas na validação (o mínimo para comparar modelos é ${minimo}): os intervalos são largos demais para apontar um melhor`,
    };
  }
  const ordenados = [...comR].sort((a, b) => b.metricas.correlacao! - a.metricas.correlacao!);
  const melhor = ordenados[0];
  const piso = melhor.metricas.icCorrelacao![0];
  const sobrepostos = ordenados.slice(1).filter((m) => m.metricas.icCorrelacao![1] >= piso);
  if (sobrepostos.length > 0) {
    return {
      modelo: null,
      motivo: `o intervalo do maior coeficiente se sobrepõe ao de ${sobrepostos.length} outro(s) modelo(s): a diferença pode ser acaso`,
    };
  }
  return { modelo: melhor.modelo, motivo: 'intervalo de confiança da correlação acima do de todos os outros modelos' };
}
