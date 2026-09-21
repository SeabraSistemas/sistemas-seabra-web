import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  CADEIA_FEMEA,
  CADEIA_MACHO_CORTE,
  custoDietaDia,
  custoFixoDiaPorCabeca,
  calcularFunis,
  efetivoVivo,
  gpdSugeridoPorCategoria,
  montarRetratoMomento,
  percentualPorTipo,
} from '@/lib/fi-fcg/custoFormacao';
import type { CategoriaArroba, ConsumoCategoria, Custo, GmdCategoria, Insumo, ItemDieta, MarcoIdade, RegPesagem, RegRebanho } from '@/lib/fi-fcg/types';

function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, entradaEngorda: null, diasEngordaAtual: null,
    pesoEntradaEngorda: null, gmdAtual: null, ...p,
  };
}
function pesagem(p: Partial<RegPesagem> & { id: string }): RegPesagem {
  return {
    data: null, pesoKg: null, entradaKg: null, diasEngorda: null, gpd: null, gmd: null, pdi: null, gpdi: null,
    fazenda: null, lote: null, sexo: null, destino: null, diferencaKg: null, ...p,
  };
}
function custo(p: Partial<Custo> & { id: string }): Custo {
  return { descricao: null, categoria: null, fazenda: null, tipo: null, valor: null, dataInicio: null, dataFim: null, observacao: null, ...p };
}
function insumo(p: Partial<Insumo> & { id: string; nome: string }): Insumo {
  return { tipo: null, valorKg: null, ...p };
}
function item(p: Partial<ItemDieta> & { id: string }): ItemDieta {
  return { categoria: null, insumo: null, percentual: null, ...p };
}
function consumo(p: Partial<ConsumoCategoria> & { id: string }): ConsumoCategoria {
  return { categoria: null, tipo: null, kgDia: null, ...p };
}
function gmd(p: Partial<GmdCategoria> & { id: string }): GmdCategoria {
  return { categoria: null, gmdKgDia: null, ...p };
}
function marco(p: Partial<MarcoIdade> & { id: string }): MarcoIdade {
  return { marco: null, idadeDias: null, ...p };
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

describe('custoDietaDia (alinhado ao seabra-app-main: % dentro do tipo x consumo total do tipo)', () => {
  test('soma por tipo: (Σ percentual x preco) x kg/dia do tipo, tipos diferentes somam', () => {
    const insumos = [
      insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1.2 }),
      insumo({ id: 'i2', nome: 'Sal', tipo: 'Sal mineral', valorKg: 3 }),
    ];
    const dieta = [
      item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', percentual: 100 }),
      item({ id: 'd2', categoria: 'Garrote', insumo: 'Sal', percentual: 100 }),
      item({ id: 'd3', categoria: 'Boi', insumo: 'Milho', percentual: 100 }), // outra categoria, nao entra
    ];
    const consumoCat = [
      consumo({ id: 'c1', categoria: 'Garrote', tipo: 'Concentrado', kgDia: 2 }),
      consumo({ id: 'c2', categoria: 'Garrote', tipo: 'Sal mineral', kgDia: 0.1 }),
    ];
    assert.equal(custoDietaDia('Garrote', dieta, insumos, consumoCat), 2 * 1.2 + 0.1 * 3);
  });

  test('mistura com % parcial: preco medio ponderado do tipo x kg/dia do tipo', () => {
    const insumos = [
      insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1.0 }),
      insumo({ id: 'i2', nome: 'Farelo de soja', tipo: 'Concentrado', valorKg: 2.0 }),
    ];
    const dieta = [
      item({ id: 'd1', categoria: 'Vaca', insumo: 'Milho', percentual: 60 }),
      item({ id: 'd2', categoria: 'Vaca', insumo: 'Farelo de soja', percentual: 40 }),
    ];
    const consumoCat = [consumo({ id: 'c1', categoria: 'Vaca', tipo: 'Concentrado', kgDia: 10 })];
    // preco medio = 0.6*1 + 0.4*2 = 1.4 R$/kg; custo = 1.4 * 10 = 14
    assert.equal(custoDietaDia('Vaca', dieta, insumos, consumoCat), 14);
  });

  test('categoria sem nenhuma linha de dieta: null', () => {
    assert.equal(custoDietaDia('Boi', [], [], []), null);
  });

  test('tipo sem consumo cadastrado (kg/dia ausente): nao contribui, outros tipos contam normalmente', () => {
    const insumos = [
      insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1 }),
      insumo({ id: 'i2', nome: 'Sal', tipo: 'Sal mineral', valorKg: 3 }),
    ];
    const dieta = [
      item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', percentual: 100 }),
      item({ id: 'd2', categoria: 'Garrote', insumo: 'Sal', percentual: 100 }),
    ];
    // so Concentrado tem consumo cadastrado
    const consumoCat = [consumo({ id: 'c1', categoria: 'Garrote', tipo: 'Concentrado', kgDia: 2 })];
    assert.equal(custoDietaDia('Garrote', dieta, insumos, consumoCat), 2 * 1); // so o concentrado conta
  });

  test('insumo sem valorKg cadastrado: ignora esse insumo, conta so o resto do tipo', () => {
    const insumos = [
      insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1 }),
      insumo({ id: 'i2', nome: 'SemPreco', tipo: 'Concentrado', valorKg: null }),
    ];
    const dieta = [
      item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', percentual: 50 }),
      item({ id: 'd2', categoria: 'Garrote', insumo: 'SemPreco', percentual: 50 }),
    ];
    const consumoCat = [consumo({ id: 'c1', categoria: 'Garrote', tipo: 'Concentrado', kgDia: 10 })];
    assert.equal(custoDietaDia('Garrote', dieta, insumos, consumoCat), 5); // 0.5*1 * 10
  });
});

