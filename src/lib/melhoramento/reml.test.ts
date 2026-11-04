/**
 * REML contra Mrode et al. (2023), Exemplo 17.7, e contra a verossimilhança
 * densa montada por V = ZAZ'σ²a + WW'σ²pe + Iσ²e.
 *
 * Os números do 17.7 são a saída de Chapter_17.R (github.com/MrodesBook/
 * Examples_R), rodado em 04/11/2026 com o shim de pedigreemm do laboratório
 * (central-melhoramento/laboratorio/validacao_mrode) e impressos com 17
 * algarismos: uma volta de AI e uma de EM a partir de σ²a 0,2 e σ²e 0,4.
 *
 * Os outros testes usam dados SIMULADOS: nenhum dado de produtor.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { avaliarReml, estimarReml, julgarReml, passoAi, type VarianciasReml } from '@/lib/melhoramento/reml';
import { matriz_A, comoPedigreeDoMotor, montarPedigree, type PedigreeMontado } from '@/lib/melhoramento/parentesco';
import { inversa, resolver } from '@/lib/melhoramento/numerico';
import type { RegistroRepetibilidade } from '@/lib/melhoramento/blup';

function perto(a: number, b: number, tol: number, rotulo: string) {
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${rotulo}: ${a} vs ${b}`);
}

// ── Exemplo 17.7 ────────────────────────────────────────────────────────────
// Pedigree: 1, 2, 3 fundadores; 4 = 1×?, 5 = 3×2, 6 = 1×2, 7 = 4×5, 8 = 3×6.
// Bezerros 4..8 com sexo M, F, F, M, M e ganho 2,6; 0,1; 1,0; 3,0; 1,0.
const PED17 = montarPedigree([
  { id: 1, pai: null, mae: null },
  { id: 2, pai: null, mae: null },
  { id: 3, pai: null, mae: null },
  { id: 4, pai: 1, mae: null },
  { id: 5, pai: 3, mae: 2 },
  { id: 6, pai: 1, mae: 2 },
  { id: 7, pai: 4, mae: 5 },
  { id: 8, pai: 3, mae: 6 },
]);
const SEXO = [0, 1, 1, 0, 0]; // 0 = macho, 1 = fêmea (o nível de referência do script é Male)
const Y17 = [2.6, 0.1, 1.0, 3.0, 1.0];
const REGS17: RegistroRepetibilidade[] = [4, 5, 6, 7, 8].map((id, i) => ({
  animal: PED17.indice.get(id)!,
  grupo: SEXO[i],
  y: Y17[i],
}));
const V17: VarianciasReml = { sigma2_a: 0.2, sigma2_pe: null, sigma2_e: 0.4 };

test('Mrode 17.7: logL, derivadas e matriz de informação média de Chapter_17.R', () => {
  const av = avaliarReml(PED17, REGS17, 2, V17);
  perto(av.logL, -2.3852263920002681, 1e-12, 'L');
  perto(av.yPy, 4.8193148257531, 1e-12, 'ypPy');
  // O script imprime D1E e D1A; a ordem do motor é [σ²a, σ²e].
  perto(av.derivada[0], 1.2463106252573795, 1e-12, 'D1A');
  perto(av.derivada[1], 1.6509882195626862, 1e-12, 'D1E');
  // Ainf do script na ordem (E, A): [[8,2673; 5,6535], [5,6535; 4,5581]].
  perto(av.ai[1][1], 8.2673044797728394, 1e-12, 'AI_EE');
  perto(av.ai[0][1], 5.6535210862233871, 1e-12, 'AI_AE');
  perto(av.ai[0][0], 4.5581330579288446, 1e-12, 'AI_AA');
  // traceAC do script é com a C da LHS escalada por σ²e.
  perto(av.tracoAC, 3.614655115836451, 1e-12, 'traceAC');
  perto(av.aAa, 0.25384280368600998, 1e-12, "a'A⁻¹a");
  // Soluções: sexo M, F e os 8 animais.
  const sol = [2.14411301437290769, 0.60150620200826932];
  sol.forEach((s, i) => perto(av.grupos[i], s, 1e-12, `sexo ${i}`));
  const ebv = [
    0.1168044890726522, -0.02527072258318561, -0.22174640677298674, 0.25372120496160683, -0.13537113605040352,
    0.03235873203386503, 0.21851742468989982, -0.30457767277023023,
  ];
  ebv.forEach((e, i) => perto(av.ebv[PED17.indice.get(i + 1)!], e, 1e-12, `animal ${i + 1}`));
});

test('Mrode 17.7: uma volta de AI e uma de EM dão os números do script', () => {
  const av = avaliarReml(PED17, REGS17, 2, V17);
  const ai = passoAi(V17, av);
  perto(ai.sigma2_e, 0.48379060852470379, 1e-12, 'AI σ²e');
  perto(ai.sigma2_a, 0.36949892495822306, 1e-12, 'AI σ²a');
  perto(av.em.sigma2_a, 0.21246310625257381, 1e-12, 'EM σ²a');
  perto(av.em.sigma2_e, 0.64257531010041402, 1e-12, 'EM σ²e');
});

// ── Verossimilhança densa, para conferir o modelo com ambiente permanente ───

function prng(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normal(r: () => number): number {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

interface Sim {
  ped: PedigreeMontado;
  regs: RegistroRepetibilidade[];
  nGrupos: number;
}

/** Rebanho simulado: `bodes` reprodutores, `cabras` filhas com 1 a 3 lactações, h² 0,3 e r 0,5. */
function simular(semente: number, bodes: number, cabras: number, nGrupos: number): Sim {
  const r = prng(semente);
  const linhas: { id: number; pai: number | null; mae: number | null }[] = [];
  const verdadeiro = new Map<number, number>();
  for (let b = 1; b <= bodes; b++) {
    linhas.push({ id: b, pai: null, mae: null });
    verdadeiro.set(b, normal(r) * Math.sqrt(0.3));
  }
  const regsBrutos: { animal: number; grupo: number; y: number }[] = [];
  const efeito = Array.from({ length: nGrupos }, () => normal(r));
  for (let c = 0; c < cabras; c++) {
    const id = 1000 + c;
    const pai = 1 + Math.floor(r() * bodes);
    linhas.push({ id, pai, mae: null });
    const a = 0.5 * verdadeiro.get(pai)! + normal(r) * Math.sqrt(0.75 * 0.3);
    const pe = normal(r) * Math.sqrt(0.2);
    const nl = 1 + Math.floor(r() * 3);
    for (let k = 0; k < nl; k++) {
      const g = Math.floor(r() * nGrupos);
      regsBrutos.push({ animal: id, grupo: g, y: efeito[g] + a + pe + normal(r) * Math.sqrt(0.5) });
    }
  }
  const ped = montarPedigree(linhas);
  return {
    ped,
    nGrupos,
    regs: regsBrutos.map((x) => ({ animal: ped.indice.get(x.animal)!, grupo: x.grupo, y: x.y })),
  };
}

