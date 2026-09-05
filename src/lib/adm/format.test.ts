/**
 * Testes de `format.ts` — a camada que o painel inteiro atravessa antes de
 * virar pixel.
 *
 * Três defeitos concretos guiam o que está aqui:
 *
 * 1. VAZIO vs ZERO. "0 L" e "—" são afirmações diferentes sobre o rebanho: uma
 *    diz que ordenharam e não saiu leite, a outra que ninguém lançou. Cada
 *    formatador é testado nos dois sentidos — ausência nunca vira 0, e 0 nunca
 *    vira ausência.
 * 2. O dia civil de São Paulo. Um `date` puro do Postgres não pode virar Date, e
 *    um timestamptz de madrugada em UTC pertence ao dia ANTERIOR aqui — que é
 *    quando o produtor lança a 2ª ordenha.
 * 3. Fuso e locale explícitos. O mesmo dado é formatado no servidor (UTC) e no
 *    cliente (-03); qualquer divergência é erro de hidratação. Por isso alguns
 *    testes rodam a mesma chamada sob três fusos.
 *
 * Todo instante nos testes é literal e todo `agora` é parâmetro: nenhum
 * `new Date()` sem argumento aparece abaixo.
 */
import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  VAZIO,
  diaCivil,
  diasDesde,
  diasEntre,
  formatarBooleano,
  formatarData,
  formatarDataHora,
  formatarDataRelativa,
  formatarDiaCurto,
  formatarDiasRelativo,
  formatarInteiro,
  formatarKg,
  formatarLista,
  formatarLitros,
  formatarMes,
  formatarMoeda,
  formatarMoedaCompacta,
  formatarNumero,
  formatarPercentual,
  formatarTelefone,
  formatarValorCru,
  formatarVariacao,
  formatarVencimento,
  linkWhatsapp,
} from '@/lib/adm/format';

/**
 * pt-BR separa o símbolo da moeda com ESPAÇO INSEPARÁVEL (U+00A0), não com o
 * espaço comum. Escrito como escape para o teste não depender de o editor
 * preservar o byte — e para o dia em que alguém comparar com ' ' e não entender
 * por que falha.
 */
const NBSP = '\u00A0';

/** O menos de `formatarVariacao` é o tipográfico (U+2212), que alinha com os dígitos. */
const MENOS = '\u2212';

