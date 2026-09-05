/**
 * Contrato de tipos do /adm. ESTE ARQUIVO É A FONTE ÚNICA DE VERDADE — toda
 * camada (SQL, queries, componentes, páginas) se refere a estes nomes.
 *
 * Regra que atravessa o arquivo inteiro: nenhum campo cru e sensível existe
 * aqui. O CPF nunca é projetado (só `tem_cpf`), e-mail e whatsapp chegam
 * mascarados das views `adm.*`. O valor cru só sai por RPC dedicada, com
 * registro em auditoria — ver docs/internal/ADM_DASHBOARD_DESENHO.md §LGPD.
 *
 * Decisões travadas pelo Felipe em 04/09/2026 e refletidas aqui:
 *   D1  "número do usuário" = usuarios.id (não numero_criador, não um novo)
 *   D2  sinal de vida = último lançamento, não último login (auth.users fora)
 *   D3  MVP é somente leitura — nenhum tipo de mutação neste arquivo
 *   D4  PDF é peça comercial (página /dossie com print CSS), não relatório cru
 */

// ─────────────────────────────────────────────────────────────────────────────
// Resultado — distingue "vazio" de "quebrado" de "sem configuração"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toda query do /adm devolve isto. O padrão do repo (vitrine-server.ts) é nunca
 * lançar por falta de env: a página precisa conseguir dizer "falta configurar"
 * em vez de estourar um 500 sem explicação.
 */
export type Resultado<T> =
  | { ok: true; dados: T }
  | { ok: false; motivo: 'sem-config'; detalhe: string }
  | { ok: false; motivo: 'erro'; detalhe: string };

export function ok<T>(dados: T): Resultado<T> {
  return { ok: true, dados };
}

export function semConfig<T>(detalhe: string): Resultado<T> {
  return { ok: false, motivo: 'sem-config', detalhe };
}

export function erro<T>(detalhe: string): Resultado<T> {
  return { ok: false, motivo: 'erro', detalhe };
}

// ─────────────────────────────────────────────────────────────────────────────
// Papéis e status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * usuarios.regra_de_acesso — o papel CANÔNICO. Nunca usar tipo_usuario_id:
 * é dado sujo (o Admin Geral real tem tipo_usuario_id = 2) e o branch de admin
 * global do helper app_propriedades_acessiveis() está morto por causa disso.
 */
export type Papel = 'administrador' | 'admin_associacao' | 'produtor' | 'tecnico' | 'colaborador';

export const PAPEIS: Papel[] = ['administrador', 'admin_associacao', 'tecnico', 'produtor', 'colaborador'];

/** Rótulo e cor de cada papel — espelha lista_usuarios_widget.dart:259-272 do app. */
export const PAPEL_INFO: Record<Papel, { rotulo: string; classe: string }> = {
  administrador: { rotulo: 'Admin', classe: 'text-sky-300 border-sky-900/60 bg-sky-950/40' },
  admin_associacao: { rotulo: 'Admin assoc.', classe: 'text-violet-300 border-violet-900/60 bg-violet-950/40' },
  tecnico: { rotulo: 'Técnico', classe: 'text-emerald-300 border-emerald-900/60 bg-emerald-950/40' },
  produtor: { rotulo: 'Produtor', classe: 'text-amber-300 border-amber-900/60 bg-amber-950/40' },
  colaborador: { rotulo: 'Colaborador', classe: 'text-indigo-300 border-indigo-900/60 bg-indigo-950/40' },
};

/** view_status_assinatura.status_efetivo — nunca ler assinaturas.status cru. */
export type StatusEfetivo = 'ativa' | 'trial' | 'pendente' | 'cancelada' | 'vencida';

/**
 * De onde vem o acesso de uma conta. Os quatro baldes NÃO se sobrepõem — é o
 * que permite o card da carteira somar sem contar ninguém duas vezes.
 */
export type OrigemAcesso = 'pagante' | 'trial' | 'cortesia' | 'extensao';

export const ORIGEM_ACESSO_ROTULO: Record<OrigemAcesso, string> = {
  pagante: 'Pagante',
  trial: 'Trial',
  cortesia: 'Cortesia',
  extensao: 'Extensão manual',
};

/** propriedades.segmentos — text[] de valores fechados. */
export type Segmento = 'caprino_leiteiro' | 'caprino_corte' | 'ovino_leiteiro' | 'ovino_corte';

export const SEGMENTO_ROTULO: Record<Segmento, string> = {
  caprino_leiteiro: 'Caprino leiteiro',
  caprino_corte: 'Caprino corte',
  ovino_leiteiro: 'Ovino leiteiro',
  ovino_corte: 'Ovino corte',
};

// ─────────────────────────────────────────────────────────────────────────────
// Lista mestra de usuários — view adm.usuarios_lista
// ─────────────────────────────────────────────────────────────────────────────

