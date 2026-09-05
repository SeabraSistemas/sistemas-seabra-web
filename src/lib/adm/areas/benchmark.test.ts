/**
 * BENCHMARK — os testes das TRAVAS.
 *
 * Esta é a única tela do painel que faz uma AFIRMAÇÃO SOBRE O NEGÓCIO DE UM
 * CLIENTE, dita pela Sistema Seabra numa ligação. O cabeçalho de `benchmark.ts`
 * lista quatro regras que impedem a tela de afirmar mais do que os dados
 * sustentam; este arquivo é o que faz cada uma delas falhar quando alguém a
 * remove sem querer.
 *
 * POR QUE UM DUBLÊ DE `supabase-admin` E NÃO CHAMADAS DIRETAS ÀS FUNÇÕES
 * A geometria dos quartis, a direção de cada métrica e a amostra mínima moram em
 * funções privadas do módulo (`faixaDe`, `qualidadeDe`, `montarComparacao`), e o
 * único caminho público até elas é `getBenchmark()`. Exportá-las só para o teste
 * alargaria a superfície do módulo por causa da ferramenta — então o teste entra
 * pela porta da frente e troca APENAS o transporte: um `admClient()` que devolve
 * as linhas que a view devolveria. Nenhum banco, nenhuma rede, nenhum tempo real
 * — a mesma entrada produz sempre a mesma saída.
 *
 * A troca é feita com `registerHooks` do próprio Node (a mesma peça que
 * `scripts/testes/alias-hook.mjs` usa para resolver o `@/`), e por isso o módulo
 * é carregado por `await import()` DEPOIS do gancho: um `import` estático seria
 * içado para antes dele e traria o transporte de verdade junto.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Modulo from 'node:module';

import {
  BENCHMARK_INFO,
  METRICAS_BENCHMARK,
  MINIMO_BENCHMARK,
  VIEWS_FASE_3,
  type MetricaBenchmark,
} from '@/lib/adm/areas/contrato';
import type {
  Benchmark,
  ComparacaoMetrica,
  FaixaBenchmark,
  QualidadeBenchmark,
} from '@/lib/adm/areas/benchmark';

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

const { getBenchmark, rotuloSegmento } = await import('@/lib/adm/areas/benchmark');

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_PROPRIEDADE = VIEWS_FASE_3.benchmarkPropriedade;
const VIEW_REFERENCIA = VIEWS_FASE_3.benchmarkReferencia;

const SEGMENTO = 'caprino_leiteiro';
const OUTRO_SEGMENTO = 'ovino_corte';

type LinhaCrua = Record<string, unknown>;
type ErroFalso = { message: string; code?: string };
type RespostaFalsa = LinhaCrua[] | { erro: ErroFalso };
type RespostaPostgrest = { data: unknown[] | null; error: ErroFalso | null };

/** O que o módulo pediu ao transporte — é assim que o teste confere que a régua
 *  foi lida COM filtro de segmento, e não contra a carteira inteira. */
interface Chamada {
  view: string;
  colunas: string;
  eq: [string, unknown][];
  em: [string, readonly unknown[]][];
  limite: number | null;
}

interface ConsultaFalsa {
  eq(coluna: string, valor: unknown): ConsultaFalsa;
  in(coluna: string, valores: readonly unknown[]): ConsultaFalsa;
  limit(quantidade: number): ConsultaFalsa;
  then(cumprir: (resposta: RespostaPostgrest) => void): void;
}