/** Roda `fn` com o relógio do processo em outro fuso e devolve o que ela devolveu. */
function sobFuso<T>(fuso: string, fn: () => T): T {
  const anterior = process.env.TZ;
  process.env.TZ = fuso;
  try {
    return fn();
  } finally {
    if (anterior === undefined) delete process.env.TZ;
    else process.env.TZ = anterior;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
describe('números em pt-BR', () => {
  test('milhar com ponto e decimal com vírgula, e o espaço após o R$ é inseparável', () => {
    assert.equal(formatarMoeda(1234.56), `R$${NBSP}1.234,56`);
    assert.equal(formatarInteiro(1234567), '1.234.567');
    assert.equal(formatarNumero(1234.567, 2), '1.234,57');
  });

  test('moeda sempre com os dois centavos: é valor de cobrança, não estimativa', () => {
    assert.equal(formatarMoeda(7), `R$${NBSP}7,00`);
    assert.equal(formatarMoeda(0), `R$${NBSP}0,00`);
    assert.equal(formatarMoeda(1234.565), `R$${NBSP}1.234,57`);
  });

  test('moeda compacta abrevia mil e milhão — por isso não serve para cobrar', () => {
    assert.equal(formatarMoedaCompacta(12345), `R$${NBSP}12,3${NBSP}mil`);
    assert.equal(formatarMoedaCompacta(1234567), `R$${NBSP}1,2${NBSP}mi`);
    // Sem os centavos: 12.345,67 e 12.345,00 imprimem igual.
    assert.equal(formatarMoedaCompacta(12345.67), formatarMoedaCompacta(12345));
  });

  test('casas decimais são fixas, não "até N": é o que mantém a coluna alinhada', () => {
    assert.equal(formatarNumero(3), '3,0');
    assert.equal(formatarNumero(3, 0), '3');
    assert.equal(formatarNumero(3, 2), '3,00');
  });

  test('inteiro arredonda em vez de truncar', () => {
    assert.equal(formatarInteiro(1234.6), '1.235');
    assert.equal(formatarInteiro(1234.4), '1.234');
  });

  test('litros e kg carregam a unidade e uma casa — a resolução real da balança', () => {
    assert.equal(formatarLitros(1234.56), '1.234,6 L');
    assert.equal(formatarKg(42), '42,0 kg');
    assert.equal(formatarKg(42.35, 2), '42,35 kg');
  });

  test('-0 nunca chega à tela como "-0"', () => {
    assert.equal(formatarInteiro(-0), '0');
    assert.equal(formatarNumero(-0, 1), '0,0');
    assert.equal(formatarMoeda(-0), `R$${NBSP}0,00`);
    assert.equal(formatarLitros(-0), '0,0 L');
    assert.equal(formatarInteiro(-0.4), '0'); // arredonda para -0 antes de formatar
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('percentual e variação', () => {
  test('percentual recebe FRAÇÃO: 0,625 é 63%', () => {
    assert.equal(formatarPercentual(0.625), '63%');
    assert.equal(formatarPercentual(1), '100%');
    assert.equal(formatarPercentual(0), '0%');
  });

  test('percentual de 62,5 sai 6.250% — multiplicar por 100 antes é o erro que o contrato denuncia', () => {
    // Não é bug: é o sintoma alto e visível de quem já multiplicou por 100 lá
    // atrás. Aceitar 0-100 "quando parecer grande" esconderia o erro em vez de
    // mostrá-lo.
    assert.equal(formatarPercentual(62.5), '6.250%');
  });

  test('resíduo de ponto flutuante não vaza na casa decimal do percentual', () => {
    // 0.07 * 100 é 7.000000000000001 em IEEE-754.
    assert.equal(formatarPercentual(0.07, 1), '7,0%');
    assert.equal(formatarPercentual(0.07, 2), '7,00%');
  });

  test('variação traz o sinal explícito, e o zero não ganha sinal nenhum', () => {
    assert.equal(formatarVariacao(0.12), '+12%');
    assert.equal(formatarVariacao(-0.08), `${MENOS}8%`);
    assert.equal(formatarVariacao(0), '0%');
    assert.equal(formatarVariacao(-0), '0%');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('a regra do VAZIO: ausência não é zero, e zero não é ausência', () => {
  const FORMATADORES: ReadonlyArray<readonly [string, (n: number | null | undefined) => string]> = [
    ['formatarInteiro', (n) => formatarInteiro(n)],
    ['formatarNumero', (n) => formatarNumero(n)],
    ['formatarMoeda', (n) => formatarMoeda(n)],
    ['formatarMoedaCompacta', (n) => formatarMoedaCompacta(n)],
    ['formatarPercentual', (n) => formatarPercentual(n)],
    ['formatarVariacao', (n) => formatarVariacao(n)],
    ['formatarLitros', (n) => formatarLitros(n)],
    ['formatarKg', (n) => formatarKg(n)],
  ];

  test('null e undefined viram — em todo formatador numérico, nunca 0', () => {
    for (const [nome, fn] of FORMATADORES) {
      assert.equal(fn(null), VAZIO, `${nome}(null)`);
      assert.equal(fn(undefined), VAZIO, `${nome}(undefined)`);
    }
  });

  test('NaN e Infinity viram — : divisão por zero é "não dá para calcular", não "zero"', () => {
    // Média de um conjunto vazio (0/0) e taxa sobre denominador zero (1/0) são
    // exatamente como o não-calculável chega até aqui.
    for (const [nome, fn] of FORMATADORES) {
      assert.equal(fn(0 / 0), VAZIO, `${nome}(NaN)`);
      assert.equal(fn(1 / 0), VAZIO, `${nome}(Infinity)`);
      assert.equal(fn(-1 / 0), VAZIO, `${nome}(-Infinity)`);
    }
  });

  test('o zero medido continua sendo zero na tela', () => {
    assert.equal(formatarInteiro(0), '0');
    assert.equal(formatarNumero(0), '0,0');
    assert.equal(formatarMoeda(0), `R$${NBSP}0,00`);
    assert.equal(formatarMoedaCompacta(0), `R$${NBSP}0`);
    assert.equal(formatarPercentual(0), '0%');
    assert.equal(formatarLitros(0), '0,0 L');
    assert.equal(formatarKg(0), '0,0 kg');
    assert.equal(formatarValorCru(0), '0');
    for (const [nome, fn] of FORMATADORES) {
      assert.notEqual(fn(0), VAZIO, `${nome}(0) não pode virar ${VAZIO}`);
    }
  });

  test('false é dado e vira "Não"; só a ausência vira —', () => {
    assert.equal(formatarBooleano(false), 'Não');
    assert.equal(formatarBooleano(true), 'Sim');
    assert.equal(formatarBooleano(null), VAZIO);
    assert.equal(formatarBooleano(undefined), VAZIO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('datas: o dia civil de São Paulo', () => {
  test('date puro do Postgres não perde um dia — não vira Date em momento nenhum', () => {
    // O bug clássico: new Date('2026-09-04') é meia-noite UTC, que em São Paulo
    // é 03/09 às 21h. A saída certa é o próprio texto, fatiado.
    assert.equal(formatarData('2026-09-04'), '04/09/2026');
    assert.equal(diaCivil('2026-09-04'), '2026-09-04');
    assert.equal(formatarDiaCurto('2026-09-04'), '04/09');
  });

  test('timestamptz de madrugada em UTC pertence ao dia anterior em São Paulo', () => {
    // 05/09 02h30 UTC = 04/09 23h30 aqui: é a 2ª ordenha lançada à noite.
    assert.equal(formatarData('2026-09-05T02:30:00Z'), '04/09/2026');
    assert.equal(diaCivil('2026-09-05T02:30:00Z'), '2026-09-04');
    assert.equal(formatarDataHora('2026-09-05T02:30:00Z'), '04/09/2026 23:30');
    assert.equal(formatarDiaCurto('2026-09-05T02:30:00Z'), '04/09');
  });

  test('o outro lado da borda: 23h UTC ainda é o mesmo dia aqui (20h)', () => {
    assert.equal(formatarData('2026-09-04T23:00:00Z'), '04/09/2026');
    assert.equal(diaCivil('2026-09-04T23:00:00Z'), '2026-09-04');
  });

  test('o fuso é o de verdade, com histórico de horário de verão — não um -03 fixo', () => {
    // Em 01/2018 São Paulo estava em -02 (horário de verão): 02h30 UTC ainda era
    // 00h30 do dia 1º. Em 01/2026, sem verão, o mesmo relógio já é o dia 31.
    // Um offset fixo no lugar de America/Sao_Paulo erra o registro de 2018.
    assert.equal(formatarData('2018-01-01T02:30:00Z'), '01/01/2018');
    assert.equal(formatarData('2026-01-01T02:30:00Z'), '31/12/2025');
  });

  test('a mesma entrada dá a mesma string em qualquer fuso da máquina (hidratação)', () => {
    // O servidor da Vercel roda em UTC e o browser em -03. Se algum dia alguém
    // trocar o formatador en-CA por getFullYear()/getMonth(), este teste cai.
    const casos = ['2026-09-05T02:30:00Z', '2026-09-04T23:00:00Z', '2026-09-04', '2026-09-05T02:30:00+00:00'];
    for (const caso of casos) {
      const emUtc = sobFuso('UTC', () => [formatarData(caso), diaCivil(caso), formatarDataHora(caso)]);
      const emToquio = sobFuso('Asia/Tokyo', () => [formatarData(caso), diaCivil(caso), formatarDataHora(caso)]);
      const emSp = sobFuso('America/Sao_Paulo', () => [formatarData(caso), diaCivil(caso), formatarDataHora(caso)]);
      assert.deepEqual(emToquio, emUtc, `${caso} divergiu entre Tóquio e UTC`);
      assert.deepEqual(emSp, emUtc, `${caso} divergiu entre São Paulo e UTC`);
    }
  });

  test('entrada que não é data vira — , e diaCivil devolve null (não string vazia)', () => {
    for (const lixo of [null, undefined, '', 'nao-e-data']) {
      assert.equal(formatarData(lixo), VAZIO, String(lixo));
      assert.equal(diaCivil(lixo), null, String(lixo));
      assert.equal(formatarDiaCurto(lixo), VAZIO, String(lixo));
    }
  });

  test('mês abreviado vem de tabela local: jan é o 01 e dez é o 12', () => {
    // Off-by-one no índice sairia como 'fev/2026' em janeiro — e a tabela é
    // local justamente para o eixo do gráfico não depender da versão do ICU.
    assert.equal(formatarMes('2026-01'), 'jan/2026');
    assert.equal(formatarMes('2026-09'), 'set/2026');
    assert.equal(formatarMes('2026-12'), 'dez/2026');
    assert.equal(formatarMes('2026-09-04'), 'set/2026');
  });

  test('mês fora de 01..12 devolve o valor cru em vez de inventar um nome', () => {
    assert.equal(formatarMes('2026-13'), '2026-13');
    assert.equal(formatarMes('2026-00'), '2026-00');
    assert.equal(formatarMes('trimestre'), 'trimestre');
    assert.equal(formatarMes(null), VAZIO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('distância entre dias', () => {
  test('conta DIA civil, não 24h: 23h50 para 00h10 é 1 dia', () => {
    assert.equal(diasEntre('2026-09-04T23:50:00-03:00', '2026-09-05T00:10:00-03:00'), 1);
  });

  test('e quase 24h dentro do mesmo dia é 0', () => {
    assert.equal(diasEntre('2026-09-04T00:10:00-03:00', '2026-09-04T23:50:00-03:00'), 0);
  });

  test('atravessa fevereiro contando os dias que o mês realmente tem', () => {
    assert.equal(diasEntre('2026-02-28', '2026-03-01'), 1);
    assert.equal(diasEntre('2028-02-28', '2028-03-01'), 2); // 2028 é bissexto
    assert.equal(diasEntre('2025-12-31', '2026-01-01'), 1);
  });

  test('ordem invertida devolve negativo — o sinal é informação, não erro', () => {
    assert.equal(diasEntre('2026-09-05', '2026-09-04'), -1);
  });

  test('faltando um dos lados devolve null, e nunca 0', () => {
    // 0 aqui viraria "lançou hoje" para quem nunca lançou nada.
    assert.equal(diasEntre(null, '2026-09-04'), null);
    assert.equal(diasEntre('2026-09-04', null), null);
    assert.equal(diasEntre('nao-e-data', '2026-09-04'), null);
    assert.equal(diasDesde(null, new Date('2026-09-05T12:00:00Z')), null);
  });

  test('a contagem não muda com o fuso da máquina', () => {
    const conta = () => diasEntre('2026-09-04T23:50:00-03:00', '2026-09-05T00:10:00-03:00');
    assert.equal(sobFuso('UTC', conta), 1);
    assert.equal(sobFuso('Asia/Tokyo', conta), 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('tempo relativo', () => {
  test('sem data nenhuma o texto é "nunca" — não "hoje"', () => {
    assert.equal(formatarDiasRelativo(null), 'nunca');
    assert.equal(formatarDiasRelativo(undefined), 'nunca');
    assert.equal(formatarDiasRelativo(0 / 0), 'nunca');
    assert.equal(formatarDataRelativa(null, new Date('2026-09-05T12:00:00Z')), 'nunca');
  });

  test('hoje, ontem e o plural a partir de dois dias', () => {
    assert.equal(formatarDiasRelativo(0), 'hoje');
    assert.equal(formatarDiasRelativo(1), 'ontem');
    assert.equal(formatarDiasRelativo(2), 'há 2 dias');
    assert.equal(formatarDiasRelativo(29), 'há 29 dias');
  });

  test('as fronteiras de mês e de ano, com o singular certo em cada uma', () => {
    assert.equal(formatarDiasRelativo(30), 'há 1 mês');
    assert.equal(formatarDiasRelativo(59), 'há 1 mês');
    assert.equal(formatarDiasRelativo(60), 'há 2 meses');
    assert.equal(formatarDiasRelativo(364), 'há 12 meses');
    assert.equal(formatarDiasRelativo(365), 'há 1 ano');
    assert.equal(formatarDiasRelativo(730), 'há 2 anos');
  });

  test('data no futuro não vira "hoje": o relógio do cliente pode estar adiantado', () => {
    assert.equal(formatarDiasRelativo(-1), 'no futuro');
    assert.equal(formatarDataRelativa('2026-09-06', new Date('2026-09-05T12:00:00Z')), 'no futuro');
  });

  test('formatarDataRelativa usa o `agora` recebido, e não o relógio do processo', () => {
    const dado = '2026-09-04';
    assert.equal(formatarDataRelativa(dado, new Date('2026-09-04T23:00:00Z')), 'hoje');
    assert.equal(formatarDataRelativa(dado, new Date('2026-09-05T12:00:00Z')), 'ontem');
    assert.equal(formatarDataRelativa(dado, new Date('2026-09-14T12:00:00Z')), 'há 10 dias');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('vencimento', () => {
  test('sem prazo nenhum é —, e não "vence hoje"', () => {
    assert.equal(formatarVencimento(null), VAZIO);
    assert.equal(formatarVencimento(undefined), VAZIO);
    assert.equal(formatarVencimento(0 / 0), VAZIO);
  });

  test('o sinal do número escolhe a palavra: a vencer ou vencido', () => {
    assert.equal(formatarVencimento(0), 'vence hoje');
    assert.equal(formatarVencimento(1), 'vence amanhã');
    assert.equal(formatarVencimento(7), 'vence em 7 dias');
    assert.equal(formatarVencimento(-1), 'vencido ontem');
    assert.equal(formatarVencimento(-3), 'vencido há 3 dias');
    assert.equal(formatarVencimento(-45), 'vencido há 1 mês');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('telefone e WhatsApp', () => {
  test('E.164 sem "+" — o formato real da coluna — vira máscara brasileira', () => {
    assert.equal(formatarTelefone('5511999999999'), '+55 (11) 99999-9999');
    assert.equal(formatarTelefone('551133334444'), '+55 (11) 3333-4444'); // fixo, 8 dígitos
    assert.equal(formatarTelefone('5511999999999', 'BR'), '+55 (11) 99999-9999');
    assert.equal(formatarTelefone('5511999999999', 'br'), '+55 (11) 99999-9999');
  });

  test('contato já mascarado pela view sai intacto — reformatar inventaria um telefone', () => {
    assert.equal(formatarTelefone('(**) *****-1234'), '(**) *****-1234');
    assert.equal(formatarTelefone('+55 (11) 99999-9999'), '+55 (11) 99999-9999');
  });

  test('número que não é brasileiro não ganha DDD brasileiro', () => {
    assert.equal(formatarTelefone('12025550143', 'US'), '+12025550143');
    assert.equal(formatarTelefone('5511999999999', 'PT'), '+5511999999999');
  });

  test('fora do comprimento E.164 do Brasil, só o "+" — sem máscara plausível e falsa', () => {
    assert.equal(formatarTelefone('55119999'), '+55119999');
    assert.equal(formatarTelefone('551199999999999'), '+551199999999999');
  });

  test('vazio, espaços e null viram —', () => {
    assert.equal(formatarTelefone(null), VAZIO);
    assert.equal(formatarTelefone(undefined), VAZIO);
    assert.equal(formatarTelefone(''), VAZIO);
    assert.equal(formatarTelefone('   '), VAZIO);
  });

  test('o link do wa.me leva só dígitos, e máscara não vira link', () => {
    assert.equal(linkWhatsapp('5511999999999'), 'https://wa.me/5511999999999');
    assert.equal(linkWhatsapp('+55 (11) 99999-9999'), 'https://wa.me/5511999999999');
    // '(**) *****-1234' tem 4 dígitos: abrir conversa com "1234" é pior que não abrir.
    assert.equal(linkWhatsapp('(**) *****-1234'), null);
    assert.equal(linkWhatsapp('123456789'), null);
    assert.equal(linkWhatsapp(null), null);
    assert.equal(linkWhatsapp(''), null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('lista e célula genérica', () => {
  test('lista liga o último item com "e" e os demais com vírgula', () => {
    assert.equal(formatarLista(['a']), 'a');
    assert.equal(formatarLista(['a', 'b']), 'a e b');
    assert.equal(formatarLista(['a', 'b', 'c']), 'a, b e c');
    assert.equal(formatarLista(['a', 'b', 'c', 'd']), 'a, b, c e d');
  });

  test('lista vazia vira — , e nunca a string "undefined"', () => {
    assert.equal(formatarLista([]), VAZIO);
    assert.equal(formatarLista(null), VAZIO);
    assert.equal(formatarLista(undefined), VAZIO);
  });

  test('a célula do escape hatch reconhece cada tipo que o Postgres devolve', () => {
    assert.equal(formatarValorCru(null), VAZIO);
    assert.equal(formatarValorCru(undefined), VAZIO);
    assert.equal(formatarValorCru('   '), VAZIO);
    assert.equal(formatarValorCru(true), 'Sim');
    assert.equal(formatarValorCru(false), 'Não');
    assert.equal(formatarValorCru(1234), '1.234');
    assert.equal(formatarValorCru(12.5), '12,50');
    assert.equal(formatarValorCru('boa vista'), 'boa vista');
    assert.equal(formatarValorCru({ meta: 3 }), '{"meta":3}');
  });

  test('data e timestamp em texto viram data formatada, não ISO cru na tabela', () => {
    assert.equal(formatarValorCru('2026-09-04'), '04/09/2026');
    assert.equal(formatarValorCru('2026-09-05T02:30:00+00:00'), '04/09/2026 23:30');
  });

  test('array vazio é ausência; array com null mostra — no lugar do item, não "null"', () => {
    assert.equal(formatarValorCru([]), VAZIO);
    assert.equal(formatarValorCru([1, null, 'x']), `1, ${VAZIO}, x`);
  });

  test('NaN numa coluna crua é — , não "NaN"', () => {
    assert.equal(formatarValorCru(0 / 0), VAZIO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Defeitos encontrados escrevendo estes testes. Ficam aqui, pulados e com o
// caso montado, para a decisão de mudar comportamento ser explícita.
// ─────────────────────────────────────────────────────────────────────────────
describe('defeitos que já foram bug (não podem voltar)', () => {
  test(
    'formatarDataHora com date puro mostra o dia certo — data pura é texto, não instante',
    () => {
      assert.equal(formatarDataHora('2026-09-04'), '04/09/2026');
    },
  );

  test(
    'soma de negativos que quase zera não pode imprimir "-0,0"',
    () => {
      const residuo = 0.3 - 0.1 - 0.2;
      assert.equal(formatarNumero(residuo, 1), '0,0');
      assert.equal(formatarLitros(residuo), '0,0 L');
      assert.equal(formatarPercentual(residuo), '0%');
      assert.equal(formatarMoeda(-0.001), `R$${NBSP}0,00`);
    },
  );

  test(
    'timestamp sem fuso é ancorado em UTC: servidor e cliente imprimem o mesmo',
    () => {
      const naive = '2026-09-05T02:30:00';
      assert.equal(
        sobFuso('UTC', () => formatarValorCru(naive)),
        sobFuso('America/Sao_Paulo', () => formatarValorCru(naive)),
      );
    },
  );
});
