import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { calcularGrupos, GRUPOS_PADRAO, normalizarGrupos, type ParametrosGrupos } from '@/lib/tres-irmaos/grupos';

const perto = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);
const com = (extra: Partial<ParametrosGrupos>) => calcularGrupos({ ...GRUPOS_PADRAO, ...extra });

describe('grupos reprodutivos — conta exata (sem falha, sem descarte, cobertura contínua)', () => {
  // Estação do tamanho do intervalo = cobertura contínua: a cabra é coberta exatamente aos 210 dias.
  const r = com({ prenhez: 1, reposicaoAnual: 0, intervaloMeses: 3, duracaoEstacao: 95, diasPosParto: 210, metaLactantes: 70 });

  test('parto a cada 360 dias (210 + 150) e 300 de lactação (360 − 60 de seca)', () => {
    perto(r.intervaloPartos, 360, 0.5);
    perto(r.diasLactacao, 300, 0.5);
  });

  test('70 lactantes pedem 84 matrizes (70 ÷ 300/360), quase sem oscilar', () => {
    perto(r.fracaoLactacao, 300 / 360, 0.003);
    perto(r.matrizes, 84, 0.3);
    // Trimestres de 90 a 92 dias e a abertura de cada grupo espalhada no ciclo estral:
    // sobra uma oscilação de ~2 a 3%.
    perto(r.lactantes.min, 70, 2.2);
    perto(r.lactantes.max, 70, 2.2);
  });

  test('4 grupos no ano, do tamanho de cada trimestre', () => {
    assert.equal(r.grupos.length, 4);
    for (const g of r.grupos) perto(g.coberturas, 21, 1.5);
  });
});

describe('grupos reprodutivos — padrão (a cada 3 meses, estação 45 d, 210 d pós-parto, 95%)', () => {
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
  test('grupos todo mês deixam a produção mais homogênea que de 3 em 3 meses', () => {
    const g3 = com({});
    const g1 = com({ intervaloMeses: 1, duracaoEstacao: 31 });
    assert.equal(g1.grupos.length, 12);
    assert.ok(g1.lactantes.max - g1.lactantes.min < g3.lactantes.max - g3.lactantes.min);
  });

  test('de 2 em 2 meses: 6 grupos', () => {
    assert.equal(com({ intervaloMeses: 2 }).grupos.length, 6);
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

describe('calendário por datas', () => {
  test('a cada 3 meses a partir de 01/10: out, jan, abr, jul — sem deriva de dias', () => {
    const r = com({ inicioPrimeiroGrupo: '2026-10-01', intervaloMeses: 3 });
    assert.deepEqual(
      r.grupos.map((g) => g.abre),
      [0, 92, 182, 273], // 01/10, 01/01, 01/04, 01/07
    );
    assert.equal(r.grupos[0].partoDe, 150); // 28/02/2027
  });

  test('quem espera a abertura é coberta ao longo de um ciclo estral (21 dias): os partos se espalham', () => {
    const r = com({ inicioPrimeiroGrupo: '2026-10-01' });
    for (const g of r.grupos) assert.ok(g.partoAte - g.partoDe >= 20, `grupo ${g.numero}: ${g.partoAte - g.partoDe} dias`);
  });

  test('meses que não casam com os dias pós-parto deixam os grupos desiguais, e a tela avisa', () => {
    const r = com({ inicioPrimeiroGrupo: '2026-10-01', calendario: 'meses', mesesCobertura: [3, 4, 5, 10] });
    assert.ok(r.alertas.some((a) => a.includes('desiguais')));
    assert.ok(!com({ inicioPrimeiroGrupo: '2026-10-01' }).alertas.some((a) => a.includes('desiguais')));
  });

  test('meses escolhidos: só março, abril e outubro → 3 grupos, a estação para na abertura seguinte', () => {
    const r = com({ inicioPrimeiroGrupo: '2027-03-01', calendario: 'meses', mesesCobertura: [3, 4, 10], duracaoEstacao: 45 });
    assert.deepEqual(r.grupos.map((g) => g.abre), [0, 31, 214]); // 01/03, 01/04, 01/10
    assert.ok(r.grupos[0].partoAte - r.grupos[0].partoDe <= 30); // março só tem até 31/03 antes de abrir abril
  });

  test('início que não é mês marcado: o 1º grupo é o próximo mês marcado', () => {
    const r = com({ inicioPrimeiroGrupo: '2026-11-01', calendario: 'meses', mesesCobertura: [1, 7] });
    assert.deepEqual(r.grupos.map((g) => g.abre), [61, 242]); // 01/01, 01/07
  });
});

describe('normalizarGrupos', () => {
  test('meses: só 1 a 12, sem repetir, ordenados; vazio volta ao padrão', () => {
    assert.deepEqual(normalizarGrupos({ mesesCobertura: [10, 3, 3, 13, 0, 4.5] }).mesesCobertura, [3, 10]);
    assert.deepEqual(normalizarGrupos({ mesesCobertura: [] }).mesesCobertura, [1, 4, 7, 10]);
  });

  test('salvo com o intervalo antigo em dias vira meses', () => {
    assert.equal(normalizarGrupos({ intervaloGrupos: 90 }).intervaloMeses, 3);
    assert.equal(normalizarGrupos({ intervaloGrupos: 60 }).intervaloMeses, 2);
  });

  test('data do 1º grupo: aaaa-mm-dd ou vazio', () => {
    assert.equal(normalizarGrupos({ inicioPrimeiroGrupo: '2026-10-01' }).inicioPrimeiroGrupo, '2026-10-01');
    assert.equal(normalizarGrupos({ inicioPrimeiroGrupo: '01/10/2026' }).inicioPrimeiroGrupo, '');
    assert.equal(normalizarGrupos({ inicioPrimeiroGrupo: 5 }).inicioPrimeiroGrupo, '');
  });

  test('lixo vira padrão; fora da faixa vai para o limite; estação não passa do intervalo', () => {
    assert.deepEqual(normalizarGrupos(null), GRUPOS_PADRAO);
    const n = normalizarGrupos({ prenhez: 3, calendario: 'outro', diasPosParto: 'x' });
    assert.equal(n.prenhez, 1);
    assert.equal(n.calendario, 'intervalo');
    assert.equal(n.diasPosParto, 210);
  });
});
