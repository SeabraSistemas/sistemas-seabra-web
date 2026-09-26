import { nk, semenValido } from '@/lib/bovinos/texto';
import type { IatfVia } from '@/lib/bovinos/identidade';

/**
 * Regra do pai de um bezerro a partir das IATFs da mãe — a mesma usada nas
 * correções manuais de 26/09/2026 nas três planilhas.
 *
 * g = dias entre a IATF e o nascimento. O "Parto previsto" do app é
 * IATF + 293; o próprio app considera monta livre quem nasce 21 dias ou mais
 * depois do previsto (g ≥ 314). Os dados mostram o pico de gestação de IATF
 * entre 280 e 305 dias.
 */
export const JANELA = {
  /** Menor gestação aceita como "desta IATF". */
  min: 270,
  /** Maior (previsto + 20, o mesmo corte do app). */
  max: 313,
  /** Abaixo disto a IATF não pode ter gerado o bezerro (nem prematuro). */
  impossivel: 240,
  /** 314–330: acima do limite; decisão do Felipe: monta livre. */
  longoMax: 330,
} as const;

export interface IatfG {
  iatf: IatfVia;
  g: number;
}

export type VereditoPai =
  | { tipo: 'iatf'; semen: string; escolhida: IatfG; ignoradas: IatfG[] }
  | { tipo: 'monta-livre'; motivo: 'sem-iatf' | 'longo' | 'fora'; ultima: IatfG | null }
  | { tipo: 'ambiguo'; motivo: 'dois-semens' | 'posterior'; candidatos: IatfG[]; sugerido: string | null }
  | { tipo: 'curto'; ultima: IatfG };

export function paiEsperado(nasc: number, lista: IatfVia[]): VereditoPai {
  const antes: IatfG[] = lista
    .filter((x) => x.data != null && x.data < nasc && semenValido(x.semen))
    .map((iatf) => ({ iatf, g: nasc - (iatf.data as number) }))
    .sort((a, b) => b.g - a.g); // mais antiga primeiro

  const janela = antes.filter((x) => x.g >= JANELA.min && x.g <= JANELA.max);
  const semens = new Set(janela.map((x) => nk(x.iatf.semen)));

  if (semens.size > 1) return { tipo: 'ambiguo', motivo: 'dois-semens', candidatos: janela, sugerido: null };

  if (semens.size === 1) {
    // A mais recente da janela (ressinc depois da primeira IATF).
    const escolhida = janela[janela.length - 1];
    const depois = antes.filter((x) => x.g < escolhida.g);
    const ignoradas: IatfG[] = [];
    for (const d of depois) {
      if (d.g < JANELA.impossivel) ignoradas.push(d);
      else if (nk(d.iatf.semen) !== nk(escolhida.iatf.semen)) {
        return { tipo: 'ambiguo', motivo: 'posterior', candidatos: [escolhida, d], sugerido: escolhida.iatf.semen };
      }
    }
    return { tipo: 'iatf', semen: escolhida.iatf.semen, escolhida, ignoradas };
  }

  const ultima = antes.length ? antes[antes.length - 1] : null;
  if (!ultima) return { tipo: 'monta-livre', motivo: 'sem-iatf', ultima: null };
  if (ultima.g > JANELA.max && ultima.g <= JANELA.longoMax) return { tipo: 'monta-livre', motivo: 'longo', ultima };
  if (ultima.g >= JANELA.impossivel && ultima.g < JANELA.min) return { tipo: 'curto', ultima };
  return { tipo: 'monta-livre', motivo: 'fora', ultima };
}