function instalar(respostas: Record<string, RespostaFalsa>): Chamada[] {
  const chamadas: Chamada[] = [];

  const cliente = {
    from(view: string) {
      return {
        select(colunas: string): ConsultaFalsa {
          const chamada: Chamada = { view, colunas, eq: [], em: [], limite: null };
          chamadas.push(chamada);

          const consulta: ConsultaFalsa = {
            eq(coluna, valor) {
              chamada.eq.push([coluna, valor]);
              return consulta;
            },
            in(coluna, valores) {
              chamada.em.push([coluna, valores]);
              return consulta;
            },
            limit(quantidade) {
              chamada.limite = quantidade;
              return consulta;
            },
            then(cumprir) {
              const resposta = respostas[view];
              if (resposta === undefined) cumprir({ data: [], error: null });
              else if (Array.isArray(resposta)) cumprir({ data: resposta, error: null });
              else cumprir({ data: null, error: resposta.erro });
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

/** Uma linha de `adm.benchmark_propriedade`: o valor DESTE criador. */
function doCriador(
  metrica: MetricaBenchmark,
  valor: number | string | null,
  segmento: string = SEGMENTO,
): LinhaCrua {
  return { propriedade_id: 1, segmento, metrica, valor };
}

/** Uma linha de `adm.benchmark_referencia`: a régua do segmento. */
function regua(
  metrica: MetricaBenchmark,
  quartis: {
    n: number;
    p25?: number | string | null;
    mediana?: number | string | null;
    p75?: number | string | null;
  },
  segmento: string = SEGMENTO,
): LinhaCrua {
  return {
    segmento,
    metrica,
    n: quartis.n,
    p25: quartis.p25 ?? null,
    mediana: quartis.mediana ?? null,
    p75: quartis.p75 ?? null,
  };
}

/** Régua padrão dos testes de geometria: p25 2 · mediana 3 · p75 4, amostra folgada. */
const QUARTIS = { n: 9, p25: 2, mediana: 3, p75: 4 };

async function benchmarkDe(
  linhasDoCriador: LinhaCrua[],
  linhasDaReferencia: LinhaCrua[],
  segmentosDeclarados: readonly string[] = [],
): Promise<Benchmark> {
  instalar({ [VIEW_PROPRIEDADE]: linhasDoCriador, [VIEW_REFERENCIA]: linhasDaReferencia });
  const resultado = await getBenchmark(1, segmentosDeclarados);
  if (!resultado.ok) assert.fail(`getBenchmark devolveu ${resultado.motivo}: ${resultado.detalhe}`);
  return resultado.dados;
}

function comparacao(benchmark: Benchmark, metrica: MetricaBenchmark): ComparacaoMetrica {
  const encontrada = benchmark.metricas.find((c) => c.metrica === metrica);
  if (!encontrada) assert.fail(`a métrica ${metrica} não veio no benchmark`);
  return encontrada;
}

/** Uma comparação isolada de UMA métrica, que é o formato da maioria dos casos. */
async function uma(
  metrica: MetricaBenchmark,
  valor: number | string | null,
  quartis: { n: number; p25?: number | null; mediana?: number | null; p75?: number | null },
): Promise<ComparacaoMetrica> {
  const linhasDoCriador = valor === null ? [doCriador(metrica, null)] : [doCriador(metrica, valor)];
  return comparacao(await benchmarkDe(linhasDoCriador, [regua(metrica, quartis)]), metrica);
}

// ─────────────────────────────────────────────────────────────────────────────
// Regra 1 — amostra mínima
// ─────────────────────────────────────────────────────────────────────────────

test('com menos fazendas que o mínimo, a comparação não é publicada: sobra o valor do criador, sem régua', async () => {
  const c = await uma('custo_litro', 3.5, { ...QUARTIS, n: MINIMO_BENCHMARK - 1 });

  assert.equal(c.publicavel, false);
  assert.equal(c.faixa, null, 'sem amostra não se desenha faixa');
  assert.equal(c.qualidade, null, 'sem amostra não se pinta destaque nem atenção');
  assert.equal(c.valor, 3.5, 'o valor do próprio criador continua à vista');
  assert.equal(c.n, MINIMO_BENCHMARK - 1, 'o tamanho da amostra viaja junto para a tela dizer por que não compara');
});

test('a amostra mínima é inclusiva: exatamente no piso a comparação já vale', async () => {
  const c = await uma('custo_litro', 3.5, { ...QUARTIS, n: MINIMO_BENCHMARK });

  assert.equal(c.publicavel, true);
  assert.notEqual(c.faixa, null);
});

test('amostra grande com mediana que a view não calculou também não publica: faixa sem centro é pior que nenhuma', async () => {
  const c = await uma('custo_litro', 3.5, { n: 40, p25: 2, mediana: null, p75: 4 });

  assert.equal(c.publicavel, false);
  assert.equal(c.faixa, null);
  assert.equal(c.desvioMediana, null);
  assert.equal(c.melhorQueMediana, null);
});

test('a fazenda abaixo do mínimo não entra na contagem de métricas comparáveis', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 3.5), doCriador('taxa_prenhez', 0.8)],
    [regua('custo_litro', { ...QUARTIS, n: 3 }), regua('taxa_prenhez', { n: 20, p25: 0.5, mediana: 0.6, p75: 0.7 })],
  );

  assert.equal(b.comparaveis, 1, 'só a métrica com amostra suficiente conta');
  assert.equal(b.acimaDaMediana, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Regra 2 — ausência não é zero
// ─────────────────────────────────────────────────────────────────────────────

test('criador sem o dado fica em branco e ganha a frase do que falta lançar — nunca zero, nunca "abaixo da mediana"', async () => {
  const c = await uma('custo_litro', null, QUARTIS);

  assert.equal(c.valor, null, 'ausência não vira 0: custo por litro zero seria um milagre');
  assert.equal(c.faixa, null);
  assert.equal(c.qualidade, null);
  assert.equal(c.desvioMediana, null);
  assert.equal(c.melhorQueMediana, null);
  assert.equal(c.publicavel, true, 'a régua do segmento existe; o que falta é o valor do criador');
  assert.equal(typeof c.faltando, 'string');
  assert.ok((c.faltando ?? '').length > 0, 'a frase de ausência é a oportunidade comercial da tela');
});

test('com o valor presente, a cobrança do que falta lançar some — senão a tela cobra o que já foi feito', async () => {
  const c = await uma('custo_litro', 3.5, QUARTIS);
  assert.equal(c.faltando, null);
});

test('criador sem o dado não entra em comparáveis nem em acima-da-mediana', async () => {
  const b = await benchmarkDe([doCriador('custo_litro', null)], [regua('custo_litro', QUARTIS)]);

  assert.equal(b.comparaveis, 0);
  assert.equal(b.acimaDaMediana, 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// A direção de cada métrica
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A leitura de NEGÓCIO de cada métrica, escrita aqui à mão de propósito: se este
 * teste lesse `BENCHMARK_INFO[m].maiorEhMelhor` para montar a expectativa, ele
 * concordaria com o contrato mesmo depois de alguém inverter uma linha dele.
 * Custo por litro alto é ruim; produção por lactante alta é boa. Inverter isso é
 * um erro de uma linha que inverte a conversa comercial com o cliente.
 */
const NO_QUARTIL_DE_CIMA: { metrica: MetricaBenchmark; qualidade: QualidadeBenchmark; porque: string }[] = [
  { metrica: 'producao_por_lactante_dia', qualidade: 'destaque', porque: 'entregar mais leite por lactante é melhor' },
  { metrica: 'custo_litro', qualidade: 'atencao', porque: 'produzir o litro mais caro é pior' },
  { metrica: 'taxa_prenhez', qualidade: 'destaque', porque: 'emprenhar mais das fêmeas diagnosticadas é melhor' },
  { metrica: 'gmd_medio', qualidade: 'destaque', porque: 'ganhar mais peso por dia é melhor' },
  { metrica: 'taxa_mortalidade', qualidade: 'atencao', porque: 'morrer mais animais é pior' },
  { metrica: 'intervalo_partos_dias', qualidade: 'atencao', porque: 'demorar mais entre dois partos é pior' },
];

for (const { metrica, qualidade, porque } of NO_QUARTIL_DE_CIMA) {
  const invertida: QualidadeBenchmark = qualidade === 'destaque' ? 'atencao' : 'destaque';

  test(`${metrica}: no quarto de cima é "${qualidade}" e no quarto de baixo é "${invertida}" — ${porque}`, async () => {
    const quartis = { n: 12, p25: 0.2, mediana: 0.3, p75: 0.4 };

    const emCima = await uma(metrica, 0.5, quartis);
    assert.equal(emCima.faixa, 'acima_p75');
    assert.equal(emCima.qualidade, qualidade);

    const embaixo = await uma(metrica, 0.1, quartis);
    assert.equal(embaixo.faixa, 'abaixo_p25');
    assert.equal(embaixo.qualidade, invertida);
  });
}

test('estar abaixo da mediana em custo é estar MELHOR: a contagem de acima-da-mediana aplica a direção', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 2.5), doCriador('producao_por_lactante_dia', 2.5)],
    [regua('custo_litro', QUARTIS), regua('producao_por_lactante_dia', QUARTIS)],
  );

  assert.equal(comparacao(b, 'custo_litro').melhorQueMediana, true, 'custo 2,5 contra mediana 3 é melhor');
  assert.equal(
    comparacao(b, 'producao_por_lactante_dia').melhorQueMediana,
    false,
    'produção 2,5 contra mediana 3 é pior',
  );
  assert.equal(b.comparaveis, 2);
  assert.equal(b.acimaDaMediana, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// A geometria, nas bordas exatas
// ─────────────────────────────────────────────────────────────────────────────

const BORDAS: { valor: number; faixa: FaixaBenchmark; porque: string }[] = [
  { valor: 1.9, faixa: 'abaixo_p25', porque: 'abaixo do p25' },
  { valor: 2, faixa: 'p25_mediana', porque: 'em cima do p25 ainda não é "abaixo do p25"' },
  { valor: 2.5, faixa: 'p25_mediana', porque: 'entre p25 e mediana' },
  { valor: 3, faixa: 'mediana_p75', porque: 'em cima da mediana não é nem acima nem abaixo' },
  { valor: 3.5, faixa: 'mediana_p75', porque: 'entre mediana e p75' },
  { valor: 4, faixa: 'mediana_p75', porque: 'em cima do p75 ainda não é "acima do p75"' },
  { valor: 4.1, faixa: 'acima_p75', porque: 'só ultrapassar o p75 muda a faixa' },
];

for (const { valor, faixa, porque } of BORDAS) {
  test(`valor ${valor} na régua 2·3·4 cai em ${faixa}: ${porque}`, async () => {
    const c = await uma('custo_litro', valor, QUARTIS);
    assert.equal(c.faixa, faixa);
  });
}

test('em cima da mediana ninguém é "melhor que a mediana" — nem para as métricas invertidas', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 3), doCriador('producao_por_lactante_dia', 3)],
    [regua('custo_litro', QUARTIS), regua('producao_por_lactante_dia', QUARTIS)],
  );

  assert.equal(comparacao(b, 'custo_litro').melhorQueMediana, false);
  assert.equal(comparacao(b, 'producao_por_lactante_dia').melhorQueMediana, false);
  assert.equal(b.acimaDaMediana, 0);
  assert.equal(b.comparaveis, 2, 'estar na mediana é comparável, só não é "melhor"');
});

test('sem p25 e sem p75 a faixa não é inventada: fica na faixa típica dos dois lados da mediana', async () => {
  const acima = await uma('custo_litro', 100, { n: 9, p25: null, mediana: 3, p75: null });
  const abaixo = await uma('custo_litro', 0.1, { n: 9, p25: null, mediana: 3, p75: null });

  assert.equal(acima.faixa, 'mediana_p75');
  assert.equal(abaixo.faixa, 'p25_mediana');
  assert.equal(acima.qualidade, 'tipico');
  assert.equal(abaixo.qualidade, 'tipico');
});

// ─────────────────────────────────────────────────────────────────────────────
// O desvio
// ─────────────────────────────────────────────────────────────────────────────

test('o desvio da mediana sai em FRAÇÃO, como todo percentual do painel', async () => {
  const c = await uma('custo_litro', 4.5, QUARTIS);
  assert.equal(c.desvioMediana, 0.5, '4,5 contra mediana 3 é +50%, ou seja 0,5');
});

test('mediana zero não vira divisão: o desvio fica em branco em vez de sair "+∞%"', async () => {
  const c = await uma('custo_litro', 2, { n: 9, p25: 0, mediana: 0, p75: 0 });

  assert.equal(c.desvioMediana, null);
  assert.equal(c.publicavel, true, 'mediana zero é um número calculado; o que não existe é o desvio');
});

// ─────────────────────────────────────────────────────────────────────────────
// Segmento
// ─────────────────────────────────────────────────────────────────────────────

test('fazenda sem segmento é um estado próprio: não é comparada contra a carteira inteira', async () => {
  const chamadas = instalar({ [VIEW_PROPRIEDADE]: [], [VIEW_REFERENCIA]: [regua('custo_litro', QUARTIS)] });
  const resultado = await getBenchmark(1, []);
  if (!resultado.ok) assert.fail(resultado.detalhe);
  const b = resultado.dados;

  assert.equal(b.semSegmento, true);
  assert.equal(b.segmento, null);
  assert.equal(b.comparaveis, 0);
  assert.equal(b.maiorAmostra, 0);
  assert.equal(b.metricas.length, METRICAS_BENCHMARK.length, 'as seis métricas continuam na tela, em branco');
  assert.ok(
    b.metricas.every((c) => c.valor === null && c.faltando !== null),
    'todas com a frase do que falta lançar',
  );
  assert.equal(chamadas.length, 1, 'a régua nem chegou a ser lida: sem segmento não existe grupo de comparação');
});

test('segmento declarado no cadastro mas sem métrica calculada mostra a régua do segmento, não "sem segmento"', async () => {
  const b = await benchmarkDe([], [regua('custo_litro', QUARTIS)], [SEGMENTO]);
  const c = comparacao(b, 'custo_litro');

  assert.equal(b.semSegmento, false, 'dizer que o cadastro não tem segmento seria falso sobre o cliente');
  assert.equal(b.segmento, SEGMENTO);
  assert.equal(c.publicavel, true, 'a régua existe');
  assert.equal(c.mediana, 3);
  assert.equal(c.valor, null, 'o que falta é o marcador do criador');
  assert.notEqual(c.faltando, null);
});

test('a régua é lida com filtro de segmento — comparar caprino leiteiro com ovino de corte seria ruído', async () => {
  const chamadas = instalar({
    [VIEW_PROPRIEDADE]: [doCriador('custo_litro', 3.5)],
    [VIEW_REFERENCIA]: [regua('custo_litro', QUARTIS)],
  });
  await getBenchmark(1, []);

  const leituraDaRegua = chamadas.find((c) => c.view === VIEW_REFERENCIA);
  assert.ok(leituraDaRegua, 'a régua foi lida');
  assert.deepEqual(leituraDaRegua.em, [['segmento', [SEGMENTO]]]);
});

test('entre dois segmentos vale o de MAIOR amostra, e nunca o que deixa o cliente melhor', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 3.5, SEGMENTO), doCriador('custo_litro', 3.5, OUTRO_SEGMENTO)],
    [
      regua('custo_litro', { n: 8, p25: 5, mediana: 6, p75: 7 }, SEGMENTO),
      regua('custo_litro', { n: 30, p25: 1, mediana: 2, p75: 3 }, OUTRO_SEGMENTO),
    ],
  );

  assert.equal(
    b.segmento,
    OUTRO_SEGMENTO,
    'o segmento de 30 fazendas ganha, mesmo sendo o que faz o cliente parecer caro',
  );
  assert.deepEqual(b.outrosSegmentos, [SEGMENTO]);
  assert.equal(comparacao(b, 'custo_litro').qualidade, 'atencao');
});

