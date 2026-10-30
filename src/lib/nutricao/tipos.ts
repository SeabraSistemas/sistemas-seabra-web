/**
 * Tipos do motor de nutrição (/nutricao). TypeScript puro, sem React: o motor
 * é escrito para ser portado ao Dart quando o modelo validado for para o app.
 *
 * Convenções: nutrientes do alimento em FRAÇÃO da matéria seca (0,16 = 16%);
 * `ms` em fração da matéria natural; preço em R$/kg de matéria natural;
 * quantidades da dieta em kg de matéria natural (MN) por animal por dia.
 */

export const NUTRIENTES = ['pb', 'ndt', 'fdn', 'ca', 'p', 'ee', 'mm', 'cnf', 'amido'] as const;
export type Nutriente = (typeof NUTRIENTES)[number];

/** Nutrientes que entram na comparação com exigência. */
export const NUTRIENTES_EXIGIDOS = ['ndt', 'pb', 'ca', 'p'] as const;
export type NutrienteExigido = (typeof NUTRIENTES_EXIGIDOS)[number];

export type GrupoAlimento = 'pastagem' | 'volumoso' | 'concentrado' | 'suplemento';

export type Alimento = {
  id: string;
  nome: string;
  grupo: GrupoAlimento;
  /** Fração da matéria natural. */
  ms: number | null;
  pb: number | null;
  ndt: number | null;
  fdn: number | null;
  ca: number | null;
  p: number | null;
  ee: number | null;
  mm: number | null;
  cnf: number | null;
  amido: number | null;
  /** R$/kg de matéria natural. null = sem preço (diferente de R$ 0,00). */
  preco: number | null;
  precoOrigem: 'caprino' | 'ovino' | null;
  /** Aviso que já vinha na fonte (planilha do consultor). */
  avisoFonte: string | null;
};

export type NivelAviso = 'erro' | 'aviso' | 'info';
export type AvisoAlimento = { nivel: NivelAviso; texto: string };

export type CategoriaFormulador = {
  id: string;
  nome: string;
  ndt: number;
  pb: number;
  ca: number;
  p: number;
  cmsKg: number;
};

// ── NRC 2007 ────────────────────────────────────────────────────────────────

export type LinhaNrc = {
  pesoKg: number;
  cmsKg: number;
  ndtKg: number;
  pbG: number;
  caG: number;
  pG: number;
  ndtFrac: number;
  pbFrac: number;
};

export type SerieNrc = {
  /** `fase/nivel`, ex.: `ordenha-meio/media-producao`. */
  id: string;
  fase: string;
  faseNome: string;
  nivel: string;
  /** Só na ordenha: faixa de leite do rótulo (lb/dia) ao longo dos pesos da série. */
  leiteLbDia?: [number, number];
  /** Ordenadas por peso. */
  linhas: LinhaNrc[];
};

// ── Exigência normalizada (a mesma forma para as três fontes) ──────────────

export type FonteExigencia = 'formulador' | 'nrc' | 'rodrigues';

export type ValorExigido = {
  /** Concentração exigida na MS (fração). */
  frac: number | null;
  /** Quantidade diária: kg (NDT) ou g (PB, Ca, P). */
  absoluto: number | null;
};

export type Exigencia = {
  fonte: FonteExigencia;
  rotulo: string;
  /** kg de MS por dia. */
  cmsKg: number | null;
  ndt: ValorExigido;
  pb: ValorExigido;
  ca: ValorExigido;
  p: ValorExigido;
  avisos: string[];
};

// ── Dieta ───────────────────────────────────────────────────────────────────

export type ItemDieta = {
  alimentoId: string;
  /** kg de matéria natural por dia. */
  kgMn: number;
};

export type EntradaDieta = {
  pasto: ItemDieta | null;
  volumosos: ItemDieta[];
  concentrado: ItemDieta[];
};

export type SlotDieta = 'pasto' | 'volumoso' | 'concentrado';

export const LIMITE_VOLUMOSOS = 3;
export const LIMITE_CONCENTRADO = 9;

export type KgNutrientes = Record<Nutriente, number>;
