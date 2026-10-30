import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  abrir,
  colunas,
  escreverCelulas,
  estiloDe,
  fechar,
  lerTexto,
  serialExcel,
  Textos,
  trechos,
  trocarTrechos,
  valorDe,
  type Pacote,
} from '@/lib/sanri/abcc/xlsx';
import { cabecalhoCdcNoDesenho, marcarMetodo, numeroDoModeloCdc, preencherCdc, preencherCdn, trocarRaca } from '@/lib/sanri/abcc/folhas';
import { deslocarIntervalos, indiceColuna, inserirColuna, inserirColunaNoDesenho, letraColuna } from '@/lib/sanri/abcc/coluna';
import {
  categoriaCdn,
  faltasCdn,
  faltasParaEmitir,
  racaCdn,
  sugerirNumeroCdc,
  linhaCdn,
  nasceuNoPeriodo,
  nomeArquivo,
  pelagemCdn,
  porReprodutor,
  proximoNumero,
  recentesPrimeiro,
  separarEmFolhas,
  traduzirErroAbcc,
  type CoberturaCdc,
  type CriaCdn,
} from '@/lib/sanri/abcc/regras';

// Modelo de mentira, com a MESMA forma do da Sanri (o verdadeiro mora no
// banco, não no repositório: tem nome, código e fazenda do criador).
const enc = (s: string) => new Uint8Array(Buffer.from(s, 'utf8'));

function pacote(arquivos: Record<string, string>): Uint8Array {
  const p: Pacote = { nomes: Object.keys(arquivos), arquivos: Object.fromEntries(Object.entries(arquivos).map(([k, v]) => [k, enc(v)])) };
  return fechar(p);
}

const WORKBOOK = '<workbook><sheets><sheet name="Planilha1" sheetId="1" r:id="rId1"/></sheets></workbook>';
const RELS_WB = '<Relationships><Relationship Id="rId1" Type="x/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';

function sst(textos: string[]): string {
  return `<sst count="${textos.length}" uniqueCount="${textos.length}">${textos.map((t) => `<si><t>${t}</t></si>`).join('')}</sst>`;
}

function modeloCdn(): Uint8Array {
  const textos = ['999/2000', '(   ) Inseminação Artificial  (   ) Transferência de Embriões  ( x )Monta Natural / Controlada', 'Descarte', 'Velha', 'RAÇA: SAANEN/ ALPINA', 'PESO', 'C/M', 'CDC Nº'];
  const linhas: string[] = [];
  linhas.push('<row r="6"><c r="Q6" s="70" t="s"><v>0</v></c></row>');
  linhas.push('<row r="10"><c r="C10" s="80"><v>2000</v></c><c r="I10" s="5" t="s"><v>1</v></c></row>');
  linhas.push('<row r="12"><c r="N12" s="21" t="s"><v>4</v></c><c r="Q12" s="23"><v>36526</v></c></row>');
  linhas.push('<row r="14" spans="1:18"><c r="J14" s="1" t="s"><v>5</v></c><c r="K14" s="2" t="s"><v>6</v></c><c r="Q14" s="1" t="s"><v>7</v></c></row>');
  for (let r = 15; r <= 39; r++) {
    const nomeEstilo = r === 16 ? 56 : 49; // a linha 16 é a do DESCARTE (vermelho)
    const nome = r === 15 ? '<c r="B15" s="49" t="s"><v>3</v></c>' : r === 16 ? '<c r="B16" s="56" t="s"><v>2</v></c>' : `<c r="B${r}" s="${r > 30 ? 55 : nomeEstilo}"/>`;
    const resto = colunas('C', 'Q')
      .map((c) => (r === 15 && c === 'F' ? '<c r="F15" s="40"><v>123</v></c>' : `<c r="${c}${r}" s="${c === 'I' ? 41 : c === 'J' ? 42 : 40}"/>`))
      .join('');
    linhas.push(`<row r="${r}">${nome}${resto}</row>`);
  }
  return pacote({
    '[Content_Types].xml': '<Types/>',
    'xl/workbook.xml': WORKBOOK,
    'xl/_rels/workbook.xml.rels': RELS_WB,
    'xl/sharedStrings.xml': sst(textos),
    'xl/worksheets/sheet1.xml':
      `<worksheet><dimension ref="A1:R54"/><cols><col min="10" max="10" width="14" customWidth="1"/><col min="11" max="11" width="8" customWidth="1"/><col min="17" max="17" width="28" customWidth="1"/></cols>` +
      `<sheetData>${linhas.join('')}</sheetData><mergeCells count="2"><mergeCell ref="B15:E15"/><mergeCell ref="J48:M48"/></mergeCells>` +
      `<dataValidations count="1"><dataValidation sqref="J14 Q15:Q39"/></dataValidations></worksheet>`,
  });
}

