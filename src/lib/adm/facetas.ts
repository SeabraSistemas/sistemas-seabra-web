/**
 * FACETAS — o filtro em memória que a grade aplica, como MÓDULO PURO.
 *
 * Nasceu dentro de `components/adm/AdmFilters.tsx` e saiu de lá por um motivo
 * concreto: a exportação. A grade filtra no cliente (rótulo da FK, texto sem
 * acento, "(vazio)" como valor), e a rota de exportação refazia o filtro no
 * servidor com OUTRA gramática — `eq categoria 'Lactante'` numa coluna uuid,
 * `ilike` sensível a acento, cursor de uma paginação que no modo cliente não
 * existe. Resultado: o arquivo não trazia o que a tela mostrava, e às vezes não
 * trazia nada. A única forma de garantir "o que se vê é o que se baixa" é as
 * duas pontas rodarem A MESMA FUNÇÃO — e uma função compartilhada entre um
 * Client Component e um route handler não pode morar num arquivo 'use client'
 * (importado pelo servidor ele vira referência de cliente, não valor).
 *
 * Tudo aqui é entrada → saída, sem React, sem relógio (o `agora` é parâmetro).
 * `AdmFilters` importa e reexporta para quem já importava de lá.
 *
 * A GRAMÁTICA (o que se salva nos favoritos):
 *
 *   ?f.papel=produtor,tecnico     enum multi-seleção
 *   ?f.peso=40..80                intervalo numérico (aberto dos dois lados: `40..` e `..80`)
 *   ?f.nascimento=30d             período relativo — reavaliado a cada visita
 *   ?f.nascimento=2024-01-01..2025-12-31   período absoluto
 *   ?f.ativo=sim                  booleano tri-state (ausente = todos)
 *   ?f.nome=boa vista             texto contém, sem acento e sem caixa
 */

import { diaCivil } from '@/lib/adm/format';
import { PREFIXO_FILTRO, SEM_VALOR } from '@/lib/adm/url';

/** Só o que se lê de um URLSearchParams. Aceita tanto o objeto do hook do Next
 *  quanto um construído à mão no servidor. */
