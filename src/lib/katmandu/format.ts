/**
 * Parsing/formatação de números vindos do Sheets. Célula vazia ou "-" => null
 * (nunca 0 ou NaN silencioso) — é a base do requisito de card responsivo aos
 * dados: um agregado só aparece se existir pelo menos um valor real.
 */
export function parseNumber(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '-') return null;

  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');
  let normalized = trimmed;
  if (hasComma && hasDot) {
    // pt-BR: "." separa milhar, "," é decimal.
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    normalized = trimmed.replace(',', '.');
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function parseText(raw: string | undefined | null): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  return trimmed === '' || trimmed === '-' ? null : trimmed;
}

/**
 * [min, max] de uma lista de números (ignorando null). null se não houver
 * dado ou se min===max — um slider de faixa única não filtra nada, só
 * confunde, então nem aparece (mesmo princípio de card responsivo aos dados).
 */
export function numberBounds(valores: (number | null)[]): [number, number] | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? null : [min, max];
}

/** Data "dd/mm/aaaa" (formato usado na planilha) => timestamp, pra comparar/ordenar. null se não parsear. */
export function parseDateBR(raw: string | undefined | null): number | null {
  const text = parseText(raw);
  if (!text) return null;
  const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const year = y.length === 2 ? 2000 + Number(y) : Number(y);
  const ts = new Date(year, Number(mo) - 1, Number(d)).getTime();
  return Number.isFinite(ts) ? ts : null;
}

/** Timestamp => "dd/mm/aaaa", pra mostrar de volta no formato da planilha (inverso de parseDateBR). */
export function formatDateBR(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatNumber(n: number | null | undefined): string {
  return n == null ? '—' : numberFormatter.format(n === 0 ? 0 : n); // normaliza -0 pra não imprimir "-0"
}

export function formatKg(n: number | null | undefined): string {
  return n == null ? '—' : `${formatNumber(n)} kg`;
}
