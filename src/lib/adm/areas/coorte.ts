import 'server-only';

import { VIEWS_FASE_3, type LinhaCoorte } from '@/lib/adm/areas/contrato';
import { diaCivil } from '@/lib/adm/format';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * ÁREA COORTE — a leitura de `adm.coorte_retencao` e a montagem da matriz
 * triangular de retenção que `/adm/carteira/adocao` desenha.
 *
 * NENHUM NOME DE VIEW É DIGITADO AQUI. `VIEWS_FASE_3.coorte` vem do contrato
 * (src/lib/adm/areas/contrato.ts), o mesmo arquivo que o SQL implementa e que
 * `adm_05_verificacao.sql` confere. Foi a divergência entre o nome escrito no SQL
 * e o nome escrito no TS que, na Fase 1, deixou dez telas compilando, passando no
 * lint e abrindo vazias.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O DEFEITO QUE ESTE ARQUIVO EXISTE PARA NÃO COMETER
 *
 * Uma matriz de coorte mente de um jeito muito específico e muito convincente:
 * **ela confunde "a coorte perdeu gente" com "o mês ainda não aconteceu".**
 *
 * Quem entrou em junho tem três meses de vida em setembro. O mês 6 dessa coorte
 * NÃO EXISTE — não é 0%, não é "sem dado", é uma célula que o calendário ainda
 * não escreveu. Se o mês inexistente virar zero, a média da coluna 6 desaba, o
 * gráfico desenha um despencar de retenção, e o despencar é só o calendário. É o
 * erro que faz alguém ligar para um cliente saudável perguntando o que houve.
 *
 * Por isso a célula é `CelulaCoorte | null` no TIPO, e não um número que às vezes
 * é zero: quem consome não tem como esquecer o caso — `null` não formata.
 *
 * As três regras que saem daí, e que a tela também precisa contar em português:
 *
 *   1. Célula além do horizonte da coorte é `null`. Sempre. Nunca 0.
 *   2. O MÊS EM CURSO FICA DE FORA INTEIRO. Hoje é dia 5; setembro tem cinco dias
 *      de lançamento e trinta de calendário. Uma última diagonal com um sexto do
 *      mês desenha exatamente a mesma queda falsa da regra 1, com o agravante de
 *      ser sempre a célula mais recente — a que mais chama atenção.
 *   3. Coorte com menos de MINIMO_COORTE contas não vira linha. Uma coorte de 1
 *      cliente só sabe dizer 100% ou 0%, e essas duas linhas gritando de cima da
 *      matriz estragam a leitura de todas as outras.
 *
 * O que foi descartado pela regra 2 e pela regra 3 é CONTADO e devolvido
 * (`novasDemais`, `pequenas`): descartar em silêncio encolhe o denominador sem
 * ninguém ver, que é a outra metade da mesma desonestidade.
 *
 * Somente leitura (decisão D3): este módulo só faz SELECT.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Regras de corte — os números que a tela também precisa citar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abaixo disto a coorte não entra na matriz nem nas médias.
 *
 * Três é o menor tamanho em que a retenção tem mais de dois valores possíveis.
 * Com 1 conta, a linha alterna entre 100% e 0% e o olho lê como colapso; com 2,
 * entre 100%, 50% e 0%. Uma coorte assim não é um sinal fraco — é um sinal que
 * empurra a média inteira, porque a média é ponderada por contas e não por
 * coortes, e a linha ainda por cima ocupa a mesma altura visual das outras.
 */
export const MINIMO_COORTE = 3;

/** Os meses de vida que viram card. 3/6/12 é o vocabulário de retenção que o
 *  mercado usa — e o mês 0 vira o card de ativação, separado. */
export const MESES_CARD = [3, 6, 12] as const;

/**
 * Teto de colunas da matriz. Uma tabela com mais de 24 colunas deixa de ser
 * legível mesmo com rolagem horizontal, e a base de clientes do SeabraApp tem
 * cerca de dois anos. Quando alguma coorte passa disso, `MatrizRetencao.truncada`
 * fica true e a tela DIZ que está cortando — cortar calado é como um painel
 * ensina o operador a desconfiar dele.
 */
export const TETO_COLUNAS = 24;

/** Fração abaixo da qual a coorte "perdeu metade" — a régua da meia-vida. */
const METADE = 0.5;

// ─────────────────────────────────────────────────────────────────────────────
// Projeção — conferida contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

