import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DIAS_GESTACAO_BOVINO, projetarRebanho } from '@/lib/fi-fcg/projecaoRebanho';
import { somarDias } from '@/lib/painel/format';
import type { MarcoIdade, RegIatf, RegRebanho } from '@/lib/fi-fcg/types';

function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, entradaEngorda: null, diasEngordaAtual: null,
    pesoEntradaEngorda: null, gmdAtual: null, ...p,
  };
}
function iatf(p: Partial<RegIatf> & { id: string }): RegIatf {
  return { data: null, protocolo: null, metodo: null, partida: null, inseminador: null, ecc: null, eccNum: null, fazenda: null, lote: null, pesoKg: null, ...p };
}
function marco(nome: string, idadeDias: number): MarcoIdade {
  return { id: nome, marco: nome, idadeDias };
}

const HOJE = 20260916; // mesmo "hoje" da sessao

describe('projetarRebanho — partos previstos', () => {
  test('vaca Prenha com IATF: parto previsto = ultima Data IATF + 283 dias, no mes certo', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const iatfRows = [iatf({ id: 'v1', data: 20260101 })];
    const proj = projetarRebanho(rebanho, iatfRows, [], null, 6, HOJE);
    const mesEsperado = String(Math.floor((somarDias(20260101, DIAS_GESTACAO_BOVINO) as number) / 100));
    const mes = proj.meses.find((m) => m.mes === mesEsperado);
    assert.ok(mes, `esperava achar o mes ${mesEsperado}`);
    assert.equal(mes!.partosPrevistos, 1);
    assert.equal(proj.partosSemDataConhecida, 0);
  });

  test('usa a Data IATF MAIS RECENTE quando o animal tem varias', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const iatfRows = [
      iatf({ id: 'v1', data: 20250101 }), // repeticao antiga, nao e essa que vale
      iatf({ id: 'v1', data: 20260101 }), // a mais recente
    ];
    const proj = projetarRebanho(rebanho, iatfRows, [], null, 12, HOJE);
    const mesEsperado = String(Math.floor((somarDias(20260101, DIAS_GESTACAO_BOVINO) as number) / 100));
    assert.equal(proj.meses.find((m) => m.mes === mesEsperado)!.partosPrevistos, 1);
  });

  test('Prenha sem NENHUM registro de IATF: conta em partosSemDataConhecida, nao em nenhum mes', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const proj = projetarRebanho(rebanho, [], [], null, 6, HOJE);
    assert.equal(proj.partosSemDataConhecida, 1);
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
  });

  test('so conta quem esta "Prenha" — Vazia/Coberta/vazio ficam de fora', () => {
    const rebanho = [
      animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Vazia' }),
      animal({ id: 'v2', categoria: 'Vaca', reproducao: 'Coberta' }),
      animal({ id: 'v3', categoria: 'Vaca', reproducao: null }),
    ];
    const iatfRows = [iatf({ id: 'v1', data: 20260101 }), iatf({ id: 'v2', data: 20260101 }), iatf({ id: 'v3', data: 20260101 })];
    const proj = projetarRebanho(rebanho, iatfRows, [], null, 12, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
    assert.equal(proj.partosSemDataConhecida, 0); // nao sao Prenha, entao nem entram nessa contagem
  });

  test('parto previsto fora do horizonte: nao aparece em nenhum mes (nao inventa um balde)', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const iatfRows = [iatf({ id: 'v1', data: HOJE })]; // parto soh daqui a 283 dias, quase 10 meses
    const proj = projetarRebanho(rebanho, iatfRows, [], null, 1, HOJE); // horizonte de so 1 mes
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
  });
});

