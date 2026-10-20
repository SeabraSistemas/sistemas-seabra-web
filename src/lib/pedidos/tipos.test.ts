import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanco, grupoDoProduto, pecasPorUnidade, resumirPorGrupo, totalEmReais, type LinhaPedido, type Venda } from '@/lib/pedidos/tipos';

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

const compra = (id: string, grupo: LinhaPedido['grupo'], titulo: string, qtd: number, total: string): LinhaPedido => ({
  id,
  ali: { id, total } as LinhaPedido['ali'],
  manual: null,
  grupo,
  titulo,
  qtd,
  recebido: true,
  cancelado: false,
  conta: true,
});

test('balanço do microchip: tudo que saiu do estoque foi vendido a R$ 8,60 o chip; custo com imposto', () => {
  const linhas = [compra('a', 'microchip', 'Readell 100 peças etiqueta de vidro', 8, 'R$4.636,37'), compra('b', 'microchip', 'Readell 100 peças etiqueta de vidro', 1, 'R$400,00')];
  const b = balanco('microchip', linhas, [], 0);
  assert.equal(b.compradas, 900);
  assert.equal(b.vendidas, 900);
  assert.equal(Math.round(b.faturamento), 7740);
  assert.equal(Math.round(b.custoCompras * 100) / 100, 5036.37);
  assert.equal(Math.round(b.lucro * 100) / 100, 2703.63);
  assert.equal(b.custoEstoque, 0);
});

test('balanço do leitor: o que sobrou em estoque não entra no custo vendido', () => {
  const linhas = [compra('c', 'leitor', 'Leitor RFID', 4, 'R$600,00')];
  const b = balanco('leitor', linhas, [], 1);
  assert.equal(b.vendidas, 3);
  assert.equal(b.faturamento, 840);
  assert.equal(b.custoVendido, 450);
  assert.equal(b.custoEstoque, 150);
  assert.equal(b.lucro, 390);
  assert.ok(Math.abs((b.margem ?? 0) - 390 / 840) < 1e-9);
});

test('balanço: venda registrada usa o preço informado e não conta em dobro com o histórico', () => {
  const linhas = [compra('d', 'microchip', 'Readell 100 peças etiqueta de vidro', 2, 'R$900,00')];
  const venda: Venda = { id: 'v', grupo: 'microchip', qtd: 1, preco: 10, data: '2026-10-21T00:00:00Z' };
  const b = balanco('microchip', linhas, [venda], 0);
  // 2 pacotes saíram: 1 registrado a R$ 10/chip (1000) + 1 do histórico a R$ 8,60/chip (860)
  assert.equal(Math.round(b.faturamento), 1860);
});

test('balanço: preço de venda editado vale no lugar do padrão; sem compras não há nada', () => {
  const linhas = [compra('e', 'leitor', 'Leitor RFID', 1, 'R$100,00')];
  assert.equal(balanco('leitor', linhas, [], 0, 300).faturamento, 300);
  const vazio = balanco('microchip', [], [], 0);
  assert.deepEqual([vazio.faturamento, vazio.lucro, vazio.margem], [0, 0, null]);
});
