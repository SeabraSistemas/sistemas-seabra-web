import 'server-only';

import { VIEWS_SERVICO, type LinhaServico } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * SERVIÇO REPRODUTIVO — a leitura de `adm.servico_reprodutivo` e as regras da
 * tela que responde a pergunta reprodutiva mais cara: QUAL REPRODUTOR EMPRENHA.
 *
 * ⚠️ TRÊS DECISÕES QUE ORGANIZAM O MÓDULO:
 *
 *   1. O denominador da taxa de concepção são os serviços COM DESFECHO
 *      CONHECIDO. Serviço recente (ainda gestando ou aguardando DG) e serviço
 *      antigo sem informação nenhuma não entram — nem como sucesso, nem como
 *      falha. Contá-los como falha puniria o reprodutor que trabalhou este mês.
 *
 *   2. "Concebeu" é parto OU aborto OU DG positivo. O aborto conta como
 *      concepção de propósito: a fêmea emprenhou — o que falhou foi a gestação,
 *      e isso é sanidade, não fertilidade do reprodutor.
 *
 *   3. Serviço com dois reprodutores no mesmo cio NÃO entra no ranking por
 *      reprodutor: a paternidade é ambígua, e creditar a qualquer um dos dois
 *      seria inventar.
 *
 * Toda função recebe `hoje` quando precisa decidir se o serviço ainda está em
 * andamento — nada de relógio dentro do cálculo.
 */

const SQL_SERVICOS = 'supabase/adm/adm_26_servicos.sql';

const PROJECAO = {
  propriedade_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  ordem_parto: true,
  data_servico: true,
  metodo: true,
  reprodutor: true,
  reprodutores_no_servico: true,
  coberturas: true,
  proximo_servico: true,
  dias_ate_proximo_servico: true,
  data_dg: true,
  resultado_dg: true,
  dias_ate_dg: true,
  data_parto: true,
  data_aborto: true,
  categoria_pos_aborto: true,
} satisfies Record<keyof LinhaServico, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarServicos(propriedadeId: number): Promise<Resultado<LinhaServico[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_SERVICO.detalhe;
  const res = await paginarView(view, SQL_SERVICOS, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: (animal, data_servico) é única — serviços da mesma fêmea
      // estão a mais de 3 dias um do outro por construção da view.
      .order('data_servico', { ascending: false })
      .order('animal_id', { ascending: true })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraServico));
}

