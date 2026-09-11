import 'server-only';

import {
  VIEWS_SAIDA_LEITE,
  type LinhaProducaoDia,
  type LinhaSaidaLeite,
} from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type Resultado } from '@/lib/adm/types';

/**
 * SAÍDA DE LEITE — a leitura de `adm.saida_leite_detalhe` e o balanço contra a
 * produção lançada.
 *
 * A pergunta: do leite que a fazenda diz ter produzido, quanto saiu, e para
 * onde. O destino separa o leite que virou dinheiro (laticínio, venda) do que
 * foi para o cabrito ou para o descarte — e essa fração é custo que nenhuma
 * outra tela mostra.
 *
 * ⚠️ O BALANÇO É POR MÊS, NUNCA POR DIA. O laticínio coleta o tanque de dois
 * dias: na fazenda com mais registros, o que saiu nos dias de coleta soma o
 * dobro do que foi produzido nesses mesmos dias. Por mês, as contas se encontram.
 *
 * ⚠️ E SÓ ENTRAM OS MESES COM ALGUMA SAÍDA LANÇADA. Mês sem saída é módulo sem
 * uso, não leite parado no tanque: dividir a produção de doze meses pelas saídas
 * de dois diria "saiu 15% do leite", que é mentira sobre o leite e verdade só
 * sobre o lançamento.
 *
 * Toda derivação é função pura; `hoje` vem por parâmetro.
 */

const SQL_SAIDA = 'supabase/adm/adm_27_saida_leite.sql';

const PROJECAO = {
  propriedade_id: true,
  saida_id: true,
  data: true,
  litros: true,
  destino: true,
  observacao: true,
} satisfies Record<keyof LinhaSaidaLeite, true>;

const SELECT = Object.keys(PROJECAO).join(',');

/**
 * Acima disso (saiu > 105% do produzido no mês) a conta não fecha. A folga de 5%
 * cobre o leite de um dia que entrou no fim do mês e saiu na coleta do dia 1.
 */
export const FOLGA_BALANCO = 1.05;

export const SEM_DESTINO = 'Destino não informado';

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarSaidasLeite(
  propriedadeId: number,
  desde: string | null,
): Promise<Resultado<LinhaSaidaLeite[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_SAIDA_LEITE.detalhe;
  const res = await paginarView(view, SQL_SAIDA, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = desde === null ? base : base.gte('data', desde);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: `saida_id` desempata as saídas do mesmo dia.
      .order('data', { ascending: false })
      .order('saida_id', { ascending: false })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraSaida));
}

