import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  CADEIA_FEMEA,
  CADEIA_MACHO_CORTE,
  custoDietaDia,
  custoFixoDiaPorCabeca,
  calcularFunis,
  efetivoVivo,
  gmdSugeridoPorCategoria,
} from '@/lib/fi-fcg/custoFormacao';
import type { CategoriaArroba, Custo, GmdCategoria, Insumo, ItemDieta, RegRebanho } from '@/lib/fi-fcg/types';

function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, entradaEngorda: null, diasEngordaAtual: null,
    pesoEntradaEngorda: null, gmdAtual: null, ...p,
  };
}
function custo(p: Partial<Custo> & { id: string }): Custo {
  return { descricao: null, categoria: null, fazenda: null, tipo: null, valor: null, dataInicio: null, dataFim: null, observacao: null, ...p };
}
function insumo(p: Partial<Insumo> & { id: string; nome: string }): Insumo {
  return { tipo: null, valorKg: null, ...p };
}
function item(p: Partial<ItemDieta> & { id: string }): ItemDieta {
  return { categoria: null, insumo: null, kgDia: null, ...p };
}
function gmd(p: Partial<GmdCategoria> & { id: string }): GmdCategoria {
  return { categoria: null, gmdKgDia: null, ...p };
}
function categoriaArroba(categoria: string, mediaArroba: number): CategoriaArroba {
  return { categoria, mediaArroba, valorCategoria: null };
}

describe('efetivoVivo', () => {
  test('exclui Venda/Baixa; fazenda null conta todas', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' }),
      animal({ id: 'a2', categoria: 'Venda', fazenda: 'Inhumas' }),
      animal({ id: 'a3', categoria: 'Vaca', fazenda: 'Campina grande' }),
    ];
    assert.equal(efetivoVivo(rebanho, null), 2);
    assert.equal(efetivoVivo(rebanho, 'Inhumas'), 1);
  });
});

describe('custoFixoDiaPorCabeca', () => {
  const rebanho = [
    animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' }),
    animal({ id: 'a2', categoria: 'Bezerro', fazenda: 'Inhumas' }),
    animal({ id: 'a3', categoria: 'Vaca', fazenda: 'Campina grande' }),
  ];

  test('fazenda null (consolidado): todo custo / 30 / efetivo total', () => {
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 3000, dataInicio: 20260101 })];
    const dia = custoFixoDiaPorCabeca(custos, rebanho, null, 20260115);
    assert.equal(dia, 3000 / 30 / 3);
  });

  test('fazenda especifica: soma Geral (rateado no total) + da fazenda (rateado so nela)', () => {
    const custos = [
      custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 3000, dataInicio: 20260101 }),
      custo({ id: 'c2', fazenda: 'Inhumas', tipo: 'Mensal', valor: 600, dataInicio: 20260101 }),
    ];
    const dia = custoFixoDiaPorCabeca(custos, rebanho, 'Inhumas', 20260115);
    // geral: 3000/30/3 = 33.33...; inhumas: 600/30/2 = 10
    assert.equal(dia, 3000 / 30 / 3 + 600 / 30 / 2);
  });

  test('custo de OUTRA fazenda nao entra no rateio desta', () => {
    const custos = [custo({ id: 'c1', fazenda: 'Campina grande', tipo: 'Mensal', valor: 900, dataInicio: 20260101 })];
    const dia = custoFixoDiaPorCabeca(custos, rebanho, 'Inhumas', 20260115);
    assert.equal(dia, 0); // sem custo geral, sem custo de Inhumas
  });

  test('efetivo total zero: null (nao dividir por zero)', () => {
    assert.equal(custoFixoDiaPorCabeca([], [], null, 20260115), null);
  });
});

describe('custoDietaDia', () => {
  test('soma kg/dia x preco de cada insumo da categoria', () => {
    const insumos = [insumo({ id: 'i1', nome: 'Milho', valorKg: 1.2 }), insumo({ id: 'i2', nome: 'Sal', valorKg: 3 })];
    const dieta = [
      item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', kgDia: 2 }),
      item({ id: 'd2', categoria: 'Garrote', insumo: 'Sal', kgDia: 0.1 }),
      item({ id: 'd3', categoria: 'Boi', insumo: 'Milho', kgDia: 5 }), // outra categoria, nao entra
    ];
    assert.equal(custoDietaDia('Garrote', dieta, insumos), 2 * 1.2 + 0.1 * 3);
  });

  test('categoria sem nenhuma linha de dieta: null', () => {
    assert.equal(custoDietaDia('Boi', [], []), null);
  });

  test('insumo sem preco cadastrado: ignora essa linha, conta o resto', () => {
    const insumos = [insumo({ id: 'i1', nome: 'Milho', valorKg: 1 })];
    const dieta = [
      item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', kgDia: 2 }),
      item({ id: 'd2', categoria: 'Garrote', insumo: 'SemPreco', kgDia: 5 }),
    ];
    assert.equal(custoDietaDia('Garrote', dieta, insumos), 2);
  });
});

