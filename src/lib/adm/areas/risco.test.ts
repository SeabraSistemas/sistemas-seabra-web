/**
 * OS QUATRO BALDES DE RISCO — os testes da extração de `/adm/carteira/risco`.
 *
 * ESTE ARQUIVO NASCEU DE UM REFACTOR, não de uma função nova: a lógica de cada
 * balde já vivia dentro da página, testada só a olho (a tela abrindo certo).
 * O risco de mover código que já funciona para um módulo é reproduzir o
 * comportamento ERRADO com confiança nova — por isso cada teste aqui fixa um
 * comportamento que já existia, não um que eu inventei ao extrair.
 *
 * O que este arquivo protege, em ordem de gravidade:
 *
 *   1. A ORDEM DE 'inadimplente' — por TEMPO DE ATRASO, não pelo `ordem: 'valor'`
 *      que a consulta pede. `ordem: 'valor'` aqui é decoração: toda assinatura
 *      vencida tem valor_real_mensal = 0, e um reordenamento que "esquecesse"
 *      de reaplicar o sort por atraso devolveria a lista na ordem do banco —
 *      compilando, sem erro, e com a lista de ligação embaralhada.
 *   2. O FILTRO de 'trial' — só quem termina dentro da janela de alerta,
 *      excluindo quem não tem data de vencimento nenhuma.
 *   3. A DEDUPE de 'sem_pagamento' — a mesma conta não pode contar duas vezes
 *      só porque apareceu em duas consultas.
 *   4. QUE O ERRO DE QUALQUER SUB-CONSULTA SE PROPAGA — nenhum balde devolve
 *      lista parcial calada quando uma chamada falha.
 */

import assert from 'node:assert/strict';
import * as Modulo from 'node:module';
import { describe, test } from 'node:test';

import type { UsuarioLista } from '@/lib/adm/types';

// ─────────────────────────────────────────────────────────────────────────────
// O dublê de `@/lib/adm/queries` — só a função que `risco.ts` usa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma fila de respostas, consumida na ORDEM DAS CHAMADAS. `sem_pagamento` faz
 * duas chamadas dentro de um `Promise.all`: como as duas promessas nascem de
 * `listarUsuarios(...)` invocado sincronamente na avaliação do array-literal
 * (antes de qualquer `await`), a ordem de `push` é determinística — a primeira
 * posição do array é sempre a primeira a chamar.
 */
