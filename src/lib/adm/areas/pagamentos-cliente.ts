import 'server-only';

import { VIEWS_FASE_3, type LinhaPagamentosCliente } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type Resultado } from '@/lib/adm/types';
import { SEPARADOR_VALORES } from '@/lib/adm/url';

/**
 * QUEM PAGOU E QUANTO.
 *
 * O painel já mostrava a receita mês a mês e as cobranças uma a uma. O que
 * faltava era o acumulado: quanto cada cliente já pagou desde que entrou, e
 * quanto entrou no total. Somar 88 linhas na tela não é leitura, é trabalho.
 *
 * DUAS COISAS QUE NÃO SE CONFUNDEM, e é por isso que as duas aparecem:
 *   `totalPago`  é histórico — quem pagou 12 meses e saiu tem total alto;
 *   `mrrAtual`   é a foto de hoje — esse mesmo cliente tem zero.
 * Lado a lado elas contam a história; sozinha, cada uma mente por omissão.
 */

const VIEW = VIEWS_FASE_3.pagamentosPorCliente;

/** Projeção conferida em compilação — coluna esquecida vira erro de `tsc`. */
const PROJECAO = {
  usuario_id: true,
  nome: true,
  plano_nome: true,
  status_efetivo: true,
  ativo: true,
  acesso_ativo: true,
  pagamentos: true,
  total_pago: true,
  em_aberto: true,
  vencido: true,
  primeiro_pagamento: true,
  ultimo_pagamento: true,
  meses_como_cliente: true,
  mrr_atual: true,
} satisfies Record<keyof LinhaPagamentosCliente, true>;

const SELECT = Object.keys(PROJECAO).join(',');

/**
 * Citado na mensagem de erro quando a view não responde. Aponta o CONTRATO e não
 * um nome de arquivo chutado: renomear o SQL não torna a mensagem mentirosa.
 */
const SQL_FASE_3 =
  'o SQL das views da Fase 3 em supabase/adm/ — o que implementa VIEWS_FASE_3 de ' +
  'src/lib/adm/areas/contrato.ts';

/** 0 e não null: numa coluna de dinheiro somada logo abaixo, null viraria NaN
 *  no total e a tela inteira mostraria "R$ NaN" por causa de uma célula. */
const numero = (v: unknown): number => numeroDe(v) ?? 0;
const texto = textoDe;

function mapear(l: Linha): LinhaPagamentosCliente {
  return {
    usuario_id: numero(l.usuario_id),
    nome: texto(l.nome) ?? '—',
    plano_nome: texto(l.plano_nome),
    status_efetivo: texto(l.status_efetivo),
    ativo: l.ativo === true,
    acesso_ativo: l.acesso_ativo === true,
    pagamentos: numero(l.pagamentos),
    total_pago: numero(l.total_pago),
    em_aberto: numero(l.em_aberto),
    vencido: numero(l.vencido),
    primeiro_pagamento: texto(l.primeiro_pagamento),
    ultimo_pagamento: texto(l.ultimo_pagamento),
    // null e não 0: "nunca pagou" e "entrou este mês" são coisas diferentes.
    meses_como_cliente: l.meses_como_cliente == null ? null : numero(l.meses_como_cliente),
    mrr_atual: l.mrr_atual == null ? null : numero(l.mrr_atual),
  };
}

