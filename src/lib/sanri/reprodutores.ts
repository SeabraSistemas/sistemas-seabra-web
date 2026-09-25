/**
 * Reprodutores do Capril Sanri — desempenho leiteiro das filhas. Puro (sem
 * rede), testável. Lê o que o SeabraApp já fechou (tabelas `rebanho` e
 * `lactacao` da propriedade 244); o painel não escreve nada.
 *
 * Nasceu do "Relatório de Reprodutores" em PDF de 14/07/2026 (bloco por
 * reprodutor: filhas com lactação encerrada, média diária, acumulado, ordem
 * de parto) e ganhou: todas as lactações encerradas (não só uma por filha),
 * média CORRIGIDA por ordem de parto, dias de lactação e filhas com baixa.
 *
 * Definições (decisão de 25/09/2026):
 * - Filha: fêmea do rebanho com `pai_id` = o reprodutor.
 * - Lactação "com leite": total e média maiores que zero. As sem leite (146 de
 *   759 em 25/09) ficam FORA das médias e aparecem contadas — zero de import
 *   não é produção zero.
 * - Média diária: por filha, a média de suas lactações com leite; depois a
 *   média entre as filhas (cada filha pesa igual, não quem tem mais lactações).
 * - Média CORRIGIDA = média diária × fator da ordem de parto do app (1ª ×1,22,
 *   2ª ×1,10, 3ª+ ×1,00) — calculada pelo app ao encerrar a lactação; sem ela,
 *   cai para a bruta.
 * - Acumulado e dias: média direta sobre as lactações com leite.
 * - Baixa: filha cuja categoria atual é venda, descartado ou óbito.
 */
import { formatDia } from '@/lib/painel/format';

export type Confianca = 'DEFINITIVO' | 'INFERIDO' | 'ESTIMATIVA' | 'OUTRA';

export interface AnimalApp {
  id: number;
  numero: string | null;
  nome: string | null;
  sexo: 'macho' | 'femea' | null;
  paiId: number | null;
  maeId: number | null;
  partos: number | null;
  /** Nome da categoria atual, em minúsculas ("reprodutor", "venda", "lactante"…). */
  categoria: string | null;
  ativo: boolean;
}

export interface LactacaoApp {
  id: number;
  animalId: number;
  /** aaaammdd */
  inicio: number | null;
  fim: number | null;
  dias: number | null;
  total: number | null;
  media: number | null;
  corrigida: number | null;
  confianca: Confianca;
}

/** Linhas cruas do Supabase, só as colunas que o painel seleciona. */
export interface LinhaRebanho {
  id: number;
  numero_animal: string | null;
  nome_animal: string | null;
  sexo: string | null;
  pai_id: number | null;
  mae_id: number | null;
  partos: number | null;
  categoria: string | null;
  status: string | null;
}

export interface LinhaLactacao {
  id: number;
  animal_id: number;
  data_inicio: string | null;
  data_fim: string | null;
  dias_em_lactacao: number | null;
  total_leite: number | null;
  media_leite: number | null;
  media_corrigida: number | null;
  confianca_inferencia: string | null;
}

/** "2026-05-12" => 20260512. */
export function diaDeIso(iso: string | null | undefined): number | null {
  const m = (iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]) : null;
}

