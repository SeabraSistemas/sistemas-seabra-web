import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  aConferir,
  categoriaEstimadaPorIdade,
  classificarValorVenda,
  conciliar,
  estimarValorVenda,
  montarEventos,
  perdasMensais,
  receitaMensal,
  receitaPor,
  removerVendasDuplicadas,
  removerVendasSemRastro,
  resumoFinanceiro,
  VALOR_ABORTO_PADRAO,
  type EventoBase,
} from '@/lib/fi-fcg/financeiro';
import type { CategoriaArroba, LancamentoFinanceiro, RegAborto, RegBaixa, RegRebanho, RegVenda } from '@/lib/fi-fcg/types';

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
function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, ...p,
  };
}

/** Preço padrão de teste (não os valores reais da planilha, só pra não repetir 8 linhas em todo teste). */
const PRECOS: CategoriaArroba[] = [
  { categoria: 'Bezerro', mediaArroba: 12, valorCategoria: 3840 },
  { categoria: 'Bezerra', mediaArroba: 12, valorCategoria: 3840 },
  { categoria: 'Garrote', mediaArroba: 16, valorCategoria: 5120 },
  { categoria: 'Boi', mediaArroba: 19, valorCategoria: 6080 },
  { categoria: 'Novilha', mediaArroba: 15, valorCategoria: 4800 },
  { categoria: 'Touro', mediaArroba: 30, valorCategoria: 9600 },
  { categoria: 'Vaca', mediaArroba: 16, valorCategoria: 5120 },
];

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

describe('categoriaEstimadaPorIdade (espelha a formula real de RebanhoProd.Categoria)', () => {
  test('faixas etarias por sexo', () => {
    assert.equal(categoriaEstimadaPorIdade('Macho', 0), 'Bezerro');
    assert.equal(categoriaEstimadaPorIdade('Macho', 365), 'Bezerro');
    assert.equal(categoriaEstimadaPorIdade('Macho', 366), 'Garrote');
    assert.equal(categoriaEstimadaPorIdade('Macho', 730), 'Garrote');
    assert.equal(categoriaEstimadaPorIdade('Macho', 731), 'Boi');
    assert.equal(categoriaEstimadaPorIdade('Macho', 1095), 'Boi');
    assert.equal(categoriaEstimadaPorIdade('Macho', 1096), 'Touro');
  });
  test('femea: a faixa 366-730 e "Recria" (categoria que nao tem preco cadastrado, ver estimarValorVenda)', () => {
    assert.equal(categoriaEstimadaPorIdade('Fêmea', 0), 'Bezerra');
    assert.equal(categoriaEstimadaPorIdade('Fêmea', 500), 'Recria');
    assert.equal(categoriaEstimadaPorIdade('Fêmea', 1000), 'Novilha');
    assert.equal(categoriaEstimadaPorIdade('Fêmea', 2000), 'Vaca');
  });
  test('sexo desconhecido (nem "Macho" nem "Fêmea", ex: "-") nunca estima — melhor null que chute', () => {
    assert.equal(categoriaEstimadaPorIdade('-', 100), null);
    assert.equal(categoriaEstimadaPorIdade(null, 100), null);
  });
  test('idade null ou negativa nunca estima', () => {
    assert.equal(categoriaEstimadaPorIdade('Macho', null), null);
    assert.equal(categoriaEstimadaPorIdade('Macho', -1), null);
  });
});

describe('estimarValorVenda', () => {
  const precos = new Map(PRECOS.map((p) => [p.categoria, p.valorCategoria!]));

  test('bezerro macho vendido aos 100 dias de vida', () => {
    // nasceu 01/01/2025, vendido 11/04/2025 = 100 dias
    const r = estimarValorVenda('Macho', 20250101, 20250411, precos);
    assert.equal(r.categoria, 'Bezerro');
    assert.equal(r.valor, 3840);
  });

  test('vaca (femea, >1095 dias) vendida', () => {
    const r = estimarValorVenda('Fêmea', 20180101, 20250101, precos); // ~7 anos
    assert.equal(r.categoria, 'Vaca');
    assert.equal(r.valor, 5120);
  });

  test('categoria estimada sem preco cadastrado (Recria) devolve valor null, mas a categoria fica visivel', () => {
    const r = estimarValorVenda('Fêmea', 20230101, 20240701, precos); // 547 dias -> Recria (366-730)
    assert.equal(r.categoria, 'Recria');
    assert.equal(r.valor, null);
  });

  test('sem data de nascimento ou sem data de venda, nao estima', () => {
    assert.deepEqual(estimarValorVenda('Macho', null, 20250101, precos), { categoria: null, valor: null });
    assert.deepEqual(estimarValorVenda('Macho', 20200101, null, precos), { categoria: null, valor: null });
  });
});

