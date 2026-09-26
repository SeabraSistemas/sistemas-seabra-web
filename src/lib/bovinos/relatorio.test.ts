import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { montarRelatorio, type EntradaRelatorio } from '@/lib/bovinos/relatorio';
import { clientePorSlug } from '@/lib/bovinos/clientes';
import { serialDia } from '@/lib/bovinos/texto';
import type { Problema } from '@/lib/bovinos/tipos';

/** Monta uma aba a partir de objetos {cabeçalho: valor} — mais legível que matriz crua. */
function aba(cab: string[], linhas: Record<string, string>[]): string[][] {
  return [cab, ...linhas.map((l) => cab.map((h) => l[h] ?? ''))];
}

const CAB_R = ['ID rebanho', 'ID A', 'ID animal', 'ID eletrônica', 'ID Mãe', 'ID Pai', 'Data de nascimento', 'Sexo', 'Categoria', 'Fazenda', 'ID M', 'ID P'];
const rebanho = aba(CAB_R, [
  /* 2 */ { 'ID rebanho': 'r01', 'ID A': 'A1', 'ID animal': 'V1', 'Data de nascimento': '01/01/2018', Sexo: 'Fêmea' },
  /* 3 */ { 'ID rebanho': 'r02', 'ID A': 'A2', 'ID animal': 'V2', 'Data de nascimento': '01/01/2018', Sexo: 'Fêmea' },
  /* 4 */ { 'ID rebanho': 'r03', 'ID A': 'A3', 'ID animal': 'TNT', Sexo: 'Macho' },
  /* 5 */ { 'ID rebanho': 'r04', 'ID A': 'A4', 'ID animal': 'B1', 'ID Mãe': 'V1', 'Data de nascimento': '20/09/2024', Sexo: 'Fêmea' },
  /* 6 */ {},
  /* 7 */ { 'ID rebanho': 'r06', 'ID A': 'A6', 'ID animal': 'B2', 'ID Mãe': 'V2', 'ID Pai': 'TNT', 'Data de nascimento': '05/10/2024', Sexo: 'Macho', 'ID P': 'A3' },
  /* 8 */ { 'ID rebanho': 'r08', 'ID A': 'AX9', 'ID animal': 'G9', 'ID eletrônica': 'TAG9', 'Data de nascimento': '16/10/2024', Sexo: 'Fêmea' },
  /* 9 */ { 'ID rebanho': 'r09', 'ID A': 'A9', 'ID animal': 'V3', 'Data de nascimento': '01/01/2019', Sexo: 'Fêmea' },
  /* 10 */ { 'ID animal': 'V4', 'Data de nascimento': '01/01/2015', Sexo: 'Fêmea' },
  /* 11 */ { 'ID rebanho': 'r11', 'ID A': 'A11', 'ID animal': 'V5', Sexo: 'Fêmea' },
  /* 12 */ { 'ID rebanho': 'r12', 'ID A': 'A12', 'ID animal': 'C1', 'ID Mãe': 'V5', 'ID Pai': 'TNT', 'Data de nascimento': '01/09/2024', Sexo: 'Macho' },
  /* 13 */ { 'ID rebanho': 'r13', 'ID A': 'A13', 'ID animal': 'C2', 'ID Mãe': 'V5', 'ID Pai': 'TNT', 'Data de nascimento': '10/12/2024', Sexo: 'Macho' },
]);

const CAB_P = ['ID parto', 'ID rebanho', 'ID M', 'ID P', 'ID A', 'ID animal', 'ID eletrônica', 'ID Mãe', 'ID Pai', 'Data de nascimento', 'Sexo', 'Método', 'Parto previsto'];
const parto = aba(CAB_P, [
  { 'ID M': 'A1', 'ID P': 'A3', 'ID A': 'A4', 'ID animal': 'B1', 'ID Mãe': 'V1', 'ID Pai': 'TNT', 'Data de nascimento': '20/09/2024', Sexo: 'Fêmea' },
  { 'ID M': 'A2', 'ID A': 'A6', 'ID animal': 'B2', 'ID Mãe': 'V2', 'Data de nascimento': '05/10/2024', Sexo: 'Macho' },
  // Bezerro recadastrado: a chave OLD9 não existe mais; o Rebanho tem G9 com o mesmo brinco.
  { 'ID rebanho': 'rOLD', 'ID M': 'A9', 'ID A': 'OLD9', 'ID animal': 'TAG9', 'ID eletrônica': 'TAG9', 'ID Mãe': 'V3', 'ID Pai': 'FENOMENO', 'Data de nascimento': '01/10/2024', Sexo: 'Fêmea' },
  // Mãe V4 perdeu a chave: o parto guarda K4. O bezerro Z1 não existe no Rebanho.
  { 'ID M': 'K4', 'ID A': 'ZZ', 'ID animal': 'Z1', 'ID Mãe': 'V4', 'Data de nascimento': '01/11/2024', Sexo: 'Macho' },
  // V5 com dois bezerros a 100 dias: mãe errada num deles.
  { 'ID M': 'A11', 'ID A': 'A12', 'ID animal': 'C1', 'ID Mãe': 'V5', 'Data de nascimento': '01/09/2024', Sexo: 'Macho' },
  { 'ID M': 'A11', 'ID A': 'A13', 'ID animal': 'C2', 'ID Mãe': 'V5', 'Data de nascimento': '10/12/2024', Sexo: 'Macho' },
]);

