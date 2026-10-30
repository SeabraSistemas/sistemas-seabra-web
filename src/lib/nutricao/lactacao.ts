import type { Exigencia } from '@/lib/nutricao/tipos';

/**
 * Exigência líquida de lactação — Rodrigues, L.; Spina, J.R.; Teixeira, I.A.M.A.;
 * Dias, A.C.; Sanches, A.; Resende, K.T. Produção, composição do leite e
 * exigências nutricionais de cabras Saanen em diferentes ordens de lactação.
 * Acta Scientiarum. Animal Sciences 28(4): 447–452, 2006 (Tabela 6).
 *
 * X1 = leite (kg/dia); X2 = gordura (%); X3 = proteína (%); X4 = lactose (%).
 * É regressão de 20 cabras Saanen (10 de 1ª lactação), semiconfinamento, com
 * produção média de ~2,2–2,5 kg/dia: longe dessa faixa o intercepto negativo
 * tira o sentido da conta (energia negativa com pouco leite).
 */
export type OrdemLactacao = 'primeira' | 'demais';

export const NOME_ORDEM: Record<OrdemLactacao, string> = { primeira: '1ª lactação', demais: 'Demais lactações' };

/** Faixa de leite do estudo (kg/dia) dentro da qual a equação é confiável. */
export const FAIXA_LEITE_RODRIGUES = { min: 1.8, max: 2.6 } as const;

/** Composição média do leite no estudo, por ordem de lactação (valores de partida do formulário). */
export const COMPOSICAO_MEDIA_RODRIGUES: Record<OrdemLactacao, { gorduraPct: number; proteinaPct: number; lactosePct: number }> = {
  primeira: { gorduraPct: 3.85, proteinaPct: 2.56, lactosePct: 4.14 },
  demais: { gorduraPct: 3.34, proteinaPct: 2.59, lactosePct: 3.96 },
};

export type EntradaLeite = { ordem: OrdemLactacao; leiteKg: number; gorduraPct: number; proteinaPct: number; lactosePct: number };

const ENERGIA: Record<OrdemLactacao, { b0: number; leite: number; gordura: number; proteina: number; lactose: number }> = {
  primeira: { b0: -1283.0345, leite: 662.4238, gordura: 190.87, proteina: 125.0398, lactose: 63.8442 },
  demais: { b0: -1379.2126, leite: 646.1161, gordura: 215.8351, proteina: 151.0069, lactose: 54.2662 },
};

const PROTEINA: Record<OrdemLactacao, { b0: number; leite: number; proteina: number }> = {
  primeira: { b0: -52.8542, leite: 25.0206, proteina: 21.1184 },
  demais: { b0: -57.4692, leite: 25.7281, proteina: 22.4334 },
};

/** Energia líquida de lactação, kcal/dia. */
export function energiaLiquidaKcal(e: EntradaLeite): number {
  const c = ENERGIA[e.ordem];
  return c.b0 + c.leite * e.leiteKg + c.gordura * e.gorduraPct + c.proteina * e.proteinaPct + c.lactose * e.lactosePct;
}

/** Proteína líquida de lactação, g/dia. */
export function proteinaLiquidaG(e: EntradaLeite): number {
  const c = PROTEINA[e.ordem];
  return c.b0 + c.leite * e.leiteKg + c.proteina * e.proteinaPct;
}

export type ResultadoRodrigues = {
  energiaKcal: number;
  proteinaG: number;
  /** Por kg de leite produzido. */
  energiaKcalPorKg: number | null;
  proteinaGPorKg: number | null;
  dentroDaFaixa: boolean;
  avisos: string[];
};

