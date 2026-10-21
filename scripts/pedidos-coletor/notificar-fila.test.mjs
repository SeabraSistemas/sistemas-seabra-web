import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';

// A pasta de dados é lida quando o módulo carrega: define antes de importar.
const DIR = mkdtempSync(join(tmpdir(), 'pedidos-fila-'));
process.env.PEDIDOS_DIR = DIR;
const { descarregarFila, enviar, enviarOuGuardar } = await import('./notificar.mjs');

const CONFIG = { token: '123456:' + 'A'.repeat(35), chatId: 1 };
const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});

const resposta = (corpo, status = 200) => ({ ok: status < 400, status, json: async () => corpo });

test('falha de rede: tenta de novo e a mensagem sai', async () => {
  let chamadas = 0;
  globalThis.fetch = async () => {
    chamadas++;
    if (chamadas < 3) throw new TypeError('fetch failed');
    return resposta({ ok: true, result: {} });
  };
  assert.equal(await enviar('oi', CONFIG, [0, 0, 0]), true);
  assert.equal(chamadas, 3);
});

test('recusa do Telegram (token errado) não fica tentando', async () => {
  let chamadas = 0;
  globalThis.fetch = async () => {
    chamadas++;
    return resposta({ ok: false, description: 'Unauthorized' }, 401);
  };
  await assert.rejects(() => enviar('oi', CONFIG, [0, 0, 0]), /Telegram recusou/);
  assert.equal(chamadas, 1);
});

test('rede fora o tempo todo: vai para a fila e sai na próxima execução, com aviso de atraso', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('fetch failed');
  };
  await assert.rejects(() => enviarOuGuardar('📦 Pedidos — 21/10', CONFIG), /guardei na fila/);
  const fila = JSON.parse(readFileSync(join(DIR, 'telegram-fila.json'), 'utf8'));
  assert.equal(fila.length, 1);

  const enviados = [];
  globalThis.fetch = async (_url, opcoes) => {
    enviados.push(JSON.parse(opcoes.body).text);
    return resposta({ ok: true, result: {} });
  };
  assert.equal(await descarregarFila(CONFIG), 1);
  assert.match(enviados[0], /^📦 Pedidos — 21\/10\n\n\(atrasada: /);
  assert.deepEqual(JSON.parse(readFileSync(join(DIR, 'telegram-fila.json'), 'utf8')), []);
});

test('mensagem com mais de 24 h na fila é descartada, não reenviada', async () => {
  writeFileSync(join(DIR, 'telegram-fila.json'), JSON.stringify([{ texto: 'velha', em: new Date(Date.now() - 30 * 3_600_000).toISOString() }]));
  let chamadas = 0;
  globalThis.fetch = async () => {
    chamadas++;
    return resposta({ ok: true, result: {} });
  };
  assert.equal(await descarregarFila(CONFIG), 0);
  assert.equal(chamadas, 0);
});