describe('conciliar', () => {
  const base = (p: Partial<EventoBase> & { id: string; tipo: EventoBase['tipo'] }): EventoBase => ({
    origem: 'Venda', idAnimal: null, data: null, fazenda: null, cliente: null, pesoKg: null, categoria: null,
    causa: null, valorEvento: null, statusValorVenda: null, categoriaEstimada: null, valorEstimado: null, ...p,
  });

  test('evento e lançamento com mesma chave e mesmo valor => conciliado', () => {
    const { eventos, orfaos } = conciliar(
      [base({ id: 'v1', tipo: 'Venda', idAnimal: '1505', data: 20241004, valorEvento: 3264, statusValorVenda: 'ok' })],
      [lanc({ id: 'f1', identificacao: '1505', descricao: 'Venda', valor: 3264, data: 20241004 })],
    );
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(eventos[0].valorLancado, 3264);
    assert.equal(orfaos.length, 0);
  });

  test('mesma chave, valor diferente => valor-diverge', () => {
    const { eventos } = conciliar(
      [base({ id: 'v1', tipo: 'Venda', idAnimal: '1505', data: 20241004, valorEvento: 3264, statusValorVenda: 'ok' })],
      [lanc({ id: 'f1', identificacao: '1505', descricao: 'Venda', valor: 3000, data: 20241004 })],
    );
    assert.equal(eventos[0].conciliacao, 'valor-diverge');
  });

  test('nenhum lançamento com a chave => sem-lancamento', () => {
    const { eventos, orfaos } = conciliar(
      [base({ id: 'v1', tipo: 'Venda', idAnimal: '1505', data: 20241004, valorEvento: 3264, statusValorVenda: 'ok' })],
      [],
    );
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
    const { eventos } = conciliar(
      [base({ id: 'b1', tipo: 'Conferência', origem: 'Baixa', idAnimal: 'b1', data: 20250311 })],
      [lanc({ id: 'f1', identificacao: 'b1', descricao: 'Conferência', valor: 100, data: 20250311 })],
    );
    assert.equal(eventos[0].conciliacao, 'nao-aplicavel');
    assert.equal(eventos[0].valorMetrica, null);
    assert.equal(eventos[0].origemValor, 'sem-valor');
  });

  test('duas linhas de lançamento com a MESMA chave (duplicata): cada evento consome uma, sobra vira orfao', () => {
    const { eventos, orfaos } = conciliar(
      [base({ id: 'v1', tipo: 'Venda', idAnimal: '7006', data: 20250301, valorEvento: 500, statusValorVenda: 'parece-arroba' })],
      [
        lanc({ id: 'f1', identificacao: '7006', descricao: 'Venda', valor: 500, data: 20250301 }),
        lanc({ id: 'f2', identificacao: '7006', descricao: 'Venda', valor: 500, data: 20250301 }),
      ],
    );
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(orfaos.length, 1); // a segunda duplicata não foi consumida por nenhum evento
  });

  test('duas linhas com a mesma chave e valores diferentes: o evento prefere a de valor igual ao dele', () => {
    const { eventos, orfaos } = conciliar(
      [base({ id: 'b1', tipo: 'Morte', origem: 'Baixa', idAnimal: 'b1', data: 20241004, valorEvento: 3264 })],
      [
        lanc({ id: 'f1', identificacao: 'b1', descricao: 'Morte', valor: 5120, data: 20241004 }),
        lanc({ id: 'f2', identificacao: 'b1', descricao: 'Morte', valor: 3264, data: 20241004 }),
      ],
    );
    assert.equal(eventos[0].valorLancado, 3264); // pegou a f2 (valor igual), não a primeira da fila
    assert.equal(eventos[0].conciliacao, 'conciliado');
    assert.equal(orfaos.length, 1);
    assert.equal(orfaos[0].id, 'f1');
  });

  test('Venda sem valor bom mas com estimativa (categoriaEstimada/valorEstimado ja calculados) usa o estimado, origemValor="estimado"', () => {
    const { eventos } = conciliar(
      [base({ id: 'v1', tipo: 'Venda', idAnimal: '1', data: 20241001, valorEvento: 290, statusValorVenda: 'parece-arroba', categoriaEstimada: 'Boi', valorEstimado: 6080 })],
      [],
    );
    assert.equal(eventos[0].valorMetrica, 6080);
    assert.equal(eventos[0].origemValor, 'estimado');
  });
});

