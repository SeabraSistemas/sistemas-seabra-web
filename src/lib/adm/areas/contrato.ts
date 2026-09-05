/**
 * CONTRATO DAS VIEWS DA FASE 2 — a fronteira entre o SQL e o TypeScript.
 *
 * POR QUE ESTE ARQUIVO EXISTE: na Fase 1 o agente do SQL e o agente das queries
 * escreveram em paralelo e nomearam as MESMAS views de formas diferentes — dez
 * views consumidas, seis criadas, quatro com outro nome. O painel compilava,
 * passava no lint, e só `/adm/usuarios` abria. Nada de tipo pega isso: o
 * PostgREST devolve "relação não encontrada" em runtime, e o Next mostra o
 * estado vazio como se o cliente não tivesse dados.
 *
 * A regra que sai daí e vale daqui pra frente:
 *
 *   O NOME DA VIEW E O NOME DE CADA COLUNA SÃO DECLARADOS AQUI, PRIMEIRO.
 *   O SQL implementa este arquivo. O TypeScript consome este arquivo.
 *   Ninguém digita uma string de nome de view em lugar nenhum.
 *
 * `adm_05_verificacao.sql` confere que toda view listada em VIEWS_FASE_2 existe
 * e está com grant para service_role — então uma divergência falha na migration,
 * que é onde dá para consertar, e não na tela do Felipe.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Nomes das views — a fonte única
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todas no schema `adm`, todas com `propriedade_id` como primeira coluna
 * (exceto as de consultoria, ancoradas em `usuario_id`), todas com no máximo
 * uma linha por âncora. Cardinalidade de uma linha é decisão de contrato: quem
 * consome usa `umaLinha()` e não precisa decidir o que fazer com duplicata.
 */
export const VIEWS_FASE_2 = {
  reproducao: 'propriedade_reproducao',
  sanidade: 'propriedade_sanidade',
  crescimento: 'propriedade_crescimento',
  avaliacoes: 'propriedade_avaliacoes',
  financeiro: 'propriedade_financeiro',
  estrutura: 'propriedade_estrutura',
  equipe: 'propriedade_equipe',
  vitrine: 'criador_vitrine',
  consultores: 'consultores_lista',
  carteiraConsultor: 'consultor_carteira',
} as const;

export type ViewFase2 = (typeof VIEWS_FASE_2)[keyof typeof VIEWS_FASE_2];

/** Para o assert de existência em adm_05 e para o README. */
export const NOMES_VIEWS_FASE_2: ViewFase2[] = Object.values(VIEWS_FASE_2);

// ─────────────────────────────────────────────────────────────────────────────
// Formas de linha — o SQL projeta EXATAMENTE estes nomes de coluna
// ─────────────────────────────────────────────────────────────────────────────

import type { FatiaDistribuicao, PontoSerie } from '@/lib/adm/types';

/**
 * Ponto de série que carrega a QUAL série pertence. Usado onde uma view devolve
 * duas curvas na mesma coluna jsonb — o consumidor filtra por `serie` em vez de
 * a view virar duas colunas que sempre andam juntas.
 */
export interface PontoSerieNomeada extends PontoSerie {
  serie: string;
}

/**
 * Convenção de nulo em TODAS as views abaixo:
 *   contagem  → 0 significa "nenhum", nunca "não sei"
 *   média/taxa → null significa "não dá para calcular" (denominador zero)
 *
 * Isso importa na tela: 0% de prenhez é um problema do cliente; "—" é ausência
 * de dado. Mostrar um pelo outro faz o Felipe ligar para cobrar coisa errada.
 */

export interface LinhaReproducao {
  propriedade_id: number;
  coberturas_12m: number;
  inseminacoes_12m: number;
  montas_12m: number;
  te_12m: number;
  diagnosticos_12m: number;
  diagnosticos_positivos_12m: number;
  /** positivos / diagnósticos. null quando não houve diagnóstico. */
  taxa_prenhez: number | null;
  partos_12m: number;
  abortos_12m: number;
  /** Média de rebanho.idade_ao_primeiro_parto, em dias. */
  idade_primeiro_parto_dias: number | null;
  prolificidade_media: number | null;
  intervalo_partos_dias: number | null;
  femeas_ativas: number;
  gestantes: number;
  /** (serie 'coberturas' | 'partos', periodo 'YYYY-MM', valor) */
  serie_mensal: PontoSerieNomeada[] | null;
  /** Funil: rótulos 'Coberturas', 'Diagnósticos', 'Positivos', 'Partos'. */
  funil: FatiaDistribuicao[] | null;
}