export interface UsuarioLista {
  /** D1 — usuarios.id. A identidade primária do painel. */
  id: number;
  nome: string;
  /** Já mascarado na view. Colaborador tem sintético @colaborador.seabra. */
  email_mascarado: string | null;
  /** Já mascarado na view. E.164 sem '+', vindo de whatsapp_pessoal. */
  whatsapp_mascarado: string | null;
  whatsapp_pais: string | null;
  papel: Papel | null;
  ativo: boolean;
  is_tester: boolean;
  is_demo: boolean;
  /** Nunca o CPF em si — só se existe (LGPD). */
  tem_cpf: boolean;
  /** True quando usuarios.uuid é NULL: conta que não loga pelo Supabase Auth. */
  sem_auth: boolean;
  onboarding_finalizado: boolean;
  data_cadastro: string | null;

  associacao_id: number | null;
  associacao_nome: string | null;

  /** Propriedade principal resolvida por papel — ver resolverEscopo(). */
  propriedade_id: number | null;
  propriedade_nome: string | null;
  numero_criador: string | null;
  estado: string | null;
  segmentos: Segmento[];
  /** >1 significa que o seletor de propriedade não pode colapsar. */
  total_propriedades: number;

  animais_ativos: number;

  plano_nome: string | null;
  status_efetivo: StatusEfetivo | null;
  acesso_ativo: boolean;
  origem_acesso: OrigemAcesso | null;
  /** Já normalizado por ciclo — ver mrrMensalSql() em queries.ts. */
  valor_real_mensal: number | null;
  data_vencimento: string | null;

  /** D2 — o sinal de vida. Null = nunca lançou nada. */
  ultimo_lancamento_em: string | null;
  ultimo_modulo: string | null;
  lancamentos_30d: number;
  /** Entradas dos componentes 2, 3 e 5 do health score — o que permite a ficha
   *  DECOMPOR o número, e não só exibi-lo. Ver calcularHealthScore(). */
  dias_distintos_30d: number;
  modulos_90d: number;
  animais_com_evento_90d: number;
  dias_sem_lancar: number | null;
  health_score: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Escopo — o seletor de dois níveis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O tenant real do banco é propriedade_id (93 tabelas o carregam), não
 * usuario_id. Resolver o escopo é traduzir "um usuário" para "quais
 * propriedades", e a regra muda por papel:
 *
 *   produtor          propriedades.produtor_id
 *   colaborador       herda usuarios.propriedade_id (dados são do produtor dono)
 *   tecnico           tecnico_propriedades com status='ativo' (propriedade_id é NULL nele)
 *   admin_associacao  agregado dos filiados
 *   administrador     tudo
 *
 * Calculado em SQL com service_role, NUNCA pela RLS — o branch de admin global
 * do helper app_propriedades_acessiveis() testa tipo_usuario_id = 1 e está morto.
 */
export interface PropriedadeEscopo {
  id: number;
  nome: string;
  numero_criador: string | null;
  estado: string | null;
  cidade: string | null;
  segmentos: Segmento[];
  /** Como este usuário alcança esta propriedade. */
  vinculo: 'dono' | 'herdado' | 'consultoria' | 'associacao';
  /** Preenchido quando vinculo !== 'dono': de quem são os dados. */
  dono_nome: string | null;
  animais_ativos: number;
}

export interface Escopo {
  usuario: UsuarioLista;
  propriedades: PropriedadeEscopo[];
  /** A propriedade em foco (?prop=<id>), ou a única, ou null se não há nenhuma. */
  selecionada: PropriedadeEscopo | null;
  /** True quando o seletor deve virar rótulo estático (1 propriedade só). */
  colapsado: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Carteira — a visão agregada do negócio
// ─────────────────────────────────────────────────────────────────────────────

export interface KpisCarteira {
  /** Os quatro baldes de acesso, mutuamente exclusivos. */
  acesso: Record<OrigemAcesso, number>;
  contasComAcesso: number;
  contasTotal: number;

  /**
   * MRR honesto: normalizado por ciclo, com DISTINCT ON por usuário
   * (assinaturas NÃO tem UNIQUE por usuario_id) e cortesia fora.
   */
  mrrReal: number;
  /** O que o app mostra hoje: soma de valor_mensal (preço de TABELA). */
  mrrTabela: number;
  arpu: number;

  /** MRR de quem vence em ≤7 dias somado ao de quem tem pagamento vencido. */
  receitaEmRisco: number;
  vencendo7d: number;
  inadimplentes: number;

  propriedades: number;
  animaisAtivos: number;

  /** Contas com ≥1 lançamento na janela — por PROPRIEDADE (ver D2). */
  mau: number;
  wau: number;
  dau: number;

