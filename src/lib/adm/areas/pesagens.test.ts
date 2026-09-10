/**
 * PESAGENS — o ganho que a balança mede.
 *
 * O que este arquivo protege:
 *
 *   · PESO IMPOSSÍVEL sai das médias: a base tem uma pesagem de 408 kg (o mesmo
 *     408 do peso ao nascer, provável dígito a mais) e duas abaixo de 1 kg.
 *   · O GMD é do INTERVALO, não da pesagem: só existe onde o animal foi pesado
 *     duas vezes, e a view já descarta intervalo curto demais (que transforma
 *     erro de balança em ganho) e longo demais (que não é ganho diário).
 *   · PESO POR CATEGORIA usa a ÚLTIMA pesagem de cada animal; o ganho usa TODOS
 *     os intervalos. Misturar as duas coisas faria o peso do lote depender de
 *     quantas vezes cada animal subiu na balança.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PESO_MAXIMO_KG,
  distribuicaoGmd,
  melhoresGanhos,
  pesoUtilizavel,
  pioresGanhos,
  porCategoria,
  resumoPesagens,
  seriePesagens,
  sessoesDePesagem,
} from '@/lib/adm/areas/pesagens';
import type { LinhaPesagem } from '@/lib/adm/areas/contrato';

function pesagem(parcial: Partial<LinhaPesagem> & { pesagem_id: number }): LinhaPesagem {
  return {
    propriedade_id: 1,
    animal_id: parcial.pesagem_id,
    numero_animal: String(parcial.pesagem_id),
    nome_animal: null,
    sexo: 'fêmea',
    status_animal: 'ativo',
    categoria: 'Recria',
    data_pesagem: '2026-07-21',
    peso_kg: 40,
    idade_dias: 300,
    peso_anterior: 35,
    dias_desde_anterior: 56,
    gmd: 0.09,
    peso_ideal: null,
    progresso: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Peso implausível
// ─────────────────────────────────────────────────────────────────────────────

test('pesoUtilizavel: recusa o boi de 408 kg e a balança zerada', () => {
  assert.equal(pesoUtilizavel(pesagem({ pesagem_id: 1, peso_kg: 40 })), true);
  assert.equal(pesoUtilizavel(pesagem({ pesagem_id: 2, peso_kg: 408 })), false);
  assert.equal(pesoUtilizavel(pesagem({ pesagem_id: 3, peso_kg: 0.5 })), false);
  assert.equal(pesoUtilizavel(pesagem({ pesagem_id: 4, peso_kg: null })), false);
  assert.equal(
    pesoUtilizavel(pesagem({ pesagem_id: 5, peso_kg: PESO_MAXIMO_KG })),
    true,
    'o teto é inclusivo',
  );
});

test('resumoPesagens: peso impossível fica fora da média e é contado à parte', () => {
  const resumo = resumoPesagens([
    pesagem({ pesagem_id: 1, peso_kg: 30 }),
    pesagem({ pesagem_id: 2, peso_kg: 50 }),
    pesagem({ pesagem_id: 3, peso_kg: 408 }),
  ]);

  assert.equal(resumo.pesoMedio, 40);
  assert.equal(resumo.comPeso, 2);
  assert.equal(resumo.pesoImplausivel, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoPesagens: conta animais distintos, sessões e quem tem duas ou mais passagens', () => {
  const resumo = resumoPesagens([
    pesagem({ pesagem_id: 1, animal_id: 10, data_pesagem: '2026-01-10' }),
    pesagem({ pesagem_id: 2, animal_id: 10, data_pesagem: '2026-07-21' }),
    pesagem({ pesagem_id: 3, animal_id: 20, data_pesagem: '2026-07-21' }),
  ]);

  assert.equal(resumo.pesagens, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.sessoes, 2);
  assert.equal(resumo.comDuasOuMais, 1);
});

test('resumoPesagens: o GMD médio é sobre INTERVALOS, e o denominador vai junto', () => {
  const resumo = resumoPesagens([
    // A primeira pesagem do animal não tem intervalo — gmd null.
    pesagem({ pesagem_id: 1, gmd: null, peso_anterior: null, dias_desde_anterior: null }),
    pesagem({ pesagem_id: 2, gmd: 0.1 }),
    pesagem({ pesagem_id: 3, gmd: 0.2 }),
  ]);

  assert.ok(Math.abs((resumo.gmdMedio ?? 0) - 0.15) < 1e-9);
  assert.equal(resumo.intervalos, 2, 'e não 3 pesagens');
});

test('resumoPesagens: intervalo com ganho negativo é contado — é a lista de ação', () => {
  const resumo = resumoPesagens([
    pesagem({ pesagem_id: 1, gmd: -0.05 }),
    pesagem({ pesagem_id: 2, gmd: 0.1 }),
  ]);

  assert.equal(resumo.intervalosNegativos, 1);
});

test('resumoPesagens: fazenda sem pesagem não vira NaN', () => {
  const resumo = resumoPesagens([]);
  assert.equal(resumo.pesagens, 0);
  assert.equal(resumo.pesoMedio, null);
  assert.equal(resumo.gmdMedio, null);
  assert.equal(resumo.ultima, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Sessões
// ─────────────────────────────────────────────────────────────────────────────

test('sessoesDePesagem: agrupa por dia, do mais recente, contando animais distintos', () => {
  const sessoes = sessoesDePesagem([
    pesagem({ pesagem_id: 1, animal_id: 10, data_pesagem: '2026-07-21' }),
    pesagem({ pesagem_id: 2, animal_id: 20, data_pesagem: '2026-07-21' }),
    pesagem({ pesagem_id: 3, animal_id: 10, data_pesagem: '2026-01-10' }),
  ]);

  assert.deepEqual(
    sessoes.map((s) => s.data),
    ['2026-07-21', '2026-01-10'],
  );
  assert.equal(sessoes[0].animais, 2);
});

test('sessoesDePesagem: NÃO costura dias consecutivos — pesagem em dois turnos são dois dias', () => {
  const sessoes = sessoesDePesagem([
    pesagem({ pesagem_id: 1, data_pesagem: '2026-07-21' }),
    pesagem({ pesagem_id: 2, data_pesagem: '2026-07-22' }),
  ]);

  assert.equal(sessoes.length, 2, 'diferente do controle leiteiro, aqui não há rabicho a costurar');
});

// ─────────────────────────────────────────────────────────────────────────────
// Distribuição do ganho
// ─────────────────────────────────────────────────────────────────────────────

test('distribuicaoGmd: as seis faixas saem sempre, e as duas primeiras são de alerta', () => {
  const faixas = distribuicaoGmd([pesagem({ pesagem_id: 1, gmd: 0.09 })]);
  assert.equal(faixas.length, 6);
  assert.equal(faixas[0].alerta, true);
  assert.equal(faixas[1].alerta, true);
  assert.equal(faixas[2].alerta, false);
});

test('distribuicaoGmd: ganho negativo cai na faixa "perdeu peso", e o zero também', () => {
  const faixas = distribuicaoGmd([
    pesagem({ pesagem_id: 1, gmd: -0.2 }),
    pesagem({ pesagem_id: 2, gmd: 0 }),
    pesagem({ pesagem_id: 3, gmd: 0.01 }),
  ]);

  assert.equal(faixas[0].intervalos, 2);
  assert.equal(faixas[1].intervalos, 1, 'ganho de 10 g/dia entra em "até 50 g"');
});

test('distribuicaoGmd: pesagem sem intervalo não entra no denominador', () => {
  const faixas = distribuicaoGmd([
    pesagem({ pesagem_id: 1, gmd: 0.25 }),
    pesagem({ pesagem_id: 2, gmd: null }),
  ]);

  assert.equal(faixas[faixas.length - 1].fracao, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Categoria
// ─────────────────────────────────────────────────────────────────────────────

test('porCategoria: o peso usa a ÚLTIMA pesagem de cada animal, não a média das passagens', () => {
  const categorias = porCategoria([
    pesagem({ pesagem_id: 1, animal_id: 10, data_pesagem: '2026-01-10', peso_kg: 20, gmd: null }),
    pesagem({ pesagem_id: 2, animal_id: 10, data_pesagem: '2026-07-21', peso_kg: 40, gmd: 0.1 }),
  ]);

  assert.equal(categorias[0].animais, 1, 'um animal, não duas pesagens');
  assert.equal(categorias[0].pesoMedio, 40, 'a última, e não a média de 20 e 40');
  assert.equal(categorias[0].intervalos, 1);
});

test('porCategoria: "Sem categoria" vai por último', () => {
  const categorias = porCategoria([
    pesagem({ pesagem_id: 1, animal_id: 10, categoria: null }),
    pesagem({ pesagem_id: 2, animal_id: 20, categoria: null }),
    pesagem({ pesagem_id: 3, animal_id: 30, categoria: 'Recria' }),
  ]);

  assert.deepEqual(
    categorias.map((c) => c.categoria),
    ['Recria', 'Sem categoria'],
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Rankings e série
// ─────────────────────────────────────────────────────────────────────────────

test('melhoresGanhos e pioresGanhos: extremos opostos, empate pelo número do animal', () => {
  const lista = [
    pesagem({ pesagem_id: 1, numero_animal: '200', gmd: 0.1 }),
    pesagem({ pesagem_id: 2, numero_animal: '100', gmd: 0.1 }),
    pesagem({ pesagem_id: 3, numero_animal: '300', gmd: 0.3 }),
    pesagem({ pesagem_id: 4, numero_animal: '400', gmd: -0.1 }),
  ];

  assert.equal(melhoresGanhos(lista)[0].numero_animal, '300');
  assert.equal(pioresGanhos(lista)[0].numero_animal, '400');
  assert.deepEqual(
    melhoresGanhos(lista).slice(1, 3).map((p) => p.numero_animal),
    ['100', '200'],
  );
});

test('rankings ignoram pesagem sem GMD e não mexem no array recebido', () => {
  const lista = [pesagem({ pesagem_id: 1, gmd: null }), pesagem({ pesagem_id: 2, gmd: 0.2 })];
  const antes = lista.map((p) => p.pesagem_id);

  assert.equal(melhoresGanhos(lista).length, 1);
  assert.deepEqual(
    lista.map((p) => p.pesagem_id),
    antes,
  );
});

test('seriePesagens: agrupa por mês, em ordem cronológica', () => {
  const serie = seriePesagens([
    pesagem({ pesagem_id: 1, data_pesagem: '2026-07-21' }),
    pesagem({ pesagem_id: 2, data_pesagem: '2026-07-22' }),
    pesagem({ pesagem_id: 3, data_pesagem: '2026-01-10' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-07', valor: 2 },
  ]);
});
