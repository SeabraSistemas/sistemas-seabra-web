/**
 * Normalização de texto e datas das planilhas AppSheet de bovino. Tudo puro,
 * sem dependência de servidor — testado em texto.test.ts.
 */

/** Célula como texto aparado ('' para vazio/undefined). */
export function t(v: unknown): string {
  return String(v ?? '').trim();
}

/** Aparado e em maiúsculas — comparação de IDs ("c201" e "C201" são o mesmo animal no app). */
export function U(v: unknown): string {
  return t(v).toUpperCase();
}

/**
 * Chave de comparação de nome de sêmen: sem acento, só letras e números,
 * maiúsculas. "Fenômeno5-6" e "FENOMENO 5 6" viram a mesma coisa; "B 2887" e
 * "B2887" também. Só para comparar — ao gravar, usa a grafia da Reproduçao.
 */
export function nk(v: unknown): string {
  return t(v)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
}

/** Sêmen que conta como pai: não vazio e não o "x" que a fazenda usa como marcador. */
export function semenValido(v: unknown): boolean {
  const k = nk(v);
  return k !== '' && k !== 'X';
}

/**
 * "d/m/aaaa" (com ou sem zero à esquerda, como o AppSheet grava) => dias desde
 * 1970-01-01 em UTC. Dias inteiros, sem fuso: a diferença entre duas datas é
 * sempre exata (gestação = nascimento − IATF). null se não for uma data.
 */
export function serialDia(v: unknown): number | null {
  const m = t(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  const ms = Date.UTC(ano, mes - 1, dia);
  const d = new Date(ms);
  // 31/02 vira 03/03 no Date — rejeita em vez de aceitar uma data que não existe.
  if (d.getUTCDate() !== dia || d.getUTCMonth() !== mes - 1) return null;
  return ms / 86_400_000;
}

/** Inverso de `serialDia`: "dd/mm/aaaa". '' se null. */
export function formatSerial(n: number | null | undefined): string {
  if (n == null) return '';
  const d = new Date(n * 86_400_000);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

/** Hoje em serial de dia, no fuso de Brasília (o dia da fazenda, não o do servidor). */
export function hojeSerial(agora = Date.now()): number {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(agora));
  const [a, m, d] = partes.split('-').map(Number);
  return Date.UTC(a, m - 1, d) / 86_400_000;
}
