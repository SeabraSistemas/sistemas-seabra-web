/**
 * Tipos do /katmandu — espelham as abas da planilha Google Sheets alimentada
 * pelo AppSheet (RebanhoProd, Pesagem, Baixas, Clínica, User Manager).
 *
 * Nomes de coluna exatos ainda não foram conferidos contra a planilha real
 * (sem acesso até a service account ser provisionada) — `queries.ts` lê por
 * nome de header, então um rótulo diferente do esperado só exige ajustar o
 * mapa de headers ali, não estes tipos.
 */

export type Sexo = 'macho' | 'femea' | null;

/** Subgrupo de desempenho (campo "Destino" da Pesagem): melhor/mediano/pior. */
export type Destino = 'melhor' | 'mediano' | 'pior' | null;

export interface AnimalRebanho {
  idAnimal: string;
  sisbov: string | null;
  sexo: Sexo;
  categoria: string | null;
  idadeDias: number | null;
  idadeMeses: number | null;
  baixa: string | null;
  escore: number | null;
  metodo: string | null;
  reproducao: string | null;
  status: string | null;
  gpd: number | null;
  gmd: number | null;
  destino: Destino;
  entradaEngorda: string | null;
  diasEmEngorda: number | null;
  /** Lote atual — coluna nativa CR do RebanhoProd (a aba "Lote" de histórico está vazia). */
  lote: string | null;
  /** Peso ÷ dias de vida — coluna nativa CX do RebanhoProd. */
  pdi: number | null;
  /** Data da pesagem mais recente — coluna nativa CY ("Data última pesagem") do RebanhoProd. */
  ultimoManejo: string | null;
}

export interface PesagemRegistro {
  idAnimal: string;
  sisbov: string | null;
  pesoKg: number | null;
  ultimaPesagemKg: number | null;
  diferencaKg: number | null;
  pesoEntradaKg: number | null;
  diasEmEngorda: number | null;
  gmd: number | null;
  gpd: number | null;
  lote: string | null;
  destino: Destino;
  dataPesagem: string | null;
  venda: string | null;
  manejos: string | null;
  mesesVida: number | null;
  /** Indicadores próprios da planilha (colunas "pdi"/"gpdi") — sempre presentes quando há pesagem. */
  pdi: number | null;
  gpdi: number | null;
}

export interface Baixa {
  idAnimal: string;
  data: string | null;
  causa: string | null;
  categoria: string | null;
}

export interface OcorrenciaClinica {
  idAnimal: string;
  data: string | null;
  ocorrencia: string | null;
  observacao: string | null;
}
