/**
 * RODADAS GRAVADAS — o que o script scripts/melhoramento/rodar.ts grava em
 * melhoramento.rodada, resultado_animal, validacao e diagnostico_dado, e a
 * comparação da tela entre uma rodada gravada e o cálculo de agora.
 *
 * Três partes, nenhuma com Next nem segredo:
 *
 *   pacotes*          AnaliseFazenda (ou de corte) → linhas a gravar. Pura.
 *   executarRodada    lê as views, analisa cada fazenda e grava, por uma
 *                     `PortaBanco` INJETADA. O script passa o supabase-js com a
 *                     service_role; o teste passa um banco falso em memória.
 *                     Cada rodada nasce 'rodando' e só vira 'concluida' depois
 *                     de os resultados e a validação dela estarem gravados — a
 *                     tela só mostra as concluídas, então uma execução que cai
 *                     no meio nunca aparece pela metade.
 *   compararComAtual  a tela: correlação gravada × atual e quantos do topo do
 *                     ranking se repetem.
 *
 * O PAINEL NÃO GRAVA NADA: quem grava é o script, rodado à mão. O painel só
 * lê adm.melhoramento_rodada & cia.
 */

import { VIEWS_GRAVACAO_MELHORAMENTO, VIEWS_MELHORAMENTO } from '@/lib/adm/areas/contrato';
import type {
  LinhaMelhoramentoResultado,
  LinhaMelhoramentoRodada,
  LinhaMelhoramentoValidacao,
} from '@/lib/adm/areas/contrato';
import { analisarFazenda, type AnaliseFazenda, type RankingModelo, type ValidacaoCaracteristica } from '@/lib/melhoramento/analise';
import { analisarFazendaCorte, CONFIG_CORTE, type AnaliseFazendaCorte, type AnimalCorteEntrada } from '@/lib/melhoramento/corte';
import { configDaEspecie, type EspecieChave } from '@/lib/melhoramento/tipos';
import {
  SELECT,
  paraAnimal,
  paraAnimalCorte,
  paraFazenda,
  paraFazendaCorte,
  paraLactacao,
  paraPesagemCorte,
  type Linha,
} from '@/lib/melhoramento/traducao';

// ─────────────────────────────────────────────────────────────────────────────
// Porta para o banco
// ─────────────────────────────────────────────────────────────────────────────

/** Valor escalar = igualdade; lista = `in`. */
export type FiltroLeitura = Record<string, string | number | boolean | readonly (string | number)[]>;

