import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  agruparPorReprodutor,
  diaDeIso,
  mapAnimais,
  mapLactacoes,
  noPlantel,
  ranking,
  recortar,
  resumir,
  type LinhaLactacao,
  type LinhaRebanho,
} from '@/lib/sanri/reprodutores';

const CATEGORIAS = new Map([
  ['c-rep', 'reprodutor'],
  ['c-lac', 'lactante'],
  ['c-ven', 'venda'],
  ['c-obi', 'obito'],
  ['c-his', 'historico'],
]);

function animal(id: number, p: Partial<LinhaRebanho> = {}): LinhaRebanho {
  return { id, numero_animal: String(1000 + id), nome_animal: `ANIMAL ${id}`, sexo: 'fêmea', pai_id: null, mae_id: null, partos: 2, categoria: 'c-lac', status: 'ativo', ...p };
}

let seq = 0;
function lact(animalId: number, p: Partial<LinhaLactacao> = {}): LinhaLactacao {
  return {
    id: ++seq,
    animal_id: animalId,
    data_inicio: '2025-01-10',
    data_fim: '2025-11-10',
    dias_em_lactacao: 300,
    total_leite: 900,
    media_leite: 3,
    media_corrigida: 3,
    confianca_inferencia: 'DEFINITIVO',
    ...p,
  };
}

// Reprodutor 1 (com nome, no plantel) e 2 (sem nome, histórico). Filhas 10-13 do 1, 20 do 2.
const ANIMAIS = mapAnimais(
  [
    animal(90, { nome_animal: 'AVÔ', sexo: 'macho', categoria: 'c-his', status: 'inativo' }),
    animal(91, { nome_animal: 'AVÓ', sexo: 'fêmea', categoria: 'c-his', status: 'inativo' }),
    animal(1, { nome_animal: 'CHOPE SANRI', sexo: 'macho', categoria: 'c-rep', pai_id: 90, mae_id: 91 }),
    animal(2, { nome_animal: null, sexo: 'macho', categoria: 'c-his', status: 'inativo' }),
    animal(10, { pai_id: 1, partos: 3 }),
    animal(11, { pai_id: 1, partos: 1 }),
    animal(12, { pai_id: 1, partos: 2, categoria: 'c-ven', status: 'inativo' }),
    animal(13, { pai_id: 1, partos: 0 }),
    animal(20, { pai_id: 2, partos: 4 }),
    animal(30, { pai_id: 1, sexo: 'macho' }), // filho macho não é filha
  ],
  CATEGORIAS,
);

const LACTACOES = mapLactacoes([
  // filha 10: duas lactações com leite (corrigidas 3,66 e 3,00)
  lact(10, { data_inicio: '2024-01-01', data_fim: '2024-11-01', media_leite: 3, media_corrigida: 3.66, total_leite: 900, dias_em_lactacao: 300 }),
  lact(10, { data_inicio: '2025-02-01', data_fim: '2025-12-01', media_leite: 3, media_corrigida: 3, total_leite: 1000, dias_em_lactacao: 320, confianca_inferencia: 'INFERIDO' }),
  // filha 11: uma com leite (4,4 corrigida) e uma SEM leite (zero de import)
  lact(11, { media_leite: 3.6, media_corrigida: 4.4, total_leite: 800, dias_em_lactacao: 200 }),
  lact(11, { data_inicio: '2023-03-01', data_fim: '2023-10-01', media_leite: 0, media_corrigida: 0, total_leite: 0, dias_em_lactacao: 214 }),
  // filha 12 (vendida): uma estimada com leite, sem correção gravada
  lact(12, { media_leite: 2, media_corrigida: null, total_leite: 500, dias_em_lactacao: 250, confianca_inferencia: 'ESTIMATIVA' }),
  // filha 13: só lactação aberta (não conta)
  lact(13, { data_fim: null }),
  // filha 20 (reprodutor 2)
  lact(20, { media_leite: 2.5, media_corrigida: 2.5, total_leite: 600, dias_em_lactacao: 240 }),
  // filho macho com lactação (dado sujo) não entra
  lact(30),
]);

const SEM_FILTRO = { soDefinitivas: false };

describe('reprodutores/leitura', () => {
  test('datas ISO viram aaaammdd; categoria, sexo e situação vêm normalizados', () => {
    assert.equal(diaDeIso('2026-05-12'), 20260512);
    assert.equal(diaDeIso(null), null);
    const chope = ANIMAIS.find((a) => a.id === 1)!;
    assert.deepEqual([chope.sexo, chope.categoria, chope.ativo], ['macho', 'reprodutor', true]);
    assert.equal(noPlantel(chope), true);
    assert.equal(noPlantel(ANIMAIS.find((a) => a.id === 2)!), false);
  });

  test('confiança desconhecida vira OUTRA', () => {
    assert.equal(mapLactacoes([lact(1, { confianca_inferencia: null })])[0].confianca, 'OUTRA');
  });
});

