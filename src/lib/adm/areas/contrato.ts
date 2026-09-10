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
  /**
   * Fêmeas ativas cuja cobertura mais recente ainda não tem DG lançado depois
   * dela, até o teto biológico de 155 dias. Ordenado por dias_desde_cobertura
   * decrescente (a mais atrasada primeiro) — ver o comentário da view em
   * adm_07_areas.sql para a regra exata.
   */
  dg_pendentes: LinhaDgPendente[] | null;
}

/** Um item da lista de DG pendente — ver `LinhaReproducao.dg_pendentes`. */
export interface LinhaDgPendente {
  numero_animal: string;
  nome_animal: string | null;
  /** Nome da baia, ou null quando o animal não tem baia cadastrada. */
  baia: string | null;
  /** 'YYYY-MM-DD' */
  data_ultima_cobertura: string;
  dias_desde_cobertura: number;
  /** 'Monta controlada' | 'Monta livre' | 'Inseminação' | 'Transferência de embrião' */
  tipo_cobertura: string;
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
// CONTROLE LEITEIRO — a pesagem individual, implementada em adm_12_leite.sql
//
// Mesma regra das fases anteriores: nome declarado aqui, SQL implementa,
// TypeScript consome.
//
// A DIFERENÇA DESTAS DUAS para as views de área: elas NÃO têm uma linha por
// propriedade. A pergunta que respondem ("o que deu o controle do dia 09/03")
// tem uma data no meio, e a data é escolhida na tela — então as views são
// filtráveis por (propriedade_id, data_controle) em vez de entregarem um jsonb
// com uma data que o SQL escolheu sozinho.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_LEITE = {
  animais: 'controle_leiteiro_animal',
  sessoes: 'controle_leiteiro_sessoes',
} as const;

export type ViewLeite = (typeof VIEWS_LEITE)[keyof typeof VIEWS_LEITE];
export const NOMES_VIEWS_LEITE: ViewLeite[] = Object.values(VIEWS_LEITE);

/** Uma linha por (propriedade, dia de controle, animal) — as ordenhas somadas. */
export interface LinhaControleAnimal {
  propriedade_id: number;
  /** 'YYYY-MM-DD' */
  data_controle: string;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  baia: string | null;
  /** sum(litros_produzidos) do dia — nunca `total_produzido`, que está nulo em 39% dos casos. */
  litros: number;
  /** Quantas ordenhas do dia entraram na soma (1 ou 2 no uso normal). */
  ordenhas: number;
  /** null = DEL não medido naquele controle (metade das linhas do banco). */
  del: number | null;
}

/** Resumo de um dia de controle — alimenta o seletor de data e a série histórica. */
export interface LinhaSessaoControle {
  propriedade_id: number;
  /** 'YYYY-MM-DD' */
  data_controle: string;
  animais: number;
  animais_com_leite: number;
  litros_total: number;
  /** litros ÷ animais que deram leite. null quando nenhum deu. */
  media_com_leite: number | null;
  del_medio: number | null;
  /** Denominador do DEL médio — "91 dias" sobre 3 animais não é o mesmo que sobre 90. */
  animais_com_del: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUÇÃO DIÁRIA — o dia a dia do tanque, implementado em adm_14_producao.sql
//
// A aba Produção mostra 30/90 dias em card e série. Esta view sustenta a tela
// que responde o que aquela não responde: QUAIS dias faltam, quanto vem de cada
// ordenha, e como a produtividade por lactante andou — que é a métrica que sobe
// quando o rebanho melhora e o volume total esconde quando o plantel encolhe.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_PRODUCAO = {
  dia: 'producao_dia',
} as const;

export type ViewProducao = (typeof VIEWS_PRODUCAO)[keyof typeof VIEWS_PRODUCAO];
export const NOMES_VIEWS_PRODUCAO: ViewProducao[] = Object.values(VIEWS_PRODUCAO);

export interface LinhaProducaoDia {
  propriedade_id: number;
  /** 'YYYY-MM-DD'. PODE ESTAR NO FUTURO: 1.500 linhas de uma propriedade estão
   *  datadas entre 2035 e 2039. Quem separa é `separarFuturos()`. */
  data: string;
  /** `total_producao` — auditado, bate 100% com a soma das duas ordenhas. */
  litros: number;
  litros_1_ordenha: number | null;
  litros_2_ordenha: number | null;
  lactantes: number;
  /** litros ÷ lactantes. null quando não há lactante lançado no dia. */
  litros_por_lactante: number | null;
  /** 'duas_ordenhas' | 'ordenha_1' | 'ordenha_2' */
  modo: string | null;
  observacao: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LACTAÇÕES — a lactação como unidade, implementada em adm_15_lactacoes.sql
//
// `lactacao` é a única tabela de lançamento SEM propriedade_id: o tenant só
// existe via animal, e a view faz esse join. Quem consumir sem filtrar por
// propriedade_id soma a carteira inteira.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_LACTACAO = {
  detalhe: 'lactacao_detalhe',
} as const;

