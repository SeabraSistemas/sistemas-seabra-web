import test from 'node:test';
import assert from 'node:assert/strict';
import { brl, dataBR, lerNumero, somarDias, totais, tituloArquivo, type Item } from '@/lib/orcamentos/valores';

test('lerNumero aceita formato brasileiro, ponto decimal e milhar', () => {
  assert.equal(lerNumero('1.530,00'), 1530);
  assert.equal(lerNumero('8,6'), 8.6);
  assert.equal(lerNumero('8.6'), 8.6);
  assert.equal(lerNumero('1.530'), 1530);
  assert.equal(lerNumero('R$ 280,00'), 280);
  assert.equal(lerNumero('8,'), 8);
  assert.equal(lerNumero(''), 0);
  assert.equal(lerNumero('abc'), 0);
});

const item = (qtd: string, valor: string): Item => ({ id: qtd + valor, nome: '', detalhe: '', qtd, valor });

test('totais do orçamento da UFF batem com a planilha', () => {
  const t = totais([item('200', '8,60'), item('4', '280,00'), item('5', '1.530,00')], '');
  assert.equal(t.subtotal, 10490);
  assert.equal(t.total, 10490);
  assert.equal(brl(t.total), 'R$ 10.490,00');
});

test('desconto nunca passa do subtotal', () => {
  assert.deepEqual(totais([item('1', '100')], '30'), { subtotal: 100, desconto: 30, total: 70 });
  assert.equal(totais([item('1', '100')], '500').total, 0);
});

test('datas', () => {
  assert.equal(dataBR('2026-09-29'), '29/09/2026');
  assert.equal(somarDias('2026-09-29', 15), '2026-10-14');
  assert.equal(somarDias('2026-12-25', 10), '2027-01-04');
});

test('título do arquivo sem caracteres proibidos', () => {
  assert.equal(tituloArquivo('2026/001', 'UFF'), 'Orçamento Seabra - 2026-001 - UFF');
  assert.equal(tituloArquivo('2026-001', ''), 'Orçamento Seabra - 2026-001');
});
