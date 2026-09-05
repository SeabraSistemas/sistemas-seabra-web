import 'server-only';

import { crc32 } from 'node:zlib';

/**
 * Gerador de .xlsx sem dependência.
 *
 * POR QUE NÃO INSTALAR UMA LIB: um .xlsx é um ZIP com cinco arquivos XML, e o
 * ZIP aceita entradas STORED (sem compressão) — o que dispensa implementar
 * deflate. O trabalho todo cabe em ~150 linhas. As alternativas custam bem mais
 * do que economizam: `exceljs` passa de 1 MB no bundle da função serverless, e
 * `sheetjs` traz superfície de supply chain que não se justifica para escrever
 * uma grade retangular de valores. O repo já tomou essa decisão uma vez, ao
 * escrever o próprio TOTP em vez de instalar um pacote (src/lib/adm/totp.ts).
 *
 * O QUE ISSO NÃO FAZ, de propósito: fórmula, estilo, mesclagem, mais de uma
 * planilha, imagem. Se um dia for preciso, aí sim vale uma lib — este arquivo
 * some inteiro e nada mais muda, porque a fronteira é `gerarXlsx()`.
 *
 * TIPAGEM DAS CÉLULAS: número vai como número nativo e data como serial de
 * data, não como texto. É o que faz a soma e o filtro de data funcionarem no
 * Excel do Felipe. Texto que PARECE número (número de animal com zero à
 * esquerda, CEP) vai como texto justamente para o zero não sumir.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Células
// ─────────────────────────────────────────────────────────────────────────────

export type CelulaXlsx =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'numero'; valor: number }
  | { tipo: 'data'; valor: Date }
  | { tipo: 'booleano'; valor: boolean }
  | { tipo: 'vazio' };

export const CELULA_VAZIA: CelulaXlsx = { tipo: 'vazio' };

export function texto(valor: string | null | undefined): CelulaXlsx {
  const v = (valor ?? '').trim();
  return v ? { tipo: 'texto', valor: v } : CELULA_VAZIA;
}

export function numero(valor: number | null | undefined): CelulaXlsx {
  return valor == null || !Number.isFinite(valor) ? CELULA_VAZIA : { tipo: 'numero', valor };
}

export function data(valor: Date | null | undefined): CelulaXlsx {
  return valor && !Number.isNaN(valor.getTime()) ? { tipo: 'data', valor } : CELULA_VAZIA;
}

export function booleano(valor: boolean | null | undefined): CelulaXlsx {
  return valor == null ? CELULA_VAZIA : { tipo: 'booleano', valor };
}

// ─────────────────────────────────────────────────────────────────────────────
// XML
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escape de XML mais o descarte dos caracteres de controle que o XML 1.0
 * proíbe. Sem esse filtro, um byte de controle que tenha entrado num campo de observação
 * lá no app gera um arquivo que o Excel recusa a abrir inteiro — e o erro que
 * ele mostra não diz onde está o problema.
 */
function xml(valor: string): string {
  return valor
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 0 → A, 25 → Z, 26 → AA. */
function colunaLetra(indice: number): string {
  let n = indice + 1;
  let saida = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    saida = String.fromCharCode(65 + resto) + saida;
    n = Math.floor((n - 1) / 26);
  }
  return saida;
}

/**
 * Serial de data do Excel: dias desde 1899-12-30. O epoch "errado" (30/12 em
 * vez de 31/12) é intencional e compensa o bug histórico do Lotus 1-2-3, que o
 * Excel copiou e nunca corrigiu: ele considera 1900 bissexto.
 *
 * A conversão usa o horário LOCAL de São Paulo, não UTC — uma pesagem lançada
 * às 21h de Brasília é do dia 4 para o Felipe, e viraria dia 5 se serializada
 * em UTC.
 */
const FUSO = 'America/Sao_Paulo';
const MS_DIA = 86400000;

