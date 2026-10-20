import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificar } from './classificar.mjs';
import { PROIBIDO, SO_ESTE_BOTAO, reclassificar, dataDoCartao, dataDoEvento, diferencas, numeroBR, parsearCartao, parsearRastreio, previsaoDeEntrega } from './coletor.mjs';

/* Textos copiados da conta real (20/10/2026), sem endereço/telefone e com o código de rastreio mascarado. */

const CARTAO_A_CAMINHO = `Aguardando a entrega
Data: 14 out, 2026
Número de referência: 8214734896720545
Copiar
Detalhes
WSRFID Microchip Store
Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B uso de tartaruga certificado icar chip de cachorro microchip de animal de estimação
green 2.12x12mm
R$334,94   x1
Cupom de R$5 se houver atraso
Devolução gratuita
Total:R$374,62
Confirmar entrega
Ver status`;

const CARTAO_CONCLUIDO_8 = `Concluído
Data: 30 set, 2026
Número de referência: 8215472633540545
Copiar
Detalhes
WSRFID Microchip Store
Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B uso de tartaruga certificado icar chip de cachorro microchip de animal de estimação
green 2.12x12mm
R$313,76   x8
Cupom de R$5 se houver atraso
Devolução gratuita
Total:R$4.636,37
Adicionar ao Carrinho
Deletar`;

const CARTAO_CANCELADO = `Cancelados
Data: 14 set, 2026
Número de referência: 8214228116140545
Copiar
Detalhes
WSRFID Microchip Store
Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B uso de tartaruga certificado icar chip de cachorro microchip de animal de estimação
green 2.12x12mm
R$322,86   x1
Devolução gratuita
·
Entrega rápida
Total:R$420,17
Adicionar ao Carrinho
Deletar`;

const CARTAO_PAGAMENTO = `Esperando pagamento
Data: 14 out, 2026
Número de referência: 8215517904330545
Copiar
Detalhes
WSRFID Microchip Store
Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B uso de tartaruga certificado icar chip de cachorro microchip de animal de estimação
green 2.12x12mm
R$335,96   x1
(Salvo: R$38,35)Total:R$375,88
Confirmar compra
Editar endereço`;

const RASTREIO = `Entrega:Oct. 26 - Nov. 07
AliExpress Selection Standard
Número de rastreamento: NN000000000BR
Copiar
Em trânsito
Seu pacote chegou ao aeroporto
Ter. | Oct. 20 15:50
A caminho do país/região de destino
Chegou ao aeroporto
Enviado
Chegou ao país/região de destino
Desembaraço aduaneiro concluído
Desembaraço aduaneiro concluído
Dom. | Oct. 18 03:49
Desembaraço aduaneiro iniciado
Dom. | Oct. 18 03:37
Em trânsito
Seu pacote chegou ao aeroporto de origem e está aguardando o transporte.
Sex. | Oct. 16 21:25
Processando no centro de triagem do país/região de partida
Qui. | Oct. 15 19:55
Coletado pela transportadora
Recebido pela empresa de logística
Qui. | Oct. 15 07:52
Este pacote foi enviado em apenas 1 dias. Mais rápido do que mais de 99% dos outros pacotes.
Seu pacote está sendo preparado
Qua. | Oct. 14 15:55
Seu pedido foi feito
Qua. | Oct. 14 15:55

80 moedas ≈ R$4,34
Detalhes do pedido`;

const AGORA = new Date(2026, 9, 20, 18, 0);

test('cartão a caminho', () => {
  const c = parsearCartao(CARTAO_A_CAMINHO);
  assert.equal(c.status, 'Aguardando a entrega');
  assert.equal(c.data, '14 out, 2026');
  assert.equal(c.loja, 'WSRFID Microchip Store');
  assert.match(c.titulo, /^Readell 100 peças etiqueta de vidro/);
  assert.equal(c.qtd, 1);
  assert.equal(c.total, 'R$374,62');
});

test('cartão com quantidade 8 e total em milhar', () => {
  const c = parsearCartao(CARTAO_CONCLUIDO_8);
  assert.equal(c.qtd, 8);
  assert.equal(c.total, 'R$4.636,37');
});

test('cartão de pagamento pendente: total com "Salvo" colado', () => {
  assert.equal(parsearCartao(CARTAO_PAGAMENTO).total, 'R$375,88');
});

