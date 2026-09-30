import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { agruparColetas, compradorDaSaida, montarColetas, ordenhasDoApp, type ProducaoDoApp } from '@/lib/tres-irmaos/acompanhamento';
import { inicioDaSemana, somarDias, somarMeses } from '@/lib/tres-irmaos/datas';
import {
  diaColetaNaSemana,
  distribuir,
  normalizarParametros,
  parametrosIniciais,
  projetar,
  simularTanque,
  trocarDiaColeta,
  type Comprador,
  type Parametros,
} from '@/lib/tres-irmaos/projecao';

// Terça-feira: a semana de fornecimento começa nela.
const HOJE = '2026-09-29';

function params(extra: Partial<Parametros> = {}): Parametros {
  return {
    ...parametrosIniciais({ lactantes: 63, mediaInicial: 2.7, efetivo: { lactante: 63, seca: 20, 'pre-parto': 5, reprodutor: 3 } }),
    partos: [],
    diasLactacaoNovas: null,
    ...extra,
  };
}

const perto = (a: number, b: number, msg?: string) => assert.ok(Math.abs(a - b) < 1e-6, msg ?? `${a} ≠ ${b}`);

/** Rose e Marina de hoje (Marina na sexta). */
const COMPRADORES = parametrosIniciais({ lactantes: 0, mediaInicial: null, efetivo: {} }).compradores;
/** Como era até a semana de 22/09/2026: Marina na quinta. Os cenários de mecânica abaixo foram contados assim. */
const NA_QUINTA: Comprador[] = COMPRADORES.map((c) => (c.id === 'marina' ? { ...c, diaColeta: 4 } : c));

describe('datas', () => {
  test('a semana começa na terça', () => {
    assert.equal(inicioDaSemana('2026-09-28'), '2026-09-22'); // segunda → terça anterior
    assert.equal(inicioDaSemana('2026-09-29'), '2026-09-29'); // terça é ela mesma
    assert.equal(inicioDaSemana('2026-10-02'), '2026-09-29'); // sexta (Marina)
  });

  test('somar meses não transborda o fim do mês', () => {
    assert.equal(somarMeses('2026-01-31', 1), '2026-02-28');
    assert.equal(somarMeses('2026-09-29', 12), '2027-09-29');
  });
});

describe('projeção — a conta da planilha do Felipe (28/09)', () => {
  test('63 lactantes × 2,70 = 1.190 L/semana: Rose 800, sobram 390 para a Marina', () => {
    const s = projetar(params(), HOJE).semanas[0];
    perto(s.litrosSemana, 63 * 2.7 * 7);
    perto(s.entregas[0].litros, 800);
    perto(s.entregas[1].litros, 63 * 2.7 * 7 - 800);
    assert.equal(s.acimaDoTeto, 0);
    assert.equal(s.excedente, 0);
  });

  test('com as 13 paridas (76 × 2,7 = 1.436 L) passa 136 L do teto de 1.300', () => {
    const p = params({ partos: [{ data: '2026-10-06', quantidade: 13 }] });
    const proj = projetar(p, HOJE);
    const semana = proj.semanas.find((s) => s.inicio === '2026-10-06')!;
    assert.equal(semana.lactantes, 76);
    perto(semana.litrosSemana, 1436.4);
    perto(semana.acimaDoTeto, 136.4);
    perto(semana.vendido, 1300);
    perto(semana.excedente, 136.4);
    assert.equal(proj.primeiraSemanaAcimaDoTeto, '2026-10-06');
  });

  test('a semana anterior ao parto não conta a parida', () => {
    const p = params({ partos: [{ data: '2026-10-08', quantidade: 5 }] });
    const [s0, s1] = projetar(p, HOJE).semanas;
    assert.equal(s0.lactantes, 63);
    assert.equal(s1.lactantes, 68);
  });

  test('parto com data no passado é ignorado — já está nas lactantes de hoje', () => {
    const p = params({ partos: [{ data: '2026-09-01', quantidade: 5 }] });
    assert.equal(projetar(p, HOJE).semanas[0].lactantes, 63);
  });
});

