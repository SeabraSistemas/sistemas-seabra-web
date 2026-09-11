import 'server-only';

import {
  VIEWS_LEITE,
  type LinhaContextoControle,
  type LinhaControleAnimal,
  type LinhaSessaoControle,
} from '@/lib/adm/areas/contrato';
import {
  comoLinhas,
  falhaDeLeitura,
  numeroDe,
  paginarView,
  textoDe,
  type Consulta,
  type Linha,
} from '@/lib/adm/areas/leitura';
import {
  PRONTA_PARA_COBRIR_APOS,
  situacaoReprodutiva,
  type EstadoReprodutivo,
} from '@/lib/adm/areas/situacao-reprodutiva';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * CONTROLE LEITEIRO INDIVIDUAL — a leitura das duas views de adm_12_leite.sql e
 * as regras que a tela do controle usa.
 *
 * A DIVISÃO DE TRABALHO ENTRE SQL E TYPESCRIPT AQUI É DELIBERADA:
 *
 *   · o SQL soma as ordenhas do dia e junta nome/baia (é join, e join é dele);
 *   · o TypeScript costura os dias consecutivos numa sessão, monta histograma,
 *     ranking e recorte por baia — tudo função pura, tudo com teste.
 *
 * O motivo é o recorte: a tela pergunta "o que deu o controle do dia 09/03", e
 * um jsonb pré-agregado teria que escolher a data no SQL. Como as views são
 * filtráveis por (propriedade_id, data_controle), a escolha fica na tela e o
 * volume lido é o de UM controle — dezenas de animais, não os 7 mil lançamentos
 * da fazenda inteira.
 *
 * A TERCEIRA VIEW (adm_28) é o CONTEXTO de cada animal naquele dia — setor,
 * lactação, cobertura e diagnóstico — e é ela que responde o que o consultor
 * pergunta ao abrir a lista: "essa cabra está coberta? tem DG? desde quando?".
 * ⚠️ Avaliado NA DATA DO CONTROLE, nunca pelos caches de `rebanho`: o estado de
 * hoje não vale para o controle de março. Ver `situacaoReprodutiva`.
 */

const SQL_LEITE = 'supabase/adm/adm_12_leite.sql';
const SQL_CONTEXTO = 'supabase/adm/adm_28_controle_contexto.sql';

// ─────────────────────────────────────────────────────────────────────────────
// Projeções — conferidas contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

const PROJECAO_SESSAO = {
  propriedade_id: true,
  data_controle: true,
  animais: true,
  animais_com_leite: true,
  litros_total: true,
  media_com_leite: true,
  del_medio: true,
  animais_com_del: true,
} satisfies Record<keyof LinhaSessaoControle, true>;

const PROJECAO_ANIMAL = {
  propriedade_id: true,
  data_controle: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  baia: true,
  litros: true,
  ordenhas: true,
  del: true,
  del_lancado: true,
  del_origem: true,
  lactacao_inicio: true,
  lactacao_fim: true,
} satisfies Record<keyof LinhaControleAnimal, true>;

const PROJECAO_CONTEXTO = {
  propriedade_id: true,
  data_controle: true,
  animal_id: true,
  setor: true,
  lactacao_numero: true,
  lactacao_anterior_fim: true,
  lactacao_total_app: true,
  lactacao_media_app: true,
  controles_na_lactacao: true,
  litros_nos_controles: true,
  servico_data: true,
  servico_metodo: true,
  servico_reprodutor: true,
  dg_data: true,
  dg_resultado: true,
  aborto_data: true,
  dg_dias_gestacao: true,
  dg_negativo_data: true,
} satisfies Record<keyof LinhaContextoControle, true>;

