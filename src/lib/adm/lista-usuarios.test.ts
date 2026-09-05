import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { aplicarFiltrosUsuario } from '@/lib/adm/queries';

/**
 * QUEM APARECE NA LISTA MESTRA.
 *
 * Não é detalhe de implementação: é uma decisão de negócio do Felipe
 * (05/09/2026) sobre o que conta como cliente. Testada com um dublê do
 * construtor de consulta, que grava os predicados em vez de falar com o banco —
 * o que interessa aqui é QUAL predicado sai, não o que o Postgres responde.
 */

interface Predicado {
  op: string;
  coluna: string;
  valor: unknown;
}

/** Dublê do PostgrestFilterBuilder: encadeia igual e registra o que recebeu. */
function consultaFalsa() {
  const predicados: Predicado[] = [];
  const q = {
    predicados,
    neq(coluna: string, valor: unknown) {
      predicados.push({ op: 'neq', coluna, valor });
      return q;
    },
    in(coluna: string, valor: unknown) {
      predicados.push({ op: 'in', coluna, valor });
      return q;
    },
    eq(coluna: string, valor: unknown) {
      predicados.push({ op: 'eq', coluna, valor });
      return q;
    },
    not(coluna: string, op: string, valor: unknown) {
      predicados.push({ op: `not.${op}`, coluna, valor });
      return q;
    },
    gte: (c: string, v: unknown) => (predicados.push({ op: 'gte', coluna: c, valor: v }), q),
    lte: (c: string, v: unknown) => (predicados.push({ op: 'lte', coluna: c, valor: v }), q),
    is: (c: string, v: unknown) => (predicados.push({ op: 'is', coluna: c, valor: v }), q),
    or: (expr: string) => (predicados.push({ op: 'or', coluna: '', valor: expr }), q),
    overlaps: (c: string, v: unknown) => (predicados.push({ op: 'overlaps', coluna: c, valor: v }), q),
    ilike: (c: string, v: unknown) => (predicados.push({ op: 'ilike', coluna: c, valor: v }), q),
  };
  return q;
}

type Filtros = Parameters<typeof aplicarFiltrosUsuario>[1];

function predicadosDe(filtros: Filtros): Predicado[] {
  const q = consultaFalsa();
  aplicarFiltrosUsuario(q as never, filtros);
  return q.predicados;
}

/** Existe um predicado que exclui o papel 'colaborador'? */
function excluiColaborador(filtros: Filtros): boolean {
  return predicadosDe(filtros).some(
    (p) => p.op === 'neq' && p.coluna === 'papel' && p.valor === 'colaborador',
  );
}

describe('colaborador não é cliente', () => {
  test('sem filtro nenhum, a lista mestra exclui colaborador', () => {
    // Ele é funcionário que o produtor cadastrou: não tem rebanho próprio nem
    // assinatura própria, e os números da ficha dele seriam os do patrão.
    assert.ok(excluiColaborador({}));
  });

  test('pedir explicitamente traz de volta', () => {
    assert.ok(!excluiColaborador({ incluirColaboradores: true }));
  });

  test('filtrar pelo papel colaborador traz de volta — é pedido explícito', () => {
    assert.ok(!excluiColaborador({ papeis: ['colaborador'] }));
  });

  test('filtrar por outro papel mantém a exclusão (o `in` já resolve, sem contradição)', () => {
    assert.ok(excluiColaborador({ papeis: ['produtor'] }));
  });

  test('BUSCAR por nome traz de volta: quem digita um nome procura uma pessoa', () => {
    // Uma busca que não acha quem existe parece sistema quebrado — e é o
    // caminho normal para achar um colaborador específico.
    assert.ok(!excluiColaborador({ busca: 'Rui' }));
  });

  test('busca só de espaços não conta como busca', () => {
    assert.ok(excluiColaborador({ busca: '   ' }));
  });
});

describe('contas de teste e demo', () => {
  test('ficam de fora por default — a demo é a conta do reviewer da Apple', () => {
    const p = predicadosDe({});
    assert.ok(p.some((x) => x.coluna === 'is_tester' && x.op === 'not.is'));
    assert.ok(p.some((x) => x.coluna === 'is_demo' && x.op === 'not.is'));
  });

  test('incluirTestes traz as duas de volta', () => {
    const p = predicadosDe({ incluirTestes: true });
    assert.ok(!p.some((x) => x.coluna === 'is_tester'));
    assert.ok(!p.some((x) => x.coluna === 'is_demo'));
  });
});
