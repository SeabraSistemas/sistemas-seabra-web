/**
 * A ANÁLISE DE UMA FAZENDA, de ponta a ponta — o que a aba Melhoramento e a
 * página /adm/melhoramento mostram.
 *
 *   1. pedigree da fazenda montado e consertado (parentesco.ts), sem silêncio;
 *   2. registros de cada característica, com grupos de contemporâneas
 *      (contemporaneas.ts) e as exclusões contadas;
 *   3. diagnóstico dos dados (diagnostico.ts) — sempre, mesmo sem modelo;
 *   4. modelos sobre todos os registros, para o RANKING (modelos.ts);
 *   5. validação para frente: cada modelo, ajustado só com os dados até a
 *      penúltima lactação de cada fêmea, prevê o desvio da última
 *      (validacao.ts mede).
 *
 * Função pura e síncrona: recebe as linhas das views já traduzidas, devolve
 * um objeto serializável. Não lê banco, não grava nada.
 */

import { prepararRegistros, desviosDasContemporaneas, type Preparacao, type Registro } from '@/lib/melhoramento/contemporaneas';
import { diagnosticar, LIMIARES, type DiagnosticoFazenda } from '@/lib/melhoramento/diagnostico';
import { ajustarModelos, type AjusteModelos, type ResumoBlup } from '@/lib/melhoramento/modelos';
import { montarPedigree, type AnimalPedigreeEntrada, type PedigreeMontado } from '@/lib/melhoramento/parentesco';
import {
  CONFIG_PADRAO,
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  modelosDaConfig,
  type AnimalEntrada,
  type CaracteristicaChave,
  type ConfigAnalise,
  type EspecieChave,
  type LactacaoEntrada,
  type ModeloInfo,
} from '@/lib/melhoramento/tipos';
import { metricasValidacao, vencedorDaValidacao, type MetricasValidacao, type Vencedor } from '@/lib/melhoramento/validacao';

/** Versão do motor gravada junto de cada análise, para ela ser reproduzível. */
export const VERSAO_MOTOR = 'ts-0.1.0 (porta do pacote melhoramento 0.1.0)';

export interface EntradaFazenda {
  propriedadeId: number;
  especie: EspecieChave;
  lactacoes: readonly LactacaoEntrada[];
  animais: readonly AnimalEntrada[];
  /** Sintéticas que a leitura já deixou de fora no banco (só para contar). */
  sinteticasForaDaLeitura?: number;
}

export interface OpcoesAnalise {
  /** false na visão entre fazendas: lá só importam diagnóstico e validação. */
  ranking: boolean;
  config?: ConfigAnalise;
}

export interface LinhaRanking {
  posicao: number;
  animalId: number;
  numero: string | null;
  nome: string | null;
  valor: number;
  confiabilidade: number | null;
  /** Lactações (fêmea) ou filhas com lactação (reprodutor). */
  n: number;
}

export interface RankingModelo {
  modelo: string;
  total: number;
  linhas: LinhaRanking[];
}

export interface ValidacaoCaracteristica {
  rodou: boolean;
  motivo: string | null;
  /** Fêmeas com 2+ lactações aproveitáveis — candidatas. */
  candidatas: number;
  /** As que entraram (com desvio realizado e previsão em todos os modelos). */
  n: number;
  porModelo: { modelo: string; metricas: MetricasValidacao }[];
  vencedor: Vencedor | null;
  blup: ResumoBlup[];
}

export interface AnaliseCaracteristica {
  caracteristica: CaracteristicaChave;
  registros: number;
  femeas: number;
  grupos: number;
  sigma2p: number | null;
  validacao: ValidacaoCaracteristica;
  rankingFemeas: RankingModelo[] | null;
  rankingReprodutores: RankingModelo[] | null;
  blup: ResumoBlup[];
  avisos: string[];
}

