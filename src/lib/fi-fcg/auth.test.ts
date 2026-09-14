import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createHmac } from 'node:crypto';

import { assinarSessao, verificarSessao, SESSAO_DIAS } from '@/lib/fi-fcg/auth';
import { emailPermitido } from '@/lib/fi-fcg/allowlist';

process.env.FI_FCG_SESSION_SECRET = 'a'.repeat(64);
const T0 = 1_800_000_000_000;

describe('fi-fcg/auth', () => {
  test('assina e verifica, normalizando o e-mail', () => {
    const cookie = assinarSessao('  Felipe@Exemplo.com ', T0);
    assert.ok(cookie);
    assert.equal(verificarSessao(cookie, T0), 'felipe@exemplo.com');
  });

  test('expira no milissegundo seguinte ao prazo', () => {
    const cookie = assinarSessao('x@y.z', T0)!;
    const prazo = T0 + SESSAO_DIAS * 24 * 60 * 60 * 1000;
    assert.equal(verificarSessao(cookie, prazo), 'x@y.z');
    assert.equal(verificarSessao(cookie, prazo + 1), null);
  });

  test('rejeita cookie adulterado, vazio ou de outro segredo', () => {
    const cookie = assinarSessao('x@y.z', T0)!;
    const [b64, exp, sig] = cookie.split('.');
    assert.equal(verificarSessao(`${b64}.${exp + '0'}.${sig}`, T0), null);
    assert.equal(verificarSessao(`${b64}.${exp}.${'0'.repeat(64)}`, T0), null);
    assert.equal(verificarSessao('', T0), null);
    assert.equal(verificarSessao('a.b', T0), null);

    const anterior = process.env.FI_FCG_SESSION_SECRET;
    process.env.FI_FCG_SESSION_SECRET = 'b'.repeat(64);
    try {
      assert.equal(verificarSessao(cookie, T0), null);
    } finally {
      process.env.FI_FCG_SESSION_SECRET = anterior;
    }
  });

  test('sem segredo (ou segredo curto) nao assina nem verifica', () => {
    const anterior = process.env.FI_FCG_SESSION_SECRET;
    process.env.FI_FCG_SESSION_SECRET = 'curto';
    try {
      assert.equal(assinarSessao('x@y.z', T0), null);
    } finally {
      process.env.FI_FCG_SESSION_SECRET = anterior;
    }
  });

  test('um cookie assinado pelo Katmandu/cursoidiomas nao vale aqui (segredos independentes)', () => {
    // simula um cookie de outro painel: mesma forma, chave diferente — já
    // coberto pelo teste de "outro segredo" acima, mas explicitado aqui
    // porque é a garantia central de ter um segredo por painel.
    const outroSegredo = 'c'.repeat(64);
    const payload = `${Buffer.from('x@y.z', 'utf8').toString('base64url')}.${T0 + 1000}`;
    const assinaturaErrada = createHmac('sha256', outroSegredo).update(payload).digest('hex');
    assert.equal(verificarSessao(`${payload}.${assinaturaErrada}`, T0), null);
  });
});

describe('fi-fcg/allowlist', () => {
  test('aceita e-mail da lista ignorando caixa e espacos', () => {
    assert.equal(emailPermitido(' FelipeSeabraCL@gmail.com '), true);
  });
  test('recusa vazio e desconhecido', () => {
    assert.equal(emailPermitido(''), false);
    assert.equal(emailPermitido('alguem@exemplo.com'), false);
  });
});
