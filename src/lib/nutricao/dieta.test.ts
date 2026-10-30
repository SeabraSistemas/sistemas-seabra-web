import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { aplicarEdicoes, avisosDoAlimento, bancoOriginal, SEM_EDICOES } from '@/lib/nutricao/alimentos';
import { avaliar, compararComExigencia, TOLERANCIA_FORMULADOR } from '@/lib/nutricao/comparacao';
import { custoDoInsumo, maisBarato } from '@/lib/nutricao/comparador';
import { calcularDieta, faixaCaP, formulaDoConcentrado } from '@/lib/nutricao/dieta';
import { categoriaPorId, exigenciaDoFormulador } from '@/lib/nutricao/formulador';

const perto = (a: number, b: number, tol = 1e-9, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);
const banco = bancoOriginal();

/**
 * Dieta de exemplo conferida à mão (valores do banco do formulador):
 *   volumoso   : silagem de milho 3,0 kg MN   (MS 30,92%; PB 7,26%; NDT 64,27%; FDN 55,41%; R$ 0,09/kg)
 *   concentrado: fubá 0,4 kg MN                (MS 88%;    PB 10%;   NDT 85%;    R$ 1,12/kg)
 *                farelo de soja 0,3 kg MN      (MS 88,6%;  PB 49%;   NDT 84%;    R$ 1,28/kg)
 */
const EXEMPLO = {
  pasto: null,
  volumosos: [{ alimentoId: 'silagem-de-milho', kgMn: 3 }],
  concentrado: [
    { alimentoId: 'milho-moido-fuba', kgMn: 0.4 },
    { alimentoId: 'farelo-de-soja', kgMn: 0.3 },
  ],
};

describe('balanço da dieta — exemplo conferido à mão', () => {
  const r = calcularDieta(EXEMPLO, banco);

  test('matéria seca: 0,9276 + 0,352 + 0,2658 = 1,5454 kg', () => {
    perto(r.volumoso.kgMs, 3 * 0.3092);
    perto(r.concentrado.kgMs, 0.352 + 0.2658);
    perto(r.total.kgMs, 1.5454);
    perto(r.total.kgMn, 3.7);
  });

  test('nutrientes: PB 0,23278576 kg (15,06% da MS) e NDT 1,11864052 kg (72,39% da MS)', () => {
    perto(r.total.kg.pb, 0.06734376 + 0.0352 + 0.130242);
    perto(r.total.kg.pb, 0.23278576);
    perto(r.total.kg.ndt, 0.59616852 + 0.2992 + 0.223272);
    perto(r.total.kg.ndt, 1.11864052);
    perto(r.total.conc.pb ?? 0, 0.23278576 / 1.5454);
    perto(r.total.conc.pb ?? 0, 0.1506, 0.0001);
    perto(r.total.conc.ndt ?? 0, 0.7239, 0.0001);
  });

  test('concentrado em base de MATÉRIA SECA (defeito 2): PB 26,78%, não 23,64% (÷ matéria natural)', () => {
    perto(r.concentrado.conc.pb ?? 0, 0.165442 / 0.6178);
    perto(r.concentrado.conc.pb ?? 0, 0.2678, 0.0001);
    assert.ok(Math.abs((r.concentrado.conc.pb ?? 0) - 0.165442 / 0.7) > 0.03);
  });

  test('custo: R$ 1,102/dia; R$ 0,2978/kg da dieta; R$ 1,1886/kg do concentrado; R$ 0,09/kg do volumoso', () => {
    perto(r.total.custoDia, 0.27 + 0.448 + 0.384);
    perto(r.total.custoDia, 1.102);
    perto(r.total.custoKgMn ?? 0, 1.102 / 3.7);
    perto(r.concentrado.custoKgMn ?? 0, 0.832 / 0.7);
    perto(r.volumoso.custoKgMn ?? 0, 0.09);
    perto(r.total.custoKgMs ?? 0, 1.102 / 1.5454);
    assert.equal(r.total.custoCompleto, true);
  });

  test('% de cada ingrediente e fórmula do concentrado para um lote de 100 kg', () => {
    const fubá = r.linhas.find((l) => l.alimento.id === 'milho-moido-fuba');
    perto(fubá?.pctMn ?? 0, (0.4 / 3.7) * 100);
    perto(fubá?.pctConcentradoMn ?? 0, (0.4 / 0.7) * 100);
    const lote = formulaDoConcentrado(r, 100);
    perto(lote.reduce((s, i) => s + i.kgMn, 0), 100);
    perto(lote.find((i) => i.alimento.id === 'milho-moido-fuba')?.kgMn ?? 0, 57.142857142857, 1e-9);
    perto(lote.find((i) => i.alimento.id === 'farelo-de-soja')?.kgMn ?? 0, 42.857142857142, 1e-9);
  });

  test('Ca:P: Ca 0,0027828+0,0000704+0,00090372 ÷ P 0,00176244+0,001232+0,00154164', () => {
    const ca = 0.0027828 + 0.0000704 + 0.00090372;
    const p = 0.00176244 + 0.001232 + 0.00154164;
    perto(r.caP?.razao ?? 0, ca / p, 1e-9);
    assert.equal(r.caP?.faixa, 0); // 0,00375692 ÷ 0,00453608 = 0,83: abaixo de 1,95
  });
});

