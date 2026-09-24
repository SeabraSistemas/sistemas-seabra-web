import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  calcularProducao,
  litrosDaRegua,
  mapProducao,
  mapTabelaRegua,
  mapUsuarios,
  normalizarRegua,
} from '@/lib/sanri/producao';

const HEADER = [
  'id', 'data', 'tanque', 'regua', 'regua_litros', 'extra', 'tanque_extra', 'regua_extra', 'regua_extra_litros',
  'destino', 'destino_litros', 'total_dia', 'total_animais', 'media', 'cabrtinho', 'laticinio', 'venda', 'obs',
];

/** As 3 linhas reais da planilha em 24/09/2026 (lançadas pelo AppSheet). */
const PRODUCAO_REAL = [
  HEADER,
  ['9a0a6105', '23/09/2026', 'tanque 800', '24.7', '276,3', '', '', '', '0', 'Cabritinhos , Laticínio', '', '92,1', '88', '1', '60', '358,7', '', ''],
  ['13636428', '24/09/2026', 'tanque 800', '5.8', '103,1', '', '', '', '0', '', '', '11', '88', '0', '', '', '', ''],
  ['5d3b0261', '24/09/2026', 'tanque 800', '', '0', '', '', '', '0', 'Cabritinhos', '', '-92,1', '88', '-1', '60', '', '', ''],
];

describe('sanri/normalizarRegua', () => {
  test('aceita ponto ou vírgula e fixa uma casa', () => {
    assert.equal(normalizarRegua('24.7'), '24.7');
    assert.equal(normalizarRegua('24,7'), '24.7');
    assert.equal(normalizarRegua(' 5 '), '5.0');
    assert.equal(normalizarRegua('0.0'), '0.0');
  });
  test('recusa vazio, texto e negativo', () => {
    assert.equal(normalizarRegua(''), null);
    assert.equal(normalizarRegua('abc'), null);
    assert.equal(normalizarRegua('-1'), null);
  });
});

describe('sanri/tabela da régua', () => {
  const tabela = mapTabelaRegua([
    ['id', 'tanque', 'regua', 'litros'],
    ['1', 'tanque 800', '0.0', '50'],
    ['2', 'tanque 800', '24.7', '276,3'],
    ['3', 'tanque 1500', '1.0', '59,2'],
    ['4', '', '1.1', '60'],
  ]);

  test('busca por tanque + régua, com a régua em qualquer grafia', () => {
    assert.equal(litrosDaRegua(tabela, 'tanque 800', '24,7'), 276.3);
    assert.equal(litrosDaRegua(tabela, 'tanque 800', '24.70'), 276.3);
    assert.equal(litrosDaRegua(tabela, 'tanque 1500', '1'), 59.2);
  });
  test('null quando a régua ou o tanque não existem', () => {
    assert.equal(litrosDaRegua(tabela, 'tanque 800', '99.9'), null);
    assert.equal(litrosDaRegua(tabela, 'tanque 2000', '0.0'), null);
  });
});

describe('sanri/mapUsuarios', () => {
  test('ignora linha sem e-mail e normaliza caixa', () => {
    const usuarios = mapUsuarios([
      ['UID', 'Name', 'Email', 'Role'],
      ['e1', '', '', 'Tec'],
      ['e2', 'Felipe', ' FelipeSeabraCL@gmail.com ', 'Dev'],
    ]);
    assert.deepEqual(usuarios, [{ email: 'felipeseabracl@gmail.com', nome: 'Felipe', papel: 'Dev' }]);
  });
});

