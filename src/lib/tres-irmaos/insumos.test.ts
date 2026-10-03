import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  calcularPedido,
  montarCategorias,
  DIAS_MAX,
  DIAS_MIN,
  DIAS_PADRAO,
  limitarDias,
  type DietaCategoria,
  type InsumoApp,
} from '@/lib/tres-irmaos/insumos';

const perto = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);

/** Catálogo do Lucas em 03/10/2026 (propriedade 262 do app). */
const INSUMOS: InsumoApp[] = [
  { id: 91, nome: 'Caroço de algodão', grupo: 'concentrado', unidade: 'kg', valorUnitario: 2.4725, ativo: true },
  { id: 97, nome: 'Farelo de soja', grupo: 'concentrado', unidade: 'kg', valorUnitario: 2.6, ativo: true },
  { id: 101, nome: 'Fubá', grupo: 'concentrado', unidade: 'kg', valorUnitario: 1.6, ativo: true },
  { id: 103, nome: 'Núcleo leite', grupo: 'concentrado', unidade: 'kg', valorUnitario: 7.8825, ativo: true },
  { id: 115, nome: 'Sal mineral leite', grupo: 'sal_mineral', unidade: 'kg', valorUnitario: 9.2, ativo: true },
  { id: 148, nome: 'Silagem de milho', grupo: 'volumoso', unidade: 'kg', valorUnitario: 0.3, ativo: true },
  { id: 120, nome: 'Sal mineral recria', grupo: 'concentrado', unidade: 'kg', valorUnitario: null, ativo: false },
];

const semSal = { concentrado: 0, volumoso: 0, sal_mineral: 0 };

/** Lactante do app: 1,2 kg de concentrado, 3,85 de silagem, 0,1 de sal. */
const LACTANTE: DietaCategoria = {
  categoria: 'lactante',
  animais: 72,
  porCabeca: { concentrado: 1.2, volumoso: 3.85, sal_mineral: 0.1 },
  formulacao: [
    { insumoId: 91, proporcao: 0.06 },
    { insumoId: 97, proporcao: 0.5 },
    { insumoId: 101, proporcao: 0.4 },
    { insumoId: 103, proporcao: 0.02 },
    { insumoId: 115, proporcao: 1 },
    { insumoId: 148, proporcao: 1 },
  ],
  semDieta: false,
};

const pedido = (categorias: DietaCategoria[], dias = 30) => calcularPedido({ dias, categorias, insumos: INSUMOS });

describe('limites do período', () => {
  test('7 dias é o mínimo e 365 o máximo', () => {
    assert.equal(limitarDias(1), DIAS_MIN);
    assert.equal(limitarDias(7), 7);
    assert.equal(limitarDias(400), DIAS_MAX);
    assert.equal(limitarDias(365), 365);
  });

  test('vazio, texto ou negativo cai no padrão', () => {
    assert.equal(limitarDias(undefined), DIAS_PADRAO);
    assert.equal(limitarDias('abc'), DIAS_PADRAO);
    assert.equal(limitarDias(-10), DIAS_MIN);
  });

  test('o próprio cálculo trava o período', () => {
    assert.equal(pedido([LACTANTE], 1).dias, DIAS_MIN);
    assert.equal(pedido([LACTANTE], 9999).dias, DIAS_MAX);
  });
});

describe('uma categoria, formulação fechada', () => {
  // Formulação só com o que soma 100%: silagem (volumoso) e sal (sal mineral).
  const cat: DietaCategoria = {
    categoria: 'seca',
    animais: 35,
    porCabeca: { concentrado: 0, volumoso: 2.85, sal_mineral: 0.1 },
    formulacao: [
      { insumoId: 148, proporcao: 1 },
      { insumoId: 115, proporcao: 1 },
    ],
    semDieta: false,
  };
  const r = pedido([cat], 30);

  test('o total por dia é cabeças × kg/cabeça/dia', () => {
    perto(r.kgDia, 35 * (2.85 + 0.1), 1e-9);
    perto(r.kgDiaConsumo, r.kgDia, 1e-9, 'tudo atribuído: consumo e pedido batem');
  });

  test('o período multiplica os dias', () => {
    perto(r.kgPeriodo, 35 * 2.95 * 30, 1e-9);
    const silagem = r.itens.find((i) => i.nome === 'Silagem de milho')!;
    perto(silagem.kgPeriodo, 35 * 2.85 * 30, 1e-9);
  });

  test('o custo usa o preço do app', () => {
    perto(r.custoPeriodo, (35 * 2.85 * 0.3 + 35 * 0.1 * 9.2) * 30, 1e-6);
    assert.equal(r.custoParcial, false);
  });

  test('sem aviso quando tudo fecha', () => {
    assert.deepEqual(r.avisos, []);
  });
});

