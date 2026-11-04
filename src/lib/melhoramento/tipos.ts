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
    rodaModelos: true,
    motivo: null,
  },
  bovino_corte: {
    chave: 'bovino_corte',
    rotulo: 'Bovinos de corte',
    fonte: 'rebanho_bovino+pesagem_bovino+parto_bovino',
    leDados: true,
    rodaModelos: true,
    motivo: null,
  },
};

/** Espécies de leite (lactação repetida); bovino de corte tem desenho próprio (corte.ts). */
export type EspecieLeite = Exclude<EspecieChave, 'bovino_corte'>;

export function ehEspecieLeite(e: EspecieChave): e is EspecieLeite {
  return e === 'caprino' || e === 'ovino';
}

export function especieValida(v: unknown): EspecieChave | null {
  return typeof v === 'string' && v in ESPECIES_MELHORAMENTO ? (v as EspecieChave) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Características
// ─────────────────────────────────────────────────────────────────────────────

export type CaracteristicaChave = 'media_diaria' | 'total_lactacao' | 'p210';

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
  p210: {
    chave: 'p210',
    rotulo: 'Peso padronizado aos 210 dias',
    rotuloCurto: 'P210',
    unidade: 'kg',
    casas: 0,
    principal: true,
    // Bovino de corte não tem lactação: o valor vem de corte.ts (padronizarP210).
    valor: () => null,
    descricao:
      'Peso à desmama padronizado aos 210 dias de idade, das pesagens entre 150 e 270 dias (janela do CDP ' +
      'da ABCZ, 2023). Calculado em src/lib/melhoramento/corte.ts.',
  },
};

export const ORDEM_CARACTERISTICAS: CaracteristicaChave[] = ['media_diaria', 'total_lactacao'];

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

/** Um par (h², r) do BLUP e do índice da fêmea, com a fonte escrita ao lado. */
export interface ParBlup {
  h2: number;
  r: number;
  fonte: string;
}

/**
 * O REML da fazenda (reml.ts). Os limiares de confiança são do MÓDULO, não da
 * literatura: quem discordar muda o número aqui, e a tela mostra o motivo.
 */
export interface ConfigReml {
  ativo: boolean;
  /** Acima disto (incógnitas de [GC, a] depois de absorver o pe), não estima. */
  limiteIncognitas: number;
  /** Abaixo disto (lactações), a estimativa não é usada. */
  registrosMinimos: number;
  /** Abaixo disto (fêmeas com 2+ lactações), o ambiente permanente não se separa do resíduo. */
  femeasRepetidasMinimas: number;
  iteracoesMax: number;
}

export interface ConfigAnalise {
  /** Lactação mais curta que isto (dias) não é comparável: aborto, morte, venda. */
  duracaoMinima: number;
  /** Mais longa que isto é dado sujo (a base tem 3.593 dias). */
  duracaoMaxima: number;
  /** Grupo de contemporâneas com menos lactações que isto sai da análise. */
  tamanhoMinimoGrupo: number;
  /** Primeira lactação estimada com idade abaixo disto (dias) = primípara. */
  idadeMaximaPrimiparaDias: number;
  /**
   * Gestação da espécie (dias), para a validação do pedigree: pai ou mãe que
   * nasceu menos que isto antes do filho não pode ser pai ou mãe dele.
   */
  gestacaoDias: number;
  /** Pares (h², r) do BLUP e do índice da fêmea. */
  blup: ParBlup[];
  /** Repetibilidades da MPPA. */
  rMppa: number[];
  fonteMppa: string;
  reml: ConfigReml;
  /**
   * Acima disto (incógnitas), Cholesky ESPARSO em vez do denso. Os dois dão a
   * mesma solução e a mesma PEV (testes); o esparso foi 10× mais rápido numa
   * fazenda de ovinos de 1.543 incógnitas (45 contra 480 ms, 04/11/2026).
   */
  limiteDenso: number;
  /** Fêmeas na validação abaixo das quais nenhum modelo é declarado melhor. */
  minimoVencedor: number;
  /** Fêmeas com 2+ lactações abaixo das quais a validação nem roda. */
  minimoValidacao: number;
  /** Linhas por ranking. */
  tamanhoRanking: number;
}

