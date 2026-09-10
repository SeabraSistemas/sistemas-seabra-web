import 'server-only';

import { VIEWS_AML, type LinhaAml } from '@/lib/adm/areas/contrato';
import { numeroDe, paginarView, textoDe, type Consulta, type Linha } from '@/lib/adm/areas/leitura';
import { admClient, semConfigSupabase } from '@/lib/adm/supabase-admin';
import { ok, type PontoSerie, type Resultado } from '@/lib/adm/types';

/**
 * AML — a leitura de `adm.aml_detalhe` e as regras da tela de avaliação
 * morfológica.
 *
 * ⚠️ A DECISÃO MAIS IMPORTANTE DESTE MÓDULO É O QUE ELE **NÃO** FAZ: não existe
 * aqui nenhuma função de "pontos fortes e fracos".
 *
 * A tentação é óbvia — ordenar as 16 médias e chamar as menores de fraqueza. Só
 * que escore linear é DESCRITIVO, não hierárquico: o 9 de "profundidade de
 * úbere" quer dizer úbere profundo, e úbere profundo é DEFEITO (encosta no chão,
 * suja, machuca), enquanto o 9 de "mobilidade" é virtude. Sem uma tabela de
 * ideal por característica — que não existe no banco — ordenar as médias produz
 * um ranking com cara de diagnóstico e conteúdo de sorteio.
 *
 * O que a tela mostra no lugar: o PERFIL (média de cada ponto, com o denominador
 * de cada um) e a DISPERSÃO (desvio padrão), que diz algo verdadeiro sem
 * precisar de ideal — rebanho desigual naquela característica. E a pontuação
 * total, que é a única nota composta em que maior É melhor.
 */

const SQL_AML = 'supabase/adm/adm_16_aml.sql';

const PROJECAO = {
  propriedade_id: true,
  aml_id: true,
  animal_id: true,
  numero_animal: true,
  nome_animal: true,
  sexo: true,
  data_avaliacao: true,
  tecnico_id: true,
  tipo: true,
  pontuacao_total: true,
  p1_mobilidade: true,
  p2_largura_peito: true,
  p3_profundidade_corporal: true,
  p4_angulo_garupa: true,
  p6_membros_lateral: true,
  p8_capacidade: true,
  p9_largura_garupa: true,
  p15_membros_anterior: true,
  p16_estrutura_ossea: true,
  p5_profundidade_ubere: true,
  p7_ligamento_anterior: true,
  p10_ligamento_posterior: true,
  p11_volume_ubere: true,
  p12_ligamento_suspensorio: true,
  p13_posicao_tetos: true,
  p14_diametro_tetos: true,
} satisfies Record<keyof LinhaAml, true>;

const SELECT = Object.keys(PROJECAO).join(',');

// ─────────────────────────────────────────────────────────────────────────────
// Os 16 pontos, com rótulo e grupo
// ─────────────────────────────────────────────────────────────────────────────

export type GrupoPonto = 'corpo' | 'ubere';

export interface PontoAml {
  chave: keyof LinhaAml;
  numero: number;
  rotulo: string;
  grupo: GrupoPonto;
}

/**
 * Na ordem oficial da ficha (1 a 16), e não agrupada por corpo/úbere: é a ordem
 * em que o avaliador preenche e a que o criador reconhece no papel.
 */
