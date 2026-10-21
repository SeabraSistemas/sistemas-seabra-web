/**
 * Inserir uma coluna inteira no XML de uma planilha do Excel, como o "Inserir
 * coluna" do próprio Excel: tudo da coluna escolhida para a direita anda uma
 * casa — células, mesclagens, validações, larguras, seleção e o desenho.
 *
 * Existe para a CDN da Sanri (21/10/2026): a Maria Pia pediu a CATEGORIA logo
 * depois do PESO, e o modelo da ABCC que ela usa não tem essa coluna. Só texto
 * do XML, sem biblioteca (regra do repositório, ver xlsx.ts).
 *
 * Fórmula seria preciso reescrever por dentro; o modelo não tem nenhuma, e se
 * um dia tiver a inserção PARA com erro em vez de deixar referência errada.
 */

/** "A" -> 1, "Z" -> 26, "AA" -> 27. */
export function indiceColuna(letra: string): number {
  let n = 0;
  for (const ch of letra.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

/** 1 -> "A", 27 -> "AA". */
export function letraColuna(indice: number): string {
  let s = '';
  for (let n = indice; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** "K15" (ou "$K$15") anda uma coluna se estiver em `em` ou depois. */
function deslocarRef(ref: string, em: number): string {
  return ref.replace(/^(\$?)([A-Z]{1,3})(\$?)(\d+)?$/, (inteiro, d1: string, col: string, d2: string, linha?: string) => {
    const i = indiceColuna(col);
    return i >= em ? `${d1}${letraColuna(i + 1)}${d2}${linha ?? ''}` : inteiro;
  });
}

/** "B15:E15", "J14 K15:K39" — cada ponta anda sozinha (mesclagem que cruza a coluna cresce). */
export function deslocarIntervalos(lista: string, em: number): string {
  return lista
    .split(' ')
    .map((intervalo) => intervalo.split(':').map((r) => deslocarRef(r, em)).join(':'))
    .join(' ');
}

function deslocarCols(cols: string, em: number, largura: number): string {
  let cobriu = false;
  const novas = cols.replace(/<col\b([^>]*?)\/>/g, (inteiro, attrs: string) => {
    const min = Number(/\bmin="(\d+)"/.exec(attrs)?.[1]);
    const max = Number(/\bmax="(\d+)"/.exec(attrs)?.[1]);
    if (!Number.isFinite(min) || !Number.isFinite(max) || max < em) return inteiro;
    const teto = 16384;
    const novoMin = min >= em ? Math.min(min + 1, teto) : min;
    const novoMax = Math.min(max + 1, teto);
    if (min < em) cobriu = true;
    return `<col${attrs.replace(/\bmin="\d+"/, `min="${novoMin}"`).replace(/\bmax="\d+"/, `max="${novoMax}"`)}/>`;
  });
  if (cobriu) return novas;
  // A coluna nova, com a largura pedida, no lugar certo da lista (ordem por min).
  const nova = `<col min="${em}" max="${em}" width="${largura}" customWidth="1"/>`;
  const partes = [...novas.matchAll(/<col\b[^>]*?\/>/g)];
  const depois = partes.find((m) => Number(/\bmin="(\d+)"/.exec(m[0])?.[1]) > em);
  if (!depois || depois.index == null) return novas.replace('</cols>', `${nova}</cols>`);
  return novas.slice(0, depois.index) + nova + novas.slice(depois.index);
}

/**
 * Insere uma coluna vazia em `letra` (a que estava ali vai para a direita).
 * Em toda linha que tem célula na coluna empurrada (ou na anterior), a
 * célula nova nasce com o MESMO estilo dela — borda e fonte da folha.
 */
export function inserirColuna(sh: string, letra: string, largura: number): string {
  if (/<f[\s>]/.test(sh)) throw new Error('a planilha tem fórmula: não sei inserir coluna sem quebrar a referência');
  const em = indiceColuna(letra);
  const antes = letraColuna(em - 1);

  // 1) Estilo da célula nova por linha: o da que vai ser empurrada; sem ela, o da anterior.
  const estiloNovo = new Map<number, string>();
  for (const m of sh.matchAll(/<c r="([A-Z]{1,3})(\d+)"([^>]*?)(\/>|>)/g)) {
    const [, col, linha, attrs] = m;
    if (col !== letra && col !== antes) continue;
    const s = /\bs="(\d+)"/.exec(attrs)?.[1];
    const r = Number(linha);
    if (col === letra || !estiloNovo.has(r)) estiloNovo.set(r, s ?? '');
  }

  // 2) As células andam.
  let out = sh.replace(/<c r="([A-Z]{1,3})(\d+)"/g, (inteiro, col: string, linha: string) =>
    indiceColuna(col) >= em ? `<c r="${letraColuna(indiceColuna(col) + 1)}${linha}"` : inteiro,
  );

  // 3) A célula nova entra antes da primeira que ficou à direita dela (ou no fim da linha).
  out = out.replace(/<row\b([^>]*?)>([\s\S]*?)<\/row>/g, (inteiro, attrs: string, corpo: string) => {
    const r = Number(/\br="(\d+)"/.exec(attrs)?.[1]);
    const attrsNovos = attrs.replace(/\bspans="(\d+):(\d+)"/, (_s, a: string, b: string) => `spans="${a}:${Number(b) >= em - 1 ? Number(b) + 1 : b}"`);
    if (!estiloNovo.has(r)) return `<row${attrsNovos}>${corpo}</row>`;
    const s = estiloNovo.get(r);
    const celula = `<c r="${letra}${r}"${s ? ` s="${s}"` : ''}/>`;
    const celulas = [...corpo.matchAll(/<c r="([A-Z]{1,3})\d+"/g)];
    const direita = celulas.find((m) => indiceColuna(m[1]) > em);
    const novoCorpo = direita && direita.index != null ? corpo.slice(0, direita.index) + celula + corpo.slice(direita.index) : corpo + celula;
    return `<row${attrsNovos}>${novoCorpo}</row>`;
  });
  // Linha vazia em XML (<row .../>) só acerta o spans.
  out = out.replace(/<row\b([^>]*?)\/>/g, (_i, attrs: string) =>
    `<row${attrs.replace(/\bspans="(\d+):(\d+)"/, (_s, a: string, b: string) => `spans="${a}:${Number(b) >= em - 1 ? Number(b) + 1 : b}"`)}/>`,
  );

  // 4) Tudo o que aponta para célula: mesclagem, validação, dimensão, seleção, link, formatação.
  out = out.replace(/\b(ref|sqref|activeCell|topLeftCell)="([^"]*)"/g, (_i, nome: string, valor: string) => `${nome}="${deslocarIntervalos(valor, em)}"`);

  // 5) Larguras.
  out = out.replace(/<cols>[\s\S]*?<\/cols>/, (cols) => deslocarCols(cols, em, largura));
  return out;
}

/** Âncoras do desenho (logo, caixas): coluna de índice 0 — K é 10. */
export function inserirColunaNoDesenho(desenho: string, letra: string): string {
  const em0 = indiceColuna(letra) - 1;
  return desenho.replace(/<xdr:col>(\d+)<\/xdr:col>/g, (inteiro, n: string) => (Number(n) >= em0 ? `<xdr:col>${Number(n) + 1}</xdr:col>` : inteiro));
}