export interface AnaliseFazenda {
  propriedadeId: number;
  especie: EspecieChave;
  versaoMotor: string;
  config: ConfigAnalise;
  modelos: ModeloInfo[];
  diagnostico: DiagnosticoFazenda;
  rodouModelos: boolean;
  motivoSemModelos: string | null;
  caracteristicas: AnaliseCaracteristica[];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * As linhas do pedigree da fazenda, mais as fêmeas com lactação que não vieram
 * na leitura do rebanho (não deveria acontecer — a view de lactação nasce do
 * mesmo rebanho —, mas se acontecer o animal entra com os pais que a lactação
 * conhece, em vez de derrubar o BLUP).
 */
function linhasDoPedigree(entrada: EntradaFazenda): AnimalPedigreeEntrada[] {
  const linhas: AnimalPedigreeEntrada[] = entrada.animais.map((a) => ({
    id: a.animalId,
    pai: a.paiId,
    mae: a.maeId,
    sexo: a.sexo,
    nascimento: a.nascimento,
  }));
  const presentes = new Set(linhas.map((l) => l.id));
  for (const l of entrada.lactacoes) {
    if (presentes.has(l.animalId)) continue;
    presentes.add(l.animalId);
    linhas.push({ id: l.animalId, pai: l.paiId, mae: l.maeId, sexo: 'fêmea', nascimento: null });
  }
  return linhas;
}

export function analisarFazenda(entrada: EntradaFazenda, opcoes: OpcoesAnalise): AnaliseFazenda {
  const config = opcoes.config ?? CONFIG_PADRAO;
  const especie = ESPECIES_MELHORAMENTO[entrada.especie];
  const lactacoes = entrada.lactacoes.filter(
    (l) => l.propriedadeId === entrada.propriedadeId && l.especie === entrada.especie,
  );
  const ped = montarPedigree(linhasDoPedigree({ ...entrada, lactacoes }));
  const preparacoes = ORDEM_CARACTERISTICAS.map((c) => prepararRegistros(lactacoes, c, config));
  const diagnostico = diagnosticar(lactacoes, preparacoes, ped, config, entrada.sinteticasForaDaLeitura ?? 0);
  const modelos = modelosDaConfig(config);

  const base: AnaliseFazenda = {
    propriedadeId: entrada.propriedadeId,
    especie: entrada.especie,
    versaoMotor: VERSAO_MOTOR,
    config,
    modelos,
    diagnostico,
    rodouModelos: false,
    motivoSemModelos: null,
    caracteristicas: [],
  };

  if (!especie.rodaModelos) return { ...base, motivoSemModelos: especie.motivo };
  if (preparacoes[0].registros.length < LIMIARES.registrosMinimos) {
    return {
      ...base,
      motivoSemModelos: `Só ${preparacoes[0].registros.length} lactações aproveitáveis; o mínimo para rodar os modelos é ${LIMIARES.registrosMinimos}.`,
    };
  }

  const nomes = new Map(entrada.animais.map((a) => [a.animalId, a]));
  const caracteristicas = preparacoes
    .filter((p) => p.registros.length >= LIMIARES.registrosMinimos)
    .map((p) => analisarCaracteristica(p, ped, config, opcoes.ranking, nomes));
  return { ...base, rodouModelos: true, caracteristicas };
}

function analisarCaracteristica(
  prep: Preparacao,
  ped: PedigreeMontado,
  config: ConfigAnalise,
  comRanking: boolean,
  animais: Map<number, AnimalEntrada>,
): AnaliseCaracteristica {
  const validacao = validarParaFrente(prep.registros, ped, config);
  let completo: AjusteModelos | null = null;
  if (comRanking) completo = ajustarModelos(prep.registros, ped, config, { pev: 'femeas_e_reprodutores' });
  return {
    caracteristica: prep.caracteristica,
    registros: prep.registros.length,
    femeas: new Set(prep.registros.map((r) => r.animalId)).size,
    grupos: prep.grupos.size,
    sigma2p: completo?.sigma2p ?? desviosDasContemporaneas(prep.registros).sigma2p,
    validacao,
    rankingFemeas: completo ? rankings(completo.femea, config, animais) : null,
    rankingReprodutores: completo ? rankings(completo.reprodutor, config, animais) : null,
    blup: completo?.blup ?? [],
    avisos: completo?.avisos ?? [],
  };
}

function rankings(
  porModelo: Map<string, Map<number, { valor: number; confiabilidade: number | null; n?: number; filhas?: number }>>,
  config: ConfigAnalise,
  animais: Map<number, AnimalEntrada>,
): RankingModelo[] {
  const saida: RankingModelo[] = [];
  for (const [modelo, porAnimal] of porModelo) {
    const ordenados = [...porAnimal.entries()].sort((a, b) => b[1].valor - a[1].valor || a[0] - b[0]);
    saida.push({
      modelo,
      total: ordenados.length,
      linhas: ordenados.slice(0, config.tamanhoRanking).map(([animalId, r], i) => ({
        posicao: i + 1,
        animalId,
        numero: animais.get(animalId)?.numero ?? null,
        nome: animais.get(animalId)?.nome ?? null,
        valor: r.valor,
        confiabilidade: r.confiabilidade,
        n: r.filhas ?? r.n ?? 0,
      })),
    });
  }
  return saida;
}

/**
 * Validação para frente.
 *
 * Alvo de cada fêmea com 2+ lactações = a ÚLTIMA (por data). O treino é tudo
 * menos os alvos; os modelos ajustados no treino preveem o desvio do alvo; o
 * realizado é o desvio do alvo em relação às OUTRAS do grupo dele, com todos
 * os dados. Todos os modelos são medidos sobre o MESMO conjunto de fêmeas —
 * as que têm desvio realizado e previsão em todos —, senão a comparação
 * mediria amostras diferentes.
 */
export function validarParaFrente(
  registros: readonly Registro[],
  ped: PedigreeMontado,
  config: ConfigAnalise,
): ValidacaoCaracteristica {
  const ultima = new Map<number, number>(); // animal → índice do alvo
  const contagem = new Map<number, number>();
  registros.forEach((r, i) => {
    contagem.set(r.animalId, (contagem.get(r.animalId) ?? 0) + 1);
    const atual = ultima.get(r.animalId);
    if (
      atual == null ||
      r.dataInicio > registros[atual].dataInicio ||
      (r.dataInicio === registros[atual].dataInicio && r.lactacaoId > registros[atual].lactacaoId)
    ) {
      ultima.set(r.animalId, i);
    }
  });
  const alvos = [...ultima.entries()].filter(([a]) => (contagem.get(a) ?? 0) >= 2);
  const vazio: ValidacaoCaracteristica = {
    rodou: false,
    motivo: null,
    candidatas: alvos.length,
    n: 0,
    porModelo: [],
    vencedor: null,
    blup: [],
  };
  if (alvos.length < config.minimoValidacao) {
    return {
      ...vazio,
      motivo: `só ${alvos.length} fêmeas com 2 ou mais lactações aproveitáveis (o mínimo é ${config.minimoValidacao})`,
    };
  }

  const realizadoTodos = desviosDasContemporaneas(registros).desvio;
  const ehAlvo = new Set(alvos.map(([, i]) => i));
  const treino = registros.filter((_, i) => !ehAlvo.has(i));
  const aj = ajustarModelos(treino, ped, config, { pev: 'reprodutores' });

  const modelos = aj.modelos.map((m) => m.chave);
  const pares: { animal: number; realizado: number }[] = [];
  for (const [animal, i] of alvos) {
    const realizado = realizadoTodos[i];
    if (realizado == null) continue;
    if (!modelos.every((m) => aj.femea.get(m)?.has(animal))) continue;
    pares.push({ animal, realizado });
  }
  if (pares.length < config.minimoValidacao) {
    return {
      ...vazio,
      blup: aj.blup,
      motivo:
        `das ${alvos.length} fêmeas com 2+ lactações, só ${pares.length} têm desvio calculável no treino e no ` +
        `alvo (o mínimo é ${config.minimoValidacao})`,
    };
  }
  const realizado = pares.map((p) => p.realizado);
  const porModelo = modelos.map((m) => {
    const porFemea = aj.femea.get(m)!;
    return { modelo: m, metricas: metricasValidacao(pares.map((p) => porFemea.get(p.animal)!.previsao), realizado) };
  });
  return {
    rodou: true,
    motivo: null,
    candidatas: alvos.length,
    n: pares.length,
    porModelo,
    vencedor: vencedorDaValidacao(porModelo, config.minimoVencedor),
    blup: aj.blup,
  };
}