const FONTE_DUBLE = `
let fila = [];
let chamadas = [];
export function listarUsuarios(filtros) {
  chamadas.push(filtros);
  const resp = fila.shift();
  return Promise.resolve(resp ?? { ok: true, dados: [] });
}
export function __instalar(respostas) {
  fila = [...respostas];
  chamadas = [];
}
export function __chamadas() {
  return chamadas;
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
    if (especificador === '@/lib/adm/queries') {
      return { url: URL_DUBLE, shortCircuit: true };
    }
    return proximo(especificador, contexto);
  },
});

// `await import()` e não `import` estático: um import estático seria içado para
// antes do gancho e traria `queries.ts` de verdade junto (54 KB, e um cliente
// Supabase de verdade).
const { __chamadas, __instalar } = (await import('@/lib/adm/queries')) as unknown as {
  __instalar(respostas: unknown[]): void;
  __chamadas(): unknown[];
};

const { TRIAL_ALERTA_DIAS, carregarBalde } = await import('@/lib/adm/areas/risco');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/** Um usuário do jeito que ele chega de `adm.usuarios_lista`: TODO campo
 *  explícito — uma coluna nova na interface quebra este fixture no `tsc`. */
function usuario(campos: Partial<UsuarioLista> = {}): UsuarioLista {
  return {
    id: 1,
    nome: 'Fulano',
    email_mascarado: null,
    whatsapp_mascarado: null,
    whatsapp_pais: null,
    papel: 'produtor',
    ativo: true,
    is_tester: false,
    is_demo: false,
    tem_cpf: false,
    sem_auth: false,
    onboarding_finalizado: true,
    data_cadastro: '2026-01-01',
    associacao_id: null,
    associacao_nome: null,
    propriedade_id: 1,
    propriedade_nome: 'Fazenda Boa Vista',
    numero_criador: null,
    estado: 'CE',
    segmentos: [],
    total_propriedades: 1,
    animais_ativos: 0,
    plano_nome: 'Produtor Individual',
    status_efetivo: 'ativa',
    acesso_ativo: true,
    origem_acesso: 'pagante',
    valor_real_mensal: 0,
    data_vencimento: null,
    ultimo_lancamento_em: null,
    ultimo_modulo: null,
    lancamentos_30d: 0,
    dias_distintos_30d: 0,
    modulos_90d: 0,
    animais_com_evento_90d: 0,
    dias_sem_lancar: null,
    health_score: null,
    ...campos,
  };
}

const AGORA = new Date('2026-09-07T12:00:00Z');

function falha(motivo: 'sem-config' | 'erro' = 'erro') {
  return { ok: false as const, motivo, detalhe: 'falha de teste' };
}

function ok<T>(dados: T) {
  return { ok: true as const, dados };
}

// ─────────────────────────────────────────────────────────────────────────────
// silencio — passthrough
// ─────────────────────────────────────────────────────────────────────────────

describe('carregarBalde("silencio")', () => {
  test('pede atividade "silencioso" ordenada por valor, e devolve a lista como veio', async () => {
    const lista = [usuario({ id: 1 }), usuario({ id: 2 })];
    __instalar([ok(lista)]);

    const r = await carregarBalde('silencio', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(r.dados, lista);
    assert.deepEqual(__chamadas(), [{ atividade: 'silencioso', ordem: 'valor' }]);
  });

  test('propaga o erro da consulta em vez de mascarar com lista vazia', async () => {
    __instalar([falha('sem-config')]);
    const r = await carregarBalde('silencio', AGORA);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.motivo, 'sem-config');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// inadimplente — reordenado por tempo de atraso, não pelo `ordem: 'valor'` do SQL
// ─────────────────────────────────────────────────────────────────────────────

describe('carregarBalde("inadimplente")', () => {
  test('pede status "vencida", e REORDENA por atraso — mais vencido primeiro', async () => {
    // As três chegam do SQL em ordem arbitrária (valor_real_mensal empatado em
    // 0 nas três, então `ordem: 'valor'` não desempata nada). O vencimento mais
    // antigo tem de vir primeiro — é o número que a linha mostra.
    const venceuHa10 = usuario({ id: 1, data_vencimento: '2026-08-28' }); // -10d
    const venceuHa30 = usuario({ id: 2, data_vencimento: '2026-08-08' }); // -30d
    const venceuHa2 = usuario({ id: 3, data_vencimento: '2026-09-05' }); // -2d
    __instalar([ok([venceuHa10, venceuHa30, venceuHa2])]);

    const r = await carregarBalde('inadimplente', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(
      r.dados.map((u) => u.id),
      [2, 1, 3],
    );
    assert.deepEqual(__chamadas(), [{ status: ['vencida'], ordem: 'valor' }]);
  });

  test('data de vencimento nula vai para o FIM, nunca para o topo', async () => {
    // `diasEntre` devolve null para vencimento nulo. Se a comparação tratasse
    // null como "menor que qualquer número" (o que um `??` ingênuo faria), uma
    // conta sem data de vencimento pareceria a mais urgente de todas — em vez
    // de, corretamente, a menos urgente (não há nem uma data para cobrar).
    const semData = usuario({ id: 9, data_vencimento: null });
    const comData = usuario({ id: 5, data_vencimento: '2026-09-01' });
    const semData2 = usuario({ id: 7, data_vencimento: null });
    __instalar([ok([semData, comData, semData2])]);

    const r = await carregarBalde('inadimplente', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(
      r.dados.map((u) => u.id),
      [5, 7, 9],
    );
  });

  test('empate exato de atraso desempata por id, para a ordem nunca variar entre leituras', async () => {
    const a = usuario({ id: 3, data_vencimento: '2026-09-01' });
    const b = usuario({ id: 1, data_vencimento: '2026-09-01' });
    __instalar([ok([a, b])]);

    const r = await carregarBalde('inadimplente', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(
      r.dados.map((u) => u.id),
      [1, 3],
    );
  });

  test('propaga o erro da consulta', async () => {
    __instalar([falha()]);
    const r = await carregarBalde('inadimplente', AGORA);
    assert.equal(r.ok, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// trial — filtrado à janela de alerta, ordenado por dias restantes
// ─────────────────────────────────────────────────────────────────────────────

describe('carregarBalde("trial")', () => {
  test('mantém só quem termina em até TRIAL_ALERTA_DIAS dias, e descarta quem não tem data', async () => {
    const estourando = usuario({ id: 1, data_vencimento: '2026-09-10' }); // +3d
    const noLimite = usuario({ id: 2, data_vencimento: '2026-09-14' }); // +7d — a borda
    const longe = usuario({ id: 3, data_vencimento: '2026-09-30' }); // +23d — fora
    const semData = usuario({ id: 4, data_vencimento: null });
    __instalar([ok([estourando, noLimite, longe, semData])]);

    const r = await carregarBalde('trial', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    const ids = r.dados.map((u) => u.id);
    assert.ok(ids.includes(1), 'dentro da janela precisa aparecer');
    assert.ok(ids.includes(2), 'a borda exata da janela é inclusiva');
    assert.ok(!ids.includes(3), 'fora da janela não pode aparecer');
    assert.ok(!ids.includes(4), 'sem data de vencimento não pode aparecer');
    assert.deepEqual(__chamadas(), [{ status: ['trial'], ordem: 'valor' }]);
  });

  test('a janela é TRIAL_ALERTA_DIAS = 7 dias — a constante que a tela também usa no texto', () => {
    assert.equal(TRIAL_ALERTA_DIAS, 7);
  });

  test('ordena por dias restantes; empate desempata por rebanho, depois por id', async () => {
    const poucoUso = usuario({ id: 3, data_vencimento: '2026-09-10', animais_ativos: 5 });
    const muitoUso = usuario({ id: 1, data_vencimento: '2026-09-10', animais_ativos: 200 });
    const acabaAntes = usuario({ id: 2, data_vencimento: '2026-09-08', animais_ativos: 1 });
    __instalar([ok([poucoUso, muitoUso, acabaAntes])]);

    const r = await carregarBalde('trial', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    // acabaAntes vence primeiro (menos dias); entre poucoUso e muitoUso (mesmo
    // dia), quem tem mais animais cadastrados vem primeiro — é o que diz se a
    // ligação vale a pena.
    assert.deepEqual(
      r.dados.map((u) => u.id),
      [2, 1, 3],
    );
  });

  test('propaga o erro da consulta', async () => {
    __instalar([falha()]);
    const r = await carregarBalde('trial', AGORA);
    assert.equal(r.ok, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sem_pagamento — união de duas consultas, deduplicada por id
// ─────────────────────────────────────────────────────────────────────────────

describe('carregarBalde("sem_pagamento")', () => {
  test('faz as duas chamadas certas: cortesia+extensão, e testers incluindo testes', async () => {
    __instalar([ok([]), ok([])]);
    await carregarBalde('sem_pagamento', AGORA);
    assert.deepEqual(__chamadas(), [
      { origens: ['cortesia', 'extensao'], ordem: 'valor' },
      { incluirTestes: true, bandeiras: ['tester'], ordem: 'valor' },
    ]);
  });

  test('uma conta que aparece nas DUAS respostas conta uma vez só', async () => {
    // Cortesia também marcada is_tester: aparece na resposta de cortesia/extensão
    // E na de testers. Sem dedupe, ela viraria duas linhas do mesmo nome.
    const cortesiaETester = usuario({ id: 5, origem_acesso: 'cortesia', is_tester: true, animais_ativos: 10 });
    const soExtensao = usuario({ id: 6, origem_acesso: 'extensao', animais_ativos: 20 });
    __instalar([ok([cortesiaETester, soExtensao]), ok([cortesiaETester])]);

    const r = await carregarBalde('sem_pagamento', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.dados.length, 2, 'a conta 5 não pode contar duas vezes');
    assert.deepEqual(
      r.dados.map((u) => u.id).sort(),
      [5, 6],
    );
  });

  test('ordena por rebanho cadastrado (desc), empate por id', async () => {
    const poucoRebanho = usuario({ id: 3, animais_ativos: 5 });
    const muitoRebanho = usuario({ id: 1, animais_ativos: 500 });
    __instalar([ok([poucoRebanho, muitoRebanho]), ok([])]);

    const r = await carregarBalde('sem_pagamento', AGORA);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.deepEqual(
      r.dados.map((u) => u.id),
      [1, 3],
    );
  });

  test('erro na PRIMEIRA consulta se propaga sem esperar a segunda mentir por omissão', async () => {
    __instalar([falha('sem-config'), ok([usuario({ id: 1 })])]);
    const r = await carregarBalde('sem_pagamento', AGORA);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.equal(r.motivo, 'sem-config');
  });

  test('erro na SEGUNDA consulta também se propaga, mesmo com a primeira ok', async () => {
    __instalar([ok([usuario({ id: 1 })]), falha('erro')]);
    const r = await carregarBalde('sem_pagamento', AGORA);
    assert.equal(r.ok, false);
  });
});
