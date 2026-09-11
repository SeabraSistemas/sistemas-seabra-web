import 'server-only';

import { VIEWS_FEMEA, type LinhaFemea } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import {
  PRONTA_PARA_COBRIR_APOS,
  diasEntre,
  situacaoReprodutiva,
  type SituacaoReprodutiva,
} from '@/lib/adm/areas/situacao-reprodutiva';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type Resultado } from '@/lib/adm/types';

/**
 * BALANÇO REPRODUTIVO — cada fêmea ativa e o pé em que está HOJE.
 *
 * A aba Reprodução mostra o funil dos últimos 12 meses (cobriu → DG → pariu);
 * a tela de serviços, qual reprodutor emprenha. Nenhuma das duas responde a
 * pergunta de manejo da semana: QUEM está gestante e pare quando, QUEM está
 * coberta esperando DG, QUEM deu vazio, QUEM já pode ir ao bode. O painel em
 * planilha que o Felipe usava tinha isso; este módulo é a versão sobre o banco.
 *
 * A regra do estado é a MESMA do controle leiteiro (situacao-reprodutiva.ts),
 * avaliada em `hoje` em vez de na data do controle. O que este módulo
 * acrescenta é o GRUPO DE MANEJO — que junta o estado reprodutivo com a idade,
 * o parto e a lactação: "não coberta" vira "pronta para cobrir" quando pariu há
 * 60+ dias, "parida há pouco" quando não, "cabrita apta" quando nunca pariu e
 * tem 8 meses, "ainda nova" quando não tem.
 *
 * Toda função recebe `hoje` — nada de relógio dentro do cálculo.
 */

const SQL_FEMEAS = 'supabase/adm/adm_29_femeas.sql';

const PROJECAO = {
  propriedade_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  categoria: true,
  baia: true,
  setor: true,
  data_de_nascimento: true,
  idade_dias: true,
  ordem_parto: true,
  ultimo_parto: true,
  dias_desde_parto: true,
  em_lactacao: true,
  seca_em: true,
  peso_atual: true,
  ultima_pesagem: true,
  servico_data: true,
  servico_metodo: true,
  servico_reprodutor: true,
  dg_data: true,
  dg_resultado: true,
  aborto_data: true,
  dg_dias_gestacao: true,
  dg_negativo_data: true,
} satisfies Record<keyof LinhaFemea, true>;

const SELECT = Object.keys(PROJECAO).join(',');

/** Cabrita passa a ser apta ao bode aos 7 meses E 35 kg — os parâmetros que o
 *  Felipe já usava no painel antigo. Sem peso lançado, vale só a idade. */
export const APTA_A_PARTIR_DE_DIAS = 210;
export const APTA_PESO_MINIMO_KG = 35;
/** Em lactação há mais de 210 dias sem gestação: a cabra está passando do
 *  ponto — a curva cai e ela não foi coberta. O alerta vermelho do painel antigo. */
export const DEL_ALERTA_DIAS = 210;
/** Parto previsto dentro desta janela é "próximo" — a lista da maternidade. */
export const PARTO_PROXIMO_DIAS = 30;
/** Parto previsto há mais tempo que isso e nada lançado: ou pariu e ninguém
 *  cadastrou a cria, ou abortou e ninguém lançou. */
export const PARTO_VENCIDO_APOS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarFemeas(propriedadeId: number): Promise<Resultado<LinhaFemea[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_FEMEA.situacao;
  const res = await paginarView(view, SQL_FEMEAS, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: animal_id é único.
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraFemea));
}