// Os trechos do cabeçalho da CDC como o Excel picou no modelo da Sanri.
const DESENHO_CDC =
  '<xdr:wsDr>' +
  '<a:p><a:r><a:t>    Nº </a:t></a:r></a:p><a:p><a:r><a:t>111/2000</a:t></a:r></a:p>' +
  '<a:p><a:r><a:t>      </a:t></a:r><a:r><a:t>COBERTURA </a:t></a:r><a:r><a:t>PERÍODO:    01 / </a:t></a:r><a:r><a:t> 02  </a:t></a:r><a:r><a:t> / 2000   a    03  /    04  / 2000</a:t></a:r><a:r><a:t>. </a:t></a:r></a:p>' +
  '<a:p><a:r><a:t>REPRODUTOR:</a:t></a:r><a:r><a:t>  BODE VELHO</a:t></a:r><a:r><a:t>.     </a:t></a:r><a:r><a:t>Nº DO REGISTRO:   99</a:t></a:r><a:r><a:t>88887777</a:t></a:r></a:p>' +
  '<a:p><a:r><a:t>RAÇA : SAANEN</a:t></a:r></a:p>' +
  '<a:p><a:r><a:t>Data de Preenchimento:     05/   06</a:t></a:r><a:r><a:t> </a:t></a:r><a:r><a:t>  / 2000      </a:t></a:r></a:p>' +
  '</xdr:wsDr>';

function modeloCdc(): Uint8Array {
  const linhas = [
    '<row r="16"><c r="B16" s="3" t="s"><v>0</v></c><c r="C16" s="4"><v>555</v></c><c r="D16" s="3"/><c r="E16" s="7"><v>36526</v></c><c r="F16" s="5"/></row>',
    '<row r="17"><c r="B17" s="3"/><c r="C17" s="4"/><c r="D17" s="3"/><c r="E17" s="7"/><c r="F17" s="5"/></row>',
    '<row r="18"><c r="B18" s="8"/><c r="C18" s="3"/><c r="D18" s="3"/><c r="E18" s="7"/><c r="F18" s="4"/></row>',
  ];
  return pacote({
    '[Content_Types].xml': '<Types/>',
    'xl/workbook.xml': WORKBOOK,
    'xl/_rels/workbook.xml.rels': RELS_WB,
    'xl/sharedStrings.xml': sst(['MATRIZ VELHA']),
    'xl/worksheets/sheet1.xml': `<worksheet><sheetData>${linhas.join('')}</sheetData><drawing r:id="rId2"/></worksheet>`,
    'xl/worksheets/_rels/sheet1.xml.rels': '<Relationships><Relationship Id="rId2" Type="http://x/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>',
    'xl/drawings/drawing1.xml': DESENHO_CDC,
  });
}

function cria(extra: Partial<CriaCdn> = {}): CriaCdn {
  return {
    id: 1,
    numero: '1000026001',
    nome: 'Amora Teste',
    sexo: 'fêmea',
    pelagem: null,
    raca: 'Saanen',
    nascimento: '2026-10-01',
    peso: 3.6,
    status: 'ativo',
    pai: { id: 2, nome: 'Bode Teste', numero: '1000025001', categoria: 'PO' },
    mae: { id: 3, nome: 'Cabra Teste', numero: '1000024001', categoria: 'PO' },
    metodo: 'mn',
    dataCobertura: '2026-05-04',
    cdc: '520/2026',
    enviada: false,
    cdn: null,
    ...extra,
  };
}

function lerPlanilha(bytes: Uint8Array) {
  const p = abrir(bytes);
  const sh = lerTexto(p, 'xl/worksheets/sheet1.xml');
  const t = new Textos(lerTexto(p, 'xl/sharedStrings.xml'));
  return { p, sh, v: (ref: string) => valorDe(sh, ref, t), s: (ref: string) => estiloDe(sh, ref) };
}

