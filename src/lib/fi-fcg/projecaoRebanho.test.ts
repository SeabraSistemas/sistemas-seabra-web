import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DIAS_GESTACAO_BOVINO, IATF_MAX_DIAS, TOQUE_MAX_DIAS, projetarRebanho } from '@/lib/fi-fcg/projecaoRebanho';
import { mesDe, proximoMes } from '@/lib/fi-fcg/custos';
import { somarDias } from '@/lib/painel/format';
import type { MarcoIdade, RegIatf, RegRebanho, RegToque } from '@/lib/fi-fcg/types';

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
function toqueReg(p: Partial<RegToque> & { id: string }): RegToque {
  return {
    data: null, diagnostico: null, destino: null, escore: null, escoreNum: null, observacao: null,
    idadeAnos: null, status: null, reproducao: null, fazenda: null, lote: null, pesoKg: null, touroIatf: null, ...p,
  };
}
function marco(nome: string, idadeDias: number): MarcoIdade {
  return { id: nome, marco: nome, idadeDias };
}

const HOJE = 20260916; // mesmo "hoje" da sessao

describe('projetarRebanho — partos previstos', () => {
  test('vaca Prenha com IATF: parto previsto = ultima Data IATF + 283 dias, no mes certo', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const iatfRows = [iatf({ id: 'v1', data: 20260101 })];
    const proj = projetarRebanho(rebanho, iatfRows, [], [], null, 30, HOJE); // parto cai ~25 dias apos HOJE
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
    const proj = projetarRebanho(rebanho, iatfRows, [], [], null, 30, HOJE);
    const mesEsperado = String(Math.floor((somarDias(20260101, DIAS_GESTACAO_BOVINO) as number) / 100));
    assert.equal(proj.meses.find((m) => m.mes === mesEsperado)!.partosPrevistos, 1);
  });

  test('Prenha sem NENHUM registro de IATF: conta em partosSemDataConhecida, nao em nenhum mes', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const proj = projetarRebanho(rebanho, [], [], [], null, 180, HOJE);
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
    const proj = projetarRebanho(rebanho, iatfRows, [], [], null, 30, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
    assert.equal(proj.partosSemDataConhecida, 0); // nao sao Prenha, entao nem entram nessa contagem
  });

  test('parto previsto fora do horizonte: nao aparece em nenhum mes (nao inventa um balde)', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const iatfRows = [iatf({ id: 'v1', data: HOJE })]; // parto soh daqui a 283 dias
    const proj = projetarRebanho(rebanho, iatfRows, [], [], null, 30, HOJE); // horizonte de so 30 dias
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
  });

  test('IATF velho demais (repasse nao lancado): cai pro Toque recente que confirmou prenhez', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', fazenda: 'Inhumas', reproducao: 'Prenha' })];
    const dataIatfVelha = somarDias(HOJE, -(IATF_MAX_DIAS + 1)) as number; // passou do limite
    const dataToqueRecente = somarDias(HOJE, -30) as number; // bem dentro do limite de Toque, parto cai ~253 dias apos HOJE
    const iatfRows = [iatf({ id: 'v1', data: dataIatfVelha })];
    const toqueRows = [toqueReg({ id: 'v1', data: dataToqueRecente, diagnostico: 'Regular' })];
    const proj = projetarRebanho(rebanho, iatfRows, toqueRows, [], null, 260, HOJE);
    const mesEsperado = String(Math.floor((somarDias(dataToqueRecente, DIAS_GESTACAO_BOVINO) as number) / 100));
    assert.equal(proj.meses.find((m) => m.mes === mesEsperado)?.partosPrevistos, 1);
    assert.equal(proj.partosEstimadosViaToque, 1);
    assert.equal(proj.partosSemDataConhecida, 0);
    assert.equal(proj.animaisEstimadosViaToque.length, 1);
    assert.equal(proj.animaisEstimadosViaToque[0].id, 'v1');
    assert.equal(proj.animaisEstimadosViaToque[0].fazenda, 'Inhumas');
    assert.equal(proj.animaisEstimadosViaToque[0].dataToque, dataToqueRecente);
  });

  test('IATF recente (dentro do limite): usa o IATF, nao cai pro Toque mesmo se ele existir', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const dataIatfRecente = somarDias(HOJE, -10) as number; // parto cai ~273 dias apos HOJE
    const iatfRows = [iatf({ id: 'v1', data: dataIatfRecente })];
    const toqueRows = [toqueReg({ id: 'v1', data: somarDias(HOJE, -5) as number, diagnostico: 'Regular' })];
    const proj = projetarRebanho(rebanho, iatfRows, toqueRows, [], null, 280, HOJE);
    const mesEsperado = String(Math.floor((somarDias(dataIatfRecente, DIAS_GESTACAO_BOVINO) as number) / 100));
    assert.equal(proj.meses.find((m) => m.mes === mesEsperado)?.partosPrevistos, 1);
    assert.equal(proj.partosEstimadosViaToque, 0);
  });

  test('IATF velho demais E Toque tambem velho demais: sem ancora, vira partosSemDataConhecida', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const iatfRows = [iatf({ id: 'v1', data: somarDias(HOJE, -(IATF_MAX_DIAS + 1)) as number })];
    const toqueRows = [toqueReg({ id: 'v1', data: somarDias(HOJE, -(TOQUE_MAX_DIAS + 1)) as number, diagnostico: 'Regular' })];
    const proj = projetarRebanho(rebanho, iatfRows, toqueRows, [], null, 365, HOJE);
    assert.equal(proj.partosSemDataConhecida, 1);
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 0);
    assert.equal(proj.animaisSemDataConhecida.length, 1);
    assert.equal(proj.animaisSemDataConhecida[0].id, 'v1');
    assert.equal(proj.animaisSemDataConhecida[0].ultimaIatf, iatfRows[0].data);
    assert.equal(proj.animaisSemDataConhecida[0].ultimoToque, toqueRows[0].data);
  });

  test('Toque com Diagnostico "Vazia" nao confirma prenhez: nao serve de ancora', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const toqueRows = [toqueReg({ id: 'v1', data: somarDias(HOJE, -10) as number, diagnostico: 'Vazia' })];
    const proj = projetarRebanho(rebanho, [], toqueRows, [], null, 365, HOJE);
    assert.equal(proj.partosSemDataConhecida, 1);
  });

  test('sem IATF nenhum mas com Toque recente confirmando prenhez: usa o Toque', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha' })];
    const dataToque = somarDias(HOJE, -50) as number; // parto cai ~233 dias apos HOJE
    const toqueRows = [toqueReg({ id: 'v1', data: dataToque, diagnostico: 'Tardia' })];
    const proj = projetarRebanho(rebanho, [], toqueRows, [], null, 240, HOJE);
    const mesEsperado = String(Math.floor((somarDias(dataToque, DIAS_GESTACAO_BOVINO) as number) / 100));
    assert.equal(proj.meses.find((m) => m.mes === mesEsperado)?.partosPrevistos, 1);
    assert.equal(proj.partosEstimadosViaToque, 1);
  });
});

