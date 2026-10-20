import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificar } from './classificar.mjs';

const ev = (...textos) => textos.map((texto) => ({ texto }));

test('pagamento aprovado', () => {
  const r = classificar({ statusTexto: 'Pagamento confirmado. Aguardando envio do vendedor' });
  assert.equal(r.pagamento, 'ok');
  assert.equal(r.entrega, 'a_caminho');
  assert.deepEqual(r.alertas, []);
});

test('aguardando pagamento não é aprovado', () => {
  const r = classificar({ statusTexto: 'Aguardando pagamento' });
  assert.equal(r.pagamento, 'pendente');
});

test('problema de pagamento vira alerta', () => {
  const r = classificar({ statusTexto: 'Falha no pagamento. Tente outro método' });
  assert.equal(r.pagamento, 'problema');
  assert.equal(r.alertas[0].tipo, 'pagamento');
});

const NO_DESTINO = 'Chegou ao país/região de destino';

test('desembaraço concluído no destino (pt)', () => {
  const r = classificar({ statusTexto: 'Em trânsito', eventos: ev(NO_DESTINO, 'Desembaraço aduaneiro concluído') });
  assert.equal(r.aduana, 'concluida');
});

test('customs clearance complete (en)', () => {
  const r = classificar({ eventos: ev(NO_DESTINO, 'Customs clearance complete') });
  assert.equal(r.aduana, 'concluida');
});

test('retida e depois liberada termina concluída', () => {
  const r = classificar({ eventos: ev(NO_DESTINO, 'Objeto retido na alfândega', 'Desembaraço aduaneiro concluído') });
  assert.equal(r.aduana, 'concluida');
  assert.deepEqual(r.alertas, []);
});

test('liberada e depois retida termina em problema', () => {
  const r = classificar({ eventos: ev(NO_DESTINO, 'Desembaraço aduaneiro concluído', 'Objeto retido pela fiscalização aduaneira') });
  assert.equal(r.aduana, 'problema');
  assert.equal(r.alertas[0].tipo, 'aduana');
});

test('imposto de importação pendente', () => {
  const r = classificar({ eventos: ev('Aguardando pagamento do imposto de importação') });
  assert.equal(r.aduana, 'imposto_pendente');
  assert.equal(r.pagamento, 'pendente', 'o texto também fala em aguardando pagamento: vale conferir na tela');
});

test('na aduana, em andamento', () => {
  const r = classificar({ eventos: ev(NO_DESTINO, 'Objeto em processo de desembaraço aduaneiro') });
  assert.equal(r.aduana, 'em_andamento');
});

test('entregue completa as outras trilhas', () => {
  const r = classificar({ statusTexto: 'Entregue' });
  assert.equal(r.entrega, 'entregue');
  assert.equal(r.aduana, 'concluida');
  assert.equal(r.pagamento, 'ok');
});

test('problema de entrega', () => {
  const r = classificar({ eventos: ev('Tentativa de entrega malsucedida: destinatário ausente') });
  assert.equal(r.entrega, 'problema');
  assert.equal(r.alertas[0].tipo, 'entrega');
});

test('cancelado', () => {
  assert.equal(classificar({ statusTexto: 'Pedido cancelado' }).entrega, 'cancelado');
});

test('texto sem nada reconhecível', () => {
  const r = classificar({ statusTexto: 'xyz' });
  assert.deepEqual([r.pagamento, r.aduana, r.entrega], ['desconhecido', 'desconhecido', 'desconhecido']);
});

test('desembaraço concluído vale como liberado no Brasil, mesmo antes de o pacote sair da China', () => {
  const r = classificar({ statusTexto: 'Aguardando a entrega', eventos: ev('Desembaraço aduaneiro concluído', 'Saiu do país/região de partida.') });
  assert.equal(r.aduana, 'concluida');
});

test('a caminho sem nenhum evento de aduana ainda: aguardando', () => {
  const r = classificar({ statusTexto: 'Aguardando a entrega', eventos: ev('Saiu do país/região de partida.') });
  assert.equal(r.aduana, 'aguardando');
});

test('desembaraço de importação explícito conta mesmo sem evento de saída', () => {
  const r = classificar({ eventos: ev('Desembaraço de importação concluído') });
  assert.equal(r.aduana, 'concluida');
});

test('desembaraço explícito de exportação nunca conta, nem depois da saída', () => {
  const r = classificar({ eventos: ev(NO_DESTINO, 'Desembaraço de exportação concluído') });
  assert.notEqual(r.aduana, 'concluida');
});

test('retenção de exportação ainda é alerta', () => {
  const r = classificar({ eventos: ev('Objeto retido pela alfândega de exportação') });
  assert.equal(r.aduana, 'problema');
});