export interface PortaBanco {
  /** Lê a view INTEIRA (paginada por quem implementa), com ordem total. */
  ler(view: string, select: string, filtros: FiltroLeitura, ordem: readonly string[]): Promise<Linha[]>;
  /** Insere e devolve as colunas de `retornar` das linhas inseridas (ou [] com null). */
  inserir(view: string, linhas: readonly Linha[], retornar: string | null): Promise<Linha[]>;
  atualizar(view: string, filtros: FiltroLeitura, valores: Linha): Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Linhas a gravar
// ─────────────────────────────────────────────────────────────────────────────

export interface PacoteRodada {
  rodada: Linha;
  resultados: Linha[];
  validacao: Linha[];
}

/** Uma linha por animal: o primeiro papel ganha a linha; os outros vão para `extra.outros`. */
function resultadosDe(
  papeis: { tipo: string; rankings: RankingModelo[] | null }[],
  modelo: string,
  propriedadeId: number,
): Linha[] {
  const porAnimal = new Map<number, Linha>();
  for (const { tipo, rankings } of papeis) {
    const r = rankings?.find((x) => x.modelo === modelo);
    if (!r) continue;
    for (const l of r.linhas) {
      const existente = porAnimal.get(l.animalId);
      const dados = { tipo, valor: l.valor, confiabilidade: l.confiabilidade, posicao: l.posicao, n: l.n };
      if (existente) {
        const extra = existente.extra as { outros?: unknown[] };
        extra.outros = [...(extra.outros ?? []), dados];
        continue;
      }
      porAnimal.set(l.animalId, {
        animal_id: l.animalId,
        propriedade_id: propriedadeId,
        valor: finito(l.valor),
        confiabilidade: finito(l.confiabilidade),
        posicao: l.posicao,
        extra: { tipo, n: l.n },
      });
    }
  }
  return [...porAnimal.values()];
}

function finito(x: number | null | undefined): number | null {
  return x != null && Number.isFinite(x) ? x : null;
}

function linhasValidacao(v: ValidacaoCaracteristica | null, modelo: string): Linha[] {
  if (!v || !v.rodou) {
    return [{ metrica: 'validacao', valor: null, n: 0, detalhe: { rodou: false, motivo: v?.motivo ?? 'sem validação' } }];
  }
  const m = v.porModelo.find((x) => x.modelo === modelo);
  if (!m) {
    const fora = v.naoRodaram.find((x) => x.modelo === modelo);
    return [{ metrica: 'validacao', valor: null, n: 0, detalhe: { rodou: false, motivo: fora?.motivo ?? 'fora da validação' } }];
  }
  const vencedor = v.vencedor?.modelo === modelo;
  return [
    { metrica: 'correlacao_proxima', valor: finito(m.metricas.correlacao), n: m.metricas.n, detalhe: { ic: m.metricas.icCorrelacao, vencedor } },
    { metrica: 'regressao_proxima', valor: finito(m.metricas.regressao), n: m.metricas.n, detalhe: { ic: m.metricas.icRegressao } },
    { metrica: 'vies_proxima', valor: finito(m.metricas.vies), n: m.metricas.n, detalhe: { ic: m.metricas.icVies } },
  ];
}

export function pacotesLeite(a: AnaliseFazenda, execucao: string): PacoteRodada[] {
  const saida: PacoteRodada[] = [];
  const config = {
    blup: a.config.blup,
    rMppa: a.config.rMppa,
    fonteMppa: a.config.fonteMppa,
    tamanhoMinimoGrupo: a.config.tamanhoMinimoGrupo,
    duracaoMinima: a.config.duracaoMinima,
    duracaoMaxima: a.config.duracaoMaxima,
    idadeMaximaPrimiparaDias: a.config.idadeMaximaPrimiparaDias,
    gestacaoDias: a.config.gestacaoDias,
  };
  for (const c of a.caracteristicas) {
    const fora = new Set(c.naoRodaram.map((x) => x.modelo));
    for (const m of a.modelos) {
      if (fora.has(m.chave)) continue;
      const resultados = resultadosDe(
        [
          { tipo: 'femea', rankings: c.rankingFemeas },
          { tipo: 'reprodutor', rankings: c.rankingReprodutores },
        ],
        m.chave,
        a.propriedadeId,
      );
      saida.push({
        rodada: {
          especie: a.especie,
          propriedade_id: a.propriedadeId,
          modelo: m.chave,
          caracteristica: c.caracteristica,
          parametros: { execucao, modelo: m, config, ...(m.familia === 'blup_reml' ? { reml: c.reml } : {}) },
          versao_motor: a.versaoMotor,
          status: 'rodando',
          n_animais: resultados.length,
          n_registros: c.registros,
          resumo: {
            femeas: c.femeas,
            grupos: c.grupos,
            sigma2p: c.sigma2p,
            blup: c.blup.find((b) => b.modelo === m.chave) ?? null,
            validacao: { rodou: c.validacao.rodou, n: c.validacao.n, candidatas: c.validacao.candidatas, vencedor: c.validacao.vencedor },
          },
          observacao: null,
        },
        resultados,
        validacao: linhasValidacao(c.validacao, m.chave),
      });
    }
  }
  return saida;
}

export function pacotesCorte(a: AnaliseFazendaCorte, execucao: string): PacoteRodada[] {
  if (!a.rodouModelos) return [];
  const config = {
    blup: a.config.blup,
    rMppa: a.config.rMppa,
    fonteMppa: a.config.fonteMppa,
    idadePadrao: a.config.idadePadrao,
    janela: a.config.janela,
    tamanhoMinimoGrupo: a.config.tamanhoMinimoGrupo,
  };
  return a.modelos.map((m) => {
    const resultados = resultadosDe(
      [
        { tipo: 'bezerro', rankings: a.rankingBezerros },
        { tipo: 'touro', rankings: a.rankingTouros },
        { tipo: 'matriz', rankings: a.rankingMatrizes },
      ],
      m.chave,
      a.propriedadeId,
    );
    return {
      rodada: {
        especie: 'bovino_corte',
        propriedade_id: a.propriedadeId,
        modelo: m.chave,
        caracteristica: 'p210',
        parametros: { execucao, modelo: m, config },
        versao_motor: a.versaoMotor,
        status: 'rodando',
        n_animais: resultados.length,
        n_registros: a.diagnostico.registros,
        resumo: {
          sigma2p: a.sigma2p,
          blup: a.blup.find((b) => b.modelo === m.chave) ?? null,
          validacao: a.validacao
            ? { rodou: a.validacao.rodou, n: a.validacao.n, candidatas: a.validacao.candidatas, vencedor: a.validacao.vencedor }
            : null,
        },
        observacao: null,
      },
      resultados,
      validacao: linhasValidacao(a.validacao, m.chave),
    };
  });
}

export function linhaDiagnostico(a: AnaliseFazenda | AnaliseFazendaCorte, execucao: string): Linha {
  const naoRodaram =
    'caracteristicas' in a ? a.caracteristicas.map((c) => ({ caracteristica: c.caracteristica, modelos: c.naoRodaram })) : [];
  return {
    especie: a.especie,
    propriedade_id: a.propriedadeId,
    metricas: {
      execucao,
      versaoMotor: a.versaoMotor,
      rodouModelos: a.rodouModelos,
      motivoSemModelos: a.motivoSemModelos,
      naoRodaram,
      diagnostico: a.diagnostico,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Execução
// ─────────────────────────────────────────────────────────────────────────────

export interface OpcoesExecucao {
  especies: EspecieChave[];
  /** Só esta fazenda; sem ela, todas da espécie. */
  propriedadeId?: number;
  /** Identifica a execução (vai em parametros.execucao e no diagnóstico). */
  execucao: string;
  /** Fazendas de teste ficam de fora, a não ser que se peça. */
  incluirTeste?: boolean;
  log?: (msg: string) => void;
}

export interface ResumoExecucao {
  execucao: string;
  fazendas: number;
  rodadas: number;
  resultados: number;
  validacoes: number;
  erros: { especie: EspecieChave; propriedadeId: number; erro: string }[];
}

/** Rankings inteiros (não só o topo): resultado_animal guarda todos os animais. */
const SEM_TETO = 1_000_000_000;
const LOTE = 500;

async function inserirEmLotes(porta: PortaBanco, view: string, linhas: readonly Linha[]): Promise<void> {
  for (let i = 0; i < linhas.length; i += LOTE) await porta.inserir(view, linhas.slice(i, i + LOTE), null);
}

async function gravarPacote(porta: PortaBanco, p: PacoteRodada): Promise<{ resultados: number; validacoes: number }> {
  const [criada] = await porta.inserir(VIEWS_GRAVACAO_MELHORAMENTO.rodada, [p.rodada], 'id');
  const id = Number(criada?.id);
  if (!Number.isFinite(id)) throw new Error('a rodada não voltou com id');
  try {
    await inserirEmLotes(porta, VIEWS_GRAVACAO_MELHORAMENTO.resultado, p.resultados.map((r) => ({ ...r, rodada_id: id })));
    await inserirEmLotes(porta, VIEWS_GRAVACAO_MELHORAMENTO.validacao, p.validacao.map((r) => ({ ...r, rodada_id: id })));
    await porta.atualizar(VIEWS_GRAVACAO_MELHORAMENTO.rodada, { id }, { status: 'concluida' });
  } catch (e) {
    await porta.atualizar(VIEWS_GRAVACAO_MELHORAMENTO.rodada, { id }, {
      status: 'erro',
      observacao: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
  return { resultados: p.resultados.length, validacoes: p.validacao.length };
}

/** Os pais que moram em outra fazenda (corte): até 5 gerações, só pedigree. */
async function lerPaisExternos(porta: PortaBanco, animais: AnimalCorteEntrada[]): Promise<AnimalCorteEntrada[]> {
  const todos = [...animais];
  const presentes = new Set(todos.map((a) => a.animalId));
  for (let geracao = 0; geracao < 5; geracao++) {
    const faltam = [
      ...new Set(todos.flatMap((a) => [a.paiId, a.maeId]).filter((x): x is number => x != null && !presentes.has(x))),
    ];
    if (faltam.length === 0) break;
    for (let i = 0; i < faltam.length; i += LOTE) {
      const linhas = await porta.ler(VIEWS_MELHORAMENTO.bovinoAnimal, SELECT.bovinoAnimal, { animal_id: faltam.slice(i, i + LOTE) }, ['animal_id']);
      for (const l of linhas.map(paraAnimalCorte)) {
        if (presentes.has(l.animalId)) continue;
        presentes.add(l.animalId);
        todos.push(l);
      }
    }
    for (const id of faltam) presentes.add(id); // quem não veio não é procurado de novo
  }
  return todos;
}

export async function executarRodada(porta: PortaBanco, opcoes: OpcoesExecucao): Promise<ResumoExecucao> {
  const log = opcoes.log ?? (() => {});
  const resumo: ResumoExecucao = { execucao: opcoes.execucao, fazendas: 0, rodadas: 0, resultados: 0, validacoes: 0, erros: [] };
  const filtroFaz: FiltroLeitura = opcoes.propriedadeId != null ? { propriedade_id: opcoes.propriedadeId } : {};
  for (const especie of opcoes.especies) {
    const lista =
      especie === 'bovino_corte'
        ? (await porta.ler(VIEWS_MELHORAMENTO.bovinoFazenda, SELECT.bovinoFazenda, filtroFaz, ['propriedade_id'])).map((l) => {
            const f = paraFazendaCorte(l);
            return { id: f.propriedade_id, teste: f.teste, temDado: f.animais_janela > 0 };
          })
        : (await porta.ler(VIEWS_MELHORAMENTO.fazenda, SELECT.fazenda, { ...filtroFaz, especie }, ['propriedade_id', 'especie'])).map(
            (l) => {
              const f = paraFazenda(l);
              return { id: f.propriedade_id, teste: f.teste, temDado: f.lactacoes > 0, sinteticas: f.lactacoes_sinteticas };
            },
          );
    type Item = { id: number; teste: boolean; temDado: boolean; sinteticas?: number };
    for (const f of lista as Item[]) {
      if (!f.temDado || (f.teste && !opcoes.incluirTeste)) continue;
      try {
        let pacotes: PacoteRodada[];
        let analise: AnaliseFazenda | AnaliseFazendaCorte;
        if (especie === 'bovino_corte') {
          const [animais, pesagens] = await Promise.all([
            porta.ler(VIEWS_MELHORAMENTO.bovinoAnimal, SELECT.bovinoAnimal, { propriedade_id: f.id }, ['animal_id']),
            porta.ler(VIEWS_MELHORAMENTO.bovinoPesagem, SELECT.bovinoPesagem, { propriedade_id: f.id }, ['pesagem_id']),
          ]);
          const comExternos = await lerPaisExternos(porta, animais.map(paraAnimalCorte));
          analise = analisarFazendaCorte(
            { propriedadeId: f.id, animais: comExternos, pesagens: pesagens.map(paraPesagemCorte) },
            { ranking: true, config: { ...CONFIG_CORTE, tamanhoRanking: SEM_TETO } },
          );
          pacotes = pacotesCorte(analise, opcoes.execucao);
        } else {
          const [lact, ped] = await Promise.all([
            porta.ler(VIEWS_MELHORAMENTO.lactacao, SELECT.lactacao, { especie, propriedade_id: f.id, sintetica: false }, ['lactacao_id']),
            porta.ler(VIEWS_MELHORAMENTO.pedigree, SELECT.pedigree, { especie, propriedade_id: f.id }, ['animal_id']),
          ]);
          analise = analisarFazenda(
            {
              propriedadeId: f.id,
              especie,
              lactacoes: lact.map(paraLactacao),
              animais: ped.map(paraAnimal),
              sinteticasForaDaLeitura: f.sinteticas ?? 0,
            },
            { ranking: true, config: { ...configDaEspecie(especie), tamanhoRanking: SEM_TETO } },
          );
          pacotes = pacotesLeite(analise, opcoes.execucao);
        }
        await porta.inserir(VIEWS_GRAVACAO_MELHORAMENTO.diagnostico, [linhaDiagnostico(analise, opcoes.execucao)], null);
        for (const p of pacotes) {
          const g = await gravarPacote(porta, p);
          resumo.rodadas += 1;
          resumo.resultados += g.resultados;
          resumo.validacoes += g.validacoes;
        }
        resumo.fazendas += 1;
        log(`${especie} #${f.id}: ${pacotes.length} rodada(s)${analise.rodouModelos ? '' : ` — sem modelos: ${analise.motivoSemModelos}`}`);
      } catch (e) {
        const erro = e instanceof Error ? e.message : String(e);
        resumo.erros.push({ especie, propriedadeId: f.id, erro });
        log(`${especie} #${f.id}: ERRO — ${erro}`);
      }
    }
  }
  return resumo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Histórico e comparação (a tela)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecucaoGravada {
  execucao: string;
  criadaEm: string;
  versaoMotor: string;
  rodadas: LinhaMelhoramentoRodada[];
}

/** Rodadas CONCLUÍDAS agrupadas por execução, da mais recente para a mais antiga. */
export function agruparExecucoes(rodadas: readonly LinhaMelhoramentoRodada[]): ExecucaoGravada[] {
  const por = new Map<string, LinhaMelhoramentoRodada[]>();
  for (const r of rodadas) {
    if (r.status !== 'concluida') continue;
    const e = typeof r.parametros.execucao === 'string' ? r.parametros.execucao : `rodada-${r.id}`;
    por.set(e, [...(por.get(e) ?? []), r]);
  }
  return [...por.entries()]
    .map(([execucao, rs]) => {
      const ordenadas = [...rs].sort((a, b) => a.id - b.id);
      return {
        execucao,
        criadaEm: ordenadas.reduce((m, r) => (r.criada_em > m ? r.criada_em : m), ''),
        versaoMotor: ordenadas[0].versao_motor,
        rodadas: ordenadas,
      };
    })
    .sort((a, b) => (a.criadaEm < b.criadaEm ? 1 : a.criadaEm > b.criadaEm ? -1 : 0));
}

export interface AtualParaComparar {
  caracteristica: string;
  validacao: ValidacaoCaracteristica | null;
  /** O ranking principal (fêmeas no leite, bezerros no corte). */
  ranking: RankingModelo[] | null;
}

export interface ComparacaoModelo {
  modelo: string;
  caracteristica: string;
  gravada: { correlacao: number | null; regressao: number | null; n: number | null } | null;
  atual: { correlacao: number | null; regressao: number | null; n: number } | null;
  /** Quantos do topo gravado (até `topo`) estão no topo atual; null sem ranking atual. */
  emComumNoTopo: number | null;
  topo: number;
}

const TIPO_PRINCIPAL = new Set(['femea', 'bezerro']);

export function compararComAtual(
  execucao: ExecucaoGravada,
  validacoes: readonly LinhaMelhoramentoValidacao[],
  resultados: readonly LinhaMelhoramentoResultado[],
  atual: readonly AtualParaComparar[],
  topo = 10,
): ComparacaoModelo[] {
  return execucao.rodadas.map((r) => {
    const v = validacoes.filter((x) => x.rodada_id === r.id);
    const metrica = (m: string) => v.find((x) => x.metrica === m);
    const corr = metrica('correlacao_proxima');
    const gravada = corr ? { correlacao: corr.valor, regressao: metrica('regressao_proxima')?.valor ?? null, n: corr.n } : null;
    const a = atual.find((x) => x.caracteristica === r.caracteristica);
    const am = a?.validacao?.porModelo.find((x) => x.modelo === r.modelo);
    const rk = a?.ranking?.find((x) => x.modelo === r.modelo);
    const topoGravado = resultados
      .filter((x) => x.rodada_id === r.id && x.posicao != null && x.posicao <= topo && TIPO_PRINCIPAL.has(String(x.extra.tipo)))
      .map((x) => x.animal_id);
    const topoAtual = new Set(rk?.linhas.filter((l) => l.posicao <= topo).map((l) => l.animalId) ?? []);
    return {
      modelo: r.modelo,
      caracteristica: r.caracteristica,
      gravada,
      atual: am ? { correlacao: am.metricas.correlacao, regressao: am.metricas.regressao, n: am.metricas.n } : null,
      // Sem topo gravado do papel principal (a MPPA do corte só ranqueia vacas), não há o que comparar.
      emComumNoTopo: rk && topoGravado.length > 0 ? topoGravado.filter((id) => topoAtual.has(id)).length : null,
      topo: topoGravado.length,
    };
  });
}