test('empate de amostra desempata por nome, para a tela não trocar de segmento entre dois carregamentos', async () => {
  const quartis = { n: 20, p25: 2, mediana: 3, p75: 4 };
  const linhas = [doCriador('custo_litro', 3.5, SEGMENTO), doCriador('custo_litro', 3.5, OUTRO_SEGMENTO)];
  const reguas = [regua('custo_litro', quartis, SEGMENTO), regua('custo_litro', quartis, OUTRO_SEGMENTO)];

  const b = await benchmarkDe(linhas, reguas);
  const bInvertido = await benchmarkDe([...linhas].reverse(), [...reguas].reverse());

  assert.equal(b.segmento, SEGMENTO, 'caprino_leiteiro vem antes de ovino_corte');
  assert.equal(bInvertido.segmento, b.segmento, 'a ordem das linhas da view não muda a escolha');
});

test('segmento fora dos quatro conhecidos aparece cru, em vez de sumir da tela', () => {
  assert.equal(rotuloSegmento('caprino_leiteiro'), 'Caprino leiteiro');
  assert.equal(rotuloSegmento('bubalino_leiteiro'), 'bubalino_leiteiro');
  assert.equal(rotuloSegmento(null), 'Sem segmento');
});

// ─────────────────────────────────────────────────────────────────────────────
// Higiene do que vem da view
// ─────────────────────────────────────────────────────────────────────────────