  /** Sem lançar há mais de 30 dias, mas com acesso ativo. */
  silenciosos: number;
  nuncaLancaram: number;
}

export interface PontoSerie {
  /** ISO 'YYYY-MM' para série mensal, 'YYYY-MM-DD' para diária. */
  periodo: string;
  valor: number;
}

export interface FatiaDistribuicao {
  rotulo: string;
  valor: number;
}

export interface Carteira {
  kpis: KpisCarteira;
  receitaMensal: PontoSerie[];
  novosClientesMensal: PontoSerie[];
  porSegmento: FatiaDistribuicao[];
  porEstado: FatiaDistribuicao[];
  porPlano: FatiaDistribuicao[];
  /** As três listas de ação da home. */
  riscoSilencio: UsuarioLista[];
  riscoCobranca: UsuarioLista[];
  riscoTrial: UsuarioLista[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard de uma propriedade
// ─────────────────────────────────────────────────────────────────────────────

export interface VisaoGeralPropriedade {
  animaisAtivos: number;
  animaisInativos: number;
  femeas: number;
  machos: number;
  lactantes: number;
  gestantes: number;
  mediaDel: number | null;
  producao30d: number | null;
  mediaProducaoDia: number | null;
  mediaPorLactanteDia: number | null;
  lancamentos30d: number;
  diasSemLancar: number | null;
  colaboradores: number;
  tecnicosVinculados: number;
  /** rebanho.categoria guarda o UUID — já resolvido para nome via categoria_animal. */
  porCategoria: FatiaDistribuicao[];
  porRaca: FatiaDistribuicao[];
  piramideEtaria: FatiaDistribuicao[];
  producaoDiaria90d: PontoSerie[];
}

/** Uma linha de assinatura já normalizada, pronta para a aba Assinatura. */
export interface AssinaturaResumo {
  planoNome: string | null;
  /** NUNCA plano_id_pendente: é upgrade contratado e não pago. */
  planoPendenteNome: string | null;
  statusEfetivo: StatusEfetivo | null;
  acessoAtivo: boolean;
  origemAcesso: OrigemAcesso | null;
  valorRealMensal: number | null;
  valorTabelaMensal: number | null;
  ciclo: string | null;
  dataInicio: string | null;
  dataVencimento: string | null;
  extensaoManualAte: string | null;
  diasRestantes: number | null;
  totalPago: number;
  emAberto: number;
  descontoAssociacao: boolean;
}

export interface PagamentoLinha {
  id: number;
  asaas_payment_id: string | null;
  valor: number | null;
  status: string | null;
  metodo_pagamento: string | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  tipo_cobranca: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health score — 5 componentes, 0-100
// ─────────────────────────────────────────────────────────────────────────────

export interface ComponenteHealth {
  chave: 'recencia' | 'frequencia' | 'amplitude' | 'cobranca' | 'profundidade';
  rotulo: string;
  peso: number;
  /** 0..1 já normalizado e com clamp. */
  norm: number;
  /** O valor cru, para explicar o número na tela. */
  detalhe: string;
}

export interface HealthScore {
  total: number;
  componentes: ComponenteHealth[];
  faixa: 'saudavel' | 'atencao' | 'risco';
}

// ─────────────────────────────────────────────────────────────────────────────
// Registro declarativo de tabelas — o escape hatch
// ─────────────────────────────────────────────────────────────────────────────

export type TipoColuna = 'texto' | 'numero' | 'data' | 'datahora' | 'booleano' | 'json' | 'uuid';

export interface ColunaRegistro {
  chave: string;
  rotulo: string;
  tipo: TipoColuna;
  /** Colunas de família 'essencial' formam o preset inicial de colunas visíveis. */
  familia: 'essencial' | 'detalhe' | 'tecnica';
  /** Vira chip de filtro facetado quando presente. */
  faceta?: 'enum' | 'intervalo' | 'data' | 'booleano';
  /** Resolve FK para rótulo legível — ex.: rebanho.categoria (uuid) → nome. */
  referencia?: { tabela: string; chave: string; rotulo: string };
}

export interface TabelaRegistro {
  /** Nome real no Postgres. */
  nome: string;
  rotulo: string;
  descricao: string;
  /** Como esta tabela se amarra ao tenant. 'nenhuma' = catálogo global. */
  colunaTenant: 'propriedade_id' | 'usuario_id' | 'animal_id' | 'nenhuma';
  /** Coluna de data usada na ordenação default e no filtro de período. */
  colunaData: string | null;
  colunas: ColunaRegistro[];
  /** Nunca projetadas, nem por engano: senha, hash, CPF. */
  colunasBloqueadas: string[];
  /** Aba curada que já cobre esta tabela, se houver. */
  area: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessão do /adm
// ─────────────────────────────────────────────────────────────────────────────

export interface SessaoAdm {
  /** Login do operador (ADM_USUARIO). */
  sub: string;
  /** Id da sessão — permite revogar sem trocar o segredo global. */
  sid: string;
  /** Emissão, expiração absoluta (8h) e de inatividade (30min), em ms. */
  iat: number;
  absExp: number;
  idleExp: number;
  /** Versão global — incrementar derruba todas as sessões. */
  v: number;
}

/** Eventos gravados na trilha de auditoria (Marco Civil art. 15 / LGPD art. 37). */
export type EventoAuditoria =
  | 'login_ok'
  | 'login_falha'
  | 'logout'
  | 'abriu_carteira'
  | 'abriu_usuario'
  | 'abriu_tabela'
  | 'exportou'
  | 'revelou_contato';
