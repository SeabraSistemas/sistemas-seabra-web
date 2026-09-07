/**
 * QUEM PAGOU E QUANTO — os testes da tela que soma dinheiro por PESSOA.
 *
 * O que este arquivo protege, em ordem de gravidade:
 *
 *   1. A ORDEM DAS CHECAGENS de `situacaoDoCliente()`. Conta desativada vence
 *      tudo. Inverter as duas linhas compila, passa no lint, e põe alguém para
 *      cobrar quem nem consegue abrir o aplicativo.
 *   2. O FILTRO VAZIO SIGNIFICA "TODOS", não "nenhum". `[].includes(x)` é sempre
 *      falso: a implementação óbvia faz a tela abrir sem nenhuma linha e parecer
 *      que a empresa nunca recebeu nada.
 *   3. A FAMÍLIA "null onde zero mentiria" de `resumirPagamentos()`: média de
 *      carteira vazia é null e não R$ 0,00; concentração sem caixa é null e não
 *      0%.
 *   4. `numeric` que chega como TEXTO do PostgREST. `total_pago` é
 *      `numeric(10,2)`: tratado como não-número, zera a coluna inteira da tela
 *      sem uma linha de erro em lugar nenhum.
 *   5. O que `listarPagamentosPorCliente()` PEDE ao banco — a view do contrato,
 *      a projeção fechada, e a ordem TOTAL sem a qual a paginação repete e pula
 *      linha.
 *
 * NENHUM RELÓGIO: `meses_como_cliente` chega calculado da view contra o relógio
 * do BANCO. O módulo é entrada → saída e nenhum teste aqui depende do dia em que
 * roda.
 */

import assert from 'node:assert/strict';
import * as Modulo from 'node:module';
import { describe, test } from 'node:test';

import { VIEWS_FASE_3, type LinhaPagamentosCliente } from '@/lib/adm/areas/contrato';

// ─────────────────────────────────────────────────────────────────────────────
// O dublê do transporte — mesma técnica de cobrancas.test.ts
// ─────────────────────────────────────────────────────────────────────────────

const FONTE_DUBLE = `
export function admClient() {
  return globalThis.__admDublePag ?? null;
}
export function semConfigSupabase() {
  return { ok: false, motivo: 'sem-config', detalhe: 'dublê de teste sem cliente instalado' };
}
`;

const URL_DUBLE = 'data:text/javascript,' + encodeURIComponent(FONTE_DUBLE);

/** `registerHooks` existe no Node 22.15+ e ainda não está em @types/node 20. */
type Ganchos = {
  registerHooks(ganchos: {
    resolve(
      especificador: string,
      contexto: unknown,
      proximo: (e: string, c: unknown) => unknown,
    ): unknown;
  }): void;
};

(Modulo as unknown as Ganchos).registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador === '@/lib/adm/supabase-admin') {
      return { url: URL_DUBLE, shortCircuit: true };
    }
    return proximo(especificador, contexto);
  },
});

// `await import()` e não `import` estático: um import estático seria içado para
// antes do gancho e traria o transporte de verdade junto.
const {
  SITUACAO_CLIENTE_AJUDA,
  SITUACAO_CLIENTE_ROTULO,
  SITUACOES_CLIENTE,
  contarPorSituacao,
  filtrarPorSituacao,
  lerSituacoesClienteDaUrl,
  listarPagamentosPorCliente,
  resumirPagamentos,
  situacaoDoCliente,
} = await import('@/lib/adm/areas/pagamentos-cliente');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Um cliente do jeito que ele chega da view: TODO campo explícito. Uma coluna
 * nova em `LinhaPagamentosCliente` quebra este fixture no `tsc` e obriga alguém
 * a decidir o que ela vale — em vez de chegar `undefined` e virar "R$ 0,00".
 */
