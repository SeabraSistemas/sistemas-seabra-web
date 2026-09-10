import 'server-only';

import { VIEWS_OBITO, type LinhaObito } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * ÓBITOS — a leitura de `adm.obito_detalhe` e as regras da tela de mortalidade.
 *
 * O QUE ESTA TELA ACRESCENTA À ABA SANIDADE: lá o óbito é uma contagem de 12
 * meses e uma taxa. Aqui ele tem idade, sexo, categoria e suspeita — e é a
 * IDADE que decide a conversa. Um rebanho que perde neonato tem problema de
 * colostro, de higiene de baia ou de assistência ao parto; um que perde adulto
 * tem outro problema inteiro. Os dois casos entram no mesmo `obitos_12m` da aba
 * Sanidade e saem de lá indistinguíveis.
 *
 * TODA DERIVAÇÃO AQUI É FUNÇÃO PURA e recebe `hoje` por parâmetro quando precisa
 * de data — nada de `new Date()` no meio do cálculo, senão o teste do filtro de
 * período viraria um teste que muda de resultado no dia seguinte.
 */

const SQL_OBITOS = 'supabase/adm/adm_13_obitos.sql';

const PROJECAO = {
  propriedade_id: true,
  obito_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  categoria: true,
  baia: true,
  data_obito: true,
  data_de_nascimento: true,
  idade_dias: true,
  suspeitas: true,
  diagnostico_obito: true,
  sinais_clinicos: true,
  observacao: true,
} satisfies Record<keyof LinhaObito, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Todos os óbitos da propriedade, do mais recente para o mais antigo.
 *
 * Lê tudo e filtra o período em memória de propósito: o maior criador da base
 * tem 202 óbitos em cinco anos. Filtrar no banco por período obrigaria uma
 * segunda consulta a cada troca de filtro para nada — e o histórico inteiro é o
 * que a série mensal precisa mesmo quando os cards olham só 12 meses.
 */
