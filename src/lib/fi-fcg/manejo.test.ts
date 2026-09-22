import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { animaisMonitorados, resolverIdCanonico, ultimoManejoPorAnimal, type FontesManejo } from '@/lib/fi-fcg/manejo';
import type {
  RegAborto,
  RegClinica,
  RegD8,
  RegEmbarque,
  RegEngordaEvento,
  RegIatf,
  RegManejoSanitario,
  RegParto,
  RegPesagem,
  RegProtocolo,
  RegRebanho,
  RegToque,
  RegTransferir,
} from '@/lib/fi-fcg/types';

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
function manejoSanitario(p: Partial<RegManejoSanitario> & { idAnimal: string; data: number }): RegManejoSanitario {
  return { id: 'm1', brucelose: null, carbunculo: null, vermifugo: null, carrapato: null, mosca: null, ...p };
}
function d8(p: Partial<RegD8> & { idAnimal: string; data: number }): RegD8 {
  return { id: 'd8-1', produto: null, ...p };
}
function protocolo(p: Partial<RegProtocolo> & { idAnimal: string; data: number }): RegProtocolo {
  return { id: 'proto-1', produto: null, ...p };
}
function transferir(p: Partial<RegTransferir> & { idAnimal: string; data: number }): RegTransferir {
  return { id: 't1', fazenda: null, ...p };
}
function engordaEvento(p: Partial<RegEngordaEvento> & { idAnimal: string; data: number }): RegEngordaEvento {
  return { id: 'e1', pesoEntrada: null, ...p };
}
function clinica(p: Partial<RegClinica> & { idAnimal: string; data: number }): RegClinica {
  return { id: 'c1', caso: null, diagnostico: null, ...p };
}
function aborto(p: Partial<RegAborto> & { idAnimal: string; data: number }): RegAborto {
  return { id: 'ab1', suspeita: null, fazenda: null, ...p };
}
function embarque(p: Partial<RegEmbarque> & { idAnimal: string; data: number }): RegEmbarque {
  return { id: 'emb1', embarcado: null, ...p };
}

function fontesVazias(overrides: Partial<FontesManejo> = {}): FontesManejo {
  return {
    pesagem: [], toque: [], iatf: [], partos: [], manejoSanitario: [], d8: [], protocolo: [],
    transferir: [], engordaEventos: [], clinica: [], abortos: [], embarque: [], ...overrides,
  };
}

describe('ultimoManejoPorAnimal', () => {
  test('pega a data mais recente entre Pesagem/Toque/IATF/Parto (como mãe) de cada animal', () => {
    const mapa = ultimoManejoPorAnimal([], fontesVazias({
      pesagem: [pesagem({ id: 'a1', data: 20260101 }), pesagem({ id: 'a1', data: 20260301 })],
      toque: [toque({ id: 'a1', data: 20260201 })],
      iatf: [iatf({ id: 'a1', data: 20250101 })],
    }));
    assert.equal(mapa.get('a1'), 20260301); // a pesagem de marco e a mais recente das 3
  });

  test('Parto conta pra MAE (ID Mae), nao pro bezerro', () => {
    const mapa = ultimoManejoPorAnimal([], fontesVazias({ partos: [parto({ idMae: 'vaca1', nascimento: 20260315 })] }));
    assert.equal(mapa.get('vaca1'), 20260315);
    assert.equal(mapa.get('bezerro-vaca1'), undefined);
  });

  test('animal sem nenhum evento: nao aparece no mapa', () => {
    const mapa = ultimoManejoPorAnimal([], fontesVazias({ pesagem: [pesagem({ id: 'a1', data: 20260101 })] }));
    assert.equal(mapa.has('a2'), false);
  });

  test('linhas sem data ou sem id sao ignoradas', () => {
    const mapa = ultimoManejoPorAnimal([], fontesVazias({
      pesagem: [pesagem({ id: 'a1', data: null as unknown as number }), pesagem({ id: '', data: 20260101 })],
    }));
    assert.equal(mapa.size, 0);
  });

  test('as 8 fontes novas (Manejo/D8/Protocolo/Transferir/Engorda/Clinica/Aborto/Embarque) contam pro idAnimal', () => {
    for (const [nome, fontes] of Object.entries({
      manejoSanitario: [manejoSanitario({ idAnimal: 'a1', data: 20260501 })],
      d8: [d8({ idAnimal: 'a1', data: 20260501 })],
      protocolo: [protocolo({ idAnimal: 'a1', data: 20260501 })],
      transferir: [transferir({ idAnimal: 'a1', data: 20260501 })],
      engordaEventos: [engordaEvento({ idAnimal: 'a1', data: 20260501 })],
      clinica: [clinica({ idAnimal: 'a1', data: 20260501 })],
      abortos: [aborto({ idAnimal: 'a1', data: 20260501 })],
      embarque: [embarque({ idAnimal: 'a1', data: 20260501 })],
    })) {
      const mapa = ultimoManejoPorAnimal([], fontesVazias({ [nome]: fontes } as Partial<FontesManejo>));
      assert.equal(mapa.get('a1'), 20260501, `fonte ${nome} deveria contar como manejo`);
    }
  });

  test('a fonte mais recente vence mesmo vindo de uma aba nova (ex: Manejo depois da ultima Pesagem)', () => {
    const mapa = ultimoManejoPorAnimal([], fontesVazias({
      pesagem: [pesagem({ id: 'a1', data: 20260101 })],
      manejoSanitario: [manejoSanitario({ idAnimal: 'a1', data: 20260601 })],
    }));
    assert.equal(mapa.get('a1'), 20260601);
  });

  test('lancamento gravado com a ID eletronica (chip) ainda conta pro animal, via resolverIdCanonico', () => {
    const rebanho = [animal({ id: 'G149', eletronica: '900215007821064' })];
    const mapa = ultimoManejoPorAnimal(rebanho, fontesVazias({
      manejoSanitario: [manejoSanitario({ idAnimal: '900215007821064', data: 20260601 })],
    }));
    assert.equal(mapa.get('G149'), 20260601);
    assert.equal(mapa.has('900215007821064'), false);
  });
});