describe('a formulação divide o kg do grupo entre os insumos', () => {
  const r = pedido([LACTANTE], 7);
  const concentradoDia = 72 * 1.2;

  test('cada insumo leva a sua proporção, rateada pela soma do grupo (98% na lactante)', () => {
    const soma = 0.06 + 0.5 + 0.4 + 0.02;
    const fubá = r.itens.find((i) => i.nome === 'Fubá')!;
    perto(fubá.kgDia, concentradoDia * (0.4 / soma), 1e-9);
    const núcleo = r.itens.find((i) => i.nome === 'Núcleo leite')!;
    perto(núcleo.kgDia, concentradoDia * (0.02 / soma), 1e-9);
  });

  test('o concentrado dos insumos soma exatamente o que o app manda dar', () => {
    const doGrupo = r.itens.filter((i) => i.grupo === 'concentrado');
    perto(doGrupo.reduce((t, i) => t + i.kgDia, 0), concentradoDia, 1e-9);
    perto(r.grupos.find((g) => g.grupo === 'concentrado')!.kgDia, concentradoDia, 1e-9);
  });

  test('avisa que a formulação não fecha 100%', () => {
    assert.equal(r.avisos.length, 1);
    assert.match(r.avisos[0], /lactante.*concentrado somam 98%/);
  });

  test('o rebanho todo: 72 lactantes comem 377,6 kg/dia', () => {
    perto(r.kgDia, 72 * (1.2 + 3.85 + 0.1), 1e-9);
    assert.equal(r.animais, 72);
  });
});

describe('insumo sem preço e inativo (o "Sal mineral recria" do app)', () => {
  // Como está no app em 03/10/2026: o sal da recria entrou como concentrado,
  // e com ele a soma do grupo dá 200%.
  const recriada: DietaCategoria = {
    categoria: 'recriada',
    animais: 4,
    porCabeca: { concentrado: 0.6, volumoso: 0.6, sal_mineral: 0.01 },
    formulacao: [
      { insumoId: 101, proporcao: 0.75 },
      { insumoId: 97, proporcao: 0.25 },
      { insumoId: 120, proporcao: 1 },
      { insumoId: 148, proporcao: 1 },
    ],
    semDieta: false,
  };
  const r = pedido([recriada], 30);

  test('o concentrado continua sendo 0,6 kg/cab/dia, rateado entre os três', () => {
    perto(r.grupos.find((g) => g.grupo === 'concentrado')!.kgDia, 4 * 0.6, 1e-9);
    perto(r.itens.find((i) => i.nome === 'Sal mineral recria')!.kgDia, 4 * 0.6 * 0.5, 1e-9);
  });

  test('sem preço: entra em kg, fica fora do custo, e o custo é parcial', () => {
    const sal = r.itens.find((i) => i.nome === 'Sal mineral recria')!;
    assert.equal(sal.custoPeriodo, null);
    assert.ok(sal.kgPeriodo > 0);
    assert.equal(r.custoParcial, true);
    assert.equal(r.categorias[0].custoParcial, true);
  });

  test('o sal mineral de 0,01 kg/cab/dia não tem insumo do grupo: fica fora e avisa', () => {
    perto(r.grupos.find((g) => g.grupo === 'sal_mineral')!.semInsumoKgDia, 0.04, 1e-9);
    perto(r.kgDiaConsumo - r.kgDia, 0.04, 1e-9);
    assert.ok(r.avisos.some((a) => /recriada.*sal mineral.*fora do pedido/.test(a)));
  });

  test('avisa o preço faltando e o insumo inativo', () => {
    assert.ok(r.avisos.some((a) => /Sem preço no app: Sal mineral recria/.test(a)));
    assert.ok(r.avisos.some((a) => /inativo no app.*Sal mineral recria/.test(a)));
  });
});