export const PONTOS_AML: PontoAml[] = [
  { chave: 'p1_mobilidade', numero: 1, rotulo: 'Mobilidade', grupo: 'corpo' },
  { chave: 'p2_largura_peito', numero: 2, rotulo: 'Largura de peito', grupo: 'corpo' },
  { chave: 'p3_profundidade_corporal', numero: 3, rotulo: 'Profundidade corporal', grupo: 'corpo' },
  { chave: 'p4_angulo_garupa', numero: 4, rotulo: 'Ângulo de garupa', grupo: 'corpo' },
  { chave: 'p5_profundidade_ubere', numero: 5, rotulo: 'Profundidade de úbere', grupo: 'ubere' },
  { chave: 'p6_membros_lateral', numero: 6, rotulo: 'Membros posteriores (lateral)', grupo: 'corpo' },
  { chave: 'p7_ligamento_anterior', numero: 7, rotulo: 'Ligamento anterior de úbere', grupo: 'ubere' },
  { chave: 'p8_capacidade', numero: 8, rotulo: 'Capacidade', grupo: 'corpo' },
  { chave: 'p9_largura_garupa', numero: 9, rotulo: 'Largura de garupa', grupo: 'corpo' },
  { chave: 'p10_ligamento_posterior', numero: 10, rotulo: 'Ligamento posterior de úbere', grupo: 'ubere' },
  { chave: 'p11_volume_ubere', numero: 11, rotulo: 'Volume de úbere', grupo: 'ubere' },
  { chave: 'p12_ligamento_suspensorio', numero: 12, rotulo: 'Ligamento suspensório médio', grupo: 'ubere' },
  { chave: 'p13_posicao_tetos', numero: 13, rotulo: 'Posição de tetos', grupo: 'ubere' },
  { chave: 'p14_diametro_tetos', numero: 14, rotulo: 'Diâmetro de tetos', grupo: 'ubere' },
  { chave: 'p15_membros_anterior', numero: 15, rotulo: 'Membros posteriores (anterior)', grupo: 'corpo' },
  { chave: 'p16_estrutura_ossea', numero: 16, rotulo: 'Estrutura óssea', grupo: 'corpo' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Leitura
// ─────────────────────────────────────────────────────────────────────────────

export async function listarAmls(propriedadeId: number): Promise<Resultado<LinhaAml[]>> {
  const supa = admClient();
  if (!supa) return semConfigSupabase();

  const view = VIEWS_AML.detalhe;
  const res = await paginarView(view, SQL_AML, (de, ate) =>
    (supa.from(view).select(SELECT).eq('propriedade_id', propriedadeId) as unknown as Consulta)
      // Ordem TOTAL: uma visita avalia dezenas de animais no mesmo dia, então o
      // id desempata — sem ele `range` repete e pula linha entre páginas.
      .order('data_avaliacao', { ascending: false })
      .order('aml_id', { ascending: false })
      .range(de, ate),
  );
  if (!res.ok) return res;
  return ok(res.dados.map(paraAml));
}

function paraAml(l: Linha): LinhaAml {
  const ponto = (chave: string) => numeroDe(l[chave]);
  return {
    propriedade_id: Math.round(numeroDe(l.propriedade_id) ?? 0),
    aml_id: Math.round(numeroDe(l.aml_id) ?? 0),
    animal_id: Math.round(numeroDe(l.animal_id) ?? 0),
    numero_animal: textoDe(l.numero_animal) ?? '—',
    nome_animal: textoDe(l.nome_animal),
    sexo: textoDe(l.sexo),
    data_avaliacao: textoDe(l.data_avaliacao) ?? '',
    tecnico_id: numeroDe(l.tecnico_id),
    tipo: textoDe(l.tipo),
    pontuacao_total: numeroDe(l.pontuacao_total),
    p1_mobilidade: ponto('p1_mobilidade'),
    p2_largura_peito: ponto('p2_largura_peito'),
    p3_profundidade_corporal: ponto('p3_profundidade_corporal'),
    p4_angulo_garupa: ponto('p4_angulo_garupa'),
    p6_membros_lateral: ponto('p6_membros_lateral'),
    p8_capacidade: ponto('p8_capacidade'),
    p9_largura_garupa: ponto('p9_largura_garupa'),
    p15_membros_anterior: ponto('p15_membros_anterior'),
    p16_estrutura_ossea: ponto('p16_estrutura_ossea'),
    p5_profundidade_ubere: ponto('p5_profundidade_ubere'),
    p7_ligamento_anterior: ponto('p7_ligamento_anterior'),
    p10_ligamento_posterior: ponto('p10_ligamento_posterior'),
    p11_volume_ubere: ponto('p11_volume_ubere'),
    p12_ligamento_suspensorio: ponto('p12_ligamento_suspensorio'),
    p13_posicao_tetos: ponto('p13_posicao_tetos'),
    p14_diametro_tetos: ponto('p14_diametro_tetos'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipo — a coluna que precisa de faxina antes de agrupar
// ─────────────────────────────────────────────────────────────────────────────

export type TipoAml = 'fêmea' | 'macho' | 'outro';

/**
 * Normaliza `tipo`.
 *
 * A coluna tem 'fêmea' (90 linhas) E 'femea' (74) — o MESMO valor escrito de
 * dois jeitos. Agrupar sem normalizar parte as fêmeas em dois grupos e faz cada
 * metade parecer uma amostra pequena. Também há 'Padrão' e 'linear', que não são
 * sexo nenhum: viram 'outro' em vez de forçar um sexo que a ficha não afirma.
 */
export function normalizarTipo(tipo: string | null): TipoAml {
  const limpo = (tipo ?? '')
    .trim()
    .toLowerCase()
    // Tira o acento pela decomposição Unicode: 'fêmea' e 'femea' viram a mesma
    // string sem depender de uma lista de grafias.
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (limpo.startsWith('femea')) return 'fêmea';
  if (limpo.startsWith('macho')) return 'macho';
  return 'outro';
}

// ─────────────────────────────────────────────────────────────────────────────
// Perfil dos 16 pontos
// ─────────────────────────────────────────────────────────────────────────────

export interface MediaPonto {
  numero: number;
  rotulo: string;
  grupo: GrupoPonto;
  media: number | null;
  /** Quantas avaliações trouxeram ESTE ponto — cada um tem o seu denominador. */
  medicoes: number;
  /** Desvio padrão populacional. null com menos de duas medições. */
  desvio: number | null;
}

/**
 * A média de cada ponto, cada um com o SEU denominador.
 *
 * Os sete pontos de úbere não existem em macho — não é dado faltando, é ausência
 * do órgão. Dividi-los pelo total de avaliações daria uma média correta na conta
 * e errada na pergunta ("o úbere médio do rebanho", incluindo bodes). Por isso o
 * denominador é por ponto, e ele vai para a tela junto do número.
 */
export function mediasPorPonto(amls: LinhaAml[]): MediaPonto[] {
  return PONTOS_AML.map((ponto) => {
    const valores = amls
      .map((a) => a[ponto.chave])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

    if (valores.length === 0) {
      return { numero: ponto.numero, rotulo: ponto.rotulo, grupo: ponto.grupo, media: null, medicoes: 0, desvio: null };
    }

    const media = valores.reduce((acc, v) => acc + v, 0) / valores.length;
    const desvio =
      valores.length > 1
        ? Math.sqrt(valores.reduce((acc, v) => acc + (v - media) ** 2, 0) / valores.length)
        : null;

    return {
      numero: ponto.numero,
      rotulo: ponto.rotulo,
      grupo: ponto.grupo,
      media,
      medicoes: valores.length,
      desvio,
    };
  });
}

/**
 * Os pontos em que o rebanho é mais DESIGUAL (maior desvio).
 *
 * É a única leitura de ranking honesta sobre escore linear sem tabela de ideal:
 * não diz que a característica está boa ou ruim, diz que os animais discordam
 * entre si nela — que é onde a seleção tem material para trabalhar.
 */
export function pontosMaisDesiguais(medias: MediaPonto[], limite = 5): MediaPonto[] {
  return medias
    .filter((m) => m.desvio !== null)
    .sort((a, b) => (b.desvio ?? 0) - (a.desvio ?? 0) || a.numero - b.numero)
    .slice(0, limite);
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo, faixas e ranking
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumoAml {
  avaliacoes: number;
  animais: number;
  femeas: number;
  machos: number;
  pontuacaoMedia: number | null;
  comPontuacao: number;
  melhor: LinhaAml | null;
  pior: LinhaAml | null;
  primeira: string | null;
  ultima: string | null;
  /** Animais avaliados mais de uma vez — dá para ver evolução neles. */
  reavaliados: number;
}

export function resumoAml(amls: LinhaAml[]): ResumoAml {
  const comPontuacao = amls.filter((a) => a.pontuacao_total !== null);
  const porAnimal = new Map<number, number>();
  for (const aml of amls) porAnimal.set(aml.animal_id, (porAnimal.get(aml.animal_id) ?? 0) + 1);

  const datas = amls.map((a) => a.data_avaliacao).filter((d) => d !== '').sort();

  return {
    avaliacoes: amls.length,
    animais: porAnimal.size,
    femeas: amls.filter((a) => normalizarTipo(a.tipo) === 'fêmea').length,
    machos: amls.filter((a) => normalizarTipo(a.tipo) === 'macho').length,
    pontuacaoMedia:
      comPontuacao.length > 0
        ? comPontuacao.reduce((acc, a) => acc + (a.pontuacao_total ?? 0), 0) / comPontuacao.length
        : null,
    comPontuacao: comPontuacao.length,
    melhor:
      comPontuacao.length > 0
        ? comPontuacao.reduce((m, a) => ((a.pontuacao_total ?? 0) > (m.pontuacao_total ?? 0) ? a : m))
        : null,
    pior:
      comPontuacao.length > 0
        ? comPontuacao.reduce((m, a) => ((a.pontuacao_total ?? 0) < (m.pontuacao_total ?? 0) ? a : m))
        : null,
    primeira: datas[0] ?? null,
    ultima: datas[datas.length - 1] ?? null,
    reavaliados: [...porAnimal.values()].filter((n) => n > 1).length,
  };
}

export interface FaixaPontuacao {
  rotulo: string;
  avaliacoes: number;
  fracao: number | null;
}

/**
 * As faixas da pontuação total. AQUI ordenar faz sentido — ao contrário dos
 * pontos linerares, `pontuacao_total` é nota composta, e 90 é melhor que 40.
 */
const FAIXAS_PONTUACAO: { rotulo: string; de: number; ate: number | null }[] = [
  { rotulo: 'abaixo de 60', de: 0, ate: 59.999 },
  { rotulo: '60 a 69', de: 60, ate: 69.999 },
  { rotulo: '70 a 79', de: 70, ate: 79.999 },
  { rotulo: '80 a 89', de: 80, ate: 89.999 },
  { rotulo: '90 ou mais', de: 90, ate: null },
];

export function faixasDePontuacao(amls: LinhaAml[]): FaixaPontuacao[] {
  const comNota = amls.filter((a) => a.pontuacao_total !== null);
  const total = comNota.length;

  return FAIXAS_PONTUACAO.map((faixa) => {
    const quantas = comNota.filter((a) => {
      const nota = a.pontuacao_total ?? 0;
      return faixa.ate === null ? nota >= faixa.de : nota >= faixa.de && nota <= faixa.ate;
    }).length;
    return { rotulo: faixa.rotulo, avaliacoes: quantas, fracao: total > 0 ? quantas / total : null };
  });
}

export const RANKING_LIMITE = 15;

/** Ordem TOTAL: nota e, no empate, o número do animal. */
export function melhoresAmls(amls: LinhaAml[], limite: number = RANKING_LIMITE): LinhaAml[] {
  return amls
    .filter((a) => a.pontuacao_total !== null)
    .sort(
      (a, b) =>
        (b.pontuacao_total ?? 0) - (a.pontuacao_total ?? 0) ||
        a.numero_animal.localeCompare(b.numero_animal, 'pt-BR'),
    )
    .slice(0, limite);
}

/** Avaliações por mês — mostra se a AML é rotina ou evento isolado. */
export function serieAvaliacoes(amls: LinhaAml[]): PontoSerie[] {
  const contagem = new Map<string, number>();
  for (const aml of amls) {
    if (aml.data_avaliacao === '') continue;
    const mes = aml.data_avaliacao.slice(0, 7);
    contagem.set(mes, (contagem.get(mes) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([periodo, valor]) => ({ periodo, valor }))
    .sort((a, b) => a.periodo.localeCompare(b.periodo));
}
