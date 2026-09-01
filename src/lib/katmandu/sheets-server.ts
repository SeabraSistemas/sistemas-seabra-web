import { JWT } from 'google-auth-library';

/**
 * Cliente Google Sheets server-only do /katmandu. NUNCA importar em client
 * component — a chave privada da service account não pode vazar pro bundle.
 *
 * Mesmo espírito do src/lib/supabase/vitrine-server.ts: nunca lança por falta
 * de config, devolve null e quem chama decide o que fazer (distinguir "não
 * configurado" de "planilha vazia").
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
    // Full (não readonly) porque mutations.ts precisa escrever (Movimentar). Mesmo client
    // cobre leitura e escrita — não há razão pra manter dois.
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return cached;
}

async function credenciais(): Promise<{ token: string; spreadsheetId: string } | null> {
  const client = sheetsClient();
  const spreadsheetId = process.env.KATMANDU_SPREADSHEET_ID;
  if (!client || !spreadsheetId) return null;
  const { token } = await client.getAccessToken();
  if (!token) return null;
  return { token, spreadsheetId };
}

/**
 * Lê um range (ex. "Pesagem", aba inteira) da planilha configurada em
 * KATMANDU_SPREADSHEET_ID. Devolve as linhas cruas (array de arrays), com a
 * primeira linha sendo o header — ou null se faltar config ou a leitura falhar.
 *
 * Usa fetch() direto (não client.request() do google-auth-library) só pra
 * pegar o token — abas grandes (RebanhoProd tem 70+ colunas) batiam num bug
 * de streaming do Next dev ("ArrayBuffer is not detachable") quando a
 * resposta passava pelo cliente HTTP interno da lib. cache:'no-store' porque
 * o controle de frescor já é o revalidate da página, não o fetch em si.
 */
export async function getSheetValues(range: string): Promise<string[][] | null> {
  try {
    const creds = await credenciais();
    if (!creds) return null;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${creds.spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${creds.token}` }, cache: 'no-store' });
    if (!res.ok) {
      console.error('[katmandu] falha ao ler planilha', range, res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { values?: string[][] };
    return data.values ?? [];
  } catch (err) {
    console.error('[katmandu] falha ao ler planilha', range, err);
    return null;
  }
}

/**
 * Escreve um valor em cada range de `updates` (ex. "RebanhoProd!DA15") num
 * único request — usado pelo Movimentar pra atualizar só as linhas que
 * casam, sem reescrever a coluna inteira (evitaria o mesmo problema de
 * drift de linha que a releitura fresca em mutations.ts tenta minimizar).
 * false se faltar config ou a escrita falhar.
 */
export async function batchUpdateCells(updates: { range: string; value: string }[]): Promise<boolean> {
  if (updates.length === 0) return true;
  try {
    const creds = await credenciais();
    if (!creds) return false;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${creds.spreadsheetId}/values:batchUpdate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${creds.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valueInputOption: 'RAW',
        data: updates.map((u) => ({ range: u.range, values: [[u.value]] })),
      }),
    });
    if (!res.ok) {
      console.error('[katmandu] falha ao escrever planilha (batchUpdate)', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[katmandu] falha ao escrever planilha (batchUpdate)', err);
    return false;
  }
}

/** Acrescenta uma linha no fim de `sheet` (ex. "movimentacao"). false se faltar config ou falhar. */
export async function appendRow(sheet: string, row: string[]): Promise<boolean> {
  try {
    const creds = await credenciais();
    if (!creds) return false;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${creds.spreadsheetId}/values/${encodeURIComponent(sheet)}:append?valueInputOption=RAW`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${creds.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] }),
    });
    if (!res.ok) {
      console.error('[katmandu] falha ao acrescentar linha', sheet, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[katmandu] falha ao acrescentar linha', sheet, err);
    return false;
  }
}
