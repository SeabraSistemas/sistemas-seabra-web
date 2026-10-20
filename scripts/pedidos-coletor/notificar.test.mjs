import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarMensagem, temNovidade } from './notificar.mjs';

const pedido = (o = {}) => ({
  id: '1',
  itens: [{ titulo: 'Readell 100 peças etiqueta de vidro com implantador iso11784/785 microchip de animal de estimação', qtd: 1 }],
  alertas: [],
  pagamento: 'ok',
  aduana: 'concluida',
  entrega: 'a_caminho',
  previsao: { de: '2026-10-26', ate: '2026-11-07' },
  ...o,
});
const relogio = pedido({ id: '3', itens: [{ titulo: 'Relógio inteligente para mulheres e homens', qtd: 1 }], previsao: { de: '2026-10-23', ate: '2026-11-03' } });
const AGORA = new Date(2026, 9, 20);

test('formato curto: data, a caminho com unidades e previsão, preço de 1 unidade com impostos e dólar embaixo', () => {
  const precos = { microchip: { grupo: 'microchip', variante: 'green 2.12x12mm', preco: 332.99, checkout: { total: 445.63, qtd: 1 }, dolar: 5.02, alertas: [], medias: { veredito: 'sem_historico' } } };
  const m = montarMensagem({ ok: true, pedidos: [pedido(), relogio], mudancas: [], precos }, [], 5.02, AGORA);
  assert.equal(
    m,
    [
      '📦 Pedidos — 20/10',
      '',
      'A caminho:',
      '• Microchip · 1 un. · chega 26 out–7 nov',
      '• Relógio · 1 un. · chega 23 out–3 nov',
      '',
      '💰 Microchip (1 un., com impostos): R$ 445,63',
      '   histórico começando: a média aparece em alguns dias',
      '',
      '💵 Dólar: R$ 5,02',
    ].join('\n'),
  );
});

test('média: abaixo é bom preço, acima é caro', () => {
  const base = { grupo: 'microchip', checkout: { total: 430, qtd: 1 }, alertas: [] };
  const bom = montarMensagem({ ok: true, pedidos: [], mudancas: [], precos: { microchip: { ...base, medias: { veredito: 'bom', vs30: -0.0431, media30: 449.4 } } } }, [], null, AGORA);
  assert.match(bom, /▼ 4,3% abaixo da média de R\$ 449,40 — bom preço/);
  const caro = montarMensagem({ ok: true, pedidos: [], mudancas: [], precos: { microchip: { ...base, medias: { veredito: 'caro', vs30: 0.05, media30: 409.5 } } } }, [], null, AGORA);
  assert.match(caro, /▲ 5,0% acima da média de R\$ 409,50 — caro/);
});

test('sem passar pelo checkout o aviso diz que o preço está SEM impostos e por quê', () => {
  const precos = { microchip: { grupo: 'microchip', preco: 332.99, checkoutErro: 'a tela final da compra não abriu', alertas: [] } };
  const m = montarMensagem({ ok: true, pedidos: [], mudancas: [], precos }, [], null, AGORA);
  assert.match(m, /Microchip \(1 un\., SEM impostos\): R\$ 332,99 — não consegui chegar ao total: a tela final da compra não abriu/);
});

test('desembaraço concluído novo e problema no topo', () => {
  const p = pedido({ alertas: [{ tipo: 'aduana', texto: 'Objeto retido' }] });
  const novas = [{ pedidoId: '1', texto: 'Readell 100 peças: Desembaraço concluído', grave: false, em: 'x' }];
  const m = montarMensagem({ ok: true, pedidos: [p], mudancas: novas }, novas, null, AGORA);
  assert.match(m, /🚨 Microchip: Objeto retido/);
  assert.match(m, /✅ Desembaraço concluído: Microchip/);
});

test('pagamento pendente é sinalizado', () => {
  const m = montarMensagem({ ok: true, pedidos: [pedido({ pagamento: 'pendente', entrega: 'desconhecido' })], mudancas: [] }, [], null, AGORA);
  assert.match(m, /Microchip · 1 un\. · chega 26 out–7 nov · aguardando pagamento/);
});

test('leitura que falhou avisa e não some', () => {
  const m = montarMensagem({ ok: false, erro: 'sessão expirada', pedidos: [], mudancas: [] }, [], null, AGORA);
  assert.match(m, /leitura da AliExpress falhou: sessão expirada/);
});

test('dia calmo', () => {
  assert.equal(temNovidade({ ok: true, pedidos: [pedido()] }, []), false);
  assert.equal(temNovidade({ ok: true, pedidos: [pedido()] }, [{}]), true);
  assert.equal(temNovidade({ ok: false, pedidos: [] }, []), true);
});