function paraServico(l: Linha): LinhaServico {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    ordem_parto: numeroDe(l.ordem_parto),
    data_servico: textoDe(l.data_servico) ?? '',
    metodo: textoDe(l.metodo),
    reprodutor: textoDe(l.reprodutor),
    reprodutores_no_servico: Math.round(numeroDe(l.reprodutores_no_servico) ?? 1),
    coberturas: Math.round(numeroDe(l.coberturas) ?? 1),
    proximo_servico: textoDe(l.proximo_servico),
    dias_ate_proximo_servico: numeroDe(l.dias_ate_proximo_servico),
    data_dg: textoDe(l.data_dg),
    resultado_dg: textoDe(l.resultado_dg),
    dias_ate_dg: numeroDe(l.dias_ate_dg),
    data_parto: textoDe(l.data_parto),
    data_aborto: textoDe(l.data_aborto),
    categoria_pos_aborto: textoDe(l.categoria_pos_aborto),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Desfecho — a regra que decide o que cada serviço conta
// ─────────────────────────────────────────────────────────────────────────────

export type Desfecho =
  | 'pariu'
  | 'abortou'
  | 'gestante'
  | 'vazia'
  | 'retornou_cio'
  | 'aguardando'
  | 'sem_informacao';

/** O ciclo estral caprino é de ~21 dias: novo serviço nessa janela é a fêmea
 *  que voltou ao cio — o serviço anterior falhou. */
export const RETORNO_CIO = { de: 18, ate: 25 } as const;

/** Até aqui depois do serviço a fêmea ainda pode parir dele (gestação ~150 d). */
export const JANELA_GESTACAO = 170;

/**
 * A partir daqui a gestação caprina está A TERMO. "Aborto" lançado depois disso
 * é parto — quase sempre cria morta ao nascer registrada como aborto. Metade
 * dos abortos da base (23 de 46) cai aqui, então misturá-los com a perda
 * gestacional de verdade dobraria a taxa de aborto e mandaria o consultor atrás
 * de uma doença que é, na verdade, um hábito de lançamento.
 */
export const TERMO_GESTACAO = 145;

const UM_DIA_MS = 86_400_000;

function diasDesde(iso: string, hoje: Date): number {
  return Math.floor((hoje.getTime() - Date.parse(`${iso}T00:00:00Z`)) / UM_DIA_MS);
}

/**
 * O desfecho de um serviço, em ORDEM DE PRIORIDADE — o evento mais conclusivo
 * vence: parto > aborto > DG positivo > DG negativo > retorno ao cio.
 *
 * Os dois últimos estados são "não sei", e são DIFERENTES entre si:
 *   · 'aguardando'     — serviço recente, ainda dentro da janela de gestação:
 *                        pode parir. É o normal para o serviço deste mês.
 *   · 'sem_informacao' — serviço antigo sem DG, sem parto e sem retorno: o
 *                        desfecho aconteceu e ninguém lançou.
 */
export function desfechoDe(servico: LinhaServico, hoje: Date): Desfecho {
  if (servico.data_parto) return 'pariu';
  if (servico.data_aborto) return 'abortou';
  if (servico.resultado_dg === 'gestante') return 'gestante';
  if (servico.resultado_dg === 'vazia') return 'vazia';

  const dias = servico.dias_ate_proximo_servico;
  if (dias !== null && dias >= RETORNO_CIO.de && dias <= RETORNO_CIO.ate) return 'retornou_cio';

  if (servico.data_servico !== '' && diasDesde(servico.data_servico, hoje) <= JANELA_GESTACAO) {
    return 'aguardando';
  }
  return 'sem_informacao';
}

/**
 * Concebeu? true, false — ou null quando não se sabe.
 *
 * O aborto é concepção de propósito: a fêmea EMPRENHOU; o que falhou foi a
 * gestação, e isso é sanidade, não fertilidade do reprodutor. Contar aborto como
 * falha de concepção jogaria no reprodutor a culpa de uma brucelose.
 */
export function concebeu(desfecho: Desfecho): boolean | null {
  if (desfecho === 'pariu' || desfecho === 'abortou' || desfecho === 'gestante') return true;
  if (desfecho === 'vazia' || desfecho === 'retornou_cio') return false;
  return null;
}

export const ROTULO_DESFECHO: Record<Desfecho, string> = {
  pariu: 'Pariu',
  abortou: 'Aborto lançado',
  gestante: 'DG positivo, sem parto ainda',
  vazia: 'DG negativo',
  retornou_cio: 'Voltou ao cio',
  aguardando: 'Aguardando — serviço recente',
  sem_informacao: 'Sem informação — serviço antigo',
};

export const ORDEM_DESFECHOS: Desfecho[] = [
  'pariu',
  'abortou',
  'gestante',
  'vazia',
  'retornou_cio',
  'aguardando',
  'sem_informacao',
];

// ─────────────────────────────────────────────────────────────────────────────
// Taxa de concepção — com o denominador na mão
// ─────────────────────────────────────────────────────────────────────────────

export interface Taxa {
  /** Serviços com desfecho CONHECIDO — o denominador. */
  comDesfecho: number;
  concebeu: number;
  /** concebeu ÷ comDesfecho. null sem nenhum desfecho conhecido. */
  taxa: number | null;
}

function taxaDe(servicos: LinhaServico[], hoje: Date): Taxa {
  let comDesfecho = 0;
  let concebeuN = 0;
  for (const servico of servicos) {
    const resultado = concebeu(desfechoDe(servico, hoje));
    if (resultado === null) continue;
    comDesfecho += 1;
    if (resultado) concebeuN += 1;
  }
  return { comDesfecho, concebeu: concebeuN, taxa: comDesfecho > 0 ? concebeuN / comDesfecho : null };
}

export interface ResumoServicos extends Taxa {
  servicos: number;
  coberturas: number;
  femeas: number;
  /** Serviços com mais de uma cobertura no mesmo cio. */
  servicosMultiplos: number;
  /** Serviços realizados para cada concepção. null sem concepção. */
  servicosPorConcepcao: number | null;
  retornosCio: number;
  /** Serviços cujo desfecho é um aborto lançado — inclui os lançados a termo. */
  abortos: number;
  /** Dos abortos, os lançados com ≥ TERMO_GESTACAO dias: parto, não aborto. */
  abortosATermo: number;
  /** Abortos ANTES do termo ÷ concepções — perda gestacional, não falha de
   *  cobertura. Os lançados a termo ficam fora: são natimortos. */
  taxaAborto: number | null;
  aguardando: number;
  semInformacao: number;
  paternidadeAmbigua: number;
  diasAteDgMedio: number | null;
  comDg: number;
}

export function resumoServicos(servicos: LinhaServico[], hoje: Date): ResumoServicos {
  const taxa = taxaDe(servicos, hoje);
  const desfechos = servicos.map((s) => desfechoDe(s, hoje));
  const abortos = desfechos.filter((d) => d === 'abortou').length;
  const abortosATermo = listaDeAbortos(servicos).filter((a) => a.aTermo).length;
  const comDg = servicos.filter((s) => s.dias_ate_dg !== null && s.dias_ate_dg >= 0);

  return {
    ...taxa,
    servicos: servicos.length,
    coberturas: servicos.reduce((acc, s) => acc + s.coberturas, 0),
    femeas: new Set(servicos.map((s) => s.animal_id)).size,
    servicosMultiplos: servicos.filter((s) => s.coberturas > 1).length,
    servicosPorConcepcao: taxa.concebeu > 0 ? taxa.comDesfecho / taxa.concebeu : null,
    retornosCio: desfechos.filter((d) => d === 'retornou_cio').length,
    abortos,
    abortosATermo,
    taxaAborto: taxa.concebeu > 0 ? (abortos - abortosATermo) / taxa.concebeu : null,
    aguardando: desfechos.filter((d) => d === 'aguardando').length,
    semInformacao: desfechos.filter((d) => d === 'sem_informacao').length,
    paternidadeAmbigua: servicos.filter((s) => s.reprodutores_no_servico > 1).length,
    diasAteDgMedio:
      comDg.length > 0 ? comDg.reduce((acc, s) => acc + (s.dias_ate_dg ?? 0), 0) / comDg.length : null,
    comDg: comDg.length,
  };
}

export interface ContagemDesfecho {
  desfecho: Desfecho;
  rotulo: string;
  servicos: number;
  fracao: number | null;
  /** true / false / null — para a tela pintar sucesso, falha e "não sei". */
  concebeu: boolean | null;
}

export function distribuicaoDesfechos(servicos: LinhaServico[], hoje: Date): ContagemDesfecho[] {
  const total = servicos.length;
  const contagem = new Map<Desfecho, number>();
  for (const servico of servicos) {
    const d = desfechoDe(servico, hoje);
    contagem.set(d, (contagem.get(d) ?? 0) + 1);
  }
  return ORDEM_DESFECHOS.map((desfecho) => {
    const n = contagem.get(desfecho) ?? 0;
    return {
      desfecho,
      rotulo: ROTULO_DESFECHO[desfecho],
      servicos: n,
      fracao: total > 0 ? n / total : null,
      concebeu: concebeu(desfecho),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Por reprodutor — a entrega central
// ─────────────────────────────────────────────────────────────────────────────

export interface Reprodutor extends Taxa {
  reprodutor: string;
  metodo: string;
  servicos: number;
  femeas: number;
}

/** Abaixo disso a taxa do reprodutor é anedota: 2 de 2 dá 100% e não diz nada. */
export const MINIMO_POR_REPRODUTOR = 5;

/**
 * Taxa de concepção POR REPRODUTOR (bode ou sêmen).
 *
 * Serviço com dois reprodutores no mesmo cio fica FORA — a paternidade é
 * ambígua, e creditar a um dos dois seria inventar. Serviço sem reprodutor
 * identificado também.
 *
 * A ordem é por VOLUME de serviços, não pela taxa: o bode com 3 serviços e 100%
 * não é o melhor do rebanho, é o que menos trabalhou. A taxa vai na linha, com
 * o denominador, e abaixo de `MINIMO_POR_REPRODUTOR` desfechos a tela não a
 * publica como percentual.
 */
export function porReprodutor(servicos: LinhaServico[], hoje: Date): Reprodutor[] {
  const grupos = new Map<string, LinhaServico[]>();
  for (const servico of servicos) {
    if (servico.reprodutores_no_servico > 1) continue;
    const chave = servico.reprodutor?.trim();
    if (!chave) continue;
    const lista = grupos.get(chave);
    if (lista) lista.push(servico);
    else grupos.set(chave, [servico]);
  }

  return [...grupos.entries()]
    .map(([reprodutor, doGrupo]) => {
      const metodos = new Map<string, number>();
      for (const s of doGrupo) {
        const m = s.metodo ?? '—';
        metodos.set(m, (metodos.get(m) ?? 0) + 1);
      }
      const metodo = [...metodos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
      return {
        reprodutor,
        metodo,
        servicos: doGrupo.length,
        femeas: new Set(doGrupo.map((s) => s.animal_id)).size,
        ...taxaDe(doGrupo, hoje),
      };
    })
    .sort((a, b) => b.servicos - a.servicos || a.reprodutor.localeCompare(b.reprodutor, 'pt-BR'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Por método e por ordem de parto
// ─────────────────────────────────────────────────────────────────────────────

export interface GrupoTaxa extends Taxa {
  rotulo: string;
  servicos: number;
}

export function porMetodo(servicos: LinhaServico[], hoje: Date): GrupoTaxa[] {
  const grupos = new Map<string, LinhaServico[]>();
  for (const servico of servicos) {
    const chave = servico.metodo ?? 'Não informado';
    const lista = grupos.get(chave);
    if (lista) lista.push(servico);
    else grupos.set(chave, [servico]);
  }
  return [...grupos.entries()]
    .map(([rotulo, doGrupo]) => ({ rotulo, servicos: doGrupo.length, ...taxaDe(doGrupo, hoje) }))
    .sort((a, b) => b.servicos - a.servicos || a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
}

/**
 * Concepção por ordem de parto — nulípara, primípara e multípara emprenham
 * diferente. A nulípara (ordem 0) é a cabrita na primeira cobertura, e é o
 * grupo onde falha de desenvolvimento aparece antes de qualquer outro número.
 */
export function porOrdemParto(servicos: LinhaServico[], hoje: Date): GrupoTaxa[] {
  const faixas: { rotulo: string; teste: (o: number) => boolean }[] = [
    { rotulo: 'Nulípara (1ª cobertura)', teste: (o) => o === 0 },
    { rotulo: 'Primípara', teste: (o) => o === 1 },
    { rotulo: '2ª ou 3ª cria', teste: (o) => o === 2 || o === 3 },
    { rotulo: '4ª cria ou mais', teste: (o) => o >= 4 },
  ];

  return faixas
    .map((faixa) => {
      const doGrupo = servicos.filter((s) => s.ordem_parto !== null && faixa.teste(s.ordem_parto));
      return { rotulo: faixa.rotulo, servicos: doGrupo.length, ...taxaDe(doGrupo, hoje) };
    })
    .filter((g) => g.servicos > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Série e abortos
// ─────────────────────────────────────────────────────────────────────────────

export function serieServicos(servicos: LinhaServico[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const servico of servicos) {
    if (servico.data_servico === '') continue;
    const mes = servico.data_servico.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export interface Aborto {
  animal_id: number;
  numero: string;
  nome: string | null;
  data_servico: string;
  data_aborto: string;
  /** Dias de gestação no aborto — o momento diz a causa provável. */
  diasGestacao: number;
  /** ≥ TERMO_GESTACAO: é parto a termo lançado como aborto, não perda gestacional. */
  aTermo: boolean;
  reprodutor: string | null;
  categoria_pos_aborto: string | null;
}

/**
 * Os abortos, com a IDADE DA GESTAÇÃO em que aconteceram.
 *
 * O momento é o que aponta a causa: aborto no terço final costuma ser infeccioso
 * (clamídia, toxoplasma, brucela), enquanto perda precoce aponta nutrição ou
 * estresse. Uma lista de abortos sem o dia da gestação não serve para essa
 * conversa.
 *
 * A lista é a MESMA população do desfecho 'abortou': serviço com parto
 * registrado sai, ainda que tenha um aborto lançado na janela (o parto é o
 * evento mais conclusivo — ver `desfechoDe`). Assim o card e a tabela contam
 * as mesmas fêmeas.
 */
export function listaDeAbortos(servicos: LinhaServico[]): Aborto[] {
  return servicos
    .filter((s) => s.data_aborto !== null && s.data_parto === null && s.data_servico !== '')
    .map((s) => {
      const diasGestacao = Math.floor(
        (Date.parse(`${s.data_aborto}T00:00:00Z`) - Date.parse(`${s.data_servico}T00:00:00Z`)) /
          UM_DIA_MS,
      );
      return {
        animal_id: s.animal_id,
        numero: s.numero_animal,
        nome: s.nome_animal,
        data_servico: s.data_servico,
        data_aborto: s.data_aborto as string,
        diasGestacao,
        aTermo: diasGestacao >= TERMO_GESTACAO,
        reprodutor: s.reprodutor,
        categoria_pos_aborto: s.categoria_pos_aborto,
      };
    })
    .sort((a, b) => b.data_aborto.localeCompare(a.data_aborto));
}