export interface LinhaSanidade {
  propriedade_id: number;
  casos_12m: number;
  animais_tratados_12m: number;
  obitos_12m: number;
  /** óbitos / rebanho médio do período. null se não há rebanho. */
  taxa_mortalidade: number | null;
  famacha_medio: number | null;
  escore_corporal_medio: number | null;
  manejos_12m: number;
  sessoes_coletivas_12m: number;
  /** (periodo 'YYYY-MM', valor) — óbitos por mês. */
  obitos_mensais: PontoSerie[] | null;
  /** Rótulos '1'..'5'. */
  distribuicao_famacha: FatiaDistribuicao[] | null;
  /** Principais suspeitas por frequência. */
  principais_suspeitas: FatiaDistribuicao[] | null;
}

export interface LinhaCrescimento {
  propriedade_id: number;
  pesagens_12m: number;
  animais_pesados_12m: number;
  gmd_medio: number | null;
  peso_medio_desmame: number | null;
  /** pesagem.progresso < 100 */
  abaixo_da_meta: number;
  /** De propriedades.*, para desenhar a banda de meta no gráfico. */
  peso_ideal_desmame: number | null;
  idade_desmame: number | null;
  peso_ideal_entrada_reproducao: number | null;
  /** Nuvem peso × idade: cada ponto é um animal. */
  nuvem_peso_idade: { idade_dias: number; peso_kg: number; sexo: string | null }[] | null;
  /** Os 20 piores GMD — a lista de ação do consultor. */
  piores_gmd: { numero_animal: string; nome_animal: string | null; gmd: number }[] | null;
}

export interface LinhaAvaliacoes {
  propriedade_id: number;
  amls_total: number;
  amls_12m: number;
  medidas_total: number;
  pontuacao_media: number | null;
  aml_corte_total: number;
  /** (periodo 'YYYY-MM', valor) — pontuação média por mês. */
  pontuacao_mensal: PontoSerie[] | null;
  /** Média por ponto da AML (16 pontos), para o radar. */
  media_por_ponto: FatiaDistribuicao[] | null;
}

export interface LinhaFinanceiro {
  propriedade_id: number;
  receita_12m: number | null;
  despesa_12m: number | null;
  margem_12m: number | null;
  /** Do snapshot mais recente de estimativa_custo_snapshot. */
  custo_litro: number | null;
  lucro_lactante_mes: number | null;
  data_snapshot: string | null;
  lancamentos_12m: number;
  /** (periodo 'YYYY-MM', valor) — custo por litro ao longo do tempo. */
  custo_litro_serie: PontoSerie[] | null;
  /** Despesa por setor. */
  despesa_por_setor: FatiaDistribuicao[] | null;
}

export interface LinhaEstrutura {
  propriedade_id: number;
  setores: number;
  baias: number;
  lotes: number;
  movimentacoes_12m: number;
  animais_sem_localizacao: number;
  /** Contagem de animais por lote. */
  por_lote: FatiaDistribuicao[] | null;
  por_setor: FatiaDistribuicao[] | null;
}

export interface LinhaEquipe {
  propriedade_id: number;
  colaboradores: number;
  colaboradores_ativos: number;
  tecnicos_vinculados: number;
  visitas_12m: number;
  /** Um item por pessoa: nome, papel e permissões resumidas. */
  pessoas:
    | {
        usuario_id: number;
        nome: string;
        papel: string | null;
        ativo: boolean;
        vinculo: string;
        permissoes: string[] | null;
        ultimo_lancamento_em: string | null;
      }[]
    | null;
}

/**
 * Consentimento da vitrine — ancorada no CRIADOR (usuario_id), não na
 * propriedade. É a aba que responde "posso publicar a foto deste animal?", e a
 * resposta é do titular, não da fazenda.
 */
