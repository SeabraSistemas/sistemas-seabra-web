import 'server-only';

import { VIEWS_PRODUCAO, type LinhaProducaoDia } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * PRODUÇÃO DIÁRIA — a leitura de `adm.producao_dia` e as regras da tela do dia a
 * dia do tanque.
 *
 * O QUE ESTA TELA ACRESCENTA À ABA PRODUÇÃO: lá são cards de 30/90 dias e uma
 * série. Aqui:
 *
 *   · QUAIS dias faltam (a aba diz "62 de 90 dias com lançamento" e não diz
 *     quais — e é a lista que vira a cobrança ao cliente);
 *   · a divisão entre 1ª e 2ª ordenha, que separa "a fazenda produziu menos" de
 *     "a fazenda largou a segunda ordenha" — mesma queda no gráfico, dois
 *     problemas diferentes;
 *   · litros POR LACTANTE ao longo do tempo, que é a métrica que sobe quando o
 *     rebanho melhora e que o volume total esconde quando o plantel encolhe.
 *
 * Toda derivação é função pura e recebe `hoje` por parâmetro quando precisa de
 * data — sem `new Date()` no meio do cálculo, senão o teste do filtro de período
 * mudaria de resultado amanhã.
 */

const SQL_PRODUCAO = 'supabase/adm/adm_14_producao.sql';

const PROJECAO = {
  propriedade_id: true,
  data: true,
  litros: true,
  litros_1_ordenha: true,
  litros_2_ordenha: true,
  lactantes: true,
  litros_por_lactante: true,
  modo: true,
  observacao: true,
} satisfies Record<keyof LinhaProducaoDia, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

export const PERIODOS = ['30d', '90d', '12m', 'tudo'] as const;
export type Periodo = (typeof PERIODOS)[number];

/** 90 dias é o padrão porque é a janela da série da aba Produção — as duas telas
 *  falam do mesmo recorte a não ser que alguém peça outro. */
export const PERIODO_PADRAO: Periodo = '90d';

export const ROTULO_PERIODO: Record<Periodo, string> = {
  '30d': '30 dias',
  '90d': '90 dias',
  '12m': '12 meses',
  tudo: 'todo o histórico',
};

export const DIAS_DO_PERIODO: Record<Exclude<Periodo, 'tudo'>, number> = {
  '30d': 30,
  '90d': 90,
  '12m': 365,
};

export function lerPeriodo(bruto: string | string[] | undefined): Periodo {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : PERIODO_PADRAO;
}

const UM_DIA_MS = 86_400_000;

function iso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/**
 * O primeiro dia do período, como 'YYYY-MM-DD'. Comparação de texto, não de
 * Date: as datas chegam do Postgres nesse formato, e nele a ordem lexicográfica
 * É a cronológica — converter para Date só abriria a porta para o fuso mover o
 * dia.
 */