const PROJECAO = {
  coorte: true,
  mes: true,
  tamanho: true,
  ativos: true,
  retencao: true,
} satisfies Record<keyof LinhaCoorte, true>;

/** Nunca `select('*')`: a projeção explícita é o que impede uma coluna nova da
 *  view de entrar no payload RSC sem ninguém ter decidido que ela pode. */
const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Formas que a tela consome
// ─────────────────────────────────────────────────────────────────────────────

export interface CelulaCoorte {
  /** Mês de vida: 0 = o mês de entrada. */
  mes: number;
  ativos: number;
  /**
   * ativos / tamanho, 0..1.
   *
   * RECALCULADO AQUI, e não copiado de `LinhaCoorte.retencao`, de propósito: a
   * tela mostra o numerador e o denominador ao lado do percentual, e os três
   * têm que fechar na conta que o operador faz de cabeça. Se a view arredondar
   * de um jeito e a tela de outro, "9 de 12 = 76%" vira uma discussão sobre o
   * painel em vez de sobre o cliente. Não há clamp em 1: uma view que devolva
   * mais ativos que o tamanho da coorte é um defeito, e um defeito que aparece
   * na tela como 120% se conserta; escondido atrás de um `Math.min`, não.
   */
  retencao: number;
}

export interface FaixaCoorte {
  /** 'YYYY-MM' do mês de entrada. */
  coorte: string;
  /** Contas que entraram — o denominador que a regra 3 obriga a mostrar. */
  tamanho: number;
  /**
   * Último mês de vida COMPLETO que esta coorte já viveu. -1 significa que ela
   * ainda não fechou nem o mês de entrada (e aí ela não entra na matriz).
   */
  horizonte: number;
  /**
   * Índice = mês de vida, comprimento = `MatrizRetencao.mesesMaximo + 1` em
   * TODAS as faixas — a matriz é retangular no tipo e triangular no conteúdo.
   * `null` é a regra 1 encarnada: o mês não aconteceu, e não existe número que
   * o represente.
   */
  celulas: (CelulaCoorte | null)[];
}

/** Um ponto da curva média — sempre com o denominador junto (regra 3). */
export interface RetencaoAgregada {
  retencao: number;
  ativos: number;
  /** Contas no denominador. "Março: 92%" sem isto não diz nada. */
  base: number;
  /** Quantas coortes chegaram a viver este mês. */
  coortes: number;
}

export interface MeiaVida {
  meses: number;
  /**
   * true quando a coorte mediana AINDA NÃO perdeu metade: o número é um piso
   * ("pelo menos N meses"), não uma medida. Censura é a regra 1 outra vez, agora
   * na estatística — tratar "não cruzou ainda" como "cruzou no último mês
   * observado" inventaria uma meia-vida curta para uma carteira saudável.
   */
  censurado: boolean;
  coortes: number;
}

export interface CoortesDescartadas {
  coortes: number;
  contas: number;
}

export interface MatrizRetencao {
  /** Da mais nova para a mais antiga: é a ordem em que se olha uma coorte. */
  faixas: FaixaCoorte[];
  /** Maior mês de vida presente. -1 = matriz vazia. */
  mesesMaximo: number;
  /** Índice = mês de vida. `null` onde nenhuma coorte chegou. */
  media: (RetencaoAgregada | null)[];
  /** Contas somadas nas faixas que ENTRARAM na matriz. */
  contas: number;
  /** 'YYYY-MM' do mês que está correndo — fora da matriz pela regra 2. */
  mesEmCurso: string;
  /** Descartadas pela regra 3 (pequenas demais). */
  pequenas: CoortesDescartadas;
  /** Descartadas pela regra 2 (entraram no mês em curso, sem nenhum mês fechado). */
  novasDemais: CoortesDescartadas;
  /** Alguma coorte viveu além de TETO_COLUNAS e a matriz está cortada. */
  truncada: boolean;
}

