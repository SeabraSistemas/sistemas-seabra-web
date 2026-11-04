/**
 * BOVINOS DE CORTE — peso à desmama padronizado (P210), do dado ao modelo.
 *
 * O desenho é o do relatório de corte (reports/Avaliação genética de bovinos
 * de corte.md), e cada escolha diz de onde vem:
 *
 *   característica  peso aos 210 dias, a idade-padrão da ABCZ (CDP 2023, arts.
 *                   20–25), com pesagens entre 150 e 270 dias. A fórmula da
 *                   ABCZ é PC210 = PN + G·210, G = GMD do nascimento à
 *                   pesagem mais próxima de 210 dias. O peso ao nascer existe
 *                   em menos de 1% dos bezerros no app (04/11/2026), então a
 *                   padronização é, nesta ordem: (1) interpolação linear entre
 *                   as duas pesagens da janela que cercam os 210 dias (o mesmo
 *                   G, só que medido em volta de 210 em vez de desde o
 *                   nascimento); (2) a fórmula da ABCZ quando há peso ao
 *                   nascer; (3) extrapolação com o ganho entre as duas
 *                   pesagens mais próximas, do mesmo lado; (4) fora, com o
 *                   motivo. Nada de peso ao nascer "médio da raça": o app não
 *                   tem a tabela, e inventá-la seria afirmar um número.
 *   contemporâneos  fazenda × ano × estação do nascimento × sexo × lote do dia
 *                   da pesagem usada (o manejo). Grupo com menos de 5 sai
 *                   (Londoño-Gil et al. 2025 e Pereira 2024, no relatório).
 *   idade da vaca   não é ajustada: a tabela do BIF não se transfere ao
 *                   Nelore e os programas brasileiros não publicam fatores
 *                   (relatório, "Antes do modelo"). Fica escrito na tela.
 *   modelo          modelo animal com o AMBIENTE COMUM DA MÃE (Mrode et al.
 *                   2023, Exemplo 5.2): y = GC + a + c_mãe + e. É o direto-
 *                   materno do relatório com o efeito materno genético e o de
 *                   ambiente permanente materno juntos num só c — o app não
 *                   tem pedigree de mães suficiente para separá-los, e a
 *                   covariância direto-materna é "o parâmetro mais frágil".
 *   parâmetros      h² direta 0,24 (Giannotti 2004, meta-análise de zebuínos)
 *                   e a sensibilidade ±1τ, 0,15 e 0,33, que o próprio relatório
 *                   manda rodar. c² = r − h²/4, com r = 0,33, a repetibilidade
 *                   do peso à desmama de Nelore a pasto (Souza et al. 1994):
 *                   dois bezerros da mesma vaca são meios-irmãos maternos, e
 *                   cov = ¼σ²a + σ²c. A MPPA da vaca usa 0,20, 0,33 e 0,51,
 *                   as três hipóteses da tabela do relatório.
 *   pai incerto     só ~23% dos bovinos têm pai no app. Sem pai, o bezerro
 *                   entra com a mãe só (A⁻¹ com um pai: d = ¾); o touro sem
 *                   filhos identificados não é avaliado, e o diagnóstico diz
 *                   quantos bezerros estão assim e quantos têm "pais
 *                   candidatos" (monta com vários touros) que o modelo NÃO usa.
 *   validação       para cada vaca com 2+ bezerros, o último (pela data de
 *                   nascimento) é o alvo: os modelos, ajustados sem ele,
 *                   preveem o desvio dele; o BLUP prevê ½â_pai + ½â_mãe +
 *                   ĉ_mãe, a MPPA a capacidade da vaca.
 *
 * Função pura: recebe as linhas das views adm.melhoramento_bovino_* traduzidas.
 */

import { modeloRepetibilidade, type RegistroRepetibilidade } from '@/lib/melhoramento/blup';
import { distribuicaoDeTamanhos, desviosDasContemporaneas, type DistribuicaoGrupos } from '@/lib/melhoramento/contemporaneas';
import { resumirEndogamia, type ResumoEndogamia, type TomConclusao } from '@/lib/melhoramento/diagnostico';
import { fator_mppa } from '@/lib/melhoramento/indices';
import { media } from '@/lib/melhoramento/numerico';
import {
  listarProblemasPedigree,
  montarPedigree,
  podarPedigree,
  type PedigreeMontado,
  type ProblemaListado,
} from '@/lib/melhoramento/parentesco';
import type { ModeloInfo } from '@/lib/melhoramento/tipos';
import { metricasValidacao, vencedorDaValidacao } from '@/lib/melhoramento/validacao';
import type { LinhaRanking, RankingModelo, ValidacaoCaracteristica } from '@/lib/melhoramento/analise';
import type { ResumoBlup } from '@/lib/melhoramento/modelos';

// ─────────────────────────────────────────────────────────────────────────────
// Entrada e configuração
// ─────────────────────────────────────────────────────────────────────────────

/** Um animal de corte, como sai de adm.melhoramento_bovino_animal. */
export interface AnimalCorteEntrada {
  animalId: number;
  propriedadeId: number;
  /** 'macho' | 'femea' | null */
  sexo: string | null;
  nascimento: string | null;
  paiId: number | null;
  maeId: number | null;
  numero: string | null;
  nome: string | null;
  apenasGenealogia: boolean;
  /** Peso ao nascer: da ficha, ou do parto quando a ficha não tem. */
  pesoNascer: number | null;
  /** 'iatf' | 'te' | 'monta' | null */
  origemPrenhez: string | null;
  /** Possíveis pais da monta com vários touros (animal_pai_candidato_bovino). */
  paisCandidatos: number;
}

