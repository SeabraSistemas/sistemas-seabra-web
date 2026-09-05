import 'server-only';

import { VIEWS_FASE_2, type LinhaEstrutura } from '@/lib/adm/areas/contrato';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type FatiaDistribuicao, type Resultado } from '@/lib/adm/types';

/**
 * Área ESTRUTURA — a hierarquia física da fazenda (aba 9): lote → setor → baia,
 * e o histórico de movimentação entre elas.
 *
 * O NÚMERO QUE IMPORTA AQUI É "ANIMAIS SEM LOCALIZAÇÃO". As contagens de setor,
 * baia e lote são inventário; o animal sem localização é DADO FALTANDO — e é
 * acionável: o consultor liga e pede para o cliente alocar o rebanho, e a partir
 * daí manejo coletivo, movimentação e relatório por lote passam a funcionar.
 * Sem localização, metade do app é uma tela em branco para o produtor.
 *
 * A ORDEM DE GRANDEZA ESPERADA: só ~16% dos animais ativos têm baia preenchida
 * (docs/BOVINOS_INVENTARIO_TELAS.md do seabra-app-main). Ou seja, "muita gente
 * sem localização" é o estado REAL da base, não um bug de leitura — e a tela
 * precisa apresentar isso como oportunidade de consultoria, não como falha.
 *
 * ⚠️ LOTE E SETOR SÃO NOMES LOCAIS DE CADA FAZENDA. `lotes`/`setores`/`baias`
 * são catálogos por `propriedade_id`: o lote "Lactação" da fazenda A e o
 * "Lactação" da fazenda B são linhas diferentes que por acaso têm o mesmo nome.
 * Somar as duas num gráfico consolidado inventaria um lote que não existe — por
 * isso, ao consolidar, as distribuições ficam VAZIAS e a tela pede uma fazenda.
 * (É a diferença para raça e categoria, que são catálogos globais e podem ser
 * fundidos por nome, como `consolidarVisoes()` faz.)
 *
 * Somente leitura (D3).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Contrato de leitura — nome de view e de coluna vêm de contrato.ts, só de lá
// ─────────────────────────────────────────────────────────────────────────────

/** Nome da view. NUNCA digitado como string — ver o cabeçalho de contrato.ts. */
const VIEW = VIEWS_FASE_2.estrutura;

/** Projeção tipada pelo contrato: coluna que o contrato não declara não compila. */
const COLUNAS: (keyof LinhaEstrutura)[] = [
  'propriedade_id',
  'setores',
  'baias',
  'lotes',
  'movimentacoes_12m',
  'animais_sem_localizacao',
  'por_lote',
  'por_setor',
];

/** Chaves do contrato, valores `unknown` — o banco não conhece o tipo do TS. */
type Crua<T> = { [K in keyof T]?: unknown };

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing — espelha o de queries.ts, que mantém os helpers privados
// ─────────────────────────────────────────────────────────────────────────────

type ErroPostgrest = { message: string; code?: string };
type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** PGRST106 · PGRST205 · 42P01 · 42501 · 3F000: o banco não está preparado. A
 *  ação do operador é a mesma nos cinco, então os cinco viram 'sem-config'. */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${VIEW}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${VIEW}" não está acessível (${e.code}). Rode as migrations de ` +
        'supabase/adm/ (adm_05_verificacao.sql acusa exatamente qual view falta) e confirme ' +
        'que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${VIEW}: ${e.message}`);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  return null;
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Contagem: 0 significa "nenhum", nunca "não sei" — a convenção do contrato. */
function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function objeto(v: unknown): Record<string, unknown> | null {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : null;
}

function arranjo(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.map(objeto).filter((l): l is Record<string, unknown> => l !== null) : [];
}

function mapearFatias(linhas: Record<string, unknown>[], padrao: string): FatiaDistribuicao[] {
  return linhas.map((l) => ({ rotulo: texto(l.rotulo) ?? padrao, valor: numero(l.valor) ?? 0 }));
}

// ─────────────────────────────────────────────────────────────────────────────
// O domínio da aba
// ─────────────────────────────────────────────────────────────────────────────

export interface EstruturaFisica {
  setores: number;
  baias: number;
  lotes: number;
  /** Trocas de localização e/ou lote nos últimos 12 meses. */
  movimentacoes12m: number;
  /** Animais ATIVOS sem lote, setor e baia. O número acionável desta aba. */
  animaisSemLocalizacao: number;

  /** Contagem de animais por lote — nomes locais desta propriedade. */
  porLote: FatiaDistribuicao[];
  porSetor: FatiaDistribuicao[];

  /** true quando o objeto é soma de mais de uma propriedade: distribuições vazias. */
  consolidado: boolean;
}

/** Propriedade sem linha na view: fazenda que nunca cadastrou estrutura. É um
 *  fato do negócio (e o gancho de consultoria), não um erro de leitura. */
export function estruturaVazia(): EstruturaFisica {
  return {
    setores: 0,
    baias: 0,
    lotes: 0,
    movimentacoes12m: 0,
    animaisSemLocalizacao: 0,
    porLote: [],
    porSetor: [],
    consolidado: false,
  };
}

