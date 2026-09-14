import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  diaDe,
  diaDeInput,
  formatCompacto,
  formatDia,
  formatMoeda,
  formatPct,
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
