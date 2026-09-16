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
  /** Nunca é sobrescrita (ao contrário de Categoria, que vira "Venda"/"Baixa" quando o animal sai) — é o que permite reconstruir a categoria que o animal TINHA num evento passado (ver financeiro.ts, estimativa de venda sem valor). */
  nascimento: DiaCompacto | null;
  /**
   * Data em que o animal entrou no programa de engorda — gravada uma vez só,
   * pelo AppSheet. A partir dela, cada `Pesagem` desse animal calcula
   * Dias/Peso/GMD relativo a essa entrada (conferido ao vivo, 15/09/2026).
   * Fica vazia pra quem nunca entrou em engorda (a maioria do rebanho) —
   * não é dado quebrado, é "não se aplica". Base de `engorda.ts` (Lotes de
   * engorda, aba Pesagem).
   */
  entradaEngorda: DiaCompacto | null;
  /** "Dias em engorda" do rebanho — dias entre `entradaEngorda` e a ÚLTIMA pesagem do animal (não recalculado aqui). */
  diasEngordaAtual: number | null;
  /** "Peso entrada engorda" do rebanho — peso do animal no dia de `entradaEngorda`. */
  pesoEntradaEngorda: number | null;
  /** "GMD" do rebanho — ganho médio diário na ÚLTIMA pesagem do animal (congelado até a próxima pesagem). */
  gmdAtual: number | null;
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
  /** "Diferença (última pesagem)" — negativo = perdeu peso desde a pesagem anterior (mesmo campo/sinalização do Katmandu, ver WeightLossBadge). */
  diferencaKg: number | null;
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

/**
 * Uma linha da aba "Categoria@" — preço fixo por categoria (Média@ arrobas
 * × Valor da @, já pré-calculado pelo AppSheet) que o cliente usa pra
 * valorar a Baixa automaticamente. Usado em financeiro.ts pra estimar o
 * valor de uma Venda sem valor registrado, com a MESMA fórmula.
 */
export interface CategoriaArroba {
  categoria: string;
  mediaArroba: number | null;
  valorCategoria: number | null;
}

/**
 * Uma categoria de custo (aba nova "Categorias de Custo", criada em
 * 15/09/2026 — não faz parte do AppSheet do cliente, é só do /FI_FCG).
 * Nasce com "Geral" + uma lista inicial de categorias de gasto (Assistência
 * veterinária, Combustível etc., pedida pelo Felipe em 16/09); o usuário
 * adiciona/renomeia/remove pelo próprio seletor de Categoria na tela de
 * Custos, sem depender de deploy — é dado, não uma lista fixa no código.
 */
export interface CategoriaCusto {
  id: string;
  nome: string;
}

export type TipoCusto = 'Mensal' | 'Anual';

/**
 * Um lançamento de custo (aba nova "Custos", 15/09/2026). `tipo` decide
 * como o valor se distribui pelos meses do intervalo [dataInicio, dataFim
 * ou hoje] — ver `distribuirCusto` em financeiro.ts: Mensal entra o valor
 * cheio em cada mês, Anual entra valor÷12 em cada mês.
 */
export interface Custo {
  id: string;
  descricao: string | null;
  categoria: string | null;
  /** null/"Geral" = custo da operação inteira, não de uma fazenda só. */
  fazenda: string | null;
  tipo: TipoCusto | null;
  valor: number | null;
  dataInicio: DiaCompacto | null;
  /** null = custo em aberto (ainda vigente) — distribui até o mês de hoje. */
  dataFim: DiaCompacto | null;
  observacao: string | null;
}

/**
 * As 3 abas do "Custo de formação" (nova, 16/09/2026 — réplica adaptada do
 * motor de custo de formação do seabra-app-main, que existe lá só pra
 * caprino/ovino de corte e produz R$/kg vivo, não R$/@; aqui é pra bovino
 * de corte e produz R$/@, usando `Categoria@` como peso-alvo de cada
 * categoria do funil). Nenhuma das 3 é do AppSheet do cliente.
 */
/**
 * Os 3 tipos fixos de insumo (16/09/2026, alinhado com o "Nutrição & Custo"
 * do seabra-app-main — `formulacao_categoria`/`consumo_categoria` de lá) —
 * cada um tem seu próprio consumo total (kg/dia) por categoria, e dentro
 * dele os insumos se dividem por PERCENTUAL da mistura, não kg/dia direto.
 */
export const TIPOS_INSUMO = ['Concentrado', 'Volumoso', 'Sal mineral'] as const;
export type TipoInsumo = (typeof TIPOS_INSUMO)[number];

export interface Insumo {
  id: string;
  nome: string;
  /** Um dos TIPOS_INSUMO — agora estrutural (decide o "balde" de consumo/% que o insumo entra), não só organizacional. */
  tipo: string | null;
  valorKg: number | null;
}

/**
 * Quanto (%) um Insumo representa DENTRO do seu tipo, para uma Categoria —
 * ex.: "Vaca, dentro do Concentrado, 55% Milho + 45% Farelo de soja". Não é
 * kg/dia direto (isso é `ConsumoCategoria`, o total do tipo) — o custo/dia
 * de cada tipo = (Σ percentual × valorKg dos insumos daquele tipo) ×
 * kgDia do tipo (ver custoDietaDia, custoFormacao.ts).
 */
export interface ItemDieta {
  id: string;
  categoria: string | null;
  insumo: string | null;
  percentual: number | null;
}

/**
 * Consumo total (kg/dia) de um TIPO inteiro (Concentrado/Volumoso/Sal
 * mineral) por Categoria — independente de quantos insumos compõem a
 * mistura daquele tipo (ver ItemDieta.percentual). 21 linhas fixas
 * semeadas uma vez (7 categorias × 3 tipos), mesmo padrão de GmdCategoria.
 */
export interface ConsumoCategoria {
  id: string;
  categoria: string | null;
  tipo: string | null;
  kgDia: number | null;
}

/**
 * GMD (kg/dia) editável por categoria do funil — 7 linhas fixas, semeadas
 * uma vez (Bezerro/Bezerra/Garrote/Novilha/Boi/Vaca/Touro). `gmdKgDia` null
 * = sem valor editado ainda; a tela sugere a média real (Pesagem/Lotes de
 * engorda) quando existir, mas só GRAVA aqui quando o usuário confirma.
 */
export interface GmdCategoria {
  id: string;
  categoria: string | null;
  gmdKgDia: number | null;
}

/**
 * Idade (dias) de cada marco de transição/reprodução — aba nova
 * (16/09/2026, "Retrato do momento" + "Projeção de rebanho"). 5 linhas
 * fixas, semeadas uma vez: as 3 transições de categoria por idade
 * (Bezerro→Garrote, Garrote→Boi, Bezerra→Novilha) e os 2 marcos
 * reprodutivos da fêmea (1ª cobertura, 1º parto — Novilha vira Vaca no
 * 1º parto, não na cobertura). `idadeDias` null = ainda não editado.
 */
export interface MarcoIdade {
  id: string;
  marco: string | null;
  idadeDias: number | null;
}
