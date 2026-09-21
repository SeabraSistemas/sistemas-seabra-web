import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { animaisMonitorados, ultimoManejoPorAnimal } from '@/lib/fi-fcg/manejo';
import type { RegIatf, RegParto, RegPesagem, RegRebanho, RegToque } from '@/lib/fi-fcg/types';

function animal(p: Partial<RegRebanho> & { id: string }): RegRebanho {
  return {
    eletronica: null, marca: null, sexo: null, categoria: null, causaBaixa: null, idadeMeses: null, fazenda: null,
    lote: null, status: null, reproducao: null, escore: null, destino: null, ultimaPesagemKg: null,
    dataUltimaPesagem: null, nascimento: null, entradaEngorda: null, diasEngordaAtual: null,
    pesoEntradaEngorda: null, gmdAtual: null, ...p,
  };
}
function pesagem(p: Partial<RegPesagem> & { id: string; data: number }): RegPesagem {
  return {
    pesoKg: null, entradaKg: null, diasEngorda: null, gpd: null, gmd: null, pdi: null, gpdi: null,
    fazenda: null, lote: null, sexo: null, destino: null, diferencaKg: null, ...p,
  };
}
function toque(p: Partial<RegToque> & { id: string; data: number }): RegToque {
  return {
    diagnostico: null, destino: null, escore: null, escoreNum: null, observacao: null, idadeAnos: null,
    status: null, reproducao: null, fazenda: null, lote: null, pesoKg: null, touroIatf: null, ...p,
  };
}
function iatf(p: Partial<RegIatf> & { id: string; data: number }): RegIatf {
  return { protocolo: null, metodo: null, partida: null, inseminador: null, ecc: null, eccNum: null, fazenda: null, lote: null, pesoKg: null, ...p };
}
function parto(p: Partial<RegParto> & { idMae: string; nascimento: number }): RegParto {
  return {
    id: `bezerro-${p.idMae}`, eletronica: null, marca: null, idPai: null, sexo: null, metodo: null,
    pesoNascimento: null, fazenda: null, categoria: null, ...p,
  };
}

describe('ultimoManejoPorAnimal', () => {
  test('pega a data mais recente entre Pesagem/Toque/IATF/Parto (como mãe) de cada animal', () => {
    const mapa = ultimoManejoPorAnimal(
      [pesagem({ id: 'a1', data: 20260101 }), pesagem({ id: 'a1', data: 20260301 })],
      [toque({ id: 'a1', data: 20260201 })],
      [iatf({ id: 'a1', data: 20250101 })],
      [],
    );
    assert.equal(mapa.get('a1'), 20260301); // a pesagem de marco e a mais recente das 3
  });

  test('Parto conta pra MAE (ID Mae), nao pro bezerro', () => {
    const mapa = ultimoManejoPorAnimal([], [], [], [parto({ idMae: 'vaca1', nascimento: 20260315 })]);
    assert.equal(mapa.get('vaca1'), 20260315);
    assert.equal(mapa.get('bezerro-vaca1'), undefined);
  });

  test('animal sem nenhum evento: nao aparece no mapa', () => {
    const mapa = ultimoManejoPorAnimal([pesagem({ id: 'a1', data: 20260101 })], [], [], []);
    assert.equal(mapa.has('a2'), false);
  });

  test('linhas sem data ou sem id sao ignoradas', () => {
    const mapa = ultimoManejoPorAnimal(
      [pesagem({ id: 'a1', data: null as unknown as number }), pesagem({ id: '', data: 20260101 })],
      [],
      [],
      [],
    );
    assert.equal(mapa.size, 0);
  });
});

describe('animaisMonitorados', () => {
  const HOJE = 20260916;

  test('animal com manejo recente: dias baixo, carrega fazenda/categoria/sexo do rebanho', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', fazenda: 'Inhumas', categoria: 'Vaca', sexo: 'Fêmea' })],
      [pesagem({ id: 'a1', data: 20260906 })],
      [],
      [],
      [],
      HOJE,
    );
    assert.deepEqual(resultado, [
      { id: 'a1', fazenda: 'Inhumas', categoria: 'Vaca', sexo: 'Fêmea', diasSemManejo: 10, ultimoManejo: 20260906 },
    ]);
  });

  test('animal sem nenhum evento conhecido: diasSemManejo e ultimoManejo null (nao vira 0 nem inventa numero)', () => {
    const resultado = animaisMonitorados([animal({ id: 'a1', categoria: 'Vaca' })], [], [], [], [], HOJE);
    assert.equal(resultado[0].diasSemManejo, null);
    assert.equal(resultado[0].ultimoManejo, null);
  });

  test('usa o mais recente entre varias fontes pro mesmo animal', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', categoria: 'Vaca' })],
      [pesagem({ id: 'a1', data: 20260101 })],
      [toque({ id: 'a1', data: 20260901 })], // mais recente
      [iatf({ id: 'a1', data: 20260201 })],
      [],
      HOJE,
    );
    assert.equal(resultado[0].diasSemManejo, 15);
    assert.equal(resultado[0].ultimoManejo, 20260901);
  });

  test('uma linha por animal ATIVO do rebanho recebido, na mesma ordem', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', categoria: 'Vaca' }), animal({ id: 'a2', categoria: 'Bezerro' })],
      [pesagem({ id: 'a2', data: 20260816 })],
      [],
      [],
      [],
      HOJE,
    );
    assert.equal(resultado.length, 2);
    assert.equal(resultado[0].id, 'a1');
    assert.equal(resultado[0].diasSemManejo, null);
    assert.equal(resultado[1].id, 'a2');
    assert.equal(resultado[1].diasSemManejo, 31);
  });

  test('Venda/Baixa ficam de fora — so animal ATIVO precisa de monitoramento', () => {
    const resultado = animaisMonitorados(
      [
        animal({ id: 'a1', categoria: 'Vaca' }),
        animal({ id: 'a2', categoria: 'Venda' }),
        animal({ id: 'a3', categoria: 'Baixa' }),
      ],
      [],
      [],
      [],
      [],
      HOJE,
    );
    assert.deepEqual(resultado.map((r) => r.id), ['a1']);
  });
});
