import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SECOES, TODAS, contagem } from '@/lib/fi-fcg/questionario/perguntas';
import { REFERENCIAS } from '@/lib/fi-fcg/questionario/referencias';
import { SUGESTOES } from '@/lib/fi-fcg/questionario/sugestoes';
import { ANEXO_A, ANEXO_B, ANEXO_C } from '@/lib/fi-fcg/questionario/anexos';

test('86 perguntas, na ordem, em 11 seções', () => {
  assert.equal(SECOES.length, 11);
  assert.deepEqual(TODAS.map((p) => p.n), Array.from({ length: 86 }, (_, i) => i + 1));
});

test('a contagem por estado fecha 86', () => {
  const c = contagem();
  assert.equal(c.banco + c.literatura + c.felipe + c.sergio, 86);
});

test('quem tem resposta tem texto; o que é do Sérgio diz o que falta', () => {
  for (const p of TODAS) {
    if (p.estado === 'sergio') assert.ok(p.falta, `pergunta ${p.n} sem "falta"`);
    else assert.ok(p.resposta, `pergunta ${p.n} sem resposta`);
  }
});

test('indicada pela literatura sempre tem fonte', () => {
  for (const p of TODAS) {
    if (p.estado === 'literatura') assert.ok(p.literatura && p.literatura.length > 0, `pergunta ${p.n}`);
  }
});

test('toda citação aponta para uma das referências, com link', () => {
  assert.equal(REFERENCIAS.length, 57);
  const ids = new Set(REFERENCIAS.map((r) => r.id));
  for (const r of REFERENCIAS) assert.ok(r.url, r.id);
  for (const p of TODAS) {
    for (const l of p.literatura ?? []) {
      assert.ok(l.fontes.length > 0, `pergunta ${p.n}: indicação sem fonte`);
      for (const f of l.fontes) assert.ok(ids.has(f.ref), `pergunta ${p.n}: ${f.ref}`);
    }
  }
});

test('todo dado lido tem data', () => {
  for (const p of TODAS) for (const d of p.dados ?? []) assert.match(d.lidoEm, /^\d{2}\/\d{2}\/\d{4}$/);
});

test('anexos completos', () => {
  assert.equal(ANEXO_A.length, 7);
  assert.equal(ANEXO_B.length, 8);
  assert.equal(ANEXO_C.length, 10);
});

test('sugestão só nas perguntas do proprietário, com data ou fonte', () => {
  const ids = new Set(REFERENCIAS.map((r) => r.id));
  for (const [n, lista] of Object.entries(SUGESTOES)) {
    const p = TODAS.find((x) => x.n === Number(n));
    assert.equal(p?.estado, 'sergio', `pergunta ${n}`);
    for (const s of lista) {
      if (s.origem === 'banco') assert.match(s.lidoEm ?? '', /^\d{2}\/\d{2}\/\d{4}$/, `pergunta ${n}`);
      else {
        assert.ok(s.fontes && s.fontes.length > 0, `pergunta ${n} sem fonte`);
        for (const f of s.fontes) assert.ok(ids.has(f.ref), `pergunta ${n}: ${f.ref}`);
      }
    }
  }
});

test('sugestão não muda a contagem: 59 continuam com o proprietário', () => {
  assert.equal(contagem().sergio, 59);
});