export function inicioDoPeriodo(periodo: Periodo, hoje: Date): string | null {
  if (periodo === 'tudo') return null;
  // -1 porque a janela INCLUI hoje: 30 dias são hoje e os 29 anteriores.
  return iso(new Date(hoje.getTime() - (DIAS_DO_PERIODO[periodo] - 1) * UM_DIA_MS));
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os dias lançados da propriedade, do mais recente para o mais antigo.
 *
 * `desde` filtra NO BANCO (não em memória): a maior propriedade tem 1.593 dias
 * lançados, e o recorte de 30 dias não precisa trazer cinco anos para descartar
 * no cliente.
 */
export async function listarProducaoDiaria(
  propriedadeId: number,
  desde: string | null,
): Promise<Resultado<LinhaProducaoDia[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_PRODUCAO.dia;
  const res = await paginarView(view, SQL_PRODUCAO, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = desde === null ? base : base.gte('data', desde);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: `data` é única por propriedade nesta view (uma linha por
      // (propriedade, dia), auditado), então não precisa de desempate.
      .order('data', { ascending: false })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraDia));
}

function paraDia(l: Linha): LinhaProducaoDia {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    data: textoDe(l.data) ?? '',
    litros: numeroDe(l.litros) ?? 0,
    litros_1_ordenha: numeroDe(l.litros_1_ordenha),
    litros_2_ordenha: numeroDe(l.litros_2_ordenha),
    lactantes: Math.round(numeroDe(l.lactantes) ?? 0),
    litros_por_lactante: numeroDe(l.litros_por_lactante),
    modo: textoDe(l.modo),
    observacao: textoDe(l.observacao),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Datas no futuro — o lixo que estragaria toda média
// ─────────────────────────────────────────────────────────────────────────────

export interface Separacao {
  validos: LinhaProducaoDia[];
  futuros: LinhaProducaoDia[];
}

/**
 * Separa o que tem data no futuro.
 *
 * NÃO É PARANOIA: 1.500 linhas de UMA propriedade estão datadas entre 2035 e
 * 2039 — 28% de toda a tabela. Produção de 2039 não é produção; deixá-la entrar
 * faria a média por dia, o melhor dia e a série inteira responderem por um dado
 * que não existe. Some do cálculo e VIRA AVISO na tela: o operador é quem pode
 * mandar o cliente corrigir, e para isso precisa saber.
 */
export function separarFuturos(dias: LinhaProducaoDia[], hoje: Date): Separacao {
  const limite = iso(hoje);
  return {
    validos: dias.filter((d) => d.data !== '' && d.data <= limite),
    futuros: dias.filter((d) => d.data > limite),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dias sem lançamento — a lista que vira cobrança
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Os dias do intervalo que não têm lançamento.
 *
 * A JANELA COMEÇA NO PRIMEIRO LANÇAMENTO, e não no início do período: uma
 * fazenda que começou a lançar há 10 dias não tem 80 dias "em falta" nos 90 —
 * ela tem 10 dias de histórico. Contar o que veio antes do cadastro
 * transformaria cliente novo em cliente relapso.
 *
 * NÃO HÁ EXCEÇÃO DE FIM DE SEMANA, e isso foi verificado antes de decidir: nas
 * três maiores propriedades os lançamentos se distribuem igualmente pelos sete
 * dias (227/227/229/228/228/227/227 numa delas). Cabra é ordenhada no domingo;
 * um domingo sem lançamento é um domingo sem lançamento.
 */
export function diasSemLancamento(dias: LinhaProducaoDia[], inicio: string, fim: string): string[] {
  if (dias.length === 0) return [];

  const lancados = new Set(dias.map((d) => d.data));
  const primeiro = dias.reduce((menor, d) => (d.data < menor ? d.data : menor), dias[0].data);
  const comeco = primeiro > inicio ? primeiro : inicio;

  const faltantes: string[] = [];
  for (let t = Date.parse(`${comeco}T00:00:00Z`); t <= Date.parse(`${fim}T00:00:00Z`); t += UM_DIA_MS) {
    const dia = iso(new Date(t));
    if (!lancados.has(dia)) faltantes.push(dia);
  }
  return faltantes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoProducao {
  diasLancados: number;
  litrosTotal: number;
  /** Total ÷ dias LANÇADOS, nunca ÷ dias do período: dia sem lançamento não é
   *  dia de zero litro, é dia não medido. */
  mediaPorDiaLancado: number | null;
  melhorDia: LinhaProducaoDia | null;
  piorDia: LinhaProducaoDia | null;
  /** Média dos litros por lactante dos dias que têm lactante lançado. */
  mediaPorLactante: number | null;
  lactantesMedio: number | null;
  litros1Ordenha: number;
  litros2Ordenha: number;
  /** Fração do total que veio da 2ª ordenha. null quando ninguém lançou a 2ª. */
  fracaoSegundaOrdenha: number | null;
  /** Dias lançados só com a 1ª ordenha — o sinal de "largou a segunda". */
  diasSoPrimeira: number;
}

export function resumoProducao(dias: LinhaProducaoDia[]): ResumoProducao {
  if (dias.length === 0) {
    return {
      diasLancados: 0,
      litrosTotal: 0,
      mediaPorDiaLancado: null,
      melhorDia: null,
      piorDia: null,
      mediaPorLactante: null,
      lactantesMedio: null,
      litros1Ordenha: 0,
      litros2Ordenha: 0,
      fracaoSegundaOrdenha: null,
      diasSoPrimeira: 0,
    };
  }

  const litrosTotal = dias.reduce((acc, d) => acc + d.litros, 0);
  const comLactante = dias.filter((d) => d.litros_por_lactante !== null);
  const litros1 = dias.reduce((acc, d) => acc + (d.litros_1_ordenha ?? 0), 0);
  const litros2 = dias.reduce((acc, d) => acc + (d.litros_2_ordenha ?? 0), 0);

  return {
    diasLancados: dias.length,
    litrosTotal,
    mediaPorDiaLancado: litrosTotal / dias.length,
    melhorDia: dias.reduce((melhor, d) => (d.litros > melhor.litros ? d : melhor), dias[0]),
    piorDia: dias.reduce((pior, d) => (d.litros < pior.litros ? d : pior), dias[0]),
    mediaPorLactante:
      comLactante.length > 0
        ? comLactante.reduce((acc, d) => acc + (d.litros_por_lactante ?? 0), 0) / comLactante.length
        : null,
    lactantesMedio:
      comLactante.length > 0
        ? comLactante.reduce((acc, d) => acc + d.lactantes, 0) / comLactante.length
        : null,
    litros1Ordenha: litros1,
    litros2Ordenha: litros2,
    fracaoSegundaOrdenha: litrosTotal > 0 && litros2 > 0 ? litros2 / litrosTotal : null,
    // `modo` é a intenção declarada no app; a conta olha o DADO — dia com a 2ª
    // ordenha vazia é dia de uma ordenha só, tenha sido lançado como for.
    diasSoPrimeira: dias.filter((d) => (d.litros_2_ordenha ?? 0) === 0).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Séries e agregação mensal
// ─────────────────────────────────────────────────────────────────────────────

/** Litros por dia. O buraco continua buraco — quem decide desenhar é a tela, e
 *  nesta série ele DEVE ficar aberto: dia sem lançar não é dia de zero litro. */
export function serieLitros(dias: LinhaProducaoDia[]): PontoSerie[] {
  return [...dias]
    .filter((d) => d.data !== '')
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((d) => ({ periodo: d.data, valor: d.litros }));
}

export function serieLitrosPorLactante(dias: LinhaProducaoDia[]): PontoSerie[] {
  return [...dias]
    .filter((d) => d.data !== '' && d.litros_por_lactante !== null)
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((d) => ({ periodo: d.data, valor: d.litros_por_lactante as number }));
}

export interface MesProducao {
  /** 'YYYY-MM' */
  mes: string;
  diasLancados: number;
  litrosTotal: number;
  mediaPorDiaLancado: number;
  mediaPorLactante: number | null;
}

/**
 * O mês a mês.
 *
 * `mediaPorDiaLancado` divide pelos dias LANÇADOS do mês, não pelos dias do
 * calendário: um mês com 10 lançamentos e 300 L/dia é uma fazenda de 300 L/dia
 * mal lançada, não uma de 100 L/dia. A contagem de dias lançados vai ao lado
 * justamente para o leitor saber o peso da média.
 */
export function resumoMensal(dias: LinhaProducaoDia[]): MesProducao[] {
  const porMes = new Map<string, LinhaProducaoDia[]>();
  for (const dia of dias) {
    if (dia.data === '') continue;
    const mes = dia.data.slice(0, 7);
    const lista = porMes.get(mes);
    if (lista) lista.push(dia);
    else porMes.set(mes, [dia]);
  }

  return [...porMes.entries()]
    .map(([mes, doMes]) => {
      const litrosTotal = doMes.reduce((acc, d) => acc + d.litros, 0);
      const comLactante = doMes.filter((d) => d.litros_por_lactante !== null);
      return {
        mes,
        diasLancados: doMes.length,
        litrosTotal,
        mediaPorDiaLancado: litrosTotal / doMes.length,
        mediaPorLactante:
          comLactante.length > 0
            ? comLactante.reduce((acc, d) => acc + (d.litros_por_lactante ?? 0), 0) / comLactante.length
            : null,
      };
    })
    .sort((a, b) => b.mes.localeCompare(a.mes));
}