function serialData(d: Date): number {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const p = (tipo: string) => Number(partes.find((x) => x.type === tipo)?.value ?? 0);
  const local = Date.UTC(p('year'), p('month') - 1, p('day'), p('hour') % 24, p('minute'), p('second'));
  return (local - Date.UTC(1899, 11, 30)) / MS_DIA;
}

function celulaXml(ref: string, celula: CelulaXlsx): string {
  switch (celula.tipo) {
    case 'vazio':
      return '';
    case 'numero':
      return `<c r="${ref}"><v>${celula.valor}</v></c>`;
    case 'booleano':
      return `<c r="${ref}" t="b"><v>${celula.valor ? 1 : 0}</v></c>`;
    case 'data':
      // s="1" aponta para o formato de data declarado em styles.xml.
      return `<c r="${ref}" s="1"><v>${serialData(celula.valor)}</v></c>`;
    case 'texto':
      // inlineStr evita a tabela de strings compartilhadas: gasta mais bytes,
      // mas permite escrever a planilha numa passada só, sem indexar antes.
      return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(celula.valor)}</t></is></c>`;
  }
}

function planilhaXml(cabecalho: readonly string[], linhas: readonly CelulaXlsx[][]): string {
  const partes: string[] = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    // Congela a primeira linha: rolar 4.000 animais sem cabeçalho é inútil.
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
    '<sheetData>',
    `<row r="1">${cabecalho.map((h, i) => celulaXml(`${colunaLetra(i)}1`, { tipo: 'texto', valor: h })).join('')}</row>`,
  ];
  linhas.forEach((linha, indice) => {
    const r = indice + 2;
    const celulas = linha.map((c, i) => celulaXml(`${colunaLetra(i)}${r}`, c)).join('');
    partes.push(`<row r="${r}">${celulas}</row>`);
  });
  partes.push('</sheetData>');
  // O autofiltro dá ao Felipe o mesmo filtro da tela dentro do Excel.
  if (cabecalho.length > 0) {
    partes.push(`<autoFilter ref="A1:${colunaLetra(cabecalho.length - 1)}${linhas.length + 1}"/>`);
  }
  partes.push('</worksheet>');
  return partes.join('');
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const WORKBOOK_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

/** numFmtId 14 é o formato de data curta do próprio Excel, que se adapta ao
 *  locale de quem abre — melhor que fixar dd/mm/aaaa e quebrar para outros. */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function workbookXml(nomeAba: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${xml(nomeAba)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZIP (método STORED — sem compressão, sem deflate para implementar)
// ─────────────────────────────────────────────────────────────────────────────

interface EntradaZip {
  nome: string;
  dados: Buffer;
  crc: number;
  offset: number;
}

/** Data/hora no formato MS-DOS que o cabeçalho do ZIP exige. */
function dosDataHora(d: Date): { hora: number; data: number } {
  const ano = Math.max(1980, d.getFullYear());
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    data: ((ano - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function zipar(arquivos: { nome: string; conteudo: string }[], agora: Date): Buffer {
  const { hora, data: dataDos } = dosDataHora(agora);
  const locais: Buffer[] = [];
  const entradas: EntradaZip[] = [];
  let offset = 0;

  for (const arquivo of arquivos) {
    const dados = Buffer.from(arquivo.conteudo, 'utf8');
    const crc = crc32(dados);
    const nome = Buffer.from(arquivo.nome, 'utf8');

    const cabecalho = Buffer.alloc(30);
    cabecalho.writeUInt32LE(0x04034b50, 0); // assinatura local
    cabecalho.writeUInt16LE(20, 4); // versão necessária
    cabecalho.writeUInt16LE(0, 6); // flags
    cabecalho.writeUInt16LE(0, 8); // método 0 = STORED
    cabecalho.writeUInt16LE(hora, 10);
    cabecalho.writeUInt16LE(dataDos, 12);
    cabecalho.writeUInt32LE(crc, 14);
    cabecalho.writeUInt32LE(dados.length, 18); // tamanho comprimido = original
    cabecalho.writeUInt32LE(dados.length, 22);
    cabecalho.writeUInt16LE(nome.length, 26);
    cabecalho.writeUInt16LE(0, 28); // sem campo extra

    locais.push(cabecalho, nome, dados);
    entradas.push({ nome: arquivo.nome, dados, crc, offset });
    offset += cabecalho.length + nome.length + dados.length;
  }

  const centrais: Buffer[] = [];
  for (const entrada of entradas) {
    const nome = Buffer.from(entrada.nome, 'utf8');
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // versão de quem criou
    central.writeUInt16LE(20, 6); // versão necessária
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10); // STORED
    central.writeUInt16LE(hora, 12);
    central.writeUInt16LE(dataDos, 14);
    central.writeUInt32LE(entrada.crc, 16);
    central.writeUInt32LE(entrada.dados.length, 20);
    central.writeUInt32LE(entrada.dados.length, 24);
    central.writeUInt16LE(nome.length, 28);
    central.writeUInt16LE(0, 30); // extra
    central.writeUInt16LE(0, 32); // comentário
    central.writeUInt16LE(0, 34); // disco
    central.writeUInt16LE(0, 36); // atributos internos
    central.writeUInt32LE(0, 38); // atributos externos
    central.writeUInt32LE(entrada.offset, 42);
    centrais.push(central, nome);
  }

  const corpo = Buffer.concat(locais);
  const diretorio = Buffer.concat(centrais);

  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(0, 4); // número do disco
  fim.writeUInt16LE(0, 6); // disco do diretório central
  fim.writeUInt16LE(entradas.length, 8); // entradas neste disco
  fim.writeUInt16LE(entradas.length, 10); // entradas no total
  fim.writeUInt32LE(diretorio.length, 12); // tamanho do diretório central
  // Offset 16, não 14: o campo de tamanho acima ocupa 12..15. Escrever em 14
  // sobrepõe os dois e produz um ZIP que abre em algumas ferramentas e falha
  // em outras — o tipo de defeito que só aparece na máquina de quem recebeu.
  fim.writeUInt32LE(corpo.length, 16); // onde o diretório central começa
  fim.writeUInt16LE(0, 20); // sem comentário

  return Buffer.concat([corpo, diretorio, fim]);
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

/** Nome de aba do Excel: 31 caracteres e sem : \ / ? * [ ] */
function nomeAbaValido(bruto: string): string {
  const limpo = bruto.replace(/[:\\/?*[\]]/g, ' ').trim();
  return (limpo || 'Dados').slice(0, 31);
}

/**
 * Monta o arquivo inteiro em memória — e é por isso que a rota de exportação
 * impõe um teto de linhas ao XLSX enquanto o CSV, que sai em fluxo, não tem
 * teto. O ZIP precisa do CRC e do tamanho de cada entrada no cabeçalho LOCAL,
 * que vem antes dos dados; escrever em fluxo exigiria descritor de dados e
 * torna o arquivo mais frágil para pouco ganho.
 */
export function gerarXlsx({
  cabecalho,
  linhas,
  nomeAba = 'Dados',
  agora = new Date(),
}: {
  cabecalho: readonly string[];
  linhas: readonly CelulaXlsx[][];
  nomeAba?: string;
  agora?: Date;
}): Buffer {
  return zipar(
    [
      { nome: '[Content_Types].xml', conteudo: CONTENT_TYPES },
      { nome: '_rels/.rels', conteudo: RELS },
      { nome: 'xl/workbook.xml', conteudo: workbookXml(nomeAbaValido(nomeAba)) },
      { nome: 'xl/_rels/workbook.xml.rels', conteudo: WORKBOOK_RELS },
      { nome: 'xl/styles.xml', conteudo: STYLES },
      { nome: 'xl/worksheets/sheet1.xml', conteudo: planilhaXml(cabecalho, linhas) },
    ],
    agora,
  );
}

export const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
