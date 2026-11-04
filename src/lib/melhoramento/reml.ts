/**
 * REML — estimação das variâncias do modelo de repetibilidade DENTRO DA FAZENDA.
 *
 *     y = GC + a + pe + e ;  a ~ N(0, A·σ²a) ;  pe ~ N(0, I·σ²pe) ;  e ~ N(0, I·σ²e)
 *
 * POR QUE ISTO EXISTE, SE A REGRA DO MOTOR É NÃO ESTIMAR. Os relatórios dizem
 * para usar parâmetros da literatura num rebanho pequeno (a simulação do
 * relatório de corte mostra o desvio-padrão da h² estimada com 100 registros
 * de 0,30). O modelo "BLUP com variâncias estimadas na fazenda" entra AO LADO
 * dos de variância fixa justamente para a validação para frente medir, com os
 * dados, se estimar ajuda ou atrapalha. E ele só é usado quando a estimativa é
 * defensável: convergiu, tem dado, não está na fronteira e a h² se distingue
 * de zero (`julgarReml`). Fora disso a tela diz por quê e o modelo não roda.
 *
 * O ALGORITMO. AI-REML (Gilmour, Thompson e Cullis 1995; Johnson e Thompson
 * 1995), com passo de EM-REML quando o passo AI sai do espaço paramétrico ou
 * baixa a verossimilhança — a mesma estratégia do AIREMLF90 descrita no
 * tutorial do BLUPF90 (§5.1, p. 74), lida em
 * research_notes/estudo_software/blupf90_guia_de_traducao.md §3.2. As fórmulas
 * da derivada, da matriz de informação média e do passo EM são as do Capítulo
 * 17 de Mrode et al. (2023), Exemplo 17.7 (Chapter_17.R), que reml.test.ts
 * confere com 12 algarismos.
 *
 *   derivada   ∂L/∂σ²a = ½[â'A⁻¹â/σ⁴a − q/σ²a + tr(A⁻¹Cᵃᵃ)/σ⁴a]
 *              ∂L/∂σ²pe = ½[p̂'p̂/σ⁴pe − m/σ²pe + tr(Cᵖᵖ)/σ⁴pe]
 *              ∂L/∂σ²e = ½[ê'ê/σ⁴e − (N − p − q − m)/σ²e − tr(A⁻¹Cᵃᵃ)/(σ²a·σ²e) − tr(Cᵖᵖ)/(σ²pe·σ²e)]
 *   AI         AI_kl = ½·q_k'·P·q_l, com as "variáveis de trabalho"
 *              q_a = Zâ/σ²a, q_pe = Wp̂/σ²pe, q_e = ê/σ²e; P·q sai de UMA
 *              solução das MME com lado direito T'q.
 *   EM         σ²a = (â'A⁻¹â + tr(A⁻¹Cᵃᵃ))/q ; σ²pe = (p̂'p̂ + tr(Cᵖᵖ))/m ;
 *              σ²e = (y'y − ŝ'T'y)/(N − p)
 *   logL       −½[log|C| + log|G| + log|R| + y'Py] (sem constante; é o L do
 *              Chapter_17.R, pela identidade de Henderson).
 *   erro-padrão  a inversa da AI no ponto final dá a covariância assintótica
 *              dos σ²; h² e r vêm pelo método delta.
 *
 * A CONTA DE CADA VOLTA. O bloco do pe é absorvido (o mesmo complemento de
 * Schur de blup.ts); a matriz [GC, a] é fatorada por Cholesky ESPARSO com
 * grau mínimo (numerico.ts), e a inversa seletiva de Takahashi dá só os
 * elementos de C⁻¹ que os traços pedem (os pares não nulos de A⁻¹ e os de
 * cada nível do pe com os seus grupos e animais) — todos no padrão de L.
 *
 * O NÍVEL DO EFEITO AMBIENTAL é, por padrão, o próprio animal do registro (o
 * pe das lactações repetidas). `RegistroRepetibilidade.nivelPe` troca o dono:
 * no corte, o ambiente comum da MÃE (Mrode et al. 2023, Exemplo 5.2).
 *
 * Função pura: não lê banco nem relógio.
 */

