import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarAvisoDesembaraco, montarAvisoPedidos, montarMensagem, temNovidade } from './notificar.mjs';

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

test('formato curto: cada pedido numa linha só, preço do microchip direto e dólar embaixo', () => {
  const precos = { microchip: { grupo: 'microchip', variante: 'green 2.12x12mm', preco: 332.99, checkout: { total: 445.63, qtd: 1 }, dolar: 5.02, alertas: [], medias: { veredito: 'caro', vs30: 0.105, media30: 403.22 } } };
  const m = montarMensagem({ ok: true, pedidos: [pedido(), relogio], mudancas: [], precos }, [], 5.02, AGORA);
  assert.equal(
    m,
    [
      '📦 Pedidos — 20/10',
      '',
      'A caminho:',
      '• Microchip 1 un. · 26 out–7 nov',
      '• Relógio 1 un. · 23 out–3 nov',
      '',
      '💰 Microchip: R$ 445,63',
      '',
      '💵 Dólar: R$ 5,02',
    ].join('\n'),
  );
  // Nenhuma linha passa de 34 caracteres (o que cabe numa linha do Telegram no celular).
  for (const l of m.split('\n')) assert.ok([...l].length <= 34, `linha longa: ${l}`);
});

test('só sinaliza quando o preço está bom', () => {
  const base = { grupo: 'microchip', checkout: { total: 430, qtd: 1 }, alertas: [] };
  const msg = (medias) => montarMensagem({ ok: true, pedidos: [], mudancas: [], precos: { microchip: { ...base, medias } } }, [], null, AGORA);
  assert.match(msg({ veredito: 'bom', vs30: -0.0431, media30: 449.4 }), /✅ Bom preço · ▼ 4,3% da média/);
  for (const v of [{ veredito: 'caro', vs30: 0.05, media30: 409.5 }, { veredito: 'na_media', vs30: 0, media30: 430 }, { veredito: 'sem_historico' }]) {
    assert.doesNotMatch(msg(v), /Bom preço|caro|média|histórico/i);
  }
});

test('aviso de queda aparece junto do preço', () => {
  const precos = { microchip: { grupo: 'microchip', checkout: { total: 430, qtd: 1 }, alertas: ['abaixo do último pago (R$ 374,62)'], medias: { veredito: 'na_media' } } };
  assert.match(montarMensagem({ ok: true, pedidos: [], mudancas: [], precos }, [], null, AGORA), /💡 abaixo do último pago \(R\$ 374,62\)/);
});

test('sem passar pelo checkout o preço sai marcado como sem impostos', () => {
  const precos = { microchip: { grupo: 'microchip', preco: 332.99, checkoutErro: 'não abriu', alertas: [] } };
  assert.match(montarMensagem({ ok: true, pedidos: [], mudancas: [], precos }, [], null, AGORA), /💰 Microchip: R\$ 332,99 \(sem impostos, checkout falhou\)/);
});

test('problema no topo do resumo; o desembaraço novo NÃO se repete no resumo (tem mensagem própria)', () => {
  const p = pedido({ alertas: [{ tipo: 'aduana', texto: 'Objeto retido' }] });
  const novas = [{ pedidoId: '1', texto: 'Readell 100 peças: Desembaraço concluído', grave: false, em: 'x' }];
  const m = montarMensagem({ ok: true, pedidos: [p], mudancas: novas }, novas, null, AGORA);
  assert.match(m, /🚨 Microchip: Objeto retido/);
  assert.doesNotMatch(m, /DESEMBARAÇO/i);
});

test('aviso de desembaraço: destaque, produto, referência e o preço de hoje', () => {
  const novas = [{ pedidoId: '1', texto: 'Readell 100 peças: Desembaraço concluído', grave: false, em: 'x' }];
  const precos = { microchip: { grupo: 'microchip', checkout: { total: 430, qtd: 1 }, medias: { veredito: 'bom', vs30: -0.0431 }, alertas: [] } };
  const m = montarAvisoDesembaraco({ ok: true, pedidos: [pedido()], precos }, novas);
  assert.equal(
    m,
    ['✅✅✅ DESEMBARAÇO CONCLUÍDO ✅✅✅', '', 'Microchip · 1 un.', 'Ref. 1', '', '💰 Microchip hoje: R$ 430,00', '   ✅ Bom preço · ▼ 4,3% da média'].join('\n'),
  );
  assert.equal(montarAvisoDesembaraco({ ok: true, pedidos: [pedido()] }, []), null, 'sem desembaraço novo, sem aviso');
  assert.equal(montarAvisoDesembaraco({ ok: true, pedidos: [pedido()] }, [{ pedidoId: '1', texto: 'x: Entregue', grave: false, em: 'x' }]), null);
});