const CAB_Q = ['ID IATF', 'ID animal', 'Data IATF', 'Patida (sêmen)', 'ID eletrônica', 'ID A'];
const reproducao = aba(CAB_Q, [
  { 'ID animal': 'V1', 'Data IATF': '10/12/2023', 'Patida (sêmen)': 'TNT' },
  { 'ID animal': 'V3', 'Data IATF': '15/12/2023', 'Patida (sêmen)': 'FENOMENO' },
  { 'ID animal': 'V5', 'Data IATF': '20/11/2023', 'Patida (sêmen)': 'TNT' },
]);

const FORMULA = (l: number) => `=IF(H${l}="";"";"cat")`;
function colunaFormula(sem: number[]): string[] {
  return ['Categoria', ...Array.from({ length: 12 }, (_, k) => (sem.includes(k + 2) ? '' : FORMULA(k + 2)))];
}

function entrada(extra: Partial<EntradaRelatorio> = {}): EntradaRelatorio {
  return {
    rebanho,
    partos: [{ aba: 'Parto', valores: parto }],
    reproducao,
    // Linha 7 (B2) sem a fórmula; a linha 6 (em branco) mantém só a fórmula.
    formulas: [{ col: 'Categoria', valores: colunaFormula([7]) }],
    linhasCompletas: [{ linha: 6, valores: ['', '', '', '', '', '', '', '', FORMULA(6)] }],
    fazendas: [{ aba: 'Toque', valores: ['Fazenda', 'Santo Antônio', 'Bonito', 'Bonito'] }],
    ...extra,
  };
}

const cliente = { ...clientePorSlug('santo-antonio')!, colunasFormula: ['Categoria'] };
const HOJE = serialDia('26/09/2026')!;

function achar(r: Problema[], regra: string, animal?: string): Problema | undefined {
  return r.find((p) => p.regra === regra && (animal === undefined || p.animal === animal));
}