describe('o rebanho inteiro soma por insumo', () => {
  const preParto: DietaCategoria = {
    categoria: 'pre-parto',
    animais: 11,
    porCabeca: { concentrado: 1.2, volumoso: 2.7, sal_mineral: 0 },
    formulacao: [
      { insumoId: 101, proporcao: 0.8333 },
      { insumoId: 97, proporcao: 0.1667 },
      { insumoId: 148, proporcao: 1 },
    ],
    semDieta: false,
  };
  const r = pedido([LACTANTE, preParto], 30);

  test('a silagem junta as duas categorias', () => {
    const silagem = r.itens.find((i) => i.nome === 'Silagem de milho')!;
    perto(silagem.kgDia, 72 * 3.85 + 11 * 2.7, 1e-9);
    assert.deepEqual(
      silagem.porCategoria.map((x) => x.categoria),
      ['lactante', 'pre-parto'],
      'a maior parte primeiro',
    );
  });

  test('o fubá some das duas formulações, cada uma com a sua proporção', () => {
    const fubá = r.itens.find((i) => i.nome === 'Fubá')!;
    perto(fubá.kgDia, 72 * 1.2 * (0.4 / 0.98) + 11 * 1.2 * 0.8333, 1e-6);
  });

  test('os totais fecham com a soma dos itens', () => {
    perto(r.kgDia, r.itens.reduce((t, i) => t + i.kgDia, 0), 1e-9);
    perto(r.kgPeriodo, r.kgDia * 30, 1e-9);
    perto(r.custoPeriodo, r.custoDia * 30, 1e-9);
    perto(r.custoDia, r.categorias.reduce((t, c) => t + c.custoDia, 0), 1e-9);
  });

  test('as categorias vêm da que come mais para a que come menos', () => {
    assert.deepEqual(r.categorias.map((c) => c.categoria), ['lactante', 'pre-parto']);
  });
});

describe('o rebanho do Lucas em 03/10/2026, pedido de 1 ano', () => {
  // As 6 categorias ativas da propriedade 262, com a dieta como está no app.
  const REBANHO: DietaCategoria[] = [
    LACTANTE,
    {
      categoria: 'seca',
      animais: 35,
      porCabeca: { concentrado: 0.2, volumoso: 2.85, sal_mineral: 0.1 },
      formulacao: [
        { insumoId: 101, proporcao: 0.5 },
        { insumoId: 97, proporcao: 0.5 },
        { insumoId: 148, proporcao: 1 },
        { insumoId: 115, proporcao: 1 },
      ],
      semDieta: false,
    },
    {
      categoria: 'pre-parto',
      animais: 11,
      porCabeca: { concentrado: 1.2, volumoso: 2.7, sal_mineral: 0 },
      formulacao: [
        { insumoId: 101, proporcao: 0.8333 },
        { insumoId: 97, proporcao: 0.1667 },
        { insumoId: 148, proporcao: 1 },
      ],
      semDieta: false,
    },
    {
      categoria: 'reprodutor',
      animais: 5,
      porCabeca: { concentrado: 0.3, volumoso: 0.3, sal_mineral: 0.1 },
      formulacao: [
        { insumoId: 97, proporcao: 0.75 },
        { insumoId: 101, proporcao: 0.25 },
        { insumoId: 148, proporcao: 1 },
        { insumoId: 115, proporcao: 1 },
      ],
      semDieta: false,
    },
    {
      categoria: 'recriada',
      animais: 4,
      porCabeca: { concentrado: 0.6, volumoso: 0.6, sal_mineral: 0.01 },
      formulacao: [
        { insumoId: 101, proporcao: 0.75 },
        { insumoId: 97, proporcao: 0.25 },
        { insumoId: 120, proporcao: 1 },
        { insumoId: 148, proporcao: 1 },
      ],
      semDieta: false,
    },
    {
      categoria: 'recria',
      animais: 3,
      porCabeca: { concentrado: 0.6, volumoso: 0.6, sal_mineral: 0.1 },
      formulacao: [
        { insumoId: 97, proporcao: 0.75 },
        { insumoId: 101, proporcao: 0.25 },
        { insumoId: 148, proporcao: 1 },
        { insumoId: 115, proporcao: 1 },
      ],
      semDieta: false,
    },
  ];

  const r = pedido(REBANHO, 365);

  test('130 animais comem 536 kg/dia, 195,6 t no ano', () => {
    assert.equal(r.animais, 130);
    perto(r.kgDiaConsumo, 536, 0.5);
    perto(r.kgPeriodo, 536 * 365, 500);
  });

  test('a silagem é o volume do pedido: 412,3 kg/dia', () => {
    const silagem = r.itens.find((i) => i.nome === 'Silagem de milho')!;
    perto(silagem.kgDia, 72 * 3.85 + 35 * 2.85 + 11 * 2.7 + 5 * 0.3 + 4 * 0.6 + 3 * 0.6, 1e-6);
    perto(silagem.kgPeriodo, silagem.kgDia * 365, 1e-6);
  });

  test('o concentrado do pedido fecha com o que o app manda dar', () => {
    const doApp = 72 * 1.2 + 35 * 0.2 + 11 * 1.2 + 5 * 0.3 + 4 * 0.6 + 3 * 0.6;
    perto(r.grupos.find((g) => g.grupo === 'concentrado')!.kgDia, doApp, 1e-6);
  });

  test('o pedido sai na ordem: concentrado, volumoso, sal mineral', () => {
    assert.deepEqual([...new Set(r.itens.map((i) => i.grupo))], ['concentrado', 'volumoso', 'sal_mineral']);
  });

  test('o custo do ano sai do preço de cada insumo', () => {
    perto(r.custoPeriodo, r.itens.reduce((t, i) => t + (i.custoPeriodo ?? 0), 0), 1e-6);
    assert.equal(r.custoParcial, true, 'o sal da recria está sem preço no app');
  });
});

