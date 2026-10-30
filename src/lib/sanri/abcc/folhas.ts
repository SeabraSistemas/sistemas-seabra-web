/**
 * Preenche a folha oficial (o .xlsx do criador, guardado no banco em
 * abcc_modelo) com uma CDN ou uma CDC. Só a área de dados e os campos do
 * cabeçalho mudam; o resto do arquivo sai como entrou.
 *
 * As posições são as do modelo da Sanri (CDN 301/2026 e CDC 519/2026). Se o
 * modelo mudar e um campo não for achado, a geração PARA com erro em vez de
 * escrever no lugar errado.
 */
import {
  abrir,
  colunas,
  escreverCelulas,
  estiloDe,
  fechar,
  gravarTexto,
  lerTexto,
  serialExcel,
  Textos,
  trechos,
  trocarTrechos,
  valorDe,
  type Escrita,
  type Pacote,
  type Trecho,
  type Valor,
} from '@/lib/sanri/abcc/xlsx';
import { indiceColuna, inserirColuna, inserirColunaNoDesenho, letraColuna } from '@/lib/sanri/abcc/coluna';
import { CRIAS_POR_CDN, type CabecalhoCdc, type CabecalhoCdn, type LinhaCdc, type LinhaCdn, type Metodo } from '@/lib/sanri/abcc/regras';

// ---------------------------------------------------------------------------
// Onde fica cada coisa no modelo
// ---------------------------------------------------------------------------

export const MODELO_CDN = {
  primeiraLinha: 15,
  linhas: CRIAS_POR_CDN,
  colunas: {
    nome: 'B',
    numero: 'F',
    sexo: 'G',
    pelagem: 'H',
    nascimento: 'I',
    peso: 'J',
    cm: 'K',
    usoDdg: 'L',
    pai: 'M',
    regPai: 'N',
    mae: 'O',
    regMae: 'P',
    cdc: 'Q',
  },
  /** O nome ocupa B:E (mescladas). */
  areaNome: ['B', 'C', 'D', 'E'],
  todas: colunas('B', 'Q'),
  numero: 'Q6',
  data: 'Q12',
  ano: 'C10',
  metodo: 'I10',
  /** "RAÇA: SAANEN/ ALPINA" no modelo — a CDN de uma raça só escreve a dela. */
  raca: 'N12',
  /** Linha dos títulos das colunas. */
  titulos: 14,
} as const;

/** A coluna CATEGORIA entra aqui (logo depois do PESO), pedido da Maria Pia em 21/10/2026. */
export const COLUNA_CATEGORIA = 'K';
const LARGURA_CATEGORIA = 14.5;

type Layout = {
  colunas: Record<keyof typeof MODELO_CDN.colunas | 'categoria', string | null>;
  todas: string[];
  numero: string;
  data: string;
  ano: string;
  metodo: string;
  raca: string;
};

/** Onde fica cada coisa: no modelo original ou com a coluna CATEGORIA já no lugar. */
export function layoutCdn(comCategoria: boolean): Layout {
  const M = MODELO_CDN;
  const em = indiceColuna(COLUNA_CATEGORIA);
  const mover = (ref: string) => {
    if (!comCategoria) return ref;
    const [, col, linha] = /^([A-Z]+)(\d*)$/.exec(ref) ?? [];
    return indiceColuna(col) >= em ? `${letraColuna(indiceColuna(col) + 1)}${linha}` : ref;
  };
  const cols = Object.fromEntries(Object.entries(M.colunas).map(([k, v]) => [k, mover(v)])) as Layout['colunas'];
  cols.categoria = comCategoria ? COLUNA_CATEGORIA : null;
  return {
    colunas: cols,
    todas: comCategoria ? colunas('B', letraColuna(indiceColuna('Q') + 1)) : [...M.todas],
    numero: mover(M.numero),
    data: mover(M.data),
    ano: mover(M.ano),
    metodo: mover(M.metodo),
    raca: mover(M.raca),
  };
}


