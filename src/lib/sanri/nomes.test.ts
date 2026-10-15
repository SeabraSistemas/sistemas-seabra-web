import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  anosDoSeletor,
  chaveNome,
  letraDoAno,
  nomeCompleto,
  problemaDoNome,
  resumir,
  separarNomes,
  traduzirErro,
  type ConfigNomes,
  type NomeLista,
} from '@/lib/sanri/nomes';

// Configuração do Capril Sanri no banco (migration 20261015120000).
const SANRI: ConfigNomes = { sufixo: 'SANRI', anoBase: 2026, letraBase: 'A' };

function item(id: number, nome: string, extra: Partial<NomeLista> = {}): NomeLista {
  return { id, ano: 2026, sexo: 'fêmea', nome, animal: null, ...extra };
}

describe('letraDoAno', () => {
  test('2026 = A, 2027 = B, e segue', () => {
    assert.equal(letraDoAno(2026, SANRI), 'A');
    assert.equal(letraDoAno(2027, SANRI), 'B');
    assert.equal(letraDoAno(2030, SANRI), 'E');
  });
  test('depois do Z volta ao A (mesma conta do banco)', () => {
    assert.equal(letraDoAno(2051, SANRI), 'Z');
    assert.equal(letraDoAno(2052, SANRI), 'A');
  });
});

describe('separarNomes', () => {
  test('um por linha, vírgula ou ponto e vírgula; maiúsculas; sem repetidos', () => {
    assert.deepEqual(separarNomes('amora\n Abelha ,ágata; AMORA\n\n'), ['AMORA', 'ABELHA', 'ÁGATA']);
  });
  test('NÃO separa por espaço: "Ana Clara" volta inteiro para ser recusado', () => {
    assert.deepEqual(separarNomes('Ana Clara'), ['ANA CLARA']);
  });
  test('repetido com e sem acento conta uma vez', () => {
    assert.deepEqual(separarNomes('Ágata\nAGATA'), ['ÁGATA']);
  });
});

describe('problemaDoNome', () => {
  test('nome bom de 2026 passa, com e sem acento', () => {
    assert.equal(problemaDoNome('AMORA', 2026, SANRI), null);
    assert.equal(problemaDoNome('ÂMBAR', 2026, SANRI), null);
  });
  test('duas palavras, número ou símbolo: recusa', () => {
    assert.match(problemaDoNome('ANA CLARA', 2026, SANRI) ?? '', /uma palavra só/);
    assert.match(problemaDoNome('AMORA2', 2026, SANRI) ?? '', /uma palavra só/);
    assert.match(problemaDoNome('ANA-CLARA', 2026, SANRI) ?? '', /uma palavra só/);
  });
  test('letra do ano errada: recusa dizendo a letra certa', () => {
    assert.equal(problemaDoNome('BETO', 2026, SANRI), 'em 2026 os nomes começam com A');
    assert.equal(problemaDoNome('AMORA', 2027, SANRI), 'em 2027 os nomes começam com B');
  });
});

describe('traduzirErro', () => {
  test('marcas do gatilho do banco', () => {
    assert.equal(traduzirErro({ message: 'NOME_UMA_PALAVRA: "ANA CLARA" — …' }), 'tem de ser uma palavra só, sem espaço, número ou símbolo');
    assert.equal(traduzirErro({ message: 'NOME_LETRA_ERRADA: em 2026 os nomes começam com A' }), 'em 2026 os nomes começam com A');
    assert.match(traduzirErro({ message: 'NOME_EM_USO: AMORA já foi dado…' }), /já foi dado a um animal/);
  });
  test('índice único (23505) = já está na lista', () => {
    assert.equal(traduzirErro({ code: '23505', message: 'duplicate key value violates unique constraint' }), 'já está na lista');
  });
  test('erro desconhecido não vaza a mensagem técnica', () => {
    assert.equal(traduzirErro({ message: 'connection reset' }), 'não foi possível gravar');
  });
});

describe('resumir', () => {
  const nomes = [
    item(1, 'ZEBRA'),
    item(2, 'ÁGATA', { animal: { id: 9, numero: '1421326171', nome: 'ÁGATA SANRI', nascimento: '2026-03-01', ativo: true } }),
    item(3, 'ABELHA'),
    item(4, 'ACÁCIA'),
    item(5, 'ATLAS', { sexo: 'macho' }),
    item(6, 'BRUNA', { ano: 2027 }),
  ];
  test('próximo = primeiro livre em ordem alfabética sem acento (a ordem do banco)', () => {
    const r = resumir(nomes, 2026, 'fêmea');
    assert.deepEqual(r.livres.map((n) => n.nome), ['ABELHA', 'ACÁCIA', 'ZEBRA']);
    assert.equal(r.proximo?.nome, 'ABELHA');
  });
  test('nome com animal é "dado", não livre', () => {
    const r = resumir(nomes, 2026, 'fêmea');
    assert.deepEqual(r.usados.map((n) => n.nome), ['ÁGATA']);
  });
  test('separa por sexo e por ano', () => {
    assert.deepEqual(resumir(nomes, 2026, 'macho').livres.map((n) => n.nome), ['ATLAS']);
    assert.deepEqual(resumir(nomes, 2027, 'fêmea').livres.map((n) => n.nome), ['BRUNA']);
  });
  test('lista vazia: sem próximo', () => {
    assert.equal(resumir(nomes, 2028, 'fêmea').proximo, null);
  });
});

describe('anosDoSeletor', () => {
  test('ano corrente e o seguinte aparecem mesmo sem lista', () => {
    assert.deepEqual(anosDoSeletor([], 2026, SANRI), [2026, 2027]);
  });
  test('anos com lista entram, em ordem', () => {
    assert.deepEqual(anosDoSeletor([item(1, 'CAIO', { ano: 2028 })], 2026, SANRI), [2026, 2027, 2028]);
  });
  test('antes do ano-base, começa no ano-base', () => {
    assert.deepEqual(anosDoSeletor([], 2025, SANRI), [2026, 2027]);
  });
});

test('chaveNome e nomeCompleto', () => {
  assert.equal(chaveNome(' Ágata '), 'AGATA');
  assert.equal(nomeCompleto('AMORA', 'Sanri'), 'AMORA SANRI');
  assert.equal(nomeCompleto('AMORA', ''), 'AMORA');
});
