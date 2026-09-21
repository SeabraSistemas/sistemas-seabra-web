import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { recalcularGmdDoLote, type AnimalParaRecalculo } from '@/lib/fi-fcg/gmd';

function animal(id: string, linhaRebanho: number, pesagens: [number, number, number][]): AnimalParaRecalculo {
  // cada pesagem: [linha, data, pesoKg]
  return { id, linhaRebanho, pesagens: pesagens.map(([linha, data, pesoKg]) => ({ linha, data, pesoKg })) };
}

describe('recalcularGmdDoLote', () => {
  test('caso real da planilha: corrige o "61 dias congelado" do AppSheet', () => {
    // Animal 900215007821565: entrada 11/08/2025 peso 189; o AppSheet gravou 61 dias
    // nas duas pesagens seguintes (GMD 0,6 e 1,5). O certo e 112 e 189 dias.
    const animais = [
      animal('v1', 8, [
        [100, 20250729, 199], // antes da entrada: nao entra
        [200, 20250811, 189],
        [300, 20251201, 227],
        [400, 20260216, 281],
      ]),
    ];
    const r = recalcularGmdDoLote(animais, 20250811);
    const [a] = r.animais;

    assert.equal(a.pesoEntradaKg, 189);
    assert.equal(a.pesagens.length, 3); // a de 29/07 ficou de fora

    const [entrada, dez, fev] = a.pesagens;
    assert.equal(entrada.diasEngorda, 0);
    assert.equal(entrada.gmd, null); // nao divide por zero

    assert.equal(dez.diasEngorda, 112);
    assert.equal(Number(dez.gmd?.toFixed(2)), 0.34); // o AppSheet mostrava 0,6

    assert.equal(fev.diasEngorda, 189);
    assert.equal(Number(fev.gmd?.toFixed(2)), 0.49); // o AppSheet mostrava 1,5
  });

  test('pesagens ANTES da data de inicio nunca entram (decisao do Felipe: nao mexer nas antigas)', () => {
    const animais = [animal('v1', 5, [[10, 20250101, 150], [20, 20250601, 200], [30, 20250901, 260]])];
    const r = recalcularGmdDoLote(animais, 20250601);
    assert.deepEqual(r.animais[0].pesagens.map((p) => p.linha), [20, 30]);
    assert.equal(r.totalPesagens, 2);
  });

  test('peso de entrada = PRIMEIRA pesagem >= a data, mesmo se nao houver pesagem no dia exato', () => {
    const animais = [animal('v1', 5, [[10, 20250810, 300], [20, 20250815, 210], [30, 20250915, 240]])];
    const r = recalcularGmdDoLote(animais, 20250812); // nao existe pesagem em 12/08
    const a = r.animais[0];
    assert.equal(a.pesoEntradaKg, 210); // a de 15/08
    assert.equal(a.dataPesoEntrada, 20250815);
    assert.equal(a.entrada, 20250812); // Entrada engorda continua sendo a data escolhida
    assert.equal(a.pesagens[0].diasEngorda, 3); // 12/08 -> 15/08
  });

  test('animal sem nenhuma pesagem a partir da data: fica de fora e e reportado', () => {
    const animais = [
      animal('v1', 5, [[10, 20250101, 150]]),
      animal('v2', 6, [[20, 20260101, 300]]),
    ];
    const r = recalcularGmdDoLote(animais, 20250601);
    assert.deepEqual(r.semPesagemNoPeriodo, ['v1']);
    assert.deepEqual(r.animais.map((a) => a.id), ['v2']);
  });

  test('dias/GMD do RebanhoProd saem da pesagem MAIS RECENTE do animal', () => {
    const animais = [animal('v1', 5, [[10, 20250101, 100], [20, 20250201, 130], [30, 20250301, 159]])];
    const r = recalcularGmdDoLote(animais, 20250101);
    const a = r.animais[0];
    assert.equal(a.diasEngordaAtual, 59); // 01/01 -> 01/03
    assert.equal(a.pesoAtualKg, 159);
    assert.equal(Number(a.gmdAtual?.toFixed(4)), 1); // (159-100)/59
  });

  test('pesagem fora de ordem na planilha e ordenada antes de calcular', () => {
    const animais = [animal('v1', 5, [[30, 20250301, 159], [10, 20250101, 100], [20, 20250201, 130]])];
    const r = recalcularGmdDoLote(animais, 20250101);
    assert.deepEqual(r.animais[0].pesagens.map((p) => p.data), [20250101, 20250201, 20250301]);
    assert.equal(r.animais[0].pesoEntradaKg, 100); // e nao 159
  });

  test('animal que perdeu peso: GMD negativo, nao e zerado', () => {
    const animais = [animal('v1', 5, [[10, 20250101, 200], [20, 20250131, 185]])];
    const r = recalcularGmdDoLote(animais, 20250101);
    assert.equal(Number(r.animais[0].gmdAtual?.toFixed(1)), -0.5); // (185-200)/30
  });

  test('lote inteiro: totalPesagens soma todos os animais', () => {
    const animais = [
      animal('v1', 5, [[10, 20250101, 100], [11, 20250201, 130]]),
      animal('v2', 6, [[20, 20250101, 110], [21, 20250201, 140], [22, 20250301, 170]]),
    ];
    const r = recalcularGmdDoLote(animais, 20250101);
    assert.equal(r.animais.length, 2);
    assert.equal(r.totalPesagens, 5);
  });
});