describe('projetarRebanho — mudanca de categoria', () => {
  test('idade ja vencida (>= idade do marco): migra logo no 1o dia do horizonte', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) })]; // 300 dias de vida
    const marcos = [marco('Bezerro -> Garrote', 200)]; // marco ja passou
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 90, HOJE);
    assert.equal(proj.meses[0].migracoes.length, 1);
    assert.deepEqual(proj.meses[0].migracoes[0], { de: 'Bezerro', para: 'Garrote', quantidade: 1 });
  });

  test('idade cruza o marco DENTRO do horizonte: cai no mes certo', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -100) })]; // 100 dias de vida hoje
    const marcos = [marco('Bezerro -> Garrote', 160)]; // faltam 60 dias
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 90, HOJE);
    const dataTransicao = somarDias(HOJE, 60) as number;
    const mesEsperado = String(Math.floor(dataTransicao / 100));
    const mesAchado = proj.meses.find((m) => m.migracoes.length > 0);
    assert.equal(mesAchado?.mes, mesEsperado);
  });

  test('transicao fora do horizonte: nao migra em nenhum mes', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: HOJE })]; // recem-nascido
    const marcos = [marco('Bezerro -> Garrote', 400)]; // 400 dias, alem de qualquer horizonte curto
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 30, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('Novilha vira Vaca no marco de 1o PARTO, nao no de 1a cobertura', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Novilha', nascimento: somarDias(HOJE, -1000) })];
    const marcos = [
      marco('Novilha -> Vaca (1a cobertura)', 300), // ja vencido tambem, mas NAO e esse que vale
      marco('Novilha -> Vaca (1o parto)', 583),
    ];
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE);
    assert.deepEqual(proj.meses[0].migracoes, [{ de: 'Novilha', para: 'Vaca', quantidade: 1 }]);
  });

  test('sem o marco cadastrado: essa transicao simplesmente nao acontece (nao finge idade)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -1000) })];
    const proj = projetarRebanho(rebanho, [], [], [], null, 90, HOJE); // sem nenhum marco
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('Touro fica fora das transicoes (selecao manual, nao idade)', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -1000) })];
    // mesmo com um marco (hipotetico) de saida pra Touro, TRANSICOES_CATEGORIA nao usa ele
    const marcos = [marco('Bezerro -> Touro', 1)];
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE);
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('efetivoPorCategoriaFinal reflete as migracoes acumuladas (nascimentos NAO entram)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) }),
      animal({ id: 'a2', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) }),
      animal({ id: 'a3', categoria: 'Garrote', nascimento: somarDias(HOJE, -500) }),
    ];
    const marcos = [marco('Bezerro -> Garrote', 200)];
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 2, Garrote: 1 });
    assert.deepEqual(proj.efetivoPorCategoriaFinal, { Bezerro: 0, Garrote: 3 });
  });

  test('filtroIdade: animal fora da faixa (idade na data final) NAO aparece na migracao', () => {
    // 300 dias hoje, +10 dias de horizonte => 310 dias na data final — fora de [0, 305]
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) })];
    const marcos = [marco('Bezerro -> Garrote', 200)]; // ja vencido, migraria se nao fosse o filtro
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE, { minDias: 0, maxDias: 305 });
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 0);
  });

  test('filtroIdade: animal dentro da faixa (idade na data final) aparece normalmente', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) })];
    const marcos = [marco('Bezerro -> Garrote', 200)];
    const proj = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE, { minDias: 0, maxDias: 400 });
    assert.equal(proj.meses.reduce((s, m) => s + m.migracoes.length, 0), 1);
  });

  test('filtroIdade omitido (undefined/null): nao filtra nada, comportamento igual ao original', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Bezerro', nascimento: somarDias(HOJE, -300) })];
    const marcos = [marco('Bezerro -> Garrote', 200)];
    const semFiltro = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE);
    const filtroNull = projetarRebanho(rebanho, [], [], marcos, null, 10, HOJE, null);
    assert.equal(semFiltro.meses.reduce((s, m) => s + m.migracoes.length, 0), 1);
    assert.equal(filtroNull.meses.reduce((s, m) => s + m.migracoes.length, 0), 1);
  });

  test('filtroIdade nao afeta partos previstos (calculado a parte)', () => {
    const rebanho = [animal({ id: 'v1', categoria: 'Vaca', reproducao: 'Prenha', nascimento: somarDias(HOJE, -10000) })]; // vaca bem velha
    const iatfRows = [iatf({ id: 'v1', data: 20260101 })];
    // filtro estreito que excluiria essa vaca da migracao, mas parto nao usa idade
    const proj = projetarRebanho(rebanho, iatfRows, [], [], null, 30, HOJE, { minDias: 0, maxDias: 100 });
    assert.equal(proj.meses.reduce((s, m) => s + m.partosPrevistos, 0), 1);
  });
});