describe('projetarRebanho — mudanca de categoria', () => {
  test('idade ja vencida (>= idade do marco): migra logo no 1o mes do horizonte', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) })]; // 300 dias de vida
    const marcos = [marco('Bezerro -> Garrote', 200)]; // marco ja passou
    const proj = projetarRebanho(rebanho, [], marcos, null, 3, HOJE);
    assert.equal(proj.meses[0].migracoes.length, 1);
    assert.deepEqual(proj.meses[0].migracoes[0], { de: 'Bezerro', para: 'Garrote', quantidade: 1 });
  });

  test('idade cruza o marco DENTRO do horizonte: cai no mes certo', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -100) })]; // 100 dias de vida hoje
    const marcos = [marco('Bezerro -> Garrote', 160)]; // faltam 60 dias
    const proj = projetarRebanho(rebanho, [], marcos, null, 3, HOJE);
    const dataTransicao = somarDias(HOJE, 60) as number;
    const mesEsperado = String(Math.floor(dataTransicao / 100));
    const mesAchado = proj.meses.find((m) => m.migracoes.length > 0);
    assert.equal(mesAchado?.mes, mesEsperado);
  });

  test('transicao fora do horizonte: nao migra em nenhum mes', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: HOJE })]; // recem-nascido
    const marcos = [marco('Bezerro -> Garrote', 400)]; // 400 dias, alem de qualquer horizonte curto
    const proj = projetarRebanho(rebanho, [], marcos, null, 1, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('Novilha vira Vaca no marco de 1o PARTO, nao no de 1a cobertura', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Novilha', nascimento: somarDias(HOJE, -1000) })];
    const marcos = [
      marco('Novilha -> Vaca (1a cobertura)', 300), // ja vencido tambem, mas NAO e esse que vale
      marco('Novilha -> Vaca (1o parto)', 583),
    ];
    const proj = projetarRebanho(rebanho, [], marcos, null, 1, HOJE);
    assert.deepEqual(proj.meses[0].migracoes, [{ de: 'Novilha', para: 'Vaca', quantidade: 1 }]);
  });

  test('sem o marco cadastrado: essa transicao simplesmente nao acontece (nao finge idade)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -1000) })];
    const proj = projetarRebanho(rebanho, [], [], null, 3, HOJE); // sem nenhum marco
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('Touro fica fora das transicoes (selecao manual, nao idade)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -1000) })];
    // mesmo com um marco (hipotetico) de saida pra Touro, TRANSICOES_CATEGORIA nao usa ele
    const marcos = [marco('Bezerro -> Touro', 1)];
    const proj = projetarRebanho(rebanho, [], marcos, null, 1, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('efetivoPorCategoriaFinal reflete as migracoes acumuladas (nascimentos NAO entram)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) }),
      animal({ id: 'a2', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) }),
      animal({ id: 'a3', categoria: 'Garrote', nascimento: somarDias(HOJE, -500) }),
    ];
    const marcos = [marco('Bezerro -> Garrote', 200)];
    const proj = projetarRebanho(rebanho, [], marcos, null, 1, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 2, Garrote: 1 });
    assert.deepEqual(proj.efetivoPorCategoriaFinal, { Bezerro: 0, Garrote: 3 });
  });
});

describe('projetarRebanho — geral', () => {
  test('fazenda filtra o rebanho considerado (mesmo criterio das outras telas)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' }),
      animal({ id: 'a2', categoria: 'Bezerro', fazenda: 'Campina grande' }),
    ];
    const proj = projetarRebanho(rebanho, [], [], 'Inhumas', 1, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 1 });
  });

  test('exclui Venda/Baixa do efetivo', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Venda' }), animal({ id: 'a2', categoria: 'Bezerro' })];
    const proj = projetarRebanho(rebanho, [], [], null, 1, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 1 });
  });

  test('horizonte gera N meses consecutivos comecando no mes de hoje', () => {
    const proj = projetarRebanho([], [], [], null, 3, HOJE);
    assert.deepEqual(proj.meses.map((m) => m.mes), ['202609', '202610', '202611']);
  });

  test('horizonte invalido (0 ou negativo) vira no minimo 1 mes', () => {
    const proj = projetarRebanho([], [], [], null, 0, HOJE);
    assert.equal(proj.meses.length, 1);
  });
});
