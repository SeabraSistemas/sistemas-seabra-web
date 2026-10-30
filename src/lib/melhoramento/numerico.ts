/**
 * NÚCLEO NUMÉRICO do módulo interno de melhoramento — sem dependência nenhuma.
 *
 * DE ONDE VEM. As funções de distribuição (log-gama, erfc, normal, beta
 * incompleta, t de Student) são a porta, linha a linha, de
 * central-melhoramento/lab/calculadoras.js, que por sua vez é a porta do
 * pacote Python `melhoramento` (central-melhoramento/laboratorio/), validado
 * contra Mrode et al. (2023) e a ICAR. O Python é a referência: mesmo nome de
 * função, mesmos argumentos, mesma ordem. `vetores.test.ts` confere cada uma
 * contra `vetores_teste.json` com a tolerância do próprio arquivo (1e-9).
 *
 * A álgebra densa tem duas camadas, de propósito:
 *
 *   inversa / resolver   Gauss-Jordan e Gauss com pivô parcial em number[][],
 *                        iguais aos da porta JS. Servem às funções portadas
 *                        (modelo_animal, indice_femea), que precisam bater com
 *                        o Python nos vetores.
 *   cholesky*            Float64Array plano, para as MME de uma fazenda real
 *                        (até ~2.000 incógnitas). A matriz das MME de posto
 *                        completo é simétrica positiva definida, e Cholesky é
 *                        o caminho mais estável e barato para ela.
 *
 * Nada aqui estima variância com dado de rebanho: h², repetibilidade e σ são
 * sempre parâmetros de entrada (regra do motor).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

export function soma(v: readonly number[]): number {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i];
  return s;
}

export function media(v: readonly number[]): number {
  return soma(v) / v.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// taxas: núcleo numérico (porta de melhoramento/taxas.py)
// ─────────────────────────────────────────────────────────────────────────────

const EPS = 1e-15; // tolerância relativa das frações continuadas e séries
const FPMIN = 1e-300; // evita divisão por zero no método de Lentz modificado
const MAX_ITER = 10000;
const RAIZ_2PI = Math.sqrt(2.0 * Math.PI);

// Lanczos com g = 7 e 9 coeficientes (Godfrey).
const LANCZOS_G = 7.0;
const LANCZOS_COEF = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** ln Γ(x), x > 0, por Lanczos (g = 7) com reflexão para x < ½. */
export function log_gama(x: number): number {
  if (!(x > 0.0)) throw new RangeError('log_gama exige x > 0');
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - log_gama(1.0 - x);
  const z = x - 1.0;
  let s = LANCZOS_COEF[0];
  for (let k = 1; k < LANCZOS_COEF.length; k++) s += LANCZOS_COEF[k] / (z + k);
  const t = z + LANCZOS_G + 0.5;
  return 0.5 * Math.log(2.0 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s);
}

function gamaIncSerie(a: number, x: number): number {
  let ap = a;
  let termo = 1.0 / a;
  let s = termo;
  for (let i = 0; i < MAX_ITER; i++) {
    ap += 1.0;
    termo *= x / ap;
    s += termo;
    if (Math.abs(termo) < Math.abs(s) * EPS) break;
  }
  return s * Math.exp(-x + a * Math.log(x) - log_gama(a));
}

function gamaIncFracao(a: number, x: number): number {
  let b = x + 1.0 - a;
  let c = 1.0 / FPMIN;
  let d = 1.0 / b;
  let h = d;
  for (let i = 1; i < MAX_ITER; i++) {
    const an = -i * (i - a);
    b += 2.0;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1.0) < EPS) break;
  }
  return Math.exp(-x + a * Math.log(x) - log_gama(a)) * h;
}

/** Q(a, x) = Γ(a, x)/Γ(a), gama incompleta superior regularizada. */
export function gama_incompleta_regularizada_q(a: number, x: number): number {
  if (x < 0.0 || a <= 0.0) throw new RangeError('gama incompleta exige a > 0 e x >= 0');
  if (x === 0.0) return 1.0;
  if (x < a + 1.0) return 1.0 - gamaIncSerie(a, x);
  return gamaIncFracao(a, x);
}

/** erfc(x) = Q(½, x²) para x ≥ 0; erfc(−x) = 2 − erfc(x). */
export function erfc(x: number): number {
  if (x < 0.0) return 2.0 - erfc(-x);
  if (x === 0.0) return 1.0;
  return gama_incompleta_regularizada_q(0.5, x * x);
}