test('aviso de desembaraço mostra só o preço do produto liberado', () => {
  const novas = [{ pedidoId: '1', texto: 'Readell: Desembaraço concluído', grave: false, em: 'x' }];
  const precos = { microchip: { grupo: 'microchip', checkout: { total: 445.63, qtd: 1 }, medias: { veredito: 'caro', vs30: 0.105 }, alertas: [] }, leitor: { grupo: 'leitor', checkout: { total: 100, qtd: 1 }, alertas: [] } };
  const m = montarAvisoDesembaraco({ ok: true, pedidos: [pedido()], precos }, novas);
  assert.match(m, /Microchip hoje: R\$ 445,63/);
  assert.match(m, /▲ 10,5% acima da média/);
  assert.doesNotMatch(m, /Leitor/);
});

test('pagamento pendente é sinalizado', () => {
  const m = montarMensagem({ ok: true, pedidos: [pedido({ pagamento: 'pendente', entrega: 'desconhecido' })], mudancas: [] }, [], null, AGORA);
  assert.match(m, /Microchip 1 un\. · 26 out–7 nov · pagar!/);
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

test('aviso de pedido novo: produto, valor, estado do pagamento e referência', () => {
  const p = pedido({ id: '8215', total: 'R$445,63', pagamento: 'pendente', entrega: 'desconhecido' });
  const novas = [{ pedidoId: '8215', texto: 'Readell 100 peças: Novo pedido', grupo: false, em: 'x' }];
  novas[0].texto = 'Novo pedido: Readell 100 peças';
  assert.equal(montarAvisoPedidos({ ok: true, pedidos: [p] }, novas), ['🛒 Novo pedido', 'Microchip · 1 un. · R$ 445,63', 'aguardando pagamento · Ref. 8215'].join('\n'));
});

test('aviso de pagamento aprovado; sem pedido novo nem pagamento, nada', () => {
  const novas = [{ pedidoId: '1', texto: 'Readell: Pagamento aprovado', grave: false, em: 'x' }];
  assert.equal(montarAvisoPedidos({ ok: true, pedidos: [pedido()] }, novas), ['💳 Pagamento aprovado', 'Microchip · 1 un.', 'Ref. 1'].join('\n'));
  assert.equal(montarAvisoPedidos({ ok: true, pedidos: [pedido()] }, [{ pedidoId: '1', texto: 'x: A caminho', grave: false, em: 'x' }]), null);
  assert.equal(montarAvisoPedidos({ ok: true, pedidos: [pedido()] }, []), null);
});

test('aviso de desembaraço informa a hora do evento no rastreio', () => {
  const p = pedido({ eventos: [{ data: '2026-10-23 09:07', texto: 'Desembaraço aduaneiro concluído' }, { data: '2026-10-23 08:40', texto: 'Desembaraço aduaneiro iniciado' }] });
  const novas = [{ pedidoId: '1', texto: 'Readell: Desembaraço concluído', grave: false, em: 'x' }];
  assert.match(montarAvisoDesembaraco({ ok: true, pedidos: [p] }, novas), /Ref\. 1\nLiberado em 23\/10 09:07/);
});

test('pedido separado: só pede decisão quando nenhum pedido pago espera desembaraço (pedido de 29/10)', async () => {
  const { pedidosParaDecidir, montarAvisoPodeComprar, chaveParaDecidir } = await import('./notificar.mjs');
  const chip = (id, extra) => ({ id, itens: [{ titulo: 'Readell 100 peças etiqueta de vidro com implantador', qtd: 1 }], alertas: [], eventos: [], ...extra });
  const separado = chip('9', { pagamento: 'pendente', entrega: 'desconhecido', aduana: 'desconhecido', total: 'R$473,29', prazoPagamento: '2026-11-16T12:00:00Z' });
  const precos = { microchip: { grupo: 'microchip', checkout: { total: 450.1, qtd: 1 } } };
  const agora = new Date('2026-10-29T12:00:00Z');

  // "Processando" (pago, ainda sem envio) segura a decisão.
  const segurando = { pedidos: [separado, chip('1', { pagamento: 'ok', entrega: 'a_caminho', aduana: 'aguardando' })], precos };
  assert.deepEqual(pedidosParaDecidir(segurando), []);
  assert.equal(montarAvisoPodeComprar(segurando, agora), null);
  assert.equal(chaveParaDecidir(segurando), '');

  const livre = { pedidos: [separado, chip('1', { pagamento: 'ok', entrega: 'a_caminho', aduana: 'concluida' }), chip('2', { pagamento: 'ok', entrega: 'entregue', aduana: 'concluida' })], precos };
  const msg = montarAvisoPodeComprar(livre, agora);
  assert.match(msg, /PODE COMPRAR/);
  assert.match(msg, /Cancele e compre de novo/);
  assert.match(msg, /R\$ 23,19 mais barato/);
  assert.match(msg, /Prazo: 18 dias/);
  assert.equal(chaveParaDecidir(livre), '9');

  const caro = { ...livre, precos: { microchip: { grupo: 'microchip', checkout: { total: 490, qtd: 1 } } } };
  assert.match(montarAvisoPodeComprar(caro, agora), /Pague o separado/);
});
