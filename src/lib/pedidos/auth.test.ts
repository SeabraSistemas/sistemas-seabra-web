import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { assinarSessao, SESSAO_DIAS, segredoDoColetorConfere, verificarSessao } from '@/lib/pedidos/auth';

const SEGREDO = 'a'.repeat(64);

describe('sessão do /pedidos', () => {
  beforeEach(() => {
    process.env.PEDIDOS_SESSION_SECRET = SEGREDO;
    process.env.PEDIDOS_COLETOR_SECRET = 'b'.repeat(64);
  });
  afterEach(() => {
    delete process.env.PEDIDOS_SESSION_SECRET;
    delete process.env.PEDIDOS_COLETOR_SECRET;
  });

  test('cookie assinado vale; adulterado, vazio e expirado não valem', () => {
    const agora = Date.now();
    const v = assinarSessao(agora);
    assert.ok(v);
    assert.equal(verificarSessao(v, agora + 1000), true);
    assert.equal(verificarSessao(v!.replace(/.$/, (c) => (c === '0' ? '1' : '0')), agora), false, 'assinatura adulterada');
    assert.equal(verificarSessao(v!.replace(/^p1\.\d+/, `p1.${agora + 9e12}`), agora), false, 'prazo adulterado');
    assert.equal(verificarSessao('', agora), false);
    assert.equal(verificarSessao(undefined, agora), false);
    assert.equal(verificarSessao(v, agora + (SESSAO_DIAS + 1) * 86_400_000), false, 'expirado');
  });

  test('sem segredo (ou curto) ninguém entra', () => {
    const v = assinarSessao();
    process.env.PEDIDOS_SESSION_SECRET = 'curto';
    assert.equal(assinarSessao(), null);
    assert.equal(verificarSessao(v), false);
    delete process.env.PEDIDOS_SESSION_SECRET;
    assert.equal(verificarSessao(v), false);
  });

  test('cookie de outro segredo não vale', () => {
    const v = assinarSessao();
    process.env.PEDIDOS_SESSION_SECRET = 'c'.repeat(64);
    assert.equal(verificarSessao(v), false);
  });

  test('segredo do coletor: só o Bearer exato', () => {
    assert.equal(segredoDoColetorConfere(`Bearer ${'b'.repeat(64)}`), true);
    assert.equal(segredoDoColetorConfere(`Bearer ${'b'.repeat(63)}x`), false);
    assert.equal(segredoDoColetorConfere('b'.repeat(64)), false);
    assert.equal(segredoDoColetorConfere(null), false);
    delete process.env.PEDIDOS_COLETOR_SECRET;
    assert.equal(segredoDoColetorConfere(`Bearer ${'b'.repeat(64)}`), false);
  });
});