const SELECT_SESSAO = Object.keys(PROJECAO_SESSAO).join(',');
const SELECT_ANIMAL = Object.keys(PROJECAO_ANIMAL).join(',');
const SELECT_CONTEXTO = Object.keys(PROJECAO_CONTEXTO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todos os dias de controle de uma propriedade, do mais recente para o mais
 * antigo. É o que enche o seletor de data e a série histórica — some 40 linhas
 * numa fazenda que controla há três anos, então não vale paginar de outro jeito.
 */
export async function listarSessoes(propriedadeId: number): Promise<Resultado<LinhaSessaoControle[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_LEITE.sessoes;
  const res = await paginarView(view, SQL_LEITE, (de, ate) =>
    (supa.from(view).select(SELECT_SESSAO).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: dentro de uma propriedade, data_controle é única na view
      // (ela agrupa por (propriedade_id, data_controle)).
      .order('data_controle', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraSessao));
}

/**
 * Os animais de UM controle. `datas` é um array porque uma sessão pode ter mais
 * de um dia — o lançamento atrasado do dia seguinte (ver `costurarSessoes`).
 */
export async function listarAnimaisDoControle(
  propriedadeId: number,
  datas: string[],
): Promise<Resultado<LinhaControleAnimal[]>> {
  if (datas.length === 0) return ok([]);

  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_LEITE.animais;
  const res = await paginarView(view, SQL_LEITE, (de, ate) =>
    (
      supa
        .from(view)
        .select(SELECT_ANIMAL)
        .eq('propriedade_id', propriedadeId)
        .in('data_controle', datas) as unknown as Consulta
    )
      // Ordem TOTAL: litros empata muito (dezenas de cabras com 2,0 L), e
      // `range` sobre ordem com empate repete e pula linha entre páginas.
      .order('litros', { ascending: false })
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraAnimal));
}

/**
 * O contexto (setor, lactação, reprodução) dos animais de UM controle. Mesma
 * chave da lista de animais — (propriedade, datas) —, juntada em memória por
 * `juntarContexto`. Leitura separada de propósito: a view de animal alimenta
 * a de sessões, e os laterais de reprodução só cabem no recorte de um dia.
 */
export async function listarContextoDoControle(
  propriedadeId: number,
  datas: string[],
): Promise<Resultado<LinhaContextoControle[]>> {
  if (datas.length === 0) return ok([]);

  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_LEITE.contexto;
  const res = await paginarView(view, SQL_CONTEXTO, (de, ate) =>
    (
      supa
        .from(view)
        .select(SELECT_CONTEXTO)
        .eq('propriedade_id', propriedadeId)
        .in('data_controle', datas) as unknown as Consulta
    )
      .order('data_controle', { ascending: true })
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraContexto));
}

function paraContexto(l: Linha): LinhaContextoControle {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    data_controle: textoDe(l.data_controle) ?? '',
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    setor: textoDe(l.setor),
    lactacao_numero: numeroDe(l.lactacao_numero),
    lactacao_anterior_fim: textoDe(l.lactacao_anterior_fim),
    lactacao_total_app: numeroDe(l.lactacao_total_app),
    lactacao_media_app: numeroDe(l.lactacao_media_app),
    controles_na_lactacao: Math.round(numeroDe(l.controles_na_lactacao) ?? 0),
    litros_nos_controles: numeroDe(l.litros_nos_controles) ?? 0,
    servico_data: textoDe(l.servico_data),
    servico_metodo: textoDe(l.servico_metodo),
    servico_reprodutor: textoDe(l.servico_reprodutor),
    dg_data: textoDe(l.dg_data),
    dg_resultado: textoDe(l.dg_resultado),
    aborto_data: textoDe(l.aborto_data),
    dg_dias_gestacao: numeroDe(l.dg_dias_gestacao),
    dg_negativo_data: textoDe(l.dg_negativo_data),
  };
}

/** Uma propriedade sem nenhum controle nunca chega aqui como erro — é lista vazia. */
export async function contarControles(propriedadeId: number): Promise<Resultado<number>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_LEITE.sessoes;
  const { data, error } = (await supa
    .from(view)
    .select('data_controle')
    .eq('propriedade_id', propriedadeId)) as { data: unknown[] | null; error: { message: string; code?: string } | null };

  if (error) return falhaDeLeitura<number>(view, SQL_LEITE, error);
  return ok(comoLinhas(data ?? []).length);
}