export const MODELO_CDC = {
  /** As linhas de matriz da folha (16 a 18): o que cabe antes do rodapé. */
  linhas: [16, 17, 18],
  colunas: { nome: 'B', rgn: 'C', rgd: 'D', data: 'E' },
  /** A coluna F ("para uso do SRGC") não é tocada — nem o estilo. */
  todas: ['B', 'C', 'D', 'E'],
} as const;

export const LINHAS_POR_CDC = MODELO_CDC.linhas.length;

// ---------------------------------------------------------------------------
// Caminhos dentro do zip
// ---------------------------------------------------------------------------

function alvoDaRelacao(rels: string, filtro: (rel: string) => boolean): string | null {
  for (const m of rels.matchAll(/<Relationship\b[^>]*\/?>/g)) {
    if (!filtro(m[0])) continue;
    return /\bTarget="([^"]+)"/.exec(m[0])?.[1] ?? null;
  }
  return null;
}

function resolver(base: string, alvo: string): string {
  if (alvo.startsWith('/')) return alvo.slice(1);
  const partes = base.split('/').slice(0, -1);
  for (const p of alvo.split('/')) {
    if (p === '..') partes.pop();
    else if (p !== '.') partes.push(p);
  }
  return partes.join('/');
}

/** A primeira aba do arquivo e, se houver, o desenho dela. */
function caminhos(p: Pacote): { planilha: string; desenho: string | null } {
  const wb = lerTexto(p, 'xl/workbook.xml');
  const rid = /<sheet\b[^>]*\br:id="([^"]+)"/.exec(wb)?.[1];
  if (!rid) throw new Error('modelo sem aba');
  const alvo = alvoDaRelacao(lerTexto(p, 'xl/_rels/workbook.xml.rels'), (r) => r.includes(`Id="${rid}"`));
  if (!alvo) throw new Error('modelo sem a planilha da aba');
  const planilha = resolver('xl/workbook.xml', alvo);
  const relsPlanilha = resolver(planilha, `_rels/${planilha.split('/').pop()}.rels`);
  let desenho: string | null = null;
  if (p.arquivos[relsPlanilha]) {
    const d = alvoDaRelacao(lerTexto(p, relsPlanilha), (r) => /Type="[^"]*\/drawing"/.test(r));
    if (d) desenho = resolver(planilha, d);
  }
  return { planilha, desenho };
}

function texto(v: string | null | undefined): Valor {
  const s = (v ?? '').trim();
  return s ? { texto: s } : null;
}

/** Número de animal: só dígitos vai como número (como no modelo); com letra, como texto. */
function numeroAnimal(v: string | null | undefined): Valor {
  const s = (v ?? '').trim();
  if (!s) return null;
  return /^\d{1,15}$/.test(s) ? { numero: Number(s) } : { texto: s };
}

function data(iso: string | null | undefined): Valor {
  return iso ? { numero: serialExcel(iso) } : null;
}

// ---------------------------------------------------------------------------
// CDN
// ---------------------------------------------------------------------------

const ROTULOS_METODO: Record<Metodo, RegExp> = {
  ia: /Insemina/i,
  te: /Transfer/i,
  mn: /Monta/i,
};

/**
 * "(   ) Inseminação …  (   ) Transferência …  ( x )Monta …" com o "x" no
 * método pedido. Mantém os espaços do modelo; parênteses sem rótulo
 * conhecido não são tocados.
 */
export function marcarMetodo(textoModelo: string, metodo: Metodo): string {
  let achados = 0;
  const out = textoModelo.replace(/\(\s*[xX]?\s*\)(\s*)([^()]*)/g, (inteiro, espaco: string, rotulo: string) => {
    const chave = (Object.keys(ROTULOS_METODO) as Metodo[]).find((k) => ROTULOS_METODO[k].test(rotulo));
    if (!chave) return inteiro;
    achados++;
    return `${chave === metodo ? '( x )' : '(   )'}${espaco}${rotulo}`;
  });
  if (achados !== 3) throw new Error('modelo da CDN mudou: não achei as três opções de método');
  return out;
}

/** "RAÇA: SAANEN/ ALPINA" -> "RAÇA: SAANEN" (o resto do texto do modelo fica). */
export function trocarRaca(textoModelo: string, raca: string): string {
  if (!/^\s*RA[CÇ]A\s*:/i.test(textoModelo)) throw new Error('modelo da CDN mudou: não achei a raça do cabeçalho');
  return textoModelo.replace(/(:\s*).*$/, `$1${raca}`);
}