export interface LinhaVitrine {
  usuario_id: number;
  publicado: boolean;
  bloqueado_admin: boolean;
  consentido_em: string | null;
  consentido_canal: string | null;
  consentido_versao: string | null;
  /** Versão vigente do termo — se diferir da aceita, a tela destaca. */
  termo_vigente: string | null;
  revogado_em: string | null;
  revogado_motivo: string | null;
  animais_publicados: number;
  animais_ocultos: number;
  atualizado_em: string | null;
}

export interface LinhaConsultor {
  usuario_id: number;
  nome: string;
  email_mascarado: string | null;
  profissao: string | null;
  especialidade: string | null;
  habilitacao_aml_status: string | null;
  vinculos_ativos: number;
  limite_propriedades: number | null;
  plano_nome: string | null;
  status_efetivo: string | null;
  valor_real_mensal: number | null;
  animais_sob_consultoria: number;
  amls_90d: number;
  medidas_90d: number;
  visitas_90d: number;
  ativo: boolean;
  /** vinculos_ativos >= limite: oportunidade de upgrade, dinheiro na tela. */
  carteira_cheia: boolean;
}

export interface LinhaCarteiraConsultor {
  usuario_id: number;
  propriedade_id: number;
  propriedade_nome: string;
  nome_proprietario: string | null;
  estado: string | null;
  status_vinculo: string | null;
  data_vinculo: string | null;
  animais_ativos: number;
  ultimo_lancamento_em: string | null;
  amls_90d: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Abas — a ordem e os rótulos ficam aqui para o layout e o dossiê concordarem
// ─────────────────────────────────────────────────────────────────────────────

export interface AbaCliente {
  /** Segmento da rota sob /adm/u/[id]. String vazia = a aba raiz. */
  slug: string;
  rotulo: string;
  /** Fase 2 nasce escondida do dossiê; a Visão geral e a Produção não. */
  noDossie: boolean;
}

export const ABAS_CLIENTE: AbaCliente[] = [
  { slug: '', rotulo: 'Visão geral', noDossie: true },
  { slug: 'rebanho', rotulo: 'Rebanho', noDossie: true },
  { slug: 'producao', rotulo: 'Produção', noDossie: true },
  { slug: 'reproducao', rotulo: 'Reprodução', noDossie: true },
  { slug: 'sanidade', rotulo: 'Sanidade', noDossie: false },
  { slug: 'crescimento', rotulo: 'Crescimento', noDossie: true },
  { slug: 'avaliacoes', rotulo: 'Avaliações', noDossie: true },
  { slug: 'financeiro', rotulo: 'Financeiro', noDossie: false },
  { slug: 'estrutura', rotulo: 'Estrutura', noDossie: false },
  { slug: 'equipe', rotulo: 'Equipe', noDossie: false },
  { slug: 'vitrine', rotulo: 'Vitrine', noDossie: false },
  { slug: 'assinatura', rotulo: 'Assinatura', noDossie: false },
  { slug: 'tabelas', rotulo: 'Tabelas', noDossie: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// FASE 3 — a carteira em profundidade e o benchmark
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mesma regra da Fase 2: nome declarado aqui, SQL implementa, TypeScript
 * consome, `adm_05` falha se faltar. Ver o cabeçalho deste arquivo.
 */
export const VIEWS_FASE_3 = {
  coorte: 'coorte_retencao',
  benchmarkReferencia: 'benchmark_referencia',
  benchmarkPropriedade: 'benchmark_propriedade',
  cobrancas: 'cobrancas_lista',
} as const;

export type ViewFase3 = (typeof VIEWS_FASE_3)[keyof typeof VIEWS_FASE_3];
export const NOMES_VIEWS_FASE_3: ViewFase3[] = Object.values(VIEWS_FASE_3);

/**
 * As métricas comparáveis entre criadores. Fechada de propósito: benchmark é
 * uma afirmação sobre o negócio do cliente, e cada métrica aqui precisou de uma
 * decisão sobre denominador, janela e unidade. Acrescentar uma é trabalho de
 * produto, não de implementação.
 */
export const METRICAS_BENCHMARK = [
  'producao_por_lactante_dia',
  'custo_litro',
  'taxa_prenhez',
  'gmd_medio',
  'taxa_mortalidade',
  'intervalo_partos_dias',
] as const;

export type MetricaBenchmark = (typeof METRICAS_BENCHMARK)[number];

export interface MetricaInfo {
  rotulo: string;
  unidade: string;
  /** Casas decimais na exibição. */
  casas: number;
  /** true quando MAIOR é melhor. Vira a direção da seta e a cor do desvio. */
  maiorEhMelhor: boolean;
  /** Uma frase que explica o número para o criador, não para o operador. */
  explicacao: string;
}

export const BENCHMARK_INFO: Record<MetricaBenchmark, MetricaInfo> = {
  producao_por_lactante_dia: {
    rotulo: 'Produção por lactante/dia',
    unidade: 'L',
    casas: 2,
    maiorEhMelhor: true,
    explicacao: 'Quanto cada fêmea em lactação entrega por dia, em média, nos últimos 90 dias.',
  },
  custo_litro: {
    rotulo: 'Custo por litro',
    unidade: 'R$',
    casas: 2,
    maiorEhMelhor: false,
    explicacao: 'O custo de produzir um litro, pela estimativa mais recente cadastrada no app.',
  },
  taxa_prenhez: {
    rotulo: 'Taxa de prenhez',
    unidade: '%',
    casas: 0,
    maiorEhMelhor: true,
    explicacao: 'Diagnósticos positivos sobre diagnósticos feitos, nos últimos 12 meses.',
  },
  gmd_medio: {
    rotulo: 'Ganho de peso diário',
    unidade: 'kg/dia',
    casas: 3,
    maiorEhMelhor: true,
    explicacao: 'O ganho médio entre pesagens consecutivas do mesmo animal.',
  },
  taxa_mortalidade: {
    rotulo: 'Mortalidade',
    unidade: '%',
    casas: 1,
    maiorEhMelhor: false,
    explicacao: 'Óbitos sobre o rebanho médio, nos últimos 12 meses.',
  },
  intervalo_partos_dias: {
    rotulo: 'Intervalo entre partos',
    unidade: 'dias',
    casas: 0,
    maiorEhMelhor: false,
    explicacao: 'Quantos dias, em média, entre um parto e o seguinte da mesma fêmea.',
  },
};

/**
 * A régua: uma linha por (segmento, métrica).
 *
 * SEMPRE por segmento. Comparar caprino leiteiro com ovino de corte não é
 * benchmark, é ruído — e o número resultante daria uma conversa comercial
 * errada com os dois criadores.
 */
export interface LinhaBenchmarkReferencia {
  segmento: string;
  metrica: MetricaBenchmark;
  /**
   * Quantas propriedades entraram no cálculo. A tela ESCONDE a comparação
   * abaixo de MINIMO_BENCHMARK: com 3 fazendas, "a mediana da carteira" é uma
   * frase que soa estatística e não é.
   */
  n: number;
  p25: number | null;
  mediana: number | null;
  p75: number | null;
}

/** O valor de UMA propriedade na mesma métrica — o outro lado da comparação. */
export interface LinhaBenchmarkPropriedade {
  propriedade_id: number;
  segmento: string;
  metrica: MetricaBenchmark;
  valor: number | null;
}

/**
 * Abaixo disto a comparação não é publicada. Sete é o menor número em que um
 * quartil ainda separa alguma coisa; abaixo, "mediana" é só o valor do vizinho.
 */
export const MINIMO_BENCHMARK = 7;

/**
 * Coorte de retenção: uma linha por (mês de entrada, mês de vida). O gráfico é
 * a matriz triangular clássica.
 */
export interface LinhaCoorte {
  /** 'YYYY-MM' do cadastro. */
  coorte: string;
  /** 0 = mês de entrada, 1 = mês seguinte... */
  mes: number;
  /** Contas que entraram nessa coorte (repetido em toda linha dela). */
  tamanho: number;
  /** Quantas ainda estavam ativas nesse mês de vida. */
  ativos: number;
  /** ativos / tamanho, 0..1. */
  retencao: number;
}

/** Uma cobrança, para /adm/carteira/receita. */
export interface LinhaCobranca {
  pagamento_id: number;
  usuario_id: number | null;
  usuario_nome: string | null;
  plano_nome: string | null;
  valor: number | null;
  status: string | null;
  metodo_pagamento: string | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  /** Vencida e não paga. */
  inadimplente: boolean;
  dias_de_atraso: number | null;
}