describe('zip', () => {
  test('abre o que fecha, na mesma ordem', () => {
    const p = abrir(pacote({ '[Content_Types].xml': '<a/>', 'xl/x.xml': 'ção' }));
    assert.deepEqual(p.nomes, ['[Content_Types].xml', 'xl/x.xml']);
    assert.equal(lerTexto(p, 'xl/x.xml'), 'ção');
  });
  test('arquivo que não é zip', () => {
    assert.throws(() => abrir(enc('não sou um xlsx')), /não é um .xlsx/);
  });
});

describe('células', () => {
  const sh = '<sheetData><row r="1" spans="1:3"/><row r="2"><c r="A2" s="7"/><c r="C2" s="9"><v>1</v></c></row><row r="12"><c r="B12" s="3"/></row></sheetData>';
  test('troca no lugar, mantém o estilo, cria na ordem das colunas', () => {
    const t = new Textos(sst([]));
    const out = escreverCelulas(sh, [
      { ref: 'C2', valor: { texto: 'oi' } },
      { ref: 'B2', valor: { numero: 5 } },
      { ref: 'A1', valor: { numero: 1 }, estilo: 4 },
    ], t);
    assert.match(out, /<row r="2"><c r="A2" s="7"\/><c r="B2"><v>5<\/v><\/c><c r="C2" s="9" t="s"><v>0<\/v><\/c><\/row>/);
    // a linha vazia "<row …/>" vira linha com célula, sem engolir a linha seguinte
    assert.match(out, /<row r="1" spans="1:3"><c r="A1" s="4"><v>1<\/v><\/c><\/row><row r="2">/);
    assert.match(out, /<row r="12"><c r="B12" s="3"\/><\/row>/);
  });
  test('linha que o modelo não tem é erro', () => {
    assert.throws(() => escreverCelulas(sh, [{ ref: 'A99', valor: null }], new Textos(sst([]))), /não tem a linha 99/);
  });
  test('textos: reaproveita igual, acrescenta novo e acerta a contagem', () => {
    const t = new Textos(sst(['A', 'B']));
    assert.equal(t.indiceDe('B'), 1);
    assert.equal(t.indiceDe('C & D'), 2);
    assert.match(t.paraXml(), /uniqueCount="3"/);
    assert.match(t.paraXml(), /<si><t>C &amp; D<\/t><\/si><\/sst>$/);
  });
  test('data do Excel', () => {
    assert.equal(serialExcel('2026-09-02'), 46267);
    assert.equal(serialExcel('2026-10-01'), 46296);
  });
});

