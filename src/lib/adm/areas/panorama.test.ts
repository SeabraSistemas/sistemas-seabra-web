/**
 * PANORAMA — geografia e concentração da base.
 *
 * As regras que este arquivo protege:
 *
 *   · FAZENDA DE TESTE FICA FORA por padrão — a 214 tem 21% dos animais e não é
 *     cliente.
 *   · "Sem localização" é o ÚLTIMO grupo, nunca o maior "estado".
 *   · A concentração é a fração ACUMULADA das maiores, e "quantas bastam para
 *     80%" é contado inclusive.
 *   · Por segmento cada fazenda conta UMA vez (o principal) — dividir animais
 *     exige isso, ao contrário da carteira.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SEM_LOCALIZACAO,
  concentracao,
  faixasDeTamanho,
  porCidade,
  porSegmento,
  porUf,
  resumoPanorama,
  semLocalizacao,
  separarTeste,
} from '@/lib/adm/areas/panorama';
import type { LinhaPanorama } from '@/lib/adm/areas/contrato';

function fazenda(parcial: Partial<LinhaPanorama> & { id: number }): LinhaPanorama {
  return {
    nome: `Fazenda ${parcial.id}`,
    cidade: null,
    segmentos: ['caprino_leiteiro'],
    segmento_principal: 'caprino_leiteiro',
    produtor_id: 1,
    produtor_nome: 'Dono',
    uf: 'MG',
    uf_origem: 'cadastro',
    latitude: null,
    longitude: null,
    animais_ativos: 100,
    femeas: 70,
    lactantes: 30,
    producao_30d: 1000,
    lancamentos_30d: 10,
    dias_sem_lancar: 2,
    acesso_ativo: true,
    plano_nome: 'Pro',
    status_efetivo: 'ativa',
    mrr_mensal: 100,
    mrr_atribuido: true,
    teste: false,
    ...parcial,
  };
}

test('separarTeste: tester, demo e "teste" no nome saem do panorama', () => {
  const { reais, teste } = separarTeste([
    fazenda({ id: 1 }),
    fazenda({ id: 2, teste: true, animais_ativos: 1397 }),
  ]);
  assert.deepEqual(reais.map((l) => l.id), [1]);
  assert.deepEqual(teste.map((l) => l.id), [2]);
});

test('resumoPanorama: conta localizadas, as inferidas por CEP/dono, UFs, cidades e silenciosas', () => {
  const resumo = resumoPanorama([
    fazenda({ id: 1, uf: 'MG', cidade: 'Florestal' }),
    fazenda({ id: 2, uf: 'SP', uf_origem: 'cep', cidade: 'Barreiro', dias_sem_lancar: 45 }),
    fazenda({ id: 3, uf: null, uf_origem: null, cidade: null, acesso_ativo: false, mrr_mensal: 0 }),
  ]);
  assert.equal(resumo.propriedades, 3);
  assert.equal(resumo.comLocalizacao, 2);
  assert.equal(resumo.localizadasPorInferencia, 1);
  assert.equal(resumo.ufs, 2);
  assert.equal(resumo.cidades, 2);
  assert.equal(resumo.animais, 300);
  assert.equal(resumo.comAcesso, 2);
  assert.equal(resumo.mrr, 200);
  assert.equal(resumo.silenciosas, 1);
});

test('porUf: do estado com mais animais para o com menos, "Sem localização" por último', () => {
  const ufs = porUf([
    fazenda({ id: 1, uf: 'MG', animais_ativos: 100 }),
    fazenda({ id: 2, uf: 'RJ', animais_ativos: 900 }),
    fazenda({ id: 3, uf: null, animais_ativos: 5000 }),
  ]);
  assert.deepEqual(
    ufs.map((u) => u.rotulo),
    ['RJ', 'MG', SEM_LOCALIZACAO],
    'mesmo com mais animais, "Sem localização" não é um lugar',
  );
  assert.equal(ufs[0].fracaoAnimais, 0.15, 'fração sobre a base inteira, inclusive a sem localização');
});

test('porCidade: só quem tem cidade, com a UF ao lado, e fração sobre a base inteira', () => {
  const cidades = porCidade([
    fazenda({ id: 1, cidade: 'Florestal', uf: 'MG', animais_ativos: 200 }),
    fazenda({ id: 2, cidade: 'Florestal', uf: 'MG', animais_ativos: 100 }),
    fazenda({ id: 3, cidade: null, animais_ativos: 700 }),
  ]);
  assert.equal(cidades.length, 1);
  assert.equal(cidades[0].rotulo, 'Florestal · MG');
  assert.equal(cidades[0].propriedades, 2);
  assert.equal(cidades[0].fracaoAnimais, 0.3);
});

test('concentracao: fração acumulada das maiores e quantas bastam para 80%', () => {
  const c = concentracao(
    [
      fazenda({ id: 1, animais_ativos: 500 }),
      fazenda({ id: 2, animais_ativos: 300 }),
      fazenda({ id: 3, animais_ativos: 150 }),
      fazenda({ id: 4, animais_ativos: 50 }),
      fazenda({ id: 5, animais_ativos: 0 }),
    ],
    (l) => l.animais_ativos,
  );
  assert.equal(c.total, 1000);
  assert.equal(c.top1, 0.5);
  assert.equal(c.top3, 0.95);
  assert.equal(c.paraOitentaPorCento, 2, '500 + 300 = 80%, inclusive');
  assert.equal(c.maiores.length, 4, 'quem tem zero não entra na curva');
  assert.equal(c.maiores[1].acumulada, 0.8);
});

test('concentracao: sem total não vira NaN', () => {
  const c = concentracao([fazenda({ id: 1, mrr_mensal: 0 })], (l) => l.mrr_mensal);
  assert.equal(c.total, 0);
  assert.equal(c.top1, null);
  assert.equal(c.paraOitentaPorCento, null);
  assert.deepEqual(c.maiores, []);
});

test('faixasDeTamanho: as seis faixas sempre saem, com a borda fechada', () => {
  const faixas = faixasDeTamanho([
    fazenda({ id: 1, animais_ativos: 0 }),
    fazenda({ id: 2, animais_ativos: 50 }),
    fazenda({ id: 3, animais_ativos: 51 }),
    fazenda({ id: 4, animais_ativos: 601 }),
  ]);
  assert.equal(faixas.length, 6);
  assert.deepEqual(
    faixas.map((f) => f.propriedades),
    [1, 1, 1, 0, 0, 1],
  );
});

test('porSegmento: cada fazenda conta uma vez, pelo segmento principal, com as UFs onde está', () => {
  const segs = porSegmento([
    fazenda({ id: 1, segmento_principal: 'caprino_leiteiro', segmentos: ['caprino_leiteiro', 'ovino_corte'], uf: 'MG' }),
    fazenda({ id: 2, segmento_principal: 'ovino_leiteiro', uf: 'SP', animais_ativos: 900 }),
    fazenda({ id: 3, segmento_principal: null, segmentos: [], uf: null }),
  ]);
  assert.deepEqual(
    segs.map((s) => `${s.segmento}:${s.propriedades}`),
    ['ovino_leiteiro:1', 'caprino_leiteiro:1', 'Sem segmento:1'],
  );
  assert.deepEqual(segs[1].ufs, ['MG']);
});

test('semLocalizacao: as sem UF, das maiores para as menores', () => {
  const lista = semLocalizacao([
    fazenda({ id: 1, uf: null, animais_ativos: 10 }),
    fazenda({ id: 2, uf: 'MG' }),
    fazenda({ id: 3, uf: null, animais_ativos: 800 }),
  ]);
  assert.deepEqual(lista.map((l) => l.id), [3, 1]);
});