export async function listarObitos(propriedadeId: number): Promise<Resultado<LinhaObito[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_OBITO.detalhe;
  const res = await paginarView(view, SQL_OBITOS, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: data empata (duas crias da mesma ninhada morrem no mesmo
      // dia), e `range` sobre ordem com empate repete e pula linha entre páginas.
      .order('data_obito', { ascending: false })
      .order('obito_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraObito));
}

function paraObito(l: Linha): LinhaObito {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    obito_id: Math.round(numeroDe(l.obito_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    categoria: textoDe(l.categoria),
    baia: textoDe(l.baia),
    data_obito: textoDe(l.data_obito) ?? '',
    data_de_nascimento: textoDe(l.data_de_nascimento),
    idade_dias: numeroDe(l.idade_dias),
    suspeitas: Array.isArray(l.suspeitas)
      ? l.suspeitas.map((s) => textoDe(s)).filter((s): s is string => s !== null)
      : [],
    diagnostico_obito: textoDe(l.diagnostico_obito),
    sinais_clinicos: textoDe(l.sinais_clinicos),
    observacao: textoDe(l.observacao),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

export const PERIODOS = ['90d', '12m', 'ano', 'tudo'] as const;
export type Periodo = (typeof PERIODOS)[number];

/** 12 meses é o padrão porque é a janela da aba Sanidade — as duas telas falam
 *  do mesmo recorte a não ser que alguém peça outro, de propósito. */
export const PERIODO_PADRAO: Periodo = '12m';

export const ROTULO_PERIODO: Record<Periodo, string> = {
  '90d': '90 dias',
  '12m': '12 meses',
  ano: 'ano corrente',
  tudo: 'todo o histórico',
};

/** `?periodo=` é texto de fora: só vira recorte depois de passar por esta lista. */
export function lerPeriodo(bruto: string | string[] | undefined): Periodo {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : PERIODO_PADRAO;
}

function iso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/**
 * O corte do período, como string 'YYYY-MM-DD' — comparação de texto, não de
 * Date. As datas chegam do Postgres como 'YYYY-MM-DD' e nessa forma a ordem
 * lexicográfica É a ordem cronológica; converter para Date só abriria a porta
 * para o fuso mover o dia.
 */
export function inicioDoPeriodo(periodo: Periodo, hoje: Date): string | null {
  if (periodo === 'tudo') return null;
  if (periodo === 'ano') return `${hoje.getUTCFullYear()}-01-01`;

  const dias = periodo === '90d' ? 90 : 365;
  const corte = new Date(hoje.getTime() - dias * 86_400_000);
  return iso(corte);
}

export function filtrarPorPeriodo(obitos: LinhaObito[], periodo: Periodo, hoje: Date): LinhaObito[] {
  const inicio = inicioDoPeriodo(periodo, hoje);
  if (inicio === null) return obitos;
  return obitos.filter((o) => o.data_obito >= inicio);
}

// ─────────────────────────────────────────────────────────────────────────────
// Faixa etária — a derivação que dá sentido ao número
// ─────────────────────────────────────────────────────────────────────────────

export type ChaveFaixa = 'neonatal' | 'desmame' | 'recria' | 'adulto' | 'sem_data' | 'inconsistente';

export interface FaixaEtaria {
  chave: ChaveFaixa;
  rotulo: string;
  detalhe: string;
  obitos: number;
  /** Fração do total do período. null quando não houve óbito. */
  fracao: number | null;
}

/**
 * As faixas, na ORDEM DA VIDA — e as duas últimas não são idade nenhuma.
 *
 * `sem_data` (9% da base) e `inconsistente` (nascimento lançado DEPOIS da morte,
 * 10 casos hoje) existem como faixa visível porque a alternativa é pior: jogar
 * esses óbitos fora faria as faixas não fecharem com o total do card, e enfiá-los
 * em "adulto" inventaria uma mortalidade de adulto que ninguém mediu. Como faixa
 * própria, viram o que realmente são — um recado sobre o cadastro.
 */
const FAIXAS: { chave: ChaveFaixa; rotulo: string; detalhe: string; de: number; ate: number | null }[] = [
  { chave: 'neonatal', rotulo: 'Neonatal', detalhe: '0 a 30 dias', de: 0, ate: 30 },
  { chave: 'desmame', rotulo: 'Até o desmame', detalhe: '31 a 180 dias', de: 31, ate: 180 },
  { chave: 'recria', rotulo: 'Recria', detalhe: '181 a 365 dias', de: 181, ate: 365 },
  { chave: 'adulto', rotulo: 'Adulto', detalhe: 'mais de 365 dias', de: 366, ate: null },
];

export function faixasEtarias(obitos: LinhaObito[]): FaixaEtaria[] {
  const total = obitos.length;
  const fracao = (n: number) => (total > 0 ? n / total : null);

  const porIdade = FAIXAS.map((faixa) => {
    const dentro = obitos.filter((o) => {
      const idade = o.idade_dias;
      if (idade === null || idade < 0) return false;
      return faixa.ate === null ? idade >= faixa.de : idade >= faixa.de && idade <= faixa.ate;
    });
    return {
      chave: faixa.chave,
      rotulo: faixa.rotulo,
      detalhe: faixa.detalhe,
      obitos: dentro.length,
      fracao: fracao(dentro.length),
    };
  });

  const semData = obitos.filter((o) => o.idade_dias === null).length;
  const inconsistente = obitos.filter((o) => o.idade_dias !== null && o.idade_dias < 0).length;

  return [
    ...porIdade,
    {
      chave: 'sem_data' as const,
      rotulo: 'Sem data de nascimento',
      detalhe: 'idade não calculável',
      obitos: semData,
      fracao: fracao(semData),
    },
    {
      chave: 'inconsistente' as const,
      rotulo: 'Data inconsistente',
      detalhe: 'nascimento lançado depois do óbito',
      obitos: inconsistente,
      fracao: fracao(inconsistente),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Causas
// ─────────────────────────────────────────────────────────────────────────────

export interface CausaObito {
  suspeita: string;
  obitos: number;
  /** Fração sobre os óbitos COM suspeita anotada — nunca sobre o total. */
  fracao: number;
}

/**
 * Ranking de suspeitas.
 *
 * O DENOMINADOR É "ÓBITOS COM SUSPEITA ANOTADA", e não o total do período. Só
 * 39% dos óbitos da base têm a coluna preenchida: dividir pelo total faria
 * "Clostridiose 24%" parecer uma afirmação sobre o rebanho quando é uma
 * afirmação sobre o pedaço que alguém anotou. A tela imprime esse denominador
 * ao lado do gráfico — sem ele o ranking é bonito e não quer dizer nada.
 *
 * Um óbito pode ter MAIS DE UMA suspeita (a coluna é text[]), então a soma das
 * barras pode passar do número de óbitos. É por isso que a fração sai daqui, e
 * não de um "valor ÷ soma das fatias" no componente de gráfico.
 */
export function rankingCausas(obitos: LinhaObito[]): CausaObito[] {
  const comSuspeita = obitos.filter((o) => o.suspeitas.length > 0);
  if (comSuspeita.length === 0) return [];

  const contagem = new Map<string, number>();
  for (const obito of comSuspeita) {
    // Set: a mesma suspeita repetida no array de UM óbito não conta duas vezes.
    for (const suspeita of new Set(obito.suspeitas.map((s) => s.trim()).filter(Boolean))) {
      contagem.set(suspeita, (contagem.get(suspeita) ?? 0) + 1);
    }
  }

  return [...contagem.entries()]
    .map(([suspeita, quantidade]) => ({
      suspeita,
      obitos: quantidade,
      fracao: quantidade / comSuspeita.length,
    }))
    .sort((a, b) => b.obitos - a.obitos || a.suspeita.localeCompare(b.suspeita, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e série
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoObitos {
  total: number;
  femeas: number;
  machos: number;
  semSexo: number;
  /** Quantos têm ao menos uma suspeita anotada — o denominador do ranking. */
  comSuspeita: number;
  /** Média de idade ao morrer, em dias. Ignora sem-data e idade negativa. */
  idadeMediaDias: number | null;
  /** Denominador da idade média: quantos óbitos tinham idade utilizável. */
  comIdade: number;
  neonatais: number;
}

export function resumoObitos(obitos: LinhaObito[]): ResumoObitos {
  const comIdade = obitos.filter((o) => o.idade_dias !== null && o.idade_dias >= 0);
  const somaIdade = comIdade.reduce((acc, o) => acc + (o.idade_dias ?? 0), 0);

  // 'fêmea' COM ACENTO — o valor real da coluna. Comparar minúsculo e sem
  // depender de acento faria a conta ignorar metade do rebanho em silêncio.
  const ehFemea = (o: LinhaObito) => (o.sexo ?? '').toLowerCase().startsWith('f');
  const ehMacho = (o: LinhaObito) => (o.sexo ?? '').toLowerCase().startsWith('m');

  return {
    total: obitos.length,
    femeas: obitos.filter(ehFemea).length,
    machos: obitos.filter(ehMacho).length,
    semSexo: obitos.filter((o) => !ehFemea(o) && !ehMacho(o)).length,
    comSuspeita: obitos.filter((o) => o.suspeitas.length > 0).length,
    idadeMediaDias: comIdade.length > 0 ? somaIdade / comIdade.length : null,
    comIdade: comIdade.length,
    neonatais: comIdade.filter((o) => (o.idade_dias ?? 0) <= 30).length,
  };
}

/**
 * Óbitos por mês, 'YYYY-MM'.
 *
 * O mês SEM óbito fica ausente daqui — quem preenche o eixo é a tela, que sabe
 * a janela. Diferente da série de litros, aqui o buraco DEVE virar zero no
 * gráfico: um mês sem morte é um mês de zero morte, e é uma boa notícia que o
 * gráfico precisa mostrar.
 */
export function serieMensalObitos(obitos: LinhaObito[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const obito of obitos) {
    if (obito.data_obito === '') continue;
    const mes = obito.data_obito.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
