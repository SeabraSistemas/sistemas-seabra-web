import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  calcularHealthScore,
  consolidarVisoes,
  diasAte,
  faixaDeScore,
  fundirFatias,
  fundirSerie,
  mesesAte,
  mrrDeAssinatura,
  preencherDias,
  preencherMeses,
  preencherSerie,
  scoreConsolidado,
  variacaoPercentual,
  type EntradaHealthScore,
  type EstadoCobranca,
} from '@/lib/adm/metricas';
import type { VisaoGeralPropriedade } from '@/lib/adm/types';

/**
 * Testes de metricas.ts — o módulo que decide cobrança e conversa comercial.
 *
 * Regra de escrita seguida aqui: cada caso existe porque um defeito real
 * caberia nele. Os que já aconteceram nesta obra (ver a seção de revisões em
 * docs/internal/ADM_DASHBOARD_DESENHO.md) estão apontados no comentário do
 * teste que os pegaria de volta.
 *
 * Nada de `new Date()` sem argumento: tudo que depende de "agora" recebe o
 * instante por parâmetro, e é isso que faz um teste de série temporal valer
 * amanhã de manhã.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Health score
// ─────────────────────────────────────────────────────────────────────────────

/** Conta com TODO componente no pior extremo: score 0. Base para isolar um de cada vez. */
const PIOR: EntradaHealthScore = {
  diasSemLancar: 30, // recenciaPior
  diasComLancamento30d: 0,
  modulos90d: 0,
  cobranca: 'sem-acesso',
  animaisComEvento90d: 0,
  animaisVivos: 100, // rebanho existe, mas nenhum animal teve evento
};

/** Conta com TODO componente no melhor extremo: score 100. */
const MELHOR: EntradaHealthScore = {
  diasSemLancar: 2, // recenciaMelhor
  diasComLancamento30d: 12, // frequenciaMeta
  modulos90d: 4, // amplitudeMeta
  cobranca: 'em-dia',
  animaisComEvento90d: 60, // 60% de 100 = profundidadeMeta
  animaisVivos: 100,
};

function norm(entrada: EntradaHealthScore, chave: string): number {
  const componente = calcularHealthScore(entrada).componentes.find((c) => c.chave === chave);
  assert.ok(componente, `componente ${chave} não existe no score`);
  return componente.norm;
}

