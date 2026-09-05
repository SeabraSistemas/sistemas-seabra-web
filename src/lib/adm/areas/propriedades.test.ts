/**
 * PROPRIEDADES — os testes do diretório da entidade que o painel passou a gerir.
 *
 * Esta tela decide para quem o Felipe liga e o que ele acha que tem na carteira.
 * Um defeito aqui não deixa a página em branco: deixa a página PLAUSÍVEL e a
 * conclusão errada. Por isso cada caso abaixo existe para pegar um defeito
 * específico, e não para confirmar que a função existe.
 *
 * O QUE ESTE ARQUIVO PROTEGE, em ordem de gravidade:
 *
 *   1. A FAZENDA SEM PRODUTOR. `produtor_id` NULL é a fazenda de consultoria —
 *      um cliente que existe e não é conta. Ela não pode virar link (`/adm/u/0`
 *      abriria a ficha de um usuário inexistente parecendo ter funcionado), não
 *      pode entrar na contagem de produtores, e tem que ser contada no card que
 *      é só dela.
 *   2. NULO POR ÚLTIMO na ordenação. `(a, b) => a - b` transforma `null` em 0:
 *      uma fazenda nova demais para pontuar se disfarçaria da PIOR da carteira e
 *      roubaria o topo da lista de quem realmente está parando.
 *   3. O RESUMO DOS CARDS. Propriedades ≠ contas (uma conta pode ter duas
 *      fazendas) é o fato que justifica esta tela existir ao lado da lista de
 *      usuários — contar linha por linha apagaria justamente isso. E silêncio é
 *      "sumiu MAS ainda paga": quem nunca lançou é onboarding, não retenção.
 *   4. O que `listarPropriedades()` PEDE ao banco — a projeção fechada do
 *      contrato e a ordem total por chave primária, sem a qual a paginação por
 *      `range()` repete e pula linha.
 *
 * NENHUM RELÓGIO. `dias_sem_lancar` e `acesso_ativo` chegam calculados da view,
 * contra o relógio do BANCO: o módulo inteiro é entrada → saída, e nenhum teste
 * aqui chama `new Date()` sem argumento nem depende do dia em que roda.
 *
 * POR QUE UM DUBLÊ DE `supabase-admin` (seção final): `listarPropriedades()` é a
 * única função não pura do módulo, e o que ela PEDE ao PostgREST é regra de
 * negócio. O teste entra pela porta da frente e troca só o transporte — mesma
 * técnica de `cobrancas.test.ts`, com `registerHooks` do próprio Node. Por isso
 * o módulo entra por `await import()`: um `import` estático seria içado para
 * antes do gancho e traria o transporte de verdade junto.
 */

import assert from 'node:assert/strict';
import * as Modulo from 'node:module';
import { describe, test } from 'node:test';

import { VIEWS_FASE_3, type LinhaPropriedade } from '@/lib/adm/areas/contrato';

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
  DIAS_SILENCIO,
  ehSilenciosa,
  fichaDaPropriedade,
  listarPropriedades,
  ordenarPropriedades,
  resumirPropriedades,
} = await import('@/lib/adm/areas/propriedades');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma propriedade do jeito que ela chega da view: TODO campo explícito.
 *
 * Escrever os vinte campos aqui (em vez de um `Partial` frouxo) é de propósito:
 * uma coluna nova em `LinhaPropriedade` quebra este fixture no `tsc` e obriga
 * alguém a decidir o que ela vale nos testes — em vez de chegar `undefined` na
 * tela e virar "0 animais" numa fazenda com 4.820.
 */
function propriedade(campos: Partial<LinhaPropriedade> = {}): LinhaPropriedade {
  return {
    id: 1,
    nome: 'Fazenda Boa Vista',
    numero_criador: '1234',
    cidade: 'Quixadá',
    estado: 'CE',
    segmentos: ['caprino_leiteiro'],
    produtor_id: 100,
    produtor_nome: 'Fulano de Tal',
    animais_ativos: 120,
    lactantes: 40,
    ultimo_lancamento_em: '2026-09-04T10:00:00+00:00',
    ultimo_modulo: 'controle_leiteiro',
    lancamentos_30d: 22,
    dias_sem_lancar: 1,
    colaboradores: 2,
    tecnicos_vinculados: 0,
    plano_nome: 'Plano Rebanho',
    status_efetivo: 'ativa',
    acesso_ativo: true,
    health_score: 82,
    ...campos,
  };
}

