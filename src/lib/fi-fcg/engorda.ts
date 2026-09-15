/**
 * Lotes de engorda — cohorts de animais que entraram no programa de
 * engorda na mesma data, na mesma fazenda.
 *
 * Confirmado ao vivo com o Felipe (15/09/2026): `RebanhoProd.Entrada
 * engorda` é gravada uma vez por animal quando ele entra no programa. A
 * partir dali, cada `Pesagem` seguinte desse animal já calcula Dias em
 * engorda / Peso entrada engorda / GMD relativo a essa data (conferido:
 * GMD = (peso atual − peso entrada) / dias em engorda). `RebanhoProd.GMD`
 * carrega o valor da ÚLTIMA pesagem de cada animal — não é recalculado
 * aqui, só agregado por cohort.
 *
 * O campo `lote` do rebanho NÃO serve de agrupador aqui: só 6 dos 378
 * animais que já entraram em engorda têm ele preenchido. O agrupamento
 * natural é Fazenda + Entrada engorda (hoje formam só 4 cohorts).
 */
import { media } from '@/lib/painel/agregacao';
import { diasEntre } from '@/lib/painel/format';
import type { DiaCompacto, RegRebanho } from './types';

export interface LoteEngorda {
  fazenda: string;
  entrada: DiaCompacto;
  /** Dias corridos entre a entrada e `hoje` (o parâmetro de montarLotesEngorda). */
  diasDesdeEntrada: number | null;
  total: number;
  /** Quantos do cohort ainda estão com Status "Engorda" (os demais já saíram: venda, baixa, ou mudaram de status). */
  ativos: number;
  /** Quantos do cohort têm GMD atual > 0 — a base de `gmdMedio` (repesagens desatualizadas ficam de fora). */
  comGmd: number;
  gmdMedio: number | null;
  pesoEntradaMedio: number | null;
}

export function montarLotesEngorda(animais: RegRebanho[], hoje: DiaCompacto): LoteEngorda[] {
  const grupos = new Map<string, RegRebanho[]>();
  for (const a of animais) {
    if (a.entradaEngorda == null || !a.fazenda) continue;
    const chave = `${a.fazenda}|${a.entradaEngorda}`;
    let lista = grupos.get(chave);
    if (!lista) {
      lista = [];
      grupos.set(chave, lista);
    }
    lista.push(a);
  }

  const lotes = Array.from(grupos.values(), (lista): LoteEngorda => {
    const fazenda = lista[0].fazenda as string;
    const entrada = lista[0].entradaEngorda as DiaCompacto;
    const gmdValores = lista.map((a) => a.gmdAtual).filter((v): v is number => v != null && v > 0);
    return {
      fazenda,
      entrada,
      diasDesdeEntrada: diasEntre(entrada, hoje),
      total: lista.length,
      ativos: lista.filter((a) => a.status === 'Engorda').length,
      comGmd: gmdValores.length,
      gmdMedio: media(gmdValores),
      pesoEntradaMedio: media(lista.map((a) => a.pesoEntradaEngorda)),
    };
  });

  return lotes.sort((a, b) => b.entrada - a.entrada || a.fazenda.localeCompare(b.fazenda));
}