/** Φ(z) = ½·erfc(−z/√2). */
export function norm_cdf(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

// Coeficientes de Acklam (2003) para a inversa da normal.
const ACK_A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
];
const ACK_B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
];
const ACK_C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
];
const ACK_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
const ACK_P_BAIXO = 0.02425;

/** Quantil da normal padrão: Acklam + um passo de Halley; simetria para p > ½. */
export function norm_ppf(p: number): number {
  if (!(p > 0.0 && p < 1.0)) throw new RangeError('norm_ppf exige 0 < p < 1');
  if (p > 0.5) return -norm_ppf(1.0 - p);
  const a = ACK_A;
  const b = ACK_B;
  const c = ACK_C;
  const d = ACK_D;
  let x: number;
  if (p < ACK_P_BAIXO) {
    const q = Math.sqrt(-2.0 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
  } else {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
  }
  const e = norm_cdf(x) - p;
  const u = e * RAIZ_2PI * Math.exp(0.5 * x * x);
  return x - u / (1.0 + 0.5 * x * u);
}

function fracaoContinuadaBeta(x: number, a: number, b: number): number {
  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;
  for (let m = 1; m < MAX_ITER; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2)); // termo par
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2)); // termo ímpar
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1.0) < EPS) return h;
  }
  throw new Error('fração continuada da beta não convergiu');
}

/** I_x(a, b), beta incompleta regularizada (fração continuada de Lentz). */
export function beta_incompleta_regularizada(x: number, a: number, b: number): number {
  if (a <= 0.0 || b <= 0.0) throw new RangeError('beta incompleta exige a > 0 e b > 0');
  if (x <= 0.0) return 0.0;
  if (x >= 1.0) return 1.0;
  const lnFrente =
    log_gama(a + b) - log_gama(a) - log_gama(b) + a * Math.log(x) + b * Math.log1p(-x);
  if (x < (a + 1.0) / (a + b + 2.0)) return (Math.exp(lnFrente) * fracaoContinuadaBeta(x, a, b)) / a;
  return 1.0 - (Math.exp(lnFrente) * fracaoContinuadaBeta(1.0 - x, b, a)) / b;
}

/** Quantil da Beta(a, b) por bisseção em [0, 1]. */
export function beta_quantil(p: number, a: number, b: number, tolerancia = 1e-14): number {
  if (!(p >= 0.0 && p <= 1.0)) throw new RangeError('beta_quantil exige 0 <= p <= 1');
  let lo = 0.0;
  let hi = 1.0;
  for (let i = 0; i < 200; i++) {
    const meio = 0.5 * (lo + hi);
    if (beta_incompleta_regularizada(meio, a, b) < p) lo = meio;
    else hi = meio;
    if (hi - lo < tolerancia) break;
  }
  return 0.5 * (lo + hi);
}

export function t_cdf(t: number, gl: number): number {
  const cauda = 0.5 * beta_incompleta_regularizada(gl / (gl + t * t), 0.5 * gl, 0.5);
  return t >= 0.0 ? 1.0 - cauda : cauda;
}

export function t_quantil(p: number, gl: number): number {
  if (!(p > 0.0 && p < 1.0)) throw new RangeError('t_quantil exige 0 < p < 1');
  if (p < 0.5) return -t_quantil(1.0 - p, gl);
  let lo = 0.0;
  let hi = 1.0;
  while (t_cdf(hi, gl) < p) hi *= 2.0;
  for (let i = 0; i < 200; i++) {
    const meio = 0.5 * (lo + hi);
    if (t_cdf(meio, gl) < p) lo = meio;
    else hi = meio;
    if (hi - lo < 1e-13) break;
  }
  return 0.5 * (lo + hi);
}

// ─────────────────────────────────────────────────────────────────────────────
// Álgebra densa das funções portadas (number[][], igual à porta JS)
// ─────────────────────────────────────────────────────────────────────────────

/** Eliminação de Gauss-Jordan com pivô parcial: devolve a inversa de M (n × n). */
export function inversa(M: readonly (readonly number[])[]): number[][] {
  const n = M.length;
  const a = M.map((linha, i) => {
    const ext = linha.slice();
    for (let j = 0; j < n; j++) ext.push(i === j ? 1 : 0);
    return ext;
  });
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-300) throw new Error('sistema singular: confira os dados');
    if (p !== c) {
      const tmp = a[p];
      a[p] = a[c];
      a[c] = tmp;
    }
    const piv = a[c][c];
    for (let j = 0; j < 2 * n; j++) a[c][j] /= piv;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = a[r][c];
      if (f !== 0) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j];
    }
  }
  return a.map((linha) => linha.slice(n));
}

