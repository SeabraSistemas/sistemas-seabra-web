/**
 * NORMALIZAÇÃO DO GESTO — os testes do que decide se um padrão é válido.
 *
 * O que este arquivo protege: o MÍNIMO de pontos (abaixo dele o gesto tem
 * pouca entropia pra valer alguma coisa) e a proibição de PONTO REPETIDO
 * (repetir um ponto não é "desenhar de novo", é o mesmo defeito de senha
 * "aaaa" — um jeito de meter poucos bits atrás de uma sequência comprida).
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { MINIMO_PONTOS, normalizarGesto } from '@/lib/adm/gesto';

describe('normalizarGesto', () => {
  test('sequência de pontos distintos, no mínimo exigido, normaliza igual', () => {
    assert.equal(normalizarGesto('1259'), '1259');
    assert.equal(normalizarGesto('123456789'), '123456789');
  });

  test('menos que o mínimo de pontos é inválido', () => {
    assert.equal(normalizarGesto('123456789'.slice(0, MINIMO_PONTOS - 1)), null);
  });

  test('exatamente o mínimo é aceito — a borda não é descartada por engano', () => {
    const minimo = '123456789'.slice(0, MINIMO_PONTOS);
    assert.equal(normalizarGesto(minimo), minimo);
  });

  test('ponto repetido é recusado, mesmo com comprimento suficiente', () => {
    // 5 caracteres, mas só 3 pontos distintos — não é um gesto de 5 pontos.
    assert.equal(normalizarGesto('12121'), null);
  });

  test('caractere que não é dígito 1-9 é descartado, não rejeita a entrada inteira', () => {
    // Suporta tanto "1-2-5-9" (digitado com separador) quanto o que a grade
    // visual monta (só dígitos coincidindo com PONTOS_GRADE).
    assert.equal(normalizarGesto('1-2-5-9'), '1259');
    assert.equal(normalizarGesto(' 1 2 5 9 '), '1259');
  });

  test('zero não é ponto da grade (a grade vai de 1 a 9) e é descartado', () => {
    assert.equal(normalizarGesto('01259'), '1259');
  });

  test('nulo, indefinido ou vazio é inválido', () => {
    assert.equal(normalizarGesto(null), null);
    assert.equal(normalizarGesto(undefined), null);
    assert.equal(normalizarGesto(''), null);
  });

  test('só caracteres inválidos (sem nenhum dígito 1-9) é igual a vazio', () => {
    assert.equal(normalizarGesto('abc---'), null);
  });
});