describe('resolverIdCanonico', () => {
  test('ID que ja bate com "ID animal" de algum animal: devolve sem mudar', () => {
    const resolver = resolverIdCanonico([animal({ id: 'G149', eletronica: '900215007821064' })]);
    assert.equal(resolver('G149'), 'G149');
  });

  test('ID que so bate com a "ID eletronica" (chip): resolve pro "ID animal" canonico', () => {
    const resolver = resolverIdCanonico([animal({ id: 'G149', eletronica: '900215007821064' })]);
    assert.equal(resolver('900215007821064'), 'G149');
  });

  test('ID que nao bate com nada: devolve o bruto sem mudar (continua orfao)', () => {
    const resolver = resolverIdCanonico([animal({ id: 'G149', eletronica: '900215007821064' })]);
    assert.equal(resolver('inexistente'), 'inexistente');
  });

  test('null/vazio passam direto', () => {
    const resolver = resolverIdCanonico([animal({ id: 'G149' })]);
    assert.equal(resolver(null), null);
  });
});

describe('animaisMonitorados', () => {
  const HOJE = 20260916;

  test('animal com manejo recente: dias baixo, carrega fazenda/categoria/sexo/nascimento do rebanho', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', fazenda: 'Inhumas', categoria: 'Vaca', sexo: 'Fêmea', nascimento: 20200101 })],
      fontesVazias({ pesagem: [pesagem({ id: 'a1', data: 20260906 })] }),
      HOJE,
    );
    assert.deepEqual(resultado, [
      {
        id: 'a1',
        fazenda: 'Inhumas',
        categoria: 'Vaca',
        sexo: 'Fêmea',
        nascimento: 20200101,
        diasSemManejo: 10,
        ultimoManejo: 20260906,
      },
    ]);
  });

  test('animal sem nenhum evento conhecido: diasSemManejo e ultimoManejo null (nao vira 0 nem inventa numero)', () => {
    const resultado = animaisMonitorados([animal({ id: 'a1', categoria: 'Vaca' })], fontesVazias(), HOJE);
    assert.equal(resultado[0].diasSemManejo, null);
    assert.equal(resultado[0].ultimoManejo, null);
  });

  test('usa o mais recente entre varias fontes pro mesmo animal, incluindo as novas', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', categoria: 'Vaca' })],
      fontesVazias({
        pesagem: [pesagem({ id: 'a1', data: 20260101 })],
        toque: [toque({ id: 'a1', data: 20260201 })],
        iatf: [iatf({ id: 'a1', data: 20260301 })],
        transferir: [transferir({ idAnimal: 'a1', data: 20260901 })], // mais recente
      }),
      HOJE,
    );
    assert.equal(resultado[0].diasSemManejo, 15);
    assert.equal(resultado[0].ultimoManejo, 20260901);
  });

  test('uma linha por animal ATIVO do rebanho recebido, na mesma ordem', () => {
    const resultado = animaisMonitorados(
      [animal({ id: 'a1', categoria: 'Vaca' }), animal({ id: 'a2', categoria: 'Bezerro' })],
      fontesVazias({ pesagem: [pesagem({ id: 'a2', data: 20260816 })] }),
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
      fontesVazias(),
      HOJE,
    );
    assert.deepEqual(resultado.map((r) => r.id), ['a1']);
  });

  test('Leiteira entra (mesmo criterio de CATEGORIAS_ATIVAS do Rebanho); Historico/Semen ficam de fora', () => {
    const resultado = animaisMonitorados(
      [
        animal({ id: 'a1', categoria: 'Leiteira' }),
        animal({ id: 'a2', categoria: 'Histórico' }),
        animal({ id: 'a3', categoria: 'Sêmen' }),
      ],
      fontesVazias(),
      HOJE,
    );
    assert.deepEqual(resultado.map((r) => r.id), ['a1']);
  });
});
