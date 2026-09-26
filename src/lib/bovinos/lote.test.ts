import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { coletarChavesEmUso, decodificarLote, montarLote, novaChave, tamanhoLote, type EntradaLote } from '@/lib/bovinos/lote';
import { assinarLote, verificarLote } from '@/lib/bovinos/lote-assinatura';
import type { Problema } from '@/lib/bovinos/tipos';

const T0 = 1_800_000_000_000;

function prob(id: string, c: Problema['correcao'], sev: Problema['severidade'] = 'corrigivel'): Problema {
  return { id, regra: 'pai-preencher', severidade: sev, aba: 'RebanhoProd', linha: 5, animal: id, resumo: id, prova: [], bloqueios: [], correcao: c };
}

const PAI = prob('p1', { tipo: 'celulas', aba: 'RebanhoProd', linha: 5, guarda: { idA: 'A5', idAnimal: 'B1' }, set: [{ col: 'ID Pai', de: '', para: 'TNT' }, { col: 'ID P', de: '', para: 'K3' }] });
const MAE = prob('m1', { tipo: 'celulas', aba: 'RebanhoProd', linha: 7, guarda: { idA: 'A7', idAnimal: 'B2' }, set: [{ col: 'ID Mãe', de: '', para: 'V1' }] });
const FAZ = prob('f1', { tipo: 'coluna-valor', aba: 'Toque', col: 'Fazenda', linhas: [3, 9], de: 'Bonito', para: 'Santo Antônio' });
const CHAVE = prob('k1', { tipo: 'chave', aba: 'RebanhoProd', linha: 10, guarda: { idA: '', idAnimal: 'V4' }, recuperar: [{ col: 'ID A', de: '', para: 'K4' }], gerar: ['ID rebanho'] });
const FORM = prob('x1', { tipo: 'formula', aba: 'RebanhoProd', linha: 12, guarda: { idA: 'A12', idAnimal: 'C1' }, colunas: [{ col: 'Categoria', linhaDoadora: 11 }] });
const EXCL = prob('e1', { tipo: 'excluir-linha', aba: 'RebanhoProd', linha: 6 });
const MANUAL = prob('z1', null, 'manual');

function entrada(ids: string[], extra: Partial<EntradaLote> = {}): EntradaLote {
  let n = 0;
  return {
    problemas: [PAI, MAE, FAZ, CHAVE, FORM, EXCL, MANUAL],
    ids,
    cliente: 'bonito',
    planilha: 'PLAN',
    email: 'f@x.com',
    agora: T0,
    chavesEmUso: new Set(['aaaaaaaa']),
    vizinhos: (l) => ({ acima: `A${l - 1}`, abaixo: `A${l + 1}` }),
    formulaDoadora: (col, l) => `=${col}#${l}`,
    gerarChave: () => ['aaaaaaaa', 'bbbbbbbb', 'cccccccc'][n++],
    idLote: 'L1',
    ...extra,
  };
}