/**
 * Uma carteira com os cinco casos que os cards precisam distinguir, e números
 * escolhidos para não coincidirem por acaso. Todo total é conferido à mão.
 */
const CARTEIRA: readonly LinhaPropriedade[] = [
  // Saudável. A conta 100 tem DUAS fazendas — o fato que justifica esta tela.
  propriedade({ id: 1, produtor_id: 100, animais_ativos: 100, lactantes: 10, dias_sem_lancar: 1, health_score: 90 }),
  // Segunda fazenda da MESMA conta, e silenciosa: sumiu e continua pagando.
  propriedade({
    id: 2,
    nome: 'Sítio do Meio',
    produtor_id: 100,
    animais_ativos: 50,
    lactantes: 5,
    dias_sem_lancar: 45,
    health_score: 20,
    acesso_ativo: true,
  }),
  // Parada há muito tempo e SEM acesso: não é silenciosa, é conta encerrada —
  // ligar para ela não é ação nenhuma.
  propriedade({
    id: 3,
    nome: 'Fazenda Antiga',
    produtor_id: 101,
    animais_ativos: 20,
    lactantes: 2,
    dias_sem_lancar: 120,
    health_score: 5,
    acesso_ativo: false,
    status_efetivo: 'cancelada',
  }),
  // NUNCA lançou: onboarding, não retenção.
  propriedade({
    id: 4,
    nome: 'Fazenda Nova',
    produtor_id: 102,
    animais_ativos: 7,
    lactantes: 0,
    ultimo_lancamento_em: null,
    ultimo_modulo: null,
    lancamentos_30d: 0,
    dias_sem_lancar: null,
    health_score: null,
  }),
  // CONSULTORIA: sem produtor no sistema, com rebanho real e sem assinatura própria.
  propriedade({
    id: 5,
    nome: 'Cabanha do Cliente',
    produtor_id: null,
    produtor_nome: 'Cliente do técnico (texto livre)',
    animais_ativos: 300,
    lactantes: 30,
    dias_sem_lancar: 3,
    health_score: 70,
    acesso_ativo: false,
    plano_nome: null,
    status_efetivo: null,
    tecnicos_vinculados: 1,
    colaboradores: 0,
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// A fazenda sem produtor
// ─────────────────────────────────────────────────────────────────────────────

describe('fichaDaPropriedade — a linha que navega e a que não navega', () => {
  test('com dono, leva para a ficha que já existe com a fazenda em foco', () => {
    // A ficha é a do PRODUTOR (`usuarios.id`), com `?prop=` fazendo o recorte —
    // nunca uma segunda ficha ancorada em propriedade_id, que duplicaria as 13
    // abas para ganhar nada.
    assert.equal(fichaDaPropriedade(propriedade({ id: 257, produtor_id: 11954 })), '/adm/u/11954?prop=257');
  });

  test('sem produtor no sistema, NÃO há ficha — a linha não é clicável', () => {
    // `/adm/u/null` daria 404 e `/adm/u/0` abriria a ficha de um usuário que não
    // existe, que é pior: parece ter funcionado. A tela mostra a explicação na
    // célula e manda para a ficha do técnico que atende a fazenda.
    assert.equal(fichaDaPropriedade(propriedade({ id: 5, produtor_id: null })), null);
  });

  test('produtor_id 0 não é ausência de dono (nenhum id de verdade é 0, mas a regra é `== null`)', () => {
    // Guarda contra a reescrita `if (!l.produtor_id)`, que trataria 0 como nulo.
    assert.equal(fichaDaPropriedade(propriedade({ id: 9, produtor_id: 0 })), '/adm/u/0?prop=9');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Ordenação
// ─────────────────────────────────────────────────────────────────────────────

/** Só os ids, na ordem — é o que se lê num diff quando o teste quebra. */
function ids(linhas: readonly LinhaPropriedade[]): number[] {
  return linhas.map((l) => l.id);
}

describe('ordenarPropriedades', () => {
  test('risco: pior score primeiro e NULO POR ÚLTIMO', () => {
    // O defeito que este caso pega: `(a, b) => a - b` transforma null em 0, e a
    // fazenda nova demais para pontuar apareceria como a pior da carteira, no
    // topo da lista de quem está parando. Entre as duas sem score, desempata
    // quem está parado há mais tempo.
    const linhas = [
      propriedade({ id: 1, health_score: null, dias_sem_lancar: 200 }),
      propriedade({ id: 2, health_score: 10, dias_sem_lancar: 5 }),
      propriedade({ id: 3, health_score: 90, dias_sem_lancar: 0 }),
      propriedade({ id: 4, health_score: null, dias_sem_lancar: 3 }),
    ];
    assert.deepEqual(ids(ordenarPropriedades(linhas, 'risco')), [2, 3, 1, 4]);
  });

  test('risco: empate total desempata pela chave — a ordem é TOTAL', () => {
    // Sem o desempate, duas fazendas empatadas podem trocar de lugar entre o
    // render do servidor e o do cliente, e a lista "muda sozinha" na hidratação.
    const linhas = [
      propriedade({ id: 30, health_score: 50, dias_sem_lancar: 4 }),
      propriedade({ id: 7, health_score: 50, dias_sem_lancar: 4 }),
      propriedade({ id: 19, health_score: 50, dias_sem_lancar: 4 }),
    ];
    assert.deepEqual(ids(ordenarPropriedades(linhas, 'risco')), [7, 19, 30]);
  });

  test('risco: dias sem lançar NULO (nunca lançou) também vai por último no desempate', () => {
    const linhas = [
      propriedade({ id: 1, health_score: null, dias_sem_lancar: null }),
      propriedade({ id: 2, health_score: null, dias_sem_lancar: 60 }),
    ];
    assert.deepEqual(ids(ordenarPropriedades(linhas, 'risco')), [2, 1]);
  });

  test('nome: colação pt-BR, a MESMA do clique no cabeçalho da <AdmTable>', () => {
    // Com a comparação crua de JavaScript, 'Á' (U+00C1) vem depois de 'Z' e a
    // lista sairia ao contrário. Importa duas vezes: a ordem inicial precisa ser
    // reproduzível por um clique — o operador clica "Fazenda", clica de novo
    // para voltar, e tem que voltar.
    const linhas = [
      propriedade({ id: 1, nome: 'Zebu Feliz' }),
      propriedade({ id: 2, nome: 'Água Branca' }),
      propriedade({ id: 3, nome: 'Boa Vista' }),
    ];
    assert.deepEqual(
      ordenarPropriedades(linhas, 'nome').map((l) => l.nome),
      ['Água Branca', 'Boa Vista', 'Zebu Feliz'],
    );
  });

  test('animais: do maior rebanho para o menor, com o nome desempatando', () => {
    const linhas = [
      propriedade({ id: 1, nome: 'Beta', animais_ativos: 10 }),
      propriedade({ id: 2, nome: 'Alfa', animais_ativos: 10 }),
      propriedade({ id: 3, nome: 'Gama', animais_ativos: 4820 }),
    ];
    assert.deepEqual(ids(ordenarPropriedades(linhas, 'animais')), [3, 2, 1]);
  });

  test('não mexe na lista recebida', () => {
    // `sort()` do JavaScript ordena NO LUGAR. Reordenar o array do chamador é
    // como a contagem de um card passa a discordar da tabela ao lado dele.
    const linhas = [propriedade({ id: 1, health_score: 90 }), propriedade({ id: 2, health_score: 10 })];
    const ordenada = ordenarPropriedades(linhas, 'risco');
    assert.deepEqual(ids(linhas), [1, 2]);
    assert.notEqual(ordenada, linhas);
    assert.deepEqual(ids(ordenada), [2, 1]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Silêncio
// ─────────────────────────────────────────────────────────────────────────────

describe('ehSilenciosa — sumiu MAS ainda paga', () => {
  test('o corte é de 30 dias e é inclusivo', () => {
    // O número é o mesmo da lista mestra e da carteira: "sumido" tem que querer
    // dizer a mesma coisa em todas as telas do painel.
    assert.equal(DIAS_SILENCIO, 30);
    assert.equal(ehSilenciosa(propriedade({ dias_sem_lancar: 30 })), true);
    assert.equal(ehSilenciosa(propriedade({ dias_sem_lancar: 29 })), false);
  });

  test('sem acesso ativo NÃO é silêncio — é conta encerrada, e ligar não é ação nenhuma', () => {
    assert.equal(ehSilenciosa(propriedade({ dias_sem_lancar: 120, acesso_ativo: false })), false);
  });

  test('quem NUNCA lançou não é silencioso: é onboarding, não retenção', () => {
    assert.equal(
      ehSilenciosa(propriedade({ dias_sem_lancar: null, ultimo_lancamento_em: null, acesso_ativo: true })),
      false,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo dos cards
// ─────────────────────────────────────────────────────────────────────────────

describe('resumirPropriedades', () => {
  test('conta os cinco cards do topo sobre a carteira inteira', () => {
    const r = resumirPropriedades(CARTEIRA);
    assert.equal(r.propriedades, 5);
    assert.equal(r.comAcessoAtivo, 3, 'as duas sem acesso são a encerrada e a de consultoria');
    assert.equal(r.animais, 477, '100 + 50 + 20 + 7 + 300');
    assert.equal(r.lactantes, 47, '10 + 5 + 2 + 0 + 30');
    assert.equal(r.silenciosas, 1, 'só a #2: parada há 45 dias e ainda pagando');
    assert.equal(r.semProdutor, 1);
  });

  test('PROPRIEDADES ≠ CONTAS: a conta com duas fazendas conta uma vez', () => {
    // É a razão de esta tela existir ao lado da lista de usuários. Contar linha
    // por linha diria "5 produtores" e apagaria o fato.
    const r = resumirPropriedades(CARTEIRA);
    assert.equal(r.produtores, 3);
    assert.equal(r.contasComMaisDeUmaFazenda, 1);
  });

  test('a fazenda de consultoria entra no card dela e NÃO vira um produtor', () => {
    // O defeito que este caso pega: contar `produtor_id` sem separar o nulo
    // inventaria uma conta que não existe e sumiria com a categoria comercial.
    const so = [CARTEIRA[4]];
    const r = resumirPropriedades(so);
    assert.equal(r.semProdutor, 1);
    assert.equal(r.produtores, 0);
    assert.equal(r.contasComMaisDeUmaFazenda, 0);
    assert.equal(r.animais, 300, 'o rebanho dela é real e conta na base');
  });

  test('nunca lançou é contado à parte do silêncio', () => {
    const r = resumirPropriedades(CARTEIRA);
    assert.equal(r.nuncaLancaram, 1);
    assert.equal(r.silenciosas, 1, 'a que nunca lançou não pode ter entrado aqui');
  });

  test('carteira vazia dá zeros, não NaN', () => {
    const r = resumirPropriedades([]);
    assert.deepEqual(r, {
      propriedades: 0,
      produtores: 0,
      contasComMaisDeUmaFazenda: 0,
      comAcessoAtivo: 0,
      animais: 0,
      lactantes: 0,
      silenciosas: 0,
      nuncaLancaram: 0,
      semProdutor: 0,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listarPropriedades — o que o módulo PEDE ao banco
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
  return Array.from({ length: quantidade }, (_, i) => ({ id: inicio + i, nome: `Fazenda ${inicio + i}` }));
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

describe('listarPropriedades', () => {
  test('lê a view do CONTRATO e projeta exatamente as colunas dele — nunca select(*)', async () => {
    // Foi a divergência entre o nome no SQL e o nome no TS que deixou dez telas
    // compilando e abrindo vazias na Fase 1. E `select('*')` faria uma coluna
    // nova da view entrar no payload RSC sem ninguém ter decidido que ela pode —
    // neste schema moram o CPF e a senha em texto plano.
    const chamadas = instalar([[]]);
    await listarPropriedades();

    assert.equal(chamadas[0].view, VIEWS_FASE_3.propriedades);
    const colunas = chamadas[0].colunas.split(',');
    assert.equal(colunas.includes('*'), false);
    assert.deepEqual(colunas.sort(), Object.keys(propriedade()).sort());
  });

  test('a ordem pedida ao banco é a da PAGINAÇÃO: total, pela chave primária', async () => {
    // `range()` sobre uma consulta sem desempate único pode repetir e pular linha
    // entre páginas. A ordem de APRESENTAÇÃO é outra coisa e vem depois, em
    // memória — ordenar no banco por health_score (cheio de empate e de nulo)
    // misturaria as duas funções e quebraria a paginação em silêncio.
    const chamadas = instalar([[]]);
    await listarPropriedades();
    assert.deepEqual(chamadas[0].ordens, [['id', { ascending: true }]]);
  });

  test('página cheia não encerra a leitura; a parcial encerra', async () => {
    // O PostgREST corta no db-max-rows e devolve HTTP 200: uma lista truncada
    // chega aqui parecendo completa, e é dela que os cards seriam contados.
    const chamadas = instalar([pagina(PAGE, 1), pagina(3, 1001)]);
    const resultado = await listarPropriedades({ ordem: 'nome' });
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;

    assert.equal(resultado.dados.length, 1003);
    assert.equal(chamadas.length, 2, 'parou antes da hora, ou pediu página a mais depois da parcial');
    assert.deepEqual(
      chamadas.map((c) => c.ranges[0]),
      [
        [0, 999],
        [1000, 1999],
      ],
    );
  });

  test('acima do teto devolve ERRO em vez de uma lista truncada', async () => {
    instalar(Array.from({ length: 5 }, (_, p) => pagina(PAGE, p * PAGE + 1)));
    const resultado = await semGritar(() => listarPropriedades());
    assert.equal(resultado.ok, false);
    if (resultado.ok) return;
    assert.equal(resultado.motivo, 'erro');
    assert.match(resultado.detalhe, /truncad/i);
  });

  test('view ausente é "falta configurar"; falha de verdade é erro', async () => {
    // A distinção que mais importa: um diretório vazio por falta de migration é
    // indistinguível de uma carteira que não tem cliente nenhum.
    await semGritar(async () => {
      instalar([{ erro: { message: 'relation "adm.propriedades_lista" does not exist', code: '42P01' } }]);
      const semMigration = await listarPropriedades();
      assert.equal(semMigration.ok, false);
      if (!semMigration.ok) {
        assert.equal(semMigration.motivo, 'sem-config');
        assert.match(semMigration.detalhe, /VIEWS_FASE_3|Exposed schemas/);
      }

      instalar([{ erro: { message: 'canceling statement due to statement timeout', code: '57014' } }]);
      const quebrado = await listarPropriedades();
      assert.equal(quebrado.ok, false);
      if (!quebrado.ok) assert.equal(quebrado.motivo, 'erro', 'timeout não pode virar "falta configurar"');
    });
  });

  test('sem Supabase configurado a tela diz "falta configurar" em vez de estourar', async () => {
    (globalThis as unknown as { __admDuble: unknown }).__admDuble = null;
    const resultado = await listarPropriedades();
    assert.equal(resultado.ok, false);
    if (!resultado.ok) assert.equal(resultado.motivo, 'sem-config');
  });

  test('devolve a lista JÁ ordenada por risco, com os sem score no fim', async () => {
    instalar([
      [
        { id: 1, nome: 'Sem score', health_score: null, dias_sem_lancar: 4 },
        { id: 2, nome: 'Saudável', health_score: 95, dias_sem_lancar: 0 },
        { id: 3, nome: 'Em risco', health_score: 12, dias_sem_lancar: 40 },
      ],
    ]);
    const resultado = await listarPropriedades();
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;
    assert.deepEqual(ids(resultado.dados), [3, 2, 1]);
  });

  test('o mapeamento preserva o que a tela precisa distinguir', async () => {
    // Quatro armadilhas de uma vez: dono ausente não pode virar 0 (montaria um
    // link para /adm/u/0), "lançou hoje" (0) não pode virar "nunca" (null),
    // segmento nulo vira lista vazia, e o booleano 't' do Postgres é verdadeiro.
    instalar([
      [
        {
          id: '257',
          nome: '  ',
          numero_criador: '',
          cidade: null,
          estado: 'CE',
          segmentos: null,
          produtor_id: null,
          produtor_nome: 'Cliente do técnico',
          animais_ativos: '4820',
          lactantes: null,
          ultimo_lancamento_em: '2026-09-05T09:00:00+00:00',
          ultimo_modulo: 'pesagem',
          lancamentos_30d: 3,
          dias_sem_lancar: 0,
          colaboradores: null,
          tecnicos_vinculados: 1,
          plano_nome: null,
          status_efetivo: null,
          acesso_ativo: 't',
          health_score: null,
        },
      ],
    ]);

    const resultado = await listarPropriedades();
    assert.equal(resultado.ok, true);
    if (!resultado.ok) return;

    const [l] = resultado.dados;
    assert.equal(l.id, 257);
    assert.equal(l.produtor_id, null, 'a fazenda de consultoria não pode ganhar um dono 0');
    assert.equal(fichaDaPropriedade(l), null);
    assert.equal(l.dias_sem_lancar, 0, 'lançou HOJE (0) não é "nunca lançou" (null)');
    assert.equal(l.animais_ativos, 4820, 'contagem que chega como texto continua sendo número');
    assert.equal(l.lactantes, 0, 'contagem nula é zero: 0 significa "nenhum", nunca "não sei"');
    assert.deepEqual(l.segmentos, [], 'text[] nulo vira lista vazia, não null solto na tela');
    assert.equal(l.acesso_ativo, true, "'t' do Postgres é verdadeiro");
    assert.equal(l.numero_criador, null, 'nº de criador vazio é ausência (D1: aceita vazia)');
    assert.equal(l.nome, 'Propriedade #257', 'nome em branco vira identificação, não célula vazia');
  });
});