describe('calcularHealthScore', () => {
  test('conta no pior extremo de todos os cinco componentes pontua 0 e cai em risco', () => {
    const score = calcularHealthScore(PIOR);
    assert.equal(score.total, 0);
    assert.equal(score.faixa, 'risco');
    // `===` e não deepEqual de propósito: no piso da recência a interpolação
    // invertida devolve -0, que Object.is (o motor do deepStrictEqual) separa de
    // 0. Numericamente é zero e é isso que a tela precisa; o que este laço
    // guarda de verdade é o componente virar NaN, que passaria batido numa
    // comparação frouxa e sumiria com o score inteiro.
    for (const componente of score.componentes) {
      assert.ok(componente.norm === 0, `${componente.chave} deveria zerar, veio ${componente.norm}`);
    }
  });

  test('conta no melhor extremo de todos pontua exatamente 100 — a escala é 0-100', () => {
    const score = calcularHealthScore(MELHOR);
    assert.equal(score.total, 100);
    assert.equal(score.faixa, 'saudavel');
    assert.deepEqual(
      score.componentes.map((c) => c.norm),
      [1, 1, 1, 1, 1],
    );
  });

  test('passar do teto não passa de 1: lançar hoje, 30 dias no mês e 8 módulos ainda dá 100', () => {
    // Sem o clamp, recência de 0 dia valeria 30/28 e o total estouraria 100 —
    // um score de 112 na tela destrói a confiança no número inteiro.
    const score = calcularHealthScore({
      diasSemLancar: 0,
      diasComLancamento30d: 30,
      modulos90d: 8,
      cobranca: 'em-dia',
      animaisComEvento90d: 100,
      animaisVivos: 100,
    });
    assert.equal(score.total, 100);
    assert.deepEqual(
      score.componentes.map((c) => c.norm),
      [1, 1, 1, 1, 1],
    );
  });

  test('ficar pior que o pior extremo não pontua negativo: 500 dias em silêncio vale 0, não -5', () => {
    assert.equal(norm({ ...PIOR, diasSemLancar: 500 }, 'recencia'), 0);
    assert.equal(calcularHealthScore({ ...PIOR, diasSemLancar: 500 }).total, 0);
  });

  test('cada componente sozinho vale o seu peso: 35 recência, 25 frequência, 15 amplitude, 15 cobrança, 10 profundidade', () => {
    // Trocar dois pesos de lugar é uma edição de uma linha que nenhum tipo pega,
    // e muda quem aparece no topo da lista de risco.
    assert.equal(calcularHealthScore({ ...PIOR, diasSemLancar: 2 }).total, 35);
    assert.equal(calcularHealthScore({ ...PIOR, diasComLancamento30d: 12 }).total, 25);
    assert.equal(calcularHealthScore({ ...PIOR, modulos90d: 4 }).total, 15);
    assert.equal(calcularHealthScore({ ...PIOR, cobranca: 'em-dia' }).total, 15);
    assert.equal(calcularHealthScore({ ...PIOR, animaisComEvento90d: 60 }).total, 10);
  });

  test('caso do meio conferido à mão: 17,5 + 12,5 + 7,5 + 6 + 5 = 48,5 arredonda para 49', () => {
    // 16 dias em silêncio → (30-16)/28 = 0,5 → 17,5 de 35
    // 6 dias com lançamento em 30d → 6/12 = 0,5 → 12,5 de 25
    // 2 módulos de 4 → 0,5 → 7,5 de 15
    // só extensão manual → 0,4 → 6 de 15
    // 30 de 100 animais com evento → 0,3/0,6 = 0,5 → 5 de 10
    const score = calcularHealthScore({
      diasSemLancar: 16,
      diasComLancamento30d: 6,
      modulos90d: 2,
      cobranca: 'so-extensao',
      animaisComEvento90d: 30,
      animaisVivos: 100,
    });
    assert.deepEqual(
      score.componentes.map((c) => c.norm),
      [0.5, 0.5, 0.5, 0.4, 0.5],
    );
    assert.equal(score.total, 49);
    assert.equal(score.faixa, 'atencao');
  });

  test('faixa vira saudável a partir de 70 e atenção a partir de 40 — a fronteira pertence à faixa de cima', () => {
    assert.equal(faixaDeScore(70), 'saudavel');
    assert.equal(faixaDeScore(69), 'atencao');
    assert.equal(faixaDeScore(40), 'atencao');
    assert.equal(faixaDeScore(39), 'risco');
    assert.equal(faixaDeScore(0), 'risco');
    assert.equal(faixaDeScore(100), 'saudavel');
  });

  test('um dia a mais de silêncio derruba de saudável para atenção na fronteira 70/69', () => {
    const conta = (diasSemLancar: number): EntradaHealthScore => ({
      diasSemLancar,
      diasComLancamento30d: 12,
      modulos90d: 4,
      cobranca: 'em-dia',
      animaisComEvento90d: 0,
      animaisVivos: 100,
    });
    // 18 dias → 15 de recência + 25 + 15 + 15 + 0 = 70 cravado.
    const naFronteira = calcularHealthScore(conta(18));
    assert.equal(naFronteira.total, 70);
    assert.equal(naFronteira.faixa, 'saudavel');

    const umDiaDepois = calcularHealthScore(conta(19));
    assert.equal(umDiaDepois.total, 69);
    assert.equal(umDiaDepois.faixa, 'atencao');
  });

  test('um dia a mais de silêncio derruba de atenção para risco na fronteira 40/39', () => {
    const conta = (diasSemLancar: number): EntradaHealthScore => ({
      ...PIOR,
      diasSemLancar,
      diasComLancamento30d: 12,
    });
    const naFronteira = calcularHealthScore(conta(18));
    assert.equal(naFronteira.total, 40);
    assert.equal(naFronteira.faixa, 'atencao');

    const umDiaDepois = calcularHealthScore(conta(19));
    assert.equal(umDiaDepois.total, 39);
    assert.equal(umDiaDepois.faixa, 'risco');
  });

  test('rebanho zerado dá profundidade 0 e não NaN: o score inteiro continua um número', () => {
    // Divisão por zero aqui contamina a soma e o score some da tela sem erro nenhum.
    const score = calcularHealthScore({ ...MELHOR, animaisVivos: 0, animaisComEvento90d: 0 });
    assert.equal(Number.isFinite(score.total), true);
    assert.equal(score.total, 90); // 100 menos os 10 da profundidade
    const profundidade = score.componentes[4];
    assert.equal(profundidade.norm, 0);
    assert.equal(profundidade.detalhe, 'sem rebanho'); // não "0% do rebanho"
  });

  test('nunca lançou vale 0 em recência e diz "nunca lançou" — não é ausência de dado tratada como perfeição', () => {
    const score = calcularHealthScore({ ...MELHOR, diasSemLancar: null });
    assert.equal(score.componentes[0].norm, 0);
    assert.equal(score.componentes[0].detalhe, 'nunca lançou');
    assert.equal(score.total, 65); // 100 menos os 35 da recência
  });

  test('cortesia pontua igual a em-dia: cortesia é risco de receita, não risco de churn', () => {
    // Confundir os dois pinta de vermelho justamente as contas que nunca vão embora.
    assert.equal(norm({ ...PIOR, cobranca: 'cortesia' }, 'cobranca'), 1);
    assert.equal(
      calcularHealthScore({ ...PIOR, cobranca: 'cortesia' }).total,
      calcularHealthScore({ ...PIOR, cobranca: 'em-dia' }).total,
    );
  });

  test('a escada de cobrança é ordenada: em-dia = cortesia > só-extensão > inadimplente > sem-acesso', () => {
    const escada: EstadoCobranca[] = ['em-dia', 'cortesia', 'so-extensao', 'inadimplente', 'sem-acesso'];
    const norms = escada.map((cobranca) => norm({ ...PIOR, cobranca }, 'cobranca'));
    assert.deepEqual(norms, [1, 1, 0.4, 0.3, 0]);
  });

  test('estado de cobrança que o banco não conhece cai em sem-acesso, sem NaN e sem detalhe vazio', () => {
    // A coluna de origem é texto sem CHECK: um valor novo no banco chega aqui inteiro.
    const score = calcularHealthScore({ ...MELHOR, cobranca: 'ativa_no_asaas' as EstadoCobranca });
    assert.equal(score.componentes[3].norm, 0);
    assert.equal(score.componentes[3].detalhe, 'sem acesso');
    assert.equal(score.total, 85);
  });

  test('o detalhe de cada componente explica o número em vez de repeti-lo', () => {
    // Um score sem explicação vira superstição na primeira divergência com a intuição.
    const score = calcularHealthScore({
      diasSemLancar: 3,
      diasComLancamento30d: 7,
      modulos90d: 3,
      cobranca: 'cortesia',
      animaisComEvento90d: 45,
      animaisVivos: 100,
    });
    assert.deepEqual(
      score.componentes.map((c) => c.detalhe),
      ['há 3 dias', '7 de 12 dias', '3 de 8 módulos', 'cortesia — risco de receita, não de churn', '45% do rebanho'],
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de propriedades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Duas fazendas que DISCORDAM em cada campo. É o que faz o teste de consolidação
 * valer: se um campo sair valendo o valor de `FAZENDA_A`, o defeito nº 7 da
 * Fase 1 (`{...visoes[0], ...somas}`) voltou.
 */
const FAZENDA_A: VisaoGeralPropriedade = {
  animaisAtivos: 120,
  animaisInativos: 8,
  femeas: 100,
  machos: 20,
  lactantes: 40,
  gestantes: 12,
  mediaDel: 90,
  producao30d: 9000,
  mediaProducaoDia: 100,
  mediaPorLactanteDia: 2.5,
  lancamentos30d: 60,
  diasSemLancar: 10,
  colaboradores: 2,
  tecnicosVinculados: 1,
  porCategoria: [
    { rotulo: 'Matriz', valor: 60 },
    { rotulo: 'Cabrito', valor: 30 },
  ],
  porRaca: [{ rotulo: 'Saanen', valor: 70 }],
  piramideEtaria: [
    { rotulo: '0-6m', valor: 20 },
    { rotulo: '7-12m', valor: 30 },
    { rotulo: '13-24m', valor: 70 },
  ],
  producaoDiaria90d: [
    { periodo: '2026-09-01', valor: 100 },
    { periodo: '2026-09-02', valor: 100 },
  ],
};

const FAZENDA_B: VisaoGeralPropriedade = {
  animaisAtivos: 30,
  animaisInativos: 5,
  femeas: 25,
  machos: 5,
  lactantes: 9,
  gestantes: 3,
  mediaDel: 200,
  producao30d: 1500,
  mediaProducaoDia: 50,
  mediaPorLactanteDia: 5.5,
  lancamentos30d: 12,
  diasSemLancar: 3,
  colaboradores: 1,
  tecnicosVinculados: 4,
  porCategoria: [
    { rotulo: 'Matriz', valor: 15 },
    { rotulo: 'Reprodutor', valor: 2 },
  ],
  porRaca: [{ rotulo: 'Alpina', valor: 30 }],
  piramideEtaria: [
    { rotulo: '13-24m', valor: 10 },
    { rotulo: '0-6m', valor: 5 },
  ],
  producaoDiaria90d: [{ periodo: '2026-09-01', valor: 50 }],
};

describe('consolidarVisoes', () => {
  test('uma propriedade só sai intacta: a média de uma fazenda É a média dela', () => {
    assert.deepEqual(consolidarVisoes([FAZENDA_A]), FAZENDA_A);
  });

  test('contagem soma entre fazendas: animais, lactantes, lançamentos e equipe viram o total do cliente', () => {
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]);
    assert.equal(c.animaisAtivos, 150);
    assert.equal(c.animaisInativos, 13);
    assert.equal(c.femeas, 125);
    assert.equal(c.machos, 25);
    assert.equal(c.lactantes, 49);
    assert.equal(c.gestantes, 15);
    assert.equal(c.lancamentos30d, 72);
    assert.equal(c.colaboradores, 3);
    assert.equal(c.tecnicosVinculados, 5);
    assert.equal(c.producao30d, 10500);
  });

  test('média não se soma entre fazendas: consolidar anula em vez de tirar média de médias', () => {
    // DEL 90 e 200 não viram 145 (média de médias), nem 290 (soma), nem 90
    // (valor da primeira fazenda exibido como consolidado — o defeito de espalhamento).
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]);
    assert.equal(c.mediaDel, null);
    assert.equal(c.mediaPorLactanteDia, null);
  });

  test('a média por dia é a exceção: recalculada da série fundida, não é média de médias', () => {
    // Série fundida: 01/09 = 100+50 = 150, 02/09 = 100. Total 250 em 2 dias com dado.
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]);
    assert.equal(c.mediaProducaoDia, 125);
    assert.notEqual(c.mediaProducaoDia, 75); // média das médias (100 e 50)
    assert.notEqual(c.mediaProducaoDia, 100); // a média da primeira fazenda
  });

  test('sem nenhum dia de produção em fazenda nenhuma, a média por dia é null e não 0', () => {
    // 0 L/dia é uma afirmação sobre o rebanho; a verdade aqui é "não dá para calcular".
    const c = consolidarVisoes([
      { ...FAZENDA_A, producaoDiaria90d: [] },
      { ...FAZENDA_B, producaoDiaria90d: [] },
    ]);
    assert.equal(c.mediaProducaoDia, null);
  });

  test('dias sem lançar consolidado é o MENOR: a fazenda mais ativa manda no sinal de vida', () => {
    // Somar (13) ou herdar o da primeira (10) diria que o cliente está em silêncio
    // enquanto ele lançou anteontem na outra fazenda.
    assert.equal(consolidarVisoes([FAZENDA_A, FAZENDA_B]).diasSemLancar, 3);
    assert.equal(consolidarVisoes([FAZENDA_B, FAZENDA_A]).diasSemLancar, 3);
  });

  test('fazenda que nunca lançou não zera nem apaga o silêncio das outras', () => {
    const nunca = { ...FAZENDA_B, diasSemLancar: null };
    assert.equal(consolidarVisoes([FAZENDA_A, nunca]).diasSemLancar, 10);
    assert.equal(consolidarVisoes([nunca, FAZENDA_A]).diasSemLancar, 10);
    assert.equal(
      consolidarVisoes([{ ...FAZENDA_A, diasSemLancar: null }, nunca]).diasSemLancar,
      null,
    );
  });

  test('produção conhecida numa fazenda e ausente na outra soma o que se sabe; ausente nas duas vira null', () => {
    assert.equal(consolidarVisoes([FAZENDA_A, { ...FAZENDA_B, producao30d: null }]).producao30d, 9000);
    assert.equal(
      consolidarVisoes([
        { ...FAZENDA_A, producao30d: null },
        { ...FAZENDA_B, producao30d: null },
      ]).producao30d,
      null,
    );
  });

  test('distribuições e série se fundem por rótulo e por dia, sem perder o que só existe numa fazenda', () => {
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]);
    assert.deepEqual(c.porCategoria, [
      { rotulo: 'Matriz', valor: 75 },
      { rotulo: 'Cabrito', valor: 30 },
      { rotulo: 'Reprodutor', valor: 2 },
    ]);
    assert.deepEqual(c.porRaca, [
      { rotulo: 'Saanen', valor: 70 },
      { rotulo: 'Alpina', valor: 30 },
    ]);
    assert.deepEqual(c.piramideEtaria, [
      { rotulo: '0-6m', valor: 25 },
      { rotulo: '7-12m', valor: 30 },
      { rotulo: '13-24m', valor: 80 },
    ]);
    assert.deepEqual(c.producaoDiaria90d, [
      { periodo: '2026-09-01', valor: 150 },
      { periodo: '2026-09-02', valor: 100 },
    ]);
  });

  test('nenhum campo do consolidado é herdado da primeira fazenda', () => {
    // O teste que pega o defeito de espalhamento: com duas fazendas que discordam
    // em TODO campo, nenhum valor consolidado pode coincidir com o de FAZENDA_A.
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]) as unknown as Record<string, unknown>;
    const primeira = FAZENDA_A as unknown as Record<string, unknown>;
    for (const chave of Object.keys(primeira)) {
      assert.notDeepEqual(
        c[chave],
        primeira[chave],
        `campo "${chave}" saiu valendo o valor da primeira propriedade`,
      );
    }
  });

  test('todo campo da visão aparece no consolidado — campo novo não pode ficar de fora', () => {
    // Sem isto, uma coluna acrescentada à visão passa a chegar `undefined` na tela
    // consolidada e vira "0" no formatador, calada.
    const c = consolidarVisoes([FAZENDA_A, FAZENDA_B]);
    assert.deepEqual(Object.keys(c).sort(), Object.keys(FAZENDA_A).sort());
  });

  test('consolidar não muda a ordem de chegada dos rótulos: a primeira fazenda define as faixas', () => {
    // A pirâmide vem cronológica do SQL; reordenar por volume desenha uma
    // distribuição etária que não existe.
    const c = consolidarVisoes([FAZENDA_B, FAZENDA_A]);
    assert.deepEqual(
      c.piramideEtaria.map((f) => f.rotulo),
      ['13-24m', '0-6m', '7-12m'],
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Fusão de fatias e séries
// ─────────────────────────────────────────────────────────────────────────────

describe('fundirFatias', () => {
  test('soma valores de mesmo rótulo e mantém a ordem da primeira aparição', () => {
    assert.deepEqual(
      fundirFatias([
        { rotulo: 'Saanen', valor: 70 },
        { rotulo: 'Alpina', valor: 30 },
        { rotulo: 'Saanen', valor: 5 },
      ]),
      [
        { rotulo: 'Saanen', valor: 75 },
        { rotulo: 'Alpina', valor: 30 },
      ],
    );
  });

  test('listas disjuntas preservam as duas: fundir não é interseção', () => {
    const fundida = fundirFatias([
      { rotulo: 'Saanen', valor: 70 },
      { rotulo: 'Alpina', valor: 30 },
    ]);
    assert.equal(fundida.length, 2);
    assert.equal(
      fundida.reduce((acc, f) => acc + f.valor, 0),
      100,
    );
  });

  test('rótulo com valor 0 sobrevive à fusão: zero é um dado, não uma ausência', () => {
    assert.deepEqual(fundirFatias([{ rotulo: 'Reprodutor', valor: 0 }]), [
      { rotulo: 'Reprodutor', valor: 0 },
    ]);
  });

  test('lista vazia funde em lista vazia', () => {
    assert.deepEqual(fundirFatias([]), []);
  });
});

describe('fundirSerie', () => {
  test('soma pontos do mesmo período e devolve a série em ordem cronológica', () => {
    assert.deepEqual(
      fundirSerie([
        { periodo: '2026-09-03', valor: 10 },
        { periodo: '2026-09-01', valor: 100 },
        { periodo: '2026-09-01', valor: 50 },
      ]),
      [
        { periodo: '2026-09-01', valor: 150 },
        { periodo: '2026-09-03', valor: 10 },
      ],
    );
  });

  test('ordena por período mesmo na virada de ano, com a entrada fora de ordem', () => {
    assert.deepEqual(
      fundirSerie([
        { periodo: '2026-01-01', valor: 1 },
        { periodo: '2025-12-31', valor: 2 },
      ]).map((p) => p.periodo),
      ['2025-12-31', '2026-01-01'],
    );
  });

  test('séries de dias disjuntos preservam os dois lados', () => {
    const fundida = fundirSerie([
      { periodo: '2026-09-01', valor: 100 },
      { periodo: '2026-09-02', valor: 80 },
    ]);
    assert.deepEqual(fundida, [
      { periodo: '2026-09-01', valor: 100 },
      { periodo: '2026-09-02', valor: 80 },
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Períodos e preenchimento de série
// ─────────────────────────────────────────────────────────────────────────────

describe('mesesAte', () => {
  test('devolve a quantidade pedida de meses em ordem crescente, terminando no mês de "ate"', () => {
    const meses = mesesAte(12, '2026-09-05');
    assert.equal(meses.length, 12);
    assert.equal(meses[0], '2025-10');
    assert.equal(meses.at(-1), '2026-09');
    assert.deepEqual([...meses].sort(), meses); // já vem crescente
  });

  test('atravessa a virada de ano sem inventar mês 0 nem mês 13', () => {
    assert.deepEqual(mesesAte(3, '2026-01-15'), ['2025-11', '2025-12', '2026-01']);
    assert.deepEqual(mesesAte(1, '2026-01-01'), ['2026-01']);
    assert.deepEqual(mesesAte(2, '2026-12-31'), ['2026-11', '2026-12']);
  });

  test('23h de Brasília no dia 31/12 ainda é dezembro: o mês é o de São Paulo, não o do UTC', () => {
    // 01/01/2026 02:00 UTC = 31/12/2025 23:00 em São Paulo.
    assert.deepEqual(mesesAte(1, new Date('2026-01-01T02:00:00Z')), ['2025-12']);
  });

  test('quantidade não positiva e data inválida devolvem lista vazia, não uma janela errada', () => {
    assert.deepEqual(mesesAte(0, '2026-09-05'), []);
    assert.deepEqual(mesesAte(-3, '2026-09-05'), []);
    assert.deepEqual(mesesAte(6, 'sem data'), []);
  });
});

describe('diasAte', () => {
  test('devolve a quantidade pedida de dias em ordem crescente, terminando em "ate"', () => {
    const dias = diasAte(7, '2026-03-03');
    assert.equal(dias.length, 7);
    assert.deepEqual(dias, [
      '2026-02-25',
      '2026-02-26',
      '2026-02-27',
      '2026-02-28',
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
    ]);
  });

  test('atravessa a virada de ano contando dias reais', () => {
    assert.deepEqual(diasAte(3, '2026-01-01'), ['2025-12-30', '2025-12-31', '2026-01-01']);
  });

  test('data pura "YYYY-MM-DD" não perde um dia ao virar janela', () => {
    // O bug clássico do schema: '2026-03-01' passado por new Date() vira
    // 28/02 em São Paulo. Data pura é texto e tem que passar intacta.
    assert.deepEqual(diasAte(1, '2026-03-01'), ['2026-03-01']);
  });

  test('23h de Brasília pertence ao dia de Brasília, não ao dia seguinte do UTC', () => {
    assert.deepEqual(diasAte(1, new Date('2026-01-01T02:00:00Z')), ['2025-12-31']);
    assert.deepEqual(diasAte(2, new Date('2026-01-01T02:00:00Z')), ['2025-12-30', '2025-12-31']);
  });

  test('quantidade não positiva e data inválida devolvem lista vazia', () => {
    assert.deepEqual(diasAte(0, '2026-09-05'), []);
    assert.deepEqual(diasAte(30, 'sem data'), []);
  });
});

describe('preencherSerie', () => {
  test('período sem linha no GROUP BY vira 0 explícito, para o gráfico não pular de março a maio', () => {
    assert.deepEqual(
      preencherSerie([{ periodo: '2026-03', valor: 12 }], ['2026-03', '2026-04', '2026-05']),
      [
        { periodo: '2026-03', valor: 12 },
        { periodo: '2026-04', valor: 0 },
        { periodo: '2026-05', valor: 0 },
      ],
    );
  });

  test('a janela manda no tamanho e na ordem: ponto fora dela é descartado', () => {
    // Sem isso um ponto antigo entraria no fim da série e o gráfico voltaria no tempo.
    const preenchida = preencherSerie(
      [
        { periodo: '2025-01', valor: 999 },
        { periodo: '2026-04', valor: 7 },
      ],
      ['2026-03', '2026-04'],
    );
    assert.deepEqual(preenchida, [
      { periodo: '2026-03', valor: 0 },
      { periodo: '2026-04', valor: 7 },
    ]);
  });

  test('zero medido e zero preenchido têm o mesmo valor — a lacuna some de propósito nessa série', () => {
    // Documenta o limite: preencherSerie é para série de CONTAGEM. Série de
    // MEDIÇÃO (produção diária) fica esparsa, porque a lacuna é a informação.
    assert.deepEqual(preencherSerie([{ periodo: '2026-03', valor: 0 }], ['2026-03']), [
      { periodo: '2026-03', valor: 0 },
    ]);
  });

  test('sem nenhum ponto, devolve a janela inteira zerada e do tamanho pedido', () => {
    assert.deepEqual(preencherSerie([], ['2026-03', '2026-04']), [
      { periodo: '2026-03', valor: 0 },
      { periodo: '2026-04', valor: 0 },
    ]);
  });
});

describe('preencherMeses / preencherDias', () => {
  test('mês sem receita no meio da janela aparece como 0 e não some do eixo', () => {
    assert.deepEqual(
      preencherMeses(
        [
          { periodo: '2026-01', valor: 5 },
          { periodo: '2026-03', valor: 9 },
        ],
        3,
        '2026-03-10',
      ),
      [
        { periodo: '2026-01', valor: 5 },
        { periodo: '2026-02', valor: 0 },
        { periodo: '2026-03', valor: 9 },
      ],
    );
  });

  test('a janela diária respeita o dia civil de São Paulo do instante recebido', () => {
    assert.deepEqual(preencherDias([{ periodo: '2025-12-31', valor: 4 }], 2, new Date('2026-01-01T02:00:00Z')), [
      { periodo: '2025-12-30', valor: 0 },
      { periodo: '2025-12-31', valor: 4 },
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vizinhos diretos da consolidação — mesma família de defeito
// ─────────────────────────────────────────────────────────────────────────────

describe('scoreConsolidado', () => {
  test('score de consultor é mediana, não soma nem média: um cliente morto não some dentro de seis vivos', () => {
    // Média de [90, 10, 12] é 37 e some com o fato de dois dos três estarem mortos.
    assert.equal(scoreConsolidado([90, 10, 12]), 12);
    assert.equal(scoreConsolidado([80, 20]), 50);
    assert.equal(scoreConsolidado([70]), 70);
  });

  test('consultor sem nenhum cliente pontuável não vira 0 — vira null', () => {
    assert.equal(scoreConsolidado([]), null);
    assert.equal(scoreConsolidado([null, undefined]), null);
  });
});

describe('variacaoPercentual', () => {
  test('sair de zero não é "+500%": sem base de comparação, a variação é null', () => {
    assert.equal(variacaoPercentual(5, 0), null);
  });

  test('variação vem como fração com sinal e sobrevive à queda a zero', () => {
    assert.equal(variacaoPercentual(12, 10), 0.2);
    assert.equal(variacaoPercentual(0, 5), -1);
  });
});

describe('mrrDeAssinatura', () => {
  test('assinatura anual entra pelo valor mensal: o campo promocional guarda o ANO quando o ciclo é anual', () => {
    // Somar direto superestima o assinante anual em ~12× — o defeito nº 2 do MRR.
    assert.equal(
      mrrDeAssinatura({
        ciclo: 'anual',
        valorMensalPromocional: 1200,
        planoValorMensal: 150,
        planoValorAnual: 1530,
        dataVencimento: '2027-01-01',
        statusEfetivo: 'ativa',
        acessoAtivo: true,
      }),
      100,
    );
  });

  test('cortesia até 2099 rende R$ 0 de receita recorrente, por mais ativa que a conta esteja', () => {
    assert.equal(
      mrrDeAssinatura({
        ciclo: 'mensal',
        valorMensalPromocional: 150,
        planoValorMensal: 150,
        planoValorAnual: null,
        dataVencimento: '2099-12-31',
        statusEfetivo: 'ativa',
        acessoAtivo: true,
      }),
      0,
    );
  });

  test('trial com acesso vigente ainda não é receita recorrente', () => {
    assert.equal(
      mrrDeAssinatura({
        ciclo: 'mensal',
        valorMensalPromocional: 150,
        planoValorMensal: 150,
        planoValorAnual: null,
        dataVencimento: '2026-10-01',
        statusEfetivo: 'trial',
        acessoAtivo: true,
      }),
      0,
    );
  });
  // ── O RAMO MENSAL, que é a maioria da carteira ───────────────────────────
  //
  // Os três testes originais cobriam anual, cortesia e trial — todos os três
  // afirmando ZERO ou o caminho anual. Se o `else` de mrrDeAssinatura passasse
  // a devolver 0, os três continuavam verdes e o MRR da carteira inteira ia a
  // R$ 0,00 sem nenhum teste acusar. Estes fecham o buraco.

  test('assinatura mensal ativa entra no MRR pelo valor mensal do plano', () => {
    assert.equal(
      mrrDeAssinatura({
        acessoAtivo: true,
        statusEfetivo: 'ativa',
        ciclo: 'mensal',
        dataVencimento: '2026-12-01T00:00:00Z',
        valorMensalPromocional: null,
        planoValorMensal: 75,
        planoValorAnual: 765,
      }),
      75,
    );
  });

  test('mensal com preço promocional congelado usa o promocional, não o de tabela', () => {
    assert.equal(
      mrrDeAssinatura({
        acessoAtivo: true,
        statusEfetivo: 'ativa',
        ciclo: 'mensal',
        dataVencimento: '2026-12-01T00:00:00Z',
        valorMensalPromocional: 60,
        planoValorMensal: 75,
        planoValorAnual: 765,
      }),
      60,
    );
  });

  test('anual SEM promocional cai no valor anual do plano dividido por 12', () => {
    // O caso que o defeito original escondia: `valor_mensal_promocional` guarda
    // o valor ANUAL quando o ciclo é anual, então o fallback tem que ser
    // planoValorAnual/12 — e não planoValorMensal.
    assert.equal(
      mrrDeAssinatura({
        acessoAtivo: true,
        statusEfetivo: 'ativa',
        ciclo: 'anual',
        dataVencimento: '2026-12-01T00:00:00Z',
        valorMensalPromocional: null,
        planoValorMensal: 75,
        planoValorAnual: 765,
      }),
      765 / 12,
    );
  });

  test('sem valor nenhum devolve 0 em vez de NaN', () => {
    assert.equal(
      mrrDeAssinatura({
        acessoAtivo: true,
        statusEfetivo: 'ativa',
        ciclo: 'mensal',
        dataVencimento: '2026-12-01T00:00:00Z',
        valorMensalPromocional: null,
        planoValorMensal: null,
        planoValorAnual: null,
      }),
      0,
    );
  });

});
