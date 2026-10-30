/**
 * O CONTRATO DE ENTRADA do módulo de melhoramento e os registros que o
 * parametrizam (espécies, características, configuração).
 *
 * Este módulo (src/lib/melhoramento/*) é PURO: não lê banco, não importa nada
 * do Next nem do /adm. Quem traduz as views `adm.melhoramento_*` para estes
 * tipos é src/lib/adm/areas/melhoramento.ts. Isso é o que permite testar tudo
 * com fixtures sintéticos — nenhum dado de produtor entra em arquivo de teste.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Entrada
// ─────────────────────────────────────────────────────────────────────────────

/** Uma lactação, como sai de adm.melhoramento_lactacao. */
export interface LactacaoEntrada {
  lactacaoId: number;
  animalId: number;
  propriedadeId: number;
  especie: string;
  raca: string | null;
  /** Posição desta lactação entre as REGISTRADAS do animal (1 = a primeira na base). */
  ordemLactacao: number;
  /** Quantas lactações reais o animal tem na base. */
  lactacoesDoAnimal: number;
  /** rebanho.ordem_parto: a ordem ATUAL do animal, não a desta lactação. */
  ordemPartoCadastro: number | null;
  /** 'YYYY-MM-DD' */
  dataInicio: string;
  /** Ano da estação (dezembro conta no verão do ano seguinte). */
  anoEstacao: number;
  /** 'verao' | 'outono' | 'inverno' | 'primavera' */
  estacao: string;
  idadePartoDias: number | null;
  encerrada: boolean;
  duracaoDias: number | null;
  totalLeite: number | null;
  mediaLeite: number | null;
  metodo: string | null;
  sintetica: boolean;
  paiId: number | null;
  maeId: number | null;
}

