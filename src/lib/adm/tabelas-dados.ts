/**
 * CATÁLOGO do escape hatch — o registro declarativo de tabelas do banco do app.
 *
 * Por que um catálogo em vez de 93 telas: cada entrada aqui vira uma tela
 * completa (grade + facetas + export) sem nenhum arquivo novo em src/app. O
 * custo de cobrir uma tabela nova cai de "uma página" para "um objeto".
 *
 * ORIGEM DE CADA NOME DE COLUNA — nada aqui foi inventado. A fonte primária são
 * os DTOs gerados do banco vivo pelo FlutterFlow em
 * `seabra-app-main/lib/backend/supabase/database/tables/*.dart`, cruzados com o
 * dossiê de schema (migrations + código Dart). Onde as duas fontes divergiram, a
 * coluna está marcada com `INCERTO:` — errar um nome de coluna aqui não degrada
 * a tela, DERRUBA a query inteira (PostgREST devolve 42703 e a grade some), então
 * o viés é sempre para menos colunas confirmadas, nunca para mais colunas
 * prováveis.
 *
 * ESTE MÓDULO NÃO TOCA A `service_role` de propósito — é só dado, sem I/O. Por
 * isso NÃO leva `import 'server-only'`: um seletor de colunas do lado do cliente
 * precisa conseguir importá-lo. Nada de segredo pode entrar neste arquivo.
 *
 * Rótulos em português de criador, não em jargão de banco: quem lê a tela pensa
 * em "Nº do animal", não em `numero_animal`.
 */

import type { ColunaRegistro, TabelaRegistro, TipoColuna } from '@/lib/adm/types';

// ─────────────────────────────────────────────────────────────────────────────
// Extensão aditiva do contrato
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `TabelaRegistro` + os quatro casos que o contrato ainda não cobre. Tudo
 * opcional: um consumidor que só conhece `TabelaRegistro` continua correto —
 * ele apenas perde a precisão extra.
 *
 * Existe porque quatro tabelas reais não cabem no molde "o tenant é uma coluna
 * chamada propriedade_id": `analise_leite` (o vínculo é `id_animal`, TEXTO),
 * `pagamentos` (chega ao usuário via `assinatura_id`), e `usuarios`/`propriedades`
 * (o tenant é a própria PK, `id`). Fingir que cabem produziria uma query que
 * quebra em produção.
 */
