/**
 * BOVINOS DE CORTE sobre dados SIMULADOS — nenhum dado de produtor.
 *
 * O simulador gera touros, vacas e bezerros com valor genético verdadeiro
 * (h² 0,24), ambiente comum da mãe (c² 0,27) e pesagens em volta da desmama, e
 * pai conhecido em só ~25% dos bezerros — como no app. Os testes conferem a
 * padronização do P210 caso a caso, os filtros contados, o grupo de
 * contemporâneos, que o BLUP recupera o valor genético melhor que o desvio cru
 * e que a validação mede todos os modelos sobre as mesmas vacas.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CONFIG_CORTE,
  analisarFazendaCorte,
  chaveGrupoCorte,
  estacaoDeNascimento,
  padronizarP210,
  prepararCorte,
  ajustarCorte,
  rotuloGrupoCorte,
  type AnimalCorteEntrada,
  type PesagemCorteEntrada,
} from '@/lib/melhoramento/corte';
import { montarPedigree } from '@/lib/melhoramento/parentesco';

const pes = (idade: number, peso: number, id = idade, lote: number | null = null): PesagemCorteEntrada => ({
  pesagemId: id,
  animalId: 1,
  data: '2025-01-01',
  pesoKg: peso,
  idadeDias: idade,
  loteId: lote,
});

test('padronizarP210: interpolação entre as pesagens que cercam 210 dias', () => {
  const r = padronizarP210([pes(180, 170), pes(240, 200), pes(160, 150)], null);
  assert.ok(r.ok);
  // g = 30/60 = 0,5 kg/dia; 170 + 0,5 × 30 = 185.
  assert.equal(r.metodo, 'interpolacao');
  assert.ok(Math.abs(r.p210 - 185) < 1e-12);
  assert.equal(r.pesagem.idadeDias, 180, 'a de referência é a mais perto de 210 (30 de 180, 30 de 240: empate fica a mais nova)');
});

test('padronizarP210: a fórmula da ABCZ com peso ao nascer (Exemplo do relatório de corte)', () => {
  // Relatório: 32 kg ao nascer e 190 kg aos 190 dias → PC210 = 32 + 0,832 × 210 = 206,6 kg.
  const r = padronizarP210([pes(190, 190)], 32);
  assert.ok(r.ok);
  assert.equal(r.metodo, 'abcz_pn');
  assert.ok(Math.abs(r.p210 - (32 + ((190 - 32) / 190) * 210)) < 1e-12);
  assert.equal(r.p210.toFixed(1), '206.6');
});

test('padronizarP210: extrapolação do mesmo lado, uma pesagem sem PN fora, ganho negativo fora, janela respeitada', () => {
  const ext = padronizarP210([pes(170, 160), pes(190, 172)], null);
  assert.ok(ext.ok && ext.metodo === 'extrapolacao');
  assert.ok(Math.abs(ext.p210 - (172 + 0.6 * 20)) < 1e-12);
  assert.deepEqual(padronizarP210([pes(200, 180)], null), { ok: false, motivo: 'uma_pesagem_sem_pn' });
  assert.deepEqual(padronizarP210([pes(180, 200), pes(240, 190)], null), { ok: false, motivo: 'ganho_incoerente' });
  assert.deepEqual(padronizarP210([pes(140, 120), pes(280, 220)], null), { ok: false, motivo: 'sem_pesagem_janela' });
  const exata = padronizarP210([pes(210, 199), pes(250, 230)], null);
  assert.ok(exata.ok && exata.p210 === 199);
});

test('grupo de contemporâneos: fazenda × ano × estação do nascimento × sexo × lote', () => {
  assert.deepEqual(estacaoDeNascimento('2023-12-15'), { ano: 2024, estacao: 'verao' });
  assert.deepEqual(estacaoDeNascimento('2024-07-01'), { ano: 2024, estacao: 'inverno' });
  const g = chaveGrupoCorte(740, '2023-12-15', 'macho', 55);
  assert.equal(g, '740|2024|verao|macho|55');
  assert.equal(rotuloGrupoCorte(g), 'verão de 2024 · machos · lote 55');
  assert.equal(rotuloGrupoCorte(chaveGrupoCorte(1, '2024-04-02', 'femea', null)), 'outono de 2024 · fêmeas · sem lote');
});

// ── Simulador ───────────────────────────────────────────────────────────────

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

interface SimCorte {
  animais: AnimalCorteEntrada[];
  pesagens: PesagemCorteEntrada[];
  verdadeiro: Map<number, number>;
}

/** 12 touros, 250 vacas, 4 safras de bezerros; σ²P = 900 kg²: h² 0,24, c² 0,27, e² 0,49. */
function simular(semente: number): SimCorte {
  const r = prng(semente);
  const s2p = 900;
  const sa = Math.sqrt(0.24 * s2p);
  const sc = Math.sqrt(0.27 * s2p);
  const se = Math.sqrt(0.49 * s2p);
  const animais: AnimalCorteEntrada[] = [];
  const pesagens: PesagemCorteEntrada[] = [];
  const verdadeiro = new Map<number, number>();
  const base = (id: number, sexo: string, nasc: string): AnimalCorteEntrada => ({
    animalId: id,
    propriedadeId: 7,
    sexo,
    nascimento: nasc,
    paiId: null,
    maeId: null,
    numero: `N${id}`,
    nome: null,
    apenasGenealogia: false,
    pesoNascer: null,
    origemPrenhez: 'monta',
    paisCandidatos: 0,
  });
  const touros = Array.from({ length: 12 }, (_, k) => 1 + k);
  for (const t of touros) {
    animais.push(base(t, 'macho', '2015-01-01'));
    verdadeiro.set(t, normal(r) * sa);
  }
  const vacas = Array.from({ length: 250 }, (_, k) => 100 + k);
  const cVaca = new Map<number, number>();
  for (const v of vacas) {
    animais.push(base(v, 'femea', '2016-01-01'));
    verdadeiro.set(v, normal(r) * sa);
    cVaca.set(v, normal(r) * sc);
  }
  let id = 1000;
  let pid = 1;
  for (let safra = 0; safra < 4; safra++) {
    const efeitoSafra = [normal(r) * 20, normal(r) * 20];
    for (const v of vacas) {
      if (r() < 0.15) continue; // vaca falhada no ano
      id += 1;
      const touro = touros[Math.floor(r() * touros.length)];
      const sexo = r() < 0.5 ? 'macho' : 'femea';
      const mes = 9 + Math.floor(r() * 3); // primavera
      const nasc = `${2020 + safra}-${String(mes).padStart(2, '0')}-10`;
      const a = 0.5 * verdadeiro.get(touro)! + 0.5 * verdadeiro.get(v)! + normal(r) * sa * Math.sqrt(0.5);
      verdadeiro.set(id, a);
      const conhecePai = r() < 0.25;
      animais.push({ ...base(id, sexo, nasc), paiId: conhecePai ? touro : null, maeId: v, paisCandidatos: conhecePai ? 0 : 3 });
      const p210 = 200 + (sexo === 'macho' ? 15 : 0) + efeitoSafra[sexo === 'macho' ? 0 : 1] + a + cVaca.get(v)! + normal(r) * se;
      const g = 0.8;
      // Duas pesagens que cercam 210 dias (a maioria), ou uma só.
      const i1 = 175 + Math.floor(r() * 30);
      pesagens.push({ pesagemId: pid++, animalId: id, data: nasc, pesoKg: p210 - g * (210 - i1), idadeDias: i1, loteId: 1 });
      if (r() < 0.85) {
        const i2 = 220 + Math.floor(r() * 40);
        pesagens.push({ pesagemId: pid++, animalId: id, data: nasc, pesoKg: p210 + g * (i2 - 210), idadeDias: i2, loteId: 1 });
      }
    }
  }
  return { animais, pesagens, verdadeiro };
}