describe('bovinos/lote — montagem', () => {
  test('converte cada tipo de correção em operações concretas', () => {
    const { lote, recusados } = montarLote(entrada(['p1', 'm1', 'f1', 'k1', 'x1']));
    assert.deepEqual(recusados, []);
    assert.equal(lote!.tipo, 'celulas');
    assert.equal(tamanhoLote(lote!), 2 + 1 + 2 + 2 + 1);
    const chave = lote!.itens.find((i) => i.problemaId === 'k1')!;
    // 'aaaaaaaa' já está em uso: a chave nova é a próxima sorteada.
    assert.deepEqual(chave.ops.map((o) => o.tipo === 'valor' && [o.col, o.para]), [['ID A', 'K4'], ['ID rebanho', 'bbbbbbbb']]);
    const form = lote!.itens.find((i) => i.problemaId === 'x1')!;
    assert.deepEqual(form.ops[0], { tipo: 'formula', aba: 'RebanhoProd', linha: 12, col: 'Categoria', doadora: 11, formula: '=Categoria#11' });
    assert.equal(lote!.itens.find((i) => i.problemaId === 'f1')!.guarda, null);
  });

  test('recusa o que não é corrigível ou sumiu', () => {
    const { recusados } = montarLote(entrada(['z1', 'nao-existe', 'p1']));
    assert.deepEqual(recusados.map((r) => r.id).sort(), ['nao-existe', 'z1']);
  });

  test('exclusão nunca vai junto com outras correções', () => {
    const misto = montarLote(entrada(['p1', 'e1']));
    assert.equal(misto.lote!.tipo, 'celulas');
    assert.ok(misto.recusados.some((r) => r.id === 'e1'));
    const so = montarLote(entrada(['e1']));
    assert.equal(so.lote!.tipo, 'exclusao');
    assert.deepEqual(so.lote!.itens[0].ops[0], { tipo: 'excluir', aba: 'RebanhoProd', linha: 6, acima: 'A5', abaixo: 'A7' });
  });

  test('duas correções com valores diferentes na mesma célula: nenhuma vai', () => {
    const outro = prob('p2', { tipo: 'celulas', aba: 'RebanhoProd', linha: 5, guarda: { idA: 'A5', idAnimal: 'B1' }, set: [{ col: 'ID Pai', de: '', para: 'B2887' }] });
    const { lote, recusados } = montarLote(entrada(['p1', 'p2', 'm1'], { problemas: [PAI, outro, MAE] }));
    assert.deepEqual(recusados.map((r) => r.id).sort(), ['p1', 'p2']);
    assert.deepEqual(lote!.itens.map((i) => i.problemaId), ['m1']);
  });

  test('nada corrigível → sem lote', () => {
    assert.equal(montarLote(entrada(['z1'])).lote, null);
  });
});

describe('bovinos/lote — chaves', () => {
  test('novaChave evita colisão e registra a nova no conjunto', () => {
    const emUso = new Set(['11111111']);
    const seq = ['11111111', '22222222'];
    let i = 0;
    assert.equal(novaChave(emUso, () => seq[i++]), '22222222');
    assert.ok(emUso.has('22222222'));
    assert.match(novaChave(new Set()), /^[0-9a-f]{8}$/);
  });

  test('coletarChavesEmUso pega só textos de 8 alfanuméricos', () => {
    const s = coletarChavesEmUso([[['ID A', 'x'], ['6d79504b', 'D94']], null, [['asvx0421', '900215007821665']]]);
    assert.deepEqual([...s].sort(), ['6d79504b', 'asvx0421']);
  });
});

describe('bovinos/lote — assinatura', () => {
  const SEG = 's'.repeat(64);
  const { lote } = montarLote(entrada(['p1', 'f1']));

  test('ida e volta; a prévia decodifica o mesmo conteúdo', () => {
    const tok = assinarLote(lote!, SEG);
    const v = verificarLote(tok, SEG, 'F@X.com', T0 + 1000);
    assert.ok(v.ok);
    assert.deepEqual(decodificarLote(tok), lote);
  });

  test('conteúdo adulterado, outro segredo, expirado ou outro e-mail: rejeitado', () => {
    const tok = assinarLote(lote!, SEG);
    const [payload, sig] = tok.split('.');
    const adulterado = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    adulterado.itens[0].ops[0].para = 'OUTRO';
    const tok2 = `${Buffer.from(JSON.stringify(adulterado)).toString('base64url')}.${sig}`;
    assert.deepEqual(verificarLote(tok2, SEG, 'f@x.com', T0), { ok: false, motivo: 'assinatura' });
    assert.deepEqual(verificarLote(tok, 'z'.repeat(64), 'f@x.com', T0), { ok: false, motivo: 'assinatura' });
    assert.deepEqual(verificarLote(tok, SEG, 'f@x.com', T0 + 16 * 60 * 1000), { ok: false, motivo: 'expirado' });
    assert.deepEqual(verificarLote(tok, SEG, 'outro@x.com', T0), { ok: false, motivo: 'email' });
    assert.deepEqual(verificarLote('lixo', SEG, 'f@x.com', T0), { ok: false, motivo: 'formato' });
  });

  test('acentos sobrevivem ao base64url', () => {
    const tok = assinarLote(lote!, SEG);
    const l = decodificarLote(tok)!;
    const faz = l.itens.find((i) => i.problemaId === 'f1')!;
    assert.equal(faz.ops[0].tipo === 'valor' && faz.ops[0].para, 'Santo Antônio');
  });
});