export function preencherCdn(modelo: Uint8Array, cab: CabecalhoCdn, linhas: LinhaCdn[]): Uint8Array {
  const M = MODELO_CDN;
  if (linhas.length > M.linhas) throw new Error(`a CDN cabe ${M.linhas} crias`);
  const p = abrir(modelo);
  const { planilha: caminho, desenho } = caminhos(p);
  const textos = new Textos(lerTexto(p, 'xl/sharedStrings.xml'));
  let sh = lerTexto(p, caminho);

  // CDN emitida desde 21/10 leva a CATEGORIA depois do PESO. Se o modelo ainda
  // não tem a coluna, ela entra aqui, como o "Inserir coluna" do Excel. A
  // emitida antes (sem comCategoria) sai igual a como saiu.
  const comCategoria = cab.comCategoria === true;
  if (comCategoria) {
    const titulo = valorDe(sh, `${COLUNA_CATEGORIA}${M.titulos}`, textos);
    const jaTem = !!titulo && 'texto' in titulo && /CATEG/i.test(titulo.texto);
    if (!jaTem) {
      sh = inserirColuna(sh, COLUNA_CATEGORIA, LARGURA_CATEGORIA);
      if (desenho && p.arquivos[desenho]) gravarTexto(p, desenho, inserirColunaNoDesenho(lerTexto(p, desenho), COLUNA_CATEGORIA));
    }
  }
  const L = layoutCdn(comCategoria);

  // Estilos da 1ª linha de dados valem para toda linha preenchida (as linhas
  // vazias do modelo têm estilos soltos — uma delas, letra vermelha).
  const base = Object.fromEntries(L.todas.map((c) => [c, estiloDe(sh, `${c}${M.primeiraLinha}`)])) as Record<string, number | null>;
  // A linha de DESCARTE do modelo dá a cor do descarte; sem ela, a normal.
  let estiloDescarte: Record<string, number | null> = base;
  for (let r = M.primeiraLinha; r < M.primeiraLinha + M.linhas; r++) {
    const v = valorDe(sh, `${L.colunas.nome}${r}`, textos);
    if (v && 'texto' in v && /descarte/i.test(v.texto)) {
      estiloDescarte = { ...base, ...Object.fromEntries(M.areaNome.map((c) => [c, estiloDe(sh, `${c}${r}`)])) };
      break;
    }
  }

  const textoMetodo = valorDe(sh, L.metodo, textos);
  if (!textoMetodo || !('texto' in textoMetodo)) throw new Error('modelo da CDN mudou: sem o texto do método');

  const escritas: Escrita[] = [
    { ref: L.numero, valor: { texto: `${cab.numero}/${cab.ano}` } },
    { ref: L.data, valor: data(cab.data) },
    { ref: L.ano, valor: { numero: cab.ano } },
    { ref: L.metodo, valor: { texto: marcarMetodo(textoMetodo.texto, cab.metodo) } },
  ];
  if (cab.raca != null) {
    const textoRaca = valorDe(sh, L.raca, textos);
    if (!textoRaca || !('texto' in textoRaca)) throw new Error('modelo da CDN mudou: sem a raça do cabeçalho');
    escritas.push({ ref: L.raca, valor: { texto: trocarRaca(textoRaca.texto, cab.raca) } });
  }
  if (comCategoria) escritas.push({ ref: `${COLUNA_CATEGORIA}${M.titulos}`, valor: { texto: 'CATEGORIA' } });

  for (let i = 0; i < M.linhas; i++) {
    const r = M.primeiraLinha + i;
    const l = linhas[i];
    if (!l) {
      // Linha sem cria: só esvazia (fica a borda do modelo).
      for (const c of L.todas) if (estiloDe(sh, `${c}${r}`) != null) escritas.push({ ref: `${c}${r}`, valor: null });
      continue;
    }
    const est = l.descarte ? estiloDescarte : base;
    const K = L.colunas as Record<string, string>;
    const valores: Record<string, Valor> = {
      [K.nome]: texto(l.nome),
      C: null,
      D: null,
      E: null,
      [K.numero]: numeroAnimal(l.numero),
      [K.sexo]: texto(l.sexo),
      [K.pelagem]: texto(l.pelagem),
      [K.nascimento]: data(l.nascimento),
      [K.peso]: l.peso != null ? { numero: l.peso } : null,
      [K.cm]: texto(l.cm),
      [K.usoDdg]: texto(l.usoDdg),
      [K.pai]: texto(l.pai),
      [K.regPai]: numeroAnimal(l.regPai),
      [K.mae]: texto(l.mae),
      [K.regMae]: numeroAnimal(l.regMae),
      [K.cdc]: texto(l.cdc),
    };
    if (L.colunas.categoria) valores[L.colunas.categoria] = texto(l.categoria);
    for (const c of L.todas) escritas.push({ ref: `${c}${r}`, valor: valores[c] ?? null, estilo: est[c] ?? undefined });
  }

  sh = escreverCelulas(sh, escritas, textos);
  gravarTexto(p, caminho, sh);
  gravarTexto(p, 'xl/sharedStrings.xml', textos.paraXml());
  return fechar(p);
}

