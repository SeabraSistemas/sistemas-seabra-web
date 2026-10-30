import { calculavel } from '@/lib/nutricao/alimentos';
import {
  NUTRIENTES,
  type Alimento,
  type EntradaDieta,
  type ItemDieta,
  type KgNutrientes,
  type Nutriente,
  type SlotDieta,
} from '@/lib/nutricao/tipos';

/**
 * Balanço da dieta — a conta do Formulador de Dietas do Silas Greca, com os
 * defeitos 1, 2, 3, 4, 8 e 10 do documento de engenharia reversa corrigidos:
 *  1. os 3 volumosos (e o pasto) entram TODOS no volumoso total, no FDN e no custo;
 *  2. o concentrado é calculado em base de matéria SECA (nutriente ÷ MS);
 *  3. "FDN do volumoso" é o FDN do volumoso em % da MS dele; a fração do FDN
 *     da dieta que vem do volumoso tem nome próprio;
 *  4. rótulos certos (PB é PB, P é P);
 *  8. valores suspeitos do banco ficam como estão, com aviso (ver alimentos.ts);
 * 10. (o botão EXIGÊNCIAS que não abria nada não tem equivalente aqui.)
 */

const zeros = (): KgNutrientes => ({ pb: 0, ndt: 0, fdn: 0, ca: 0, p: 0, ee: 0, mm: 0, cnf: 0, amido: 0 });

export type LinhaDieta = {
  slot: SlotDieta;
  alimento: Alimento;
  kgMn: number;
  kgMs: number;
  /** kg de cada nutriente que o item traz por dia. */
  kg: KgNutrientes;
  /** R$/dia; null se o alimento não tem preço. */
  custo: number | null;
  /** % do total da dieta em matéria natural. */
  pctMn: number;
  /** % do total da dieta na matéria seca. */
  pctMs: number;
  /** Só no concentrado: % do concentrado em matéria natural (a fórmula da mistura). */
  pctConcentradoMn: number | null;
};

export type BlocoDieta = {
  kgMn: number;
  kgMs: number;
  kg: KgNutrientes;
  /** Concentração de cada nutriente na MS do bloco (fração); null se o bloco não tem MS. */
  conc: Record<Nutriente, number | null>;
  /** Soma dos itens COM preço, R$/dia. */
  custoDia: number;
  /** false se algum item do bloco não tem preço (o custo sai subestimado). */
  custoCompleto: boolean;
  /** R$ por kg de matéria natural / de matéria seca do bloco. */
  custoKgMn: number | null;
  custoKgMs: number | null;
};

export type FaixaCaP = 0 | 1 | 2 | 3;

export const FAIXAS_CA_P = [
  { faixa: 0 as FaixaCaP, rotulo: 'abaixo de 1,95' },
  { faixa: 1 as FaixaCaP, rotulo: '1,95 a 2,5' },
  { faixa: 2 as FaixaCaP, rotulo: '2,5 a 3' },
  { faixa: 3 as FaixaCaP, rotulo: 'acima de 3' },
];

/** Faixas do formulador: < 1,95 | 1,95–2,5 | 2,5–3 | > 3 (o limite inferior pertence à faixa de cima). */
export function faixaCaP(razao: number): FaixaCaP {
  if (razao < 1.95) return 0;
  if (razao < 2.5) return 1;
  if (razao <= 3) return 2;
  return 3;
}

export type ResultadoDieta = {
  linhas: LinhaDieta[];
  total: BlocoDieta;
  /** Pasto + volumosos do cocho. */
  volumoso: BlocoDieta;
  concentrado: BlocoDieta;
  /** FDN do volumoso em % da MS do volumoso (defeito 3). */
  fdnVolumosoPctMs: number | null;
  /** Fração do FDN total da dieta que vem do volumoso. */
  fdnDaDietaVemDoVolumoso: number | null;
  /** Fração da MS da dieta que é volumoso. */
  volumosoNaMs: number | null;
  caP: { razao: number; faixa: FaixaCaP } | null;
  avisos: string[];
};

function bloco(linhas: LinhaDieta[]): BlocoDieta {
  const kg = zeros();
  let kgMn = 0;
  let kgMs = 0;
  let custoDia = 0;
  let custoCompleto = true;
  for (const l of linhas) {
    kgMn += l.kgMn;
    kgMs += l.kgMs;
    for (const n of NUTRIENTES) kg[n] += l.kg[n];
    if (l.custo == null) custoCompleto = false;
    else custoDia += l.custo;
  }
  const conc = Object.fromEntries(NUTRIENTES.map((n) => [n, kgMs > 0 ? kg[n] / kgMs : null])) as Record<Nutriente, number | null>;
  return {
    kgMn,
    kgMs,
    kg,
    conc,
    custoDia,
    custoCompleto,
    custoKgMn: kgMn > 0 ? custoDia / kgMn : null,
    custoKgMs: kgMs > 0 ? custoDia / kgMs : null,
  };
}