test('quartis que chegam como texto (numeric do Postgres) continuam sendo régua, em vez de virarem "—"', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', '3.5')],
    [regua('custo_litro', { n: 9, p25: '2', mediana: '3', p75: '4' })],
  );
  const c = comparacao(b, 'custo_litro');

  assert.equal(c.valor, 3.5);
  assert.equal(c.mediana, 3);
  assert.equal(c.publicavel, true);
  assert.equal(c.faixa, 'mediana_p75');
});

test('métrica que o contrato não declara é descartada do cálculo e reportada ao operador', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 3.5), { propriedade_id: 1, segmento: SEGMENTO, metrica: 'litros_por_hectare', valor: 9 }],
    [regua('custo_litro', QUARTIS)],
  );

  assert.deepEqual(b.metricasDesconhecidas, ['litros_por_hectare']);
  assert.equal(b.metricas.length, METRICAS_BENCHMARK.length, 'a lista de métricas é fechada');
  assert.ok(!b.metricas.some((c) => (c.metrica as string) === 'litros_por_hectare'));
});

test('linha duplicada para o mesmo (segmento, métrica) não soma nem troca o número: vale a primeira', async () => {
  const b = await benchmarkDe(
    [doCriador('custo_litro', 3.5), doCriador('custo_litro', 99)],
    [regua('custo_litro', QUARTIS), regua('custo_litro', { n: 500, p25: 90, mediana: 95, p75: 99 })],
  );
  const c = comparacao(b, 'custo_litro');

  assert.equal(c.valor, 3.5);
  assert.equal(c.n, 9);
  assert.equal(c.mediana, 3);
});