describe('projetarRebanho — geral', () => {
  test('fazenda filtra o rebanho considerado (mesmo criterio das outras telas)', () => {
    const rebanho = [
      animal({ id: 'a1', categoria: 'Bezerro', fazenda: 'Inhumas' }),
      animal({ id: 'a2', categoria: 'Bezerro', fazenda: 'Campina grande' }),
    ];
    const proj = projetarRebanho(rebanho, [], [], [], 'Inhumas', 10, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 1 });
  });

  test('exclui Venda/Baixa do efetivo', () => {
    const rebanho = [animal({ id: 'a1', categoria: 'Venda' }), animal({ id: 'a2', categoria: 'Bezerro' })];
    const proj = projetarRebanho(rebanho, [], [], [], null, 10, HOJE);
    assert.deepEqual(proj.efetivoPorCategoriaHoje, { Bezerro: 1 });
  });

  test('horizonte em dias gera meses consecutivos cobrindo hoje ate hoje+horizonteDias, sem buraco', () => {
    const horizonteDias = 46; // atravessa 2 viradas de mes a partir de HOJE (20260916)
    const dataFinal = somarDias(HOJE, horizonteDias) as number;
    const proj = projetarRebanho([], [], [], [], null, horizonteDias, HOJE);
    assert.equal(proj.meses[0].mes, mesDe(HOJE));
    assert.equal(proj.meses[proj.meses.length - 1].mes, mesDe(dataFinal));
    let mesEsperado = mesDe(HOJE);
    for (const m of proj.meses) {
      assert.equal(m.mes, mesEsperado);
      mesEsperado = proximoMes(mesEsperado);
    }
  });

  test('horizonte invalido (0 ou negativo) vira no minimo 1 dia', () => {
    const proj = projetarRebanho([], [], [], [], null, 0, HOJE);
    assert.equal(proj.meses[0].mes, mesDe(HOJE));
  });
});
