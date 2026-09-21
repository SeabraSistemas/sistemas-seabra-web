/**
 * Custo de formação por categoria (bovino de corte) — réplica adaptada do
 * motor de "custo de formação" do seabra-app-main (lá é só pra caprino/
 * ovino de corte e produz R$/kg vivo; aqui produz R$/@, usando
 * `Categoria@` como peso-alvo de cada categoria — decisão do Felipe,
 * 16/09/2026).
 *
 * Fórmula (por fase = uma categoria do funil):
 *   custoDietaDia = Σ, por TIPO (Concentrado/Volumoso/Sal mineral):
 *                     (Σ percentual × valor/kg dos insumos daquele tipo) × consumo do tipo (kg/dia)
 *                   — ALINHADO ao "Nutrição & Custo" do seabra-app-main (16/09/2026, pedido do
 *                   Felipe): lá a dieta é % de cada insumo DENTRO do seu tipo (não kg/dia
 *                   direto), e o consumo total (kg/dia) de cada tipo é um campo à parte
 *                   (`ConsumoCategoria`). Antes desta mudança o FI_FCG usava kg/dia direto por
 *                   insumo — matematicamente idêntico (kg/dia = percentual × consumo do tipo),
 *                   mas o usuário pensa em "quanto como no total" + "qual a mistura", não em
 *                   kg exato de cada insumo já calculado de cabeça.
 *   custoFixoDia  = custo fixo do mês / 30 / efetivo do rebanho (ver `custoFixoDiaPorCabeca`)
 *   dias          = (pesoFinalKg − pesoInicialKg) / GMD(kg/dia) da categoria
 *   custoFase     = (custoDietaDia + custoFixoDia) × dias
 *   custoAcumulado = soma das fases anteriores + custoFase
 * No fim da cadeia: custoPorArroba = custoAcumulado / Média@ da categoria final.
 *
 * A categoria de ENTRADA de cada cadeia (Bezerro/Bezerra) sempre tem
 * custoFase = 0 — não há categoria anterior rastreada (nascimento não tem
 * peso/@ próprio em `Categoria@`), então o "custo de formação" só é
 * calculado A PARTIR da entrada no funil, nunca antes dela.
 */
import { media } from '@/lib/painel/agregacao';
import { diasEntre } from '@/lib/painel/format';
import { custosNoPeriodo } from '@/lib/fi-fcg/custos';
import {
  TIPOS_INSUMO,
  type CategoriaArroba,
  type ConsumoCategoria,
  type Custo,
  type DiaCompacto,
  type GmdCategoria,
  type Insumo,
  type ItemDieta,
  type MarcoIdade,
  type RegPesagem,
  type RegRebanho,
} from '@/lib/fi-fcg/types';

export interface FaseFunil {
  categoria: string;
  /** null = fase de entrada no funil (sem categoria anterior rastreada). */
  anterior: string | null;
}

/**
 * As 3 cadeias do funil bovino, pedidas pelo Felipe (16/09/2026): macho vai
 * pra corte (Bezerro → Garrote → Boi) ou é selecionado reprodutor (Bezerro
 * → Touro); fêmea é reposição (Bezerra → Novilha → Vaca). Usa os nomes de
 * `Categoria@` (Bezerro, Bezerra, Garrote, Novilha, Boi, Vaca, Touro) —
 * "Leiteira" fica de fora (não é bovino de corte).
 */
export const CADEIA_MACHO_CORTE: FaseFunil[] = [
  { categoria: 'Bezerro', anterior: null },
  { categoria: 'Garrote', anterior: 'Bezerro' },
  { categoria: 'Boi', anterior: 'Garrote' },
];
export const CADEIA_MACHO_REPRODUTOR: FaseFunil[] = [
  { categoria: 'Bezerro', anterior: null },
  { categoria: 'Touro', anterior: 'Bezerro' },
];
export const CADEIA_FEMEA: FaseFunil[] = [
  { categoria: 'Bezerra', anterior: null },
  { categoria: 'Novilha', anterior: 'Bezerra' },
  { categoria: 'Vaca', anterior: 'Novilha' },
];

export interface Funil {
  nome: string;
  fases: FaseFunil[];
}

