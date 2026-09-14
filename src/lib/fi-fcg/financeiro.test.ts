import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  aConferir,
  classificarValorVenda,
  conciliar,
  montarEventos,
  perdasMensais,
  receitaMensal,
  receitaPor,
  resumoFinanceiro,
  type EventoBase,
} from '@/lib/fi-fcg/financeiro';
import type { LancamentoFinanceiro, RegAborto, RegBaixa, RegVenda } from '@/lib/fi-fcg/types';

function venda(p: Partial<RegVenda> & { id: string }): RegVenda {
  return { idAnimal: null, data: null, valor: null, cliente: null, fazenda: null, pesoKg: null, ...p };
}
function baixa(p: Partial<RegBaixa> & { id: string }): RegBaixa {
  return { data: null, tipo: null, causaObito: null, valor: null, fazenda: null, obs: null, categoria: null, idadeDias: null, ...p };
}
function aborto(p: Partial<RegAborto> & { id: string }): RegAborto {
  return { idAnimal: null, data: null, suspeita: null, fazenda: null, ...p };
}
function lanc(p: Partial<LancamentoFinanceiro> & { id: string }): LancamentoFinanceiro {
  return { identificacao: null, descricao: null, categoria: null, valor: null, data: null, ...p };
}

describe('classificarValorVenda', () => {
  test('sem valor', () => assert.equal(classificarValorVenda(null), 'sem-valor'));
  test('irrisorio (< 100)', () => assert.equal(classificarValorVenda(0.01), 'irrisorio'));
  test('parece arroba (100-1000)', () => {
    assert.equal(classificarValorVenda(100), 'parece-arroba');
    assert.equal(classificarValorVenda(290), 'parece-arroba');
    assert.equal(classificarValorVenda(1000), 'parece-arroba');
  });
  test('ok (entre 1000 e 20000)', () => {
    assert.equal(classificarValorVenda(1000.01), 'ok');
    assert.equal(classificarValorVenda(3264), 'ok');
  });
  test('alto (> 20000)', () => assert.equal(classificarValorVenda(20000.01), 'alto'));
  test('negativo usa o valor absoluto', () => assert.equal(classificarValorVenda(-0.01), 'irrisorio'));
});