describe('valorMetrica por tipo (via montarEventos)', () => {
  test('Venda ok: usa o valor do proprio evento, nunca cai pro lançamento nem pra estimativa', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: 3264 })],
      [], [], [lanc({ id: 'f1', identificacao: '1', descricao: 'Venda', valor: 5000, data: 20241001 })],
      [animal({ id: '1', sexo: 'Macho', nascimento: 20200101 })], PRECOS,
    );
    assert.equal(eventos[0].valorMetrica, 3264);
    assert.equal(eventos[0].origemValor, 'registrado');
  });

  test('Venda sem valor: estima pela idade+sexo na data da venda, origemValor="estimado"', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20250411, valor: null })], // sem valor
      [], [], [],
      [animal({ id: '1', sexo: 'Macho', nascimento: 20250101 })], // 100 dias na venda -> Bezerro
      PRECOS,
    );
    assert.equal(eventos[0].categoriaEstimada, 'Bezerro');
    assert.equal(eventos[0].valorEstimado, 3840);
    assert.equal(eventos[0].valorMetrica, 3840);
    assert.equal(eventos[0].origemValor, 'estimado');
  });

  test('Venda com valor que nao faz sentido (irrisorio/parece-arroba) TAMBEM e substituida pela estimativa', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20250411, valor: 290 })], // parece preco de @, nao valor total
      [], [], [],
      [animal({ id: '1', sexo: 'Macho', nascimento: 20250101 })],
      PRECOS,
    );
    assert.equal(eventos[0].statusValorVenda, 'parece-arroba');
    assert.equal(eventos[0].valorMetrica, 3840); // estimado, nao os 290 registrados
    assert.equal(eventos[0].origemValor, 'estimado');
  });

  test('Venda sem valor e animal nao encontrado no rebanho: nem vira evento (removerVendasSemRastro)', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: 'nao-existe', data: 20250411, valor: null })],
      [], [], [], [], PRECOS,
    );
    assert.equal(eventos.length, 0);
  });

  test('Venda de fêmea na faixa "Recria": montarEventos (fim a fim) usa o preço DERIVADO (média Bezerra/Novilha), diferente de estimarValorVenda isolado', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20240701, valor: null })],
      [], [], [],
      [animal({ id: '1', sexo: 'Fêmea', nascimento: 20230101 })], // 547 dias -> Recria
      PRECOS,
    );
    assert.equal(eventos[0].categoriaEstimada, 'Recria');
    assert.equal(eventos[0].valorEstimado, (3840 + 4800) / 2); // média Bezerra (3840) / Novilha (4800)
    assert.equal(eventos[0].origemValor, 'estimado');
  });

  test('Morte/Matula: usa o valor do proprio evento quando existe', () => {
    const { eventos } = montarEventos([], [baixa({ id: 'b1', tipo: 'Morte', data: 20241001, valor: 3840 })], [], [], [], []);
    assert.equal(eventos[0].valorMetrica, 3840);
    assert.equal(eventos[0].origemValor, 'registrado');
  });

  test('Morte/Matula: cai pro lançamento quando a Baixa não tem valor', () => {
    const { eventos } = montarEventos(
      [], [baixa({ id: 'b1', tipo: 'Morte', data: 20241001, valor: null })], [],
      [lanc({ id: 'f1', identificacao: 'b1', descricao: 'Morte', valor: 3840, data: 20241001 })], [], [],
    );
    assert.equal(eventos[0].valorMetrica, 3840);
  });

  test('Morte/Matula sem valor NEM categoria: estima pela idade+sexo na data da baixa, origemValor="estimado"', () => {
    const { eventos } = montarEventos(
      [], [baixa({ id: 'b1', tipo: 'Morte', data: 20241009, valor: null, categoria: null })], [], [],
      [animal({ id: 'b1', sexo: 'Fêmea', nascimento: 20241009 })], // 0 dias na baixa -> Bezerra
      PRECOS,
    );
    assert.equal(eventos[0].categoriaEstimada, 'Bezerra');
    assert.equal(eventos[0].valorEstimado, 3840);
    assert.equal(eventos[0].valorMetrica, 3840);
    assert.equal(eventos[0].origemValor, 'estimado');
  });

  test('Morte/Matula sem valor MAS COM categoria própria: nunca reestima (AppSheet já devia ter valorado)', () => {
    const { eventos } = montarEventos(
      [], [baixa({ id: 'b1', tipo: 'Morte', data: 20241009, valor: null, categoria: 'Vaca' })], [], [],
      [animal({ id: 'b1', sexo: 'Fêmea', nascimento: 19900101 })],
      PRECOS,
    );
    assert.equal(eventos[0].categoriaEstimada, null);
    assert.equal(eventos[0].valorMetrica, null);
    assert.equal(eventos[0].origemValor, 'sem-valor');
  });

  test('Morte/Matula sem valor/categoria e animal não encontrado no rebanho: sem estimativa possível', () => {
    const { eventos } = montarEventos(
      [], [baixa({ id: 'nao-existe', tipo: 'Morte', data: 20241009, valor: null, categoria: null })], [], [], [], PRECOS,
    );
    assert.equal(eventos[0].categoriaEstimada, null);
    assert.equal(eventos[0].valorMetrica, null);
    assert.equal(eventos[0].origemValor, 'sem-valor');
  });

  test('Aborto: usa o valor do lançamento quando existe', () => {
    const { eventos } = montarEventos([], [], [aborto({ id: 'a1', idAnimal: 'C430', data: 20240902 })], [
      lanc({ id: 'f1', identificacao: 'C430', descricao: 'Aborto', valor: 2500, data: 20240902 }),
    ], [], []);
    assert.equal(eventos[0].valorMetrica, 2500);
    assert.equal(eventos[0].origemValor, 'registrado');
  });

  test('Aborto sem NENHUM lançamento: cai pro valor padrão fixo (VALOR_ABORTO_PADRAO), origemValor="estimado"', () => {
    const { eventos } = montarEventos([], [], [aborto({ id: 'a1', idAnimal: 'C430', data: 20240902 })], [], [], []);
    assert.equal(eventos[0].valorMetrica, VALOR_ABORTO_PADRAO);
    assert.equal(eventos[0].origemValor, 'estimado');
  });

  test('Conferência: nunca tem valor', () => {
    const { eventos } = montarEventos([], [baixa({ id: 'b1', tipo: 'Conferência', data: 20250311, valor: 5120 })], [], [], [], []);
    assert.equal(eventos[0].valorMetrica, null);
  });
});

