import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { paiEsperado } from '@/lib/bovinos/regras/pai';
import type { IatfVia } from '@/lib/bovinos/identidade';

const NASC = 20_000;
let seq = 0;
function iatf(g: number, semen: string): IatfVia {
  seq++;
  return { linha: seq, idTxt: 'V1', nomes: ['V1'], tags: [], A: '', data: NASC - g, dataTxt: `g${g}`, semen, previsto: null, via: ['teste'] };
}

describe('bovinos/regras/pai — fronteiras da janela', () => {
  const casos: [number, string][] = [
    [239, 'monta-livre'],
    [240, 'curto'],
    [269, 'curto'],
    [270, 'iatf'],
    [313, 'iatf'],
    [314, 'monta-livre'],
    [330, 'monta-livre'],
    [331, 'monta-livre'],
  ];
  for (const [g, tipo] of casos) {
    test(`g=${g} → ${tipo}`, () => {
      assert.equal(paiEsperado(NASC, [iatf(g, 'TNT')]).tipo, tipo);
    });
  }

  test('314–330 é monta livre por motivo "longo"', () => {
    const v = paiEsperado(NASC, [iatf(320, 'TNT')]);
    assert.equal(v.tipo === 'monta-livre' && v.motivo, 'longo');
  });

  test('IATF no dia do nascimento ou depois não conta', () => {
    assert.equal(paiEsperado(NASC, [iatf(0, 'TNT'), iatf(-30, 'TNT')]).tipo, 'monta-livre');
  });

  test('sem IATF → monta livre sem-iatf', () => {
    const v = paiEsperado(NASC, []);
    assert.equal(v.tipo === 'monta-livre' && v.motivo, 'sem-iatf');
  });

  test('"x" é ignorado como sêmen', () => {
    assert.equal(paiEsperado(NASC, [iatf(290, 'x')]).tipo, 'monta-livre');
  });
});

describe('bovinos/regras/pai — várias IATFs', () => {
  test('dois sêmens diferentes na janela → ambíguo sem sugestão', () => {
    const v = paiEsperado(NASC, [iatf(310, 'FIRE'), iatf(285, 'SOLUTION')]);
    assert.equal(v.tipo, 'ambiguo');
    assert.equal(v.tipo === 'ambiguo' && v.sugerido, null);
  });

  test('ressinc fora da janela e primeira IATF dentro: vale a primeira', () => {
    // 1ª IATF a 291 dias; ressinc a 250 dias com OUTRO sêmen → ambíguo (gestação curta possível).
    assert.equal(paiEsperado(NASC, [iatf(291, 'FIRE'), iatf(250, 'SOLUTION')]).tipo, 'ambiguo');
    // ...e a 228 dias é impossível: fica a primeira.
    const v = paiEsperado(NASC, [iatf(291, 'FIRE'), iatf(228, 'SOLUTION')]);
    assert.equal(v.tipo === 'iatf' && v.semen, 'FIRE');
  });

  test('mesmo sêmen escrito diferente conta como um', () => {
    const v = paiEsperado(NASC, [iatf(305, 'Fenômeno5-6'), iatf(290, 'FENOMENO 5-6')]);
    assert.equal(v.tipo, 'iatf');
    assert.equal(v.tipo === 'iatf' && v.semen, 'FENOMENO 5-6');
  });

  test('IATF posterior com menos de 240 dias é ignorada', () => {
    const v = paiEsperado(NASC, [iatf(290, 'QUARUP'), iatf(239, 'HUNGARO')]);
    assert.equal(v.tipo, 'iatf');
    assert.equal(v.tipo === 'iatf' && v.ignoradas.length, 1);
  });

  test('IATF posterior com 240+ dias e outro sêmen → ambíguo, sugerindo o da janela', () => {
    const v = paiEsperado(NASC, [iatf(293, 'FENOMENO'), iatf(265, 'TNT')]);
    assert.equal(v.tipo, 'ambiguo');
    assert.equal(v.tipo === 'ambiguo' && v.sugerido, 'FENOMENO');
  });

  test('IATF posterior com o mesmo sêmen não atrapalha', () => {
    const v = paiEsperado(NASC, [iatf(293, 'QUARUP'), iatf(251, 'Quarup')]);
    assert.equal(v.tipo, 'iatf');
  });
});