describe('juntar a dieta do app com o efetivo', () => {
  const dietas = [
    { categoria: 'lactante', porCabeca: { concentrado: 1.2, volumoso: 3.85, sal_mineral: 0.1 }, formulacao: [{ insumoId: 148, proporcao: 1 }] },
    { categoria: 'recria', porCabeca: { concentrado: 0.6, volumoso: 0.6, sal_mineral: 0.1 }, formulacao: [] },
  ];

  test('cada categoria leva as suas cabeças, da maior para a menor', () => {
    const r = montarCategorias(dietas, { lactante: 72, recria: 3 });
    assert.deepEqual(r.map((c) => [c.categoria, c.animais]), [['lactante', 72], ['recria', 3]]);
    assert.equal(r[0].porCabeca.volumoso, 3.85);
  });

  test('categoria com animais e sem dieta entra marcada', () => {
    const r = montarCategorias(dietas, { lactante: 72, cabrita: 8 });
    const cabrita = r.find((c) => c.categoria === 'cabrita')!;
    assert.equal(cabrita.semDieta, true);
    assert.equal(cabrita.animais, 8);
    assert.deepEqual(cabrita.porCabeca, { concentrado: 0, volumoso: 0, sal_mineral: 0 });
  });

  test('categoria com dieta e sem animal fica com zero (dá para simular)', () => {
    const r = montarCategorias(dietas, { lactante: 72 });
    assert.equal(r.find((c) => c.categoria === 'recria')!.animais, 0);
  });

  test('sêmen e embrião não comem: ficam fora', () => {
    const r = montarCategorias(dietas, { lactante: 72, semen: 40, embriao: 5 });
    assert.deepEqual(r.map((c) => c.categoria).sort(), ['lactante', 'recria']);
  });
});

describe('casos de borda', () => {
  test('categoria sem dieta cadastrada avisa e não soma nada', () => {
    const r = pedido([{ categoria: 'cria', animais: 9, porCabeca: { ...semSal }, formulacao: [], semDieta: true }]);
    assert.equal(r.kgDia, 0);
    assert.ok(r.avisos.some((a) => /cria: 9 animais sem dieta cadastrada/.test(a)));
  });

  test('categoria com dieta e zero animais não avisa nada', () => {
    const r = pedido([{ ...LACTANTE, animais: 0 }]);
    assert.equal(r.kgDia, 0);
    assert.deepEqual(r.avisos, []);
  });

  test('insumo citado na formulação que não está no catálogo é ignorado', () => {
    const r = pedido([
      {
        categoria: 'seca',
        animais: 10,
        porCabeca: { concentrado: 1, volumoso: 0, sal_mineral: 0 },
        formulacao: [
          { insumoId: 101, proporcao: 0.5 },
          { insumoId: 999, proporcao: 0.5 },
        ],
        semDieta: false,
      },
    ]);
    // Os 10 kg/dia de concentrado vão todos para o fubá: a metade do insumo
    // que não existe no catálogo não sai do grupo.
    perto(r.itens.find((i) => i.nome === 'Fubá')!.kgDia, 10, 1e-9);
    assert.equal(r.itens.length, 1);
  });

  test('número torto no app (negativo, NaN) conta como zero', () => {
    const r = pedido([
      {
        categoria: 'seca',
        animais: 10,
        porCabeca: { concentrado: -1, volumoso: Number.NaN, sal_mineral: 0.1 },
        formulacao: [{ insumoId: 115, proporcao: 1 }],
        semDieta: false,
      },
    ]);
    perto(r.kgDia, 1, 1e-9);
  });
});