describe('resumoFinanceiro', () => {
  test('separa receita registrada de estimada, soma as duas em receitaTotal/resultadoTotal', () => {
    const { eventos } = montarEventos(
      [
        venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: 3264 }), // ok -> registrada
        venda({ id: 'v2', idAnimal: '2', data: 20250411, valor: 290, pesoKg: 470 }), // vira estimada
        // v3 (idAnimal 'sumido', sem valor, animal não existe no rebanho) nem
        // vira evento — ver describe('removerVendasSemRastro').
        venda({ id: 'v3', idAnimal: 'sumido', data: 20241002, valor: null }),
      ],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20241003, valor: 1000 })],
      [aborto({ id: 'a1', idAnimal: 'x', data: 20241004 })],
      [lanc({ id: 'f1', identificacao: 'x', descricao: 'Aborto', valor: 500, data: 20241004 })],
      [animal({ id: '2', sexo: 'Macho', nascimento: 20250101 })], // 100 dias na venda -> Bezerro, R$3.840
      PRECOS,
    );
    const r = resumoFinanceiro(eventos);
    assert.equal(r.cabecasVendidas, 2);
    assert.equal(r.vendasRegistradas, 1);
    assert.equal(r.vendasEstimadas, 1);
    assert.equal(r.vendasSemValor, 0);
    assert.equal(r.vendasComPeso, 1);
    assert.equal(r.receitaRegistrada, 3264);
    assert.equal(r.receitaEstimada, 3840);
    assert.equal(r.receitaTotal, 3264 + 3840);
    assert.equal(r.ticketMedio, (3264 + 3840) / 2);
    assert.equal(r.perdasMorteMatula, 1000);
    assert.equal(r.perdasAborto, 500);
    assert.equal(r.perdasRegistradas, 1500);
    assert.equal(r.resultadoTotal, 3264 + 3840 - 1500);
    assert.equal(r.percentualPerdasReceita, (1500 / (3264 + 3840)) * 100);
  });

  test('sem nenhuma venda com valor nem estimativa, receita 0 e percentual null (não divide por zero)', () => {
    const { eventos } = montarEventos([venda({ id: 'v1', data: 20241001, valor: 290 })], [], [], [], [], []);
    const r = resumoFinanceiro(eventos);
    assert.equal(r.receitaTotal, 0);
    assert.equal(r.ticketMedio, null);
    assert.equal(r.percentualPerdasReceita, null);
  });
});