export interface ResumoAdocao {
  /** Mês 0: a fração da coorte que já estava ativa no mês em que entrou. */
  ativacao: RetencaoAgregada | null;
  /** Um por MESES_CARD. `valor` null = nenhuma coorte completou esse mês. */
  retencao: { mes: number; valor: RetencaoAgregada | null }[];
  meiaVida: MeiaVida | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gêmeos dos de `src/lib/adm/queries.ts`, pelo mesmo motivo já escrito em
 * areas/crescimento.ts e areas/sanidade.ts: lá eles são privados de um módulo de
 * 54 KB que traria a lista mestra e o escape hatch a reboque só para usar
 * `numero()`.
 *
 * ISTO JÁ É A NONA CÓPIA. A dívida está madura: o próximo que precisar deste
 * bloco extrai `src/lib/adm/areas/leitura.ts` e move as nove — o critério que as
 * notas anteriores combinaram ("quando forem oito") já passou.
 */
type Linha = Record<string, unknown>;

type ErroPostgrest = { message: string; code?: string };

type Consulta = {
  order(coluna: string, opcoes?: { ascending?: boolean }): Consulta;
  range(de: number, ate: number): Consulta;
} & PromiseLike<{ data: unknown[] | null; error: ErroPostgrest | null }>;

/** PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 *  42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma:
 *  o banco não foi preparado. Isso é 'sem-config', não 'erro' — e a diferença
 *  importa, porque uma carteira sem coorte por falta de migration parece uma
 *  carteira que nunca reteve ninguém. */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

function falha<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode o SQL das views da Fase 3 em ` +
        'supabase/adm/ — o que implementa VIEWS_FASE_3 de src/lib/adm/areas/contrato.ts — e confirme ' +
        'que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres chega como STRING quando a precisão não cabe em
  // double. Ignorar isso transformaria a retenção inteira em null sem aviso.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  return null;
}

/** 1000 = o db-max-rows do PostgREST. */
const PAGE = 1000;
/** 10 páginas. A matriz inteira são coortes × meses — algumas centenas de linhas
 *  numa carteira de dezenas de clientes. Passar de 10.000 é bug de view (produto
 *  cartesiano), não crescimento, e a tela precisa DIZER isso: um resultado
 *  truncado em silêncio é uma matriz com buracos que parecem churn. */
const MAX_PAGINAS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todas as linhas de `adm.coorte_retencao`, sem filtro.
 *
 * A matriz é um agregado da carteira inteira: não há como pedir "só as coortes
 * que interessam" antes de saber quais sobrevivem às regras 2 e 3, e as regras
 * moram aqui (em `montarMatriz`), não no SQL — porque a regra 2 depende de QUE
 * DIA É HOJE, e uma view que embutisse "hoje" devolveria matrizes diferentes
 * conforme o fuso do servidor.
 *
 * A ordenação é explícita mesmo com a ordenação depois refeita em JS: ela é o
 * que torna o corte da paginação determinístico. Sem `order`, o PostgREST pode
 * devolver as 1.000 primeiras linhas em qualquer ordem e a página 2 repetir
 * linhas da 1 — a matriz sairia com coortes faltando e ninguém veria erro nenhum.
 */
export async function getCoorte(): Promise<Resultado<LinhaCoorte[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FASE_3.coorte;
  const saida: LinhaCoorte[] = [];

  for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
    const de = pagina * PAGE;
    const consulta = (supa.from(view).select(SELECT) as unknown as Consulta)
      .order('coorte', { ascending: false })
      .order('mes', { ascending: true })
      .range(de, de + PAGE - 1);

    const { data, error } = await consulta;
    if (error) return falha<LinhaCoorte[]>(view, error);
    if (!data || data.length === 0) break;

    for (const bruta of data) {
      if (typeof bruta !== 'object' || bruta === null) continue;
      const l = bruta as Linha;
      const coorte = texto(l.coorte);
      // Sem 'YYYY-MM' não há linha: a coorte é a própria identidade da faixa, e
      // uma linha órfã viraria uma faixa fantasma com denominador zero.
      if (!coorte) continue;
      saida.push({
        coorte,
        mes: inteiro(l.mes),
        tamanho: inteiro(l.tamanho),
        ativos: inteiro(l.ativos),
        retencao: numero(l.retencao) ?? 0,
      });
    }

    if (data.length < PAGE) break;
    if (pagina === MAX_PAGINAS - 1) {
      return erro(
        `[adm] ${view}: passou de ${MAX_PAGINAS * PAGE} linhas. Uma matriz de coorte desse ` +
          'tamanho é produto cartesiano na view, não carteira — confira o group by de ' +
          'adm.coorte_retencao antes de ler o número na tela.',
      );
    }
  }

  return ok(saida);
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendário
// ─────────────────────────────────────────────────────────────────────────────

const PADRAO_MES = /^(\d{4})-(\d{2})/;

/**
 * 'YYYY-MM' (ou 'YYYY-MM-DD') → ano×12 + (mês−1), para subtrair meses como
 * inteiros. Aritmética de `Date` não serve aqui: somar mês em Date é a operação
 * que transforma 31/01 em 03/03, e a distância entre dois meses civis não tem
 * nada a ver com quantos dias eles têm.
 */
export function indiceMes(periodo: string | null | undefined): number | null {
  if (!periodo) return null;
  const m = PADRAO_MES.exec(periodo);
  if (!m) return null;
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return Number(m[1]) * 12 + (mes - 1);
}

/**
 * O mês civil de São Paulo, não o do runtime. A Vercel roda em UTC: às 21h de
 * 31 de agosto em São Paulo já é 1º de setembro em UTC, e o mês em curso mudaria
 * de nome por causa do fuso do servidor — a última diagonal da matriz apareceria
 * e desapareceria conforme a hora do dia.
 */
export function mesEmCurso(agora: Date): string {
  const dia = diaCivil(agora);
  // Instante inválido devolve '' — NUNCA o relógio do runtime.
  //
  // O fallback anterior era `new Date().toISOString()`, e ele cometia de uma vez
  // os dois defeitos que esta função existe para não cometer: a forma da matriz
  // passava a depender do relógio do SERVIDOR (um agregado com relógio
  // escondido é impossível de conferir) e do mês do UTC (às 23h de 31/03 em
  // Brasília, o UTC já está em abril — a coorte de março mudaria de lugar).
  //
  // Com '', `indiceMes` devolve null e `montarMatriz` sai pela matriz vazia:
  // a tela mostra "sem dados" em vez de uma matriz plausível e errada. Um
  // `agora` inválido é bug de quem chama, e a resposta honesta é não desenhar.
  if (dia === null) return '';
  return dia.slice(0, 7);
}

// ─────────────────────────────────────────────────────────────────────────────
// Montagem da matriz
// ─────────────────────────────────────────────────────────────────────────────

interface Rascunho {
  coorte: string;
  indice: number;
  tamanho: number;
  ativosPorMes: Map<number, number>;
  /** Horizonte só pelo calendário, antes dos tetos. Usado para detectar corte. */
  horizonteCalendario: number;
}

/**
 * As linhas cruas viram a matriz triangular. Função PURA e exportada: recebe
 * `agora` em vez de chamar `new Date()` por dentro, porque "que mês é hoje"
 * decide qual diagonal existe (regra 2) — e um agregado cuja forma depende de um
 * relógio escondido é impossível de conferir.
 */
export function montarMatriz(linhas: readonly LinhaCoorte[], agora: Date): MatrizRetencao {
  const emCurso = mesEmCurso(agora);
  const indiceAtual = indiceMes(emCurso);

  const vazia: MatrizRetencao = {
    faixas: [],
    mesesMaximo: -1,
    media: [],
    contas: 0,
    mesEmCurso: emCurso,
    pequenas: { coortes: 0, contas: 0 },
    novasDemais: { coortes: 0, contas: 0 },
    truncada: false,
  };
  if (indiceAtual === null) return vazia;

  // 1. Agrupa por coorte. `tamanho` é declarado repetido em toda linha da coorte
  //    (contrato); o máximo entre as réplicas absorve uma divergência da view sem
  //    encolher o denominador — encolher o denominador infla a retenção.
  const rascunhos = new Map<string, Rascunho>();
  let maiorMesDaView = -1;

  for (const l of linhas) {
    const indice = indiceMes(l.coorte);
    if (indice === null || l.mes < 0 || !Number.isFinite(l.mes)) continue;

    const chave = l.coorte.slice(0, 7);
    const existente = rascunhos.get(chave);
    const r: Rascunho =
      existente ?? {
        coorte: chave,
        indice,
        tamanho: 0,
        ativosPorMes: new Map<number, number>(),
        horizonteCalendario: indiceAtual - indice - 1,
      };
    if (!existente) rascunhos.set(chave, r);

    r.tamanho = Math.max(r.tamanho, l.tamanho);
    r.ativosPorMes.set(l.mes, Math.max(r.ativosPorMes.get(l.mes) ?? 0, l.ativos));
    if (l.mes > maiorMesDaView) maiorMesDaView = l.mes;
  }

  // 2. Aplica as regras de corte. Cada descarte é CONTADO: a tela precisa poder
  //    dizer quantas contas ficaram de fora, senão o denominador some sem rastro.
  const pequenas = { coortes: 0, contas: 0 };
  const novasDemais = { coortes: 0, contas: 0 };
  const aceitos: Rascunho[] = [];
  let truncada = false;

  for (const r of rascunhos.values()) {
    if (r.tamanho <= 0) continue;

    // Regra 2: sem nenhum mês fechado, não há o que afirmar sobre a coorte.
    if (r.horizonteCalendario < 0) {
      novasDemais.coortes += 1;
      novasDemais.contas += r.tamanho;
      continue;
    }
    // Regra 3.
    if (r.tamanho < MINIMO_COORTE) {
      pequenas.coortes += 1;
      pequenas.contas += r.tamanho;
      continue;
    }
    if (Math.min(r.horizonteCalendario, maiorMesDaView) > TETO_COLUNAS - 1) truncada = true;
    aceitos.push(r);
  }

  if (aceitos.length === 0) {
    return { ...vazia, pequenas, novasDemais, truncada };
  }

  // 3. O horizonte real de cada coorte é o MENOR entre três tetos, e os três
  //    existem por motivos diferentes:
  //      horizonteCalendario  o mês ainda não aconteceu (regra 1 + regra 2)
  //      maiorMesDaView       a view não computou tão longe — e afirmar 0% onde a
  //                           view calou seria inventar churn a partir de silêncio
  //      TETO_COLUNAS         legibilidade da tabela, declarada em `truncada`
  const horizonteDe = (r: Rascunho) =>
    Math.min(r.horizonteCalendario, maiorMesDaView, TETO_COLUNAS - 1);

  const mesesMaximo = aceitos.reduce((maior, r) => Math.max(maior, horizonteDe(r)), -1);
  if (mesesMaximo < 0) {
    return { ...vazia, pequenas, novasDemais, truncada };
  }

  // 4. Materializa cada faixa com o MESMO comprimento: retangular no tipo,
  //    triangular no conteúdo. Dentro do horizonte, mês sem linha na view é zero
  //    de verdade — o contrato de LinhaCoorte diz "uma linha por (mês de entrada,
  //    mês de vida)", então a ausência ali significa "ninguém ativo", que é
  //    justamente o churn que a matriz existe para mostrar.
  const faixas: FaixaCoorte[] = aceitos
    .map((r) => {
      const horizonte = horizonteDe(r);
      const celulas: (CelulaCoorte | null)[] = [];
      for (let mes = 0; mes <= mesesMaximo; mes += 1) {
        if (mes > horizonte) {
          celulas.push(null);
          continue;
        }
        const ativos = r.ativosPorMes.get(mes) ?? 0;
        celulas.push({ mes, ativos, retencao: ativos / r.tamanho });
      }
      return { coorte: r.coorte, tamanho: r.tamanho, horizonte, celulas };
    })
    // Mais nova em cima: a coorte de julho é a que ainda dá para consertar.
    .sort((a, b) => b.coorte.localeCompare(a.coorte));

  // 5. A curva média. PONDERADA POR CONTAS, não média das retenções: uma coorte
  //    de 3 e uma de 30 não pesam igual, e a média de médias é o número que
  //    parece exato e não é (mesma regra de consolidarCrescimento e de
  //    consolidarVisoes). O denominador muda de coluna para coluna, porque cada
  //    coluna só soma quem chegou lá — e é por isso que `base` viaja junto.
  const media: (RetencaoAgregada | null)[] = [];
  for (let mes = 0; mes <= mesesMaximo; mes += 1) {
    let ativos = 0;
    let base = 0;
    let coortes = 0;
    for (const f of faixas) {
      const c = f.celulas[mes];
      if (!c) continue;
      ativos += c.ativos;
      base += f.tamanho;
      coortes += 1;
    }
    media.push(base > 0 ? { retencao: ativos / base, ativos, base, coortes } : null);
  }

  return {
    faixas,
    mesesMaximo,
    media,
    contas: faixas.reduce((soma, f) => soma + f.tamanho, 0),
    mesEmCurso: emCurso,
    pequenas,
    novasDemais,
    truncada,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exportação — a matriz em formato longo
// ─────────────────────────────────────────────────────────────────────────────

/** Uma célula da matriz, achatada: (coorte, mês de vida) → o que aconteceu. */
export interface LinhaExportCoorte {
  /** 'YYYY-MM' do mês de entrada — a mesma chave de FaixaCoorte.coorte. */
  coorte: string;
  /** Contas que entraram nesta coorte — o denominador (regra 3). */
  tamanhoCoorte: number;
  /** Mês de vida: 0 = o mês de entrada. */
  mes: number;
  ativos: number;
  /** ativos / tamanhoCoorte, 0..1. */
  retencao: number;
}

/**
 * Achata a matriz para exportação: uma linha por célula que de fato aconteceu.
 *
 * NÃO PRECISA REAPLICAR AS TRÊS RECUSAS DO CABEÇALHO — elas já aconteceram na
 * hora de montar `matriz`. Uma coorte pequena demais (regra 3) ou nova demais
 * (regra 2) nunca chega a `faixas`; e dentro de cada faixa, um mês além do
 * horizonte é `null` e este loop pula exatamente essas células. Reproduzir
 * qualquer uma das três regras aqui seria uma segunda cópia que pode divergir
 * da primeira — a exportação lê o resultado já filtrado, não refiltra.
 */
export function linhasExportCoorte(matriz: MatrizRetencao): LinhaExportCoorte[] {
  const linhas: LinhaExportCoorte[] = [];
  for (const faixa of matriz.faixas) {
    for (const celula of faixa.celulas) {
      if (celula == null) continue;
      linhas.push({
        coorte: faixa.coorte,
        tamanhoCoorte: faixa.tamanho,
        mes: celula.mes,
        ativos: celula.ativos,
        retencao: celula.retencao,
      });
    }
  }
  return linhas;
}

// ─────────────────────────────────────────────────────────────────────────────
// Os cards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os números do topo da tela, todos derivados da MESMA matriz que está desenhada
 * embaixo. Card e tabela saindo de leituras diferentes é o clássico "um card
 * certo e um gráfico de outro recorte" — aqui é impossível por construção.
 */
export function resumoAdocao(matriz: MatrizRetencao): ResumoAdocao {
  const em = (mes: number) => (mes <= matriz.mesesMaximo ? matriz.media[mes] ?? null : null);

  return {
    ativacao: em(0),
    retencao: MESES_CARD.map((mes) => ({ mes, valor: em(mes) })),
    meiaVida: meiaVidaDe(matriz.faixas),
  };
}

/**
 * Em que mês de vida a coorte MEDIANA perde metade das contas.
 *
 * É a estatística que uma matriz de coorte existe para produzir, e a única que
 * resiste a colunas com denominadores diferentes: cada coorte é medida contra si
 * mesma, dentro do próprio horizonte.
 *
 * CENSURA. Uma coorte que ainda não caiu abaixo de 50% não tem meia-vida — ela
 * tem um PISO ("passou de N meses sem perder metade"). Tratar esse piso como se
 * fosse a meia-vida encurtaria a estatística exatamente nas coortes que estão
 * indo bem, que é o pior lugar possível para errar. Por isso a marca carrega
 * `censurado` e a mediana propaga a censura da coorte que ficou no meio: o card
 * mostra "≥ 8 meses", e "≥" é a informação, não um detalhe tipográfico.
 *
 * Com número par de coortes a mediana pega a de BAIXO em vez de interpolar: a
 * média de "5 meses" com "≥ 9 meses" não é um número que signifique alguma
 * coisa, e arredondar para o lado pessimista é o único erro que não inventa boa
 * notícia.
 */
function meiaVidaDe(faixas: readonly FaixaCoorte[]): MeiaVida | null {
  if (faixas.length === 0) return null;

  const marcas = faixas
    .map((f) => {
      const cruzou = f.celulas.findIndex((c) => c !== null && c.retencao < METADE);
      return cruzou >= 0
        ? { meses: cruzou, censurado: false }
        : { meses: Math.max(f.horizonte, 0), censurado: true };
    })
    // Empate entre "cruzou no mês 6" e "chegou ao mês 6 sem cruzar": o cruzado
    // vem primeiro, porque é a observação completa.
    .sort((a, b) => a.meses - b.meses || Number(a.censurado) - Number(b.censurado));

  const escolhida = marcas[Math.floor((marcas.length - 1) / 2)];
  return { meses: escolhida.meses, censurado: escolhida.censurado, coortes: marcas.length };
}
