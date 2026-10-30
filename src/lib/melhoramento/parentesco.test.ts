/**
 * MONTAGEM DO PEDIGREE de uma fazenda real, e a endogamia e a A⁻¹ esparsas
 * contra a porta densa do motor.
 *
 * As regras protegidas: ordem pais-antes-dos-filhos; pai ausente vira
 * desconhecido; id duplicado, autoparentesco e ciclo são corrigidos de forma
 * conservadora e SEMPRE reportados; Meuwissen-Luo e Henderson/Quaas esparsos
 * dão exatamente o F e a A⁻¹ da matriz A densa. Fixtures sintéticos — nenhum
 * animal de produtor.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  coeficientes_F,
  comoPedigreeDoMotor,
  endogamia,
  inversaAEsparsa,
  inversa_A,
  montarPedigree,
  podarPedigree,
  type AnimalPedigreeEntrada,
} from '@/lib/melhoramento/parentesco';

/** PRNG determinístico (mulberry32): o mesmo pedigree em toda execução. */
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

/** Pedigree com endogamia de verdade: poucos machos, gerações sobrepostas. */
function pedigreeSintetico(n: number, semente: number): AnimalPedigreeEntrada[] {
  const r = prng(semente);
  const linhas: AnimalPedigreeEntrada[] = [];
  for (let i = 1; i <= n; i++) {
    if (i <= 12) {
      linhas.push({ id: i, pai: null, mae: null, sexo: i <= 3 ? 'macho' : 'fêmea' });
      continue;
    }
    const machos = linhas.filter((l) => l.sexo === 'macho');
    const femeas = linhas.filter((l) => l.sexo === 'fêmea');
    const pai = r() < 0.85 ? machos[Math.floor(r() * machos.length)].id : null;
    const mae = r() < 0.9 ? femeas[Math.floor(r() * femeas.length)].id : null;
    linhas.push({ id: i, pai, mae, sexo: r() < 0.25 ? 'macho' : 'fêmea' });
  }
  // Embaralha: a montagem tem de ordenar sozinha.
  for (let i = linhas.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [linhas[i], linhas[j]] = [linhas[j], linhas[i]];
  }
  return linhas;
}

test('montarPedigree: pais sempre antes dos filhos, mesmo com a entrada embaralhada', () => {
  const ped = montarPedigree(pedigreeSintetico(300, 7));
  assert.equal(ped.ids.length, 300);
  for (let i = 0; i < ped.ids.length; i++) {
    assert.ok(ped.pai[i] < i, `pai de ${ped.ids[i]} vem depois`);
    assert.ok(ped.mae[i] < i, `mãe de ${ped.ids[i]} vem depois`);
  }
});

test('montarPedigree: pai fora das linhas vira desconhecido e é reportado', () => {
  const ped = montarPedigree([
    { id: 1, pai: null, mae: null },
    { id: 2, pai: 99, mae: 1 },
  ]);
  const i = ped.indice.get(2)!;
  assert.equal(ped.pai[i], -1);
  assert.equal(ped.ids[ped.mae[i]], 1);
  assert.deepEqual(ped.problemas.paisAusentes, [99]);
  assert.equal(ped.ids.includes(99), false, 'o ausente não vira fundador');
});

test('montarPedigree: id duplicado fica com a primeira linha e é reportado', () => {
  const ped = montarPedigree([
    { id: 1, pai: null, mae: null },
    { id: 3, pai: null, mae: null },
    { id: 2, pai: 1, mae: null },
    { id: 2, pai: 3, mae: null },
  ]);
  assert.deepEqual(ped.problemas.duplicados, [2]);
  assert.equal(ped.ids[ped.pai[ped.indice.get(2)!]], 1);
});

test('montarPedigree: autoparentesco e ciclo são cortados, nunca em silêncio', () => {
  const ped = montarPedigree([
    { id: 1, pai: 1, mae: null },
    { id: 10, pai: 11, mae: null },
    { id: 11, pai: 12, mae: null },
    { id: 12, pai: 10, mae: null },
  ]);
  assert.deepEqual(ped.problemas.autoparentesco, [1]);
  assert.equal(ped.problemas.ciclosCortados.length, 1);
  // Depois do corte, a ordem é válida de novo.
  for (let i = 0; i < ped.ids.length; i++) assert.ok(ped.pai[i] < i);
});

