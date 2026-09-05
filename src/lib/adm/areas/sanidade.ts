import 'server-only';

import { VIEWS_FASE_2, type LinhaSanidade } from '@/lib/adm/areas/contrato';
import { fundirFatias, fundirSerie } from '@/lib/adm/metricas';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { erro, ok, semConfig, type FatiaDistribuicao, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * Leitura da aba Sanidade — casos clínicos, óbitos, FAMACHA e escore corporal.
 *
 * O NOME DA VIEW NÃO É DIGITADO AQUI: vem de `VIEWS_FASE_2.sanidade`, em
 * areas/contrato.ts. Ver o cabeçalho daquele arquivo para o incidente que criou
 * a regra — dez views consumidas, seis criadas, o build passando e as telas em
 * branco.
 *
 * ⚠️ A ARMADILHA DESTA ÁREA É A TABELA `manejo`, e ela não dá erro nenhum.
 *
 * Não existe tabela `descarte` no banco do app. Descarte é uma linha de `manejo`
 * cujo array `tipo_manejo` contém 'descarte' (um trigger inativa o animal).
 * Consequência prática, e é ela que o painel precisa explicar em voz alta:
 *
 *   · `manejos_12m` EXCLUI as linhas de descarte. Contar sem filtrar mistura
 *     baixa de animal com manejo sanitário e infla o card em até um terço nos
 *     criadores que descartam muito — um número que parece bom e é outra coisa.
 *
 *   · `famacha_medio`, `escore_corporal_medio` e `distribuicao_famacha` INCLUEM
 *     as linhas de descarte, de propósito. Uma linha de descarte que trouxe
 *     FAMACHA trouxe uma medição real feita naquele animal, e a média é sobre
 *     MEDIÇÕES, não sobre eventos. Excluí-las descartaria dado de verdade.
 *
 * As duas regras são opostas e as duas estão certas — por isso a tela imprime
 * qual vale em cada card. É o tipo de detalhe que decide se o consultor confia
 * ou desconfia do número.
 *
 * ⚠️ FAMACHA É UMA ESCALA INVERTIDA: 1 é o animal saudável e 5 é o anêmico
 * grave (o cartão mede a coloração da mucosa ocular na verminose). Média SUBINDO
 * é notícia ruim. Nenhum componente genérico sabe disso, então `subirEhBom` e a
 * leitura da distribuição precisam ser declarados na tela.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Projeção — conferida contra o contrato em tempo de compilação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `satisfies Record<keyof LinhaSanidade, true>` é a rede: esquecer uma coluna aqui
 * vira erro de `tsc`, não zero na tela.
 *
 * Por que isso importa mais do que parece — com `select('*')`, uma coluna
 * renomeada na view faz o PostgREST devolver a linha SEM a chave; `inteiro(
 * undefined)` dá 0, e a tela afirma "0 óbitos em 12 meses" para um criador que tem. Com
 * projeção explícita o mesmo erro vira HTTP 400 e a tela mostra a falha.
 */
const PROJECAO = {
  propriedade_id: true,
  casos_12m: true,
  animais_tratados_12m: true,
  obitos_12m: true,
  taxa_mortalidade: true,
  famacha_medio: true,
  escore_corporal_medio: true,
  manejos_12m: true,
  sessoes_coletivas_12m: true,
  obitos_mensais: true,
  distribuicao_famacha: true,
  principais_suspeitas: true,
} satisfies Record<keyof LinhaSanidade, true>;

/** Nunca `select('*')`: a projeção explícita é o que impede uma coluna nova da
 *  view de entrar no payload RSC sem ninguém ter decidido que ela pode. */
const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulário da área
// ─────────────────────────────────────────────────────────────────────────────

/** Os cinco graus do cartão FAMACHA, na ordem da escala. */
export const GRAUS_FAMACHA = [1, 2, 3, 4, 5] as const;

/**
 * A partir de 4 o animal está anêmico e o protocolo pede tratamento — é o corte
 * que transforma a distribuição em lista de ação em vez de gráfico bonito.
 */
export const FAMACHA_CRITICO = 4;

/** Uma raia da escala FAMACHA, já com o peso dela no total de medições. */
export interface GrauFamacha {
  grau: number;
  rotulo: string;
  medicoes: number;
  /** Fração do total de medições. null quando não houve nenhuma. */
  fracao: number | null;
  /** grau >= FAMACHA_CRITICO: anemia que pede tratamento. */
  critico: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plumbing local de leitura
//
// DUPLICAÇÃO DELIBERADA, gêmea da de areas/reproducao.ts: `umaLinha()` e
// `falha()` são privados de queries.ts (não exportados) e este módulo não pode
// editá-lo. Se um TERCEIRO módulo de área precisar do mesmo, é hora de promover
// isto para `src/lib/adm/areas/leitura.ts` — não de fazer a terceira cópia.
// ─────────────────────────────────────────────────────────────────────────────

type Linha = Record<string, unknown>;
type ErroPostgrest = { message: string; code?: string };

/** Códigos de "o banco não está preparado" — mesmo conjunto de queries.ts. */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

const SQL_AREAS = 'supabase/adm/adm_07_areas.sql';

function falhaDaArea<T>(view: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode ${SQL_AREAS} no Supabase e ` +
        'confirme que o schema "adm" está em Settings → API → Exposed schemas.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

async function lerLinhaDaArea(view: string, propriedadeId: number): Promise<Resultado<Linha | null>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const { data, error } = (await supa
    .from(view)
    .select(SELECT)
    .eq('propriedade_id', propriedadeId)
    .limit(1)) as { data: Linha[] | null; error: ErroPostgrest | null };

  if (error) return falhaDaArea<Linha | null>(view, error);
  return ok(data?.[0] ?? null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Coerção
// ─────────────────────────────────────────────────────────────────────────────

function numero(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  // `numeric` do Postgres pode chegar como string; sem este ramo o FAMACHA médio
  // vira null em silêncio e a tela mostra "—" para um criador que mede todo mês.
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inteiro(v: unknown): number {
  return Math.round(numero(v) ?? 0);
}

function texto(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

function objetos(v: unknown): Linha[] | null {
  if (!Array.isArray(v)) return null;
  return v.filter((item): item is Linha => typeof item === 'object' && item !== null);
}

function fatias(v: unknown): FatiaDistribuicao[] | null {
  const linhas = objetos(v);
  if (!linhas) return null;
  return linhas.map((l) => ({ rotulo: texto(l.rotulo) ?? 'Não informado', valor: numero(l.valor) ?? 0 }));
}

function serie(v: unknown): PontoSerie[] | null {
  const linhas = objetos(v);
  if (!linhas) return null;
  return linhas
    .map((l) => ({ periodo: texto(l.periodo) ?? '', valor: numero(l.valor) ?? 0 }))
    .filter((p) => p.periodo !== '')
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

/** Propriedade sem linha na view — vazio, não quebrado. */
export function sanidadeVazia(propriedadeId: number): LinhaSanidade {
  return {
    propriedade_id: propriedadeId,
    casos_12m: 0,
    animais_tratados_12m: 0,
    obitos_12m: 0,
    taxa_mortalidade: null,
    famacha_medio: null,
    escore_corporal_medio: null,
    manejos_12m: 0,
    sessoes_coletivas_12m: 0,
    obitos_mensais: null,
    distribuicao_famacha: null,
    principais_suspeitas: null,
  };
}

export async function getSanidade(propriedadeId: number): Promise<Resultado<LinhaSanidade>> {
  const res = await lerLinhaDaArea(VIEWS_FASE_2.sanidade, propriedadeId);
  if (!res.ok) return res;
  const l = res.dados;
  if (!l) return ok(sanidadeVazia(propriedadeId));

  return ok({
    propriedade_id: inteiro(l.propriedade_id) || propriedadeId,
    casos_12m: inteiro(l.casos_12m),
    animais_tratados_12m: inteiro(l.animais_tratados_12m),
    obitos_12m: inteiro(l.obitos_12m),
    // `numero()` e não `inteiro()`: 0% de mortalidade é excelente notícia e "—"
    // é ausência de rebanho. Colapsar os dois em 0 apaga a diferença.
    taxa_mortalidade: numero(l.taxa_mortalidade),
    famacha_medio: numero(l.famacha_medio),
    escore_corporal_medio: numero(l.escore_corporal_medio),
    manejos_12m: inteiro(l.manejos_12m),
    sessoes_coletivas_12m: inteiro(l.sessoes_coletivas_12m),
    obitos_mensais: serie(l.obitos_mensais),
    distribuicao_famacha: fatias(l.distribuicao_famacha),
    principais_suspeitas: fatias(l.principais_suspeitas),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Derivações para a tela
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A escala FAMACHA em ORDEM DE GRAU, sempre com os cinco degraus.
 *
 * A ordem vem daqui e não do jsonb pelo mesmo motivo que o funil da Reprodução:
 * <DistribuicaoBarras> ordena do maior para o menor — é um ranking, e faz bem o
 * que faz. Só que FAMACHA é uma escala ORDINAL: reordenada por volume ela deixa
 * de dizer "o rebanho está concentrado nos graus 1 e 2" e passa a dizer apenas
 * "o grau 2 é o mais comum", que é a informação menos útil das duas.
 *
 * O grau com zero medição continua na lista. Um gráfico que esconde o grau 5
 * vazio mente sobre a escala: o leitor não sabe se ninguém está anêmico ou se a
 * barra simplesmente não coube.
 */
export function escalaFamacha(linha: LinhaSanidade): GrauFamacha[] {
  const contagem = new Map((linha.distribuicao_famacha ?? []).map((f) => [f.rotulo.trim(), f.valor]));
  const total = medicoesFamacha(linha);

  return GRAUS_FAMACHA.map((grau) => {
    const medicoes = contagem.get(String(grau)) ?? 0;
    return {
      grau,
      rotulo: String(grau),
      medicoes,
      fracao: total > 0 ? medicoes / total : null,
      critico: grau >= FAMACHA_CRITICO,
    };
  });
}

/**
 * Total de medições de FAMACHA nos 12 meses — o denominador da distribuição.
 *
 * É um número de confiança, não de enfeite: "FAMACHA médio 2,1" sobre 3 medições
 * e sobre 900 medições são afirmações de forças completamente diferentes, e sem
 * o denominador as duas aparecem iguais na tela.
 */
export function medicoesFamacha(linha: LinhaSanidade): number {
  return (linha.distribuicao_famacha ?? []).reduce((acc, f) => acc + f.valor, 0);
}

/** Medições em grau 4 ou 5 — os animais que o protocolo manda tratar. */
export function medicoesCriticas(linha: LinhaSanidade): number {
  return escalaFamacha(linha)
    .filter((g) => g.critico)
    .reduce((acc, g) => acc + g.medicoes, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Consolidação de várias propriedades
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Funde N propriedades numa linha só: **soma contagem, anula média** — a regra
 * de `consolidarVisoes()`. Média de médias não é a média do conjunto e não é o
 * número de nenhuma fazenda.
 *
 * DUAS DECISÕES QUE PARECEM INCONSISTENTES E NÃO SÃO:
 *
 * · FAMACHA médio É recalculado. A view entrega o HISTOGRAMA completo
 *   (`distribuicao_famacha`) sobre exatamente a mesma população da média — mesmo
 *   `manejo`, mesma janela de 12 meses, mesmo filtro `entre 1 e 5`. Somando os
 *   histogramas e tirando Σ(grau × medições) ÷ Σmedições, o resultado é a média
 *   VERDADEIRA do conjunto, não uma média de médias. É o mesmo raciocínio que
 *   deixa `consolidarVisoes()` recalcular a média por dia a partir da série já
 *   fundida.
 *
 * · Taxa de mortalidade NÃO é recalculada, e nem tentada. O denominador dela
 *   (o efetivo vivo) não é projetado pelo contrato. Recuperá-lo por
 *   `óbitos ÷ taxa` só funciona onde houve óbito — e a fazenda com ZERO óbito,
 *   que é justamente a que deveria puxar a taxa do conjunto para baixo, sairia
 *   inteira do denominador. O erro seria unidirecional: mortalidade consolidada
 *   sempre alta demais, num número que vira argumento de consultoria. Fica null,
 *   com a explicação ao lado.
 *
 * Escore corporal também fica null: não há histograma dele no contrato.
 */
export function consolidarSanidade(linhas: LinhaSanidade[]): LinhaSanidade {
  if (linhas.length === 0) return sanidadeVazia(0);
  if (linhas.length === 1) return linhas[0];

  const soma = (pegar: (l: LinhaSanidade) => number) => linhas.reduce((acc, l) => acc + pegar(l), 0);

  // Histograma fundido: os rótulos são '1'..'5' em todas as linhas, então
  // fundirFatias() soma grau a grau. A ordem de saída não importa — quem ordena
  // a escala na tela é escalaFamacha().
  const histogramas = linhas.flatMap((l) => l.distribuicao_famacha ?? []);
  const famacha = histogramas.length > 0 ? fundirFatias(histogramas) : null;

  let famachaMedio: number | null = null;
  if (famacha) {
    let medicoes = 0;
    let ponderada = 0;
    for (const fatia of famacha) {
      const grau = Number(fatia.rotulo.trim());
      if (!Number.isFinite(grau)) continue;
      medicoes += fatia.valor;
      ponderada += grau * fatia.valor;
    }
    famachaMedio = medicoes > 0 ? ponderada / medicoes : null;
  }

  // Principais suspeitas: cada propriedade já veio com o TOP 8 dela, então o
  // consolidado é aproximado por construção — uma suspeita que ficasse em 9º em
  // todas as fazendas poderia, somada, valer mais que a 8ª daqui. É aceitável
  // num ranking de leitura; a contagem exata está na tabela `clinica` abaixo.
  const suspeitas = linhas.flatMap((l) => l.principais_suspeitas ?? []);
  const principais =
    suspeitas.length > 0
      ? fundirFatias(suspeitas)
          .sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
          .slice(0, 8)
      : null;

  const obitos = linhas.flatMap((l) => l.obitos_mensais ?? []);

  return {
    // Zero, e não o id da primeira fazenda: um objeto que soma 15 propriedades
    // carregando o id de uma delas é o bug `{...visoes[0]}` da revisão da Fase 1.
    propriedade_id: 0,
    casos_12m: soma((l) => l.casos_12m),
    // Aproximação assumida: o mesmo animal não existe em duas propriedades, então
    // somar "animais distintos tratados" entre fazendas não conta ninguém duas
    // vezes. Só valeria se o escopo repetisse propriedade — e idsDoEscopo() não
    // repete.
    animais_tratados_12m: soma((l) => l.animais_tratados_12m),
    obitos_12m: soma((l) => l.obitos_12m),
    taxa_mortalidade: null,
    famacha_medio: famachaMedio,
    escore_corporal_medio: null,
    manejos_12m: soma((l) => l.manejos_12m),
    sessoes_coletivas_12m: soma((l) => l.sessoes_coletivas_12m),
    obitos_mensais: obitos.length > 0 ? fundirSerie(obitos) : null,
    distribuicao_famacha: famacha,
    principais_suspeitas: principais,
  };
}