describe('correção do defeito 1 — pasto e os 3 volumosos entram no volumoso', () => {
  const r = calcularDieta(
    {
      pasto: { alimentoId: 'pastagem-media', kgMn: 5 },
      volumosos: [
        { alimentoId: 'silagem-de-milho', kgMn: 2 },
        { alimentoId: 'feno-napier', kgMn: 1 },
        { alimentoId: 'napier-verde-picado', kgMn: 3 },
      ],
      concentrado: [{ alimentoId: 'milho-moido-fuba', kgMn: 0.5 }],
    },
    banco,
  );

  test('o 3º volumoso conta no total, no FDN e no custo do volumoso', () => {
    perto(r.volumoso.kgMn, 5 + 2 + 1 + 3);
    perto(r.volumoso.kgMs, 5 * 0.25 + 2 * 0.3092 + 1 * 0.9 + 3 * 0.2);
    const fdn = 1.25 * 0.65 + 0.6184 * 0.5541 + 0.9 * 0.77 + 0.6 * 0.7;
    perto(r.volumoso.kg.fdn, fdn);
    perto(r.fdnVolumosoPctMs ?? 0, fdn / 3.3684);
    // pasto R$ 0,00; silagem 2×0,09; feno 1×0,01; napier verde 3×0,01
    perto(r.volumoso.custoDia, 0.18 + 0.01 + 0.03);
    perto(r.volumoso.custoKgMn ?? 0, 0.22 / 11);
  });

  test('FDN do volumoso (% da MS dele) ≠ parte do FDN da dieta que vem do volumoso (defeito 3)', () => {
    assert.ok((r.fdnVolumosoPctMs ?? 0) > 0.5 && (r.fdnVolumosoPctMs ?? 0) < 1);
    const frac = r.fdnDaDietaVemDoVolumoso ?? 0;
    assert.ok(frac > 0.9 && frac < 1); // quase todo o FDN vem do volumoso; o fubá tem um pouco
    assert.notEqual(frac, r.fdnVolumosoPctMs);
  });
});