test('montarPedigree: sexo incoerente e pai mais novo que o filho são contados', () => {
  const ped = montarPedigree([
    { id: 1, pai: null, mae: null, sexo: 'Fêmea', nascimento: '2020-01-01' },
    { id: 2, pai: null, mae: null, sexo: 'macho', nascimento: '2020-01-01' },
    { id: 3, pai: 1, mae: 2, sexo: 'fêmea', nascimento: '2019-06-01' },
  ]);
  assert.deepEqual(ped.problemas.sexoIncoerente, [1, 2]);
  assert.equal(ped.problemas.nascimentoIncoerente, 2);
});

test('endogamia (Meuwissen-Luo) = diagonal de A − 1 da porta, num pedigree endogâmico de 300', () => {
  const ped = montarPedigree(pedigreeSintetico(300, 11));
  const F = endogamia(ped);
  const esperado = coeficientes_F(comoPedigreeDoMotor(ped));
  let endogamicos = 0;
  ped.ids.forEach((id, i) => {
    assert.ok(Math.abs(F[i] - esperado[String(id)]) < 1e-12, `F de ${id}: ${F[i]} vs ${esperado[String(id)]}`);
    if (F[i] > 0) endogamicos += 1;
  });
  assert.ok(endogamicos > 50, 'o fixture precisa ter endogamia para o teste valer');
});

test('endogamia confere com o vetor do relatório de corte (F₆ = F₉ = 0,125)', () => {
  const ped = montarPedigree(
    [
      [1, null, null],
      [2, null, null],
      [3, null, null],
      [4, 1, 2],
      [5, 1, 3],
      [6, 4, 5],
      [7, 4, 3],
      [8, 4, null],
      [9, 6, 3],
      [10, 6, null],
      [11, 6, 7],
    ].map(([id, pai, mae]) => ({ id: id!, pai, mae })),
  );
  const F = endogamia(ped);
  assert.equal(F[ped.indice.get(6)!], 0.125);
  assert.equal(F[ped.indice.get(9)!], 0.125);
  assert.ok(Math.abs(F[ped.indice.get(11)!] - coeficientes_F(comoPedigreeDoMotor(ped))['11']) < 1e-15);
});

test('inversaAEsparsa = inversa_A densa da porta (Henderson/Quaas, com endogamia)', () => {
  const ped = montarPedigree(pedigreeSintetico(150, 3));
  const n = ped.ids.length;
  const esparsa = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  inversaAEsparsa(ped, endogamia(ped), (i, j, v) => {
    esparsa[i][j] += v;
  });
  const [densa, ids] = inversa_A(comoPedigreeDoMotor(ped));
  const pos = new Map(ids.map((id, k) => [id, k]));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const d = densa[pos.get(String(ped.ids[i]))!][pos.get(String(ped.ids[j]))!];
      assert.ok(Math.abs(esparsa[i][j] - d) < 1e-9, `A⁻¹[${ped.ids[i]}, ${ped.ids[j]}]`);
    }
  }
});

test('podarPedigree: fica só quem tem registro e os ancestrais, na mesma ordem', () => {
  const ped = montarPedigree([
    { id: 1, pai: null, mae: null },
    { id: 2, pai: null, mae: null },
    { id: 3, pai: 1, mae: 2 },
    { id: 4, pai: 1, mae: null },
    { id: 5, pai: 3, mae: null },
    { id: 6, pai: null, mae: null },
  ]);
  const podado = podarPedigree(ped, [5]);
  assert.deepEqual([...podado.ids].sort(), [1, 2, 3, 5]);
  const i5 = podado.indice.get(5)!;
  assert.equal(podado.ids[podado.pai[i5]], 3);
  for (let i = 0; i < podado.ids.length; i++) assert.ok(podado.pai[i] < i && podado.mae[i] < i);
});
