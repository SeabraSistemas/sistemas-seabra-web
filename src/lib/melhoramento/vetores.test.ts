/**
 * VALIDAÇÃO DA PORTA TypeScript contra o motor Python.
 *
 * Roda os vetores de central-melhoramento/laboratorio/vetores_teste.json (as
 * entradas e saídas gravadas do pacote `melhoramento`, ele próprio validado
 * contra Mrode et al. 2023 e a ICAR) em toda função que este módulo portou, com
 * a regra de tolerância do próprio arquivo — erro absoluto de até
 * 1e-9 × máx(1, |valor|), a mesma de tests/test_vetores.py e de
 * lab/testar_calculadoras.mjs.
 *
 * Os vetores de funções que o módulo NÃO usa (ganho genético, lactação
 * padronizada, taxas de rebanho, multicaracterística...) ficam de fora pelo
 * nome da função; os que são de função portada mas usam um recurso que não foi
 * portado ficam em NAO_APLICAVEIS, com o motivo. Nenhum vetor some em silêncio:
 * o último teste confere a contagem.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { gauss_seidel, beta_incompleta_regularizada, beta_quantil, log_gama, norm_cdf, norm_ppf, t_quantil } from '@/lib/melhoramento/numerico';
import {
  bif_de_r,
  de_de_rel,
  de_filha_com_lactacoes,
  de_filhas_mesmo_rebanho,
  de_registros_proprios,
  indice_femea,
  k_d,
  k_touro,
  mppa,
  r_de_bif,
  rel_filhas,
  rel_total,
} from '@/lib/melhoramento/indices';
import {
  F_acasalamento,
  coeficientes_F,
  inversa_A,
  matriz_A,
  tabela_F_acasalamentos,
} from '@/lib/melhoramento/parentesco';
import { modelo_animal } from '@/lib/melhoramento/blup';

interface Vetor {
  id: string;
  funcao: string;
  entrada: Record<string, unknown>;
  saida: unknown;
}

const dados = JSON.parse(
  readFileSync(new URL('../../../central-melhoramento/laboratorio/vetores_teste.json', import.meta.url), 'utf8'),
) as { tolerancia_relativa: number; vetores: Vetor[] };
const TOL = dados.tolerancia_relativa;

type Funcao = (...args: never[]) => unknown;

/** Nome da função no motor → argumentos na ordem do Python e a porta. */
const PORTA: Record<string, { params: string[]; fn: Funcao }> = {
  'taxas.log_gama': { params: ['x'], fn: log_gama as Funcao },
  'taxas.norm_cdf': { params: ['z'], fn: norm_cdf as Funcao },
  'taxas.norm_ppf': { params: ['p'], fn: norm_ppf as Funcao },
  'taxas.beta_incompleta_regularizada': { params: ['x', 'a', 'b'], fn: beta_incompleta_regularizada as Funcao },
  'taxas.beta_quantil': { params: ['p', 'a', 'b', 'tolerancia'], fn: beta_quantil as Funcao },
  'taxas.t_quantil': { params: ['p', 'gl'], fn: t_quantil as Funcao },
  'confiabilidade.k_d': { params: ['h2'], fn: k_d as Funcao },
  'confiabilidade.k_touro': { params: ['h2'], fn: k_touro as Funcao },
  'confiabilidade.rel_filhas': {
    params: ['n_filhas', 'h2', 'merito_companheiras_conhecido'],
    fn: rel_filhas as Funcao,
  },
  'confiabilidade.de_de_rel': { params: ['rel', 'k'], fn: de_de_rel as Funcao },
  'confiabilidade.de_filhas_mesmo_rebanho': { params: ['d'], fn: de_filhas_mesmo_rebanho as Funcao },
  'confiabilidade.de_registros_proprios': { params: ['m', 'h2', 'r'], fn: de_registros_proprios as Funcao },
  'confiabilidade.de_filha_com_lactacoes': { params: ['m', 'h2', 'r'], fn: de_filha_com_lactacoes as Funcao },
  'confiabilidade.rel_total': {
    params: ['h2', 'de_media_pais', 'de_proprio', 'de_progenie'],
    fn: rel_total as Funcao,
  },
  'confiabilidade.bif_de_r': { params: ['r'], fn: bif_de_r as Funcao },
  'confiabilidade.r_de_bif': { params: ['a_bif'], fn: r_de_bif as Funcao },
  'indices.mppa': { params: ['media_femea', 'n', 'r', 'media_rebanho'], fn: mppa as Funcao },
  'indices.indice_femea': {
    params: ['desvios', 'h2', 'r', 'sigma_p', 'pta_pai', 'rel_pai', 'escala_pai'],
    fn: indice_femea as Funcao,
  },
  'parentesco.matriz_A': { params: ['ped'], fn: matriz_A as Funcao },
  'parentesco.inversa_A': { params: ['ped', 'F', 'considerar_endogamia'], fn: inversa_A as Funcao },
  'parentesco.coeficientes_F': { params: ['ped'], fn: coeficientes_F as Funcao },
  'parentesco.F_acasalamento': { params: ['ped', 'pai', 'mae'], fn: F_acasalamento as Funcao },
  'parentesco.tabela_F_acasalamentos': { params: ['ped', 'machos', 'femeas'], fn: tabela_F_acasalamentos as Funcao },
  'blup.modelo_animal': {
    params: [
      'ped',
      'animais',
      'y',
      'grupos',
      'sigma2_a',
      'sigma2_e',
      'sigma2_pe',
      'covariaveis',
      'outros_fatores',
      'rotulos_pe',
      'grupos_geneticos',
    ],
    fn: modelo_animal as Funcao,
  },
  'blup.gauss_seidel': {
    params: ['LHS', 'RHS', 'x0', 'iteracoes_max', 'tolerancia', 'guardar_historico'],
    fn: gauss_seidel as Funcao,
  },
};