describe('projeção — secagens e coberturas', () => {
  test('secagem manual sai das lactantes de hoje, e o que passar delas sai das paridas', () => {
    const p = params({
      lactantesIniciais: 2,
      partos: [{ data: '2026-09-29', quantidade: 3 }],
      secagens: [{ data: '2026-10-06', quantidade: 4 }],
    });
    const [s0, s1] = projetar(p, HOJE).semanas;
    assert.equal(s0.lactantes, 5);
    assert.equal(s1.lactantes, 1);
    assert.equal(s1.secagens, 4);
  });

  test('não seca mais do que existe', () => {
    const p = params({ lactantesIniciais: 2, secagens: [{ data: '2026-09-29', quantidade: 10 }] });
    const s = projetar(p, HOJE).semanas[0];
    assert.equal(s.lactantes, 0);
    assert.equal(s.secagens, 2);
  });

  test('recém-parida seca sozinha depois de diasLactacaoNovas', () => {
    const p = params({ lactantesIniciais: 0, partos: [{ data: '2026-09-29', quantidade: 10 }], diasLactacaoNovas: 14 });
    const lact = projetar(p, HOJE).semanas.slice(0, 4).map((s) => s.lactantes);
    assert.deepEqual(lact, [10, 10, 0, 0]);
  });

  test('cobertura vira parto 150 dias depois, na taxa de prenhez', () => {
    const p = params({ lactantesIniciais: 0, coberturas: [{ data: '2026-10-01', quantidade: 10 }], taxaPrenhez: 0.7 });
    const proj = projetar(p, HOJE);
    const semanaDoParto = inicioDaSemana('2027-02-28'); // 01/10 + 150 dias
    const s = proj.semanas.find((x) => x.inicio === semanaDoParto)!;
    perto(s.partos, 7);
    perto(s.lactantes, 7);
  });

  test('partos do app só entram com a chave ligada', () => {
    const doApp = [{ data: '2026-10-06', quantidade: 4 }];
    assert.equal(projetar(params({ usarPartosDoApp: true }), HOJE, doApp).semanas[1].lactantes, 67);
    assert.equal(projetar(params({ usarPartosDoApp: false }), HOJE, doApp).semanas[1].lactantes, 63);
  });

  test('recém-parida pode ter média própria', () => {
    const p = params({ lactantesIniciais: 10, mediaLitros: 2, mediaRecemParida: 3, partos: [{ data: '2026-09-29', quantidade: 5 }] });
    perto(projetar(p, HOJE).semanas[0].litrosDia, 10 * 2 + 5 * 3);
  });
});

describe('projeção — efetivo por categoria', () => {
  test('os valores iniciais trazem o efetivo do app, sem a lactante (que tem campo próprio)', () => {
    assert.deepEqual(params().efetivoInicial, { seca: 20, 'pre-parto': 5, reprodutor: 3 });
  });

  test('parto tira de seca + pré-parto; secagem devolve', () => {
    const p = params({ partos: [{ data: '2026-09-29', quantidade: 10 }], secagens: [{ data: '2026-10-06', quantidade: 4 }] });
    const [s0, s1] = projetar(p, HOJE).semanas;
    assert.equal(s0.secasEPreParto, 15);
    assert.equal(s0.partosSemMae, 0);
    assert.equal(s1.secasEPreParto, 19);
    assert.equal(s1.lactantes, 69);
  });

  test('parto além de seca + pré-parto vira aviso, e o estoque não fica negativo', () => {
    const p = params({ partos: [{ data: '2026-09-29', quantidade: 30 }] });
    const s = projetar(p, HOJE).semanas[0];
    assert.equal(s.partosSemMae, 5);
    assert.equal(s.secasEPreParto, 0);
    assert.equal(s.lactantes, 93); // a produção ainda conta os 30: o aviso é que o número não fecha
  });

  test('efetivo salvo torto vira número, e ausente cai no inicial', () => {
    const iniciais = params();
    assert.deepEqual(normalizarParametros({ efetivoInicial: { seca: '7', recria: -2 } }, iniciais).efetivoInicial, { seca: 0, recria: 0 });
    assert.deepEqual(normalizarParametros({}, iniciais).efetivoInicial, iniciais.efetivoInicial);
  });

  test('comprador salvo antes do campo destinosApp herda o destino padrão', () => {
    const n = normalizarParametros({ compradores: [{ id: 'rose', nome: 'Rose', diaColeta: 2, minSemanal: 600, maxSemanal: 800 }] }, params());
    assert.deepEqual(n.compradores[0].destinosApp, ['Leite Rose']);
  });
});

