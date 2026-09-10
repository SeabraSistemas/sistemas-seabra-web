/**
 * PRODUÇÃO DIÁRIA — as regras da tela do dia a dia do tanque.
 *
 * Duas delas são a razão de o arquivo existir:
 *
 *   · DIA SEM LANÇAMENTO NÃO É DIA DE ZERO LITRO. Toda média aqui divide pelos
 *     dias LANÇADOS. Dividir pelos dias do calendário faria uma fazenda de 300
 *     L/dia mal lançada parecer uma de 100 L/dia — e é o tipo de erro que
 *     ninguém percebe, porque o número continua plausível.
 *   · DATA NO FUTURO É LIXO. 1.500 linhas de uma propriedade estão em 2035-2039;
 *     se entrarem na conta, a série vai até 2039 e a média vira ficção.
 *
 * Tudo entrada → saída, com `hoje` injetado.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERIODO_PADRAO,
  diasSemLancamento,
  inicioDoPeriodo,
  lerPeriodo,
  resumoMensal,
  resumoProducao,
  separarFuturos,
  serieLitros,
  serieLitrosPorLactante,
} from '@/lib/adm/areas/producao-diaria';
import type { LinhaProducaoDia } from '@/lib/adm/areas/contrato';

function dia(parcial: Partial<LinhaProducaoDia> & { data: string }): LinhaProducaoDia {
  const litros = parcial.litros ?? 100;
  const lactantes = parcial.lactantes ?? 50;
  return {
    propriedade_id: 1,
    litros,
    litros_1_ordenha: parcial.litros_1_ordenha ?? litros * 0.6,
    litros_2_ordenha: parcial.litros_2_ordenha ?? litros * 0.4,
    lactantes,
    litros_por_lactante: lactantes > 0 ? litros / lactantes : null,
    modo: 'duas_ordenhas',
    observacao: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

test('lerPeriodo: só passa o que está na lista; o resto cai no padrão', () => {
  assert.equal(lerPeriodo('30d'), '30d');
  assert.equal(lerPeriodo('tudo'), 'tudo');
  assert.equal(lerPeriodo('ontem'), PERIODO_PADRAO);
  assert.equal(lerPeriodo(undefined), PERIODO_PADRAO);
});

test('inicioDoPeriodo: a janela INCLUI hoje — 30 dias são hoje e os 29 anteriores', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  assert.equal(inicioDoPeriodo('30d', hoje), '2026-08-12');
  assert.equal(inicioDoPeriodo('tudo', hoje), null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Datas no futuro
// ─────────────────────────────────────────────────────────────────────────────

test('separarFuturos: tira o que está datado adiante e devolve os dois lados', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  const { validos, futuros } = separarFuturos(
    [dia({ data: '2026-09-10' }), dia({ data: '2026-09-11' }), dia({ data: '2039-02-09' })],
    hoje,
  );

  assert.deepEqual(
    validos.map((d) => d.data),
    ['2026-09-10'],
    'hoje entra; amanhã não',
  );
  assert.equal(futuros.length, 2);
});

test('separarFuturos: linha sem data não vai para nenhum dos dois lados', () => {
  const { validos, futuros } = separarFuturos([dia({ data: '' })], new Date('2026-09-10T00:00:00Z'));
  assert.equal(validos.length, 0);
  assert.equal(futuros.length, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Dias sem lançamento
// ─────────────────────────────────────────────────────────────────────────────

test('diasSemLancamento: acha o buraco no meio da série', () => {
  const faltantes = diasSemLancamento(
    [dia({ data: '2026-09-01' }), dia({ data: '2026-09-04' })],
    '2026-09-01',
    '2026-09-04',
  );

  assert.deepEqual(faltantes, ['2026-09-02', '2026-09-03']);
});

test('diasSemLancamento: a janela começa no PRIMEIRO lançamento — cliente novo não é relapso', () => {
  const faltantes = diasSemLancamento([dia({ data: '2026-09-09' })], '2026-06-12', '2026-09-10');

  assert.deepEqual(
    faltantes,
    ['2026-09-10'],
    'os três meses antes do primeiro lançamento não contam como falta',
  );
});

test('diasSemLancamento: sem lançamento nenhum não inventa uma lista de faltas', () => {
  assert.deepEqual(diasSemLancamento([], '2026-09-01', '2026-09-30'), []);
});

test('diasSemLancamento: série completa devolve lista vazia', () => {
  const faltantes = diasSemLancamento(
    [dia({ data: '2026-09-01' }), dia({ data: '2026-09-02' }), dia({ data: '2026-09-03' })],
    '2026-09-01',
    '2026-09-03',
  );
  assert.deepEqual(faltantes, []);
});

test('diasSemLancamento: domingo conta como qualquer outro dia — cabra é ordenhada no domingo', () => {
  // 2026-09-06 é um domingo.
  const faltantes = diasSemLancamento(
    [dia({ data: '2026-09-05' }), dia({ data: '2026-09-07' })],
    '2026-09-05',
    '2026-09-07',
  );
  assert.deepEqual(faltantes, ['2026-09-06']);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoProducao: a média divide pelos dias LANÇADOS, não pelos dias do calendário', () => {
  const resumo = resumoProducao([dia({ data: '2026-09-01', litros: 300 }), dia({ data: '2026-09-30', litros: 300 })]);

  assert.equal(resumo.diasLancados, 2);
  assert.equal(resumo.litrosTotal, 600);
  assert.equal(resumo.mediaPorDiaLancado, 300, 'e não 20 L/dia, que seria dividir pelo mês');
});

test('resumoProducao: melhor e pior dia vêm com a data junto', () => {
  const resumo = resumoProducao([
    dia({ data: '2026-09-01', litros: 100 }),
    dia({ data: '2026-09-02', litros: 250 }),
    dia({ data: '2026-09-03', litros: 80 }),
  ]);

  assert.equal(resumo.melhorDia?.data, '2026-09-02');
  assert.equal(resumo.piorDia?.data, '2026-09-03');
});

test('resumoProducao: dia sem lactante não entra na média por lactante nem zera o denominador', () => {
  const resumo = resumoProducao([
    dia({ data: '2026-09-01', litros: 100, lactantes: 50, litros_por_lactante: 2 }),
    dia({ data: '2026-09-02', litros: 0, lactantes: 0, litros_por_lactante: null }),
  ]);

  assert.equal(resumo.mediaPorLactante, 2);
  assert.equal(resumo.lactantesMedio, 50);
});

test('resumoProducao: a fração da 2ª ordenha e a contagem de dias só com a 1ª', () => {
  const resumo = resumoProducao([
    dia({ data: '2026-09-01', litros: 100, litros_1_ordenha: 60, litros_2_ordenha: 40 }),
    dia({ data: '2026-09-02', litros: 100, litros_1_ordenha: 100, litros_2_ordenha: 0 }),
  ]);

  assert.equal(resumo.litros1Ordenha, 160);
  assert.equal(resumo.litros2Ordenha, 40);
  assert.equal(resumo.fracaoSegundaOrdenha, 40 / 200);
  assert.equal(resumo.diasSoPrimeira, 1, 'olha o DADO, não o `modo` declarado no app');
});

test('resumoProducao: fazenda que nunca lançou a 2ª ordenha devolve fração null, e não 0%', () => {
  const resumo = resumoProducao([
    dia({ data: '2026-09-01', litros: 100, litros_1_ordenha: 100, litros_2_ordenha: null }),
  ]);

  assert.equal(resumo.fracaoSegundaOrdenha, null);
});

test('resumoProducao: período vazio não vira NaN nem zero mentiroso', () => {
  const resumo = resumoProducao([]);
  assert.equal(resumo.diasLancados, 0);
  assert.equal(resumo.mediaPorDiaLancado, null);
  assert.equal(resumo.melhorDia, null);
  assert.equal(resumo.mediaPorLactante, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Séries e mês a mês
// ─────────────────────────────────────────────────────────────────────────────

test('serieLitros: ordem cronológica, sem preencher buraco (quem decide é a tela)', () => {
  const serie = serieLitros([
    dia({ data: '2026-09-03', litros: 30 }),
    dia({ data: '2026-09-01', litros: 10 }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-09-01', valor: 10 },
    { periodo: '2026-09-03', valor: 30 },
  ]);
});

test('serieLitrosPorLactante: dia sem lactante fica FORA em vez de virar ponto zero', () => {
  const serie = serieLitrosPorLactante([
    dia({ data: '2026-09-01', litros_por_lactante: 2 }),
    dia({ data: '2026-09-02', litros_por_lactante: null }),
  ]);

  assert.deepEqual(serie, [{ periodo: '2026-09-01', valor: 2 }]);
});

test('resumoMensal: agrupa por mês, do mais recente para o mais antigo, com os dias lançados junto', () => {
  const meses = resumoMensal([
    dia({ data: '2026-08-01', litros: 100 }),
    dia({ data: '2026-09-01', litros: 200 }),
    dia({ data: '2026-09-02', litros: 100 }),
  ]);

  assert.deepEqual(
    meses.map((m) => m.mes),
    ['2026-09', '2026-08'],
  );
  assert.equal(meses[0].diasLancados, 2);
  assert.equal(meses[0].litrosTotal, 300);
  assert.equal(meses[0].mediaPorDiaLancado, 150);
});

test('resumoMensal: mês sem nenhum lactante lançado tem média por lactante null', () => {
  const meses = resumoMensal([dia({ data: '2026-09-01', lactantes: 0, litros_por_lactante: null })]);
  assert.equal(meses[0].mediaPorLactante, null);
});
