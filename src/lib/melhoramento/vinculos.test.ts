/**
 * Vínculos do cadastro único de reprodutores, com fixtures sintéticos.
 * A regra protegida: NADA é ligado sem confirmação; sem confirmado nenhum, os
 * animais saem exatamente como entraram.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { aplicarVinculos, conexaoComVinculos, type VinculoEntrada } from '@/lib/melhoramento/vinculos';
import type { AnimalEntrada } from '@/lib/melhoramento/tipos';

function animal(id: number, faz: number, sexo: string, paiId: number | null = null): AnimalEntrada {
  return { animalId: id, propriedadeId: faz, especie: 'caprino', numero: null, nome: null, sexo, nascimento: null, paiId, maeId: null };
}

// Bode 10 na fazenda 1 com 3 filhas; bode 20 na fazenda 2 com 2 filhas; bode 30 na fazenda 3 com 1 filha.
const ANIMAIS: AnimalEntrada[] = [
  animal(10, 1, 'macho'),
  animal(11, 1, 'fêmea', 10),
  animal(12, 1, 'fêmea', 10),
  animal(13, 1, 'fêmea', 10),
  animal(20, 2, 'macho'),
  animal(21, 2, 'fêmea', 20),
  animal(22, 2, 'fêmea', 20),
  animal(30, 3, 'macho'),
  animal(31, 3, 'fêmea', 30),
];

function vinculo(id: number, a: number, fa: number, b: number, fb: number, confirmacao: VinculoEntrada['confirmacao']): VinculoEntrada {
  return {
    id,
    especie: 'caprino',
    animalA: a,
    propriedadeA: fa,
    animalB: b,
    propriedadeB: fb,
    motivos: ['numero'],
    confirmacao,
    confirmadoPor: confirmacao === 'nao_confirmado' ? null : 'teste',
    confirmadoEm: confirmacao === 'nao_confirmado' ? null : '2026-11-04T00:00:00Z',
    observacao: null,
  };
}

test('aplicarVinculos: sem confirmado, os animais voltam exatamente como entraram', () => {
  const r = aplicarVinculos(ANIMAIS, [vinculo(1, 10, 1, 20, 2, 'nao_confirmado'), vinculo(2, 20, 2, 30, 3, 'rejeitado')]);
  assert.equal(r.aplicados, 0);
  assert.deepEqual(r.animais, ANIMAIS);
  assert.equal(r.representante.size, 0);
});

test('aplicarVinculos: o confirmado junta os dois no menor id e reescreve o pai das filhas', () => {
  const r = aplicarVinculos(ANIMAIS, [vinculo(1, 10, 1, 20, 2, 'confirmado')]);
  assert.equal(r.aplicados, 1);
  assert.equal(r.representante.get(20), 10);
  assert.deepEqual(
    r.animais.filter((a) => a.paiId === 10).map((a) => a.animalId),
    [11, 12, 13, 21, 22],
  );
  // Transitivo: 10 = 20 e 20 = 30 → todos no 10.
  const t = aplicarVinculos(ANIMAIS, [vinculo(1, 10, 1, 20, 2, 'confirmado'), vinculo(2, 20, 2, 30, 3, 'confirmado')]);
  assert.equal(t.representante.get(30), 10);
});

test('conexaoComVinculos: hoje nenhuma conexão; com os candidatos, as três fazendas na mesma régua', () => {
  const v = [vinculo(1, 10, 1, 20, 2, 'nao_confirmado'), vinculo(2, 20, 2, 30, 3, 'nao_confirmado'), vinculo(3, 13, 1, 31, 3, 'rejeitado')];
  const c = conexaoComVinculos(ANIMAIS, v);
  assert.equal(c.candidatos, 2);
  assert.equal(c.rejeitados, 1);
  assert.equal(c.atual.conectores.length, 0);
  assert.equal(c.atual.fazendasLigadas, 0);
  assert.equal(c.seConfirmados.conectores.length, 1);
  assert.deepEqual(c.seConfirmados.conectores[0].propriedades, [1, 2, 3]);
  assert.equal(c.seConfirmados.filhasDosConectores, 6);
  assert.equal(c.seConfirmados.paresDeFazendas, 3);
  assert.deepEqual(c.seConfirmados.componentes, [[1, 2, 3]]);
});

test('conexaoComVinculos: um confirmado entra no atual; o rejeitado nunca entra', () => {
  const v = [vinculo(1, 10, 1, 20, 2, 'confirmado'), vinculo(2, 20, 2, 30, 3, 'rejeitado')];
  const c = conexaoComVinculos(ANIMAIS, v);
  assert.equal(c.confirmados, 1);
  assert.deepEqual(c.atual.componentes, [[1, 2]]);
  assert.deepEqual(c.seConfirmados.componentes, [[1, 2]]);
});