describe('regras da CDN', () => {
  test('linha: caixa alta, Saanen sem pelagem = BRANCA, C/M sempre C', () => {
    const l = linhaCdn(cria());
    assert.equal(l.nome, 'AMORA TESTE');
    assert.equal(l.sexo, 'F');
    assert.equal(l.pelagem, 'BRANCA');
    assert.equal(l.cm, 'C');
    assert.equal(l.pai, 'BODE TESTE');
    assert.equal(l.regMae, '1000024001');
    assert.equal(l.cdc, '520/2026');
  });
  test('macho sem nome sai DESCARTE; fêmea sem nome fica vazia e avisa', () => {
    const m = linhaCdn(cria({ nome: null, sexo: 'macho' }));
    assert.equal(m.nome, 'DESCARTE');
    assert.equal(m.descarte, true);
    assert.deepEqual(faltasCdn(cria({ nome: null })), ['sem nome']);
  });
  test('pelagem: a da ficha vale; Alpina sem pelagem fica vazia', () => {
    assert.equal(pelagemCdn('Chamoisée', 'Alpina'), 'CHAMOISÉE');
    assert.equal(pelagemCdn(null, 'Alpina'), '');
  });
  test('faltas: sem pai, sem CDC, cobertura não lançada', () => {
    assert.deepEqual(faltasCdn(cria({ pai: null, cdc: null })), ['sem categoria', 'sem pai', 'sem CDC']);
    assert.deepEqual(faltasCdn(cria({ metodo: null, cdc: null })), ['cobertura não lançada']);
    assert.deepEqual(faltasCdn(cria({ metodo: 'ia', cdc: null })), []);
  });
  test('folhas: uma por método, de 25 em 25, na ordem dos números', () => {
    const crias = Array.from({ length: 30 }, (_, i) => cria({ id: i + 1, numero: String(1000026100 - i) }));
    crias.push(cria({ id: 99, numero: '1000026500', metodo: 'ia' }));
    const folhas = separarEmFolhas(crias);
    assert.deepEqual(folhas.map((f) => [f.metodo, f.crias.length]), [['mn', 25], ['mn', 5], ['ia', 1]]);
    assert.equal(folhas[0].crias[0].numero, '1000026071');
  });
  test('lista: a última que nasceu no topo; empate pelo número maior', () => {
    const crias = [
      cria({ id: 1, numero: '1000026001', nascimento: '2026-02-05' }),
      cria({ id: 2, numero: '1000026003', nascimento: '2026-10-13' }),
      cria({ id: 3, numero: '1000026002', nascimento: '2026-10-13' }),
      cria({ id: 4, numero: '1000025300', nascimento: '2025-12-30' }),
    ];
    assert.deepEqual(recentesPrimeiro(crias).map((c) => c.id), [2, 3, 1, 4]);
    // a folha continua na ordem dos números
    assert.deepEqual(separarEmFolhas(crias)[0].crias.map((c) => c.id), [4, 1, 3, 2]);
  });
  test('período de nascimento: inclusivo nas duas pontas; vazio = sem limite', () => {
    assert.equal(nasceuNoPeriodo('2026-10-01', '2026-10-01', '2026-10-31'), true);
    assert.equal(nasceuNoPeriodo('2026-10-31', '2026-10-01', '2026-10-31'), true);
    assert.equal(nasceuNoPeriodo('2026-09-30', '2026-10-01', '2026-10-31'), false);
    assert.equal(nasceuNoPeriodo('2026-11-01', '2026-10-01', '2026-10-31'), false);
    assert.equal(nasceuNoPeriodo('2025-12-31', '2026-01-01', ''), false);
    assert.equal(nasceuNoPeriodo('2025-12-31', '', ''), true);
  });
  test('próximo número: maior + 1, cancelada não conta, sem nenhum = null', () => {
    const cs = [
      { tipo: 'cdn' as const, ano: 2026, numero: 301, cancelada: false },
      { tipo: 'cdn' as const, ano: 2026, numero: 305, cancelada: true },
      { tipo: 'cdc' as const, ano: 2026, numero: 519, cancelada: false },
    ];
    assert.equal(proximoNumero(cs, 'cdn', 2026), 302);
    assert.equal(proximoNumero(cs, 'cdc', 2026), 520);
    assert.equal(proximoNumero(cs, 'cdn', 2027), null);
  });
  test('erro do banco vira frase', () => {
    assert.equal(traduzirErroAbcc({ message: 'ABCC_NUMERO_USADO: a CDN 302/2026 já existe' }), 'esse número já foi usado (CDN 302/2026 já existe)');
    assert.equal(traduzirErroAbcc({ message: 'ABCC_JA_EM_CDN: 1000026001 (301/2026) já está em CDN' }), '1000026001 (301/2026) já está em CDN');
    assert.equal(traduzirErroAbcc({ message: 'ABCC_NAO_CANCELADA: comunicação 7 ainda vale — cancele antes de excluir' }), 'cancele antes de excluir');
    assert.equal(traduzirErroAbcc({ message: 'timeout' }), 'não foi possível gravar');
  });
  test('nome do arquivo', () => {
    assert.equal(nomeArquivo('cdn', 302, 2026), 'CDN 302.2026.xlsx');
    assert.equal(nomeArquivo('cdc', 520, 2026, 'Douro / Sanri'), 'CDC 520.2026 DOURO  SANRI.xlsx');
  });
});

