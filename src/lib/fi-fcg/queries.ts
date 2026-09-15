import 'server-only';
import { lerAba } from '@/lib/sheets/server';
import { criarCache } from '@/lib/sheets/cache';
import { spreadsheetId } from './config';
import {
  mapAbortos,
  mapBaixas,
  mapCategoriaArroba,
  mapCategoriasCusto,
  mapCustos,
  mapFinanceiro,
  mapIatf,
  mapPartos,
  mapPesagem,
  mapRebanho,
  mapToque,
  mapVendas,
} from './mapeadores';
import type {
  CategoriaArroba,
  CategoriaCusto,
  Custo,
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

/**
 * Igual a `lerAbaCache`, mas SEM cache — achado ao vivo (15/09/2026) testando
 * os Custos: `invalidarCache()` chamado por uma API route nunca tem efeito
 * sobre o cache visto pela renderização da PÁGINA, porque o Next compila
 * cada rota (cada `page.tsx`, cada `route.ts`) como um módulo separado — o
 * `cache` (const de módulo, `queries.ts`) não é o mesmo objeto nos dois
 * lados, mesmo no mesmo processo do `next dev`. Pra "Custos" e "Categorias
 * de Custo" (as únicas abas que o usuário ESCREVE por aqui) isso significa
 * o usuário salvar um custo e não ver o resultado por até 5 min — inaceitável
 * numa tela de cadastro. As duas são pequenas (dezenas de linhas, não
 * milhares como Pesagem), então ler direto da planilha a cada request sai
 * barato; as abas do AppSheet (só leitura) continuam cacheadas.
 */
async function lerAbaFresca(aba: string): Promise<{ linhas: string[][] | null; stale: boolean; carregadoEm: number | null }> {
  const id = spreadsheetId();
  if (!id) return { linhas: null, stale: false, carregadoEm: null };
  const linhas = await lerAba(id, aba);
  return { linhas, stale: false, carregadoEm: Date.now() };
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

/** Aba "Categoria@" — preço fixo por categoria, usado pra estimar venda sem valor (ver financeiro.ts). */
export async function getCategoriaArroba(): Promise<Leitura<CategoriaArroba>> {
  const { linhas, stale, carregadoEm } = await lerAbaCache('Categoria@');
  return { itens: mapCategoriaArroba(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

/** Aba "Categorias de Custo" (nova, 15/09/2026 — não é do AppSheet, é só do /FI_FCG). Sem cache — ver `lerAbaFresca`. */
export async function getCategoriasCusto(): Promise<Leitura<CategoriaCusto>> {
  const { linhas, stale, carregadoEm } = await lerAbaFresca('Categorias de Custo');
  return { itens: mapCategoriasCusto(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

/** Aba "Custos" (nova, 15/09/2026). Sem cache — ver `lerAbaFresca`. */
export async function getCustos(): Promise<Leitura<Custo>> {
  const { linhas, stale, carregadoEm } = await lerAbaFresca('Custos');
  return { itens: mapCustos(linhas), configurado: spreadsheetId() != null, stale, carregadoEm };
}

/**
 * Tudo que a página Financeiro precisa, numa só leva. RebanhoProd e
 * Categoria@ entram aqui (mesmo cache por aba do Rebanho — se a página
 * /rebanho já rodou nos últimos 5 min, é hit) pra estimar o valor de uma
 * Venda sem valor registrado: Sexo + Data de nascimento (nunca sobrescritos)
 * dão a idade do animal NA DATA DA VENDA, a mesma fórmula de idade+sexo que
 * a própria RebanhoProd usa pra calcular Categoria vira a categoria
 * estimada, e Categoria@ dá o preço — tudo isso fica no servidor, o cliente
 * só recebe o valor já calculado (ver montarEventos em financeiro.ts).
 */
export async function getDadosFinanceiro() {
  const [vendas, baixas, abortos, lancamentos, rebanho, categoriaArroba, custos, categoriasCusto] = await Promise.all([
    getVendas(),
    getBaixas(),
    getAbortos(),
    getLancamentosFinanceiros(),
    getRebanho(),
    getCategoriaArroba(),
    getCustos(),
    getCategoriasCusto(),
  ]);
  return { vendas, baixas, abortos, lancamentos, rebanho, categoriaArroba, custos, categoriasCusto };
}

/** Usado por POST /FI_FCG/api/atualizar — limpa tudo do FI_FCG pro botão "Atualizar" forçar releitura. */
export function invalidarCache(): void {
  cache.invalidar('fi-fcg:');
}
