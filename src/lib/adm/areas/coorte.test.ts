/**
 * COORTE — os testes da matriz que não pode mentir sobre o calendário.
 *
 * `montarMatriz` é pura e recebe `agora` por parâmetro justamente para poder ser
 * conferida: "que mês é hoje" decide QUAL DIAGONAL EXISTE, e um agregado cuja
 * forma depende de um relógio escondido não tem como ser testado nem conferido.
 * Por isso não há um único `new Date()` sem argumento aqui — todo instante é
 * literal e a matriz de amanhã de manhã é idêntica à de hoje.
 *
 * O defeito que estes testes existem para pegar é sempre o mesmo, com três
 * rostos: **a matriz confunde "a coorte perdeu gente" com "o mês ainda não
 * aconteceu"**. Nas três formas o sintoma na tela é uma queda de retenção que
 * não existe, e ninguém desconfia de um zero.
 *
 *   1. célula além do horizonte vira 0 em vez de `null` → a coluna 6 desaba
 *      porque as coortes novas "zeraram" um mês que o calendário não escreveu;
 *   2. o mês em curso vira coluna → a última diagonal é um mês pela metade lido
 *      como churn, e é a célula mais recente, a que mais chama atenção;
 *   3. coorte de 1 ou 2 contas vira linha → 100%/0% gritando de cima da matriz.
 *
 * E a metade silenciosa das regras 2 e 3: quem foi descartado é CONTADO
 * (`novasDemais`, `pequenas`) e o corte de 24 colunas é ANUNCIADO (`truncada`).
 * Descartar calado encolhe o denominador sem ninguém ver.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  MESES_CARD,
  MINIMO_COORTE,
  TETO_COLUNAS,
  indiceMes,
  mesEmCurso,
  montarMatriz,
  resumoAdocao,
  type FaixaCoorte,
  type MatrizRetencao,
} from '@/lib/adm/areas/coorte';
import type { LinhaCoorte } from '@/lib/adm/areas/contrato';

// ─────────────────────────────────────────────────────────────────────────────
// Fixture
// ─────────────────────────────────────────────────────────────────────────────

/** 05/09/2026, 09:00 em São Paulo. Mês em curso: setembro/2026. */
const AGORA = new Date('2026-09-05T12:00:00Z');

interface EntradaCoorte {
  coorte: string;
  tamanho: number;
  /** Índice = mês de vida; `null` = a view não trouxe linha para esse mês. */
  ativos: readonly (number | null)[];
}

/**
 * Monta o que a view devolveria: uma linha por (mês de entrada, mês de vida).
 * O campo `retencao` vai preenchido de propósito — é o valor que `montarMatriz`
 * NÃO pode copiar (ver o describe "retenção recalculada").
 */
function linhas(...entradas: readonly EntradaCoorte[]): LinhaCoorte[] {
  const saida: LinhaCoorte[] = [];
  for (const e of entradas) {
    e.ativos.forEach((ativos, mes) => {
      if (ativos === null) return;
      saida.push({
        coorte: e.coorte,
        mes,
        tamanho: e.tamanho,
        ativos,
        retencao: ativos / e.tamanho,
      });
    });
  }
  return saida;
}

function faixaDe(matriz: MatrizRetencao, coorte: string): FaixaCoorte {
  const f = matriz.faixas.find((x) => x.coorte === coorte);
  assert.ok(f, `a coorte ${coorte} não entrou na matriz`);
  return f;
}

/** A linha como a tela desenha: retenção por mês, `null` onde o mês não existe. */
function retencoes(f: FaixaCoorte): (number | null)[] {
  return f.celulas.map((c) => (c === null ? null : c.retencao));
}

function indice(periodo: string): number {
  const i = indiceMes(periodo);
  if (i === null) throw new Error(`indiceMes devolveu null para "${periodo}"`);
  return i;
}

/**
 * A carteira de referência, lida em 05/09/2026:
 *
 *   2026-03  20 contas, 6 meses fechados (mar..ago)
 *   2026-06   5 contas, 3 meses fechados (jun..ago)
 *   2026-08   5 contas, 1 mês fechado (ago) — a linha de mês 1 é SETEMBRO, o mês
 *             em curso, e existe na view justamente para ser descartada
 *   2026-07   2 contas → abaixo do mínimo
 *   2026-09   7 contas → entrou no mês em curso, nenhum mês fechado
 */
