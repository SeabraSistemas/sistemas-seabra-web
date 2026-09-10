/**
 * ÓBITOS — as regras que transformam 540 linhas num diagnóstico.
 *
 * O que este arquivo protege, acima de tudo, são os DENOMINADORES. Só 39% dos
 * óbitos da base têm suspeita anotada e 9% não têm data de nascimento: cada
 * porcentagem desta tela é sobre um subconjunto, e trocar o denominador por
 * "o total" transformaria uma observação sobre o preenchimento numa afirmação
 * sobre o rebanho. É o erro que não dá erro — o número continua plausível.
 *
 * Tudo aqui é entrada → saída, com `hoje` injetado: nenhuma destas funções lê
 * banco, rede ou relógio, senão o teste do filtro de período mudaria de
 * resultado amanhã.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERIODO_PADRAO,
  faixasEtarias,
  filtrarPorPeriodo,
  inicioDoPeriodo,
  lerPeriodo,
  rankingCausas,
  resumoObitos,
  serieMensalObitos,
} from '@/lib/adm/areas/obitos';
import type { LinhaObito } from '@/lib/adm/areas/contrato';

function obito(parcial: Partial<LinhaObito> & { obito_id: number }): LinhaObito {
  return {
    propriedade_id: 1,
    animal_id: parcial.obito_id,
    numero_animal: String(parcial.obito_id),
    nome_animal: null,
    sexo: 'fêmea',
    categoria: null,
    baia: null,
    data_obito: '2026-06-15',
    data_de_nascimento: '2026-01-01',
    idade_dias: 165,
    suspeitas: [],
    diagnostico_obito: null,
    sinais_clinicos: null,
    observacao: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

test('lerPeriodo: valor de fora só passa se estiver na lista; o resto cai no padrão', () => {
  assert.equal(lerPeriodo('90d'), '90d');
  assert.equal(lerPeriodo('ano'), 'ano');
  assert.equal(lerPeriodo('sempre'), PERIODO_PADRAO);
  assert.equal(lerPeriodo(undefined), PERIODO_PADRAO);
  assert.equal(lerPeriodo(['tudo', 'ano']), 'tudo', 'array na query string usa o primeiro');
});

test('inicioDoPeriodo: "tudo" não tem corte; "ano" começa em 1º de janeiro', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  assert.equal(inicioDoPeriodo('tudo', hoje), null);
  assert.equal(inicioDoPeriodo('ano', hoje), '2026-01-01');
  assert.equal(inicioDoPeriodo('90d', hoje), '2026-06-12');
  assert.equal(inicioDoPeriodo('12m', hoje), '2025-09-10');
});

test('filtrarPorPeriodo: o corte é inclusivo, e "tudo" devolve o histórico inteiro', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  const lista = [
    obito({ obito_id: 1, data_obito: '2026-06-12' }),
    obito({ obito_id: 2, data_obito: '2026-06-11' }),
    obito({ obito_id: 3, data_obito: '2020-01-01' }),
  ];

  assert.deepEqual(
    filtrarPorPeriodo(lista, '90d', hoje).map((o) => o.obito_id),
    [1],
    'o dia do corte entra; a véspera não',
  );
  assert.equal(filtrarPorPeriodo(lista, 'tudo', hoje).length, 3);
});

// ─────────────────────────────────────────────────────────────────────────────
// Faixa etária
// ─────────────────────────────────────────────────────────────────────────────

test('faixasEtarias: as faixas SEMPRE somam o total — nenhum óbito some pelo caminho', () => {
  const lista = [
    obito({ obito_id: 1, idade_dias: 0 }),
    obito({ obito_id: 2, idade_dias: 100 }),
    obito({ obito_id: 3, idade_dias: 3041 }),
    obito({ obito_id: 4, idade_dias: null, data_de_nascimento: null }),
    obito({ obito_id: 5, idade_dias: -12 }),
  ];

  const faixas = faixasEtarias(lista);
  const somadas = faixas.reduce((acc, f) => acc + f.obitos, 0);
  assert.equal(somadas, lista.length);
});

test('faixasEtarias: as bordas são as do protocolo — 30/31, 180/181, 365/366', () => {
  const faixas = faixasEtarias([
    obito({ obito_id: 1, idade_dias: 30 }),
    obito({ obito_id: 2, idade_dias: 31 }),
    obito({ obito_id: 3, idade_dias: 180 }),
    obito({ obito_id: 4, idade_dias: 181 }),
    obito({ obito_id: 5, idade_dias: 365 }),
    obito({ obito_id: 6, idade_dias: 366 }),
  ]);

  const porChave = new Map(faixas.map((f) => [f.chave, f.obitos]));
  assert.equal(porChave.get('neonatal'), 1);
  assert.equal(porChave.get('desmame'), 2);
  assert.equal(porChave.get('recria'), 2);
  assert.equal(porChave.get('adulto'), 1);
});

test('faixasEtarias: natimorto (0 dias) é neonatal, não "sem idade"', () => {
  const faixas = faixasEtarias([obito({ obito_id: 1, idade_dias: 0 })]);
  assert.equal(faixas.find((f) => f.chave === 'neonatal')?.obitos, 1);
});

test('faixasEtarias: sem data de nascimento vira faixa própria em vez de virar adulto', () => {
  const faixas = faixasEtarias([obito({ obito_id: 1, idade_dias: null, data_de_nascimento: null })]);
  assert.equal(faixas.find((f) => f.chave === 'sem_data')?.obitos, 1);
  assert.equal(faixas.find((f) => f.chave === 'adulto')?.obitos, 0);
});

test('faixasEtarias: idade negativa (nascimento lançado depois da morte) é sinalizada, não escondida', () => {
  const faixas = faixasEtarias([obito({ obito_id: 1, idade_dias: -5 })]);
  assert.equal(faixas.find((f) => f.chave === 'inconsistente')?.obitos, 1);
  assert.equal(faixas.find((f) => f.chave === 'neonatal')?.obitos, 0, 'negativo não pode virar neonato');
});

test('faixasEtarias: período sem óbito devolve fração null, e não 0% nem divisão por zero', () => {
  const faixas = faixasEtarias([]);
  assert.ok(faixas.every((f) => f.obitos === 0 && f.fracao === null));
});

// ─────────────────────────────────────────────────────────────────────────────
// Causas — o denominador é o ponto
// ─────────────────────────────────────────────────────────────────────────────

test('rankingCausas: a fração é sobre os óbitos COM suspeita, nunca sobre o total', () => {
  const causas = rankingCausas([
    obito({ obito_id: 1, suspeitas: ['Pneumonia'] }),
    obito({ obito_id: 2, suspeitas: [] }),
    obito({ obito_id: 3, suspeitas: [] }),
    obito({ obito_id: 4, suspeitas: [] }),
  ]);

  assert.equal(causas[0].fracao, 1, 'é 100% do que foi anotado — e não 25% do total');
});

test('rankingCausas: um óbito com duas suspeitas conta nas duas', () => {
  const causas = rankingCausas([obito({ obito_id: 1, suspeitas: ['Pneumonia', 'CAEV'] })]);
  assert.equal(causas.length, 2);
  assert.ok(causas.every((c) => c.obitos === 1));
});

test('rankingCausas: a mesma suspeita repetida no array de UM óbito não conta duas vezes', () => {
  const causas = rankingCausas([obito({ obito_id: 1, suspeitas: ['Pneumonia', 'Pneumonia'] })]);
  assert.equal(causas.length, 1);
  assert.equal(causas[0].obitos, 1);
});

test('rankingCausas: ordena por frequência e desempata pelo nome — ordem total', () => {
  const causas = rankingCausas([
    obito({ obito_id: 1, suspeitas: ['Zebra'] }),
    obito({ obito_id: 2, suspeitas: ['Abelha'] }),
    obito({ obito_id: 3, suspeitas: ['Pneumonia'] }),
    obito({ obito_id: 4, suspeitas: ['Pneumonia'] }),
  ]);

  assert.deepEqual(
    causas.map((c) => c.suspeita),
    ['Pneumonia', 'Abelha', 'Zebra'],
  );
});

test('rankingCausas: ninguém anotou nada devolve lista vazia, e não uma barra de "sem suspeita"', () => {
  assert.deepEqual(rankingCausas([obito({ obito_id: 1, suspeitas: [] })]), []);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e série
// ─────────────────────────────────────────────────────────────────────────────

test('resumoObitos: conta sexo pelo valor real da coluna — "fêmea" com acento', () => {
  const resumo = resumoObitos([
    obito({ obito_id: 1, sexo: 'fêmea' }),
    obito({ obito_id: 2, sexo: 'macho' }),
    obito({ obito_id: 3, sexo: null }),
  ]);

  assert.equal(resumo.femeas, 1);
  assert.equal(resumo.machos, 1);
  assert.equal(resumo.semSexo, 1);
});

test('resumoObitos: a idade média ignora sem-data e idade negativa, e diz sobre quantos foi calculada', () => {
  const resumo = resumoObitos([
    obito({ obito_id: 1, idade_dias: 100 }),
    obito({ obito_id: 2, idade_dias: 200 }),
    obito({ obito_id: 3, idade_dias: null }),
    obito({ obito_id: 4, idade_dias: -30 }),
  ]);

  assert.equal(resumo.idadeMediaDias, 150);
  assert.equal(resumo.comIdade, 2);
  assert.equal(resumo.total, 4);
});

test('resumoObitos: sem nenhuma idade utilizável a média é null, e não 0', () => {
  const resumo = resumoObitos([obito({ obito_id: 1, idade_dias: null })]);
  assert.equal(resumo.idadeMediaDias, null);
});

test('resumoObitos: neonatais são os de até 30 dias, e a idade negativa não entra', () => {
  const resumo = resumoObitos([
    obito({ obito_id: 1, idade_dias: 30 }),
    obito({ obito_id: 2, idade_dias: 31 }),
    obito({ obito_id: 3, idade_dias: -1 }),
  ]);

  assert.equal(resumo.neonatais, 1);
});

test('serieMensalObitos: agrupa por mês, em ordem, e o mês sem óbito fica ausente (quem zera é o gráfico)', () => {
  const serie = serieMensalObitos([
    obito({ obito_id: 1, data_obito: '2026-03-02' }),
    obito({ obito_id: 2, data_obito: '2026-03-28' }),
    obito({ obito_id: 3, data_obito: '2026-01-15' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-03', valor: 2 },
  ]);
});
