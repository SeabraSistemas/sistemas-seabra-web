import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  mapAbortos,
  mapBaixas,
  mapCategoriaArroba,
  mapCategoriasCusto,
  mapCustos,
  mapDescricoesCusto,
  mapFinanceiro,
  mapIatf,
  mapPartos,
  mapPesagem,
  mapRebanho,
  mapToque,
  mapVendas,
  toObjects,
} from '@/lib/fi-fcg/mapeadores';

describe('toObjects', () => {
  test('mapeia por nome de header, com trim', () => {
    const rows = [
      [' ID animal ', 'Fazenda'],
      ['A1', 'Inhumas'],
    ];
    assert.deepEqual(toObjects(rows), [{ 'ID animal': 'A1', Fazenda: 'Inhumas' }]);
  });
  test('linha mais curta que o header vira string vazia', () => {
    const rows = [['ID animal', 'Fazenda'], ['A1']];
    assert.deepEqual(toObjects(rows), [{ 'ID animal': 'A1', Fazenda: '' }]);
  });
  test('null/[] vira lista vazia', () => {
    assert.deepEqual(toObjects(null), []);
    assert.deepEqual(toObjects([]), []);
  });
});

describe('mapIatf', () => {
  test('le o header real "Patida (sêmen)" (typo de origem) e separa ecc cru de eccNum', () => {
    const rows = [
      ['ID animal', 'Data IATF', 'Patida (sêmen)', 'ECC', 'Fazenda'],
      ['23', '09/11/2023', 'B2887', '2,5', 'Inhumas'],
    ];
    const [r] = mapIatf(rows);
    assert.equal(r.id, '23');
    assert.equal(r.data, 20231109);
    assert.equal(r.partida, 'B2887');
    assert.equal(r.ecc, '2,5');
    assert.equal(r.eccNum, 2.5);
  });
  test('aceita o alias "Partida (sêmen)" (grafia corrigida) tambem', () => {
    const rows = [
      ['ID animal', 'Partida (sêmen)'],
      ['23', 'TNT'],
    ];
    assert.equal(mapIatf(rows)[0].partida, 'TNT');
  });
  test('linha sem ID animal e descartada', () => {
    const rows = [
      ['ID animal', 'Fazenda'],
      ['', 'Inhumas'],
    ];
    assert.deepEqual(mapIatf(rows), []);
  });
});

describe('mapToque', () => {
  test('mapeia diagnostico/escore/idade', () => {
    const rows = [
      ['ID animal', 'Data', 'Diagnóstico', 'Escore', 'Idade atual', 'Status'],
      ['507', '25/06/2024', 'Vazia', '3', '7', 'Solteira'],
    ];
    const [r] = mapToque(rows);
    assert.equal(r.diagnostico, 'Vazia');
    assert.equal(r.escoreNum, 3);
    assert.equal(r.idadeAnos, 7);
    assert.equal(r.status, 'Solteira');
  });
});

describe('mapRebanho', () => {
  test('le a coluna "lote" em MINUSCULA (nao "Lote")', () => {
    const rows = [
      ['ID animal', 'Categoria', 'lote', 'Lote'],
      ['A1', 'Vaca', '7 - Campina grande', 'não é isto'],
    ];
    assert.equal(mapRebanho(rows)[0].lote, '7 - Campina grande');
  });

  test('mapeia Data de nascimento (nunca sobrescrita, base pra estimativa de venda)', () => {
    const rows = [
      ['ID animal', 'Data de nascimento'],
      ['A1', '10/08/2018'],
    ];
    assert.equal(mapRebanho(rows)[0].nascimento, 20180810);
  });
});

describe('mapCategoriaArroba', () => {
  test('mapeia categoria, media@ e valor ja calculado', () => {
    const rows = [
      ['ID valor categoria', 'Categoria', 'Média@', 'Valor categoria'],
      ['ncbvxc0001', 'Bezerro', '12,0', 'R$ 3.840,00'],
    ];
    const [c] = mapCategoriaArroba(rows);
    assert.equal(c.categoria, 'Bezerro');
    assert.equal(c.mediaArroba, 12);
    assert.equal(c.valorCategoria, 3840);
  });
  test('linha sem categoria e descartada', () => {
    const rows = [
      ['Categoria', 'Média@', 'Valor categoria'],
      ['', '12,0', 'R$ 3.840,00'],
    ];
    assert.deepEqual(mapCategoriaArroba(rows), []);
  });
});

describe('mapPartos', () => {
  test('mesmo mapeador serve pra Parto e Parto CG (mesmas colunas)', () => {
    const rows = [
      ['ID animal', 'ID Mãe', 'ID Pai', 'Data de nascimento', 'Sexo', 'Fazenda'],
      ['900215007821894', '1456', '', '30/08/2024', 'Macho', 'Inhumas'],
    ];
    const [r] = mapPartos(rows);
    assert.equal(r.idMae, '1456');
    assert.equal(r.idPai, null);
    assert.equal(r.nascimento, 20240830);
    assert.equal(r.fazenda, 'Inhumas');
  });
});

