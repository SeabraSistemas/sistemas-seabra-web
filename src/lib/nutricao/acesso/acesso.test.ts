import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { emailPermitido, EMAILS_PERMITIDOS } from '@/lib/nutricao/acesso/allowlist';
import { assinarSessao, SESSAO_DIAS, segredoConfigurado, verificarSessao } from '@/lib/nutricao/acesso/auth';
import { bloqueioRestanteSegundos, limparFalhas, mesmaOrigem, registrarFalha } from '@/lib/nutricao/acesso/tentativas';

const SEGREDO = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres';
let antes: string | undefined;
beforeEach(() => {
  antes = process.env.NUTRICAO_SESSION_SECRET;
  process.env.NUTRICAO_SESSION_SECRET = SEGREDO;
});
afterEach(() => {
  if (antes === undefined) delete process.env.NUTRICAO_SESSION_SECRET;
  else process.env.NUTRICAO_SESSION_SECRET = antes;
});

describe('acesso ao /nutricao', () => {
  test('só o e-mail do Felipe passa na lista', () => {
    assert.deepEqual(EMAILS_PERMITIDOS, ['felipeseabracl@gmail.com']);
    assert.equal(emailPermitido(' FelipeSeabraCL@gmail.com '), true);
    assert.equal(emailPermitido('lucasfuurtado27@gmail.com'), false);
    assert.equal(emailPermitido(''), false);
  });

  test('cookie assinado volta o e-mail; adulterado, expirado ou sem segredo não', () => {
    const agora = 1_700_000_000_000;
    const valor = assinarSessao('felipeseabracl@gmail.com', agora);
    assert.ok(valor);
    assert.equal(verificarSessao(valor, agora + 1000), 'felipeseabracl@gmail.com');
    assert.equal(verificarSessao(valor, agora + (SESSAO_DIAS + 1) * 86_400_000), null);
    const [email, exp, assin] = valor.split('.');
    assert.equal(verificarSessao(`${Buffer.from('outro@x.com').toString('base64url')}.${exp}.${assin}`, agora), null);
    assert.equal(verificarSessao(`${email}.${exp}.${assin.slice(0, -2)}00`, agora), null);
    assert.equal(verificarSessao('lixo', agora), null);
    assert.equal(verificarSessao(undefined, agora), null);
    process.env.NUTRICAO_SESSION_SECRET = 'curto';
    assert.equal(segredoConfigurado(), false);
    assert.equal(assinarSessao('felipeseabracl@gmail.com'), null);
  });

  test('o segredo do /3irmaos não vale aqui (segredo próprio)', () => {
    const valor = assinarSessao('felipeseabracl@gmail.com', 1_700_000_000_000);
    process.env.NUTRICAO_SESSION_SECRET = `${SEGREDO}-outro`;
    assert.equal(verificarSessao(valor, 1_700_000_000_500), null);
  });

  test('5 falhas bloqueiam por 5 minutos; um acerto limpa', () => {
    const chave = 'ip|teste';
    const t0 = 1_700_000_000_000;
    for (let i = 0; i < 4; i++) registrarFalha(chave, t0 + i);
    assert.equal(bloqueioRestanteSegundos(chave, t0 + 10), 0);
    registrarFalha(chave, t0 + 4);
    assert.ok(bloqueioRestanteSegundos(chave, t0 + 10) > 290);
    assert.equal(bloqueioRestanteSegundos(chave, t0 + 6 * 60 * 1000), 0);
    registrarFalha(chave, t0 + 7 * 60 * 1000);
    limparFalhas(chave);
    assert.equal(bloqueioRestanteSegundos(chave, t0 + 7 * 60 * 1000 + 1), 0);
  });

  test('origem: mesma passa, de fora não', () => {
    const url = new URL('https://www.sistemaseabra.com.br/nutricao/api/login');
    const req = (origin?: string) => new Request(url, { method: 'POST', headers: { host: 'www.sistemaseabra.com.br', ...(origin ? { origin } : {}) } });
    assert.equal(mesmaOrigem(req('https://www.sistemaseabra.com.br'), url), true);
    assert.equal(mesmaOrigem(req('https://evil.example'), url), false);
    assert.equal(mesmaOrigem(req(), url), true);
  });
});