import { MatrizEsparsa, fatorarEsparso, inversaSeletiva, resolver, resolverEsparso } from '@/lib/melhoramento/numerico';
import { endogamia, inversaAEsparsa, type PedigreeMontado } from '@/lib/melhoramento/parentesco';
import type { RegistroRepetibilidade } from '@/lib/melhoramento/blup';

export interface VarianciasReml {
  sigma2_a: number;
  /** null = modelo animal sem ambiente permanente (o do Exemplo 17.7). */
  sigma2_pe: number | null;
  sigma2_e: number;
}

/** Tudo o que uma volta calcula num ponto θ. Exportado para os testes. */
export interface AvaliacaoReml {
  logL: number;
  /** Derivadas na ordem [σ²a, σ²pe?, σ²e]. */
  derivada: number[];
  /** Matriz de informação média, mesma ordem. */
  ai: number[][];
  /** O passo de EM a partir deste ponto. */
  em: VarianciasReml;
  /** Soluções: grupos, EBV por animal de `ped.ids` e o pe no "dono" de cada nível. */
  grupos: Float64Array;
  ebv: Float64Array;
  pe: Float64Array;
  /** Para conferência: y'Py, traços e formas quadráticas. */
  yPy: number;
  tracoAC: number;
  tracoCpp: number;
  aAa: number;
  pp: number;
  ee: number;
}

export interface PassoReml {
  iteracao: number;
  passo: 'inicio' | 'ai' | 'em';
  logL: number;
  variancias: VarianciasReml;
}

export interface ResultadoReml {
  /** false = não estimado (grande demais, sem dado): ver `motivos`. */
  estimou: boolean;
  convergiu: boolean;
  iteracoes: number;
  variancias: VarianciasReml | null;
  h2: number | null;
  r: number | null;
  /** Erro-padrão aproximado (inversa da AI e método delta). null quando a AI é singular. */
  ep: { sigma2_a: number; sigma2_pe: number | null; sigma2_e: number; h2: number; r: number | null } | null;
  logL: number | null;
  incognitas: number;
  historico: PassoReml[];
  /** Só o julgamento (`julgarReml`) diz se é usável; aqui vão os motivos de não ter estimado. */
  motivos: string[];
}