export const FUNIS_BOVINO: Funil[] = [
  { nome: 'Macho para corte', fases: CADEIA_MACHO_CORTE },
  { nome: 'Macho reprodutor', fases: CADEIA_MACHO_REPRODUTOR },
  { nome: 'Fêmea de reposição', fases: CADEIA_FEMEA },
];

/** Não está na venda/baixa — mesmo critério de `vivo()` em RebanhoView.tsx / engorda.ts. */
function vivo(a: RegRebanho): boolean {
  return a.categoria !== 'Venda' && a.categoria !== 'Baixa';
}

/** Efetivo do rebanho vivo — `fazenda` null = rebanho inteiro (todas as fazendas). */
export function efetivoVivo(rebanho: RegRebanho[], fazenda: string | null): number {
  return rebanho.filter((a) => vivo(a) && (fazenda == null || a.fazenda === fazenda)).length;
}

/**
 * Custo fixo por cabeça/dia — respeita a Fazenda de cada custo (decisão do
 * Felipe, 16/09/2026): um custo "Geral" (ou sem Fazenda) rateia no efetivo
 * TOTAL do rebanho; um custo de uma Fazenda específica rateia só no efetivo
 * daquela Fazenda. Com `fazenda` null (consolidado), todo custo rateia no
 * efetivo total, sem distinguir. Usa o mês de `hoje` como "custo do mês
 * corrente" (mesma base de `custosNoPeriodo`, que já resolve Mensal/Anual
 * e custo em aberto).
 */
export function custoFixoDiaPorCabeca(
  custos: Custo[],
  rebanho: RegRebanho[],
  fazenda: string | null,
  hoje: DiaCompacto,
): number | null {
  const efetivoTotal = efetivoVivo(rebanho, null);
  if (efetivoTotal === 0) return null;

  if (fazenda == null) {
    return custosNoPeriodo(custos, hoje, hoje, hoje) / 30 / efetivoTotal;
  }

  const custosGerais = custos.filter((c) => !c.fazenda || c.fazenda === 'Geral');
  const geralDia = custosNoPeriodo(custosGerais, hoje, hoje, hoje) / 30 / efetivoTotal;

  const efetivoFazenda = efetivoVivo(rebanho, fazenda);
  if (efetivoFazenda === 0) return geralDia;
  const custosFazenda = custos.filter((c) => c.fazenda === fazenda);
  const fazendaDia = custosNoPeriodo(custosFazenda, hoje, hoje, hoje) / 30 / efetivoFazenda;
  return geralDia + fazendaDia;
}

function insumosPorNome(insumos: Insumo[]): Map<string, Insumo> {
  return new Map(insumos.map((i) => [i.nome, i]));
}

/** Tolerância pra "a % de um tipo fecha 100%" — mesma faixa do seabra-app-main (99-101%, ver DietaSecao). */
export const PERCENTUAL_TOLERANCIA_MIN = 99;
export const PERCENTUAL_TOLERANCIA_MAX = 101;

/** Soma das % cadastradas de um tipo (Concentrado/Volumoso/Sal mineral), pra uma categoria — 100% = mistura completa. */
export function percentualPorTipo(categoria: string, tipo: string, dieta: ItemDieta[], insumos: Insumo[]): number {
  const porNome = insumosPorNome(insumos);
  return dieta
    .filter((d) => d.categoria === categoria && d.insumo != null && porNome.get(d.insumo)?.tipo === tipo)
    .reduce((soma, d) => soma + (d.percentual ?? 0), 0);
}

/**
 * Custo de dieta/dia de uma categoria: soma, por tipo, do preço médio
 * ponderado da mistura (Σ percentual/100 × valor/kg dos insumos daquele
 * tipo) × consumo total do tipo (kg/dia, de `ConsumoCategoria`). Um tipo
 * sem consumo cadastrado (ou 0) simplesmente não contribui — não precisa
 * usar os 3 tipos. null = nenhum tipo rendeu custo (dieta não configurada
 * pra essa categoria).
 */