test('taxa acima de 1,5 é acusada como erro de escala do SQL, e não mostrada como "6.200%"', async () => {
  const emEscalaErrada = await benchmarkDe(
    [doCriador('taxa_prenhez', 62)],
    [regua('taxa_prenhez', { n: 9, p25: 50, mediana: 60, p75: 70 })],
  );
  assert.deepEqual(emEscalaErrada.escalaSuspeita, ['taxa_prenhez']);

  const emFracao = await benchmarkDe(
    [doCriador('taxa_prenhez', 0.62)],
    [regua('taxa_prenhez', { n: 9, p25: 0.5, mediana: 0.6, p75: 0.7 })],
  );
  assert.deepEqual(emFracao.escalaSuspeita, [], 'fração é a convenção do painel, não é suspeita');
});

test('régua truncada não é publicada: uma view acima do teto vira erro, não uma mediana plausível', async () => {
  instalar({
    [VIEW_PROPRIEDADE]: Array.from({ length: 100 }, () => doCriador('custo_litro', 3.5)),
    [VIEW_REFERENCIA]: [regua('custo_litro', QUARTIS)],
  });

  const resultado = await getBenchmark(1, []);
  assert.equal(resultado.ok, false);
  if (resultado.ok) return;
  assert.equal(resultado.motivo, 'erro');
  assert.match(resultado.detalhe, /truncad/i);
});