function paraSessao(l: Linha): LinhaSessaoControle {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    data_controle: textoDe(l.data_controle) ?? '',
    animais: Math.round(numeroDe(l.animais) ?? 0),
    animais_com_leite: Math.round(numeroDe(l.animais_com_leite) ?? 0),
    litros_total: numeroDe(l.litros_total) ?? 0,
    media_com_leite: numeroDe(l.media_com_leite),
    del_medio: numeroDe(l.del_medio),
    animais_com_del: Math.round(numeroDe(l.animais_com_del) ?? 0),
  };
}

function paraAnimal(l: Linha): LinhaControleAnimal {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    data_controle: textoDe(l.data_controle) ?? '',
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    baia: textoDe(l.baia),
    litros: numeroDe(l.litros) ?? 0,
    ordenhas: Math.round(numeroDe(l.ordenhas) ?? 0),
    // null de propósito: DEL não medido não é DEL zero. Zero puxaria a média
    // para baixo e faria a fazenda parecer cheia de cabra recém-parida.
    del: numeroDe(l.del),
    del_lancado: numeroDe(l.del_lancado),
    del_origem: textoDe(l.del_origem),
    lactacao_inicio: textoDe(l.lactacao_inicio),
    lactacao_fim: textoDe(l.lactacao_fim),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sessão de controle — a costura dos dias consecutivos
// ─────────────────────────────────────────────────────────────────────────────

export interface SessaoControle {
  /** A data que dá nome à sessão: a que teve mais animais. É a chave do `?data=`. */
  chave: string;
  /** Todos os dias costurados nesta sessão, do mais antigo para o mais novo. */
  datas: string[];
  animais: number;
  animaisComLeite: number;
  litrosTotal: number;
  mediaComLeite: number | null;
  delMedio: number | null;
  animaisComDel: number;
}

const UM_DIA_MS = 86_400_000;

/** 'YYYY-MM-DD' → epoch em UTC. UTC de propósito: fuso local faria o dia virar
 *  no lugar errado e quebrar a costura em quem está a oeste de Greenwich. */
function diaEmUtc(iso: string): number {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return Date.UTC(ano, (mes ?? 1) - 1, dia ?? 1);
}

/**
 * Junta dias CONSECUTIVOS num controle só.
 *
 * POR QUE ISTO EXISTE: o controle leiteiro é um evento de curral — pesa-se o
 * rebanho inteiro num dia. Só que o lançamento de quem ficou para trás cai no
 * dia seguinte, e o banco não tem chave de sessão para amarrar os dois
 * (`grupo_controle_id` promete isso pelo nome e não cumpre: está em 37,9% das
 * linhas e, onde está, é um grupo POR ANIMAL). Sem a costura, o seletor de data
 * da tela mostra "10/03/2026 · 2 animais" logo abaixo de "09/03/2026 · 70
 * animais" — e o controle de 2 animais parece um controle fracassado quando é só
 * o rabicho do outro.
 *
 * A REGRA É ESTRITAMENTE "UM DIA DE DISTÂNCIA", e não uma janela maior: dois
 * controles legítimos separados por dois dias são dois controles, e juntá-los
 * inventaria uma média que não foi medida junto.
 */
export function costurarSessoes(linhas: LinhaSessaoControle[]): SessaoControle[] {
  const ordenadas = [...linhas]
    .filter((l) => l.data_controle !== '')
    .sort((a, b) => a.data_controle.localeCompare(b.data_controle));

  const grupos: LinhaSessaoControle[][] = [];
  for (const linha of ordenadas) {
    const atual = grupos[grupos.length - 1];
    const ultima = atual?.[atual.length - 1];
    const colada =
      ultima != null && diaEmUtc(linha.data_controle) - diaEmUtc(ultima.data_controle) === UM_DIA_MS;
    if (colada) atual.push(linha);
    else grupos.push([linha]);
  }

  return grupos.map(consolidarSessao).sort((a, b) => b.chave.localeCompare(a.chave));
}

function consolidarSessao(dias: LinhaSessaoControle[]): SessaoControle {
  const soma = (pegar: (l: LinhaSessaoControle) => number) => dias.reduce((acc, l) => acc + pegar(l), 0);

  const animaisComLeite = soma((l) => l.animais_com_leite);
  const litrosTotal = soma((l) => l.litros_total);
  const animaisComDel = soma((l) => l.animais_com_del);

  // DEL médio ponderado pelo DENOMINADOR de cada dia, não pela contagem de
  // animais: o dia que mediu DEL em 4 cabras não pode pesar como o que mediu em
  // 70. Média de médias sem peso seria o número de ninguém.
  const delPonderado = dias.reduce((acc, l) => acc + (l.del_medio ?? 0) * l.animais_com_del, 0);

  // A data que nomeia a sessão é a do dia com MAIS animais — o dia do curral,
  // não o do rabicho. Empate fica com o mais antigo (o `>` estrito abaixo).
  const principal = dias.reduce((melhor, l) => (l.animais > melhor.animais ? l : melhor), dias[0]);

  return {
    chave: principal.data_controle,
    datas: dias.map((l) => l.data_controle),
    animais: soma((l) => l.animais),
    animaisComLeite,
    litrosTotal,
    // Recalculada sobre os totais — numerador e denominador estão os dois aqui,
    // então isto é a média de verdade do conjunto, não média de médias.
    mediaComLeite: animaisComLeite > 0 ? litrosTotal / animaisComLeite : null,
    delMedio: animaisComDel > 0 ? delPonderado / animaisComDel : null,
    animaisComDel,
  };
}

/** A sessão pedida na URL, ou a mais recente. null quando não há controle nenhum. */
export function acharSessao(sessoes: SessaoControle[], chave: string | null): SessaoControle | null {
  if (sessoes.length === 0) return null;
  if (chave) {
    const pedida = sessoes.find((s) => s.chave === chave);
    if (pedida) return pedida;
  }
  // `costurarSessoes` já devolve da mais recente para a mais antiga.
  return sessoes[0];
}

/** Série "média por animal em cada controle" — a evolução que o gráfico desenha. */
export function serieDasSessoes(sessoes: SessaoControle[]): PontoSerie[] {
  return sessoes
    .filter((s) => s.mediaComLeite !== null)
    .map((s) => ({ periodo: s.chave, valor: s.mediaComLeite as number }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// ─────────────────────────────────────────────────────────────────────────────
// Derivações de UM controle — os cards, o histograma, os rankings, as baias
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoControle {
  animais: number;
  comLeite: number;
  semLeite: number;
  litrosTotal: number;
  /** Litros ÷ quem deu leite. É a média que o consultor cobra. */
  mediaComLeite: number | null;
  /** Litros ÷ todo mundo que passou no controle. Igual à de cima quando ninguém zerou. */
  mediaGeral: number | null;
  melhor: number | null;
  delMedio: number | null;
  animaisComDel: number;
  /** Dos com DEL, quantos vieram da lactação (a regra do app) e quantos do lançamento. */
  delCalculados: number;
  delLancados: number;
  /** DEL lançado no app que difere do calculado em mais de `DEL_DIVERGENCIA` dias
   *  — a tela usa o calculado e aponta. */
  delDivergentes: number;
  ordenhas: number;
  /** Quantos animais foram pesados nas DUAS ordenhas do dia. */
  duasOrdenhas: number;
}

/** Acima disso o DEL lançado e o calculado não são o mesmo número com
 *  arredondamento — são duas lactações diferentes. */
export const DEL_DIVERGENCIA = 7;

export function resumoDoControle(animais: LinhaControleAnimal[]): ResumoControle {
  const comLeite = animais.filter((a) => a.litros > 0);
  const litrosTotal = animais.reduce((acc, a) => acc + a.litros, 0);
  const comDel = animais.filter((a) => a.del !== null && a.del > 0);
  const somaDel = comDel.reduce((acc, a) => acc + (a.del ?? 0), 0);

  return {
    animais: animais.length,
    comLeite: comLeite.length,
    semLeite: animais.length - comLeite.length,
    litrosTotal,
    mediaComLeite: comLeite.length > 0 ? litrosTotal / comLeite.length : null,
    mediaGeral: animais.length > 0 ? litrosTotal / animais.length : null,
    melhor: animais.length > 0 ? Math.max(...animais.map((a) => a.litros)) : null,
    // null, e não 0: metade das linhas do banco não traz DEL, e "DEL médio 0"
    // seria uma afirmação sobre o rebanho em vez de sobre o preenchimento.
    delMedio: comDel.length > 0 ? somaDel / comDel.length : null,
    animaisComDel: comDel.length,
    delCalculados: comDel.filter((a) => a.del_origem === 'calculado').length,
    delLancados: comDel.filter((a) => a.del_origem === 'lancado').length,
    delDivergentes: comDel.filter(
      (a) =>
        a.del_origem === 'calculado' &&
        a.del_lancado !== null &&
        Math.abs((a.del ?? 0) - a.del_lancado) > DEL_DIVERGENCIA,
    ).length,
    ordenhas: animais.reduce((acc, a) => acc + a.ordenhas, 0),
    duasOrdenhas: animais.filter((a) => a.ordenhas >= 2).length,
  };
}

/**
 * As dez faixas do histograma, na ordem da escala (as mesmas do painel que o
 * Felipe já usa). `ate: null` na última é o "acima de 5 L".
 */
export const FAIXAS_PRODUCAO: { rotulo: string; de: number; ate: number | null }[] = [
  { rotulo: '0 – 1,0 L', de: 0, ate: 1.0 },
  { rotulo: '1,01 – 1,5 L', de: 1.0, ate: 1.5 },
  { rotulo: '1,51 – 2,0 L', de: 1.5, ate: 2.0 },
  { rotulo: '2,01 – 2,5 L', de: 2.0, ate: 2.5 },
  { rotulo: '2,51 – 3,0 L', de: 2.5, ate: 3.0 },
  { rotulo: '3,01 – 3,5 L', de: 3.0, ate: 3.5 },
  { rotulo: '3,51 – 4,0 L', de: 3.5, ate: 4.0 },
  { rotulo: '4,01 – 4,5 L', de: 4.0, ate: 4.5 },
  { rotulo: '4,51 – 5,0 L', de: 4.5, ate: 5.0 },
  { rotulo: 'acima de 5,0 L', de: 5.0, ate: null },
];

export interface FaixaProducao {
  rotulo: string;
  animais: number;
  /** Fração do rebanho controlado. null quando não houve controle. */
  fracao: number | null;
}

/**
 * Histograma na ORDEM DA ESCALA, sempre com as dez faixas.
 *
 * A faixa vazia continua na lista — pelo mesmo motivo que a escala FAMACHA
 * mantém o grau 5 sem medição: um histograma que esconde a faixa vazia mente
 * sobre a distribuição, porque o leitor não sabe se ninguém caiu ali ou se a
 * barra não coube. E por isso a tela desenha estas barras à mão em vez de usar
 * <DistribuicaoBarras>, que ordena por volume (é ranking, não escala).
 */
export function histogramaProducao(animais: LinhaControleAnimal[]): FaixaProducao[] {
  const total = animais.length;
  return FAIXAS_PRODUCAO.map((faixa) => {
    const dentro = animais.filter((a) =>
      faixa.ate === null ? a.litros > faixa.de : a.litros > faixa.de && a.litros <= faixa.ate,
    );
    // A primeira faixa é a única fechada embaixo: sem isto o animal com 0,0 L
    // não cairia em faixa nenhuma e sumiria do histograma.
    const zerados = faixa.de === 0 ? animais.filter((a) => a.litros === 0).length : 0;
    const quantidade = dentro.length + zerados;
    return {
      rotulo: faixa.rotulo,
      animais: quantidade,
      fracao: total > 0 ? quantidade / total : null,
    };
  });
}

/** Quantos animais o ranking mostra de cada lado. */
export const RANKING_LIMITE = 15;

/** Ordem TOTAL: litros e, no empate, o número do animal — para a lista não
 *  dançar entre dois carregamentos do mesmo controle. */
function porLitros(a: LinhaControleAnimal, b: LinhaControleAnimal, desc: boolean): number {
  const diferenca = desc ? b.litros - a.litros : a.litros - b.litros;
  return diferenca !== 0 ? diferenca : a.numero_animal.localeCompare(b.numero_animal, 'pt-BR');
}

export function melhoresDoControle(
  animais: LinhaControleAnimal[],
  limite: number = RANKING_LIMITE,
): LinhaControleAnimal[] {
  return [...animais].sort((a, b) => porLitros(a, b, true)).slice(0, limite);
}

/**
 * Os piores. `incluirZerados` é falso por padrão de propósito: o animal com
 * 0,0 L quase sempre é uma cabra SECA que alguém lançou mesmo assim — ela
 * encabeçaria a lista todo mês sendo o único animal ali que não tem problema
 * nenhum, e empurraria para fora a vaca que está produzindo mal de verdade.
 */
export function pioresDoControle(
  animais: LinhaControleAnimal[],
  limite: number = RANKING_LIMITE,
  incluirZerados = false,
): LinhaControleAnimal[] {
  const base = incluirZerados ? animais : animais.filter((a) => a.litros > 0);
  return [...base].sort((a, b) => porLitros(a, b, false)).slice(0, limite);
}

export interface BaiaControle {
  /** O rótulo do local — nome da baia em `producaoPorBaia`, do setor em `producaoPorSetor`. */
  baia: string;
  animais: number;
  litrosTotal: number;
  mediaPorCabeca: number | null;
  delMedio: number | null;
}

export const SEM_BAIA = 'Sem baia';
export const SEM_SETOR = 'Sem setor';

/**
 * O controle repartido por baia — o recorte que transforma "a média caiu" em
 * "a média caiu NA G1-7", que é onde o consultor vai olhar o cocho.
 */
export function producaoPorBaia(animais: LinhaControleAnimal[]): BaiaControle[] {
  return agruparPorLocal(animais, (a) => a.baia, SEM_BAIA);
}

/**
 * O mesmo recorte um nível acima — o SETOR (G1, G2, G3, maternidade), que só a
 * propriedade 244 usa hoje. A tela mostra quando algum animal tem setor.
 */
export function producaoPorSetor(animais: AnimalDoControle[]): BaiaControle[] {
  return agruparPorLocal(animais, (a) => a.contexto?.setor ?? null, SEM_SETOR);
}

function agruparPorLocal<T extends LinhaControleAnimal>(
  animais: T[],
  local: (a: T) => string | null,
  semLocal: string,
): BaiaControle[] {
  const grupos = new Map<string, T[]>();
  for (const animal of animais) {
    const chave = local(animal)?.trim() || semLocal;
    const lista = grupos.get(chave);
    if (lista) lista.push(animal);
    else grupos.set(chave, [animal]);
  }

  return [...grupos.entries()]
    .map(([baia, doGrupo]) => {
      const litrosTotal = doGrupo.reduce((acc, a) => acc + a.litros, 0);
      const comDel = doGrupo.filter((a) => a.del !== null && a.del > 0);
      return {
        baia,
        animais: doGrupo.length,
        litrosTotal,
        mediaPorCabeca: doGrupo.length > 0 ? litrosTotal / doGrupo.length : null,
        delMedio:
          comDel.length > 0 ? comDel.reduce((acc, a) => acc + (a.del ?? 0), 0) / comDel.length : null,
      };
    })
    .sort((a, b) => {
      // "Sem baia"/"Sem setor" por último: é falha de cadastro, não um lugar do
      // curral — mesmo critério da lista de DG pendente em areas/reproducao.ts.
      if (a.baia === semLocal) return b.baia === semLocal ? 0 : 1;
      if (b.baia === semLocal) return -1;
      return (b.mediaPorCabeca ?? 0) - (a.mediaPorCabeca ?? 0);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexto — o animal com o seu dia: setor, lactação e reprodução
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimalDoControle extends LinhaControleAnimal {
  /** null quando a view de contexto não trouxe a linha — a tela mostra "—". */
  contexto: LinhaContextoControle | null;
}

/** Junta as duas leituras por (data, animal). Não perde animal: quem não tem
 *  contexto continua na lista, com `contexto: null`. */
export function juntarContexto(
  animais: LinhaControleAnimal[],
  contextos: LinhaContextoControle[],
): AnimalDoControle[] {
  const porChave = new Map(contextos.map((c) => [`${c.data_controle}|${c.animal_id}`, c]));
  return animais.map((a) => ({
    ...a,
    contexto: porChave.get(`${a.data_controle}|${a.animal_id}`) ?? null,
  }));
}

// A regra do estado reprodutivo é compartilhada com o balanço reprodutivo e
// mora em situacao-reprodutiva.ts; os nomes ficam re-exportados aqui para a
// tela e os testes do controle não precisarem saber disso.
export {
  COBERTURA_VALIDA_ATE,
  DG_ATRASADO_APOS,
  GESTACAO_DIAS,
  PRONTA_PARA_COBRIR_APOS,
  SECAR_AOS_DIAS_DE_GESTACAO,
  situacaoReprodutiva,
  type EstadoReprodutivo,
  type SituacaoReprodutiva,
} from '@/lib/adm/areas/situacao-reprodutiva';

export interface ResumoReprodutivo {
  animais: number;
  gestantes: number;
  /** Gestantes que deviam estar secas — ainda no controle com 90+ dias de gestação. */
  aSecar: number;
  cobertas: number;
  dgAtrasado: number;
  /** DG negativo ou aborto — precisam voltar ao bode. */
  vazias: number;
  naoCobertas: number;
  /** Não cobertas com mais de 60 dias de lactação. */
  prontasParaCobrir: number;
  semInformacao: number;
  /** Alguma cobertura ou DG lançados para estas fêmeas desde o parto. Sem isso
   *  a seção inteira é "não coberta" — que é falta de lançamento, não de bode. */
  comAlgumEvento: boolean;
}

export function resumoReprodutivo(animais: AnimalDoControle[]): ResumoReprodutivo {
  const situacoes = animais.map((a) => ({ a, s: situacaoReprodutiva(a.contexto, a.data_controle) }));
  const conta = (estado: EstadoReprodutivo) => situacoes.filter(({ s }) => s.estado === estado).length;

  return {
    animais: animais.length,
    gestantes: conta('gestante'),
    aSecar: situacoes.filter(({ s }) => s.aSecar).length,
    cobertas: conta('coberta'),
    dgAtrasado: situacoes.filter(({ s }) => s.dgAtrasado).length,
    vazias: conta('vazia') + conta('abortou'),
    naoCobertas: conta('nao_coberta'),
    prontasParaCobrir: situacoes.filter(
      ({ a, s }) => s.estado === 'nao_coberta' && a.del !== null && a.del >= PRONTA_PARA_COBRIR_APOS,
    ).length,
    semInformacao: conta('sem_informacao'),
    comAlgumEvento: animais.some(
      (a) => a.contexto?.servico_data || a.contexto?.dg_data || a.contexto?.aborto_data,
    ),
  };
}