export function custoDietaDia(
  categoria: string,
  dieta: ItemDieta[],
  insumos: Insumo[],
  consumoCategoria: ConsumoCategoria[],
): number | null {
  const porNome = insumosPorNome(insumos);
  const itensCategoria = dieta.filter((d) => d.categoria === categoria);
  if (itensCategoria.length === 0) return null;

  let total = 0;
  let algumValido = false;
  for (const tipo of TIPOS_INSUMO) {
    const kgDiaTipo = consumoCategoria.find((c) => c.categoria === categoria && c.tipo === tipo)?.kgDia;
    if (kgDiaTipo == null || kgDiaTipo <= 0) continue;

    let valorKgTipo = 0;
    let algumInsumoValido = false;
    for (const item of itensCategoria) {
      if (item.insumo == null || item.percentual == null || item.percentual <= 0) continue;
      const insumo = porNome.get(item.insumo);
      if (insumo?.tipo !== tipo || insumo.valorKg == null) continue;
      valorKgTipo += (item.percentual / 100) * insumo.valorKg;
      algumInsumoValido = true;
    }
    if (!algumInsumoValido) continue;
    total += valorKgTipo * kgDiaTipo;
    algumValido = true;
  }
  return algumValido ? total : null;
}

/**
 * GPD (kg/dia) real médio por categoria — sugestão pra pré-preencher "GPD por
 * Categoria", nunca gravado sozinho. Pedido do Felipe (21/09/2026): usar GPD
 * (ganho desde o NASCIMENTO, `RegPesagem.gpd`), não GMD (`RegRebanho.gmdAtual`,
 * ganho só desde a entrada em engorda) — GMD é volátil (só existe pra quem já
 * entrou no programa de engorda, a minoria do rebanho) e o Funil calcula a
 * formação inteira desde o nascimento, não só a fase de engorda. Usa a
 * pesagem MAIS RECENTE de cada animal (mesmo "atual" que `gmdAtual` media
 * antes), agrupada pela Categoria de HOJE (RebanhoProd — Pesagem não tem
 * Categoria própria).
 */
export function gpdSugeridoPorCategoria(rebanho: RegRebanho[], pesagem: RegPesagem[]): Map<string, number> {
  const categoriaPorId = new Map<string, string>();
  for (const a of rebanho) {
    if (a.categoria != null) categoriaPorId.set(a.id, a.categoria);
  }

  const ultimaPesagemPorId = new Map<string, RegPesagem>();
  for (const p of pesagem) {
    if (p.data == null || p.gpd == null || p.gpd <= 0) continue;
    const atual = ultimaPesagemPorId.get(p.id);
    if (atual == null || (atual.data ?? 0) < p.data) ultimaPesagemPorId.set(p.id, p);
  }

  const porCategoria = new Map<string, number[]>();
  for (const [id, p] of ultimaPesagemPorId) {
    const categoria = categoriaPorId.get(id);
    if (categoria == null) continue;
    if (!porCategoria.has(categoria)) porCategoria.set(categoria, []);
    porCategoria.get(categoria)!.push(p.gpd as number);
  }

  const resultado = new Map<string, number>();
  for (const [categoria, valores] of porCategoria) {
    const m = media(valores);
    if (m != null) resultado.set(categoria, m);
  }
  return resultado;
}

export interface FaseCalculada {
  categoria: string;
  pesoInicialKg: number | null;
  pesoFinalKg: number | null;
  gmdKgDia: number | null;
  dias: number | null;
  custoDietaDia: number | null;
  custoFixoDia: number | null;
  custoFase: number | null;
  custoAcumulado: number | null;
}

export interface FunilCalculado {
  nome: string;
  fases: FaseCalculada[];
  custoTotal: number | null;
  pesoFinalKg: number | null;
  arrobaFinal: number | null;
  custoPorArroba: number | null;
}

function pesoKgDaCategoria(categoria: string, arrobas: Map<string, number>): number | null {
  const m = arrobas.get(categoria);
  return m != null ? m * 15 : null;
}