/** −½[log|V| + log|X'V⁻¹X| + y'Py], densa e sem atalho nenhum. */
function logLDensa(sim: Sim, v: VarianciasReml): number {
  const motor = comoPedigreeDoMotor(sim.ped);
  const [A, ids] = matriz_A(motor);
  const pos = new Map(ids.map((id, i) => [Number(id), i]));
  const N = sim.regs.length;
  const animalDe = sim.regs.map((x) => pos.get(sim.ped.ids[x.animal])!);
  const V = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => {
      let s = A[animalDe[i]][animalDe[j]] * v.sigma2_a;
      if (sim.regs[i].animal === sim.regs[j].animal) s += v.sigma2_pe ?? 0;
      if (i === j) s += v.sigma2_e;
      return s;
    }),
  );
  const Vi = inversa(V);
  const X = sim.regs.map((x) => Array.from({ length: sim.nGrupos }, (_, g) => (g === x.grupo ? 1 : 0)));
  const p = sim.nGrupos;
  const XtViX = Array.from({ length: p }, (_, a) =>
    Array.from({ length: p }, (_, b) => {
      let s = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) s += X[i][a] * Vi[i][j] * X[j][b];
      return s;
    }),
  );
  const y = sim.regs.map((x) => x.y);
  const Viy = Vi.map((l) => l.reduce((s, x, j) => s + x * y[j], 0));
  const XtViy = Array.from({ length: p }, (_, a) => X.reduce((s, l, i) => s + l[a] * Viy[i], 0));
  const beta = resolver(XtViX, XtViy);
  const yViy = y.reduce((s, yi, i) => s + yi * Viy[i], 0);
  const yPy = yViy - beta.reduce((s, b, a) => s + b * XtViy[a], 0);
  const logdet = (M: number[][]) => {
    // Cholesky simples para as duas matrizes pequenas.
    const n = M.length;
    const L = M.map((l) => l.slice());
    let ld = 0;
    for (let j = 0; j < n; j++) {
      let s = L[j][j];
      for (let k = 0; k < j; k++) s -= L[j][k] * L[j][k];
      L[j][j] = Math.sqrt(s);
      ld += 2 * Math.log(L[j][j]);
      for (let i = j + 1; i < n; i++) {
        let t = L[i][j];
        for (let k = 0; k < j; k++) t -= L[i][k] * L[j][k];
        L[i][j] = t / L[j][j];
      }
    }
    return ld;
  };
  return -0.5 * (logdet(V) + logdet(XtViX) + yPy);
}

