import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  COLUNAS_CONFERENCIA,
  animaisDaBaia,
  apurar,
  buscarAnimais,
  compararContagem,
  contagemPorBaia,
  foraDaContagem,
  mapConferencias,
  ultimaPorBaia,
} from '@/lib/sanri/conferencia';
import { mapAnimais } from '@/lib/sanri/monta';

// RebanhoProd reduzido: ID, número, nome, microchip, sexo, categoria, baia, óbito, venda.
const REBANHO = [
  ['ID', 'N° DO ANIMAL', 'NOME', 'MICROCHIP', 'SEXO', 'CATEGORIA', 'BAIA', 'DATA DO OBITO', 'DATA DA VENDA'],
  ['a1', '1421325285', 'FAÍSCA SANRI', '900255001300803', 'Fêmea', 'Recriada', 'G2-6'],
  ['a2', '1421325298', 'MULAN SANRI', '900255001300907', 'Fêmea', 'Recriada', 'g2-6 '],
  ['a3', '1421325274', 'CRISTAL SANRI', '900255001300795', 'Fêmea', 'Recriada', 'G2-6'],
  ['a4', '1421325240', 'ADA SANRI', '', 'Fêmea', 'Lactante', 'G1-3'],
  ['a5', '1421325222', 'ARQUITETA SANRI', '', 'Fêmea', 'Cria', 'MATERNIDADE'],
  // vendida, ainda com a baia preenchida
  ['a6', '1421325245', 'SACOLA SANRI', '', 'Fêmea', 'Descarte', 'G2-6', '', '09/06/2026'],
  // sem baia: histórico
  ['a7', '1421320001', 'ANTIGA', '', 'Fêmea', '', ''],
  // o mesmo número em duas linhas vivas, em baias diferentes (cadastro repetido)
  ['a8', '1421325237', 'TORA SANRI', '', 'Fêmea', 'Cria', 'G3-3'],
  ['a9', '1421325237', 'TORA SANRI', '', 'Fêmea', 'Cria', 'G1-3'],
  // sem número: ignorada
  ['a10', '', 'SEM NUMERO', '', 'Fêmea', 'Cria', 'G2-6'],
];
const ANIMAIS = mapAnimais(REBANHO);

describe('animaisDaBaia', () => {
  test('só vivos, baia normalizada (caixa e espaço), em ordem alfabética', () => {
    const r = animaisDaBaia(ANIMAIS, 'G2-6');
    assert.deepEqual(r.map((a) => a.numero), ['1421325274', '1421325285', '1421325298']);
  });

  test('vendido com baia preenchida não entra, mas aparece em foraDaContagem', () => {
    assert.ok(!animaisDaBaia(ANIMAIS, 'G2-6').some((a) => a.numero === '1421325245'));
    assert.deepEqual(foraDaContagem(ANIMAIS, 'G2-6').map((a) => a.numero), ['1421325245']);
  });

  test('cadastro repetido em duas baias aparece nas duas, com o aviso da outra', () => {
    const g33 = animaisDaBaia(ANIMAIS, 'G3-3');
    const g13 = animaisDaBaia(ANIMAIS, 'G1-3');
    assert.deepEqual(g33[0].tambemEm, ['G1-3']);
    assert.deepEqual(g13.find((a) => a.numero === '1421325237')?.tambemEm, ['G3-3']);
  });

  test('baia inexistente ou vazia devolve lista vazia', () => {
    assert.deepEqual(animaisDaBaia(ANIMAIS, 'G9-9'), []);
    assert.deepEqual(animaisDaBaia(ANIMAIS, '  '), []);
  });

  test('linha sem número é ignorada', () => {
    assert.ok(!animaisDaBaia(ANIMAIS, 'G2-6').some((a) => a.chave === 'a10'));
  });
});

describe('contagemPorBaia', () => {
  test('conta animais distintos vivos por baia', () => {
    const c = contagemPorBaia(ANIMAIS);
    assert.equal(c.get('G2-6'), 3);
    assert.equal(c.get('G1-3'), 2);
    assert.equal(c.get('MATERNIDADE'), 1);
    assert.equal(c.get('G3-3'), 1);
  });
});

describe('compararContagem', () => {
  test('bate, falta e sobra', () => {
    assert.deepEqual(compararContagem(10, 10), { diferenca: 0, situacao: 'bate' });
    assert.deepEqual(compararContagem(10, 8), { diferenca: -2, situacao: 'falta' });
    assert.deepEqual(compararContagem(10, 11), { diferenca: 1, situacao: 'sobra' });
  });
});

