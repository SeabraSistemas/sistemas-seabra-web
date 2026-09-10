/**
 * AML — as regras da avaliação morfológica.
 *
 * As duas que este arquivo existe para proteger:
 *
 *   · `tipo` TEM DUAS GRAFIAS DA MESMA COISA ('fêmea' e 'femea', 90 e 74
 *     linhas). Agrupar sem normalizar parte as fêmeas em dois grupos e faz cada
 *     metade parecer amostra pequena.
 *   · CADA PONTO TEM O SEU DENOMINADOR. Os sete pontos de úbere não existem em
 *     macho — não é dado faltando, é ausência do órgão —, e a média deles sobre
 *     o total de avaliações estaria certa na conta e errada na pergunta.
 *
 * E há uma função que NÃO existe de propósito: "pontos fortes e fracos". Escore
 * linear é descritivo (9 em profundidade de úbere é úbere profundo, que é
 * defeito), e sem tabela de ideal por característica um ranking de médias teria
 * cara de diagnóstico e conteúdo de sorteio. Ver o cabeçalho de areas/aml.ts.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PONTOS_AML,
  faixasDePontuacao,
  mediasPorPonto,
  melhoresAmls,
  normalizarTipo,
  pontosMaisDesiguais,
  resumoAml,
  serieAvaliacoes,
} from '@/lib/adm/areas/aml';
import type { LinhaAml } from '@/lib/adm/areas/contrato';

function aml(parcial: Partial<LinhaAml> & { aml_id: number }): LinhaAml {
  return {
    propriedade_id: 1,
    animal_id: parcial.aml_id,
    numero_animal: String(parcial.aml_id),
    nome_animal: null,
    sexo: 'fêmea',
    data_avaliacao: '2026-08-08',
    tecnico_id: 9,
    tipo: 'fêmea',
    pontuacao_total: 75,
    p1_mobilidade: 6,
    p2_largura_peito: 6,
    p3_profundidade_corporal: 6,
    p4_angulo_garupa: 6,
    p6_membros_lateral: 6,
    p8_capacidade: 6,
    p9_largura_garupa: 6,
    p15_membros_anterior: 6,
    p16_estrutura_ossea: 6,
    p5_profundidade_ubere: 5,
    p7_ligamento_anterior: 5,
    p10_ligamento_posterior: 5,
    p11_volume_ubere: 5,
    p12_ligamento_suspensorio: 5,
    p13_posicao_tetos: 5,
    p14_diametro_tetos: 5,
    ...parcial,
  };
}

/** Um macho: os sete pontos de úbere não existem. */
function macho(parcial: Partial<LinhaAml> & { aml_id: number }): LinhaAml {
  return aml({
    tipo: 'macho',
    sexo: 'macho',
    p5_profundidade_ubere: null,
    p7_ligamento_anterior: null,
    p10_ligamento_posterior: null,
    p11_volume_ubere: null,
    p12_ligamento_suspensorio: null,
    p13_posicao_tetos: null,
    p14_diametro_tetos: null,
    ...parcial,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// normalizarTipo — a faxina antes de agrupar
// ─────────────────────────────────────────────────────────────────────────────

test('normalizarTipo: "fêmea" e "femea" são a MESMA coisa', () => {
  assert.equal(normalizarTipo('fêmea'), 'fêmea');
  assert.equal(normalizarTipo('femea'), 'fêmea');
  assert.equal(normalizarTipo('FÊMEA'), 'fêmea');
  assert.equal(normalizarTipo('  Femea '), 'fêmea');
});

test('normalizarTipo: macho é macho, com ou sem caixa', () => {
  assert.equal(normalizarTipo('macho'), 'macho');
  assert.equal(normalizarTipo('Macho'), 'macho');
});

test('normalizarTipo: "Padrão" e "linear" não são sexo — viram "outro", sem chutar', () => {
  assert.equal(normalizarTipo('Padrão'), 'outro');
  assert.equal(normalizarTipo('linear'), 'outro');
  assert.equal(normalizarTipo(null), 'outro');
  assert.equal(normalizarTipo(''), 'outro');
});

// ─────────────────────────────────────────────────────────────────────────────
// mediasPorPonto — cada ponto com o seu denominador
// ─────────────────────────────────────────────────────────────────────────────

test('mediasPorPonto: os 16 pontos saem sempre, na ordem da ficha', () => {
  const medias = mediasPorPonto([aml({ aml_id: 1 })]);
  assert.equal(medias.length, 16);
  assert.deepEqual(
    medias.map((m) => m.numero),
    PONTOS_AML.map((p) => p.numero),
  );
  assert.deepEqual(
    medias.map((m) => m.numero),
    [...medias.map((m) => m.numero)].sort((a, b) => a - b),
    'a ordem é 1..16, e não ordenada por média — ordenar seria o ranking que não se faz aqui',
  );
});

test('mediasPorPonto: úbere de macho NÃO entra no denominador — é ausência de órgão, não dado faltando', () => {
  const medias = mediasPorPonto([
    aml({ aml_id: 1, p11_volume_ubere: 8 }),
    macho({ aml_id: 2 }),
  ]);

  const volume = medias.find((m) => m.numero === 11);
  assert.equal(volume?.media, 8, 'a média do úbere é só das fêmeas');
  assert.equal(volume?.medicoes, 1);

  const mobilidade = medias.find((m) => m.numero === 1);
  assert.equal(mobilidade?.medicoes, 2, 'o ponto de corpo conta os dois');
});

test('mediasPorPonto: ponto sem nenhuma medição devolve média null, não zero', () => {
  const medias = mediasPorPonto([macho({ aml_id: 1 })]);
  const ubere = medias.find((m) => m.numero === 11);
  assert.equal(ubere?.media, null);
  assert.equal(ubere?.medicoes, 0);
});

test('mediasPorPonto: desvio precisa de duas medições — com uma só é null, e não 0', () => {
  const medias = mediasPorPonto([aml({ aml_id: 1, p1_mobilidade: 6 })]);
  assert.equal(medias.find((m) => m.numero === 1)?.desvio, null);
});

test('mediasPorPonto: o desvio é o populacional sobre as medições daquele ponto', () => {
  const medias = mediasPorPonto([
    aml({ aml_id: 1, p1_mobilidade: 4 }),
    aml({ aml_id: 2, p1_mobilidade: 8 }),
  ]);

  const mobilidade = medias.find((m) => m.numero === 1);
  assert.equal(mobilidade?.media, 6);
  assert.equal(mobilidade?.desvio, 2);
});

test('pontosMaisDesiguais: ordena pela variação, e desempata pelo número do ponto', () => {
  const medias = mediasPorPonto([
    aml({ aml_id: 1, p1_mobilidade: 1, p2_largura_peito: 5 }),
    aml({ aml_id: 2, p1_mobilidade: 9, p2_largura_peito: 6 }),
  ]);

  const desiguais = pontosMaisDesiguais(medias, 2);
  assert.equal(desiguais[0].numero, 1, 'mobilidade varia de 1 a 9');
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo, faixas e ranking
// ─────────────────────────────────────────────────────────────────────────────

test('resumoAml: conta animais DISTINTOS, e marca quantos foram reavaliados', () => {
  const resumo = resumoAml([
    aml({ aml_id: 1, animal_id: 10 }),
    aml({ aml_id: 2, animal_id: 10, data_avaliacao: '2025-01-10' }),
    aml({ aml_id: 3, animal_id: 20 }),
  ]);

  assert.equal(resumo.avaliacoes, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.reavaliados, 1);
});

test('resumoAml: soma as duas grafias de fêmea num grupo só', () => {
  const resumo = resumoAml([
    aml({ aml_id: 1, tipo: 'fêmea' }),
    aml({ aml_id: 2, tipo: 'femea' }),
    macho({ aml_id: 3 }),
  ]);

  assert.equal(resumo.femeas, 2);
  assert.equal(resumo.machos, 1);
});

test('resumoAml: primeira e última avaliação delimitam o histórico', () => {
  const resumo = resumoAml([
    aml({ aml_id: 1, data_avaliacao: '2026-08-08' }),
    aml({ aml_id: 2, data_avaliacao: '2024-01-20' }),
  ]);

  assert.equal(resumo.primeira, '2024-01-20');
  assert.equal(resumo.ultima, '2026-08-08');
});

test('resumoAml: fazenda sem AML não vira NaN', () => {
  const resumo = resumoAml([]);
  assert.equal(resumo.avaliacoes, 0);
  assert.equal(resumo.pontuacaoMedia, null);
  assert.equal(resumo.melhor, null);
  assert.equal(resumo.primeira, null);
});

test('faixasDePontuacao: as cinco faixas saem sempre, e as bordas não se sobrepõem', () => {
  const faixas = faixasDePontuacao([
    aml({ aml_id: 1, pontuacao_total: 59.9 }),
    aml({ aml_id: 2, pontuacao_total: 60 }),
    aml({ aml_id: 3, pontuacao_total: 90 }),
  ]);

  assert.equal(faixas.length, 5);
  assert.equal(faixas.find((f) => f.rotulo === 'abaixo de 60')?.avaliacoes, 1);
  assert.equal(faixas.find((f) => f.rotulo === '60 a 69')?.avaliacoes, 1);
  assert.equal(faixas.find((f) => f.rotulo === '90 ou mais')?.avaliacoes, 1);
});

test('faixasDePontuacao: avaliação sem nota fica fora do denominador', () => {
  const faixas = faixasDePontuacao([
    aml({ aml_id: 1, pontuacao_total: 80 }),
    aml({ aml_id: 2, pontuacao_total: null }),
  ]);

  assert.equal(faixas.find((f) => f.rotulo === '80 a 89')?.fracao, 1);
});

test('melhoresAmls: maior nota primeiro, empate pelo número do animal', () => {
  const melhores = melhoresAmls([
    aml({ aml_id: 1, numero_animal: '200', pontuacao_total: 80 }),
    aml({ aml_id: 2, numero_animal: '100', pontuacao_total: 80 }),
    aml({ aml_id: 3, numero_animal: '300', pontuacao_total: 91 }),
    aml({ aml_id: 4, numero_animal: '400', pontuacao_total: null }),
  ]);

  assert.deepEqual(
    melhores.map((a) => a.numero_animal),
    ['300', '100', '200'],
  );
});

test('serieAvaliacoes: agrupa por mês, em ordem cronológica', () => {
  const serie = serieAvaliacoes([
    aml({ aml_id: 1, data_avaliacao: '2026-08-08' }),
    aml({ aml_id: 2, data_avaliacao: '2026-08-26' }),
    aml({ aml_id: 3, data_avaliacao: '2024-01-20' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2024-01', valor: 1 },
    { periodo: '2026-08', valor: 2 },
  ]);
});
