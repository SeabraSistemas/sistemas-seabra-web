import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { assinarSessao, verificarSessao, SESSAO_DIAS } from '@/lib/sanri/auth';

process.env.SANRI_SESSION_SECRET = 'a'.repeat(64);
const T0 = 1_800_000_000_000;

describe('sanri/auth', () => {
  test('assina e verifica, normalizando o e-mail', () => {
    const cookie = assinarSessao('  Fazenda@Sanri.com.br ', T0);
    assert.ok(cookie);
    assert.equal(verificarSessao(cookie, T0), 'fazenda@sanri.com.br');
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
    assert.equal(verificarSessao('', T0), null);

    const anterior = process.env.SANRI_SESSION_SECRET;
    process.env.SANRI_SESSION_SECRET = 'b'.repeat(64);
    try {
      assert.equal(verificarSessao(cookie, T0), null);
    } finally {
      process.env.SANRI_SESSION_SECRET = anterior;
    }
  });

  test('sem segredo (ou segredo curto) não assina', () => {
    const anterior = process.env.SANRI_SESSION_SECRET;
    process.env.SANRI_SESSION_SECRET = 'curto';
    try {
      assert.equal(assinarSessao('x@y.z', T0), null);
    } finally {
      process.env.SANRI_SESSION_SECRET = anterior;
    }
  });
});
