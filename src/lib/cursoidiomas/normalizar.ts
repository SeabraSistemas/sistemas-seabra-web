/**
 * Comparação tolerante de respostas escritas. Um teclado brasileiro não tem
 * ß nem œ; apóstrofos tipográficos vêm do autocorretor; pontuação final e
 * caixa não são o que a lição testa. Acentos NÃO são apagados: em francês
 * (e nos tremas alemães) eles mudam a palavra.
 */
export function normalizarResposta(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/ß/g, 'ss')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    // apóstrofo com espaços ao redor (l' avion) e "gehts" x "geht's"
    .replace(/\s*'\s*/g, "'")
    .replace(/[.,;:!?…«»"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function respostaCorreta(dada: string, esperadas: string | string[]): boolean {
  const alvo = normalizarResposta(dada);
  if (!alvo) return false;
  return [esperadas].flat().some((e) => {
    const n = normalizarResposta(e);
    return n === alvo || n.replace(/'/g, '') === alvo.replace(/'/g, '');
  });
}
