/*
 * Grupo do produto pelo título — mesma regra de src/lib/pedidos/tipos.ts (grupoDoProduto).
 * Se mudar uma, mude a outra.
 */
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Leitor primeiro: o título do leitor também diz "Micro Chip Scanner". */
export function grupoDoProduto(titulo) {
  const t = semAcento(titulo);
  if (/\b(leitor|reader|scanner)\b/.test(t)) return 'leitor';
  if (/micro ?chip|etiqueta de vidro|glass tag|\bchip\b/.test(t)) return 'microchip';
  return 'outro';
}