/**
 * O REML usa o Cholesky esparso com a inversa seletiva (numerico.ts): numa
 * fazenda de ovinos de 1.022 incógnitas, 11 voltas de AI levaram 0,1 s. O teto
 * de 20.000 incógnitas só protege a requisição de um cadastro fora do comum.
 */
export const CONFIG_REML_PADRAO: ConfigReml = {
  ativo: true,
  limiteIncognitas: 20000,
  registrosMinimos: 100,
  femeasRepetidasMinimas: 30,
  iteracoesMax: 40,
};

/**
 * 150 dias: a mesma constante de gestação do pequeno ruminante que o app usa
 * (comentário de public.parametros_reproducao_bovino: "A constante de 150 dias
 * do pequeno ruminante NÃO muda").
 */
export const GESTACAO_PEQUENO_RUMINANTE = 150;

/**
 * CAPRINOS. Os valores da literatura de caprinos leiteiros que o pedido do
 * Felipe fixou na etapa 1: h² 0,20 e 0,30 com r 0,36 no BLUP; MPPA com r 0,36,
 * 0,44 e 0,50. Fonte: reports/Avaliação genética de caprinos leiteiros.md — a
 * r 0,36 é a repetibilidade da PL305 da Saanen brasileira (Embrapa 2015, na
 * tabela de parâmetros e no Exemplo 6); h² 0,20 é a do exemplo do relatório e
 * 0,30 fica dentro da faixa de 0,10 a 0,41 da mesma tabela. Nenhum é estimado
 * com o rebanho (o REML da fazenda é um modelo À PARTE, ver reml.ts).
 */
export const CONFIG_PADRAO: ConfigAnalise = {
  duracaoMinima: 60,
  duracaoMaxima: 600,
  tamanhoMinimoGrupo: 5,
  idadeMaximaPrimiparaDias: Math.round(30 * 30.4375),
  gestacaoDias: GESTACAO_PEQUENO_RUMINANTE,
  blup: [
    { h2: 0.2, r: 0.36, fonte: 'caprinos: h² do Exemplo 6 do relatório; r da PL305 Saanen (Embrapa 2015)' },
    { h2: 0.3, r: 0.36, fonte: 'caprinos: h² dentro da faixa 0,10–0,41 do relatório; r da PL305 Saanen (Embrapa 2015)' },
  ],
  rMppa: [0.36, 0.44, 0.5],
  fonteMppa: 'caprinos: 0,36 (PL305 Saanen, Embrapa 2015) e a sensibilidade 0,44 e 0,50 do relatório',
  reml: CONFIG_REML_PADRAO,
  limiteDenso: 300,
  minimoVencedor: 30,
  minimoValidacao: 10,
  tamanhoRanking: 30,
};