test('preço unitário e quantidade', () => {
  assert.equal(parsearCartao(CARTAO_A_CAMINHO).preco, 334.94);
  assert.equal(parsearCartao(CARTAO_CONCLUIDO_8).preco, 313.76);
  assert.equal(numeroBR('4.636,37'), 4636.37);
  assert.equal(numeroBR(undefined), null);
});

test('previsão de entrega', () => {
  assert.deepEqual(previsaoDeEntrega('Entrega:Oct. 26 - Nov. 07', AGORA), { de: '2026-10-26', ate: '2026-11-07' });
  assert.deepEqual(previsaoDeEntrega('Entrega: Dec. 20 - Jan. 05', AGORA), { de: '2026-12-20', ate: '2027-01-05' });
  assert.equal(previsaoDeEntrega('Entrega rápida', AGORA), null);
  assert.deepEqual(parsearRastreio(RASTREIO, AGORA).previsao, { de: '2026-10-26', ate: '2026-11-07' });
});

/* A mesma conta quando a AliExpress abre em inglês/EUA (visto na janela do coletor em 20/10/2026). */
const CARTAO_EN = `Awaiting delivery
Date: Oct 14, 2026
Ref. Number: 8214734896720545
Copy
Details
WSRFID Microchip Store
Readell 100 peças etiqueta de vidro com implantador iso11784/785 FDX-B uso de tartaruga certificado icar chip de cachorro microchip de animal de estimação
green 2.12x12mm
R$334.94   x1
R$5 coupon if delayed
Total:R$4,636.37
Confirm received
Track status`;

test('tela em inglês: status, data, preço e total saem iguais aos da tela em português', () => {
  const c = parsearCartao(CARTAO_EN);
  assert.equal(c.status, 'Awaiting delivery');
  assert.equal(c.data, '14 out, 2026');
  assert.equal(c.loja, 'WSRFID Microchip Store');
  assert.equal(c.variante, 'green 2.12x12mm');
  assert.equal(c.preco, 334.94);
  assert.equal(c.total, 'R$4.636,37');
  const k = classificar({ statusTexto: c.status });
  assert.deepEqual([k.pagamento, k.entrega], ['ok', 'a_caminho']);
  assert.equal(classificar({ statusTexto: 'Completed' }).entrega, 'entregue');
  assert.equal(classificar({ statusTexto: 'Closed' }).entrega, 'cancelado');
});

test('números nos dois formatos', () => {
  assert.equal(numeroBR('334,94'), 334.94);
  assert.equal(numeroBR('334.94'), 334.94);
  assert.equal(numeroBR('4.636,37'), 4636.37);
  assert.equal(numeroBR('4,636.37'), 4636.37);
  assert.equal(numeroBR('4.636'), 4636);
  assert.equal(numeroBR(''), null);
});

test('data do cartão e do evento', () => {
  assert.equal(dataDoCartao('14 out, 2026')?.getMonth(), 9);
  assert.equal(dataDoEvento('Ter. | Oct. 20 15:50', AGORA), '2026-10-20 15:50');
  assert.equal(dataDoEvento('Seg. | Dec. 30 08:00', AGORA), '2025-12-30 08:00', 'sem ano: o mais recente que não seja futuro');
  assert.equal(dataDoEvento('lixo', AGORA), null);
});

test('rastreio: código, eventos na ordem e sem barra de progresso nem aviso de velocidade', () => {
  const r = parsearRastreio(RASTREIO, AGORA);
  assert.equal(r.codigo, 'NN000000000BR');
  assert.deepEqual(
    r.eventos.map((e) => [e.data, e.texto]),
    [
      ['2026-10-20 15:50', 'Em trânsito — Seu pacote chegou ao aeroporto'],
      ['2026-10-18 03:49', 'Desembaraço aduaneiro concluído'],
      ['2026-10-18 03:37', 'Desembaraço aduaneiro iniciado'],
      ['2026-10-16 21:25', 'Em trânsito — Seu pacote chegou ao aeroporto de origem e está aguardando o transporte.'],
      ['2026-10-15 19:55', 'Processando no centro de triagem do país/região de partida'],
      ['2026-10-15 07:52', 'Coletado pela transportadora — Recebido pela empresa de logística'],
      ['2026-10-14 15:55', 'Seu pacote está sendo preparado'],
      ['2026-10-14 15:55', 'Seu pedido foi feito'],
    ],
  );
});

