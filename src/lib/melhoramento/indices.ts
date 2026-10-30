/**
 * ÍNDICES E CONFIABILIDADE — MPPA, índice da fêmea e as conversões de REL.
 *
 * Porta de melhoramento/indices.py e melhoramento/confiabilidade.py (via
 * lab/calculadoras.js), com os mesmos nomes e argumentos, conferida contra
 * vetores_teste.json em vetores.test.ts. Convenções do motor: taxas,
 * confiabilidades e F em fração; PTA = EBV/2; variâncias são PARÂMETROS da
 * literatura, nunca estimadas com o rebanho.
 *
 * Uma só função aqui NÃO é porta: `capacidade_producao_femea`, a versão do
 * índice da fêmea que prevê a PRÓXIMA LACTAÇÃO em vez do valor genético. Ela
 * existe por causa da validação para frente (validacao.ts) e o motivo está no
 * comentário dela.
 */

import { media, resolver } from '@/lib/melhoramento/numerico';

// ─────────────────────────────────────────────────────────────────────────────
// confiabilidade (porta de confiabilidade.py)
// ─────────────────────────────────────────────────────────────────────────────

/** REL = 1 − PEV/[(1 + F)·σ²a]. */
export function rel_de_pev(pev: number, sigma2_a: number, F = 0.0): number {
  return 1.0 - pev / ((1.0 + F) * sigma2_a);
}
export function r_de_rel(rel: number): number {
  return Math.sqrt(rel);
}
export function rel_de_r(r: number): number {
  return r * r;
}
/** a_BIF = 1 − √(1 − REL). */
export function bif_de_rel(rel: number): number {
  return 1.0 - Math.sqrt(1.0 - rel);
}
/** REL = 1 − (1 − a_BIF)². */
export function rel_de_bif(a_bif: number): number {
  return 1.0 - (1.0 - a_bif) * (1.0 - a_bif);
}
export function bif_de_r(r: number): number {
  return bif_de_rel(r * r);
}
export function r_de_bif(a_bif: number): number {
  return Math.sqrt(rel_de_bif(a_bif));
}
/** k_d = (4 − 2h²)/h²: mérito das companheiras conhecido (USDA: 14 com h² 0,25). */
export function k_d(h2: number): number {
  return (4.0 - 2.0 * h2) / h2;
}
/** k = (4 − h²)/h²: companheiras desconhecidas, modelo de touro. */
export function k_touro(h2: number): number {
  return (4.0 - h2) / h2;
}
export function rel_de_de(de: number, k: number): number {
  return de / (de + k);
}
/** DE = k·REL/(1 − REL): filhas-equivalentes para uma REL alvo. */
export function de_de_rel(rel: number, k: number): number {
  return (k * rel) / (1.0 - rel);
}
/** REL de n filhas, cada uma num rebanho diferente: n/(n + k). */
export function rel_filhas(n_filhas: number, h2: number, merito_companheiras_conhecido = true): number {
  const k = merito_companheiras_conhecido ? k_d(h2) : k_touro(h2);
  return rel_de_de(n_filhas, k);
}
/** DE de d filhas no mesmo rebanho: 1/(0,16 + 0,84/d) (VanRaden e Wiggans 1991, Tab. 2). */
export function de_filhas_mesmo_rebanho(d: number): number {
  return 1.0 / (0.16 + 0.84 / d);
}
export function h2_media_repetida(m: number, h2: number, r: number): number {
  return (m * h2) / (1.0 + (m - 1) * r);
}
export function de_registros_proprios(m: number, h2: number, r: number): number {
  const h2m = h2_media_repetida(m, h2, r);
  return (k_d(h2) * h2m) / (1.0 - h2m);
}
export function de_filha_com_lactacoes(m: number, h2: number, r: number): number {
  return k_d(h2) / k_d(h2_media_repetida(m, h2, r));
}
/** REL_PA = (REL_pai + REL_mãe)/4. */
export function rel_media_pais(rel_pai: number, rel_mae: number): number {
  return 0.25 * (rel_pai + rel_mae);
}
/** DE = DE_PA + DE_próprio + Σ DE_progênie; REL = DE/(DE + k_d). */
export function rel_total(h2: number, de_media_pais = 0.0, de_proprio = 0.0, de_progenie = 0.0): number {
  return rel_de_de(de_media_pais + de_proprio + de_progenie, k_d(h2));
}

// ─────────────────────────────────────────────────────────────────────────────
// indices (porta de indices.py)
// ─────────────────────────────────────────────────────────────────────────────

/** n·r/[1 + (n − 1)·r]. */
export function fator_mppa(n: number, r: number): number {
  return (n * r) / (1.0 + (n - 1) * r);
}

/** MPPA = μ + [n·r/(1 + (n − 1)·r)]·(ȳ − μ). */
export function mppa(media_femea: number, n: number, r: number, media_rebanho = 0.0): number {
  return media_rebanho + fator_mppa(n, r) * (media_femea - media_rebanho);
}

export function ebv_registros_proprios(desvio_medio: number, n: number, h2: number, r: number): number {
  return ((n * h2) / (1.0 + (n - 1) * r)) * desvio_medio;
}

