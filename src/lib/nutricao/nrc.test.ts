import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  KG_POR_LB,
  consultarNrc,
  degrauNdt,
  exigenciaDoNrc,
  fasesNrc,
  leiteEstimadoKg,
  niveisDaFase,
  seriesNrc,
  serieNrcPorId,
  sugerirNivelOrdenha,
} from '@/lib/nutricao/nrc';

const perto = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, msg ?? `${a} ≠ ${b} (±${tol})`);
const serie = (id: string) => {
  const s = serieNrcPorId(id);
  assert.ok(s, `série ${id} não existe`);
  return s;
};

describe('NRC 2007 (tabelas de Maryland)', () => {
  test('22 séries em 8 fases, pesos nominais (60 kg, não 59,9)', () => {
    assert.equal(seriesNrc().length, 22);
    assert.equal(fasesNrc().length, 8);
    assert.deepEqual(serie('mantenca/mantenca').linhas.map((l) => l.pesoKg), [20, 30, 40, 50, 60, 70, 80, 90]);
    assert.deepEqual(serie('bodes/mantenca').linhas.map((l) => l.pesoKg), [50, 75, 100, 125, 150]);
  });

  test('ponto exato — mantença, 60 kg (linha da tabela)', () => {
    const c = consultarNrc(serie('mantenca/mantenca'), 60);
    assert.equal(c.situacao, 'exato');
    assert.deepEqual(
      { cms: c.valores?.cmsKg, ndt: c.valores?.ndtKg, pb: c.valores?.pbG, ca: c.valores?.caG, p: c.valores?.pG, f: c.valores?.ndtFrac, pbf: c.valores?.pbFrac },
      { cms: 1.347, ndt: 0.718, pb: 89.8, ca: 2.39, p: 2.0, f: 0.533, pbf: 0.0667 },
    );
  });

  test('ponto exato — ordenha, meio da lactação, baixa produção, 60 kg', () => {
    const c = consultarNrc(serie('ordenha-meio/baixa-producao'), 60);
    assert.equal(c.situacao, 'exato');
    assert.deepEqual(
      { cms: c.valores?.cmsKg, ndt: c.valores?.ndtKg, pb: c.valores?.pbG, ca: c.valores?.caG, p: c.valores?.pG, f: c.valores?.ndtFrac, pbf: c.valores?.pbFrac },
      { cms: 2.994, ndt: 1.986, pb: 471.0, ca: 17.06, p: 10.28, f: 0.6633, pbf: 0.1573 },
    );
    assert.equal(c.valores?.degrau, 66);
  });

  test('ponto exato — ordenha, meio, média produção, 60 kg: 3,473 kg MS, NDT 66,37%, PB 16,41%', () => {
    const c = consultarNrc(serie('ordenha-meio/media-producao'), 60);
    assert.equal(c.situacao, 'exato');
    assert.equal(c.valores?.cmsKg, 3.473);
    assert.equal(c.valores?.ndtFrac, 0.6637);
    assert.equal(c.valores?.pbFrac, 0.1641);
  });

  test('ponto exato — bode 100 kg e gestação final, gêmeos, 90 kg', () => {
    assert.equal(consultarNrc(serie('bodes/pre-cobertura'), 100).valores?.cmsKg, 2.505);
    assert.equal(consultarNrc(serie('gestacao-final/2-crias'), 90).valores?.cmsKg, 2.784);
  });

  test('todos os pontos da tabela voltam exatos', () => {
    for (const s of seriesNrc()) {
      for (const l of s.linhas) {
        const c = consultarNrc(s, l.pesoKg);
        assert.equal(c.situacao, 'exato', `${s.id} ${l.pesoKg}`);
        assert.equal(c.valores?.cmsKg, l.cmsKg);
      }
    }
  });

  test('entre dois pontos do mesmo degrau: interpolação linear (mantença, 65 kg)', () => {
    const c = consultarNrc(serie('mantenca/mantenca'), 65);
    assert.equal(c.situacao, 'interpolado');
    perto(c.valores?.cmsKg ?? 0, (1.347 + 1.517) / 2, 1e-9);
    perto(c.valores?.ndtKg ?? 0, (0.718 + 0.798) / 2, 1e-9);
    perto(c.valores?.pbG ?? 0, (89.8 + 100.8) / 2, 1e-9);
    perto(c.valores?.caG ?? 0, (2.39 + 2.59) / 2, 1e-9);
  });

  test('interpolação com 25% do caminho (mantença, 62,5 kg)', () => {
    const c = consultarNrc(serie('mantenca/mantenca'), 62.5);
    perto(c.valores?.cmsKg ?? 0, 1.347 + 0.25 * (1.517 - 1.347), 1e-9);
  });

  test('NÃO interpola entre degraus: ordenha, meio, baixa, 65 kg (66% em 60 kg, 53% em 70 kg)', () => {
    const c = consultarNrc(serie('ordenha-meio/baixa-producao'), 65);
    assert.equal(c.situacao, 'troca-de-degrau');
    assert.equal(c.escolhido, 'abaixo');
    assert.equal(c.valores?.cmsKg, 2.994); // vale o ponto de 60 kg
    assert.equal(c.vizinhos?.abaixo.degrau, 66);
    assert.equal(c.vizinhos?.acima.degrau, 53);
    assert.equal(c.vizinhos?.acima.cmsKg, 4.121);
    assert.match(c.avisos[0], /troca de degrau/);
    const acima = consultarNrc(serie('ordenha-meio/baixa-producao'), 65, 'acima');
    assert.equal(acima.valores?.cmsKg, 4.121);
    assert.equal(acima.escolhido, 'acima');
  });

  test('fora da faixa de pesos: sem extrapolar', () => {
    const baixo = consultarNrc(serie('ordenha-meio/baixa-producao'), 45);
    assert.equal(baixo.situacao, 'fora-da-faixa');
    assert.equal(baixo.valores, null);
    assert.equal(consultarNrc(serie('ordenha-meio/baixa-producao'), 95).valores, null);
    assert.equal(consultarNrc(serie('mantenca/mantenca'), 15).valores, null);
    assert.equal(consultarNrc(serie('mantenca/mantenca'), Number.NaN).situacao, 'fora-da-faixa');
  });

  test('degraus de NDT: 53 / 66 / 80', () => {
    assert.equal(degrauNdt(0.5246), 53);
    assert.equal(degrauNdt(0.6552), 66);
    assert.equal(degrauNdt(0.7997), 80);
  });

  test('leite estimado da ordenha — 60 kg: meio/baixa ≈ 3,6 kg e meio/média ≈ 4,6 kg (documento)', () => {
    perto(leiteEstimadoKg(serie('ordenha-meio/baixa-producao'), 60) ?? 0, (7.3 + (10.1 - 7.3) * 0.25) * KG_POR_LB, 1e-9);
    perto(leiteEstimadoKg(serie('ordenha-meio/baixa-producao'), 60) ?? 0, 3.6, 0.05);
    perto(leiteEstimadoKg(serie('ordenha-meio/media-producao'), 60) ?? 0, 4.6, 0.05);
    assert.equal(leiteEstimadoKg(serie('mantenca/mantenca'), 60), null);
  });

  test('exigência normalizada: Ca e P viram fração da MS', () => {
    const e = exigenciaDoNrc(consultarNrc(serie('ordenha-meio/baixa-producao'), 60));
    perto(e.ca.frac ?? 0, 17.06 / 1000 / 2.994, 1e-12);
    assert.equal(e.pb.absoluto, 471.0);
    assert.equal(e.cmsKg, 2.994);
  });

  test('sugestão de nível pelo leite informado', () => {
    assert.equal(sugerirNivelOrdenha('ordenha-meio', 60, 3.6)?.nivel, 'Baixa produção');
    assert.equal(sugerirNivelOrdenha('ordenha-meio', 60, 4.6)?.nivel, 'Média produção');
    assert.equal(sugerirNivelOrdenha('ordenha-meio', 60, 0), null);
  });

  test('níveis por fase', () => {
    assert.equal(niveisDaFase('ordenha-meio').length, 3);
    assert.equal(niveisDaFase('mantenca').length, 2);
  });
});

