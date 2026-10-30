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

function exemplo51Esparso(limiteDenso?: number) {
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
    { pevPara: ped.ids.map((_, i) => i), limiteDenso },
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
  const gs = exemplo51Esparso(0);
  assert.equal(gs.res.metodo, 'gauss_seidel');
  assert.equal(gs.res.convergiu, true);
  assert.equal(gs.res.pevCalculada, false);
  perto(gs.porId(gs.res.ebv), denso.porId(denso.res.ebv), 1e-5, 'EBV GS vs denso');
  perto(gs.porId(gs.res.pe), denso.porId(denso.res.pe), 1e-5, 'pe GS vs denso');
  assert.ok(gs.porId(gs.res.pev).every(Number.isNaN), 'sem PEV no Gauss-Seidel');
});
