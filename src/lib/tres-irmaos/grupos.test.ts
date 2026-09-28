import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { calcularGrupos, GRUPOS_PADRAO, normalizarGrupos, type ParametrosGrupos } from '@/lib/tres-irmaos/grupos';

const perto = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);
const com = (extra: Partial<ParametrosGrupos>) => calcularGrupos({ ...GRUPOS_PADRAO, ...extra });

describe('grupos reprodutivos — conta exata (sem falha, sem descarte, cobertura contínua)', () => {
  const r = com({ prenhez: 1, reposicaoAnual: 0, intervaloGrupos: 90, duracaoEstacao: 90, diasPosParto: 210, metaLactantes: 70 });

  test('parto a cada 360 dias (210 + 150) e 300 de lactação (360 − 60 de seca)', () => {
    perto(r.intervaloPartos, 360, 0.5);
    perto(r.diasLactacao, 300, 0.5);
  });

  test('70 lactantes pedem 84 matrizes (70 ÷ 300/360), sem oscilar', () => {
    perto(r.fracaoLactacao, 300 / 360, 0.002);
    perto(r.matrizes, 84, 0.3);
    perto(r.lactantes.min, 70, 0.5);
    perto(r.lactantes.max, 70, 0.5);
  });

  test('4 grupos iguais no ano', () => {
    assert.equal(r.grupos.length, 4);
    for (const g of r.grupos) perto(g.coberturas, 21, 0.3);
  });
});

describe('grupos reprodutivos — padrão (90 d, estação 45 d, 210 d pós-parto, 95%)', () => {
  const r = com({});

  test('a meta é a MÉDIA de lactantes; a oscilação vem da seca de cada grupo', () => {
    perto(r.lactantes.media, 70, 0.01);
    assert.ok(r.lactantes.min < 70 && r.lactantes.max > 70);
  });

  test('os grupos saem do mesmo tamanho e as vazias passam ao seguinte', () => {
    assert.equal(r.grupos.length, 4);
    const tam = r.grupos.map((g) => g.coberturas);
    perto(Math.max(...tam), Math.min(...tam), 1);
    for (const g of r.grupos) perto(g.prenhes, g.coberturas * 0.95, 1e-6);
  });

  test('crias: prolificidade × fêmeas × (1 − mortalidade); o que passa da reposição é excedente', () => {
    perto(r.cabritasNascidasAno, r.partosAno * 1.5 * 0.5, 1e-6);
    perto(r.reposicaoAno, r.matrizes * 0.2, 1e-6);
    perto(r.excedenteCabritasAno, r.cabritasVivasAno - r.reposicaoAno, 1e-6);
  });

  test('rebanho total = matrizes + recria + excedentes e machos até saírem + reprodutores', () => {
    perto(r.recria, r.reposicaoAno * (7 / 12), 1e-6);
    perto(r.total, r.matrizes + r.recria + r.cabritasExcedentes + r.cabritosMachos + r.reprodutores, 1e-6);
    assert.equal(r.reprodutores, Math.ceil(r.matrizes / 25));
    perto(r.pctLactacao, 70 / r.total, 1e-6);
  });
});

describe('grupos reprodutivos — parâmetros mudam o resultado como deveriam', () => {
  test('grupos a cada 30 dias deixam a produção mais homogênea que a cada 90', () => {
    const g90 = com({});
    const g30 = com({ intervaloGrupos: 30, duracaoEstacao: 30 });
    assert.equal(g30.grupos.length, 12);
    assert.ok(g30.lactantes.max - g30.lactantes.min < g90.lactantes.max - g90.lactantes.min);
  });

  test('cobrir mais cedo encurta o intervalo de partos e a lactação', () => {
    const cedo = com({ diasPosParto: 60 });
    assert.ok(cedo.intervaloPartos < 250);
    assert.ok(cedo.partosAno > com({}).partosAno);
  });

  test('prenhez menor pede mais matrizes para a mesma meta', () => {
    assert.ok(com({ prenhez: 0.7 }).matrizes > com({ prenhez: 0.95 }).matrizes);
  });

  test('mortalidade reduz as cabritas vivas e o excedente', () => {
    const r = com({ mortalidade: 0.15 });
    perto(r.cabritasVivasAno, r.cabritasNascidasAno * 0.85, 1e-6);
    assert.ok(r.excedenteCabritasAno < com({}).excedenteCabritasAno);
  });

  test('avisa quando as cabritas não repõem o descarte', () => {
    const r = com({ prolificidade: 0.3, reposicaoAnual: 0.4 });
    assert.ok(r.alertas.some((a) => a.includes('não repõem')));
  });
});

describe('normalizarGrupos', () => {
  test('lixo vira padrão; fora da faixa vai para o limite; estação não passa do intervalo', () => {
    assert.deepEqual(normalizarGrupos(null), GRUPOS_PADRAO);
    const n = normalizarGrupos({ prenhez: 3, intervaloGrupos: 30, duracaoEstacao: 45, diasPosParto: 'x' });
    assert.equal(n.prenhez, 1);
    assert.equal(n.duracaoEstacao, 30);
    assert.equal(n.diasPosParto, 210);
  });
});