describe('as três exigências lado a lado', () => {
  test('cabra de 60 kg, meio da lactação, 3 kg de leite: formulador × NRC × Rodrigues', async () => {
    const { calcularExigencias } = await import('@/lib/nutricao/exigencias');
    const r = calcularExigencias({
      pesoKg: 60,
      leiteKg: 3,
      categoriaId: 'cabra-em-lactacao',
      serieNrcId: 'ordenha-meio/baixa-producao',
      degrau: 'abaixo',
      ordem: 'demais',
      gorduraPct: 3.34,
      proteinaPct: 2.59,
      lactosePct: 3.96,
    });
    assert.equal(r.formulador?.cmsKg, 2.4); // consumo fixo do formulador
    assert.equal(r.nrc?.cmsKg, 2.994); // NRC: 3,0 kg de MS
    perto(r.rodriguesExig?.cmsKg ?? 0, 2.2516, 0.0001); // equação do consumo
    assert.equal(r.prenheOuLactacao, true);
    // o achado: NDT 65% e PB 16,2% do formulador batem com o NRC (66,3% e 15,7%)
    perto(r.formulador?.ndt.frac ?? 0, 0.65, 1e-9);
    perto(r.nrc?.ndt.frac ?? 0, 0.6633, 1e-9);
    perto(r.nrc?.pb.frac ?? 0, 0.1573, 1e-9);
    perto(r.rodrigues?.energiaKcal ?? 0, -1379.2126 + 3 * 646.1161 + 3.34 * 215.8351 + 2.59 * 151.0069 + 3.96 * 54.2662, 1e-9);
    assert.equal(r.rodrigues?.dentroDaFaixa, false); // 3 kg está acima de 2,6
  });

  test('sem peso, sem leite ou em mantença: nada quebra', async () => {
    const { calcularExigencias } = await import('@/lib/nutricao/exigencias');
    const base = { pesoKg: null, leiteKg: null, categoriaId: 'x', serieNrcId: 'mantenca/mantenca', degrau: 'abaixo' as const, ordem: 'demais' as const, gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 };
    const vazio = calcularExigencias(base);
    assert.equal(vazio.consulta, null);
    assert.equal(vazio.consumo, null);
    assert.equal(vazio.rodrigues, null);
    assert.equal(vazio.formulador, null);
    const mant = calcularExigencias({ ...base, pesoKg: 60 });
    assert.equal(mant.prenheOuLactacao, false);
    perto(mant.consumo?.cmsKg ?? 0, 1.332, 1e-9);
    assert.equal(mant.rodrigues, null);
  });
});
