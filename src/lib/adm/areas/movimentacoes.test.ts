/**
 * MOVIMENTAÇÕES — para onde o rebanho anda.
 *
 * As regras que este arquivo protege:
 *
 *   · ORIGEM NULA NÃO É BURACO DE CADASTRO. A primeira movimentação de um animal
 *     não tem de onde — inventar uma origem transformaria entrada de rebanho em
 *     fluxo entre lotes.
 *   · MOVIMENTAÇÕES E ANIMAIS SÃO NÚMEROS DIFERENTES: o mesmo animal pode
 *     percorrer o mesmo caminho várias vezes, e somar os dois como se fossem um
 *     infla o fluxo.
 *   · OS DOIS TIPOS NÃO SE SOMAM SEM RESSALVA: trocar de lote é decisão de
 *     manejo, trocar de baia é lugar físico.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TIPO_LOCALIZACAO,
  TIPO_LOTE,
  destinoDe,
  destinosMaisComuns,
  fluxos,
  lerTipo,
  maisMovimentados,
  origemDe,
  resumoMovimentacoes,
  rotuloDoTipo,
  serieMovimentacoes,
} from '@/lib/adm/areas/movimentacoes';
import type { LinhaMovimentacao } from '@/lib/adm/areas/contrato';

function mov(parcial: Partial<LinhaMovimentacao> & { movimentacao_id: number }): LinhaMovimentacao {
  return {
    propriedade_id: 1,
    animal_id: parcial.movimentacao_id,
    numero_animal: String(parcial.movimentacao_id),
    nome_animal: null,
    status_animal: 'ativo',
    categoria: 'Cria',
    tipo: TIPO_LOTE,
    data_movimentacao: '2026-05-10',
    baia_origem: null,
    baia_destino: null,
    lote_origem: 'Lote A',
    lote_destino: 'Lote B',
    setor_destino: null,
    observacao: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Origem e destino
// ─────────────────────────────────────────────────────────────────────────────

test('destinoDe: lote na frente, depois baia, depois setor', () => {
  assert.equal(destinoDe(mov({ movimentacao_id: 1, lote_destino: 'Lote B', baia_destino: 'G1' })), 'Lote B');
  assert.equal(
    destinoDe(mov({ movimentacao_id: 2, lote_destino: null, baia_destino: 'G1' })),
    'G1',
  );
  assert.equal(
    destinoDe(mov({ movimentacao_id: 3, lote_destino: null, baia_destino: null, setor_destino: 'Setor 2' })),
    'Setor 2',
  );
  assert.equal(
    destinoDe(mov({ movimentacao_id: 4, lote_destino: null, baia_destino: null, setor_destino: null })),
    null,
  );
});

test('origemDe: null na PRIMEIRA movimentação do animal — não é dado faltando', () => {
  assert.equal(origemDe(mov({ movimentacao_id: 1, lote_origem: 'Lote A' })), 'Lote A');
  assert.equal(origemDe(mov({ movimentacao_id: 2, lote_origem: null, baia_origem: null })), null);
  assert.equal(
    origemDe(mov({ movimentacao_id: 3, lote_origem: '  ', baia_origem: 'G1' })),
    'G1',
    'string em branco não é origem',
  );
});

test('lerTipo e rotuloDoTipo: só os dois tipos reais viram filtro', () => {
  assert.equal(lerTipo(TIPO_LOTE), TIPO_LOTE);
  assert.equal(lerTipo(TIPO_LOCALIZACAO), TIPO_LOCALIZACAO);
  assert.equal(lerTipo('inventado'), null);
  assert.equal(lerTipo(undefined), null);
  assert.equal(rotuloDoTipo(TIPO_LOTE), 'Troca de lote');
  assert.equal(rotuloDoTipo('tipo_novo'), 'tipo_novo', 'tipo novo do app aparece cru, não sumido');
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoMovimentacoes: separa os dois tipos e mede a rotatividade por animal', () => {
  const resumo = resumoMovimentacoes([
    mov({ movimentacao_id: 1, animal_id: 10, tipo: TIPO_LOTE }),
    mov({ movimentacao_id: 2, animal_id: 10, tipo: TIPO_LOTE }),
    mov({ movimentacao_id: 3, animal_id: 20, tipo: TIPO_LOCALIZACAO }),
  ]);

  assert.equal(resumo.movimentacoes, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.porLote, 2);
  assert.equal(resumo.porLocalizacao, 1);
  assert.equal(resumo.mediaPorAnimal, 1.5);
  assert.equal(resumo.maisMovimentado, 2);
});

test('resumoMovimentacoes: conta as sem origem à parte, sem chamar de buraco', () => {
  const resumo = resumoMovimentacoes([
    mov({ movimentacao_id: 1, lote_origem: 'Lote A' }),
    mov({ movimentacao_id: 2, lote_origem: null, baia_origem: null }),
  ]);

  assert.equal(resumo.semOrigem, 1);
});

test('resumoMovimentacoes: sem movimentação não vira NaN', () => {
  const resumo = resumoMovimentacoes([]);
  assert.equal(resumo.movimentacoes, 0);
  assert.equal(resumo.mediaPorAnimal, null);
  assert.equal(resumo.maisMovimentado, 0);
  assert.equal(resumo.ultima, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo
// ─────────────────────────────────────────────────────────────────────────────

test('fluxos: agrupa por caminho e separa movimentações de ANIMAIS', () => {
  const caminhos = fluxos([
    mov({ movimentacao_id: 1, animal_id: 10, lote_origem: 'A', lote_destino: 'B' }),
    // O mesmo animal fez o mesmo caminho de novo.
    mov({ movimentacao_id: 2, animal_id: 10, lote_origem: 'A', lote_destino: 'B' }),
    mov({ movimentacao_id: 3, animal_id: 20, lote_origem: 'A', lote_destino: 'B' }),
  ]);

  assert.equal(caminhos.length, 1);
  assert.equal(caminhos[0].movimentacoes, 3);
  assert.equal(caminhos[0].animais, 2, 'dois animais, três passagens');
});

test('fluxos: movimentação SEM origem fica de fora — entrada não é caminho', () => {
  const caminhos = fluxos([
    mov({ movimentacao_id: 1, lote_origem: null, baia_origem: null, lote_destino: 'B' }),
    mov({ movimentacao_id: 2, lote_origem: 'A', lote_destino: 'B' }),
  ]);

  assert.equal(caminhos.length, 1);
  assert.equal(caminhos[0].origem, 'A');
});

test('fluxos: ordena do caminho mais percorrido', () => {
  const caminhos = fluxos([
    mov({ movimentacao_id: 1, lote_origem: 'A', lote_destino: 'B' }),
    mov({ movimentacao_id: 2, lote_origem: 'C', lote_destino: 'D' }),
    mov({ movimentacao_id: 3, lote_origem: 'C', lote_destino: 'D' }),
  ]);

  assert.equal(caminhos[0].origem, 'C');
});

test('destinosMaisComuns: INCLUI as sem origem — a pergunta é o destino, que existe sempre', () => {
  const destinos = destinosMaisComuns([
    mov({ movimentacao_id: 1, lote_origem: null, baia_origem: null, lote_destino: 'Maternidade' }),
    mov({ movimentacao_id: 2, lote_origem: 'A', lote_destino: 'Maternidade' }),
  ]);

  assert.equal(destinos[0].destino, 'Maternidade');
  assert.equal(destinos[0].movimentacoes, 2);
  assert.equal(destinos[0].fracao, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Rotatividade
// ─────────────────────────────────────────────────────────────────────────────

test('maisMovimentados: ordena por quantidade e traz o ÚLTIMO destino do animal', () => {
  const lista = maisMovimentados([
    mov({ movimentacao_id: 1, animal_id: 10, data_movimentacao: '2026-01-10', lote_destino: 'A' }),
    mov({ movimentacao_id: 2, animal_id: 10, data_movimentacao: '2026-05-10', lote_destino: 'Z' }),
    mov({ movimentacao_id: 3, animal_id: 20, data_movimentacao: '2026-03-10', lote_destino: 'B' }),
  ]);

  assert.equal(lista[0].animal_id, 10);
  assert.equal(lista[0].movimentacoes, 2);
  assert.equal(lista[0].ultimoDestino, 'Z', 'a mais recente, não a primeira da lista');
  assert.equal(lista[0].ultimaData, '2026-05-10');
});

test('maisMovimentados: não depende da ordem em que a lista chegou', () => {
  const ordemInvertida = maisMovimentados([
    mov({ movimentacao_id: 2, animal_id: 10, data_movimentacao: '2026-05-10', lote_destino: 'Z' }),
    mov({ movimentacao_id: 1, animal_id: 10, data_movimentacao: '2026-01-10', lote_destino: 'A' }),
  ]);

  assert.equal(ordemInvertida[0].ultimoDestino, 'Z');
});

test('serieMovimentacoes: agrupa por mês, em ordem cronológica', () => {
  const serie = serieMovimentacoes([
    mov({ movimentacao_id: 1, data_movimentacao: '2026-05-10' }),
    mov({ movimentacao_id: 2, data_movimentacao: '2026-05-20' }),
    mov({ movimentacao_id: 3, data_movimentacao: '2026-01-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-05', valor: 2 },
  ]);
});