const SIM = simular(42);

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

test('prepararCorte: todo bezerro com pesagem entra ou tem motivo; grupo pequeno sai por último', () => {
  const prep = prepararCorte(7, SIM.animais, SIM.pesagens);
  const comPesagem = new Set(SIM.pesagens.map((p) => p.animalId)).size;
  assert.equal(prep.bezerrosNaJanela, comPesagem);
  const fora = Object.values(prep.excluidos).reduce((s, n) => s + n, 0);
  assert.equal(prep.registros.length + fora, comPesagem);
  assert.ok(prep.excluidos.uma_pesagem_sem_pn > 0, 'o simulador deixa ~15% com uma pesagem só');
  assert.equal(prep.metodos.interpolacao, prep.registros.length, 'com duas pesagens em volta de 210, sempre interpolação');
  for (const n of prep.grupos.values()) assert.ok(n >= CONFIG_CORTE.tamanhoMinimoGrupo);
});

test('ajustarCorte: o BLUP recupera o valor genético dos bezerros melhor que o desvio cru, mesmo com pai em 25%', () => {
  const prep = prepararCorte(7, SIM.animais, SIM.pesagens);
  const ped = montarPedigree(SIM.animais.map((a) => ({ id: a.animalId, pai: a.paiId, mae: a.maeId })));
  const aj = ajustarCorte(prep.registros, ped, CONFIG_CORTE, { pev: true });
  const ids = prep.registros.map((r) => r.animalId);
  const verdade = ids.map((i) => SIM.verdadeiro.get(i)!);
  const r = (m: string) => correlacao(ids.map((i) => aj.bezerros.get(m)!.get(i)!.valor), verdade);
  assert.ok(r('blup_h20.24_c0.27') > r('desvio_gc'), `BLUP ${r('blup_h20.24_c0.27')} vs desvio ${r('desvio_gc')}`);
  // Confiabilidade entre 0 e 1; bezerro com pai conhecido é mais confiável em média.
  const blup = aj.bezerros.get('blup_h20.24_c0.27')!;
  const comPai = prep.registros.filter((x) => x.paiId != null).map((x) => blup.get(x.animalId)!.confiabilidade!);
  const semPai = prep.registros.filter((x) => x.paiId == null).map((x) => blup.get(x.animalId)!.confiabilidade!);
  const med = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
  for (const v of [...comPai, ...semPai]) assert.ok(v >= 0 && v <= 1);
  assert.ok(med(comPai) > med(semPai), 'pai conhecido soma informação');
  assert.equal(aj.blup.length, 3);
});

