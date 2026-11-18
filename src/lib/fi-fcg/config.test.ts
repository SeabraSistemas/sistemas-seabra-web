import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ABAS_OCULTAS, HOME_HREF, LINKS } from '@/lib/fi-fcg/config';
import { MENSAGEM_DESATIVADO, rotaDesativada } from '@/lib/fi-fcg/desativado';

test('header do /FI_FCG mostra só a Meta', () => {
  assert.deepEqual(LINKS.map((l) => l.href), ['/FI_FCG/meta']);
  assert.equal(HOME_HREF, '/FI_FCG/meta');
});

test('nenhuma aba oculta volta para o header', () => {
  for (const aba of ABAS_OCULTAS) {
    assert.ok(!LINKS.some((l) => l.href === `/FI_FCG/${aba}`), aba);
  }
  assert.equal(ABAS_OCULTAS.length, 9);
});

test('rota desativada responde 410 sem gravar', async () => {
  const r = rotaDesativada();
  assert.equal(r.status, 410);
  assert.deepEqual(await r.json(), { erro: MENSAGEM_DESATIVADO });
});
