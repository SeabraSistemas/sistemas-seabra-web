/**
 * VENDAS — o denominador do dinheiro.
 *
 * A regra que organiza este arquivo inteiro: `valor` NUNCA é null e é ZERO em
 * 87% das vendas — o criador registra a saída do animal e não informa o preço.
 * Toda conta de dinheiro divide pelas vendas COM preço; dividir por todas daria
 * um preço médio sete vezes menor que o real, e isso não seria uma afirmação
 * sobre o mercado, seria uma afirmação sobre o preenchimento.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  faixasDeIdade,
  inicioDoPeriodo,
  lerPeriodo,
  maioresVendas,
  porSexo,
  resumoVendas,
  serieReceita,
  serieVendas,
} from '@/lib/adm/areas/vendas';
import type { LinhaVenda } from '@/lib/adm/areas/contrato';

function venda(parcial: Partial<LinhaVenda> & { venda_id: number }): LinhaVenda {
  const valor = parcial.valor ?? 0;
  return {
    propriedade_id: 1,
    animal_id: parcial.venda_id,
    numero_animal: String(parcial.venda_id),
    nome_animal: null,
    sexo: 'macho',
    categoria: 'Cria',
    data_venda: '2026-07-22',
    valor,
    com_valor: valor > 0,
    data_de_nascimento: '2026-07-21',
    idade_ao_vender: 1,
    peso_atual: null,
    observacao: null,
    ...parcial,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

test('lerPeriodo e inicioDoPeriodo: valor de fora cai no padrão; "tudo" não corta', () => {
  const hoje = new Date('2026-09-10T00:00:00Z');
  assert.equal(lerPeriodo('24m'), '24m');
  assert.equal(lerPeriodo('semana'), '12m');
  assert.equal(inicioDoPeriodo('tudo', hoje), null);
  assert.equal(inicioDoPeriodo('ano', hoje), '2026-01-01');
});

// ─────────────────────────────────────────────────────────────────────────────
// O denominador do dinheiro
// ─────────────────────────────────────────────────────────────────────────────

test('resumoVendas: o preço médio divide pelas vendas COM preço, não por todas', () => {
  const resumo = resumoVendas([
    venda({ venda_id: 1, valor: 1000 }),
    venda({ venda_id: 2, valor: 0 }),
    venda({ venda_id: 3, valor: 0 }),
    venda({ venda_id: 4, valor: 0 }),
  ]);

  assert.equal(resumo.vendas, 4);
  assert.equal(resumo.comValor, 1);
  assert.equal(resumo.receita, 1000);
  assert.equal(resumo.precoMedio, 1000, 'e não 250, que seria dividir pelas quatro');
  assert.equal(resumo.fracaoComValor, 0.25);
});

test('resumoVendas: venda com valor zero não é "vendeu de graça" — é ausência de lançamento', () => {
  const resumo = resumoVendas([venda({ venda_id: 1, valor: 0 })]);

  assert.equal(resumo.comValor, 0);
  assert.equal(resumo.precoMedio, null, 'sem preço lançado não há preço médio — nem zero');
  assert.equal(resumo.receita, 0);
});

test('resumoVendas: sem venda nenhuma a fração é null, e não 0%', () => {
  const resumo = resumoVendas([]);
  assert.equal(resumo.fracaoComValor, null);
  assert.equal(resumo.precoMedio, null);
  assert.equal(resumo.maiorVenda, null);
});

test('resumoVendas: animal vendido duas vezes é contado como inconsistência', () => {
  const resumo = resumoVendas([
    venda({ venda_id: 1, animal_id: 10 }),
    venda({ venda_id: 2, animal_id: 10, data_venda: '2026-01-10' }),
    venda({ venda_id: 3, animal_id: 20 }),
  ]);

  assert.equal(resumo.vendas, 3);
  assert.equal(resumo.animais, 2);
  assert.equal(resumo.animaisRepetidos, 1);
});

test('resumoVendas: idade negativa (cadastro errado) fica fora da média', () => {
  const resumo = resumoVendas([
    venda({ venda_id: 1, idade_ao_vender: 100 }),
    venda({ venda_id: 2, idade_ao_vender: -5 }),
    venda({ venda_id: 3, idade_ao_vender: null }),
  ]);

  assert.equal(resumo.idadeMediaDias, 100);
  assert.equal(resumo.comIdade, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Sexo — e a categoria que NÃO existe aqui
// ─────────────────────────────────────────────────────────────────────────────

test('porSexo: cada grupo carrega o SEU denominador de preço', () => {
  const grupos = porSexo([
    venda({ venda_id: 1, sexo: 'fêmea', valor: 800 }),
    venda({ venda_id: 2, sexo: 'fêmea', valor: 0 }),
    venda({ venda_id: 3, sexo: 'macho', valor: 0 }),
  ]);

  const femeas = grupos.find((g) => g.rotulo === 'Fêmeas');
  const machos = grupos.find((g) => g.rotulo === 'Machos');

  assert.equal(femeas?.vendas, 2);
  assert.equal(femeas?.comValor, 1);
  assert.equal(femeas?.precoMedio, 800, 'e não 400');
  assert.equal(machos?.precoMedio, null, 'nenhum preço lançado nesse grupo');
});

test('porSexo: grupo vazio não aparece, e "sem sexo" só existe quando há', () => {
  const grupos = porSexo([venda({ venda_id: 1, sexo: 'fêmea' })]);
  assert.deepEqual(
    grupos.map((g) => g.rotulo),
    ['Fêmeas'],
  );

  const comNulo = porSexo([venda({ venda_id: 1, sexo: null })]);
  assert.equal(comNulo[0].rotulo, 'Sem sexo cadastrado');
});

// ─────────────────────────────────────────────────────────────────────────────
// Idade na saída
// ─────────────────────────────────────────────────────────────────────────────

test('faixasDeIdade: as cinco faixas saem sempre, e o cabrito de 1 dia cai na primeira', () => {
  const faixas = faixasDeIdade([venda({ venda_id: 1, idade_ao_vender: 1 })]);

  assert.equal(faixas.length, 5);
  assert.equal(faixas[0].vendas, 1);
  assert.equal(faixas[0].fracao, 1);
});

test('faixasDeIdade: as bordas não se sobrepõem — 7 na primeira, 8 na segunda', () => {
  const faixas = faixasDeIdade([
    venda({ venda_id: 1, idade_ao_vender: 7 }),
    venda({ venda_id: 2, idade_ao_vender: 8 }),
    venda({ venda_id: 3, idade_ao_vender: 1096 }),
  ]);

  assert.equal(faixas[0].vendas, 1);
  assert.equal(faixas[1].vendas, 1);
  assert.equal(faixas[4].vendas, 1);
});

test('faixasDeIdade: venda sem idade não entra no denominador', () => {
  const faixas = faixasDeIdade([
    venda({ venda_id: 1, idade_ao_vender: 1 }),
    venda({ venda_id: 2, idade_ao_vender: null }),
  ]);

  assert.equal(faixas[0].fracao, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Séries e ranking
// ─────────────────────────────────────────────────────────────────────────────

test('serieVendas conta sempre; serieReceita só onde há preço, e o mês sem preço fica AUSENTE', () => {
  const vendas = [
    venda({ venda_id: 1, data_venda: '2026-03-10', valor: 500 }),
    venda({ venda_id: 2, data_venda: '2026-04-10', valor: 0 }),
  ];

  assert.deepEqual(serieVendas(vendas), [
    { periodo: '2026-03', valor: 1 },
    { periodo: '2026-04', valor: 1 },
  ]);
  assert.deepEqual(
    serieReceita(vendas),
    [{ periodo: '2026-03', valor: 500 }],
    'abril some da receita: zero diria "não faturou", e a verdade é "não anotou"',
  );
});

test('maioresVendas: só as com preço, maior primeiro, empate pelo número do animal', () => {
  const maiores = maioresVendas([
    venda({ venda_id: 1, numero_animal: '200', valor: 500 }),
    venda({ venda_id: 2, numero_animal: '100', valor: 500 }),
    venda({ venda_id: 3, numero_animal: '300', valor: 900 }),
    venda({ venda_id: 4, numero_animal: '400', valor: 0 }),
  ]);

  assert.deepEqual(
    maiores.map((v) => v.numero_animal),
    ['300', '100', '200'],
  );
});

test('maioresVendas: não mexe no array recebido', () => {
  const lista = [venda({ venda_id: 1, valor: 100 }), venda({ venda_id: 2, valor: 900 })];
  const antes = lista.map((v) => v.venda_id);
  maioresVendas(lista);
  assert.deepEqual(
    lista.map((v) => v.venda_id),
    antes,
  );
});
