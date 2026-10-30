/**
 * GRUPOS DE CONTEMPORÂNEAS e preparação dos registros.
 *
 * Protegido aqui: primípara/adulta pela ordem ESTIMADA (o cadastro conhece
 * partos de antes do app) e pela idade; a ordem fixa dos filtros, cada um
 * contado; o corte de grupo pequeno; o desvio contra as OUTRAS do grupo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  IDADE_MAXIMA_PRIMIPARA_DIAS,
  chaveGrupo,
  classificarParto,
  desviosDasContemporaneas,
  ordemEstimada,
  prepararRegistros,
  rotuloGrupo,
} from '@/lib/melhoramento/contemporaneas';
import { CONFIG_PADRAO, type LactacaoEntrada } from '@/lib/melhoramento/tipos';

function lact(p: Partial<LactacaoEntrada> & { lactacaoId: number }): LactacaoEntrada {
  return {
    animalId: p.lactacaoId,
    propriedadeId: 1,
    especie: 'caprino',
    raca: null,
    ordemLactacao: 1,
    lactacoesDoAnimal: 1,
    ordemPartoCadastro: 1,
    dataInicio: '2024-03-10',
    anoEstacao: 2024,
    estacao: 'outono',
    idadePartoDias: 500,
    encerrada: true,
    duracaoDias: 250,
    totalLeite: 600,
    mediaLeite: 2.4,
    metodo: 'DEFINITIVO_FILHO',
    sintetica: false,
    paiId: null,
    maeId: null,
    ...p,
  };
}

test('ordemEstimada: partos de antes do app entram na frente das lactações registradas', () => {
  assert.equal(ordemEstimada(lact({ lactacaoId: 1, ordemLactacao: 1, lactacoesDoAnimal: 2, ordemPartoCadastro: 2 })), 1);
  assert.equal(ordemEstimada(lact({ lactacaoId: 2, ordemLactacao: 1, lactacoesDoAnimal: 1, ordemPartoCadastro: 3 })), 3);
  assert.equal(ordemEstimada(lact({ lactacaoId: 3, ordemLactacao: 2, lactacoesDoAnimal: 2, ordemPartoCadastro: null })), 2);
});

test('classificarParto: primeira lactação jovem é primípara; velha ou com partos anteriores é adulta', () => {
  assert.equal(classificarParto(lact({ lactacaoId: 1, idadePartoDias: 540 })), 'primipara');
  assert.equal(classificarParto(lact({ lactacaoId: 2, idadePartoDias: IDADE_MAXIMA_PRIMIPARA_DIAS })), 'adulta');
  assert.equal(classificarParto(lact({ lactacaoId: 3, idadePartoDias: null })), 'primipara');
  assert.equal(classificarParto(lact({ lactacaoId: 4, idadePartoDias: -20 })), 'primipara', 'idade negativa não decide');
  assert.equal(classificarParto(lact({ lactacaoId: 5, ordemPartoCadastro: 3, lactacoesDoAnimal: 1 })), 'adulta');
  assert.equal(classificarParto(lact({ lactacaoId: 6, ordemLactacao: 2, lactacoesDoAnimal: 2 })), 'adulta');
});

test('chaveGrupo e rotuloGrupo: fazenda × ano × estação × classe', () => {
  const l = lact({ lactacaoId: 1, anoEstacao: 2023, estacao: 'verao' });
  assert.equal(chaveGrupo(l, 'primipara'), '1|2023|verao|primipara');
  assert.equal(rotuloGrupo('1|2023|verao|primipara'), 'verão de 2023 · primíparas');
});

test('prepararRegistros: cada lactação cai no PRIMEIRO filtro que a pega, e todos são contados', () => {
  const config = { ...CONFIG_PADRAO, tamanhoMinimoGrupo: 2 };
  const lactacoes = [
    lact({ lactacaoId: 1, sintetica: true, encerrada: false }),
    lact({ lactacaoId: 2, encerrada: false, mediaLeite: null }),
    lact({ lactacaoId: 3, mediaLeite: null }),
    lact({ lactacaoId: 4, mediaLeite: 0 }),
    lact({ lactacaoId: 5, duracaoDias: 59 }),
    lact({ lactacaoId: 6, duracaoDias: 601 }),
    lact({ lactacaoId: 7 }),
    lact({ lactacaoId: 8, mediaLeite: 3.0 }),
    lact({ lactacaoId: 9, estacao: 'inverno' }), // sozinha no grupo
  ];
  const p = prepararRegistros(lactacoes, 'media_diaria', config);
  assert.deepEqual(p.excluidas, {
    sintetica: 1,
    aberta: 1,
    sem_valor: 2,
    duracao_curta: 1,
    duracao_longa: 1,
    grupo_pequeno: 1,
  });
  assert.deepEqual(
    p.registros.map((r) => r.lactacaoId),
    [7, 8],
  );
  assert.deepEqual(p.gruposAntesDoCorte, { total: 2, tamanho1: 1, tamanho2a4: 1, tamanho5a9: 0, tamanho10mais: 0 });
  assert.equal(p.grupos.size, 1);
});

test('prepararRegistros: a característica muda só o valor, não as regras', () => {
  const p = prepararRegistros(
    [lact({ lactacaoId: 1, totalLeite: null }), lact({ lactacaoId: 2 })],
    'total_lactacao',
    { ...CONFIG_PADRAO, tamanhoMinimoGrupo: 1 },
  );
  assert.equal(p.excluidas.sem_valor, 1);
  assert.deepEqual(
    p.registros.map((r) => r.y),
    [600],
  );
});

test('desviosDasContemporaneas: desvio contra as OUTRAS do grupo; sozinha não tem desvio', () => {
  const d = desviosDasContemporaneas([
    { grupo: 'a', y: 1 },
    { grupo: 'a', y: 2 },
    { grupo: 'a', y: 6 },
    { grupo: 'b', y: 10 },
  ]);
  assert.deepEqual(d.desvio, [1 - 4, 2 - 3.5, 6 - 1.5, null]);
  assert.equal(d.mediaGrupo.get('a'), 3);
  // Σ(y − ȳ_g)² = 4 + 1 + 9 + 0 = 14; gl = 4 − 2 = 2.
  assert.equal(d.sigma2p, 7);
});

test('desviosDasContemporaneas: sem variação dentro de grupo, σ²P é null (não zero)', () => {
  const d = desviosDasContemporaneas([
    { grupo: 'a', y: 2 },
    { grupo: 'a', y: 2 },
  ]);
  assert.equal(d.sigma2p, null);
});
