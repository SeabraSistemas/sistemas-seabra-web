import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grupoDoProduto, pecasPorUnidade, resumirPorGrupo, totalEmReais, type LinhaPedido, type Venda } from '@/lib/pedidos/tipos';

const linha = (id: string, recebido: boolean, qtd = 1, grupo: LinhaPedido['grupo'] = 'microchip'): LinhaPedido => ({
  id,
  ali: null,
  manual: null,
  grupo,
  titulo: id,
  qtd,
  recebido,
  cancelado: false,
  conta: true,
});

const venda = (id: string, qtd: number, data: string): Venda => ({ id, grupo: 'microchip', qtd, data });

test('sem ponto de partida: soma toda a história', () => {
  const r = resumirPorGrupo([linha('a', true, 8), linha('b', true, 12), linha('c', false, 2)], [venda('v1', 5, '2026-10-01T00:00:00Z')]);
  assert.deepEqual([r.microchip.recebido, r.microchip.aCaminho, r.microchip.vendido, r.microchip.emEstoque], [20, 2, 5, 15]);
});

test('com "tenho 3 agora": o histórico sai, o que chegar depois soma e a venda depois subtrai', () => {
  const base = { microchip: { qtd: 3, excluidos: ['a', 'b'], em: '2026-10-20T12:00:00Z' } };
  const antes = resumirPorGrupo([linha('a', true, 8), linha('b', true, 12), linha('c', false, 2)], [venda('v1', 5, '2026-10-01T00:00:00Z')], base);
  assert.equal(antes.microchip.emEstoque, 3);
  assert.equal(antes.microchip.aCaminho, 2);
  const depois = resumirPorGrupo([linha('a', true, 8), linha('b', true, 12), linha('c', true, 2)], [venda('v1', 5, '2026-10-01T00:00:00Z'), venda('v2', 1, '2026-10-25T00:00:00Z')], base);
  assert.equal(depois.microchip.emEstoque, 3 + 2 - 1);
});

test('grupo do produto e peças por pacote', () => {
  assert.equal(grupoDoProduto('Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B microchip de animal de estimação'), 'microchip');
  assert.equal(grupoDoProduto('5YOA Leitor RFID de animais portátil 134,2 Khz Pet Cat Dog Micro Chip Scanner FDX-B'), 'leitor');
  assert.equal(grupoDoProduto('Relógio inteligente para mulheres e homens'), 'outro');
  assert.equal(pecasPorUnidade('Readell 100 peças etiqueta de vidro'), 100);
  assert.equal(pecasPorUnidade('5YOA Leitor RFID'), 1);
});

test('total do pedido em reais', () => {
  assert.equal(totalEmReais('R$4.636,37'), 4636.37);
  assert.equal(totalEmReais('R$374,62'), 374.62);
  assert.equal(totalEmReais(null), null);
});
