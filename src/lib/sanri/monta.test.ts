import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  COLUNAS_ESTACAO,
  acompanharFemea,
  candidatas,
  chaveDe,
  conflitoReprodutor,
  criarIndice,
  estacaoAtiva,
  indicadores,
  mapAnimais,
  mapCoberturas,
  mapCrias,
  mapDiagnosticos,
  mapEstacoes,
  mapIA,
  type DadosReproducao,
  type Estacao,
} from '@/lib/sanri/monta';

// RebanhoProd reduzido: ID, número, nome, microchip, sexo, categoria, baia.
const REBANHO = [
  ['ID', 'N° DO ANIMAL', 'NOME', 'MICROCHIP', 'SEXO', 'CATEGORIA', 'BAIA', 'DATA DO OBITO', 'DATA DA VENDA'],
  ['r-chope', '1421323472', 'CHOPE SANRI', '', 'Macho', 'Reprodutor', 'BODIL'],
  ['r-luxo', '1428222019', 'LUXO DA MANTIQUEIRA', '', 'Macho', 'Reprodutor', 'BODIL'],
  ['f-cristal', '1421325274', 'CRISTAL SANRI', '900255001300795', 'Fêmea', 'Recriada', 'G2-6'],
  ['f-faisca', '1421325285', 'FAÍSCA SANRI', '900255001300803', 'Fêmea', 'Recriada', 'G2-6'],
  ['f-mulan', '1421325298', 'MULAN SANRI', '900255001300907', 'Fêmea', 'Recriada', 'G2-6'],
];
const indice = criarIndice(mapAnimais(REBANHO));

const REPRODUCAO_H = ['ID', 'N° DO ANIMAL', 'MICROCHIP', 'NOME', 'DATA', 'REPRODUTOR', 'ID eletrônica|Reprodutor', 'ID Nome|Reprodutor', 'ID número|Reprodutor', 'PROTOCOLO', 'DATA US', 'DIAGNOSTICO'];
const DG_H = ['ID', 'N° DO ANIMAL', 'MICROCHIP', 'NOME', 'DATA DO DIAGNOSTICO', 'DIAGNOSTICO', 'Dias de gestação', 'ECC', 'OBS', 'Data da cobertura|IA', 'Parto estimado', 'Método', 'Reprodutor', 'Data da cobertura estimada'];
const PARTOS_H = ['ID', 'Identificação', 'Nome da cria', 'Placa da cria', 'Mãe', 'ID eletrônica|mãe', 'ID Nome|mãe', 'ID número|mãe', 'Pai', 'ID eletrônica|pai', 'ID Nome|pai', 'ID número|pai', 'Nascimento', 'Sexo'];
const IA_H = ['ID', 'N° DO ANIMAL', 'MICROCHIP', 'NOME', 'DATA', 'REPRODUTOR'];

/** Lote real de 21/09/2026: CRISTAL com o número com espaço, FAÍSCA com o número curto — os dois só batem pelo microchip. */
const REPRODUCAO = [
  REPRODUCAO_H,
  ['c1', '14213 25274', '900255001300795', 'CRISTAL SANRI', '21/09/2026', '1421323472', '', '', '1421323472', 'Natural', '21/10/2026'],
  ['c2', '25285', '900255001300803', 'FAÍSCA SANRI', '21/09/2026', '1421323472', '', '', '1421323472', 'Natural', '21/10/2026'],
  ['c3', '1421325298', '900255001300907', 'MULAN SANRI', '21/09/2026', '1421323472', '', '', '1421323472', 'Natural', '21/10/2026'],
  // Repasse da MULAN com o mesmo reprodutor, 3 semanas depois.
  ['c4', '1421325298', '900255001300907', 'MULAN SANRI', '12/10/2026', '1421323472', '', '', '1421323472', 'Natural', '11/11/2026'],
  // Cobertura de outro reprodutor, fora da estação.
  ['c5', '1421325285', '', 'FAÍSCA SANRI', '21/09/2026', '1428222019', '', '', '1428222019', 'Natural', '21/10/2026'],
];