describe('série mensal preenche mês sem dado', () => {
  test('receitaMensal (registrada+estimada) e perdasMensais agrupam por aaaamm', () => {
    const { eventos } = montarEventos(
      [venda({ id: 'v1', data: 20241015, valor: 3264 }), venda({ id: 'v2', data: 20241101, valor: 4000 })],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20241020, valor: 1000 })],
      [], [], [], [],
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
      [], [], [], [], [],
    );
    const porCliente = receitaPor(eventos, (e) => e.cliente, 'Sem cliente');
    assert.deepEqual(new Map(porCliente.map((f) => [f.rotulo, f.valor])), new Map([['Frigorífico', 3264], ['Sem cliente', 4000]]));
  });
});

describe('removerVendasDuplicadas', () => {
  test('mesmo animal + mesma data => mantém só a primeira', () => {
    const vendas = [
      venda({ id: 'v1', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }),
      venda({ id: 'v2', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }),
    ];
    const resultado = removerVendasDuplicadas(vendas);
    assert.deepEqual(resultado.map((v) => v.id), ['v1']);
  });
  test('mesmo animal, data diferente => são 2 vendas reais, nenhuma removida', () => {
    const vendas = [
      venda({ id: 'v1', idAnimal: '24011', data: 20241017 }),
      venda({ id: 'v2', idAnimal: '24011', data: 20250101 }),
    ];
    assert.deepEqual(removerVendasDuplicadas(vendas).map((v) => v.id), ['v1', 'v2']);
  });
  test('idAnimal vazio nunca conta como duplicata de outra venda sem idAnimal', () => {
    const vendas = [
      venda({ id: 'v1', idAnimal: null, data: 20241017 }),
      venda({ id: 'v2', idAnimal: null, data: 20241017 }),
    ];
    assert.deepEqual(removerVendasDuplicadas(vendas).map((v) => v.id), ['v1', 'v2']);
  });
  test('afeta montarEventos de ponta a ponta: duplicata não vira EventoFin nem entra na receita', () => {
    const { eventos } = montarEventos(
      [
        venda({ id: 'v1', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }),
        venda({ id: 'v2', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }),
      ],
      [], [], [], [], [],
    );
    assert.equal(eventos.length, 1);
    assert.equal(eventos[0].id, 'v1');
    assert.equal(resumoFinanceiro(eventos).receitaRegistrada, 4000);
  });
});

