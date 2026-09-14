import 'server-only';
import { lerAba } from '@/lib/sheets/server';
import { criarCache } from '@/lib/sheets/cache';
import { spreadsheetId } from './config';
import {
  mapAbortos,
  mapBaixas,
  mapFinanceiro,
  mapIatf,
  mapPartos,
  mapPesagem,
  mapRebanho,
  mapToque,
  mapVendas,
} from './mapeadores';
import type {
  LancamentoFinanceiro,
  RegAborto,
  RegBaixa,
  RegIatf,
  RegParto,
  RegPesagem,
  RegRebanho,
  RegToque,
  RegVenda,
} from './types';

/**
 * Camada de leitura do /FI_FCG. Cache POR ABA (não por página) — a aba
 * "Baixa" é lida tanto pela página Baixas quanto pelo Financeiro, e cachear
 * por aba faz a segunda leitura reusar a primeira em vez de duplicar a
 * chamada à API do Sheets. TTL de 5 min (ver plano). Nunca lança: aba
 * ausente/erro de leitura => [] (a página distingue "não configurado" via
 * `configurado`, e mostra o "Atualizado às HH:MM" via `carregadoEm`).
 */
const TTL_MS = 5 * 60 * 1000;
const cache = criarCache<string[][] | null>(TTL_MS);

export interface Leitura<T> {
  itens: T[];
  /** false = falta FI_FCG_SPREADSHEET_ID (erro de configuração, não "planilha vazia"). */
  configurado: boolean;
  /** true = a releitura falhou e isto é um valor em cache mais antigo que o TTL. */
  stale: boolean;
  /** Quando os dados foram efetivamente lidos da planilha. null só quando `configurado` é false. */
  carregadoEm: number | null;
}

async function lerAbaCache(aba: string): Promise<{ linhas: string[][] | null; stale: boolean; carregadoEm: number | null }> {
  const id = spreadsheetId();
  if (!id) return { linhas: null, stale: false, carregadoEm: null };
  const { valor, stale, carregadoEm } = await cache.obter(`fi-fcg:${aba}`, () => lerAba(id, aba));
  return { linhas: valor, stale, carregadoEm };
}

function maisAntigo(a: number | null, b: number | null): number | null {
  if (a == null) return b;
  if (b == null) return a;
  return Math.min(a, b);
}

export async function getIatf(): Promise<Leitura<RegIatf>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Reproduçao');
  return { itens: mapIatf(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getToque(): Promise<Leitura<RegToque>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Toque');
  return { itens: mapToque(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getRebanho(): Promise<Leitura<RegRebanho>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('RebanhoProd');
  return { itens: mapRebanho(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

/** Abas "Parto" (Inhumas) + "Parto CG" (Campina grande) — mesmo layout, "Fazenda" já vem certa em cada linha. */
export async function getPartos(): Promise<Leitura<RegParto>> {
  const [fi, cg] = await Promise.all([lerAbaCache('Parto'), lerAbaCache('Parto CG')]);
  return {
    itens: [...mapPartos(fi.linhas), ...mapPartos(cg.linhas)],
    configurado: spreadsheetId() != null,
    stale: fi.stale || cg.stale,
    carregadoEm: maisAntigo(fi.carregadoEm, cg.carregadoEm),
  };
}

export async function getPesagem(): Promise<Leitura<RegPesagem>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Pesagem');
  return { itens: mapPesagem(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getBaixas(): Promise<Leitura<RegBaixa>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Baixa');
  return { itens: mapBaixas(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getVendas(): Promise<Leitura<RegVenda>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Venda');
  return { itens: mapVendas(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getAbortos(): Promise<Leitura<RegAborto>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Aborto');
  return { itens: mapAbortos(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

export async function getLancamentosFinanceiros(): Promise<Leitura<LancamentoFinanceiro>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Financeiro');
  return { itens: mapFinanceiro(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

/** Tudo que a página Financeiro precisa, numa só leva (4 abas em paralelo, cada uma com seu próprio cache por aba). */
export async function getDadosFinanceiro() {
  const [vendas, baixas, abortos, lancamentos] = await Promise.all([
    getVendas(),
    getBaixas(),
    getAbortos(),
    getLancamentosFinanceiros(),
  ]);
  return { vendas, baixas, abortos, lancamentos };
}

/** Usado por POST /FI_FCG/api/atualizar — limpa tudo do FI_FCG pro botão "Atualizar" forçar releitura. */
export function invalidarCache(): void {
  cache.invalidar('fi-fcg:');
}
