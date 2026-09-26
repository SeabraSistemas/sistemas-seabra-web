/** Tipos compartilhados do motor de checagens do /bovinos (tudo serializável — vai para o client). */

export type RegraId =
  // Estrutura do RebanhoProd
  | 'linha-em-branco'
  | 'linha-sem-identificacao'
  | 'formula-ausente'
  | 'formula-sobrescrita'
  | 'sem-chave'
  | 'chave-duplicada'
  | 'data-placeholder'
  | 'linha-teste'
  // Fazenda
  | 'fazenda-fora-da-lista'
  // Pai
  | 'pai-preencher'
  | 'pai-trocar'
  | 'pai-tirar'
  | 'pai-ambiguo'
  | 'gestacao-curta'
  // Mãe / parto
  | 'mae-preencher'
  | 'mae-diferente'
  | 'mae-dois-bezerros'
  | 'bezerro-em-partos-de-maes-diferentes'
  | 'parto-duplicado'
  | 'parto-sem-animal'
  | 'previsto-iatf-posterior'
  // Reproduçao
  | 'iatf-mesmo-dia';

/** corrigivel = tem correção automática (com prévia); manual = precisa de decisão; info = só para saber. */
export type Severidade = 'corrigivel' | 'manual' | 'info';

/** Uma célula a trocar, pelo NOME da coluna. `de` é o valor que precisa estar lá na hora de gravar. */
export interface TrocaCelula {
  col: string;
  de: string;
  para: string;
}

export type Correcao =
  /** Troca valores numa linha (pai, mãe, chave). A guarda confirma que a linha ainda é o mesmo animal. */
  | { tipo: 'celulas'; aba: string; linha: number; guarda: { idA: string; idAnimal: string }; set: TrocaCelula[] }
  /**
   * Chave de animal que perdeu a sua: `recuperar` volta a chave original
   * (achada no parto); `gerar` lista as colunas que recebem uma chave NOVA
   * (8 hex, como o UNIQUEID do AppSheet), sorteada só na hora da prévia.
   */
  | { tipo: 'chave'; aba: string; linha: number; guarda: { idA: string; idAnimal: string }; recuperar: TrocaCelula[]; gerar: string[] }
  /** Troca um valor por outro numa coluna, em várias linhas de uma vez (ex.: Fazenda "Bonito" → "Santo Antônio"). */
  | { tipo: 'coluna-valor'; aba: string; col: string; linhas: number[]; de: string; para: string }
  /** Copia a fórmula da linha doadora (acima) para as colunas vazias desta linha. */
  | { tipo: 'formula'; aba: string; linha: number; guarda: { idA: string; idAnimal: string }; colunas: { col: string; linhaDoadora: number }[] }
  /** Remove a linha inteira (só vazia ou só com fórmula). */
  | { tipo: 'excluir-linha'; aba: string; linha: number };

export interface Problema {
  /** Estável entre duas leituras iguais — base da seleção e do "novo/resolvido" do alerta. */
  id: string;
  regra: RegraId;
  severidade: Severidade;
  aba: string;
  /** Linha da planilha (1 = cabeçalho). null quando o problema é agrupado. */
  linha: number | null;
  /** ID animal (ou o que identifica o caso) para busca e exibição. */
  animal: string;
  resumo: string;
  /** Evidências, uma por linha de texto. */
  prova: string[];
  /** Motivos que impediram a correção automática (quando severidade = manual por segurança). */
  bloqueios: string[];
  atual?: string;
  sugerido?: string;
  correcao: Correcao | null;
}

export interface Relatorio {
  problemas: Problema[];
  /** Avisos de leitura (coluna ausente, aba que não existe) — o relatório pode estar incompleto. */
  avisos: string[];
  totais: { linhasRebanho: number; partos: number; iatfs: number };
}
