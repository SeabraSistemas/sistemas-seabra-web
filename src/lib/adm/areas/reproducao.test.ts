/**
 * DG PENDENTE — agrupamento por baia e o texto de WhatsApp.
 *
 * A view (adm_07_areas.sql) já entrega `dg_pendentes` correto e ordenado; o que
 * este arquivo testa é a parte que roda no Next depois disso: o piso de dias
 * (`?dg=`), o agrupamento por baia (com "Sem baia" sempre por último) e o texto
 * que sai idêntico ao que a tela mostra — a garantia central de
 * `DiagnosticoGestaoPendente` é que a lista renderizada e o texto copiado NUNCA
 * divergem, porque os dois vêm do MESMO `agruparDgPendentes()`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { agruparDgPendentes, textoWhatsAppDgPendentes } from '@/lib/adm/areas/reproducao';
import type { LinhaDgPendente, LinhaReproducao } from '@/lib/adm/areas/contrato';

function linha(dgPendentes: LinhaDgPendente[]): LinhaReproducao {
  return {
    propriedade_id: 1,
    coberturas_12m: 0,
    inseminacoes_12m: 0,
    montas_12m: 0,
    te_12m: 0,
    diagnosticos_12m: 0,
    diagnosticos_positivos_12m: 0,
    taxa_prenhez: null,
    partos_12m: 0,
    abortos_12m: 0,
    idade_primeiro_parto_dias: null,
    prolificidade_media: null,
    intervalo_partos_dias: null,
    femeas_ativas: 0,
    gestantes: 0,
    serie_mensal: null,
    funil: null,
    dg_pendentes: dgPendentes,
  };
}

function animal(parcial: Partial<LinhaDgPendente>): LinhaDgPendente {
  return {
    numero_animal: '1',
    nome_animal: null,
    baia: 'G1-1',
    data_ultima_cobertura: '2026-01-01',
    dias_desde_cobertura: 60,
    tipo_cobertura: 'Monta livre',
    ...parcial,
  };
}

test('agruparDgPendentes', () => {
  test('sem lista nenhuma (propriedade nunca lançou cobertura) devolve vazio, não erro', () => {
    assert.deepEqual(agruparDgPendentes(linha(null as unknown as LinhaDgPendente[]), 60), []);
  });

  test('o piso é inclusivo: dias_desde_cobertura igual ao limiar entra', () => {
    const grupos = agruparDgPendentes(linha([animal({ dias_desde_cobertura: 60 })]), 60);
    assert.equal(grupos.length, 1);
    assert.equal(grupos[0].animais.length, 1);
  });

  test('abaixo do piso fica de fora — "ainda não deu tempo" não é pendência', () => {
    const grupos = agruparDgPendentes(linha([animal({ dias_desde_cobertura: 59 })]), 60);
    assert.deepEqual(grupos, []);
  });

  test('agrupa por baia, e baia vazia/nula vira o balde "Sem baia"', () => {
    const grupos = agruparDgPendentes(
      linha([
        animal({ numero_animal: '1', baia: 'G1-1' }),
        animal({ numero_animal: '2', baia: 'G1-1' }),
        animal({ numero_animal: '3', baia: null }),
        animal({ numero_animal: '4', baia: '  ' }),
      ]),
      0,
    );

    const porBaia = new Map(grupos.map((g) => [g.baia, g.animais.length]));
    assert.equal(porBaia.get('G1-1'), 2);
    assert.equal(porBaia.get('Sem baia'), 2, 'null e string em branco caem no mesmo balde');
  });

  test('"Sem baia" sempre por último, mesmo alfabeticamente antes de outras baias', () => {
    const grupos = agruparDgPendentes(
      linha([animal({ baia: 'Alfa' }), animal({ baia: null }), animal({ baia: 'Zulu' })]),
      0,
    );
    assert.deepEqual(
      grupos.map((g) => g.baia),
      ['Alfa', 'Zulu', 'Sem baia'],
    );
  });

  test('dentro do resultado, a ordem de baias é alfabética pt-BR', () => {
    const grupos = agruparDgPendentes(
      linha([animal({ baia: 'G1-10' }), animal({ baia: 'G1-2' })]),
      0,
    );
    // localeCompare pt-BR trata "G1-10" depois de "G1-2" como comparação de
    // texto puro (não numérica) — é o mesmo critério que baiaStatsList do GAS
    // usava (ordem alfabética simples, sem sort numérico de baia).
    assert.deepEqual(
      grupos.map((g) => g.baia),
      ['G1-10', 'G1-2'],
    );
  });
});

test('textoWhatsAppDgPendentes', () => {
  test('lista vazia não gera texto — o botão de copiar fica desabilitado, não copia string vazia com cabeçalho', () => {
    assert.equal(textoWhatsAppDgPendentes([], 60), '');
  });

  test('formato: cabeçalho com total e limiar, um bloco por baia, animal com e sem nome', () => {
    const grupos = agruparDgPendentes(
      linha([
        animal({ numero_animal: '10', nome_animal: 'Mimosa', baia: 'G1-1', dias_desde_cobertura: 70 }),
        animal({ numero_animal: '20', nome_animal: null, baia: 'G1-1', dias_desde_cobertura: 65 }),
      ]),
      60,
    );

    const texto = textoWhatsAppDgPendentes(grupos, 60);

    assert.match(texto, /mais de 60 dias de cobertura \(2\)/);
    assert.match(texto, /\*G1-1:\*/);
    assert.match(texto, /Nº 10 - Mimosa \(70 dias/);
    assert.match(texto, /Nº 20 \(65 dias/);
    // A data ISO da view vira BR no texto — é o formato que se cola no
    // WhatsApp, ninguém lá lê 'YYYY-MM-DD'.
    assert.match(texto, /01\/01\/2026/);
  });
});