describe('projeção — horizonte e meses', () => {
  test('horizonte fica entre 1 e 12 meses', () => {
    assert.equal(projetar(params({ horizonteMeses: 0 }), HOJE).fim, '2027-09-28');
    assert.equal(projetar(params({ horizonteMeses: 1 }), HOJE).fim, '2026-10-28');
    assert.equal(projetar(params({ horizonteMeses: 40 }), HOJE).fim, '2027-09-28');
  });

  test('a última semana é parcial e o litro dela é proporcional', () => {
    const proj = projetar(params({ horizonteMeses: 1 }), HOJE);
    const ultima = proj.semanas.at(-1)!;
    assert.equal(ultima.fim, '2026-10-28');
    assert.equal(ultima.dias, 2); // 27 e 28/10
    perto(ultima.litrosSemana, 63 * 2.7 * 2);
    perto(ultima.vendido, 63 * 2.7 * 2); // o teto e os máximos também são proporcionais
  });

  test('o mês soma os litros dia a dia, sem contar os dias antes de hoje', () => {
    const hoje = '2026-10-01'; // quinta: a semana começou na terça 29/09
    const proj = projetar(params({ horizonteMeses: 2 }), hoje);
    const outubro = proj.meses.find((m) => m.mes === '2026-10')!;
    assert.equal(outubro.dias, 31);
    perto(outubro.litrosMes, 63 * 2.7 * 31);
    assert.equal(proj.meses[0].mes, '2026-10'); // setembro (29 e 30) ficou de fora
  });
});

describe('tanque (o do Lucas: 1.200 L)', () => {
  const compradores = NA_QUINTA;

  test('com a Marina na sexta, o pico antes da Rose cai para 4 dias de leite (sex tarde → ter manhã)', () => {
    const pico = simularTanque(COMPRADORES, 1300, 1200);
    assert.equal(pico(163), 652);
    // 205,2 L/dia: Rose 820,8 → leva 800, sobra 20,8; Marina 20,8 + 615,6 → leva 500, sobra 136,4.
    perto(pico(205.2), 820.8);
    perto(pico(205.2), 136.4 + 820.8);
  });

  test('o pico é antes da Rose: 5 dias de leite (qui tarde → ter manhã)', () => {
    const pico = simularTanque(compradores, 1300, 1200);
    assert.equal(pico(163), 815);
  });

  test('a sobra da Marina volta para a Rose da semana seguinte', () => {
    const pico = simularTanque(compradores, 1300, 1200);
    // 205,2 L/dia (76 × 2,7): Rose 1.026 → leva 800, sobra 226; Marina 226 + 410,4 → leva 500, sobra 136,4.
    perto(pico(205.2), 1026);
    perto(pico(205.2), 136.4 + 1026); // 1.162,4 — cabe; sobra 362,4 → Marina 772,8 → sobra 272,8
    perto(pico(205.2), 272.8 + 1026); // 1.298,8 — passa do tanque
  });

  test('o que passa da capacidade transborda e não é carregado', () => {
    const pico = simularTanque(compradores, 1300, 1000);
    pico(300); // Rose: 1.500 → cabem 1.000, leva 800, sobra 200; Marina: 200 + 600 = 800 → leva 500, sobra 300
    assert.equal(pico(0), 300);
  });

  test('a projeção marca a primeira semana em que o tanque não comporta', () => {
    const p = params({ partos: [{ data: '2026-10-06', quantidade: 13 }], compradores: NA_QUINTA });
    const proj = projetar(p, HOJE);
    // Sobra da semana de 29/09 (63 × 2,7): Rose 850,5 → sobra 50,5; Marina 50,5 + 340,2 = 390,7 → leva tudo.
    // 06/10: 1.026 → sobra 226 → Marina 636,4 → sobra 136,4. 13/10: 1.162,4 (cabe) → … sobra 272,8. 20/10: 1.298,8.
    assert.equal(proj.primeiraSemanaTanqueCheio, '2026-10-20');
    const s = proj.semanas.find((x) => x.inicio === '2026-10-20')!;
    perto(s.acimaDaCapacidade, 272.8 + 1026 - 1200);
  });

  test('capacidade zero desliga o aviso', () => {
    const p = params({ partos: [{ data: '2026-10-06', quantidade: 13 }], capacidadeTanque: 0 });
    assert.equal(projetar(p, HOJE).primeiraSemanaTanqueCheio, null);
  });
});