function calcularFases(
  fases: FaseFunil[],
  insumos: Insumo[],
  dieta: ItemDieta[],
  consumoCategoria: ConsumoCategoria[],
  gmdPorCategoria: Map<string, number>,
  arrobaPorCategoria: Map<string, number>,
  custoFixoDia: number | null,
): FaseCalculada[] {
  const resultado: FaseCalculada[] = [];
  let acumulado = 0;
  let acumuladoValido = true;

  for (const fase of fases) {
    const pesoFinalKg = pesoKgDaCategoria(fase.categoria, arrobaPorCategoria);
    const pesoInicialKg = fase.anterior != null ? pesoKgDaCategoria(fase.anterior, arrobaPorCategoria) : pesoFinalKg;
    const gmdKgDia = gmdPorCategoria.get(fase.categoria) ?? null;
    const dietaDia = custoDietaDia(fase.categoria, dieta, insumos, consumoCategoria);

    let dias: number | null = null;
    let custoFase: number | null = null;
    if (fase.anterior == null) {
      dias = 0;
      custoFase = 0;
    } else if (pesoInicialKg != null && pesoFinalKg != null && gmdKgDia != null && gmdKgDia > 0) {
      dias = Math.max(0, Math.round((pesoFinalKg - pesoInicialKg) / gmdKgDia));
      custoFase = dias * ((dietaDia ?? 0) + (custoFixoDia ?? 0));
    }

    if (custoFase == null) acumuladoValido = false;
    else if (acumuladoValido) acumulado += custoFase;

    resultado.push({
      categoria: fase.categoria,
      pesoInicialKg,
      pesoFinalKg,
      gmdKgDia,
      dias,
      custoDietaDia: dietaDia,
      custoFixoDia,
      custoFase,
      custoAcumulado: acumuladoValido ? acumulado : null,
    });
  }
  return resultado;
}

/**
 * "Retrato do momento" (16/09/2026, pedido do Felipe): diferente do funil
 * acumulado acima (que projeta peso/GMD), este usa a IDADE REAL de cada
 * animal (nascimento => hoje, sempre disponível, nunca depende de GMD
 * cadastrado) × o custo diário atual da categoria — "com a dieta e o
 * efetivo de hoje, quanto custou manter esse animal até agora". Pra cada
 * categoria mostra também os marcos de saída dela (ex.: Bezerro mostra
 * "até Garrote"; Novilha mostra os 2 marcos reprodutivos), calculados à
 * MESMA taxa diária da categoria atual — não é uma reconstrução histórica
 * (não sabemos a dieta que o animal teve no passado), é "quanto custaria
 * alcançar aquele marco, ao custo de hoje".
 */
const MARCOS_POR_CATEGORIA: Record<string, string[]> = {
  Bezerro: ['Bezerro -> Garrote'],
  Garrote: ['Garrote -> Boi'],
  Bezerra: ['Bezerra -> Novilha'],
  Novilha: ['Novilha -> Vaca (1a cobertura)', 'Novilha -> Vaca (1o parto)'],
};

export interface MarcoRetrato {
  nome: string;
  idadeDias: number;
  custoAcumulado: number;
}

export interface RetratoCategoria {
  categoria: string;
  efetivo: number;
  idadeMediaDias: number | null;
  pesoMedioKg: number | null;
  custoDietaDia: number | null;
  custoFixoDia: number | null;
  custoTotalDia: number | null;
  custoAcumuladoHoje: number | null;
  arrobaReferencia: number | null;
  custoPorArrobaReal: number | null;
  custoPorArrobaReferencia: number | null;
  marcos: MarcoRetrato[];
}