describe('percentualPorTipo', () => {
  test('soma as % dos insumos daquele tipo, pra aquela categoria — outro tipo nao entra', () => {
    const insumos = [
      insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1 }),
      insumo({ id: 'i2', nome: 'Farelo', tipo: 'Concentrado', valorKg: 2 }),
      insumo({ id: 'i3', nome: 'Sal', tipo: 'Sal mineral', valorKg: 3 }),
    ];
    const dieta = [
      item({ id: 'd1', categoria: 'Vaca', insumo: 'Milho', percentual: 60 }),
      item({ id: 'd2', categoria: 'Vaca', insumo: 'Farelo', percentual: 35 }),
      item({ id: 'd3', categoria: 'Vaca', insumo: 'Sal', percentual: 100 }),
    ];
    assert.equal(percentualPorTipo('Vaca', 'Concentrado', dieta, insumos), 95);
    assert.equal(percentualPorTipo('Vaca', 'Sal mineral', dieta, insumos), 100);
  });

  test('sem nenhuma linha: 0', () => {
    assert.equal(percentualPorTipo('Vaca', 'Concentrado', [], []), 0);
  });
});

describe('gpdSugeridoPorCategoria', () => {
  test('media do GPD (Pesagem) mais recente de cada animal, agrupado pela Categoria (Rebanho) de hoje', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro' }),
      animal({ id: 'a2', categoria: 'Bezerro' }),
      animal({ id: 'a3', categoria: 'Vaca' }),
    ];
    const pesagens = [
      pesagem({ id: 'a1', data: 20260101, gpd: 1.0 }),
      pesagem({ id: 'a1', data: 20260301, gpd: 1.2 }), // mais recente — vale essa
      pesagem({ id: 'a2', data: 20260101, gpd: 0.6 }),
      pesagem({ id: 'a3', data: 20260101, gpd: 0.3 }),
    ];
    const sugerido = gpdSugeridoPorCategoria(rebanho, pesagens);
    assert.ok(Math.abs(sugerido.get('Bezerro')! - 0.9) < 1e-9); // media(1.2, 0.6)
    assert.equal(sugerido.get('Vaca'), 0.3);
    assert.equal(sugerido.has('Garrote'), false); // nunca é Categoria real, sem sugestao
  });

  test('ignora pesagem com GPD null ou <=0', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro' })];
    const pesagens = [
      pesagem({ id: 'a1', data: 20260101, gpd: null }),
      pesagem({ id: 'a1', data: 20260201, gpd: 0 }),
    ];
    const sugerido = gpdSugeridoPorCategoria(rebanho, pesagens);
    assert.equal(sugerido.has('Bezerro'), false);
  });

  test('animal sem Categoria (RebanhoProd) ou sem match no rebanho: nao entra em nenhuma categoria', () => {
    const rebanho = [animal({ id: 'a1', categoria: null })];
    const pesagens = [pesagem({ id: 'a1', data: 20260101, gpd: 1.0 }), pesagem({ id: 'a2', data: 20260101, gpd: 1.0 })];
    const sugerido = gpdSugeridoPorCategoria(rebanho, pesagens);
    assert.equal(sugerido.size, 0);
  });

  test('GMD (gmdAtual) NAO entra na conta — so GPD da Pesagem', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Boi', gmdAtual: 5 })]; // gmdAtual alto, mas irrelevante aqui
    const pesagens = [pesagem({ id: 'a1', data: 20260101, gpd: 0.4 })];
    const sugerido = gpdSugeridoPorCategoria(rebanho, pesagens);
    assert.equal(sugerido.get('Boi'), 0.4);
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
      [], [], null, arrobas, [], [], [], [], 20260101,
    );
    assert.equal(funil.fases[0].categoria, 'Bezerro');
    assert.equal(funil.fases[0].dias, 0);
    assert.equal(funil.fases[0].custoFase, 0);
    assert.equal(funil.fases[0].custoAcumulado, 0);
  });

  test('fase intermediaria: dias = delta de peso / GMD; custo = dias x (dieta+fixo)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' })];
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 300, dataInicio: 20260101 })]; // 10/dia / 1 cabeca = 10/dia
    const insumos = [insumo({ id: 'i1', nome: 'Milho', tipo: 'Concentrado', valorKg: 1 })];
    const dieta = [item({ id: 'd1', categoria: 'Garrote', insumo: 'Milho', percentual: 100 })];
    const consumoCat = [consumo({ id: 'cc1', categoria: 'Garrote', tipo: 'Concentrado', kgDia: 3 })]; // 100% Milho x 3kg/dia = 3/dia
    const gmdCategoria = [gmd({ id: 'g1', categoria: 'Garrote', gmdKgDia: 0.5 })];

    const [funil] = calcularFunis(
      [{ nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE }],
      custos, rebanho, null, arrobas, insumos, dieta, consumoCat, gmdCategoria, 20260115,
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
      [], [], null, arrobas, [], [], [], [], 20260101,
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
      [], [], null, arrobas, [], [], [], gmdCategoria, 20260101,
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
      [], [], null, arrobas, [], [], [], [], 20260101,
    );
    assert.equal(funis.length, 2);
    assert.deepEqual(funis.map((f) => f.nome), ['Macho para corte', 'Fêmea de reposição']);
  });
});

