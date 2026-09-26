import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { formatSerial, hojeSerial, nk, semenValido, serialDia } from '@/lib/bovinos/texto';
import { coluna, letraColuna, montarTabela, normalizarCabecalho } from '@/lib/bovinos/tabela';
import { ehFormula, normalizarFormula } from '@/lib/bovinos/formulas';

describe('bovinos/texto', () => {
  test('nk iguala grafias do mesmo sêmen', () => {
    assert.equal(nk('Fenômeno5-6'), nk('FENOMENO 5 6'));
    assert.equal(nk('B 2887'), 'B2887');
    assert.notEqual(nk('FENOMENO15-04'), nk('Fenômeno5-6'));
  });

  test('"x" e vazio não são sêmen', () => {
    assert.equal(semenValido('x'), false);
    assert.equal(semenValido(' X '), false);
    assert.equal(semenValido(''), false);
    assert.equal(semenValido('TNT'), true);
  });

  test('serialDia aceita com e sem zero à esquerda e rejeita data impossível', () => {
    assert.equal(serialDia('7/3/2025'), serialDia('07/03/2025'));
    assert.equal(serialDia('31/02/2025'), null);
    assert.equal(serialDia('2025-03-07'), null);
    assert.equal(serialDia(''), null);
    assert.equal(serialDia('01/10/2024')! - serialDia('15/12/2023')!, 291);
    assert.equal(formatSerial(serialDia('7/3/2025')), '07/03/2025');
  });

  test('hojeSerial usa o dia de Brasília', () => {
    // 2026-09-27 01:00 UTC ainda é 26/09 em Brasília.
    assert.equal(formatSerial(hojeSerial(Date.UTC(2026, 8, 27, 1, 0))), '26/09/2026');
  });
});

describe('bovinos/tabela', () => {
  test('normaliza cabeçalho com espaço sobrando e quebra de linha', () => {
    assert.equal(normalizarCabecalho(' Método '), 'Método');
    assert.equal(normalizarCabecalho('Dias  1° pesagem'), 'Dias 1° pesagem');
    assert.equal(normalizarCabecalho('Avós Paternos\nBISAVÓ MATERNO'), 'Avós Paternos BISAVÓ MATERNO');
  });

  test('letraColuna', () => {
    assert.deepEqual([0, 25, 26, 51, 52, 83, 84, 95].map(letraColuna), ['A', 'Z', 'AA', 'AZ', 'BA', 'CF', 'CG', 'CR']);
  });

  test('coluna por nome, alias e duplicada como ausente', () => {
    const tab = montarTabela('X', [['ID A', 'N manejo', 'Fazenda', 'Fazenda']])!;
    assert.equal(coluna(tab, 'ID A'), 0);
    assert.equal(coluna(tab, 'N° de manejo', 'N manejo'), 1);
    assert.equal(coluna(tab, 'Fazenda'), -1);
    assert.ok(tab.duplicadas.has('Fazenda'));
  });
});

describe('bovinos/formulas', () => {
  test('mesma fórmula em linhas diferentes normaliza igual', () => {
    const a = normalizarFormula('=IF(OR(CI2="Sêmen";CI2="Baixa");CI2;IF(H2="";"";1))', 2);
    const b = normalizarFormula('=IF(OR(CI7="Sêmen";CI7="Baixa");CI7;IF(H7="";"";1))', 7);
    assert.equal(a, b);
  });

  test('referência fixa e texto entre aspas não mudam', () => {
    assert.notEqual(normalizarFormula('=A$2+B2', 2), normalizarFormula('=A$3+B3', 3));
    assert.equal(normalizarFormula('=IF(A5="A5";1;0)', 5), '=IF(A#="A5";1;0)');
  });

  test('ehFormula', () => {
    assert.equal(ehFormula('=MONTH(H2)'), true);
    assert.equal(ehFormula('12'), false);
    assert.equal(ehFormula(''), false);
  });
});
