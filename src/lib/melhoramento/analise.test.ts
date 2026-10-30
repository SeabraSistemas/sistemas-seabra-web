/**
 * A ANÁLISE DE PONTA A PONTA sobre um rebanho SIMULADO — nenhum dado de
 * produtor aqui.
 *
 * O simulador gera o valor genético verdadeiro (a = ½a_pai + ½a_mãe + amostra
 * mendeliana), o ambiente permanente de cada cabra e o resíduo de cada
 * lactação, com h² 0,30 e r 0,45, grupos de ano × estação × classe com
 * efeitos próprios e uma primeira lactação mais baixa. Como o verdadeiro é
 * conhecido, os testes podem conferir o que nenhum dado real deixa: que o
 * BLUP recupera o valor genético melhor que a linha de base, e que a MPPA
 * corrige a dispersão exagerada do desvio cru na validação.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { analisarFazenda, validarParaFrente } from '@/lib/melhoramento/analise';
import { prepararRegistros } from '@/lib/melhoramento/contemporaneas';
import { capacidade_producao_femea, fator_mppa, indice_femea } from '@/lib/melhoramento/indices';
import { ajustarModelos } from '@/lib/melhoramento/modelos';
import { montarPedigree } from '@/lib/melhoramento/parentesco';
import { resumirEntreFazendas } from '@/lib/melhoramento/resumo';
import { CONFIG_PADRAO, type AnimalEntrada, type LactacaoEntrada } from '@/lib/melhoramento/tipos';

function prng(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(r: () => number): number {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

const ESTACOES = ['verao', 'outono', 'inverno', 'primavera'];

interface Simulado {
  animais: AnimalEntrada[];
  lactacoes: LactacaoEntrada[];
  verdadeiro: Map<number, number>;
}

/**
 * 6 bodes, 80 cabras-base sem lactação, 400 filhas com 1 a 4 lactações em
 * anos e estações sorteados. σ²P = 0,64 (L/dia)²: h² 0,30 → σ²a 0,192;
 * r 0,45 → σ²pe 0,096; σ²e 0,352.
 */
function simular(semente: number, propriedadeId = 1): Simulado {
  const r = prng(semente);
  const s2p = 0.64;
  const sa = Math.sqrt(0.3 * s2p);
  const spe = Math.sqrt(0.15 * s2p);
  const se = Math.sqrt(0.55 * s2p);
  const animais: AnimalEntrada[] = [];
  const verdadeiro = new Map<number, number>();
  const lactacoes: LactacaoEntrada[] = [];
  const efeitoGrupo = new Map<string, number>();
  let id = propriedadeId * 100000;
  const novo = (p: Partial<AnimalEntrada>) => {
    id += 1;
    const a: AnimalEntrada = {
      animalId: id,
      propriedadeId,
      especie: 'caprino',
      numero: String(id),
      nome: null,
      sexo: 'fêmea',
      nascimento: null,
      paiId: null,
      maeId: null,
      ...p,
    };
    animais.push(a);
    return a;
  };
  const bodes = Array.from({ length: 6 }, () => novo({ sexo: 'macho' }));
  const maes = Array.from({ length: 80 }, () => novo({}));
  for (const a of [...bodes, ...maes]) verdadeiro.set(a.animalId, sa * normal(r));
  let lid = propriedadeId * 1000000;
  for (let k = 0; k < 400; k++) {
    const pai = r() < 0.8 ? bodes[Math.floor(r() * bodes.length)] : null;
    const mae = maes[Math.floor(r() * maes.length)];
    const ano = 2018 + Math.floor(r() * 4);
    const cabra = novo({ paiId: pai?.animalId ?? null, maeId: mae.animalId, nascimento: `${ano - 1}-06-01` });
    const aPai = pai ? verdadeiro.get(pai.animalId)! : 0;
    const a = 0.5 * aPai + 0.5 * verdadeiro.get(mae.animalId)! + Math.sqrt(pai ? 0.5 : 0.75) * sa * normal(r);
    verdadeiro.set(cabra.animalId, a);
    const pe = spe * normal(r);
    const nLact = 1 + Math.floor(r() * 4);
    for (let o = 1; o <= nLact; o++) {
      const anoParto = ano + o - 1;
      const estacao = ESTACOES[Math.floor(r() * 2)]; // duas estações: grupos cheios
      const classe = o === 1 ? 'primipara' : 'adulta';
      const chave = `${anoParto}|${estacao}|${classe}`;
      if (!efeitoGrupo.has(chave)) efeitoGrupo.set(chave, 0.5 * normal(r));
      const y = 3 + efeitoGrupo.get(chave)! + (o === 1 ? -0.4 : 0) + a + pe + se * normal(r);
      const media = Math.max(0.05, y);
      lid += 1;
      lactacoes.push({
        lactacaoId: lid,
        animalId: cabra.animalId,
        propriedadeId,
        especie: 'caprino',
        raca: null,
        ordemLactacao: o,
        lactacoesDoAnimal: nLact,
        ordemPartoCadastro: nLact,
        dataInicio: `${anoParto}-${estacao === 'verao' ? '01' : '04'}-15`,
        anoEstacao: anoParto,
        estacao,
        idadePartoDias: 365 * o + 200,
        encerrada: true,
        duracaoDias: 250,
        totalLeite: media * 250,
        mediaLeite: media,
        metodo: 'DEFINITIVO_FILHO',
        sintetica: false,
        paiId: pai?.animalId ?? null,
        maeId: mae.animalId,
      });
    }
  }
  return { animais, lactacoes, verdadeiro };
}

