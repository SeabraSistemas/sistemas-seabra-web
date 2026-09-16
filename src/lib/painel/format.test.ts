import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  anosPresentes,
  diaDe,
  diaDeInput,
  diaParaInput,
  diasEntre,
  somarDias,
  formatCompacto,
  formatDia,
  formatMoeda,
  formatPct,
  hojeCompacto,
  numberBounds,
  parseDateBR,
  parseMoeda,
  parseNumber,
} from '@/lib/painel/format';

describe('parseNumber', () => {
  test('virgula decimal pt-BR', () => {
    assert.equal(parseNumber('2,5'), 2.5);
  });
  test('ponto de milhar + virgula decimal', () => {
    assert.equal(parseNumber('1.234,50'), 1234.5);
  });
  test('vazio, traco e null viram null', () => {
    assert.equal(parseNumber(''), null);
    assert.equal(parseNumber('-'), null);
    assert.equal(parseNumber(null), null);
  });
});

describe('parseMoeda', () => {
  test('formato do Sheets', () => {
    assert.equal(parseMoeda('R$ 3.264,00'), 3264);
    assert.equal(parseMoeda('R$ 0,01'), 0.01);
  });
  test('negativo', () => {
    assert.equal(parseMoeda('-R$ 0,01'), -0.01);
  });
  test('sem digito e null', () => {
    assert.equal(parseMoeda(''), null);
    assert.equal(parseMoeda(null), null);
  });
});

describe('diaDe / formatDia / diaDeInput', () => {
  test('dd/mm/aaaa vira aaaammdd', () => {
    assert.equal(diaDe('05/03/2025'), 20250305);
  });
  test('data invalida vira null', () => {
    assert.equal(diaDe('32/13/2025'), null);
    assert.equal(diaDe('nao e data'), null);
  });
  test('round-trip com formatDia', () => {
    assert.equal(formatDia(diaDe('05/03/2025')), '05/03/2025');
  });
  test('diaDeInput le o formato do <input type=date>', () => {
    assert.equal(diaDeInput('2025-03-05'), 20250305);
    assert.equal(diaDeInput(''), null);
  });
});

describe('diasEntre', () => {
  test('dias corridos dentro do mesmo mes', () => {
    assert.equal(diasEntre(20250101, 20250110), 9);
  });
  test('atravessa virada de mes/ano (nao e so subtrair os inteiros)', () => {
    assert.equal(diasEntre(20241225, 20250105), 11);
  });
  test('ano bissexto conta certo', () => {
    assert.equal(diasEntre(20240228, 20240301), 2); // 2024 tem 29/02
  });
  test('fim antes do inicio da negativo', () => {
    assert.equal(diasEntre(20250110, 20250101), -9);
  });
  test('falta qualquer uma das datas vira null', () => {
    assert.equal(diasEntre(null, 20250101), null);
    assert.equal(diasEntre(20250101, null), null);
  });
});

describe('somarDias', () => {
  test('soma dias dentro do mesmo mes', () => {
    assert.equal(somarDias(20250101, 9), 20250110);
  });
  test('atravessa virada de mes/ano', () => {
    assert.equal(somarDias(20241225, 11), 20250105);
  });
  test('ano bissexto conta certo', () => {
    assert.equal(somarDias(20240228, 2), 20240301); // 2024 tem 29/02
  });
  test('numero negativo subtrai', () => {
    assert.equal(somarDias(20250110, -9), 20250101);
  });
  test('e o inverso de diasEntre', () => {
    assert.equal(diasEntre(20240615, somarDias(20240615, 283)), 283);
  });
  test('data null vira null', () => {
    assert.equal(somarDias(null, 10), null);
  });
});

describe('diaParaInput', () => {
  test('inverso de diaDeInput', () => {
    assert.equal(diaParaInput(20250305), '2025-03-05');
  });
  test('null vira string vazia', () => {
    assert.equal(diaParaInput(null), '');
  });
  test('round-trip com diaDeInput', () => {
    assert.equal(diaDeInput(diaParaInput(20250305)), 20250305);
  });
});

describe('anosPresentes', () => {
  test('anos distintos, mais recente primeiro', () => {
    assert.deepEqual(anosPresentes([20250310, 20230101, 20250101, 20240815]), [2025, 2024, 2023]);
  });
  test('ignora null', () => {
    assert.deepEqual(anosPresentes([20250101, null, null]), [2025]);
  });
  test('lista vazia ou so null da lista vazia', () => {
    assert.deepEqual(anosPresentes([]), []);
    assert.deepEqual(anosPresentes([null, null]), []);
  });
});

describe('numberBounds', () => {
  test('ignora null e devolve [min,max]', () => {
    assert.deepEqual(numberBounds([1, null, 5, 3]), [1, 5]);
  });
  test('faixa de valor unico vira null (nada pra filtrar)', () => {
    assert.equal(numberBounds([4, 4, null]), null);
  });
  test('sem nenhum valor vira null', () => {
    assert.equal(numberBounds([null, null]), null);
  });
});

describe('parseDateBR', () => {
  test('parseia e ordena por timestamp', () => {
    const a = parseDateBR('01/01/2024')!;
    const b = parseDateBR('02/01/2024')!;
    assert.ok(a < b);
  });
});

// normaliza NBSP (Intl usa espaco fino nao-quebravel) pra comparar como texto normal
const semNbsp = (s: string) => s.replace(/\s/g, ' ');

describe('formatCompacto / formatMoeda / formatPct', () => {
  test('notacao compacta pt-BR bate com os cards do Looker', () => {
    assert.equal(semNbsp(formatCompacto(32775)), '32,8 mil');
    assert.equal(semNbsp(formatCompacto(10_740_934)), '10,7 mi');
  });
  test('moeda', () => {
    assert.equal(semNbsp(formatMoeda(3264)), 'R$ 3.264,00');
    assert.equal(formatMoeda(null), '—');
  });
  test('percentual', () => {
    assert.equal(formatPct(72.85), '72,85%');
  });
});

describe('hojeCompacto', () => {
  test('formato aaaammdd plausivel (8 digitos, ano de 4 digitos corrente)', () => {
    const v = hojeCompacto();
    assert.equal(String(v).length, 8);
    const ano = Math.floor(v / 10000);
    assert.ok(ano >= 2024 && ano <= 2100);
    const mes = Math.floor((v % 10000) / 100);
    assert.ok(mes >= 1 && mes <= 12);
  });
});