function normalizar(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function mapAnimais(linhas: LinhaRebanho[], nomeCategoria: Map<string, string>): AnimalApp[] {
  return linhas.map((r) => {
    const sexo = normalizar(r.sexo);
    return {
      id: r.id,
      numero: r.numero_animal?.trim() || null,
      nome: r.nome_animal?.trim() || null,
      sexo: sexo.startsWith('m') ? 'macho' : sexo.startsWith('f') ? 'femea' : null,
      paiId: r.pai_id,
      maeId: r.mae_id,
      partos: r.partos,
      categoria: r.categoria ? (nomeCategoria.get(r.categoria) ?? null) : null,
      ativo: normalizar(r.status) === 'ativo',
    };
  });
}

export function mapLactacoes(linhas: LinhaLactacao[]): LactacaoApp[] {
  return linhas.map((r) => {
    const c = (r.confianca_inferencia ?? '').toUpperCase();
    return {
      id: r.id,
      animalId: r.animal_id,
      inicio: diaDeIso(r.data_inicio),
      fim: diaDeIso(r.data_fim),
      dias: r.dias_em_lactacao,
      total: r.total_leite,
      media: r.media_leite,
      corrigida: r.media_corrigida,
      confianca: c === 'DEFINITIVO' || c === 'INFERIDO' || c === 'ESTIMATIVA' ? c : 'OUTRA',
    };
  });
}

// ---------------------------------------------------------------- regras

const BAIXAS = new Set(['venda', 'descartado', 'obito']);

export function ehBaixa(a: Pick<AnimalApp, 'categoria'>): boolean {
  return BAIXAS.has(normalizar(a.categoria));
}

/** Reprodutor do plantel atual: categoria "reprodutor" e ativo. */
export function noPlantel(a: Pick<AnimalApp, 'categoria' | 'ativo'>): boolean {
  return a.ativo && normalizar(a.categoria) === 'reprodutor';
}

export function comLeite(l: Pick<LactacaoApp, 'total' | 'media'>): boolean {
  return (l.total ?? 0) > 0 && (l.media ?? 0) > 0;
}

/** Média diária da lactação já corrigida pela ordem de parto; sem correção, a bruta. */
export function mediaCorrigidaDe(l: Pick<LactacaoApp, 'media' | 'corrigida'>): number {
  return (l.corrigida ?? 0) > 0 ? l.corrigida! : (l.media ?? 0);
}

function media(xs: number[]): number | null {
  return xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;
}

function arred(n: number | null, casas = 2): number | null {
  if (n == null) return null;
  const f = 10 ** casas;
  return Math.round(n * f) / f;
}

export interface Filha {
  animal: AnimalApp;
  /** Encerradas, da mais antiga para a mais recente. */
  lactacoes: LactacaoApp[];
}

export interface Resumo {
  filhas: number;
  lactacoes: number;
  comLeite: number;
  semLeite: number;
  definitivas: number;
  inferidas: number;
  estimadas: number;
  /** L/dia, corrigida pela ordem de parto (média das médias por filha). */
  mediaCorrigida: number | null;
  /** L/dia, bruta (média das médias por filha). */
  mediaBruta: number | null;
  /** L por lactação (média direta). */
  acumuladoMedio: number | null;
  diasMedios: number | null;
  /** Média de `partos` das filhas. */
  partosMedios: number | null;
  /** Filhas vendidas, descartadas ou mortas. */
  baixas: number;
}

export function resumir(filhas: Filha[]): Resumo {
  const todas = filhas.flatMap((f) => f.lactacoes);
  const leite = todas.filter(comLeite);
  const porFilha = filhas.map((f) => f.lactacoes.filter(comLeite)).filter((ls) => ls.length > 0);
  const partos = filhas.map((f) => f.animal.partos).filter((p): p is number => p != null);
  return {
    filhas: filhas.length,
    lactacoes: todas.length,
    comLeite: leite.length,
    semLeite: todas.length - leite.length,
    definitivas: todas.filter((l) => l.confianca === 'DEFINITIVO').length,
    inferidas: todas.filter((l) => l.confianca === 'INFERIDO').length,
    estimadas: todas.filter((l) => l.confianca === 'ESTIMATIVA').length,
    mediaCorrigida: arred(media(porFilha.map((ls) => media(ls.map(mediaCorrigidaDe))!))),
    mediaBruta: arred(media(porFilha.map((ls) => media(ls.map((l) => l.media ?? 0))!))),
    acumuladoMedio: arred(media(leite.map((l) => l.total ?? 0)), 1),
    diasMedios: arred(media(leite.map((l) => l.dias ?? 0).filter((d) => d > 0)), 0),
    partosMedios: arred(media(partos), 1),
    baixas: filhas.filter((f) => ehBaixa(f.animal)).length,
  };
}

export interface Filtros {
  /** Só lactações DEFINITIVAS (sem as inferidas e estimadas). */
  soDefinitivas: boolean;
}

export interface GrupoReprodutor {
  paiId: number;
  filhas: Filha[];
}

/**
 * Agrupa as lactações encerradas por reprodutor (pai da filha), respeitando o
 * filtro. Só entram fêmeas com pai informado e ao menos uma lactação que passe
 * no filtro. Ordem das filhas: número do animal.
 */
export function agruparPorReprodutor(animais: AnimalApp[], lactacoes: LactacaoApp[], filtros: Filtros): GrupoReprodutor[] {
  const porId = new Map(animais.map((a) => [a.id, a]));
  const daFilha = new Map<number, LactacaoApp[]>();
  for (const l of lactacoes) {
    if (l.fim == null) continue;
    if (filtros.soDefinitivas && l.confianca !== 'DEFINITIVO') continue;
    daFilha.set(l.animalId, [...(daFilha.get(l.animalId) ?? []), l]);
  }
  const grupos = new Map<number, Filha[]>();
  for (const [animalId, ls] of daFilha) {
    const filha = porId.get(animalId);
    if (!filha || filha.sexo !== 'femea' || filha.paiId == null) continue;
    ls.sort((a, b) => (a.inicio ?? 0) - (b.inicio ?? 0));
    grupos.set(filha.paiId, [...(grupos.get(filha.paiId) ?? []), { animal: filha, lactacoes: ls }]);
  }
  return [...grupos.entries()].map(([paiId, filhas]) => ({
    paiId,
    filhas: filhas.sort((a, b) => (a.animal.numero ?? '').localeCompare(b.animal.numero ?? '')),
  }));
}

export interface LinhaReprodutor {
  paiId: number;
  numero: string | null;
  nome: string | null;
  noPlantel: boolean;
  paiNome: string | null;
  paiNumero: string | null;
  maeNome: string | null;
  maeNumero: string | null;
  resumo: Resumo;
}

/** Ranking: uma linha por reprodutor, com o resumo das filhas. */
export function ranking(animais: AnimalApp[], lactacoes: LactacaoApp[], filtros: Filtros): LinhaReprodutor[] {
  const porId = new Map(animais.map((a) => [a.id, a]));
  return agruparPorReprodutor(animais, lactacoes, filtros)
    .map((g) => {
      const pai = porId.get(g.paiId);
      const avo = pai?.paiId != null ? porId.get(pai.paiId) : undefined;
      const ava = pai?.maeId != null ? porId.get(pai.maeId) : undefined;
      return {
        paiId: g.paiId,
        numero: pai?.numero ?? null,
        nome: pai?.nome ?? null,
        noPlantel: pai ? noPlantel(pai) : false,
        paiNome: avo?.nome ?? null,
        paiNumero: avo?.numero ?? null,
        maeNome: ava?.nome ?? null,
        maeNumero: ava?.numero ?? null,
        resumo: resumir(g.filhas),
      };
    })
    .sort((a, b) => b.resumo.filhas - a.resumo.filhas || (a.numero ?? '').localeCompare(b.numero ?? ''));
}

/** Número com casas fixas em pt-BR ("2,90"), para as colunas não dançarem entre "2,9" e "3,05". */
export function fixo(n: number | null | undefined, casas = 2): string {
  return n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** Texto curto do reprodutor: nome, ou o número quando não tem nome cadastrado. */
export function rotuloReprodutor(r: Pick<LinhaReprodutor, 'nome' | 'numero' | 'paiId'>): string {
  return r.nome ?? r.numero ?? `Reprodutor ${r.paiId}`;
}

export const ROTULO_CONFIANCA: Record<Confianca, string> = {
  DEFINITIVO: 'Definitiva',
  INFERIDO: 'Inferida',
  ESTIMATIVA: 'Estimada',
  OUTRA: 'Outra',
};

/** "12/05/2025 a 12/05/2026". */
export function periodoLactacao(l: Pick<LactacaoApp, 'inicio' | 'fim'>): string {
  return `${formatDia(l.inicio)} a ${formatDia(l.fim)}`;
}

// ---------------------------------------------------------------- recorte para o navegador

/**
 * O que a tela realmente precisa: filhas com lactação encerrada, seus
 * reprodutores e os pais/mães desses reprodutores. O resto do rebanho (1.700
 * animais) não precisa trafegar.
 */
export function recortar(animais: AnimalApp[], lactacoes: LactacaoApp[]): { animais: AnimalApp[]; lactacoes: LactacaoApp[] } {
  const porId = new Map(animais.map((a) => [a.id, a]));
  const comLactacao = new Set(lactacoes.filter((l) => l.fim != null).map((l) => l.animalId));
  const manter = new Set<number>();
  for (const id of comLactacao) {
    const filha = porId.get(id);
    if (!filha || filha.sexo !== 'femea' || filha.paiId == null) continue;
    manter.add(id);
    manter.add(filha.paiId);
    const pai = porId.get(filha.paiId);
    if (pai?.paiId != null) manter.add(pai.paiId);
    if (pai?.maeId != null) manter.add(pai.maeId);
  }
  return {
    animais: animais.filter((a) => manter.has(a.id)),
    lactacoes: lactacoes.filter((l) => manter.has(l.animalId) && porId.get(l.animalId)?.sexo === 'femea'),
  };
}