describe('distribuir', () => {
  const compradores = COMPRADORES;

  test('quem paga mais enche primeiro', () => {
    const [rose, marina] = distribuir(700, compradores, 1300);
    assert.equal(rose.litros, 700);
    assert.equal(marina.litros, 0);
    assert.equal(rose.abaixoDoMinimo, false);
    assert.equal(marina.abaixoDoMinimo, true);
  });

  test('abaixo do mínimo da Rose', () => {
    assert.equal(distribuir(500, compradores, 1300)[0].abaixoDoMinimo, true);
  });

  test('o teto corta antes dos máximos', () => {
    const [rose, marina] = distribuir(2000, compradores, 1000);
    assert.equal(rose.litros, 800);
    assert.equal(marina.litros, 200);
  });
});

describe('normalizarParametros', () => {
  const iniciais = params();

  test('lixo vira o inicial', () => {
    assert.deepEqual(normalizarParametros(null, iniciais), iniciais);
    assert.deepEqual(normalizarParametros('x', iniciais), iniciais);
  });

  test('campo com tipo errado cai no inicial; previsão sem data é descartada', () => {
    const n = normalizarParametros(
      { tetoSemanal: '1300', horizonteMeses: 99, partos: [{ data: '06/10', quantidade: 3 }, { data: '2026-10-06', quantidade: 2 }], diasLactacaoNovas: null },
      iniciais,
    );
    assert.equal(n.tetoSemanal, 1300);
    assert.equal(n.horizonteMeses, 12);
    assert.deepEqual(n.partos, [{ data: '2026-10-06', quantidade: 2 }]);
    assert.equal(n.diasLactacaoNovas, null);
  });
});