export type ViewLactacao = (typeof VIEWS_LACTACAO)[keyof typeof VIEWS_LACTACAO];
export const NOMES_VIEWS_LACTACAO: ViewLactacao[] = Object.values(VIEWS_LACTACAO);

export interface LinhaLactacao {
  propriedade_id: number;
  lactacao_id: number;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  /** Preenchida em 100% das linhas — é o que permite comparar 1ª cria com as seguintes. */
  ordem_parto: number | null;
  /** 'YYYY-MM-DD' */
  data_inicio: string;
  /** coalesce(data_fim, data_termino). null = lactação ainda aberta. */
  data_encerramento: string | null;
  aberta: boolean;
  /**
   * Dias em lactação, CRU. Vem sujo: 1.418 linhas com valor ≤ 0 (min -59) e 119
   * acima de 600 dias (max 3.593). Só os positivos entram em média.
   */
  dias: number | null;
  /** Zero em 1.756 lactações — quase sempre lactação aberta que ainda não acumulou. */
  total_leite: number | null;
  /** Auditado: bate com total_leite ÷ dias em 4.974 de 4.974 casos. */
  media_leite: number | null;
  /** 'DEFINITIVO' | 'INFERIDO' | 'ESTIMATIVA' | 'sintetico' | null — a procedência do número. */
  confianca: string | null;
  metodo: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AML — a avaliação morfológica linear, implementada em adm_16_aml.sql
//
// A aba Avaliações mostra o radar dos 16 pontos e a pontuação mensal. Esta view
// sustenta a tela que responde QUEM foi avaliado, com que nota, e quanto do
// rebanho já passou pelo avaliador.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_AML = {
  detalhe: 'aml_detalhe',
} as const;

export type ViewAml = (typeof VIEWS_AML)[keyof typeof VIEWS_AML];
export const NOMES_VIEWS_AML: ViewAml[] = Object.values(VIEWS_AML);

export interface LinhaAml {
  propriedade_id: number;
  aml_id: number;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  sexo: string | null;
  /** 'YYYY-MM-DD' */
  data_avaliacao: string;
  tecnico_id: number | null;
  /** CRU: mistura sexo e tipo de ficha, com acento inconsistente ('fêmea' e 'femea'). */
  tipo: string | null;
  /** 0 a 100 — a nota composta. Aqui, e só aqui, maior é melhor. */
  pontuacao_total: number | null;

  /** Os nove pontos de corpo — presentes em toda avaliação. Escala 1 a 9. */
  p1_mobilidade: number | null;
  p2_largura_peito: number | null;
  p3_profundidade_corporal: number | null;
  p4_angulo_garupa: number | null;
  p6_membros_lateral: number | null;
  p8_capacidade: number | null;
  p9_largura_garupa: number | null;
  p15_membros_anterior: number | null;
  p16_estrutura_ossea: number | null;

  /** Os sete de úbere — NULOS em macho, por ausência do órgão. */
  p5_profundidade_ubere: number | null;
  p7_ligamento_anterior: number | null;
  p10_ligamento_posterior: number | null;
  p11_volume_ubere: number | null;
  p12_ligamento_suspensorio: number | null;
  p13_posicao_tetos: number | null;
  p14_diametro_tetos: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIDAS — a fita métrica, implementada em adm_17_medidas.sql
//
// Irmã da AML: mesmo técnico, mesma visita, mesmo animal. A AML dá a NOTA, a
// medida dá o CENTÍMETRO — e as duas compartilham a coluna `tipo` suja, tratada
// pela MESMA `normalizarTipo()`.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_MEDIDA = {
  detalhe: 'medida_detalhe',
} as const;

export type ViewMedida = (typeof VIEWS_MEDIDA)[keyof typeof VIEWS_MEDIDA];
export const NOMES_VIEWS_MEDIDA: ViewMedida[] = Object.values(VIEWS_MEDIDA);

export interface LinhaMedida {
  propriedade_id: number;
  medida_id: number;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  sexo: string | null;
  /** 'YYYY-MM-DD' */
  data_medida: string;
  tecnico_id: number | null;
  /** CRU — mesmas grafias sujas da AML ('fêmea' e 'femea'). */
  tipo: string | null;