function correlacao(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

const SIM = simular(2026);

test('capacidade_producao_femea: sem pai é exatamente a MPPA do motor', () => {
  for (const n of [1, 2, 4]) {
    const pa = capacidade_producao_femea(new Array(n).fill(1), 0.2, 0.36, 1.0, null, 0);
    assert.ok(Math.abs(pa.pesos[0] - fator_mppa(n, 0.36)) < 1e-14);
    assert.ok(Math.abs(pa.confiabilidade - fator_mppa(n, 0.36)) < 1e-14);
  }
});

test('capacidade_producao_femea: com pai resolve P·b = g e soma informação ao EBV do índice', () => {
  const [h2, r, sp, rel] = [0.2, 0.36, 2.0, 0.6];
  const pa = capacidade_producao_femea([0.5, 0.1], h2, r, sp, 0.3, rel, 'EBV');
  const s2p = sp * sp;
  const s2a = h2 * s2p;
  const varX1 = s2p * (r + (1 - r) / 2);
  const cov = (rel * s2a) / 2;
  const [b1, b2] = pa.pesos;
  assert.ok(Math.abs(varX1 * b1 + cov * b2 - r * s2p) < 1e-12);
  assert.ok(Math.abs(cov * b1 + rel * s2a * b2 - cov) < 1e-12);
  // O alvo a+pe carrega o pe que os registros próprios trazem: o peso deles sobe.
  const ind = indice_femea([0.5, 0.1], h2, r, sp, 0.3, rel, 'EBV');
  assert.ok(pa.pesos[0] > ind.pesos[0]);
});

test('analisarFazenda: diagnóstico conta o rebanho simulado sem perder ninguém', () => {
  const a = analisarFazenda(
    { propriedadeId: 1, especie: 'caprino', lactacoes: SIM.lactacoes, animais: SIM.animais, sinteticasForaDaLeitura: 7 },
    { ranking: false },
  );
  const d = a.diagnostico;
  assert.equal(d.lactacoesReais, SIM.lactacoes.length);
  assert.equal(d.lactacoesSinteticas, 7);
  assert.equal(d.femeasComLactacao, 400);
  const principal = d.caracteristicas[0];
  assert.equal(principal.caracteristica, 'media_diaria');
  const excluidas = Object.values(principal.excluidas).reduce((s, n) => s + n, 0);
  assert.equal(principal.registros + excluidas, SIM.lactacoes.length, 'toda lactação entra ou tem motivo');
  assert.equal(d.completude.mae, d.completude.femeas, 'toda cabra simulada tem mãe');
  assert.equal(d.completude.avoPaterno, 0, 'as mães-base não têm pai');
  assert.equal(d.reprodutores.comFilhas, 6);
  assert.ok(d.reprodutores.comDezOuMais >= 1);
  assert.equal(d.lactacoesPorFemea.uma + d.femeasDuasOuMais, d.completude.femeas);
  assert.equal(d.pedigree.paisAusentes, 0);
  // Duração constante: a correlação com a duração não existe.
  assert.equal(principal.correlacaoDuracao, null);
});

test('BLUP recupera o valor genético simulado melhor que a linha de base e que a MPPA', () => {
  const prep = prepararRegistros(SIM.lactacoes, 'media_diaria', CONFIG_PADRAO);
  const ped = montarPedigree(SIM.animais.map((a) => ({ id: a.animalId, pai: a.paiId, mae: a.maeId, sexo: a.sexo })));
  const aj = ajustarModelos(prep.registros, ped, CONFIG_PADRAO, { pev: 'femeas_e_reprodutores' });
  const femeas = [...aj.femea.get('desvio_gc')!.keys()];
  const verdade = femeas.map((f) => SIM.verdadeiro.get(f)!);
  const r = (modelo: string) => correlacao(femeas.map((f) => aj.femea.get(modelo)!.get(f)!.valor), verdade);
  const rBase = r('desvio_gc');
  const rBlup = r('blup_h20.3_r0.36');
  assert.ok(rBlup > rBase, `BLUP ${rBlup} vs base ${rBase}`);
  assert.ok(rBlup > r('mppa_r0.44'), 'o parentesco tem de acrescentar alguma coisa');
  // Confiabilidade sempre entre 0 e 1, e maior para quem tem mais lactações.
  const blup = aj.femea.get('blup_h20.3_r0.36')!;
  for (const v of blup.values()) assert.ok(v.confiabilidade! >= 0 && v.confiabilidade! <= 1);
  const relMedia = (n: number) => {
    const xs = [...blup.values()].filter((v) => v.n === n).map((v) => v.confiabilidade!);
    return xs.reduce((s, x) => s + x, 0) / xs.length;
  };
  assert.ok(relMedia(3) > relMedia(1));
  // Reprodutores: EBV e REL, e o de mais filhas é o mais confiável.
  const reps = [...aj.reprodutor.get('blup_h20.3_r0.36')!.values()].sort((a, b) => b.filhas - a.filhas);
  assert.equal(reps.length, 6);
  assert.ok(reps[0].confiabilidade! >= reps[reps.length - 1].confiabilidade!);
  assert.equal(aj.blup[0].metodo, 'densa');
});

test('validação para frente: mesmo conjunto de fêmeas em todos os modelos, e a MPPA corrige a dispersão do desvio cru', () => {
  const prep = prepararRegistros(SIM.lactacoes, 'media_diaria', CONFIG_PADRAO);
  const ped = montarPedigree(SIM.animais.map((a) => ({ id: a.animalId, pai: a.paiId, mae: a.maeId })));
  const v = validarParaFrente(prep.registros, ped, CONFIG_PADRAO);
  assert.equal(v.rodou, true);
  assert.ok(v.n >= 200 && v.n <= v.candidatas);
  for (const m of v.porModelo) assert.equal(m.metricas.n, v.n);
  const b = (modelo: string) => v.porModelo.find((m) => m.modelo === modelo)!.metricas.regressao!;
  // O desvio cru exagera as diferenças (b bem abaixo de 1); a MPPA encolhe.
  assert.ok(b('desvio_gc') < b('mppa_r0.44'));
  assert.ok(Math.abs(b('mppa_r0.44') - 1) < Math.abs(b('desvio_gc') - 1));
  for (const m of v.porModelo) {
    assert.ok(m.metricas.icCorrelacao![0] < m.metricas.correlacao! && m.metricas.correlacao! < m.metricas.icCorrelacao![1]);
  }
});

test('analisarFazenda com ranking: rankings limitados, ordenados e com o animal identificado', () => {
  const a = analisarFazenda({ propriedadeId: 1, especie: 'caprino', lactacoes: SIM.lactacoes, animais: SIM.animais }, { ranking: true });
  assert.equal(a.rodouModelos, true);
  assert.equal(a.caracteristicas.length, 2);
  const c = a.caracteristicas[0];
  assert.equal(c.rankingFemeas!.length, a.modelos.length);
  for (const rk of c.rankingFemeas!) {
    assert.ok(rk.linhas.length <= CONFIG_PADRAO.tamanhoRanking);
    for (let i = 1; i < rk.linhas.length; i++) assert.ok(rk.linhas[i - 1].valor >= rk.linhas[i].valor);
    assert.ok(rk.linhas.every((l) => l.numero != null));
  }
  assert.deepEqual(
    c.rankingReprodutores!.map((r) => r.modelo),
    ['desvio_gc', 'blup_h20.2_r0.36', 'blup_h20.3_r0.36'],
  );
  // Tudo serializável: o objeto atravessa o RSC.
  assert.doesNotThrow(() => JSON.stringify(a));
});

test('analisarFazenda: ovinos têm diagnóstico e nenhum modelo, com o motivo', () => {
  const ovinos = SIM.lactacoes.map((l) => ({ ...l, especie: 'ovino' }));
  const a = analisarFazenda(
    { propriedadeId: 1, especie: 'ovino', lactacoes: ovinos, animais: SIM.animais.map((x) => ({ ...x, especie: 'ovino' })) },
    { ranking: true },
  );
  assert.equal(a.rodouModelos, false);
  assert.match(a.motivoSemModelos!, /ovinos/);
  assert.ok(a.diagnostico.caracteristicas[0].registros > 0);
});

test('analisarFazenda: fazenda pequena não roda modelo e diz por quê', () => {
  const poucas = SIM.lactacoes.slice(0, 12);
  const a = analisarFazenda({ propriedadeId: 1, especie: 'caprino', lactacoes: poucas, animais: SIM.animais }, { ranking: true });
  assert.equal(a.rodouModelos, false);
  assert.match(a.motivoSemModelos!, /mínimo/);
  assert.equal(a.diagnostico.nivel, 'insuficiente');
});

test('resumirEntreFazendas: abaixo de 7 fazendas não publica nada; teste não conta', () => {
  const a = analisarFazenda({ propriedadeId: 1, especie: 'caprino', lactacoes: SIM.lactacoes, animais: SIM.animais }, { ranking: false });
  const seis = Array.from({ length: 6 }, () => ({ teste: false, analise: a }));
  const r6 = resumirEntreFazendas([...seis, { teste: true, analise: a }], 'media_diaria', 7);
  assert.equal(r6.fazendasComValidacao, 6);
  assert.equal(r6.publicavel, false);
  assert.deepEqual(r6.porModelo, []);
  const r7 = resumirEntreFazendas([...seis, { teste: false, analise: a }], 'media_diaria', 7);
  assert.equal(r7.publicavel, true);
  assert.equal(r7.porModelo.length, a.modelos.length);
  assert.ok(r7.porModelo.every((m) => m.fazendas === 7));
});