describe('acompanhamento por coleta (depois da 1ª ordenha)', () => {
  const compradores = NA_QUINTA;

  /** Dias com manhã e tarde lançadas, de `de` a `ate`. */
  function dias(de: string, ate: string, manha = 100, tarde = 60): ProducaoDoApp[] {
    const out: ProducaoDoApp[] = [];
    for (let d = de; d <= ate; d = somarDias(d, 1)) out.push({ data: d, lactantes: 67, litros1: manha, litros2: tarde });
    return out;
  }

  test('Rose (terça) leva da tarde de quinta à manhã de terça; Marina (quinta), da tarde de terça à manhã de quinta', () => {
    // 24/09 é quinta; 29/09 terça; 01/10 quinta.
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01')), [], compradores, 1300, '2026-10-05');
    const rose = coletas.find((c) => c.compradorId === 'rose' && c.data === '2026-09-29')!;
    assert.deepEqual(rose.desde, { data: '2026-09-24', turno: 2 });
    assert.equal(rose.ordenhasEsperadas, 10);
    assert.equal(rose.ordenhasLancadas, 10);
    assert.equal(rose.produzido, 60 + 4 * 160 + 100); // 800
    const marina = coletas.find((c) => c.compradorId === 'marina' && c.data === '2026-10-01')!;
    assert.deepEqual(marina.desde, { data: '2026-09-29', turno: 2 });
    assert.equal(marina.ordenhasEsperadas, 4);
    assert.equal(marina.produzido, 60 + 160 + 100);
  });

  test('o que passa do máximo da Rose fica no tanque e vai para a Marina', () => {
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01', 110, 60)), [], compradores, 1300, '2026-10-05');
    const rose = coletas.find((c) => c.data === '2026-09-29')!;
    assert.equal(rose.produzido, 60 + 4 * 170 + 110); // 850
    assert.equal(rose.leva, 800);
    assert.equal(rose.sobra, 50);
    assert.equal(rose.acimaDoMaximo, 50);
    const marina = coletas.find((c) => c.data === '2026-10-01')!;
    assert.equal(marina.sobraAnterior, 50);
    assert.equal(marina.tanque, 50 + 60 + 170 + 110);
    assert.equal(marina.leva, 390);
  });

  test('o teto semanal corta a Marina depois da Rose', () => {
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01', 110, 60)), [], compradores, 1000, '2026-10-05');
    const marina = coletas.find((c) => c.data === '2026-10-01')!;
    assert.equal(marina.leva, 200);
    assert.equal(marina.sobra, 390 - 200);
  });

  test('ordenha faltando marca a coleta incompleta e não carrega sobra', () => {
    const producoes = dias('2026-09-24', '2026-10-01', 110, 60).filter((p) => p.data !== '2026-09-26');
    const coletas = montarColetas(ordenhasDoApp(producoes), [], compradores, 1300, '2026-10-05');
    const rose = coletas.find((c) => c.data === '2026-09-29')!;
    assert.equal(rose.ordenhasLancadas, 8);
    const marina = coletas.find((c) => c.data === '2026-10-01')!;
    assert.equal(marina.sobraAnterior, 0);
  });

  test('dia só com a 1ª ordenha lançada conta só a manhã', () => {
    const ord = ordenhasDoApp([{ data: '2026-09-28', lactantes: 67, litros1: 101, litros2: null }]);
    assert.deepEqual(ord, [{ data: '2026-09-28', turno: 1, litros: 101 }]);
  });

  test('a próxima coleta aparece aberta, acumulando, e nada depois dela', () => {
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-09-28')), [], compradores, 1300, '2026-09-28');
    const ultima = coletas.at(-1)!;
    assert.equal(ultima.data, '2026-09-29');
    assert.equal(ultima.aberta, true);
    assert.equal(ultima.ordenhasLancadas, 9); // falta a manhã de terça
    assert.equal(coletas.filter((c) => c.aberta).length, 1);
  });

  test('a Saída de Leite do app aparece ao lado, pelo destino (Leite Chaparral = Marina)', () => {
    const saidas = [
      { data: '2026-10-01', litros: 320, destinos: ['leite chaparral'] },
      { data: '2026-09-29', litros: 780, destinos: ['Leite Rose'] },
      { data: '2026-09-29', litros: 10, destinos: ['Queijaria'] },
    ];
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01')), saidas, compradores, 1300, '2026-10-05');
    assert.equal(coletas.find((c) => c.data === '2026-09-29')!.saidaNoApp, 780);
    assert.equal(coletas.find((c) => c.data === '2026-10-01')!.saidaNoApp, 320);
    assert.equal(compradorDaSaida(['Queijaria'], compradores), null);
  });

  test('tanque acima da capacidade antes da coleta fica marcado', () => {
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01', 150, 90)), [], compradores, 1300, '2026-10-05', 1100);
    const rose = coletas.find((c) => c.data === '2026-09-29')!;
    assert.equal(rose.tanque, 90 + 4 * 240 + 150); // 1.200
    assert.equal(rose.acimaDaCapacidade, 100);
    assert.equal(coletas.find((c) => c.data === '2026-10-01')!.acimaDaCapacidade, 0);
  });

  test('a semana soma as duas coletas e compara com o teto', () => {
    const coletas = montarColetas(ordenhasDoApp(dias('2026-09-24', '2026-10-01', 110, 60)), [], compradores, 1100, '2026-10-05');
    const semana = agruparColetas(coletas, 1100).find((s) => s.inicio === '2026-09-29')!;
    assert.equal(semana.produzido, 850 + 340);
    assert.equal(semana.acimaDoTeto, 90);
    assert.equal(semana.completa, true);
  });
});