describe('conciliar', () => {
  test('evento e lançamento com mesma chave e mesmo valor => conciliado', () => {
    const base: EventoBase[] = [
      {
        origem: 'Venda',
        tipo: 'Venda',
        id: 'v1',
        idAnimal: '1505',
        data: 20241004,
        fazenda: 'Inhumas',
        cliente: 'Frigorífico',
        pesoKg: 441,
        categoria: null,
        causa: null,
        valorEvento: 3264,
        statusValorVenda: 'ok',
      },
    ];
    const { eventos, orfaos } = conciliar(base, [lanc({ id: 'f1', identificacao: '1505', descricao: 'Venda', valor: 3264, data: 20241004 })]);
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(eventos[0].valorLancado, 3264);
    assert.equal(orfaos.length, 0);
  });

  test('mesma chave, valor diferente => valor-diverge', () => {
    const base: EventoBase[] = [
      {
        origem: 'Venda', tipo: 'Venda', id: 'v1', idAnimal: '1505', data: 20241004, fazenda: null, cliente: null,
        pesoKg: null, categoria: null, causa: null, valorEvento: 3264, statusValorVenda: 'ok',
      },
    ];
    const { eventos } = conciliar(base, [lanc({ id: 'f1', identificacao: '1505', descricao: 'Venda', valor: 3000, data: 20241004 })]);
    assert.equal(eventos[0].conciliacao, 'valor-diverge');
  });

  test('nenhum lançamento com a chave => sem-lancamento', () => {
    const base: EventoBase[] = [
      {
        origem: 'Venda', tipo: 'Venda', id: 'v1', idAnimal: '1505', data: 20241004, fazenda: null, cliente: null,
        pesoKg: null, categoria: null, causa: null, valorEvento: 3264, statusValorVenda: 'ok',
      },
    ];
    const { eventos, orfaos } = conciliar(base, []);
    assert.equal(eventos[0].conciliacao, 'sem-lancamento');
    assert.equal(eventos[0].valorLancado, null);
    assert.equal(orfaos.length, 0);
  });

  test('lançamento sem evento correspondente vira orfao', () => {
    const { orfaos } = conciliar([], [lanc({ id: 'f1', identificacao: '999', descricao: 'Venda', valor: 100, data: 20241004 })]);
    assert.equal(orfaos.length, 1);
    assert.equal(orfaos[0].id, 'f1');
  });

  test('Conferência nunca concilia (livro-caixa não tem essa Descrição)', () => {
    const base: EventoBase[] = [
      {
        origem: 'Baixa', tipo: 'Conferência', id: 'b1', idAnimal: 'b1', data: 20250311, fazenda: null, cliente: null,
        pesoKg: null, categoria: null, causa: null, valorEvento: null, statusValorVenda: null,
      },
    ];
    const { eventos } = conciliar(base, [lanc({ id: 'f1', identificacao: 'b1', descricao: 'Conferência', valor: 100, data: 20250311 })]);
    assert.equal(eventos[0].conciliacao, 'nao-aplicavel');
    assert.equal(eventos[0].valorMetrica, null);
  });

  test('duas linhas de lançamento com a MESMA chave (duplicata): cada evento consome uma, sobra vira orfao', () => {
    const base: EventoBase[] = [
      {
        origem: 'Venda', tipo: 'Venda', id: 'v1', idAnimal: '7006', data: 20250301, fazenda: null, cliente: null,
        pesoKg: null, categoria: null, causa: null, valorEvento: 500, statusValorVenda: 'parece-arroba',
      },
    ];
    const { eventos, orfaos } = conciliar(base, [
      lanc({ id: 'f1', identificacao: '7006', descricao: 'Venda', valor: 500, data: 20250301 }),
      lanc({ id: 'f2', identificacao: '7006', descricao: 'Venda', valor: 500, data: 20250301 }),
    ]);
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(orfaos.length, 1); // a segunda duplicata não foi consumida por nenhum evento
  });

  test('duas linhas com a mesma chave e valores diferentes: o evento prefere a de valor igual ao dele', () => {
    const base: EventoBase[] = [
      {
        origem: 'Baixa', tipo: 'Morte', id: 'b1', idAnimal: 'b1', data: 20241004, fazenda: null, cliente: null,
        pesoKg: null, categoria: null, causa: null, valorEvento: 3264, statusValorVenda: null,
      },
    ];
    const { eventos, orfaos } = conciliar(base, [
      lanc({ id: 'f1', identificacao: 'b1', descricao: 'Morte', valor: 5120, data: 20241004 }),
      lanc({ id: 'f2', identificacao: 'b1', descricao: 'Morte', valor: 3264, data: 20241004 }),
    ]);
    assert.equal(eventos[0].valorLancado, 3264); // pegou a f2 (valor igual), não a primeira da fila
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(orfaos.length, 1);
    assert.equal(orfaos[0].id, 'f1');
  });
});

describe('valorMetrica por tipo (via montarEventos)', () => {
  test('Venda: só conta se statusValorVenda for ok, nunca cai pro lançamento', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: 290 })], // "parece-arroba", não é ok
      [],
      [],
      [lanc({ id: 'f1', identificacao: '1', descricao: 'Venda', valor: 290, data: 20241001 })],
    );
    assert.equal(eventos[0].statusValorVenda, 'parece-arroba');
    assert.equal(eventos[0].valorMetrica, null); // mesmo tendo um lançamento com valor, não entra (decisão "só o registrado")
  });

  test('Morte/Matula: usa o valor do proprio evento quando existe', () => {
    const { eventos } = montarEventos([], [baixa({ id: 'b1', tipo: 'Morte', data: 20241001, valor: 3840 })], [], []);
    assert.equal(eventos[0].valorMetrica, 3840);
  });

  test('Morte/Matula: cai pro lançamento quando a Baixa não tem valor', () => {
    const { eventos } = montarEventos(
      [],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20241001, valor: null })],
      [],
      [lanc({ id: 'f1', identificacao: 'b1', descricao: 'Morte', valor: 3840, data: 20241001 })],
    );
    assert.equal(eventos[0].valorMetrica, 3840);
  });

  test('Aborto: SEMPRE vem do lançamento (a aba Aborto não tem coluna de valor)', () => {
    const { eventos } = montarEventos([], [], [aborto({ id: 'a1', idAnimal: 'C430', data: 20240902 })], [
      lanc({ id: 'f1', identificacao: 'C430', descricao: 'Aborto', valor: 2500, data: 20240902 }),
    ]);
    assert.equal(eventos[0].valorMetrica, 2500);
  });

  test('Conferência: nunca tem valor', () => {
    const { eventos } = montarEventos([], [baixa({ id: 'b1', tipo: 'Conferência', data: 20250311, valor: 5120 })], [], []);
    assert.equal(eventos[0].valorMetrica, null);
  });
});