/** Resolve M·x = b por eliminação de Gauss com pivô parcial. */
export function resolver(M: readonly (readonly number[])[], b: readonly number[]): number[] {
  const n = M.length;
  const a = M.map((linha, i) => linha.concat([b[i]]));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-300) throw new Error('sistema singular: confira os dados');
    if (p !== c) {
      const tmp = a[p];
      a[p] = a[c];
      a[c] = tmp;
    }
    for (let r = c + 1; r < n; r++) {
      const f = a[r][c] / a[c][c];
      if (f !== 0) for (let j = c; j <= n; j++) a[r][j] -= f * a[c][j];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = a[i][n];
    for (let j = i + 1; j < n; j++) s -= a[i][j] * x[j];
    x[i] = s / a[i][i];
  }
  return x;
}

// ─────────────────────────────────────────────────────────────────────────────
// Matriz esparsa simétrica e os dois resolvedores das MME de uma fazenda
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Matriz simétrica guardada por linha, com as DUAS metades (i,j) e (j,i). É o
 * formato em que as MME nascem: cada registro, cada animal de A⁻¹ e cada nível
 * de ambiente permanente somam algumas entradas, e o resto é zero.
 */
export class MatrizEsparsa {
  readonly n: number;
  readonly linhas: Map<number, number>[];

  constructor(n: number) {
    this.n = n;
    this.linhas = Array.from({ length: n }, () => new Map<number, number>());
  }

  /** Soma `v` em (i, j) e, se i ≠ j, também em (j, i). */
  somarSimetrico(i: number, j: number, v: number): void {
    if (v === 0) return;
    const li = this.linhas[i];
    li.set(j, (li.get(j) ?? 0) + v);
    if (i !== j) {
      const lj = this.linhas[j];
      lj.set(i, (lj.get(i) ?? 0) + v);
    }
  }

  obter(i: number, j: number): number {
    return this.linhas[i].get(j) ?? 0;
  }

  /** Cópia densa em Float64Array plano (linha-major), para Cholesky. */
  densa(): Float64Array {
    const n = this.n;
    const M = new Float64Array(n * n);
    for (let i = 0; i < n; i++) for (const [j, v] of this.linhas[i]) M[i * n + j] = v;
    return M;
  }
}

/**
 * Fatora M = L·Lᵀ em lugar (a metade inferior de `M` vira L). Lança se M não
 * for positiva definida — nas MME isso só acontece com um efeito fixo sem
 * registro, e quem monta as MME garante que todo nível tem registro.
 */
export function choleskyEmLugar(M: Float64Array, n: number): void {
  for (let j = 0; j < n; j++) {
    const lj = j * n;
    let s = M[lj + j];
    for (let k = 0; k < j; k++) s -= M[lj + k] * M[lj + k];
    if (!(s > 1e-12)) throw new Error('matriz não é positiva definida: confira os dados');
    const djj = Math.sqrt(s);
    M[lj + j] = djj;
    for (let i = j + 1; i < n; i++) {
      const li = i * n;
      let t = M[li + j];
      for (let k = 0; k < j; k++) t -= M[li + k] * M[lj + k];
      M[li + j] = t / djj;
    }
  }
}

/** Resolve L·Lᵀ·x = b com o fator de choleskyEmLugar. */
export function choleskyResolver(L: Float64Array, n: number, b: ArrayLike<number>): Float64Array {
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const li = i * n;
    let s = b[i];
    for (let k = 0; k < i; k++) s -= L[li + k] * y[k];
    y[i] = s / L[li + i];
  }
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let k = i + 1; k < n; k++) s -= L[k * n + i] * x[k];
    x[i] = s / L[i * n + i];
  }
  return x;
}

/**
 * Elementos da diagonal de C = (L·Lᵀ)⁻¹ só nas posições pedidas.
 *
 * C_ii = ‖L⁻¹·e_i‖², e L⁻¹·e_i é zero acima de i: a substituição para a frente
 * começa na linha i. Pedir só os animais e o ambiente permanente (e não os
 * grupos de contemporâneas) poupa a inversão inteira — é o que torna a PEV
 * exata viável numa fazenda de mil animais dentro de uma requisição.
 */
