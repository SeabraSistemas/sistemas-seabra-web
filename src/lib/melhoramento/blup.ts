/**
 * BLUP — o modelo animal.
 *
 * Duas camadas, como no resto do módulo:
 *
 * 1. `modelo_animal`: a PORTA de melhoramento/blup.py, densa, com os mesmos
 *    argumentos e a mesma forma de saída (ResultadoModeloAnimal), conferida
 *    contra vetores_teste.json (relatório de corte; Mrode et al. 2023,
 *    Exemplo 5.2) e contra os Exemplos 4.1 e 5.1 de Mrode em mrode.test.ts.
 *    Grupos genéticos de pais desconhecidos (Exemplo 4.4) não foram portados:
 *    o módulo não os usa, e a função recusa em vez de ignorar.
 *
 * 2. `modeloRepetibilidade`: o mesmo modelo, montado de forma ESPARSA para o
 *    rebanho de uma fazenda real:
 *
 *        y = GC + a + pe + e ;  a ~ N(0, A·σ²a) ;  pe ~ N(0, I·σ²pe) ;  e ~ N(0, I·σ²e)
 *
 *    com o grupo de contemporâneas fixo, A⁻¹ de Henderson/Quaas sem montar A
 *    (parentesco.ts) e um nível de ambiente permanente por fêmea com registro.
 *    Até `limiteDenso` incógnitas, resolve por Cholesky denso e tira a PEV
 *    exata só dos animais pedidos; acima disso, Gauss-Seidel esparso, sem PEV
 *    (e a tela diz). Os testes conferem os dois caminhos contra a porta.
 *
 * As variâncias são SEMPRE parâmetros (h², r e a escala σ²P): nada aqui as
 * estima com o rebanho. EBV, ranking e confiabilidade não dependem de σ²P —
 * só das razões λ —, e por isso a escala pode vir do próprio dado sem que isso
 * seja "estimar parâmetro": ela só põe a PEV em litros².
 */

import {
  MatrizEsparsa,
  choleskyDiagonalInversa,
  choleskyEmLugar,
  choleskyResolver,
  gaussSeidelEsparso,
  inversa,
  resolver,
} from '@/lib/melhoramento/numerico';
import { bif_de_rel, rel_de_pev } from '@/lib/melhoramento/indices';
import {
  conhecido,
  endogamia,
  inversaAEsparsa,
  inversa_A,
  matriz_A,
  type PedigreeMontado,
} from '@/lib/melhoramento/parentesco';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Porta densa do motor
// ─────────────────────────────────────────────────────────────────────────────

export interface ResultadoModeloAnimal {
  ids: string[];
  efeitos_fixos: Record<string, number>;
  ebv: number[];
  pev: number[];
  F: number[];
  confiabilidade: number[];
  acuracia: number[];
  acuracia_bif: number[];
  dep: number[];
  sep_dep: number[];
  ambiente_permanente: Record<string, number> | null;
  grupos_geneticos: Record<string, number> | null;
}

type Pedigree = Record<string, readonly [unknown, unknown]>;

/** Níveis na ordem do primeiro registro de cada um (como `incidencia` do Python). */
function niveisDe(rotulos: readonly unknown[]): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const r of rotulos) {
    const k = String(r);
    if (!vistos.has(k)) {
      vistos.add(k);
      saida.push(k);
    }
  }
  return saida;
}

/**
 * Modelo animal unicaracterística (relatório de corte, Passos 2 e 3):
 *   y = Xb + Za + Wp + e
 * ped: {animal: [pai, mãe]}; animais, y e grupos: um elemento por registro.
 * Animais com registro fora do pedigree entram como fundadores.
 */
