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
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return cached;
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
  const client = sheetsClient();
  const spreadsheetId = process.env.KATMANDU_SPREADSHEET_ID;
  if (!client || !spreadsheetId) return null;

  try {
    const { token } = await client.getAccessToken();
    if (!token) return null;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
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
