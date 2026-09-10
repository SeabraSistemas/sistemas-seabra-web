import 'server-only';

import { VIEWS_NASCIMENTO, type LinhaNascimento } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * NASCIMENTOS — a leitura de `adm.nascimento_detalhe` e as regras da tela.
 *
 * A ENTREGA QUE JUSTIFICA A TELA é o cruzamento peso × ninhada. Cria única nasce
 * mais pesada que gemelar, e gemelar mais que trigemelar: uma média de peso ao
 * nascer sem separar por ninhada mistura três populações diferentes e não diz
 * nada sobre nutrição de final de gestação — que é a pergunta que o número
 * deveria responder.
 *
 * A segunda é a mortalidade DOS NASCIDOS do período, que a aba Sanidade não
 * separa dos adultos: perder cria nos primeiros dias é colostro e assistência ao
 * parto, e o número só aparece cruzando nascimento com óbito.
 */

const SQL_NASCIMENTOS = 'supabase/adm/adm_19_nascimentos.sql';

const PROJECAO = {
  propriedade_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  status: true,
  data_nascimento: true,
  peso_ao_nascer: true,
  origem: true,
  mae_id: true,
  mae_numero: true,
  mae_nome: true,
  pai_id: true,
  ninhada: true,
  data_obito: true,
  idade_ao_morrer: true,
} satisfies Record<keyof LinhaNascimento, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Período
// ─────────────────────────────────────────────────────────────────────────────

export const PERIODOS = ['12m', '24m', 'ano', 'tudo'] as const;
export type Periodo = (typeof PERIODOS)[number];

export const PERIODO_PADRAO: Periodo = '12m';

export const ROTULO_PERIODO: Record<Periodo, string> = {
  '12m': '12 meses',
  '24m': '24 meses',
  ano: 'ano corrente',
  tudo: 'todo o histórico',
};

export function lerPeriodo(bruto: string | string[] | undefined): Periodo {
  const valor = Array.isArray(bruto) ? bruto[0] : bruto;
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : PERIODO_PADRAO;
}

const UM_DIA_MS = 86_400_000;

/** Comparação de texto sobre 'YYYY-MM-DD' — nessa forma a ordem lexicográfica é
 *  a cronológica, e nenhum fuso move o dia. */
export function inicioDoPeriodo(periodo: Periodo, hoje: Date): string | null {
  if (periodo === 'tudo') return null;
  if (periodo === 'ano') return `${hoje.getUTCFullYear()}-01-01`;
  const dias = periodo === '12m' ? 365 : 730;
  return new Date(hoje.getTime() - dias * UM_DIA_MS).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarNascimentos(
  propriedadeId: number,
  desde: string | null,
): Promise<Resultado<LinhaNascimento[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_NASCIMENTO.detalhe;
  const res = await paginarView(view, SQL_NASCIMENTOS, (de, ate) => {
    const base = supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId);
    const filtrada = desde === null ? base : base.gte('data_nascimento', desde);
    return (filtrada as unknown as Consulta)
      // Ordem TOTAL: uma ninhada inteira nasce no mesmo dia — o id desempata.
      .order('data_nascimento', { ascending: false })
      .order('animal_id', { ascending: false })
      .range(de, ate);
  });
  if (!res.ok) return res;
  return ok(res.dados.map(paraNascimento));
}