describe('mapPesagem', () => {
  test('le "destino" em MINUSCULO (na RebanhoProd e "Destino")', () => {
    const rows = [
      ['ID animal', 'Peso/kg', 'destino', 'Destino'],
      ['A1', '420', 'Transferir', 'não é isto'],
    ];
    assert.equal(mapPesagem(rows)[0].destino, 'Transferir');
    assert.equal(mapPesagem(rows)[0].pesoKg, 420);
  });
});

describe('mapBaixas', () => {
  test('Valor vem em R$ formatado, nunca numero puro', () => {
    const rows = [
      ['ID animal', 'Data da baixa', 'Causa da baixa', 'Valor', 'idade'],
      ['b49', '21/09/2024', 'Matula', 'R$ 3.264,00', '1801'],
    ];
    const [r] = mapBaixas(rows);
    assert.equal(r.valor, 3264);
    assert.equal(r.idadeDias, 1801);
  });
});

describe('mapVendas', () => {
  test('Valor R$ e negativo', () => {
    const rows = [
      ['ID venda', 'ID animal', 'Valor'],
      ['v1', '1505', '-R$ 0,01'],
    ];
    assert.equal(mapVendas(rows)[0].valor, -0.01);
  });
  test('sem valor fica null (5% das vendas tem valor, o resto precisa ficar null, nao 0)', () => {
    const rows = [
      ['ID venda', 'ID animal', 'Valor'],
      ['v1', '1505', ''],
    ];
    assert.equal(mapVendas(rows)[0].valor, null);
  });
  test('sem ID venda, gera um id posicional (a linha ainda entra na lista)', () => {
    const rows = [
      ['ID venda', 'ID animal'],
      ['', '1505'],
    ];
    assert.equal(mapVendas(rows)[0].id, 'venda-0');
  });
});

describe('mapAbortos', () => {
  test('mapeia suspeita e data', () => {
    const rows = [
      ['ID aborto', 'ID animal', 'Data do aborto', 'Suspeita', 'Fazenda'],
      ['a1', 'C430', '02/09/2024', 'Erva', 'Campina grande'],
    ];
    const [r] = mapAbortos(rows);
    assert.equal(r.suspeita, 'Erva');
    assert.equal(r.fazenda, 'Campina grande');
  });
});

describe('mapFinanceiro', () => {
  test('Valor total em R$; Fazenda existe no tipo mas NUNCA deve ser usada como fonte de verdade (ver financeiro.ts)', () => {
    const rows = [
      ['ID financeiro', 'Identificação', 'Descrição', 'Categoria', 'Valor total', 'Data'],
      ['f1', 'E82', 'Venda', 'Receita', 'R$ 5.120,00', '18/03/2025'],
    ];
    const [r] = mapFinanceiro(rows);
    assert.equal(r.valor, 5120);
    assert.equal(r.descricao, 'Venda');
  });
});

describe('mapCategoriasCusto', () => {
  test('mapeia id e nome', () => {
    const rows = [
      ['ID', 'Nome'],
      ['w7eymne6', 'Geral'],
    ];
    assert.deepEqual(mapCategoriasCusto(rows), [{ id: 'w7eymne6', nome: 'Geral' }]);
  });
  test('linha sem ID e descartada', () => {
    const rows = [
      ['ID', 'Nome'],
      ['', 'Sem id'],
    ];
    assert.deepEqual(mapCategoriasCusto(rows), []);
  });
});

describe('mapDescricoesCusto', () => {
  test('mapeia id e nome (mesmo formato de mapCategoriasCusto)', () => {
    const rows = [
      ['ID', 'Nome'],
      ['ab12cd34', 'Combustível'],
    ];
    assert.deepEqual(mapDescricoesCusto(rows), [{ id: 'ab12cd34', nome: 'Combustível' }]);
  });
  test('linha sem ID e descartada', () => {
    const rows = [
      ['ID', 'Nome'],
      ['', 'Sem id'],
    ];
    assert.deepEqual(mapDescricoesCusto(rows), []);
  });
});

describe('mapCustos', () => {
  test('mapeia um custo mensal completo, Valor em R$', () => {
    const rows = [
      ['ID', 'Descrição', 'Categoria', 'Fazenda', 'Tipo', 'Valor', 'Data início', 'Data fim', 'Observação'],
      ['c1', 'Ração', 'Geral', 'Inhumas', 'Mensal', 'R$ 15.000,00', '01/01/2025', '', 'confinamento'],
    ];
    const [c] = mapCustos(rows);
    assert.equal(c.descricao, 'Ração');
    assert.equal(c.tipo, 'Mensal');
    assert.equal(c.valor, 15000);
    assert.equal(c.dataInicio, 20250101);
    assert.equal(c.dataFim, null); // custo em aberto
  });
  test('Tipo fora de "Mensal"/"Anual" vira null, nao quebra', () => {
    const rows = [
      ['ID', 'Tipo'],
      ['c1', 'Trimestral'],
    ];
    assert.equal(mapCustos(rows)[0].tipo, null);
  });
  test('linha sem ID e descartada', () => {
    const rows = [
      ['ID', 'Descrição'],
      ['', 'sem id'],
    ];
    assert.deepEqual(mapCustos(rows), []);
  });
});
