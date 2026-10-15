/*
 * Calculadoras do Laboratório de Modelos, Central de Melhoramento Seabra.
 *
 * Porta para JavaScript, sem dependências, as funções do pacote Python `melhoramento`
 * (central-melhoramento/laboratorio/) que as calculadoras da central usam, mais o núcleo numérico
 * (log-gama, erfc, normal, beta incompleta, t de Student). O pacote Python é a referência: cada
 * função tem o mesmo nome, os mesmos argumentos, na mesma ordem, e devolve a mesma forma que o JSON
 * de vetores_teste.json (dataclass → objeto com os mesmos campos; tupla → array; dict → objeto).
 * O script lab/testar_calculadoras.mjs confere esta porta contra os 128 vetores.
 *
 * Uso no navegador:  <script src="lab/calculadoras.js"></script>  →  window.LabSeabra
 * Uso no Node:       const LabSeabra = require("./calculadoras.js")
 *
 *   LabSeabra.taxas.ic_exato(6, 30)                         // [0.0771, 0.3857]
 *   LabSeabra.indices.indice_femea([-60], 0.2, 0.36, 200, 60, 0.7).ebv   // 39.48
 *   LabSeabra.ASSINATURAS["taxas.ic_exato"]                 // ["x", "n", "confianca"]
 *
 * Convenções (as do motor Python): taxas, confiabilidades, acurácias e F em fração (0 a 1);
 * PTA/DEP = EBV/2; dias contados do parto; pedigree {animal: [pai, mãe]} ou lista de
 * [animal, pai, mãe], com "0", "", "-", "NA", 0 ou null para pai ou mãe desconhecido.
 *
 * As variâncias (h², repetibilidade, σP, σa) são sempre parâmetros de entrada vindos da
 * literatura; nada aqui as estima com os dados do rebanho.
 */
