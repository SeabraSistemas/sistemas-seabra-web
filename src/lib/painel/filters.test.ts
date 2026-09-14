import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  casaComVazio,
  comparadorDataDesc,
  dentroFaixa,
  dentroPeriodo,
  filtrarPor,
  opcoesComVazio,
  opcoesExcluindo,
  type Condicao,
} from '@/lib/painel/filters';

type Bicho = { id: string; fazenda: string; lote: string | null; idade: number | null; data: string | null };

const REBANHO: Bicho[] = [
  { id: 'A1', fazenda: 'Inhumas', lote: 'L1', idade: 10, data: '20250101' },
  { id: 'A2', fazenda: 'Inhumas', lote: 'L2', idade: 20, data: '20250201' },
  { id: 'A3', fazenda: 'Campina grande', lote: null, idade: null, data: null },
  { id: 'A4', fazenda: 'Campina grande', lote: 'L1', idade: 30, data: '20250301' },
];

function condicoes(fazenda: string, lote: string): Condicao<Bicho>[] {
  return [
    { key: 'fazenda', test: (b) => !fazenda || b.fazenda === fazenda },
    { key: 'lote', test: (b) => casaComVazio(b.lote, lote, '__sem_lote__') },
  ];
}

describe('filtrarPor', () => {
  test('AND de todas as condicoes', () => {
    const out = filtrarPor(REBANHO, condicoes('Inhumas', ''));
    assert.deepEqual(out.map((b) => b.id), ['A1', 'A2']);
  });
});

describe('opcoesExcluindo (faceted)', () => {
  test('escolher fazenda estreita as opcoes de lote', () => {
    const cs = condicoes('Campina grande', '');
    const lotes = opcoesExcluindo(REBANHO, cs, 'lote', (b) => b.lote);
    assert.deepEqual(lotes, ['L1']);
  });
  test('sem nenhum filtro ativo, opcoes vem de tudo', () => {
    const cs = condicoes('', '');
    const fazendas = opcoesExcluindo(REBANHO, cs, 'fazenda', (b) => b.fazenda);
    assert.deepEqual(fazendas, ['Campina grande', 'Inhumas']);
  });
  test('comparador customizado (datas do mais recente)', () => {
    const cs: Condicao<Bicho>[] = [];
    const datas = opcoesExcluindo(REBANHO, cs, 'data', (b) => b.data, comparadorDataDesc);
    assert.deepEqual(datas, ['20250301', '20250201', '20250101']);
  });
});

describe('casaComVazio / opcoesComVazio', () => {
  test('filtro vazio deixa passar tudo, inclusive quem nao tem valor', () => {
    assert.equal(casaComVazio('L1', '', '__sem_lote__'), true);
    assert.equal(casaComVazio(null, '', '__sem_lote__'), true);
  });
  test('a sentinela casa so com quem nao tem valor', () => {
    assert.equal(casaComVazio(null, '__sem_lote__', '__sem_lote__'), true);
    assert.equal(casaComVazio('L1', '__sem_lote__', '__sem_lote__'), false);
  });
  test('sentinela so aparece nas opcoes se existir item sem valor', () => {
    const cs: Condicao<Bicho>[] = [];
    const lotes = opcoesComVazio(REBANHO, cs, 'lote', (b) => b.lote, '__sem_lote__');
    assert.deepEqual(lotes, ['L1', 'L2', '__sem_lote__']);
  });
});

describe('dentroFaixa', () => {
  test('sem bounds (dado sem variacao) sempre passa', () => {
    assert.equal(dentroFaixa(5, null, [0, 10]), true);
  });
  test('faixa null (usuario nao mexeu) usa bounds inteiro', () => {
    assert.equal(dentroFaixa(5, [0, 10], null), true);
  });
  test('valor sem dado sempre passa, mesmo com faixa estreitada', () => {
    assert.equal(dentroFaixa(null, [0, 100], [50, 60]), true);
  });
  test('valor fora da faixa estreitada e excluido', () => {
    assert.equal(dentroFaixa(5, [0, 100], [50, 60]), false);
    assert.equal(dentroFaixa(55, [0, 100], [50, 60]), true);
  });
});

describe('dentroPeriodo', () => {
  test('sem inicio nem fim, tudo passa (mesmo sem data)', () => {
    assert.equal(dentroPeriodo(null, null, null), true);
    assert.equal(dentroPeriodo(20250101, null, null), true);
  });
  test('periodo ativo exclui quem nao tem data valida', () => {
    assert.equal(dentroPeriodo(null, 20250101, null), false);
  });
  test('dentro do intervalo (so inicio, so fim, os dois)', () => {
    assert.equal(dentroPeriodo(20250115, 20250101, null), true);
    assert.equal(dentroPeriodo(20250115, null, 20250201), true);
    assert.equal(dentroPeriodo(20250115, 20250101, 20250201), true);
  });
  test('fora do intervalo e excluido', () => {
    assert.equal(dentroPeriodo(20241231, 20250101, null), false);
    assert.equal(dentroPeriodo(20250301, null, 20250201), false);
  });
});
