import { JWT } from 'google-auth-library';

/**
 * Cliente Google Sheets genérico, para qualquer cliente AppSheet que o site
 * precise ler (hoje só /FI_FCG). Mesma técnica de src/lib/katmandu/sheets-server.ts
 * (que fica intocado — escreve na planilha de produção de outro cliente e não
 * vale o risco de regressão), mas recebe o `spreadsheetId` por parâmetro em vez
 * de fixar um só — assim um terceiro cliente Sheets não pede um terceiro arquivo.
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
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return cached;
}

async function token(): Promise<string | null> {
  const client = sheetsClient();
  if (!client) return null;
  const { token } = await client.getAccessToken();
  return token ?? null;
}

/** Uma aba inteira ("Nome da aba", sem A:Z — evita truncar coluna). null se faltar config ou a leitura falhar. */
export async function lerAba(spreadsheetId: string, aba: string): Promise<string[][] | null> {
  const t = await token();
  if (!t) return null;
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(aba)}`;
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
    const q = abas.map((a) => `ranges=${encodeURIComponent(a)}`).join('&');
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
