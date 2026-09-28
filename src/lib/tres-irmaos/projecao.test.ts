import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { agruparPorSemana, compradorDaSaida, lancamentosDoApp, type Lancamento } from '@/lib/tres-irmaos/acompanhamento';
import { inicioDaSemana, somarMeses } from '@/lib/tres-irmaos/datas';
import { distribuir, normalizarParametros, parametrosIniciais, projetar, type Parametros } from '@/lib/tres-irmaos/projecao';

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

describe('datas', () => {
  test('a semana começa na terça', () => {
    assert.equal(inicioDaSemana('2026-09-28'), '2026-09-22'); // segunda → terça anterior
    assert.equal(inicioDaSemana('2026-09-29'), '2026-09-29'); // terça é ela mesma
    assert.equal(inicioDaSemana('2026-10-01'), '2026-09-29'); // quinta (Marina)
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

describe('distribuir', () => {
  const compradores = parametrosIniciais({ lactantes: 0, mediaInicial: null, efetivo: {} }).compradores;

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

describe('acompanhamento', () => {
  const compradores = parametrosIniciais({ lactantes: 0, mediaInicial: null, efetivo: {} }).compradores;
  let id = 0;
  const l = (data: string, tipo: Lancamento['tipo'], litros: number, comprador: string | null = null): Lancamento => ({
    id: ++id,
    origem: 'site',
    data,
    tipo,
    comprador,
    litros,
    observacao: null,
    criado_por: null,
  });

  test('soma produção e coletas na semana de terça a segunda, mais recente primeiro', () => {
    const semanas = agruparPorSemana(
      [
        l('2026-09-29', 'coleta', 800, 'rose'),
        l('2026-10-01', 'coleta', 450, 'marina'),
        l('2026-09-29', 'producao', 180),
        l('2026-10-05', 'producao', 190), // segunda: ainda é a semana de 29/09
        l('2026-10-06', 'producao', 200), // terça: semana nova
      ],
      compradores,
      1300,
    );
    assert.equal(semanas.length, 2);
    assert.equal(semanas[0].inicio, '2026-10-06');
    const s = semanas[1];
    assert.equal(s.producao, 370);
    assert.equal(s.diasComProducao, 2);
    assert.equal(s.vendido, 1250);
    assert.equal(s.vendidoAcimaDoTeto, 0);
  });

  test('marca acima do teto e fora do combinado', () => {
    const [s] = agruparPorSemana(
      [l('2026-09-29', 'coleta', 850, 'rose'), l('2026-10-01', 'coleta', 520, 'marina')],
      compradores,
      1300,
    );
    assert.equal(s.vendidoAcimaDoTeto, 70);
    assert.equal(s.coletas[0].acimaDoMaximo, true);
    assert.equal(s.coletas[1].acimaDoMaximo, true);
  });

  test('coleta de comprador fora da lista continua somando', () => {
    const [s] = agruparPorSemana([l('2026-09-29', 'coleta', 100, 'antigo')], compradores, 1300);
    assert.equal(s.coletasOutros, 100);
    assert.deepEqual(s.destinosOutros, ['antigo']);
    assert.equal(s.vendido, 100);
  });

  test('saída do app vai para o comprador pelo destino (Leite Chaparral = Marina), sem diferenciar maiúscula', () => {
    assert.equal(compradorDaSaida(['Leite Rose'], compradores), 'rose');
    assert.equal(compradorDaSaida(['leite chaparral '], compradores), 'marina');
    assert.equal(compradorDaSaida(['Queijaria'], compradores), 'Queijaria');
    assert.equal(compradorDaSaida([], compradores), 'sem destino');
  });

  test('produção diária e saídas do app entram na semana como lançamentos só de leitura', () => {
    const doApp = lancamentosDoApp(
      [{ id: 7, data: '2026-08-25', lactantes: 44, litros: 110 }],
      [{ id: 3, data: '2026-08-25', litros: 650, destinos: ['Leite Rose'], observacao: null }],
      compradores,
    );
    assert.ok(doApp.every((x) => x.origem === 'app' && x.id < 0));
    assert.notEqual(doApp[0].id, doApp[1].id);
    const [s] = agruparPorSemana(doApp, compradores, 1300);
    assert.equal(s.inicio, '2026-08-25');
    assert.equal(s.producao, 110);
    assert.equal(s.coletas[0].litros, 650);
  });
});
