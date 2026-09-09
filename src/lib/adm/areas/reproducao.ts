import 'server-only';

import {
  VIEWS_FASE_2,
  type LinhaDgPendente,
  type LinhaReproducao,
  type PontoSerieNomeada,
} from '@/lib/adm/areas/contrato';
import { fundirFatias } from '@/lib/adm/metricas';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type FatiaDistribuicao, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * Leitura da aba Reprodução — a área que responde "este rebanho está emprenhando
 * e parindo?", que é a pergunta de consultoria mais cara do caprino leiteiro:
 * fêmea vazia come igual e não produz.
 *
 * O NOME DA VIEW NÃO É DIGITADO AQUI. Vem de `VIEWS_FASE_2.reproducao`, em
 * areas/contrato.ts. Foi exatamente uma string digitada duas vezes com grafias
 * diferentes que, na Fase 1, deixou dez telas em branco com o build passando:
 * nome de relação só falha em runtime, e o PostgREST devolve "não encontrada"
 * que a tela desenha como estado vazio — indistinguível de um cliente sem dados.
 *
 * UMA LEITURA, NÃO QUATRO. A série mensal e o funil chegam como colunas jsonb da
 * MESMA linha, seguindo o que `adm.propriedade_visao_geral` já faz. Uma view
 * lateral por gráfico custaria três round-trips por propriedade — e o consultor
 * com 15 fazendas no escopo abriria 60.
 *
 * A CONVENÇÃO DE NULO DO CONTRATO É A ALMA DESTA TELA:
 *   contagem   → 0 é "nenhum"
 *   média/taxa → null é "não dá para calcular" (denominador zero)
 * Taxa de prenhez 0% é um cliente com problema grave e um telefonema a dar;
 * taxa de prenhez "—" é um cliente que não faz diagnóstico de gestação, e o
 * telefonema é outro. Trocar um pelo outro faz o Felipe cobrar a coisa errada.
 *
 * ⚠️ NÃO EXISTE TABELA DE PARTO no banco do app. O parto é o INSERT das crias em
 * `rebanho` com `mae_id` (mais os contadores da mãe, mantidos por trigger). A
 * view conta pares distintos (mãe, dia de nascimento) — uma ninhada de três
 * crias no mesmo dia é UM parto. Quem ler "partos_12m" precisa saber disso, e é
 * por isso que a tela imprime a definição embaixo do card.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Projeção — conferida contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `satisfies Record<keyof LinhaReproducao, true>` é a rede: esquecer uma coluna aqui
 * vira erro de `tsc`, não zero na tela.
 *
 * Por que isso importa mais do que parece — com `select('*')`, uma coluna
 * renomeada na view faz o PostgREST devolver a linha SEM a chave; `inteiro(
 * undefined)` dá 0, e a tela afirma "0 partos em 12 meses" para um criador que tem. Com
 * projeção explícita o mesmo erro vira HTTP 400 e a tela mostra a falha.
 */
const PROJECAO = {
  propriedade_id: true,
  coberturas_12m: true,
  inseminacoes_12m: true,
  montas_12m: true,
  te_12m: true,
  diagnosticos_12m: true,
  diagnosticos_positivos_12m: true,
  taxa_prenhez: true,
  partos_12m: true,
  abortos_12m: true,
  idade_primeiro_parto_dias: true,
  prolificidade_media: true,
  intervalo_partos_dias: true,
  femeas_ativas: true,
  gestantes: true,
  serie_mensal: true,
  funil: true,
  dg_pendentes: true,
} satisfies Record<keyof LinhaReproducao, true>;

/** Nunca `select('*')`: a projeção explícita é o que impede uma coluna nova da
 *  view de entrar no payload RSC sem ninguém ter decidido que ela pode. */
const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulário da área — as strings que a view promete, num lugar só
// ─────────────────────────────────────────────────────────────────────────────

/**
 * As duas curvas que vivem dentro de `serie_mensal`. São `PontoSerieNomeada`,
 * ou seja, uma coluna jsonb só com o campo `serie` discriminando — em vez de
 * duas colunas jsonb que sempre andariam juntas e poderiam dessincronizar.
 */
export const CURVA_COBERTURAS = 'coberturas';
export const CURVA_PARTOS = 'partos';

/**
 * O funil, NA ORDEM DO FUNIL. Esta constante existe para a tela nunca depender
 * da ordem em que o jsonb chegou: um funil reordenado por volume deixa de ser
 * funil e vira ranking — e, pior, vira um ranking que parece um funil.
 */
