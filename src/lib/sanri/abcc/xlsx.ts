/**
 * Preenche um .xlsx EXISTENTE sem reescrevê-lo: abre o zip, troca só o texto
 * das células e das caixas de texto pedidas e fecha de novo. Logo, mesclas,
 * bordas, larguras, validações e desenhos ficam byte a byte como no modelo do
 * criador — a ABCC só aceita a folha oficial.
 *
 * Por que não uma biblioteca de planilha (exceljs, xlsx): elas leem o arquivo
 * para um modelo próprio e gravam um arquivo novo; no caminho perdem as caixas
 * de texto do cabeçalho da CDC (desenho, não célula) e mexem em estilo. E o
 * repo não instala lib para .xlsx (src/lib/adm/xlsx.ts): o zip aqui é o do
 * próprio Node (zlib), que lê e grava deflate.
 *
 * Funções puras sobre texto XML — o teste pega sem servidor.
 */
import { crc32, deflateRawSync, inflateRawSync } from 'node:zlib';

export type Pacote = { nomes: string[]; arquivos: Record<string, Uint8Array> };

// ---------------------------------------------------------------------------
// Zip (o .xlsx é um zip de XMLs)
// ---------------------------------------------------------------------------

const ASSINATURA_FIM = 0x06054b50;
const ASSINATURA_CENTRAL = 0x02014b50;
const ASSINATURA_LOCAL = 0x04034b50;

/** Abre o zip pelo diretório central (o tamanho certo de cada entrada mora lá). */
export function abrir(bytes: Uint8Array): Pacote {
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let fim = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (b.readUInt32LE(i) === ASSINATURA_FIM) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error('o arquivo não é um .xlsx');
  const total = b.readUInt16LE(fim + 10);
  let p = b.readUInt32LE(fim + 16);
  const nomes: string[] = [];
  const arquivos: Record<string, Uint8Array> = {};
  for (let k = 0; k < total; k++) {
    if (b.readUInt32LE(p) !== ASSINATURA_CENTRAL) throw new Error('.xlsx corrompido');
    const metodo = b.readUInt16LE(p + 10);
    const comprimido = b.readUInt32LE(p + 20);
    const lNome = b.readUInt16LE(p + 28);
    const lExtra = b.readUInt16LE(p + 30);
    const lComentario = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const nome = b.toString('utf8', p + 46, p + 46 + lNome);
    if (b.readUInt32LE(local) !== ASSINATURA_LOCAL) throw new Error('.xlsx corrompido');
    const ini = local + 30 + b.readUInt16LE(local + 26) + b.readUInt16LE(local + 28);
    const dados = b.subarray(ini, ini + comprimido);
    if (metodo === 0) arquivos[nome] = new Uint8Array(dados);
    else if (metodo === 8) arquivos[nome] = new Uint8Array(inflateRawSync(dados));
    else throw new Error(`.xlsx com compressão ${metodo}`);
    nomes.push(nome);
    p += 46 + lNome + lExtra + lComentario;
  }
  return { nomes, arquivos };
}