export interface ResultadoIndiceFemea {
  ebv: number;
  pta: number;
  confiabilidade: number;
  pesos: number[];
}

/**
 * EBV da fêmea por índice de seleção: registros próprios (x₁ = ȳ − μ) + PTA ou
 * EBV do pai (x₂). Devolve {ebv, pta, confiabilidade, pesos}, como o
 * ResultadoIndiceFemea do Python.
 */
export function indice_femea(
  desvios: readonly number[],
  h2: number,
  r: number,
  sigma_p: number,
  pta_pai: number | null = null,
  rel_pai = 0.0,
  escala_pai: 'PTA' | 'EBV' = 'PTA',
): ResultadoIndiceFemea {
  return indiceGenerico(desvios, h2, r, sigma_p, pta_pai, rel_pai, escala_pai, 'valor_genetico');
}

/**
 * A MESMA informação do índice da fêmea (registros próprios + EBV do pai),
 * mas com o alvo trocado: em vez do valor genético a, a CAPACIDADE DE PRODUÇÃO
 * a + pe — o que se espera da próxima lactação, em desvio das contemporâneas.
 *
 * POR QUE EXISTE. A validação para frente compara o que cada modelo prevê
 * para a última lactação com o que ela foi. Para MPPA e BLUP (â + p̂) isso já
 * é capacidade de produção, e o coeficiente de regressão do realizado sobre o
 * previsto tem alvo 1. O EBV não: regredir a próxima lactação sobre o EBV da
 * própria fêmea dá, em média, r/h² (1,8 com h² 0,20 e r 0,36), porque o
 * ambiente permanente que os registros carregam volta na lactação seguinte.
 * Medir a "dispersão" do índice pelo EBV puniria o índice por algo que não é
 * defeito dele. Trocar só o alvo deixa os quatro modelos na mesma régua.
 *
 * A conta é a do índice de seleção, só com outro vetor g:
 *   P = o mesmo do motor;  g = [Cov(x₁, a+pe), Cov(x₂, a+pe)] = [r·σ²P, cov₂],
 * em que cov₂ é a covariância do pai com o valor genético da filha (o pe dela
 * não tem nada com o pai). Sem pai, b = r·σ²P/Var(x̄) = n·r/[1 + (n − 1)r] — a
 * MPPA exata, e o teste confere isso contra `fator_mppa` do motor.
 */
export function capacidade_producao_femea(
  desvios: readonly number[],
  h2: number,
  r: number,
  sigma_p: number,
  ebv_pai: number | null = null,
  rel_pai = 0.0,
  escala_pai: 'PTA' | 'EBV' = 'EBV',
): ResultadoIndiceFemea {
  return indiceGenerico(desvios, h2, r, sigma_p, ebv_pai, rel_pai, escala_pai, 'capacidade_producao');
}

function indiceGenerico(
  desvios: readonly number[],
  h2: number,
  r: number,
  sigma_p: number,
  pta_pai: number | null,
  rel_pai: number,
  escala_pai: 'PTA' | 'EBV',
  alvo: 'valor_genetico' | 'capacidade_producao',
): ResultadoIndiceFemea {
  if (escala_pai !== 'PTA' && escala_pai !== 'EBV') throw new RangeError("escala_pai deve ser 'PTA' ou 'EBV'");
  const y = desvios.map(Number);
  const n = y.length;
  if (n === 0) throw new RangeError('indice_femea exige pelo menos um registro');
  const s2p = sigma_p * sigma_p;
  const s2a = h2 * s2p;
  // Cov(x₁, alvo): σ²a para o valor genético; σ²a + σ²pe = r·σ²P para a capacidade.
  const covX1 = alvo === 'valor_genetico' ? s2a : r * s2p;
  const varX1 = s2p * (r + (1.0 - r) / n);
  let b: number[];
  let g: number[];
  let x: number[];
  if (pta_pai == null || !(rel_pai > 0.0)) {
    g = [covX1];
    x = [media(y)];
    b = [covX1 / varX1];
  } else {
    let varX2: number;
    let covX2: number;
    if (escala_pai === 'PTA') {
      varX2 = (rel_pai * s2a) / 4.0;
      covX2 = (rel_pai * s2a) / 4.0;
    } else {
      varX2 = rel_pai * s2a;
      covX2 = (rel_pai * s2a) / 2.0;
    }
    g = [covX1, covX2];
    x = [media(y), pta_pai];
    b = resolver(
      [
        [varX1, covX2],
        [covX2, varX2],
      ],
      g,
    );
  }
  let ebv = 0;
  let bg = 0;
  for (let k = 0; k < b.length; k++) {
    ebv += b[k] * x[k];
    bg += b[k] * g[k];
  }
  // Confiabilidade = Var(índice)/Var(alvo): σ²a para o EBV, r·σ²P para a capacidade.
  const varAlvo = alvo === 'valor_genetico' ? s2a : r * s2p;
  return { ebv, pta: ebv / 2.0, confiabilidade: bg / varAlvo, pesos: b };
}