export function modelo_animal(
  ped: Pedigree,
  animais: readonly unknown[],
  y: readonly number[],
  grupos: readonly unknown[],
  sigma2_a: number,
  sigma2_e: number,
  sigma2_pe: number | null = null,
  covariaveis: Record<string, readonly number[]> | null = null,
  outros_fatores: Record<string, readonly unknown[]> | null = null,
  rotulos_pe: readonly unknown[] | null = null,
  grupos_geneticos: readonly unknown[] | null = null,
): ResultadoModeloAnimal {
  if (grupos_geneticos && grupos_geneticos.length > 0) {
    throw new Error('grupos genéticos de pais desconhecidos não foram portados nesta versão');
  }
  if (rotulos_pe != null && sigma2_pe == null) throw new Error('rotulos_pe exige sigma2_pe');

  // _pedigree_com_registros: acrescenta como fundadores os animais com registro fora do pedigree.
  const pedC: Pedigree = { ...ped };
  for (const a of animais) {
    if (conhecido(a) && !Object.prototype.hasOwnProperty.call(pedC, String(a))) pedC[String(a)] = [null, null];
  }
  const [Ainv, ids] = inversa_A(pedC);
  const [A] = matriz_A(pedC);
  const F = A.map((linha, i) => linha[i] - 1.0);
  const n = ids.length;
  const posAnimal = new Map(ids.map((a, i) => [a, i]));

  // Colunas de X: GC (todas), outros fatores (sem o primeiro nível), covariáveis.
  const niveisGC = niveisDe(grupos);
  const nomesFixos = niveisGC.map((g) => `GC=${g}`);
  const fatores = Object.entries(outros_fatores ?? {}).map(([nome, rotulos]) => {
    const nv = niveisDe(rotulos);
    nomesFixos.push(...nv.slice(1).map((v) => `${nome}=${v}`));
    return { rotulos, pos: new Map(nv.map((v, j) => [v, j])) };
  });
  const covs = Object.entries(covariaveis ?? {});
  for (const [nome] of covs) nomesFixos.push(nome);
  const nx = nomesFixos.length;

  const niveisPe = sigma2_pe != null ? niveisDe(rotulos_pe ?? animais) : [];
  const posPe = new Map(niveisPe.map((v, j) => [v, j]));
  const total = nx + n + niveisPe.length;

  const LHS = Array.from({ length: total }, () => new Array<number>(total).fill(0));
  const RHS = new Array<number>(total).fill(0);
  const posGC = new Map(niveisGC.map((g, j) => [g, j]));

  for (let r = 0; r < y.length; r++) {
    const cols: [number, number][] = [[posGC.get(String(grupos[r]))!, 1]];
    let deslocamento = niveisGC.length;
    for (const f of fatores) {
      const j = f.pos.get(String(f.rotulos[r]))!;
      if (j > 0) cols.push([deslocamento + j - 1, 1]);
      deslocamento += f.pos.size - 1;
    }
    for (const [, valores] of covs) {
      cols.push([deslocamento, Number(valores[r])]);
      deslocamento += 1;
    }
    cols.push([nx + posAnimal.get(String(animais[r]))!, 1]);
    if (sigma2_pe != null) cols.push([nx + n + posPe.get(String((rotulos_pe ?? animais)[r]))!, 1]);
    const yr = Number(y[r]);
    for (const [i, vi] of cols) {
      RHS[i] += vi * yr;
      for (const [j, vj] of cols) LHS[i][j] += vi * vj;
    }
  }
  const lambdaA = sigma2_e / sigma2_a;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) LHS[nx + i][nx + j] += lambdaA * Ainv[i][j];
  if (sigma2_pe != null) {
    const lambdaPe = sigma2_e / sigma2_pe;
    for (let j = 0; j < niveisPe.length; j++) LHS[nx + n + j][nx + n + j] += lambdaPe;
  }

  const sol = resolver(LHS, RHS);
  const C = inversa(LHS);
  const ebv = sol.slice(nx, nx + n);
  const pev = ids.map((_, i) => C[nx + i][nx + i] * sigma2_e);
  const rel = pev.map((p, i) => Math.min(1, Math.max(0, rel_de_pev(p, sigma2_a, F[i]))));
  const efeitos: Record<string, number> = {};
  nomesFixos.forEach((nome, j) => {
    efeitos[nome] = sol[j];
  });
  let pe: Record<string, number> | null = null;
  if (sigma2_pe != null) {
    pe = {};
    niveisPe.forEach((v, j) => {
      pe![v] = sol[nx + n + j];
    });
  }
  return {
    ids,
    efeitos_fixos: efeitos,
    ebv,
    pev,
    F,
    confiabilidade: rel,
    acuracia: rel.map(Math.sqrt),
    acuracia_bif: rel.map(bif_de_rel),
    dep: ebv.map((e) => e / 2.0),
    sep_dep: pev.map((p) => Math.sqrt(p) / 2.0),
    ambiente_permanente: pe,
    grupos_geneticos: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Modelo de repetibilidade esparso, para uma fazenda real
// ─────────────────────────────────────────────────────────────────────────────

export interface Variancias {
  sigma2_a: number;
  sigma2_pe: number;
  sigma2_e: number;
}

/**
 * σ²a = h²·σ²P ; σ²pe = (r − h²)·σ²P ; σ²e = (1 − r)·σ²P.
 * Repetibilidade é a correlação entre lactações da mesma fêmea, então r ≥ h²
 * sempre; r = h² seria "nenhum ambiente permanente" e pede outro modelo.
 */
export function variancias(h2: number, r: number, sigma2p: number): Variancias {
  if (!(h2 > 0 && h2 < 1)) throw new RangeError('h² precisa estar entre 0 e 1');
  if (!(r > h2 && r < 1)) throw new RangeError('a repetibilidade precisa ser maior que h² e menor que 1');
  if (!(sigma2p > 0)) throw new RangeError('σ²P precisa ser positiva');
  return { sigma2_a: h2 * sigma2p, sigma2_pe: (r - h2) * sigma2p, sigma2_e: (1 - r) * sigma2p };
}

export interface RegistroRepetibilidade {
  /** Posição do animal em `ped.ids`. */
  animal: number;
  /** Índice do grupo de contemporâneas, 0..nGrupos−1. Todo grupo precisa de registro. */
  grupo: number;
  y: number;
}

export interface OpcoesRepetibilidade {
  /** Posições (em `ped.ids`) dos animais que precisam de PEV. Vazio = nenhuma. */
  pevPara?: readonly number[];
  /** Acima disto (incógnitas), Gauss-Seidel em vez de Cholesky. */
  limiteDenso?: number;
}

export interface ResultadoRepetibilidade {
  metodo: 'densa' | 'gauss_seidel';
  incognitas: number;
  /** Voltas do Gauss-Seidel; null no caminho denso. */
  iteracoes: number | null;
  convergiu: boolean;
  grupos: Float64Array;
  /** EBV de cada animal de `ped.ids`. */
  ebv: Float64Array;
  /** Ambiente permanente de cada animal de `ped.ids` (0 para quem não tem registro). */
  pe: Float64Array;
  F: Float64Array;
  /** PEV e REL por animal de `ped.ids`; NaN onde não foi pedida ou não dá para calcular. */
  pev: Float64Array;
  confiabilidade: Float64Array;
  /** false quando a PEV pedida não pôde ser calculada (caminho Gauss-Seidel). */
  pevCalculada: boolean;
}

/** 2.000 incógnitas: 32 MB de matriz e ~3 × 10⁹ operações no Cholesky — o teto de uma requisição. */
export const LIMITE_DENSO_PADRAO = 2000;

/**
 * O modelo de repetibilidade de uma fazenda.
 *
 * ABSORÇÃO DO AMBIENTE PERMANENTE. O bloco pe-pe das MME é DIAGONAL (cada
 * registro tem um nível só, o da própria fêmea): W'W + λpe·I. Dá para
 * eliminá-lo exatamente antes de fatorar — o complemento de Schur
 *
 *     M* = M₁₁ − M₁₂·D⁻¹·M₂₁ ,  b* = b₁ − M₁₂·D⁻¹·b₂ ,  D = W'W + λpe·I
 *
 * tem as mesmas soluções de GC e de â, e a inversa de M* é EXATAMENTE o bloco
 * [GC, a] da inversa completa, então a PEV não muda. Numa fazenda de 350
 * cabras isso tira 350 incógnitas de um sistema de 1.100 — o Cholesky fica
 * três vezes mais barato. Depois, p̂_j = (b_pe,j − Σ_g n_jg·ĝ_g − n_j·â_j)/D_j.
 * O Exemplo 5.1 de Mrode confere tudo isso a 1e-9 contra a porta densa, que
 * não absorve nada.
 */
export function modeloRepetibilidade(
  ped: PedigreeMontado,
  registros: readonly RegistroRepetibilidade[],
  nGrupos: number,
  v: Variancias,
  opcoes: OpcoesRepetibilidade = {},
): ResultadoRepetibilidade {
  const na = ped.ids.length;
  const n = nGrupos + na;
  const offA = nGrupos;

  const M = new MatrizEsparsa(n);
  const b = new Float64Array(n);
  const comRegistro = new Uint8Array(nGrupos);
  // Por fêmea: registros (n_j), soma de y (b_pe,j) e registros por grupo (n_jg).
  const porFemea = new Map<number, { n: number; soma: number; grupos: Map<number, number> }>();
  // T'T e T'y do bloco [GC, a], registro a registro: 1 no grupo e 1 no animal.
  for (const r of registros) {
    comRegistro[r.grupo] = 1;
    const a = offA + r.animal;
    M.somarSimetrico(r.grupo, r.grupo, 1);
    M.somarSimetrico(r.grupo, a, 1);
    M.somarSimetrico(a, a, 1);
    b[r.grupo] += r.y;
    b[a] += r.y;
    const f = porFemea.get(r.animal) ?? { n: 0, soma: 0, grupos: new Map<number, number>() };
    f.n += 1;
    f.soma += r.y;
    f.grupos.set(r.grupo, (f.grupos.get(r.grupo) ?? 0) + 1);
    porFemea.set(r.animal, f);
  }
  for (let g = 0; g < nGrupos; g++) {
    if (!comRegistro[g]) throw new Error(`grupo de contemporâneas ${g} sem registro: a matriz seria singular`);
  }
  // λa·A⁻¹. inversaAEsparsa entrega os pares ordenados; fica só a metade i ≤ j
  // porque somarSimetrico já escreve (i, j) e (j, i).
  const F = endogamia(ped);
  const lambdaA = v.sigma2_e / v.sigma2_a;
  inversaAEsparsa(ped, F, (i, j, valor) => {
    if (i <= j) M.somarSimetrico(offA + i, offA + j, lambdaA * valor);
  });
  // Absorção do pe: para cada fêmea, c = coluna do pe dela em [GC, a].
  const lambdaPe = v.sigma2_e / v.sigma2_pe;
  for (const [animal, f] of porFemea) {
    const D = f.n + lambdaPe;
    const c: [number, number][] = [...f.grupos.entries()];
    c.push([offA + animal, f.n]);
    for (let u = 0; u < c.length; u++) {
      b[c[u][0]] -= (c[u][1] * f.soma) / D;
      for (let w = u; w < c.length; w++) M.somarSimetrico(c[u][0], c[w][0], -(c[u][1] * c[w][1]) / D);
    }
  }

  const limite = opcoes.limiteDenso ?? LIMITE_DENSO_PADRAO;
  const pedidos = opcoes.pevPara ?? [];
  const pev = new Float64Array(na).fill(Number.NaN);
  const rel = new Float64Array(na).fill(Number.NaN);
  let solucao: Float64Array;
  let metodo: ResultadoRepetibilidade['metodo'];
  let iteracoes: number | null = null;
  let convergiu = true;
  let pevCalculada = pedidos.length === 0;

  if (n <= limite) {
    metodo = 'densa';
    const L = M.densa();
    choleskyEmLugar(L, n);
    solucao = choleskyResolver(L, n, b);
    if (pedidos.length > 0) {
      const diag = choleskyDiagonalInversa(
        L,
        n,
        pedidos.map((i) => offA + i),
      );
      pedidos.forEach((i, q) => {
        pev[i] = diag[q] * v.sigma2_e;
        rel[i] = Math.min(1, Math.max(0, rel_de_pev(pev[i], v.sigma2_a, F[i])));
      });
      pevCalculada = true;
    }
  } else {
    metodo = 'gauss_seidel';
    const gs = gaussSeidelEsparso(M, b);
    solucao = gs.solucao;
    iteracoes = gs.iteracoes;
    convergiu = gs.convergiu;
  }

  // p̂ de volta, da equação do pe que foi absorvida.
  const pe = new Float64Array(na);
  for (const [animal, f] of porFemea) {
    let s = f.soma - f.n * solucao[offA + animal];
    for (const [g, ng] of f.grupos) s -= ng * solucao[g];
    pe[animal] = s / (f.n + lambdaPe);
  }
  return {
    metodo,
    /** Do sistema completo [GC, a, pe], antes da absorção — o que o modelo tem de fato. */
    incognitas: n + porFemea.size,
    iteracoes,
    convergiu,
    grupos: solucao.slice(0, nGrupos),
    ebv: solucao.slice(offA, offA + na),
    pe,
    F,
    pev,
    confiabilidade: rel,
    pevCalculada,
  };
}