describe('resumoFinanceiro', () => {
  test('soma receita só das vendas ok, perdas de Morte+Matula+Aborto, resultado e percentual', () => {
    const { eventos } = montarEventos(
      [
        venda({ id: 'v1', data: 20241001, valor: 3264 }), // ok
        venda({ id: 'v2', data: 20241002, valor: 290, pesoKg: 470 }), // parece-arroba, não conta
      ],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20241003, valor: 1000 })],
      [aborto({ id: 'a1', idAnimal: 'x', data: 20241004 })],
      [lanc({ id: 'f1', identificacao: 'x', descricao: 'Aborto', valor: 500, data: 20241004 })],
    );
    const r = resumoFinanceiro(eventos);
    assert.equal(r.cabecasVendidas, 2);
    assert.equal(r.vendasComValorOk, 1);
    assert.equal(r.vendasComPeso, 1);
    assert.equal(r.receitaRegistrada, 3264);
    assert.equal(r.ticketMedio, 3264);
    assert.equal(r.perdasMorteMatula, 1000);
    assert.equal(r.perdasAborto, 500);
    assert.equal(r.perdasRegistradas, 1500);
    assert.equal(r.resultadoRegistrado, 3264 - 1500);
    assert.equal(r.percentualPerdasReceita, (1500 / 3264) * 100);
  });

  test('sem nenhuma venda com valor, receita 0 e percentual null (não divide por zero)', () => {
    const { eventos } = montarEventos([venda({ id: 'v1', data: 20241001, valor: 290 })], [], [], []);
    const r = resumoFinanceiro(eventos);
    assert.equal(r.receitaRegistrada, 0);
    assert.equal(r.ticketMedio, null);
    assert.equal(r.percentualPerdasReceita, null);
  });
});

describe('série mensal preenche mês sem dado', () => {
  test('receitaMensal e perdasMensais agrupam por aaaamm', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', data: 20241015, valor: 3264 }), venda({ id: 'v2', data: 20241101, valor: 4000 })],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20241020, valor: 1000 })],
      [],
      [],
    );
    assert.deepEqual(receitaMensal(eventos).sort((a, b) => a.mes.localeCompare(b.mes)), [
      { mes: '202410', valor: 3264 },
      { mes: '202411', valor: 4000 },
    ]);
    assert.deepEqual(perdasMensais(eventos), [{ mes: '202410', valor: 1000 }]);
  });
});

describe('receitaPor', () => {
  test('agrupa por cliente, com rótulo "Sem cliente" quando ausente', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', data: 20241001, valor: 3264, cliente: 'Frigorífico' }), venda({ id: 'v2', data: 20241001, valor: 4000, cliente: null })],
      [],
      [],
      [],
    );
    const porCliente = receitaPor(eventos, (e) => e.cliente, 'Sem cliente');
    assert.deepEqual(new Map(porCliente.map((f) => [f.rotulo, f.valor])), new Map([['Frigorífico', 3264], ['Sem cliente', 4000]]));
  });
});

describe('aConferir', () => {
  test('venda sem valor, venda sem peso, data futura, baixa sem valor, sem-lancamento, orfao', () => {
    const { eventos, orfaos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: null, pesoKg: null })],
      [baixa({ id: 'b1', idAnimal: '2', tipo: 'Morte', data: 20990101, valor: null })],
      [],
      [lanc({ id: 'f1', identificacao: '999', descricao: 'Venda', valor: 100, data: 20241001 })],
    );
    const itens = aConferir(eventos, orfaos, 20260101);
    const problemas = itens.map((i) => i.problema).sort();
    assert.deepEqual(problemas, [
      'baixa-sem-valor',
      'data-invalida-ou-futura',
      'lancamento-orfao',
      'sem-lancamento', // a venda v1
      'sem-lancamento', // a baixa b1
      'venda-sem-peso',
      'venda-sem-valor',
    ].sort());
  });

  test('sem problema nenhum, lista vazia', () => {
    const { eventos, orfaos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: 3264, pesoKg: 470 })],
      [],
      [],
      [lanc({ id: 'f1', identificacao: '1', descricao: 'Venda', valor: 3264, data: 20241001 })],
    );
    assert.deepEqual(aConferir(eventos, orfaos, 20260101), []);
  });
});