function estacao(p: Partial<Estacao> = {}): Estacao {
  return {
    id: 'e1',
    reprodutor: 'r-chope',
    reprodutorNumero: '1421323472',
    reprodutorNome: 'CHOPE SANRI',
    inicio: 20260921,
    fim: 20261105,
    finalizadaEm: null,
    femeas: ['f-cristal', 'f-faisca', 'f-mulan'],
    obs: null,
    alteradaEm: 20260925,
    alteradaPor: 'x@y.z',
    criadaEm: 20260925,
    ...p,
  };
}

function dados(p: { dg?: string[][]; partos?: string[][]; ia?: string[][] } = {}): DadosReproducao {
  return {
    coberturas: mapCoberturas(REPRODUCAO, indice),
    diagnosticos: mapDiagnosticos([DG_H, ...(p.dg ?? [])], indice),
    crias: mapCrias([PARTOS_H, ...(p.partos ?? [])], indice),
    ia: mapIA([IA_H, ...(p.ia ?? [])], indice),
  };
}

describe('monta/identidade', () => {
  test('microchip resolve o número curto e o número com espaço', () => {
    assert.equal(chaveDe(indice, '25285', '900255001300803'), 'f-faisca');
    assert.equal(chaveDe(indice, '14213 25274', ''), 'f-cristal');
    assert.equal(chaveDe(indice, '999', ''), 'n:999');
  });

  test('cobertura liga fêmea e reprodutor pelas chaves do RebanhoProd', () => {
    const [c1, c2] = mapCoberturas(REPRODUCAO, indice);
    assert.deepEqual(
      { femea: c1.femea, reprodutor: c1.reprodutor, data: c1.data, us: c1.dataUs },
      { femea: 'f-cristal', reprodutor: 'r-chope', data: 20260921, us: 20261021 },
    );
    assert.equal(c2.femea, 'f-faisca');
  });
});

describe('monta/formar', () => {
  test('só vem quem tem cobertura com o reprodutor dentro do período', () => {
    const c = candidatas(mapCoberturas(REPRODUCAO, indice), [], 'r-chope', { inicio: 20260921, fim: 20261105 });
    assert.deepEqual(
      c.map((x) => [x.femea, x.datas]),
      [
        ['f-cristal', [20260921]],
        ['f-faisca', [20260921]],
        ['f-mulan', [20260921, 20261012]],
      ],
    );
    const fora = candidatas(mapCoberturas(REPRODUCAO, indice), [], 'r-chope', { inicio: 20260922, fim: 20261001 });
    assert.equal(fora.length, 0);
  });

  test('fêmea em outra estação do mesmo período fica marcada como ocupada', () => {
    const outra = estacao({ id: 'e0', reprodutor: 'r-luxo', femeas: ['f-faisca'] });
    const c = candidatas(mapCoberturas(REPRODUCAO, indice), [outra], 'r-chope', { inicio: 20260921, fim: 20261105 });
    assert.equal(c.find((x) => x.femea === 'f-faisca')?.ocupadaEm?.id, 'e0');
    assert.equal(c.find((x) => x.femea === 'f-cristal')?.ocupadaEm, null);
  });

  test('reprodutor não pode ter duas estações com período sobreposto', () => {
    const e = estacao();
    assert.equal(conflitoReprodutor([e], 'r-chope', { inicio: 20261101, fim: 20261201 })?.id, 'e1');
    assert.equal(conflitoReprodutor([e], 'r-chope', { inicio: 20261106, fim: 20261201 }), null);
    assert.equal(conflitoReprodutor([e], 'r-chope', { inicio: 20261101, fim: 20261201 }, 'e1'), null);
  });
});

