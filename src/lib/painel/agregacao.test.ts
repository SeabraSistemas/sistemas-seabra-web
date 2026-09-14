import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { contar, media, percentual, soma } from '@/lib/painel/agregacao';

describe('media / soma', () => {
  test('ignoram null', () => {
    assert.equal(media([2, null, 4]), 3);
    assert.equal(soma([2, null, 4]), 6);
  });
  test('sem nenhum valor real, viram null (nao 0)', () => {
    assert.equal(media([null, null]), null);
    assert.equal(soma([]), null);
  });
});

describe('contar', () => {
  test('conta quem passa no teste', () => {
    assert.equal(contar([1, 2, 3, 4], (n) => n % 2 === 0), 2);
  });
});

describe('percentual', () => {
  test('numerador/denominador em 0-100', () => {
    assert.equal(percentual(50, 200), 25);
  });
  test('denominador 0 vira null, nao 0 nem Infinity', () => {
    assert.equal(percentual(0, 0), null);
  });
});