  /** Centímetros. Vem com 7 valores implausíveis (abaixo de 30 cm) de propósito. */
  perimetro_toracico: number | null;
  altura: number | null;
  altura_garupa: number | null;
  largura_peito: number | null;
  largura_garupa: number | null;

  /** Úbere — só em fêmea. */
  ligamento_posterior: number | null;
  ligamento_suspensorio: number | null;
  volume_ubere: number | null;
  diametro_tetos: number | null;

  /** Só em macho: 14 das 155 medições. */
  circunferencia_escrotal: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// REBANHO — inventário e fluxo, implementados em adm_18_rebanho.sql
//
// A aba Rebanho conta o efetivo e reparte por categoria, raça e idade. Estas
// views respondem o que ela não responde: POR ONDE os animais saíram — e o
// achado que motivou o arquivo é que 79% dos inativos da base saíram sem motivo
// nenhum registrado, com o padrão variando de 0% a 100% conforme a fazenda.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_REBANHO = {
  animal: 'rebanho_animal',
  inventario: 'rebanho_inventario',
} as const;

export type ViewRebanho = (typeof VIEWS_REBANHO)[keyof typeof VIEWS_REBANHO];
export const NOMES_VIEWS_REBANHO: ViewRebanho[] = Object.values(VIEWS_REBANHO);

/** 'ativo' | 'venda' | 'obito' | 'descarte' | 'sem_motivo' */
export type MotivoSaida = 'ativo' | 'venda' | 'obito' | 'descarte' | 'sem_motivo';

export interface LinhaAnimal {
  propriedade_id: number;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  sexo: string | null;
  /** 'ativo' MINÚSCULO — o valor real da coluna. */
  status: string | null;
  categoria: string | null;
  baia: string | null;
  data_de_nascimento: string | null;
  idade_dias: number | null;
  peso_atual: number | null;
  dias_em_lactacao: number | null;
  ordem_parto: number | null;
  gestacao_ativa: boolean | null;
  status_reproducao: string | null;
  data_venda: string | null;
  motivo_saida: MotivoSaida;
}

export interface LinhaInventario {
  propriedade_id: number;
  ativos: number;
  inativos: number;
  saida_venda: number;
  saida_obito: number;
  saida_descarte: number;
  /** O balde que torna mortalidade e descarte incalculáveis quando é grande. */
  saida_sem_motivo: number;
  /** Buracos de cadastro, só no efetivo ativo. */
  sem_categoria: number;
  sem_sexo: number;
  sem_baia: number;
  sem_nascimento: number;
  /** Contradições: aparece no efetivo e não existe mais. */
  ativos_com_obito: number;
  ativos_com_venda: number;
  /** (serie 'nascimentos' | 'vendas' | 'obitos', periodo 'YYYY-MM', valor) — 24 meses. */
  fluxo_mensal: PontoSerieNomeada[] | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ÓBITOS — o detalhe de cada morte, implementado em adm_13_obitos.sql
//
// A aba Sanidade responde "quantos morreram e a que taxa" (12 meses, série,
// top 8 de suspeitas). Esta view responde a pergunta que decide manejo: QUEM
// morreu, com que idade e de quê — mortalidade de neonato é colostro e higiene
// de baia, mortalidade de adulto é outro assunto, e as duas somam no mesmo card.
// ─────────────────────────────────────────────────────────────────────────────

export const VIEWS_OBITO = {
  detalhe: 'obito_detalhe',
} as const;

export type ViewObito = (typeof VIEWS_OBITO)[keyof typeof VIEWS_OBITO];
export const NOMES_VIEWS_OBITO: ViewObito[] = Object.values(VIEWS_OBITO);

export interface LinhaObito {
  propriedade_id: number;
  obito_id: number;
  animal_id: number;
  numero_animal: string;
  nome_animal: string | null;
  /** 'fêmea' COM ACENTO ou 'macho' — os valores reais da coluna. */
  sexo: string | null;
  categoria: string | null;
  baia: string | null;
  /** 'YYYY-MM-DD' */
  data_obito: string;
  data_de_nascimento: string | null;
  /**
   * Idade ao morrer, em dias. null quando o animal não tem data de nascimento
   * (9% da base). PODE SER NEGATIVA: 10 óbitos têm nascimento lançado depois da
   * morte, e a view entrega o número como está de propósito — quem classifica é
   * `faixasEtarias()`, que dá a esses uma faixa própria em vez de escondê-los.
   */
  idade_dias: number | null;
  /** Vazio quando ninguém anotou — 61% dos óbitos de hoje. */
  suspeitas: string[];
  diagnostico_obito: string | null;
  sinais_clinicos: string | null;
  observacao: string | null;
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
  // Fase 3. Entra antes de Tabelas porque o escape hatch é o fim da lista por
  // desenho (é o catálogo cru, não uma área), e `noDossie: true` porque a
  // comparação com a mediana do segmento é justamente o que dá valor comercial
  // à peça em PDF — ver a proposta de conteúdo do dossiê no §D4 do desenho.
  { slug: 'benchmark', rotulo: 'Benchmark', noDossie: true },
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
  propriedades: 'propriedades_lista',
  pagamentosPorCliente: 'pagamentos_por_cliente',
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
    explicacao: 'Quanto cada fêmea em lactação entrega por dia, em média, nos últimos 30 dias.',
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
 * Dias sem lançamento a partir dos quais uma fazenda com acesso ativo é
 * "silenciosa" — a regra de risco mais usada do painel.
 *
 * Mora AQUI, e não no módulo da área, porque o Client Component da lista também
 * precisa dela para a faceta de atividade: um `server-only` não pode ser
 * importado de lá, e duas cópias do número fariam o card "Silenciosas há +30
 * dias" abrir uma lista com outra quantidade — sem erro de compilação nenhum.
 */
export const DIAS_SILENCIO = 30;

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

/**
 * O DIRETÓRIO DE PROPRIEDADES — `adm.propriedades_lista`.
 *
 * Por que existe uma lista de PROPRIEDADES ao lado da de usuários: o tenant
 * real do banco é `propriedade_id` (93 tabelas o carregam), e é a fazenda que o
 * Felipe gere — o usuário é só quem loga nela. Uma conta pode ter duas
 * fazendas; uma fazenda de consultoria pode não ter produtor nenhum no sistema.
 * Nos dois casos a lista de usuários responde a pergunta errada.
 *
 * A linha NÃO abre uma tela nova: ela navega para a ficha que já existe,
 * `/adm/u/<dono>?prop=<id>`. Uma segunda ficha de propriedade duplicaria as 13
 * abas para ganhar nada.
 */
export interface LinhaPropriedade {
  id: number;
  nome: string;
  numero_criador: string | null;
  cidade: string | null;
  estado: string | null;
  segmentos: string[];