describe('monta/acompanhar', () => {
  test('sem DG: aguardando US até a DATA US, depois US atrasado', () => {
    assert.equal(acompanharFemea('f-cristal', estacao(), dados(), 20261021).situacao, 'aguardando-us');
    const a = acompanharFemea('f-cristal', estacao(), dados(), 20261025);
    assert.equal(a.situacao, 'us-atrasado');
    assert.equal(a.usPrevisto, 20261021);
  });

  test('DG gestante com "30 dias" (padrão do app): parto previsto é a janela da estação', () => {
    // Estação 21/09 a 05/11: 21/09 + 150 = 18/02/2027 até 05/11 + 150 = 04/04/2027.
    const a = acompanharFemea('f-cristal', estacao(), dados({ dg: [['d1', '1421325274', '', '', '21/10/2026', 'Gestante', '30', '', '', '21/09/2026', '18/02/2027', 'Monta', '1421323472', '21/09/2026']] }), 20261025);
    assert.equal(a.situacao, 'gestante');
    assert.equal(a.partoPrevisto, 20270218);
    assert.equal(a.partoPrevistoAte, 20270404);
    assert.equal(a.coberturaForaDaEstacao, false);
  });

  test('DG com idade medida dentro do período: parto previsto numa data só', () => {
    // US em 28/11 com 61 dias => cobertura 28/09 => parto 25/02/2027.
    const a = acompanharFemea('f-cristal', estacao(), dados({ dg: [['d1', '1421325274', '', '', '28/11/2026', 'Gestante', '61', '', '', '', '', '', '', '28/09/2026']] }), 20261201);
    assert.equal(a.partoPrevisto, 20270225);
    assert.equal(a.partoPrevistoAte, 20270225);
  });

  test('"30 dias" com data de DG longe da cobertura não acusa cobertura fora do período (caso ESPINHEIRA)', () => {
    const a = acompanharFemea('f-cristal', estacao(), dados({ dg: [['d1', '1421325274', '', '', '28/12/2026', 'Gestante', '30', '', '', '', '', '', '', '28/11/2026']] }), 20261230);
    assert.equal(a.coberturaForaDaEstacao, false);
  });

  test('DG anterior à cobertura não conta', () => {
    const a = acompanharFemea('f-cristal', estacao(), dados({ dg: [['d0', '1421325274', '', '', '01/09/2026', 'Vazia']] }), 20261001);
    assert.equal(a.dg, null);
  });

  test('repasse: o DG tem de ser depois da ÚLTIMA cobertura', () => {
    const d = dados({ dg: [['d1', '1421325298', '', '', '11/10/2026', 'Vazia']] });
    const a = acompanharFemea('f-mulan', estacao(), d, 20261020);
    assert.deepEqual(a.coberturas, [20260921, 20261012]);
    assert.equal(a.dg, null);
    assert.equal(a.situacao, 'aguardando-us');
    assert.equal(a.usPrevisto, 20261111);
  });

  test('IA depois da estação fecha a janela: DG posterior à IA não é da estação', () => {
    const d = dados({
      ia: [['i1', '1421325274', '', '', '15/11/2026', 'TP202010036']],
      dg: [['d1', '1421325274', '', '', '15/12/2026', 'Gestante', '30']],
    });
    const a = acompanharFemea('f-cristal', estacao(), d, 20261220);
    assert.equal(a.dg, null);
    assert.equal(a.situacao, 'us-atrasado');
  });

  test('parto na janela (1ª cob. + 135 a última + 165): pariu, com crias e pai conferido', () => {
    const d = dados({
      dg: [['d1', '1421325274', '', '', '21/10/2026', 'Gestante', '30', '', '', '', '18/02/2027']],
      partos: [
        ['p1', '1421326300', 'ALFA SANRI', '', '1421325274', '', '', '', '1421323472', '', '', '', '17/02/2027', 'Fêmea'],
        ['p2', '1421326301', '', '', '1421325274', '', '', '', '1421323472', '', '', '', '17/02/2027', 'Macho'],
      ],
    });
    const a = acompanharFemea('f-cristal', estacao(), d, 20270301);
    assert.equal(a.situacao, 'pariu');
    assert.equal(a.parto?.data, 20270217);
    assert.equal(a.parto?.crias.length, 2);
    assert.equal(a.parto?.paiConfere, true);
    assert.equal(a.partoPrevisto, null);
  });

  test('parto cedo demais (antes de 1ª cob. + 135) é de gestação anterior', () => {
    const d = dados({ partos: [['p1', '1', '', '', '1421325274', '', '', '', '', '', '', '', '01/12/2026', 'Fêmea']] });
    assert.equal(acompanharFemea('f-cristal', estacao(), d, 20261202).parto, null);
  });

  test('gestante com cobertura estimada antes da estação é sinalizada (entrou prenhe)', () => {
    const d = dados({ dg: [['d1', '1421325274', '', '', '21/10/2026', 'Gestante', '90', '', '', '', '', '', '', '23/07/2026']] });
    assert.equal(acompanharFemea('f-cristal', estacao(), d, 20261025).coberturaForaDaEstacao, true);
  });

  test('sem cobertura no período (apagada no app ou período encurtado)', () => {
    const a = acompanharFemea('f-cristal', estacao({ inicio: 20260922 }), dados(), 20261001);
    assert.equal(a.situacao, 'sem-cobertura');
  });

  test('finalizada antes do fim: cobertura depois da finalização não conta', () => {
    const a = acompanharFemea('f-mulan', estacao({ finalizadaEm: 20261001 }), dados(), 20261005);
    assert.deepEqual(a.coberturas, [20260921]);
  });
});

