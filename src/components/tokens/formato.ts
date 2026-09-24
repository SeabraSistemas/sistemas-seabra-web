const HORA_MS = 3_600_000;
const DIA_MS = 24 * HORA_MS;

export const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const SEMANA_LONGA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** 14,3% · 43% — uma casa quando precisa, e nunca "-0%". */
export function formatPct(v: number): string {
  return `${nf.format(Math.abs(v) < 0.05 ? 0 : v)}%`;
}

const dois = (n: number) => String(n).padStart(2, '0');

export function hora(t: number): string {
  const d = new Date(t);
  return `${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

export function diaCurto(t: number): string {
  const d = new Date(t);
  return `${SEMANA[d.getDay()]} ${dois(d.getDate())}/${dois(d.getMonth() + 1)}`;
}

export function quando(t: number): string {
  return `${diaCurto(t)} ${hora(t)}`;
}

/** 3d 14h · 5h 20min · 12min */
export function duracao(ms: number): string {
  const min = Math.max(0, Math.floor(ms / 60_000));
  const d = Math.floor(ms / DIA_MS);
  const h = Math.floor((ms % DIA_MS) / HORA_MS);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${dois(min % 60)}min`;
  return `${min}min`;
}

/** "43", "43,5", "43.5%" → número de 0 a 100; qualquer outra coisa → null. */
export function lerPct(s: string): number | null {
  const limpo = s.replace('%', '').replace(',', '.').trim();
  if (!/^\d+(\.\d+)?$/.test(limpo)) return null;
  const v = Number(limpo);
  return v >= 0 && v <= 100 ? v : null;
}