describe('removerVendasSemRastro', () => {
  const rebanhoPorId = new Map([['1', { sexo: 'Macho', nascimento: 20200101 }]]);

  test('mantém venda com valor bom mesmo se o animal não existir no rebanho', () => {
    const vendas = [venda({ id: 'v1', idAnimal: 'nao-existe', valor: 3264 })];
    assert.deepEqual(removerVendasSemRastro(vendas, rebanhoPorId).map((v) => v.id), ['v1']);
  });

  test('mantém venda sem valor bom quando o animal EXISTE no rebanho (dá pra estimar)', () => {
    const vendas = [venda({ id: 'v1', idAnimal: '1', valor: null })];
    assert.deepEqual(removerVendasSemRastro(vendas, rebanhoPorId).map((v) => v.id), ['v1']);
  });

  test('remove venda sem valor bom E sem o animal no rebanho', () => {
    const vendas = [venda({ id: 'v1', idAnimal: 'nao-existe', valor: null })];
    assert.deepEqual(removerVendasSemRastro(vendas, rebanhoPorId), []);
  });

  test('venda sem idAnimal nenhum e sem valor bom também é removida', () => {
    const vendas = [venda({ id: 'v1', idAnimal: null, valor: null })];
    assert.deepEqual(removerVendasSemRastro(vendas, rebanhoPorId), []);
  });

  test('fim a fim: o lançamento da venda excluída (sem rastro) some, não vira "lancamento-orfao"', () => {
    const { eventos, orfaos } = montarEventos(
      [venda({ id: 'v1', idAnimal: 'nao-existe', data: 20241001, valor: null })], // sem rastro, excluída
      [], [],
      [lanc({ id: 'f1', identificacao: 'nao-existe', descricao: 'Venda', valor: 100, data: 20241001 })],
      [], [],
    );
    assert.equal(eventos.length, 0);
    assert.deepEqual(orfaos, []); // o lançamento foi removido ANTES da conciliação, não sobra órfão
  });

  test('fim a fim: o lançamento da venda duplicada excedente some, não vira "lancamento-orfao"', () => {
    const { eventos, orfaos } = montarEventos(
      [
        venda({ id: 'v1', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }),
        venda({ id: 'v2', idAnimal: '24011', data: 20241017, valor: 4000, cliente: 'Frigorífico' }), // duplicata, excluída
      ],
      [], [],
      [
        lanc({ id: 'f1', identificacao: '24011', descricao: 'Venda', valor: 4000, data: 20241017 }),
        lanc({ id: 'f2', identificacao: '24011', descricao: 'Venda', valor: 4000, data: 20241017 }),
      ],
      [], [],
    );
    assert.equal(eventos.length, 1);
    assert.equal(eventos[0].conciliacao, 'conciliado'); // v1 consome um dos dois lançamentos normalmente
    assert.deepEqual(orfaos, []); // o segundo lançamento (da venda duplicada excluída) não sobra órfão
  });
});

describe('aConferir', () => {
  test('venda sem rastro nem vira evento (nao entra em A conferir); baixa sem valor, data futura, sem-lancamento, orfao continuam', () => {
    const { eventos, orfaos } = montarEventos(
      [
        // idAnimal '1' não existe em rebanho ([] abaixo) => removerVendasSemRastro
        // já filtra, nem chega a virar evento — não aparece em A conferir.
        venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: null, pesoKg: null }),
      ],
      [baixa({ id: 'b1', tipo: 'Morte', data: 20990101, valor: null })],
      [],
      [lanc({ id: 'f1', identificacao: '999', descricao: 'Venda', valor: 100, data: 20241001 })],
      [], PRECOS,
    );
    assert.equal(eventos.length, 1); // só a baixa b1 — v1 foi filtrada
    const itens = aConferir(eventos, orfaos, 20260101);
    const problemas = itens.map((i) => i.problema).sort();
    assert.deepEqual(problemas, [
      'baixa-sem-valor',
      'data-invalida-ou-futura',
      'lancamento-orfao', // f1, que nunca bateria com v1 mesmo (identificacao diferente)
      'sem-lancamento', // a baixa b1
    ].sort());
  });

  test('baixa com valor estimado pela categoria NÃO aparece como "baixa-sem-valor" (a estimativa já resolveu, só o "sem-lancamento" genuíno fica)', () => {
    const { eventos, orfaos } = montarEventos(
      [], [baixa({ id: 'b1', tipo: 'Morte', data: 20241009, valor: null, categoria: null })], [], [],
      [animal({ id: 'b1', sexo: 'Fêmea', nascimento: 20241009 })], PRECOS,
    );
    const itens = aConferir(eventos, orfaos, 20260101);
    assert.deepEqual(itens.map((i) => i.problema).sort(), ['sem-lancamento']);
  });

  test('venda com valor substituido pela estimativa NÃO aparece em A conferir (informativo, já mostrado na coluna Origem)', () => {
    const { eventos, orfaos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20250411, valor: 290, pesoKg: 470 })],
      [], [], [],
      [animal({ id: '1', sexo: 'Macho', nascimento: 20250101 })],
      PRECOS,
    );
    const itens = aConferir(eventos, orfaos, 20260101);
    assert.deepEqual(itens.map((i) => i.problema).sort(), ['sem-lancamento']);
  });

  test('sem problema nenhum, lista vazia', () => {
    const { eventos, orfaos } = montarEventos(
      [venda({ id: 'v1', idAnimal: '1', data: 20241001, valor: 3264, pesoKg: 470 })],
      [], [], [lanc({ id: 'f1', identificacao: '1', descricao: 'Venda', valor: 3264, data: 20241001 })], [], [],
    );
    assert.deepEqual(aConferir(eventos, orfaos, 20260101), []);
  });
});