/** Vetores de função portada que exigem um recurso não portado — com o motivo. */
const NAO_APLICAVEIS: Record<string, string> = {
  'blup.modelo_animal_grupos_mrode_4_4':
    'grupos genéticos de pais desconhecidos (A* de Quaas) não são usados nesta versão do módulo',
};

function compara(calc: unknown, grav: unknown, caminho: string, erros: string[]): void {
  if (grav === null) {
    if (!(calc === null || (typeof calc === 'number' && Number.isNaN(calc)))) erros.push(`${caminho}: esperado null, veio ${String(calc)}`);
    return;
  }
  if (Array.isArray(grav)) {
    if (!Array.isArray(calc)) return void erros.push(`${caminho}: esperado lista`);
    if (calc.length !== grav.length) return void erros.push(`${caminho}: tamanho ${calc.length} != ${grav.length}`);
    grav.forEach((g, i) => compara(calc[i], g, `${caminho}[${i}]`, erros));
    return;
  }
  if (typeof grav === 'object') {
    if (calc === null || typeof calc !== 'object' || Array.isArray(calc)) return void erros.push(`${caminho}: esperado objeto`);
    const kc = Object.keys(calc).sort().join('|');
    const kg = Object.keys(grav as object).sort().join('|');
    if (kc !== kg) return void erros.push(`${caminho}: chaves {${kc}} != {${kg}}`);
    for (const k of Object.keys(grav as object)) {
      compara((calc as Record<string, unknown>)[k], (grav as Record<string, unknown>)[k], `${caminho}.${k}`, erros);
    }
    return;
  }
  if (typeof grav === 'number') {
    if (typeof calc !== 'number' || !(Math.abs(calc - grav) <= TOL * Math.max(1, Math.abs(grav)))) {
      erros.push(`${caminho}: ${String(calc)} != ${grav}`);
    }
    return;
  }
  if (calc !== grav) erros.push(`${caminho}: ${JSON.stringify(calc)} != ${JSON.stringify(grav)}`);
}

const aplicaveis = dados.vetores.filter((v) => PORTA[v.funcao] && !NAO_APLICAVEIS[v.id]);

for (const v of aplicaveis) {
  test(`vetor ${v.id} (${v.funcao}) bate com o motor Python a 1e-9`, () => {
    const { params, fn } = PORTA[v.funcao];
    const extras = Object.keys(v.entrada).filter((k) => !params.includes(k));
    assert.deepEqual(extras, [], `argumentos sem lugar na assinatura: ${extras.join(', ')}`);
    const saida = (fn as (...a: unknown[]) => unknown)(...params.map((p) => v.entrada[p]));
    const erros: string[] = [];
    compara(saida, v.saida, v.id, erros);
    assert.deepEqual(erros.slice(0, 5), []);
  });
}

test('nenhum vetor de função portada fica de fora sem motivo escrito', () => {
  const dePortadas = dados.vetores.filter((v) => PORTA[v.funcao]);
  const fora = dePortadas.filter((v) => NAO_APLICAVEIS[v.id]).map((v) => v.id);
  assert.deepEqual(fora.sort(), Object.keys(NAO_APLICAVEIS).sort(), 'NAO_APLICAVEIS cita vetor inexistente');
  assert.equal(aplicaveis.length + fora.length, dePortadas.length);
  // A contagem fica escrita: se o arquivo de vetores crescer, este número muda
  // de propósito e alguém olha os vetores novos.
  assert.equal(aplicaveis.length, 46);
});
