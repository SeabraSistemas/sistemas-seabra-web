import test from 'node:test';
import assert from 'node:assert/strict';
import { crc32 } from 'node:zlib';

import {
  CELULA_VAZIA,
  booleano,
  data,
  gerarXlsx,
  numero,
  texto,
  type CelulaXlsx,
} from '@/lib/adm/xlsx';

/**
 * O .xlsx é escrito à mão: ZIP com entradas STORED mais seis XMLs. Não há
 * biblioteca aqui e também não há uma nos testes — o leitor abaixo abre o
 * arquivo do jeito que uma ferramenta de verdade abre, pelo EOCD e pelo
 * diretório central, e não pela ordem em que gerarXlsx() escreveu os bytes.
 *
 * Essa distinção é o teste. O defeito que já aconteceu neste arquivo foi o
 * offset do diretório central gravado no byte 14 do EOCD em vez do 16, em cima
 * do campo de tamanho: quem lê sequencialmente do começo não percebe nada, e
 * quem lê pelo EOCD — Excel, LibreOffice, `unzip` — recebe lixo. Ler pelo EOCD
 * faz TODO teste deste arquivo falhar se esse defeito voltar.
 */

const AGORA = new Date('2026-03-04T12:00:00Z');

const SIG_LOCAL = 0x04034b50; // PK\x03\x04
const SIG_CENTRAL = 0x02014b50; // PK\x01\x02
const SIG_EOCD = 0x06054b50; // PK\x05\x06

interface EntradaLida {
  nome: string;
  dados: Buffer;
  metodo: number;
  crcLocal: number;
  crcCentral: number;
  tamComprimido: number;
  tamOriginal: number;
  offsetLocal: number;
}

interface ZipLido {
  posEocd: number;
  entradasNesteDisco: number;
  entradasNoTotal: number;
  tamanhoDiretorio: number;
  offsetDiretorio: number;
  tamanhoComentario: number;
  /** Onde a varredura do diretório central parou. */
  fimDiretorio: number;
  entradas: EntradaLida[];
}

/** Abre o ZIP como uma ferramenta abre: do fim para o começo. */
function lerZip(buf: Buffer): ZipLido {
  const posEocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.notEqual(posEocd, -1, 'não achei a assinatura do EOCD (PK\\x05\\x06) em lugar nenhum do buffer');

  const entradasNesteDisco = buf.readUInt16LE(posEocd + 8);
  const entradasNoTotal = buf.readUInt16LE(posEocd + 10);
  const tamanhoDiretorio = buf.readUInt32LE(posEocd + 12);
  const offsetDiretorio = buf.readUInt32LE(posEocd + 16);
  const tamanhoComentario = buf.readUInt16LE(posEocd + 20);

  const entradas: EntradaLida[] = [];
  let p = offsetDiretorio;

  for (let i = 0; i < entradasNoTotal; i += 1) {
    assert.equal(
      buf.readUInt32LE(p),
      SIG_CENTRAL,
      `entrada ${i} do diretório central: esperava PK\\x01\\x02 no offset ${p}, ` +
        'que é onde o EOCD diz que o diretório está',
    );

    const crcCentral = buf.readUInt32LE(p + 16);
    const nomeLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const comentarioLen = buf.readUInt16LE(p + 32);
    const offsetLocal = buf.readUInt32LE(p + 42);
    const nome = buf.subarray(p + 46, p + 46 + nomeLen).toString('utf8');

    assert.equal(
      buf.readUInt32LE(offsetLocal),
      SIG_LOCAL,
      `${nome}: o diretório aponta o cabeçalho local para ${offsetLocal}, e lá não tem PK\\x03\\x04`,
    );

    const metodo = buf.readUInt16LE(offsetLocal + 8);
    const crcLocal = buf.readUInt32LE(offsetLocal + 14);
    const tamComprimido = buf.readUInt32LE(offsetLocal + 18);
    const tamOriginal = buf.readUInt32LE(offsetLocal + 22);
    const nomeLenLocal = buf.readUInt16LE(offsetLocal + 26);
    const extraLenLocal = buf.readUInt16LE(offsetLocal + 28);
    const inicio = offsetLocal + 30 + nomeLenLocal + extraLenLocal;

    entradas.push({
      nome,
      dados: buf.subarray(inicio, inicio + tamComprimido),
      metodo,
      crcLocal,
      crcCentral,
      tamComprimido,
      tamOriginal,
      offsetLocal,
    });

    p += 46 + nomeLen + extraLen + comentarioLen;
  }

  return {
    posEocd,
    entradasNesteDisco,
    entradasNoTotal,
    tamanhoDiretorio,
    offsetDiretorio,
    tamanhoComentario,
    fimDiretorio: p,
    entradas,
  };
}

