import 'server-only';

import { VIEWS_SECAGEM, type LinhaSecagem } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * SECAGEM — a leitura de `adm.secagem_detalhe` e as regras da tela.
 *
 * O ÚNICO NÚMERO QUE IMPORTA AQUI É O PERÍODO SECO, e ele não existe em coluna
 * nenhuma do app: `secagem.del` está preenchida em 33% das linhas e tem máximo
 * de 20.617 dias. A view calcula — dias entre a secagem e o parto seguinte da
 * mesma fêmea.
 *
 * Por que ele decide manejo: a glândula mamária precisa de um descanso para
 * regenerar. Secar tarde demais (menos de 30 dias antes do parto) faz a próxima
 * lactação vir menor; secar cedo demais transforma a fêmea em animal que come e
 * não produz. O alvo em caprino leiteiro fica em torno de 60 dias.
 */

const SQL_SECAGEM = 'supabase/adm/adm_23_secagem.sql';

const PROJECAO = {
  propriedade_id: true,
  secagem_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  categoria: true,
  ordem_parto: true,
  data_secagem: true,
  tipo_secagem: true,
  confirmada: true,
  proximo_parto: true,
  periodo_seco: true,
  observacao: true,
} satisfies Record<keyof LinhaSecagem, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarSecagens(propriedadeId: number): Promise<Resultado<LinhaSecagem[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_SECAGEM.detalhe;
  const res = await paginarView(view, SQL_SECAGEM, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: a secagem de lote acontece toda no mesmo dia — o id desempata.
      .order('data_secagem', { ascending: false })
      .order('secagem_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraSecagem));
}

function paraSecagem(l: Linha): LinhaSecagem {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    secagem_id: Math.round(numeroDe(l.secagem_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    categoria: textoDe(l.categoria),
    ordem_parto: numeroDe(l.ordem_parto),
    data_secagem: textoDe(l.data_secagem) ?? '',
    tipo_secagem: textoDe(l.tipo_secagem),
    confirmada: l.confirmada === true,
    proximo_parto: textoDe(l.proximo_parto),
    periodo_seco: numeroDe(l.periodo_seco),
    observacao: textoDe(l.observacao),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipo — a mesma inconsistência de caixa de sempre
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza `tipo_secagem`.
 *
 * A base tem 'Natural' (526) e 'natural' (1) — a mesma inconsistência de caixa
 * que apareceu em `tipo` da AML e das medidas. Só que aqui o valor é livre e
 * pode ganhar tipos novos com o app; por isso a função NÃO tem lista fechada:
 * ela arruma a caixa e devolve o resto como veio, em vez de jogar o
 * desconhecido num balde "outro" que esconderia um tipo novo.
 */
export function normalizarTipo(tipo: string | null): string {
  const limpo = (tipo ?? '').trim();
  if (limpo === '') return 'Não informado';
  return limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase();
}

export interface TipoSecagem {
  tipo: string;
  secagens: number;
  fracao: number | null;
}

export function porTipo(secagens: LinhaSecagem[]): TipoSecagem[] {
  const total = secagens.length;
  const contagem = new Map<string, number>();
  for (const secagem of secagens) {
    const chave = normalizarTipo(secagem.tipo_secagem);
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }

  return [...contagem.entries()]
    .map(([tipo, secagens]) => ({ tipo, secagens, fracao: total > 0 ? secagens / total : null }))
    .sort((a, b) => b.secagens - a.secagens || a.tipo.localeCompare(b.tipo, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Período seco
// ─────────────────────────────────────────────────────────────────────────────

/** Acima disso não é período seco, é fêmea que passou uma estação inteira sem
 *  parir — e a conta vira memória, não manejo. */
export const PERIODO_SECO_MAXIMO = 200;

/** O alvo em caprino leiteiro. Não é lei, é referência — e vai impressa na tela
 *  junto do número para o leitor saber contra o que está comparando. */
export const PERIODO_SECO_ALVO = 60;

export function periodoUtilizavel(secagem: LinhaSecagem): boolean {
  const dias = secagem.periodo_seco;
  return dias !== null && dias > 0 && dias <= PERIODO_SECO_MAXIMO;
}

export interface FaixaPeriodo {
  rotulo: string;
  detalhe: string;
  secagens: number;
  fracao: number | null;
  alerta: boolean;
}

/**
 * O período seco em faixas, na ordem da escala.
 *
 * As duas pontas são alerta e por motivos opostos: abaixo de 30 dias a glândula
 * não regenera e a próxima lactação vem menor; acima de 120 a fêmea come sem
 * produzir. O meio é o que se quer.
 */
const FAIXAS: { rotulo: string; detalhe: string; de: number; ate: number | null; alerta: boolean }[] = [
  { rotulo: 'menos de 30 dias', detalhe: 'a glândula não regenera', de: 0, ate: 29, alerta: true },
  { rotulo: '30 a 45', detalhe: 'curto', de: 30, ate: 45, alerta: false },
  { rotulo: '46 a 75', detalhe: 'em torno do alvo de 60 dias', de: 46, ate: 75, alerta: false },
  { rotulo: '76 a 120', detalhe: 'longo', de: 76, ate: 120, alerta: false },
  { rotulo: 'acima de 120', detalhe: 'come sem produzir', de: 121, ate: null, alerta: true },
];

export function faixasDePeriodo(secagens: LinhaSecagem[]): FaixaPeriodo[] {
  const uteis = secagens.filter(periodoUtilizavel);
  const total = uteis.length;

  return FAIXAS.map((faixa) => {
    const quantas = uteis.filter((s) => {
      const dias = s.periodo_seco ?? 0;
      return faixa.ate === null ? dias >= faixa.de : dias >= faixa.de && dias <= faixa.ate;
    }).length;
    return {
      rotulo: faixa.rotulo,
      detalhe: faixa.detalhe,
      secagens: quantas,
      fracao: total > 0 ? quantas / total : null,
      alerta: faixa.alerta,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoSecagens {
  secagens: number;
  animais: number;
  /** Eventos de fato — `confirmada = true`. */
  confirmadas: number;
  /** Previsões do app que ainda não aconteceram. */
  previstas: number;
  /** Secagens que já tiveram o parto seguinte — o denominador do período seco. */
  comPeriodo: number;
  periodoMedio: number | null;
  /** Abaixo de 30 dias: a próxima lactação vem menor. */
  curtasDemais: number;
  /** Sem parto posterior ainda — o normal para secagem recente. */
  aguardandoParto: number;
  primeira: string | null;
  ultima: string | null;
}

export function resumoSecagens(secagens: LinhaSecagem[]): ResumoSecagens {
  const comPeriodo = secagens.filter(periodoUtilizavel);
  const datas = secagens.map((s) => s.data_secagem).filter((d) => d !== '').sort();

  return {
    secagens: secagens.length,
    animais: new Set(secagens.map((s) => s.animal_id)).size,
    confirmadas: secagens.filter((s) => s.confirmada).length,
    previstas: secagens.filter((s) => !s.confirmada).length,
    comPeriodo: comPeriodo.length,
    periodoMedio:
      comPeriodo.length > 0
        ? comPeriodo.reduce((acc, s) => acc + (s.periodo_seco ?? 0), 0) / comPeriodo.length
        : null,
    curtasDemais: comPeriodo.filter((s) => (s.periodo_seco ?? 0) < 30).length,
    aguardandoParto: secagens.filter((s) => s.proximo_parto === null).length,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Série e lista de ação
// ─────────────────────────────────────────────────────────────────────────────

/** Secagens por mês — a antecâmara da parição, cinco meses antes do pico do tanque. */
export function serieSecagens(secagens: LinhaSecagem[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const secagem of secagens) {
    if (secagem.data_secagem === '') continue;
    const mes = secagem.data_secagem.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export const LISTA_LIMITE = 15;

/**
 * As secagens mais curtas — a lista de ação.
 *
 * Ordem TOTAL: período e, no empate, o número do animal. São as fêmeas cuja
 * próxima lactação já nasceu comprometida, e é a conversa que o consultor leva
 * pronta.
 */
export function maisCurtas(secagens: LinhaSecagem[], limite: number = LISTA_LIMITE): LinhaSecagem[] {
  return secagens
    .filter(periodoUtilizavel)
    .sort(
      (a, b) =>
        (a.periodo_seco ?? 0) - (b.periodo_seco ?? 0) ||
        a.numero_animal.localeCompare(b.numero_animal, 'pt-BR'),
    )
    .slice(0, limite);
}