describe('folha da CDN', () => {
  test('método: o x vai para o pedido, os espaços ficam', () => {
    const t = '(   ) Inseminação Artificial  (   ) Transferência de Embriões  ( x )Monta Natural / Controlada';
    assert.equal(marcarMetodo(t, 'ia'), '( x ) Inseminação Artificial  (   ) Transferência de Embriões  (   )Monta Natural / Controlada');
    assert.equal(marcarMetodo(t, 'mn'), t);
    assert.throws(() => marcarMetodo('sem opções', 'mn'), /três opções/);
  });

  test('preenche cabeçalho e linhas; linha sobrando fica vazia com o estilo do modelo', () => {
    const linhas = [linhaCdn(cria()), linhaCdn(cria({ id: 2, numero: '1000026002', nome: null, sexo: 'macho', peso: 2.73 }))];
    const { v, s } = lerPlanilha(preencherCdn(modeloCdn(), { numero: 302, ano: 2026, data: '2026-10-16', metodo: 'mn' }, linhas));
    assert.deepEqual(v('Q6'), { texto: '302/2026' });
    assert.deepEqual(v('Q12'), { numero: serialExcel('2026-10-16') });
    assert.deepEqual(v('C10'), { numero: 2026 });
    assert.match((v('I10') as { texto: string }).texto, /\( x \)Monta/);
    // linha 15
    assert.deepEqual(v('B15'), { texto: 'AMORA TESTE' });
    assert.deepEqual(v('F15'), { numero: 1000026001 });
    assert.deepEqual(v('I15'), { numero: serialExcel('2026-10-01') });
    assert.deepEqual(v('J15'), { numero: 3.6 });
    assert.deepEqual(v('K15'), { texto: 'C' });
    assert.deepEqual(v('Q15'), { texto: '520/2026' });
    assert.equal(s('B15'), 49);
    // linha 16: DESCARTE na cor do descarte do modelo; peso com uma casa
    assert.deepEqual(v('B16'), { texto: 'DESCARTE' });
    assert.equal(s('B16'), 56);
    assert.deepEqual(v('J16'), { numero: 2.7 });
    // linha 17 em diante: vazia, estilo de antes
    assert.equal(v('B17'), null);
    assert.equal(s('B17'), 49);
    assert.equal(v('F17'), null);
    assert.equal(s('B31'), 55);
  });

  test('linha 31 preenchida usa o estilo da 1ª linha (a do modelo era vermelha)', () => {
    const linhas = Array.from({ length: 17 }, (_, i) => linhaCdn(cria({ id: i + 1, numero: String(1000026001 + i) })));
    const { v, s } = lerPlanilha(preencherCdn(modeloCdn(), { numero: 1, ano: 2026, data: '2026-10-16', metodo: 'mn' }, linhas));
    assert.deepEqual(v('B31'), { texto: 'AMORA TESTE' });
    assert.equal(s('B31'), 49);
  });

  test('mais de 25 crias é erro', () => {
    const linhas = Array.from({ length: 26 }, () => linhaCdn(cria()));
    assert.throws(() => preencherCdn(modeloCdn(), { numero: 1, ano: 2026, data: '2026-10-16', metodo: 'mn' }, linhas), /25/);
  });
});