export function montarRetratoMomento(
  rebanho: RegRebanho[],
  fazenda: string | null,
  custos: Custo[],
  categoriasArroba: CategoriaArroba[],
  insumos: Insumo[],
  dieta: ItemDieta[],
  consumoCategoria: ConsumoCategoria[],
  marcosIdade: MarcoIdade[],
  hoje: DiaCompacto,
): RetratoCategoria[] {
  const arrobaPorCategoria = new Map<string, number>();
  for (const c of categoriasArroba) if (c.mediaArroba != null) arrobaPorCategoria.set(c.categoria, c.mediaArroba);

  const idadePorMarco = new Map<string, number>();
  for (const m of marcosIdade) if (m.marco != null && m.idadeDias != null) idadePorMarco.set(m.marco, m.idadeDias);

  const custoFixoDia = custoFixoDiaPorCabeca(custos, rebanho, fazenda, hoje);

  const relevantes = rebanho.filter((a) => vivo(a) && (fazenda == null || a.fazenda === fazenda) && a.categoria != null);
  const porCategoria = new Map<string, RegRebanho[]>();
  for (const a of relevantes) {
    const cat = a.categoria as string;
    let lista = porCategoria.get(cat);
    if (!lista) {
      lista = [];
      porCategoria.set(cat, lista);
    }
    lista.push(a);
  }

  const retrato = Array.from(porCategoria.entries(), ([categoria, animais]): RetratoCategoria => {
    const idades = animais
      .map((a) => (a.nascimento != null ? diasEntre(a.nascimento, hoje) : null))
      .filter((v): v is number => v != null);
    const idadeMediaDias = media(idades);
    const pesos = animais.map((a) => a.ultimaPesagemKg).filter((v): v is number => v != null);
    const pesoMedioKg = media(pesos);

    const custoDietaDiaCat = custoDietaDia(categoria, dieta, insumos, consumoCategoria);
    const temCusto = custoDietaDiaCat != null || custoFixoDia != null;
    const custoTotalDia = temCusto ? (custoDietaDiaCat ?? 0) + (custoFixoDia ?? 0) : null;
    const custoAcumuladoHoje = idadeMediaDias != null && custoTotalDia != null ? idadeMediaDias * custoTotalDia : null;

    const arrobaReferencia = arrobaPorCategoria.get(categoria) ?? null;
    const custoPorArrobaReal =
      custoAcumuladoHoje != null && pesoMedioKg != null && pesoMedioKg > 0 ? custoAcumuladoHoje / (pesoMedioKg / 15) : null;
    const custoPorArrobaReferencia =
      custoAcumuladoHoje != null && arrobaReferencia != null && arrobaReferencia > 0
        ? custoAcumuladoHoje / arrobaReferencia
        : null;

    const marcos: MarcoRetrato[] = [];
    for (const nome of MARCOS_POR_CATEGORIA[categoria] ?? []) {
      const idadeDias = idadePorMarco.get(nome);
      if (idadeDias == null || custoTotalDia == null) continue;
      marcos.push({ nome, idadeDias, custoAcumulado: idadeDias * custoTotalDia });
    }

    return {
      categoria,
      efetivo: animais.length,
      idadeMediaDias,
      pesoMedioKg,
      custoDietaDia: custoDietaDiaCat,
      custoFixoDia,
      custoTotalDia,
      custoAcumuladoHoje,
      arrobaReferencia,
      custoPorArrobaReal,
      custoPorArrobaReferencia,
      marcos,
    };
  });

  return retrato.sort((a, b) => b.efetivo - a.efetivo);
}

export function calcularFunis(
  funis: Funil[],
  custos: Custo[],
  rebanho: RegRebanho[],
  fazenda: string | null,
  categoriasArroba: CategoriaArroba[],
  insumos: Insumo[],
  dieta: ItemDieta[],
  consumoCategoria: ConsumoCategoria[],
  gmdCategoria: GmdCategoria[],
  hoje: DiaCompacto,
): FunilCalculado[] {
  const arrobaPorCategoria = new Map<string, number>();
  for (const c of categoriasArroba) if (c.mediaArroba != null) arrobaPorCategoria.set(c.categoria, c.mediaArroba);

  const gmdPorCategoria = new Map<string, number>();
  for (const g of gmdCategoria) if (g.categoria != null && g.gmdKgDia != null) gmdPorCategoria.set(g.categoria, g.gmdKgDia);

  const custoFixoDia = custoFixoDiaPorCabeca(custos, rebanho, fazenda, hoje);

  return funis.map(({ nome, fases }) => {
    const fasesCalc = calcularFases(fases, insumos, dieta, consumoCategoria, gmdPorCategoria, arrobaPorCategoria, custoFixoDia);
    const ultima = fasesCalc[fasesCalc.length - 1] as FaseCalculada | undefined;
    const custoTotal = ultima?.custoAcumulado ?? null;
    const pesoFinalKg = ultima?.pesoFinalKg ?? null;
    const arrobaFinal = arrobaPorCategoria.get(fases[fases.length - 1].categoria) ?? null;
    const custoPorArroba = custoTotal != null && arrobaFinal != null && arrobaFinal > 0 ? custoTotal / arrobaFinal : null;
    return { nome, fases: fasesCalc, custoTotal, pesoFinalKg, arrobaFinal, custoPorArroba };
  });
}