function itensValidos(itens: ItemDieta[], slot: SlotDieta, banco: Alimento[], avisos: string[]): { slot: SlotDieta; alimento: Alimento; kgMn: number }[] {
  const saida: { slot: SlotDieta; alimento: Alimento; kgMn: number }[] = [];
  for (const it of itens) {
    if (!it.alimentoId || !(it.kgMn > 0)) continue;
    const alimento = banco.find((a) => a.id === it.alimentoId);
    if (!alimento) {
      avisos.push(`Alimento "${it.alimentoId}" não existe mais no banco: ignorado.`);
      continue;
    }
    if (!calculavel(alimento)) {
      avisos.push(`${alimento.nome}: sem matéria seca no banco, ficou fora do cálculo. Preencha na aba Banco.`);
      continue;
    }
    saida.push({ slot, alimento, kgMn: it.kgMn });
  }
  return saida;
}

export function calcularDieta(entrada: EntradaDieta, banco: Alimento[]): ResultadoDieta {
  const avisos: string[] = [];
  const brutos = [
    ...itensValidos(entrada.pasto ? [entrada.pasto] : [], 'pasto', banco, avisos),
    ...itensValidos(entrada.volumosos, 'volumoso', banco, avisos),
    ...itensValidos(entrada.concentrado, 'concentrado', banco, avisos),
  ];

  const parciais = brutos.map(({ slot, alimento, kgMn }) => {
    const kgMs = kgMn * (alimento.ms as number);
    const kg = zeros();
    for (const n of NUTRIENTES) kg[n] = kgMs * (alimento[n] ?? 0);
    return { slot, alimento, kgMn, kgMs, kg, custo: alimento.preco == null ? null : kgMn * alimento.preco };
  });

  const totalMn = parciais.reduce((s, l) => s + l.kgMn, 0);
  const totalMs = parciais.reduce((s, l) => s + l.kgMs, 0);
  const concMn = parciais.filter((l) => l.slot === 'concentrado').reduce((s, l) => s + l.kgMn, 0);

  const linhas: LinhaDieta[] = parciais.map((l) => ({
    ...l,
    pctMn: totalMn > 0 ? (l.kgMn / totalMn) * 100 : 0,
    pctMs: totalMs > 0 ? (l.kgMs / totalMs) * 100 : 0,
    pctConcentradoMn: l.slot === 'concentrado' && concMn > 0 ? (l.kgMn / concMn) * 100 : null,
  }));

  const total = bloco(linhas);
  const volumoso = bloco(linhas.filter((l) => l.slot !== 'concentrado'));
  const concentrado = bloco(linhas.filter((l) => l.slot === 'concentrado'));

  // Avisos de dado faltante só dos alimentos que entraram (o resto está na aba Banco).
  const usados = new Map(linhas.map((l) => [l.alimento.id, l.alimento]));
  for (const a of usados.values()) {
    if (a.grupo === 'suplemento') continue;
    const faltam = (['pb', 'ndt', 'fdn', 'ca', 'p'] as const).filter((n) => a[n] == null);
    if (faltam.length > 0) avisos.push(`${a.nome}: sem ${faltam.map((n) => n.toUpperCase()).join(', ')} no banco — contado como zero.`);
  }
  const semPreco = [...usados.values()].filter((a) => a.preco == null).map((a) => a.nome);
  if (semPreco.length > 0) avisos.push(`Sem preço: ${semPreco.join(', ')}. O custo está incompleto (só soma o que tem preço).`);

  const caP = total.conc.ca != null && total.conc.p != null && total.conc.p > 0 ? { razao: total.conc.ca / total.conc.p, faixa: faixaCaP(total.conc.ca / total.conc.p) } : null;

  return {
    linhas,
    total,
    volumoso,
    concentrado,
    fdnVolumosoPctMs: volumoso.conc.fdn,
    fdnDaDietaVemDoVolumoso: total.kg.fdn > 0 ? volumoso.kg.fdn / total.kg.fdn : null,
    volumosoNaMs: total.kgMs > 0 ? volumoso.kgMs / total.kgMs : null,
    caP,
    avisos,
  };
}

export type ItemLote = { alimento: Alimento; pctMn: number; kgMn: number };

/** Fórmula do concentrado: % de cada ingrediente (matéria natural) e os kg para um lote de mistura. */
export function formulaDoConcentrado(res: ResultadoDieta, loteKg: number): ItemLote[] {
  return res.linhas
    .filter((l) => l.slot === 'concentrado' && l.pctConcentradoMn != null)
    .map((l) => ({ alimento: l.alimento, pctMn: l.pctConcentradoMn as number, kgMn: ((l.pctConcentradoMn as number) / 100) * loteKg }));
}
