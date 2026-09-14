/**
 * Tipos do /FI_FCG — espelham as abas da planilha "Produção - Benoni"
 * (AppSheet do cliente, fazendas Inhumas/FI e Campina grande/FCG). Nomes de
 * coluna exatos conferidos ao vivo contra a planilha real (não só os
 * rótulos do Looker) — ver mapeadores.ts, que lê por nome de header.
 */

/** "aaaammdd" — mesma base compacta de diaDe/formatDia (lib/painel/format.ts). */
export type DiaCompacto = number;

export interface RegIatf {
  id: string;
  data: DiaCompacto | null;
  protocolo: string | null;
  metodo: string | null;
  /** Coluna real "Patida (sêmen)" — typo de origem na planilha, mantido na leitura (ver aliases em mapeadores.ts). */
  partida: string | null;
  inseminador: string | null;
  /** Texto cru ("2,5") pro filtro (grafia exata, sem normalizar) — `eccNum` é o parseNumber, para métricas/ordenação. */
  ecc: string | null;
  eccNum: number | null;
  fazenda: string | null;
  lote: string | null;
  pesoKg: number | null;
}

export interface RegToque {
  id: string;
  data: DiaCompacto | null;
  diagnostico: string | null;
  destino: string | null;
  escore: string | null;
  escoreNum: number | null;
  observacao: string | null;
  idadeAnos: number | null;
  status: string | null;
  reproducao: string | null;
  fazenda: string | null;
  lote: string | null;
  pesoKg: number | null;
  touroIatf: string | null;
}

export interface RegRebanho {
  id: string;
  eletronica: string | null;
  marca: string | null;
  sexo: string | null;
  categoria: string | null;
  causaBaixa: string | null;
  idadeMeses: number | null;
  fazenda: string | null;
  lote: string | null;
  status: string | null;
  reproducao: string | null;
  escore: number | null;
  destino: string | null;
  ultimaPesagemKg: number | null;
  dataUltimaPesagem: DiaCompacto | null;
}

export interface RegParto {
  id: string;
  eletronica: string | null;
  marca: string | null;
  idMae: string | null;
  idPai: string | null;
  nascimento: DiaCompacto | null;
  sexo: string | null;
  metodo: string | null;
  pesoNascimento: number | null;
  fazenda: string | null;
  categoria: string | null;
}

export interface RegPesagem {
  id: string;
  data: DiaCompacto | null;
  pesoKg: number | null;
  entradaKg: number | null;
  diasEngorda: number | null;
  gpd: number | null;
  gmd: number | null;
  pdi: number | null;
  gpdi: number | null;
  fazenda: string | null;
  lote: string | null;
  sexo: string | null;
  destino: string | null;
}

export interface RegBaixa {
  id: string;
  data: DiaCompacto | null;
  tipo: string | null;
  causaObito: string | null;
  valor: number | null;
  fazenda: string | null;
  obs: string | null;
  categoria: string | null;
  idadeDias: number | null;
}

export interface RegVenda {
  id: string;
  idAnimal: string | null;
  data: DiaCompacto | null;
  valor: number | null;
  cliente: string | null;
  fazenda: string | null;
  pesoKg: number | null;
}

export interface RegAborto {
  id: string;
  idAnimal: string | null;
  data: DiaCompacto | null;
  suspeita: string | null;
  fazenda: string | null;
}

/** Uma linha do livro-caixa gerado pelo AppSheet (aba "Financeiro") — usado só pra conciliação, nunca como fonte de Fazenda/Cliente (ver financeiro.ts). */
export interface LancamentoFinanceiro {
  id: string;
  identificacao: string | null;
  descricao: string | null;
  categoria: string | null;
  valor: number | null;
  data: DiaCompacto | null;
}