export interface OpcoesReml {
  iteracoesMax?: number;
  /** Σ(Δθ)²/Σθ² abaixo disto = convergiu. */
  tolerancia?: number;
  limiteIncognitas?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Estruturas fixas do problema (não mudam entre voltas)
// ─────────────────────────────────────────────────────────────────────────────

/** Um nível do efeito ambiental (o pe da fêmea, ou o ambiente comum da mãe no corte). */
interface Nivel {
  /** Posição do "dono" do nível em `ped.ids` (a fêmea, ou a mãe). */
  dono: number;
  n: number;
  soma: number;
  grupos: [number, number][];
  animais: [number, number][];
}

interface Estrutura {
  na: number;
  nG: number;
  n: number;
  N: number;
  yy: number;
  /** T'T do bloco [GC, a] em triplas i ≤ j. */
  ttI: Int32Array;
  ttJ: Int32Array;
  ttV: Float64Array;
  /** T'y do bloco [GC, a]. */
  ty: Float64Array;
  /** A⁻¹ (sem λ) em triplas i ≤ j, posições de animal (0..na−1). */
  aiI: Int32Array;
  aiJ: Int32Array;
  aiV: Float64Array;
  /** Σ log dᵢ (Henderson): log|A|. */
  logDetA: number;
  niveis: Nivel[];
  /** Por registro: grupo, animal, y e o índice do nível. */
  regG: Int32Array;
  regA: Int32Array;
  regY: Float64Array;
  regN: Int32Array;
}

function incrementar(lista: [number, number][], chave: number): void {
  const x = lista.find((e) => e[0] === chave);
  if (x) x[1] += 1;
  else lista.push([chave, 1]);
}

function montarEstrutura(ped: PedigreeMontado, registros: readonly RegistroRepetibilidade[], nG: number): Estrutura {
  const na = ped.ids.length;
  const n = nG + na;
  const N = registros.length;
  const tt = new Map<number, number>();
  const somar = (i: number, j: number, v: number) => {
    const [a, b] = i <= j ? [i, j] : [j, i];
    const k = a * n + b;
    tt.set(k, (tt.get(k) ?? 0) + v);
  };
  const ty = new Float64Array(n);
  const indiceNivel = new Map<number, number>();
  const niveis: Nivel[] = [];
  const regG = new Int32Array(N);
  const regA = new Int32Array(N);
  const regY = new Float64Array(N);
  const regN = new Int32Array(N);
  let yy = 0;
  const comRegistro = new Uint8Array(nG);
  registros.forEach((r, q) => {
    const a = nG + r.animal;
    comRegistro[r.grupo] = 1;
    somar(r.grupo, r.grupo, 1);
    somar(r.grupo, a, 1);
    somar(a, a, 1);
    ty[r.grupo] += r.y;
    ty[a] += r.y;
    yy += r.y * r.y;
    regG[q] = r.grupo;
    regA[q] = r.animal;
    regY[q] = r.y;
    const dono = r.nivelPe ?? r.animal;
    let j = indiceNivel.get(dono);
    if (j == null) {
      j = niveis.length;
      indiceNivel.set(dono, j);
      niveis.push({ dono, n: 0, soma: 0, grupos: [], animais: [] });
    }
    regN[q] = j;
    const f = niveis[j];
    f.n += 1;
    f.soma += r.y;
    incrementar(f.grupos, r.grupo);
    incrementar(f.animais, r.animal);
  });
  for (let g = 0; g < nG; g++) {
    if (!comRegistro[g]) throw new Error(`grupo de contemporâneas ${g} sem registro: a matriz seria singular`);
  }
  const ttI = new Int32Array(tt.size);
  const ttJ = new Int32Array(tt.size);
  const ttV = new Float64Array(tt.size);
  let q = 0;
  for (const [k, v] of tt) {
    ttI[q] = Math.floor(k / n);
    ttJ[q] = k % n;
    ttV[q] = v;
    q += 1;
  }
  const F = endogamia(ped);
  const ainv = new Map<number, number>();
  let logDetA = 0;
  for (let i = 0; i < na; i++) {
    const s = ped.pai[i];
    const d = ped.mae[i];
    const fs = s >= 0 ? F[s] : -1;
    const fd = d >= 0 ? F[d] : -1;
    logDetA += Math.log(0.5 - 0.25 * (fs + fd));
  }
  inversaAEsparsa(ped, F, (i, j, v) => {
    if (i <= j) ainv.set(i * na + j, (ainv.get(i * na + j) ?? 0) + v);
  });
  const aiI = new Int32Array(ainv.size);
  const aiJ = new Int32Array(ainv.size);
  const aiV = new Float64Array(ainv.size);
  q = 0;
  for (const [k, v] of ainv) {
    aiI[q] = Math.floor(k / na);
    aiJ[q] = k % na;
    aiV[q] = v;
    q += 1;
  }
  return { na, nG, n, N, yy, ttI, ttJ, ttV, ty, aiI, aiJ, aiV, logDetA, niveis, regG, regA, regY, regN };
}

/** A coluna do nível j nas MME [GC, a]: n_jg nos grupos e n_ja nos animais. */
function colunaNivel(f: Nivel, nG: number): [number, number][] {
  return [...f.grupos, ...f.animais.map(([a, c]) => [nG + a, c] as [number, number])];
}

/**
 * Uma volta do REML no ponto `v`: monta e fatora as MME absorvidas, resolve,
 * e devolve logL, derivadas, AI e o passo EM. Exportada para os testes.
 */
export function avaliarReml(
  ped: PedigreeMontado,
  registros: readonly RegistroRepetibilidade[],
  nGrupos: number,
  v: VarianciasReml,
  estrutura?: unknown,
): AvaliacaoReml {
  const E = (estrutura as Estrutura | undefined) ?? montarEstrutura(ped, registros, nGrupos);
  const { na, nG, n, N } = E;
  const comPe = v.sigma2_pe != null;
  const lambdaA = v.sigma2_e / v.sigma2_a;
  const lambdaPe = comPe ? v.sigma2_e / v.sigma2_pe! : 0;

  // M* (σ²e-escalada, esparsa) e b*.
  const M = new MatrizEsparsa(n);
  for (let q = 0; q < E.ttV.length; q++) M.somarSimetrico(E.ttI[q], E.ttJ[q], E.ttV[q]);
  for (let q = 0; q < E.aiV.length; q++) M.somarSimetrico(nG + E.aiI[q], nG + E.aiJ[q], lambdaA * E.aiV[q]);
  const b = E.ty.slice();
  let somaLogD = 0;
  let b2Db2 = 0;
  const nn = E.niveis.length;
  const Dj = new Float64Array(nn);
  const colunas = E.niveis.map((f) => colunaNivel(f, nG));
  if (comPe) {
    E.niveis.forEach((f, j) => {
      const D = f.n + lambdaPe;
      Dj[j] = D;
      somaLogD += Math.log(D);
      b2Db2 += (f.soma * f.soma) / D;
      const c = colunas[j];
      for (let u = 0; u < c.length; u++) {
        b[c[u][0]] -= (c[u][1] * f.soma) / D;
        for (let w = u; w < c.length; w++) M.somarSimetrico(c[u][0], c[w][0], -(c[u][1] * c[w][1]) / D);
      }
    });
  }
  const fator = fatorarEsparso(M, Number.POSITIVE_INFINITY)!;
  const logDetM = fator.logDet;
  const s1 = resolverEsparso(fator, b);
  const recuperarPe = (sol: Float64Array, rhsPe: ArrayLike<number>) => {
    const p = new Float64Array(nn);
    if (comPe) {
      E.niveis.forEach((f, j) => {
        let x = rhsPe[j];
        for (const [u, c] of colunas[j]) x -= c * sol[u];
        p[j] = x / Dj[j];
      });
    }
    return p;
  };
  const peNivel = recuperarPe(
    s1,
    E.niveis.map((f) => f.soma),
  );
  let sr = b2Db2;
  for (let i = 0; i < n; i++) sr += s1[i] * b[i];
  const yPyEscalado = E.yy - sr; // = σ²e·y'Py

  // Resíduos e formas quadráticas.
  let ee = 0;
  const resid = new Float64Array(N);
  for (let q = 0; q < N; q++) {
    const e = E.regY[q] - s1[E.regG[q]] - s1[nG + E.regA[q]] - peNivel[E.regN[q]];
    resid[q] = e;
    ee += e * e;
  }
  let aAa = 0;
  for (let q = 0; q < E.aiV.length; q++) {
    const i = E.aiI[q];
    const j = E.aiJ[q];
    aAa += (i === j ? 1 : 2) * E.aiV[q] * s1[nG + i] * s1[nG + j];
  }
  let pp = 0;
  if (comPe) for (let j = 0; j < nn; j++) pp += peNivel[j] * peNivel[j];

  // Traços com a inversa seletiva (C σ²e-escalada): todos os pares pedidos
  // estão no padrão de M*, e portanto no de L.
  const Z = inversaSeletiva(fator);
  let trAC = 0;
  for (let q = 0; q < E.aiV.length; q++) {
    const i = E.aiI[q];
    const j = E.aiJ[q];
    trAC += (i === j ? 1 : 2) * E.aiV[q] * Z.elemento(nG + i, nG + j);
  }
  let trCpp = 0;
  if (comPe) {
    for (let j = 0; j < nn; j++) {
      const c = colunas[j];
      let quad = 0;
      for (let u = 0; u < c.length; u++) {
        for (let w = 0; w < c.length; w++) quad += c[u][1] * c[w][1] * Z.elemento(c[u][0], c[w][0]);
      }
      trCpp += 1 / Dj[j] + quad / (Dj[j] * Dj[j]);
    }
  }

  const s2a = v.sigma2_a;
  const s2e = v.sigma2_e;
  const s2p = v.sigma2_pe ?? 1;
  const qa = na;
  const m = comPe ? nn : 0;
  const yPy = yPyEscalado / s2e;
  const nTotal = nG + na + m;
  const logDetC = logDetM + somaLogD - nTotal * Math.log(s2e);
  const logDetG = qa * Math.log(s2a) + E.logDetA + (comPe ? m * Math.log(s2p) : 0);
  const logDetR = N * Math.log(s2e);
  const logL = -0.5 * (logDetC + logDetG + logDetR + yPy);

  // Derivadas (C verdadeira = σ²e · C escalada).
  const dA = 0.5 * (aAa / (s2a * s2a) - qa / s2a + (s2e * trAC) / (s2a * s2a));
  const dP = comPe ? 0.5 * (pp / (s2p * s2p) - m / s2p + (s2e * trCpp) / (s2p * s2p)) : 0;
  const dE = 0.5 * (ee / (s2e * s2e) - (N - nG - qa - m) / s2e - trAC / s2a - (comPe ? trCpp / s2p : 0));

  // AI: variáveis de trabalho e P·q por uma solução das MME cada.
  const qA = new Float64Array(N);
  const qP = new Float64Array(N);
  const qE = new Float64Array(N);
  for (let q = 0; q < N; q++) {
    qA[q] = s1[nG + E.regA[q]] / s2a;
    if (comPe) qP[q] = peNivel[E.regN[q]] / s2p;
    qE[q] = resid[q] / s2e;
  }
  const variaveis = comPe ? [qA, qP, qE] : [qA, qE];
  const Pq = variaveis.map((qv) => {
    const rhs = new Float64Array(n);
    const rhsPe = new Float64Array(nn);
    for (let q = 0; q < N; q++) {
      rhs[E.regG[q]] += qv[q];
      rhs[nG + E.regA[q]] += qv[q];
      if (comPe) rhsPe[E.regN[q]] += qv[q];
    }
    if (comPe) {
      for (let j = 0; j < nn; j++) for (const [u, c] of colunas[j]) rhs[u] -= (c * rhsPe[j]) / Dj[j];
    }
    const s = resolverEsparso(fator, rhs);
    const sp = recuperarPe(s, rhsPe);
    const out = new Float64Array(N);
    for (let q = 0; q < N; q++) {
      const ajuste = s[E.regG[q]] + s[nG + E.regA[q]] + (comPe ? sp[E.regN[q]] : 0);
      out[q] = (qv[q] - ajuste) / s2e;
    }
    return out;
  });
  const k = variaveis.length;
  const ai = Array.from({ length: k }, () => new Array<number>(k).fill(0));
  for (let u = 0; u < k; u++) {
    for (let w = u; w < k; w++) {
      let s = 0;
      for (let q = 0; q < N; q++) s += variaveis[u][q] * Pq[w][q];
      ai[u][w] = 0.5 * s;
      ai[w][u] = 0.5 * s;
    }
  }

  const pe = new Float64Array(na);
  E.niveis.forEach((f, j) => {
    pe[f.dono] = peNivel[j];
  });
  const em: VarianciasReml = {
    sigma2_a: (aAa + s2e * trAC) / qa,
    sigma2_pe: comPe ? (pp + s2e * trCpp) / m : null,
    sigma2_e: yPyEscalado / (N - nG),
  };
  return {
    logL,
    derivada: comPe ? [dA, dP, dE] : [dA, dE],
    ai,
    em,
    grupos: s1.slice(0, nG),
    ebv: s1.slice(nG, nG + na),
    pe,
    yPy,
    tracoAC: trAC,
    tracoCpp: trCpp,
    aAa,
    pp,
    ee,
  };
}

/** Um passo AI: θ + AI⁻¹·derivada. */
export function passoAi(v: VarianciasReml, av: AvaliacaoReml): VarianciasReml {
  const theta = v.sigma2_pe != null ? [v.sigma2_a, v.sigma2_pe, v.sigma2_e] : [v.sigma2_a, v.sigma2_e];
  const delta = resolver(av.ai, av.derivada);
  const novo = theta.map((t, i) => t + delta[i]);
  return v.sigma2_pe != null
    ? { sigma2_a: novo[0], sigma2_pe: novo[1], sigma2_e: novo[2] }
    : { sigma2_a: novo[0], sigma2_pe: null, sigma2_e: novo[1] };
}

function vetor(v: VarianciasReml): number[] {
  return v.sigma2_pe != null ? [v.sigma2_a, v.sigma2_pe, v.sigma2_e] : [v.sigma2_a, v.sigma2_e];
}

function valido(v: VarianciasReml, piso: number): boolean {
  return vetor(v).every((x) => Number.isFinite(x) && x > piso);
}

/**
 * AI-REML com fuga para EM. Começa em `inicial` (na prática, os parâmetros da
 * literatura na escala da fazenda). Nunca lança: devolve `estimou: false` e o
 * motivo quando não dá.
 */
export function estimarReml(
  ped: PedigreeMontado,
  registros: readonly RegistroRepetibilidade[],
  nGrupos: number,
  inicial: VarianciasReml,
  opcoes: OpcoesReml = {},
): ResultadoReml {
  const iteracoesMax = opcoes.iteracoesMax ?? 40;
  const tol = opcoes.tolerancia ?? 1e-10;
  const limite = opcoes.limiteIncognitas ?? Number.POSITIVE_INFINITY;
  const incognitas = nGrupos + ped.ids.length;
  const vazio: ResultadoReml = {
    estimou: false,
    convergiu: false,
    iteracoes: 0,
    variancias: null,
    h2: null,
    r: null,
    ep: null,
    logL: null,
    incognitas,
    historico: [],
    motivos: [],
  };
  if (incognitas > limite) {
    return {
      ...vazio,
      motivos: [
        `${incognitas} incógnitas em [grupos, animais]: acima do teto de ${limite} do REML denso desta versão`,
      ],
    };
  }
  let E: Estrutura;
  try {
    E = montarEstrutura(ped, registros, nGrupos);
  } catch (e) {
    return { ...vazio, motivos: [e instanceof Error ? e.message : String(e)] };
  }
  const total = vetor(inicial).reduce((s, x) => s + x, 0);
  const piso = 1e-8 * total;
  let v = inicial;
  let av: AvaliacaoReml;
  try {
    av = avaliarReml(ped, registros, nGrupos, v, E);
  } catch (e) {
    return { ...vazio, motivos: [`as MME não fatoraram no ponto inicial: ${e instanceof Error ? e.message : String(e)}`] };
  }
  const historico: PassoReml[] = [{ iteracao: 0, passo: 'inicio', logL: av.logL, variancias: v }];
  let convergiu = false;
  let it = 0;
  for (it = 1; it <= iteracoesMax; it++) {
    // Passo AI; se sair do espaço, meio passo até 5 vezes; depois, EM.
    let candidato: VarianciasReml | null = null;
    let passo: 'ai' | 'em' = 'ai';
    try {
      const ai = passoAi(v, av);
      const dir = vetor(ai).map((x, i) => x - vetor(v)[i]);
      for (let tentativa = 0, f = 1; tentativa < 6; tentativa++, f /= 2) {
        const t = vetor(v).map((x, i) => x + f * dir[i]);
        const c: VarianciasReml =
          v.sigma2_pe != null
            ? { sigma2_a: t[0], sigma2_pe: t[1], sigma2_e: t[2] }
            : { sigma2_a: t[0], sigma2_pe: null, sigma2_e: t[1] };
        if (valido(c, piso)) {
          candidato = c;
          break;
        }
      }
    } catch {
      candidato = null;
    }
    let novo: AvaliacaoReml | null = null;
    if (candidato) {
      try {
        novo = avaliarReml(ped, registros, nGrupos, candidato, E);
        if (novo.logL < av.logL - 1e-8 * Math.max(1, Math.abs(av.logL))) novo = null; // AI piorou: EM
      } catch {
        novo = null;
      }
    }
    if (!novo) {
      passo = 'em';
      candidato = av.em;
      if (!valido(candidato, 0)) break;
      try {
        novo = avaliarReml(ped, registros, nGrupos, candidato, E);
      } catch {
        break;
      }
    }
    const antes = vetor(v);
    const depois = vetor(candidato!);
    let num = 0;
    let den = 0;
    for (let i = 0; i < antes.length; i++) {
      num += (depois[i] - antes[i]) ** 2;
      den += depois[i] ** 2;
    }
    v = candidato!;
    av = novo;
    historico.push({ iteracao: it, passo, logL: av.logL, variancias: v });
    if (num / den < tol) {
      convergiu = true;
      break;
    }
    // Fronteira: um componente encolhendo para zero não converge no AI; para
    // em vez de gastar voltas (o julgamento marca a fronteira).
    if (vetor(v).some((x) => x < 1e-4 * depois.reduce((s, y) => s + y, 0)) && it >= 8) break;
  }

  const S = v.sigma2_a + (v.sigma2_pe ?? 0) + v.sigma2_e;
  const h2 = v.sigma2_a / S;
  const r = v.sigma2_pe != null ? (v.sigma2_a + v.sigma2_pe) / S : null;
  let ep: ResultadoReml['ep'] = null;
  try {
    const k = av.ai.length;
    const cov = av.ai.map((_, i) => resolver(av.ai, av.ai.map((__, j) => (i === j ? 1 : 0))));
    const theta = vetor(v);
    // Gradientes de h² e r em θ.
    const gh = theta.map((_, i) => (i === 0 ? (S - v.sigma2_a) / (S * S) : -v.sigma2_a / (S * S)));
    const gr =
      v.sigma2_pe != null
        ? theta.map((_, i) => (i < 2 ? v.sigma2_e / (S * S) : -(v.sigma2_a + v.sigma2_pe!) / (S * S)))
        : null;
    const quad = (g: number[]) => {
      let s = 0;
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) s += g[i] * cov[i][j] * g[j];
      return Math.sqrt(Math.max(0, s));
    };
    const dp = cov.map((linha, i) => Math.sqrt(Math.max(0, linha[i])));
    ep = {
      sigma2_a: dp[0],
      sigma2_pe: v.sigma2_pe != null ? dp[1] : null,
      sigma2_e: dp[k - 1],
      h2: quad(gh),
      r: gr ? quad(gr) : null,
    };
    if (![ep.sigma2_a, ep.sigma2_e, ep.h2].every(Number.isFinite)) ep = null;
  } catch {
    ep = null;
  }
  return {
    estimou: true,
    convergiu,
    iteracoes: Math.min(it, iteracoesMax),
    variancias: v,
    h2,
    r,
    ep,
    logL: av.logL,
    incognitas,
    historico,
    motivos: convergiu ? [] : [`não convergiu em ${iteracoesMax} voltas`],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Julgamento: a estimativa é usável?
// ─────────────────────────────────────────────────────────────────────────────

export interface CriteriosReml {
  registrosMinimos: number;
  femeasRepetidasMinimas: number;
}

export interface JulgamentoReml {
  usar: boolean;
  motivos: string[];
}

/** h² e a fração de pe abaixo disto, ou h² acima de 1 − isto: fronteira do espaço. */
export const FRONTEIRA = 0.01;

/**
 * Regras, todas com o número na frase: não estimou; não convergiu; poucas
 * lactações; poucas fêmeas com 2+ lactações (sem elas o pe não se separa do
 * resíduo); h² ou pe na fronteira; h² que não se distingue de zero (IC 95%
 * aproximado, h² − 1,96·EP ≤ 0) ou sem erro-padrão.
 */
export function julgarReml(
  res: ResultadoReml,
  dados: { registros: number; femeasRepetidas: number },
  c: CriteriosReml,
): JulgamentoReml {
  const motivos: string[] = [];
  const pct = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')}%`;
  const dec = (x: number) => x.toFixed(2).replace('.', ',');
  if (dados.registros < c.registrosMinimos) {
    motivos.push(`pouco dado: ${dados.registros} lactações (o mínimo para usar o REML é ${c.registrosMinimos})`);
  }
  if (dados.femeasRepetidas < c.femeasRepetidasMinimas) {
    motivos.push(
      `pouco dado repetido: ${dados.femeasRepetidas} fêmeas com 2+ lactações (o mínimo é ${c.femeasRepetidasMinimas})`,
    );
  }
  if (!res.estimou) motivos.push(...res.motivos);
  else {
    if (!res.convergiu) motivos.push(...res.motivos);
    const v = res.variancias!;
    const S = v.sigma2_a + (v.sigma2_pe ?? 0) + v.sigma2_e;
    if (res.h2 != null && (res.h2 < FRONTEIRA || res.h2 > 1 - FRONTEIRA)) {
      motivos.push(`h² na fronteira do espaço (${pct(res.h2)})`);
    }
    if (v.sigma2_pe != null && v.sigma2_pe / S < FRONTEIRA) {
      motivos.push(`ambiente permanente na fronteira (${pct(v.sigma2_pe / S)} da variância fenotípica)`);
    }
    if (!res.ep) motivos.push('sem erro-padrão: a matriz de informação ficou singular');
    else if (res.h2 != null && res.h2 - 1.96 * res.ep.h2 <= 0) {
      motivos.push(`h² ${dec(res.h2)} ± ${dec(res.ep.h2)}: o intervalo de 95% inclui zero`);
    }
  }
  return { usar: motivos.length === 0, motivos };
}