export async function listarPagamentosPorCliente(): Promise<Resultado<LinhaPagamentosCliente[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const res = await paginarView(VIEW, SQL_FASE_3, (de, ate) =>
    (supa.from(VIEW).select(SELECT) as unknown as Consulta)
      // Maior pagador primeiro — é a leitura que a tela existe para dar. O
      // desempate por `usuario_id` fecha a ordem: `paginar()` usa range, e
      // range sobre ordem não-total pode repetir e pular linha entre páginas.
      .order('total_pago', { ascending: false, nullsFirst: false })
      .order('usuario_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;

  return ok((res.dados as Linha[]).map(mapear));
}

// ─────────────────────────────────────────────────────────────────────────────
// Situação — o filtro que o Felipe pediu
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Ativo" é ambíguo neste domínio, e colapsar os dois sentidos esconderia
 * justamente quem está no meio:
 *
 *   a CONTA está ativa?      `usuarios.ativo` — desativada some do app
 *   a ASSINATURA dá acesso?  pagou, tem cortesia, ou tem extensão manual
 *
 * Um cliente que parou de pagar tem conta ATIVA e acesso INATIVO — e é
 * exatamente ele que interessa numa tela de cobrança. Por isso são três
 * situações, não duas.
 */
export type SituacaoCliente = 'pagando' | 'inadimplente' | 'desativado';

export const SITUACOES_CLIENTE: SituacaoCliente[] = ['pagando', 'inadimplente', 'desativado'];

export const SITUACAO_CLIENTE_ROTULO: Record<SituacaoCliente, string> = {
  pagando: 'Ativo',
  inadimplente: 'Sem acesso',
  desativado: 'Conta desativada',
};

export const SITUACAO_CLIENTE_AJUDA: Record<SituacaoCliente, string> = {
  pagando: 'Conta ativa e assinatura dando acesso hoje.',
  inadimplente: 'A conta existe e funciona, mas a assinatura não dá mais acesso — parou de pagar, venceu, ou nunca ativou.',
  desativado: 'A conta foi desativada: a pessoa não entra mais no aplicativo, independente da assinatura.',
};

/**
 * Lê `?f.situacao=` da URL — a MESMA leitura para a tela e para a exportação.
 *
 * Nasceu dentro de `/adm/carteira/pagamentos/page.tsx` e foi movida para cá
 * quando a exportação (CSV/XLSX) precisou do idêntico recorte: duas cópias da
 * mesma allowlist divergem na primeira vez que alguém mexer numa só, e aí o
 * arquivo baixado deixa de bater com o que está na tela — o defeito que esta
 * área inteira existe para evitar (ver o cabeçalho de `leitura.ts`).
 *
 * Allowlist: valor desconhecido é DESCARTADO em silêncio, e não vira erro — um
 * link salvo meses atrás, com um nome de situação que mudou desde então, deve
 * abrir sem filtro em vez de dar erro.
 */
export function lerSituacoesClienteDaUrl(bruto: string | null): SituacaoCliente[] {
  if (!bruto) return [];
  const pedidas = bruto.split(SEPARADOR_VALORES).map((v) => v.trim());
  return SITUACOES_CLIENTE.filter((s) => pedidas.includes(s));
}

export function situacaoDoCliente(l: LinhaPagamentosCliente): SituacaoCliente {
  // A ordem é a regra: conta desativada vence tudo. Uma conta desligada com
  // assinatura vigente ainda é alguém que não entra no app — mostrá-la como
  // "ativo" mandaria o operador cobrar quem não consegue usar o produto.
  if (!l.ativo) return 'desativado';
  return l.acesso_ativo ? 'pagando' : 'inadimplente';
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo — os números do topo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoPagamentos {
  clientes: number;
  /** Tudo que já entrou, desde o primeiro pagamento da história. */
  totalRecebido: number;
  emAberto: number;
  vencido: number;
  /** Quantos têm ao menos R$ 1 vencido — o número que vira ligação. */
  clientesComVencido: number;
  /** Média do total pago. null quando não há ninguém — nunca 0. */
  mediaPorCliente: number | null;
  /** Quanto o maior pagador representa do total. Concentração é risco. */
  fracaoDoMaior: number | null;
}

export function resumirPagamentos(linhas: readonly LinhaPagamentosCliente[]): ResumoPagamentos {
  const totalRecebido = linhas.reduce((s, l) => s + l.total_pago, 0);
  const maior = linhas.reduce((m, l) => Math.max(m, l.total_pago), 0);

  return {
    clientes: linhas.length,
    totalRecebido,
    emAberto: linhas.reduce((s, l) => s + l.em_aberto, 0),
    vencido: linhas.reduce((s, l) => s + l.vencido, 0),
    clientesComVencido: linhas.filter((l) => l.vencido > 0).length,
    mediaPorCliente: linhas.length > 0 ? totalRecebido / linhas.length : null,
    // Concentração: com 18 clientes, saber que um deles é 26% da receita
    // histórica muda o peso de perdê-lo.
    fracaoDoMaior: totalRecebido > 0 ? maior / totalRecebido : null,
  };
}

export function filtrarPorSituacao(
  linhas: readonly LinhaPagamentosCliente[],
  situacoes: readonly SituacaoCliente[],
): LinhaPagamentosCliente[] {
  // Lista vazia = todas. É o estado "sem filtro", não "nenhuma" — senão abrir a
  // tela sem escolher nada mostraria zero linhas.
  if (situacoes.length === 0) return [...linhas];
  return linhas.filter((l) => situacoes.includes(situacaoDoCliente(l)));
}

export function contarPorSituacao(
  linhas: readonly LinhaPagamentosCliente[],
): Record<SituacaoCliente, number> {
  const contagem: Record<SituacaoCliente, number> = { pagando: 0, inadimplente: 0, desativado: 0 };
  for (const l of linhas) contagem[situacaoDoCliente(l)] += 1;
  return contagem;
}