export const ETAPAS_FUNIL = ['Coberturas', 'Diagnósticos', 'Positivos', 'Partos'] as const;

export type EtapaFunilNome = (typeof ETAPAS_FUNIL)[number];

export interface EtapaFunil {
  rotulo: EtapaFunilNome;
  valor: number;
  /**
   * Fração em relação à etapa ANTERIOR — a taxa de passagem, que é o que o
   * consultor lê. null na primeira etapa e quando a anterior é 0 (não existe
   * "conversão de zero"; seria divisão por zero disfarçada de 0%).
   */
  conversao: number | null;
  /** Fração em relação ao topo. Serve para a largura da barra. */
  doTopo: number | null;
}

/**
 * Atraso mínimo, em dias desde a cobertura, para uma fêmea sem DG entrar na
 * lista de pendência da tela — abaixo disso é só "ainda não deu tempo", não
 * atraso. A view em adm_07_areas.sql já corta o teto superior (155 dias, o
 * limite biológico da gestação); este é o piso, e é do usuário escolher: o
 * app GAS que inspirou esta tela oferecia 45 ou 60 dias, ou um valor customizado.
 */
export const DG_LIMIAR_PADRAO = 60;
export const DG_LIMIARES_RAPIDOS = [45, 60] as const;

/**
 * Agrupa `dg_pendentes` por baia e aplica o piso de dias — a mesma lista serve
 * o card e o texto de WhatsApp, então o filtro mora aqui, não duplicado nos dois
 * lugares que a consomem.
 */
export interface GrupoDgPendente {
  baia: string;
  animais: LinhaDgPendente[];
}

export function agruparDgPendentes(linha: LinhaReproducao, limiarDias: number): GrupoDgPendente[] {
  const filtrados = (linha.dg_pendentes ?? []).filter((a) => a.dias_desde_cobertura >= limiarDias);

  const porBaia = new Map<string, LinhaDgPendente[]>();
  for (const animal of filtrados) {
    const chave = animal.baia?.trim() || 'Sem baia';
    const lista = porBaia.get(chave);
    if (lista) lista.push(animal);
    else porBaia.set(chave, [animal]);
  }

  return [...porBaia.entries()]
    .map(([baia, animais]) => ({ baia, animais }))
    .sort((a, b) => {
      // "Sem baia" sempre por último — o mesmo critério de baiaStatsList do GAS
      // que inspirou esta tela: é o grupo de pior qualidade de cadastro, não um
      // lugar real para o consultor visitar.
      if (a.baia === 'Sem baia') return b.baia === 'Sem baia' ? 0 : 1;
      if (b.baia === 'Sem baia') return -1;
      return a.baia.localeCompare(b.baia, 'pt-BR');
    });
}

/** Texto pronto para colar no WhatsApp — um grupo por baia, mais atrasado primeiro dentro dele. */
export function textoWhatsAppDgPendentes(grupos: GrupoDgPendente[], limiarDias: number): string {
  if (grupos.length === 0) return '';

  const total = grupos.reduce((acc, g) => acc + g.animais.length, 0);
  const linhas: string[] = [
    `*Diagnóstico de gestação — mais de ${limiarDias} dias de cobertura (${total}):*`,
    '',
  ];

  for (const grupo of grupos) {
    linhas.push(`*${grupo.baia}:*`);
    for (const animal of grupo.animais) {
      const nome = animal.nome_animal?.trim();
      const identificador = nome ? `${animal.numero_animal} - ${nome}` : animal.numero_animal;
      linhas.push(`• Nº ${identificador} (${animal.dias_desde_cobertura} dias — coberta em ${formatarDataBR(animal.data_ultima_cobertura)})`);
    }
  }

  return linhas.join('\n');
}

