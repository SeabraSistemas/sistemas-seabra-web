import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  CMS_MANTENCA_INTERCEPTO_PLANILHA,
  calcularRodrigues,
  consumoMsEstimado,
  consumoMsLactacao,
  consumoMsMantenca,
  energiaLiquidaKcal,
  proteinaLiquidaG,
} from '@/lib/nutricao/lactacao';

const perto = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);

describe('Rodrigues et al. 2006 — exigência líquida de lactação', () => {
  test('demais lactações, 1 kg de leite, composição média: 593,8 kcal (Tabela 7 do artigo)', () => {
    const e = { ordem: 'demais' as const, leiteKg: 1, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 };
    perto(energiaLiquidaKcal(e), 593.8, 0.05);
  });

  test('1ª lactação, 1 kg de leite, composição média: 698,7 kcal', () => {
    const e = { ordem: 'primeira' as const, leiteKg: 1, gorduraPct: 3.85, proteinaPct: 2.56, lactosePct: 4.14 };
    perto(energiaLiquidaKcal(e), 698.7, 0.1);
  });

  test('proteína por kg de leite: 26,3 g (demais) e 26,2 g (1ª lactação)', () => {
    // Com a proteína arredondada do artigo (2,59%) a equação dá 26,36; a tabela traz 26,3
    // (o teor médio sem arredondar é ≈ 2,587%). Tolerância de 0,1 g cobre o arredondamento.
    perto(proteinaLiquidaG({ ordem: 'demais', leiteKg: 1, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 }), 26.3, 0.1);
    perto(proteinaLiquidaG({ ordem: 'primeira', leiteKg: 1, gorduraPct: 3.85, proteinaPct: 2.56, lactosePct: 4.14 }), 26.2, 0.1);
  });

  test('o leite entra linearmente: 2 kg a mais custam 2 × o coeficiente', () => {
    const base = { ordem: 'demais' as const, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 };
    perto(energiaLiquidaKcal({ ...base, leiteKg: 3 }) - energiaLiquidaKcal({ ...base, leiteKg: 1 }), 2 * 646.1161, 1e-9);
  });

  test('aviso quando o leite sai da faixa do estudo (≈ 1,8 a 2,6 kg/dia)', () => {
    const base = { ordem: 'demais' as const, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 };
    assert.equal(calcularRodrigues({ ...base, leiteKg: 2.2 }).dentroDaFaixa, true);
    assert.equal(calcularRodrigues({ ...base, leiteKg: 2.2 }).avisos.length, 0);
    const alto = calcularRodrigues({ ...base, leiteKg: 4 });
    assert.equal(alto.dentroDaFaixa, false);
    assert.match(alto.avisos[0], /fora da faixa do estudo/);
    assert.equal(calcularRodrigues({ ...base, leiteKg: 1.79 }).dentroDaFaixa, false);
    assert.equal(calcularRodrigues({ ...base, leiteKg: 2.6 }).dentroDaFaixa, true);
  });

  test('energia negativa com pouco leite vira aviso, não número silencioso', () => {
    const r = calcularRodrigues({ ordem: 'demais', leiteKg: 0.1, gorduraPct: 0.5, proteinaPct: 0.5, lactosePct: 0.5 });
    assert.ok(r.energiaKcal < 0);
    assert.ok(r.avisos.some((a) => /negativo/.test(a)));
  });

  test('sem leite: avisa e não divide por zero', () => {
    const r = calcularRodrigues({ ordem: 'demais', leiteKg: 0, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 });
    assert.equal(r.energiaKcalPorKg, null);
    assert.match(r.avisos[0], /Sem leite/);
  });
});

describe('Consumo de matéria seca', () => {
  test('60 kg com 3 kg de leite: 0,062·PV^0,75 + 0,305·leite = 2,2516 kg', () => {
    perto(consumoMsLactacao(60, 3), 2.2516, 0.0001);
    // conferido à mão: 60^0,75 = 21,5573 → ×0,062 = 1,33655; + 0,915
    perto(0.062 * 21.5573 + 0.305 * 3, 2.2516, 0.0001);
  });

  test('mantença: 0,522 + 0,0135·PV; a planilha usava 0,552 (0,03 kg/dia a mais)', () => {
    perto(consumoMsMantenca(60), 1.332, 1e-9);
    perto(consumoMsMantenca(60, CMS_MANTENCA_INTERCEPTO_PLANILHA), 1.362, 1e-9);
    const c = consumoMsEstimado(60, 0, false);
    assert.equal(c.equacao, 'mantenca');
    perto((c.cmsKgPlanilha as number) - c.cmsKg, 0.03, 1e-9);
  });

  test('prenhe ou em lactação usa a equação com leite', () => {
    const c = consumoMsEstimado(60, 3, true);
    assert.equal(c.equacao, 'lactacao');
    assert.equal(c.cmsKgPlanilha, null);
  });
});