function paraNascimento(l: Linha): LinhaNascimento {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    status: textoDe(l.status),
    data_nascimento: textoDe(l.data_nascimento) ?? '',
    peso_ao_nascer: numeroDe(l.peso_ao_nascer),
    origem: textoDe(l.origem),
    mae_id: numeroDe(l.mae_id),
    mae_numero: textoDe(l.mae_numero),
    mae_nome: textoDe(l.mae_nome),
    pai_id: numeroDe(l.pai_id),
    ninhada: numeroDe(l.ninhada),
    data_obito: textoDe(l.data_obito),
    idade_ao_morrer: numeroDe(l.idade_ao_morrer),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Peso ao nascer — o campo que vem sujo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Teto do peso ao nascer, em quilos.
 *
 * Cabrito e cordeiro nascem entre 1,5 e 6 kg; 10 kg já é impossível na espécie.
 * A base tem 27 valores acima disso, o maior deles 408 kg — peso de boi adulto,
 * não de cria. Junto com os 237 valores <= 0, são os que precisam sair de
 * qualquer média.
 */
export const PESO_NASCER_MAXIMO_KG = 10;

export function pesoUtilizavel(nascimento: LinhaNascimento): boolean {
  const peso = nascimento.peso_ao_nascer;
  return peso !== null && peso > 0 && peso <= PESO_NASCER_MAXIMO_KG;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoNascimentos {
  crias: number;
  /** Pares distintos (mãe, dia): a ninhada inteira é UM parto. */
  partos: number;
  /** Crias por parto — só sobre as crias com mãe cadastrada. */
  prolificidade: number | null;
  femeas: number;
  machos: number;
  semSexo: number;
  pesoMedio: number | null;
  /** Denominador do peso médio: quantas crias tinham peso utilizável. */
  comPeso: number;
  /** Peso fora da faixa possível da espécie — 237 zerados e 27 acima de 10 kg na base. */
  pesoImplausivel: number;
  semMae: number;
  /** Crias do período que já morreram. */
  mortas: number;
  /** Das que morreram, quantas nos primeiros 30 dias. */
  mortasNeonatal: number;
}

export function resumoNascimentos(nascimentos: LinhaNascimento[]): ResumoNascimentos {
  const comPeso = nascimentos.filter(pesoUtilizavel);
  const comMae = nascimentos.filter((n) => n.mae_id !== null);

  // Pares distintos (mãe, dia) — a mesma definição de parto da view de
  // Reprodução. Cria sem mãe não entra: não dá para saber de que parto veio.
  const partos = new Set(comMae.map((n) => `${n.mae_id}|${n.data_nascimento}`)).size;

  const ehFemea = (n: LinhaNascimento) => (n.sexo ?? '').toLowerCase().startsWith('f');
  const ehMacho = (n: LinhaNascimento) => (n.sexo ?? '').toLowerCase().startsWith('m');
  const mortas = nascimentos.filter((n) => n.data_obito !== null);

  return {
    crias: nascimentos.length,
    partos,
    prolificidade: partos > 0 ? comMae.length / partos : null,
    femeas: nascimentos.filter(ehFemea).length,
    machos: nascimentos.filter(ehMacho).length,
    semSexo: nascimentos.filter((n) => !ehFemea(n) && !ehMacho(n)).length,
    pesoMedio:
      comPeso.length > 0
        ? comPeso.reduce((acc, n) => acc + (n.peso_ao_nascer ?? 0), 0) / comPeso.length
        : null,
    comPeso: comPeso.length,
    pesoImplausivel: nascimentos.filter((n) => n.peso_ao_nascer !== null && !pesoUtilizavel(n)).length,
    semMae: nascimentos.length - comMae.length,
    mortas: mortas.length,
    mortasNeonatal: mortas.filter((n) => (n.idade_ao_morrer ?? Infinity) <= 30).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ninhada — a leitura que a tela existe para fazer
// ─────────────────────────────────────────────────────────────────────────────

export interface GrupoNinhada {
  /** 1, 2, 3 ou 4 (que agrupa "4 ou mais"). */
  tamanho: number;
  rotulo: string;
  crias: number;
  partos: number;
  pesoMedio: number | null;
  comPeso: number;
  /** Fração das crias desse grupo que já morreram. */
  mortalidade: number | null;
}

/** Da 4ª cria em diante vira um grupo só: a base tem 18 partos de 4, 3 de 5 e um
 *  de 6 — separá-los daria linhas de amostra única com cara de estatística. */
export const NINHADA_AGRUPADA = 4;

/**
 * Peso e mortalidade POR TAMANHO DE NINHADA.
 *
 * É a leitura central da tela. Cria única nasce mais pesada que gemelar, e a
 * diferença é grande (na casa de meio quilo): comparar o peso médio de um ano
 * com o de outro sem olhar a proporção de gemelares compara duas populações
 * diferentes e chama a diferença de "melhora nutricional".
 *
 * Crias sem mãe cadastrada ficam FORA — sem ela não há ninhada conhecida, e
 * empurrá-las para "única" premiaria o cadastro pior com o grupo mais pesado.
 */
export function porNinhada(nascimentos: LinhaNascimento[]): GrupoNinhada[] {
  const comNinhada = nascimentos.filter((n) => n.ninhada !== null && n.ninhada > 0);

  const grupos = new Map<number, LinhaNascimento[]>();
  for (const cria of comNinhada) {
    const chave = Math.min(cria.ninhada ?? 1, NINHADA_AGRUPADA);
    const lista = grupos.get(chave);
    if (lista) lista.push(cria);
    else grupos.set(chave, [cria]);
  }

  return [...grupos.entries()]
    .map(([tamanho, doGrupo]) => {
      const comPeso = doGrupo.filter(pesoUtilizavel);
      const mortas = doGrupo.filter((n) => n.data_obito !== null).length;
      return {
        tamanho,
        rotulo:
          tamanho >= NINHADA_AGRUPADA
            ? `${NINHADA_AGRUPADA} ou mais`
            : tamanho === 1
              ? 'Cria única'
              : `${tamanho} crias`,
        crias: doGrupo.length,
        partos: new Set(doGrupo.map((n) => `${n.mae_id}|${n.data_nascimento}`)).size,
        pesoMedio:
          comPeso.length > 0
            ? comPeso.reduce((acc, n) => acc + (n.peso_ao_nascer ?? 0), 0) / comPeso.length
            : null,
        comPeso: comPeso.length,
        mortalidade: doGrupo.length > 0 ? mortas / doGrupo.length : null,
      };
    })
    .sort((a, b) => a.tamanho - b.tamanho);
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribuições e séries
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaPeso {
  rotulo: string;
  crias: number;
  fracao: number | null;
}

const FAIXAS_PESO: { rotulo: string; de: number; ate: number | null }[] = [
  { rotulo: 'até 2,0 kg', de: 0, ate: 2 },
  { rotulo: '2,01 a 2,5', de: 2, ate: 2.5 },
  { rotulo: '2,51 a 3,0', de: 2.5, ate: 3 },
  { rotulo: '3,01 a 3,5', de: 3, ate: 3.5 },
  { rotulo: '3,51 a 4,0', de: 3.5, ate: 4 },
  { rotulo: 'acima de 4,0', de: 4, ate: null },
];

/**
 * Distribuição do peso ao nascer, na ordem da escala.
 *
 * A faixa "até 2,0 kg" é a que interessa em manejo: cria abaixo de 2 kg tem
 * risco alto e precisa de colostro assistido. Por isso ela é a primeira e não é
 * agrupada com nada.
 */
export function distribuicaoPeso(nascimentos: LinhaNascimento[]): FaixaPeso[] {
  const uteis = nascimentos.filter(pesoUtilizavel);
  const total = uteis.length;

  return FAIXAS_PESO.map((faixa) => {
    const quantas = uteis.filter((n) => {
      const peso = n.peso_ao_nascer ?? 0;
      return faixa.ate === null ? peso > faixa.de : peso > faixa.de && peso <= faixa.ate;
    }).length;
    return { rotulo: faixa.rotulo, crias: quantas, fracao: total > 0 ? quantas / total : null };
  });
}

/** Nascimentos por mês — a sazonalidade de parição, que manda no tanque cinco
 *  meses depois. */
export function serieNascimentos(nascimentos: LinhaNascimento[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const cria of nascimentos) {
    if (cria.data_nascimento === '') continue;
    const mes = cria.data_nascimento.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export interface MaeProlifica {
  mae_id: number;
  numero: string;
  nome: string | null;
  crias: number;
  partos: number;
  prolificidade: number;
}

/** As mães que mais entregaram cria no período — ordem TOTAL por crias e número. */
export function maesMaisProlificas(nascimentos: LinhaNascimento[], limite = 10): MaeProlifica[] {
  const porMae = new Map<number, LinhaNascimento[]>();
  for (const cria of nascimentos) {
    if (cria.mae_id === null) continue;
    const lista = porMae.get(cria.mae_id);
    if (lista) lista.push(cria);
    else porMae.set(cria.mae_id, [cria]);
  }

  return [...porMae.entries()]
    .map(([mae_id, crias]) => {
      const partos = new Set(crias.map((c) => c.data_nascimento)).size;
      return {
        mae_id,
        numero: crias[0].mae_numero ?? String(mae_id),
        nome: crias[0].mae_nome,
        crias: crias.length,
        partos,
        prolificidade: partos > 0 ? crias.length / partos : 0,
      };
    })
    .sort((a, b) => b.crias - a.crias || a.numero.localeCompare(b.numero, 'pt-BR'))
    .slice(0, limite);
}
