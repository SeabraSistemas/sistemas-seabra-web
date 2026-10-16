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
import { cabecalhoCdcNoDesenho, marcarMetodo, preencherCdc, preencherCdn } from '@/lib/sanri/abcc/folhas';
import {
  faltasCdn,
  linhaCdn,
  nomeArquivo,
  pelagemCdn,
  porReprodutor,
  proximoNumero,
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
  const textos = ['999/2000', '(   ) Inseminação Artificial  (   ) Transferência de Embriões  ( x )Monta Natural / Controlada', 'Descarte', 'Velha'];
  const linhas: string[] = [];
  linhas.push('<row r="6"><c r="Q6" s="70" t="s"><v>0</v></c></row>');
  linhas.push('<row r="10"><c r="C10" s="80"><v>2000</v></c><c r="I10" s="5" t="s"><v>1</v></c></row>');
  linhas.push('<row r="12"><c r="Q12" s="23"><v>36526</v></c></row>');
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
    'xl/worksheets/sheet1.xml': `<worksheet><sheetData>${linhas.join('')}</sheetData><mergeCells count="1"><mergeCell ref="B15:E15"/></mergeCells></worksheet>`,
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
    pai: { id: 2, nome: 'Bode Teste', numero: '1000025001' },
    mae: { id: 3, nome: 'Cabra Teste', numero: '1000024001' },
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
    assert.deepEqual(faltasCdn(cria({ pai: null, cdc: null })), ['sem pai', 'sem CDC']);
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
