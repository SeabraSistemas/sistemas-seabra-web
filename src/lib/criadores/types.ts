/**
 * Tipos da vitrine — espelham EXATAMENTE as colunas de vitrine.criadores e
 * vitrine.animais (migrations/vitrine_02_views.sql). O id numerico NUNCA e
 * projetado: a chave de navegacao e o slug (decisao D9 do plano).
 */

/** Um ancestral do snapshot de genealogia (vitrine_animal.genealogia). */
export interface Ancestral {
  nome?: string | null;
  numero?: string | null;
}

/**
 * Snapshot jsonb de ate 3 geracoes (jsonb_strip_nulls: so vem a chave que existe).
 * Chaves: pai/mae, avo_pp/pm/mp/mm, bis_ppp..bis_mmm.
 */
export type Genealogia = Partial<Record<
  | 'pai' | 'mae'
  | 'avo_pp' | 'avo_pm' | 'avo_mp' | 'avo_mm'
  | 'bis_ppp' | 'bis_ppm' | 'bis_pmp' | 'bis_pmm'
  | 'bis_mpp' | 'bis_mpm' | 'bis_mmp' | 'bis_mmm',
  Ancestral
>>;

/**
 * Snapshot jsonb da AML (avaliação morfológica linear): vitrine_animal.aml.
 * '{}' quando não há avaliação; senão { total, data, pts: [[label, valor 1-9], ...] }
 * (só os pontos não-nulos — úbere de macho não vem).
 */
export interface Aml {
  total?: number | null;
  data?: string | null;
  pts?: [string, number][];
}

export type SexoNorm = 'macho' | 'femea';

/** Linha de vitrine.criadores (card do indice + header da pagina do criador). */
export interface Criador {
  slug: string;
  criador: string;
  numero_criador: string | null;
  localizacao: string | null;
  whatsapp: string | null;
  email_publico: string | null;
  site_url: string | null;
  logo_url: string | null;
  bio_curta: string | null;
  exibe_producao: boolean;
  ordem: number;
  total_animais: number;
  machos: number;
  femeas: number;
  racas: string[];
  capa_url: string | null;
  atualizado_em: string | null;
}

/** Linha de vitrine.animais (card na grade + ficha). */
export interface Animal {
  criador_slug: string;
  animal_slug: string;
  nome: string | null;
  numero: string;
  sexo_norm: SexoNorm;
  raca: string | null;
  pelagem: string | null;
  especie: string | null;
  categoria_rg: string | null;
  grau_sangue: string | null;
  titulos: string[];
  data_nascimento: string | null;
  idade_meses: number | null;
  ano_nascimento: number | null;
  fotos: string[];
  blur_data_url: string | null;
  dias_em_lactacao: number | null;
  partos: number | null;
  peso_kg: number | null;
  producao_vitalicia_kg: number | null;
  lactacoes_encerradas: number | null;
  genealogia_profundidade: number;
  genealogia: Genealogia;
  destaque: boolean;
  indexavel: boolean;
  ordem: number;
  atualizado_em: string | null;
  aml: Aml;
}

/** Payload da pagina do criador. */
export interface PaginaCriador {
  criador: Criador;
  animais: Animal[];
}

/** Payload da ficha do animal (com vizinhos para navegacao anterior/proximo). */
export interface PaginaAnimal {
  criador: Criador;
  animal: Animal;
  indice: number;       // posicao (1-based) na lista do criador
  total: number;
  anteriorSlug: string | null;
  proximoSlug: string | null;
}