/**
 * OVINOS LEITEIROS. Fonte: reports/Avaliação genética de ovinos leiteiros.md,
 * tabela "Herdabilidades de 0,10 a 0,37 para o leite e repetibilidades de 0,41
 * a 0,50", e a regra da seção "Não estimar parâmetros e comparar com
 * contemporâneas" ("quando a fonte deixa dúvida, com dois valores"):
 *
 *   h² 0,30 com r 0,50   avaliação nacional da Lacaune (Larroque 2011, p. 14);
 *   h² 0,24 com r 0,41   Lacaune, ordenha de 2019–2022 (Vouraki et al. 2025).
 *
 * São os dois pares (h², r) publicados JUNTOS na mesma fonte — não se mistura
 * a h² de uma com a r de outra. A MPPA usa as duas repetibilidades com fonte,
 * 0,41 e 0,50, como o Exemplo 5 do relatório.
 *
 * O GRUPO DE CONTEMPORÂNEAS é o mesmo das cabras — fazenda × ano × estação do
 * parto (trimestre) × primípara ou adulta —, que é o que o relatório recomenda
 * para rebanhos pequenos ("juntar as ordens 2 em diante, agrupar a estação por
 * trimestre"). O sistema de mamada (TMM × TMY), que o relatório também põe no
 * grupo, não existe no app; fica escrito na tela como limitação.
 *
 * O CORTE DE PRIMÍPARA (30 meses) também é o das cabras, e foi conferido nos
 * dados em 04/11/2026: das 2.244 primeiras lactações de ovelhas sem parto
 * anterior no cadastro, 67% estão entre 12 e 24 meses e só 6,6% entre 24 e 30;
 * a mesma depressão aparece nas cabras. Nada nos dados pede outro corte, e a
 * literatura lida não dá um.
 */
export const CONFIG_OVINO: ConfigAnalise = {
  ...CONFIG_PADRAO,
  blup: [
    { h2: 0.24, r: 0.41, fonte: 'ovinos: Lacaune, ordenha 2019–2022 (Vouraki et al. 2025)' },
    { h2: 0.3, r: 0.5, fonte: 'ovinos: avaliação nacional da Lacaune (Larroque 2011, p. 14)' },
  ],
  rMppa: [0.41, 0.5],
  fonteMppa: 'ovinos: 0,41 (Vouraki et al. 2025) e 0,50 (Larroque 2011), como no Exemplo 5 do relatório',
};

export function configDaEspecie(e: EspecieChave): ConfigAnalise {
  return e === 'ovino' ? CONFIG_OVINO : CONFIG_PADRAO;
}

// ─────────────────────────────────────────────────────────────────────────────
// Modelos
// ─────────────────────────────────────────────────────────────────────────────

export type FamiliaModelo = 'desvio_gc' | 'mppa' | 'blup' | 'indice' | 'blup_reml';

/** A chave do modelo de variâncias estimadas na fazenda (uma por característica). */
export const CHAVE_BLUP_REML = 'blup_reml';

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
  for (const { h2, r } of c.blup) {
    lista.push({
      chave: chaveBlup(h2, r),
      familia: 'blup',
      rotulo: `BLUP repetibilidade (h² ${dec(h2)}, r ${dec(r)})`,
      h2,
      r,
      valorRanking: 'EBV do modelo animal (GC fixo, A⁻¹, ambiente permanente)',
      previsao: 'EBV + ambiente permanente (â + p̂)',
    });
  }
  for (const { h2, r } of c.blup) {
    lista.push({
      chave: chaveIndice(h2, r),
      familia: 'indice',
      rotulo: `Índice da fêmea (h² ${dec(h2)}, r ${dec(r)})`,
      h2,
      r,
      valorRanking: 'EBV por índice: registros próprios + EBV do pai tirado do BLUP de mesmo (h², r)',
      previsao: 'o mesmo índice com alvo na capacidade de produção (a + pe)',
    });
  }
  if (c.reml.ativo) {
    lista.push({
      chave: CHAVE_BLUP_REML,
      familia: 'blup_reml',
      rotulo: 'BLUP com variâncias estimadas na fazenda (REML)',
      h2: null,
      r: null,
      valorRanking: 'EBV do mesmo modelo animal, com σ²a, σ²pe e σ²e estimados por AI-REML nos dados da fazenda',
      previsao: 'EBV + ambiente permanente (â + p̂), com as variâncias estimadas',
    });
  }
  return lista;
}

export function chaveBlup(h2: number, r: number): string {
  return `blup_h2${h2}_r${r}`;
}

export function chaveIndice(h2: number, r: number): string {
  return `indice_h2${h2}_r${r}`;
}