describe('inserir coluna (CATEGORIA depois do PESO)', () => {
  test('letras e índices', () => {
    assert.equal(indiceColuna('K'), 11);
    assert.equal(letraColuna(11), 'K');
    assert.equal(letraColuna(27), 'AA');
    assert.equal(deslocarIntervalos('B15:E15 J14 K15:Q39 H9:L9', 11), 'B15:E15 J14 L15:R39 H9:M9');
  });
  test('células andam, a nova nasce com o estilo da empurrada, larguras e validações acompanham', () => {
    const sh =
      '<worksheet><dimension ref="A1:R54"/><sheetView><selection activeCell="P10" sqref="P10"/></sheetView>' +
      '<cols><col min="10" max="10" width="14" customWidth="1"/><col min="11" max="11" width="8" customWidth="1"/><col min="12" max="18" width="20"/></cols>' +
      '<sheetData><row r="14" spans="1:18"><c r="J14" s="1"/><c r="K14" s="2" t="s"><v>0</v></c><c r="Q14" s="3"/></row>' +
      '<row r="40" spans="2:17"><c r="C40" s="9"/></row><row r="41"/></sheetData>' +
      '<mergeCells count="2"><mergeCell ref="C40:Q40"/><mergeCell ref="B15:E15"/></mergeCells>' +
      '<dataValidations count="1"><dataValidation sqref="J14 K15"/></dataValidations></worksheet>';
    const out = inserirColuna(sh, 'K', 12);
    assert.match(out, /<c r="J14" s="1"\/><c r="K14" s="2"\/><c r="L14" s="2" t="s"><v>0<\/v><\/c><c r="R14" s="3"\/>/);
    assert.match(out, /<row r="14" spans="1:19">/);
    assert.match(out, /<row r="40" spans="2:18"><c r="C40" s="9"\/><\/row>/);
    assert.match(out, /<mergeCell ref="C40:R40"\/><mergeCell ref="B15:E15"\/>/);
    assert.match(out, /sqref="J14 L15"/);
    assert.match(out, /<dimension ref="A1:S54"\/>/);
    assert.match(out, /activeCell="Q10" sqref="Q10"/);
    assert.match(out, /<col min="10" max="10" width="14" customWidth="1"\/><col min="11" max="11" width="12" customWidth="1"\/><col min="12" max="12" width="8" customWidth="1"\/><col min="13" max="19" width="20"\/>/);
  });
  test('fórmula na planilha: para, não deixa referência errada', () => {
    assert.throws(() => inserirColuna('<worksheet><sheetData><row r="1"><c r="A1"><f>B1</f></c></row></sheetData></worksheet>', 'K', 12), /fórmula/);
  });
  test('desenho: âncora na coluna K (10) ou depois anda; o logo na B fica', () => {
    const d = '<xdr:from><xdr:col>1</xdr:col></xdr:from><xdr:to><xdr:col>10</xdr:col></xdr:to><xdr:col>16</xdr:col>';
    assert.equal(inserirColunaNoDesenho(d, 'K'), '<xdr:from><xdr:col>1</xdr:col></xdr:from><xdr:to><xdr:col>11</xdr:col></xdr:to><xdr:col>17</xdr:col>');
  });
});

