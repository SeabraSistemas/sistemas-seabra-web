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
 * O campo `lote` do rebanho NÃO serve de agrupador: só 6 dos 378 animais
 * que já entraram em engorda têm ele preenchido. O agrupamento é sempre
 * Fazenda + Entrada engorda; o NOME de cada lote usa o `lote` real quando
 * todo mundo do grupo concorda, senão vira "Lote GMD d.m.aa" gerado da
 * data de entrada (pedido do Felipe, 15/09/2026).
 *
 * "Ativos" usa `Categoria` (∉ {Venda, Baixa}), NUNCA `Status` — achado ao
 * vivo (15/09/2026): `Status` é um estágio de vida (Engorda/Desmamada/
 * Solteira/Parida/...) que muda mesmo com o animal ainda no rebanho, e
 * pode ficar "Engorda" congelado depois que o animal já foi vendido/morreu
 * (41 dos 44 animais que pareciam "nunca repesados" já tinham Categoria
 * "Venda", 1 "Baixa" — só o Status é que não foi atualizado). Mesmo
 * critério de "vivo" do RebanhoView (ver `vivo()` lá).
 */
import { media } from '@/lib/painel/agregacao';
import { diasEntre } from '@/lib/painel/format';
import type { DiaCompacto, RegRebanho } from './types';

/** Não está na venda/baixa — mesmo conceito de `vivo()` em RebanhoView.tsx (duplicado aqui porque este arquivo é lib pura, sem depender de um Client Component). */
function vivo(a: RegRebanho): boolean {
  return a.categoria !== 'Venda' && a.categoria !== 'Baixa';
}

export interface LoteEngorda {
  /** Nome do `lote` real (RebanhoProd) quando todo mundo do cohort concorda; senão "Lote GMD d.m.aa" (dia/mês sem zero à esquerda, ano com 2 dígitos), gerado a partir da data de entrada. */
  nome: string;
  fazenda: string;
  entrada: DiaCompacto;
  /** Dias corridos entre a entrada e `hoje` (o parâmetro de montarLotesEngorda). */
  diasDesdeEntrada: number | null;
  total: number;
  /** Quantos do cohort ainda não saíram do rebanho (Categoria ∉ {Venda, Baixa}) — não usa `Status`, ver comentário no topo do arquivo. */
  ativos: number;
  /** Quantos do cohort têm GMD atual > 0 — a base de `gmdMedio` (repesagens desatualizadas ficam de fora). */
  comGmd: number;
  gmdMedio: number | null;
  pesoEntradaMedio: number | null;
}

/** "aaaammdd" => "d.m.aa" (dia/mês sem zero à esquerda, ano com 2 dígitos) — ex.: 20260423 => "23.4.26". */
function dataCurta(dia: DiaCompacto): string {
  const ano = Math.floor(dia / 10000);
  const mes = Math.floor((dia % 10000) / 100);
  const diaDoMes = dia % 100;
  return `${diaDoMes}.${mes}.${ano % 100}`;
}

/** Usa o `lote` real do rebanho só se TODOS os que o têm preenchido concordam; senão gera "Lote GMD d.m.aa" pela data de entrada — a maioria (372 de 378, ao vivo em 15/09/2026) não tem `lote` nenhum. */
function nomeDoLote(lista: RegRebanho[], entrada: DiaCompacto): string {
  const lotesReais = new Set(lista.map((a) => a.lote).filter((v): v is string => !!v));
  if (lotesReais.size === 1) return [...lotesReais][0];
  return `Lote GMD ${dataCurta(entrada)}`;
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
      nome: nomeDoLote(lista, entrada),
      fazenda,
      entrada,
      diasDesdeEntrada: diasEntre(entrada, hoje),
      total: lista.length,
      ativos: lista.filter(vivo).length,
      comGmd: gmdValores.length,
      gmdMedio: media(gmdValores),
      pesoEntradaMedio: media(lista.map((a) => a.pesoEntradaEngorda)),
    };
  });

  return lotes.sort((a, b) => b.entrada - a.entrada || a.fazenda.localeCompare(b.fazenda));
}