function parte(zip: ZipLido, nome: string): string {
  const entrada = zip.entradas.find((e) => e.nome === nome);
  if (!entrada) throw new Error(`a parte ${nome} não está no arquivo`);
  return entrada.dados.toString('utf8');
}

/** Uma planilha mínima, sempre com `agora` fixo — nada de relógio no teste. */
function gerar(opcoes: {
  cabecalho?: readonly string[];
  linhas?: readonly CelulaXlsx[][];
  nomeAba?: string;
  agora?: Date;
} = {}): Buffer {
  return gerarXlsx({
    cabecalho: opcoes.cabecalho ?? ['Animal', 'Peso'],
    linhas: opcoes.linhas ?? [[texto('0042'), numero(31.5)]],
    nomeAba: opcoes.nomeAba,
    agora: opcoes.agora ?? AGORA,
  });
}

/** O XML de uma linha da planilha, sem as vizinhas. */
function linhaXml(sheet: string, r: number): string {
  const inicio = sheet.indexOf(`<row r="${r}">`);
  assert.notEqual(inicio, -1, `a linha ${r} não existe na planilha`);
  const fim = sheet.indexOf('</row>', inicio);
  return sheet.slice(inicio, fim + '</row>'.length);
}

const PARTES_OBRIGATORIAS = [
  '[Content_Types].xml',
  '_rels/.rels',
  'xl/workbook.xml',
  'xl/_rels/workbook.xml.rels',
  'xl/styles.xml',
  'xl/worksheets/sheet1.xml',
];

// ─────────────────────────────────────────────────────────────────────────────
// Envelope ZIP
// ─────────────────────────────────────────────────────────────────────────────

test('o arquivo abre como ZIP: começa em PK\\x03\\x04 e termina no EOCD sem comentário', () => {
  const buf = gerar();

  assert.equal(buf.readUInt32LE(0), SIG_LOCAL, 'o primeiro cabeçalho local tem que ser o byte zero do arquivo');

  const zip = lerZip(buf);
  assert.equal(buf.readUInt32LE(zip.posEocd), SIG_EOCD);
  assert.equal(zip.tamanhoComentario, 0);
  assert.equal(
    zip.posEocd,
    buf.length - 22,
    'sem comentário, o EOCD são os últimos 22 bytes — se sobrar byte depois dele, alguém concatenou coisa a mais',
  );
});

test('o offset gravado no byte 16 do EOCD aponta mesmo para o diretório central', () => {
  // Este é o defeito que aconteceu: writeUInt32LE(corpo.length, 14) escreve em
  // 14..17 e passa por cima do campo de tamanho, que ocupa 12..15. O arquivo
  // continua abrindo em quem lê do começo e falha em quem lê pelo EOCD.
  const buf = gerar({ linhas: [[texto('a'), numero(1)], [texto('b'), numero(2)]] });

  const offsetDiretorio = buf.readUInt32LE(buf.length - 22 + 16);
  assert.equal(
    buf.readUInt32LE(offsetDiretorio),
    SIG_CENTRAL,
    `o EOCD diz que o diretório central começa em ${offsetDiretorio}; lá não tem PK\\x01\\x02`,
  );
});