function mapear(l: Crua<LinhaEstrutura>): EstruturaFisica {
  return {
    setores: inteiro(l.setores),
    baias: inteiro(l.baias),
    lotes: inteiro(l.lotes),
    movimentacoes12m: inteiro(l.movimentacoes_12m),
    animaisSemLocalizacao: inteiro(l.animais_sem_localizacao),
    // "Sem lote"/"Sem setor" como rótulo padrão e não "Não informado": aqui a
    // ausência tem nome próprio e é o assunto da tela.
    porLote: mapearFatias(arranjo(l.por_lote), 'Sem lote'),
    porSetor: mapearFatias(arranjo(l.por_setor), 'Sem setor'),
    consolidado: false,
  };
}

/** Uma linha por propriedade — cardinalidade garantida pelo contrato. */
export async function getEstrutura(propriedadeId: number): Promise<Resultado<EstruturaFisica>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const consulta = supa
    .from(VIEW)
    .select(COLUNAS.join(','))
    .eq('propriedade_id', propriedadeId)
    .limit(1) as unknown as PromiseLike<Resposta>;

  const { data, error } = await consulta;
  if (error) return falha(error);

  const linha = objeto(data?.[0]);
  return ok(linha ? mapear(linha) : estruturaVazia());
}

/**
 * Funde N propriedades. Contagem soma; distribuição NÃO — ver o aviso sobre
 * nomes locais no cabeçalho. A tela avisa e oferece o seletor de fazenda.
 */
export function consolidarEstruturas(itens: EstruturaFisica[]): EstruturaFisica {
  if (itens.length === 0) return estruturaVazia();
  if (itens.length === 1) return itens[0];

  const somar = (pegar: (e: EstruturaFisica) => number) => itens.reduce((acc, e) => acc + pegar(e), 0);

  return {
    setores: somar((e) => e.setores),
    baias: somar((e) => e.baias),
    lotes: somar((e) => e.lotes),
    movimentacoes12m: somar((e) => e.movimentacoes12m),
    animaisSemLocalizacao: somar((e) => e.animaisSemLocalizacao),
    porLote: [],
    porSetor: [],
    consolidado: true,
  };
}

/**
 * Fração do rebanho ativo sem localização (0,84 = 84%), para dar tamanho ao
 * número absoluto — "312 sem localização" numa fazenda de 320 e numa de 4.820
 * são dois problemas diferentes.
 *
 * `animaisAtivos` vem do ESCOPO (`adm.propriedades_escopo`), não desta view. São
 * duas leituras diferentes do mesmo rebanho, então null aqui é deliberado em
 * dois casos: sem denominador não há percentual, e um numerador MAIOR que o
 * denominador significa que as duas views discordam — exibir "137%" seria pior
 * que exibir só a contagem absoluta, que continua correta.
 */
export function fracaoSemLocalizacao(
  estrutura: EstruturaFisica,
  animaisAtivos: number,
): number | null {
  if (animaisAtivos <= 0) return null;
  if (estrutura.animaisSemLocalizacao > animaisAtivos) return null;
  return estrutura.animaisSemLocalizacao / animaisAtivos;
}

/** Nenhum lote, setor ou baia cadastrado: a fazenda não tem hierarquia física.
 *  Não é o mesmo que ter hierarquia e não alocar os animais — a conversa com o
 *  cliente é outra em cada caso. */
export function semHierarquia(estrutura: EstruturaFisica): boolean {
  return estrutura.lotes === 0 && estrutura.setores === 0 && estrutura.baias === 0;
}

/**
 * Acrescenta à distribuição a fatia dos animais que ela não cobre.
 *
 * POR QUE PRECISA: `por_lote` e `por_setor` nascem de um GROUP BY sobre a FK do
 * rebanho, e animal com FK nula não produz grupo nenhum. O gráfico então mostra
 * 100% do rebanho distribuído em lotes quando, na verdade, a maior parte dele
 * pode estar fora de qualquer lote — um gráfico correto em cada barra e falso no
 * conjunto. Com a fatia, a ausência aparece do tamanho que ela tem.
 *
 * A quantidade é o BURACO DESTA distribuição (`ativos − já distribuídos`), e não
 * o campo `animaisSemLocalizacao`: aquele conta quem não tem lote NEM setor NEM
 * baia, e usá-lo nos dois gráficos subestimaria o animal que tem setor e não tem
 * lote. Assim cada gráfico fecha com o próprio total.
 *
 * Idempotente por construção: se a view já devolveu um balde de ausência, o
 * buraco é zero e nada é acrescentado. O teste por rótulo é a segunda trava,
 * para o caso de as duas views (escopo e estrutura) discordarem por um animal
 * lido em instantes diferentes — melhor não desenhar barra nenhuma do que
 * desenhar uma barra de ruído.
 */
const ROTULO_DE_AUSENCIA = /^(sem\s|não informado|nao informado|n\/a$|—$|-$)/i;

export function comFatiaSemLocalizacao(
  fatias: FatiaDistribuicao[],
  animaisAtivos: number,
  rotulo: string,
): FatiaDistribuicao[] {
  if (fatias.some((f) => ROTULO_DE_AUSENCIA.test(f.rotulo.trim()))) return fatias;
  const distribuidos = fatias.reduce((acc, f) => acc + f.valor, 0);
  const buraco = Math.round(animaisAtivos - distribuidos);
  if (buraco <= 0) return fatias;
  return [...fatias, { rotulo, valor: buraco }];
}