function paraSaida(l: Linha): LinhaSaidaLeite {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    saida_id: Math.round(numeroDe(l.saida_id) ?? 0),
    data: textoDe(l.data) ?? '',
    litros: numeroDe(l.litros) ?? 0,
    destino: textoDe(l.destino),
    observacao: textoDe(l.observacao),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Datas no futuro
// ─────────────────────────────────────────────────────────────────────────────

export interface SeparacaoSaidas {
  validas: LinhaSaidaLeite[];
  /** Datadas depois de hoje — digitação errada ou massa de teste. */
  futuras: LinhaSaidaLeite[];
}

/** O mesmo corte de `separarFuturos` da produção: leite que ainda não saiu não saiu. */
export function separarSaidasFuturas(saidas: LinhaSaidaLeite[], hoje: Date): SeparacaoSaidas {
  const hojeIso = hoje.toISOString().slice(0, 10);
  const validas: LinhaSaidaLeite[] = [];
  const futuras: LinhaSaidaLeite[] = [];
  for (const saida of saidas) {
    if (saida.data > hojeIso) futuras.push(saida);
    else validas.push(saida);
  }
  return { validas, futuras };
}

// ─────────────────────────────────────────────────────────────────────────────
// Destinos
// ─────────────────────────────────────────────────────────────────────────────

/** Sem acento, sem caixa, sem espaço sobrando: 'Laticínio' e ' laticinio ' são
 *  o mesmo destino. */
export function chaveDestino(destino: string | null): string {
  return (destino ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export interface Destino {
  /** A grafia MAIS USADA pela fazenda — é o vocabulário que o cliente reconhece. */
  destino: string;
  litros: number;
  saidas: number;
  /** Fração dos litros, não das saídas: uma coleta do laticínio vale dez mamadeiras. */
  fracao: number | null;
}

export function porDestino(saidas: LinhaSaidaLeite[]): Destino[] {
  const grupos = new Map<string, { litros: number; saidas: number; grafias: Map<string, number> }>();
  for (const saida of saidas) {
    const chave = chaveDestino(saida.destino);
    const grupo = grupos.get(chave) ?? { litros: 0, saidas: 0, grafias: new Map<string, number>() };
    grupo.litros += saida.litros;
    grupo.saidas += 1;
    const grafia = saida.destino?.trim() || SEM_DESTINO;
    grupo.grafias.set(grafia, (grupo.grafias.get(grafia) ?? 0) + 1);
    grupos.set(chave, grupo);
  }

  const total = saidas.reduce((acc, s) => acc + s.litros, 0);
  return [...grupos.values()]
    .map((g) => ({
      destino: [...g.grafias.entries()].sort((a, b) => b[1] - a[1])[0][0],
      litros: g.litros,
      saidas: g.saidas,
      fracao: total > 0 ? g.litros / total : null,
    }))
    .sort((a, b) => b.litros - a.litros || a.destino.localeCompare(b.destino, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoSaidas {
  saidas: number;
  litros: number;
  diasComSaida: number;
  mediaPorSaida: number | null;
  primeira: string | null;
  ultima: string | null;
}

export function resumoSaidas(saidas: LinhaSaidaLeite[]): ResumoSaidas {
  const litros = saidas.reduce((acc, s) => acc + s.litros, 0);
  const datas = saidas.map((s) => s.data).filter((d) => d !== '').sort();
  return {
    saidas: saidas.length,
    litros,
    diasComSaida: new Set(datas).size,
    mediaPorSaida: saidas.length > 0 ? litros / saidas.length : null,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Balanço — produzido × saiu, por mês
// ─────────────────────────────────────────────────────────────────────────────

export interface MesBalanco {
  /** 'YYYY-MM' */
  mes: string;
  produzido: number;
  /** Dias com produção lançada no mês — é o que diz se o balanço pode fechar. */
  diasProducao: number;
  saiu: number;
  saidas: number;
  /** saiu ÷ produzido. null quando não há produção lançada no mês. */
  razao: number | null;
}

/**
 * O balanço mês a mês, do mais recente para o mais antigo — SÓ dos meses com
 * alguma saída lançada (ver o cabeçalho do módulo).
 *
 * `diasProducao` vai junto de propósito: mês com saída acima do produzido e 12
 * dias de produção lançados não é tanque que inventou leite, é produção
 * sub-lançada — e é essa a leitura que a tela precisa permitir.
 */
export function balancoMensal(saidas: LinhaSaidaLeite[], dias: LinhaProducaoDia[]): MesBalanco[] {
  const meses = new Map<string, { saiu: number; saidas: number }>();
  for (const saida of saidas) {
    if (saida.data === '') continue;
    const mes = saida.data.slice(0, 7);
    const atual = meses.get(mes) ?? { saiu: 0, saidas: 0 };
    atual.saiu += saida.litros;
    atual.saidas += 1;
    meses.set(mes, atual);
  }

  const producao = new Map<string, { litros: number; dias: number }>();
  for (const dia of dias) {
    const mes = dia.data.slice(0, 7);
    if (!meses.has(mes)) continue;
    const atual = producao.get(mes) ?? { litros: 0, dias: 0 };
    atual.litros += dia.litros;
    atual.dias += 1;
    producao.set(mes, atual);
  }

  return [...meses.entries()]
    .map(([mes, s]) => {
      const p = producao.get(mes) ?? { litros: 0, dias: 0 };
      return {
        mes,
        produzido: p.litros,
        diasProducao: p.dias,
        saiu: s.saiu,
        saidas: s.saidas,
        razao: p.litros > 0 ? s.saiu / p.litros : null,
      };
    })
    .sort((a, b) => b.mes.localeCompare(a.mes));
}

export interface Balanco {
  /** Meses com alguma saída lançada — o recorte do balanço. */
  meses: number;
  produzido: number;
  saiu: number;
  razao: number | null;
  /** Meses em que saiu mais de FOLGA_BALANCO do produzido. */
  mesesSemFechar: number;
}

export function balanco(saidas: LinhaSaidaLeite[], dias: LinhaProducaoDia[]): Balanco {
  const meses = balancoMensal(saidas, dias);
  const produzido = meses.reduce((acc, m) => acc + m.produzido, 0);
  const saiu = meses.reduce((acc, m) => acc + m.saiu, 0);
  return {
    meses: meses.length,
    produzido,
    saiu,
    razao: produzido > 0 ? saiu / produzido : null,
    mesesSemFechar: meses.filter((m) => m.razao === null || m.razao > FOLGA_BALANCO).length,
  };
}
