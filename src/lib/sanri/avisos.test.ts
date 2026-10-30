import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { dataValida, hojeBrasilia, linkWhatsapp, mapTextos, situacaoDoEnvio } from '@/lib/sanri/avisos';

describe('situacaoDoEnvio', () => {
  test('2xx = enviado', () => {
    assert.equal(situacaoDoEnvio({ statusHttp: 201, erro: null }), 'enviado');
  });
  test('sem resposta e sem erro = aguardando (pg_net ainda não respondeu)', () => {
    assert.equal(situacaoDoEnvio({ statusHttp: null, erro: null }), 'aguardando');
  });
  test('4xx/5xx ou erro de rede = falhou', () => {
    assert.equal(situacaoDoEnvio({ statusHttp: 400, erro: null }), 'falhou');
    assert.equal(situacaoDoEnvio({ statusHttp: null, erro: 'timeout' }), 'falhou');
  });
});

describe('dataValida', () => {
  test('aceita AAAA-MM-DD que existe', () => {
    assert.equal(dataValida('2026-10-15'), '2026-10-15');
  });
  test('recusa data que não existe, formato errado e vazio', () => {
    assert.equal(dataValida('2026-02-30'), null);
    assert.equal(dataValida('15/10/2026'), null);
    assert.equal(dataValida(''), null);
    assert.equal(dataValida(undefined), null);
  });
});

test('hojeBrasilia: 01h UTC ainda é o dia anterior em Brasília', () => {
  assert.equal(hojeBrasilia(new Date('2026-10-16T01:00:00Z')), '2026-10-15');
  assert.equal(hojeBrasilia(new Date('2026-10-16T09:00:00Z')), '2026-10-16');
});

test('linkWhatsapp leva o texto inteiro, com * e quebras de linha', () => {
  const t = '*Manejos de Rotina - 15/10/2026:*\n\nNão há manejos';
  const url = linkWhatsapp(t);
  assert.ok(url.startsWith('https://wa.me/?text='));
  assert.equal(decodeURIComponent(url.slice('https://wa.me/?text='.length)), t);
});

describe('mapTextos', () => {
  test('jsonb do banco → TextosAviso; controle e pesagem nulos quando não houve', () => {
    const t = mapTextos({
      data: '2026-10-15', dg: 'a', dg_qtd: 3, partos: 'p', partos_qtd: 1, manejos: 'b', manejos_qtd: 2,
      controle: null, controle_qtd: 0, pesagem: 'kg', pesagem_qtd: 4, dg_dias_min: 60,
    });
    assert.deepEqual(t, {
      data: '2026-10-15', dg: 'a', dgQtd: 3, partos: 'p', partosQtd: 1, manejos: 'b', manejosQtd: 2,
      controle: null, controleQtd: 0, pesagem: 'kg', pesagemQtd: 4, dgDiasMin: 60,
    });
  });
  test('sem os textos → null', () => {
    assert.equal(mapTextos({ dg_qtd: 1 }), null);
    assert.equal(mapTextos(null), null);
  });
});