function formatarDataBR(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local de leitura
//
// DUPLICAÇÃO DELIBERADA: `umaLinha()` e `falha()` são privados de queries.ts (não
// exportados), e este módulo não pode editá-lo. São ~30 linhas por módulo de
// área. Se um TERCEIRO módulo de área precisar do mesmo, é hora de promover isto
// para `src/lib/adm/areas/leitura.ts` — não de fazer a terceira cópia.
// ─────────────────────────────────────────────────────────────────────────────

type Linha = Record<string, unknown>;
type ErroPostgrest = { message: string; code?: string };

/**
 * "O banco não está preparado", e não "o painel quebrou": schema fora do Exposed
 * schemas · view inexistente · sem privilégio · schema inexistente. Nos quatro a
 * ação do operador é a mesma, então os quatro viram 'sem-config' com a instrução
 * de qual arquivo rodar. Mesmo conjunto de queries.ts, de propósito.
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

const SQL_AREAS = 'supabase/adm/adm_07_areas.sql';

function falhaDaArea<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode ${SQL_AREAS} no Supabase e ` +
        'confirme que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

/** Uma linha da view de área, ancorada em propriedade_id. `null` = sem linha. */
async function lerLinhaDaArea(view: string, propriedadeId: number): Promise<Resultado<Linha | null>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  // O cast único é o mesmo padrão de queries.ts: o client do supabase-js não tem
  // os tipos gerados deste banco, e tipar a resposta aqui evita `any` solto
  // atravessando o módulo.
  const { data, error } = (await supa
    .from(view)
    .select(SELECT)
    .eq('propriedade_id', propriedadeId)
    .limit(1)) as { data: Linha[] | null; error: ErroPostgrest | null };

  if (error) return falhaDaArea<Linha | null>(view, error);
  return ok(data?.[0] ?? null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Coerção — o banco não conhece o contrato de tipos
// ─────────────────────────────────────────────────────────────────────────────

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres chega como STRING quando a precisão não cabe em
  // double. Ignorar isso transforma prolificidade em null sem aviso nenhum.
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
  if (typeof v === 'number') return String(v);
  return null;
}

/** Coluna jsonb que deveria ser array de objetos; qualquer outra coisa vira null. */
function objetos(v: unknown): Linha[] | null {
  if (!Array.isArray(v)) return null;
  return v.filter((item): item is Linha => typeof item === 'object' && item !== null);
}

function fatias(v: unknown): FatiaDistribuicao[] | null {
  const linhas = objetos(v);
  if (!linhas) return null;
  return linhas.map((l) => ({ rotulo: texto(l.rotulo) ?? 'Não informado', valor: numero(l.valor) ?? 0 }));
}

function dgPendentes(v: unknown): LinhaDgPendente[] | null {
  const linhas = objetos(v);
  if (!linhas) return null;
  const itens = linhas
    .map((l) => ({
      numero_animal: texto(l.numero_animal) ?? '—',
      nome_animal: texto(l.nome_animal),
      baia: texto(l.baia),
      data_ultima_cobertura: texto(l.data_ultima_cobertura) ?? '',
      dias_desde_cobertura: inteiro(l.dias_desde_cobertura),
      tipo_cobertura: texto(l.tipo_cobertura) ?? 'Cobertura',
    }))
    // Sem data de cobertura o item não serve para nada que a tela faz com ele
    // (ordenar, filtrar por dias, escrever no texto do WhatsApp).
    .filter((item) => item.data_ultima_cobertura !== '');
  return itens.length > 0 ? itens : null;
}

function pontosNomeados(v: unknown): PontoSerieNomeada[] | null {
  const linhas = objetos(v);
  if (!linhas) return null;
  return linhas
    .map((l) => ({
      serie: texto(l.serie) ?? '',
      periodo: texto(l.periodo) ?? '',
      valor: numero(l.valor) ?? 0,
    }))
    .filter((p) => p.serie !== '' && p.periodo !== '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Propriedade sem linha na view. Isto é VAZIO, não quebrado: criador que nunca
 * lançou reprodução existe e é informação comercial (é lead de treinamento, não
 * bug). Zeros nas contagens e null nas médias, exatamente a convenção do
 * contrato.
 */
export function reproducaoVazia(propriedadeId: number): LinhaReproducao {
  return {
    propriedade_id: propriedadeId,
    coberturas_12m: 0,
    inseminacoes_12m: 0,
    montas_12m: 0,
    te_12m: 0,
    diagnosticos_12m: 0,
    diagnosticos_positivos_12m: 0,
    taxa_prenhez: null,
    partos_12m: 0,
    abortos_12m: 0,
    idade_primeiro_parto_dias: null,
    prolificidade_media: null,
    intervalo_partos_dias: null,
    femeas_ativas: 0,
    gestantes: 0,
    serie_mensal: null,
    funil: null,
    dg_pendentes: null,
  };
}

export async function getReproducao(propriedadeId: number): Promise<Resultado<LinhaReproducao>> {
  const res = await lerLinhaDaArea(VIEWS_FASE_2.reproducao, propriedadeId);
  if (!res.ok) return res;
  const l = res.dados;
  if (!l) return ok(reproducaoVazia(propriedadeId));

  return ok({
    propriedade_id: inteiro(l.propriedade_id) || propriedadeId,
    coberturas_12m: inteiro(l.coberturas_12m),
    inseminacoes_12m: inteiro(l.inseminacoes_12m),
    montas_12m: inteiro(l.montas_12m),
    te_12m: inteiro(l.te_12m),
    diagnosticos_12m: inteiro(l.diagnosticos_12m),
    diagnosticos_positivos_12m: inteiro(l.diagnosticos_positivos_12m),
    // Taxa e médias passam por `numero()` e NÃO por `inteiro()`: `inteiro()`
    // devolve 0 para null, e 0% de prenhez é uma afirmação — a errada.
    taxa_prenhez: numero(l.taxa_prenhez),
    partos_12m: inteiro(l.partos_12m),
    abortos_12m: inteiro(l.abortos_12m),
    idade_primeiro_parto_dias: numero(l.idade_primeiro_parto_dias),
    prolificidade_media: numero(l.prolificidade_media),
    intervalo_partos_dias: numero(l.intervalo_partos_dias),
    femeas_ativas: inteiro(l.femeas_ativas),
    gestantes: inteiro(l.gestantes),
    serie_mensal: pontosNomeados(l.serie_mensal),
    funil: fatias(l.funil),
    dg_pendentes: dgPendentes(l.dg_pendentes),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Derivações para a tela
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uma das duas curvas de `serie_mensal`, no formato que <SerieTemporal> come.
 *
 * Filtrar por `serie` em vez de a view devolver duas colunas é o que permite
 * acrescentar uma terceira curva (abortos, por exemplo) sem mudar a forma da
 * linha — e sem que o TypeScript e o SQL precisem concordar de novo.
 */
export function curvaMensal(linha: LinhaReproducao, curva: string): PontoSerie[] {
  return (linha.serie_mensal ?? [])
    .filter((p) => p.serie === curva)
    .map((p) => ({ periodo: p.periodo, valor: p.valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

/**
 * O funil em ordem GARANTIDA, com a taxa de passagem de cada etapa.
 *
 * Duas coisas acontecem aqui e as duas são de propósito:
 *
 * 1. A ORDEM VEM DE `ETAPAS_FUNIL`, não do jsonb. A view já entrega ordenado,
 *    mas depender disso significa que uma reordenação inocente no SQL vira um
 *    funil que sobe — e ninguém percebe, porque continua bonito.
 *
 * 2. FALTOU ETAPA, USA A CONTAGEM. Se o jsonb vier vazio (view antiga, linha
 *    ausente), as quatro colunas escalares reconstroem o mesmo funil. O gráfico
 *    e os cards passam a ser impossíveis de divergir, que é o que faz alguém
 *    confiar nos dois.
 */
export function etapasDoFunil(linha: LinhaReproducao): EtapaFunil[] {
  const doJsonb = new Map((linha.funil ?? []).map((f) => [f.rotulo, f.valor]));
  const dasColunas: Record<EtapaFunilNome, number> = {
    Coberturas: linha.coberturas_12m,
    'Diagnósticos': linha.diagnosticos_12m,
    Positivos: linha.diagnosticos_positivos_12m,
    Partos: linha.partos_12m,
  };

  const valores = ETAPAS_FUNIL.map((rotulo) => doJsonb.get(rotulo) ?? dasColunas[rotulo]);
  const topo = valores[0];

  return ETAPAS_FUNIL.map((rotulo, i) => {
    const anterior = i === 0 ? null : valores[i - 1];
    return {
      rotulo,
      valor: valores[i],
      conversao: anterior && anterior > 0 ? valores[i] / anterior : null,
      doTopo: topo > 0 ? valores[i] / topo : null,
    };
  });
}

/**
 * True quando alguma etapa é MAIOR que a anterior — o que é impossível como
 * biologia e comum como lançamento: o criador registra o nascimento da cria (que
 * o app exige, para a cria existir no rebanho) e não registra a cobertura nem o
 * diagnóstico, que são opcionais.
 *
 * Vale um aviso na tela porque muda a leitura inteira: um funil "invertido" não
 * é rebanho ruim, é preenchimento incompleto — e é justamente aí que existe algo
 * a vender (treinamento, ou o módulo de reprodução que o cliente não usa).
 */
export function funilInvertido(etapas: EtapaFunil[]): boolean {
  return etapas.some((etapa) => etapa.conversao !== null && etapa.conversao > 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de várias propriedades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Funde N propriedades numa linha só, na regra de `consolidarVisoes()`:
 * **soma o que é contagem, anula o que é média.**
 *
 * Média de médias não é a média do conjunto e não pertence a fazenda nenhuma —
 * uma fazenda com 4 partos e IPP de 300 dias somada a uma com 400 partos e IPP
 * de 250 dias daria 275, que é o número de ninguém. Vazio com a explicação ao
 * lado é honesto; um número plausível e errado não tem conserto depois que vira
 * argumento de consultoria.
 *
 * A EXCEÇÃO É A TAXA DE PRENHEZ, e ela é exceção pelo mesmo motivo que
 * `mediaProducaoDia` é em consolidarVisoes(): o numerador E o denominador estão
 * os dois no contrato, então a taxa é RECALCULADA sobre os totais. Isso não é
 * média de médias — é a taxa de verdade do conjunto.
 *
 * A taxa de mortalidade da aba Sanidade NÃO pode fazer o mesmo, porque o
 * denominador dela (o efetivo vivo) não é projetado. Lá o valor é anulado, e a
 * assimetria entre as duas abas é essa — não descuido.
 */
export function consolidarReproducao(linhas: LinhaReproducao[]): LinhaReproducao {
  if (linhas.length === 0) return reproducaoVazia(0);
  if (linhas.length === 1) return linhas[0];

  const soma = (pegar: (l: LinhaReproducao) => number) => linhas.reduce((acc, l) => acc + pegar(l), 0);

  const diagnosticos = soma((l) => l.diagnosticos_12m);
  const positivos = soma((l) => l.diagnosticos_positivos_12m);

  // Séries: soma por (curva, período). Duas fazendas que lançaram no mesmo mês
  // viram um ponto; a que não lançou continua ausente daquele mês em vez de
  // entrar como zero — quem preenche o eixo é a tela, que sabe a janela.
  const acumulador = new Map<string, PontoSerieNomeada>();
  for (const linha of linhas) {
    for (const ponto of linha.serie_mensal ?? []) {
      const chave = `${ponto.serie}|${ponto.periodo}`;
      const atual = acumulador.get(chave);
      if (atual) atual.valor += ponto.valor;
      else acumulador.set(chave, { ...ponto });
    }
  }
  const serie = [...acumulador.values()].sort(
    (a, b) => a.serie.localeCompare(b.serie) || a.periodo.localeCompare(b.periodo),
  );

  // fundirFatias() preserva a ordem de primeira aparição, e todas as linhas
  // trazem as quatro etapas na mesma ordem — mas quem garante a ordem do funil
  // na tela é etapasDoFunil(), não esta linha. Aqui só se soma.
  const funis = linhas.flatMap((l) => l.funil ?? []);

  // Concatena e reordena pelo mais atrasado — igual a `piores_gmd` em
  // crescimento.ts. O teto de 500 é o mesmo da view (adm_07_areas.sql): o
  // consolidado de várias fazendas não pode superar o de uma só por construção.
  const dgPendentesConsolidado = linhas
    .flatMap((l) => l.dg_pendentes ?? [])
    .sort((a, b) => b.dias_desde_cobertura - a.dias_desde_cobertura)
    .slice(0, 500);

  return {
    // Consolidado não é de nenhuma propriedade. Zero em vez do id da primeira:
    // carregar o id da fazenda nº 1 num objeto que soma 15 é exatamente o bug
    // `{...visoes[0]}` que a revisão da Fase 1 pegou.
    propriedade_id: 0,
    coberturas_12m: soma((l) => l.coberturas_12m),
    inseminacoes_12m: soma((l) => l.inseminacoes_12m),
    montas_12m: soma((l) => l.montas_12m),
    te_12m: soma((l) => l.te_12m),
    diagnosticos_12m: diagnosticos,
    diagnosticos_positivos_12m: positivos,
    taxa_prenhez: diagnosticos > 0 ? positivos / diagnosticos : null,
    partos_12m: soma((l) => l.partos_12m),
    abortos_12m: soma((l) => l.abortos_12m),
    idade_primeiro_parto_dias: null,
    prolificidade_media: null,
    intervalo_partos_dias: null,
    femeas_ativas: soma((l) => l.femeas_ativas),
    gestantes: soma((l) => l.gestantes),
    serie_mensal: serie,
    funil: funis.length > 0 ? fundirFatias(funis) : null,
    dg_pendentes: dgPendentesConsolidado.length > 0 ? dgPendentesConsolidado : null,
  };
}
