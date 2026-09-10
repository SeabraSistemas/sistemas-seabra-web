/**
 * LACTAÇÕES — as regras que separam número medido de número deduzido.
 *
 * As três que este arquivo protege:
 *
 *   · LACTAÇÃO ABERTA NÃO ENTRA EM MÉDIA DE TOTAL. Ela ainda não acumulou; a que
 *     começou ontem tem 0 L, e deixá-la entrar puxa a média da fazenda para
 *     baixo dizendo que a produção caiu.
 *   · MASSA SINTÉTICA SAI DE TUDO. 1.500 lactações se declaram teste no próprio
 *     dado.
 *   · DIAS <= 0 E DIAS ABSURDOS NÃO SÃO DURAÇÃO. A base tem 1.418 com valor não
 *     positivo (min -59) e 119 acima de 600 dias (max 3.593).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DURACAO_IMPLAUSIVEL,
  distribuicaoDuracao,
  melhoresLactacoes,
  porOrdemParto,
  procedencias,
  resumoLactacoes,
  separarSinteticas,
  serieInicios,
} from '@/lib/adm/areas/lactacoes';
import type { LinhaLactacao } from '@/lib/adm/areas/contrato';

function lactacao(parcial: Partial<LinhaLactacao> & { lactacao_id: number }): LinhaLactacao {
  const aberta = parcial.aberta ?? false;
  return {
    propriedade_id: 1,
    animal_id: parcial.lactacao_id,
    numero_animal: String(parcial.lactacao_id),
    nome_animal: null,
    ordem_parto: 2,
    data_inicio: '2026-01-10',
    data_encerramento: aberta ? null : '2026-08-10',
    aberta,
    dias: 210,
    total_leite: 400,
    media_leite: 1.9,
    confianca: 'DEFINITIVO',
    metodo: 'DEFINITIVO_FILHO',
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Massa sintética
// ─────────────────────────────────────────────────────────────────────────────

test('separarSinteticas: obedece ao rótulo do próprio dado, sem inferir nada', () => {
  const { reais, sinteticas } = separarSinteticas([
    lactacao({ lactacao_id: 1 }),
    lactacao({ lactacao_id: 2, confianca: 'sintetico', metodo: 'teste_paginacao_20260821' }),
  ]);

  assert.deepEqual(
    reais.map((l) => l.lactacao_id),
    [1],
  );
  assert.equal(sinteticas.length, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoLactacoes: lactação ABERTA conta no total mas fica fora das médias', () => {
  const resumo = resumoLactacoes([
    lactacao({ lactacao_id: 1, aberta: false, dias: 200, total_leite: 400 }),
    // A que começou ontem: 0 dias, 0 L. Se entrasse, a média cairia pela metade.
    lactacao({ lactacao_id: 2, aberta: true, dias: 0, total_leite: 0, media_leite: null }),
  ]);

  assert.equal(resumo.total, 2);
  assert.equal(resumo.abertas, 1);
  assert.equal(resumo.encerradas, 1);
  assert.equal(resumo.duracaoMedia, 200);
  assert.equal(resumo.totalMedio, 400);
  assert.equal(resumo.comTotal, 1, 'o denominador diz sobre quantas a média foi feita');
});

test('resumoLactacoes: duração não positiva fica fora da média', () => {
  const resumo = resumoLactacoes([
    lactacao({ lactacao_id: 1, dias: 200 }),
    lactacao({ lactacao_id: 2, dias: 0 }),
    lactacao({ lactacao_id: 3, dias: -59 }),
  ]);

  assert.equal(resumo.duracaoMedia, 200);
  assert.equal(resumo.comDuracao, 1);
});

test('resumoLactacoes: duração implausível é contada à parte e não entra na média', () => {
  const resumo = resumoLactacoes([
    lactacao({ lactacao_id: 1, dias: 300 }),
    lactacao({ lactacao_id: 2, dias: 3593 }),
  ]);

  assert.equal(resumo.duracaoMedia, 300);
  assert.equal(resumo.duracaoImplausivel, 1);
  assert.ok(DURACAO_IMPLAUSIVEL === 600);
});

test('resumoLactacoes: lactação encerrada com total zero não vira "produziu zero"', () => {
  const resumo = resumoLactacoes([
    lactacao({ lactacao_id: 1, total_leite: 500 }),
    lactacao({ lactacao_id: 2, total_leite: 0 }),
  ]);

  assert.equal(resumo.totalMedio, 500, 'e não 250');
  assert.equal(resumo.comTotal, 1);
});

test('resumoLactacoes: fração definitiva é sobre TODAS as lactações do recorte', () => {
  const resumo = resumoLactacoes([
    lactacao({ lactacao_id: 1, confianca: 'DEFINITIVO' }),
    lactacao({ lactacao_id: 2, confianca: 'INFERIDO' }),
    lactacao({ lactacao_id: 3, confianca: null }),
  ]);

  assert.ok(Math.abs((resumo.fracaoDefinitiva ?? 0) - 1 / 3) < 1e-9);
});

test('resumoLactacoes: fazenda sem lactação não vira NaN', () => {
  const resumo = resumoLactacoes([]);
  assert.equal(resumo.total, 0);
  assert.equal(resumo.duracaoMedia, null);
  assert.equal(resumo.totalMedio, null);
  assert.equal(resumo.fracaoDefinitiva, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Procedência
// ─────────────────────────────────────────────────────────────────────────────

test('procedencias: as quatro categorias sempre saem, e somam o total', () => {
  const lista = procedencias([
    lactacao({ lactacao_id: 1, confianca: 'DEFINITIVO' }),
    lactacao({ lactacao_id: 2, confianca: 'INFERIDO' }),
    lactacao({ lactacao_id: 3, confianca: 'ESTIMATIVA' }),
    lactacao({ lactacao_id: 4, confianca: null }),
  ]);

  assert.equal(lista.length, 4);
  assert.equal(
    lista.reduce((acc, p) => acc + p.lactacoes, 0),
    4,
  );
  assert.equal(lista.find((p) => p.chave === 'nao_informado')?.lactacoes, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Duração
// ─────────────────────────────────────────────────────────────────────────────

test('distribuicaoDuracao: as seis faixas saem sempre, com a régua de 305 dias no fim', () => {
  const faixas = distribuicaoDuracao([lactacao({ lactacao_id: 1, dias: 200 })]);
  assert.equal(faixas.length, 6);
  assert.equal(faixas[faixas.length - 1].rotulo, 'acima de 305');
});

test('distribuicaoDuracao: as bordas são fechadas em cima — 305 na penúltima, 306 na última', () => {
  const faixas = distribuicaoDuracao([
    lactacao({ lactacao_id: 1, dias: 305 }),
    lactacao({ lactacao_id: 2, dias: 306 }),
  ]);

  assert.equal(faixas.find((f) => f.rotulo === '271 a 305')?.lactacoes, 1);
  assert.equal(faixas.find((f) => f.rotulo === 'acima de 305')?.lactacoes, 1);
});

test('distribuicaoDuracao: aberta, não positiva e implausível ficam fora do histograma', () => {
  const faixas = distribuicaoDuracao([
    lactacao({ lactacao_id: 1, dias: 100 }),
    lactacao({ lactacao_id: 2, dias: 100, aberta: true }),
    lactacao({ lactacao_id: 3, dias: -5 }),
    lactacao({ lactacao_id: 4, dias: 900 }),
  ]);

  assert.equal(
    faixas.reduce((acc, f) => acc + f.lactacoes, 0),
    1,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Ordem de parto
// ─────────────────────────────────────────────────────────────────────────────

test('porOrdemParto: da 4ª em diante tudo vira um grupo só', () => {
  const ordens = porOrdemParto([
    lactacao({ lactacao_id: 1, ordem_parto: 1 }),
    lactacao({ lactacao_id: 2, ordem_parto: 4 }),
    lactacao({ lactacao_id: 3, ordem_parto: 9 }),
  ]);

  assert.deepEqual(
    ordens.map((o) => o.rotulo),
    ['1ª cria', '4ª ou mais'],
  );
  assert.equal(ordens[1].lactacoes, 2);
});

test('porOrdemParto: ordena da primeira cria para a última, e ignora as abertas', () => {
  const ordens = porOrdemParto([
    lactacao({ lactacao_id: 1, ordem_parto: 3 }),
    lactacao({ lactacao_id: 2, ordem_parto: 1 }),
    lactacao({ lactacao_id: 3, ordem_parto: 2, aberta: true }),
  ]);

  assert.deepEqual(
    ordens.map((o) => o.ordem),
    [1, 3],
  );
});

test('porOrdemParto: lactação sem ordem de parto não inventa um grupo "0ª"', () => {
  const ordens = porOrdemParto([lactacao({ lactacao_id: 1, ordem_parto: null })]);
  assert.deepEqual(ordens, []);
});

// ─────────────────────────────────────────────────────────────────────────────
// Ranking e série
// ─────────────────────────────────────────────────────────────────────────────

test('melhoresLactacoes: só encerradas com produção, maior primeiro, empate pelo animal', () => {
  const melhores = melhoresLactacoes([
    lactacao({ lactacao_id: 1, numero_animal: '200', total_leite: 500 }),
    lactacao({ lactacao_id: 2, numero_animal: '100', total_leite: 500 }),
    lactacao({ lactacao_id: 3, numero_animal: '300', total_leite: 900, aberta: true }),
    lactacao({ lactacao_id: 4, numero_animal: '400', total_leite: 0 }),
  ]);

  assert.deepEqual(
    melhores.map((l) => l.numero_animal),
    ['100', '200'],
  );
});

test('melhoresLactacoes: lactação de três anos NÃO é a melhor do rebanho — é uma que ninguém fechou', () => {
  // Regressão pega no dado real: sem o filtro de duração plausível, o pódio da
  // fazenda 244 vinha com 4.900 L em 1.125 dias, empurrando para fora a fêmea
  // que de fato produziu muito numa lactação.
  const melhores = melhoresLactacoes([
    lactacao({ lactacao_id: 1, numero_animal: '10', total_leite: 4900, dias: 1125 }),
    lactacao({ lactacao_id: 2, numero_animal: '20', total_leite: 900, dias: 300 }),
  ]);

  assert.deepEqual(
    melhores.map((l) => l.numero_animal),
    ['20'],
  );
});

test('melhoresLactacoes: sem duração conhecida fica fora — "melhor lactação" precisa ser uma lactação', () => {
  const melhores = melhoresLactacoes([lactacao({ lactacao_id: 1, total_leite: 900, dias: null })]);
  assert.deepEqual(melhores, []);
});

test('melhoresLactacoes: não mexe no array recebido', () => {
  const lista = [
    lactacao({ lactacao_id: 1, total_leite: 100 }),
    lactacao({ lactacao_id: 2, total_leite: 900 }),
  ];
  const antes = lista.map((l) => l.lactacao_id);
  melhoresLactacoes(lista);
  assert.deepEqual(
    lista.map((l) => l.lactacao_id),
    antes,
  );
});

test('serieInicios: agrupa por mês de início, em ordem cronológica', () => {
  const serie = serieInicios([
    lactacao({ lactacao_id: 1, data_inicio: '2026-03-02' }),
    lactacao({ lactacao_id: 2, data_inicio: '2026-03-20' }),
    lactacao({ lactacao_id: 3, data_inicio: '2026-01-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-03', valor: 2 },
  ]);
});
