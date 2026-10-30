/**
 * CONEXÃO GENÉTICA ENTRE FAZENDAS e os candidatos a mesmo reprodutor.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  candidatosMesmoAnimal,
  normalizarIdentificacao,
  reprodutoresConectores,
} from '@/lib/melhoramento/conexao';
import type { AnimalEntrada } from '@/lib/melhoramento/tipos';

function animal(p: Partial<AnimalEntrada> & { animalId: number; propriedadeId: number }): AnimalEntrada {
  return {
    especie: 'caprino',
    numero: null,
    nome: null,
    sexo: 'fêmea',
    nascimento: null,
    paiId: null,
    maeId: null,
    ...p,
  };
}

test('reprodutoresConectores: só conta reprodutor com FILHAS em duas ou mais fazendas', () => {
  const animais = [
    animal({ animalId: 1, propriedadeId: 10, sexo: 'macho' }),
    animal({ animalId: 2, propriedadeId: 10, paiId: 1 }),
    animal({ animalId: 3, propriedadeId: 20, paiId: 1 }),
    animal({ animalId: 4, propriedadeId: 20, paiId: 1, sexo: 'macho' }), // filho, não filha
    animal({ animalId: 5, propriedadeId: 10, sexo: 'macho' }),
    animal({ animalId: 6, propriedadeId: 10, paiId: 5 }),
  ];
  assert.deepEqual(reprodutoresConectores(animais), [{ animalId: 1, propriedades: [10, 20], filhas: 2 }]);
  assert.deepEqual(reprodutoresConectores(animais.slice(4)), []);
});

test('normalizarIdentificacao: caixa, acento, espaço e pontuação não distinguem animal', () => {
  assert.equal(normalizarIdentificacao(' Bode Ágata-II '), 'BODEAGATAII');
  assert.equal(normalizarIdentificacao(null), '');
});

test('candidatosMesmoAnimal: mesmo nome ou número longo em fazendas diferentes; chave curta e mesma fazenda não', () => {
  const animais = [
    animal({ animalId: 1, propriedadeId: 10, sexo: 'macho', nome: 'Trovão', numero: '12' }),
    animal({ animalId: 2, propriedadeId: 20, sexo: 'macho', nome: 'TROVAO', numero: '12' }),
    animal({ animalId: 3, propriedadeId: 10, sexo: 'macho', nome: 'Zé', numero: 'BR12345' }),
    animal({ animalId: 4, propriedadeId: 30, sexo: 'macho', nome: 'Zé', numero: 'br-12345' }),
    animal({ animalId: 5, propriedadeId: 10, sexo: 'macho', nome: 'Duque' }),
    animal({ animalId: 6, propriedadeId: 10, sexo: 'macho', nome: 'Duque' }),
    animal({ animalId: 7, propriedadeId: 40, sexo: 'macho', nome: 'Sem filhas' }),
    animal({ animalId: 8, propriedadeId: 50, sexo: 'macho', nome: 'Sem filhas' }),
    // Filhas, para que 1..6 sejam reprodutores.
    ...[1, 2, 3, 4, 5, 6].map((pai, k) => animal({ animalId: 100 + k, propriedadeId: 10, paiId: pai })),
  ];
  const c = candidatosMesmoAnimal(animais);
  assert.deepEqual(
    c.map((x) => [x.criterio, x.chave, x.reprodutores.map((r) => r.animalId)]),
    [
      ['nome', 'TROVAO', [1, 2]],
      ['numero', 'BR12345', [3, 4]],
    ],
  );
  assert.equal(c[0].reprodutores[0].filhas, 1);
});
