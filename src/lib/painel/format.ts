/**
 * Parsing/formatação de dados vindos do Sheets. Base do /katmandu
 * (src/lib/katmandu/format.ts), copiada aqui (não importada) porque o
 * Katmandu está congelado e este módulo ganha funções que ele não precisa
 * (moeda, dia compacto, notação compacta) — ver plano de /FI_FCG.
 */

/** Célula vazia ou "-" => null (nunca 0/NaN silencioso) — card só aparece se existir valor real. */
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

/** "R$ 3.264,00" / "-R$ 0,01" => 3264 / -0.01. null se não houver dígito. */
export function parseMoeda(raw: string | undefined | null): number | null {
  const texto = parseText(raw);
  if (!texto) return null;
  const negativo = texto.trim().startsWith('-');
  const limpo = texto.replace(/[^\d,.-]/g, '').replace(/^-/, '');
  const n = parseNumber(limpo);
  if (n == null) return null;
  return negativo ? -n : n;
}

/** [min, max] de uma lista (ignorando null). null se não houver dado ou min===max (slider de faixa única não filtra nada). */
export function numberBounds(valores: (number | null)[]): [number, number] | null {
  const nums = valores.filter((v): v is number => v != null);
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? null : [min, max];
}

/** Data "dd/mm/aaaa" (planilha) => timestamp, pra comparar/ordenar. null se não parsear. */
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

/** Data "dd/mm/aaaa" => inteiro "aaaammdd" (ordenável, compacto pro payload). null se não parsear. */
export function diaDe(raw: string | undefined | null): number | null {
  const text = parseText(raw);
  if (!text) return null;
  const m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const dia = Number(d);
  const mes = Number(mo);
  const ano = y.length === 2 ? 2000 + Number(y) : Number(y);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  return ano * 10000 + mes * 100 + dia;
}

/** "aaaammdd" => "dd/mm/aaaa". '—' se null. */
export function formatDia(v: number | null | undefined): string {
  if (v == null) return '—';
  const ano = Math.floor(v / 10000);
  const mes = Math.floor((v % 10000) / 100);
  const dia = v % 100;
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
}

/** "aaaa-mm-dd" (<input type=date>) => "aaaammdd", mesma base de diaDe/formatDia. */
export function diaDeInput(v: string): number | null {
  if (!v) return null;
  const [y, m, d] = v.split('-').map(Number);
  if (!y || !m || !d) return null;
  return y * 10000 + m * 100 + d;
}

/** "aaaammdd" => "aaaa-mm-dd" (<input type=date>) — inverso de `diaDeInput`, pra pré-preencher o campo ao editar um registro existente. '' se null. */
export function diaParaInput(v: number | null): string {
  if (v == null) return '';
  const ano = Math.floor(v / 10000);
  const mes = Math.floor((v % 10000) / 100);
  const dia = v % 100;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** Anos distintos presentes numa lista de "aaaammdd" (ignora null), do mais recente pro mais antigo — base do atalho "Ano" de FilterPeriodo. */
export function anosPresentes(datas: (number | null)[]): number[] {
  const anos = new Set<number>();
  for (const d of datas) {
    if (d != null) anos.add(Math.floor(d / 10000));
  }
  return Array.from(anos).sort((a, b) => b - a);
}

/** "aaaammdd" => Date local (meia-noite) — só uso interno de diasEntre/somarDias, nunca exportar timestamp cru (mesma armadilha de fuso que diaDe evita). */
function dataDeCompacto(v: number): Date {
  const ano = Math.floor(v / 10000);
  const mes = Math.floor((v % 10000) / 100) - 1;
  const dia = v % 100;
  return new Date(ano, mes, dia);
}

/** Dias corridos entre duas datas "aaaammdd" (fim - início). Negativo se fim vier antes. null se qualquer uma faltar. */
export function diasEntre(inicio: number | null, fim: number | null): number | null {
  if (inicio == null || fim == null) return null;
  const ms = dataDeCompacto(fim).getTime() - dataDeCompacto(inicio).getTime();
  return Math.round(ms / 86400000);
}

/** "aaaammdd" + N dias corridos (N pode ser negativo) => "aaaammdd" novo. null se a data faltar. */
export function somarDias(dia: number | null, dias: number): number | null {
  if (dia == null) return null;
  const data = dataDeCompacto(dia);
  data.setDate(data.getDate() + dias);
  return data.getFullYear() * 10000 + (data.getMonth() + 1) * 100 + data.getDate();
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatNumber(n: number | null | undefined): string {
  return n == null ? '—' : numberFormatter.format(n === 0 ? 0 : n); // normaliza -0 pra não imprimir "-0"
}

export function formatKg(n: number | null | undefined): string {
  return n == null ? '—' : `${formatNumber(n)} kg`;
}

const moedaFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatMoeda(n: number | null | undefined): string {
  return n == null ? '—' : moedaFormatter.format(n === 0 ? 0 : n);
}

const compactoFormatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

/** Notação compacta pt-BR ("32,8 mil", "10,7 mi") — mesma leitura dos cards do Looker. */
export function formatCompacto(n: number | null | undefined): string {
  return n == null ? '—' : compactoFormatter.format(n);
}

export function formatPct(n: number | null | undefined, casas = 2): string {
  return n == null ? '—' : `${n.toFixed(casas).replace('.', ',')}%`;
}

/** Data de hoje em "aaaammdd", fuso America/Sao_Paulo — mesma base de diaDe/formatDia. */
export function hojeCompacto(): number {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return Number(partes.replace(/-/g, ''));
}