/** Data/hora no formato MS-DOS que o cabeçalho do zip exige. */
function dosDataHora(d: Date): { hora: number; data: number } {
  const ano = Math.max(1980, d.getFullYear());
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    data: ((ano - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** Fecha na mesma ordem de entradas do original ([Content_Types].xml primeiro). */
export function fechar(p: Pacote, agora = new Date()): Uint8Array {
  const { hora, data } = dosDataHora(agora);
  const locais: Buffer[] = [];
  const centrais: Buffer[] = [];
  let offset = 0;
  for (const nomeTexto of p.nomes) {
    const original = Buffer.from(p.arquivos[nomeTexto]);
    const dados = deflateRawSync(original);
    const crc = crc32(original);
    const nome = Buffer.from(nomeTexto, 'utf8');
    const flags = /[^\x00-\x7f]/.test(nomeTexto) ? 0x0800 : 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(ASSINATURA_LOCAL, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(flags, 6);
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(hora, 10);
    local.writeUInt16LE(data, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dados.length, 18);
    local.writeUInt32LE(original.length, 22);
    local.writeUInt16LE(nome.length, 26);
    local.writeUInt16LE(0, 28);
    locais.push(local, nome, dados);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(ASSINATURA_CENTRAL, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(flags, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(hora, 12);
    central.writeUInt16LE(data, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(dados.length, 20);
    central.writeUInt32LE(original.length, 24);
    central.writeUInt16LE(nome.length, 28);
    central.writeUInt32LE(offset, 42);
    centrais.push(central, nome);

    offset += local.length + nome.length + dados.length;
  }
  const corpo = Buffer.concat(locais);
  const diretorio = Buffer.concat(centrais);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(ASSINATURA_FIM, 0);
  fim.writeUInt16LE(p.nomes.length, 8);
  fim.writeUInt16LE(p.nomes.length, 10);
  fim.writeUInt32LE(diretorio.length, 12);
  fim.writeUInt32LE(corpo.length, 16);
  return new Uint8Array(Buffer.concat([corpo, diretorio, fim]));
}

export function lerTexto(p: Pacote, caminho: string): string {
  const a = p.arquivos[caminho];
  if (!a) throw new Error(`modelo sem ${caminho}`);
  return Buffer.from(a).toString('utf8');
}

export function gravarTexto(p: Pacote, caminho: string, texto: string): void {
  if (!p.arquivos[caminho]) throw new Error(`modelo sem ${caminho}`);
  p.arquivos[caminho] = new Uint8Array(Buffer.from(texto, 'utf8'));
}

export function escaparXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function desescaparXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

// ---------------------------------------------------------------------------
// Endereços
// ---------------------------------------------------------------------------

export function colunaParaNumero(col: string): number {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function numeroParaColuna(n: number): string {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function separarRef(ref: string): { col: string; linha: number } {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) throw new Error(`célula inválida: ${ref}`);
  return { col: m[1], linha: Number(m[2]) };
}

/** Colunas de `de` até `ate` ("B", "Q" -> B, C, …, Q). */
export function colunas(de: string, ate: string): string[] {
  const out: string[] = [];
  for (let i = colunaParaNumero(de); i <= colunaParaNumero(ate); i++) out.push(numeroParaColuna(i));
  return out;
}

/** Dias desde 30/12/1899 — a data do Excel. "2026-09-02" -> 46267. */
export function serialExcel(dataIso: string): number {
  const [a, m, d] = dataIso.slice(0, 10).split('-').map(Number);
  return Math.round((Date.UTC(a, m - 1, d) - Date.UTC(1899, 11, 30)) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Textos compartilhados (sharedStrings.xml)
// ---------------------------------------------------------------------------

export class Textos {
  private xml: string;
  private indice = new Map<string, number>();
  private total: number;
  private novos: string[] = [];
  private referencias = 0;

  constructor(xml: string) {
    this.xml = xml;
    const itens = xml.match(/<si>[\s\S]*?<\/si>/g) ?? [];
    this.total = itens.length;
    itens.forEach((si, i) => {
      // Só texto simples (um <t> sem formatação) é reaproveitado.
      const m = /^<si><t(?: xml:space="preserve")?>([\s\S]*?)<\/t><\/si>$/.exec(si);
      if (m) {
        const k = desescaparXml(m[1]);
        if (!this.indice.has(k)) this.indice.set(k, i);
      }
    });
  }

  /** Texto da posição i (o que a célula mostra). */
  ler(i: number): string {
    const itens = this.xml.match(/<si>[\s\S]*?<\/si>/g) ?? [];
    const si = itens[i] ?? '';
    return desescaparXml((si.match(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g) ?? []).map((t) => t.replace(/<[^>]+>/g, '')).join(''));
  }

  indiceDe(texto: string): number {
    this.referencias++;
    const ja = this.indice.get(texto);
    if (ja != null) return ja;
    const i = this.total + this.novos.length;
    this.novos.push(texto);
    this.indice.set(texto, i);
    return i;
  }

  paraXml(): string {
    if (this.novos.length === 0 && this.referencias === 0) return this.xml;
    const extra = this.novos
      .map((t) => `<si><t${/^\s|\s$/.test(t) ? ' xml:space="preserve"' : ''}>${escaparXml(t)}</t></si>`)
      .join('');
    const unico = this.total + this.novos.length;
    return this.xml
      .replace(/<\/sst>\s*$/, `${extra}</sst>`)
      .replace(/(<sst\b[^>]*?)\suniqueCount="\d+"/, `$1 uniqueCount="${unico}"`)
      .replace(/(<sst\b[^>]*?)\scount="(\d+)"/, (_, ini: string, n: string) => `${ini} count="${Number(n) + this.referencias}"`);
  }
}

// ---------------------------------------------------------------------------
// Células da planilha (sheetN.xml)
// ---------------------------------------------------------------------------

export type Valor = { texto: string } | { numero: number } | null;

export interface Escrita {
  ref: string;
  valor: Valor;
  /** Estilo (índice de cellXfs). Omitido = o da célula no modelo. */
  estilo?: number;
}

// Atributos com quantificador PREGUIÇOSO: guloso, "[^>]*" engoliria a barra de
// "<row …/>" e a linha vazia iria até o </row> da linha seguinte.
const RE_LINHA = (n: number) => new RegExp(`<row r="${n}"(?:\\s[^>]*?)?(?:/>|>[\\s\\S]*?</row>)`);
const RE_CELULA = (ref: string) => new RegExp(`<c r="${ref}"(\\s[^>]*?)?(?:/>|>[\\s\\S]*?</c>)`);

/** O estilo (s=) da célula no modelo, ou null se ela não existe. */
export function estiloDe(planilha: string, ref: string): number | null {
  const { linha } = separarRef(ref);
  const row = RE_LINHA(linha).exec(planilha)?.[0];
  if (!row) return null;
  const c = RE_CELULA(ref).exec(row)?.[0];
  if (!c) return null;
  const m = /\ss="(\d+)"/.exec(c);
  return m ? Number(m[1]) : 0;
}

/** O que a célula mostra: texto, número ou null (vazia / inexistente). */
export function valorDe(planilha: string, ref: string, textos: Textos): Valor {
  const { linha } = separarRef(ref);
  const row = RE_LINHA(linha).exec(planilha)?.[0];
  const c = row ? RE_CELULA(ref).exec(row)?.[0] : undefined;
  if (!c) return null;
  const v = /<v>([\s\S]*?)<\/v>/.exec(c)?.[1];
  const t = /\st="(\w+)"/.exec(c)?.[1];
  if (t === 'inlineStr') return { texto: desescaparXml((/<t[^>]*>([\s\S]*?)<\/t>/.exec(c)?.[1]) ?? '') };
  if (v == null) return null;
  if (t === 's') return { texto: textos.ler(Number(v)) };
  if (t === 'str') return { texto: desescaparXml(v) };
  return { numero: Number(v) };
}

function montarCelula(ref: string, estilo: number | null, valor: Valor, textos: Textos): string {
  const s = estilo != null && estilo !== 0 ? ` s="${estilo}"` : '';
  if (valor == null) return `<c r="${ref}"${s}/>`;
  if ('numero' in valor) {
    if (!Number.isFinite(valor.numero)) throw new Error(`número inválido em ${ref}`);
    return `<c r="${ref}"${s}><v>${valor.numero}</v></c>`;
  }
  return `<c r="${ref}"${s} t="s"><v>${textos.indiceDe(valor.texto)}</v></c>`;
}

/**
 * Escreve as células na planilha. A célula que já existe é trocada no lugar
 * (mantém o estilo, a não ser que `estilo` venha); a que não existe entra na
 * linha, na ordem das colunas. Linha inexistente é erro: o modelo tem todas.
 */
export function escreverCelulas(planilha: string, escritas: Escrita[], textos: Textos): string {
  let xml = planilha;
  for (const e of escritas) {
    const { col, linha } = separarRef(e.ref);
    const mRow = RE_LINHA(linha).exec(xml);
    if (!mRow) throw new Error(`o modelo não tem a linha ${linha}`);
    let row = mRow[0];
    const mCel = RE_CELULA(e.ref).exec(row);
    const estiloAtual = mCel ? Number(/\ss="(\d+)"/.exec(mCel[0])?.[1] ?? 0) : null;
    const nova = montarCelula(e.ref, e.estilo ?? estiloAtual, e.valor, textos);
    if (mCel) {
      row = row.slice(0, mCel.index) + nova + row.slice(mCel.index + mCel[0].length);
    } else {
      if (row.endsWith('/>')) row = `${row.slice(0, -2)}></row>`;
      const alvo = colunaParaNumero(col);
      let pos = row.lastIndexOf('</row>');
      for (const m of row.matchAll(/<c r="([A-Z]+)\d+"/g)) {
        if (colunaParaNumero(m[1]) > alvo) {
          pos = m.index;
          break;
        }
      }
      row = row.slice(0, pos) + nova + row.slice(pos);
    }
    xml = xml.slice(0, mRow.index) + row + xml.slice(mRow.index + mRow[0].length);
  }
  return xml;
}

/** Esvazia as células (fica o estilo, sai o valor). */
export function limparCelulas(planilha: string, refs: string[], textos: Textos): string {
  return escreverCelulas(
    planilha,
    refs.filter((ref) => estiloDe(planilha, ref) != null).map((ref) => ({ ref, valor: null })),
    textos,
  );
}

// ---------------------------------------------------------------------------
// Caixas de texto (drawingN.xml): trocar o texto de um trecho (run)
// ---------------------------------------------------------------------------

export interface Trecho {
  /** Posição do texto (entre <a:t> e </a:t>) no XML. */
  ini: number;
  fim: number;
  texto: string;
  /** Parágrafo (<a:p>) em que está — para achar "o trecho seguinte". */
  paragrafo: number;
}

/** Todos os trechos de texto do desenho, na ordem do arquivo. */
export function trechos(desenho: string): Trecho[] {
  const out: Trecho[] = [];
  let p = 0;
  for (const mp of desenho.matchAll(/<a:p>([\s\S]*?)<\/a:p>/g)) {
    const base = mp.index + '<a:p>'.length;
    for (const mt of mp[1].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)) {
      const ini = base + mt.index + '<a:t>'.length;
      out.push({ ini, fim: ini + mt[1].length, texto: desescaparXml(mt[1]), paragrafo: p });
    }
    p++;
  }
  return out;
}

/** Aplica as trocas (trecho -> texto novo) de trás para frente. */
export function trocarTrechos(desenho: string, trocas: { trecho: Trecho; texto: string }[]): string {
  let xml = desenho;
  for (const { trecho, texto } of [...trocas].sort((a, b) => b.trecho.ini - a.trecho.ini)) {
    xml = xml.slice(0, trecho.ini) + escaparXml(texto) + xml.slice(trecho.fim);
  }
  return xml;
}
