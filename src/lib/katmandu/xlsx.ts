/**
 * Gerador de .xlsx sem dependência, pro browser (client component) — mesma
 * ideia de `src/lib/adm/xlsx.ts` (que é server-only, usa `Buffer`/`node:zlib`
 * e não pode entrar num bundle de cliente), portado pra `Uint8Array`/
 * `TextEncoder`/CRC32 manual, que rodam em qualquer lugar. Ver aquele arquivo
 * pro racional completo de "por que não instalar `exceljs`/`sheetjs`".
 *
 * Só texto (ver `CsvColumn.value` em CsvExport.tsx: já chega como string
 * formatada, igual ao CSV) — sem número/data tipados, sem estilo além do
 * cabeçalho congelado e do autofiltro. Suficiente pro volume do Katmandu
 * (centenas de linhas, não os milhares do /adm).
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

function celulaTextoXml(ref: string, valor: string): string {
  if (!valor) return '';
  // inlineStr evita a tabela de strings compartilhadas: gasta mais bytes, mas
  // permite escrever a planilha numa passada só, sem indexar antes.
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(valor)}</t></is></c>`;
}

function planilhaXml(cabecalho: readonly string[], linhas: readonly string[][]): string {
  const partes: string[] = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>',
    '<sheetData>',
    `<row r="1">${cabecalho.map((h, i) => celulaTextoXml(`${colunaLetra(i)}1`, h)).join('')}</row>`,
  ];
  linhas.forEach((linha, indice) => {
    const r = indice + 2;
    const celulas = linha.map((v, i) => celulaTextoXml(`${colunaLetra(i)}${r}`, v)).join('');
    partes.push(`<row r="${r}">${celulas}</row>`);
  });
  partes.push('</sheetData>');
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

/** Estilo mínimo — só o default (índice 0). Sem cell tipada aqui (texto puro), então não precisa de mais nada. */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
<borders count="1"><border/></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

function workbookXml(nomeAba: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${xml(nomeAba)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CRC32 (tabela padrão IEEE/zlib — mesma usada pelo ZIP)
// ─────────────────────────────────────────────────────────────────────────────

let tabelaCrc: Uint32Array | null = null;

function crc32(bytes: Uint8Array): number {
  if (!tabelaCrc) {
    tabelaCrc = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tabelaCrc[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = tabelaCrc[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZIP (método STORED — sem compressão, sem deflate para implementar)
// ─────────────────────────────────────────────────────────────────────────────

function dosDataHora(d: Date): { hora: number; data: number } {
  const ano = Math.max(1980, d.getFullYear());
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    data: ((ano - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((soma, a) => soma + a.length, 0);
  const saida = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    saida.set(a, offset);
    offset += a.length;
  }
  return saida;
}

function zipar(arquivos: { nome: string; conteudo: string }[], agora: Date): Uint8Array {
  const { hora, data: dataDos } = dosDataHora(agora);
  const encoder = new TextEncoder();
  const locais: Uint8Array[] = [];
  const entradas: { nome: Uint8Array; tamanho: number; crc: number; offset: number }[] = [];
  let offset = 0;

  for (const arquivo of arquivos) {
    const dados = encoder.encode(arquivo.conteudo);
    const crc = crc32(dados);
    const nome = encoder.encode(arquivo.nome);

    const cabecalho = new Uint8Array(30);
    const view = new DataView(cabecalho.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true); // método 0 = STORED
    view.setUint16(10, hora, true);
    view.setUint16(12, dataDos, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, dados.length, true); // tamanho comprimido = original
    view.setUint32(22, dados.length, true);
    view.setUint16(26, nome.length, true);
    view.setUint16(28, 0, true);

    locais.push(cabecalho, nome, dados);
    entradas.push({ nome, tamanho: dados.length, crc, offset });
    offset += cabecalho.length + nome.length + dados.length;
  }

  const centrais: Uint8Array[] = [];
  for (const entrada of entradas) {
    const central = new Uint8Array(46);
    const view = new DataView(central.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true); // STORED
    view.setUint16(12, hora, true);
    view.setUint16(14, dataDos, true);
    view.setUint32(16, entrada.crc, true);
    view.setUint32(20, entrada.tamanho, true);
    view.setUint32(24, entrada.tamanho, true);
    view.setUint16(28, entrada.nome.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, entrada.offset, true);
    centrais.push(central, entrada.nome);
  }

  const corpo = concat(locais);
  const diretorio = concat(centrais);

  const fim = new Uint8Array(22);
  const viewFim = new DataView(fim.buffer);
  viewFim.setUint32(0, 0x06054b50, true);
  viewFim.setUint16(4, 0, true);
  viewFim.setUint16(6, 0, true);
  viewFim.setUint16(8, entradas.length, true);
  viewFim.setUint16(10, entradas.length, true);
  viewFim.setUint32(12, diretorio.length, true);
  viewFim.setUint32(16, corpo.length, true);
  viewFim.setUint16(20, 0, true);

  return concat([corpo, diretorio, fim]);
}

// ─────────────────────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────────────────────

/** Nome de aba do Excel: 31 caracteres e sem : \ / ? * [ ] */
function nomeAbaValido(bruto: string): string {
  const limpo = bruto.replace(/[:\\/?*[\]]/g, ' ').trim();
  return (limpo || 'Dados').slice(0, 31);
}

export function gerarXlsx({
  cabecalho,
  linhas,
  nomeAba = 'Dados',
}: {
  cabecalho: readonly string[];
  linhas: readonly string[][];
  nomeAba?: string;
}): Uint8Array {
  return zipar(
    [
      { nome: '[Content_Types].xml', conteudo: CONTENT_TYPES },
      { nome: '_rels/.rels', conteudo: RELS },
      { nome: 'xl/workbook.xml', conteudo: workbookXml(nomeAbaValido(nomeAba)) },
      { nome: 'xl/_rels/workbook.xml.rels', conteudo: WORKBOOK_RELS },
      { nome: 'xl/styles.xml', conteudo: STYLES },
      { nome: 'xl/worksheets/sheet1.xml', conteudo: planilhaXml(cabecalho, linhas) },
    ],
    new Date(),
  );
}

export const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
