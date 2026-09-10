/**
 * CONTROLE LEITEIRO — as regras que moram no TypeScript.
 *
 * O SQL (adm_12_leite.sql) soma as ordenhas do dia e junta nome/baia. Tudo o
 * que este arquivo testa é o que vem DEPOIS e não cabe numa view: costurar o
 * lançamento atrasado do dia seguinte no mesmo controle, e derivar cards,
 * histograma, rankings e recorte por baia a partir das linhas de animal.
 *
 * Tudo aqui é entrada → saída: nenhuma destas funções lê banco, rede ou relógio.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  acharSessao,
  costurarSessoes,
  histogramaProducao,
  melhoresDoControle,
  pioresDoControle,
  producaoPorBaia,
  resumoDoControle,
  serieDasSessoes,
} from '@/lib/adm/areas/controle-leiteiro';
import type { LinhaControleAnimal, LinhaSessaoControle } from '@/lib/adm/areas/contrato';

function dia(parcial: Partial<LinhaSessaoControle> & { data_controle: string }): LinhaSessaoControle {
  const animais = parcial.animais ?? 10;
  return {
    propriedade_id: 1,
    animais,
    animais_com_leite: parcial.animais_com_leite ?? animais,
    litros_total: parcial.litros_total ?? 20,
    media_com_leite: parcial.media_com_leite ?? 2,
    del_medio: parcial.del_medio ?? 100,
    animais_com_del: parcial.animais_com_del ?? animais,
    ...parcial,
  };
}

function animal(parcial: Partial<LinhaControleAnimal> & { animal_id: number }): LinhaControleAnimal {
  return {
    propriedade_id: 1,
    data_controle: '2026-03-09',
    numero_animal: String(parcial.animal_id),
    nome_animal: null,
    baia: 'G1',
    litros: 2,
    ordenhas: 2,
    del: 100,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// costurarSessoes — o rabicho do dia seguinte
// ─────────────────────────────────────────────────────────────────────────────

test('costurarSessoes: dia seguinte entra no mesmo controle — é o lançamento atrasado, não outro controle', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-03-09', animais: 70 }),
    dia({ data_controle: '2026-03-10', animais: 2 }),
  ]);

  assert.equal(sessoes.length, 1);
  assert.deepEqual(sessoes[0].datas, ['2026-03-09', '2026-03-10']);
  assert.equal(sessoes[0].animais, 72);
});

test('costurarSessoes: dois dias de distância são DOIS controles — juntar inventaria uma média não medida junto', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-03-09' }),
    dia({ data_controle: '2026-03-11' }),
  ]);

  assert.equal(sessoes.length, 2);
});

test('costurarSessoes: a sessão é nomeada pelo dia com MAIS animais — o dia do curral, não o do rabicho', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-07-08', animais: 37 }),
    dia({ data_controle: '2026-07-09', animais: 4 }),
  ]);

  assert.equal(sessoes[0].chave, '2026-07-08');
});

test('costurarSessoes: a média é recalculada sobre os totais, não é a média das médias dos dois dias', () => {
  const sessoes = costurarSessoes([
    // 90 L / 30 animais = 3,0 · e 10 L / 10 animais = 1,0 → média das médias daria 2,0
    dia({ data_controle: '2026-05-08', animais: 30, animais_com_leite: 30, litros_total: 90, media_com_leite: 3 }),
    dia({ data_controle: '2026-05-09', animais: 10, animais_com_leite: 10, litros_total: 10, media_com_leite: 1 }),
  ]);

  // A verdadeira: 100 L / 40 animais = 2,5.
  assert.equal(sessoes[0].mediaComLeite, 2.5);
});

test('costurarSessoes: DEL médio pondera pelo DENOMINADOR do dia — o dia que mediu 4 não pesa como o que mediu 70', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-07-08', animais: 70, del_medio: 100, animais_com_del: 70 }),
    dia({ data_controle: '2026-07-09', animais: 4, del_medio: 300, animais_com_del: 4 }),
  ]);

  // (100×70 + 300×4) / 74 = 110,8 — e não 200, que seria a média das médias.
  assert.ok(Math.abs((sessoes[0].delMedio ?? 0) - 110.81) < 0.01, `veio ${sessoes[0].delMedio}`);
});

test('costurarSessoes: devolve da mais recente para a mais antiga', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-01-10' }),
    dia({ data_controle: '2026-08-07' }),
    dia({ data_controle: '2026-04-09' }),
  ]);

  assert.deepEqual(
    sessoes.map((s) => s.chave),
    ['2026-08-07', '2026-04-09', '2026-01-10'],
  );
});

test('acharSessao: usa a data pedida; sem ela (ou com data desconhecida) cai na mais recente', () => {
  const sessoes = costurarSessoes([dia({ data_controle: '2026-08-07' }), dia({ data_controle: '2026-04-09' })]);

  assert.equal(acharSessao(sessoes, '2026-04-09')?.chave, '2026-04-09');
  assert.equal(acharSessao(sessoes, null)?.chave, '2026-08-07');
  assert.equal(acharSessao(sessoes, '1999-01-01')?.chave, '2026-08-07');
  assert.equal(acharSessao([], null), null);
});

test('serieDasSessoes: ordem cronológica e só pontos com média — o gráfico não desenha ponto de sessão vazia', () => {
  const sessoes = costurarSessoes([
    dia({ data_controle: '2026-08-07', litros_total: 100, animais_com_leite: 50 }),
    dia({ data_controle: '2026-04-09', animais: 5, animais_com_leite: 0, litros_total: 0 }),
  ]);

  const serie = serieDasSessoes(sessoes);
  assert.deepEqual(serie, [{ periodo: '2026-08-07', valor: 2 }]);
});

// ─────────────────────────────────────────────────────────────────────────────
// resumoDoControle — os cards
// ─────────────────────────────────────────────────────────────────────────────

test('resumoDoControle: separa média de quem deu leite da média geral quando alguém zerou', () => {
  const resumo = resumoDoControle([
    animal({ animal_id: 1, litros: 3 }),
    animal({ animal_id: 2, litros: 1 }),
    animal({ animal_id: 3, litros: 0 }),
  ]);

  assert.equal(resumo.animais, 3);
  assert.equal(resumo.comLeite, 2);
  assert.equal(resumo.semLeite, 1);
  assert.equal(resumo.litrosTotal, 4);
  assert.equal(resumo.mediaComLeite, 2, '4 L ÷ 2 que deram leite');
  assert.ok(Math.abs((resumo.mediaGeral ?? 0) - 4 / 3) < 1e-9, '4 L ÷ 3 que passaram no controle');
});

test('resumoDoControle: DEL não medido não é DEL zero — fica fora da média e o denominador aparece', () => {
  const resumo = resumoDoControle([
    animal({ animal_id: 1, del: 100 }),
    animal({ animal_id: 2, del: null }),
    animal({ animal_id: 3, del: 0 }),
  ]);

  assert.equal(resumo.delMedio, 100, 'só o animal com DEL medido entra');
  assert.equal(resumo.animaisComDel, 1);
});

test('resumoDoControle: controle sem nenhum DEL medido devolve null, e não 0', () => {
  const resumo = resumoDoControle([animal({ animal_id: 1, del: null })]);
  assert.equal(resumo.delMedio, null);
});

test('resumoDoControle: conta ordenhas e quantos animais foram pesados nas duas', () => {
  const resumo = resumoDoControle([
    animal({ animal_id: 1, ordenhas: 2 }),
    animal({ animal_id: 2, ordenhas: 1 }),
  ]);

  assert.equal(resumo.ordenhas, 3);
  assert.equal(resumo.duasOrdenhas, 1);
});

test('resumoDoControle: controle vazio não vira NaN', () => {
  const resumo = resumoDoControle([]);
  assert.equal(resumo.animais, 0);
  assert.equal(resumo.litrosTotal, 0);
  assert.equal(resumo.mediaComLeite, null);
  assert.equal(resumo.mediaGeral, null);
  assert.equal(resumo.melhor, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// histogramaProducao — a escala
// ─────────────────────────────────────────────────────────────────────────────

test('histogramaProducao: as dez faixas sempre saem, inclusive as vazias', () => {
  const faixas = histogramaProducao([animal({ animal_id: 1, litros: 2.2 })]);
  assert.equal(faixas.length, 10);
  assert.equal(faixas.filter((f) => f.animais === 0).length, 9);
});

test('histogramaProducao: a borda é fechada em cima — 2,0 L cai em "1,51 – 2,0" e 2,01 na faixa seguinte', () => {
  const faixas = histogramaProducao([
    animal({ animal_id: 1, litros: 2.0 }),
    animal({ animal_id: 2, litros: 2.01 }),
  ]);

  const porRotulo = new Map(faixas.map((f) => [f.rotulo, f.animais]));
  assert.equal(porRotulo.get('1,51 – 2,0 L'), 1);
  assert.equal(porRotulo.get('2,01 – 2,5 L'), 1);
});

test('histogramaProducao: quem zerou entra na primeira faixa em vez de sumir do gráfico', () => {
  const faixas = histogramaProducao([animal({ animal_id: 1, litros: 0 })]);
  assert.equal(faixas[0].animais, 1);
  assert.equal(faixas[0].fracao, 1);
});

test('histogramaProducao: acima de 5 L tem faixa própria, sem teto', () => {
  const faixas = histogramaProducao([animal({ animal_id: 1, litros: 8.8 })]);
  assert.equal(faixas[faixas.length - 1].animais, 1);
});

test('histogramaProducao: sem animal nenhum a fração é null, e não 0% nem divisão por zero', () => {
  const faixas = histogramaProducao([]);
  assert.ok(faixas.every((f) => f.fracao === null && f.animais === 0));
});

// ─────────────────────────────────────────────────────────────────────────────
// Rankings
// ─────────────────────────────────────────────────────────────────────────────

test('melhoresDoControle: maior primeiro, e o empate desempata pelo número — a lista não dança entre dois carregamentos', () => {
  const lista = melhoresDoControle([
    animal({ animal_id: 1, numero_animal: '200', litros: 3 }),
    animal({ animal_id: 2, numero_animal: '100', litros: 3 }),
    animal({ animal_id: 3, numero_animal: '300', litros: 5 }),
  ]);

  assert.deepEqual(
    lista.map((a) => a.numero_animal),
    ['300', '100', '200'],
  );
});

test('pioresDoControle: 0,0 L fica de fora por padrão — cabra seca lançada não é má produtora', () => {
  const lista = pioresDoControle([
    animal({ animal_id: 1, numero_animal: '10', litros: 0 }),
    animal({ animal_id: 2, numero_animal: '20', litros: 0.6 }),
    animal({ animal_id: 3, numero_animal: '30', litros: 4 }),
  ]);

  assert.deepEqual(
    lista.map((a) => a.numero_animal),
    ['20', '30'],
  );
});

test('pioresDoControle: com incluirZerados, o 0,0 L volta e encabeça', () => {
  const lista = pioresDoControle(
    [animal({ animal_id: 1, numero_animal: '10', litros: 0 }), animal({ animal_id: 2, numero_animal: '20', litros: 0.6 })],
    15,
    true,
  );

  assert.equal(lista[0].numero_animal, '10');
});

test('rankings respeitam o limite pedido', () => {
  const animais = Array.from({ length: 30 }, (_, i) => animal({ animal_id: i, litros: i + 1 }));
  assert.equal(melhoresDoControle(animais, 15).length, 15);
  assert.equal(pioresDoControle(animais, 15).length, 15);
});

test('rankings não mexem no array recebido — a página deriva várias listas do mesmo dado', () => {
  const animais = [animal({ animal_id: 1, litros: 1 }), animal({ animal_id: 2, litros: 9 })];
  const antes = animais.map((a) => a.animal_id);

  melhoresDoControle(animais);
  pioresDoControle(animais);

  assert.deepEqual(
    animais.map((a) => a.animal_id),
    antes,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// producaoPorBaia
// ─────────────────────────────────────────────────────────────────────────────

test('producaoPorBaia: agrupa, calcula média por cabeça e ordena da melhor para a pior', () => {
  const baias = producaoPorBaia([
    animal({ animal_id: 1, baia: 'G1-1', litros: 1 }),
    animal({ animal_id: 2, baia: 'G1-1', litros: 3 }),
    animal({ animal_id: 3, baia: 'G1-2', litros: 5 }),
  ]);

  assert.deepEqual(
    baias.map((b) => b.baia),
    ['G1-2', 'G1-1'],
  );
  assert.equal(baias[1].animais, 2);
  assert.equal(baias[1].litrosTotal, 4);
  assert.equal(baias[1].mediaPorCabeca, 2);
});

test('producaoPorBaia: baia nula ou em branco vira "Sem baia", sempre por último', () => {
  const baias = producaoPorBaia([
    animal({ animal_id: 1, baia: null, litros: 9 }),
    animal({ animal_id: 2, baia: '   ', litros: 9 }),
    animal({ animal_id: 3, baia: 'G1-1', litros: 1 }),
  ]);

  assert.deepEqual(
    baias.map((b) => b.baia),
    ['G1-1', 'Sem baia'],
    'apesar de "Sem baia" ter a MAIOR média, ela é falha de cadastro e não um lugar do curral',
  );
  assert.equal(baias[1].animais, 2);
});

test('producaoPorBaia: DEL da baia ignora quem não teve DEL medido', () => {
  const baias = producaoPorBaia([
    animal({ animal_id: 1, baia: 'G1-1', del: 60 }),
    animal({ animal_id: 2, baia: 'G1-1', del: null }),
  ]);

  assert.equal(baias[0].delMedio, 60);
});
