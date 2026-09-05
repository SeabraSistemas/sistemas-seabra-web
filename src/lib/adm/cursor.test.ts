import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chaveDaTabela,
  codificarCursor,
  cursorDaLinha,
  decodificarCursor,
  type CursorTabela,
} from '@/lib/adm/queries';
import { CATALOGO, type TabelaCatalogo } from '@/lib/adm/tabelas-dados';

/**
 * A paginação keyset do escape hatch. O arquivo se chama `cursor.test.ts` e não
 * `queries.test.ts` de propósito: `queries.ts` é quase todo I/O contra o
 * PostgREST, e a fatia PURA — as quatro funções abaixo — é a que dá para testar
 * aqui e a que já quebrou o painel.
 *
 * O que estes testes guardam:
 *
 * 1. O cursor vem da URL. `decodificarCursor` NUNCA pode lançar: colado pela
 *    metade, de outra ordenação, de outra tabela — o certo é voltar para a
 *    primeira página, não derrubar a tela.
 * 2. `v ?? null` e não `v || null`. Um `false`, um `0` ou uma string vazia na
 *    coluna de ordenação viram `null` com `||`, e aí `aplicarKeyset` entra no
 *    ramo `IS NULL` — a página seguinte pula todas as linhas com aquele valor,
 *    em silêncio.
 * 3. `chaveDaTabela` tem que devolver uma coluna que EXISTE. Sem chave de
 *    desempate não há cursor, e a paginação passa a repetir ou pular linha.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Ida e volta do cursor
// ─────────────────────────────────────────────────────────────────────────────

function idaEVolta(cursor: CursorTabela): CursorTabela | null {
  return decodificarCursor(codificarCursor(cursor));
}

test('cursor de texto volta idêntico, inclusive com vírgula e acento no valor', () => {
  // A vírgula importa: o valor é reinjetado num `or=(...)` do PostgREST, onde
  // vírgula é separador de gramática. Se ele não voltar íntegro daqui, o escape
  // lá na frente escapa a coisa errada.
  const cursor: CursorTabela = { v: 'Fazenda São João, Ltda. ("a matriz")', id: '3f2a9b1c-0000-4000-8000-000000000001' };
  assert.deepEqual(idaEVolta(cursor), cursor);
});

test('cursor de número volta como número, não como o texto do número', () => {
  const cursor: CursorTabela = { v: 31.5, id: 11954 };
  const volta = idaEVolta(cursor);
  assert.deepEqual(volta, cursor);
  assert.equal(typeof volta?.v, 'number');
  assert.equal(typeof volta?.id, 'number');
});

test('cursor de booleano volta como booleano', () => {
  assert.deepEqual(idaEVolta({ v: true, id: 'x' }), { v: true, id: 'x' });
});

test('cursor com valor null volta null — é o bloco final da ordenação, não erro', () => {
  assert.deepEqual(idaEVolta({ v: null, id: 'x' }), { v: null, id: 'x' });
});

test('false na coluna de ordenação NÃO vira null na volta', () => {
  // Com `v || null` este teste falha e a paginação passa a pular todas as linhas
  // de `ativo = false` a partir da segunda página.
  const volta = idaEVolta({ v: false, id: 'x' });
  assert.deepEqual(volta, { v: false, id: 'x' });
  assert.notEqual(volta?.v, null);
});

test('zero e string vazia na coluna de ordenação também sobrevivem à volta', () => {
  assert.deepEqual(idaEVolta({ v: 0, id: 'x' }), { v: 0, id: 'x' });
  assert.deepEqual(idaEVolta({ v: '', id: 'x' }), { v: '', id: 'x' });
});

test('id igual a zero é id válido — a linha 0 não pode encerrar a paginação', () => {
  assert.deepEqual(idaEVolta({ v: 'a', id: 0 }), { v: 'a', id: 0 });
});

test('o cursor sai em base64url: nada de +, / ou = para a URL estragar', () => {
  // `+` numa query string decodifica como espaço. Se o cursor sair em base64
  // comum, ele volta corrompido do navegador e a paginação recomeça sozinha.
  const valores = ['🐐 emoji vira byte alto', 'ÿþý', '?~?~', 'Fazenda São João'];
  for (const v of valores) {
    const codificado = codificarCursor({ v, id: 'x' });
    assert.match(codificado, /^[A-Za-z0-9_-]+$/, `cursor com caractere de URL para ${JSON.stringify(v)}`);
    assert.equal(encodeURIComponent(codificado), codificado, 'o cursor tem que atravessar a URL sem reescrita');
    assert.deepEqual(decodificarCursor(codificado), { v, id: 'x' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Cursor estragado: sempre null, nunca exceção
// ─────────────────────────────────────────────────────────────────────────────

const b64 = (texto: string) => Buffer.from(texto, 'utf8').toString('base64url');

const ESTRAGADOS: [string, string | null | undefined][] = [
  ['ausente', undefined],
  ['null', null],
  ['string vazia', ''],
  ['base64 inválido', '!!!não é base64!!!'],
  ['bytes que não são UTF-8/JSON', 'AAECAwQFBgc'],
  ['JSON truncado no meio', b64('{"v":1,"id":')],
  ['JSON quebrado', b64('{"v":1 "id":"x"}')],
  ['sem o campo id', b64('{"v":1}')],
  ['id de tipo errado (objeto)', b64('{"v":1,"id":{"a":1}}')],
  ['id de tipo errado (null)', b64('{"v":1,"id":null}')],
  ['id de tipo errado (array)', b64('{"v":1,"id":["x"]}')],
  ['v de tipo errado (objeto)', b64('{"v":{"a":1},"id":"x"}')],
  ['v de tipo errado (array)', b64('{"v":[1,2],"id":"x"}')],
  ['JSON válido que não é objeto (número)', b64('42')],
  ['JSON válido que não é objeto (string)', b64('"cursor"')],
  ['JSON válido que é null', b64('null')],
  ['array no lugar do objeto', b64('[1,2]')],
];

for (const [rotulo, bruto] of ESTRAGADOS) {
  test(`cursor estragado (${rotulo}) volta para a primeira página em vez de derrubar a tela`, () => {
    let resultado: CursorTabela | null | undefined;
    assert.doesNotThrow(() => {
      resultado = decodificarCursor(bruto);
    }, `decodificarCursor lançou com ${rotulo} — e o valor vem da URL`);
    assert.equal(resultado, null);
  });
}

test('cursor sem o campo v é aceito com v = null: v ausente é o bloco de nulos', () => {
  // Diferente dos de cima: aqui o cursor é utilizável. Só `id` é obrigatório.
  assert.deepEqual(decodificarCursor(b64('{"id":"x"}')), { v: null, id: 'x' });
});

test('campo a mais no cursor é ignorado, não invalida a página', () => {
  // Um cursor de uma versão anterior do painel não pode virar erro de tela.
  assert.deepEqual(decodificarCursor(b64('{"v":1,"id":"x","ordem":"nome","sobra":true}')), { v: 1, id: 'x' });
});

// ─────────────────────────────────────────────────────────────────────────────
// chaveDaTabela — o desempate da paginação
// ─────────────────────────────────────────────────────────────────────────────

function tabelaFake(nome: string, chaves: string[]): TabelaCatalogo {
  return {
    nome,
    rotulo: nome,
    descricao: '',
    colunaTenant: 'animal_id',
    colunaData: null,
    area: 'Rebanho',
    colunasBloqueadas: [],
    colunas: chaves.map((chave) => ({ chave, rotulo: chave, tipo: 'texto', familia: 'essencial' })),
  };
}

test('tabela 1:1 com rebanho, sem coluna id, desempata por animal_id', () => {
  assert.equal(chaveDaTabela(tabelaFake('engorda_fake', ['data', 'animal_id', 'peso_inicio'])), 'animal_id');
});

test('quando a tabela tem id, ele ganha de animal_id — animal_id ali se repete', () => {
  // Em `controle_leiteiro` o mesmo animal aparece em centenas de linhas: usar
  // animal_id como desempate faria a página seguinte pular ordenhas inteiras.
  assert.equal(chaveDaTabela(tabelaFake('controle_leiteiro_fake', ['id', 'animal_id', 'litros'])), 'id');
});

test('sem id e sem animal_id sobra id — e é aí que a paginação silenciosamente quebra', () => {
  // Comportamento atual, fixado aqui de propósito: o fallback é `id` mesmo que
  // a coluna não exista. É o teste seguinte que garante que nenhuma tabela real
  // do catálogo cai nesse buraco.
  assert.equal(chaveDaTabela(tabelaFake('sem_chave', ['a', 'b'])), 'id');
});

test('toda tabela do catálogo desempata por uma coluna que existe nela', () => {
  // A trava contra a tabela nova: entrar no catálogo sem `id` e sem `animal_id`
  // compila, abre a primeira página e trava na segunda — sem erro na tela.
  const sem: string[] = [];
  for (const registro of CATALOGO) {
    const chaves = new Set(registro.colunas.map((c) => c.chave));
    if (!chaves.has(chaveDaTabela(registro))) sem.push(registro.nome);
  }
  assert.deepEqual(sem, [], `tabelas cujo desempate aponta para coluna inexistente: ${sem.join(', ')}`);
});

test('a exceção real do schema existe e é resolvida: engorda não tem id e pagina por animal_id', () => {
  // Pino de regressão sobre dado real, não fixture: se `engorda` ganhar um `id`
  // um dia, este teste avisa que a exceção deixou de ser exercitada.
  const engorda = CATALOGO.find((r) => r.nome === 'engorda');
  if (!engorda) throw new Error('a tabela `engorda` sumiu do catálogo');

  const chaves = new Set(engorda.colunas.map((c) => c.chave));
  assert.equal(chaves.has('id'), false, 'engorda passou a ter id — reveja o caso 1:1 do chaveDaTabela');
  assert.equal(chaves.has('animal_id'), true);
  assert.equal(chaveDaTabela(engorda), 'animal_id');
});

// ─────────────────────────────────────────────────────────────────────────────
// cursorDaLinha — o cursor da PRÓXIMA página
// ─────────────────────────────────────────────────────────────────────────────

const REBANHO_FAKE = tabelaFake('rebanho_fake', ['id', 'animal_id', 'nome_animal', 'peso_atual', 'ativo']);

test('sem última linha não há próxima página', () => {
  assert.equal(cursorDaLinha(REBANHO_FAKE, undefined, undefined), null);
});

test('linha sem a coluna de desempate não gera cursor — melhor parar que paginar errado', () => {
  assert.equal(cursorDaLinha(REBANHO_FAKE, undefined, { nome_animal: 'Preta' }), null);
});

test('sem ordem pedida, o cursor guarda o próprio valor da chave', () => {
  const bruto = cursorDaLinha(REBANHO_FAKE, undefined, { id: 42, nome_animal: 'Preta' });
  assert.deepEqual(decodificarCursor(bruto), { v: 42, id: 42 });
});

test('com ordem pedida, o cursor guarda o valor daquela coluna e a chave como desempate', () => {
  const bruto = cursorDaLinha(REBANHO_FAKE, { coluna: 'nome_animal', ascendente: true }, {
    id: 42,
    nome_animal: 'Preta',
  });
  assert.deepEqual(decodificarCursor(bruto), { v: 'Preta', id: 42 });
});

test('valor nulo na coluna de ordenação vira v = null, o bloco do fim da lista', () => {
  const bruto = cursorDaLinha(REBANHO_FAKE, { coluna: 'peso_atual', ascendente: true }, {
    id: 42,
    peso_atual: null,
  });
  assert.deepEqual(decodificarCursor(bruto), { v: null, id: 42 });
});

test('false e zero na coluna de ordenação viajam no cursor como false e zero', () => {
  // O mesmo defeito do `||`, agora na saída: virar null aqui manda a próxima
  // página para o ramo `IS NULL` e some com todo o bloco de `ativo = false`.
  const falso = cursorDaLinha(REBANHO_FAKE, { coluna: 'ativo', ascendente: true }, { id: 42, ativo: false });
  assert.deepEqual(decodificarCursor(falso), { v: false, id: 42 });

  const zero = cursorDaLinha(REBANHO_FAKE, { coluna: 'peso_atual', ascendente: true }, { id: 42, peso_atual: 0 });
  assert.deepEqual(decodificarCursor(zero), { v: 0, id: 42 });
});

test('id igual a zero ainda gera cursor — a paginação não pode parar na linha 0', () => {
  const bruto = cursorDaLinha(REBANHO_FAKE, { coluna: 'nome_animal', ascendente: true }, {
    id: 0,
    nome_animal: 'Preta',
  });
  assert.deepEqual(decodificarCursor(bruto), { v: 'Preta', id: 0 });
});

test('valor que não é escalar (data, json) vai como texto, não como [object Object]', () => {
  const quando = new Date('2026-03-04T12:00:00Z');
  const bruto = cursorDaLinha(REBANHO_FAKE, { coluna: 'peso_atual', ascendente: true }, {
    id: 42,
    peso_atual: quando,
  });
  assert.deepEqual(decodificarCursor(bruto), { v: String(quando), id: 42 });
});

test('a tabela sem id gera cursor pelo animal_id, e não null', () => {
  const engorda = tabelaFake('engorda_fake', ['data', 'animal_id', 'peso_inicio']);
  const bruto = cursorDaLinha(engorda, { coluna: 'data', ascendente: false }, {
    animal_id: 'a1',
    data: '2026-03-04',
  });
  assert.deepEqual(decodificarCursor(bruto), { v: '2026-03-04', id: 'a1' });
});

test('o cursor gerado de uma linha é o mesmo que codificarCursor produziria', () => {
  const linha = { id: 42, nome_animal: 'Preta' };
  assert.equal(
    cursorDaLinha(REBANHO_FAKE, { coluna: 'nome_animal', ascendente: true }, linha),
    codificarCursor({ v: 'Preta', id: 42 }),
  );
});