describe('CDN por raça e categoria (pedidos de 21/10)', () => {
  test('raça: "100,0% Saanen" é SAANEN', () => {
    assert.equal(racaCdn('100,0% Saanen'), 'SAANEN');
    assert.equal(racaCdn(' alpina '), 'ALPINA');
    assert.equal(racaCdn(null), '');
    assert.equal(racaCdn('50,0% Alpina, 50,0% Saanen'), 'ALPINA × SAANEN');
  });
  test('categoria: a da ficha vale; sem ela, a do Art. 35 do SRG pelos pais', () => {
    const c = (p: string | null, m: string | null, propria: string | null = null) =>
      categoriaCdn({ categoria: propria, pai: { id: 1, nome: null, numero: null, categoria: p }, mae: { id: 2, nome: null, numero: null, categoria: m } });
    assert.equal(c('PO', 'PO'), 'PO');
    assert.equal(c('PO', 'PC'), 'PO');
    assert.equal(c('PC', 'PC'), 'PC');
    assert.equal(c('PO', 'PA'), 'PC');
    assert.equal(c('PA', 'PA'), 'PC');
    assert.equal(c('PC', 'PA'), 'PC');
    assert.equal(c('PC', 'PO'), ''); // o regulamento não decide
    assert.equal(c(null, 'PO'), '');
    assert.equal(c('PC', 'PO', 'po'), 'PO');
    assert.ok(faltasCdn(cria({ mae: { id: 3, nome: 'Cabra', numero: '1', categoria: null } })).includes('sem categoria'));
    assert.ok(faltasCdn(cria({ raca: null })).includes('sem raça'));
  });
  test('folhas: método, depois raça (alfabética, sem raça por último); IA só com IA', () => {
    const crias = [
      cria({ id: 1, numero: '1000026001' }),
      cria({ id: 2, numero: '1000026002', raca: 'Alpina' }),
      cria({ id: 3, numero: '1000026003', raca: '100,0% Saanen' }),
      cria({ id: 4, numero: '1000026004', metodo: 'ia' }),
      cria({ id: 5, numero: '1000026005', raca: null }),
      cria({ id: 6, numero: '1000026006', metodo: 'ia', raca: 'Alpina' }),
    ];
    assert.deepEqual(
      separarEmFolhas(crias).map((f) => [f.metodo, f.raca, f.crias.map((c) => c.id)]),
      [['mn', 'ALPINA', [2]], ['mn', 'SAANEN', [1, 3]], ['mn', '', [5]], ['ia', 'ALPINA', [6]], ['ia', 'SAANEN', [4]]],
    );
  });
  test('número da CDC: sem CDC no sistema, segue a maior citada (CDN, cobertura, modelo) do ano', () => {
    const cs = [{ tipo: 'cdn' as const, ano: 2026, numero: 302, cancelada: false }];
    assert.equal(sugerirNumeroCdc(cs, 2026, ['505/2026', '519/2026', '600/2025', null, 'lixo']), 520);
    assert.equal(sugerirNumeroCdc([...cs, { tipo: 'cdc', ano: 2026, numero: 530, cancelada: false }], 2026, ['519/2026']), 531);
    assert.equal(sugerirNumeroCdc(cs, 2026, []), null);
  });
  test('botão de emitir diz o que falta', () => {
    assert.deepEqual(faltasParaEmitir({ numero: '', data: '2026-10-21' }), ['o número']);
    assert.deepEqual(faltasParaEmitir({ numero: '520', data: '2026-10-21', periodoDe: '', periodoAte: '2026-10-01' }), ['o início do período']);
    assert.deepEqual(faltasParaEmitir({ numero: '520', data: '2026-10-21', periodoDe: '2026-10-02', periodoAte: '2026-10-01' }), ['um período que termine depois de começar']);
    assert.deepEqual(faltasParaEmitir({ numero: '520', data: '2026-10-21', periodoDe: '2026-09-01', periodoAte: '2026-10-01' }), []);
  });
  test('raça no cabeçalho: troca só depois dos dois pontos; sem "RAÇA:" é erro', () => {
    assert.equal(trocarRaca('RAÇA: SAANEN/ ALPINA', 'ALPINA'), 'RAÇA: ALPINA');
    assert.throws(() => trocarRaca('MUNICÍPIO: X', 'SAANEN'), /raça/);
  });
  test('folha com CATEGORIA: a coluna entra em K, o resto anda, raça e número no lugar novo', () => {
    const linhas = [linhaCdn(cria()), linhaCdn(cria({ id: 2, numero: '1000026002', pai: { id: 9, nome: 'Bode PC', numero: '9', categoria: 'PC' } }))];
    const bytes = preencherCdn(modeloCdn(), { numero: 303, ano: 2026, data: '2026-10-21', metodo: 'mn', raca: 'SAANEN', comCategoria: true }, linhas);
    const { v, s, sh } = lerPlanilha(bytes);
    assert.deepEqual(v('K14'), { texto: 'CATEGORIA' });
    assert.deepEqual(v('L14'), { texto: 'C/M' });
    assert.deepEqual(v('R14'), { texto: 'CDC Nº' });
    assert.equal(s('K14'), 2); // estilo do título que foi empurrado
    assert.deepEqual(v('R6'), { texto: '303/2026' });
    assert.deepEqual(v('R12'), { numero: serialExcel('2026-10-21') });
    assert.deepEqual(v('O12'), { texto: 'RAÇA: SAANEN' });
    assert.deepEqual(v('J15'), { numero: 3.6 });
    assert.deepEqual(v('K15'), { texto: 'PO' });
    assert.deepEqual(v('L15'), { texto: 'C' });
    assert.deepEqual(v('R15'), { texto: '520/2026' });
    assert.equal(v('K16'), null); // pai PC × mãe PO: o regulamento não decide
    assert.match(sh, /<mergeCell ref="J48:N48"\/>/);
    assert.match(sh, /sqref="J14 R15:R39"/);
  });
  test('CDN emitida antes de 21/10 (sem comCategoria) sai igual a antes', () => {
    const { v } = lerPlanilha(preencherCdn(modeloCdn(), { numero: 302, ano: 2026, data: '2026-10-16', metodo: 'mn' }, [linhaCdn(cria())]));
    assert.deepEqual(v('K15'), { texto: 'C' });
    assert.deepEqual(v('Q6'), { texto: '302/2026' });
    assert.deepEqual(v('N12'), { texto: 'RAÇA: SAANEN/ ALPINA' });
  });
});

