/**
 * INVENTÁRIO DO REBANHO — o balde "sem motivo".
 *
 * A regra que este arquivo protege é o DENOMINADOR das saídas: a fração de cada
 * motivo é sobre os INATIVOS, nunca sobre o rebanho todo. E `taxaSaidaRegistrada`
 * devolve null — não 0% — quando não houve saída nenhuma, porque "fazenda que
 * nunca perdeu animal" e "fazenda que perdeu e não registrou" são conversas
 * opostas: uma é rebanho novo, a outra é treinamento.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CURVA_NASCIMENTOS,
  CURVA_OBITOS,
  CURVA_VENDAS,
  buracosDeCadastro,
  composicaoDoEfetivo,
  composicaoSaidas,
  curvaDoFluxo,
  efetivoPorBaia,
  inventarioVazio,
  saldoDoFluxo,
  taxaSaidaRegistrada,
} from '@/lib/adm/areas/rebanho-inventario';
import type { LinhaAnimal, LinhaInventario } from '@/lib/adm/areas/contrato';

function inventario(parcial: Partial<LinhaInventario>): LinhaInventario {
  return { ...inventarioVazio(1), ...parcial };
}

function animal(parcial: Partial<LinhaAnimal> & { animal_id: number }): LinhaAnimal {
  return {
    propriedade_id: 1,
    numero_animal: String(parcial.animal_id),
    nome_animal: null,
    sexo: 'fêmea',
    status: 'ativo',
    categoria: 'Lactante',
    baia: 'G1-1',
    data_de_nascimento: '2024-01-01',
    idade_dias: 600,
    peso_atual: 50,
    dias_em_lactacao: 120,
    ordem_parto: 2,
    gestacao_ativa: false,
    status_reproducao: 'vazia',
    data_venda: null,
    motivo_saida: 'ativo',
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Saídas — o achado
// ─────────────────────────────────────────────────────────────────────────────

test('composicaoSaidas: a fração é sobre os INATIVOS, não sobre o rebanho todo', () => {
  const saidas = composicaoSaidas(
    inventario({ ativos: 900, inativos: 100, saida_venda: 40, saida_sem_motivo: 60 }),
  );

  assert.equal(saidas.find((s) => s.motivo === 'venda')?.fracao, 0.4);
  assert.equal(
    saidas.find((s) => s.motivo === 'sem_motivo')?.fracao,
    0.6,
    'e não 6% do rebanho de mil animais',
  );
});

test('composicaoSaidas: os quatro motivos saem sempre, mesmo zerados', () => {
  const saidas = composicaoSaidas(inventario({ inativos: 10, saida_venda: 10 }));
  assert.equal(saidas.length, 4);
  assert.deepEqual(
    saidas.map((s) => s.motivo),
    ['venda', 'obito', 'descarte', 'sem_motivo'],
  );
});

test('composicaoSaidas: sem inativo nenhum a fração é null, e não 0%', () => {
  const saidas = composicaoSaidas(inventario({ ativos: 50, inativos: 0 }));
  assert.ok(saidas.every((s) => s.fracao === null && s.animais === 0));
});

test('taxaSaidaRegistrada: soma os três motivos conhecidos sobre o total de inativos', () => {
  const taxa = taxaSaidaRegistrada(
    inventario({ inativos: 100, saida_venda: 50, saida_obito: 20, saida_descarte: 10, saida_sem_motivo: 20 }),
  );
  assert.equal(taxa, 0.8);
});

test('taxaSaidaRegistrada: fazenda que nunca perdeu animal devolve null — não é 0% de registro', () => {
  assert.equal(taxaSaidaRegistrada(inventario({ ativos: 300, inativos: 0 })), null);
});

test('taxaSaidaRegistrada: fazenda que perdeu e não registrou NADA devolve 0 — que é uma afirmação', () => {
  assert.equal(
    taxaSaidaRegistrada(inventario({ inativos: 4176, saida_sem_motivo: 4176 })),
    0,
    'o caso real da propriedade 238',
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Buracos de cadastro
// ─────────────────────────────────────────────────────────────────────────────

test('buracosDeCadastro: a fração é sobre os ATIVOS — o cadastro do inativo não se conserta mais', () => {
  const buracos = buracosDeCadastro(inventario({ ativos: 100, inativos: 900, sem_baia: 25 }));
  assert.equal(buracos.find((b) => b.rotulo === 'Sem baia')?.fracao, 0.25);
});

test('buracosDeCadastro: rebanho sem nenhum ativo devolve fração null em vez de dividir por zero', () => {
  const buracos = buracosDeCadastro(inventario({ ativos: 0, inativos: 10 }));
  assert.ok(buracos.every((b) => b.fracao === null));
});

// ─────────────────────────────────────────────────────────────────────────────
// Composição do efetivo
// ─────────────────────────────────────────────────────────────────────────────

test('composicaoDoEfetivo: cruza categoria com sexo e ordena da maior categoria', () => {
  const composicao = composicaoDoEfetivo([
    animal({ animal_id: 1, categoria: 'Lactante', sexo: 'fêmea' }),
    animal({ animal_id: 2, categoria: 'Lactante', sexo: 'fêmea' }),
    animal({ animal_id: 3, categoria: 'Reprodutor', sexo: 'macho' }),
  ]);

  assert.deepEqual(
    composicao.map((c) => c.categoria),
    ['Lactante', 'Reprodutor'],
  );
  assert.equal(composicao[0].femeas, 2);
  assert.equal(composicao[1].machos, 1);
});

test('composicaoDoEfetivo: sexo ausente vira coluna própria em vez de sumir da conta', () => {
  const composicao = composicaoDoEfetivo([animal({ animal_id: 1, sexo: null })]);
  assert.equal(composicao[0].semSexo, 1);
  assert.equal(composicao[0].total, 1);
});

test('composicaoDoEfetivo: "Sem categoria" vai por último, mesmo sendo a maior', () => {
  const composicao = composicaoDoEfetivo([
    animal({ animal_id: 1, categoria: null }),
    animal({ animal_id: 2, categoria: null }),
    animal({ animal_id: 3, categoria: 'Cria' }),
  ]);

  assert.deepEqual(
    composicao.map((c) => c.categoria),
    ['Cria', 'Sem categoria'],
  );
});

test('efetivoPorBaia: agrupa por baia e trata a ausência como "Sem baia"', () => {
  const baias = efetivoPorBaia([
    animal({ animal_id: 1, baia: 'G1-1' }),
    animal({ animal_id: 2, baia: null }),
    animal({ animal_id: 3, baia: '  ' }),
  ]);

  const porRotulo = new Map(baias.map((b) => [b.rotulo, b.valor]));
  assert.equal(porRotulo.get('G1-1'), 1);
  assert.equal(porRotulo.get('Sem baia'), 2);
});

// ─────────────────────────────────────────────────────────────────────────────
// Fluxo
// ─────────────────────────────────────────────────────────────────────────────

test('curvaDoFluxo: separa a curva pedida e devolve em ordem cronológica', () => {
  const inv = inventario({
    fluxo_mensal: [
      { serie: CURVA_VENDAS, periodo: '2026-02', valor: 3 },
      { serie: CURVA_NASCIMENTOS, periodo: '2026-02', valor: 9 },
      { serie: CURVA_NASCIMENTOS, periodo: '2026-01', valor: 5 },
    ],
  });

  assert.deepEqual(curvaDoFluxo(inv, CURVA_NASCIMENTOS), [
    { periodo: '2026-01', valor: 5 },
    { periodo: '2026-02', valor: 9 },
  ]);
});

test('curvaDoFluxo: curva inexistente devolve vazio, não quebra', () => {
  assert.deepEqual(curvaDoFluxo(inventario({ fluxo_mensal: null }), CURVA_OBITOS), []);
});

test('saldoDoFluxo: entradas são nascimentos; saídas somam vendas e óbitos', () => {
  const saldo = saldoDoFluxo(
    inventario({
      fluxo_mensal: [
        { serie: CURVA_NASCIMENTOS, periodo: '2026-01', valor: 10 },
        { serie: CURVA_VENDAS, periodo: '2026-01', valor: 4 },
        { serie: CURVA_OBITOS, periodo: '2026-01', valor: 2 },
      ],
    }),
  );

  assert.deepEqual(saldo, { entradas: 10, saidas: 6, saldo: 4 });
});

test('saldoDoFluxo: sem fluxo nenhum devolve zeros, não NaN', () => {
  assert.deepEqual(saldoDoFluxo(inventario({ fluxo_mensal: null })), {
    entradas: 0,
    saidas: 0,
    saldo: 0,
  });
});