describe('sanri/mapProducao', () => {
  test('separa leituras e saídas das linhas antigas do AppSheet', () => {
    const { leituras, saidas } = mapProducao(PRODUCAO_REAL);
    assert.deepEqual(
      leituras.map((l) => [l.id, l.data, l.litros, l.totalAnimais, l.reguaExtra]),
      [
        ['9a0a6105', 20260923, 276.3, 88, null],
        ['13636428', 20260924, 103.1, 88, null],
      ],
    );
    assert.deepEqual(
      saidas.map((s) => [s.id, s.data, s.destino, s.litros]),
      [
        ['9a0a6105', 20260923, 'cabritinhos', 60],
        ['9a0a6105', 20260923, 'laticinio', 358.7],
        ['5d3b0261', 20260924, 'cabritinhos', 60],
      ],
    );
  });

  test('tanque extra só conta com tanque e régua preenchidos', () => {
    const { leituras } = mapProducao([
      HEADER,
      ['a', '01/10/2026', 'tanque 800', '10.0', '140', 'sim', 'tanque 1500', '2.0', '68,3', '', '', '', '90', '', '', '', '', ''],
    ]);
    assert.equal(leituras[0].tanqueExtra, 'tanque 1500');
    assert.equal(leituras[0].litrosExtra, 68.3);
  });
});

describe('sanri/calcularProducao', () => {
  test('dados reais: 23/09 produziu 245,5 L (103,1 − 276,3 + 60 + 358,7)', () => {
    const { leituras, saidas } = mapProducao(PRODUCAO_REAL);
    const [dia24, dia23] = calcularProducao(leituras, saidas);

    assert.equal(dia23.data, 20260923);
    assert.equal(dia23.status, 'ok');
    assert.equal(dia23.producao, 245.5);
    assert.equal(dia23.media, 2.79);
    assert.equal(dia23.totalSaidas, 418.7);

    assert.equal(dia24.data, 20260924);
    assert.equal(dia24.status, 'aguardando');
    assert.equal(dia24.producao, null);
    assert.equal(dia24.saidas.cabritinhos, 60);
  });

  test('soma o tanque extra no volume', () => {
    const { leituras, saidas } = mapProducao([
      HEADER,
      ['a', '01/10/2026', 'tanque 800', '10.0', '100', '', '', '', '', '', '', '', '50', '', '', '', '', ''],
      ['b', '02/10/2026', 'tanque 800', '20.0', '200', 'sim', 'tanque 1500', '2.0', '50', '', '', '', '50', '', '', '', '', ''],
    ]);
    const dia1 = calcularProducao(leituras, saidas).find((d) => d.data === 20261001)!;
    assert.equal(dia1.producao, 150);
    assert.equal(dia1.media, 3);
  });

  test('saída sem régua no dia fica sem produção', () => {
    const { leituras, saidas } = mapProducao([
      HEADER,
      ['s', '05/10/2026', '', '', '', '', '', '', '', 'Venda', '30', '', '', '', '', '', '30', ''],
    ]);
    const [dia] = calcularProducao(leituras, saidas);
    assert.equal(dia.status, 'sem-leitura');
    assert.equal(dia.saidas.venda, 30);
  });

  test('régua sem litros na tabela invalida o dia', () => {
    const { leituras, saidas } = mapProducao([
      HEADER,
      ['a', '01/10/2026', 'tanque 800', '10.0', '', '', '', '', '', '', '', '', '50', '', '', '', '', ''],
      ['b', '02/10/2026', 'tanque 800', '20.0', '200', '', '', '', '', '', '', '', '50', '', '', '', '', ''],
    ]);
    const dia1 = calcularProducao(leituras, saidas).find((d) => d.data === 20261001)!;
    assert.equal(dia1.status, 'regua-invalida');
  });

  test('virada de mês usa o dia seguinte de calendário', () => {
    const { leituras, saidas } = mapProducao([
      HEADER,
      ['a', '30/09/2026', 'tanque 800', '10.0', '100', '', '', '', '', '', '', '', '40', '', '', '', '', ''],
      ['b', '01/10/2026', 'tanque 800', '20.0', '180', '', '', '', '', '', '', '', '40', '', '', '', '', ''],
    ]);
    const dia = calcularProducao(leituras, saidas).find((d) => d.data === 20260930)!;
    assert.equal(dia.producao, 80);
  });
});