/** Um animal do pedigree, como sai de adm.melhoramento_pedigree. */
export interface AnimalEntrada {
  animalId: number;
  propriedadeId: number;
  especie: string;
  numero: string | null;
  nome: string | null;
  /** 'macho' | 'fêmea' | outro texto do cadastro | null */
  sexo: string | null;
  /** 'YYYY-MM-DD' */
  nascimento: string | null;
  paiId: number | null;
  maeId: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Espécies — o desenho já separa espécie de fonte de dados
// ─────────────────────────────────────────────────────────────────────────────

export type EspecieChave = 'caprino' | 'ovino' | 'bovino_corte';

export interface EspecieMelhoramento {
  chave: EspecieChave;
  rotulo: string;
  /** Onde os dados moram no app. Bovino de corte tem tabelas próprias. */
  fonte: 'rebanho+lactacao' | 'rebanho_bovino+pesagem_bovino+parto_bovino';
  /** Esta versão lê e diagnostica os dados desta espécie? */
  leDados: boolean;
  /** Esta versão roda os modelos nesta espécie? */
  rodaModelos: boolean;
  /** Por que não, quando não. Vai para a tela como está. */
  motivo: string | null;
}

export const ESPECIES_MELHORAMENTO: Record<EspecieChave, EspecieMelhoramento> = {
  caprino: {
    chave: 'caprino',
    rotulo: 'Caprinos',
    fonte: 'rebanho+lactacao',
    leDados: true,
    rodaModelos: true,
    motivo: null,
  },
  ovino: {
    chave: 'ovino',
    rotulo: 'Ovinos',
    fonte: 'rebanho+lactacao',
    leDados: true,
    rodaModelos: false,
    motivo:
      'Nesta versão os ovinos têm só o diagnóstico dos dados. Os parâmetros dos modelos (h² 0,20 e ' +
      '0,30, repetibilidade 0,36) são de caprinos leiteiros; rodar os mesmos números em ovelhas ' +
      'seria afirmar um parâmetro que ninguém revisou para a espécie.',
  },
  bovino_corte: {
    chave: 'bovino_corte',
    rotulo: 'Bovinos de corte',
    fonte: 'rebanho_bovino+pesagem_bovino+parto_bovino',
    leDados: false,
    rodaModelos: false,
    motivo:
      'Fora desta versão. Os dados moram em outras tabelas (rebanho_bovino, pesagem_bovino, ' +
      'parto_bovino), a característica é peso ajustado (não leite) e o grupo de contemporâneos é ' +
      'de manejo e desmama — outro desenho, que entra na próxima etapa sem mexer nas views de hoje.',
  },
};

export function especieValida(v: unknown): EspecieChave | null {
  return typeof v === 'string' && v in ESPECIES_MELHORAMENTO ? (v as EspecieChave) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Características
// ─────────────────────────────────────────────────────────────────────────────

export type CaracteristicaChave = 'media_diaria' | 'total_lactacao';

export interface CaracteristicaInfo {
  chave: CaracteristicaChave;
  rotulo: string;
  rotuloCurto: string;
  unidade: string;
  casas: number;
  principal: boolean;
  /** Valor da característica numa lactação; null = não tem. */
  valor: (l: LactacaoEntrada) => number | null;
  descricao: string;
}

/**
 * POR QUE A MÉDIA DIÁRIA É A PRINCIPAL. Conferido por SQL agregado em
 * 30/10/2026 nas fazendas de cabras com mais lactações encerradas: o total da
 * lactação tem correlação de 0,82 a 0,92 com a DURAÇÃO, e a média diária, de
 * 0,05 a 0,17. Ou seja, o total mede sobretudo quanto tempo a lactação durou —
 * e a duração aqui mistura manejo (quando secar), lactação estendida e fim
 * INFERIDO pelo app (INFERIDO_GAP_FINAL tem duração mediana de 147 dias). A
 * média diária também foi a mais repetível entre lactações seguidas da mesma
 * cabra nas duas maiores fazendas (0,22 contra 0,11; 0,28 contra 0,21).
 *
 * Essas contas NÃO ficam só neste comentário: o diagnóstico de cada fazenda
 * recalcula as duas correlações sobre os dados dela (diagnostico.ts), e a tela
 * mostra o número da fazenda, não o desta nota.
 *
 * O total da lactação fica como SEGUNDA característica, para comparação. A
 * lactação padronizada (TIM/Fleischmann até um dia fixo, ICAR) foi descartada
 * nesta versão: nas três maiores fazendas de cabras, só 53% a 74% das
 * lactações encerradas têm 3 ou mais controles leiteiros dentro delas, e
 * padronizar as outras seria inventar curva.
 */
export const CARACTERISTICAS: Record<CaracteristicaChave, CaracteristicaInfo> = {
  media_diaria: {
    chave: 'media_diaria',
    rotulo: 'Média diária da lactação',
    rotuloCurto: 'média diária',
    unidade: 'L/dia',
    casas: 2,
    principal: true,
    valor: (l) => (l.mediaLeite != null && l.mediaLeite > 0 ? l.mediaLeite : null),
    descricao:
      'Total da lactação dividido pela duração (lactacao.media_leite, que bate com total/dias em ' +
      'todas as linhas em que os três existem). Quase não depende de quanto a lactação durou.',
  },
  total_lactacao: {
    chave: 'total_lactacao',
    rotulo: 'Total da lactação',
    rotuloCurto: 'total',
    unidade: 'L',
    casas: 0,
    principal: false,
    valor: (l) => (l.totalLeite != null && l.totalLeite > 0 ? l.totalLeite : null),
    descricao:
      'Litros do parto ao encerramento (lactacao.total_leite). Carrega a duração junto — que mistura ' +
      'genética (persistência) com manejo e com fim inferido pelo app.',
  },
};

export const ORDEM_CARACTERISTICAS: CaracteristicaChave[] = ['media_diaria', 'total_lactacao'];

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfigAnalise {
  /** Lactação mais curta que isto (dias) não é comparável: aborto, morte, venda. */
  duracaoMinima: number;
  /** Mais longa que isto é dado sujo (a base tem 3.593 dias). */
  duracaoMaxima: number;
  /** Grupo de contemporâneas com menos lactações que isto sai da análise. */
  tamanhoMinimoGrupo: number;
  /** Herdabilidades do BLUP e do índice da fêmea. */
  h2: number[];
  /** Repetibilidade do BLUP e do índice. */
  rBlup: number;
  /** Repetibilidades da MPPA. */
  rMppa: number[];
  /** Acima disto (incógnitas), Gauss-Seidel em vez de Cholesky. */
  limiteDenso: number;
  /** Fêmeas na validação abaixo das quais nenhum modelo é declarado melhor. */
  minimoVencedor: number;
  /** Fêmeas com 2+ lactações abaixo das quais a validação nem roda. */
  minimoValidacao: number;
  /** Linhas por ranking. */
  tamanhoRanking: number;
}

/**
 * Os valores da literatura de caprinos leiteiros que o pedido do Felipe fixou:
 * h² 0,20 e 0,30 com r 0,36 no BLUP; MPPA com r 0,36, 0,44 e 0,50. Nenhum é
 * estimado com o rebanho.
 */
export const CONFIG_PADRAO: ConfigAnalise = {
  duracaoMinima: 60,
  duracaoMaxima: 600,
  tamanhoMinimoGrupo: 5,
  h2: [0.2, 0.3],
  rBlup: 0.36,
  rMppa: [0.36, 0.44, 0.5],
  limiteDenso: 2000,
  minimoVencedor: 30,
  minimoValidacao: 10,
  tamanhoRanking: 30,
};

// ─────────────────────────────────────────────────────────────────────────────
// Modelos
// ─────────────────────────────────────────────────────────────────────────────

export type FamiliaModelo = 'desvio_gc' | 'mppa' | 'blup' | 'indice';

export interface ModeloInfo {
  chave: string;
  familia: FamiliaModelo;
  rotulo: string;
  h2: number | null;
  r: number | null;
  /** O que o ranking deste modelo ordena. */
  valorRanking: string;
  /** O que este modelo prevê para a próxima lactação, na validação. */
  previsao: string;
}

function dec(x: number): string {
  return x.toFixed(2).replace('.', ',');
}

/** A lista de modelos, na ordem da tela, gerada da configuração. */
export function modelosDaConfig(c: ConfigAnalise): ModeloInfo[] {
  const lista: ModeloInfo[] = [
    {
      chave: 'desvio_gc',
      familia: 'desvio_gc',
      rotulo: 'Desvio das contemporâneas',
      h2: null,
      r: null,
      valorRanking: 'média dos desvios da fêmea em relação às contemporâneas, sem encolhimento',
      previsao: 'a própria média dos desvios anteriores',
    },
  ];
  for (const r of c.rMppa) {
    lista.push({
      chave: `mppa_r${r}`,
      familia: 'mppa',
      rotulo: `MPPA (r ${dec(r)})`,
      h2: null,
      r,
      valorRanking: 'capacidade mais provável de produção (desvio encolhido por n·r/[1+(n−1)r])',
      previsao: 'a MPPA',
    });
  }
  for (const h2 of c.h2) {
    lista.push({
      chave: `blup_h2${h2}_r${c.rBlup}`,
      familia: 'blup',
      rotulo: `BLUP repetibilidade (h² ${dec(h2)}, r ${dec(c.rBlup)})`,
      h2,
      r: c.rBlup,
      valorRanking: 'EBV do modelo animal (GC fixo, A⁻¹, ambiente permanente)',
      previsao: 'EBV + ambiente permanente (â + p̂)',
    });
  }
  for (const h2 of c.h2) {
    lista.push({
      chave: `indice_h2${h2}_r${c.rBlup}`,
      familia: 'indice',
      rotulo: `Índice da fêmea (h² ${dec(h2)}, r ${dec(c.rBlup)})`,
      h2,
      r: c.rBlup,
      valorRanking: 'EBV por índice: registros próprios + EBV do pai tirado do BLUP de mesma h²',
      previsao: 'o mesmo índice com alvo na capacidade de produção (a + pe)',
    });
  }
  return lista;
}
