import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { custosMensais, custosNoPeriodo, distribuirCusto } from '@/lib/fi-fcg/custos';
import type { Custo } from '@/lib/fi-fcg/types';

function custo(p: Partial<Custo> & { id: string }): Custo {
  return { descricao: null, categoria: null, fazenda: null, tipo: null, valor: null, dataInicio: null, dataFim: null, observacao: null, ...p };
}

describe('distribuirCusto', () => {
  test('Mensal: valor CHEIO em cada mes do intervalo', () => {
    const c = custo({ id: 'c1', tipo: 'Mensal', valor: 15000, dataInicio: 20250101, dataFim: 20250301 });
    assert.deepEqual(distribuirCusto(c, 20260101), [
      { mes: '202501', valor: 15000 },
      { mes: '202502', valor: 15000 },
      { mes: '202503', valor: 15000 },
    ]);
  });

  test('Anual: valor / 12 em cada mes do intervalo', () => {
    const c = custo({ id: 'c1', tipo: 'Anual', valor: 60000, dataInicio: 20250101, dataFim: 20250301 });
    const pontos = distribuirCusto(c, 20260101);
    assert.equal(pontos.length, 3);
    assert.equal(pontos[0].valor, 5000);
  });

  test('sem dataFim (em aberto): distribui ate o mes de "hoje", nunca alem', () => {
    const c = custo({ id: 'c1', tipo: 'Mensal', valor: 1000, dataInicio: 20250101, dataFim: null });
    const pontos = distribuirCusto(c, 20250315);
    assert.deepEqual(pontos.map((p) => p.mes), ['202501', '202502', '202503']);
  });

  test('atravessa virada de ano', () => {
    const c = custo({ id: 'c1', tipo: 'Mensal', valor: 1000, dataInicio: 20241115, dataFim: 20250215 });
    assert.deepEqual(distribuirCusto(c, 20260101).map((p) => p.mes), ['202411', '202412', '202501', '202502']);
  });

  test('custo comecando no futuro (depois de "hoje" e sem dataFim) nao gera nenhum mes', () => {
    const c = custo({ id: 'c1', tipo: 'Mensal', valor: 1000, dataInicio: 20260601, dataFim: null });
    assert.deepEqual(distribuirCusto(c, 20260101), []);
  });

  test('sem valor, tipo ou dataInicio, lista vazia', () => {
    assert.deepEqual(distribuirCusto(custo({ id: 'c1', tipo: 'Mensal', dataInicio: 20250101 }), 20260101), []);
    assert.deepEqual(distribuirCusto(custo({ id: 'c1', valor: 1000, dataInicio: 20250101 }), 20260101), []);
    assert.deepEqual(distribuirCusto(custo({ id: 'c1', valor: 1000, tipo: 'Mensal' }), 20260101), []);
  });
});

describe('custosMensais', () => {
  test('soma varios custos no mesmo mes', () => {
    const custos = [
      custo({ id: 'c1', tipo: 'Mensal', valor: 15000, dataInicio: 20250101, dataFim: 20250201 }),
      custo({ id: 'c2', tipo: 'Mensal', valor: 5000, dataInicio: 20250101, dataFim: 20250101 }),
    ];
    const pontos = custosMensais(custos, 20260101);
    assert.deepEqual(new Map(pontos.map((p) => [p.mes, p.valor])), new Map([['202501', 20000], ['202502', 15000]]));
  });
});

describe('custosNoPeriodo', () => {
  const custos = [custo({ id: 'c1', tipo: 'Mensal', valor: 1000, dataInicio: 20250101, dataFim: 20251231 })];

  test('sem filtro de periodo, soma o ano inteiro', () => {
    assert.equal(custosNoPeriodo(custos, 20260101, null, null), 12000);
  });
  test('filtro de periodo corta pro mes certo, mes inteiro', () => {
    assert.equal(custosNoPeriodo(custos, 20260101, 20250301, 20250531), 3000); // mar/abr/mai
  });
  test('periodo fora do intervalo do custo, zero', () => {
    assert.equal(custosNoPeriodo(custos, 20260101, 20260101, 20261231), 0);
  });
});