describe('gmdSugeridoPorCategoria', () => {
  test('media do gmdAtual por categoria, ignora null e <=0', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', gmdAtual: 1.0 }),
      animal({ id: 'a2', categoria: 'Bezerro', gmdAtual: 0.6 }),
      animal({ id: 'a3', categoria: 'Bezerro', gmdAtual: 0 }),
      animal({ id: 'a4', categoria: 'Bezerro', gmdAtual: null }),
      animal({ id: 'a5', categoria: 'Vaca', gmdAtual: 0.3 }),
    ];
    const sugerido = gmdSugeridoPorCategoria(rebanho);
    assert.equal(sugerido.get('Bezerro'), 0.8);
    assert.equal(sugerido.get('Vaca'), 0.3);
    assert.equal(sugerido.has('Garrote'), false); // nunca é Categoria real, sem sugestao
  });
});

describe('calcularFunis', () => {
  const arrobas = [
    categoriaArroba('Bezerro', 12),
    categoriaArroba('Garrote', 16),
    categoriaArroba('Boi', 19),
    categoriaArroba('Bezerra', 12),
    categoriaArroba('Novilha', 15),
    categoriaArroba('Vaca', 16),
  ];

  test('fase de entrada (sem anterior) sempre custo 0, dias 0', () => {
    const [funil] = calcularFunis(
      [{ nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE }],
      [], [], null, arrobas, [], [], [], 20260101,
    );
    assert.equal(funil.fases[0].categoria, 'Bezerro');
    assert.equal(funil.fases[0].dias, 0);
    assert.equal(funil.fases[0].custoFase, 0);
    assert.equal(funil.fases[0].custoAcumulado, 0);
  });

  test('fase intermediaria: dias = delta de peso / GMD; custo = dias x (dieta+fixo)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' })];
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 300, dataInicio: 20260101 })]; // 10/dia / 1 cabeca = 10/dia
    const insumos = [insumo({ id: 'i1', nome: 'Milho', valorKg: 1 })];
    const dieta = [item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', kgDia: 3 })]; // 3/dia
    const gmdCategoria = [gmd({ id: 'g1', categoria: 'Garrote', gmdKgDia: 0.5 })];

    const [funil] = calcularFunis(
      [{ nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE }],
      custos, rebanho, null, arrobas, insumos, dieta, gmdCategoria, 20260115,
    );
    const garrote = funil.fases.find((f) => f.categoria === 'Garrote')!;
    // peso: bezerro 12*15=180kg, garrote 16*15=240kg -> delta 60kg / 0.5 kg/dia = 120 dias
    assert.equal(garrote.dias, 120);
    assert.equal(garrote.custoDietaDia, 3);
    assert.equal(garrote.custoFixoDia, 10);
    assert.equal(garrote.custoFase, 120 * 13);
    assert.equal(garrote.custoAcumulado, 120 * 13); // fase anterior (Bezerro) foi 0
  });

  test('sem GMD cadastrado: fase fica null e quebra o acumulado adiante (nao finge um numero)', () => {
    const [funil] = calcularFunis(
      [{ nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE }],
      [], [], null, arrobas, [], [], [], 20260101,
    );
    const garrote = funil.fases.find((f) => f.categoria === 'Garrote')!;
    const boi = funil.fases.find((f) => f.categoria === 'Boi')!;
    assert.equal(garrote.custoFase, null);
    assert.equal(garrote.custoAcumulado, null);
    assert.equal(boi.custoAcumulado, null); // propaga
    assert.equal(funil.custoTotal, null);
    assert.equal(funil.custoPorArroba, null);
  });

  test('custoPorArroba = custoTotal / Media@ da categoria final', () => {
    const gmdCategoria = [
      gmd({ id: 'g1', categoria: 'Garrote', gmdKgDia: 1 }),
      gmd({ id: 'g2', categoria: 'Boi', gmdKgDia: 1 }),
    ];
    const [funil] = calcularFunis(
      [{ nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE }],
      [], [], null, arrobas, [], [], gmdCategoria, 20260101,
    );
    assert.equal(funil.arrobaFinal, 19); // Boi
    assert.equal(funil.custoPorArroba, (funil.custoTotal ?? -1) / 19);
  });

  test('3 cadeias independentes (macho corte, macho reprodutor, femea) calculam em paralelo', () => {
    const funis = calcularFunis(
      [
        { nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE },
        { nome: 'Fêmea de reposição', fases: CADEIA_FEMEA },
      ],
      [], [], null, arrobas, [], [], [], 20260101,
    );
    assert.equal(funis.length, 2);
    assert.deepEqual(funis.map((f) => f.nome), ['Macho para corte', 'Fêmea de reposição']);
  });
});
