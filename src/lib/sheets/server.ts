import { JWT } from 'google-auth-library';

/**
 * Cliente Google Sheets genérico, para qualquer cliente AppSheet que o site
 * precise ler/escrever (hoje só /FI_FCG). Mesma técnica de
 * src/lib/katmandu/sheets-server.ts (que fica intocado — escreve na planilha
 * de produção de outro cliente e não vale o risco de regressão), mas recebe
 * o `spreadsheetId` por parâmetro em vez de fixar um só — assim um terceiro
 * cliente Sheets não pede um terceiro arquivo.
 *
 * Escopo FULL (não só `.readonly`) desde os Custos (15/09/2026) — a service
 * account precisou virar Editor na planilha "Produção - Benoni" (antes só
 * lia). Confirmado ao vivo com um `batchUpdate` no-op (reescrever o mesmo
 * título) antes de criar qualquer aba de verdade.
 *
 * NUNCA importar em client component — a chave privada da service account não
 * pode vazar pro bundle.
 */
let cached: JWT | null = null;

function sheetsClient(): JWT | null {
  if (cached) return cached;
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!email || !rawKey) return null;
  cached = new JWT({
    email,
    // No .env a chave vem com "\n" literal (escapado) em vez de quebra de linha real.
    key: rawKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return cached;
}

async function token(): Promise<string | null> {
  const client = sheetsClient();
  if (!client) return null;
  const { token } = await client.getAccessToken();
  return token ?? null;
}

/**
 * Aspas simples em volta do nome da aba antes de virar range A1 — sem isso,
 * um nome de aba que TAMBÉM é uma referência de célula válida (ex.: "D8" =
 * coluna D, linha 8) é lido como aquela célula solta na primeira aba da
 * planilha, não como a aba inteira. Achado ao vivo, 22/09/2026: `getD8()`
 * vinha lendo silenciosamente só 1 célula ("HelperQueries"!D8, valor "141")
 * em vez das 6.172 linhas reais da aba "D8" — sem erro, sem aviso, só uma
 * aba de manejo inteira ausente do "último manejo"/ficha do animal. Nome
 * de aba com espaço (ex.: "Parto CG") não precisa disso pra funcionar, mas
 * aspas não atrapalham — mais seguro citar sempre do que confiar que
 * nenhuma aba futura vai colidir com notação A1.
 */
function citarAba(aba: string): string {
  return `'${aba}'`;
}

/** Uma aba inteira ("Nome da aba", sem A:Z — evita truncar coluna). null se faltar config ou a leitura falhar. */
export async function lerAba(spreadsheetId: string, aba: string): Promise<string[][] | null> {
  const t = await token();
  if (!t) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(citarAba(aba))}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[sheets] falha ao ler planilha', aba, res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { values?: string[][] };
    return data.values ?? [];
  } catch (err) {
    console.error('[sheets] falha ao ler planilha', aba, err);
    return null;
  }
}

/**
 * Várias abas numa requisição só (`values:batchGet`) — é o que cada página do
 * FI_FCG usa: uma chamada por navegação, não uma por aba. Devolve um mapa
 * nome-da-aba -> linhas; aba ausente na resposta vira `null` no mapa (nunca
 * lança) para a camada de cima decidir "planilha vazia" vs "erro de leitura".
 */