describe('montarRetratoMomento', () => {
  const arrobas = [categoriaArroba('Bezerro', 12)];

  test('idade media real (nascimento -> hoje), custo acumulado hoje = idade x custo total/dia', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas', nascimento: 20250101, ultimaPesagemKg: 150 }),
    ];
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 300, dataInicio: 20260101 })]; // 300/30/1 = 10/dia
    const insumos = [insumo({ id: 'i1', nome: 'Ração', tipo: 'Concentrado', valorKg: 1 })];
    const dieta = [item({ id: 'd1', categoria: 'Bezerro', insumo: 'Ração', percentual: 100 })];
    const consumoCat = [consumo({ id: 'cc1', categoria: 'Bezerro', tipo: 'Concentrado', kgDia: 2 })]; // 2/dia

    const [retrato] = montarRetratoMomento(rebanho, null, custos, arrobas, insumos, dieta, consumoCat, [], 20260101);
    assert.equal(retrato.categoria, 'Bezerro');
    assert.equal(retrato.efetivo, 1);
    assert.equal(retrato.idadeMediaDias, 365); // 2025 nao é bissexto
    assert.equal(retrato.custoDietaDia, 2);
    assert.equal(retrato.custoFixoDia, 10);
    assert.equal(retrato.custoTotalDia, 12);
    assert.equal(retrato.custoAcumuladoHoje, 365 * 12);
  });

  test('custo por @ real (peso medido/15) diverge do custo por @ de referencia (Categoria@)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas', nascimento: 20250101, ultimaPesagemKg: 150 }), // 10@ reais
    ];
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 300, dataInicio: 20260101 })];
    const insumos = [insumo({ id: 'i1', nome: 'Ração', tipo: 'Concentrado', valorKg: 1 })];
    const dieta = [item({ id: 'd1', categoria: 'Bezerro', insumo: 'Ração', percentual: 100 })];
    const consumoCat = [consumo({ id: 'cc1', categoria: 'Bezerro', tipo: 'Concentrado', kgDia: 2 })];

    const [retrato] = montarRetratoMomento(rebanho, null, custos, arrobas, insumos, dieta, consumoCat, [], 20260101);
    const acumulado = retrato.custoAcumuladoHoje as number;
    assert.equal(retrato.custoPorArrobaReal, acumulado / 10); // 150kg / 15 = 10@
    assert.equal(retrato.custoPorArrobaReferencia, acumulado / 12); // Categoria@ Bezerro = 12@
    assert.notEqual(retrato.custoPorArrobaReal, retrato.custoPorArrobaReferencia);
  });

  test('marcos: cada categoria so mostra os marcos de SAIDA dela; Novilha mostra os 2 reprodutivos', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas', nascimento: 20250101 }),
      animal({ id: 'a2', categoria: 'Novilha', fazenda: 'Inhumas', nascimento: 20250101 }),
      animal({ id: 'a3', categoria: 'Vaca', fazenda: 'Inhumas', nascimento: 20250101 }), // sem marco (terminal)
    ];
    const custos = [custo({ id: 'c1', fazenda: 'Geral', tipo: 'Mensal', valor: 300, dataInicio: 20260101 })];
    const marcos = [
      marco({ id: 'm1', marco: 'Bezerro -> Garrote', idadeDias: 200 }),
      marco({ id: 'm2', marco: 'Novilha -> Vaca (1a cobertura)', idadeDias: 300 }),
      marco({ id: 'm3', marco: 'Novilha -> Vaca (1o parto)', idadeDias: 583 }),
    ];

    const retrato = montarRetratoMomento(rebanho, null, custos, arrobas, [], [], [], marcos, 20260101);
    const bezerro = retrato.find((r) => r.categoria === 'Bezerro')!;
    const novilha = retrato.find((r) => r.categoria === 'Novilha')!;
    const vaca = retrato.find((r) => r.categoria === 'Vaca')!;

    assert.deepEqual(bezerro.marcos.map((m) => m.nome), ['Bezerro -> Garrote']);
    assert.deepEqual(novilha.marcos.map((m) => m.nome), ['Novilha -> Vaca (1a cobertura)', 'Novilha -> Vaca (1o parto)']);
    assert.deepEqual(vaca.marcos, []);

    // custoTotalDia so tem o fixo (300/30/3 efetivo = 10/3 por dia, sem dieta cadastrada) -- marco usa a MESMA taxa da categoria atual
    const custoFixoDiaEsperado = 300 / 30 / 3;
    assert.equal(bezerro.marcos[0].custoAcumulado, 200 * custoFixoDiaEsperado);
    assert.equal(novilha.marcos[1].custoAcumulado, 583 * custoFixoDiaEsperado);
  });

  test('sem dieta cadastrada e sem custo fixo lançado: custoFixoDiaPorCabeca ainda é 0 (não null, efetivo>0) — custoTotalDia e marcos viram 0, não somem', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas', nascimento: 20250101 })];
    const marcos = [marco({ id: 'm1', marco: 'Bezerro -> Garrote', idadeDias: 200 })];
    const [retrato] = montarRetratoMomento(rebanho, null, [], arrobas, [], [], [], marcos, 20260101);
    assert.equal(retrato.custoDietaDia, null);
    assert.equal(retrato.custoFixoDia, 0);
    assert.equal(retrato.custoTotalDia, 0);
    assert.equal(retrato.custoAcumuladoHoje, 0);
    assert.deepEqual(retrato.marcos, [{ nome: 'Bezerro -> Garrote', idadeDias: 200, custoAcumulado: 0 }]);
  });

  test('fazenda filtra o efetivo (mesma logica de calcularFunis)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas', nascimento: 20250101 }),
      animal({ id: 'a2', categoria: 'Bezerro', fazenda: 'Campina grande', nascimento: 20250101 }),
    ];
    const retratoInhumas = montarRetratoMomento(rebanho, 'Inhumas', [], arrobas, [], [], [], [], 20260101);
    assert.equal(retratoInhumas[0].efetivo, 1);
    const retratoTodas = montarRetratoMomento(rebanho, null, [], arrobas, [], [], [], [], 20260101);
    assert.equal(retratoTodas[0].efetivo, 2);
  });
});