// ---------------------------------------------------------------------------
// CDC
// ---------------------------------------------------------------------------

function dma(iso: string): { d: string; m: string; a: string } {
  const [a, m, d] = iso.slice(0, 10).split('-');
  return { d, m, a };
}

function achar(ts: Trecho[], re: RegExp, oQue: string): number {
  const i = ts.findIndex((t) => re.test(t.texto));
  if (i < 0) throw new Error(`modelo da CDC mudou: não achei ${oQue}`);
  return i;
}

/** O trecho seguinte no mesmo parágrafo (o texto da caixa vem picado em trechos). */
function seguinte(ts: Trecho[], i: number, oQue: string): number {
  const j = i + 1;
  if (j >= ts.length || ts[j].paragrafo !== ts[i].paragrafo) throw new Error(`modelo da CDC mudou: não achei ${oQue}`);
  return j;
}

/**
 * Troca, nas caixas de texto do cabeçalho, número, período, reprodutor,
 * registro, raça e data — mantendo os espaços do modelo (é o que dá o
 * alinhamento da folha impressa).
 */
export function cabecalhoCdcNoDesenho(desenho: string, cab: CabecalhoCdc): string {
  const ts = trechos(desenho);
  const trocas: { trecho: Trecho; texto: string }[] = [];
  const trocar = (i: number, novo: string) => trocas.push({ trecho: ts[i], texto: novo });

  // Nº 519/2026
  const iNum = achar(ts, /^\s*\d+\s*\/\s*\d{4}\s*$/, 'o número');
  trocar(iNum, ts[iNum].texto.replace(/\d+(\s*\/\s*)\d{4}/, `${cab.numero}$1${cab.ano}`));

  // PERÍODO:    21 / | 09 | / 2026   a    31  /    11  / 2026
  const de = dma(cab.periodoDe);
  const ate = dma(cab.periodoAte);
  const iPer = achar(ts, /^PER[IÍ]ODO:/i, 'o período');
  const iMes = seguinte(ts, iPer, 'o mês do período');
  const iResto = seguinte(ts, iMes, 'o fim do período');
  trocar(iPer, ts[iPer].texto.replace(/\d{1,2}/, de.d));
  trocar(iMes, ts[iMes].texto.replace(/\d{1,2}/, de.m));
  const resto = ts[iResto].texto;
  const re = /\d{4}(\s*a\s*)\d{1,2}(\s*\/\s*)\d{1,2}(\s*\/\s*)\d{4}/;
  if (!re.test(resto)) throw new Error('modelo da CDC mudou: não achei o fim do período');
  trocar(iResto, resto.replace(re, `${de.a}$1${ate.d}$2${ate.m}$3${ate.a}`));

  // REPRODUTOR: |  DOURO SANRI
  const iRep = achar(ts, /^REPRODUTOR:/i, 'o reprodutor');
  const iNome = seguinte(ts, iRep, 'o nome do reprodutor');
  const espaco = /^\s*/.exec(ts[iNome].texto)?.[0] ?? '';
  trocar(iNome, `${espaco}${cab.reprodutor}`);

  // Nº DO REGISTRO:   14 | 21323190
  const iReg = achar(ts, /^N[º°o]\s*DO REGISTRO:/i, 'o registro');
  const iRegResto = seguinte(ts, iReg, 'o resto do registro');
  trocar(iReg, ts[iReg].texto.replace(/\d*$/, cab.registro.slice(0, 2)));
  trocar(iRegResto, cab.registro.slice(2));

  // RAÇA : ALPINA
  const iRaca = achar(ts, /^RA[CÇ]A\s*:/i, 'a raça');
  trocar(iRaca, ts[iRaca].texto.replace(/(:\s*).*$/, `$1${cab.raca}`));

  // Data de Preenchimento:     30/   10 | | / 2026
  const dp = dma(cab.data);
  const iData = achar(ts, /^Data de Preenchimento:/i, 'a data de preenchimento');
  const reDia = /\d{1,2}(\/\s*)\d{1,2}(\s*)$/;
  if (!reDia.test(ts[iData].texto)) throw new Error('modelo da CDC mudou: não achei o dia e o mês do preenchimento');
  trocar(iData, ts[iData].texto.replace(reDia, `${dp.d}$1${dp.m}$2`));
  let iAno = iData;
  do {
    iAno = seguinte(ts, iAno, 'o ano do preenchimento');
  } while (!/\/\s*\d{4}/.test(ts[iAno].texto));
  trocar(iAno, ts[iAno].texto.replace(/(\/\s*)\d{4}/, `$1${dp.a}`));

  return trocarTrechos(desenho, trocas);
}