export async function lerAbas(spreadsheetId: string, abas: string[]): Promise<Record<string, string[][] | null>> {
  const vazio = Object.fromEntries(abas.map((a) => [a, null])) as Record<string, string[][] | null>;
  if (abas.length === 0) return vazio;
  const t = await token();
  if (!t) return vazio;
  try {
    const q = abas.map((a) => `ranges=${encodeURIComponent(citarAba(a))}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${q}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[sheets] falha ao ler planilha (batchGet)', abas, res.status, await res.text());
      return vazio;
    }
    const data = (await res.json()) as { valueRanges?: { values?: string[][] }[] };
    const ranges = data.valueRanges ?? [];
    const out = { ...vazio };
    abas.forEach((aba, i) => {
      out[aba] = ranges[i]?.values ?? [];
    });
    return out;
  } catch (err) {
    console.error('[sheets] falha ao ler planilha (batchGet)', abas, err);
    return vazio;
  }
}

/**
 * Acha o número da linha (1-based, já contando o cabeçalho) de um ID numa
 * aba, lendo a coluna de ID FRESCA (não confia em cache/posição antiga) —
 * mesmo cuidado do Katmandu (Movimentar) pra não escrever na linha errada
 * se a planilha mudou entre a leitura anterior e agora. null se a aba, o
 * header da coluna ou o ID não existirem.
 */
export async function encontrarLinhaPorId(
  spreadsheetId: string,
  aba: string,
  colunaId: string,
  id: string,
): Promise<number | null> {
  const linhas = await lerAba(spreadsheetId, aba);
  if (!linhas || linhas.length === 0) return null;
  const idx = linhas[0].map((h) => h.trim()).indexOf(colunaId);
  if (idx === -1) return null;
  for (let i = 1; i < linhas.length; i++) {
    if ((linhas[i][idx] ?? '').trim() === id) return i + 1;
  }
  return null;
}

/**
 * Sobrescreve UMA linha inteira num range tipo "Custos!A5:I5". Sempre
 * `USER_ENTERED` por padrão — RAW não reconhece texto de data como data e
 * quebra a formatação da célula (achado real no incidente do Katmandu,
 * 09/09/2026: serial numérico gravado como texto vira "45908" na tela em
 * vez de "08/09/2025"). Passar 'RAW' só quando a linha não tem NENHUMA
 * coluna de data.
 */
export async function escreverLinha(
  spreadsheetId: string,
  range: string,
  valores: string[],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED',
): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [valores] }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao escrever linha', range, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao escrever linha', range, err);
    return false;
  }
}

/**
 * Sobrescreve UMA coluna inteira (ex: "Financeiro!K2:K2623") com um valor por
 * linha, numa única requisição — usado pra correção em massa (ex: backfill
 * da coluna Fazenda do livro-caixa, 15/09/2026), em vez de uma escrita por
 * linha (lento e gasta muita cota da API pra milhares de linhas).
 */
export async function escreverColuna(
  spreadsheetId: string,
  range: string,
  valores: string[],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW',
): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: valores.map((v) => [v]) }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao escrever coluna', range, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao escrever coluna', range, err);
    return false;
  }
}

export interface CelulasParaEscrever {
  /** Range A1 já com a aba citada, ex: "'RebanhoProd'!N5". */
  range: string;
  /** Matriz de valores daquele range (normalmente uma linha só). */
  valores: string[][];
}

/**
 * Escreve MUITOS ranges esparsos numa tacada (`values:batchUpdate`) — o
 * recálculo de GMD de um lote (21/09/2026) toca 4 células não-contíguas por
 * animal em RebanhoProd e 2 por pesagem em Pesagem; num lote de 500 animais
 * isso passa de 7 mil ranges, e uma requisição por range estouraria a cota
 * da API. `escreverColuna` não serve: as colunas não são contíguas e as
 * linhas não são sequenciais.
 *
 * Quebra em lotes de `TAMANHO_LOTE` ranges por requisição. Para na primeira
 * falha e devolve quantos ranges foram efetivamente escritos — quem chama
 * decide o que fazer com uma escrita parcial (é Sheets, não tem transação).
 */
const TAMANHO_LOTE_ESCRITA = 500;

export async function escreverCelulas(
  spreadsheetId: string,
  atualizacoes: CelulasParaEscrever[],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED',
): Promise<{ ok: boolean; escritos: number }> {
  if (atualizacoes.length === 0) return { ok: true, escritos: 0 };
  const t = await token();
  if (!t) return { ok: false, escritos: 0 };

  let escritos = 0;
  for (let i = 0; i < atualizacoes.length; i += TAMANHO_LOTE_ESCRITA) {
    const fatia = atualizacoes.slice(i, i + TAMANHO_LOTE_ESCRITA);
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valueInputOption,
          data: fatia.map((a) => ({ range: a.range, values: a.valores })),
        }),
      });
      if (!res.ok) {
        console.error('[sheets] falha no batchUpdate', res.status, await res.text());
        return { ok: false, escritos };
      }
      escritos += fatia.length;
    } catch (err) {
      console.error('[sheets] falha no batchUpdate', err);
      return { ok: false, escritos };
    }
  }
  return { ok: true, escritos };
}

/**
 * Acrescenta VÁRIAS linhas de uma vez (um `values:append` só). Existe porque
 * um append por linha estoura a cota de escrita do Sheets (~60 req/min por
 * usuário): ao iniciar o GMD de um lote de 71 animais, 71 appends seguidos
 * deram 64 gravados e 7 perdidos em silêncio (achado ao vivo, 21/09/2026).
 * Devolve quantas linhas foram aceitas — 0 com falha.
 */
export async function adicionarLinhas(
  spreadsheetId: string,
  aba: string,
  linhas: string[][],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED',
): Promise<number> {
  if (linhas.length === 0) return 0;
  const t = await token();
  if (!t) return 0;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(citarAba(aba))}:append?valueInputOption=${valueInputOption}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: linhas }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao acrescentar linhas', aba, res.status, await res.text());
      return 0;
    }
    return linhas.length;
  } catch (err) {
    console.error('[sheets] falha ao acrescentar linhas', aba, err);
    return 0;
  }
}

/** Acrescenta uma linha no fim de `aba`. false se faltar config ou falhar. */
export async function adicionarLinha(
  spreadsheetId: string,
  aba: string,
  valores: string[],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED',
): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(citarAba(aba))}:append?valueInputOption=${valueInputOption}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [valores] }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao acrescentar linha', aba, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao acrescentar linha', aba, err);
    return false;
  }
}

/**
 * "Apaga" uma linha limpando o conteúdo do range (`values:clear`) — nunca
 * remove a linha de verdade (evitaria precisar do sheetId numérico e do
 * risco de outra escrita mirar a linha errada se duas exclusões acontecerem
 * quase juntas). Uma linha com ID vazio já é ignorada por TODO mapeador do
 * projeto (`.filter(x => x.id !== '')`), então ela some das leituras sem
 * precisar de nenhum caso especial.
 */
export async function limparLinha(spreadsheetId: string, range: string): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) {
      console.error('[sheets] falha ao limpar linha', range, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao limpar linha', range, err);
    return false;
  }
}

/** Como a API devolve cada célula: o valor exibido (padrão) ou a fórmula crua ("=IF(...)"). */
export type RenderValor = 'FORMATTED_VALUE' | 'FORMULA';

/** Range A1 com a aba citada — mesmo cuidado de `citarAba` ("D8" é nome de aba e também célula). */
export function rangeA1(aba: string, a1?: string): string {
  return a1 ? `${citarAba(aba)}!${a1}` : citarAba(aba);
}

/**
 * Vários ranges A1 JÁ montados (use `rangeA1`) numa requisição só, com o
 * render escolhido. Existe para o /bovinos, que precisa ler as fórmulas cruas
 * de algumas colunas do RebanhoProd (FORMULA) para saber onde a Categoria
 * parou de ser copiada — `lerAbas` só lê o valor exibido e aba inteira.
 * Devolve uma matriz por range, na mesma ordem; null se faltar config ou a
 * leitura falhar (nunca lança).
 */
export async function lerRanges(
  spreadsheetId: string,
  ranges: string[],
  render: RenderValor = 'FORMATTED_VALUE',
): Promise<string[][][] | null> {
  if (ranges.length === 0) return [];
  const t = await token();
  if (!t) return null;
  try {
    const q = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${q}&valueRenderOption=${render}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[sheets] falha ao ler ranges', ranges.length, render, res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { valueRanges?: { values?: unknown[][] }[] };
    const vr = data.valueRanges ?? [];
    return ranges.map((_, i) => (vr[i]?.values ?? []).map((linha) => linha.map((c) => (c == null ? '' : String(c)))));
  } catch (err) {
    console.error('[sheets] falha ao ler ranges', ranges.length, render, err);
    return null;
  }
}

export interface MetaAba {
  titulo: string;
  /** Id numérico da aba (o "gid" da URL) — exigido por copyPaste/deleteDimension. */
  sheetId: number;
}

/** Título e id numérico de cada aba. null se a leitura falhar. */
export async function metadadosAbas(spreadsheetId: string): Promise<MetaAba[] | null> {
  const t = await token();
  if (!t) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(title,sheetId)`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[sheets] falha ao ler metadados', res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { sheets?: { properties?: { title?: string; sheetId?: number } }[] };
    return (data.sheets ?? [])
      .map((s) => ({ titulo: s.properties?.title ?? '', sheetId: s.properties?.sheetId ?? -1 }))
      .filter((s) => s.titulo && s.sheetId >= 0);
  } catch (err) {
    console.error('[sheets] falha ao ler metadados', err);
    return null;
  }
}

/**
 * `spreadsheets:batchUpdate` cru — uma chamada ATÔMICA (ou aplica todos os
 * requests, ou nenhum). É a base das correções do /bovinos: trocar valores
 * (updateCells), copiar fórmula da linha de cima (copyPaste PASTE_FORMULA,
 * que ajusta as referências relativas) e excluir linha (deleteDimension)
 * — coisas que `values:batchUpdate` não faz. Nunca lança.
 */
export async function batchUpdatePlanilha(spreadsheetId: string, requests: object[]): Promise<{ ok: boolean; erro: string | null }> {
  if (requests.length === 0) return { ok: true, erro: null };
  const t = await token();
  if (!t) return { ok: false, erro: 'Credenciais do Google não configuradas.' };
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('[sheets] falha no batchUpdate da planilha', res.status, txt);
      return { ok: false, erro: `Google Sheets respondeu ${res.status}${res.status === 403 ? ' (a conta de serviço precisa ser Editor da planilha)' : ''}.` };
    }
    return { ok: true, erro: null };
  } catch (err) {
    console.error('[sheets] falha no batchUpdate da planilha', err);
    return { ok: false, erro: 'Falha de rede ao gravar.' };
  }
}

