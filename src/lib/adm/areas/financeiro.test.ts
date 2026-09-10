/**
 * FINANCEIRO — o quinto estado do custo por litro.
 *
 * A tela já distinguia quatro estados (número, consolidado, sem estimativa,
 * campo vazio no snapshot). Faltava o que o dado real trouxe: o número EXISTE,
 * está aritmeticamente certo e mesmo assim não é comparável — a base tem um
 * snapshot com R$ 36,97 por litro numa fazenda que produzia 20 litros por dia.
 *
 * A regra não esconde o valor. Esconder apagaria justamente o sinal de que
 * aquela operação ainda não é comercial, que é a informação de verdade.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CUSTO_LITRO_TETO,
  custoLitroForaDaFaixa,
  financeiroVazio,
  margemPercentual,
  temLancamentos,
} from '@/lib/adm/areas/financeiro';
import type { FinanceiroProdutor } from '@/lib/adm/areas/financeiro';

function financeiro(parcial: Partial<FinanceiroProdutor>): FinanceiroProdutor {
  return { ...financeiroVazio(), ...parcial };
}

test('custoLitroForaDaFaixa: o caso real de R$ 36,97 por litro é sinalizado', () => {
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: 36.974 })), true);
});

test('custoLitroForaDaFaixa: custo comercial normal não é sinalizado', () => {
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: 3.7459 })), false);
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: 7.04 })), false);
});

test('custoLitroForaDaFaixa: o teto é exclusivo — exatamente no limite ainda passa', () => {
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: CUSTO_LITRO_TETO })), false);
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: CUSTO_LITRO_TETO + 0.01 })), true);
});

test('custoLitroForaDaFaixa: sem estimativa nenhuma NÃO é "fora da faixa" — é ausência', () => {
  assert.equal(custoLitroForaDaFaixa(financeiro({ custoLitro: null })), false);
});

test('margemPercentual: sem receita não há percentual, e zero de receita não vira divisão por zero', () => {
  assert.equal(margemPercentual(financeiro({ margem12m: 100, receita12m: 400 })), 0.25);
  assert.equal(margemPercentual(financeiro({ margem12m: 100, receita12m: 0 })), null);
  assert.equal(margemPercentual(financeiro({ margem12m: null, receita12m: 400 })), null);
});

test('temLancamentos: distingue fazenda SEM financeiro de fazenda com financeiro zerado', () => {
  assert.equal(temLancamentos(financeiro({})), false, 'nunca lançou — é venda');
  assert.equal(
    temLancamentos(financeiro({ lancamentos12m: 0, receita12m: 0 })),
    true,
    'lançou e deu zero — é suporte',
  );
});