describe('reprodutores/agrupar', () => {
  test('agrupa por pai da filha e ignora filho macho e lactação aberta', () => {
    const g = agruparPorReprodutor(ANIMAIS, LACTACOES, SEM_FILTRO);
    assert.deepEqual(g.map((x) => [x.paiId, x.filhas.map((f) => f.animal.id)]).sort(), [[1, [10, 11, 12]], [2, [20]]]);
  });

  test('lactações de cada filha ficam da mais antiga para a mais recente', () => {
    const f11 = agruparPorReprodutor(ANIMAIS, LACTACOES, SEM_FILTRO).find((g) => g.paiId === 1)!.filhas.find((f) => f.animal.id === 11)!;
    assert.deepEqual(f11.lactacoes.map((l) => l.inicio), [20230301, 20250110]);
  });

  test('"só definitivas" tira inferidas e estimadas — e a filha que fica sem nenhuma some', () => {
    const g = agruparPorReprodutor(ANIMAIS, LACTACOES, { soDefinitivas: true });
    const do1 = g.find((x) => x.paiId === 1)!;
    assert.deepEqual(do1.filhas.map((f) => f.animal.id), [10, 11]); // 12 só tinha estimada
    assert.equal(do1.filhas.find((f) => f.animal.id === 10)!.lactacoes.length, 1);
  });
});

describe('reprodutores/resumo', () => {
  const r1 = agruparPorReprodutor(ANIMAIS, LACTACOES, SEM_FILTRO).find((g) => g.paiId === 1)!;
  const resumo = resumir(r1.filhas);

  test('contagens: filhas, lactações, com e sem leite, por origem', () => {
    assert.equal(resumo.filhas, 3);
    assert.equal(resumo.lactacoes, 5);
    assert.equal(resumo.comLeite, 4);
    assert.equal(resumo.semLeite, 1);
    assert.deepEqual([resumo.definitivas, resumo.inferidas, resumo.estimadas], [3, 1, 1]);
  });

  test('média corrigida: média das médias por filha (10: 3,33 · 11: 4,4 · 12: 2 sem correção → bruta)', () => {
    // 10 = (3,66+3)/2 = 3,33 ; 11 = 4,4 (a sem leite fica fora) ; 12 = 2 => (3,33+4,4+2)/3 = 3,244
    assert.equal(resumo.mediaCorrigida, 3.24);
    // bruta: 10 = 3 ; 11 = 3,6 ; 12 = 2 => 2,8667
    assert.equal(resumo.mediaBruta, 2.87);
  });

  test('a lactação sem leite não puxa a média para baixo', () => {
    const sem = resumir(r1.filhas.filter((f) => f.animal.id === 11));
    assert.equal(sem.mediaCorrigida, 4.4);
    assert.equal(sem.semLeite, 1);
  });

  test('acumulado e dias: média direta sobre as lactações com leite; partos e baixas pelas filhas', () => {
    assert.equal(resumo.acumuladoMedio, 800); // (900+1000+800+500)/4
    assert.equal(resumo.diasMedios, 268); // (300+320+200+250)/4 = 267,5
    assert.equal(resumo.partosMedios, 2); // (3+1+2)/3
    assert.equal(resumo.baixas, 1); // a 12 foi vendida
  });

  test('sem lactação com leite as médias ficam nulas, não zero', () => {
    const vazio = resumir([{ animal: ANIMAIS.find((a) => a.id === 10)!, lactacoes: [] }]);
    assert.equal(vazio.mediaCorrigida, null);
    assert.equal(vazio.acumuladoMedio, null);
  });
});

describe('reprodutores/ranking', () => {
  const linhas = ranking(ANIMAIS, LACTACOES, SEM_FILTRO);

  test('ordena por número de filhas; traz nome, plantel e pais do reprodutor', () => {
    assert.deepEqual(linhas.map((l) => l.paiId), [1, 2]);
    const chope = linhas[0];
    assert.deepEqual([chope.nome, chope.noPlantel, chope.paiNome, chope.maeNome], ['CHOPE SANRI', true, 'AVÔ', 'AVÓ']);
    assert.deepEqual([linhas[1].nome, linhas[1].noPlantel, linhas[1].paiNome], [null, false, null]);
  });
});

describe('reprodutores/recorte', () => {
  test('só levam filhas com lactação, os reprodutores e os pais deles', () => {
    const { animais, lactacoes } = recortar(ANIMAIS, LACTACOES);
    assert.deepEqual(animais.map((a) => a.id).sort((a, b) => a - b), [1, 2, 10, 11, 12, 20, 90, 91]);
    assert.ok(lactacoes.every((l) => l.animalId !== 30));
    // O ranking sai igual com ou sem o recorte.
    assert.deepEqual(ranking(animais, lactacoes, SEM_FILTRO), ranking(ANIMAIS, LACTACOES, SEM_FILTRO));
  });
});
