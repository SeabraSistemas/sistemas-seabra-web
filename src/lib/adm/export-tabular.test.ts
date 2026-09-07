/**
 * EXPORTAÇÃO TABULAR — os testes do par CSV/XLSX das telas de carteira.
 *
 * O que este arquivo protege, em ordem de gravidade:
 *
 *   1. O BOM tem de ser o escape Unicode U+FEFF no código-fonte, nunca o caractere
 *      colado direto no arquivo — os dois produzem o MESMO glifo invisível em
 *      qualquer editor, e essa indistinguibilidade visual é exatamente o que
 *      já gerou o defeito antes (a mesma classe de erro de xlsx.ts e do
 *      route.ts). Por isso o teste confere o CÓDIGO do primeiro caractere, e
 *      não a aparência dele.
 *   2. NULO NUNCA VIRA ZERO nem string vazia — em nenhuma das quatro fábricas
 *      de coluna, nos dois formatos.
 *   3. `contentDisposition` — a normalização Unicode que faz o navegador
 *      escolher entre `filename` e `filename*` sem corromper acento.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  colunaBooleano,
  colunaData,
  colunaInteiro,
  colunaNumero,
  colunaTexto,
  contentDisposition,
  gerarCsvTabular,
  gerarXlsxTabular,
} from '@/lib/adm/export-tabular';

interface Linha {
  nome: string | null;
  total: number | null;
  contagem: number | null;
  data: string | null;
  ativo: boolean | null;
}

const linha = (campos: Partial<Linha> = {}): Linha => ({
  nome: 'Fulano',
  total: 1234.5,
  contagem: 3,
  data: '2026-08-24',
  ativo: true,
  ...campos,
});

describe('gerarCsvTabular', () => {
  test('começa com o BOM de verdade (U+FEFF), não um caractere qualquer que se pareça com ele', () => {
    // O bug que este teste existe para pegar não muda a APARÊNCIA do arquivo —
    // o escape \uFEFF de código-fonte e um caractere colado direto na string
    // produzem o mesmo glifo invisível em qualquer editor. Só o CÓDIGO do
    // primeiro caractere distingue os dois, e só um deles é o BOM de verdade.
    const csv = gerarCsvTabular([colunaTexto<Linha>('Nome', (l) => l.nome)], []);
    assert.equal(csv.codePointAt(0), 0xfeff);
  });

  test('separador é ";", nunca ","', () => {
    const csv = gerarCsvTabular(
      [colunaTexto<Linha>('Nome', (l) => l.nome), colunaNumero<Linha>('Total', (l) => l.total)],
      [linha()],
    );
    const [, corpo] = csv.split('\r\n');
    // "1.234,50" carrega uma vírgula — que É um dos gatilhos de aspas de
    // escaparCsv, de propósito: é a mesma decisão de route.ts, conservadora o
    // bastante para não depender de nenhuma ferramenta reconhecer ';' como
    // delimitador antes de olhar a vírgula dentro da célula.
    assert.equal(corpo, 'Fulano;"1.234,50"');
  });

  test('vírgula, ponto-e-vírgula e aspas no valor são escapados entre aspas', () => {
    const csv = gerarCsvTabular([colunaTexto<Linha>('Nome', (l) => l.nome)], [
      linha({ nome: 'Fazenda "Boa Vista"; Ltda' }),
    ]);
    const [, corpo] = csv.split('\r\n');
    assert.equal(corpo, '"Fazenda ""Boa Vista""; Ltda"');
  });

  test('conjunto vazio ainda sai com cabeçalho — nunca um arquivo sem coluna nenhuma', () => {
    const csv = gerarCsvTabular([colunaTexto<Linha>('Nome', (l) => l.nome)], []);
    assert.equal(csv, '\uFEFFNome\r\n');
  });
});

describe('as fábricas de coluna — nulo nunca vira 0 nem vazio', () => {
  test('colunaTexto: nulo e string vazia são "—" no CSV e célula ausente no XLSX', () => {
    const c = colunaTexto<Linha>('Nome', (l) => l.nome);
    assert.equal(c.texto(linha({ nome: null })), '—');
    assert.equal(c.texto(linha({ nome: '' })), '—');
    assert.deepEqual(c.celula(linha({ nome: null })), { tipo: 'vazio' });
    assert.equal(c.texto(linha({ nome: 'Fulano' })), 'Fulano');
  });

  test('colunaNumero: nulo é "—", e ZERO não é confundido com nulo', () => {
    const c = colunaNumero<Linha>('Total', (l) => l.total);
    assert.equal(c.texto(linha({ total: null })), '—');
    assert.deepEqual(c.celula(linha({ total: null })), { tipo: 'vazio' });
    // Zero é um FATO ("recebeu zero"), não a ausência de um. Se a fábrica
    // tratasse os dois igual, todo cliente sem cobrança vencida sumiria da
    // planilha em vez de aparecer com "0,00".
    assert.equal(c.texto(linha({ total: 0 })), '0,00');
    assert.notDeepEqual(c.celula(linha({ total: 0 })), { tipo: 'vazio' });
  });

  test('colunaInteiro: arredonda e nunca casa decimal', () => {
    const c = colunaInteiro<Linha>('Contagem', (l) => l.contagem);
    assert.equal(c.texto(linha({ contagem: 3 })), '3');
    assert.equal(c.texto(linha({ contagem: null })), '—');
  });

  test('colunaData: nulo é "—"; string que não é data vira texto, não some a linha', () => {
    const c = colunaData<Linha>('Data', (l) => l.data);
    assert.equal(c.texto(linha({ data: null })), '—');
    assert.deepEqual(c.celula(linha({ data: null })), { tipo: 'vazio' });

    const invalida = c.celula(linha({ data: 'não é data' }));
    assert.equal(invalida.tipo, 'texto');
  });

  test('colunaBooleano: "Sim"/"Não" no CSV, nulo continua "—"', () => {
    const c = colunaBooleano<Linha>('Ativo', (l) => l.ativo);
    assert.equal(c.texto(linha({ ativo: true })), 'Sim');
    assert.equal(c.texto(linha({ ativo: false })), 'Não');
    assert.equal(c.texto(linha({ ativo: null })), '—');
  });
});

describe('gerarXlsxTabular', () => {
  test('produz um ZIP válido (assinatura PK) com o cabeçalho local', () => {
    const buf = gerarXlsxTabular(
      [colunaTexto<Linha>('Nome', (l) => l.nome), colunaNumero<Linha>('Total', (l) => l.total)],
      [linha()],
      'Pagamentos',
    );
    assert.equal(buf[0], 0x50); // 'P'
    assert.equal(buf[1], 0x4b); // 'K'
  });
});

describe('contentDisposition', () => {
  test('acento sai do filename ASCII, mas continua inteiro no filename* (RFC 5987)', () => {
    const header = contentDisposition('Fazenda São José', 'csv');
    assert.match(header, /filename="Fazenda Sao Jose\.csv"/);
    assert.match(header, /filename\*=UTF-8''Fazenda%20S%C3%A3o%20Jos%C3%A9\.csv/);
  });

  test('nome que vira vazio depois de limpo cai em "export"', () => {
    const header = contentDisposition('###', 'csv');
    assert.match(header, /filename="export\.csv"/);
  });
});