test('pedido real a caminho, desembaraço concluído e sem alertas', () => {
  const c0 = parsearCartao(CARTAO_A_CAMINHO);
  const r = parsearRastreio(RASTREIO, AGORA);
  const c = classificar({ statusTexto: c0.status, eventos: [...r.eventos].reverse() });
  assert.deepEqual([c.pagamento, c.aduana, c.entrega], ['ok', 'concluida', 'a_caminho']);
  assert.deepEqual(c.alertas, []);
});

test('status do cartão: concluído, cancelado e esperando pagamento', () => {
  const de = (t) => {
    const c = classificar({ statusTexto: parsearCartao(t).status });
    return [c.pagamento, c.aduana, c.entrega];
  };
  assert.deepEqual(de(CARTAO_CONCLUIDO_8), ['ok', 'concluida', 'entregue']);
  assert.equal(de(CARTAO_CANCELADO)[2], 'cancelado');
  assert.equal(de(CARTAO_PAGAMENTO)[0], 'pendente');
});

const pedido = (id, o = {}) => ({ id, itens: [{ titulo: `Item ${id}` }], alertas: [], pagamento: 'ok', aduana: 'em_andamento', entrega: 'a_caminho', ...o });

test('diferenças: novo pedido, troca de trilha e gravidade', () => {
  const antes = [pedido('1'), pedido('2')];
  const depois = [
    pedido('1', { aduana: 'concluida' }),
    pedido('2', { aduana: 'problema', alertas: [{ tipo: 'aduana', texto: 'retido' }] }),
    pedido('3'),
  ];
  const m = diferencas(antes, depois, '2026-10-20T10:00:00Z');
  assert.deepEqual(
    m.map((x) => [x.pedidoId, x.grave, x.texto]),
    [
      ['1', false, 'Item 1: Desembaraço concluído'],
      ['2', true, 'Item 2: Problema na aduana'],
      ['3', false, 'Novo pedido: Item 3'],
    ],
  );
});

test('diferenças: nada mudou', () => {
  assert.deepEqual(diferencas([pedido('1')], [pedido('1')], 'x'), []);
});

test('trava do checkout: só "Comprar" passa; "Fazer o pedido" e qualquer pagamento são barrados', () => {
  for (const ok of ['Comprar', 'Buy now']) assert.ok(SO_ESTE_BOTAO.test(ok) && !PROIBIDO.test(ok), ok);
  for (const no of ['Fazer o pedido', 'Fazer pedido', 'Place order', 'Confirmar compra', 'Pagar agora', 'Pix', 'Cartão de crédito', 'Finalizar compra', 'Adicionar ao carrinho']) {
    assert.ok(!SO_ESTE_BOTAO.test(no) || PROIBIDO.test(no), `deveria barrar: ${no}`);
  }
  assert.ok(!SO_ESTE_BOTAO.test('Fazer o pedido'));
});

test('checagem rápida: o rastreio novo libera o desembaraço e a mudança aparece', () => {
  const antes = { id: '1', itens: [{ titulo: 'Readell 100 peças microchip' }], statusTexto: 'Aguardando a entrega', pagamento: 'ok', aduana: 'aguardando', entrega: 'a_caminho', alertas: [], codigoRastreio: null, previsao: null, eventos: [] };
  const depois = reclassificar(antes, RASTREIO, AGORA);
  assert.equal(depois.aduana, 'concluida');
  assert.equal(depois.codigoRastreio, 'NN000000000BR');
  assert.deepEqual(depois.previsao, { de: '2026-10-26', ate: '2026-11-07' });
  const m = diferencas([antes], [depois], '2026-10-20T10:00:00Z');
  assert.equal(m.length, 1);
  assert.match(m[0].texto, /Desembaraço concluído/);
  // Rastreio sem nada novo: nenhuma mudança.
  assert.deepEqual(diferencas([depois], [reclassificar(depois, RASTREIO, AGORA)], 'x'), []);
});

test('leitura de rastreio vazia (página não carregou) é inconclusiva: não muda nada nem gera aviso', () => {
  const p = { id: '1', itens: [{ titulo: 'Readell 100 peças microchip' }], statusTexto: 'Aguardando a entrega', pagamento: 'ok', aduana: 'concluida', entrega: 'a_caminho', alertas: [], codigoRastreio: 'NN1', previsao: null, eventos: [{ data: '2026-10-18 03:49', texto: 'Desembaraço aduaneiro concluído' }] };
  assert.equal(reclassificar(p, 'AliExpress\nFaça o download do aplicativo\nCarrinho', AGORA), p);
  assert.deepEqual(diferencas([p], [reclassificar(p, '', AGORA)], 'x'), []);
});