export function calcularRodrigues(e: EntradaLeite): ResultadoRodrigues {
  const energiaKcal = energiaLiquidaKcal(e);
  const proteinaG = proteinaLiquidaG(e);
  const avisos: string[] = [];
  const { min, max } = FAIXA_LEITE_RODRIGUES;
  const dentroDaFaixa = e.leiteKg >= min && e.leiteKg <= max;
  if (!(e.leiteKg > 0)) {
    avisos.push('Sem leite informado: não há exigência de lactação para calcular.');
  } else if (!dentroDaFaixa) {
    avisos.push(
      `Leite de ${fmt(e.leiteKg)} kg/dia fora da faixa do estudo (≈ ${fmt(min)} a ${fmt(max)} kg/dia): a equação foi ajustada com cabras Saanen nessa faixa e extrapola mal. Compare com o NRC.`,
    );
  }
  if (energiaKcal < 0 || proteinaG < 0) avisos.push('Resultado negativo: sem sentido biológico (o intercepto da equação domina com pouco leite).');
  return {
    energiaKcal,
    proteinaG,
    energiaKcalPorKg: e.leiteKg > 0 ? energiaKcal / e.leiteKg : null,
    proteinaGPorKg: e.leiteKg > 0 ? proteinaG / e.leiteKg : null,
    dentroDaFaixa,
    avisos,
  };
}

function fmt(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

// ── Consumo de matéria seca ────────────────────────────────────────────────

/**
 * Planilha "Consumo de MS Caprinos" (fonte não citada): o texto diz
 * `0,522 + 0,0135·PV`, mas a célula usava 0,552 (diferença de 0,03 kg/dia).
 */
export const CMS_MANTENCA_INTERCEPTO_TEXTO = 0.522;
export const CMS_MANTENCA_INTERCEPTO_PLANILHA = 0.552;

/** Fêmeas prenhes e em lactação: `0,062·PV^0,75 + 0,305·leite` (kg MS/dia). */
export function consumoMsLactacao(pesoKg: number, leiteKg: number): number {
  return 0.062 * Math.pow(pesoKg, 0.75) + 0.305 * leiteKg;
}

/** Adultos em mantença: `0,522 + 0,0135·PV` (kg MS/dia); `intercepto` permite reproduzir a célula errada. */
export function consumoMsMantenca(pesoKg: number, intercepto: number = CMS_MANTENCA_INTERCEPTO_TEXTO): number {
  return intercepto + 0.0135 * pesoKg;
}

export type ConsumoMs = {
  equacao: 'lactacao' | 'mantenca';
  cmsKg: number;
  /** Mantença com o intercepto 0,552 da planilha, para mostrar a diferença. */
  cmsKgPlanilha: number | null;
};

/** `prenheOuLactacao`: usa a equação com leite; senão, a de mantença. */
export function consumoMsEstimado(pesoKg: number, leiteKg: number, prenheOuLactacao: boolean): ConsumoMs {
  if (prenheOuLactacao) return { equacao: 'lactacao', cmsKg: consumoMsLactacao(pesoKg, leiteKg), cmsKgPlanilha: null };
  return {
    equacao: 'mantenca',
    cmsKg: consumoMsMantenca(pesoKg),
    cmsKgPlanilha: consumoMsMantenca(pesoKg, CMS_MANTENCA_INTERCEPTO_PLANILHA),
  };
}

/**
 * Exigência "Rodrigues + consumo estimado" na forma comum às três fontes. A
 * equação dá só a parte LÍQUIDA da lactação (energia e proteína), não a
 * exigência total em NDT/PB/Ca/P: por isso os nutrientes ficam sem valor e a
 * dieta só é comparada no consumo de MS. Converter líquido em NDT/PB da dieta
 * pede fatores de eficiência que a fonte não traz.
 */
export function exigenciaRodrigues(consumo: ConsumoMs, r: ResultadoRodrigues | null, ordem: OrdemLactacao): Exigencia {
  const vazio = { frac: null, absoluto: null };
  return {
    fonte: 'rodrigues',
    rotulo: `Rodrigues et al. 2006 · ${NOME_ORDEM[ordem]}`,
    cmsKg: consumo.cmsKg,
    ndt: vazio,
    pb: vazio,
    ca: vazio,
    p: vazio,
    avisos: r?.avisos ?? [],
  };
}