/** Uma pesagem entre 150 e 270 dias, como sai de adm.melhoramento_bovino_pesagem. */
export interface PesagemCorteEntrada {
  pesagemId: number;
  animalId: number;
  /** 'YYYY-MM-DD' */
  data: string;
  pesoKg: number;
  idadeDias: number;
  loteId: number | null;
}

export interface ParCorte {
  h2: number;
  c2: number;
  fonte: string;
}

export interface ConfigCorte {
  idadePadrao: number;
  janela: [number, number];
  tamanhoMinimoGrupo: number;
  /** Gestação (dias) para a validação do pedigree. */
  gestacaoDias: number;
  blup: ParCorte[];
  rMppa: number[];
  fonteMppa: string;
  limiteDenso: number;
  minimoVencedor: number;
  minimoValidacao: number;
  tamanhoRanking: number;
  /** Abaixo disto (P210 aproveitáveis), nenhum modelo roda. */
  registrosMinimos: number;
}

/** Repetibilidade do peso à desmama de Nelore a pasto (Souza et al. 1994), base do c². */
export const R_DESMAMA = 0.33;

function parCorte(h2: number, fonte: string): ParCorte {
  return { h2, c2: Math.round((R_DESMAMA - h2 / 4) * 1e6) / 1e6, fonte };
}

export const CONFIG_CORTE: ConfigCorte = {
  idadePadrao: 210,
  janela: [150, 270],
  tamanhoMinimoGrupo: 5,
  // 285 dias: o valor inicial de public.parametros_reproducao_bovino (comentário da tabela).
  gestacaoDias: 285,
  blup: [
    parCorte(0.24, 'corte: h² direta da meta-análise de zebuínos (Giannotti 2004); c² = 0,33 − h²/4'),
    parCorte(0.15, 'corte: limite inferior de sensibilidade (−1τ, Giannotti 2004) que o relatório manda rodar'),
    parCorte(0.33, 'corte: limite superior de sensibilidade (+1τ, Giannotti 2004) que o relatório manda rodar'),
  ],
  rMppa: [0.2, 0.33, 0.51],
  fonteMppa: 'corte: 0,33 (Nelore a pasto, Souza et al. 1994), 0,51 (Nova Zelândia, Weik et al. 2021) e 0,20 (limite inferior do relatório)',
  limiteDenso: 300,
  minimoVencedor: 30,
  minimoValidacao: 10,
  tamanhoRanking: 30,
  registrosMinimos: 30,
};

function dec(x: number): string {
  return x.toFixed(2).replace('.', ',');
}

export function chaveBlupCorte(p: ParCorte): string {
  return `blup_h2${p.h2}_c${p.c2}`;
}

export function modelosCorte(c: ConfigCorte): ModeloInfo[] {
  const lista: ModeloInfo[] = [
    {
      chave: 'desvio_gc',
      familia: 'desvio_gc',
      rotulo: 'Desvio das contemporâneas',
      h2: null,
      r: null,
      valorRanking: 'o desvio do próprio bezerro (ou a média dos bezerros, para touro e vaca), sem encolhimento',
      previsao: 'a média dos desvios dos outros bezerros da vaca',
    },
  ];
  for (const r of c.rMppa) {
    lista.push({
      chave: `mppa_r${r}`,
      familia: 'mppa',
      rotulo: `MPPA da vaca (r ${dec(r)})`,
      h2: null,
      r,
      valorRanking: 'capacidade mais provável de produção da vaca pelos desvios dos bezerros',
      previsao: 'a MPPA da vaca',
    });
  }
  for (const p of c.blup) {
    lista.push({
      chave: chaveBlupCorte(p),
      familia: 'blup',
      rotulo: `BLUP animal + ambiente da mãe (h² ${dec(p.h2)}, c² ${dec(p.c2)})`,
      h2: p.h2,
      r: R_DESMAMA,
      valorRanking: 'EBV do modelo animal (GC fixo, A⁻¹ com o pai quando há, ambiente comum da mãe); vaca: ½â + ĉ',
      previsao: '½â do pai + ½â da mãe + ĉ da mãe',
    });
  }
  return lista;
}

// ─────────────────────────────────────────────────────────────────────────────
// Padronização do peso aos 210 dias
// ─────────────────────────────────────────────────────────────────────────────

export type MetodoP210 = 'interpolacao' | 'abcz_pn' | 'extrapolacao';

export const ROTULO_METODO_P210: Record<MetodoP210, string> = {
  interpolacao: 'interpolação entre as pesagens que cercam 210 dias',
  abcz_pn: 'fórmula da ABCZ com o peso ao nascer',
  extrapolacao: 'extrapolação pelo ganho entre duas pesagens do mesmo lado',
};

export type MotivoExclusaoCorte =
  | 'apenas_genealogia'
  | 'sem_nascimento'
  | 'sem_sexo'
  | 'sem_pesagem_janela'
  | 'uma_pesagem_sem_pn'
  | 'ganho_incoerente'
  | 'grupo_pequeno';

export const MOTIVOS_CORTE: MotivoExclusaoCorte[] = [
  'apenas_genealogia',
  'sem_nascimento',
  'sem_sexo',
  'sem_pesagem_janela',
  'uma_pesagem_sem_pn',
  'ganho_incoerente',
  'grupo_pequeno',
];

export const ROTULO_MOTIVO_CORTE: Record<MotivoExclusaoCorte, string> = {
  apenas_genealogia: 'só genealogia (não está no rebanho)',
  sem_nascimento: 'sem data de nascimento',
  sem_sexo: 'sem sexo',
  sem_pesagem_janela: 'sem pesagem entre 150 e 270 dias',
  uma_pesagem_sem_pn: 'uma pesagem só e sem peso ao nascer',
  ganho_incoerente: 'ganho zero ou negativo entre pesagens',
  grupo_pequeno: 'em grupo de contemporâneos pequeno',
};

