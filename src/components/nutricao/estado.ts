import { SEM_EDICOES, type EdicoesBanco } from '@/lib/nutricao/alimentos';
import { COMPOSICAO_MEDIA_RODRIGUES, type OrdemLactacao } from '@/lib/nutricao/lactacao';
import type { Tolerancia } from '@/lib/nutricao/comparacao';
import { TOLERANCIA_FORMULADOR } from '@/lib/nutricao/comparacao';

/**
 * Estado do laboratório. Tudo vive no navegador (localStorage): nada grava no
 * Supabase. A chave leva versão — mudou o formato, sobe o número e o estado
 * antigo é descartado em vez de quebrar a tela.
 */
export const CHAVE_ARMAZENAMENTO = 'nutricao-laboratorio:v1';

export type Aba = 'exigencia' | 'dieta' | 'comparador' | 'banco';

export type EstadoAnimal = {
  pesoKg: number | null;
  leiteKg: number | null;
  categoriaId: string;
  faseNrc: string;
  serieNrcId: string;
  degrau: 'abaixo' | 'acima';
  ordem: OrdemLactacao;
  gorduraPct: number | null;
  proteinaPct: number | null;
  lactosePct: number | null;
};

export type ItemEstado = { alimentoId: string; kgMn: number | null };

export type EstadoDieta = {
  pasto: ItemEstado;
  volumosos: ItemEstado[];
  concentrado: ItemEstado[];
  loteKg: number | null;
};

export type EstadoComparador = {
  a: string;
  b: string;
  /** Preço digitado no comparador; null = usa o do banco. */
  precoA: number | null;
  precoB: number | null;
};

export type Rascunho = { id: string; nome: string; salvoEm: string; animal: EstadoAnimal; dieta: EstadoDieta };

/** A faixa verde: decidida pelo produtor em 30/10/2026 (±5% da exigência); as outras ficam à escolha. */
export type PredefTolerancia = 'cinco' | 'dez' | 'formulador';

export const TOLERANCIAS: Record<PredefTolerancia, { rotulo: string; valor: Tolerancia }> = {
  cinco: { rotulo: '±5%', valor: { modo: 'relativa', pct: 5 } },
  dez: { rotulo: '±10%', valor: { modo: 'relativa', pct: 10 } },
  formulador: { rotulo: '±0,1 pp (formulador)', valor: TOLERANCIA_FORMULADOR },
};

export type EstadoLab = {
  aba: Aba;
  animal: EstadoAnimal;
  dieta: EstadoDieta;
  comparador: EstadoComparador;
  edicoes: EdicoesBanco;
  tolerancia: PredefTolerancia;
  mostrarQuantidade: boolean;
  rascunhos: Rascunho[];
};

export function animalPadrao(): EstadoAnimal {
  return {
    pesoKg: 60,
    leiteKg: 3,
    categoriaId: 'cabra-em-lactacao',
    faseNrc: 'ordenha-meio',
    serieNrcId: 'ordenha-meio/baixa-producao',
    degrau: 'abaixo',
    ordem: 'demais',
    gorduraPct: COMPOSICAO_MEDIA_RODRIGUES.demais.gorduraPct,
    proteinaPct: COMPOSICAO_MEDIA_RODRIGUES.demais.proteinaPct,
    lactosePct: COMPOSICAO_MEDIA_RODRIGUES.demais.lactosePct,
  };
}

/** Dieta de exemplo (a mesma conferida à mão nos testes) — o ponto de partida da tela. */
export function dietaExemplo(): EstadoDieta {
  return {
    pasto: { alimentoId: '', kgMn: null },
    volumosos: [{ alimentoId: 'silagem-de-milho', kgMn: 3 }],
    concentrado: [
      { alimentoId: 'milho-moido-fuba', kgMn: 0.4 },
      { alimentoId: 'farelo-de-soja', kgMn: 0.3 },
    ],
    loteKg: 100,
  };
}

export function dietaVazia(): EstadoDieta {
  return { pasto: { alimentoId: '', kgMn: null }, volumosos: [], concentrado: [], loteKg: 100 };
}

export function estadoPadrao(): EstadoLab {
  return {
    aba: 'exigencia',
    animal: animalPadrao(),
    dieta: dietaExemplo(),
    comparador: { a: 'milho-moido-fuba', b: 'farelo-de-soja', precoA: null, precoB: null },
    edicoes: SEM_EDICOES,
    tolerancia: 'cinco',
    mostrarQuantidade: false,
    rascunhos: [],
  };
}

function objeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Lê o estado salvo; qualquer coisa fora do formato volta ao padrão (nunca lança). */
export function carregarEstado(): EstadoLab {
  const padrao = estadoPadrao();
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!bruto) return padrao;
    const salvo: unknown = JSON.parse(bruto);
    if (!objeto(salvo)) return padrao;
    return {
      ...padrao,
      ...(salvo as Partial<EstadoLab>),
      animal: { ...padrao.animal, ...(objeto(salvo.animal) ? (salvo.animal as Partial<EstadoAnimal>) : {}) },
      dieta: objeto(salvo.dieta) && Array.isArray((salvo.dieta as EstadoDieta).volumosos) ? { ...padrao.dieta, ...(salvo.dieta as EstadoDieta) } : padrao.dieta,
      comparador: { ...padrao.comparador, ...(objeto(salvo.comparador) ? (salvo.comparador as Partial<EstadoComparador>) : {}) },
      edicoes: objeto(salvo.edicoes) && objeto((salvo.edicoes as EdicoesBanco).alteracoes) && Array.isArray((salvo.edicoes as EdicoesBanco).criados) ? (salvo.edicoes as EdicoesBanco) : SEM_EDICOES,
      rascunhos: Array.isArray(salvo.rascunhos) ? (salvo.rascunhos as Rascunho[]) : [],
    };
  } catch {
    return padrao;
  }
}

export function salvarEstado(estado: EstadoLab): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(estado));
  } catch {
    // modo privado / cota cheia: o laboratório segue funcionando, só não lembra
  }
}
