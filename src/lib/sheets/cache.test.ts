import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { criarCache } from '@/lib/sheets/cache';

describe('criarCache', () => {
  test('carrega uma vez e reusa ate expirar', async () => {
    const cache = criarCache<number>(50);
    let chamadas = 0;
    const carregar = async () => {
      chamadas++;
      return 1;
    };
    const r1 = await cache.obter('k', carregar);
    const r2 = await cache.obter('k', carregar);
    assert.equal(r1.valor, 1);
    assert.equal(r2.valor, 1);
    assert.equal(chamadas, 1);
    assert.equal(r1.stale, false);

    await new Promise((r) => setTimeout(r, 60));
    const r3 = await cache.obter('k', carregar);
    assert.equal(r3.valor, 1);
    assert.equal(chamadas, 2);
  });

  test('carregas concorrentes pra mesma chave compartilham a mesma promise', async () => {
    const cache = criarCache<number>(1000);
    let chamadas = 0;
    const carregar = async () => {
      chamadas++;
      await new Promise((r) => setTimeout(r, 20));
      return 42;
    };
    const [a, b, c] = await Promise.all([cache.obter('x', carregar), cache.obter('x', carregar), cache.obter('x', carregar)]);
    assert.equal(chamadas, 1);
    assert.equal(a.valor, 42);
    assert.equal(b.valor, 42);
    assert.equal(c.valor, 42);
  });

  test('se a releitura falhar, devolve o valor anterior com stale=true', async () => {
    const cache = criarCache<number>(10);
    await cache.obter('k', async () => 7);
    await new Promise((r) => setTimeout(r, 15));

    const r = await cache.obter('k', async () => {
      throw new Error('planilha fora do ar');
    });
    assert.equal(r.valor, 7);
    assert.equal(r.stale, true);
  });

  test('sem valor anterior, erro de carga propaga', async () => {
    const cache = criarCache<number>(1000);
    await assert.rejects(() => cache.obter('k', async () => { throw new Error('falhou'); }));
  });

  test('invalidar(prefixo) remove so as chaves que casam', async () => {
    const cache = criarCache<number>(10_000);
    await cache.obter('fi-fcg:Baixa', async () => 1);
    await cache.obter('fi-fcg:Venda', async () => 2);
    await cache.obter('katmandu:Rebanho', async () => 3);

    cache.invalidar('fi-fcg:');

    let chamadas = 0;
    await cache.obter('fi-fcg:Baixa', async () => {
      chamadas++;
      return 99;
    });
    await cache.obter('katmandu:Rebanho', async () => {
      chamadas++;
      return 99;
    });
    assert.equal(chamadas, 1); // só a chave fi-fcg:Baixa recarregou
  });

  test('invalidar() sem prefixo limpa tudo', async () => {
    const cache = criarCache<number>(10_000);
    await cache.obter('a', async () => 1);
    cache.invalidar();
    let chamou = false;
    await cache.obter('a', async () => {
      chamou = true;
      return 2;
    });
    assert.equal(chamou, true);
  });
});
