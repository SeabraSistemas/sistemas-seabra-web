import 'server-only';

import { VIEWS_LACTACAO, type LinhaLactacao } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * LACTAÇÕES — a leitura de `adm.lactacao_detalhe` e as regras da tela.
 *
 * A LACTAÇÃO É A UNIDADE ECONÔMICA DO REBANHO LEITEIRO: é ela que se compara
 * entre animais, entre ordens de parto e entre anos. O controle leiteiro mede um
 * dia, a produção diária mede o tanque; a lactação mede o que uma fêmea entregou
 * do parto à secagem.
 *
 * ESTA TELA VIVE DE DENOMINADOR, mais que as outras, porque o dado é heterogêneo
 * por natureza:
 *   · 1.500 lactações se declaram SINTÉTICAS e saem de tudo;
 *   · a procedência (DEFINITIVO / INFERIDO / ESTIMATIVA) muda o peso de qualquer
 *     média, e vai impressa ao lado dela;
 *   · lactação ABERTA ainda não acumulou — entra na contagem e fica fora da
 *     média de total, senão as que começaram esta semana puxam tudo para zero.
 */

const SQL_LACTACOES = 'supabase/adm/adm_15_lactacoes.sql';

const PROJECAO = {
  propriedade_id: true,
  lactacao_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  ordem_parto: true,
  data_inicio: true,
  data_encerramento: true,
  aberta: true,
  dias: true,
  total_leite: true,
  media_leite: true,
  confianca: true,
  metodo: true,
} satisfies Record<keyof LinhaLactacao, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarLactacoes(propriedadeId: number): Promise<Resultado<LinhaLactacao[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_LACTACAO.detalhe;
  const res = await paginarView(view, SQL_LACTACOES, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: várias lactações começam no mesmo dia (parto de lote), então
      // o id desempata — sem ele `range` repete e pula linha entre páginas.
      .order('data_inicio', { ascending: false })
      .order('lactacao_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraLactacao));
}

function paraLactacao(l: Linha): LinhaLactacao {
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    lactacao_id: Math.round(numeroDe(l.lactacao_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    ordem_parto: numeroDe(l.ordem_parto),
    data_inicio: textoDe(l.data_inicio) ?? '',
    data_encerramento: textoDe(l.data_encerramento),
    aberta: l.aberta === true,
    dias: numeroDe(l.dias),
    total_leite: numeroDe(l.total_leite),
    media_leite: numeroDe(l.media_leite),
    confianca: textoDe(l.confianca),
    metodo: textoDe(l.metodo),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Massa sintética — o lixo que se declara
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIANCA_SINTETICA = 'sintetico';

export interface SeparacaoLactacoes {
  reais: LinhaLactacao[];
  sinteticas: LinhaLactacao[];
}

/**
 * Tira as lactações que dizem de si mesmas que são teste.
 *
 * São 1.500 numa única propriedade, com `metodo = 'teste_paginacao_20260821'` —
 * alguém gerou massa para testar paginação e ela ficou. Diferente das datas no
 * futuro da produção diária (onde a suspeita é inferida), aqui o próprio dado se
 * declara: não há julgamento nenhum nesta linha, só obediência ao rótulo.
 */
export function separarSinteticas(lactacoes: LinhaLactacao[]): SeparacaoLactacoes {
  return {
    reais: lactacoes.filter((l) => l.confianca !== CONFIANCA_SINTETICA),
    sinteticas: lactacoes.filter((l) => l.confianca === CONFIANCA_SINTETICA),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Procedência — de onde veio cada número
// ─────────────────────────────────────────────────────────────────────────────

export type ChaveProcedencia = 'DEFINITIVO' | 'INFERIDO' | 'ESTIMATIVA' | 'nao_informado';

export interface Procedencia {
  chave: ChaveProcedencia;
  rotulo: string;
  detalhe: string;
  lactacoes: number;
  fracao: number | null;
}

const PROCEDENCIAS: { chave: ChaveProcedencia; rotulo: string; detalhe: string }[] = [
  {
    chave: 'DEFINITIVO',
    rotulo: 'Definitivo',
    detalhe: 'encerramento conhecido — parto seguinte ou secagem lançada',
  },
  {
    chave: 'INFERIDO',
    rotulo: 'Inferido',
    detalhe: 'o app deduziu o fim a partir da lacuna de lançamentos',
  },
  { chave: 'ESTIMATIVA', rotulo: 'Estimativa', detalhe: 'sem base para deduzir: valor arbitrado' },
  { chave: 'nao_informado', rotulo: 'Sem procedência', detalhe: 'lançamento antigo, antes do campo existir' },
];

/**
 * Como cada lactação chegou ao número que mostra.
 *
 * NÃO É METADADO DE CURIOSO: uma média de "312 L por lactação" em que 24% das
 * lactações tiveram o fim INFERIDO pelo app é uma afirmação mais fraca do que a
 * mesma média toda definitiva. Sem este bloco ao lado, a tela dá o mesmo peso
 * às duas — e é assim que uma estimativa vira argumento de consultoria.
 */
export function procedencias(lactacoes: LinhaLactacao[]): Procedencia[] {
  const total = lactacoes.length;
  return PROCEDENCIAS.map((p) => {
    const quantas = lactacoes.filter((l) => (l.confianca ?? 'nao_informado') === p.chave).length;
    return { ...p, lactacoes: quantas, fracao: total > 0 ? quantas / total : null };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoLactacoes {
  total: number;
  abertas: number;
  encerradas: number;
  /** Média de dias das lactações ENCERRADAS com duração positiva. */
  duracaoMedia: number | null;
  comDuracao: number;
  /** Média de litros das lactações encerradas que produziram algo. */
  totalMedio: number | null;
  comTotal: number;
  /** Média de litros/dia (media_leite), sobre quem tem o campo. */
  mediaDiaria: number | null;
  /** Fração de lactações com procedência DEFINITIVO. */
  fracaoDefinitiva: number | null;
  /** Duração ≥ 600 dias: impossível como lactação, é erro de fechamento. */
  duracaoImplausivel: number;
}

/** Acima disso não é lactação, é lactação que ninguém fechou: 600 dias são vinte
 *  meses. A base tem 119 casos, um deles com 3.593 dias. */
export const DURACAO_IMPLAUSIVEL = 600;

export function resumoLactacoes(lactacoes: LinhaLactacao[]): ResumoLactacoes {
  const encerradas = lactacoes.filter((l) => !l.aberta);

  // Duração só das ENCERRADAS e positivas: a aberta tem duração em curso (ou
  // zero, quando começou ontem), e misturá-la puxaria a média para baixo
  // dizendo que as lactações da fazenda estão encurtando.
  const comDuracao = encerradas.filter(
    (l) => l.dias !== null && l.dias > 0 && l.dias < DURACAO_IMPLAUSIVEL,
  );

  // Total só de quem PRODUZIU: 1.756 lactações têm total 0, quase sempre porque
  // acabaram de começar. Zero não é "produziu zero", é "ainda não acumulou".
  const comTotal = encerradas.filter((l) => l.total_leite !== null && l.total_leite > 0);
  const comMedia = lactacoes.filter((l) => l.media_leite !== null && l.media_leite > 0);
  const definitivas = lactacoes.filter((l) => l.confianca === 'DEFINITIVO').length;

  return {
    total: lactacoes.length,
    abertas: lactacoes.filter((l) => l.aberta).length,
    encerradas: encerradas.length,
    duracaoMedia:
      comDuracao.length > 0
        ? comDuracao.reduce((acc, l) => acc + (l.dias ?? 0), 0) / comDuracao.length
        : null,
    comDuracao: comDuracao.length,
    totalMedio:
      comTotal.length > 0
        ? comTotal.reduce((acc, l) => acc + (l.total_leite ?? 0), 0) / comTotal.length
        : null,
    comTotal: comTotal.length,
    mediaDiaria:
      comMedia.length > 0
        ? comMedia.reduce((acc, l) => acc + (l.media_leite ?? 0), 0) / comMedia.length
        : null,
    fracaoDefinitiva: lactacoes.length > 0 ? definitivas / lactacoes.length : null,
    duracaoImplausivel: lactacoes.filter((l) => (l.dias ?? 0) >= DURACAO_IMPLAUSIVEL).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribuição de duração
// ─────────────────────────────────────────────────────────────────────────────

export interface FaixaDuracao {
  rotulo: string;
  lactacoes: number;
  fracao: number | null;
}

/**
 * As faixas de duração, na ordem da escala.
 *
 * O CORTE DOS 305 DIAS não é arbitrário: é a lactação-padrão da zootecnia
 * leiteira, a régua com que se compara qualquer fêmea. Faixas abaixo dela são
 * lactação curta (problema de manejo, doença ou secagem antecipada); acima, é
 * fêmea persistente — o traço que se quer na matriz.
 */
const FAIXAS_DURACAO: { rotulo: string; de: number; ate: number | null }[] = [
  { rotulo: 'até 90 dias', de: 1, ate: 90 },
  { rotulo: '91 a 150', de: 91, ate: 150 },
  { rotulo: '151 a 210', de: 151, ate: 210 },
  { rotulo: '211 a 270', de: 211, ate: 270 },
  { rotulo: '271 a 305', de: 271, ate: 305 },
  { rotulo: 'acima de 305', de: 306, ate: null },
];

export function distribuicaoDuracao(lactacoes: LinhaLactacao[]): FaixaDuracao[] {
  const uteis = lactacoes.filter(
    (l) => !l.aberta && l.dias !== null && l.dias > 0 && l.dias < DURACAO_IMPLAUSIVEL,
  );
  const total = uteis.length;

  return FAIXAS_DURACAO.map((faixa) => {
    const quantas = uteis.filter((l) => {
      const dias = l.dias ?? 0;
      return faixa.ate === null ? dias >= faixa.de : dias >= faixa.de && dias <= faixa.ate;
    }).length;
    return { rotulo: faixa.rotulo, lactacoes: quantas, fracao: total > 0 ? quantas / total : null };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Por ordem de parto
// ─────────────────────────────────────────────────────────────────────────────

export interface OrdemParto {
  rotulo: string;
  ordem: number;
  lactacoes: number;
  duracaoMedia: number | null;
  totalMedio: number | null;
  mediaDiaria: number | null;
}

/** Da 4ª em diante vira um grupo só: o número de lactações por ordem cai rápido,
 *  e uma linha de "9ª cria" com duas lactações não é comparação, é ruído. */
export const ORDEM_AGRUPADA = 4;

/**
 * A comparação clássica: primeira cria contra as seguintes.
 *
 * A primípara produz menos e por menos tempo — é biologia, não problema. O que
 * o consultor lê aqui é OUTRA coisa: se a 2ª e a 3ª cria não sobem em relação à
 * 1ª, o rebanho não está expressando potencial (nutrição, sanidade ou genética),
 * e isso não aparece em nenhuma média geral.
 */
export function porOrdemParto(lactacoes: LinhaLactacao[]): OrdemParto[] {
  const encerradas = lactacoes.filter((l) => !l.aberta && l.ordem_parto !== null && l.ordem_parto > 0);

  const grupos = new Map<number, LinhaLactacao[]>();
  for (const lactacao of encerradas) {
    const ordem = Math.min(lactacao.ordem_parto ?? 0, ORDEM_AGRUPADA);
    const lista = grupos.get(ordem);
    if (lista) lista.push(lactacao);
    else grupos.set(ordem, [lactacao]);
  }

  return [...grupos.entries()]
    .map(([ordem, doGrupo]) => {
      const comDuracao = doGrupo.filter(
        (l) => l.dias !== null && l.dias > 0 && l.dias < DURACAO_IMPLAUSIVEL,
      );
      const comTotal = doGrupo.filter((l) => l.total_leite !== null && l.total_leite > 0);
      const comMedia = doGrupo.filter((l) => l.media_leite !== null && l.media_leite > 0);

      return {
        ordem,
        rotulo: ordem >= ORDEM_AGRUPADA ? `${ORDEM_AGRUPADA}ª ou mais` : `${ordem}ª cria`,
        lactacoes: doGrupo.length,
        duracaoMedia:
          comDuracao.length > 0
            ? comDuracao.reduce((acc, l) => acc + (l.dias ?? 0), 0) / comDuracao.length
            : null,
        totalMedio:
          comTotal.length > 0
            ? comTotal.reduce((acc, l) => acc + (l.total_leite ?? 0), 0) / comTotal.length
            : null,
        mediaDiaria:
          comMedia.length > 0
            ? comMedia.reduce((acc, l) => acc + (l.media_leite ?? 0), 0) / comMedia.length
            : null,
      };
    })
    .sort((a, b) => a.ordem - b.ordem);
}

// ─────────────────────────────────────────────────────────────────────────────
// Ranking e série
// ─────────────────────────────────────────────────────────────────────────────

export const RANKING_LIMITE = 15;

/**
 * As maiores lactações encerradas.
 *
 * EXIGE DURAÇÃO PLAUSÍVEL, e não só total > 0 — foi um bug pego no dado real:
 * sem esse filtro o pódio da fazenda 244 vinha com 4.900 L em 1.125 dias e
 * 3.943 L em 1.192 dias. Não são recordes, são lactações que ninguém fechou
 * acumulando por três anos. Encabeçando o ranking, elas empurram para fora a
 * fêmea que realmente produziu muito em uma lactação — que é a pergunta.
 *
 * Ordem TOTAL: total e, no empate, o número do animal.
 */
export function melhoresLactacoes(
  lactacoes: LinhaLactacao[],
  limite: number = RANKING_LIMITE,
): LinhaLactacao[] {
  return lactacoes
    .filter(
      (l) =>
        !l.aberta &&
        l.total_leite !== null &&
        l.total_leite > 0 &&
        l.dias !== null &&
        l.dias > 0 &&
        l.dias < DURACAO_IMPLAUSIVEL,
    )
    .sort(
      (a, b) =>
        (b.total_leite ?? 0) - (a.total_leite ?? 0) ||
        a.numero_animal.localeCompare(b.numero_animal, 'pt-BR'),
    )
    .slice(0, limite);
}

/** Lactações INICIADAS por mês — a curva de partos vista pelo lado do leite. */
export function serieInicios(lactacoes: LinhaLactacao[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const lactacao of lactacoes) {
    if (lactacao.data_inicio === '') continue;
    const mes = lactacao.data_inicio.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
