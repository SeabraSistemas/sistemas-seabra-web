/**
 * Testes de `url.ts` — o dialeto que a tela, o servidor e a exportação falam
 * entre si pela query string.
 *
 * O que estes testes protegem:
 *
 * 1. As constantes são um CONTRATO PÚBLICO. Um link do painel colado num
 *    WhatsApp continua sendo aberto meses depois; mudar `f.`, `(vazio)` ou `..`
 *    não quebra compilação nenhuma — só faz o filtro sumir em silêncio, que é o
 *    pior modo de falha possível para uma tela de cobrança.
 * 2. `inicioDoPeriodo` recebe `agora` por parâmetro para ser determinístico.
 *    Aqui todo `agora` é literal, construído no fuso local para que o teste
 *    valha em qualquer máquina — e as comparações são feitas no mesmo calendário
 *    local, nunca em milissegundos, que trocariam de valor num fuso com horário
 *    de verão.
 * 3. O switch dos períodos é copia-e-cola de quatro ramos parecidos: os casos
 *    abaixo cobrem cada ramo com uma data diferente, e a ordem entre eles.
 */
import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  BOOLEANO_NAO,
  BOOLEANO_SIM,
  PERIODOS_RELATIVOS,
  PREFIXO_FILTRO,
  SEM_VALOR,
  SEPARADOR_INTERVALO,
  SEPARADOR_VALORES,
  ehPeriodoRelativo,
  inicioDoPeriodo,
} from '@/lib/adm/url';

