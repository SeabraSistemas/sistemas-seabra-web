import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { contagemPor, contar, media, percentual, soma } from '@/lib/painel/agregacao';

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

describe('contagemPor', () => {
  type Item = { categoria: string | null };
  const itens: Item[] = [
    { categoria: 'TNT' },
    { categoria: 'TNT' },
    { categoria: 'B2887' },
    { categoria: null },
    { categoria: '' },
  ];

  test('conta por categoria', () => {
    const out = contagemPor(itens, (i) => i.categoria);
    assert.deepEqual(new Map(out.map((f) => [f.rotulo, f.valor])), new Map([['TNT', 2], ['B2887', 1]]));
  });

  test('null e string vazia nunca viram categoria (nunca aparece "" ou "null" no grafico)', () => {
    const out = contagemPor(itens, (i) => i.categoria);
    assert.equal(out.some((f) => f.rotulo === '' || f.rotulo === 'null'), false);
    assert.equal(out.reduce((soma, f) => soma + f.valor, 0), 3); // so os 3 itens com categoria real
  });

  test('lista vazia da lista vazia', () => {
    assert.deepEqual(contagemPor<Item>([], (i) => i.categoria), []);
  });
});
