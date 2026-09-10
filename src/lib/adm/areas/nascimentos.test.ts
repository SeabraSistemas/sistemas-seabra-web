/**
 * NASCIMENTOS — ninhada, peso e parto.
 *
 * As três regras que este arquivo protege:
 *
 *   · PARTO É O PAR (mãe, dia). Não existe tabela de parto; a ninhada inteira é
 *     um parto só, e contar crias como partos triplicaria a prolificidade.
 *   · CRIA SEM MÃE NÃO É CRIA ÚNICA. Sem mãe não se sabe a ninhada, e chutar "1"
 *     jogaria o cadastro pior no grupo de maior peso esperado.
 *   · PESO AO NASCER VEM SUJO: 237 valores ≤ 0 e 27 acima de 10 kg, um deles com
 *     408 kg. Nenhum deles pode entrar numa média.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PESO_NASCER_MAXIMO_KG,
  distribuicaoPeso,
  inicioDoPeriodo,
  lerPeriodo,
  maesMaisProlificas,
  pesoUtilizavel,
  porNinhada,
  resumoNascimentos,
  serieNascimentos,
} from '@/lib/adm/areas/nascimentos';
import type { LinhaNascimento } from '@/lib/adm/areas/contrato';

function cria(parcial: Partial<LinhaNascimento> & { animal_id: number }): LinhaNascimento {
  return {
    propriedade_id: 1,
    numero_animal: String(parcial.animal_id),
    nome_animal: null,
    sexo: 'fêmea',
    status: 'ativo',
    data_nascimento: '2026-03-10',
    peso_ao_nascer: 3.5,
    origem: 'nascido',
    mae_id: 100,
    mae_numero: '100',
    mae_nome: null,
    pai_id: null,
    ninhada: 1,
    data_obito: null,
    idade_ao_morrer: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

test('lerPeriodo e inicioDoPeriodo: valor de fora cai no padrão; "tudo" não tem corte', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  assert.equal(lerPeriodo('24m'), '24m');
  assert.equal(lerPeriodo('decada'), '12m');
  assert.equal(inicioDoPeriodo('tudo', hoje), null);
  assert.equal(inicioDoPeriodo('ano', hoje), '2026-01-01');
  assert.equal(inicioDoPeriodo('12m', hoje), '2025-09-10');
});

// ─────────────────────────────────────────────────────────────────────────────
// Peso
// ─────────────────────────────────────────────────────────────────────────────

test('pesoUtilizavel: recusa zero, negativo e o boi de 408 kg', () => {
  assert.equal(pesoUtilizavel(cria({ animal_id: 1, peso_ao_nascer: 3.5 })), true);
  assert.equal(pesoUtilizavel(cria({ animal_id: 2, peso_ao_nascer: 0 })), false);
  assert.equal(pesoUtilizavel(cria({ animal_id: 3, peso_ao_nascer: -1 })), false);
  assert.equal(pesoUtilizavel(cria({ animal_id: 4, peso_ao_nascer: 408 })), false);
  assert.equal(pesoUtilizavel(cria({ animal_id: 5, peso_ao_nascer: null })), false);
  assert.equal(
    pesoUtilizavel(cria({ animal_id: 6, peso_ao_nascer: PESO_NASCER_MAXIMO_KG })),
    true,
    'o teto é inclusivo',
  );
});

test('distribuicaoPeso: as seis faixas saem sempre e a borda é fechada em cima', () => {
  const faixas = distribuicaoPeso([
    cria({ animal_id: 1, peso_ao_nascer: 2 }),
    cria({ animal_id: 2, peso_ao_nascer: 2.01 }),
  ]);

  assert.equal(faixas.length, 6);
  assert.equal(faixas.find((f) => f.rotulo === 'até 2,0 kg')?.crias, 1);
  assert.equal(faixas.find((f) => f.rotulo === '2,01 a 2,5')?.crias, 1);
});

test('distribuicaoPeso: peso impossível não entra nem no denominador', () => {
  const faixas = distribuicaoPeso([
    cria({ animal_id: 1, peso_ao_nascer: 3 }),
    cria({ animal_id: 2, peso_ao_nascer: 408 }),
  ]);

  assert.equal(faixas.find((f) => f.rotulo === '2,51 a 3,0')?.fracao, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Parto e prolificidade
// ─────────────────────────────────────────────────────────────────────────────

test('resumoNascimentos: a ninhada inteira é UM parto — par (mãe, dia)', () => {
  const resumo = resumoNascimentos([
    cria({ animal_id: 1, mae_id: 100, data_nascimento: '2026-03-10' }),
    cria({ animal_id: 2, mae_id: 100, data_nascimento: '2026-03-10' }),
    cria({ animal_id: 3, mae_id: 200, data_nascimento: '2026-03-10' }),
  ]);

  assert.equal(resumo.crias, 3);
  assert.equal(resumo.partos, 2, 'duas mães pariram, não três crias');
  assert.equal(resumo.prolificidade, 1.5);
});

test('resumoNascimentos: cria sem mãe fica fora da prolificidade e é contada à parte', () => {
  const resumo = resumoNascimentos([
    cria({ animal_id: 1, mae_id: 100 }),
    cria({ animal_id: 2, mae_id: null, mae_numero: null }),
  ]);

  assert.equal(resumo.crias, 2);
  assert.equal(resumo.partos, 1);
  assert.equal(resumo.prolificidade, 1, 'uma cria com mãe sobre um parto');
  assert.equal(resumo.semMae, 1);
});

test('resumoNascimentos: peso médio ignora os impossíveis e diz sobre quantos foi feito', () => {
  const resumo = resumoNascimentos([
    cria({ animal_id: 1, peso_ao_nascer: 3 }),
    cria({ animal_id: 2, peso_ao_nascer: 4 }),
    cria({ animal_id: 3, peso_ao_nascer: 408 }),
    cria({ animal_id: 4, peso_ao_nascer: 0 }),
  ]);

  assert.equal(resumo.pesoMedio, 3.5);
  assert.equal(resumo.comPeso, 2);
  assert.equal(resumo.pesoImplausivel, 2);
});

test('resumoNascimentos: separa morte total de morte até 30 dias', () => {
  const resumo = resumoNascimentos([
    cria({ animal_id: 1, data_obito: '2026-03-20', idade_ao_morrer: 10 }),
    cria({ animal_id: 2, data_obito: '2026-12-20', idade_ao_morrer: 285 }),
    cria({ animal_id: 3 }),
  ]);

  assert.equal(resumo.mortas, 2);
  assert.equal(resumo.mortasNeonatal, 1);
});

test('resumoNascimentos: período sem cria não vira NaN', () => {
  const resumo = resumoNascimentos([]);
  assert.equal(resumo.crias, 0);
  assert.equal(resumo.partos, 0);
  assert.equal(resumo.prolificidade, null);
  assert.equal(resumo.pesoMedio, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Ninhada — a leitura central
// ─────────────────────────────────────────────────────────────────────────────

test('porNinhada: separa única de gemelar e calcula peso de cada grupo', () => {
  const grupos = porNinhada([
    cria({ animal_id: 1, ninhada: 1, peso_ao_nascer: 4 }),
    cria({ animal_id: 2, ninhada: 2, mae_id: 200, peso_ao_nascer: 3 }),
    cria({ animal_id: 3, ninhada: 2, mae_id: 200, peso_ao_nascer: 3 }),
  ]);

  assert.deepEqual(
    grupos.map((g) => g.rotulo),
    ['Cria única', '2 crias'],
  );
  assert.equal(grupos[0].pesoMedio, 4);
  assert.equal(grupos[1].pesoMedio, 3);
  assert.equal(grupos[1].partos, 1, 'as duas gemelares vieram de um parto só');
});

test('porNinhada: da quarta cria em diante vira um grupo só', () => {
  const grupos = porNinhada([
    cria({ animal_id: 1, ninhada: 4 }),
    cria({ animal_id: 2, ninhada: 6 }),
  ]);

  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].rotulo, '4 ou mais');
  assert.equal(grupos[0].crias, 2);
});

test('porNinhada: cria SEM ninhada conhecida fica fora — não vira "única"', () => {
  const grupos = porNinhada([
    cria({ animal_id: 1, ninhada: null, mae_id: null }),
    cria({ animal_id: 2, ninhada: 1 }),
  ]);

  assert.equal(grupos.length, 1);
  assert.equal(grupos[0].crias, 1);
});

test('porNinhada: mortalidade é por grupo, sobre as crias daquele grupo', () => {
  const grupos = porNinhada([
    cria({ animal_id: 1, ninhada: 2, mae_id: 200, data_obito: '2026-04-01' }),
    cria({ animal_id: 2, ninhada: 2, mae_id: 200 }),
  ]);

  assert.equal(grupos[0].mortalidade, 0.5);
});

// ─────────────────────────────────────────────────────────────────────────────
// Série e mães
// ─────────────────────────────────────────────────────────────────────────────

test('serieNascimentos: agrupa por mês, em ordem cronológica', () => {
  const serie = serieNascimentos([
    cria({ animal_id: 1, data_nascimento: '2026-03-10' }),
    cria({ animal_id: 2, data_nascimento: '2026-03-28' }),
    cria({ animal_id: 3, data_nascimento: '2026-01-05' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-03', valor: 2 },
  ]);
});

test('maesMaisProlificas: conta partos distintos da mãe, não crias, e ordena por crias', () => {
  const maes = maesMaisProlificas([
    cria({ animal_id: 1, mae_id: 100, mae_numero: '100', data_nascimento: '2025-01-10' }),
    cria({ animal_id: 2, mae_id: 100, mae_numero: '100', data_nascimento: '2026-03-10' }),
    cria({ animal_id: 3, mae_id: 100, mae_numero: '100', data_nascimento: '2026-03-10' }),
    cria({ animal_id: 4, mae_id: 200, mae_numero: '200' }),
  ]);

  assert.equal(maes[0].numero, '100');
  assert.equal(maes[0].crias, 3);
  assert.equal(maes[0].partos, 2);
  assert.equal(maes[0].prolificidade, 1.5);
});

test('maesMaisProlificas: cria sem mãe não inventa uma matriz', () => {
  assert.deepEqual(maesMaisProlificas([cria({ animal_id: 1, mae_id: null })]), []);
});