/** O "Nº 519/2026" que está no cabeçalho do modelo da CDC (a última que o criador fez à mão). */
export function numeroDoModeloCdc(modelo: Uint8Array): string | null {
  try {
    const p = abrir(modelo);
    const { desenho } = caminhos(p);
    if (!desenho) return null;
    const t = trechos(lerTexto(p, desenho)).find((x) => /^\s*\d+\s*\/\s*\d{4}\s*$/.test(x.texto));
    return t ? t.texto.replace(/\s+/g, '') : null;
  } catch {
    return null;
  }
}

export function preencherCdc(modelo: Uint8Array, cab: CabecalhoCdc, linhas: LinhaCdc[]): Uint8Array {
  const M = MODELO_CDC;
  if (linhas.length > M.linhas.length) throw new Error(`a CDC cabe ${M.linhas.length} matrizes`);
  const p = abrir(modelo);
  const { planilha: caminho, desenho } = caminhos(p);
  if (!desenho) throw new Error('modelo da CDC sem o desenho do cabeçalho');
  const textos = new Textos(lerTexto(p, 'xl/sharedStrings.xml'));
  let sh = lerTexto(p, caminho);

  const primeira = M.linhas[0];
  const base = Object.fromEntries(M.todas.map((c) => [c, estiloDe(sh, `${c}${primeira}`)])) as Record<string, number | null>;
  const escritas: Escrita[] = [];
  M.linhas.forEach((r, i) => {
    const l = linhas[i];
    if (!l) {
      for (const c of M.todas) if (estiloDe(sh, `${c}${r}`) != null) escritas.push({ ref: `${c}${r}`, valor: null });
      return;
    }
    const valores: Record<string, Valor> = {
      [M.colunas.nome]: texto(l.nome),
      [M.colunas.rgn]: numeroAnimal(l.rgn),
      [M.colunas.rgd]: numeroAnimal(l.rgd),
      [M.colunas.data]: data(l.data),
    };
    for (const c of M.todas) escritas.push({ ref: `${c}${r}`, valor: valores[c] ?? null, estilo: base[c] ?? undefined });
  });

  sh = escreverCelulas(sh, escritas, textos);
  gravarTexto(p, caminho, sh);
  gravarTexto(p, 'xl/sharedStrings.xml', textos.paraXml());
  gravarTexto(p, desenho, cabecalhoCdcNoDesenho(lerTexto(p, desenho), cab));
  return fechar(p);
}