export interface TabelaCatalogo extends TabelaRegistro {
  /**
   * Chave da rota quando difere do nome real da tabela. Só `descarte` usa:
   * descarte NÃO é tabela, é uma linha de `manejo` (ver `filtroFixo`).
   */
  slug?: string;
  /**
   * Nome FÍSICO da coluna de tenant, quando difere do balde semântico de
   * `colunaTenant`. Prefira sempre `colunaFiltroTenant()` de tabelas.ts a ler
   * `colunaTenant` como se fosse nome de coluna.
   */
  colunaTenantFisica?: string;
  /**
   * Filtro obrigatório, aplicado ANTES de qualquer filtro vindo da URL. É o que
   * permite duas telas ("Manejo" e "Descarte") sobre a mesma tabela física.
   */
  filtroFixo?: { coluna: string; op: 'contem' | 'igual'; valor: string };
  /** Por que o escopo desta tabela é indireto, e como resolvê-lo. */
  notaEscopo?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Denylist base — a última linha de defesa
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bloqueadas em TODA tabela, existam nela ou não. Aplicar por tabela seria
 * frágil: bastaria alguém acrescentar `cpf` a uma tabela nova e a coluna
 * nasceria exposta. Aqui, uma coluna com um destes nomes nunca é projetável em
 * lugar nenhum do /adm — nem na grade, nem no painel lateral, nem no CSV.
 *
 * `colaborador_senha` é senha em TEXTO PLANO (6 registros em produção, dívida
 * conhecida — docs/RLS_ROLLOUT.md:124). `cpf` nunca aparece: o painel mostra
 * apenas `tem_cpf` (LGPD, ver §LGPD do desenho).
 */
export const COLUNAS_SEMPRE_BLOQUEADAS: readonly string[] = [
  'cpf',
  'colaborador_senha',
  'colaborador_senha_hash',
];

// ─────────────────────────────────────────────────────────────────────────────
// Açúcar de declaração
// ─────────────────────────────────────────────────────────────────────────────

type Extras = Partial<Pick<ColunaRegistro, 'faceta' | 'referencia'>>;

function fabrica(familia: ColunaRegistro['familia']) {
  return (chave: string, rotulo: string, tipo: TipoColuna, extras: Extras = {}): ColunaRegistro => ({
    chave,
    rotulo,
    tipo,
    familia,
    ...extras,
  });
}

/** Preset inicial visível. Máximo 8 por tabela — acima disso a grade nasce ilegível. */
const ess = fabrica('essencial');
/** Existe, é útil, mas só quando o operador pede. */
const det = fabrica('detalhe');
/** Chaves, timestamps e campos de máquina: sai da frente por padrão. */
const tec = fabrica('tecnica');

// FKs que precisam virar rótulo. O caso crítico é REF_CATEGORIA: `rebanho.categoria`
// guarda o UUID da categoria, não o nome — comparar com 'lactante' NUNCA casa.
const REF_ANIMAL: ColunaRegistro['referencia'] = { tabela: 'rebanho', chave: 'id', rotulo: 'numero_animal' };
const REF_CATEGORIA: ColunaRegistro['referencia'] = { tabela: 'categoria_animal', chave: 'id', rotulo: 'nome' };
const REF_USUARIO: ColunaRegistro['referencia'] = { tabela: 'usuarios', chave: 'id', rotulo: 'nome' };
const REF_PROPRIEDADE: ColunaRegistro['referencia'] = { tabela: 'propriedades', chave: 'id', rotulo: 'nome_propriedade' };
const REF_ASSOCIACAO: ColunaRegistro['referencia'] = { tabela: 'associacoes', chave: 'id', rotulo: 'nome' };
const REF_PLANO: ColunaRegistro['referencia'] = { tabela: 'planos', chave: 'id', rotulo: 'nome' };
const REF_BAIA: ColunaRegistro['referencia'] = { tabela: 'baias', chave: 'id', rotulo: 'nome_baia' };
const REF_SETOR: ColunaRegistro['referencia'] = { tabela: 'setores', chave: 'id', rotulo: 'nome_setor' };
const REF_LOTE: ColunaRegistro['referencia'] = { tabela: 'lotes', chave: 'id', rotulo: 'nome_lote' };
const REF_SUSPEITA: ColunaRegistro['referencia'] = { tabela: 'suspeitas', chave: 'id', rotulo: 'suspeita' };
const REF_INSEMINADOR: ColunaRegistro['referencia'] = { tabela: 'inseminadores', chave: 'id', rotulo: 'inseminador' };
const REF_FIN_SETOR: ColunaRegistro['referencia'] = { tabela: 'financeiro_setores', chave: 'id', rotulo: 'nome' };

// ─────────────────────────────────────────────────────────────────────────────
// Áreas — a ordem em que o índice de tabelas se apresenta
// ─────────────────────────────────────────────────────────────────────────────

export const AREAS: readonly string[] = [
  'Rebanho',
  'Produção',
  'Reprodução',
  'Sanidade',
  'Crescimento',
  'Avaliação',
  'Estrutura',
  'Financeiro',
  'Conta',
];

// ─────────────────────────────────────────────────────────────────────────────
// REBANHO
// ─────────────────────────────────────────────────────────────────────────────

const REBANHO: TabelaCatalogo = {
  nome: 'rebanho',
  rotulo: 'Rebanho',
  descricao:
    'A ficha do animal. Mistura cadastro (número, nome, raça, genealogia) com snapshots que triggers mantêm ' +
    '(peso atual, última produção, partos, gestação). Venda, óbito e descarte marcam status = inativo em vez de apagar.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Rebanho',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('numero_animal', 'Nº do animal', 'texto'),
    ess('nome_animal', 'Nome', 'texto'),
    ess('sexo', 'Sexo', 'texto', { faceta: 'enum' }),
    // O valor gravado é o UUID da categoria — sem esta referência a coluna é ilegível.
    ess('categoria', 'Categoria', 'uuid', { faceta: 'enum', referencia: REF_CATEGORIA }),
    ess('status', 'Situação', 'texto', { faceta: 'enum' }),
    ess('raca', 'Raça', 'texto', { faceta: 'enum' }),
    ess('data_de_nascimento', 'Nascimento', 'data', { faceta: 'data' }),
    ess('peso_atual', 'Peso atual (kg)', 'numero', { faceta: 'intervalo' }),

    det('especie', 'Espécie', 'texto', { faceta: 'enum' }),
    det('sistema_producao', 'Sistema de produção', 'texto', { faceta: 'enum' }),
    det('idade_dias', 'Idade (dias)', 'numero', { faceta: 'intervalo' }),
    det('id_eletronica', 'Brinco eletrônico', 'texto'),
    det('numero_provisorio', 'Nº provisório', 'texto'),
    det('origem', 'Origem', 'texto', { faceta: 'enum' }),
    det('pelagem', 'Pelagem', 'texto'),
    det('cruzamento', 'Cruzamento', 'texto'),
    det('grau_sangue_animal', 'Grau de sangue', 'texto'),
    det('mae_id', 'Mãe', 'numero', { referencia: REF_ANIMAL }),
    det('pai_id', 'Pai', 'numero', { referencia: REF_ANIMAL }),
    det('gestacao_ativa', 'Gestante', 'booleano', { faceta: 'booleano' }),
    det('ultimo_diagnostico', 'Último diagnóstico', 'texto', { faceta: 'enum' }),
    det('data_ultimo_parto', 'Último parto', 'data', { faceta: 'data' }),
    det('partos', 'Partos', 'numero', { faceta: 'intervalo' }),
    det('ordem_parto', 'Ordem de parto', 'numero'),
    det('prolificidade', 'Prolificidade', 'numero'),
    det('idade_ao_primeiro_parto', 'Idade ao 1º parto (dias)', 'numero'),
    det('filhos_macho', 'Filhos machos', 'numero'),
    det('filhos_femea', 'Filhas fêmeas', 'numero'),
    det('dias_em_lactacao', 'DEL', 'numero', { faceta: 'intervalo' }),
    det('ultima_producao', 'Última produção (L)', 'numero'),
    det('producao_vitalicia', 'Produção vitalícia (L)', 'numero'),
    det('lactacoes_encerradas', 'Lactações encerradas', 'numero'),
    det('ultimo_servico', 'Último serviço', 'data', { faceta: 'data' }),
    det('servicos', 'Serviços', 'numero'),
    det('taxa_parto_servico', 'Taxa parto/serviço', 'numero'),
    det('reproducao', 'Situação reprodutiva', 'texto', { faceta: 'enum' }),
    det('peso_ao_nascer', 'Peso ao nascer (kg)', 'numero'),
    det('brix_colostro', 'Brix do colostro', 'numero'),
    det('ultima_pesagem_data', 'Última pesagem', 'data', { faceta: 'data' }),
    det('lote_atual_id', 'Lote', 'numero', { faceta: 'enum', referencia: REF_LOTE }),
    det('setor_id', 'Setor', 'numero', { faceta: 'enum', referencia: REF_SETOR }),
    det('baia_id', 'Baia', 'numero', { faceta: 'enum', referencia: REF_BAIA }),
    det('categoria_rg', 'Categoria de registro', 'texto', { faceta: 'enum' }),
    det('numero_rgn', 'Nº RGN', 'texto'),
    det('titulos', 'Títulos', 'texto'),
    det('data_venda', 'Data da venda', 'data', { faceta: 'data' }),
    det('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('categoria_anterior', 'Categoria anterior', 'uuid', { referencia: REF_CATEGORIA }),
    tec('receptora_id', 'Receptora (TE)', 'numero', { referencia: REF_ANIMAL }),
    tec('criado_por_usuario_id', 'Cadastrado por', 'numero', { referencia: REF_USUARIO }),
    tec('grau_sangue_mae', 'Grau de sangue da mãe', 'texto'),
    tec('grau_sangue_pai', 'Grau de sangue do pai', 'texto'),
    tec('c_m', 'C/M', 'texto'),
    // GMD/PDI/GPDI estão gravados em <1% das linhas: o app calcula em Dart na hora.
    // Ficam aqui como coluna crua, não como indicador — não montar gráfico em cima.
    tec('gmd', 'GMD gravado', 'numero'),
    tec('gmd_data', 'Data do marco de GMD', 'data'),
    tec('gmd_peso', 'Peso do marco de GMD', 'numero'),
    tec('pdi', 'PDI gravado', 'numero'),
    tec('gpdi', 'GPDI gravado', 'numero'),
    tec('data_ultimo_controle', 'Último controle leiteiro', 'data'),
    tec('foto1', 'Foto 1', 'texto'),
    tec('foto2', 'Foto 2', 'texto'),
    tec('foto3', 'Foto 3', 'texto'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const CATEGORIA_ANIMAL: TabelaCatalogo = {
  nome: 'categoria_animal',
  rotulo: 'Categorias de animal',
  descricao:
    'Catálogo GLOBAL (sem propriedade_id) das categorias de ciclo de vida. É o dicionário que traduz o UUID de ' +
    'rebanho.categoria para "Lactante", "Seca", "Cria". Carregar uma vez e manter um mapa id → nome.',
  colunaTenant: 'nenhuma',
  colunaData: 'created_at',
  area: 'Rebanho',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome', 'Chave interna', 'texto'),
    // Atenção: 'Label' com L MAIÚSCULO no banco. Em SQL exige aspas duplas.
    ess('Label', 'Rótulo', 'texto'),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('sexo', 'Sexo', 'texto', { faceta: 'enum' }),

    tec('id', 'ID (UUID)', 'uuid'),
    tec('created_at', 'Criado em', 'datahora'),
    // INCERTO: `especies` e `sistemas_producao` (text[]) aparecem no dossiê via
    // migrations/fix_categorias_ovinos_corte.sql, mas NÃO no DTO gerado. Se a
    // query falhar com 42703, remover estas duas linhas.
    tec('especies', 'Espécies', 'texto'),
    tec('sistemas_producao', 'Sistemas de produção', 'texto'),
  ],
};

const VENDA: TabelaCatalogo = {
  nome: 'venda',
  rotulo: 'Vendas',
  descricao:
    'Venda de animal, com valor. É a única receita por animal no sistema. O trigger inativa o animal e grava ' +
    'rebanho.data_venda — a baixa e a venda são o mesmo evento.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_venda',
  area: 'Rebanho',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_venda', 'Data da venda', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('valor', 'Valor (R$)', 'numero', { faceta: 'intervalo' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const OBITO: TabelaCatalogo = {
  nome: 'obito',
  rotulo: 'Óbitos',
  descricao:
    'Morte do animal com sinais, suspeitas e diagnóstico. Base do indicador de mortalidade. `suspeita` é um ' +
    'ARRAY de texto que casa por nome com o catálogo `suspeitas`, não por FK.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_obito',
  area: 'Rebanho',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_obito', 'Data do óbito', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('diagnostico_obito', 'Diagnóstico', 'texto', { faceta: 'enum' }),
    ess('suspeita', 'Suspeitas', 'texto'),
    ess('sinais_clinicos', 'Sinais clínicos', 'texto'),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

/**
 * ARMADILHA CONHECIDA: **não existe tabela `descarte`**. Descarte é uma linha de
 * `manejo` com 'descarte' dentro do array `tipo_manejo`; um trigger inativa o
 * animal. Por isso esta entrada aponta para `manejo` com `filtroFixo` — sem ele,
 * a tela de descarte listaria todo o manejo do criador.
 */
const DESCARTE: TabelaCatalogo = {
  nome: 'manejo',
  slug: 'descarte',
  rotulo: 'Descartes',
  descricao:
    'Descarte de animal. Não é tabela própria: é uma linha de `manejo` com "descarte" no array tipo_manejo, ' +
    'filtrada aqui automaticamente. Apagar a linha dispara o trigger que reverte o animal para ativo.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_manejo',
  area: 'Rebanho',
  filtroFixo: { coluna: 'tipo_manejo', op: 'contem', valor: 'descarte' },
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_manejo', 'Data do descarte', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('escore_corporal', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('peso', 'Peso (kg)', 'numero', { faceta: 'intervalo' }),
    ess('observacao', 'Motivo / observação', 'texto'),

    det('tipo_manejo', 'Tipos de manejo', 'texto', { faceta: 'enum' }),
    det('famacha', 'FAMACHA', 'numero', { faceta: 'intervalo' }),
    det('casco_status', 'Casco', 'texto', { faceta: 'enum' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUÇÃO
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCAO_DIARIA: TabelaCatalogo = {
  nome: 'producao_diaria',
  rotulo: 'Produção diária',
  descricao:
    'Produção do TANQUE por dia — coletiva, não por animal. É a série temporal principal do dashboard de leite. ' +
    'total_producao é recalculado por trigger e já inclui as ordenhas e os extras.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_producao',
  area: 'Produção',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_producao', 'Data', 'data', { faceta: 'data' }),
    ess('total_producao', 'Total do dia (L)', 'numero', { faceta: 'intervalo' }),
    ess('litros_1_ordenha', '1ª ordenha (L)', 'numero'),
    ess('litros_2_ordenha', '2ª ordenha (L)', 'numero'),
    ess('litros_tanque', 'Leitura do tanque (L)', 'numero'),
    ess('total_lactantes', 'Lactantes na 1ª', 'numero', { faceta: 'intervalo' }),
    ess('total_lactantes_2', 'Lactantes na 2ª', 'numero'),
    ess('observacao', 'Observação', 'texto'),

    // INCERTO: `segmento` e `modo_lancamento` estão no dossiê (migrations
    // add_segmento_to_producao_diaria.sql e add_modo_lancamento_e_extras_*.sql)
    // mas NÃO no DTO gerado — o DTO pode estar velho. Primeira suspeita se a
    // query desta tabela devolver 42703.
    det('segmento', 'Segmento', 'texto', { faceta: 'enum' }),
    det('modo_lancamento', 'Modo de lançamento', 'texto', { faceta: 'enum' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('id_str', 'ID (texto)', 'texto'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const CONTROLE_LEITEIRO: TabelaCatalogo = {
  nome: 'controle_leiteiro',
  rotulo: 'Controle leiteiro',
  descricao:
    'Pesagem de leite POR ANIMAL no dia de controle — o dado mais valioso do produto (base de lactação, ' +
    'herdabilidade e vitrine). Uma linha por animal × ordenha; é a tabela que mais exige paginação.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_ordenha',
  area: 'Produção',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_ordenha', 'Data da ordenha', 'datahora', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('ordenha', 'Ordenha', 'texto', { faceta: 'enum' }),
    ess('litros_produzidos', 'Litros da ordenha', 'numero', { faceta: 'intervalo' }),
    ess('total_produzido', 'Total do dia (L)', 'numero', { faceta: 'intervalo' }),
    ess('del', 'DEL', 'numero', { faceta: 'intervalo' }),
    ess('hora_ordenha', 'Hora', 'texto'),
    ess('tubo_analise', 'Tubo de análise', 'texto'),

    det('data_simples', 'Data (sem hora)', 'data', { faceta: 'data' }),
    det('grupo_controle_id', 'Grupo do controle', 'numero'),
    det('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const LACTACAO: TabelaCatalogo = {
  nome: 'lactacao',
  rotulo: 'Lactações',
  descricao:
    'Uma linha por lactação: abre no parto, fecha na secagem, por trigger. ARMADILHA: NÃO tem propriedade_id — ' +
    'o escopo do criador sai do conjunto de animais dele. Composição (gordura/proteína) é quase toda nula.',
  colunaTenant: 'animal_id',
  colunaData: 'data_inicio',
  area: 'Produção',
  notaEscopo:
    'Sem propriedade_id. Filtrar por animal_id IN (ids do rebanho da propriedade) — é o que o helper ' +
    'app_animais_acessiveis() faz na RLS, aqui computado no servidor com service_role.',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('data_inicio', 'Início (parto)', 'data', { faceta: 'data' }),
    ess('data_fim', 'Fim', 'data', { faceta: 'data' }),
    ess('dias_em_lactacao', 'DEL', 'numero', { faceta: 'intervalo' }),
    ess('total_leite', 'Total da lactação (L)', 'numero', { faceta: 'intervalo' }),
    ess('media_leite', 'Média (L/dia)', 'numero'),
    ess('media_corrigida', 'Média corrigida', 'numero'),

    det('data_termino', 'Data de término', 'data', { faceta: 'data' }),
    det('gordura_percentual', 'Gordura (%)', 'numero'),
    det('proteina_percentual', 'Proteína (%)', 'numero'),
    det('solidos_totais', 'Sólidos totais', 'numero'),
    det('gordura_corrigida', 'Gordura corrigida', 'numero'),
    det('proteina_corrigida', 'Proteína corrigida', 'numero'),
    det('solidos_corrigido', 'Sólidos corrigidos', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const SECAGEM: TabelaCatalogo = {
  nome: 'secagem',
  rotulo: 'Secagens',
  descricao:
    'Secagem da fêmea — fim da lactação. Fecha a lactação aberta por trigger e grava o DEL final. Bloqueada ' +
    'para sistema de corte desde 07/2026.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_secagem',
  area: 'Produção',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_secagem', 'Data da secagem', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('tipo_secagem', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('del', 'DEL no fechamento', 'numero', { faceta: 'intervalo' }),
    ess('confirmada', 'Confirmada', 'booleano', { faceta: 'booleano' }),
    ess('observacao', 'Observação', 'texto'),

    det('gordura_percentual', 'Gordura (%)', 'numero'),
    det('proteina_percentual', 'Proteína (%)', 'numero'),
    det('solidos_totais', 'Sólidos totais', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const SAIDA_LEITE: TabelaCatalogo = {
  nome: 'saida_leite',
  rotulo: 'Saída de leite',
  descricao:
    'Quanto leite saiu e para onde, depois do tanque. `destino` é um ARRAY de texto que casa por nome com o ' +
    'catálogo destino_saida_leite. Não tem updated_at.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_saida',
  area: 'Produção',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_saida', 'Data da saída', 'data', { faceta: 'data' }),
    ess('litros', 'Litros', 'numero', { faceta: 'intervalo' }),
    ess('destino', 'Destino', 'texto', { faceta: 'enum' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

const ANALISE_LEITE: TabelaCatalogo = {
  nome: 'analise_leite',
  rotulo: 'Análise de leite',
  descricao:
    'Resultado do laboratório (CCS, CBT, composição). ARMADILHA GRAVE: não tem propriedade_id E o animal é ' +
    'identificado por TEXTO em id_animal — que pode ser rebanho.id em texto OU um nome livre cadastrado em ' +
    'identificadores_analise_leite. Sem tratar isso, a tela mistura criadores.',
  colunaTenant: 'animal_id',
  colunaTenantFisica: 'id_animal',
  colunaData: 'data_analise',
  area: 'Produção',
  notaEscopo:
    'id_animal é TEXTO livre, não FK. O caminho seguro é a RPC listar_analises_leite_da_propriedade' +
    '(p_propriedade_id, p_busca, p_data_inicio, p_data_fim), que já resolve os dois vínculos e OMITE a linha ' +
    'quando o mesmo nome existe em duas propriedades. Filtrar direto por id_animal exige converter os ids do ' +
    'rebanho para texto e ainda assim perde as linhas cadastradas por nome livre.',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_analise', 'Data da análise', 'data', { faceta: 'data' }),
    ess('id_animal', 'Animal (texto)', 'texto'),
    ess('ccs', 'CCS', 'numero', { faceta: 'intervalo' }),
    ess('cbt', 'CBT', 'numero', { faceta: 'intervalo' }),
    ess('gordura', 'Gordura', 'numero'),
    ess('proteina', 'Proteína', 'numero'),
    ess('lactose', 'Lactose', 'numero'),
    ess('st', 'Sólidos totais', 'numero'),

    det('esd', 'Extrato seco desengordurado', 'numero'),
    det('caseina', 'Caseína', 'numero'),
    det('pcas', 'Caseína (%)', 'numero'),
    det('nu', 'Nitrogênio ureico', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// REPRODUÇÃO
// ─────────────────────────────────────────────────────────────────────────────

const INSEMINACAO: TabelaCatalogo = {
  nome: 'inseminacao',
  rotulo: 'Inseminações',
  descricao:
    'Inseminação artificial (IA/IATF), com o sêmen usado, o protocolo e o inseminador. Base de serviços por ' +
    'concepção. A fêmea é animal_id_femea, não animal_id.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_inseminacao',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_inseminacao', 'Data', 'data', { faceta: 'data' }),
    ess('animal_id_femea', 'Fêmea', 'numero', { referencia: REF_ANIMAL }),
    ess('categoria_semen', 'Categoria do sêmen', 'texto', { faceta: 'enum' }),
    ess('identificacao_semen', 'Identificação do sêmen', 'texto'),
    ess('protocolo', 'Protocolo', 'texto', { faceta: 'enum' }),
    ess('ecc', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('inseminador_id', 'Inseminador', 'numero', { faceta: 'enum', referencia: REF_INSEMINADOR }),
    ess('observacao', 'Observação', 'texto'),

    det('muco', 'Muco', 'texto', { faceta: 'enum' }),
    det('profundidade', 'Profundidade', 'texto', { faceta: 'enum' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const MONTA_CONTROLADA: TabelaCatalogo = {
  nome: 'monta_controlada',
  rotulo: 'Montas controladas',
  descricao:
    'Cobertura controlada: fêmea × reprodutor com data exata. É o método mais usado na base e o que dá a ' +
    'previsão de parto com precisão de dia.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_da_cobertura',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_da_cobertura', 'Data da cobertura', 'data', { faceta: 'data' }),
    ess('animal_id_femea', 'Fêmea', 'numero', { referencia: REF_ANIMAL }),
    ess('animal_id_reprodutor', 'Reprodutor', 'numero', { referencia: REF_ANIMAL }),
    ess('protocolo', 'Protocolo', 'texto', { faceta: 'enum' }),
    ess('ecc', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const MONTA_LIVRE: TabelaCatalogo = {
  nome: 'monta_livre',
  rotulo: 'Montas livres',
  descricao:
    'Monta a campo. Registra a ENTRADA do reprodutor no lote, não a cobertura individual — por isso a previsão ' +
    'de parto daqui é uma janela, não um dia. A data é data_entrada_reprodutor.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_entrada_reprodutor',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_entrada_reprodutor', 'Entrada do reprodutor', 'data', { faceta: 'data' }),
    ess('animal_id_femea', 'Fêmea', 'numero', { referencia: REF_ANIMAL }),
    ess('animal_id_reprodutor', 'Reprodutor', 'numero', { referencia: REF_ANIMAL }),
    ess('ecc', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const DIAGNOSTICO_GESTACAO: TabelaCatalogo = {
  nome: 'diagnostico_gestacao',
  rotulo: 'Diagnósticos de gestação',
  descricao:
    'DG por ultrassom ou palpação. Fecha o ciclo cobertura → DG → parto e é o que liga/desliga ' +
    'rebanho.gestacao_ativa. Base da taxa de prenhez.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_diagnostico',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_diagnostico', 'Data do DG', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('diagnostico', 'Diagnóstico', 'texto', { faceta: 'enum' }),
    ess('dias_de_gestacao', 'Dias de gestação', 'numero', { faceta: 'intervalo' }),
    ess('ecc', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('detalhes_diagnostico', 'Detalhes', 'texto'),
    ess('avaliacao_ubere', 'Avaliação do úbere', 'texto'),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const ABORTO: TabelaCatalogo = {
  nome: 'aborto',
  rotulo: 'Abortos',
  descricao:
    'Aborto e a categoria em que o animal fica depois. É o outro desfecho da gestação, ao lado do parto — ' +
    'evento raro e caro, indicador de perda reprodutiva.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_aborto',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_aborto', 'Data do aborto', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('categoria_pos_aborto', 'Categoria depois', 'texto', { faceta: 'enum' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const TRANSFERENCIA_EMBRIAO: TabelaCatalogo = {
  nome: 'transferencia_embriao',
  rotulo: 'Transferências de embrião',
  descricao:
    'TE: liga o embrião (que é um animal de categoria "embriao" no rebanho) à receptora. A cria nascida por TE ' +
    'guarda receptora_id em rebanho. Só criador de genética usa.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_transferencia',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_transferencia', 'Data da TE', 'data', { faceta: 'data' }),
    ess('embriao_id', 'Embrião', 'numero', { referencia: REF_ANIMAL }),
    ess('receptora_id', 'Receptora', 'numero', { referencia: REF_ANIMAL }),
    ess('tecnico', 'Técnico', 'texto'),
    ess('ecc', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const ACASALAMENTO_PLANEJADO: TabelaCatalogo = {
  nome: 'acasalamento_planejado',
  rotulo: 'Acasalamentos planejados',
  descricao:
    'Plano de acasalamento: o par fêmea × macho marcado com estrelas. É intenção, não evento — não conta como ' +
    'cobertura. Feature de 08/2026, base ainda pequena. Não tem created_at.',
  colunaTenant: 'propriedade_id',
  colunaData: 'marcado_em',
  area: 'Reprodução',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('marcado_em', 'Marcado em', 'datahora', { faceta: 'data' }),
    ess('femea_id', 'Fêmea', 'numero', { referencia: REF_ANIMAL }),
    ess('macho_id', 'Macho', 'numero', { referencia: REF_ANIMAL }),
    ess('estrelas', 'Estrelas', 'numero', { faceta: 'intervalo' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SANIDADE
// ─────────────────────────────────────────────────────────────────────────────

const CLINICA: TabelaCatalogo = {
  nome: 'clinica',
  rotulo: 'Casos clínicos',
  descricao:
    'Caso clínico do animal: suspeita, sinais e tratamento. Base da morbidade e do custo com medicamento. ' +
    'O histórico encerrado vai para historico_clinico.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_do_caso',
  area: 'Sanidade',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_do_caso', 'Data do caso', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('suspeita_id', 'Suspeita', 'numero', { faceta: 'enum', referencia: REF_SUSPEITA }),
    ess('sinais', 'Sinais', 'texto'),
    ess('tratamento', 'Tratamento', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const SUSPEITAS: TabelaCatalogo = {
  nome: 'suspeitas',
  rotulo: 'Suspeitas (catálogo)',
  descricao:
    'Catálogo de doenças e suspeitas por propriedade. Alimenta clinica.suspeita_id (por FK) e obito.suspeita ' +
    '(por nome, em array de texto). É a origem do gráfico de principais causas.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Sanidade',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('suspeita', 'Suspeita', 'texto'),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('categoria', 'Categoria', 'texto', { faceta: 'enum' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const MANEJO: TabelaCatalogo = {
  nome: 'manejo',
  rotulo: 'Manejo',
  descricao:
    'O canivete suíço: uma linha por animal por dia de manejo, com tipo_manejo em ARRAY. Carrega FAMACHA, ECC, ' +
    'casco, CMT, úbere, protocolo, peso e até DG. ATENÇÃO: os DESCARTES vivem aqui dentro (tipo_manejo contém ' +
    '"descarte") — esta tela mostra a tabela crua; use a tela Descartes para isolá-los.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_manejo',
  area: 'Sanidade',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_manejo', 'Data do manejo', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('tipo_manejo', 'Tipos', 'texto', { faceta: 'enum' }),
    ess('famacha', 'FAMACHA', 'numero', { faceta: 'intervalo' }),
    ess('escore_corporal', 'ECC', 'numero', { faceta: 'intervalo' }),
    ess('peso', 'Peso (kg)', 'numero', { faceta: 'intervalo' }),
    ess('protocolo_sanitario', 'Protocolo sanitário', 'texto', { faceta: 'enum' }),
    ess('casco_status', 'Casco', 'texto', { faceta: 'enum' }),

    det('cmt_me', 'CMT teto esquerdo', 'texto'),
    det('cmt_md', 'CMT teto direito', 'texto'),
    det('avaliacao_ubere', 'Avaliação do úbere', 'texto'),
    det('diagnostico_gestacao', 'DG no manejo', 'texto', { faceta: 'enum' }),
    det('dias_gestacao', 'Dias de gestação', 'numero'),
    det('data_cobertura', 'Data da cobertura', 'data', { faceta: 'data' }),
    det('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
    // INCERTO: `detalhe_diagnostico` (text[]) consta no dossiê mas não no DTO
    // gerado. Deixada na família técnica justamente para não entrar no preset.
    tec('detalhe_diagnostico', 'Detalhe do diagnóstico', 'texto'),
  ],
};

const PROTOCOLOS_MANEJO: TabelaCatalogo = {
  nome: 'protocolos_manejo',
  rotulo: 'Protocolos de manejo',
  descricao:
    'Catálogo de protocolos sanitários por propriedade (vermífugo, vacina). Substituiu uma lista hardcoded no ' +
    'app; manejo.protocolo_sanitario casa por TEXTO, não por FK.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Sanidade',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('protocolo', 'Protocolo', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

const MANEJO_COLETIVO_SESSAO: TabelaCatalogo = {
  nome: 'manejo_coletivo_sessao',
  rotulo: 'Sessões de manejo coletivo',
  descricao:
    'Cabeçalho do dia de manejo coletivo: que tipos foram feitos, por que filtro os animais foram escolhidos e ' +
    'quantos passaram. É o denominador da fração "66 de 71". A PK é UUID em texto, não inteiro.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_sessao',
  area: 'Sanidade',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_sessao', 'Data da sessão', 'data', { faceta: 'data' }),
    ess('tipos_manejo', 'Tipos aplicados', 'texto', { faceta: 'enum' }),
    ess('tipo_filtro', 'Critério do filtro', 'texto', { faceta: 'enum' }),
    ess('filtro_label', 'Filtro', 'texto'),
    ess('total_animais', 'Animais na sessão', 'numero', { faceta: 'intervalo' }),

    tec('id', 'ID (UUID)', 'uuid'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    // created_by guarda o UUID do Auth, não usuarios.id — sem referência possível.
    tec('created_by', 'Criado por (UUID do Auth)', 'texto'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CRESCIMENTO
// ─────────────────────────────────────────────────────────────────────────────

const PESAGEM: TabelaCatalogo = {
  nome: 'pesagem',
  rotulo: 'Pesagens',
  descricao:
    'Pesagem individual e a base da curva de crescimento. ARMADILHA: GMD, PDI e GPDI estão gravados em menos de ' +
    '1% das linhas — o app calcula em Dart na hora. Ler a coluna dá quase sempre vazio; o número honesto é o GPD.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_pesagem',
  area: 'Crescimento',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_pesagem', 'Data da pesagem', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('peso_kg', 'Peso (kg)', 'numero', { faceta: 'intervalo' }),
    ess('idade_dias', 'Idade (dias)', 'numero', { faceta: 'intervalo' }),
    ess('gpd', 'GPD (kg/dia)', 'numero', { faceta: 'intervalo' }),
    ess('peso_ideal', 'Peso ideal (kg)', 'numero'),
    ess('meta', 'Meta (kg)', 'numero'),
    ess('progresso', 'Progresso (%)', 'numero', { faceta: 'intervalo' }),

    det('peso_ultima_pesagem', 'Peso anterior (kg)', 'numero'),
    det('dias_entre_pesagens', 'Dias desde a anterior', 'numero'),
    det('dias_engorda', 'Dias de engorda', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('gmd', 'GMD gravado', 'numero'),
    tec('pdi', 'PDI gravado', 'numero'),
    tec('gpdi', 'GPDI gravado', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const ENGORDA: TabelaCatalogo = {
  nome: 'engorda',
  rotulo: 'Marcos de engorda',
  descricao:
    'Data e peso de início da engorda — o marco sem o qual não há GMD. ARMADILHA: engorda_id e animal_id são ' +
    'TEXTO nesta tabela (não inteiro, ao contrário de todas as outras), e o marco existe em 19 dos 13.038 ' +
    'animais do sistema. Uma tela quase sempre vazia é o resultado correto aqui.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data',
  area: 'Crescimento',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data', 'Início da engorda', 'data', { faceta: 'data' }),
    // Sem `referencia`: casa com rebanho.id por TEXTO, e um join declarado aqui
    // levaria a página genérica a montar um lookup por inteiro que nunca casa.
    ess('animal_id', 'Animal (texto)', 'texto'),
    ess('peso_inicio', 'Peso inicial (kg)', 'numero', { faceta: 'intervalo' }),

    tec('engorda_id', 'ID (texto)', 'texto'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// AVALIAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

const AVALIACAO_MORFOLOGICA_LINEAR: TabelaCatalogo = {
  nome: 'avaliacao_morfologica_linear',
  rotulo: 'Avaliação morfológica linear',
  descricao:
    'AML do leiteiro: 16 características, cada uma com um PONTO (escala biológica 1-9) e uma CLASSIFICAÇÃO ' +
    '(ranking 1-9), mais a pontuação total (máx. 100). ARMADILHA: dois nomes de coluna têm ACENTO ' +
    '(ponto_5_profundidadedeúbere, ponto_12_ligamentosuspensóriomedio) enquanto os class_* equivalentes não têm ' +
    '— gerar essas chaves por template quebra.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_avaliacao',
  area: 'Avaliação',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_avaliacao', 'Data da avaliação', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('pontuacao_total', 'Pontuação total', 'numero', { faceta: 'intervalo' }),
    ess('tecnico_id', 'Técnico', 'numero', { faceta: 'enum', referencia: REF_USUARIO }),

    det('ponto_1_mobilidade', '1 · Mobilidade', 'numero'),
    det('ponto_2_larguradepeito', '2 · Largura de peito', 'numero'),
    det('ponto_3_profundidadecorporal', '3 · Profundidade corporal', 'numero'),
    det('ponto_4_angulodegarupa', '4 · Ângulo de garupa', 'numero'),
    det('ponto_5_profundidadedeúbere', '5 · Profundidade de úbere', 'numero'),
    det('ponto_6_membrosposterioresvistalateral', '6 · Membros post. (lateral)', 'numero'),
    det('ponto_7_ligamentoanteriordeubere', '7 · Ligamento anterior de úbere', 'numero'),
    det('ponto_8_capacidade', '8 · Capacidade', 'numero'),
    det('ponto_9_larguradegarupa', '9 · Largura de garupa', 'numero'),
    det('ponto_10_ligamentoposteriordeubere', '10 · Ligamento posterior de úbere', 'numero'),
    det('ponto_11_volumedeubere', '11 · Volume de úbere', 'numero'),
    det('ponto_12_ligamentosuspensóriomedio', '12 · Ligamento suspensório médio', 'numero'),
    det('ponto_13_posicaodetetos', '13 · Posição de tetos', 'numero'),
    det('ponto_14_diametrodetetos', '14 · Diâmetro de tetos', 'numero'),
    det('ponto_15_membrosposterioresvistaanterior', '15 · Membros post. (anterior)', 'numero'),
    det('ponto_16_estruturaossea', '16 · Estrutura óssea', 'numero'),

    tec('class_1_mobilidade', 'Classe 1 · Mobilidade', 'numero'),
    tec('class_2_larguradepeito', 'Classe 2 · Largura de peito', 'numero'),
    tec('class_3_profundidadecorporal', 'Classe 3 · Profundidade corporal', 'numero'),
    tec('class_4_angulodegarupa', 'Classe 4 · Ângulo de garupa', 'numero'),
    tec('class_5_profundidadedeubere', 'Classe 5 · Profundidade de úbere', 'numero'),
    tec('class_6_membrosposterioresvistalateral', 'Classe 6 · Membros post. (lateral)', 'numero'),
    tec('class_7_ligamentoanteriordeubere', 'Classe 7 · Ligamento anterior', 'numero'),
    tec('class_8_capacidade', 'Classe 8 · Capacidade', 'numero'),
    tec('class_9_larguradegarupa', 'Classe 9 · Largura de garupa', 'numero'),
    tec('class_10_ligamentoposteriordeubere', 'Classe 10 · Ligamento posterior', 'numero'),
    tec('class_11_volumedeubere', 'Classe 11 · Volume de úbere', 'numero'),
    tec('class_12_ligamentosuspensoriomedio', 'Classe 12 · Ligamento suspensório', 'numero'),
    tec('class_13_posicaodetetos', 'Classe 13 · Posição de tetos', 'numero'),
    tec('class_14_diametrodetetos', 'Classe 14 · Diâmetro de tetos', 'numero'),
    tec('class_15_membrosposterioresvistaanterior', 'Classe 15 · Membros post. (anterior)', 'numero'),
    tec('class_16_estruturaossea', 'Classe 16 · Estrutura óssea', 'numero'),
    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('visita_id', 'Visita técnica', 'numero'),
    tec('solicitacao_id', 'Solicitação', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const MEDIDAS: TabelaCatalogo = {
  nome: 'medidas',
  rotulo: 'Medidas',
  descricao:
    'As medidas físicas com fita e régua — o par quantitativo da avaliação linear. ARMADILHA: numeração e ' +
    'acentuação inconsistentes (medida_1_perímetrotoracico tem acento; medida8_diametrodetetos não tem o ' +
    'underscore antes do 8).',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_medida',
  area: 'Avaliação',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_medida', 'Data da medida', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('medida_1_perímetrotoracico', 'Perímetro torácico (cm)', 'numero', { faceta: 'intervalo' }),
    ess('medida_2_altura', 'Altura (cm)', 'numero', { faceta: 'intervalo' }),
    ess('medida_3_larguradepeito', 'Largura de peito (cm)', 'numero'),
    ess('medida_4_larguradegarupa', 'Largura de garupa (cm)', 'numero'),
    ess('altura_garupa', 'Altura de garupa (cm)', 'numero'),

    det('medida_5_ligamentoposteriordeubere', 'Ligamento posterior de úbere', 'numero'),
    det('medida_6_ligamentosuspensoriomedio', 'Ligamento suspensório médio', 'numero'),
    det('medida_7_volumedeubere', 'Volume de úbere', 'numero'),
    det('medida8_diametrodetetos', 'Diâmetro de tetos', 'numero'),
    det('medida_circunferenciaescrotal', 'Circunferência escrotal (macho)', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('tecnico_id', 'Técnico', 'numero', { referencia: REF_USUARIO }),
    tec('visita_id', 'Visita técnica', 'numero'),
    tec('solicitacao_id', 'Solicitação', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const AML_CORTE: TabelaCatalogo = {
  nome: 'aml_corte',
  rotulo: 'Avaliação morfológica de corte',
  descricao:
    'AML do animal de CORTE: percentuais por bloco (estrutura corporal, corte, membros) e pontuação total. ' +
    'Modelo separado do leiteiro, sem sobreposição. As 13 pontuações por característica existem no banco mas ' +
    'ficaram fora deste catálogo por não constarem do DTO gerado.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_avaliacao',
  area: 'Avaliação',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_avaliacao', 'Data da avaliação', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('pontuacao_total', 'Pontuação total', 'numero', { faceta: 'intervalo' }),
    ess('pct_estr_corporal', 'Estrutura corporal (%)', 'numero'),
    ess('pct_estr_corte', 'Estrutura de corte (%)', 'numero'),
    ess('pct_memb_ant', 'Membros anteriores (%)', 'numero'),
    ess('pct_memb_post', 'Membros posteriores (%)', 'numero'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('tecnico_id', 'Técnico', 'numero', { referencia: REF_USUARIO }),
    tec('visita_id', 'Visita técnica', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTRUTURA
// ─────────────────────────────────────────────────────────────────────────────

const SETORES: TabelaCatalogo = {
  nome: 'setores',
  rotulo: 'Setores',
  descricao:
    'Nível intermediário da hierarquia física lote → setor → baia. Não tem coluna de data: a tela não oferece ' +
    'filtro de período nem ordenação cronológica.',
  colunaTenant: 'propriedade_id',
  colunaData: null,
  area: 'Estrutura',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome_setor', 'Setor', 'texto'),
    ess('descricao', 'Descrição', 'texto'),
    ess('lote_id', 'Lote', 'numero', { faceta: 'enum', referencia: REF_LOTE }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
  ],
};

const BAIAS: TabelaCatalogo = {
  nome: 'baias',
  rotulo: 'Baias',
  descricao:
    'A folha da hierarquia física. Só 16% dos animais ativos têm baia preenchida — qualquer gráfico de ocupação ' +
    'vai ser dominado por "sem localização", e isso é o dado real, não um bug. Sem coluna de data.',
  colunaTenant: 'propriedade_id',
  colunaData: null,
  area: 'Estrutura',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome_baia', 'Baia', 'texto'),
    ess('descricao', 'Descrição', 'texto'),
    ess('setor_id', 'Setor', 'numero', { faceta: 'enum', referencia: REF_SETOR }),
    ess('lote_id', 'Lote', 'numero', { faceta: 'enum', referencia: REF_LOTE }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
  ],
};

const LOTES: TabelaCatalogo = {
  nome: 'lotes',
  rotulo: 'Lotes',
  descricao:
    'Topo da hierarquia física e o agrupador usado no manejo coletivo e nos relatórios. rebanho.lote_atual_id ' +
    'aponta para cá.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Estrutura',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome_lote', 'Lote', 'texto'),
    ess('descricao', 'Descrição', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const MOVIMENTACOES: TabelaCatalogo = {
  nome: 'movimentacoes',
  rotulo: 'Movimentações',
  descricao:
    'Histórico de troca de localização e/ou lote; um trigger aplica a movimentação no rebanho. Responde "para ' +
    'onde os animais foram" e é o que o /katmandu chamava de movimentação.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_movimentacao',
  area: 'Estrutura',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_movimentacao', 'Data', 'data', { faceta: 'data' }),
    ess('animal_id', 'Animal', 'numero', { referencia: REF_ANIMAL }),
    ess('tipo_movimentacao', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('setor_origem_id', 'Setor de origem', 'numero', { referencia: REF_SETOR }),
    ess('baia_origem_id', 'Baia de origem', 'numero', { referencia: REF_BAIA }),
    ess('setor_destino_id', 'Setor de destino', 'numero', { referencia: REF_SETOR }),
    ess('baia_destino_id', 'Baia de destino', 'numero', { referencia: REF_BAIA }),
    ess('observacao', 'Observação', 'texto'),

    det('lote_origem_id', 'Lote de origem', 'numero', { referencia: REF_LOTE }),
    det('lote_destino_id', 'Lote de destino', 'numero', { referencia: REF_LOTE }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('criado_por_usuario_id', 'Lançado por', 'numero', { referencia: REF_USUARIO }),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FINANCEIRO — a economia DA FAZENDA, não a cobrança do SeabraApp
// ─────────────────────────────────────────────────────────────────────────────

const FINANCEIRO_LANCAMENTOS: TabelaCatalogo = {
  nome: 'financeiro_lancamentos',
  rotulo: 'Lançamentos financeiros',
  descricao:
    'Livro-caixa do produtor: receita ou despesa por setor e data. Note que NÃO existe coluna de descrição — o ' +
    'único texto do lançamento é o nome do setor. Isto é a economia da fazenda, não a assinatura do SeabraApp.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data',
  area: 'Financeiro',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data', 'Data', 'data', { faceta: 'data' }),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('valor', 'Valor (R$)', 'numero', { faceta: 'intervalo' }),
    ess('setor_id', 'Setor', 'numero', { faceta: 'enum', referencia: REF_FIN_SETOR }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

const FINANCEIRO_SETORES: TabelaCatalogo = {
  nome: 'financeiro_setores',
  rotulo: 'Setores financeiros',
  descricao:
    'Centros de custo do produtor (Leite, Nutrição, Ordenha, Energia...), cada um marcado como receita, despesa ' +
    'ou ambos. É o eixo de agrupamento do gráfico financeiro.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Financeiro',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome', 'Setor', 'texto'),
    ess('categoria', 'Categoria', 'texto', { faceta: 'enum' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

const CUSTO_FIXO_MES: TabelaCatalogo = {
  nome: 'custo_fixo_mes',
  rotulo: 'Custos fixos mensais',
  descricao:
    'Despesa fixa mensal do produtor (mão de obra, energia). Entra no denominador do custo por litro. ' +
    'Único por propriedade + descrição.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Financeiro',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('descricao', 'Descrição', 'texto'),
    ess('valor_mensal', 'Valor mensal (R$)', 'numero', { faceta: 'intervalo' }),
    ess('ativo', 'Ativo', 'booleano', { faceta: 'booleano' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const INSUMO: TabelaCatalogo = {
  nome: 'insumo',
  rotulo: 'Insumos',
  descricao:
    'Catálogo de insumos com preço unitário — a base do custo da dieta. `tipo` e `unidade` são ENUMs reais do ' +
    'Postgres. `seed = true` marca o que veio do cadastro padrão, não do produtor.',
  colunaTenant: 'propriedade_id',
  colunaData: 'created_at',
  area: 'Financeiro',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome', 'Insumo', 'texto'),
    ess('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    ess('unidade', 'Unidade', 'texto', { faceta: 'enum' }),
    ess('valor_unitario', 'Valor unitário (R$)', 'numero', { faceta: 'intervalo' }),
    ess('ativo', 'Ativo', 'booleano', { faceta: 'booleano' }),

    det('ml_por_limpeza', 'ml por limpeza', 'numero'),
    det('seed', 'Veio do padrão', 'booleano', { faceta: 'booleano' }),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const ESTIMATIVA_CUSTO_SNAPSHOT: TabelaCatalogo = {
  nome: 'estimativa_custo_snapshot',
  rotulo: 'Snapshots de custo',
  descricao:
    'Foto congelada do cálculo de custo numa data: custo por litro, lucro por lactante, receita do mês, custo ' +
    'da fêmea até o desmame. É a ÚNICA série temporal financeira já pronta no banco — o gráfico de custo/litro ' +
    'ao longo do tempo sai daqui direto. Tem soft delete (deleted_at).',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_referencia',
  area: 'Financeiro',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_referencia', 'Data de referência', 'data', { faceta: 'data' }),
    ess('segmento', 'Segmento', 'texto', { faceta: 'enum' }),
    ess('custo_litro', 'Custo por litro (R$)', 'numero', { faceta: 'intervalo' }),
    ess('lucro_lactante_dia', 'Lucro/lactante/dia (R$)', 'numero'),
    ess('lucro_lactante_mes', 'Lucro/lactante/mês (R$)', 'numero'),
    ess('receita_mes', 'Receita do mês (R$)', 'numero'),
    ess('producao_litros_dia', 'Produção (L/dia)', 'numero'),
    ess('producao_lactantes', 'Lactantes', 'numero'),

    det('media_litros_lactante', 'Média por lactante (L)', 'numero'),
    det('custo_femea_desmame', 'Custo da fêmea até o desmame (R$)', 'numero'),
    det('custo_femea_8_meses', 'Custo da fêmea aos 8 meses (R$)', 'numero'),
    det('observacao', 'Observação', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('propriedade_id', 'Propriedade', 'numero'),
    tec('breakdown', 'Composição do custo', 'json'),
    tec('config_snapshot', 'Premissas congeladas', 'json'),
    tec('deleted_at', 'Excluído em', 'datahora'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTA — identidade, tenant e cobrança do SeabraApp
// ─────────────────────────────────────────────────────────────────────────────

const USUARIOS: TabelaCatalogo = {
  nome: 'usuarios',
  rotulo: 'Usuários',
  descricao:
    'A tabela-mãe de identidade: todo papel do sistema é uma linha aqui. O papel canônico é regra_de_acesso — ' +
    'tipo_usuario_id é dado sujo e não serve de gate. CPF e as duas colunas de senha do colaborador estão ' +
    'bloqueadas. E-mail e whatsapp aparecem CRUS nesta tela (a lista mestra /adm/usuarios é a versão mascarada), ' +
    'então abri-la é um acesso a dado pessoal e fica na trilha de auditoria.',
  colunaTenant: 'usuario_id',
  colunaTenantFisica: 'id',
  colunaData: 'data_cadastro',
  area: 'Conta',
  notaEscopo: 'O tenant é a própria PK: filtrar por `id`, não por uma coluna `usuario_id` (que não existe aqui).',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('id', 'Nº do usuário', 'numero'),
    ess('nome', 'Nome', 'texto'),
    ess('email', 'E-mail', 'texto'),
    ess('regra_de_acesso', 'Papel', 'texto', { faceta: 'enum' }),
    ess('ativo', 'Ativo', 'booleano', { faceta: 'booleano' }),
    ess('whatsapp_pessoal', 'WhatsApp', 'texto'),
    ess('propriedade_id', 'Propriedade', 'numero', { faceta: 'enum', referencia: REF_PROPRIEDADE }),
    ess('data_cadastro', 'Cadastro', 'datahora', { faceta: 'data' }),

    det('associacao_id', 'Associação', 'numero', { faceta: 'enum', referencia: REF_ASSOCIACAO }),
    det('onboarding_finalizado', 'Onboarding concluído', 'booleano', { faceta: 'booleano' }),
    det('email_confirmado', 'E-mail confirmado', 'booleano', { faceta: 'booleano' }),
    // is_tester e is_demo não constam do DTO gerado, mas estão em migrations
    // versionadas (20260408_tester_flag.sql e fix_demo_user_tipo_usuario.sql).
    det('is_tester', 'Tester (sem paywall)', 'booleano', { faceta: 'booleano' }),
    det('is_demo', 'Conta demo', 'booleano', { faceta: 'booleano' }),
    det('colaborador_username', 'Login do colaborador', 'texto'),
    det('colaborador_permissoes', 'Permissões do colaborador', 'texto'),
    det('whatsapp_pais', 'País do WhatsApp', 'texto', { faceta: 'enum' }),
    det('cidade', 'Cidade', 'texto', { faceta: 'enum' }),
    det('estado', 'UF', 'texto', { faceta: 'enum' }),
    det('titulos', 'Títulos do criador', 'texto'),

    // uuid NULO significa conta que não loga pelo Supabase Auth (colaborador
    // legado) — é sinal de diagnóstico, por isso fica exposto como coluna técnica.
    tec('uuid', 'UUID no Auth', 'texto'),
    tec('tipo_usuario_id', 'Tipo (legado, dado sujo)', 'numero'),
    tec('endereco', 'Endereço', 'texto'),
    tec('cep', 'CEP', 'texto'),
    tec('latitude', 'Latitude', 'numero'),
    tec('longitude', 'Longitude', 'numero'),
    tec('foto', 'Foto', 'texto'),
    tec('whatsapp_enabled', 'WhatsApp habilitado', 'booleano'),
    tec('asaas_customer_id', 'ID do cliente no Asaas', 'texto'),
    tec('valor_mensal_promocional', 'Valor promocional', 'numero'),
    tec('recrutamento_notificado_id', 'Recrutamento', 'numero'),
  ],
};

const PROPRIEDADES: TabelaCatalogo = {
  nome: 'propriedades',
  rotulo: 'Propriedades',
  descricao:
    'A fazenda — a unidade REAL de tenant do sistema. produtor_id NULO não é dado faltando: é a marca de ' +
    'propriedade de consultoria, criada pelo técnico sem produtor dono.',
  colunaTenant: 'propriedade_id',
  colunaTenantFisica: 'id',
  colunaData: 'data_cadastro',
  area: 'Conta',
  notaEscopo: 'O tenant é a própria PK: filtrar por `id`, não por uma coluna `propriedade_id`.',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('id', 'Nº da propriedade', 'numero'),
    ess('nome_propriedade', 'Propriedade', 'texto'),
    ess('numero_criador', 'Nº de criador', 'texto'),
    ess('produtor_id', 'Produtor dono', 'numero', { referencia: REF_USUARIO }),
    ess('cidade', 'Cidade', 'texto', { faceta: 'enum' }),
    ess('estado', 'UF', 'texto', { faceta: 'enum' }),
    ess('segmentos', 'Segmentos', 'texto', { faceta: 'enum' }),
    ess('data_cadastro', 'Cadastro', 'datahora', { faceta: 'data' }),

    det('tipo', 'Tipo', 'texto', { faceta: 'enum' }),
    det('nome_proprietario', 'Nome do proprietário', 'texto'),
    det('associacao', 'Ligada a associação', 'booleano', { faceta: 'booleano' }),
    det('cep', 'CEP', 'texto'),
    det('identificacao_ao_nascer', 'Identificação ao nascer', 'texto', { faceta: 'enum' }),
    det('metodo_criacao', 'Método de criação', 'texto', { faceta: 'enum' }),

    tec('latitude', 'Latitude', 'numero'),
    tec('longitude', 'Longitude', 'numero'),
    tec('auto_categoria_habilitado', 'Auto-categoria ligada', 'booleano'),
    tec('peso_ideal_desmame', 'Peso ideal ao desmame', 'numero'),
    tec('idade_desmame', 'Idade de desmame', 'numero'),
    tec('peso_ideal_entrada_reproducao', 'Peso ideal p/ reprodução', 'numero'),
    tec('idade_entrada_reproducao', 'Idade p/ reprodução', 'numero'),
    tec('dias_diagnostico_gestacional', 'Dias p/ DG', 'numero'),
    tec('peso_padrao_nascimento', 'Peso padrão ao nascer', 'numero'),
  ],
};

const ASSINATURAS: TabelaCatalogo = {
  nome: 'assinaturas',
  rotulo: 'Assinaturas',
  descricao:
    'Assinatura de um usuário OU de uma associação, nunca dos dois. ATENÇÃO: nunca decidir acesso por `status` ' +
    'cru — a verdade é view_status_assinatura.status_efetivo, que resolve extensão manual. periodo_gracia_ate e ' +
    'atrasos_consecutivos foram DROPADAS em 05/2026: não existe mais período de graça.',
  colunaTenant: 'usuario_id',
  colunaData: 'data_inicio',
  area: 'Conta',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('usuario_id', 'Usuário', 'numero', { referencia: REF_USUARIO }),
    ess('plano_id', 'Plano', 'numero', { faceta: 'enum', referencia: REF_PLANO }),
    ess('status', 'Status cru', 'texto', { faceta: 'enum' }),
    ess('data_inicio', 'Início', 'datahora', { faceta: 'data' }),
    ess('data_vencimento', 'Vencimento', 'datahora', { faceta: 'data' }),
    ess('extensao_manual_ate', 'Extensão manual até', 'datahora', { faceta: 'data' }),
    ess('metodo_pagamento', 'Método', 'texto', { faceta: 'enum' }),

    det('associacao_id', 'Associação', 'numero', { faceta: 'enum', referencia: REF_ASSOCIACAO }),

    tec('id', 'ID', 'numero'),
    tec('asaas_customer_id', 'Cliente no Asaas', 'texto'),
    tec('asaas_subscription_id', 'Assinatura no Asaas', 'texto'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const PAGAMENTOS: TabelaCatalogo = {
  nome: 'pagamentos',
  rotulo: 'Pagamentos',
  descricao:
    'Cobranças individuais vindas do Asaas. Não tem usuario_id nem propriedade_id: chega ao cliente por ' +
    'assinatura_id. Os status são os do Asaas em maiúsculas (PENDING, CONFIRMED, RECEIVED, OVERDUE...).',
  colunaTenant: 'usuario_id',
  colunaTenantFisica: 'assinatura_id',
  colunaData: 'data_vencimento',
  area: 'Conta',
  notaEscopo:
    'Escopo indireto: resolver primeiro os ids de assinaturas do usuário (assinaturas.usuario_id) e filtrar ' +
    'pagamentos por assinatura_id IN (...).',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('data_vencimento', 'Vencimento', 'data', { faceta: 'data' }),
    ess('valor', 'Valor (R$)', 'numero', { faceta: 'intervalo' }),
    ess('status', 'Status', 'texto', { faceta: 'enum' }),
    ess('metodo_pagamento', 'Método', 'texto', { faceta: 'enum' }),
    ess('data_pagamento', 'Pago em', 'datahora', { faceta: 'data' }),
    ess('asaas_payment_id', 'ID no Asaas', 'texto'),

    det('invoice_url', 'Fatura', 'texto'),
    det('boleto_url', 'Boleto', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('assinatura_id', 'Assinatura', 'numero'),
    tec('pix_payload', 'Payload do PIX', 'texto'),
    tec('pix_qr_code_url', 'QR Code do PIX', 'texto'),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

const TECNICO_PROPRIEDADES: TabelaCatalogo = {
  nome: 'tecnico_propriedades',
  rotulo: 'Vínculos de consultoria',
  descricao:
    'O vínculo durável técnico ↔ propriedade-cliente: é assim que um consultor atende vários produtores. Só ' +
    'status = "ativo" concede acesso. Escrita só por RPC — INSERT/UPDATE diretos são negados pela RLS.',
  colunaTenant: 'propriedade_id',
  colunaData: 'data_vinculo',
  area: 'Conta',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('tecnico_id', 'Técnico', 'numero', { faceta: 'enum', referencia: REF_USUARIO }),
    ess('propriedade_id', 'Propriedade', 'numero', { faceta: 'enum', referencia: REF_PROPRIEDADE }),
    ess('status', 'Status', 'texto', { faceta: 'enum' }),
    ess('data_vinculo', 'Vinculado em', 'datahora', { faceta: 'data' }),

    tec('id', 'ID', 'numero'),
    tec('created_at', 'Criado em', 'datahora'),
  ],
};

const PERFIL_TECNICO: TabelaCatalogo = {
  nome: 'perfil_tecnico',
  rotulo: 'Perfil do técnico',
  descricao:
    'Perfil profissional 1:1 do técnico e a máquina de estados da habilitação para AML. As quatro colunas de ' +
    'habilitação são write-only-via-RPC (trigger trg_guard_habilitacao_aml) — aqui elas são só leitura mesmo.',
  colunaTenant: 'usuario_id',
  colunaData: 'created_at',
  area: 'Conta',
  colunasBloqueadas: [...COLUNAS_SEMPRE_BLOQUEADAS],
  colunas: [
    ess('nome', 'Nome', 'texto'),
    ess('email', 'E-mail', 'texto'),
    ess('telefone', 'Telefone', 'texto'),
    ess('profissao', 'Profissão', 'texto', { faceta: 'enum' }),
    ess('especialidade', 'Especialidade', 'texto', { faceta: 'enum' }),
    ess('habilitacao_aml_status', 'Habilitação AML', 'texto', { faceta: 'enum' }),
    ess('visitas', 'Visitas', 'numero', { faceta: 'intervalo' }),
    ess('avaliacoes', 'Avaliações', 'numero', { faceta: 'intervalo' }),

    det('sobre', 'Sobre', 'texto'),
    det('informacoes_adicionais', 'Informações adicionais', 'texto'),
    det('locais_atendimento', 'Locais de atendimento', 'texto'),
    det('habilitacao_aprovada_em', 'Habilitação aprovada em', 'datahora', { faceta: 'data' }),
    det('habilitacao_motivo_rejeicao', 'Motivo da rejeição', 'texto'),

    tec('id', 'ID', 'numero'),
    tec('usuario_id', 'Usuário', 'numero', { referencia: REF_USUARIO }),
    tec('foto_perfil', 'Foto', 'texto'),
    tec('certificado', 'Certificado', 'texto'),
    tec('habilitacao_aprovada_por', 'Aprovada por', 'numero', { referencia: REF_USUARIO }),
    tec('created_at', 'Criado em', 'datahora'),
    tec('updated_at', 'Atualizado em', 'datahora'),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// O catálogo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ordem = ordem de apresentação dentro de cada área. Acrescentar uma tabela é
 * acrescentar uma linha aqui; nenhuma rota nova, nenhuma tela nova.
 */
export const CATALOGO: readonly TabelaCatalogo[] = [
  // Rebanho
  REBANHO,
  CATEGORIA_ANIMAL,
  VENDA,
  OBITO,
  DESCARTE,
  // Produção
  PRODUCAO_DIARIA,
  CONTROLE_LEITEIRO,
  LACTACAO,
  SECAGEM,
  SAIDA_LEITE,
  ANALISE_LEITE,
  // Reprodução
  INSEMINACAO,
  MONTA_CONTROLADA,
  MONTA_LIVRE,
  DIAGNOSTICO_GESTACAO,
  ABORTO,
  TRANSFERENCIA_EMBRIAO,
  ACASALAMENTO_PLANEJADO,
  // Sanidade
  CLINICA,
  SUSPEITAS,
  MANEJO,
  PROTOCOLOS_MANEJO,
  MANEJO_COLETIVO_SESSAO,
  // Crescimento
  PESAGEM,
  ENGORDA,
  // Avaliação
  AVALIACAO_MORFOLOGICA_LINEAR,
  MEDIDAS,
  AML_CORTE,
  // Estrutura
  SETORES,
  BAIAS,
  LOTES,
  MOVIMENTACOES,
  // Financeiro
  FINANCEIRO_LANCAMENTOS,
  FINANCEIRO_SETORES,
  CUSTO_FIXO_MES,
  INSUMO,
  ESTIMATIVA_CUSTO_SNAPSHOT,
  // Conta
  USUARIOS,
  PROPRIEDADES,
  ASSINATURAS,
  PAGAMENTOS,
  TECNICO_PROPRIEDADES,
  PERFIL_TECNICO,
];