const PEQ = simular(11, 6, 40, 3);

test('logL pelas MME absorvidas = logL pela V densa (modelo com pe, endogamia zero)', () => {
  for (const v of [
    { sigma2_a: 0.3, sigma2_pe: 0.2, sigma2_e: 0.5 },
    { sigma2_a: 0.05, sigma2_pe: 0.6, sigma2_e: 0.9 },
  ]) {
    const av = avaliarReml(PEQ.ped, PEQ.regs, PEQ.nGrupos, v);
    perto(av.logL, logLDensa(PEQ, v), 1e-10, `logL em ${JSON.stringify(v)}`);
  }
});

test('derivadas analíticas = diferenças finitas da logL densa', () => {
  const v = { sigma2_a: 0.25, sigma2_pe: 0.15, sigma2_e: 0.55 };
  const av = avaliarReml(PEQ.ped, PEQ.regs, PEQ.nGrupos, v);
  const h = 1e-5;
  const chaves = ['sigma2_a', 'sigma2_pe', 'sigma2_e'] as const;
  chaves.forEach((k, i) => {
    const mais = { ...v, [k]: v[k] + h };
    const menos = { ...v, [k]: v[k] - h };
    const df = (logLDensa(PEQ, mais) - logLDensa(PEQ, menos)) / (2 * h);
    perto(av.derivada[i], df, 1e-6, `∂L/∂${k}`);
  });
});

