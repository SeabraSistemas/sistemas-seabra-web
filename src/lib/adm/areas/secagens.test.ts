/**
 * SECAGEM — o período seco, que não existe em coluna nenhuma do app.
 *
 * `secagem.del` está preenchida em 33% das linhas e tem máximo de 20.617 dias —
 * 56 anos de lactação. O número desta tela é calculado: dias entre a secagem e o
 * parto seguinte da mesma fêmea.
 *
 * As regras que este arquivo protege:
 *   · SECAGEM NÃO CONFIRMADA É PREVISÃO, não evento — contá-la como feita diria
 *     que a fazenda secou o que ela só planejou;
 *   · SECAGEM SEM PARTO POSTERIOR não tem período seco, e isso é o normal para a
 *     secagem recente — não é dado faltando;
 *   · acima de 200 dias não é descanso, é fêmea que passou uma estação sem
 *     parir, e entra na média como ruído.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERIODO_SECO_MAXIMO,
  faixasDePeriodo,
  maisCurtas,
  normalizarTipo,
  periodoUtilizavel,
  porTipo,
  resumoSecagens,
  serieSecagens,
} from '@/lib/adm/areas/secagens';
import type { LinhaSecagem } from '@/lib/adm/areas/contrato';

function secagem(parcial: Partial<LinhaSecagem> & { secagem_id: number }): LinhaSecagem {
  return {
    propriedade_id: 1,
    animal_id: parcial.secagem_id,
    numero_animal: String(parcial.secagem_id),
    nome_animal: null,
    categoria: 'Seca',
    ordem_parto: 2,
    data_secagem: '2026-05-01',
    tipo_secagem: 'Natural',
    confirmada: true,
    proximo_parto: '2026-07-01',
    periodo_seco: 61,
    observacao: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipo
// ─────────────────────────────────────────────────────────────────────────────

test('normalizarTipo: "Natural" e "natural" viram o mesmo grupo', () => {
  assert.equal(normalizarTipo('Natural'), 'Natural');
  assert.equal(normalizarTipo('natural'), 'Natural');
  assert.equal(normalizarTipo('  MANUAL '), 'Manual');
});

test('normalizarTipo: tipo desconhecido NÃO vira "outro" — o app pode criar tipos novos', () => {
  assert.equal(normalizarTipo('Induzida por medicamento'), 'Induzida por medicamento');
  assert.equal(normalizarTipo(null), 'Não informado');
  assert.equal(normalizarTipo(''), 'Não informado');
});

test('porTipo: agrupa as duas grafias e ordena do mais frequente', () => {
  const tipos = porTipo([
    secagem({ secagem_id: 1, tipo_secagem: 'Natural' }),
    secagem({ secagem_id: 2, tipo_secagem: 'natural' }),
    secagem({ secagem_id: 3, tipo_secagem: 'Manual' }),
  ]);

  assert.equal(tipos[0].tipo, 'Natural');
  assert.equal(tipos[0].secagens, 2);
  assert.ok(Math.abs((tipos[0].fracao ?? 0) - 2 / 3) < 1e-9);
});

// ─────────────────────────────────────────────────────────────────────────────
// Período seco
// ─────────────────────────────────────────────────────────────────────────────

test('periodoUtilizavel: recusa nulo, não positivo e o que passa do teto', () => {
  assert.equal(periodoUtilizavel(secagem({ secagem_id: 1, periodo_seco: 60 })), true);
  assert.equal(periodoUtilizavel(secagem({ secagem_id: 2, periodo_seco: null })), false);
  assert.equal(periodoUtilizavel(secagem({ secagem_id: 3, periodo_seco: 0 })), false);
  assert.equal(periodoUtilizavel(secagem({ secagem_id: 4, periodo_seco: 661 })), false);
  assert.equal(
    periodoUtilizavel(secagem({ secagem_id: 5, periodo_seco: PERIODO_SECO_MAXIMO })),
    true,
    'o teto é inclusivo',
  );
});

test('faixasDePeriodo: as cinco faixas saem sempre, e as DUAS pontas são alerta', () => {
  const faixas = faixasDePeriodo([secagem({ secagem_id: 1, periodo_seco: 60 })]);

  assert.equal(faixas.length, 5);
  assert.equal(faixas[0].alerta, true, 'menos de 30 dias');
  assert.equal(faixas[2].alerta, false, 'em torno do alvo');
  assert.equal(faixas[4].alerta, true, 'acima de 120');
});

test('faixasDePeriodo: as bordas não se sobrepõem — 29/30 e 45/46', () => {
  const faixas = faixasDePeriodo([
    secagem({ secagem_id: 1, periodo_seco: 29 }),
    secagem({ secagem_id: 2, periodo_seco: 30 }),
    secagem({ secagem_id: 3, periodo_seco: 45 }),
    secagem({ secagem_id: 4, periodo_seco: 46 }),
  ]);

  assert.equal(faixas[0].secagens, 1);
  assert.equal(faixas[1].secagens, 2);
  assert.equal(faixas[2].secagens, 1);
});

test('faixasDePeriodo: secagem sem parto posterior não entra no denominador', () => {
  const faixas = faixasDePeriodo([
    secagem({ secagem_id: 1, periodo_seco: 60 }),
    secagem({ secagem_id: 2, periodo_seco: null, proximo_parto: null }),
  ]);

  assert.equal(faixas[2].fracao, 1, 'a única com período conta 100%');
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

test('resumoSecagens: separa confirmada de previsão do app', () => {
  const resumo = resumoSecagens([
    secagem({ secagem_id: 1, confirmada: true }),
    secagem({ secagem_id: 2, confirmada: false }),
  ]);

  assert.equal(resumo.secagens, 2);
  assert.equal(resumo.confirmadas, 1);
  assert.equal(resumo.previstas, 1);
});

test('resumoSecagens: a média do período seco tem o seu próprio denominador', () => {
  const resumo = resumoSecagens([
    secagem({ secagem_id: 1, periodo_seco: 40 }),
    secagem({ secagem_id: 2, periodo_seco: 80 }),
    secagem({ secagem_id: 3, periodo_seco: null, proximo_parto: null }),
    secagem({ secagem_id: 4, periodo_seco: 661 }),
  ]);

  assert.equal(resumo.periodoMedio, 60);
  assert.equal(resumo.comPeriodo, 2);
  assert.equal(resumo.aguardandoParto, 1);
});

test('resumoSecagens: conta as que deram menos de 30 dias de descanso', () => {
  const resumo = resumoSecagens([
    secagem({ secagem_id: 1, periodo_seco: 9 }),
    secagem({ secagem_id: 2, periodo_seco: 21 }),
    secagem({ secagem_id: 3, periodo_seco: 60 }),
  ]);

  assert.equal(resumo.curtasDemais, 2, 'o caso real de uma fazenda que secou 9 e 21 dias antes');
});

test('resumoSecagens: fazenda sem secagem não vira NaN', () => {
  const resumo = resumoSecagens([]);
  assert.equal(resumo.secagens, 0);
  assert.equal(resumo.periodoMedio, null);
  assert.equal(resumo.ultima, null);
});

// ─────────────────────────────────────────────────────────────────────────────
// Lista de ação e série
// ─────────────────────────────────────────────────────────────────────────────

test('maisCurtas: menor descanso primeiro, empate pelo número do animal', () => {
  const curtas = maisCurtas([
    secagem({ secagem_id: 1, numero_animal: '200', periodo_seco: 20 }),
    secagem({ secagem_id: 2, numero_animal: '100', periodo_seco: 20 }),
    secagem({ secagem_id: 3, numero_animal: '300', periodo_seco: 9 }),
    secagem({ secagem_id: 4, numero_animal: '400', periodo_seco: null }),
  ]);

  assert.deepEqual(
    curtas.map((s) => s.numero_animal),
    ['300', '100', '200'],
  );
});

test('maisCurtas: não mexe no array recebido', () => {
  const lista = [
    secagem({ secagem_id: 1, periodo_seco: 90 }),
    secagem({ secagem_id: 2, periodo_seco: 10 }),
  ];
  const antes = lista.map((s) => s.secagem_id);
  maisCurtas(lista);
  assert.deepEqual(
    lista.map((s) => s.secagem_id),
    antes,
  );
});

test('serieSecagens: agrupa por mês, em ordem cronológica', () => {
  const serie = serieSecagens([
    secagem({ secagem_id: 1, data_secagem: '2026-05-01' }),
    secagem({ secagem_id: 2, data_secagem: '2026-05-20' }),
    secagem({ secagem_id: 3, data_secagem: '2026-01-10' }),
  ]);

  assert.deepEqual(serie, [
    { periodo: '2026-01', valor: 1 },
    { periodo: '2026-05', valor: 2 },
  ]);
});