describe('bovinos/relatorio — cenário completo', () => {
  const rel = montarRelatorio(entrada(), cliente, HOJE);
  const P = rel.problemas;

  test('sem avisos de leitura', () => {
    assert.deepEqual(rel.avisos, []);
  });

  test('pai para preencher, com ID P do registro do sêmen', () => {
    const p = achar(P, 'pai-preencher', 'B1')!;
    assert.equal(p.severidade, 'corrigivel');
    assert.equal(p.correcao?.tipo, 'celulas');
    assert.deepEqual(p.correcao?.tipo === 'celulas' && p.correcao.set, [
      { col: 'ID Pai', de: '', para: 'TNT' },
      { col: 'ID P', de: '', para: 'A3' },
    ]);
  });

  test('monta livre com sêmen no Rebanho → tirar pai e limpar ID P', () => {
    const p = achar(P, 'pai-tirar', 'B2')!;
    assert.equal(p.severidade, 'corrigivel');
    assert.deepEqual(p.correcao?.tipo === 'celulas' && p.correcao.set, [
      { col: 'ID Pai', de: 'TNT', para: '' },
      { col: 'ID P', de: 'A3', para: '' },
    ]);
  });

  test('bezerro recadastrado (mesmo brinco) recebe pai e mãe', () => {
    assert.equal(achar(P, 'pai-preencher', 'G9')?.sugerido, 'FENOMENO');
    const m = achar(P, 'mae-preencher', 'G9')!;
    assert.equal(m.severidade, 'corrigivel');
    assert.deepEqual(m.correcao?.tipo === 'celulas' && m.correcao.set, [
      { col: 'ID Mãe', de: '', para: 'V3' },
      { col: 'ID M', de: '', para: 'A9' },
    ]);
    assert.equal(achar(P, 'parto-sem-animal', 'TAG9'), undefined);
  });

  test('mãe com dois bezerros a 100 dias bloqueia a correção de pai', () => {
    assert.ok(achar(P, 'mae-dois-bezerros', 'V5'));
    // C1 (286 dias da IATF de TNT) já está certo — nada a corrigir.
    assert.equal(P.find((x) => x.animal === 'C1' && x.regra.startsWith('pai-')), undefined);
    // C2 (386 dias) seria "tirar pai", mas a mãe está em dúvida → manual.
    const p = achar(P, 'pai-tirar', 'C2')!;
    assert.equal(p.severidade, 'manual');
    assert.ok(p.bloqueios.some((m) => m.includes('outro bezerro')));
    assert.equal(p.correcao, null);
  });

  test('linha só com fórmula é linha em branco (excluir)', () => {
    const p = achar(P, 'linha-em-branco')!;
    assert.equal(p.linha, 6);
    assert.equal(p.correcao?.tipo, 'excluir-linha');
  });

  test('fórmula ausente com doadora acima que não é a linha em branco', () => {
    const p = achar(P, 'formula-ausente', 'B2')!;
    assert.equal(p.severidade, 'corrigivel');
    assert.deepEqual(p.correcao?.tipo === 'formula' && p.correcao.colunas, [{ col: 'Categoria', linhaDoadora: 5 }]);
  });

  test('vaca sem chave recupera a original pelo ID M do parto', () => {
    const p = achar(P, 'sem-chave', 'V4')!;
    assert.equal(p.severidade, 'corrigivel');
    assert.ok(p.correcao?.tipo === 'chave');
    if (p.correcao?.tipo === 'chave') {
      assert.deepEqual(p.correcao.recuperar, [{ col: 'ID A', de: '', para: 'K4' }]);
      assert.deepEqual(p.correcao.gerar, ['ID rebanho']);
    }
  });

  test('parto sem animal no Rebanho', () => {
    assert.ok(achar(P, 'parto-sem-animal', 'Z1'));
  });

  test('Fazenda "Bonito" vira correção em massa para "Santo Antônio"', () => {
    const p = achar(P, 'fazenda-fora-da-lista')!;
    assert.equal(p.severidade, 'corrigivel');
    assert.deepEqual(p.correcao, { tipo: 'coluna-valor', aba: 'Toque', col: 'Fazenda', linhas: [3, 4], de: 'Bonito', para: 'Santo Antônio' });
  });

  test('ids são únicos e estáveis entre duas leituras iguais', () => {
    const ids = P.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(montarRelatorio(entrada(), cliente, HOJE).problemas.map((p) => p.id), ids);
  });
});

describe('bovinos/relatorio — bloqueios', () => {
  test('sexo diferente entre parto e Rebanho bloqueia a correção', () => {
    const r2 = rebanho.map((l) => [...l]);
    r2[4][7] = 'Macho'; // B1 vira macho no Rebanho; o parto diz fêmea
    const P = montarRelatorio(entrada({ rebanho: r2 }), cliente, HOJE).problemas;
    const p = achar(P, 'pai-preencher', 'B1')!;
    assert.equal(p.severidade, 'manual');
    assert.ok(p.bloqueios[0].includes('Sexo diferente'));
  });

  test('gêmeos (2 dias) não disparam mãe com dois bezerros', () => {
    const p2 = parto.map((l) => [...l]);
    p2[6][9] = '03/09/2024'; // C2 nasce 2 dias depois de C1
    const P = montarRelatorio(entrada({ partos: [{ aba: 'Parto', valores: p2 }] }), cliente, HOJE).problemas;
    assert.equal(achar(P, 'mae-dois-bezerros'), undefined);
  });

  test('RebanhoProd sem coluna obrigatória vira aviso, sem problemas', () => {
    const rel = montarRelatorio(entrada({ rebanho: [['ID A', 'ID animal']] }), cliente, HOJE);
    assert.equal(rel.problemas.length, 0);
    assert.ok(rel.avisos.some((a) => a.includes('RebanhoProd sem as colunas')));
  });
});