test('AI-REML converge para o máximo da verossimilhança densa (gradiente zero) e EM concorda', () => {
  const sim = simular(5, 8, 120, 4);
  const res = estimarReml(sim.ped, sim.regs, sim.nGrupos, { sigma2_a: 0.3, sigma2_pe: 0.2, sigma2_e: 0.5 });
  assert.ok(res.estimou && res.convergiu, JSON.stringify(res.motivos));
  const v = res.variancias!;
  // No máximo, a logL densa não sobe em nenhuma direção.
  const base = logLDensa(sim, v);
  for (const k of ['sigma2_a', 'sigma2_pe', 'sigma2_e'] as const) {
    for (const f of [0.97, 1.03]) {
      assert.ok(logLDensa(sim, { ...v, [k]: v[k]! * f }) <= base + 1e-9, `${k} × ${f} subiu a logL`);
    }
  }
  perto(res.logL!, base, 1e-9, 'logL no máximo');
  // EM puro, partindo de longe, chega no mesmo ponto (só que devagar).
  let w: VarianciasReml = { sigma2_a: 0.1, sigma2_pe: 0.4, sigma2_e: 0.9 };
  for (let i = 0; i < 4000; i++) w = avaliarReml(sim.ped, sim.regs, sim.nGrupos, w).em;
  perto(w.sigma2_a, v.sigma2_a, 1e-4, 'EM σ²a');
  perto(w.sigma2_pe!, v.sigma2_pe!, 1e-4, 'EM σ²pe');
  perto(w.sigma2_e, v.sigma2_e, 1e-4, 'EM σ²e');
  // Erro-padrão existe, é positivo e h² está entre 0 e 1.
  assert.ok(res.ep && res.ep.h2 > 0 && res.h2! > 0 && res.h2! < 1);
});

test('REML recupera os parâmetros simulados com muito dado, e o EP cobre o verdadeiro', () => {
  const sim = simular(23, 40, 900, 12);
  const res = estimarReml(sim.ped, sim.regs, sim.nGrupos, { sigma2_a: 0.2, sigma2_pe: 0.3, sigma2_e: 0.5 });
  assert.ok(res.convergiu);
  // verdadeiro: σ²a 0,3 ; σ²pe 0,2 ; σ²e 0,5 → h² 0,30, r 0,50.
  assert.ok(Math.abs(res.h2! - 0.3) < 3 * res.ep!.h2 + 0.02, `h² ${res.h2} ± ${res.ep!.h2}`);
  assert.ok(Math.abs(res.r! - 0.5) < 3 * res.ep!.r! + 0.02, `r ${res.r} ± ${res.ep!.r}`);
  assert.ok(res.iteracoes < 20, `AI deveria convergir em poucas voltas: ${res.iteracoes}`);
});

test('julgarReml: pouco dado, fronteira, h² indistinguível de zero e teto de incógnitas não são usados', () => {
  const criterios = { registrosMinimos: 100, femeasRepetidasMinimas: 30 };
  const sim = simular(5, 8, 120, 4);
  const res = estimarReml(sim.ped, sim.regs, sim.nGrupos, { sigma2_a: 0.3, sigma2_pe: 0.2, sigma2_e: 0.5 });
  const pouco = julgarReml(res, { registros: 50, femeasRepetidas: 10 }, criterios);
  assert.equal(pouco.usar, false);
  assert.ok(pouco.motivos.some((m) => m.includes('50 lactações')));
  assert.ok(pouco.motivos.some((m) => m.includes('10 fêmeas')));
  // Fronteira forçada: pe quase nulo.
  const fronteira = julgarReml(
    { ...res, variancias: { sigma2_a: 0.3, sigma2_pe: 0.001, sigma2_e: 0.7 }, h2: 0.3 },
    { registros: 500, femeasRepetidas: 200 },
    criterios,
  );
  assert.ok(fronteira.motivos.some((m) => m.includes('ambiente permanente na fronteira')));
  const zero = julgarReml(
    { ...res, h2: 0.05, ep: { ...res.ep!, h2: 0.04 } },
    { registros: 500, femeasRepetidas: 200 },
    criterios,
  );
  assert.ok(zero.motivos.some((m) => m.includes('inclui zero')));
  const grande = estimarReml(sim.ped, sim.regs, sim.nGrupos, { sigma2_a: 0.3, sigma2_pe: 0.2, sigma2_e: 0.5 }, { limiteIncognitas: 10 });
  assert.equal(grande.estimou, false);
  assert.ok(julgarReml(grande, { registros: 500, femeasRepetidas: 200 }, criterios).motivos[0].includes('teto'));
});
