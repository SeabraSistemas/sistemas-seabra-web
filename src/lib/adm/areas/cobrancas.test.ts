/**
 * COBRANÇAS — os testes do VOCABULÁRIO DE DINHEIRO do painel.
 *
 * Esta é a tela em que alguém decide LIGAR COBRANDO. Um defeito aqui não deixa a
 * página em branco: deixa a página plausível e a ligação errada. Por isso cada
 * caso abaixo existe para pegar um defeito específico, e não para confirmar que
 * a função existe.
 *
 * O QUE ESTE ARQUIVO PROTEGE, em ordem de gravidade:
 *
 *   1. A ORDEM DAS CHECAGENS de `situacaoDaCobranca()`. Pago vence tudo: uma
 *      cobrança paga com atraso é PAGA. Trocar a ordem das linhas compila, passa
 *      no lint e manda cobrar quem já pagou.
 *   2. STATUS_PAGO / STATUS_EM_ABERTO. São o espelho de STATUS_PAGOS de
 *      `supabase/functions/_shared/asaas.ts` (a lista que a Edge Function usa
 *      para LIBERAR acesso) e do `in (...)` das views em supabase/adm/*.sql.
 *      Divergir é o painel dizer "não pagou" para quem o app já liberou.
 *   3. A família "zero onde o certo era não dá para calcular" de
 *      `resumirCobrancas()`: ticket médio null e não R$ 0,00, valor nulo à vista
 *      em vez de escondido dentro de um total.
 *   4. Os recortes (`filtrarCobrancas`, `contarPorSituacao`) e o que
 *      `listarCobrancas()` PEDE ao banco — a projeção do contrato e a ordem
 *      total com nulos por último, sem a qual a paginação repete e pula linha.
 *
 * NENHUM RELÓGIO. `inadimplente` e `dias_de_atraso` chegam calculados da view,
 * contra o relógio do BANCO — o módulo inteiro é entrada → saída, e nenhum teste
 * aqui chama `new Date()` sem argumento nem depende do dia em que roda.
 *
 * POR QUE UM DUBLÊ DE `supabase-admin` (seção final): `listarCobrancas()` é a
 * única função não pura do módulo, e o que ela PEDE ao PostgREST é regra de
 * negócio (a projeção fechada, a ordem total). O teste entra pela porta da
 * frente e troca só o transporte — mesma técnica de `benchmark.test.ts`, com
 * `registerHooks` do próprio Node. Por isso o módulo entra por `await import()`:
 * um `import` estático seria içado para antes do gancho e traria o transporte de
 * verdade junto.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import * as Modulo from 'node:module';
import { describe, test } from 'node:test';

import { VIEWS_FASE_3, type LinhaCobranca } from '@/lib/adm/areas/contrato';
import type { ResumoCobrancas } from '@/lib/adm/areas/cobrancas';

// ─────────────────────────────────────────────────────────────────────────────
// O dublê do transporte
// ─────────────────────────────────────────────────────────────────────────────

/** `admClient()` devolve o que o teste instalou; o resto do módulo é o de verdade. */
const FONTE_DUBLE = `
export function admClient() {
  return globalThis.__admDuble ?? null;
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

const {
  SITUACAO_REGRA,
  SITUACAO_ROTULO,
  SITUACOES,
  STATUS_EM_ABERTO,
  STATUS_PAGO,
  contarPorSituacao,
  filtrarCobrancas,
  listarCobrancas,
  resumirCobrancas,
  situacaoDaCobranca,
} = await import('@/lib/adm/areas/cobrancas');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma cobrança do jeito que ela chega da view: TODO campo explícito.
 *
 * Escrever os doze campos aqui (em vez de um `Partial` frouxo) é de propósito:
 * uma coluna nova em `LinhaCobranca` quebra este fixture no `tsc` e obriga
 * alguém a decidir o que ela vale nos testes — em vez de chegar `undefined` na
 * tela e virar "R$ 0,00" calada.
 */
function cobranca(campos: Partial<LinhaCobranca> = {}): LinhaCobranca {
  return {
    pagamento_id: 1,
    usuario_id: 100,
    usuario_nome: 'Fulano',
    plano_nome: 'Plano Rebanho',
    valor: 150,
    status: 'PENDING',
    metodo_pagamento: 'PIX',
    data_vencimento: '2026-10-10',
    data_pagamento: null,
    inadimplente: false,
    dias_de_atraso: null,
    ...campos,
  };
}

/**
 * A ARMADILHA DA ORDEM, montada à mão: uma cobrança CONFIRMADA em que TODO sinal
 * de atraso está ligado — `inadimplente` true e 90 dias de atraso.
 *
 * A view nunca marcaria `inadimplente` numa linha paga (o cálculo dela só olha
 * OVERDUE e PENDING vencido), e é justamente por isso que este é o fixture certo:
 * ele não descreve o banco, descreve o DEFEITO. Quem reescrever a classificação
 * como "if (l.inadimplente) return 'vencida'" antes de testar o pagamento vê
 * esta linha virar vencida — e é essa linha que manda o Felipe ligar cobrando
 * quem já pagou.
 */
const PAGA_ATRASADA = cobranca({
  pagamento_id: 2,
  usuario_id: 2,
  status: 'RECEIVED',
  valor: 250,
  data_vencimento: '2026-06-01',
  data_pagamento: '2026-08-30',
  inadimplente: true,
  dias_de_atraso: 90,
});

/** Cobrança de ASSOCIAÇÃO: sem `usuario_id`, com dinheiro real parado. */
const ASSOCIACAO_VENCIDA = cobranca({
  pagamento_id: 8,
  usuario_id: null,
  usuario_nome: 'Associação ABCC',
  status: 'OVERDUE',
  valor: 300,
  data_vencimento: '2026-08-24',
  inadimplente: true,
  dias_de_atraso: 8,
});

/**
 * Uma carteira com as SEIS situações representadas e números escolhidos para não
 * coincidirem por acaso. Todo total conferido à mão no teste que a usa.
 */
const CARTEIRA: readonly LinhaCobranca[] = [
  // 3 pagas: 150 + 250 + 200 = 600, ticket 200
  cobranca({
    pagamento_id: 1,
    usuario_id: 1,
    status: 'CONFIRMED',
    valor: 150,
    data_vencimento: '2026-06-10',
    data_pagamento: '2026-06-10',
  }),
  PAGA_ATRASADA,
  cobranca({
    pagamento_id: 3,
    usuario_id: 3,
    status: 'RECEIVED_IN_CASH',
    valor: 200,
    data_vencimento: '2026-07-05',
    data_pagamento: '2026-07-05',
  }),

  // 3 em aberto: 150 + (sem valor) + 50 = 200
  cobranca({ pagamento_id: 4, usuario_id: 4, status: 'PENDING', valor: 150, data_vencimento: '2026-10-10' }),
  cobranca({ pagamento_id: 5, usuario_id: 5, status: 'PENDING', valor: null, data_vencimento: '2026-10-11' }),
  cobranca({ pagamento_id: 12, usuario_id: 12, status: 'PENDING', valor: 50, data_vencimento: null }),

  // 3 vencidas: 150 + 150 + 300 = 600, mas UMA conta só (o #6 aparece duas vezes; a associação não tem conta)
  cobranca({
    pagamento_id: 6,
    usuario_id: 6,
    status: 'PENDING',
    valor: 150,
    data_vencimento: '2026-08-20',
    inadimplente: true,
    dias_de_atraso: 12,
  }),
  cobranca({
    pagamento_id: 7,
    usuario_id: 6,
    status: 'OVERDUE',
    valor: 150,
    data_vencimento: '2026-07-18',
    inadimplente: true,
    dias_de_atraso: 45,
  }),
  ASSOCIACAO_VENCIDA,

  // O que não é caixa nenhum
  cobranca({
    pagamento_id: 9,
    usuario_id: 9,
    status: 'REFUNDED',
    valor: 999,
    data_vencimento: '2026-05-10',
    data_pagamento: '2026-05-10',
  }),
  cobranca({ pagamento_id: 10, usuario_id: 10, status: 'DELETED', valor: 999, data_vencimento: '2026-05-11' }),
  cobranca({
    pagamento_id: 11,
    usuario_id: 11,
    status: 'AWAITING_RISK_ANALYSIS',
    valor: 999,
    data_vencimento: '2026-09-01',
  }),
];

const ids = (linhas: readonly LinhaCobranca[]): number[] => linhas.map((l) => l.pagamento_id);

// ─────────────────────────────────────────────────────────────────────────────
// situacaoDaCobranca — A ORDEM DAS CHECAGENS É A REGRA
// ─────────────────────────────────────────────────────────────────────────────

describe('situacaoDaCobranca', () => {
  test('paga com o vencimento no passado é PAGA — pago vence tudo, inclusive o atraso', () => {
    // O pior erro possível desta tela: mostrar como vencida uma cobrança que já
    // foi paga, e mandar o operador cobrar quem está em dia. Mover a linha do
    // status pago para depois da checagem de atraso compila e passa em qualquer
    // outro teste deste arquivo — menos neste.
    assert.equal(situacaoDaCobranca(PAGA_ATRASADA), 'paga');
    assert.notEqual(situacaoDaCobranca(PAGA_ATRASADA), 'vencida');
  });

  test('os três status de pago vencem o atraso, um a um', () => {
    // Um a um porque a ordem protege o CONJUNTO: se só CONFIRMED for testado, dá
    // para "consertar" a ordem para um status e deixar os outros dois vencidos.
    for (const status of STATUS_PAGO) {
      const linha = cobranca({ status, inadimplente: true, dias_de_atraso: 40 });
      assert.equal(situacaoDaCobranca(linha), 'paga', `${status} com 40 dias de atraso não é 'paga'`);
    }
  });

  test('PENDING com vencimento futuro é em aberto — cobrança normal não é inadimplência', () => {
    // `inadimplente` false é o que a view devolve para um PENDING que vence semana
    // que vem. Pintá-lo de vermelho é ligar cobrando quem está em dia.
    const linha = cobranca({ status: 'PENDING', data_vencimento: '2026-12-01', inadimplente: false });
    assert.equal(situacaoDaCobranca(linha), 'em_aberto');
  });

  test('PENDING já vencido é VENCIDA mesmo com o status ainda PENDING no banco', () => {
    // OVERDUE é evento de webhook, não cálculo: a cobrança que venceu ontem ainda
    // é PENDING e já é dinheiro atrasado. Ler `status === 'OVERDUE'` deixaria de
    // fora exatamente as que ainda dá para salvar com um telefonema.
    const linha = cobranca({ status: 'PENDING', data_vencimento: '2026-08-20', inadimplente: true, dias_de_atraso: 12 });
    assert.equal(situacaoDaCobranca(linha), 'vencida');
  });

  test('entre os dois status em aberto, quem decide é a flag da view e não o status', () => {
    // A tabela inteira do balde "em aberto", nas duas direções.
    assert.equal(situacaoDaCobranca(cobranca({ status: 'OVERDUE', inadimplente: true })), 'vencida');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'PENDING', inadimplente: true })), 'vencida');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'OVERDUE', inadimplente: false })), 'em_aberto');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'PENDING', inadimplente: false })), 'em_aberto');
  });

  test('estornada e cancelada não viram "em aberto" nem por atraso', () => {
    // REFUNDED e DELETED aparecem no livro-caixa com o status delas e nunca são
    // dinheiro a receber. Contá-las como em aberto infla a promessa de caixa.
    assert.equal(situacaoDaCobranca(cobranca({ status: 'REFUNDED', inadimplente: true, dias_de_atraso: 30 })), 'estornada');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'DELETED', inadimplente: true, dias_de_atraso: 30 })), 'cancelada');
  });

  test('status que o Asaas inventar amanhã cai em "outra" — não lança e não vira caixa', () => {
    // A rede de segurança: inflar "a receber" com um estado que ninguém entendeu
    // é pior do que uma linha marcada como desconhecida, que pelo menos vira
    // pergunta na tela.
    for (const status of ['AWAITING_RISK_ANALYSIS', 'CHARGEBACK_REQUESTED', 'AWAITING_CHARGEBACK_REVERSAL']) {
      assert.equal(situacaoDaCobranca(cobranca({ status })), 'outra');
    }
  });

  test('status ausente, vazio ou só espaço é "outra", e não uma cobrança em aberto', () => {
    assert.equal(situacaoDaCobranca(cobranca({ status: null })), 'outra');
    assert.equal(situacaoDaCobranca(cobranca({ status: '' })), 'outra');
    assert.equal(situacaoDaCobranca(cobranca({ status: '   ' })), 'outra');
  });

  test('caixa e espaço não mudam a classificação: " confirmed " é paga', () => {
    // A normalização existe porque o status é texto sem CHECK no banco. Sem ela,
    // uma linha com espaço à direita cairia em "outra" e sumiria do caixa.
    assert.equal(situacaoDaCobranca(cobranca({ status: ' confirmed ' })), 'paga');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'overdue', inadimplente: true })), 'vencida');
    assert.equal(situacaoDaCobranca(cobranca({ status: 'Refunded' })), 'estornada');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// STATUS_PAGO / STATUS_EM_ABERTO — os conjuntos travados
// ─────────────────────────────────────────────────────────────────────────────

const ordenado = (conjunto: ReadonlySet<string>): string[] => [...conjunto].sort();

describe('STATUS_PAGO e STATUS_EM_ABERTO', () => {
  test('pago é exatamente o trio do Asaas: CONFIRMED, RECEIVED, RECEIVED_IN_CASH', () => {
    // A mesma lista que a Edge Function usa para LIBERAR acesso
    // (STATUS_PAGOS de supabase/functions/_shared/asaas.ts). Tirar
    // RECEIVED_IN_CASH daqui faz o painel dizer "não pagou" para um cliente que
    // pagou em dinheiro e já está usando o app.
    assert.deepEqual(ordenado(STATUS_PAGO), ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH']);
  });

  test('em aberto é exatamente PENDING e OVERDUE', () => {
    assert.deepEqual(ordenado(STATUS_EM_ABERTO), ['OVERDUE', 'PENDING']);
  });

  test('os dois conjuntos são disjuntos e nenhum contém REFUNDED nem DELETED', () => {
    // Um status nos dois baldes seria contado como recebido E como a receber no
    // mesmo card — o total da tela passaria a somar mais que a carteira inteira.
    for (const status of STATUS_PAGO) {
      assert.equal(STATUS_EM_ABERTO.has(status), false, `${status} está nos dois conjuntos`);
    }
    for (const status of ['REFUNDED', 'DELETED']) {
      assert.equal(STATUS_PAGO.has(status), false, `${status} não é dinheiro recebido`);
      assert.equal(STATUS_EM_ABERTO.has(status), false, `${status} não é dinheiro a receber`);
    }
  });

  test('todo status dos conjuntos é classificado, e nenhum deles cai em "outra"', () => {
    // Amarra a constante ao classificador: acrescentar um status ao conjunto sem
    // ensinar a tela a lidar com ele apareceria aqui.
    for (const status of STATUS_PAGO) {
      assert.equal(situacaoDaCobranca(cobranca({ status })), 'paga');
    }
    for (const status of STATUS_EM_ABERTO) {
      assert.notEqual(situacaoDaCobranca(cobranca({ status })), 'outra');
    }
  });

  test('o SQL das views usa os mesmos conjuntos que o TypeScript', (t) => {
    // A divergência que este teste pega é a real: alguém edita o `in (...)` de
    // uma view (ou o conjunto daqui) e o painel passa a discordar do banco sobre
    // o que é "pago" — dois números plausíveis para a mesma pergunta.
    const dirSql = new URL('../../../../supabase/adm/', import.meta.url);
    if (!existsSync(dirSql)) {
      return t.skip('supabase/adm/*.sql não está neste checkout');
    }

    const conjuntos: string[][] = [];
    for (const arquivo of readdirSync(dirSql).filter((n) => n.endsWith('.sql'))) {
      const sql = readFileSync(new URL(arquivo, dirSql), 'utf8');
      for (const [, lista] of sql.matchAll(/pa\.status\s+in\s*\(([^)]*)\)/gi)) {
        conjuntos.push(
          lista
            .split(',')
            .map((s) => s.trim().replace(/^'|'$/g, ''))
            .sort(),
        );
      }
    }

    assert.ok(conjuntos.length > 0, 'nenhum "pa.status in (...)" encontrado — o teste deixou de conferir alguma coisa');

    const pago = ordenado(STATUS_PAGO);
    const emAberto = ordenado(STATUS_EM_ABERTO);
    for (const conjunto of conjuntos) {
      const conhecido =
        JSON.stringify(conjunto) === JSON.stringify(pago) || JSON.stringify(conjunto) === JSON.stringify(emAberto);
      assert.ok(conhecido, `o SQL usa um conjunto de status que o TS não conhece: ${conjunto.join(', ')}`);
    }
    assert.ok(
      conjuntos.some((c) => JSON.stringify(c) === JSON.stringify(pago)),
      'nenhuma view usa o conjunto de PAGO — ou o SQL mudou, ou a constante mudou',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O vocabulário da tela — chips, rótulos e regras
// ─────────────────────────────────────────────────────────────────────────────

describe('SITUACOES / SITUACAO_ROTULO / SITUACAO_REGRA', () => {
  test('toda situação que a contagem produz tem chip, rótulo e regra', () => {
    // `SITUACOES` é um array simples: o `tsc` NÃO obriga uma situação nova a
    // entrar nele (obriga só nos Record). Sem este teste, acrescentar
    // 'em_disputa' ao tipo daria uma situação classificável que nunca aparece
    // como filtro na tela — invisível no build e invisível na revisão.
    const baldes = Object.keys(contarPorSituacao([])).sort();
    assert.deepEqual([...SITUACOES].sort(), baldes);
    assert.deepEqual(Object.keys(SITUACAO_ROTULO).sort(), baldes);
    assert.deepEqual(Object.keys(SITUACAO_REGRA).sort(), baldes);
  });

  test('nenhum rótulo e nenhuma regra estão vazios: um chip sem critério é um filtro em que ninguém confia', () => {
    for (const situacao of SITUACOES) {
      assert.notEqual(SITUACAO_ROTULO[situacao].trim(), '');
      assert.notEqual(SITUACAO_REGRA[situacao].trim(), '');
    }
  });

  test('a regra de "paga" cita os três status e a de "vencida" fala de vencimento no passado', () => {
    // O texto vai para o `title` do chip. Ele é a resposta a "esse número está
    // errado" — se deixar de citar o critério, a conversa vira suposição.
    for (const status of STATUS_PAGO) {
      assert.match(SITUACAO_REGRA.paga, new RegExp(status));
    }
    assert.match(SITUACAO_REGRA.vencida, /vencimento no passado/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resumirCobrancas — os números dos cards
// ─────────────────────────────────────────────────────────────────────────────

describe('resumirCobrancas', () => {
  test('a carteira montada à mão fecha campo a campo', () => {
    // Conferido à mão sobre CARTEIRA:
    //   pagas    150 + 250 + 200 = 600 · ticket 600/3 = 200
    //   aberto   150 + (sem valor) + 50 = 200, em 3 cobranças
    //   vencidas 150 + 150 + 300 = 600, em 3 cobranças
    //   contas   #6 aparece duas vezes e conta uma; a associação não tem conta
    //   atraso   max(12, 45, 8) = 45 — os 90 dias da PAGA_ATRASADA ficam de fora
    //   estornada, cancelada e desconhecida (999 cada) não somam em lugar nenhum
    const esperado: ResumoCobrancas = {
      cobrancas: 12,
      pagas: 3,
      pagasComValor: 3,
      recebido: 600,
      ticketMedio: 200,
      emAberto: 3,
      emAbertoValor: 200,
      vencidas: 3,
      vencidasValor: 600,
      contasInadimplentes: 1,
      maiorAtraso: 45,
      semValor: 1,
      semVencimento: 1,
    };
    assert.deepEqual(resumirCobrancas(CARTEIRA), esperado);
  });

  test('a paga com 90 dias de atraso entra no recebido e não no vencido', () => {
    // O mesmo defeito de ordem do primeiro teste, agora pelo lado do dinheiro:
    // se ele voltar, R$ 250 migram de "recebido" para "inadimplente" e o maior
    // atraso da carteira vira 90 — três cards errados de uma vez.
    const resumo = resumirCobrancas([PAGA_ATRASADA]);
    assert.equal(resumo.pagas, 1);
    assert.equal(resumo.recebido, 250);
    assert.equal(resumo.vencidas, 0);
    assert.equal(resumo.vencidasValor, 0);
    assert.equal(resumo.contasInadimplentes, 0);
    assert.equal(resumo.maiorAtraso, null);
  });

  test('sem nenhuma cobrança paga, o ticket médio é null — nunca R$ 0,00', () => {
    // "Ninguém pagou" e "o ticket é zero" são frases diferentes, e a segunda é
    // uma afirmação falsa sobre o preço do produto.
    const soVencidas = CARTEIRA.filter((l) => situacaoDaCobranca(l) === 'vencida');
    const resumo = resumirCobrancas(soVencidas);
    assert.equal(resumo.ticketMedio, null);
    assert.notEqual(resumo.ticketMedio, 0);
    assert.equal(resumo.vencidasValor, 600); // havia dinheiro na lista: o null não é "lista vazia"
  });

  test('lista vazia devolve zeros e nulls, e não lança', () => {
    const vazio: ResumoCobrancas = {
      cobrancas: 0,
      pagas: 0,
      pagasComValor: 0,
      recebido: 0,
      ticketMedio: null,
      emAberto: 0,
      emAbertoValor: 0,
      vencidas: 0,
      vencidasValor: 0,
      contasInadimplentes: 0,
      maiorAtraso: null,
      semValor: 0,
      semVencimento: 0,
    };
    assert.deepEqual(resumirCobrancas([]), vazio);
  });

  test('cobrança de associação soma o valor vencido mas não conta como conta a cobrar', () => {
    // O dinheiro está parado do mesmo jeito (entra em vencidasValor), mas não há
    // ficha de cliente para abrir: contá-la como conta inadimplente inventaria
    // uma pessoa para o operador ligar.
    const resumo = resumirCobrancas([ASSOCIACAO_VENCIDA]);
    assert.equal(resumo.vencidas, 1);
    assert.equal(resumo.vencidasValor, 300);
    assert.equal(resumo.contasInadimplentes, 0);
    assert.equal(resumo.maiorAtraso, 8);
  });

  test('duas cobranças vencidas da mesma conta são UMA conta a cobrar', () => {
    // "Para quantas pessoas ligar", não "quantos boletos existem".
    const daMesmaConta = CARTEIRA.filter((l) => l.usuario_id === 6);
    assert.equal(daMesmaConta.length, 2);
    assert.equal(resumirCobrancas(daMesmaConta).contasInadimplentes, 1);
  });

  test('valor nulo aparece em semValor em vez de sumir dentro de um total', () => {
    const semValor = cobranca({ pagamento_id: 5, valor: null, data_vencimento: '2026-10-11' });
    const resumo = resumirCobrancas([semValor]);
    assert.equal(resumo.semValor, 1);
    assert.equal(resumo.emAberto, 1);
    assert.equal(resumo.emAbertoValor, 0);
  });

  test('cobrança sem vencimento é contada como tal — ela é invisível a qualquer recorte de período', () => {
    // O par deste número está em filtrarCobrancas: a linha sem vencimento fica
    // FORA de todo recorte. Sem o contador, ela desaparece da tela sem aviso.
    const resumo = resumirCobrancas(CARTEIRA);
    assert.equal(resumo.semVencimento, 1);
    assert.equal(filtrarCobrancas(CARTEIRA, { de: '2000-01-01', ate: '2099-12-31' }).length, 11);
  });

  test('estornada, cancelada e desconhecida não entram em soma nenhuma', () => {
    // 999 três vezes: se qualquer um dos três baldes vazar para o caixa, aparece.
    const foraDoCaixa = CARTEIRA.filter((l) =>
      ['estornada', 'cancelada', 'outra'].includes(situacaoDaCobranca(l)),
    );
    assert.equal(foraDoCaixa.length, 3);
    const resumo = resumirCobrancas(foraDoCaixa);
    assert.equal(resumo.cobrancas, 3);
    assert.equal(resumo.recebido, 0);
    assert.equal(resumo.emAbertoValor, 0);
    assert.equal(resumo.vencidasValor, 0);
    assert.equal(resumo.ticketMedio, null);
  });

  test(
    'uma paga sem valor não derruba o ticket médio: o divisor é quem tem valor conhecido',
    () => {
      const pagas = CARTEIRA.filter((l) => situacaoDaCobranca(l) === 'paga');
      const resumo = resumirCobrancas([
        ...pagas,
        cobranca({ pagamento_id: 13, status: 'CONFIRMED', valor: null, data_vencimento: '2026-07-09' }),
      ]);
      assert.equal(resumo.semValor, 1);
      assert.equal(resumo.recebido, 600);
      assert.equal(resumo.ticketMedio, 200);
    },
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// filtrarCobrancas — o recorte da tabela
// ─────────────────────────────────────────────────────────────────────────────

describe('filtrarCobrancas', () => {
  test('sem filtro devolve tudo, na mesma ordem, sem mexer na lista recebida', () => {
    const antes = ids(CARTEIRA);
    const saida = filtrarCobrancas(CARTEIRA);
    assert.deepEqual(ids(saida), antes);
    assert.deepEqual(ids(CARTEIRA), antes, 'filtrar mexeu na lista de entrada');
    assert.notEqual(saida, CARTEIRA, 'devolveu a mesma referência: quem ordenar depois muda a origem');
  });

  test('lista de situações VAZIA significa todas, e não nenhuma', () => {
    // A diferença entre "o operador não escolheu chip nenhum" e "o operador
    // escolheu um filtro impossível". Trocar isso esvazia a tela inteira.
    assert.equal(filtrarCobrancas(CARTEIRA, { situacoes: [] }).length, CARTEIRA.length);
    assert.equal(filtrarCobrancas(CARTEIRA, { situacoes: undefined }).length, CARTEIRA.length);
  });

  test('dentro da faceta de situação os valores são OU', () => {
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { situacoes: ['paga'] })), [1, 2, 3]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { situacoes: ['paga', 'vencida'] })), [1, 2, 3, 6, 7, 8]);
  });

  test('situação sem nenhuma linha devolve lista vazia em vez de tudo', () => {
    const soEstornadas = filtrarCobrancas(
      CARTEIRA.filter((l) => situacaoDaCobranca(l) !== 'estornada'),
      { situacoes: ['estornada'] },
    );
    assert.deepEqual(soEstornadas, []);
  });

  test('o recorte por vencimento é inclusivo nos dois extremos', () => {
    // O clássico: `>` em vez de `>=` some com o dia de abertura do período e o
    // card e a tabela passam a discordar em uma linha.
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: '2026-08-20', ate: '2026-08-24' })), [6, 8]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: '2026-08-20', ate: '2026-08-20' })), [6]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: '2026-08-21', ate: '2026-08-24' })), [8]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: '2026-08-20', ate: '2026-08-23' })), [6]);
  });

  test('só "de" corta o começo e só "ate" corta o fim', () => {
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: '2026-10-10' })), [4, 5]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { ate: '2026-05-11' })), [9, 10]);
  });

  test('"de" e "ate" nulos são o mesmo que ausentes — inclusive para a linha sem vencimento', () => {
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { de: null, ate: null })), ids(CARTEIRA));
  });

  test('vencimento com hora pertence ao dia civil dele, sem passar por new Date()', () => {
    // 23h30 em Brasília no dia 20 é 02h30 UTC do dia 21: quem converter com
    // `new Date()` empurra a cobrança para o dia seguinte e ela some do recorte.
    const comHora = cobranca({ pagamento_id: 20, data_vencimento: '2026-08-20T23:30:00-03:00' });
    assert.deepEqual(ids(filtrarCobrancas([comHora], { de: '2026-08-20', ate: '2026-08-20' })), [20]);
    assert.deepEqual(filtrarCobrancas([comHora], { de: '2026-08-21', ate: '2026-08-21' }), []);
  });

  test('cobrança sem vencimento fica fora de qualquer recorte, e dentro quando não há recorte', () => {
    // Ela não pode ser afirmada dentro NEM fora da janela; o resumo a conta à
    // parte (semVencimento) para ela não sumir sem aviso.
    const semData = CARTEIRA.filter((l) => l.data_vencimento == null);
    assert.equal(semData.length, 1);
    assert.deepEqual(filtrarCobrancas(semData, { de: '2000-01-01' }), []);
    assert.deepEqual(filtrarCobrancas(semData, { ate: '2099-12-31' }), []);
    assert.deepEqual(ids(filtrarCobrancas(semData)), [12]);
  });

  test('situação e período se combinam com E: dentro da faceta é OU, entre facetas é E', () => {
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { situacoes: ['vencida'], de: '2026-08-01' })), [6, 8]);
    assert.deepEqual(ids(filtrarCobrancas(CARTEIRA, { situacoes: ['paga'], de: '2026-08-01' })), []);
  });

  test('filtrar é composável: o mesmo recorte em dois passos dá o mesmo resultado', () => {
    // A tela faz exatamente isto — recorta o período, resume, e só depois aplica
    // os chips. Se a composição divergisse, o card e a tabela discordariam.
    const emDoisPassos = filtrarCobrancas(filtrarCobrancas(CARTEIRA, { de: '2026-08-01' }), {
      situacoes: ['vencida'],
    });
    const deUmaVez = filtrarCobrancas(CARTEIRA, { situacoes: ['vencida'], de: '2026-08-01' });
    assert.deepEqual(ids(emDoisPassos), ids(deUmaVez));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// contarPorSituacao — os números dos chips
// ─────────────────────────────────────────────────────────────────────────────

describe('contarPorSituacao', () => {
  test('a contagem da carteira bate balde a balde', () => {
    assert.deepEqual(contarPorSituacao(CARTEIRA), {
      paga: 3,
      em_aberto: 3,
      vencida: 3,
      estornada: 1,
      cancelada: 1,
      outra: 1,
    });
  });

  test('a soma dos baldes é o total da lista: nenhuma linha fica sem balde nem cai em dois', () => {
    const contagem = contarPorSituacao(CARTEIRA);
    const soma = Object.values(contagem).reduce((acc, n) => acc + n, 0);
    assert.equal(soma, CARTEIRA.length);
  });

  test('cada balde bate com o que o filtro daquela situação devolve', () => {
    // Contagem e filtro respondem à mesma pergunta em lugares diferentes da tela:
    // um chip dizendo "4" que abre uma tabela com 3 linhas destrói a confiança
    // nos dois números.
    const contagem = contarPorSituacao(CARTEIRA);
    for (const situacao of SITUACOES) {
      assert.equal(
        contagem[situacao],
        filtrarCobrancas(CARTEIRA, { situacoes: [situacao] }).length,
        `o chip ${situacao} discorda do filtro`,
      );
    }
  });

  test('lista vazia devolve os seis baldes zerados — a chave existe para o chip mostrar 0', () => {
    // Um chip que some é um beco sem saída invisível; um chip com "0" é
    // informação. Por isso a contagem nasce completa, e não com as chaves vistas.
    const contagem = contarPorSituacao([]);
    assert.deepEqual(Object.values(contagem), [0, 0, 0, 0, 0, 0]);
    for (const situacao of SITUACOES) assert.equal(contagem[situacao], 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listarCobrancas — o que o módulo PEDE ao banco
// ─────────────────────────────────────────────────────────────────────────────

type LinhaCrua = Record<string, unknown>;
type ErroFalso = { message: string; code?: string };
type PaginaFalsa = LinhaCrua[] | { erro: ErroFalso };
type RespostaPostgrest = { data: unknown[] | null; error: ErroFalso | null };

/** O `db-max-rows` do PostgREST, o mesmo tamanho de página do módulo. */
const PAGE = 1000;

/** O que o módulo pediu ao transporte, por página. */
interface Chamada {
  view: string;
  colunas: string;
  ordens: [string, unknown][];
  ranges: [number, number][];
}

interface ConsultaFalsa {
  order(coluna: string, opcoes?: unknown): ConsultaFalsa;
  range(de: number, ate: number): ConsultaFalsa;
  then(cumprir: (resposta: RespostaPostgrest) => void): void;
}

function instalar(paginas: PaginaFalsa[]): Chamada[] {
  const chamadas: Chamada[] = [];

  const cliente = {
    from(view: string) {
      return {
        select(colunas: string): ConsultaFalsa {
          const chamada: Chamada = { view, colunas, ordens: [], ranges: [] };
          chamadas.push(chamada);

          const consulta: ConsultaFalsa = {
            order(coluna, opcoes) {
              chamada.ordens.push([coluna, opcoes]);
              return consulta;
            },
            range(de, ate) {
              chamada.ranges.push([de, ate]);
              return consulta;
            },
            then(cumprir) {
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

  (globalThis as unknown as { __admDuble: unknown }).__admDuble = cliente;
  return chamadas;
}

/** Uma página cheia de linhas cruas, numeradas a partir de `inicio`. */
function pagina(quantidade: number, inicio: number): LinhaCrua[] {
  return Array.from({ length: quantidade }, (_, i) => ({ pagamento_id: inicio + i }));
}

/** Roda com o `console.error` calado: `falha()` grita de propósito em produção. */
async function semGritar<T>(corpo: () => Promise<T>): Promise<T> {
  const gritos = console.error;
  console.error = () => {};
  try {
    return await corpo();
  } finally {
    console.error = gritos;
  }
}

describe('listarCobrancas', () => {
  test('lê a view do CONTRATO e projeta exatamente as colunas do contrato — nunca select(*)', async () => {
    // Foi a divergência entre o nome no SQL e o nome no TS que deixou dez telas
    // compilando e abrindo vazias na Fase 1. E `select('*')` faria uma coluna
    // nova da view entrar no payload RSC sem ninguém ter decidido que ela pode.
    const chamadas = instalar([[]]);
    await listarCobrancas();

    assert.equal(chamadas[0].view, VIEWS_FASE_3.cobrancas);
    const colunas = chamadas[0].colunas.split(',');
    assert.equal(colunas.includes('*'), false);
    assert.deepEqual(colunas.sort(), Object.keys(cobranca()).sort());
  });

  test('a ordem é total e põe os nulos por último: vencimento desc, desempate pela chave', async () => {
    // Duas coisas de uma vez. `nullsFirst: false` impede que a primeira página
    // seja tomada por cobranças sem vencimento; o segundo `order` fecha a ordem —
    // sem ele, `range()` sobre linhas empatadas repete e pula linha entre páginas,
    // e a tabela de dinheiro fica com uma cobrança duplicada e outra sumida.
    const chamadas = instalar([[]]);
    await listarCobrancas();
    assert.deepEqual(chamadas[0].ordens, [
      ['data_vencimento', { ascending: false, nullsFirst: false }],
      ['pagamento_id', { ascending: false }],
    ]);
  });

  test('página cheia não encerra a leitura; a parcial encerra, e o total sai inteiro e na ordem', async () => {
    // O PostgREST corta no db-max-rows e devolve HTTP 200: uma lista truncada
    // chega aqui parecendo completa. Parar na primeira página cheia esconderia
    // 1007 cobranças de um total somado logo abaixo, sem erro nenhum.
    const chamadas = instalar([pagina(PAGE, 1), pagina(PAGE, 1001), pagina(7, 2001)]);
    const resultado = await listarCobrancas();
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;

    assert.equal(resultado.dados.length, 2007);
    assert.equal(resultado.dados[0].pagamento_id, 1);
    assert.equal(resultado.dados.at(-1)?.pagamento_id, 2007);
    assert.equal(chamadas.length, 3, 'pediu página a mais depois da parcial, ou parou antes da hora');
    assert.deepEqual(
      chamadas.map((c) => c.ranges[0]),
      [
        [0, 999],
        [1000, 1999],
        [2000, 2999],
      ],
    );
  });

  test('acima do teto devolve ERRO em vez de uma lista truncada', async () => {
    // Uma tabela de dinheiro cortada pela metade continua parecendo uma tabela de
    // dinheiro. O teto existe para virar erro visível em vez de total silencioso.
    instalar(Array.from({ length: 20 }, (_, p) => pagina(PAGE, p * PAGE + 1)));
    const resultado = await listarCobrancas();
    assert.equal(resultado.ok, false);
    if (resultado.ok) return;
    assert.equal(resultado.motivo, 'erro');
    assert.match(resultado.detalhe, /truncad/i);
  });

  test('view ausente é "falta configurar"; falha de verdade é erro', async () => {
    // A distinção que mais importa nesta área: uma tela de receita vazia por
    // falta de migration é indistinguível de uma carteira que não fatura nada.
    await semGritar(async () => {
      instalar([{ erro: { message: 'relation "adm.cobrancas_lista" does not exist', code: '42P01' } }]);
      const semMigration = await listarCobrancas();
      assert.equal(semMigration.ok, false);
      if (!semMigration.ok) {
        assert.equal(semMigration.motivo, 'sem-config');
        assert.match(semMigration.detalhe, /VIEWS_FASE_3|Exposed schemas/);
      }

      instalar([{ erro: { message: 'canceling statement due to statement timeout', code: '57014' } }]);
      const quebrado = await listarCobrancas();
      assert.equal(quebrado.ok, false);
      if (!quebrado.ok) assert.equal(quebrado.motivo, 'erro', 'timeout não pode virar "falta configurar"');
    });
  });

  test('sem Supabase configurado a tela diz "falta configurar" em vez de estourar', async () => {
    (globalThis as unknown as { __admDuble: unknown }).__admDuble = null;
    const resultado = await listarCobrancas();
    assert.equal(resultado.ok, false);
    if (!resultado.ok) assert.equal(resultado.motivo, 'sem-config');
  });

  test('numeric que chega como texto vira número, e nulo continua nulo', async () => {
    // `numeric(10,2)` do Postgres chega como STRING pelo PostgREST sempre que a
    // precisão não cabe em double: tratar como não-número zeraria a coluna de
    // valor da tela inteira, sem uma linha de erro em lugar nenhum. E `valor`
    // nulo tem que continuar nulo — virar 0 esconde um defeito de dado dentro de
    // um total que continua parecendo íntegro.
    instalar([
      [
        {
          pagamento_id: '42',
          usuario_id: null,
          usuario_nome: '  ',
          plano_nome: 'Plano Rebanho',
          valor: '1234.56',
          status: 'OVERDUE',
          metodo_pagamento: null,
          data_vencimento: '2026-08-24',
          data_pagamento: null,
          inadimplente: 't',
          dias_de_atraso: 0,
        },
      ],
    ]);

    const resultado = await listarCobrancas();
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;

    const [linha] = resultado.dados;
    assert.equal(linha.pagamento_id, 42);
    assert.equal(linha.valor, 1234.56);
    assert.equal(linha.usuario_id, null, 'a cobrança de associação não pode ganhar um usuário 0');
    assert.equal(linha.usuario_nome, null, 'nome só de espaço é ausência, não um nome em branco');
    assert.equal(linha.inadimplente, true, "'t' do Postgres é verdadeiro");
    assert.equal(linha.dias_de_atraso, 0, 'vence hoje (0) não é "não se aplica" (null)');
    assert.equal(situacaoDaCobranca(linha), 'vencida');
  });

  test('valor nulo atravessa a leitura sem virar zero', async () => {
    instalar([[{ pagamento_id: 1, valor: null, status: 'PENDING', data_vencimento: '2026-10-10' }]]);
    const resultado = await listarCobrancas();
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;
    assert.equal(resultado.dados[0].valor, null);
    assert.equal(resumirCobrancas(resultado.dados).semValor, 1);
  });
});
