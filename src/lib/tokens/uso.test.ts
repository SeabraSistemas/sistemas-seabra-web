import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { HORA_MS, baldesValidos, limiteDe, pctDe, sessaoAtual, somarMaquinas, tokensDesde, type Balde } from '@/lib/tokens/uso';

const H0 = Date.UTC(2026, 9, 6, 12); // hora cheia qualquer
const b = (horas: number, t: number, c = 0): Balde => ({ h: H0 + horas * HORA_MS, t, c });

describe('tokens desde o reset', () => {
  const horas = [b(0, 100), b(1, 200), b(2, 300)];
  test('soma só os baldes a partir do reset', () => {
    assert.equal(tokensDesde(horas, H0 + HORA_MS), 500);
    assert.equal(tokensDesde(horas, H0), 600);
    assert.equal(tokensDesde(horas, H0 + 3 * HORA_MS), 0);
  });
  test('cache lido não entra na conta', () => {
    assert.equal(tokensDesde([b(0, 100, 99_999)], H0), 100);
  });
});

describe('sessão de 5h', () => {
  test('abre na hora cheia da primeira mensagem e vale 5h', () => {
    const s = sessaoAtual([b(0, 100), b(2, 50)], H0 + 3 * HORA_MS);
    assert.deepEqual(s, { inicio: H0, fim: H0 + 5 * HORA_MS, tokens: 150 });
  });
  test('mensagem depois das 5h abre outra sessão e só conta a nova', () => {
    const s = sessaoAtual([b(0, 1000), b(6, 40)], H0 + 7 * HORA_MS);
    assert.deepEqual(s, { inicio: H0 + 6 * HORA_MS, fim: H0 + 11 * HORA_MS, tokens: 40 });
  });
  test('sessão que já acabou = null (contador zerado)', () => {
    assert.equal(sessaoAtual([b(0, 100)], H0 + 5 * HORA_MS), null);
    assert.equal(sessaoAtual([], H0), null);
  });
  test('balde vazio não abre sessão', () => {
    assert.equal(sessaoAtual([b(0, 0, 0)], H0 + HORA_MS), null);
  });
});

describe('calibração', () => {
  test('100 mil tokens a 25% → limite de 400 mil', () => {
    assert.equal(limiteDe(100_000, 25), 400_000);
  });
  test('sem tokens ou com % fora de 1–100 não calibra', () => {
    assert.equal(limiteDe(0, 25), null);
    assert.equal(limiteDe(1000, 0), null);
    assert.equal(limiteDe(1000, 101), null);
  });
  test('% estimado nunca passa de 100 e some sem limite', () => {
    assert.equal(pctDe(200, 400), 50);
    assert.equal(pctDe(900, 400), 100);
    assert.equal(pctDe(200, null), null);
  });
});

describe('payload do coletor', () => {
  test('aceita baldes bons e arredonda', () => {
    assert.deepEqual(baldesValidos([{ h: H0, t: 10.4, c: 2 }]), [{ h: H0, t: 10, c: 2 }]);
  });
  test('rejeita o que não é balde de hora cheia, negativo, não numérico ou grande demais', () => {
    assert.equal(baldesValidos([{ h: H0 + 1, t: 1, c: 0 }]), null);
    assert.equal(baldesValidos([{ h: H0, t: -1, c: 0 }]), null);
    assert.equal(baldesValidos([{ h: H0, t: '5', c: 0 }]), null);
    assert.equal(baldesValidos([{ h: H0, t: NaN, c: 0 }]), null);
    assert.equal(baldesValidos('x'), null);
    assert.equal(baldesValidos(Array.from({ length: 5 }, () => ({ h: H0, t: 1, c: 0 })), 4), null);
  });
});

describe('várias máquinas', () => {
  test('soma baldes da mesma hora e fica com o envio mais recente', () => {
    const u = somarMaquinas([
      { horas: [b(0, 10), b(1, 5)], coletadoEm: 1000 },
      { horas: [b(1, 7)], coletadoEm: 2000 },
    ]);
    assert.deepEqual(u.horas, [b(0, 10), b(1, 12)]);
    assert.equal(u.coletadoEm, 2000);
    assert.equal(u.maquinas, 2);
  });
  test('sem linhas → sem coletor', () => {
    assert.equal(somarMaquinas([]).coletadoEm, null);
  });
});