test('view ausente é "falta configurar", nunca "este cliente não tem segmento"', async () => {
  const gritos = console.error;
  console.error = () => {};
  try {
    instalar({ [VIEW_PROPRIEDADE]: { erro: { message: 'schema não exposto', code: 'PGRST106' } } });
    const semMigration = await getBenchmark(1, []);
    assert.equal(semMigration.ok, false);
    if (!semMigration.ok) assert.equal(semMigration.motivo, 'sem-config');

    instalar({ [VIEW_PROPRIEDADE]: { erro: { message: 'timeout', code: '57014' } } });
    const quebrado = await getBenchmark(1, []);
    assert.equal(quebrado.ok, false);
    if (!quebrado.ok) assert.equal(quebrado.motivo, 'erro', 'falha de verdade não pode virar "falta configurar"');
  } finally {
    console.error = gritos;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Regra 4 — a janela anda junto do número, e é a MESMA em toda frase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todo período citado em qualquer frase da métrica, normalizado. É a única forma
 * de comparar dois textos escritos por mãos diferentes sem reescrever nenhum dos
 * dois dentro do teste.
 */
function periodosCitados(frase: string): string[] {
  const achados = new Set<string>();
  for (const [, quantidade, unidade] of frase.matchAll(/(\d+)\s*(dias?|m[eê]s|meses)/gi)) {
    achados.add(`${quantidade} ${unidade.toLowerCase().startsWith('d') ? 'dias' : 'meses'}`);
  }
  return [...achados].sort();
}

/** As seis comparações em branco — que é onde `janela` e `faltando` aparecem juntas. */
async function seisMetricasEmBranco(): Promise<ComparacaoMetrica[]> {
  const b = await benchmarkDe([], []);
  assert.equal(b.metricas.length, METRICAS_BENCHMARK.length);
  return b.metricas;
}

test('toda métrica leva a janela junto do número: nenhuma sai sem período declarado', async () => {
  for (const c of await seisMetricasEmBranco()) {
    assert.equal(typeof c.janela, 'string', `${c.metrica} sem janela`);
    assert.ok(c.janela.trim().length > 0, `${c.metrica} com janela vazia`);
  }
});

test('a janela publicada bate com o período que a explicação conta ao criador', async () => {
  for (const c of await seisMetricasEmBranco()) {
    const daJanela = periodosCitados(c.janela);
    const daExplicacao = periodosCitados(BENCHMARK_INFO[c.metrica].explicacao);

    // A explicação pode não citar período; o que não pode é citar OUTRO.
    if (daExplicacao.length === 0) continue;
    assert.deepEqual(
      daExplicacao,
      daJanela,
      `${c.metrica}: a janela diz "${c.janela}" e a explicação diz "${BENCHMARK_INFO[c.metrica].explicacao}"`,
    );
  }
});

test(
  'a frase do que falta lançar cita a mesma janela do número — senão manda o criador procurar dado fora do período',
  async () => {
    for (const c of await seisMetricasEmBranco()) {
      const daJanela = periodosCitados(c.janela);
      const doQueFalta = periodosCitados(c.faltando ?? '');

      if (doQueFalta.length === 0) continue;
      assert.deepEqual(
        doQueFalta,
        daJanela,
        `${c.metrica}: a janela diz "${c.janela}" e o que falta lançar diz "${c.faltando}"`,
      );
    }
  },
);