  /**
   * O dono, quando existe. NULL numa fazenda de consultoria: o técnico atende
   * um cliente que não usa o app, e a tela precisa dizer isso em vez de mostrar
   * um espaço vazio que parece dado faltando.
   */
  produtor_id: number | null;
  produtor_nome: string | null;

  animais_ativos: number;
  lactantes: number;

  /** D2 — o sinal de vida, o mesmo da lista de usuários. */
  ultimo_lancamento_em: string | null;
  ultimo_modulo: string | null;
  lancamentos_30d: number;
  dias_sem_lancar: number | null;

  /** Quem mais trabalha nesta fazenda. É a "relação de colaboradores" da lista. */
  colaboradores: number;
  tecnicos_vinculados: number;

  /** Da assinatura do DONO — a fazenda não assina, o produtor assina. */
  plano_nome: string | null;
  status_efetivo: string | null;
  acesso_ativo: boolean;

  health_score: number | null;
}

/**
 * QUEM PAGOU E QUANTO — `adm.pagamentos_por_cliente`.
 *
 * Uma linha por cliente que já teve alguma cobrança, com o total do HISTÓRICO
 * INTEIRO. É a pergunta que a tela de receita não respondia: ela mostrava
 * "recebido nos últimos 12 meses" e a lista de cobranças uma a uma, mas nunca
 * o acumulado por cliente nem o total de tudo.
 *
 * `total_pago` é histórico e NÃO é MRR: um cliente que pagou 12 meses e saiu
 * aparece com o total alto e MRR zero. Os dois números respondem perguntas
 * diferentes e a tela mostra ambos lado a lado.
 */
export interface LinhaPagamentosCliente {
  usuario_id: number;
  nome: string;
  plano_nome: string | null;
  status_efetivo: string | null;

  /** A conta está desativada? (`usuarios.ativo = false`) */
  ativo: boolean;
  /** A assinatura dá acesso hoje? São coisas diferentes — ver o filtro da tela. */
  acesso_ativo: boolean;

  pagamentos: number;
  /** Soma de tudo que ele já pagou, desde sempre. */
  total_pago: number;
  em_aberto: number;
  /** Vencido e não pago. */
  vencido: number;

  primeiro_pagamento: string | null;
  ultimo_pagamento: string | null;
  /** Meses entre o primeiro pagamento e hoje — a "idade" comercial do cliente. */
  meses_como_cliente: number | null;
  /** O que ele paga por mês hoje. 0 para quem saiu ou é cortesia. */
  mrr_atual: number | null;
}
