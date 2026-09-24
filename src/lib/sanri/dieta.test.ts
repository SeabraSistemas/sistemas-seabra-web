import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  ALIMENTOS,
  COLUNAS_DIETA,
  baiaVazia,
  colunaDe,
  compararBaias,
  dietaAtual,
  galpaoDe,
  kgPorCabra,
  kgPorDia,
  mapBaias,
  mapDieta,
  totaisPorTurno,
} from '@/lib/sanri/dieta';

/** Linha de dieta_baia na ordem de COLUNAS_DIETA, a partir de um mapa coluna -> valor. */
function linha(v: Record<string, string>): string[] {
  return COLUNAS_DIETA.map((c) => v[c] ?? '');
}

// Baia G1-5 da planilha "Alimentação" (Excel da equipe, 24/09/2026):
// 14 cabras; manhã 2,5 baldes de silagem + 5 de ração; 12h 3 kg de feno; tarde 5 baldes de ração.
const G1_5 = {
  id: 'a1',
  data: '24/09/2026',
  baia: 'G1-5',
  categoria: 'Lactante',
  cabras: '14',
  silagem_manha_baldes: '2,5',
  racao_manha_baldes: '5',
  feno_12h_kg: '3',
  racao_tarde_baldes: '5',
  obs: 'Quantidade em teste',
  lancado_por: 'x@y.z',
};

describe('dieta/colunas', () => {
  test('header da aba: id, data, baia, categoria, cabras, 9 quantidades, obs, lancado_por', () => {
    assert.equal(COLUNAS_DIETA.length, 16);
    assert.deepEqual(COLUNAS_DIETA.slice(0, 5), ['id', 'data', 'baia', 'categoria', 'cabras']);
    assert.ok(COLUNAS_DIETA.includes('silagem_manha_baldes'));
    assert.ok(COLUNAS_DIETA.includes('feno_12h_kg'));
    assert.equal(colunaDe(ALIMENTOS[1], 'tarde'), 'racao_tarde_baldes');
  });
});

describe('dieta/baias', () => {
  test('ordem do curral: G1-2 antes de G1-10, galpão numerado antes de Bodil/Maternidade', () => {
    const nomes = ['MATERNIDADE', 'G1-10', 'G2-1', 'BODIL', 'G1-2'].sort(compararBaias);
    assert.deepEqual(nomes, ['G1-2', 'G1-10', 'G2-1', 'BODIL', 'MATERNIDADE']);
  });

  test('galpão sai do nome da baia', () => {
    assert.equal(galpaoDe('G3-8'), 'Galpão 3');
    assert.equal(galpaoDe('BODIL'), 'Bodil');
  });

  test('junta a categoria, normaliza o nome e tira o botijão de sêmen', () => {
    const baias = mapBaias(
      [['ID baias', 'baias', 'img'], ['1', 'G1-10'], ['2', 'g1-4 '], ['3', 'BOTIJÃO'], ['4', 'G1-4'], ['5', 'BODIL']],
      [['ID baia', 'Baia', 'Categoria'], ['a', 'G1-4', 'Pré-parto'], ['b', 'BOTIJÃO', 'Sêmen'], ['c', 'BODIL', 'Reprodutor']],
    );
    assert.deepEqual(baias, [
      { nome: 'G1-4', galpao: 'Galpão 1', categoria: 'Pré-parto' },
      { nome: 'G1-10', galpao: 'Galpão 1', categoria: null },
      { nome: 'BODIL', galpao: 'Bodil', categoria: 'Reprodutor' },
    ]);
  });
});

describe('dieta/historico', () => {
  test('lê vírgula decimal e trata vazio/zero como "não dá"', () => {
    const [d] = mapDieta([COLUNAS_DIETA, linha(G1_5)]);
    assert.equal(d.cabras, 14);
    assert.equal(d.quantidades.silagem.manha, 2.5);
    assert.equal(d.quantidades.silagem.tarde, null);
    assert.equal(d.quantidades.feno['12h'], 3);
    assert.equal(d.obs, 'Quantidade em teste');
  });

  test('a dieta atual de cada baia é a última linha dela', () => {
    const hist = mapDieta([
      COLUNAS_DIETA,
      linha(G1_5),
      linha({ id: 'b1', data: '24/09/2026', baia: 'G1-6', cabras: '8', racao_manha_baldes: '6' }),
      linha({ ...G1_5, id: 'a2', data: '25/09/2026', cabras: '15' }),
    ]);
    const atual = dietaAtual(hist);
    assert.equal(hist.length, 3);
    assert.equal(atual.get('G1-5')?.id, 'a2');
    assert.equal(atual.get('G1-5')?.cabras, 15);
    assert.equal(atual.get('G1-6')?.id, 'b1');
  });

  test('ignora linha sem id, sem baia ou sem data', () => {
    const hist = mapDieta([COLUNAS_DIETA, linha({ ...G1_5, id: '' }), linha({ ...G1_5, baia: '' }), linha({ ...G1_5, data: '' })]);
    assert.equal(hist.length, 0);
  });
});

describe('dieta/contas', () => {
  const [g15] = mapDieta([COLUNAS_DIETA, linha(G1_5)]);

  test('kg por dia: balde de silagem = 20 kg, de ração = 2 kg, feno já em kg', () => {
    assert.deepEqual(kgPorDia(g15.quantidades), { silagem: 50, racao: 20, feno: 3 });
  });

  test('kg por cabra por dia (14 cabras)', () => {
    assert.deepEqual(kgPorCabra(g15), { silagem: 3.57, racao: 1.43, feno: 0.21 });
  });

  test('sem nº de cabras não há média por cabra', () => {
    assert.equal(kgPorCabra({ ...g15, cabras: null }), null);
    assert.equal(kgPorCabra({ ...g15, cabras: 0 }), null);
  });

  test('baia vazia: 0 cabras, ou nada informado', () => {
    assert.equal(baiaVazia({ ...g15, cabras: 0 }), true);
    const [nada] = mapDieta([COLUNAS_DIETA, linha({ id: 'z', data: '24/09/2026', baia: 'G1-4' })]);
    assert.equal(baiaVazia(nada), true);
    assert.equal(baiaVazia(g15), false);
  });

  test('total por turno soma as baias e pula as vazias', () => {
    const hist = mapDieta([
      COLUNAS_DIETA,
      linha(G1_5),
      linha({ id: 'b1', data: '24/09/2026', baia: 'G1-6', cabras: '8', silagem_manha_baldes: '2,5', racao_manha_baldes: '6', feno_12h_kg: '3' }),
      linha({ id: 'c1', data: '24/09/2026', baia: 'G1-8', cabras: '0', racao_manha_baldes: '9' }),
    ]);
    const t = totaisPorTurno(hist);
    assert.equal(t.silagem.manha, 5);
    assert.equal(t.racao.manha, 11);
    assert.equal(t.racao.tarde, 5);
    assert.equal(t.feno['12h'], 6);
    assert.equal(t.silagem.tarde, null);
  });
});