describe('dados faltando e avisos', () => {
  test('alimento sem matéria seca fica de fora, com aviso', () => {
    const r = calcularDieta({ pasto: null, volumosos: [], concentrado: [{ alimentoId: 'mineral-2', kgMn: 0.1 }, { alimentoId: 'milho-moido-fuba', kgMn: 1 }] }, banco);
    assert.equal(r.linhas.length, 1);
    assert.ok(r.avisos.some((a) => /Mineral 2/.test(a)));
  });

  test('item sem preço: custo marcado como incompleto, não zero silencioso', () => {
    const r = calcularDieta({ pasto: null, volumosos: [{ alimentoId: 'cana-de-acucar', kgMn: 4 }], concentrado: [{ alimentoId: 'milho-moido-fuba', kgMn: 1 }] }, banco);
    assert.equal(r.total.custoCompleto, false);
    perto(r.total.custoDia, 1.12);
    assert.ok(r.avisos.some((a) => /Sem preço: Cana de açúcar/.test(a)));
  });

  test('feno tifton: Ca e P ausentes contam como zero, com aviso', () => {
    const r = calcularDieta({ pasto: null, volumosos: [{ alimentoId: 'feno-tifton', kgMn: 2 }], concentrado: [] }, banco);
    assert.equal(r.total.kg.ca, 0);
    assert.ok(r.avisos.some((a) => /Feno tifton: sem .*CA.*P/.test(a)));
    assert.equal(r.caP, null);
  });

  test('quantidade zero, alimento vazio e dieta vazia não quebram', () => {
    const r = calcularDieta({ pasto: { alimentoId: '', kgMn: 0 }, volumosos: [{ alimentoId: 'silagem-de-milho', kgMn: 0 }], concentrado: [] }, banco);
    assert.equal(r.linhas.length, 0);
    assert.equal(r.total.kgMs, 0);
    assert.equal(r.total.conc.pb, null);
    assert.equal(r.total.custoKgMn, null);
    assert.equal(r.fdnVolumosoPctMs, null);
  });

  test('faixas do Ca:P: < 1,95 | 1,95–2,5 | 2,5–3 | > 3', () => {
    assert.deepEqual([1.949, 1.95, 2.49, 2.5, 3, 3.01].map(faixaCaP), [0, 1, 1, 2, 2, 3]);
  });

  test('valores suspeitos do banco aparecem com aviso (defeito 8)', () => {
    const aviso = (id: string) => avisosDoAlimento(banco.find((a) => a.id === id)!).map((a) => a.texto).join(' | ');
    assert.match(aviso('caroco-de-algodao'), /Amido \(88,0%\) maior que o CNF \(9,0%\)/);
    assert.match(aviso('milho-moido-fuba'), /Amido .* maior que o CNF/);
    assert.match(aviso('farelo-de-trigo'), /amido levemente maior/);
    assert.match(aviso('ureia'), /igual ao valor de PB/);
    assert.match(aviso('feno-napier'), /parece baixo/);
    assert.match(aviso('oleo-de-cozinha'), /passa de 100%/);
    assert.match(aviso('feno-tifton'), /Sem dado de .*Ca.*P/);
    assert.match(aviso('mineral-2'), /Sem matéria seca/);
    assert.equal(avisosDoAlimento(banco.find((a) => a.id === 'farelo-de-soja')!).filter((a) => a.nivel === 'erro').length, 0);
  });

  test('editar o banco troca só o campo editado e não mexe no original', () => {
    const editado = aplicarEdicoes({ alteracoes: { 'caroco-de-algodao': { amido: 0.088 } }, criados: [] });
    assert.equal(editado.find((a) => a.id === 'caroco-de-algodao')?.amido, 0.088);
    assert.equal(editado.find((a) => a.id === 'caroco-de-algodao')?.pb, 0.2262);
    assert.equal(banco.find((a) => a.id === 'caroco-de-algodao')?.amido, 0.88);
    assert.equal(aplicarEdicoes(SEM_EDICOES).length, 36);
  });
});

describe('comparação com a exigência e faixa verde', () => {
  const r = calcularDieta(EXEMPLO, banco);
  const lactacao = categoriaPorId('cabra-em-lactacao');

  test('categoria do formulador: lactação = NDT 65%, PB 16,21%, consumo 2,4 kg', () => {
    assert.ok(lactacao);
    const e = exigenciaDoFormulador(lactacao);
    assert.equal(e.cmsKg, 2.4);
    perto(e.ndt.frac ?? 0, 0.65);
    perto(e.pb.absoluto ?? 0, 0.1621 * 2.4 * 1000, 1e-9);
  });

  test('diferenças: PB da dieta 15,06% contra 16,21% = −1,15 ponto; consumo 1,5454 contra 2,4 = −0,8546 kg', () => {
    const linhas = compararComExigencia(r, exigenciaDoFormulador(lactacao!), TOLERANCIA_FORMULADOR);
    const pb = linhas.find((l) => l.chave === 'pb')!;
    perto((pb.diferenca ?? 0) * 100, (0.23278576 / 1.5454 - 0.1621) * 100);
    assert.equal(pb.status, 'abaixo');
    const cms = linhas.find((l) => l.chave === 'cms')!;
    perto(cms.diferenca ?? 0, 1.5454 - 2.4);
    assert.equal(cms.status, 'abaixo');
  });

  test('tolerância absoluta (±0,1 pp, formulador) × relativa (±5%)', () => {
    assert.equal(avaliar(0.1625, 0.1621, TOLERANCIA_FORMULADOR, 'fracao'), 'dentro');
    assert.equal(avaliar(0.1650, 0.1621, TOLERANCIA_FORMULADOR, 'fracao'), 'acima');
    assert.equal(avaliar(0.1650, 0.1621, { modo: 'relativa', pct: 5 }, 'fracao'), 'dentro');
    assert.equal(avaliar(0.155, 0.1621, { modo: 'relativa', pct: 5 }, 'fracao'), 'dentro'); // −4,4%
    assert.equal(avaliar(0.15, 0.1621, { modo: 'relativa', pct: 5 }, 'fracao'), 'abaixo'); // −7,5%
  });

  test('consumo de MS: ±0,2 kg (formulador) e ±5% relativa', () => {
    assert.equal(avaliar(2.55, 2.4, TOLERANCIA_FORMULADOR, 'consumo'), 'dentro'); // +0,15 kg
    assert.equal(avaliar(2.65, 2.4, TOLERANCIA_FORMULADOR, 'consumo'), 'acima'); // +0,25 kg
    assert.equal(avaliar(2.65, 2.4, { modo: 'relativa', pct: 10 }, 'consumo'), 'acima'); // +10,4%
    assert.equal(avaliar(2.55, 2.4, { modo: 'relativa', pct: 10 }, 'consumo'), 'dentro');
    assert.equal(avaliar(null, 2.4, TOLERANCIA_FORMULADOR, 'consumo'), 'sem-exigencia');
  });
});