/** Nomes de todas as abas da planilha. null se a leitura falhar — usado para distinguir "aba ainda não existe" de erro de leitura (a API responde 400 igual aos dois). */
export async function listarAbas(spreadsheetId: string): Promise<string[] | null> {
  const t = await token();
  if (!t) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[sheets] falha ao listar abas', res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { sheets?: { properties?: { title?: string } }[] };
    return (data.sheets ?? []).map((s) => s.properties?.title ?? '').filter(Boolean);
  } catch (err) {
    console.error('[sheets] falha ao listar abas', err);
    return null;
  }
}

/**
 * Garante que a GRADE da aba tenha pelo menos `colunas` colunas. Escrever
 * célula fora da grade falha ("exceeds grid limits"): o `values:append`
 * cresce a grade sozinho, o `batchUpdate` de valores não. A producao_diaria
 * do AppSheet tem a grade do tamanho exato do header — por isso a coluna
 * `lancado_por` nunca foi criada até 24/09/2026 e as linhas saíam sem autor.
 */
export async function garantirColunasNaGrade(spreadsheetId: string, aba: string, colunas: number): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title,gridProperties.columnCount)`;
    const meta = await fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });
    if (!meta.ok) {
      console.error('[sheets] falha ao ler a grade', aba, meta.status, await meta.text());
      return false;
    }
    const data = (await meta.json()) as { sheets?: { properties?: { sheetId?: number; title?: string; gridProperties?: { columnCount?: number } } }[] };
    const props = data.sheets?.find((s) => s.properties?.title === aba)?.properties;
    if (props?.sheetId == null) return false;
    const atual = props.gridProperties?.columnCount ?? 0;
    if (atual >= colunas) return true;
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ appendDimension: { sheetId: props.sheetId, dimension: 'COLUMNS', length: colunas - atual } }] }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao aumentar a grade', aba, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao aumentar a grade', aba, err);
    return false;
  }
}

/**
 * Cria uma aba nova (vazia) na planilha, via `spreadsheets:batchUpdate`
 * (`addSheet`) — usado só uma vez por aba nova do /FI_FCG que ainda não
 * existe na planilha do cliente (ex: "Categorias de Custo", "Custos",
 * "Descrições de Custo"), nunca em runtime normal do site.
 */
export async function criarAba(spreadsheetId: string, titulo: string): Promise<boolean> {
  const t = await token();
  if (!t) return false;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: titulo } } }] }),
    });
    if (!res.ok) {
      console.error('[sheets] falha ao criar aba', titulo, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[sheets] falha ao criar aba', titulo, err);
    return false;
  }
}