describe('folha da CDC', () => {
  const cab = {
    numero: 520,
    ano: 2026,
    data: '2026-10-30',
    reprodutorId: 9,
    reprodutor: 'BODE NOVO',
    registro: '1000023190',
    raca: 'ALPINA',
    periodoDe: '2026-09-21',
    periodoAte: '2026-11-30',
  };

  test('cabeçalho nas caixas de texto, com os espaços do modelo', () => {
    const out = cabecalhoCdcNoDesenho(DESENHO_CDC, cab);
    const t = trechos(out).map((x) => x.texto);
    assert.ok(t.includes('520/2026'));
    assert.ok(t.includes('PERÍODO:    21 / '));
    assert.ok(t.includes(' 09  '));
    assert.ok(t.includes(' / 2026   a    30  /    11  / 2026'));
    assert.ok(t.includes('  BODE NOVO'));
    assert.ok(t.includes('Nº DO REGISTRO:   10'));
    assert.ok(t.includes('00023190'));
    assert.ok(t.includes('RAÇA : ALPINA'));
    assert.ok(t.includes('Data de Preenchimento:     30/   10'));
    assert.ok(t.includes('  / 2026      '));
    // fora do texto, nada muda
    const semTexto = (x: string) => x.replace(/<a:t>[\s\S]*?<\/a:t>/g, '');
    assert.equal(semTexto(out), semTexto(DESENHO_CDC));
  });

  test('desenho sem o período: erro, não escreve no lugar errado', () => {
    assert.throws(() => cabecalhoCdcNoDesenho(DESENHO_CDC.replace('PERÍODO:', 'PRAZO:'), cab), /período/);
  });

  test('trocar trechos escapa XML', () => {
    const d = '<a:p><a:r><a:t>x</a:t></a:r></a:p>';
    assert.equal(trocarTrechos(d, [{ trecho: trechos(d)[0], texto: 'A & B' }]), '<a:p><a:r><a:t>A &amp; B</a:t></a:r></a:p>');
  });

  test('matrizes nas linhas 16 a 18; a coluna F não é tocada', () => {
    const linhas = [
      { animalId: 1, coberturaId: 10, nome: 'MATRIZ UM', rgn: '1000025020', rgd: '', data: '2026-10-01' },
      { animalId: 2, coberturaId: 11, nome: 'MATRIZ DOIS', rgn: '1000025021', rgd: '', data: '2026-10-02' },
    ];
    const bytes = preencherCdc(modeloCdc(), cab, linhas);
    const { p, v, s } = lerPlanilha(bytes);
    assert.deepEqual(v('B16'), { texto: 'MATRIZ UM' });
    assert.deepEqual(v('C17'), { numero: 1000025021 });
    assert.deepEqual(v('E17'), { numero: serialExcel('2026-10-02') });
    assert.equal(s('C17'), 4);
    assert.equal(v('B18'), null);
    assert.equal(s('F18'), 4);
    assert.ok(trechos(lerTexto(p, 'xl/drawings/drawing1.xml')).some((x) => x.texto === '520/2026'));
  });

  test('mais matrizes do que as linhas da folha é erro', () => {
    const l = { animalId: 1, coberturaId: 1, nome: 'X', rgn: '1', rgd: '', data: '2026-10-01' };
    assert.throws(() => preencherCdc(modeloCdc(), cab, [l, l, l, l]), /3 matrizes/);
  });
});

describe('coberturas por reprodutor', () => {
  const c = (id: number, rep: number | null, data: string): CoberturaCdc => ({
    id,
    data,
    femea: { id: id + 100, nome: `F${id}`, numero: String(1000 + id), status: 'ativo' },
    reprodutor: rep == null ? null : { id: rep, nome: `R${rep}`, numero: String(rep), raca: 'Saanen' },
    cdc: null,
  });
  test('agrupa, ordena por data e põe o maior grupo primeiro', () => {
    const g = porReprodutor([c(1, 7, '2026-10-02'), c(2, 8, '2026-10-01'), c(3, 7, '2026-10-01')]);
    assert.deepEqual(g.map((x) => [x.reprodutor?.id, x.coberturas.map((y) => y.id)]), [[7, [3, 1]], [8, [2]]]);
  });
});

describe('número que está no modelo da CDC', () => {
  test('lê o "Nº 111/2000" do cabeçalho; arquivo que não é planilha = null', () => {
    assert.equal(numeroDoModeloCdc(modeloCdc()), '111/2000');
    assert.equal(numeroDoModeloCdc(enc('não é zip')), null);
  });
});