describe('buscarAnimais', () => {
  test('por nome, sem acento e sem caixa', () => {
    assert.deepEqual(buscarAnimais(ANIMAIS, 'faisca').map((a) => a.numero), ['1421325285']);
  });

  test('pelo número inteiro, pelo final e pelo microchip', () => {
    assert.deepEqual(buscarAnimais(ANIMAIS, '1421325298').map((a) => a.numero), ['1421325298']);
    assert.deepEqual(buscarAnimais(ANIMAIS, '25285').map((a) => a.numero), ['1421325285']);
    assert.deepEqual(buscarAnimais(ANIMAIS, '900255001300795').map((a) => a.numero), ['1421325274']);
  });

  test('número escrito com espaço', () => {
    assert.deepEqual(buscarAnimais(ANIMAIS, '14213 25285').map((a) => a.numero), ['1421325285']);
  });

  test('termo curto demais não busca; vivos vêm antes; um por número', () => {
    assert.deepEqual(buscarAnimais(ANIMAIS, 'a'), []);
    const r = buscarAnimais(ANIMAIS, 'sanri');
    assert.equal(r.filter((a) => a.numero === '1421325237').length, 1);
    assert.equal(r.at(-1)?.numero, '1421325245'); // a vendida por último
  });

  test('respeita o limite', () => {
    assert.equal(buscarAnimais(ANIMAIS, 'sanri', 2).length, 2);
  });
});

describe('apurar', () => {
  test('lista não usada: não inventa "não vistos"', () => {
    const r = apurar(ANIMAIS, 'G2-6', 3, [], []);
    assert.ok(!('erro' in r));
    if ('erro' in r) return;
    assert.equal(r.esperados, 3);
    assert.equal(r.diferenca, 0);
    assert.deepEqual(r.naoVistos, []);
  });

  test('lista usada: quem não foi marcado vira "não visto"', () => {
    const r = apurar(ANIMAIS, 'G2-6', 2, ['1421325285', '1421325274'], []);
    assert.ok(!('erro' in r));
    if ('erro' in r) return;
    assert.equal(r.diferenca, -1);
    assert.deepEqual(r.naoVistos, ['1421325298']);
  });

  test('animal a mais é aceito se existe na planilha e não é da baia', () => {
    const r = apurar(ANIMAIS, 'G2-6', 4, [], ['1421325240']);
    assert.ok(!('erro' in r));
    if ('erro' in r) return;
    assert.deepEqual(r.aMais, ['1421325240']);
    assert.equal(r.diferenca, 1);
  });

  test('recusa contagem inválida, "visto" fora da baia, a mais desconhecido ou que já é da baia', () => {
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', -1, [], []));
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', 2.5, [], []));
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', 9999, [], []));
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', 3, ['1421325240'], []));
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', 3, [], ['9999999999']));
    assert.ok('erro' in apurar(ANIMAIS, 'G2-6', 3, [], ['1421325285']));
  });

  test('repetidos são juntados', () => {
    const r = apurar(ANIMAIS, 'G2-6', 3, ['1421325285', '1421325285'], []);
    assert.ok(!('erro' in r));
    if ('erro' in r) return;
    assert.deepEqual(r.vistos, ['1421325285']);
  });

  test('baia vazia: contar 0 bate', () => {
    const r = apurar(ANIMAIS, 'G9-9', 0, [], []);
    assert.ok(!('erro' in r));
    if ('erro' in r) return;
    assert.equal(r.diferenca, 0);
  });
});

describe('histórico', () => {
  const ABA = [
    COLUNAS_CONFERENCIA,
    ['c1', '24/09/2026', 'g2-6', '3', '3', '0', '', '', '', '', 'ana@sanri.com.br'],
    ['c2', '25/09/2026', 'G2-6', '2', '3', '-1', '1421325285;1421325274', '1421325298', '', 'faltou uma', 'ana@sanri.com.br'],
    ['c3', '25/09/2026', 'BODIL', '11', '10', '1', '', '', '1421323472', '', 'bia@sanri.com.br'],
    ['', '25/09/2026', 'G1-1', '4', '4'], // sem id: ignorada
  ];

  test('lê as conferências e normaliza a baia', () => {
    const h = mapConferencias(ABA);
    assert.equal(h.length, 3);
    assert.equal(h[0].baia, 'G2-6');
    assert.deepEqual(h[1].vistos, ['1421325285', '1421325274']);
    assert.deepEqual(h[1].naoVistos, ['1421325298']);
    assert.equal(h[1].diferenca, -1);
    assert.deepEqual(h[2].aMais, ['1421323472']);
  });

  test('a última conferência de cada baia é a última linha dela', () => {
    const u = ultimaPorBaia(mapConferencias(ABA));
    assert.equal(u.get('G2-6')?.id, 'c2');
    assert.equal(u.get('BODIL')?.id, 'c3');
    assert.equal(u.get('G1-1'), undefined);
  });

  test('aba ausente ou vazia', () => {
    assert.deepEqual(mapConferencias(null), []);
    assert.deepEqual(mapConferencias([]), []);
  });
});
