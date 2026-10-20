import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avaliarPreco, parsearProduto, precoDeCompra, registrarPreco } from './precos.mjs';

/* Trechos copiados da página real do item (20/10/2026), com a variante já selecionada. */
const GREEN = `347 vendido(s)
R$332,99 
R$323,54 cada, ≥ 3 peças
100 pça.,R$3,33/pça. ; Compra internacional, R$112,64+ em impostos estimados. 
R$30,52 x 12 meses
R$5,43 de desconto acima de R$5,49
cor: green 2.12x12mm
Resumo do item com IA`;

const PADRAO = `347 vendido(s)
R$72,09 
R$64,30 cada, ≥ 3 peças
Compra internacional, R$14,77+ em impostos estimados. 
cor: PT160 reader`;

test('preço da variante green 2.12x12mm: unitário, faixa de lote e impostos', () => {
  assert.deepEqual(parsearProduto(GREEN), { preco: 332.99, precoLote: 323.54, minLote: 3, impostos: 112.64, variante: 'green 2.12x12mm' });
  assert.equal(precoDeCompra(parsearProduto(GREEN)), 323.54);
});

test('a variante padrão da página é outra (leitor): a leitura mostra isso e o coletor recusa', () => {
  const p = parsearProduto(PADRAO);
  assert.equal(p.variante, 'PT160 reader');
  assert.equal(p.preco, 72.09);
});

test('sem faixa de lote, vale o preço unitário', () => {
  const p = parsearProduto('10 vendido(s)\nR$ 79,19\ncor: PT180 Bluetooth Ver.');
  assert.equal(p.precoLote, null);
  assert.equal(precoDeCompra(p), 79.19);
});

const e = (dia, precoLote, dolar = 5) => ({ em: `2026-10-${String(dia).padStart(2, '0')}T08:00:00Z`, grupo: 'microchip', preco: precoLote + 10, precoLote, minLote: 3, dolar });

test('uma leitura por dia: a mais nova substitui', () => {
  const h = registrarPreco([e(19, 330)], { ...e(19, 325), em: '2026-10-19T20:00:00Z' });
  assert.equal(h.length, 1);
  assert.equal(h[0].precoLote, 325);
});

test('queda de 3% em dólar vira aviso', () => {
  const a = avaliarPreco([e(18, 330), e(19, 330), e(20, 315)]);
  assert.match(a[0], /caiu 4,5% em dólar/);
});

test('só o câmbio mexeu: sem aviso de queda', () => {
  // Preço em R$ cai 4%, mas o dólar caiu os mesmos 4%: em dólar ficou igual.
  const a = avaliarPreco([e(19, 330, 5), e(20, 316.8, 4.8)]);
  assert.deepEqual(a, []);
});

test('menor preço em dólar dos últimos 30 dias', () => {
  const a = avaliarPreco([e(10, 340), e(12, 338), e(15, 336), e(20, 333)]);
  assert.ok(a.some((t) => /menor preço em dólar dos últimos 30 dias/.test(t)));
});

test('abaixo do que o Felipe pagou por último', () => {
  const a = avaliarPreco([e(20, 310)], 313.76);
  assert.match(a[0], /abaixo do que você pagou por último \(R\$ 313,76\)/);
  assert.deepEqual(avaliarPreco([e(20, 320)], 313.76), []);
});

test('sem histórico', () => {
  assert.deepEqual(avaliarPreco([]), []);
});

/* Tela final da compra (print de 20/10/2026), sem endereço. */
const CHECKOUT = `Endereços de Entrega
Métodos de Pagamento
Enviado pelo AliExpress
R$332,99
Envio:Frete grátis
Resumo
Subtotal
R$332,99
Cupom de desconto
Digite o código aqui
Frete
grátis
Imposto de importação
R$36,88
ICMS
R$75,76
Total
R$445,63
Fazer o pedido`;

test('checkout: subtotal, frete, imposto de importação, ICMS e total', async () => {
  const { parsearCheckout } = await import('./precos.mjs');
  assert.deepEqual(parsearCheckout(CHECKOUT), { subtotal: 332.99, frete: 0, imposto: 36.88, icms: 75.76, total: 445.63 });
});

test('checkout: rótulo e valor na mesma linha', async () => {
  const { parsearCheckout } = await import('./precos.mjs');
  const r = parsearCheckout('Resumo\nSubtotal R$332,99\nFrete grátis\nImposto de importação R$36,88\nICMS R$75,76\nTotal R$445,63');
  assert.equal(r.total, 445.63);
  assert.equal(r.frete, 0);
});

test('preço de compra: 1 unidade com tudo incluído, não o da página', () => {
  assert.equal(precoDeCompra({ preco: 332.99, precoLote: 323.54, checkout: { total: 445.63, qtd: 1 } }), 445.63);
  assert.equal(precoDeCompra({ preco: 332.99, precoLote: 323.54 }), 323.54);
});

const c = (dia, total, dolar = 5) => ({ em: `2026-10-${String(dia).padStart(2, '0')}T08:00:00Z`, grupo: 'microchip', preco: 332, dolar, checkout: { total, qtd: 1 } });

test('médias: abaixo da média de 30 dias é bom preço; acima é caro; poucos dias é histórico começando', async () => {
  const { medias } = await import('./precos.mjs');
  assert.equal(medias([c(20, 445)]).veredito, 'sem_historico');
  assert.equal(medias([c(10, 460), c(15, 458), c(20, 430)]).veredito, 'bom');
  assert.equal(medias([c(10, 440), c(15, 442), c(20, 470)]).veredito, 'caro');
  assert.equal(medias([c(10, 440), c(15, 442), c(20, 441)]).veredito, 'na_media');
  const m = medias([c(10, 440), c(15, 460), c(20, 450)]);
  assert.equal(Math.round(m.media30), 450);
});

test('a leitura sem checkout (preço de página) não se mistura com as que têm', async () => {
  const { medias } = await import('./precos.mjs');
  const pagina = { em: '2026-10-05T08:00:00Z', grupo: 'microchip', preco: 332.99, precoLote: 323.54, dolar: 5 };
  const m = medias([pagina, c(15, 445), c(20, 440)]);
  assert.equal(m.n, 2);
  assert.equal(Math.round(m.media30), 445);
});