describe('troca do dia da coleta (Marina: quinta → sexta em 30/09/2026)', () => {
  const marina = NA_QUINTA.find((c) => c.id === 'marina')!;
  const QUARTA = '2026-09-30';

  test('trocada na quarta, vale já nesta semana: a quinta 01/10 ainda não tinha passado', () => {
    const t = trocarDiaColeta(marina, 5, QUARTA);
    assert.equal(t.diaColeta, 5);
    assert.deepEqual(t.diasAnteriores, [{ dia: 4, ateSemana: '2026-09-29' }]);
    assert.equal(diaColetaNaSemana(t, '2026-09-22'), 4);
    assert.equal(diaColetaNaSemana(t, '2026-09-29'), 5);
    assert.equal(diaColetaNaSemana(t, '2026-10-06'), 5);
  });

  test('trocada na sexta, depois da quinta: esta semana fica na quinta e a troca vale da próxima', () => {
    const t = trocarDiaColeta(marina, 5, '2026-10-02');
    assert.deepEqual(t.diasAnteriores, [{ dia: 4, ateSemana: '2026-10-06' }]);
    assert.equal(diaColetaNaSemana(t, '2026-09-29'), 4);
  });

  test('mexer de novo na mesma semana não empilha; voltar ao dia de antes apaga a troca', () => {
    const t = trocarDiaColeta(trocarDiaColeta(marina, 6, QUARTA), 5, QUARTA);
    assert.deepEqual(t.diasAnteriores, [{ dia: 4, ateSemana: '2026-09-29' }]);
    const volta = trocarDiaColeta(t, 4, QUARTA);
    assert.equal('diasAnteriores' in volta, false);
    assert.deepEqual(volta, marina);
  });

  test('uma troca antiga continua valendo nas semanas dela', () => {
    const antiga = { ...marina, diaColeta: 4, diasAnteriores: [{ dia: 3, ateSemana: '2026-09-01' }] };
    const t = trocarDiaColeta(antiga, 5, QUARTA);
    assert.deepEqual(t.diasAnteriores, [
      { dia: 3, ateSemana: '2026-09-01' },
      { dia: 4, ateSemana: '2026-09-29' },
    ]);
    assert.equal(diaColetaNaSemana(t, '2026-08-25'), 3);
    assert.equal(diaColetaNaSemana(t, '2026-09-22'), 4);
    assert.equal(diaColetaNaSemana(t, '2026-09-29'), 5);
  });

  test('o acompanhamento mantém as quintas de antes e passa a Marina para a sexta', () => {
    const trocados = NA_QUINTA.map((c) => (c.id === 'marina' ? trocarDiaColeta(c, 5, QUARTA) : c));
    const producoes: ProducaoDoApp[] = [];
    for (let d = '2026-09-17'; d <= '2026-10-06'; d = somarDias(d, 1)) producoes.push({ data: d, lactantes: 67, litros1: 100, litros2: 60 });
    const saidas = [
      { data: '2026-09-24', litros: 300, destinos: ['Leite Chaparral'] },
      { data: '2026-10-02', litros: 450, destinos: ['Leite Chaparral'] },
    ];
    const coletas = montarColetas(ordenhasDoApp(producoes), saidas, trocados, 1300, '2026-10-07');
    const daMarina = coletas.filter((c) => c.compradorId === 'marina').map((c) => c.data);
    assert.deepEqual(daMarina, ['2026-09-17', '2026-09-24', '2026-10-02', '2026-10-09']); // nenhuma em 01/10

    const quinta = coletas.find((c) => c.compradorId === 'marina' && c.data === '2026-09-24')!;
    assert.equal(quinta.ordenhasEsperadas, 4);
    assert.equal(quinta.saidaNoApp, 300);
    // A Rose de 29/09 ainda leva da quinta à terça (10 ordenhas)…
    assert.deepEqual(coletas.find((c) => c.data === '2026-09-29')!.desde, { data: '2026-09-24', turno: 2 });
    // …a primeira sexta leva da tarde de terça à manhã de sexta (6)…
    const sexta = coletas.find((c) => c.data === '2026-10-02')!;
    assert.deepEqual(sexta.desde, { data: '2026-09-29', turno: 2 });
    assert.equal(sexta.ordenhasEsperadas, 6);
    assert.equal(sexta.saidaNoApp, 450);
    // …e a Rose de 06/10 fica com a tarde de sexta até a manhã de terça (8).
    const rose = coletas.find((c) => c.data === '2026-10-06')!;
    assert.deepEqual(rose.desde, { data: '2026-10-02', turno: 2 });
    assert.equal(rose.ordenhasEsperadas, 8);
  });

  test('a troca salva volta do jsonb; entrada torta é descartada', () => {
    const n = normalizarParametros(
      {
        compradores: [
          {
            ...marina,
            diaColeta: 5,
            diasAnteriores: [{ dia: 4, ateSemana: '2026-09-29' }, { dia: 4, ateSemana: '29/09' }, null, { dia: 9, ateSemana: '2026-10-01' }],
          },
        ],
      },
      params(),
    );
    // A data vira a terça da semana; o dia vai para a faixa 0–6.
    assert.deepEqual(n.compradores[0].diasAnteriores, [
      { dia: 4, ateSemana: '2026-09-29' },
      { dia: 6, ateSemana: '2026-09-29' },
    ]);
    assert.equal('diasAnteriores' in normalizarParametros({ compradores: [marina] }, params()).compradores[0], false);
  });
});
