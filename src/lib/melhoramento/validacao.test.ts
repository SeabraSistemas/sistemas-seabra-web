/**
 * MÉTRICAS DA VALIDAÇÃO e a regra do vencedor.
 *
 * Os números esperados do exemplo pequeno foram feitos à mão (regressão
 * simples de cinco pontos) e o quantil t(0,975; 3) = 3,182446 é o da tabela.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { metricasValidacao, vencedorDaValidacao, type MetricasValidacao } from '@/lib/melhoramento/validacao';

const perto = (a: number | null, b: number, tol = 1e-6) => assert.ok(a != null && Math.abs(a - b) <= tol, `${a} vs ${b}`);

test('metricasValidacao: exemplo de cinco pontos conferido à mão', () => {
  const m = metricasValidacao([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
  assert.equal(m.n, 5);
  perto(m.correlacao, 0.7745966692);
  perto(m.regressao, 0.6);
  // se(b) = √(SSE/(n−2)/Sxx) = √(2,4/3/10); IC = 0,6 ± t(0,975; 3)·se.
  const meia = 3.182446305 * Math.sqrt(2.4 / 3 / 10);
  perto(m.icRegressao![0], 0.6 - meia, 1e-6);
  perto(m.icRegressao![1], 0.6 + meia, 1e-6);
  perto(m.vies, 1.0);
  // IC de Fisher: tanh(atanh(r) ± 1,959964/√2).
  const z = Math.atanh(0.7745966692);
  perto(m.icCorrelacao![0], Math.tanh(z - 1.959963985 / Math.SQRT2), 1e-6);
  perto(m.icCorrelacao![1], Math.tanh(z + 1.959963985 / Math.SQRT2), 1e-6);
});

test('metricasValidacao: previsão perfeita dá r = 1, b = 1 e viés 0', () => {
  const m = metricasValidacao([1, 2, 3, 4], [1, 2, 3, 4]);
  perto(m.correlacao, 1);
  perto(m.regressao, 1);
  perto(m.vies, 0);
  assert.equal(m.icCorrelacao, null, 'r = 1 não tem IC de Fisher');
});

test('metricasValidacao: previsão constante não ordena ninguém — r e b são null, não NaN', () => {
  const m = metricasValidacao([0, 0, 0, 0], [1, -1, 2, 0]);
  assert.equal(m.correlacao, null);
  assert.equal(m.regressao, null);
  perto(m.vies, 0.5);
});

test('metricasValidacao: n pequeno não inventa intervalo', () => {
  const m = metricasValidacao([1, 2, 3], [1, 3, 2]);
  assert.equal(m.icCorrelacao, null, 'Fisher pede n ≥ 4');
  assert.ok(m.icRegressao != null);
  assert.equal(metricasValidacao([], []).correlacao, null);
});

function m(modelo: string, r: number, ic: [number, number], n = 100): { modelo: string; metricas: MetricasValidacao } {
  return {
    modelo,
    metricas: { n, correlacao: r, icCorrelacao: ic, regressao: 1, icRegressao: null, vies: 0, icVies: null },
  };
}

test('vencedorDaValidacao: com n pequeno não declara vencedor, mesmo com diferença grande', () => {
  const v = vencedorDaValidacao([m('a', 0.6, [0.5, 0.7], 20), m('b', 0.1, [0.0, 0.2], 20)], 30);
  assert.equal(v.modelo, null);
  assert.match(v.motivo, /só 20 fêmeas/);
});

test('vencedorDaValidacao: intervalos sobrepostos não têm vencedor', () => {
  const v = vencedorDaValidacao([m('a', 0.4, [0.3, 0.5]), m('b', 0.35, [0.25, 0.45])], 30);
  assert.equal(v.modelo, null);
  assert.match(v.motivo, /se sobrepõe/);
});

test('vencedorDaValidacao: só declara quando o IC do melhor fica acima de todos', () => {
  const v = vencedorDaValidacao([m('a', 0.2, [0.1, 0.3]), m('b', 0.6, [0.5, 0.7]), m('c', 0.25, [0.15, 0.35])], 30);
  assert.equal(v.modelo, 'b');
});