function cliente(campos: Partial<LinhaPagamentosCliente> = {}): LinhaPagamentosCliente {
  return {
    usuario_id: 1,
    nome: 'Fulano',
    plano_nome: 'Produtor Individual',
    status_efetivo: 'ativo',
    ativo: true,
    acesso_ativo: true,
    pagamentos: 3,
    total_pago: 450,
    em_aberto: 0,
    vencido: 0,
    primeiro_pagamento: '2026-05-10',
    ultimo_pagamento: '2026-08-10',
    meses_como_cliente: 3,
    mrr_atual: 150,
    ...campos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. A classificação — o defeito que manda cobrar a pessoa errada
// ─────────────────────────────────────────────────────────────────────────────

describe('situacaoDoCliente', () => {
  test('conta desativada vence a assinatura vigente', () => {
    // A ARMADILHA DA ORDEM. Esta linha não descreve o banco, descreve o DEFEITO:
    // quem escrever `if (l.acesso_ativo) return 'pagando'` antes de olhar
    // `ativo` vê este caso virar "Ativo" — e o operador liga cobrando renovação
    // de alguém que não consegue nem abrir o aplicativo.
    const desligado = cliente({ ativo: false, acesso_ativo: true });
    assert.equal(situacaoDoCliente(desligado), 'desativado');
  });

  test('conta ativa sem acesso é inadimplente — o caso que a tela existe para achar', () => {
    assert.equal(situacaoDoCliente(cliente({ ativo: true, acesso_ativo: false })), 'inadimplente');
  });

  test('conta ativa com acesso é quem está pagando', () => {
    assert.equal(situacaoDoCliente(cliente({ ativo: true, acesso_ativo: true })), 'pagando');
  });

  test('conta desativada e sem acesso continua "desativado", não "inadimplente"', () => {
    // Os dois sinais ruins ligados ao mesmo tempo é o caso mais comum de todos
    // (cancelou e foi desligado) e é o que mais fácil cai no balde errado.
    assert.equal(situacaoDoCliente(cliente({ ativo: false, acesso_ativo: false })), 'desativado');
  });

  test('as quatro combinações de ativo × acesso são cobertas, e só três situações existem', () => {
    const vistas = new Set(
      [true, false].flatMap((ativo) =>
        [true, false].map((acesso_ativo) => situacaoDoCliente(cliente({ ativo, acesso_ativo }))),
      ),
    );
    assert.deepEqual([...vistas].sort(), ['desativado', 'inadimplente', 'pagando']);
  });
});

describe('SITUACOES_CLIENTE / rótulos / ajuda', () => {
  test('toda situação classificável tem chip, rótulo e texto de ajuda', () => {
    // `SITUACOES_CLIENTE` é um array simples: o `tsc` NÃO obriga uma situação
    // nova a entrar nele (obriga só nos Record). Sem este teste, acrescentar um
    // estado daria uma situação que classifica linhas e nunca aparece como
    // filtro na tela — invisível no build e invisível na revisão.
    const doTipo = new Set(
      [true, false].flatMap((ativo) =>
        [true, false].map((acesso_ativo) => situacaoDoCliente(cliente({ ativo, acesso_ativo }))),
      ),
    );
    for (const s of doTipo) {
      assert.ok(SITUACOES_CLIENTE.includes(s), `${s} classifica linha mas não tem chip`);
      assert.ok(SITUACAO_CLIENTE_ROTULO[s], `${s} sem rótulo`);
      assert.ok(SITUACAO_CLIENTE_AJUDA[s], `${s} sem texto de ajuda`);
    }
  });

  test('os rótulos são distintos — dois chips com o mesmo nome são um filtro inutilizável', () => {
    const rotulos = SITUACOES_CLIENTE.map((s) => SITUACAO_CLIENTE_ROTULO[s]);
    assert.equal(new Set(rotulos).size, rotulos.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Os recortes
// ─────────────────────────────────────────────────────────────────────────────

const CARTEIRA: readonly LinhaPagamentosCliente[] = [
  cliente({ usuario_id: 1, nome: 'Paga em dia', total_pago: 1000, mrr_atual: 150 }),
  cliente({
    usuario_id: 2,
    nome: 'Parou de pagar',
    ativo: true,
    acesso_ativo: false,
    total_pago: 600,
    em_aberto: 300,
    vencido: 300,
    mrr_atual: 0,
  }),
  cliente({
    usuario_id: 3,
    nome: 'Desligado',
    ativo: false,
    acesso_ativo: false,
    total_pago: 400,
    em_aberto: 150,
    vencido: 0,
    mrr_atual: null,
  }),
];
// 1000 + 600 + 400 = 2000 · média 2000/3 · maior 1000 = 50%

describe('filtrarPorSituacao', () => {
  test('lista de situações VAZIA devolve tudo — é "sem filtro", não "nenhuma"', () => {
    // `[].includes(x)` é sempre falso: a implementação óbvia faz a tela abrir sem
    // nenhuma linha, e uma tela de caixa vazia lê como "a empresa não recebeu
    // nada" — a pior leitura errada possível aqui.
    assert.equal(filtrarPorSituacao(CARTEIRA, []).length, 3);
  });

  test('uma situação recorta só ela', () => {
    const so = filtrarPorSituacao(CARTEIRA, ['inadimplente']);
    assert.deepEqual(
      so.map((l) => l.usuario_id),
      [2],
    );
  });

  test('duas situações são OU dentro da faceta', () => {
    const dois = filtrarPorSituacao(CARTEIRA, ['inadimplente', 'desativado']);
    assert.deepEqual(
      dois.map((l) => l.usuario_id),
      [2, 3],
    );
  });

  test('o filtro preserva a ordem que veio do banco', () => {
    // A view já entrega por maior pagador. Reordenar aqui faria o topo da tabela
    // mudar de dono ao clicar num chip, sem ninguém ter pedido ordenação.
    const todos = filtrarPorSituacao(CARTEIRA, []);
    assert.deepEqual(
      todos.map((l) => l.usuario_id),
      [1, 2, 3],
    );
  });

  test('não devolve o mesmo array — a tela não pode mutar a lista da consulta', () => {
    assert.notEqual(filtrarPorSituacao(CARTEIRA, []), CARTEIRA);
  });
});

describe('lerSituacoesClienteDaUrl', () => {
  // Esta função nasceu DENTRO da página (/adm/carteira/pagamentos) e foi
  // movida para cá quando a exportação precisou da MESMA leitura de
  // `?f.situacao=`. O risco que este bloco protege não é a função em si — é
  // duas cópias dela divergindo depois que alguém mexer só numa.

  test('ausente ou vazio é "sem filtro" — devolve tudo, nunca nada', () => {
    assert.deepEqual(lerSituacoesClienteDaUrl(null), []);
    assert.deepEqual(lerSituacoesClienteDaUrl(''), []);
  });

  test('valor desconhecido é descartado em silêncio, não vira erro', () => {
    // Um link salvo meses atrás, com um nome de situação que mudou desde
    // então, tem que abrir a tela sem filtro — não uma página de erro.
    assert.deepEqual(lerSituacoesClienteDaUrl('cancelado'), []);
    assert.deepEqual(lerSituacoesClienteDaUrl('pagando,cancelado'), ['pagando']);
  });

  test('duas situações válidas, e a ordem é a de SITUACOES_CLIENTE, não a da URL', () => {
    // A URL pede "desativado,pagando" (ordem invertida); a saída respeita a
    // ordem canônica dos chips, para o resultado não depender de como alguém
    // digitou o link.
    assert.deepEqual(lerSituacoesClienteDaUrl('desativado,pagando'), ['pagando', 'desativado']);
  });

  test('valor repetido não duplica a situação na saída', () => {
    assert.deepEqual(lerSituacoesClienteDaUrl('pagando,pagando'), ['pagando']);
  });

  test('espaço ao redor do valor é ignorado', () => {
    assert.deepEqual(lerSituacoesClienteDaUrl(' pagando , inadimplente '), ['pagando', 'inadimplente']);
  });
});

describe('contarPorSituacao', () => {
  test('conta cada balde e a soma fecha com o total', () => {
    const c = contarPorSituacao(CARTEIRA);
    assert.deepEqual(c, { pagando: 1, inadimplente: 1, desativado: 1 });
    assert.equal(c.pagando + c.inadimplente + c.desativado, CARTEIRA.length);
  });

  test('carteira vazia zera os três baldes em vez de faltar chave', () => {
    // Chave faltando viraria `undefined` no chip, e `formatarInteiro(undefined)`
    // não é a mesma coisa que "0" na tela.
    assert.deepEqual(contarPorSituacao([]), { pagando: 0, inadimplente: 0, desativado: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. O resumo — os cards do topo
// ─────────────────────────────────────────────────────────────────────────────

describe('resumirPagamentos', () => {
  test('soma o histórico, o que está em aberto e o que está vencido', () => {
    const r = resumirPagamentos(CARTEIRA);
    assert.equal(r.clientes, 3);
    assert.equal(r.totalRecebido, 2000);
    assert.equal(r.emAberto, 450);
    assert.equal(r.vencido, 300);
  });

  test('só conta como "com vencido" quem tem valor vencido maior que zero', () => {
    // O cliente 3 tem R$ 150 em aberto e nada vencido: entra no card "Em aberto"
    // e NÃO na contagem que vira telefonema.
    assert.equal(resumirPagamentos(CARTEIRA).clientesComVencido, 1);
  });

  test('média de carteira vazia é null, e nunca R$ 0,00', () => {
    // "Não dá para calcular" e "a média é zero" são afirmações diferentes sobre o
    // negócio, e a segunda é falsa.
    const vazia = resumirPagamentos([]);
    assert.equal(vazia.mediaPorCliente, null);
    assert.equal(vazia.clientes, 0);
    assert.equal(vazia.totalRecebido, 0, 'somar nada é zero — isso sim é verdade');
  });

  test('a média divide pelo número de clientes do recorte', () => {
    assert.equal(resumirPagamentos(CARTEIRA).mediaPorCliente, 2000 / 3);
  });

  test('concentração é a fatia do MAIOR sobre o total', () => {
    assert.equal(resumirPagamentos(CARTEIRA).fracaoDoMaior, 0.5);
  });

  test('concentração sem caixa nenhum é null, e não 0% nem divisão por zero', () => {
    const semCaixa = [cliente({ total_pago: 0, em_aberto: 0, vencido: 0 })];
    assert.equal(resumirPagamentos(semCaixa).fracaoDoMaior, null);
    assert.equal(resumirPagamentos([]).fracaoDoMaior, null);
  });

  test('o resumo do recorte é a soma das linhas do recorte — a regra da tela', () => {
    // Os cards são a soma do que está embaixo deles. Se este teste quebrar, a
    // tela passou a mostrar um número de cima que não bate com a coluna de baixo.
    const so = filtrarPorSituacao(CARTEIRA, ['pagando']);
    assert.equal(resumirPagamentos(so).totalRecebido, 1000);
    assert.equal(resumirPagamentos(so).clientes, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. A leitura — o que o módulo PEDE ao banco
// ─────────────────────────────────────────────────────────────────────────────

const PAGE = 1000;

type LinhaCrua = Record<string, unknown>;
type ErroFalso = { erro: { message: string; code?: string } };
type PaginaFalsa = LinhaCrua[] | ErroFalso;

interface Chamada {
  view: string;
  colunas: string;
  ordens: [string, unknown][];
  ranges: [number, number][];
}

function instalar(paginas: PaginaFalsa[]): Chamada[] {
  const chamadas: Chamada[] = [];

  const cliente = {
    from(view: string) {
      return {
        select(colunas: string) {
          const chamada: Chamada = { view, colunas, ordens: [], ranges: [] };
          chamadas.push(chamada);

          const consulta = {
            order(coluna: string, opcoes?: unknown) {
              chamada.ordens.push([coluna, opcoes]);
              return consulta;
            },
            range(de: number, ate: number) {
              chamada.ranges.push([de, ate]);
              return consulta;
            },
            then(cumprir: (r: { data: unknown[] | null; error: unknown }) => void) {
              const [de] = chamada.ranges.at(-1) ?? [0];
              const pagina = paginas[de / PAGE] ?? [];
              if (Array.isArray(pagina)) cumprir({ data: pagina, error: null });
              else cumprir({ data: null, error: pagina.erro });
            },
          };

          return consulta;
        },
      };
    },
  };

  (globalThis as unknown as { __admDublePag: unknown }).__admDublePag = cliente;
  return chamadas;
}

/** Roda com o `console.error` calado: a falha grita de propósito em produção. */
async function semGritar<T>(corpo: () => Promise<T>): Promise<T> {
  const gritos = console.error;
  console.error = () => {};
  try {
    return await corpo();
  } finally {
    console.error = gritos;
  }
}

describe('listarPagamentosPorCliente', () => {
  test('lê a view do CONTRATO e projeta exatamente as colunas dele — nunca select(*)', async () => {
    // Foi a divergência entre o nome escrito no SQL e o escrito no TS que, na
    // Fase 1, deixou dez telas compilando, passando no lint e abrindo vazias.
    const chamadas = instalar([[]]);
    await listarPagamentosPorCliente();

    assert.equal(chamadas[0].view, VIEWS_FASE_3.pagamentosPorCliente);
    const colunas = chamadas[0].colunas.split(',');
    assert.equal(colunas.includes('*'), false);
    assert.deepEqual(colunas.sort(), Object.keys(cliente()).sort());
  });

  test('a ordem é TOTAL: maior pagador primeiro, desempate pela chave', async () => {
    // Sem o segundo `order`, `range()` sobre linhas empatadas (dois clientes com
    // o mesmo total, ou vários zerados) repete uma e pula outra entre páginas —
    // e o total da tela fica errado sem dar erro nenhum.
    const chamadas = instalar([[]]);
    await listarPagamentosPorCliente();
    assert.deepEqual(chamadas[0].ordens, [
      ['total_pago', { ascending: false, nullsFirst: false }],
      ['usuario_id', { ascending: true }],
    ]);
  });

  test('numeric que chega como TEXTO vira número', async () => {
    // `numeric(10,2)` do Postgres chega como STRING pelo PostgREST sempre que a
    // precisão não cabe em double. Tratado como não-número, zeraria a coluna de
    // dinheiro da tela inteira sem uma linha de erro em lugar nenhum.
    instalar([
      [
        {
          usuario_id: '7',
          nome: 'Arnóbio',
          plano_nome: 'Pro',
          status_efetivo: 'ativo',
          ativo: true,
          acesso_ativo: true,
          pagamentos: '1',
          total_pago: '1224.00',
          em_aberto: '0',
          vencido: '0',
          primeiro_pagamento: '2026-07-02',
          ultimo_pagamento: '2026-07-02',
          meses_como_cliente: '2',
          mrr_atual: '102.00',
        },
      ],
    ]);

    const r = await listarPagamentosPorCliente();
    assert.equal(r.ok, true);
    if (!r.ok) return;

    const [l] = r.dados;
    assert.equal(l.usuario_id, 7);
    assert.equal(l.total_pago, 1224);
    assert.equal(l.mrr_atual, 102);
    assert.equal(l.meses_como_cliente, 2);
  });

  test('nunca pagou: meses e MRR continuam NULL, e o dinheiro vira 0', async () => {
    // A distinção que a coluna carrega: `meses_como_cliente` null é "nunca
    // pagou", e virar 0 leria como "cliente novo, entrou este mês". Já em coluna
    // de DINHEIRO o certo é o contrário — null viraria NaN na soma do card e a
    // tela inteira mostraria "R$ NaN" por causa de uma célula.
    instalar([
      [
        {
          usuario_id: 9,
          nome: 'Só cobrança em aberto',
          plano_nome: null,
          status_efetivo: null,
          ativo: true,
          acesso_ativo: false,
          pagamentos: 2,
          total_pago: 0,
          em_aberto: 300,
          vencido: 300,
          primeiro_pagamento: null,
          ultimo_pagamento: null,
          meses_como_cliente: null,
          mrr_atual: null,
        },
      ],
    ]);

    const r = await listarPagamentosPorCliente();
    assert.equal(r.ok, true);
    if (!r.ok) return;

    const [l] = r.dados;
    assert.equal(l.meses_como_cliente, null);
    assert.equal(l.mrr_atual, null);
    assert.equal(l.primeiro_pagamento, null);
    assert.equal(l.total_pago, 0);
    assert.equal(situacaoDoCliente(l), 'inadimplente');

    // E o resumo não pode virar NaN por causa da linha sem pagamento.
    const resumo = resumirPagamentos(r.dados);
    assert.equal(Number.isNaN(resumo.totalRecebido), false);
    assert.equal(resumo.vencido, 300);
  });

  test('nome ausente vira travessão em vez de célula vazia', async () => {
    instalar([[{ usuario_id: 5, nome: '   ' }]]);
    const r = await listarPagamentosPorCliente();
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.dados[0].nome, '—');
  });

  test('view ausente é "falta configurar"; falha de verdade é erro', async () => {
    // A distinção que mais importa: uma tela de caixa vazia por falta de
    // migration é indistinguível de "a empresa nunca recebeu nada".
    await semGritar(async () => {
      instalar([{ erro: { message: 'relation "adm.pagamentos_por_cliente" does not exist', code: '42P01' } }]);
      const semMigration = await listarPagamentosPorCliente();
      assert.equal(semMigration.ok, false);
      if (!semMigration.ok) {
        assert.equal(semMigration.motivo, 'sem-config');
        assert.match(semMigration.detalhe, /VIEWS_FASE_3|Exposed schemas/);
      }

      instalar([{ erro: { message: 'canceling statement due to statement timeout', code: '57014' } }]);
      const quebrado = await listarPagamentosPorCliente();
      assert.equal(quebrado.ok, false);
      if (!quebrado.ok) assert.equal(quebrado.motivo, 'erro', 'timeout não pode virar "falta configurar"');
    });
  });

  test('sem Supabase configurado a tela diz "falta configurar" em vez de estourar', async () => {
    (globalThis as unknown as { __admDublePag: unknown }).__admDublePag = null;
    const r = await listarPagamentosPorCliente();
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.motivo, 'sem-config');
  });

  test('pagina até o fim: uma página cheia não é a última', async () => {
    // Parar na primeira página devolveria os 1000 maiores pagadores e um total
    // truncado — que continua parecendo um total.
    const cheia = Array.from({ length: PAGE }, (_, i) => ({ usuario_id: i + 1, total_pago: 1 }));
    instalar([cheia, [{ usuario_id: PAGE + 1, total_pago: 1 }]]);

    const r = await listarPagamentosPorCliente();
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.dados.length, PAGE + 1);
    assert.equal(resumirPagamentos(r.dados).totalRecebido, PAGE + 1);
  });
});
