/*
 * Contas e formatos do /orcamentos. Quantidade e valor ficam como TEXTO no
 * estado (o campo precisa aceitar "8," no meio da digitação) e só viram número
 * aqui, na hora de somar e imprimir.
 */

export type Item = { id: string; nome: string; detalhe: string; qtd: string; valor: string };

/** "1.530,00", "8,6", "8.6", "1530" → número; vazio ou lixo → 0. */
export function lerNumero(texto: string): number {
  let t = texto.replace(/[R$\s]/g, '');
  if (!t) return 0;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

const FMT_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FMT_NUM = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Intl usa espaço duro depois do "R$"; troca por espaço comum para não quebrar busca/cópia no PDF. */
export const brl = (n: number) => FMT_BRL.format(n).replace(/ /g, ' ');
/** Valor para devolver ao campo: "1.530,00". */
export const numeroCampo = (n: number) => FMT_NUM.format(n);

export const totalItem = (i: Item) => Math.round(lerNumero(i.qtd) * lerNumero(i.valor) * 100) / 100;

export function totais(itens: Item[], desconto: string) {
  const subtotal = itens.reduce((s, i) => s + totalItem(i), 0);
  const d = Math.min(lerNumero(desconto), subtotal);
  return { subtotal, desconto: d, total: subtotal - d };
}

/** "2026-09-29" → "29/09/2026" (sem passar por Date, que puxaria fuso). */
export function dataBR(iso: string): string {
  const [a, m, d] = iso.split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/** Soma dias a uma data ISO. Meio-dia UTC para não escorregar de dia no horário de verão. */
export function somarDias(iso: string, dias: number): string {
  const t = Date.parse(`${iso}T12:00:00Z`);
  if (Number.isNaN(t)) return iso;
  return new Date(t + dias * 86_400_000).toISOString().slice(0, 10);
}

/** Data de hoje no fuso de quem usa, em ISO. */
export function hojeISO(agora = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/** Nome de arquivo do PDF (o Chrome usa o título da página). */
export function tituloArquivo(numero: string, cliente: string): string {
  const limpo = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '-').trim();
  return ['Orçamento Seabra', limpo(numero), limpo(cliente)].filter(Boolean).join(' - ');
}