function paraFemea(l: Linha): LinhaFemea {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    categoria: textoDe(l.categoria),
    baia: textoDe(l.baia),
    setor: textoDe(l.setor),
    data_de_nascimento: textoDe(l.data_de_nascimento),
    idade_dias: numeroDe(l.idade_dias),
    ordem_parto: numeroDe(l.ordem_parto),
    ultimo_parto: textoDe(l.ultimo_parto),
    dias_desde_parto: numeroDe(l.dias_desde_parto),
    em_lactacao: l.em_lactacao === true,
    seca_em: textoDe(l.seca_em),
    peso_atual: numeroDe(l.peso_atual),
    ultima_pesagem: textoDe(l.ultima_pesagem),
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

// ─────────────────────────────────────────────────────────────────────────────
// Grupo de manejo — o estado reprodutivo cruzado com idade, parto e lactação
// ─────────────────────────────────────────────────────────────────────────────

export type GrupoBalanco =
  | 'gestante'
  | 'coberta'
  | 'vazia'
  | 'pronta'
  | 'parida_recente'
  | 'jovem'
  | 'sem_informacao';

export interface DescricaoGrupo {
  chave: GrupoBalanco;
  rotulo: string;
  detalhe: string;
}

/** Na ordem do ciclo: do que está resolvido para o que ainda precisa de decisão. */
export const GRUPOS: DescricaoGrupo[] = [
  { chave: 'gestante', rotulo: 'Gestantes', detalhe: 'DG positivo depois da última cobertura' },
  { chave: 'coberta', rotulo: 'Cobertas, aguardando DG', detalhe: 'cobertas há até 170 dias, sem diagnóstico' },
  { chave: 'vazia', rotulo: 'Vazias', detalhe: 'DG negativo ou aborto — precisam voltar ao bode' },
  {
    chave: 'pronta',
    rotulo: 'Prontas para cobrir',
    detalhe: `paridas há ${PRONTA_PARA_COBRIR_APOS}+ dias sem nova cobertura, ou cabritas com ${APTA_A_PARTIR_DE_DIAS}+ dias nunca cobertas`,
  },
  {
    chave: 'parida_recente',
    rotulo: 'Paridas há pouco',
    detalhe: `menos de ${PRONTA_PARA_COBRIR_APOS} dias do parto — ainda no puerpério`,
  },
  {
    chave: 'jovem',
    rotulo: 'Cabritas ainda novas',
    detalhe: `menos de ${APTA_A_PARTIR_DE_DIAS} dias de idade, ou abaixo de ${APTA_PESO_MINIMO_KG} kg`,
  },
  { chave: 'sem_informacao', rotulo: 'Sem informação', detalhe: 'sem nascimento, sem parto e sem evento' },
];

export const ROTULO_GRUPO: Record<GrupoBalanco, string> = Object.fromEntries(
  GRUPOS.map((g) => [g.chave, g.rotulo]),
) as Record<GrupoBalanco, string>;

/** `?grupo=` é texto de fora: só vira filtro se estiver na lista. */
export function lerGrupo(bruto: string | string[] | undefined): GrupoBalanco | null {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  if (!valor) return null;
  return GRUPOS.some((g) => g.chave === valor) ? (valor as GrupoBalanco) : null;
}

export interface FemeaAvaliada {
  femea: LinhaFemea;
  situacao: SituacaoReprodutiva;
  grupo: GrupoBalanco;
  /** Gestante com 90+ dias de gestação E lactação aberta — devia estar seca. */
  aSecar: boolean;
  /** Dias até o parto previsto (negativo = já passou). null sem cobertura conhecida. */
  diasParaParto: number | null;
  partoProximo: boolean;
  /** Parto previsto passou há mais de PARTO_VENCIDO_APOS dias e nada foi lançado. */
  partoVencido: boolean;
  /** Em lactação há mais de DEL_ALERTA_DIAS sem estar gestante. */
  alertaDel: boolean;
  /** Cabrita com idade mas sem peso lançado — apta só pela idade. */
  aptaSemPeso: boolean;
}

function grupoDe(femea: LinhaFemea, situacao: SituacaoReprodutiva): GrupoBalanco {
  switch (situacao.estado) {
    case 'gestante':
      return 'gestante';
    case 'coberta':
      return 'coberta';
    case 'vazia':
    case 'abortou':
      return 'vazia';
    case 'nao_coberta':
    case 'sem_informacao':
      break;
  }

  // Sem evento desde o parto: o que decide é o parto e a idade.
  if (femea.dias_desde_parto !== null) {
    return femea.dias_desde_parto >= PRONTA_PARA_COBRIR_APOS ? 'pronta' : 'parida_recente';
  }
  if (femea.idade_dias !== null) {
    if (femea.idade_dias < APTA_A_PARTIR_DE_DIAS) return 'jovem';
    // Com peso lançado, o peso decide; sem peso, vale a idade (e a tela marca).
    return femea.peso_atual !== null && femea.peso_atual < APTA_PESO_MINIMO_KG ? 'jovem' : 'pronta';
  }
  return 'sem_informacao';
}

/**
 * Avalia cada fêmea em `hoje`. A situação vem da regra compartilhada; o grupo,
 * o "a secar" e o parto próximo/vencido são desta tela.
 *
 * "A secar" aqui exige LACTAÇÃO ABERTA, ao contrário do controle leiteiro —
 * lá a cabra está no controle, logo está sendo ordenhada; aqui a gestante já
 * seca está certa e não pode aparecer como pendência.
 */
export function avaliarFemeas(femeas: LinhaFemea[], hoje: Date): FemeaAvaliada[] {
  const hojeIso = hoje.toISOString().slice(0, 10);
  return femeas.map((femea) => {
    const situacao = situacaoReprodutiva(femea, hojeIso);
    const diasParaParto = situacao.partoPrevisto ? diasEntre(hojeIso, situacao.partoPrevisto) : null;
    const grupo = grupoDe(femea, situacao);
    return {
      femea,
      situacao,
      grupo,
      aSecar: situacao.aSecar && femea.em_lactacao,
      diasParaParto,
      partoProximo:
        diasParaParto !== null && diasParaParto >= -PARTO_VENCIDO_APOS && diasParaParto <= PARTO_PROXIMO_DIAS,
      partoVencido: diasParaParto !== null && diasParaParto < -PARTO_VENCIDO_APOS,
      alertaDel:
        femea.em_lactacao &&
        situacao.estado !== 'gestante' &&
        femea.dias_desde_parto !== null &&
        femea.dias_desde_parto > DEL_ALERTA_DIAS,
      aptaSemPeso: grupo === 'pronta' && femea.ultimo_parto === null && femea.peso_atual === null,
    };
  });
}

export interface ResumoBalanco {
  femeas: number;
  porGrupo: Record<GrupoBalanco, number>;
  aSecar: number;
  dgAtrasado: number;
  partosProximos: number;
  partosVencidos: number;
  /** Gestantes por DG sem cobertura lançada — não têm parto previsto. */
  semCoberturaLancada: number;
  /** Das prontas, quantas são cabritas (nunca pariram) e quantas já pariram. */
  prontasCabritas: number;
  prontasParidas: number;
  /** Em lactação há mais de DEL_ALERTA_DIAS sem gestação. */
  alertaDel: number;
  /** Gestantes cujo DG foi lançado com idade do feto que discorda da cobertura. */
  dgDiasSuspeitos: number;
  /** Gestantes cuja cobertura registrada foi refutada por DG negativo. */
  coberturasRefutadas: number;
  /** Alguma cobertura, DG ou aborto lançado para alguma fêmea. Sem isso os
   *  grupos são só idade e parto — e a tela diz que é falta de lançamento. */
  comAlgumEvento: boolean;
}

export function resumoBalanco(avaliadas: FemeaAvaliada[]): ResumoBalanco {
  const porGrupo = Object.fromEntries(GRUPOS.map((g) => [g.chave, 0])) as Record<GrupoBalanco, number>;
  for (const a of avaliadas) porGrupo[a.grupo] += 1;

  const prontas = avaliadas.filter((a) => a.grupo === 'pronta');

  return {
    femeas: avaliadas.length,
    porGrupo,
    aSecar: avaliadas.filter((a) => a.aSecar).length,
    dgAtrasado: avaliadas.filter((a) => a.situacao.dgAtrasado).length,
    partosProximos: avaliadas.filter((a) => a.partoProximo).length,
    partosVencidos: avaliadas.filter((a) => a.partoVencido).length,
    semCoberturaLancada: avaliadas.filter((a) => a.situacao.semCoberturaLancada).length,
    prontasCabritas: prontas.filter((a) => a.femea.ultimo_parto === null).length,
    prontasParidas: prontas.filter((a) => a.femea.ultimo_parto !== null).length,
    alertaDel: avaliadas.filter((a) => a.alertaDel).length,
    dgDiasSuspeitos: avaliadas.filter((a) => a.situacao.dgDiasSuspeito).length,
    coberturasRefutadas: avaliadas.filter((a) => a.situacao.coberturaRefutada).length,
    comAlgumEvento: avaliadas.some(
      (a) => a.femea.servico_data || a.femea.dg_data || a.femea.aborto_data,
    ),
  };
}

/** As gestantes com parto previsto, da mais próxima (ou mais vencida) para a
 *  mais distante — a lista da maternidade. */
export function proximosPartos(avaliadas: FemeaAvaliada[]): FemeaAvaliada[] {
  return avaliadas
    .filter((a) => a.grupo === 'gestante' && a.diasParaParto !== null)
    .sort(
      (a, b) =>
        (a.diasParaParto ?? 0) - (b.diasParaParto ?? 0) ||
        a.femea.numero_animal.localeCompare(b.femea.numero_animal, 'pt-BR'),
    );
}

/** As prontas para cobrir, de quem espera há mais tempo para quem espera há
 *  menos: paridas pelos dias desde o parto, depois cabritas pela idade. */
export function prontasParaCobrir(avaliadas: FemeaAvaliada[]): FemeaAvaliada[] {
  const espera = (a: FemeaAvaliada) => a.femea.dias_desde_parto ?? a.femea.idade_dias ?? 0;
  return avaliadas
    .filter((a) => a.grupo === 'pronta')
    .sort((a, b) => {
      const paridaA = a.femea.ultimo_parto !== null ? 0 : 1;
      const paridaB = b.femea.ultimo_parto !== null ? 0 : 1;
      return (
        paridaA - paridaB ||
        espera(b) - espera(a) ||
        a.femea.numero_animal.localeCompare(b.femea.numero_animal, 'pt-BR')
      );
    });
}

/** Ordem da lista geral: pelo grupo (na ordem do ciclo), depois pelo número. */
export function ordenarPorGrupo(avaliadas: FemeaAvaliada[]): FemeaAvaliada[] {
  const posicao = new Map(GRUPOS.map((g, i) => [g.chave, i]));
  return [...avaliadas].sort(
    (a, b) =>
      (posicao.get(a.grupo) ?? 99) - (posicao.get(b.grupo) ?? 99) ||
      a.femea.numero_animal.localeCompare(b.femea.numero_animal, 'pt-BR'),
  );
}

/** As de DEL alto sem gestação, de quem está há mais tempo em lactação para
 *  quem está há menos — o alerta vermelho. */
export function alertasDel(avaliadas: FemeaAvaliada[]): FemeaAvaliada[] {
  return avaliadas
    .filter((a) => a.alertaDel)
    .sort(
      (a, b) =>
        (b.femea.dias_desde_parto ?? 0) - (a.femea.dias_desde_parto ?? 0) ||
        a.femea.numero_animal.localeCompare(b.femea.numero_animal, 'pt-BR'),
    );
}

/**
 * A auditoria de coberturas: as gestantes em que a idade do feto lançada no DG
 * discorda da cobertura registrada (o "30 dias" digitado por padrão), e as em
 * que um DG negativo refutou a cobertura. Nos dois casos a tela mostra as duas
 * versões da gestação — a que o app gravou e a que os eventos sustentam.
 */
export function auditoriaCoberturas(avaliadas: FemeaAvaliada[]): FemeaAvaliada[] {
  return avaliadas
    .filter((a) => a.situacao.dgDiasSuspeito || a.situacao.coberturaRefutada)
    .sort(
      (a, b) =>
        (a.situacao.dataDg ?? '').localeCompare(b.situacao.dataDg ?? '') ||
        a.femea.numero_animal.localeCompare(b.femea.numero_animal, 'pt-BR'),
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Por baia — a visão do curral
// ─────────────────────────────────────────────────────────────────────────────

export const SEM_BAIA = 'Sem baia';

export interface BaiaBalanco {
  baia: string;
  animais: number;
  /** DEL médio das que estão em lactação — dias desde o parto. null sem nenhuma. */
  delMedio: number | null;
  emLactacao: number;
  gestantes: number;
  cobertas: number;
  /** Nem gestante nem coberta — vazias, prontas, paridas há pouco, jovens. */
  outras: number;
  aptas: number;
  alertasDel: number;
  femeas: FemeaAvaliada[];
}

/**
 * O balanço repartido por baia, com a barra prenha/coberta/outras de cada uma.
 * Ordem alfabética natural ("G1-2" antes de "G1-10"), "Sem baia" por último.
 */
export function porBaia(avaliadas: FemeaAvaliada[]): BaiaBalanco[] {
  const grupos = new Map<string, FemeaAvaliada[]>();
  for (const a of avaliadas) {
    const chave = a.femea.baia?.trim() || SEM_BAIA;
    const lista = grupos.get(chave);
    if (lista) lista.push(a);
    else grupos.set(chave, [a]);
  }

  const natural = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });

  return [...grupos.entries()]
    .map(([baia, femeas]) => {
      const lactantes = femeas.filter((a) => a.femea.em_lactacao && a.femea.dias_desde_parto !== null);
      return {
        baia,
        animais: femeas.length,
        delMedio:
          lactantes.length > 0
            ? lactantes.reduce((acc, a) => acc + (a.femea.dias_desde_parto ?? 0), 0) / lactantes.length
            : null,
        emLactacao: femeas.filter((a) => a.femea.em_lactacao).length,
        gestantes: femeas.filter((a) => a.grupo === 'gestante').length,
        cobertas: femeas.filter((a) => a.grupo === 'coberta').length,
        outras: femeas.filter((a) => a.grupo !== 'gestante' && a.grupo !== 'coberta').length,
        aptas: femeas.filter((a) => a.grupo === 'pronta').length,
        alertasDel: femeas.filter((a) => a.alertaDel).length,
        femeas: ordenarPorGrupo(femeas),
      };
    })
    .sort((a, b) => {
      if (a.baia === SEM_BAIA) return b.baia === SEM_BAIA ? 0 : 1;
      if (b.baia === SEM_BAIA) return -1;
      return natural.compare(a.baia, b.baia);
    });
}

export type FiltroBalanco = 'del' | 'aptas';

/** `?filtro=` é texto de fora: só vira filtro se estiver na lista. */
export function lerFiltro(bruto: string | string[] | undefined): FiltroBalanco | null {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return valor === 'del' || valor === 'aptas' ? valor : null;
}

export function aplicarFiltro(avaliadas: FemeaAvaliada[], filtro: FiltroBalanco | null): FemeaAvaliada[] {
  if (filtro === 'del') return avaliadas.filter((a) => a.alertaDel);
  if (filtro === 'aptas') return avaliadas.filter((a) => a.grupo === 'pronta');
  return avaliadas;
}