describe('bovinos/relatorio — identidade da mãe (casos reais da Bonito)', () => {
  const CAB_R2 = ['ID rebanho', 'ID A', 'ID animal', 'ID eletrônica', 'ID Mãe', 'ID Pai', 'Data de nascimento', 'Sexo', 'N° de manejo', 'ID M', 'ID P'];
  const reb = aba(CAB_R2, [
    /* 2 */ { 'ID rebanho': 'r1', 'ID A': 'KV1', 'ID animal': '686083', 'N° de manejo': '686083', Sexo: 'Fêmea' },
    /* 3 */ { 'ID rebanho': 'r2', 'ID A': 'KV2', 'ID animal': '636736', 'N° de manejo': '636736', Sexo: 'Fêmea' },
    /* 4 */ { 'ID rebanho': 'r3', 'ID A': 'KB1', 'ID animal': '283 25F', 'ID Mãe': '686083', 'Data de nascimento': '13/10/2025', Sexo: 'Fêmea' },
    // Novilha cujo N° de manejo é o número de OUTRA vaca (069362).
    /* 5 */ { 'ID rebanho': 'r4', 'ID A': 'KN', 'ID animal': '142 25F', 'N° de manejo': '069362', Sexo: 'Fêmea' },
    /* 6 */ { 'ID rebanho': 'r5', 'ID A': 'KV3', 'ID animal': '069362', 'N° de manejo': '069362', Sexo: 'Fêmea' },
    /* 7 */ { 'ID rebanho': 'r6', 'ID A': 'KB2', 'ID animal': '68 26M', 'ID Mãe': '142 25F', 'Data de nascimento': '02/08/2026', Sexo: 'Macho' },
  ]);
  const par = aba(CAB_P, [
    // ID Mãe diz 686083, mas a chave aponta para 636736.
    { 'ID M': 'KV2', 'ID A': 'KB1', 'ID animal': '283 25F', 'ID Mãe': '686083', 'Data de nascimento': '13/10/2025', Sexo: 'Fêmea' },
    { 'ID M': 'KN', 'ID A': 'KB2', 'ID animal': '68 26M', 'ID Mãe': '142 25F', 'Data de nascimento': '02/08/2026', Sexo: 'Macho' },
  ]);
  const rep = aba(CAB_Q, [
    { 'ID animal': '636736', 'Data IATF': '30/12/2024', 'Patida (sêmen)': 'SOLUTION' },
    { 'ID animal': '069362', 'Data IATF': '24/10/2025', 'Patida (sêmen)': 'RIOS15-01' },
  ]);
  const P = montarRelatorio(
    { rebanho: reb, partos: [{ aba: 'Parto', valores: par }], reproducao: rep, formulas: [], linhasCompletas: [], fazendas: [] },
    { ...cliente, colunasFormula: [] },
    HOJE,
  ).problemas;

  test('chave do parto apontando para outra vaca: bloqueia, não usa a IATF da outra', () => {
    assert.equal(achar(P, 'pai-preencher', '283 25F'), undefined);
    const c = achar(P, 'mae-diferente', '283 25F')!;
    assert.ok(c.resumo.includes('aponta para 636736'));
  });

  test('N° de manejo que é número de outra vaca não liga IATF', () => {
    assert.equal(achar(P, 'pai-preencher', '68 26M'), undefined);
  });
});

describe('bovinos/relatorio — fórmula com duas versões (caso real da Santo Antônio)', () => {
  const ANTIGA = (l: number) => `=IF(BK${l}<=365;"Bezerra";"Recria")`;
  const ATUAL = (l: number) => `=IF(BK${l}<365;"Bezerra";"Novilha")`;
  // L2–L6 antiga (mais comum), L7 atual, L8 sem fórmula, L9 atual (última linha).
  const col = ['Categoria', ANTIGA(2), ANTIGA(3), ANTIGA(4), ANTIGA(5), ANTIGA(6), ATUAL(7), '', ATUAL(9)];
  const reb = aba(['ID rebanho', 'ID A', 'ID animal', 'ID Mãe', 'ID Pai', 'Data de nascimento', 'Sexo'], Array.from({ length: 8 }, (_, k) => ({ 'ID rebanho': `r${k}`, 'ID A': `K${k + 2}`, 'ID animal': `V${k + 2}`, Sexo: 'Fêmea' })));
  const P = montarRelatorio(
    { rebanho: reb, partos: [], reproducao: null, formulas: [{ col: 'Categoria', valores: col }], linhasCompletas: [], fazendas: [] },
    { ...cliente, colunasFormula: ['Categoria'] },
    HOJE,
  ).problemas;

  test('a doadora é a versão ATUAL (da última linha), não a mais comum', () => {
    const p = achar(P, 'formula-ausente', 'V8')!;
    assert.deepEqual(p.correcao?.tipo === 'formula' && p.correcao.colunas, [{ col: 'Categoria', linhaDoadora: 7 }]);
  });

  test('avisa que a coluna tem duas versões', () => {
    const p = achar(P, 'formula-versoes')!;
    assert.equal(p.severidade, 'info');
    assert.ok(p.resumo.includes('5 linhas com versão diferente da atual (2 linhas)'));
  });
});