export type ResultadoP210 =
  | { ok: true; p210: number; metodo: MetodoP210; pesagem: PesagemCorteEntrada }
  | { ok: false; motivo: 'sem_pesagem_janela' | 'uma_pesagem_sem_pn' | 'ganho_incoerente' };

/**
 * O peso aos `idade` dias de UM animal. `pesagem` é a de referência (a mais
 * próxima da idade-padrão): o lote dela entra no grupo de contemporâneos.
 */
export function padronizarP210(
  pesagens: readonly PesagemCorteEntrada[],
  pesoNascer: number | null,
  config: Pick<ConfigCorte, 'idadePadrao' | 'janela'> = CONFIG_CORTE,
): ResultadoP210 {
  const T = config.idadePadrao;
  const ps = pesagens
    .filter((p) => p.idadeDias >= config.janela[0] && p.idadeDias <= config.janela[1] && p.pesoKg > 0)
    .sort((a, b) => a.idadeDias - b.idadeDias || a.pesagemId - b.pesagemId);
  if (ps.length === 0) return { ok: false, motivo: 'sem_pesagem_janela' };
  const maisPerto = [...ps].sort(
    (a, b) => Math.abs(a.idadeDias - T) - Math.abs(b.idadeDias - T) || a.idadeDias - b.idadeDias || a.pesagemId - b.pesagemId,
  );
  const ref = maisPerto[0];
  if (ref.idadeDias === T) return { ok: true, p210: ref.pesoKg, metodo: 'interpolacao', pesagem: ref };
  const antes = ps.filter((p) => p.idadeDias < T).pop();
  const depois = ps.find((p) => p.idadeDias > T);
  if (antes && depois) {
    const g = (depois.pesoKg - antes.pesoKg) / (depois.idadeDias - antes.idadeDias);
    if (!(g > 0)) return { ok: false, motivo: 'ganho_incoerente' };
    return { ok: true, p210: antes.pesoKg + g * (T - antes.idadeDias), metodo: 'interpolacao', pesagem: ref };
  }
  if (pesoNascer != null && pesoNascer > 0) {
    const g = (ref.pesoKg - pesoNascer) / ref.idadeDias;
    if (!(g > 0)) return { ok: false, motivo: 'ganho_incoerente' };
    return { ok: true, p210: pesoNascer + g * T, metodo: 'abcz_pn', pesagem: ref };
  }
  if (ps.length >= 2) {
    const [a, b] = [maisPerto[0], maisPerto.find((p) => p.idadeDias !== maisPerto[0].idadeDias)];
    if (!b) return { ok: false, motivo: 'uma_pesagem_sem_pn' };
    const g = (b.pesoKg - a.pesoKg) / (b.idadeDias - a.idadeDias);
    if (!(g > 0)) return { ok: false, motivo: 'ganho_incoerente' };
    return { ok: true, p210: a.pesoKg + g * (T - a.idadeDias), metodo: 'extrapolacao', pesagem: ref };
  }
  return { ok: false, motivo: 'uma_pesagem_sem_pn' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Grupos de contemporâneos e registros
// ─────────────────────────────────────────────────────────────────────────────

const ESTACAO = ['verao', 'verao', 'outono', 'outono', 'outono', 'inverno', 'inverno', 'inverno', 'primavera', 'primavera', 'primavera', 'verao'];

/** Estação do NASCIMENTO (hemisfério sul) e o ano dela (dezembro conta no verão seguinte). */
export function estacaoDeNascimento(data: string): { ano: number; estacao: string } {
  const ano = Number(data.slice(0, 4));
  const mes = Number(data.slice(5, 7));
  return { ano: mes === 12 ? ano + 1 : ano, estacao: ESTACAO[mes - 1] };
}

export function chaveGrupoCorte(
  propriedadeId: number,
  nascimento: string,
  sexo: 'macho' | 'femea',
  loteId: number | null,
): string {
  const { ano, estacao } = estacaoDeNascimento(nascimento);
  return `${propriedadeId}|${ano}|${estacao}|${sexo}|${loteId ?? 'sem_lote'}`;
}

/** '740|2024|verao|macho|55' → 'verão de 2024 · machos · lote 55'. */
export function rotuloGrupoCorte(chave: string): string {
  const [, ano, estacao, sexo, lote] = chave.split('|');
  const est = estacao === 'verao' ? 'verão' : estacao;
  return `${est} de ${ano} · ${sexo === 'macho' ? 'machos' : 'fêmeas'} · ${lote === 'sem_lote' ? 'sem lote' : `lote ${lote}`}`;
}

export interface RegistroCorte {
  animalId: number;
  maeId: number | null;
  paiId: number | null;
  nascimento: string;
  grupo: string;
  y: number;
  metodo: MetodoP210;
}

export interface PreparacaoCorte {
  registros: RegistroCorte[];
  excluidos: Record<MotivoExclusaoCorte, number>;
  metodos: Record<MetodoP210, number>;
  gruposAntesDoCorte: DistribuicaoGrupos;
  grupos: Map<string, number>;
  /** Animais com pesagem na janela (candidatos), antes de qualquer filtro de sexo e grupo. */
  bezerrosNaJanela: number;
  /** Registros cujo lote é "sem lote". */
  semLote: number;
}

function sexoCorte(s: string | null): 'macho' | 'femea' | null {
  const t = (s ?? '').trim().toLowerCase();
  if (t.startsWith('m')) return 'macho';
  if (t.startsWith('f')) return 'femea';
  return null;
}

/**
 * Ordem dos filtros (cada animal cai no primeiro que o pega): só genealogia,
 * sem nascimento, sem sexo, sem pesagem na janela, uma pesagem sem peso ao
 * nascer, ganho incoerente e, por último, grupo pequeno. Só entra quem é
 * DESTA fazenda (o animal de outra fazenda pode estar no pedigree, nunca nos
 * registros).
 */
export function prepararCorte(
  propriedadeId: number,
  animais: readonly AnimalCorteEntrada[],
  pesagens: readonly PesagemCorteEntrada[],
  config: ConfigCorte = CONFIG_CORTE,
): PreparacaoCorte {
  const porAnimal = new Map<number, PesagemCorteEntrada[]>();
  for (const p of pesagens) {
    const l = porAnimal.get(p.animalId);
    if (l) l.push(p);
    else porAnimal.set(p.animalId, [p]);
  }
  const excluidos: Record<MotivoExclusaoCorte, number> = {
    apenas_genealogia: 0,
    sem_nascimento: 0,
    sem_sexo: 0,
    sem_pesagem_janela: 0,
    uma_pesagem_sem_pn: 0,
    ganho_incoerente: 0,
    grupo_pequeno: 0,
  };
  const metodos: Record<MetodoP210, number> = { interpolacao: 0, abcz_pn: 0, extrapolacao: 0 };
  const candidatos: RegistroCorte[] = [];
  let naJanela = 0;
  for (const a of animais) {
    if (a.propriedadeId !== propriedadeId) continue;
    const ps = porAnimal.get(a.animalId) ?? [];
    if (ps.length > 0) naJanela += 1;
    // Só conta exclusão de quem tem pesagem na janela ou é bezerro sem pesagem:
    // um touro velho sem pesagem de desmama não é "lactação perdida".
    if (ps.length === 0) continue;
    if (a.apenasGenealogia) {
      excluidos.apenas_genealogia += 1;
      continue;
    }
    if (!a.nascimento) {
      excluidos.sem_nascimento += 1;
      continue;
    }
    const sexo = sexoCorte(a.sexo);
    if (!sexo) {
      excluidos.sem_sexo += 1;
      continue;
    }
    const p = padronizarP210(ps, a.pesoNascer, config);
    if (!p.ok) {
      excluidos[p.motivo === 'sem_pesagem_janela' ? 'sem_pesagem_janela' : p.motivo] += 1;
      continue;
    }
    candidatos.push({
      animalId: a.animalId,
      maeId: a.maeId,
      paiId: a.paiId,
      nascimento: a.nascimento,
      grupo: chaveGrupoCorte(propriedadeId, a.nascimento, sexo, p.pesagem.loteId),
      y: p.p210,
      metodo: p.metodo,
    });
  }
  const tamanhos = new Map<string, number>();
  for (const r of candidatos) tamanhos.set(r.grupo, (tamanhos.get(r.grupo) ?? 0) + 1);
  const registros = candidatos.filter((r) => (tamanhos.get(r.grupo) ?? 0) >= config.tamanhoMinimoGrupo);
  excluidos.grupo_pequeno = candidatos.length - registros.length;
  for (const r of registros) metodos[r.metodo] += 1;
  const grupos = new Map<string, number>();
  for (const r of registros) grupos.set(r.grupo, (grupos.get(r.grupo) ?? 0) + 1);
  registros.sort((a, b) => a.animalId - b.animalId);
  return {
    registros,
    excluidos,
    metodos,
    gruposAntesDoCorte: distribuicaoDeTamanhos(tamanhos.values()),
    grupos,
    bezerrosNaJanela: naJanela,
    semLote: registros.filter((r) => r.grupo.endsWith('|sem_lote')).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ajuste dos modelos
// ─────────────────────────────────────────────────────────────────────────────

export interface ValorCorte {
  valor: number;
  confiabilidade: number | null;
  n: number;
}

export interface AjusteCorte {
  modelos: ModeloInfo[];
  sigma2p: number | null;
  /** Por modelo → valor por categoria. */
  bezerros: Map<string, Map<number, ValorCorte>>;
  touros: Map<string, Map<number, ValorCorte>>;
  matrizes: Map<string, Map<number, ValorCorte>>;
  /** Por modelo → previsão do desvio de um bezerro FUTURO de cada vaca (a validação usa a do alvo). */
  previsaoPorVaca: Map<string, Map<number, number>>;
  /** Por modelo BLUP → EBV dos pais, para a previsão do bezerro alvo (½â pai + ½â mãe + ĉ mãe). */
  ebv: Map<string, { ebv: Map<number, number>; c: Map<number, number> }>;
  blup: ResumoBlup[];
  avisos: string[];
}

/**
 * O pedigree podado aos animais com registro e seus ancestrais. A mãe vem do
 * pedigree JÁ CONSERTADO: um vínculo cortado (nascimento impossível) não traz
 * a mãe de volta.
 */
function pedigreeDoAjuste(registros: readonly RegistroCorte[], ped: PedigreeMontado): PedigreeMontado {
  return podarPedigree(
    ped,
    registros.map((r) => r.animalId),
  );
}

export function ajustarCorte(
  registros: readonly RegistroCorte[],
  pedCompleto: PedigreeMontado,
  config: ConfigCorte,
  opcoes: { pev: boolean },
): AjusteCorte {
  const modelos = modelosCorte(config);
  const bezerros = new Map<string, Map<number, ValorCorte>>();
  const touros = new Map<string, Map<number, ValorCorte>>();
  const matrizes = new Map<string, Map<number, ValorCorte>>();
  const previsaoPorVaca = new Map<string, Map<number, number>>();
  const ebv = new Map<string, { ebv: Map<number, number>; c: Map<number, number> }>();
  const blup: ResumoBlup[] = [];
  const avisos: string[] = [];

  // O pai e a mãe valem pelo pedigree JÁ CONSERTADO (vínculo impossível cortado).
  const paiDe = (id: number) => {
    const i = pedCompleto.indice.get(id);
    return i != null && pedCompleto.pai[i] >= 0 ? pedCompleto.ids[pedCompleto.pai[i]] : null;
  };
  const maeDe = (id: number) => {
    const i = pedCompleto.indice.get(id);
    return i != null && pedCompleto.mae[i] >= 0 ? pedCompleto.ids[pedCompleto.mae[i]] : null;
  };

  const d = desviosDasContemporaneas(registros);
  const desvioDe = new Map<number, number>();
  registros.forEach((r, i) => {
    if (d.desvio[i] != null) desvioDe.set(r.animalId, d.desvio[i]!);
  });
  const filhosDaVaca = new Map<number, number[]>();
  const filhosDoTouro = new Map<number, number[]>();
  for (const r of registros) {
    const m = maeDe(r.animalId);
    const p = paiDe(r.animalId);
    if (m != null) filhosDaVaca.set(m, [...(filhosDaVaca.get(m) ?? []), r.animalId]);
    if (p != null) filhosDoTouro.set(p, [...(filhosDoTouro.get(p) ?? []), r.animalId]);
  }

  // a) desvio e b) MPPA.
  const base = new Map<number, ValorCorte>();
  for (const [a, x] of desvioDe) base.set(a, { valor: x, confiabilidade: null, n: 1 });
  bezerros.set('desvio_gc', base);
  const mediaFilhos = (filhos: number[]) => {
    const xs = filhos.map((f) => desvioDe.get(f)).filter((x): x is number => x != null);
    return xs.length ? { m: media(xs), n: xs.length } : null;
  };
  const vacasBase = new Map<number, ValorCorte>();
  const prevBase = new Map<number, number>();
  for (const [v, filhos] of filhosDaVaca) {
    const mf = mediaFilhos(filhos);
    if (!mf) continue;
    vacasBase.set(v, { valor: mf.m, confiabilidade: null, n: mf.n });
    prevBase.set(v, mf.m);
  }
  matrizes.set('desvio_gc', vacasBase);
  previsaoPorVaca.set('desvio_gc', prevBase);
  const tourosBase = new Map<number, ValorCorte>();
  for (const [t, filhos] of filhosDoTouro) {
    const mf = mediaFilhos(filhos);
    if (mf) tourosBase.set(t, { valor: mf.m, confiabilidade: null, n: mf.n });
  }
  touros.set('desvio_gc', tourosBase);
  for (const r of config.rMppa) {
    const vacas = new Map<number, ValorCorte>();
    const prev = new Map<number, number>();
    for (const [v, x] of vacasBase) {
      const f = fator_mppa(x.n, r);
      vacas.set(v, { valor: f * x.valor, confiabilidade: f, n: x.n });
      prev.set(v, f * x.valor);
    }
    matrizes.set(`mppa_r${r}`, vacas);
    previsaoPorVaca.set(`mppa_r${r}`, prev);
  }

  if (d.sigma2p == null) {
    avisos.push('Sem variação dentro dos grupos de contemporâneos: o BLUP não roda.');
    return { modelos, sigma2p: null, bezerros, touros, matrizes, previsaoPorVaca, ebv, blup, avisos };
  }

  // c) BLUP animal + ambiente comum da mãe.
  const ped = pedigreeDoAjuste(registros, pedCompleto);
  const indiceGrupo = new Map([...d.mediaGrupo.keys()].map((g, i) => [g, i]));
  const semMae: number[] = [];
  const regs: RegistroRepetibilidade[] = registros.map((r) => {
    const m = maeDe(r.animalId);
    const im = m != null ? ped.indice.get(m) : undefined;
    // Sem mãe no pedigree, o bezerro é o próprio nível (c próprio, que o
    // modelo encolhe para zero como um resíduo a mais): nenhum irmão o divide.
    if (im == null) semMae.push(r.animalId);
    return { animal: ped.indice.get(r.animalId)!, grupo: indiceGrupo.get(r.grupo)!, y: r.y, nivelPe: im ?? ped.indice.get(r.animalId)! };
  });
  if (semMae.length > 0) {
    avisos.push(`${semMae.length} bezerro(s) sem mãe no pedigree: o ambiente comum deles é só deles (nenhum irmão o divide).`);
  }
  const pevPara = opcoes.pev ? ped.ids.map((_, i) => i) : [];
  const fin = (x: number) => (Number.isFinite(x) ? x : null);
  for (const p of config.blup) {
    const chave = chaveBlupCorte(p);
    const s2p = d.sigma2p;
    const res = modeloRepetibilidade(
      ped,
      regs,
      indiceGrupo.size,
      { sigma2_a: p.h2 * s2p, sigma2_pe: p.c2 * s2p, sigma2_e: (1 - p.h2 - p.c2) * s2p },
      { pevPara, limiteDenso: config.limiteDenso },
    );
    blup.push({
      modelo: chave,
      metodo: res.metodo,
      incognitas: res.incognitas,
      iteracoes: res.iteracoes,
      convergiu: res.convergiu,
      pevCalculada: res.pevCalculada,
    });
    const ebvPor = new Map<number, number>();
    const cPor = new Map<number, number>();
    ped.ids.forEach((id, i) => {
      ebvPor.set(id, res.ebv[i]);
      cPor.set(id, res.pe[i]);
    });
    ebv.set(chave, { ebv: ebvPor, c: cPor });
    const b = new Map<number, ValorCorte>();
    for (const r of registros) {
      const i = ped.indice.get(r.animalId)!;
      b.set(r.animalId, { valor: res.ebv[i], confiabilidade: fin(res.confiabilidade[i]), n: 1 });
    }
    bezerros.set(chave, b);
    const t = new Map<number, ValorCorte>();
    for (const [touro, filhos] of filhosDoTouro) {
      const i = ped.indice.get(touro);
      if (i != null) t.set(touro, { valor: res.ebv[i], confiabilidade: fin(res.confiabilidade[i]), n: filhos.length });
    }
    touros.set(chave, t);
    const v = new Map<number, ValorCorte>();
    const prev = new Map<number, number>();
    for (const [vaca, filhos] of filhosDaVaca) {
      const i = ped.indice.get(vaca);
      if (i == null) continue;
      const cap = 0.5 * res.ebv[i] + res.pe[i];
      v.set(vaca, { valor: cap, confiabilidade: null, n: filhos.length });
      prev.set(vaca, cap);
    }
    matrizes.set(chave, v);
    previsaoPorVaca.set(chave, prev);
  }
  return { modelos, sigma2p: d.sigma2p, bezerros, touros, matrizes, previsaoPorVaca, ebv, blup, avisos };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validação para frente
// ─────────────────────────────────────────────────────────────────────────────

export function validarCorte(
  registros: readonly RegistroCorte[],
  ped: PedigreeMontado,
  config: ConfigCorte,
): ValidacaoCaracteristica {
  const maeDe = (id: number) => {
    const i = ped.indice.get(id);
    return i != null && ped.mae[i] >= 0 ? ped.ids[ped.mae[i]] : null;
  };
  const paiDe = (id: number) => {
    const i = ped.indice.get(id);
    return i != null && ped.pai[i] >= 0 ? ped.ids[ped.pai[i]] : null;
  };
  const ultimo = new Map<number, number>(); // vaca → índice do bezerro alvo
  const contagem = new Map<number, number>();
  registros.forEach((r, i) => {
    const m = maeDe(r.animalId);
    if (m == null) return;
    contagem.set(m, (contagem.get(m) ?? 0) + 1);
    const atual = ultimo.get(m);
    if (
      atual == null ||
      r.nascimento > registros[atual].nascimento ||
      (r.nascimento === registros[atual].nascimento && r.animalId > registros[atual].animalId)
    ) {
      ultimo.set(m, i);
    }
  });
  const alvos = [...ultimo.entries()].filter(([v]) => (contagem.get(v) ?? 0) >= 2);
  const vazio: ValidacaoCaracteristica = {
    rodou: false,
    motivo: null,
    candidatas: alvos.length,
    n: 0,
    porModelo: [],
    vencedor: null,
    blup: [],
    reml: null,
    naoRodaram: [],
  };
  if (alvos.length < config.minimoValidacao) {
    return {
      ...vazio,
      motivo: `só ${alvos.length} vacas com 2 ou mais bezerros aproveitáveis (o mínimo é ${config.minimoValidacao})`,
    };
  }
  const realizadoTodos = desviosDasContemporaneas(registros).desvio;
  const ehAlvo = new Set(alvos.map(([, i]) => i));
  const treino = registros.filter((_, i) => !ehAlvo.has(i));
  const aj = ajustarCorte(treino, ped, config, { pev: false });
  const modelos = aj.modelos.map((m) => m.chave).filter((m) => aj.previsaoPorVaca.has(m) || aj.ebv.has(m));
  const previsao = (modelo: string, vaca: number, bezerro: number): number | null => {
    const e = aj.ebv.get(modelo);
    if (e) {
      if (!e.ebv.has(vaca)) return null;
      const pai = paiDe(bezerro);
      return 0.5 * (pai != null ? (e.ebv.get(pai) ?? 0) : 0) + 0.5 * e.ebv.get(vaca)! + (e.c.get(vaca) ?? 0);
    }
    return aj.previsaoPorVaca.get(modelo)?.get(vaca) ?? null;
  };
  const pares: { vaca: number; bezerro: number; realizado: number }[] = [];
  for (const [vaca, i] of alvos) {
    const realizado = realizadoTodos[i];
    if (realizado == null) continue;
    if (!modelos.every((m) => previsao(m, vaca, registros[i].animalId) != null)) continue;
    pares.push({ vaca, bezerro: registros[i].animalId, realizado });
  }
  if (pares.length < config.minimoValidacao) {
    return {
      ...vazio,
      blup: aj.blup,
      motivo:
        `das ${alvos.length} vacas com 2+ bezerros, só ${pares.length} têm desvio calculável no treino e no ` +
        `alvo (o mínimo é ${config.minimoValidacao})`,
    };
  }
  const realizado = pares.map((p) => p.realizado);
  const porModelo = modelos.map((m) => ({
    modelo: m,
    metricas: metricasValidacao(
      pares.map((p) => previsao(m, p.vaca, p.bezerro)!),
      realizado,
    ),
  }));
  return {
    rodou: true,
    motivo: null,
    candidatas: alvos.length,
    n: pares.length,
    porModelo,
    vencedor: vencedorDaValidacao(porModelo, config.minimoVencedor),
    blup: aj.blup,
    reml: null,
    naoRodaram: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagnóstico
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticoCorte {
  animais: number;
  bezerrosNaJanela: number;
  registros: number;
  excluidos: Record<MotivoExclusaoCorte, number>;
  metodos: Record<MetodoP210, number>;
  /** Sobre os bezerros com P210 aproveitável. */
  completude: { bezerros: number; pai: number; mae: number; semPaiComCandidatos: number; avoMaterno: number };
  origemPrenhez: { iatf: number; te: number; monta: number; sem: number };
  grupos: DistribuicaoGrupos & { tamanhoMinimo: number; registrosForaPorTamanho: number; semLote: number };
  matrizes: { comBezerros: number; duasOuMais: number };
  touros: { comFilhos: number; comDezOuMais: number; maiorNumeroFilhos: number };
  pedigree: { animais: number; externos: number; problemas: ProblemaListado[] };
  endogamia: ResumoEndogamia;
  /** Média e desvio do P210 (kg), para dar a escala. */
  p210: { media: number | null; dp: number | null };
  nivel: 'bom' | 'limitado' | 'insuficiente';
  conclusoes: TomConclusao[];
}

const FILHOS_TOURO = 10;

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

export function diagnosticarCorte(
  propriedadeId: number,
  animais: readonly AnimalCorteEntrada[],
  prep: PreparacaoCorte,
  ped: PedigreeMontado,
  config: ConfigCorte,
): DiagnosticoCorte {
  const porId = new Map(animais.map((a) => [a.animalId, a]));
  const regs = prep.registros;
  const paiDe = (id: number) => {
    const i = ped.indice.get(id);
    return i != null && ped.pai[i] >= 0 ? ped.ids[ped.pai[i]] : null;
  };
  const maeDe = (id: number) => {
    const i = ped.indice.get(id);
    return i != null && ped.mae[i] >= 0 ? ped.ids[ped.mae[i]] : null;
  };
  const completude = { bezerros: regs.length, pai: 0, mae: 0, semPaiComCandidatos: 0, avoMaterno: 0 };
  const origem = { iatf: 0, te: 0, monta: 0, sem: 0 };
  const filhosVaca = new Map<number, number>();
  const filhosTouro = new Map<number, number>();
  for (const r of regs) {
    const p = paiDe(r.animalId);
    const m = maeDe(r.animalId);
    if (p != null) {
      completude.pai += 1;
      filhosTouro.set(p, (filhosTouro.get(p) ?? 0) + 1);
    } else if ((porId.get(r.animalId)?.paisCandidatos ?? 0) > 0) completude.semPaiComCandidatos += 1;
    if (m != null) {
      completude.mae += 1;
      filhosVaca.set(m, (filhosVaca.get(m) ?? 0) + 1);
      if (paiDe(m) != null) completude.avoMaterno += 1;
    }
    const o = porId.get(r.animalId)?.origemPrenhez;
    if (o === 'iatf' || o === 'te' || o === 'monta') origem[o] += 1;
    else origem.sem += 1;
  }
  const ys = regs.map((r) => r.y);
  const m = ys.length ? media(ys) : null;
  const dp = ys.length > 1 && m != null ? Math.sqrt(ys.reduce((s, y) => s + (y - m) ** 2, 0) / (ys.length - 1)) : null;
  const externos = ped.ids.filter((id) => (porId.get(id)?.propriedadeId ?? propriedadeId) !== propriedadeId).length;
  const diag: Omit<DiagnosticoCorte, 'nivel' | 'conclusoes'> = {
    animais: animais.filter((a) => a.propriedadeId === propriedadeId).length,
    bezerrosNaJanela: prep.bezerrosNaJanela,
    registros: regs.length,
    excluidos: prep.excluidos,
    metodos: prep.metodos,
    completude,
    origemPrenhez: origem,
    grupos: {
      ...prep.gruposAntesDoCorte,
      tamanhoMinimo: config.tamanhoMinimoGrupo,
      registrosForaPorTamanho: prep.excluidos.grupo_pequeno,
      semLote: prep.semLote,
    },
    matrizes: { comBezerros: filhosVaca.size, duasOuMais: [...filhosVaca.values()].filter((n) => n >= 2).length },
    touros: {
      comFilhos: filhosTouro.size,
      comDezOuMais: [...filhosTouro.values()].filter((n) => n >= FILHOS_TOURO).length,
      maiorNumeroFilhos: Math.max(0, ...filhosTouro.values()),
    },
    pedigree: { animais: ped.ids.length, externos, problemas: listarProblemasPedigree(ped.problemas) },
    endogamia: resumirEndogamia(
      ped,
      regs.map((r) => r.animalId),
    ),
    p210: { media: m, dp },
  };

  const c: TomConclusao[] = [];
  if (regs.length < config.registrosMinimos) {
    c.push({
      tom: 'bloqueio',
      texto: `Só ${regs.length} bezerros com P210 aproveitável (mínimo ${config.registrosMinimos}): nenhum modelo tem o que dizer ainda.`,
    });
  } else {
    c.push({
      tom: 'ok',
      texto: `${regs.length} bezerros com P210 aproveitável, em ${prep.grupos.size} grupos de contemporâneos.`,
    });
  }
  const fracPai = regs.length ? completude.pai / regs.length : 0;
  c.push({
    tom: fracPai < 0.3 ? 'atencao' : 'ok',
    texto:
      `Pai conhecido em ${pct(fracPai)} dos bezerros. Sem pai, o BLUP usa só a mãe: o EBV do bezerro leva metade ` +
      `da informação de parentesco e touro sem filho identificado não é avaliado.` +
      (completude.semPaiComCandidatos > 0
        ? ` ${completude.semPaiComCandidatos} bezerro(s) sem pai têm pais candidatos da monta com vários touros, que o modelo não usa.`
        : ''),
  });
  if (diag.matrizes.duasOuMais < config.minimoValidacao) {
    c.push({
      tom: 'bloqueio',
      texto: `Não dá para validar: só ${diag.matrizes.duasOuMais} vacas com 2 ou mais bezerros aproveitáveis (a validação pede ${config.minimoValidacao}).`,
    });
  } else {
    c.push({ tom: 'ok', texto: `${diag.matrizes.duasOuMais} vacas com 2+ bezerros: dá para comparar os modelos pelo último bezerro.` });
  }
  if (diag.touros.comDezOuMais === 0) {
    c.push({ tom: 'atencao', texto: `Nenhum touro com ${FILHOS_TOURO}+ filhos com P210 (o maior tem ${diag.touros.maiorNumeroFilhos}).` });
  }
  const perda = regs.length + prep.excluidos.grupo_pequeno > 0 ? prep.excluidos.grupo_pequeno / (regs.length + prep.excluidos.grupo_pequeno) : 0;
  if (perda > 0.2) {
    c.push({ tom: 'atencao', texto: `${pct(perda)} dos bezerros caíram em grupos com menos de ${config.tamanhoMinimoGrupo} e ficaram de fora.` });
  }
  const corrigidos = diag.pedigree.problemas.filter((x) => x.acao === 'corrigido');
  if (corrigidos.length > 0) {
    c.push({
      tom: 'atencao',
      texto: 'Pedigree com vínculos corrigidos: ' + corrigidos.map((x) => `${x.quantidade} ${x.rotulo} (${x.efeito})`).join('; ') + '.',
    });
  }
  c.push({
    tom: 'atencao',
    texto: 'Idade da vaca não ajustada: não há fatores publicados para o Nelore que o relatório aceite transferir.',
  });
  const nivel = c.some((x) => x.tom === 'bloqueio') ? 'insuficiente' : c.some((x) => x.tom === 'atencao') ? 'limitado' : 'bom';
  return { ...diag, nivel, conclusoes: c };
}

// ─────────────────────────────────────────────────────────────────────────────
// Análise de uma fazenda
// ─────────────────────────────────────────────────────────────────────────────

export interface EntradaCorte {
  propriedadeId: number;
  /** Os animais da fazenda e os pais deles que moram em outra fazenda (só pedigree). */
  animais: readonly AnimalCorteEntrada[];
  pesagens: readonly PesagemCorteEntrada[];
}

export interface AnaliseFazendaCorte {
  propriedadeId: number;
  especie: 'bovino_corte';
  versaoMotor: string;
  config: ConfigCorte;
  modelos: ModeloInfo[];
  diagnostico: DiagnosticoCorte;
  rodouModelos: boolean;
  motivoSemModelos: string | null;
  validacao: ValidacaoCaracteristica | null;
  sigma2p: number | null;
  rankingBezerros: RankingModelo[] | null;
  rankingTouros: RankingModelo[] | null;
  rankingMatrizes: RankingModelo[] | null;
  blup: ResumoBlup[];
  avisos: string[];
}

export const VERSAO_MOTOR_CORTE = 'ts-0.2.0 corte (P210 ABCZ; animal + ambiente comum da mãe)';

function ranking(
  porModelo: Map<string, Map<number, ValorCorte>>,
  animais: Map<number, AnimalCorteEntrada>,
  propriedadeId: number,
  tamanho: number,
): RankingModelo[] {
  const saida: RankingModelo[] = [];
  for (const [modelo, valores] of porModelo) {
    const ordenados = [...valores.entries()].sort((a, b) => b[1].valor - a[1].valor || a[0] - b[0]);
    saida.push({
      modelo,
      total: ordenados.length,
      linhas: ordenados.slice(0, tamanho).map(([animalId, v], i): LinhaRanking => {
        const a = animais.get(animalId);
        const daqui = a?.propriedadeId === propriedadeId;
        return {
          posicao: i + 1,
          animalId,
          // Animal de outra fazenda entra só no pedigree: a tela não mostra o número dele.
          numero: daqui ? (a?.numero ?? null) : null,
          nome: daqui ? (a?.nome ?? null) : '(de outra fazenda)',
          valor: v.valor,
          confiabilidade: v.confiabilidade,
          n: v.n,
        };
      }),
    });
  }
  return saida;
}

export function analisarFazendaCorte(
  entrada: EntradaCorte,
  opcoes: { ranking: boolean; config?: ConfigCorte },
): AnaliseFazendaCorte {
  const config = opcoes.config ?? CONFIG_CORTE;
  const ped = montarPedigree(
    entrada.animais.map((a) => ({
      id: a.animalId,
      pai: a.paiId,
      mae: a.maeId,
      sexo: a.sexo,
      nascimento: a.nascimento,
    })),
    { gestacaoDias: config.gestacaoDias },
  );
  const prep = prepararCorte(entrada.propriedadeId, entrada.animais, entrada.pesagens, config);
  const diagnostico = diagnosticarCorte(entrada.propriedadeId, entrada.animais, prep, ped, config);
  const modelos = modelosCorte(config);
  const base: AnaliseFazendaCorte = {
    propriedadeId: entrada.propriedadeId,
    especie: 'bovino_corte',
    versaoMotor: VERSAO_MOTOR_CORTE,
    config,
    modelos,
    diagnostico,
    rodouModelos: false,
    motivoSemModelos: null,
    validacao: null,
    sigma2p: null,
    rankingBezerros: null,
    rankingTouros: null,
    rankingMatrizes: null,
    blup: [],
    avisos: [],
  };
  if (prep.registros.length < config.registrosMinimos) {
    return {
      ...base,
      motivoSemModelos: `Só ${prep.registros.length} bezerros com P210 aproveitável; o mínimo para rodar os modelos é ${config.registrosMinimos}.`,
    };
  }
  const validacao = validarCorte(prep.registros, ped, config);
  const saida: AnaliseFazendaCorte = { ...base, rodouModelos: true, validacao };
  if (!opcoes.ranking) return { ...saida, sigma2p: desviosDasContemporaneas(prep.registros).sigma2p };
  const aj = ajustarCorte(prep.registros, ped, config, { pev: true });
  const porId = new Map(entrada.animais.map((a) => [a.animalId, a]));
  return {
    ...saida,
    sigma2p: aj.sigma2p,
    rankingBezerros: ranking(aj.bezerros, porId, entrada.propriedadeId, config.tamanhoRanking),
    rankingTouros: ranking(aj.touros, porId, entrada.propriedadeId, config.tamanhoRanking),
    rankingMatrizes: ranking(aj.matrizes, porId, entrada.propriedadeId, config.tamanhoRanking),
    blup: aj.blup,
    avisos: aj.avisos,
  };
}
