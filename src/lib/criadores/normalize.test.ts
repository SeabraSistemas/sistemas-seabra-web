import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { amlDe } from '@/lib/criadores/normalize';
import type { Animal } from '@/lib/criadores/types';

// AML por foto na vitrine (29/09/2026): a AML que o admin faz a partir das
// fotos entra como AML normal, com o selo. No leite, sem vídeo, a mobilidade
// fica de fora (o ponto 1 vem nulo e some do array) — o bloco diz isso.

function animal(aml: Animal['aml']): Animal {
  return { aml } as Animal;
}

const pontosMacho: [string, number][] = [
  ['Largura de peito', 6],
  ['Profundidade corporal', 6],
  ['Ângulo de garupa', 6],
  ['Membros post. (lateral)', 6],
  ['Capacidade', 6],
  ['Largura de garupa', 6],
  ['Membros post. (anterior)', 6],
  ['Estrutura óssea', 6],
];

describe('amlDe — AML por foto', () => {
  test('por foto sem mobilidade: selo e a mobilidade dita como não avaliada', () => {
    const aml = amlDe(animal({ total: 76.68, data: '2026-09-29', por_foto: true, pts: pontosMacho }));
    assert.ok(aml);
    assert.equal(aml.porFoto, true);
    assert.equal(aml.mobilidadeNaoAvaliada, true);
    assert.deepEqual(
      aml.pts.map((p) => p.n),
      [2, 3, 4, 6, 8, 9, 15, 16],
    );
    assert.equal(aml.totalFmt, '76,68');
  });

  test('AML de visita segue como antes, sem selo', () => {
    const aml = amlDe(animal({ total: 76.14, data: '2026-08-10', pts: [['Mobilidade', 7], ...pontosMacho] }));
    assert.ok(aml);
    assert.equal(aml.porFoto, false);
    assert.equal(aml.mobilidadeNaoAvaliada, false);
    assert.equal(aml.pts[0].n, 1);
  });

  test('por foto COM mobilidade: selo, mas nada a explicar', () => {
    const aml = amlDe(animal({ total: 80, por_foto: true, pts: [['Mobilidade', 7], ...pontosMacho] }));
    assert.ok(aml);
    assert.equal(aml.porFoto, true);
    assert.equal(aml.mobilidadeNaoAvaliada, false);
  });

  test('snapshot com ord ([ord, label, valor]) também reconhece a mobilidade', () => {
    const aml = amlDe(animal({ por_foto: true, pts: [[1, 'Mobilidade', 5], [2, 'Largura de peito', 6]] }));
    assert.ok(aml);
    assert.equal(aml.mobilidadeNaoAvaliada, false);
  });

  test('sem pontos continua sem bloco', () => {
    assert.equal(amlDe(animal({ por_foto: true, pts: [] })), null);
  });
});