(function (raiz, fabrica) {
  "use strict";
  var api = fabrica();
  if (typeof module === "object" && module !== null && module.exports) {
    module.exports = api;
  } else if (raiz) {
    raiz.LabSeabra = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSAO = "0.1.0";   // versão do pacote Python portado (laboratorio/melhoramento)

  // =====================================================================================
  // Utilidades
  // =====================================================================================
  function soma(v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i];
    return s;
  }

  function media(v) {
    return soma(v) / v.length;
  }

  function ausente(x) {
    return x === null || x === undefined;
  }

  function unicos(lista) {
    const vistos = new Set();
    const saida = [];
    for (const x of lista) {
      if (!vistos.has(x)) {
        vistos.add(x);
        saida.push(x);
      }
    }
    return saida;
  }

  function temChave(obj, chave) {
    return obj !== null && obj !== undefined && Object.prototype.hasOwnProperty.call(obj, chave);
  }

  /** Formata como o "{x:.0f}" do Python (meio para o par). */
  function formatar0(x) {
    let r = Math.round(x);
    if (Math.abs(x - Math.trunc(x)) === 0.5) r = 2 * Math.round(x / 2);
    return String(r === 0 ? 0 : r);
  }

  /** Formata um float como o Python o escreve num f-string ("0.2", "1.0"). */
  function formatarFloat(x) {
    return Number.isInteger(x) ? x.toFixed(1) : String(x);
  }

  /** Eliminação de Gauss-Jordan com pivô parcial: devolve a inversa de M (n × n). */
  function inversa(M) {
    const n = M.length;
    const a = M.map((linha, i) => {
      const ext = linha.slice();
      for (let j = 0; j < n; j++) ext.push(i === j ? 1 : 0);
      return ext;
    });
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
      if (Math.abs(a[p][c]) < 1e-300) throw new Error("sistema singular: confira os dados");
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
  function resolver(M, b) {
    const n = M.length;
    const a = M.map((linha, i) => linha.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
      if (Math.abs(a[p][c]) < 1e-300) throw new Error("sistema singular: confira os dados");
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
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = a[i][n];
      for (let j = i + 1; j < n; j++) s -= a[i][j] * x[j];
      x[i] = s / a[i][i];
    }
    return x;
  }

  // =====================================================================================
  // taxas: núcleo numérico, intervalos de proporções, tamanho amostral, CUSUM
  // (porta de melhoramento/taxas.py)
  // =====================================================================================
  const EPS = 1e-15;          // tolerância relativa das frações continuadas e séries
  const FPMIN = 1e-300;       // evita divisão por zero no método de Lentz modificado
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
  function log_gama(x) {
    if (!(x > 0.0)) throw new RangeError("log_gama exige x > 0");
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - log_gama(1.0 - x);
    const z = x - 1.0;
    let s = LANCZOS_COEF[0];
    for (let k = 1; k < LANCZOS_COEF.length; k++) s += LANCZOS_COEF[k] / (z + k);
    const t = z + LANCZOS_G + 0.5;
    return 0.5 * Math.log(2.0 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(s);
  }

  function gamaIncSerie(a, x) {
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

  function gamaIncFracao(a, x) {
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
  function gama_incompleta_regularizada_q(a, x) {
    if (x < 0.0 || a <= 0.0) throw new RangeError("gama incompleta exige a > 0 e x >= 0");
    if (x === 0.0) return 1.0;
    if (x < a + 1.0) return 1.0 - gamaIncSerie(a, x);
    return gamaIncFracao(a, x);
  }

  /** erfc(x) = Q(½, x²) para x ≥ 0; erfc(−x) = 2 − erfc(x). */
  function erfc(x) {
    if (x < 0.0) return 2.0 - erfc(-x);
    if (x === 0.0) return 1.0;
    return gama_incompleta_regularizada_q(0.5, x * x);
  }

  function norm_pdf(z) {
    return Math.exp(-0.5 * z * z) / RAIZ_2PI;
  }

  /** Φ(z) = ½·erfc(−z/√2). */
  function norm_cdf(z) {
    return 0.5 * erfc(-z / Math.SQRT2);
  }

  // Coeficientes de Acklam (2003) para a inversa da normal.
  const ACK_A = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const ACK_B = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01];
  const ACK_C = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
    -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const ACK_D = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
    3.754408661907416e+00];
  const ACK_P_BAIXO = 0.02425;

  /** Quantil da normal padrão: Acklam + um passo de Halley; simetria para p > ½. */
  function norm_ppf(p) {
    if (!(p > 0.0 && p < 1.0)) throw new RangeError("norm_ppf exige 0 < p < 1");
    if (p > 0.5) return -norm_ppf(1.0 - p);
    const a = ACK_A, b = ACK_B, c = ACK_C, d = ACK_D;
    let x;
    if (p < ACK_P_BAIXO) {
      const q = Math.sqrt(-2.0 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1.0);
    } else {
      const q = p - 0.5;
      const r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
    }
    const e = norm_cdf(x) - p;
    const u = e * RAIZ_2PI * Math.exp(0.5 * x * x);
    return x - u / (1.0 + 0.5 * x * u);
  }

  function fracaoContinuadaBeta(x, a, b) {
    const qab = a + b;
    const qap = a + 1.0;
    const qam = a - 1.0;
    let c = 1.0;
    let d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    let h = d;
    for (let m = 1; m < MAX_ITER; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));          // termo par
      d = 1.0 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1.0 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1.0 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));    // termo ímpar
      d = 1.0 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1.0 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1.0 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1.0) < EPS) return h;
    }
    throw new Error("fração continuada da beta não convergiu");
  }

  /** I_x(a, b), beta incompleta regularizada (fração continuada de Lentz). */
  function beta_incompleta_regularizada(x, a, b) {
    if (a <= 0.0 || b <= 0.0) throw new RangeError("beta incompleta exige a > 0 e b > 0");
    if (x <= 0.0) return 0.0;
    if (x >= 1.0) return 1.0;
    const lnFrente = log_gama(a + b) - log_gama(a) - log_gama(b) + a * Math.log(x) + b * Math.log1p(-x);
    if (x < (a + 1.0) / (a + b + 2.0)) return Math.exp(lnFrente) * fracaoContinuadaBeta(x, a, b) / a;
    return 1.0 - Math.exp(lnFrente) * fracaoContinuadaBeta(1.0 - x, b, a) / b;
  }

  /** Quantil da Beta(a, b) por bisseção em [0, 1]. */
  function beta_quantil(p, a, b, tolerancia = 1e-14) {
    if (!(p >= 0.0 && p <= 1.0)) throw new RangeError("beta_quantil exige 0 <= p <= 1");
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

  function t_cdf(t, gl) {
    const cauda = 0.5 * beta_incompleta_regularizada(gl / (gl + t * t), 0.5 * gl, 0.5);
    return t >= 0.0 ? 1.0 - cauda : cauda;
  }

  function t_quantil(p, gl) {
    if (!(p > 0.0 && p < 1.0)) throw new RangeError("t_quantil exige 0 < p < 1");
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

  function zBicaudal(confianca) {
    return norm_ppf(1.0 - (1.0 - confianca) / 2.0);
  }

  function checaXn(x, n) {
    if (!(n > 0) || x < 0 || x > n) throw new RangeError(`taxa inválida: x = ${x}, n = ${n}`);
  }

  /** Wald: p ± z·√[p(1 − p)/n], sem truncar em 0 e 1 (de propósito). */
  function ic_wald(x, n, confianca = 0.95) {
    checaXn(x, n);
    const p = x / n;
    const meia = zBicaudal(confianca) * Math.sqrt(p * (1.0 - p) / n);
    return [p - meia, p + meia];
  }

  /** Wilson (1927), o escore invertido. */
  function ic_wilson(x, n, confianca = 0.95) {
    checaXn(x, n);
    const p = x / n;
    const z = zBicaudal(confianca);
    const den = 1.0 + z * z / n;
    const centro = (p + z * z / (2.0 * n)) / den;
    const meia = z * Math.sqrt(p * (1.0 - p) / n + z * z / (4.0 * n * n)) / den;
    return [Math.max(0.0, centro - meia), Math.min(1.0, centro + meia)];
  }

  /** Exato de Clopper e Pearson (1934), pelos quantis da Beta. */
  function ic_exato(x, n, confianca = 0.95) {
    checaXn(x, n);
    const alfa = 1.0 - confianca;
    const inferior = x === 0 ? 0.0 : beta_quantil(alfa / 2.0, x, n - x + 1);
    const superior = x === n ? 1.0 : beta_quantil(1.0 - alfa / 2.0, x + 1, n - x);
    return [inferior, superior];
  }

  /** Média a posteriori com priori Beta(a, b): (x + a)/(n + a + b). */
  function taxa_encolhida(x, n, a, b) {
    checaXn(x, n);
    return (x + a) / (n + a + b);
  }

  /** Média, desvio-padrão e intervalo t: [média, dp, inferior, superior]. */
  function ic_media_t(valores, confianca = 0.95) {
    const v = valores.map(Number);
    const n = v.length;
    if (n < 2) throw new RangeError("ic_media_t exige pelo menos 2 valores");
    const m = soma(v) / n;
    let sq = 0;
    for (const x of v) sq += (x - m) * (x - m);
    const dp = Math.sqrt(sq / (n - 1));
    const meia = t_quantil(1.0 - (1.0 - confianca) / 2.0, n - 1) * dp / Math.sqrt(n);
    return [m, dp, m - meia, m + meia];
  }

  /** Observações por grupo para detectar p1 ≠ p2 (bilateral), sem arredondar. */
  function tamanho_amostral_duas_proporcoes(p1, p2, alfa = 0.05, poder = 0.80, variancia = "agrupada") {
    if (p1 === p2) throw new RangeError("p1 e p2 precisam ser diferentes");
    const zA = norm_ppf(1.0 - alfa / 2.0);
    const zB = norm_ppf(poder);
    const varAlt = p1 * (1.0 - p1) + p2 * (1.0 - p2);
    let numerador;
    if (variancia === "agrupada") {
      const pm = 0.5 * (p1 + p2);
      numerador = Math.pow(zA * Math.sqrt(2.0 * pm * (1.0 - pm)) + zB * Math.sqrt(varAlt), 2);
    } else if (variancia === "separada") {
      numerador = Math.pow(zA + zB, 2) * varAlt;
    } else {
      throw new RangeError("variancia deve ser 'agrupada' ou 'separada'");
    }
    return numerador / Math.pow(p1 - p2, 2);
  }

  /** tamanho_amostral_duas_proporcoes arredondado para cima (animais inteiros). */
  function n_por_grupo(p1, p2, alfa = 0.05, poder = 0.80, variancia = "agrupada") {
    return Math.ceil(tamanho_amostral_duas_proporcoes(p1, p2, alfa, poder, variancia) - 1e-9);
  }

  /** Poder do teste bilateral de duas proporções com n por grupo. */
  function poder_duas_proporcoes(p1, p2, n, alfa = 0.05) {
    const zA = norm_ppf(1.0 - alfa / 2.0);
    const pm = 0.5 * (p1 + p2);
    const ep0 = Math.sqrt(2.0 * pm * (1.0 - pm) / n);
    const ep1 = Math.sqrt((p1 * (1.0 - p1) + p2 * (1.0 - p2)) / n);
    return norm_cdf((Math.abs(p1 - p2) - zA * ep0) / ep1);
  }

  /** CUSUM unilateral de Page (1954): [trajetória S_1..S_T, índice do 1º alarme ou null]. */
  function cusum(valores, alvo, folga, limite = null, lado = "superior") {
    if (lado !== "superior" && lado !== "inferior") throw new RangeError("lado deve ser 'superior' ou 'inferior'");
    let s = 0.0;
    const trajetoria = [];
    let alarme = null;
    valores.forEach((x, t) => {
      s = lado === "superior" ? Math.max(0.0, s + x - alvo - folga) : Math.max(0.0, s + alvo - folga - x);
      trajetoria.push(s);
      if (!ausente(limite) && alarme === null && s > limite) alarme = t;
    });
    return [trajetoria, alarme];
  }

  // =====================================================================================
  // confiabilidade: REL, filhas-equivalentes e conversões (porta de confiabilidade.py)
  // =====================================================================================
  /** REL = 1 − PEV/[(1 + F)·σ²a]. */
  function rel_de_pev(pev, sigma2_a, F = 0.0) {
    return 1.0 - pev / ((1.0 + F) * sigma2_a);
  }
  function r_de_rel(rel) { return Math.sqrt(rel); }
  function rel_de_r(r) { return r * r; }
  /** a_BIF = 1 − √(1 − REL). */
  function bif_de_rel(rel) { return 1.0 - Math.sqrt(1.0 - rel); }
  /** REL = 1 − (1 − a_BIF)². */
  function rel_de_bif(a_bif) { return 1.0 - (1.0 - a_bif) * (1.0 - a_bif); }
  function bif_de_r(r) { return bif_de_rel(r * r); }
  function r_de_bif(a_bif) { return Math.sqrt(rel_de_bif(a_bif)); }

  /** k_d = (4 − 2h²)/h²: mérito das companheiras conhecido (USDA: 14 com h² 0,25). */
  function k_d(h2) { return (4.0 - 2.0 * h2) / h2; }
  /** k = (4 − h²)/h²: companheiras desconhecidas, modelo de touro. */
  function k_touro(h2) { return (4.0 - h2) / h2; }
  function rel_de_de(de, k) { return de / (de + k); }
  /** DE = k·REL/(1 − REL): filhas-equivalentes para uma REL alvo. */
  function de_de_rel(rel, k) { return k * rel / (1.0 - rel); }

  /** REL de n filhas, cada uma num rebanho diferente: n/(n + k). */
  function rel_filhas(n_filhas, h2, merito_companheiras_conhecido = true) {
    const k = merito_companheiras_conhecido ? k_d(h2) : k_touro(h2);
    return rel_de_de(n_filhas, k);
  }

  /** DE de d filhas no mesmo rebanho: 1/(0,16 + 0,84/d) (VanRaden e Wiggans 1991, Tab. 2). */
  function de_filhas_mesmo_rebanho(d) { return 1.0 / (0.16 + 0.84 / d); }
  function h2_media_repetida(m, h2, r) { return m * h2 / (1.0 + (m - 1) * r); }
  function de_registros_proprios(m, h2, r) {
    const h2m = h2_media_repetida(m, h2, r);
    return k_d(h2) * h2m / (1.0 - h2m);
  }
  function de_filha_com_lactacoes(m, h2, r) { return k_d(h2) / k_d(h2_media_repetida(m, h2, r)); }
  /** REL_PA = (REL_pai + REL_mãe)/4. */
  function rel_media_pais(rel_pai, rel_mae) { return 0.25 * (rel_pai + rel_mae); }
  /** DE = DE_PA + DE_próprio + Σ DE_progênie; REL = DE/(DE + k_d). */
  function rel_total(h2, de_media_pais = 0.0, de_proprio = 0.0, de_progenie = 0.0) {
    return rel_de_de(de_media_pais + de_proprio + de_progenie, k_d(h2));
  }
  function daetwyler_rel(n_referencia, h2, me) { return n_referencia * h2 / (n_referencia * h2 + me); }
  function daetwyler_r(n_referencia, h2, me) { return Math.sqrt(daetwyler_rel(n_referencia, h2, me)); }
  function daetwyler_n_para_rel(rel, h2, me) { return me * rel / (h2 * (1.0 - rel)); }

  // =====================================================================================
  // indices: índice econômico, P(superar), MPPA e índice da fêmea (porta de indices.py)
  // =====================================================================================
  /** I = Σ v_k·PTA_k. */
  function indice_economico(valores, ptas) {
    let s = 0;
    for (let k = 0; k < valores.length; k++) s += valores[k] * ptas[k];
    return s;
  }

  /** Ênfase relativa: |v_k|·σ_k / Σ|v_j|·σ_j. */
  function enfase_relativa(valores, dp_ptas) {
    const w = valores.map((v, k) => Math.abs(v) * dp_ptas[k]);
    const total = soma(w);
    return w.map((x) => x / total);
  }

  /** Σ peso_k·sinal_k·PTA_k/σ_k. */
  function indice_padronizado(pesos, ptas, dp_ptas, sinais = null) {
    let s = 0;
    for (let k = 0; k < pesos.length; k++) s += pesos[k] * (ausente(sinais) ? 1 : sinais[k]) * ptas[k] / dp_ptas[k];
    return s;
  }

  /** DP do erro do índice: √[Σ v_k²·(1 − REL_k)·σ_k²]; REL pode ser número ou lista. */
  function dp_erro_indice(valores, confiabilidades, dp_ptas) {
    let s = 0;
    for (let k = 0; k < valores.length; k++) {
      const rel = Array.isArray(confiabilidades) ? confiabilidades[k] : confiabilidades;
      s += valores[k] * valores[k] * (1.0 - rel) * dp_ptas[k] * dp_ptas[k];
    }
    return Math.sqrt(s);
  }

  /** P(A ser de fato melhor que B) = Φ[(I_A − I_B)/√(DP_A² + DP_B²)]. */
  function prob_superar(indice_a, indice_b, dp_erro_a, dp_erro_b) {
    return norm_cdf((indice_a - indice_b) / Math.sqrt(dp_erro_a * dp_erro_a + dp_erro_b * dp_erro_b));
  }

  /** P(A transmitir mais que B) numa característica: var(erro da PTA) = (1 − REL)·σ²a/4. */
  function prob_superar_pta(pta_a, rel_a, pta_b, rel_b, sigma_a) {
    const varA = (1.0 - rel_a) * sigma_a * sigma_a / 4.0;
    const varB = (1.0 - rel_b) * sigma_a * sigma_a / 4.0;
    return norm_cdf((pta_a - pta_b) / Math.sqrt(varA + varB));
  }

  /** n·r/[1 + (n − 1)·r]. */
  function fator_mppa(n, r) { return n * r / (1.0 + (n - 1) * r); }

  /** MPPA = μ + [n·r/(1 + (n − 1)·r)]·(ȳ − μ). */
  function mppa(media_femea, n, r, media_rebanho = 0.0) {
    return media_rebanho + fator_mppa(n, r) * (media_femea - media_rebanho);
  }

  function ebv_registros_proprios(desvio_medio, n, h2, r) {
    return n * h2 / (1.0 + (n - 1) * r) * desvio_medio;
  }

  /**
   * EBV da fêmea por índice de seleção: registros próprios (x₁ = ȳ − μ) + PTA ou EBV do pai (x₂).
   * Devolve {ebv, pta, confiabilidade, pesos}, como o ResultadoIndiceFemea do Python.
   */
  function indice_femea(desvios, h2, r, sigma_p, pta_pai = null, rel_pai = 0.0, escala_pai = "PTA") {
    if (escala_pai !== "PTA" && escala_pai !== "EBV") throw new RangeError("escala_pai deve ser 'PTA' ou 'EBV'");
    const y = desvios.map(Number);
    const n = y.length;
    if (n === 0) throw new RangeError("indice_femea exige pelo menos um registro");
    const s2p = sigma_p * sigma_p;
    const s2a = h2 * s2p;
    const varX1 = s2p * (r + (1.0 - r) / n);
    let b, g, x;
    if (ausente(pta_pai) || !(rel_pai > 0.0)) {
      g = [s2a];
      x = [media(y)];
      b = [s2a / varX1];
    } else {
      let varX2, covX2;
      if (escala_pai === "PTA") {
        varX2 = rel_pai * s2a / 4.0;
        covX2 = rel_pai * s2a / 4.0;
      } else {
        varX2 = rel_pai * s2a;
        covX2 = rel_pai * s2a / 2.0;
      }
      g = [s2a, covX2];
      x = [media(y), pta_pai];
      b = resolver([[varX1, covX2], [covX2, varX2]], g);
    }
    let ebv = 0;
    let bg = 0;
    for (let k = 0; k < b.length; k++) {
      ebv += b[k] * x[k];
      bg += b[k] * g[k];
    }
    return { ebv: ebv, pta: ebv / 2.0, confiabilidade: bg / s2a, pesos: b };
  }

  // =====================================================================================
  // parentesco: A, F, A⁻¹, F de acasalamentos, Ne e ΔF (porta de parentesco.py)
  // =====================================================================================
  const DESCONHECIDOS = new Set(["0", "", "-", "NA"]);

  /** true se o identificador aponta para um animal (e não para pai/mãe desconhecido). */
  function conhecido(animal) {
    if (animal === null || animal === undefined || animal === 0 || animal === false) return false;
    return !(typeof animal === "string" && DESCONHECIDOS.has(animal));
  }

  /** Normaliza o pedigree em linhas [animal, pai|null, mãe|null] com identificadores em texto. */
  function linhasPedigree(ped) {
    let linhas;
    if (Array.isArray(ped)) {
      linhas = ped.map((l) => (Array.isArray(l) ? l : [l.animal !== undefined ? l.animal : l.id, l.pai, l.mae]));
    } else if (ped instanceof Map) {
      linhas = Array.from(ped, ([a, pais]) => [a, pais[0], pais[1]]);
    } else {
      linhas = Object.keys(ped).map((a) => [a, ped[a][0], ped[a][1]]);
    }
    const vistos = new Set();
    return linhas.map(([a, p, m]) => {
      if (!conhecido(a)) throw new Error("há uma linha do pedigree sem identificação do animal");
      const id = String(a);
      if (vistos.has(id)) throw new Error(`o animal ${id} aparece em mais de uma linha do pedigree`);
      vistos.add(id);
      return [id, conhecido(p) ? String(p) : null, conhecido(m) ? String(m) : null];
    });
  }

  /**
   * Ordena com os pais antes dos filhos (ordenação topológica estável, igual à do Python).
   * Devolve [ids, completo], em que completo é um Map animal → [pai, mãe] que inclui como fundadores
   * os pais citados sem linha própria. Lança erro se houver ciclo.
   */
  function ordenar_pedigree(ped) {
    const completo = new Map();
    for (const [a, p, m] of linhasPedigree(ped)) completo.set(a, [p, m]);
    for (const pais of Array.from(completo.values())) {
      for (const p of pais) if (p !== null && !completo.has(p)) completo.set(p, [null, null]);
    }
    const ordem = [];
    const feito = new Set();
    const emVisita = new Set();
    for (const raiz of Array.from(completo.keys())) {
      if (feito.has(raiz)) continue;
      const pilha = [[raiz, false]];
      while (pilha.length) {
        const [animal, paisProntos] = pilha.pop();
        if (feito.has(animal)) continue;
        if (paisProntos) {
          emVisita.delete(animal);
          feito.add(animal);
          ordem.push(animal);
          continue;
        }
        if (emVisita.has(animal)) throw new Error(`pedigree circular: ${animal} é ancestral de si mesmo`);
        emVisita.add(animal);
        pilha.push([animal, true]);
        const pais = completo.get(animal);
        for (let k = pais.length - 1; k >= 0; k--) {     // o pai é visitado antes da mãe
          const p = pais[k];
          if (p !== null && !feito.has(p)) pilha.push([p, false]);
        }
      }
    }
    return [ordem, completo];
  }

  function indicesDosPais(ids, completo) {
    const pos = new Map(ids.map((a, i) => [a, i]));
    return ids.map((a) => {
      const [pai, mae] = completo.get(a);
      return [pai !== null ? pos.get(pai) : -1, mae !== null ? pos.get(mae) : -1];
    });
  }

  /** A pelo método tabular: A_ij = ½(A_j,pai + A_j,mãe); A_ii = 1 + ½A_pai,mãe. Devolve [A, ids]. */
  function matriz_A(ped) {
    const [ids, completo] = ordenar_pedigree(ped);
    const pais = indicesDosPais(ids, completo);
    const n = ids.length;
    const A = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      const [s, d] = pais[i];
      for (let j = 0; j < i; j++) {
        let v = 0;
        if (s >= 0) v += 0.5 * A[s][j];
        if (d >= 0) v += 0.5 * A[d][j];
        A[i][j] = v;
        A[j][i] = v;
      }
      A[i][i] = 1.0 + (s >= 0 && d >= 0 ? 0.5 * A[s][d] : 0.0);
    }
    return [A, ids];
  }

  /** F_i = A_ii − 1 de cada animal: {animal: F}. */
  function coeficientes_F(ped) {
    const [A, ids] = matriz_A(ped);
    const F = {};
    ids.forEach((a, i) => { F[a] = A[i][i] - 1.0; });
    return F;
  }

  /** A⁻¹ pelas regras de Henderson (1976) com a correção de Quaas (1976). Devolve [A⁻¹, ids]. */
  function inversa_A(ped, F = null, considerar_endogamia = true) {
    const [ids, completo] = ordenar_pedigree(ped);
    const pais = indicesDosPais(ids, completo);
    const n = ids.length;
    let Fv;
    if (!considerar_endogamia) {
      Fv = new Array(n).fill(0);
    } else if (ausente(F)) {
      const [A] = matriz_A(ped);
      Fv = A.map((linha, i) => linha[i] - 1.0);
    } else {
      Fv = ids.map((a) => (temChave(F, a) ? Number(F[a]) : 0.0));
    }
    const Ainv = Array.from({ length: n }, () => new Array(n).fill(0));
    pais.forEach(([s, d], i) => {
      const conhecidos = [s, d].filter((p) => p >= 0);
      let di;
      if (conhecidos.length === 2) di = 0.5 - 0.25 * (Fv[s] + Fv[d]);
      else if (conhecidos.length === 1) di = 0.75 - 0.25 * Fv[conhecidos[0]];
      else di = 1.0;
      const alfa = 1.0 / di;
      const posicoes = [i].concat(conhecidos);
      const coef = [1.0].concat(conhecidos.map(() => -0.5));
      for (let u = 0; u < posicoes.length; u++) {
        for (let v = 0; v < posicoes.length; v++) Ainv[posicoes[u]][posicoes[v]] += alfa * coef[u] * coef[v];
      }
    });
    return [Ainv, ids];
  }

  function posicaoDe(ids, animal) {
    const i = ids.indexOf(String(animal));
    if (i < 0) throw new Error(`o animal ${animal} não está no pedigree`);
    return i;
  }

  /** Parentesco aditivo a_xy (elemento de A). */
  function parentesco(ped, x, y) {
    const [A, ids] = matriz_A(ped);
    return A[posicaoDe(ids, x)][posicaoDe(ids, y)];
  }

  /** F do filho de um acasalamento: ½·a_pai,mãe. */
  function F_acasalamento(ped, pai, mae) {
    return 0.5 * parentesco(ped, pai, mae);
  }

  /** F esperado de todos os pares: {macho: {fêmea: F}}. */
  function tabela_F_acasalamentos(ped, machos, femeas) {
    const [A, ids] = matriz_A(ped);
    const saida = {};
    for (const m of machos) {
      const im = posicaoDe(ids, m);
      saida[m] = {};
      for (const f of femeas) saida[m][f] = 0.5 * A[im][posicaoDe(ids, f)];
    }
    return saida;
  }

  /**
   * Para cada fêmea, [macho, F, respeita_limite]. Sem limite_F: o macho de menor F (empate fica com
   * o primeiro da lista). Com limite_F: a lista é a ordem de preferência, e o escolhido é o primeiro
   * macho com F ≤ limite; se nenhum respeitar o limite, fica o de menor F.
   */
  function escolher_reprodutores(ped, femeas, machos, limite_F = null) {
    const tabela = tabela_F_acasalamentos(ped, machos, femeas);
    const tolerancia = 1e-12;
    const escolhas = {};
    for (const f of femeas) {
      const valores = machos.map((m) => [m, tabela[m][f]]);
      let escolhido = null;
      if (!ausente(limite_F)) {
        const achado = valores.find(([, v]) => v <= limite_F + tolerancia);
        if (achado) escolhido = [achado[0], achado[1], true];
      }
      if (escolhido === null) {
        let melhor = valores[0];
        for (const mv of valores) if (mv[1] < melhor[1]) melhor = mv;
        escolhido = [melhor[0], melhor[1], ausente(limite_F) || melhor[1] <= limite_F + tolerancia];
      }
      escolhas[f] = escolhido;
    }
    return escolhas;
  }

  function escolher_reprodutor(ped, femea, machos, limite_F = null) {
    return escolher_reprodutores(ped, [femea], machos, limite_F)[femea];
  }

  /** Ne = 4·Nm·Nf/(Nm + Nf). */
  function ne_wright(n_machos, n_femeas) { return 4.0 * n_machos * n_femeas / (n_machos + n_femeas); }

  /** Nm = Ne·Nf/(4·Nf − Ne). */
  function n_machos_para_ne(ne_alvo, n_femeas) {
    if (ne_alvo >= 4.0 * n_femeas) throw new RangeError("Ne alvo inatingível com esse número de fêmeas");
    return ne_alvo * n_femeas / (4.0 * n_femeas - ne_alvo);
  }

  /** ΔF = 1/(2Ne). */
  function delta_F(ne) { return 1.0 / (2.0 * ne); }
  function ne_de_delta_F(df) { return 1.0 / (2.0 * df); }
  /** F_t = 1 − (1 − F₀)(1 − ΔF)^t; t pode ser fracionário. */
  function F_acumulado(df, geracoes, F0 = 0.0) { return 1.0 - (1.0 - F0) * Math.pow(1.0 - df, geracoes); }

  /** N_ef = 1/Σp² com uso desigual de reprodutores. */
  function numero_efetivo_pais(proporcoes) {
    const total = soma(proporcoes);
    let s = 0;
    for (const p of proporcoes) s += (p / total) * (p / total);
    return 1.0 / s;
  }

  // =====================================================================================
  // blup: DEP, Possible Change e modelo de touro (porta parcial de blup.py)
  // =====================================================================================
  function dep_de_ebv(ebv) { return ebv / 2.0; }

  /** PC = t·(1 − a_BIF)·σA/2 (BIF Guidelines, 9ª ed., p. 73). */
  function possible_change(acuracia_bif, sigma_a, t = 1.0) { return t * (1.0 - acuracia_bif) * sigma_a / 2.0; }

  /** Amplitude quando a coluna "acurácia" é r: t·(σA/2)·√(1 − r²) (tabela da ANCP). */
  function possible_change_de_r(r, sigma_a, t = 1.0) { return t * (sigma_a / 2.0) * Math.sqrt(1.0 - r * r); }

  /**
   * Modelo de touro com grupo de contemporâneos fixo e touros não aparentados:
   * y = GC + s + e, λ = (4 − h²)/h², EBV = 2ŝ, REL = 1 − λ·c^jj.
   * registros: [[grupo, touro, valor], ...]; prova_externa: {touro: [ebv, rel]};
   * fator_escala: {grupo: σ₀/σ_k}. Devolve {touros, ebv, confiabilidade, efeitos_grupo}.
   */
  function modelo_touro(registros, h2, prova_externa = null, fator_escala = null) {
    const externa = prova_externa || {};
    const escala = fator_escala || {};
    const grupos = unicos(registros.map((r) => r[0]));
    const touros = unicos(registros.map((r) => r[1]).concat(Object.keys(externa)));
    const ng = grupos.length;
    const nt = touros.length;
    const pg = new Map(grupos.map((g, i) => [g, i]));
    const pt = new Map(touros.map((t, j) => [t, ng + j]));
    const lam = k_touro(h2);
    const C = Array.from({ length: ng + nt }, () => new Array(ng + nt).fill(0));
    const rhs = new Array(ng + nt).fill(0);
    for (const [g, t, valor] of registros) {
      const v = Number(valor) * (temChave(escala, g) ? escala[g] : 1.0);
      const i = pg.get(g);
      const j = pt.get(t);
      C[i][i] += 1.0;
      C[j][j] += 1.0;
      C[i][j] += 1.0;
      C[j][i] += 1.0;
      rhs[i] += v;
      rhs[j] += v;
    }
    for (const t of touros) {
      const j = pt.get(t);
      C[j][j] += lam;
      if (temChave(externa, t)) {
        const [ebvExt, relExt] = externa[t];
        const de = lam * relExt / (1.0 - relExt);
        C[j][j] += de;
        rhs[j] += de * ebvExt / 2.0;
      }
    }
    const sol = resolver(C, rhs);
    const Ci = inversa(C);
    const ebv = {};
    const confiabilidade = {};
    const efeitos = {};
    for (const t of touros) {
      const j = pt.get(t);
      ebv[t] = 2.0 * sol[j];
      confiabilidade[t] = Math.max(0.0, 1.0 - lam * Ci[j][j]);
    }
    for (const g of grupos) efeitos[String(g)] = sol[pg.get(g)];
    return { touros: touros, ebv: ebv, confiabilidade: confiabilidade, efeitos_grupo: efeitos };
  }

  /**
   * REL exata de cada reprodutor pela PEV do modelo de touro, só a partir do desenho.
   * rebanhos: [{touro: nº de filhas}, ...], um por grupo; rel_externa: {touro: REL de fora}.
   */
  function rel_exata_modelo_touro(rebanhos, h2, rel_externa = null) {
    const registros = [];
    rebanhos.forEach((reb, g) => {
      for (const t of Object.keys(reb)) {
        const n = Math.trunc(reb[t]);
        for (let k = 0; k < n; k++) registros.push([g, t, 0.0]);
      }
    });
    const externa = {};
    for (const t of Object.keys(rel_externa || {})) externa[t] = [0.0, rel_externa[t]];
    return modelo_touro(registros, h2, externa).confiabilidade;
  }

  // =====================================================================================
  // lactacao: Fleischmann/TIM, regras da ICAR para pequenos ruminantes, sólidos e células
  // (porta de lactacao.py, sem os ajustes de curva)
  // =====================================================================================
  const ECM_DIVISOR_SJAUNJA = 3.140;
  const ECM_DIVISOR_4G_3_3P = 3.1138;

  /**
   * Objeto com os campos do dataclass Lactacao do Python. O passo a passo do cálculo fica na
   * propriedade não enumerável `trechos` (cada um: {de, ate, dias, m_inicio, m_fim, kg}), para a
   * interface mostrar a conta sem mudar a forma comparada com os vetores de teste.
   */
  function novaLactacao(total, ateDia, completa, tipo, nControles, avisos, trechos) {
    const r = { total: total, ate_dia: ateDia, completa: completa, tipo: tipo, n_controles: nControles, avisos: avisos };
    Object.defineProperty(r, "trechos", { value: trechos || [], enumerable: false, writable: true });
    return r;
  }

  /**
   * Fleischmann (TIM, método 2 da ICAR):
   * total = I₀·M₁ + Σ I_i·(M_i + M_{i+1})/2 + I_n·M_n, com corte no fim (interpolação linear) e
   * parada num hiato acima de intervalo_maximo (lactação incompleta).
   */
  function fleischmann(dias, producoes, fim, inicio = 0.0, intervalo_maximo = null) {
    const t = dias.map(Number);
    const m = producoes.map(Number);
    if (t.length !== m.length || t.length === 0) {
      throw new RangeError("dias e producoes precisam ter o mesmo tamanho (pelo menos 1 controle)");
    }
    for (let i = 1; i < t.length; i++) {
      if (!(t[i] > t[i - 1])) throw new RangeError("os dias dos controles precisam ser crescentes");
    }
    if (t[0] < inicio) throw new RangeError("há controle antes do início da lactação considerada");
    const trechos = [];
    const t1 = Math.min(t[0], fim);
    let total = (t1 - inicio) * m[0];
    if (t1 - inicio > 0) trechos.push({ de: inicio, ate: t1, dias: t1 - inicio, m_inicio: m[0], m_fim: m[0], kg: (t1 - inicio) * m[0] });
    for (let i = 0; i < t.length - 1; i++) {
      if (t[i] >= fim) return novaLactacao(total, fim, true, "TMY", t.length, [], trechos);
      if (!ausente(intervalo_maximo) && t[i + 1] - t[i] > intervalo_maximo) {
        return novaLactacao(total, t[i], false, "TMY", t.length,
          [`hiato de ${formatar0(t[i + 1] - t[i])} dias entre controles: o cálculo para no dia ${formatar0(t[i])} (lactação incompleta)`],
          trechos);
      }
      const t2 = Math.min(t[i + 1], fim);
      const m2 = m[i] + (m[i + 1] - m[i]) * (t2 - t[i]) / (t[i + 1] - t[i]);
      const kg = (t2 - t[i]) * (m[i] + m2) / 2.0;
      total += kg;
      trechos.push({ de: t[i], ate: t2, dias: t2 - t[i], m_inicio: m[i], m_fim: m2, kg: kg });
    }
    const ultimo = t[t.length - 1];
    if (ultimo < fim) {
      const kg = (fim - ultimo) * m[m.length - 1];
      total += kg;
      trechos.push({ de: ultimo, ate: fim, dias: fim - ultimo, m_inicio: m[m.length - 1], m_fim: m[m.length - 1], kg: kg });
    }
    return novaLactacao(total, fim, true, "TMY", t.length, [], trechos);
  }

  /** TIM de vacas (ICAR Procedure 2) até o dia `fim` (305). */
  function tim(dias, producoes, fim = 305.0) {
    return fleischmann(dias, producoes, fim).total;
  }

  /** Gordura ou proteína em kg: Fleischmann sobre leite × teor/100 de cada controle. */
  function producao_componente(dias, leite, teor_pct, fim, inicio = 0.0, intervalo_maximo = null) {
    const diario = leite.map((lt, i) => lt * teor_pct[i] / 100.0);
    return fleischmann(dias, diario, fim, inicio, intervalo_maximo).total;
  }

  /** Dia-fim pela ICAR: secagem real ou último controle + ½ intervalo, limitado ao comprimento. */
  function fim_icar(dias, comprimento = null, secagem = null, meio_intervalo = 15.0) {
    const ultimo = Number(dias[dias.length - 1]);
    const fim = !ausente(secagem) ? Number(secagem) : ultimo + meio_intervalo;
    return !ausente(comprimento) ? Math.min(fim, comprimento) : fim;
  }

  /**
   * Lactação de cabra ou ovelha pelas regras da Seção 16 da ICAR: TMY ou TMM (com a separação
   * das crias), janela do 1º controle, hiato máximo de 2 × o intervalo médio, mínimo de controles,
   * fim pela secagem ou pelo último controle + ½ intervalo. Os problemas viram `avisos`.
   */
  function lactacao_pequenos_ruminantes(dias, producoes, especie, secagem = null, separacao_crias = null,
    comprimento = null, intervalo_medio = null, minimo_controles = 3, producao_minima = 0.2) {
    if (especie !== "caprino" && especie !== "ovino") throw new RangeError("especie deve ser 'caprino' ou 'ovino'");
    if (ausente(intervalo_medio)) intervalo_medio = especie === "caprino" ? 30.0 : 35.0;
    const avisos = [];
    let t = dias.map(Number);
    let m = producoes.map(Number);
    let tipo = "TMY";
    let inicio = 0.0;
    if (!ausente(separacao_crias)) {
      tipo = "TMM";
      inicio = Number(separacao_crias);
      const mantidos = [];
      t.forEach((d, i) => { if (d > inicio) mantidos.push([d, m[i]]); });
      if (mantidos.length < t.length) avisos.push(`${t.length - mantidos.length} controle(s) durante a mamada descartado(s) (ICAR)`);
      t = mantidos.map((x) => x[0]);
      m = mantidos.map((x) => x[1]);
    }
    if (t.length < minimo_controles) {
      avisos.push(`só ${t.length} controle(s) válido(s); o mínimo é ${minimo_controles}`);
      return novaLactacao(NaN, NaN, false, tipo, t.length, avisos, []);
    }
    const limite1o = (tipo === "TMM" || especie === "ovino") ? inicio + 52.0 : 80.0;
    if (t[0] > limite1o) avisos.push(`1º controle no dia ${formatar0(t[0])}, depois do limite de ${formatar0(limite1o)} (ICAR)`);
    if (tipo === "TMY" && especie === "caprino" && t[0] < 6.0) avisos.push(`1º controle no dia ${formatar0(t[0])}, antes do 6º dia (ICAR)`);
    if (m.some((p) => p < producao_minima)) avisos.push(`controle abaixo da produção mínima medível de ${formatarFloat(producao_minima)} kg`);
    const fim = fim_icar(t, comprimento, secagem, intervalo_medio / 2.0);
    if (ausente(secagem)) avisos.push(`sem data de secagem: fim calculado no dia ${formatar0(fim)} (último + ½ intervalo)`);
    const resultado = fleischmann(t, m, fim, inicio, 2.0 * intervalo_medio);
    resultado.tipo = tipo;
    resultado.avisos = avisos.concat(resultado.avisos);
    return resultado;
  }

  /** Curva de Wood: y(t) = a·t^b·e^(−ct). Aceita número ou lista de dias. */
  function wood(t, a, b, c) {
    const f = (x) => a * Math.pow(x, b) * Math.exp(-c * x);
    return Array.isArray(t) ? t.map(f) : f(t);
  }
  /** Pico da Wood: [t_pico = b/c, y_pico = a·(b/c)^b·e^(−b)]. */
  function pico_wood(a, b, c) {
    const tp = b / c;
    return [tp, a * Math.pow(tp, b) * Math.exp(-b)];
  }
  function inflexao_wood(b, c) { return (b + Math.sqrt(b)) / c; }
  /** FCM 4% (Gaines): 0,4·leite + 15·gordura. */
  function fcm4(leite_kg, gordura_kg) { return 0.4 * leite_kg + 15.0 * gordura_kg; }
  /** ECM de Sjaunja et al. (1990), divisor declarado (3,140 por padrão). */
  function ecm(leite_kg, gordura_pct, proteina_pct, divisor = ECM_DIVISOR_SJAUNJA) {
    return leite_kg * (0.383 * gordura_pct + 0.242 * proteina_pct + 0.7832) / divisor;
  }
  /** ECS = log₂(CCS/100) + 3, CCS em mil células/mL. Aceita número ou lista. */
  function ecs(ccs_mil_por_ml) {
    const f = (x) => Math.log2(x / 100.0) + 3.0;
    return Array.isArray(ccs_mil_por_ml) ? ccs_mil_por_ml.map(f) : f(ccs_mil_por_ml);
  }
  function ccs_de_ecs(escore) { return 100.0 * Math.pow(2.0, escore - 3.0); }
  /** Média geométrica das contagens = 100·2^(ECS médio − 3). */
  function ccs_media_geometrica(ccs_mil_por_ml) { return ccs_de_ecs(media(ecs(ccs_mil_por_ml))); }
  function controle_at(ordenha_medida) { return 2.0 * ordenha_medida; }
  function controle_ac(ordenha_medida, tanque_total, tanque_da_ordenha_medida) {
    return ordenha_medida * tanque_total / tanque_da_ordenha_medida;
  }

  // =====================================================================================
  // ganho: intensidade, equação do criador, vias, tendência, absorção e DPR (porta de ganho.py)
  // =====================================================================================
  /** i = φ(z)/p, z = Φ⁻¹(1 − p), p = proporção selecionada. */
  function intensidade_selecao(proporcao_selecionada) {
    const p = proporcao_selecionada;
    if (!(p > 0.0 && p < 1.0)) throw new RangeError("a proporção selecionada deve estar entre 0 e 1");
    return norm_pdf(norm_ppf(1.0 - p)) / p;
  }

  /** Equação do criador: ΔG = i·r·σa/L. */
  function resposta_selecao(i, r, sigma_a, intervalo_geracao = 1.0) {
    return i * r * sigma_a / intervalo_geracao;
  }

  /** ΔG = Σ(i_k·r_k)·σa / ΣL_k; vias = [[i, r, L], ...] (Rendel e Robertson 1950). */
  function ganho_vias(vias, sigma_a) {
    let somaIr = 0;
    let somaL = 0;
    for (const [i, r, L] of vias) {
      somaIr += i * r;
      somaL += L;
    }
    return somaIr * sigma_a / somaL;
  }

  /** ΔG = ΣΔG_k / ΣL_k. */
  function ganho_diferenciais(diferenciais, intervalos) {
    return soma(diferenciais) / soma(intervalos);
  }

  /** Inclinação da regressão linear dos valores no ano. */
  function tendencia(anos, valores) {
    const mx = media(anos);
    const my = media(valores);
    let sxy = 0;
    let sxx = 0;
    for (let k = 0; k < anos.length; k++) {
      const xc = anos[k] - mx;
      sxy += xc * (valores[k] - my);
      sxx += xc * xc;
    }
    return sxy / sxx;
  }

  /** G_{t+1} = G_t + ½(R_t − G_t); R_{t+1} = R_t + T·L. */
  function absorcao(distancia_inicial, tendencia_anual, intervalo_geracao, geracoes) {
    let G = 0.0;
    let R = Number(distancia_inicial);
    const saida = [];
    for (let g = 1; g <= geracoes; g++) {
      G = G + 0.5 * (R - G);
      R = R + tendencia_anual * intervalo_geracao;
      saida.push({ geracao: g, anos: g * intervalo_geracao, rebanho: G, reprodutores: R, distancia: R - G });
    }
    return saida;
  }

  /** PR = 21/(DO − PEV + 11) × 100. */
  function dpr_aipl(dias_abertos, periodo_espera = 60.0) {
    return 100.0 * 21.0 / (dias_abertos - periodo_espera + 11.0);
  }

  /** DPR = 0,25·(233 − DO), DO limitado a [50, 250]. */
  function dpr_linear(dias_abertos) {
    const d = Math.min(250.0, Math.max(50.0, dias_abertos));
    return 0.25 * (233.0 - d);
  }

  // =====================================================================================
  // Assinaturas: nomes dos argumentos, na ordem do Python. Permitem chamar cada função com os
  // argumentos nomeados de vetores_teste.json e servem de guia para a porta em Dart.
  // =====================================================================================
  const ASSINATURAS = {
    "taxas.log_gama": ["x"],
    "taxas.erfc": ["x"],
    "taxas.gama_incompleta_regularizada_q": ["a", "x"],
    "taxas.norm_pdf": ["z"],
    "taxas.norm_cdf": ["z"],
    "taxas.norm_ppf": ["p"],
    "taxas.beta_incompleta_regularizada": ["x", "a", "b"],
    "taxas.beta_quantil": ["p", "a", "b", "tolerancia"],
    "taxas.t_cdf": ["t", "gl"],
    "taxas.t_quantil": ["p", "gl"],
    "taxas.ic_wald": ["x", "n", "confianca"],
    "taxas.ic_wilson": ["x", "n", "confianca"],
    "taxas.ic_exato": ["x", "n", "confianca"],
    "taxas.taxa_encolhida": ["x", "n", "a", "b"],
    "taxas.ic_media_t": ["valores", "confianca"],
    "taxas.tamanho_amostral_duas_proporcoes": ["p1", "p2", "alfa", "poder", "variancia"],
    "taxas.n_por_grupo": ["p1", "p2", "alfa", "poder", "variancia"],
    "taxas.poder_duas_proporcoes": ["p1", "p2", "n", "alfa"],
    "taxas.cusum": ["valores", "alvo", "folga", "limite", "lado"],

    "confiabilidade.rel_de_pev": ["pev", "sigma2_a", "F"],
    "confiabilidade.r_de_rel": ["rel"],
    "confiabilidade.rel_de_r": ["r"],
    "confiabilidade.bif_de_rel": ["rel"],
    "confiabilidade.rel_de_bif": ["a_bif"],
    "confiabilidade.bif_de_r": ["r"],
    "confiabilidade.r_de_bif": ["a_bif"],
    "confiabilidade.k_d": ["h2"],
    "confiabilidade.k_touro": ["h2"],
    "confiabilidade.rel_de_de": ["de", "k"],
    "confiabilidade.de_de_rel": ["rel", "k"],
    "confiabilidade.rel_filhas": ["n_filhas", "h2", "merito_companheiras_conhecido"],
    "confiabilidade.de_filhas_mesmo_rebanho": ["d"],
    "confiabilidade.h2_media_repetida": ["m", "h2", "r"],
    "confiabilidade.de_registros_proprios": ["m", "h2", "r"],
    "confiabilidade.de_filha_com_lactacoes": ["m", "h2", "r"],
    "confiabilidade.rel_media_pais": ["rel_pai", "rel_mae"],
    "confiabilidade.rel_total": ["h2", "de_media_pais", "de_proprio", "de_progenie"],
    "confiabilidade.daetwyler_rel": ["n_referencia", "h2", "me"],
    "confiabilidade.daetwyler_r": ["n_referencia", "h2", "me"],
    "confiabilidade.daetwyler_n_para_rel": ["rel", "h2", "me"],

    "indices.indice_economico": ["valores", "ptas"],
    "indices.enfase_relativa": ["valores", "dp_ptas"],
    "indices.indice_padronizado": ["pesos", "ptas", "dp_ptas", "sinais"],
    "indices.dp_erro_indice": ["valores", "confiabilidades", "dp_ptas"],
    "indices.prob_superar": ["indice_a", "indice_b", "dp_erro_a", "dp_erro_b"],
    "indices.prob_superar_pta": ["pta_a", "rel_a", "pta_b", "rel_b", "sigma_a"],
    "indices.fator_mppa": ["n", "r"],
    "indices.mppa": ["media_femea", "n", "r", "media_rebanho"],
    "indices.ebv_registros_proprios": ["desvio_medio", "n", "h2", "r"],
    "indices.indice_femea": ["desvios", "h2", "r", "sigma_p", "pta_pai", "rel_pai", "escala_pai"],

    "parentesco.ordenar_pedigree": ["ped"],
    "parentesco.matriz_A": ["ped"],
    "parentesco.coeficientes_F": ["ped"],
    "parentesco.inversa_A": ["ped", "F", "considerar_endogamia"],
    "parentesco.parentesco": ["ped", "x", "y"],
    "parentesco.F_acasalamento": ["ped", "pai", "mae"],
    "parentesco.tabela_F_acasalamentos": ["ped", "machos", "femeas"],
    "parentesco.escolher_reprodutor": ["ped", "femea", "machos", "limite_F"],
    "parentesco.escolher_reprodutores": ["ped", "femeas", "machos", "limite_F"],
    "parentesco.ne_wright": ["n_machos", "n_femeas"],
    "parentesco.n_machos_para_ne": ["ne_alvo", "n_femeas"],
    "parentesco.delta_F": ["ne"],
    "parentesco.ne_de_delta_F": ["df"],
    "parentesco.F_acumulado": ["df", "geracoes", "F0"],
    "parentesco.numero_efetivo_pais": ["proporcoes"],

    "blup.dep_de_ebv": ["ebv"],
    "blup.possible_change": ["acuracia_bif", "sigma_a", "t"],
    "blup.possible_change_de_r": ["r", "sigma_a", "t"],
    "blup.modelo_touro": ["registros", "h2", "prova_externa", "fator_escala"],
    "blup.rel_exata_modelo_touro": ["rebanhos", "h2", "rel_externa"],

    "lactacao.fleischmann": ["dias", "producoes", "fim", "inicio", "intervalo_maximo"],
    "lactacao.tim": ["dias", "producoes", "fim"],
    "lactacao.producao_componente": ["dias", "leite", "teor_pct", "fim", "inicio", "intervalo_maximo"],
    "lactacao.fim_icar": ["dias", "comprimento", "secagem", "meio_intervalo"],
    "lactacao.lactacao_pequenos_ruminantes": ["dias", "producoes", "especie", "secagem", "separacao_crias",
      "comprimento", "intervalo_medio", "minimo_controles", "producao_minima"],
    "lactacao.wood": ["t", "a", "b", "c"],
    "lactacao.pico_wood": ["a", "b", "c"],
    "lactacao.inflexao_wood": ["b", "c"],
    "lactacao.fcm4": ["leite_kg", "gordura_kg"],
    "lactacao.ecm": ["leite_kg", "gordura_pct", "proteina_pct", "divisor"],
    "lactacao.ecs": ["ccs_mil_por_ml"],
    "lactacao.ccs_de_ecs": ["escore"],
    "lactacao.ccs_media_geometrica": ["ccs_mil_por_ml"],
    "lactacao.controle_at": ["ordenha_medida"],
    "lactacao.controle_ac": ["ordenha_medida", "tanque_total", "tanque_da_ordenha_medida"],

    "ganho.intensidade_selecao": ["proporcao_selecionada"],
    "ganho.resposta_selecao": ["i", "r", "sigma_a", "intervalo_geracao"],
    "ganho.ganho_vias": ["vias", "sigma_a"],
    "ganho.ganho_diferenciais": ["diferenciais", "intervalos"],
    "ganho.tendencia": ["anos", "valores"],
    "ganho.absorcao": ["distancia_inicial", "tendencia_anual", "intervalo_geracao", "geracoes"],
    "ganho.dpr_aipl": ["dias_abertos", "periodo_espera"],
    "ganho.dpr_linear": ["dias_abertos"],
  };

  return {
    VERSAO: VERSAO,
    ASSINATURAS: ASSINATURAS,
    taxas: {
      log_gama, erfc, gama_incompleta_regularizada_q, norm_pdf, norm_cdf, norm_ppf,
      beta_incompleta_regularizada, beta_quantil, t_cdf, t_quantil,
      ic_wald, ic_wilson, ic_exato, taxa_encolhida, ic_media_t,
      tamanho_amostral_duas_proporcoes, n_por_grupo, poder_duas_proporcoes, cusum,
    },
    confiabilidade: {
      rel_de_pev, r_de_rel, rel_de_r, bif_de_rel, rel_de_bif, bif_de_r, r_de_bif,
      k_d, k_touro, rel_de_de, de_de_rel, rel_filhas, de_filhas_mesmo_rebanho,
      h2_media_repetida, de_registros_proprios, de_filha_com_lactacoes, rel_media_pais, rel_total,
      daetwyler_rel, daetwyler_r, daetwyler_n_para_rel,
    },
    indices: {
      indice_economico, enfase_relativa, indice_padronizado, dp_erro_indice, prob_superar,
      prob_superar_pta, fator_mppa, mppa, ebv_registros_proprios, indice_femea,
    },
    parentesco: {
      conhecido, ordenar_pedigree, matriz_A, coeficientes_F, inversa_A, parentesco, F_acasalamento,
      tabela_F_acasalamentos, escolher_reprodutor, escolher_reprodutores,
      ne_wright, n_machos_para_ne, delta_F, ne_de_delta_F, F_acumulado, numero_efetivo_pais,
    },
    blup: { dep_de_ebv, possible_change, possible_change_de_r, modelo_touro, rel_exata_modelo_touro },
    lactacao: {
      ECM_DIVISOR_SJAUNJA, ECM_DIVISOR_4G_3_3P,
      fleischmann, tim, producao_componente, fim_icar, lactacao_pequenos_ruminantes,
      wood, pico_wood, inflexao_wood, fcm4, ecm, ecs, ccs_de_ecs, ccs_media_geometrica, controle_at, controle_ac,
    },
    ganho: {
      intensidade_selecao, resposta_selecao, ganho_vias, ganho_diferenciais, tendencia, absorcao,
      dpr_aipl, dpr_linear,
    },
    algebra: { resolver, inversa },
  };
});