describe('monta/indicadores', () => {
  test('conta situações, prenhez sobre cobertas, crias e prolificidade', () => {
    const d = dados({
      dg: [
        ['d1', '1421325274', '', '', '21/10/2026', 'Gestante', '30', '', '', '', '18/02/2027'],
        ['d2', '1421325285', '900255001300803', '', '21/10/2026', 'Vazia'],
      ],
    });
    const e = estacao();
    const linhas = e.femeas.map((f) => acompanharFemea(f, e, d, 20261025));
    const i = indicadores(linhas, 20261025);
    assert.equal(i.femeas, 3);
    assert.equal(i.cobertas, 3);
    assert.equal(i.gestantes, 1);
    assert.equal(i.vazias, 1);
    assert.equal(i.aguardandoDg, 1);
    assert.equal(i.repasses, 1);
    assert.equal(i.taxaPrenhez, 33.33);
    assert.equal(i.prolificidade, null);
    assert.equal(i.proximoParto, 20270218); // início da janela da CRISTAL
    assert.equal(i.partoAtrasado, 0);
    assert.equal(indicadores(linhas, 20270501).partoAtrasado, 1); // janela da CRISTAL fechou em 04/04/2027
  });
});

describe('monta/estacoes', () => {
  const linha = (v: Record<string, string>) => COLUNAS_ESTACAO.map((c) => v[c] ?? '');
  const base = { estacao_id: 'e1', reprodutor: 'r-chope', inicio: '21/09/2026', fim: '05/11/2026', femeas: 'f-cristal;f-faisca' };

  test('a versão atual é a última linha da estação; criada em = 1ª linha', () => {
    const [e] = mapEstacoes([
      COLUNAS_ESTACAO,
      linha({ ...base, id: '1', data: '25/09/2026', acao: 'criada' }),
      linha({ ...base, id: '2', data: '30/09/2026', acao: 'alterada', femeas: 'f-cristal;f-faisca;f-mulan' }),
    ]);
    assert.equal(e.femeas.length, 3);
    assert.equal(e.criadaEm, 20260925);
    assert.equal(e.alteradaEm, 20260930);
  });

  test('excluída some; finalizada deixa de ser ativa', () => {
    const lista = mapEstacoes([
      COLUNAS_ESTACAO,
      linha({ ...base, id: '1', data: '25/09/2026', acao: 'criada' }),
      linha({ ...base, id: '2', estacao_id: 'e2', data: '25/09/2026', acao: 'criada' }),
      linha({ ...base, id: '3', estacao_id: 'e2', data: '26/09/2026', acao: 'excluida' }),
      linha({ ...base, id: '4', data: '01/10/2026', acao: 'finalizada', finalizada_em: '01/10/2026' }),
    ]);
    assert.deepEqual(lista.map((e) => e.id), ['e1']);
    assert.equal(estacaoAtiva(lista[0], 20261002), false);
    assert.equal(estacaoAtiva({ fim: 20261105, finalizadaEm: null }, 20261002), true);
  });
});
