/**
 * Datas como string ISO "aaaa-mm-dd", aritmética em UTC. Não existe hora em
 * nada do /3irmaos — e usar Date local aqui é exatamente como o app ganhou a
 * família de defeitos "data um dia antes" (fuso de -3h virando o dia).
 */

const DIA_MS = 24 * 60 * 60 * 1000;

function paraUtc(iso: string): number {
  const [a, m, d] = iso.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
}

function deUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function somarDias(iso: string, dias: number): string {
  return deUtc(paraUtc(iso) + dias * DIA_MS);
}

export function diasEntre(de: string, ate: string): number {
  return Math.round((paraUtc(ate) - paraUtc(de)) / DIA_MS);
}

/** 0 = domingo … 6 = sábado. */
export function diaDaSemana(iso: string): number {
  return new Date(paraUtc(iso)).getUTCDay();
}

/** Mesmo dia, n meses depois (31/01 + 1 mês = 28 ou 29/02 — o Date do JS transbordaria para março). */
export function somarMeses(iso: string, meses: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimoDia));
  return deUtc(alvo.getTime());
}

/** DIA_INICIO_SEMANA = terça: a semana de fornecimento começa no dia em que a Rose recolhe. */
export const DIA_INICIO_SEMANA = 2;

/** Início (terça) da semana de fornecimento que contém a data. */
export function inicioDaSemana(iso: string): string {
  const recuo = (diaDaSemana(iso) - DIA_INICIO_SEMANA + 7) % 7;
  return somarDias(iso, -recuo);
}

/** "aaaa-mm" do dia. */
export function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

/** Data de hoje em Brasília — no servidor da Vercel o relógio é UTC. */
export function hojeBrasilia(agora = new Date()): string {
  return deUtc(agora.getTime() - 3 * 60 * 60 * 1000);
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "06/10" */
export function diaMes(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

/** "06/10/2026" */
export function dataCurta(iso: string): string {
  return `${diaMes(iso)}/${iso.slice(0, 4)}`;
}

/** "out/26" a partir de "2026-10". */
export function rotuloMes(aaaamm: string): string {
  return `${MESES[Number(aaaamm.slice(5, 7)) - 1]}/${aaaamm.slice(2, 4)}`;
}

/** "Outubro de 2026" a partir de "2026-10". */
export function rotuloMesLongo(aaaamm: string): string {
  const mes = MESES_LONGOS[Number(aaaamm.slice(5, 7)) - 1];
  return `${mes[0].toUpperCase()}${mes.slice(1)} de ${aaaamm.slice(0, 4)}`;
}