test('o tamanho e o offset do diretório central no EOCD fecham com a posição real do EOCD', () => {
  // Os dois campos são vizinhos (12..15 e 16..19). Escrever um em cima do outro
  // é exatamente o defeito, e a soma abaixo é o que não fecha quando ele volta.
  const buf = gerar({ linhas: [[texto('a'), numero(1)]] });
  const zip = lerZip(buf);

  assert.equal(
    zip.offsetDiretorio + zip.tamanhoDiretorio,
    zip.posEocd,
    'diretório central + tamanho declarado tem que terminar exatamente onde o EOCD começa',
  );
  assert.equal(zip.fimDiretorio, zip.posEocd, 'a varredura das entradas centrais parou antes ou depois do EOCD');
});

test('o EOCD declara as seis entradas que o arquivo tem, nos dois campos de contagem', () => {
  const zip = lerZip(gerar());

  assert.equal(zip.entradasNoTotal, PARTES_OBRIGATORIAS.length);
  assert.equal(
    zip.entradasNesteDisco,
    zip.entradasNoTotal,
    'os campos de "entradas neste disco" e "entradas no total" precisam concordar num ZIP de disco único',
  );
});

test('as seis partes obrigatórias do OOXML estão no pacote, e nenhuma outra', () => {
  const zip = lerZip(gerar());
  const nomes = zip.entradas.map((e) => e.nome);

  for (const obrigatoria of PARTES_OBRIGATORIAS) {
    assert.ok(nomes.includes(obrigatoria), `falta ${obrigatoria} — sem ela o Excel recusa o arquivo inteiro`);
  }
  assert.deepEqual(new Set(nomes), new Set(PARTES_OBRIGATORIAS));
});

test('o CRC32 de cada entrada está no campo certo do cabeçalho local e do diretório', () => {
  // Não é o valor do CRC que se testa aqui (o gerador usa o mesmo crc32), e sim
  // o OFFSET dele: trocar o CRC de lugar com o campo de tamanho ao lado produz
  // um ZIP que só falha na máquina de quem recebeu.
  const zip = lerZip(
    gerar({
      cabecalho: ['Animal', 'Observação'],
      linhas: [[texto('0042'), texto('mastite à direita')], [texto('0043'), CELULA_VAZIA]],
    }),
  );

  for (const entrada of zip.entradas) {
    const esperado = crc32(entrada.dados);
    assert.equal(entrada.crcLocal, esperado, `${entrada.nome}: CRC do cabeçalho local`);
    assert.equal(entrada.crcCentral, esperado, `${entrada.nome}: CRC do diretório central`);
    assert.equal(entrada.metodo, 0, `${entrada.nome}: método tem que ser STORED (0) — não há deflate implementado`);
    assert.equal(
      entrada.tamComprimido,
      entrada.tamOriginal,
      `${entrada.nome}: em STORED os dois tamanhos são o mesmo número`,
    );
    assert.equal(entrada.dados.length, entrada.tamOriginal);
  }
});

test('cada parte extraída pelo diretório é o XML dela, e não bytes deslocados', () => {
  const zip = lerZip(gerar({ nomeAba: 'Rebanho' }));

  for (const nome of PARTES_OBRIGATORIAS) {
    assert.match(parte(zip, nome), /^<\?xml version="1\.0" encoding="UTF-8" standalone="yes"\?>/, nome);
  }
  assert.match(parte(zip, 'xl/worksheets/sheet1.xml'), /<worksheet /);
  assert.match(parte(zip, 'xl/workbook.xml'), /<sheet name="Rebanho" sheetId="1" r:id="rId1"\/>/);
});

test('data anterior a 1980 não estoura o campo MS-DOS do ZIP', () => {
  // O ano do DOS é `ano - 1980` deslocado 9 bits: sem o piso em 1980, uma data
  // de 1970 vira número negativo e writeUInt16LE lança no meio da exportação.
  const buf = gerar({ agora: new Date('1970-01-01T12:00:00Z') });
  const zip = lerZip(buf);
  assert.equal(zip.entradasNoTotal, PARTES_OBRIGATORIAS.length);
});

// ─────────────────────────────────────────────────────────────────────────────
// XML das células
// ─────────────────────────────────────────────────────────────────────────────