export function choleskyDiagonalInversa(
  L: Float64Array,
  n: number,
  posicoes: readonly number[],
): Float64Array {
  const saida = new Float64Array(posicoes.length);
  const z = new Float64Array(n);
  posicoes.forEach((i, q) => {
    z.fill(0, i);
    z[i] = 1 / L[i * n + i];
    let acc = z[i] * z[i];
    for (let r = i + 1; r < n; r++) {
      const lr = r * n;
      let s = 0;
      for (let k = i; k < r; k++) s -= L[lr + k] * z[k];
      z[r] = s / L[lr + r];
      acc += z[r] * z[r];
    }
    saida[q] = acc;
  });
  return saida;
}

export interface ResultadoGaussSeidel {
  solucao: number[];
  iteracoes: number;
  /** Σ(x_novo − x_velho)²/Σx_novo² em cada volta (critério de Mrode et al. 2023, Cap. 19). */
  convergencia: number[];
  historico: number[][] | null;
}

/**
 * Gauss-Seidel denso — porta de `blup.gauss_seidel` do Python, para o vetor do
 * Exemplo 19.2 de Mrode et al. (2023).
 */
export function gauss_seidel(
  LHS: readonly (readonly number[])[],
  RHS: readonly number[],
  x0: readonly number[] | null = null,
  iteracoes_max = 1000,
  tolerancia = 1e-12,
  guardar_historico = false,
): ResultadoGaussSeidel {
  const n = RHS.length;
  const x = x0 == null ? new Array<number>(n).fill(0) : x0.map(Number);
  const convergencia: number[] = [];
  const historico: number[][] = [];
  let volta = 0;
  for (volta = 1; volta <= iteracoes_max; volta++) {
    const anterior = x.slice();
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let k = 0; k < n; k++) s += LHS[j][k] * x[k];
      x[j] = (RHS[j] - s + LHS[j][j] * x[j]) / LHS[j][j];
    }
    let num = 0;
    let den = 0;
    for (let j = 0; j < n; j++) {
      num += (x[j] - anterior[j]) ** 2;
      den += x[j] ** 2;
    }
    convergencia.push(num / den);
    if (guardar_historico) historico.push(x.slice());
    if (convergencia[convergencia.length - 1] <= tolerancia) break;
  }
  return {
    solucao: x,
    iteracoes: Math.min(volta, iteracoes_max),
    convergencia,
    historico: guardar_historico ? historico : null,
  };
}

/**
 * Gauss-Seidel sobre a matriz esparsa: o caminho para fazenda grande demais
 * para a matriz densa. Converge porque as MME de posto completo são simétricas
 * positivas definidas — mas devagar com efeitos fixos, e aí o critério de
 * Mrode (variação relativa entre voltas) para cedo demais: com convergência
 * lenta, a variação de uma volta é pequena muito antes de a solução estar
 * perto. Por isso a parada exige também o RESÍDUO relativo ‖b − Mx‖/‖b‖ abaixo
 * de `toleranciaResiduo`, que mede a distância de verdade. O resultado diz
 * quantas voltas usou e se convergiu.
 */
export function gaussSeidelEsparso(
  M: MatrizEsparsa,
  b: ArrayLike<number>,
  toleranciaResiduo = 1e-11,
  iteracoesMax = 50000,
): { solucao: Float64Array; iteracoes: number; convergiu: boolean } {
  const n = M.n;
  const x = new Float64Array(n);
  const diag = new Float64Array(n);
  let normaB = 0;
  for (let j = 0; j < n; j++) {
    diag[j] = M.obter(j, j);
    normaB += b[j] * b[j];
  }
  normaB = Math.sqrt(normaB);
  if (normaB === 0) return { solucao: x, iteracoes: 0, convergiu: true };
  for (let volta = 1; volta <= iteracoesMax; volta++) {
    for (let j = 0; j < n; j++) {
      let s = b[j];
      for (const [k, v] of M.linhas[j]) if (k !== j) s -= v * x[k];
      x[j] = s / diag[j];
    }
    let residuo = 0;
    for (let j = 0; j < n; j++) {
      let s = b[j];
      for (const [k, v] of M.linhas[j]) s -= v * x[k];
      residuo += s * s;
    }
    if (Math.sqrt(residuo) / normaB <= toleranciaResiduo) return { solucao: x, iteracoes: volta, convergiu: true };
  }
  return { solucao: x, iteracoes: iteracoesMax, convergiu: false };
}