const CARTEIRA: LinhaCoorte[] = linhas(
  { coorte: '2026-03', tamanho: 20, ativos: [20, 19, 18, 15, 12, 10] },
  { coorte: '2026-06', tamanho: 5, ativos: [5, 4, 3] },
  { coorte: '2026-08', tamanho: 5, ativos: [5, 4] },
  { coorte: '2026-07', tamanho: 2, ativos: [2, 2] },
  { coorte: '2026-09', tamanho: 7, ativos: [7] },
);

// ─────────────────────────────────────────────────────────────────────────────
// Regra 1 — o mês que não aconteceu é null, nunca 0
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · regra 1: célula além do horizonte é null', () => {
  test('coortes de idades diferentes saem triangulares: o mês que o calendário não escreveu é null, e não 0%', () => {
    // O defeito: quem entrou em junho não tem mês 3. Desenhá-lo como 0% mostra
    // uma coorte que perdeu todo mundo — e a "queda" é só o calendário.
    const m = montarMatriz(CARTEIRA, AGORA);

    assert.deepEqual(retencoes(faixaDe(m, '2026-08')), [1, null, null, null, null, null]);
    assert.deepEqual(retencoes(faixaDe(m, '2026-06')), [1, 0.8, 0.6, null, null, null]);
    assert.deepEqual(retencoes(faixaDe(m, '2026-03')), [1, 0.95, 0.9, 0.75, 0.6, 0.5]);
  });

  test('além do horizonte a célula é null e nunca um objeto com retenção 0', () => {
    // `null` não formata: quem consome não tem como esquecer o caso. Uma célula
    // {ativos: 0, retencao: 0} formata lindamente e mente.
    const m = montarMatriz(CARTEIRA, AGORA);
    for (const f of m.faixas) {
      for (let mes = f.horizonte + 1; mes <= m.mesesMaximo; mes += 1) {
        assert.equal(f.celulas[mes], null, `${f.coorte} inventou a célula do mês ${mes}`);
      }
    }
  });

  test('a matriz é retangular no tipo e triangular no conteúdo: toda faixa tem o mesmo comprimento', () => {
    // Faixas de comprimentos diferentes desalinham a tabela e fazem a coluna 4 de
    // uma coorte cair debaixo da coluna 2 de outra.
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.equal(m.mesesMaximo, 5);
    assert.equal(m.media.length, 6);
    for (const f of m.faixas) {
      assert.equal(f.celulas.length, 6, `${f.coorte} saiu com ${f.celulas.length} colunas`);
    }
  });

  test('cada faixa declara o próprio horizonte — a tela não precisa deduzir onde a linha acaba', () => {
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.equal(faixaDe(m, '2026-03').horizonte, 5);
    assert.equal(faixaDe(m, '2026-06').horizonte, 2);
    assert.equal(faixaDe(m, '2026-08').horizonte, 0);
  });

  test('DENTRO do horizonte, mês sem linha na view é 0 de verdade: ali a ausência é o churn', () => {
    // A outra metade da regra 1, e a que separa as duas ausências: fora do
    // horizonte não há dado; dentro dele, "ninguém ativo" é exatamente o que a
    // matriz existe para mostrar. Trocar este 0 por null esconderia churn real.
    const m = montarMatriz(
      linhas(
        { coorte: '2026-03', tamanho: 10, ativos: [10, 8, null, 5, null, null] },
        { coorte: '2025-09', tamanho: 4, ativos: [4, 4, 4, 4, 4, 4] },
      ),
      AGORA,
    );
    const f = faixaDe(m, '2026-03');
    assert.deepEqual(retencoes(f), [1, 0.8, 0, 0.5, 0, 0]);
    assert.deepEqual(f.celulas[2], { mes: 2, ativos: 0, retencao: 0 });
    assert.notEqual(f.celulas[2], null);
  });

  test('onde a view não computou, a matriz para: silêncio da view não vira 0% de retenção', () => {
    // Coorte de setembro/2025 tem 11 meses fechados, mas a view só trouxe 3.
    // Preencher os meses 3..10 com zero inventaria churn a partir de silêncio.
    const m = montarMatriz(linhas({ coorte: '2025-09', tamanho: 6, ativos: [6, 5, 4] }), AGORA);
    assert.equal(m.mesesMaximo, 2);
    assert.equal(faixaDe(m, '2025-09').celulas.length, 3);
    assert.equal(m.media.length, 3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regra 2 — o mês em curso fica de fora inteiro
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · regra 2: o mês em curso não vira coluna', () => {
  test('quem entrou no mês passado tem só o mês 0: o mês corrente não vira a última diagonal', () => {
    // A coorte 2026-08 TEM linha de mês 1 na view (setembro, cinco dias de trinta).
    // Se ela virasse célula, a coorte apareceria caindo de 100% para 80% — e a
    // queda é o calendário, não o cliente.
    const m = montarMatriz(linhas({ coorte: '2026-08', tamanho: 5, ativos: [5, 4] }), AGORA);
    assert.equal(m.mesesMaximo, 0);
    assert.deepEqual(retencoes(faixaDe(m, '2026-08')), [1]);
    assert.equal(m.media.length, 1);
  });

  test('o dado do mês em curso não vaza para a média da coluna: nem no numerador, nem no denominador', () => {
    // Com a diagonal do mês corrente dentro, a coluna 1 viraria 27/30 = 0,9 —
    // parece inofensivo, e é uma queda de dois pontos inventada pelo calendário.
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.deepEqual(m.media[1], { retencao: 0.92, ativos: 23, base: 25, coortes: 2 });
  });

  test('coorte que entrou no próprio mês em curso não vira linha — e é contada em novasDemais', () => {
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.equal(
      m.faixas.some((f) => f.coorte === '2026-09'),
      false,
    );
    assert.deepEqual(m.novasDemais, { coortes: 1, contas: 7 });
  });

  test('mesEmCurso viaja na matriz: a tela precisa dizer QUAL mês ficou de fora', () => {
    // Sem o nome do mês, "a matriz vai até agosto" é uma dedução do operador.
    assert.equal(montarMatriz(CARTEIRA, AGORA).mesEmCurso, '2026-09');
    assert.equal(montarMatriz([], AGORA).mesEmCurso, '2026-09');
  });

  test('a virada de ano não confunde a conta: em fevereiro, quem entrou em dezembro tem dezembro e janeiro', () => {
    // Distância entre meses civis é aritmética de inteiros, não de Date: somar
    // mês em Date é a operação que transforma 31/01 em 03/03.
    const m = montarMatriz(
      linhas({ coorte: '2025-12', tamanho: 4, ativos: [4, 3, 2] }),
      new Date('2026-02-10T12:00:00Z'),
    );
    assert.equal(m.mesEmCurso, '2026-02');
    assert.deepEqual(retencoes(faixaDe(m, '2025-12')), [1, 0.75]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// O mês em curso é o de São Paulo, não o do runtime
// ─────────────────────────────────────────────────────────────────────────────

describe('mesEmCurso · o mês civil de São Paulo', () => {
  test('23h de 31/03 em Brasília ainda é março, mesmo já sendo 01/04 em UTC', () => {
    // A Vercel roda em UTC. Com o mês vindo do runtime, a última diagonal da
    // matriz apareceria e desapareceria conforme a hora do dia.
    assert.equal(mesEmCurso(new Date('2026-04-01T02:00:00Z')), '2026-03');
    assert.equal(mesEmCurso(new Date('2026-04-01T03:00:00Z')), '2026-04'); // 00:00 em SP
  });

  test('a virada de ano segue o fuso de São Paulo: 21h de 31/12 ainda é dezembro', () => {
    assert.equal(mesEmCurso(new Date('2026-01-01T00:00:00Z')), '2025-12');
    assert.equal(mesEmCurso(new Date('2026-01-01T03:00:00Z')), '2026-01');
  });

  test('a matriz inteira muda de forma com o fuso: a coorte de março só fecha quando março acaba EM BRASÍLIA', () => {
    // Esta é a consequência que importa. Às 23h de 31/03 em Brasília, o UTC já
    // marca 01/04: com o mês do runtime, a coorte de março viraria linha uma hora
    // antes de março acabar, com um mês incompleto lido como mês fechado.
    const marco = linhas({ coorte: '2026-03', tamanho: 6, ativos: [6, 5] });

    const aindaMarco = montarMatriz(marco, new Date('2026-04-01T02:00:00Z'));
    assert.equal(aindaMarco.mesEmCurso, '2026-03');
    assert.deepEqual(aindaMarco.faixas, []);
    assert.deepEqual(aindaMarco.novasDemais, { coortes: 1, contas: 6 });

    const jaAbril = montarMatriz(marco, new Date('2026-04-01T12:00:00Z'));
    assert.equal(jaAbril.mesEmCurso, '2026-04');
    assert.deepEqual(retencoes(faixaDe(jaAbril, '2026-03')), [1]);
    assert.deepEqual(jaAbril.novasDemais, { coortes: 0, contas: 0 });
  });

  test(
    'instante inválido não pode cair no relógio do runtime — nem no mês do UTC',
    () => {
      const m = montarMatriz(CARTEIRA, new Date('quinta-feira'));
      assert.equal(m.mesEmCurso, '');
      assert.deepEqual(m.faixas, []);
    },
  );
});

describe('indiceMes', () => {
  test('a distância entre meses civis atravessa o ano: dez→jan é 1 mês, não 11', () => {
    // É esta subtração que vira `horizonteCalendario`. Um off-by-one aqui move a
    // diagonal inteira da matriz.
    assert.equal(indice('2026-01') - indice('2025-12'), 1);
    assert.equal(indice('2026-09') - indice('2024-09'), 24);
    assert.equal(indice('2026-09') - indice('2026-09'), 0);
  });

  test("aceita 'YYYY-MM' e 'YYYY-MM-DD' como o mesmo mês: o dia não muda a coorte", () => {
    assert.equal(indice('2026-06-15'), indice('2026-06'));
    assert.equal(indice('2026-06-01T03:00:00Z'), indice('2026-06'));
  });

  test('mês fora de 01..12 e texto que não é período viram null, e não o mês 0 de um ano qualquer', () => {
    assert.equal(indiceMes('2026-13'), null);
    assert.equal(indiceMes('2026-00'), null);
    assert.equal(indiceMes('setembro'), null);
    assert.equal(indiceMes(''), null);
    assert.equal(indiceMes(null), null);
    assert.equal(indiceMes(undefined), null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regra 3 — coorte pequena demais não vira linha
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · regra 3: mínimo de contas por coorte', () => {
  test('duas contas não viram linha; três viram — o piso é 3 e é ele que a tela cita', () => {
    // Uma coorte de 1 só sabe dizer 100% ou 0%, e essas duas linhas gritando de
    // cima da matriz estragam a leitura de todas as outras.
    assert.equal(MINIMO_COORTE, 3);
    const m = montarMatriz(
      linhas(
        { coorte: '2026-03', tamanho: 1, ativos: [1, 1, 0, 0, 0, 0] },
        { coorte: '2026-04', tamanho: 2, ativos: [2, 2, 2, 2, 2] },
        { coorte: '2026-05', tamanho: 3, ativos: [3, 3, 2, 2] },
      ),
      AGORA,
    );
    assert.deepEqual(
      m.faixas.map((f) => f.coorte),
      ['2026-05'],
    );
    assert.deepEqual(m.pequenas, { coortes: 2, contas: 3 });
  });

  test('as contas descartadas somem da matriz mas não da contabilidade: pequenas e novasDemais são contadas', () => {
    // Descartar em silêncio encolhe o denominador sem ninguém ver — a outra
    // metade da mesma desonestidade.
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.deepEqual(m.pequenas, { coortes: 1, contas: 2 });
    assert.deepEqual(m.novasDemais, { coortes: 1, contas: 7 });
    assert.equal(m.contas, 30); // 20 + 5 + 5: só o que entrou na matriz
  });

  test('coorte nova E pequena é contada uma vez só, como nova: os dois baldes não se somam', () => {
    // Contar nos dois faria a tela dizer que descartou 2 contas quando descartou 1.
    const m = montarMatriz(linhas({ coorte: '2026-09', tamanho: 1, ativos: [1] }), AGORA);
    assert.deepEqual(m.novasDemais, { coortes: 1, contas: 1 });
    assert.deepEqual(m.pequenas, { coortes: 0, contas: 0 });
  });

  test('coorte descartada não entra na média nem no denominador de coluna nenhuma', () => {
    // Se a coorte de 2 contas vazasse para a média, a coluna 1 iria a 25/27.
    const m = montarMatriz(CARTEIRA, AGORA);
    for (const ponto of m.media) {
      assert.ok(ponto);
      assert.ok(ponto.base <= 30, `base ${ponto.base} passou das 30 contas aceitas`);
    }
    assert.deepEqual(m.media[0], { retencao: 1, ativos: 30, base: 30, coortes: 3 });
  });

  test('com toda coorte descartada a matriz vem vazia — mas os descartes vêm contados junto', () => {
    // O caminho de saída antecipado é o mais fácil de estragar: um `return vazia`
    // devolveria zero descarte e a tela diria "nenhum cliente ficou de fora".
    const m = montarMatriz(
      linhas(
        { coorte: '2026-07', tamanho: 2, ativos: [2, 2] },
        { coorte: '2026-09', tamanho: 9, ativos: [9] },
      ),
      AGORA,
    );
    assert.deepEqual(m.faixas, []);
    assert.equal(m.mesesMaximo, -1);
    assert.deepEqual(m.media, []);
    assert.equal(m.contas, 0);
    assert.equal(m.mesEmCurso, '2026-09');
    assert.deepEqual(m.pequenas, { coortes: 1, contas: 2 });
    assert.deepEqual(m.novasDemais, { coortes: 1, contas: 9 });
  });

  test('coorte de tamanho zero é artefato da view: sai sem contar como descarte, porque não há conta para perder', () => {
    const m = montarMatriz(
      linhas(
        { coorte: '2026-05', tamanho: 0, ativos: [0, 0] },
        { coorte: '2026-06', tamanho: 4, ativos: [4, 3, 3] },
      ),
      AGORA,
    );
    assert.deepEqual(
      m.faixas.map((f) => f.coorte),
      ['2026-06'],
    );
    assert.deepEqual(m.pequenas, { coortes: 0, contas: 0 });
    assert.deepEqual(m.novasDemais, { coortes: 0, contas: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Teto de colunas — cortar é permitido, cortar calado não
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · teto de 24 colunas', () => {
  const cheia = (meses: number, tamanho: number) => Array.from({ length: meses }, () => tamanho);

  test('24 meses de vida cabem inteiros e a matriz NÃO se diz cortada', () => {
    // 2024-09 tem 23 meses fechados em 05/09/2026 → colunas 0..23, o teto cravado.
    assert.equal(TETO_COLUNAS, 24);
    const m = montarMatriz(
      linhas({ coorte: '2024-09', tamanho: 6, ativos: cheia(24, 6) }),
      AGORA,
    );
    assert.equal(m.mesesMaximo, 23);
    assert.equal(faixaDe(m, '2024-09').celulas.length, 24);
    assert.equal(m.truncada, false);
  });

  test('um mês a mais e o corte acontece — e é ANUNCIADO em truncada', () => {
    // Cortar calado é como um painel ensina o operador a desconfiar dele.
    const m = montarMatriz(
      linhas({ coorte: '2024-08', tamanho: 6, ativos: cheia(25, 6) }),
      AGORA,
    );
    assert.equal(m.truncada, true);
    assert.equal(m.mesesMaximo, 23);
    assert.equal(faixaDe(m, '2024-08').celulas.length, 24);
    assert.equal(m.media.length, 24);
  });

  test('coorte antiga cuja view só computou poucos meses não é anunciada como cortada', () => {
    // `truncada` fala do TETO, não da idade: dizer "cortei" onde nada foi cortado
    // gasta a única frase que a tela tem para avisar quando cortar de verdade.
    const m = montarMatriz(
      linhas({ coorte: '2021-01', tamanho: 6, ativos: cheia(6, 6) }),
      AGORA,
    );
    assert.equal(m.truncada, false);
    assert.equal(m.mesesMaximo, 5);
  });

  test('a carteira normal não sai truncada', () => {
    assert.equal(montarMatriz(CARTEIRA, AGORA).truncada, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A curva média — ponderada por contas, com o denominador sempre junto
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · a curva média', () => {
  test('a média da coluna é ponderada por CONTAS, não média das retenções das coortes', () => {
    // 30 contas 100% e 3 contas 0% dão 90,9% — não 50%. A média de médias é o
    // número que parece exato e não é.
    const m = montarMatriz(
      linhas(
        { coorte: '2026-03', tamanho: 30, ativos: [30, 30] },
        { coorte: '2026-04', tamanho: 3, ativos: [3, 0] },
      ),
      AGORA,
    );
    assert.deepEqual(m.media[1], { retencao: 30 / 33, ativos: 30, base: 33, coortes: 2 });
    assert.notEqual(m.media[1]?.retencao, 0.5);
  });

  test('cada coluna tem o próprio denominador, e ele viaja junto: "mês 5: 50%" sozinho não diz nada', () => {
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.deepEqual(m.media, [
      { retencao: 1, ativos: 30, base: 30, coortes: 3 },
      { retencao: 0.92, ativos: 23, base: 25, coortes: 2 },
      { retencao: 0.84, ativos: 21, base: 25, coortes: 2 },
      { retencao: 0.75, ativos: 15, base: 20, coortes: 1 },
      { retencao: 0.6, ativos: 12, base: 20, coortes: 1 },
      { retencao: 0.5, ativos: 10, base: 20, coortes: 1 },
    ]);
  });

  test('a média só soma quem CHEGOU ao mês: célula null não entra com base zerada nem com 0 ativos', () => {
    // Contar a coorte nova na coluna 5 com 0 ativos derrubaria a média de 50%
    // para 33% — a mesma queda falsa da regra 1, agora na curva agregada.
    const m = montarMatriz(CARTEIRA, AGORA);
    assert.equal(m.media[5]?.coortes, 1);
    assert.equal(m.media[5]?.base, 20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// A retenção da célula
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · a retenção de cada célula', () => {
  test('a retenção é recalculada de ativos/tamanho, não copiada da view: os três números fecham na conta do operador', () => {
    // A tela mostra "9 de 12 = 75%". Se a view arredondar de um jeito e a tela de
    // outro, a conversa vira sobre o painel em vez de sobre o cliente.
    const m = montarMatriz(
      [
        { coorte: '2026-06', mes: 0, tamanho: 12, ativos: 12, retencao: 1 },
        { coorte: '2026-06', mes: 1, tamanho: 12, ativos: 9, retencao: 0.99 },
        { coorte: '2026-06', mes: 2, tamanho: 12, ativos: 6, retencao: 0.42 },
      ],
      AGORA,
    );
    assert.deepEqual(retencoes(faixaDe(m, '2026-06')), [1, 0.75, 0.5]);
    assert.deepEqual(faixaDe(m, '2026-06').celulas[1], { mes: 1, ativos: 9, retencao: 0.75 });
  });

  test('mais ativos do que o tamanho da coorte aparece acima de 100% em vez de ser escondido por um clamp', () => {
    // Um defeito de view que aparece como 120% na tela se conserta; escondido
    // atrás de um Math.min, não.
    const m = montarMatriz(
      [{ coorte: '2026-06', mes: 0, tamanho: 10, ativos: 12, retencao: 1 }],
      AGORA,
    );
    assert.equal(faixaDe(m, '2026-06').celulas[0]?.retencao, 1.2);
  });

  test('tamanho divergente entre as linhas da coorte fica no MAIOR: o denominador não encolhe', () => {
    // Encolher o denominador infla a retenção — o erro que faz uma carteira
    // parecer saudável.
    const m = montarMatriz(
      [
        { coorte: '2026-06', mes: 0, tamanho: 12, ativos: 12, retencao: 1 },
        { coorte: '2026-06', mes: 1, tamanho: 10, ativos: 6, retencao: 0.6 },
      ],
      AGORA,
    );
    const f = faixaDe(m, '2026-06');
    assert.equal(f.tamanho, 12);
    assert.equal(f.celulas[1]?.retencao, 0.5);
  });

  test('linha repetida para o mesmo mês fica no MAIOR: uma réplica divergente não apaga ativos', () => {
    // A view pagina; a mesma célula pode chegar duas vezes com valores diferentes
    // se o group by mudar no meio. Ficar com a última tornaria a matriz dependente
    // da ordem de chegada das linhas — e a diferença aparece como churn.
    const m = montarMatriz(
      [
        { coorte: '2026-06', mes: 0, tamanho: 10, ativos: 10, retencao: 1 },
        { coorte: '2026-06', mes: 1, tamanho: 10, ativos: 9, retencao: 0.9 },
        { coorte: '2026-06', mes: 1, tamanho: 10, ativos: 7, retencao: 0.7 },
      ],
      AGORA,
    );
    assert.deepEqual(faixaDe(m, '2026-06').celulas[1], { mes: 1, ativos: 9, retencao: 0.9 });
  });

  test("'YYYY-MM' e 'YYYY-MM-DD' da mesma coorte são a mesma faixa, não duas", () => {
    // Duas faixas do mesmo mês dobrariam o mês na tabela e o peso na média.
    const m = montarMatriz(
      [
        { coorte: '2026-06', mes: 0, tamanho: 8, ativos: 8, retencao: 1 },
        { coorte: '2026-06-01', mes: 1, tamanho: 8, ativos: 4, retencao: 0.5 },
      ],
      AGORA,
    );
    assert.equal(m.faixas.length, 1);
    assert.deepEqual(retencoes(faixaDe(m, '2026-06')), [1, 0.5]);
  });

  test('o mês 0 é ativos/tamanho como qualquer outro — quem entrou e nunca ativou não vira 100% por decreto', () => {
    // É por isso que o mês 0 tem card próprio ("ativação"): ele responde quantos
    // dos que ENTRARAM chegaram a aparecer no mês em que entraram. Forçar 1 aqui
    // apagaria a única coluna que mede onboarding.
    const m = montarMatriz(linhas({ coorte: '2026-06', tamanho: 10, ativos: [7, 6, 6] }), AGORA);
    assert.equal(faixaDe(m, '2026-06').celulas[0]?.retencao, 0.7);
    assert.deepEqual(m.media[0], { retencao: 0.7, ativos: 7, base: 10, coortes: 1 });
  });

  test('as faixas saem da mais nova para a mais antiga, inclusive na virada de ano', () => {
    // A coorte mais nova é a que ainda dá para consertar — é ela que fica em cima.
    const m = montarMatriz(
      linhas(
        { coorte: '2025-12', tamanho: 4, ativos: [4, 4, 4] },
        { coorte: '2026-06', tamanho: 4, ativos: [4, 4, 4] },
        { coorte: '2026-01', tamanho: 4, ativos: [4, 4, 4] },
      ),
      AGORA,
    );
    assert.deepEqual(
      m.faixas.map((f) => f.coorte),
      ['2026-06', '2026-01', '2025-12'],
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Entrada suja e matriz vazia
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMatriz · entrada que não deveria existir', () => {
  test('linha com coorte ilegível ou mês impossível é descartada inteira, sem contaminar o denominador', () => {
    // As linhas ruins carregam tamanho 9; se alguma vazasse, o denominador da
    // faixa iria a 9 e a retenção despencaria de 100% para 44% sem motivo.
    const m = montarMatriz(
      [
        { coorte: 'sem data', mes: 0, tamanho: 9, ativos: 9, retencao: 1 },
        { coorte: '2026-13', mes: 0, tamanho: 9, ativos: 9, retencao: 1 },
        { coorte: '2026-06', mes: -1, tamanho: 9, ativos: 9, retencao: 1 },
        { coorte: '2026-06', mes: Number.NaN, tamanho: 9, ativos: 9, retencao: 1 },
        { coorte: '2026-06', mes: Number.POSITIVE_INFINITY, tamanho: 9, ativos: 9, retencao: 1 },
        ...linhas({ coorte: '2026-06', tamanho: 4, ativos: [4, 3, 2] }),
      ],
      AGORA,
    );
    assert.equal(m.faixas.length, 1);
    const f = faixaDe(m, '2026-06');
    assert.equal(f.tamanho, 4);
    assert.deepEqual(retencoes(f), [1, 0.75, 0.5]);
  });

  test('sem nenhuma linha, a matriz vem vazia e ainda assim diz qual mês está correndo', () => {
    const m = montarMatriz([], AGORA);
    assert.deepEqual(m, {
      faixas: [],
      mesesMaximo: -1,
      media: [],
      contas: 0,
      mesEmCurso: '2026-09',
      pequenas: { coortes: 0, contas: 0 },
      novasDemais: { coortes: 0, contas: 0 },
      truncada: false,
    });
  });

  test('a mesma entrada em ordem embaralhada dá a mesma matriz: a ordem das linhas da view não é dado', () => {
    // A view pagina; a ordem de chegada pode mudar sem nada mudar no banco.
    const embaralhada = [...CARTEIRA].reverse();
    assert.deepEqual(montarMatriz(embaralhada, AGORA), montarMatriz(CARTEIRA, AGORA));
  });

  test('montarMatriz não mexe nas linhas que recebe', () => {
    const original = JSON.stringify(CARTEIRA);
    montarMatriz(CARTEIRA, AGORA);
    assert.equal(JSON.stringify(CARTEIRA), original);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Os cards
// ─────────────────────────────────────────────────────────────────────────────

describe('resumoAdocao', () => {
  test('os cards saem da MESMA matriz que está desenhada embaixo', () => {
    const m = montarMatriz(CARTEIRA, AGORA);
    const resumo = resumoAdocao(m);
    assert.deepEqual(resumo.ativacao, m.media[0]);
    assert.deepEqual(resumo.retencao[0], { mes: 3, valor: m.media[3] });
  });

  test('mês de card que nenhuma coorte completou vale null — jamais 0%', () => {
    // O card "retenção em 12 meses: 0%" numa carteira de seis meses é a regra 1
    // vestida de KPI, e é o número que sai da tela e entra numa reunião.
    const resumo = resumoAdocao(montarMatriz(CARTEIRA, AGORA));
    assert.deepEqual(
      resumo.retencao.map((r) => r.mes),
      [...MESES_CARD],
    );
    assert.deepEqual(resumo.retencao[1], { mes: 6, valor: null });
    assert.deepEqual(resumo.retencao[2], { mes: 12, valor: null });
  });

  test('matriz vazia não vira carteira com 0% de ativação: todo card é null', () => {
    const resumo = resumoAdocao(montarMatriz([], AGORA));
    assert.equal(resumo.ativacao, null);
    assert.deepEqual(
      resumo.retencao.map((r) => r.valor),
      [null, null, null],
    );
    assert.equal(resumo.meiaVida, null);
  });
});

describe('resumoAdocao · meia-vida', () => {
  test('a meia-vida é a da coorte MEDIANA, e vem com quantas coortes a sustentam', () => {
    // Coortes que cruzam 50% nos meses 2, 5 e nunca → mediana = 5.
    const m = montarMatriz(
      linhas(
        { coorte: '2025-01', tamanho: 10, ativos: [10, 9, 8, 7, 6, 4, 4, 4, 4] },
        { coorte: '2025-02', tamanho: 10, ativos: [10, 6, 4, 4, 4, 4, 4, 4, 4] },
        { coorte: '2025-03', tamanho: 10, ativos: [10, 9, 9, 9, 9, 9, 9, 9, 9] },
      ),
      AGORA,
    );
    assert.deepEqual(resumoAdocao(m).meiaVida, { meses: 5, censurado: false, coortes: 3 });
  });

  test('coorte que ainda não perdeu metade devolve um PISO censurado, não uma meia-vida curta', () => {
    // Tratar "não cruzou ainda" como "cruzou no último mês observado" inventaria
    // uma meia-vida curta justamente para a carteira que está indo bem.
    const meiaVida = resumoAdocao(montarMatriz(CARTEIRA, AGORA)).meiaVida;
    assert.deepEqual(meiaVida, { meses: 2, censurado: true, coortes: 3 });
  });

  test('exatamente 50% ainda não é meia-vida: a régua é perder MAIS da metade', () => {
    // Com `<=` no lugar de `<`, a meia-vida desta coorte cairia de 2 meses para 1.
    const m = montarMatriz(linhas({ coorte: '2025-06', tamanho: 10, ativos: [10, 5, 4] }), AGORA);
    assert.deepEqual(resumoAdocao(m).meiaVida, { meses: 2, censurado: false, coortes: 1 });
  });

  test('empate entre "cruzou no mês 4" e "chegou ao mês 4 sem cruzar" fica com a observação completa', () => {
    const m = montarMatriz(
      linhas(
        { coorte: '2025-03', tamanho: 10, ativos: [10, 9, 8, 7, 4] },
        { coorte: '2025-04', tamanho: 10, ativos: [10, 10, 10, 10, 10] },
      ),
      AGORA,
    );
    assert.deepEqual(resumoAdocao(m).meiaVida, { meses: 4, censurado: false, coortes: 2 });
  });

  test('com número par de coortes a mediana pega a de baixo em vez de interpolar', () => {
    // A média de "1 mês" com "6 meses" não significa nada; arredondar para o lado
    // pessimista é o único erro que não inventa boa notícia.
    const m = montarMatriz(
      linhas(
        { coorte: '2025-03', tamanho: 10, ativos: [10, 4, 4, 4, 4, 4, 4] },
        { coorte: '2025-04', tamanho: 10, ativos: [10, 9, 9, 8, 8, 7, 4] },
      ),
      AGORA,
    );
    const meiaVida = resumoAdocao(m).meiaVida;
    assert.deepEqual(meiaVida, { meses: 1, censurado: false, coortes: 2 });
    assert.notEqual(meiaVida?.meses, 3.5);
  });

  test('a coorte que ainda não fechou nem o mês 1 entra como piso 0, não como meia-vida de 0 mês medida', () => {
    // Piso zero com censura é "ainda não dá para dizer"; sem a marca de censura,
    // o card leria "meia-vida: 0 meses" para uma coorte que entrou mês passado.
    const m = montarMatriz(linhas({ coorte: '2026-08', tamanho: 5, ativos: [5] }), AGORA);
    assert.deepEqual(resumoAdocao(m).meiaVida, { meses: 0, censurado: true, coortes: 1 });
  });
});
