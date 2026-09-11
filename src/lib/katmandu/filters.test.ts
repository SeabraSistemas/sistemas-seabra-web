/**
 * Testes dos filtros do /katmandu que lidam com campo vazio e com cadastro
 * desatualizado. Dois defeitos reais guiam o que está aqui:
 *
 * 1. Lote/Local nulo não tinha opção no filtro: o animal sem lote só aparecia
 *    em "Todos", sem jeito de isolá-lo. A sentinela SEM_LOTE/SEM_LOCAL vira a
 *    opção "Sem lote"/"Sem local".
 * 2. A origem do Movimentar saía da aba Lotes, não do dado: "Bezerro desmama"
 *    tinha 95 animais ativos, não constava no cadastro e sumia do "De".
 */
import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import { casaComVazio, opcoesComVazio, opcoesDeOrigem, rotuloLocal, rotuloLote, type Condicao } from '@/lib/katmandu/filters';
import { SEM_LOCAL, SEM_LOCAL_LABEL, SEM_LOTE, SEM_LOTE_LABEL } from '@/lib/katmandu/types';

type Bicho = { id: string; lote: string | null; sexo: string };

const REBANHO: Bicho[] = [
  { id: 'A1', lote: 'Bezerro4', sexo: 'Macho' },
  { id: 'A2', lote: 'Boi03', sexo: 'Macho' },
  { id: 'A3', lote: null, sexo: 'Fêmea' },
  { id: 'A4', lote: 'Bezerro4', sexo: 'Fêmea' },
];

function condicoes(lote: string, sexo: string): Condicao<Bicho>[] {
  return [
    { key: 'lote', test: (b) => casaComVazio(b.lote, lote, SEM_LOTE) },
    { key: 'sexo', test: (b) => !sexo || b.sexo === sexo },
  ];
}

describe('casaComVazio', () => {
  test('filtro vazio deixa passar tudo, inclusive quem não tem valor', () => {
    assert.equal(casaComVazio('Boi03', '', SEM_LOTE), true);
    assert.equal(casaComVazio(null, '', SEM_LOTE), true);
  });

  test('a sentinela casa só com quem não tem valor', () => {
    assert.equal(casaComVazio(null, SEM_LOTE, SEM_LOTE), true);
    assert.equal(casaComVazio('Boi03', SEM_LOTE, SEM_LOTE), false);
  });

  test('um valor real casa por igualdade e nunca com vazio', () => {
    assert.equal(casaComVazio('Boi03', 'Boi03', SEM_LOTE), true);
    assert.equal(casaComVazio('Bezerro4', 'Boi03', SEM_LOTE), false);
    assert.equal(casaComVazio(null, 'Boi03', SEM_LOTE), false);
  });
});

describe('opcoesComVazio', () => {
  const opcoesLote = (lote: string, sexo: string) =>
    opcoesComVazio(REBANHO, condicoes(lote, sexo), 'lote', (b) => b.lote, SEM_LOTE);

  test('oferece "Sem lote" no fim quando há animal sem lote', () => {
    assert.deepEqual(opcoesLote('', ''), ['Bezerro4', 'Boi03', SEM_LOTE]);
  });

  test('some quando os outros filtros deixam de fora quem não tem lote', () => {
    assert.deepEqual(opcoesLote('', 'Macho'), ['Bezerro4', 'Boi03']);
  });

  test('ignora o próprio filtro: escolher "Sem lote" não esvazia a lista', () => {
    assert.deepEqual(opcoesLote(SEM_LOTE, ''), ['Bezerro4', 'Boi03', SEM_LOTE]);
  });

  test('sem nenhum valor real, não oferece a sentinela sozinha (seria igual a "Todos")', () => {
    const soVazios: Bicho[] = [{ id: 'A9', lote: null, sexo: 'Macho' }];
    assert.deepEqual(opcoesComVazio(soVazios, condicoes('', ''), 'lote', (b) => b.lote, SEM_LOTE), []);
  });
});

describe('rotuloLote / rotuloLocal', () => {
  test('a sentinela vira o rótulo legível; o resto passa intacto', () => {
    assert.equal(rotuloLote(SEM_LOTE), SEM_LOTE_LABEL);
    assert.equal(rotuloLote('Boi03'), 'Boi03');
    assert.equal(rotuloLocal(SEM_LOCAL), SEM_LOCAL_LABEL);
    assert.equal(rotuloLocal('Pasto 04'), 'Pasto 04');
  });
});

describe('opcoesDeOrigem', () => {
  const CADASTRO = ['Bezerro4', 'Bezerro7', 'Boi03'];

  test('lote com animal e fora do cadastro aparece — o caso "Bezerro desmama"', () => {
    const contagem = { Bezerro4: 303, Boi03: 99, 'Bezerro desmama': 95 };
    assert.deepEqual(opcoesDeOrigem(CADASTRO, contagem, SEM_LOTE), ['Bezerro4', 'Boi03', 'Bezerro desmama']);
  });

  test('cadastrados na ordem da aba, depois os de fora em ordem alfabética, sentinela no fim', () => {
    const contagem = { Zeta: 1, Boi03: 2, Alfa: 3, Bezerro7: 4, [SEM_LOTE]: 5 };
    assert.deepEqual(opcoesDeOrigem(CADASTRO, contagem, SEM_LOTE), ['Bezerro7', 'Boi03', 'Alfa', 'Zeta', SEM_LOTE]);
  });

  test('lote cadastrado sem nenhum animal não vira origem', () => {
    assert.deepEqual(opcoesDeOrigem(CADASTRO, { Boi03: 1 }, SEM_LOTE), ['Boi03']);
  });

  test('só animais sem lote: a sentinela aparece sozinha — senão não haveria como movê-los', () => {
    assert.deepEqual(opcoesDeOrigem(CADASTRO, { [SEM_LOTE]: 2 }, SEM_LOTE), [SEM_LOTE]);
  });
});