/** 'AAAA-MM-DD HH:mm' pelo calendário LOCAL — o mesmo em que a função faz a conta. */
function local(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Meio-dia de propósito: nenhuma transição de horário de verão acontece ao meio-dia. */
function meioDia(ano: number, mes1a12: number, dia: number): Date {
  return new Date(ano, mes1a12 - 1, dia, 12, 0, 0, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
describe('as constantes da gramática', () => {
  test('as chaves da URL são contrato público: mudar uma quebra link já compartilhado', () => {
    assert.equal(PREFIXO_FILTRO, 'f.');
    assert.equal(SEM_VALOR, '(vazio)');
    assert.equal(SEPARADOR_VALORES, ',');
    assert.equal(SEPARADOR_INTERVALO, '..');
    assert.equal(BOOLEANO_SIM, 'sim');
    assert.equal(BOOLEANO_NAO, 'nao');
  });

  test('o tri-state é comparado por === , então "nao" não pode ganhar acento', () => {
    // `bruto === BOOLEANO_NAO` em params.ts: 'não' na URL viaja como %C3%A3o e
    // qualquer normalização pelo caminho faria o filtro "não" cair para "todos" —
    // uma tela de inadimplentes mostrando o cadastro inteiro.
    for (const valor of [BOOLEANO_SIM, BOOLEANO_NAO]) {
      assert.equal(valor, valor.toLowerCase());
      assert.match(valor, /^[a-z]+$/);
    }
  });

  test('o sentinela de vazio não pode conter os separadores, senão vira dois filtros', () => {
    // '(vazio)' viaja dentro de uma lista separada por vírgula e é lido de volta
    // por split(SEPARADOR_VALORES): uma vírgula dentro dele o partiria em dois
    // valores que não existem em coluna nenhuma.
    assert.ok(!SEM_VALOR.includes(SEPARADOR_VALORES));
    assert.ok(!SEM_VALOR.includes(SEPARADOR_INTERVALO));
    // E o intervalo não pode ser confundido com o separador de lista.
    assert.ok(!SEPARADOR_INTERVALO.includes(SEPARADOR_VALORES));
  });

  test('nenhum período relativo colide com a sintaxe de intervalo ou de lista', () => {
    // params.ts testa ehPeriodoRelativo ANTES de partir o intervalo; um período
    // que contivesse '..' seria lido pelos dois caminhos, dependendo da ordem.
    for (const periodo of PERIODOS_RELATIVOS) {
      assert.ok(!periodo.includes(SEPARADOR_INTERVALO), periodo);
      assert.ok(!periodo.includes(SEPARADOR_VALORES), periodo);
    }
  });

  test('a gramática atravessa a query string e volta byte a byte igual', () => {
    const params = new URLSearchParams();
    params.set(`${PREFIXO_FILTRO}papel`, ['produtor', 'tecnico'].join(SEPARADOR_VALORES));
    params.set(`${PREFIXO_FILTRO}peso`, `40${SEPARADOR_INTERVALO}80`);
    params.set(`${PREFIXO_FILTRO}numero_criador`, SEM_VALOR);
    params.set(`${PREFIXO_FILTRO}ativo`, BOOLEANO_NAO);

    const devolta = new URL(`https://exemplo/adm/usuarios?${params.toString()}`).searchParams;

    assert.deepEqual(devolta.get(`${PREFIXO_FILTRO}papel`)?.split(SEPARADOR_VALORES), ['produtor', 'tecnico']);
    assert.deepEqual(devolta.get(`${PREFIXO_FILTRO}peso`)?.split(SEPARADOR_INTERVALO), ['40', '80']);
    assert.equal(devolta.get(`${PREFIXO_FILTRO}numero_criador`), SEM_VALOR);
    assert.equal(devolta.get(`${PREFIXO_FILTRO}ativo`), BOOLEANO_NAO);
  });

  test('o prefixo isola a faceta dos parâmetros reservados da tela', () => {
    // params.ts varre TODAS as chaves e só olha as que começam com o prefixo:
    // se `sort`, `page`, `cols` ou `prop` casassem, virariam filtro de coluna.
    for (const reservado of ['sort', 'page', 'size', 'cursor', 'cols', 'prop']) {
      assert.ok(!reservado.startsWith(PREFIXO_FILTRO), reservado);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ehPeriodoRelativo aceita um conjunto fechado', () => {
  test('os quatro períodos declarados são aceitos, e são exatamente quatro', () => {
    assert.deepEqual([...PERIODOS_RELATIVOS], ['7d', '30d', '90d', '12m']);
    for (const periodo of PERIODOS_RELATIVOS) {
      assert.ok(ehPeriodoRelativo(periodo), periodo);
    }
  });

  test('qualquer outra coisa é recusada — inclusive maiúscula, espaço e vizinho plausível', () => {
    const recusados = ['1d', '7', '7dias', '7D', '12M', '365d', '', ' 7d', '7d ', 'todos', '30d,90d', '7d..30d'];
    for (const valor of recusados) {
      assert.equal(ehPeriodoRelativo(valor), false, valor);
    }
  });

  test('herança de Object não passa por período: a guarda é a lista, não um objeto', () => {
    // Se algum dia isto virar `MAPA[valor] !== undefined`, '?f.data=constructor'
    // entra como período válido e o corte de data sai de um lugar inesperado.
    for (const veneno of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      assert.equal(ehPeriodoRelativo(veneno), false, veneno);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('inicioDoPeriodo', () => {
  test('7d, 30d e 90d recuam a quantidade exata de dias do calendário', () => {
    const agora = meioDia(2026, 9, 5);
    assert.equal(local(inicioDoPeriodo('7d', agora)), '2026-08-29 12:00');
    assert.equal(local(inicioDoPeriodo('30d', agora)), '2026-08-06 12:00');
    assert.equal(local(inicioDoPeriodo('90d', agora)), '2026-06-07 12:00');
  });

  test('cada ramo do switch com uma data diferente — troca entre eles não passa', () => {
    // Copiar o ramo do 30d para o do 90d é o defeito mais provável neste switch;
    // por isso os três recuos partem de um março, onde caem em meses distintos.
    const marco = meioDia(2026, 3, 5);
    assert.equal(local(inicioDoPeriodo('7d', marco)), '2026-02-26 12:00');
    assert.equal(local(inicioDoPeriodo('30d', marco)), '2026-02-03 12:00');
    assert.equal(local(inicioDoPeriodo('90d', marco)), '2025-12-05 12:00');
    assert.equal(local(inicioDoPeriodo('12m', marco)), '2025-03-05 12:00');
  });

  test('12m recua um ANO, não doze vezes trinta dias — a diferença aparece em fevereiro', () => {
    // 28/02/2026 menos 12 meses é 28/02/2025. Menos 360 dias seria 05/03/2025:
    // uma semana de faturas fora do período, justamente na virada do mês.
    const fevereiro = meioDia(2026, 2, 28);
    assert.equal(local(inicioDoPeriodo('12m', fevereiro)), '2025-02-28 12:00');
    assert.notEqual(local(inicioDoPeriodo('12m', fevereiro)), '2025-03-05 12:00');
  });

  test('12m preserva o dia do mês quando ele existe no ano anterior', () => {
    assert.equal(local(inicioDoPeriodo('12m', meioDia(2026, 1, 31))), '2025-01-31 12:00');
    assert.equal(local(inicioDoPeriodo('12m', meioDia(2026, 12, 31))), '2025-12-31 12:00');
  });

  test('12m sobre 29 de fevereiro cai em 1º de março do ano anterior (transbordo do JS)', () => {
    // 2027 não é bissexto: setMonth() transborda 29/02 para 01/03. Um dia de
    // diferença num corte de período, e é o comportamento que está em produção —
    // fica registrado para a mudança ser deliberada.
    assert.equal(local(inicioDoPeriodo('12m', meioDia(2028, 2, 29))), '2027-03-01 12:00');
  });

  test('o corte sempre fica antes de agora, e os quatro períodos ficam em ordem', () => {
    const agora = meioDia(2026, 9, 5);
    const cortes = PERIODOS_RELATIVOS.map((p) => inicioDoPeriodo(p, agora).getTime());
    for (const [i, corte] of cortes.entries()) {
      assert.ok(corte < agora.getTime(), `${PERIODOS_RELATIVOS[i]} não recuou`);
      if (i > 0) assert.ok(corte < cortes[i - 1], `${PERIODOS_RELATIVOS[i]} não é mais antigo que o anterior`);
    }
  });

  test('não mexe no `agora` que recebeu', () => {
    // A tela chama inicioDoPeriodo() e DEPOIS usa o mesmo `agora` para carimbar
    // "lido agora": mutar o parâmetro faria o carimbo recuar 90 dias.
    const agora = meioDia(2026, 9, 5);
    const antes = agora.getTime();
    for (const periodo of PERIODOS_RELATIVOS) inicioDoPeriodo(periodo, agora);
    assert.equal(agora.getTime(), antes);
  });

  test('atravessa a virada do ano sem perder o ano', () => {
    const janeiro = meioDia(2026, 1, 15);
    assert.equal(local(inicioDoPeriodo('7d', janeiro)), '2026-01-08 12:00');
    assert.equal(local(inicioDoPeriodo('30d', janeiro)), '2025-12-16 12:00');
    assert.equal(local(inicioDoPeriodo('90d', janeiro)), '2025-10-17 12:00');
    assert.equal(local(inicioDoPeriodo('12m', janeiro)), '2025-01-15 12:00');
  });
});