test('& < > e aspas são escapados no texto da célula, e o acento passa intacto', () => {
  const bruto = 'Ração & "Cabra" <3 > 2';
  const sheet = parte(lerZip(gerar({ cabecalho: ['A & B'], linhas: [[texto(bruto)]] })), 'xl/worksheets/sheet1.xml');

  assert.ok(
    sheet.includes('Ração &amp; &quot;Cabra&quot; &lt;3 &gt; 2'),
    `o texto da célula saiu sem escape: ${sheet}`,
  );
  assert.ok(sheet.includes('A &amp; B'), 'o cabeçalho passa pelo mesmo escape que as células');
  // Nenhum & solto sobrou: todo & no XML abre uma entidade.
  assert.equal(sheet.match(/&(?!amp;|quot;|lt;|gt;|#)/g), null, 'sobrou um & que não abre entidade');
});

test('byte de controle é descartado do XML e a quebra de linha é preservada', () => {
  // \u0007 e \u001F são proibidos em XML 1.0: um único deles num campo de observação faz o
  // Excel recusar o arquivo inteiro, com uma mensagem que não diz onde está.
  // \n é permitido e é dado de verdade — observação de duas linhas.
  const sheet = parte(
    lerZip(gerar({ cabecalho: ['Obs'], linhas: [[texto('linha 1\u0007\u001Fx\nlinha 2')]] })),
    'xl/worksheets/sheet1.xml',
  );

  assert.ok(!sheet.includes('\u0007'), 'byte de controle \\u0007 sobreviveu no XML');
  assert.ok(!sheet.includes('\u001F'), 'byte de controle \\u001F sobreviveu no XML');
  assert.ok(sheet.includes('linha 1x\nlinha 2'), `esperava a quebra de linha preservada, saiu: ${sheet}`);
  assert.ok(sheet.includes('xml:space="preserve"'), 'sem xml:space="preserve" o Excel come o espaço da ponta');
});

test('número vai como número e texto que parece número vai como texto', () => {
  // O zero à esquerda do número do animal é o motivo: como número ele some.
  const sheet = parte(
    lerZip(gerar({ cabecalho: ['Nº', 'Peso'], linhas: [[texto('0042'), numero(31.5)]] })),
    'xl/worksheets/sheet1.xml',
  );
  const linha = linhaXml(sheet, 2);

  assert.ok(linha.includes('<c r="A2" t="inlineStr"><is><t xml:space="preserve">0042</t></is></c>'));
  assert.ok(linha.includes('<c r="B2"><v>31.5</v></c>'), `o peso não saiu como número nativo: ${linha}`);
  assert.ok(!/r="B2"[^>]*t="inlineStr"/.test(linha), 'número marcado como inlineStr não soma nem filtra no Excel');
});

test('zero e false viram célula de verdade — não são confundidos com ausência', () => {
  // O tropeço clássico: `if (!valor)` trata 0 e false como vazio, e uma pesagem
  // de 0 kg ou um "gestante = não" desaparecem da planilha em silêncio.
  const sheet = parte(
    lerZip(gerar({ cabecalho: ['Peso', 'Gestante'], linhas: [[numero(0), booleano(false)]] })),
    'xl/worksheets/sheet1.xml',
  );
  const linha = linhaXml(sheet, 2);

  assert.ok(linha.includes('<c r="A2"><v>0</v></c>'), `o zero sumiu: ${linha}`);
  assert.ok(linha.includes('<c r="B2" t="b"><v>0</v></c>'), `o false sumiu: ${linha}`);
});

test('célula vazia é OMITIDA da linha, não escrita como string vazia', () => {
  // Uma <c> com <t></t> não é o mesmo que célula ausente: ela conta como
  // preenchida no Excel, então ISBLANK() mente e o filtro "vazias" não acha.
  const sheet = parte(
    lerZip(
      gerar({
        cabecalho: ['A', 'B', 'C'],
        linhas: [[texto('esquerda'), CELULA_VAZIA, texto('direita')]],
      }),
    ),
    'xl/worksheets/sheet1.xml',
  );
  const linha = linhaXml(sheet, 2);

  assert.ok(linha.includes('r="A2"'));
  assert.ok(linha.includes('r="C2"'), 'omitir a célula do meio não pode deslocar a da direita para B2');
  assert.ok(!linha.includes('B2'), `a célula vazia foi escrita mesmo assim: ${linha}`);
  assert.ok(!linha.includes('<t xml:space="preserve"></t>'), 'string vazia escrita no lugar da omissão');
});

test('texto só de espaço em branco é ausência, e número não finito também', () => {
  const sheet = parte(
    lerZip(
      gerar({
        cabecalho: ['A', 'B', 'C', 'D', 'E'],
        linhas: [[texto('   '), texto(null), numero(Number.NaN), numero(Number.POSITIVE_INFINITY), data(new Date('não é data'))]],
      }),
    ),
    'xl/worksheets/sheet1.xml',
  );

  assert.equal(linhaXml(sheet, 2), '<row r="2"></row>', 'nenhuma dessas cinco entradas é um valor conhecido');
});

test('texto é aparado nas pontas antes de virar célula', () => {
  const sheet = parte(
    lerZip(gerar({ cabecalho: ['Nome'], linhas: [[texto('  Cabra Preta  ')]] })),
    'xl/worksheets/sheet1.xml',
  );
  assert.ok(linhaXml(sheet, 2).includes('>Cabra Preta<'));
});

// ─────────────────────────────────────────────────────────────────────────────
// Serial de data
// ─────────────────────────────────────────────────────────────────────────────

/** O <v> da primeira célula da linha 2, como número. */
function serialDaCelula(d: Date): number {
  const sheet = parte(
    lerZip(gerar({ cabecalho: ['Data'], linhas: [[data(d)]] })),
    'xl/worksheets/sheet1.xml',
  );
  const m = /<c r="A2"([^>]*)><v>([^<]+)<\/v><\/c>/.exec(linhaXml(sheet, 2));
  if (!m) throw new Error(`a célula de data não saiu no formato esperado: ${linhaXml(sheet, 2)}`);
  assert.equal(m[1], ' s="1"', 'a data precisa do estilo 1 (numFmtId 14) — sem ele o Excel mostra o serial cru');
  assert.ok(!m[1].includes('t='), 'data marcada como texto não filtra por período no Excel');
  return Number(m[2]);
}

test('data vira serial do Excel: 01/01/2000 é o dia 36526 desde 1899-12-30', () => {
  // 36526 é o valor que o próprio Excel dá para DATE(2000;1;1) — âncora externa,
  // não uma reimplementação da conta. Meio-dia para não encostar em fuso.
  assert.equal(Math.floor(serialDaCelula(new Date('2000-01-01T15:00:00Z'))), 36526);
});

test('o dia do serial é o de São Paulo: 21h de Brasília fica no dia 4, não no 5', () => {
  // 2026-03-05T00:00Z é 04/03 às 21h em Brasília. Serializar em UTC jogaria a
  // pesagem para o dia seguinte e o relatório mensal do criador mudaria de mês
  // na virada.
  const vinteEUmaEmBrasilia = serialDaCelula(new Date('2026-03-05T00:00:00Z'));
  const meioDiaDoDia4 = serialDaCelula(new Date('2026-03-04T15:00:00Z'));
  const meioDiaDoDia5 = serialDaCelula(new Date('2026-03-05T15:00:00Z'));

  assert.equal(Math.floor(vinteEUmaEmBrasilia), Math.floor(meioDiaDoDia4));
  assert.equal(Math.floor(meioDiaDoDia5), Math.floor(meioDiaDoDia4) + 1);
});

test('a hora entra como fração do dia: 18h em São Paulo é 0,75', () => {
  const serial = serialDaCelula(new Date('2026-03-04T21:00:00Z')); // 18h em Brasília
  assert.equal(serial % 1, 0.75);
});

test('meia-noite em São Paulo dá serial inteiro, sem fração de 24 horas', () => {
  // O formatador pode devolver "24" para a meia-noite; sem o `% 24` a data
  // ganharia um dia inteiro de fração e cairia no dia seguinte.
  const serial = serialDaCelula(new Date('2026-03-04T03:00:00Z'));
  assert.equal(serial % 1, 0);
  assert.equal(Number.isInteger(serial), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Grade
// ─────────────────────────────────────────────────────────────────────────────

test('a coluna 27 é AA e a 28 é AB — a exportação larga passa de Z', () => {
  const cabecalho = Array.from({ length: 28 }, (_, i) => `c${i}`);
  const sheet = parte(lerZip(gerar({ cabecalho, linhas: [] })), 'xl/worksheets/sheet1.xml');

  assert.ok(sheet.includes('r="Z1"'));
  assert.ok(sheet.includes('r="AA1"'));
  assert.ok(sheet.includes('r="AB1"'));
  assert.ok(!sheet.includes('r="[1"'), 'passar de Z somando no código ASCII produz "[" depois do "Z"');
});

test('o autofiltro cobre o cabeçalho mais todas as linhas, sem sobrar nem faltar uma', () => {
  const sheet = parte(
    lerZip(
      gerar({
        cabecalho: ['A', 'B', 'C'],
        linhas: [[numero(1)], [numero(2)], [numero(3)], [numero(4)]],
      }),
    ),
    'xl/worksheets/sheet1.xml',
  );
  assert.ok(sheet.includes('<autoFilter ref="A1:C5"/>'), `intervalo do autofiltro errado: ${sheet}`);
});

test('planilha sem nenhuma linha ainda sai com cabeçalho e é um ZIP válido', () => {
  const zip = lerZip(gerar({ cabecalho: ['Animal', 'Peso'], linhas: [] }));
  const sheet = parte(zip, 'xl/worksheets/sheet1.xml');

  assert.equal(zip.entradasNoTotal, PARTES_OBRIGATORIAS.length);
  assert.ok(sheet.includes('r="A1"') && sheet.includes('r="B1"'));
  assert.ok(sheet.includes('<autoFilter ref="A1:B1"/>'));
});

test('exportação sem coluna nenhuma não escreve autofiltro inválido', () => {
  const sheet = parte(lerZip(gerar({ cabecalho: [], linhas: [] })), 'xl/worksheets/sheet1.xml');
  assert.ok(!sheet.includes('<autoFilter'), 'autoFilter com intervalo vazio faz o Excel recusar o arquivo');
});

test('o cabeçalho fica congelado — 4.000 animais rolam sem perder o título da coluna', () => {
  const sheet = parte(lerZip(gerar()), 'xl/worksheets/sheet1.xml');
  assert.ok(sheet.includes('<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'));
});

// ─────────────────────────────────────────────────────────────────────────────
// Nome da aba
// ─────────────────────────────────────────────────────────────────────────────

test('caractere proibido em nome de aba vira espaço em vez de quebrar o arquivo', () => {
  const workbook = parte(lerZip(gerar({ nomeAba: 'Leite/2026[Q1]:*?' })), 'xl/workbook.xml');
  const m = /<sheet name="([^"]*)"/.exec(workbook);
  if (!m) throw new Error('o workbook.xml não declarou nome de aba nenhum');
  assert.equal(m[1], 'Leite 2026 Q1');
});

test('nome de aba passa de 31 caracteres cortado, não recusado pelo Excel', () => {
  const workbook = parte(
    lerZip(gerar({ nomeAba: 'Controle leiteiro consolidado de todas as propriedades' })),
    'xl/workbook.xml',
  );
  const m = /<sheet name="([^"]*)"/.exec(workbook);
  if (!m) throw new Error('o workbook.xml não declarou nome de aba nenhum');
  assert.equal(m[1].length, 31);
  assert.equal(m[1], 'Controle leiteiro consolidado d');
});

test('nome de aba que sobra vazio depois da limpeza vira "Dados"', () => {
  const workbook = parte(lerZip(gerar({ nomeAba: ' /// ' })), 'xl/workbook.xml');
  assert.ok(workbook.includes('<sheet name="Dados"'), workbook);
});

test('& no nome da aba é escapado — o workbook.xml não pode quebrar por causa dele', () => {
  const workbook = parte(lerZip(gerar({ nomeAba: 'Leite & Peso' })), 'xl/workbook.xml');
  assert.ok(workbook.includes('<sheet name="Leite &amp; Peso"'), workbook);
});