test('analisarFazendaCorte: validação nas mesmas vacas, MPPA perto de 1, ranking sem número de outra fazenda', () => {
  // Uma vaca "de outra fazenda": só pedigree.
  const animais = SIM.animais.map((a) => (a.animalId === 100 ? { ...a, propriedadeId: 999 } : a));
  const a = analisarFazendaCorte({ propriedadeId: 7, animais, pesagens: SIM.pesagens }, { ranking: true });
  assert.equal(a.rodouModelos, true);
  const v = a.validacao!;
  assert.equal(v.rodou, true, v.motivo ?? '');
  for (const m of v.porModelo) assert.equal(m.metricas.n, v.n);
  const b = (modelo: string) => v.porModelo.find((m) => m.modelo === modelo)!.metricas.regressao!;
  assert.ok(Math.abs(b('mppa_r0.33') - 1) < Math.abs(b('desvio_gc') - 1), 'a MPPA encolhe o desvio cru');
  assert.ok(a.diagnostico.pedigree.externos >= 1);
  const matrizes = a.rankingMatrizes!.flatMap((r) => r.linhas);
  for (const l of matrizes.filter((x) => x.animalId === 100)) assert.equal(l.numero, null);
  assert.ok(a.diagnostico.completude.pai / a.diagnostico.completude.bezerros < 0.4);
  assert.ok(a.diagnostico.completude.semPaiComCandidatos > 0);
  assert.doesNotThrow(() => JSON.stringify(a));
});

test('analisarFazendaCorte: fazenda pequena não roda e diz por quê', () => {
  const poucos = SIM.pesagens.filter((p) => p.animalId < 1020);
  const a = analisarFazendaCorte({ propriedadeId: 7, animais: SIM.animais, pesagens: poucos }, { ranking: true });
  assert.equal(a.rodouModelos, false);
  assert.match(a.motivoSemModelos!, /mínimo/);
  assert.equal(a.diagnostico.nivel, 'insuficiente');
});