export interface LeitorParams {
  get(chave: string): string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Definição de faceta
// ─────────────────────────────────────────────────────────────────────────────

export type TipoFaceta = 'enum' | 'intervalo' | 'data' | 'booleano' | 'texto';

/** O que `valor()` pode devolver. O array cobre `propriedades.segmentos` (text[]),
 *  onde uma linha pertence a vários valores da mesma faceta ao mesmo tempo. */
export type ValorFaceta = string | number | boolean | null | undefined | readonly (string | null)[];

export interface FacetaDef<T> {
  /** Nome do parâmetro depois do prefixo: `estado` vira `?f.estado=`. */
  chave: string;
  rotulo: string;
  tipo: TipoFaceta;
  /** Extrai da linha o valor que o filtro compara. */
  valor: (linha: T) => ValorFaceta;
  /** Traduz o valor cru para leitura humana ('caprino_leiteiro' → 'Caprino leiteiro'). */
  rotuloValor?: (valor: string) => string;
  /** Ordem e universo fixos das opções (ex.: PAPEIS). Sem isto, as opções saem do
   *  próprio dado, ordenadas por frequência. */
  opcoes?: readonly string[];
  /** Sufixo de unidade no intervalo numérico ('kg', 'L', 'dias'). */
  unidade?: string;
  /** Casas decimais na exibição do intervalo. 0 = inteiro. */
  casas?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtros ativos
// ─────────────────────────────────────────────────────────────────────────────

export const PRESETS_PERIODO = [
  { chave: '7d', rotulo: '7 dias', dias: 7 },
  { chave: '30d', rotulo: '30 dias', dias: 30 },
  { chave: '90d', rotulo: '90 dias', dias: 90 },
  { chave: '12m', rotulo: '12 meses', dias: 365 },
  { chave: 'tudo', rotulo: 'Tudo', dias: null },
] as const;

export type PresetPeriodo = (typeof PRESETS_PERIODO)[number]['chave'];

export type Filtro =
  | { tipo: 'enum'; valores: string[] }
  | { tipo: 'intervalo'; de: number | null; ate: number | null }
  | { tipo: 'data'; de: string | null; ate: string | null; preset: PresetPeriodo | null }
  | { tipo: 'booleano'; valor: boolean }
  | { tipo: 'texto'; termo: string };

/** Chave da faceta → filtro ativo. Faceta ausente = sem filtro (nunca `null`). */
export type Filtros = Record<string, Filtro>;

/** Acentuação e caixa fora: 'São João' casa com 'sao joao'. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** 'YYYY-MM-DD' de N dias atrás, contado em dia civil de São Paulo. A aritmética
 *  é em UTC sobre a meia-noite do dia civil — nunca sobre o instante local, que
 *  daria um dia a mais ou a menos dependendo de onde a página renderizou. */
export function diaMenos(dias: number, agora: string | Date): string | null {
  const base = diaCivil(agora);
  if (!base) return null;
  const ms = Date.parse(`${base}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms - dias * 86_400_000).toISOString().slice(0, 10);
}

function presetValido(bruto: string): PresetPeriodo | null {
  const achado = PRESETS_PERIODO.find((p) => p.chave === bruto);
  return achado ? achado.chave : null;
}

const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function numeroOuNulo(bruto: string): number | null {
  const limpo = bruto.trim().replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

/**
 * Traduz os `?f.*` da URL para filtros tipados.
 *
 * Nada aqui lança: todo valor vem de fora (link colado, favorito velho, faceta
 * que mudou de tipo). Um parâmetro ilegível é DESCARTADO — a tela mostra a lista
 * sem aquele filtro, nunca um erro.
 */
export function lerFiltros<T>(
  facetas: readonly FacetaDef<T>[],
  params: LeitorParams,
  agora: string | Date = new Date(),
): Filtros {
  const filtros: Filtros = {};

  for (const faceta of facetas) {
    const bruto = params.get(`${PREFIXO_FILTRO}${faceta.chave}`);
    if (bruto === null) continue;
    const texto = bruto.trim();
    if (texto === '') continue;

    switch (faceta.tipo) {
      case 'enum': {
        const valores = texto
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== '');
        if (valores.length > 0) filtros[faceta.chave] = { tipo: 'enum', valores };
        break;
      }
      case 'intervalo': {
        const [a, b] = texto.includes('..') ? texto.split('..') : [texto, texto];
        const de = numeroOuNulo(a ?? '');
        const ate = numeroOuNulo(b ?? '');
        if (de !== null || ate !== null) filtros[faceta.chave] = { tipo: 'intervalo', de, ate };
        break;
      }
      case 'data': {
        const preset = presetValido(texto);
        if (preset) {
          const p = PRESETS_PERIODO.find((x) => x.chave === preset);
          // 'tudo' é um filtro que não filtra: existe para o chip mostrar a
          // escolha explícita em vez de parecer que ninguém tocou na faceta.
          const de = p && p.dias !== null ? diaMenos(p.dias, agora) : null;
          filtros[faceta.chave] = { tipo: 'data', de, ate: null, preset };
          break;
        }
        const [a, b] = texto.includes('..') ? texto.split('..') : [texto, texto];
        const de = a && SO_DATA.test(a.trim()) ? a.trim() : null;
        const ate = b && SO_DATA.test(b.trim()) ? b.trim() : null;
        if (de || ate) filtros[faceta.chave] = { tipo: 'data', de, ate, preset: null };
        break;
      }
      case 'booleano': {
        const v = normalizar(texto);
        if (v === 'sim' || v === 'true' || v === '1') filtros[faceta.chave] = { tipo: 'booleano', valor: true };
        else if (v === 'nao' || v === 'false' || v === '0') filtros[faceta.chave] = { tipo: 'booleano', valor: false };
        break;
      }
      case 'texto': {
        filtros[faceta.chave] = { tipo: 'texto', termo: texto };
        break;
      }
    }
  }

  return filtros;
}

/** Quantas facetas estão de fato filtrando. 'tudo' não conta — não corta nada. */
export function contarFiltrosAtivos(filtros: Filtros): number {
  return Object.values(filtros).filter((f) => !(f.tipo === 'data' && f.preset === 'tudo')).length;
}

/** O valor da linha como lista de chaves de enum. Null/vazio vira SEM_VALOR para
 *  que "sem número de criador" seja uma opção clicável, e não um buraco. */
export function chavesDaLinha<T>(faceta: FacetaDef<T>, linha: T): string[] {
  const bruto = faceta.valor(linha);
  if (bruto === null || bruto === undefined) return [SEM_VALOR];
  if (Array.isArray(bruto)) {
    const itens = bruto.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return itens.length > 0 ? itens : [SEM_VALOR];
  }
  const texto = String(bruto).trim();
  return texto === '' ? [SEM_VALOR] : [texto];
}

export function numeroDaLinha<T>(faceta: FacetaDef<T>, linha: T): number | null {
  const bruto = faceta.valor(linha);
  if (typeof bruto === 'number') return Number.isFinite(bruto) ? bruto : null;
  if (typeof bruto === 'string' && bruto.trim() !== '') {
    const n = Number(bruto);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function diaDaLinha<T>(faceta: FacetaDef<T>, linha: T): string | null {
  const bruto = faceta.valor(linha);
  if (typeof bruto !== 'string' || bruto.trim() === '') return null;
  return diaCivil(bruto);
}

/** Uma linha passa por um filtro? Dentro da faceta os valores são OU. */
export function casa<T>(faceta: FacetaDef<T>, filtro: Filtro, linha: T): boolean {
  switch (filtro.tipo) {
    case 'enum': {
      const chaves = chavesDaLinha(faceta, linha);
      return filtro.valores.some((v) => chaves.includes(v));
    }
    case 'intervalo': {
      const n = numeroDaLinha(faceta, linha);
      // Sem valor nunca cabe num intervalo: 'peso ≥ 40' não pode incluir a cabra
      // que nunca foi pesada — seria inventar um dado que não existe.
      if (n === null) return false;
      if (filtro.de !== null && n < filtro.de) return false;
      if (filtro.ate !== null && n > filtro.ate) return false;
      return true;
    }
    case 'data': {
      if (filtro.de === null && filtro.ate === null) return true;
      const d = diaDaLinha(faceta, linha);
      if (d === null) return false;
      // Comparação de 'YYYY-MM-DD' como TEXTO é correta e não cria Date nenhum:
      // o formato é lexicograficamente ordenado por construção.
      if (filtro.de !== null && d < filtro.de) return false;
      if (filtro.ate !== null && d > filtro.ate) return false;
      return true;
    }
    case 'booleano': {
      const bruto = faceta.valor(linha);
      return (bruto === true) === filtro.valor;
    }
    case 'texto': {
      const alvo = normalizar(filtro.termo);
      if (alvo === '') return true;
      return chavesDaLinha(faceta, linha).some((v) => normalizar(v).includes(alvo));
    }
  }
}

/**
 * Aplica os filtros em memória. `ignorar` deixa uma faceta de fora — é o que
 * permite contar as opções dela sobre o conjunto das OUTRAS.
 */
export function filtrarLinhas<T>(
  linhas: readonly T[],
  facetas: readonly FacetaDef<T>[],
  filtros: Filtros,
  ignorar?: string,
): T[] {
  const ativos = facetas.filter((f) => f.chave !== ignorar && filtros[f.chave] !== undefined);
  if (ativos.length === 0) return [...linhas];
  return linhas.filter((linha) => ativos.every((f) => casa(f, filtros[f.chave]!, linha)));
}