describe('comparador de insumos', () => {
  test('farelo de soja: R$/kg MS = 1,28 ÷ 0,886; R$/kg PB = isso ÷ 0,49', () => {
    const soja = custoDoInsumo(banco.find((a) => a.id === 'farelo-de-soja')!);
    perto(soja.porKgMs ?? 0, 1.28 / 0.886);
    perto(soja.porKgNutriente.pb ?? 0, 1.28 / 0.886 / 0.49);
    perto(soja.porKgNutriente.pb ?? 0, 2.948, 0.001);
  });

  test('fubá: R$/kg MS 1,2727; R$/kg PB 12,73; R$/kg NDT 1,497 — o farelo de soja é mais barato na proteína, o fubá na energia', () => {
    const fuba = custoDoInsumo(banco.find((a) => a.id === 'milho-moido-fuba')!);
    const soja = custoDoInsumo(banco.find((a) => a.id === 'farelo-de-soja')!);
    perto(fuba.porKgMs ?? 0, 1.12 / 0.88);
    perto(fuba.porKgNutriente.pb ?? 0, 12.7272727, 1e-6);
    assert.equal(maisBarato(fuba.porKgNutriente.pb, soja.porKgNutriente.pb), 'b');
    // NDT: fubá 1,12/0,88/0,85 = 1,4973; soja 1,28/0,886/0,84 = 1,7199
    assert.equal(maisBarato(fuba.porKgNutriente.ndt, soja.porKgNutriente.ndt), 'a');
  });

  test('sem preço ou nutriente zerado: null, não infinito', () => {
    const cana = custoDoInsumo(banco.find((a) => a.id === 'cana-de-acucar')!);
    assert.equal(cana.porKgMs, null);
    const calcario = custoDoInsumo(banco.find((a) => a.id === 'calcario-calcitico')!);
    assert.equal(calcario.porKgNutriente.pb, null);
    assert.ok(calcario.porKgNutriente.ca != null);
    assert.equal(maisBarato(null, 1), null);
  });

  test('preço digitado no comparador substitui o do banco', () => {
    const soja = custoDoInsumo(banco.find((a) => a.id === 'farelo-de-soja')!, 2.0);
    perto(soja.porKgMs ?? 0, 2.0 / 0.886);
  });
});

describe('aviso da planilha depois da edição', () => {
  test('o aviso da fonte vira informação quando o produtor já editou o alimento', () => {
    const editado = aplicarEdicoes({ alteracoes: { 'caroco-de-algodao': { amido: 0.088 } }, criados: [] }).find((a) => a.id === 'caroco-de-algodao')!;
    const avisos = avisosDoAlimento(editado);
    assert.equal(avisos.filter((a) => a.nivel === 'erro' || a.nivel === 'aviso').some((a) => /amido/i.test(a.texto)), false);
    assert.ok(avisos.some((a) => a.nivel === 'info' && /já editou/.test(a.texto)));
  });
});
