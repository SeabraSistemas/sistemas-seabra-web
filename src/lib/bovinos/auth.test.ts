import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { assinarSessao, verificarSessao, SESSAO_DIAS } from '@/lib/bovinos/auth';
import { emailPermitido } from '@/lib/bovinos/allowlist';

process.env.BOVINOS_SESSION_SECRET = 'b'.repeat(64);
const T0 = 1_800_000_000_000;

describe('bovinos/auth', () => {
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

  test('rejeita cookie adulterado', () => {
    const cookie = assinarSessao('x@y.z', T0)!;
    const [b64, exp] = cookie.split('.');
    assert.equal(verificarSessao(`${b64}.${exp}.${'0'.repeat(64)}`, T0), null);
    assert.equal(verificarSessao('', T0), null);
  });

  test('allowlist: só o e-mail do Felipe', () => {
    assert.equal(emailPermitido(' FelipeSeabraCL@gmail.com '), true);
    assert.equal(emailPermitido('outro@gmail.com'), false);
    assert.equal(emailPermitido(''), false);
  });
});
