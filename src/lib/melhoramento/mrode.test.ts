/**
 * MODELO ANIMAL contra os exemplos resolvidos de Mrode, Pocrnić, Gorjanc e
 * Thompson (2023), *Linear Models for the Prediction of the Genetic Merit of
 * Animals*, 4ª ed., CABI.
 *
 * Os números esperados são os mesmos de
 * central-melhoramento/laboratorio/tests/test_mrode.py: saída dos scripts R
 * oficiais do livro (github.com/MrodesBook/Examples_R). Soluções impressas com
 * round(x, 3) são conferidas com meia unidade da última casa; as do Exemplo 4.1
 * também com 12 algarismos (tolerância 1e-9).
 *
 * O Exemplo 5.1 é o que interessa a este módulo: é o MODELO DE REPETIBILIDADE
 * (lactações repetidas da mesma vaca, ambiente permanente, HYS fixo) — o mesmo
 * que roda nas fazendas. Ele é conferido três vezes: pela porta densa do motor,
 * pelo caminho esparso com Cholesky e pelo caminho Gauss-Seidel.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { modeloRepetibilidade, modelo_animal } from '@/lib/melhoramento/blup';
import { montarPedigree } from '@/lib/melhoramento/parentesco';

function publicados(calc: readonly number[], esperado: readonly number[], casas: number, rotulo: string) {
  assert.equal(calc.length, esperado.length, `${rotulo}: tamanho`);
  const tol = 0.5 * 10 ** -casas + 1e-9;
  calc.forEach((c, i) => {
    assert.ok(Math.abs(c - esperado[i]) <= tol, `${rotulo}[${i}]: ${c} vs ${esperado[i]} (±${tol})`);
  });
}

function perto(calc: readonly number[], esperado: readonly number[], atol: number, rotulo: string) {
  assert.equal(calc.length, esperado.length, `${rotulo}: tamanho`);
  calc.forEach((c, i) => assert.ok(Math.abs(c - esperado[i]) <= atol, `${rotulo}[${i}]: ${c} vs ${esperado[i]}`));
}

const PED4 = {
  '1': ['0', '0'],
  '2': ['0', '0'],
  '3': ['0', '0'],
  '4': ['1', '0'],
  '5': ['3', '2'],
  '6': ['1', '2'],
  '7': ['4', '5'],
  '8': ['3', '6'],
} as const;
const ANIM4 = ['4', '5', '6', '7', '8'];
const SEXO4 = ['Male', 'Female', 'Female', 'Male', 'Male'];
const WWG4 = [4.5, 2.9, 3.9, 3.5, 5.0];

test('Mrode 4.1 (Chapter_04_1.R): soluções do modelo animal com 12 algarismos', () => {
  const r = modelo_animal(PED4, ANIM4, WWG4, SEXO4, 20.0, 40.0);
  const sol = [r.efeitos_fixos['GC=Male'], r.efeitos_fixos['GC=Female'], ...r.ebv];
  publicados(sol, [4.359, 3.404, 0.098, -0.019, -0.041, -0.009, -0.186, 0.177, -0.249, 0.183], 3, 'round(solutions, 3)');
  perto(
    sol,
    [
      4.35850232985, 3.40443000591, 0.0984445757039, -0.0187700991009, -0.0410842029271, -0.00866312266194,
      -0.185732099495, 0.176872087681, -0.249458554834, 0.182614687931,
    ],
    1e-9,
    'solutions',
  );
});

test('Mrode 4.1: confiabilidade, acurácia e SEP ("Accuracy of evaluations")', () => {
  const r = modelo_animal(PED4, ANIM4, WWG4, SEXO4, 20.0, 40.0);
  publicados(r.pev.map((p) => p / 40), [0.471, 0.492, 0.456, 0.428, 0.428, 0.442, 0.442, 0.422], 3, 'c^ii');
  publicados(r.confiabilidade, [0.058, 0.016, 0.087, 0.145, 0.144, 0.115, 0.116, 0.155], 3, 'r_square');
  publicados(r.acuracia, [0.24, 0.126, 0.295, 0.38, 0.379, 0.34, 0.341, 0.394], 3, 'r');
  publicados(r.pev.map(Math.sqrt), [4.341, 4.437, 4.273, 4.136, 4.138, 4.206, 4.204, 4.11], 3, 'SEP');
});

// ─────────────────────────────────────────────────────────────────────────────
// Exemplo 5.1 — repetibilidade
// ─────────────────────────────────────────────────────────────────────────────

const PED5 = {
  '1': ['0', '0'],
  '2': ['0', '0'],
  '3': ['0', '0'],
  '4': ['1', '2'],
  '5': ['3', '2'],
  '6': ['1', '5'],
  '7': ['3', '4'],
  '8': ['1', '7'],
} as const;
const VACA = ['4', '4', '5', '5', '6', '6', '7', '7', '8', '8'];
const GORDURA = [201, 280, 150, 200, 160, 190, 180, 250, 285, 300];
const HYS = ['1', '3', '1', '4', '2', '3', '1', '3', '2', '4'];
const EBV_5_1 = [10.148, -3.084, -7.063, 13.581, -18.207, -18.387, 9.328, 24.194];
const PE_5_1 = [8.417, -7.146, -17.228, -1.39, 17.347];

test('Mrode 5.1 (Chapter_05_1.R): repetibilidade pela porta densa do motor', () => {
  const r = modelo_animal(PED5, VACA, GORDURA, HYS, 20.0, 28.0, 12.0);
  publicados(r.ebv, EBV_5_1, 3, 'EBV');
  publicados(
    ['4', '5', '6', '7', '8'].map((v) => r.ambiente_permanente![v]),
    PE_5_1,
    3,
    'ambiente permanente',
  );
  // Funções estimáveis dos fixos (paridade aninhada no HYS), como em test_mrode.py.
  for (const [nivel, esperado] of [
    ['1', 175.472],
    ['2', 175.472 + 44.065],
    ['3', 241.893],
    ['4', 241.893 + 0.013],
  ] as const) {
    assert.ok(Math.abs(r.efeitos_fixos[`GC=${nivel}`] - esperado) <= 1e-3, `HYS ${nivel}`);
  }
  // A vaca 8 é filha de 1 com a neta 7: F = 0,125.
  assert.ok(Math.abs(r.F[7] - 0.125) < 1e-12);
});

function exemplo51Esparso(solver?: 'densa' | 'esparsa' | 'gauss_seidel') {
  const ped = montarPedigree(
    Object.entries(PED5).map(([a, [p, m]]) => ({
      id: Number(a),
      pai: p === '0' ? null : Number(p),
      mae: m === '0' ? null : Number(m),
    })),
  );
  const niveis = ['1', '2', '3', '4'];
  const registros = VACA.map((v, i) => ({
    animal: ped.indice.get(Number(v))!,
    grupo: niveis.indexOf(HYS[i]),
    y: GORDURA[i],
  }));
  const res = modeloRepetibilidade(
    ped,
    registros,
    niveis.length,
    { sigma2_a: 20, sigma2_pe: 12, sigma2_e: 28 },
    { pevPara: ped.ids.map((_, i) => i), solver },
  );
  const porId = (vetor: Float64Array) => [1, 2, 3, 4, 5, 6, 7, 8].map((id) => vetor[ped.indice.get(id)!]);
  return { res, porId };
}

test('Mrode 5.1: o caminho esparso (Cholesky) reproduz o livro e a porta a 1e-9', () => {
  const { res, porId } = exemplo51Esparso();
  assert.equal(res.metodo, 'densa');
  publicados(porId(res.ebv), EBV_5_1, 3, 'EBV');
  publicados(porId(res.pe).slice(3), PE_5_1, 3, 'pe');

  const porta = modelo_animal(PED5, VACA, GORDURA, HYS, 20.0, 28.0, 12.0);
  perto(porId(res.ebv), porta.ebv, 1e-9, 'EBV vs porta');
  perto(porId(res.pev), porta.pev, 1e-9, 'PEV vs porta');
  perto(porId(res.confiabilidade), porta.confiabilidade, 1e-9, 'REL vs porta');
  perto(porId(res.F), porta.F, 1e-12, 'F vs porta');
  perto(Array.from(res.grupos), ['1', '2', '3', '4'].map((g) => porta.efeitos_fixos[`GC=${g}`]), 1e-9, 'HYS vs porta');
});

test('Mrode 5.1: o caminho Gauss-Seidel converge para a mesma solução, e diz que não tem PEV', () => {
  const denso = exemplo51Esparso();
  const gs = exemplo51Esparso('gauss_seidel');
  assert.equal(gs.res.metodo, 'gauss_seidel');
  assert.equal(gs.res.convergiu, true);
  assert.equal(gs.res.pevCalculada, false);
  perto(gs.porId(gs.res.ebv), denso.porId(denso.res.ebv), 1e-5, 'EBV GS vs denso');
  perto(gs.porId(gs.res.pe), denso.porId(denso.res.pe), 1e-5, 'pe GS vs denso');
  assert.ok(gs.porId(gs.res.pev).every(Number.isNaN), 'sem PEV no Gauss-Seidel');
});

test('Mrode 5.1: o Cholesky ESPARSO (grau mínimo + Takahashi) dá a mesma solução e a mesma PEV do denso', () => {
  const denso = exemplo51Esparso('densa');
  const esp = exemplo51Esparso('esparsa');
  assert.equal(esp.res.metodo, 'esparsa');
  assert.equal(esp.res.pevCalculada, true);
  perto(esp.porId(esp.res.ebv), denso.porId(denso.res.ebv), 1e-10, 'EBV esparso vs denso');
  perto(esp.porId(esp.res.pe), denso.porId(denso.res.pe), 1e-10, 'pe esparso vs denso');
  perto(esp.porId(esp.res.pev), denso.porId(denso.res.pev), 1e-9, 'PEV esparso vs denso');
});

// Exemplo 5.2 (Chapter_05_2.R): leitões com o ambiente comum da família de
// irmãos completos — aqui, o nível do pe é a MÃE (nivelPe), como no corte.
const PED52 = {
  ...Object.fromEntries([1, 2, 3, 4, 5].map((i) => [String(i), ['0', '0']])),
  '6': ['1', '2'], '7': ['1', '2'], '8': ['1', '2'],
  '9': ['3', '4'], '10': ['3', '4'], '11': ['3', '4'], '12': ['3', '4'],
  '13': ['1', '5'], '14': ['1', '5'], '15': ['1', '5'],
} as Record<string, [string, string]>;
const SEXO52 = ['Male', 'Female', 'Female', 'Female', 'Male', 'Female', 'Female', 'Male', 'Female', 'Male'];
const WW52 = [90, 70, 65, 98, 106, 60, 80, 100, 85, 68];

test('Mrode 5.2: ambiente comum da mãe pelo nivelPe = livro e porta densa (rotulos_pe)', () => {
  const ped = montarPedigree(
    Object.entries(PED52).map(([a, [p, m]]) => ({ id: Number(a), pai: p === '0' ? null : Number(p), mae: m === '0' ? null : Number(m) })),
  );
  const animais = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const registros = animais.map((id, i) => ({
    animal: ped.indice.get(id)!,
    grupo: SEXO52[i] === 'Male' ? 0 : 1,
    y: WW52[i],
    nivelPe: ped.indice.get(Number(PED52[String(id)][1]))!,
  }));
  for (const solver of ['densa', 'esparsa'] as const) {
    const r = modeloRepetibilidade(ped, registros, 2, { sigma2_a: 20, sigma2_pe: 15, sigma2_e: 65 }, {
      pevPara: ped.ids.map((_, i) => i),
      solver,
    });
    publicados(Array.from(r.grupos), [91.493, 75.764], 3, `sexo (${solver})`);
    const ebv = Array.from({ length: 15 }, (_, i) => r.ebv[ped.indice.get(i + 1)!]);
    publicados(ebv, [-1.441, -1.175, 1.441, 1.441, -0.266, -1.098, -1.667, -2.334, 3.925, 2.895, -1.141, 1.525, 0.448, 0.545, -3.819], 3, `EBV (${solver})`);
    publicados([2, 4, 5].map((m) => r.pe[ped.indice.get(m)!]), [-1.762, 2.161, -0.399], 3, `ambiente comum (${solver})`);
    const familia = animais.map((id) => PED52[String(id)][1]);
    const porta = modelo_animal(PED52, animais.map(String), WW52, SEXO52, 20, 65, 15, null, null, familia);
    perto(ebv, porta.ebv, 1e-9, `EBV vs porta (${solver})`);
    perto(Array.from({ length: 15 }, (_, i) => r.pev[ped.indice.get(i + 1)!]), porta.pev, 1e-9, `PEV vs porta (${solver})`);
  }
});
