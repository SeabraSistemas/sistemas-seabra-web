/**
 * GRUPOS DE CONTEMPORÂNEAS e a preparação dos registros de uma característica.
 *
 * Grupo = fazenda × ano × estação do parto × classe de parto (primípara ou
 * adulta). É a comparação justa: uma cabra só é "boa" em relação às que
 * pariram com ela, no mesmo manejo e na mesma época — e a primeira lactação
 * produz menos por ser a primeira, não por ser de uma cabra pior.
 *
 * A preparação aplica os filtros NUMA ORDEM FIXA e conta cada exclusão pelo
 * motivo. O diagnóstico mostra essa contagem: um modelo que roda sobre 40% das
 * lactações da fazenda sem dizer por que ficaram 60% de fora é uma afirmação
 * sobre um rebanho que não é o do cliente.
 */

import {
  CARACTERISTICAS,
  type CaracteristicaChave,
  type ConfigAnalise,
  type LactacaoEntrada,
} from '@/lib/melhoramento/tipos';

export type ClasseParto = 'primipara' | 'adulta';

/**
 * 30 meses. Cabra parida pela primeira vez na base com mais que isto quase
 * sempre já pariu antes do app (a base tem primeira lactação registrada aos
 * 52 meses no percentil 90). Abaixo, primípara de fato.
 */
export const IDADE_MAXIMA_PRIMIPARA_DIAS = Math.round(30 * 30.4375);

/**
 * A ordem de parto MAIS PROVÁVEL desta lactação. `ordemLactacao` conta só as
 * registradas; quando o cadastro diz que o animal tem mais partos do que
 * lactações na base, a diferença são partos de antes do app, e ficam na frente.
 */
export function ordemEstimada(l: LactacaoEntrada): number {
  const anteriores = Math.max(0, (l.ordemPartoCadastro ?? 0) - l.lactacoesDoAnimal);
  return l.ordemLactacao + anteriores;
}

/**
 * Primípara = primeira lactação estimada E (idade desconhecida OU abaixo de 30
 * meses). Idade negativa é erro de cadastro (nascimento lançado depois do
 * parto) e conta como desconhecida — não decide nada.
 */
export function classificarParto(l: LactacaoEntrada): ClasseParto {
  if (ordemEstimada(l) !== 1) return 'adulta';
  const idade = l.idadePartoDias;
  if (idade == null || idade < 0) return 'primipara';
  return idade < IDADE_MAXIMA_PRIMIPARA_DIAS ? 'primipara' : 'adulta';
}

const ROTULO_ESTACAO: Record<string, string> = {
  verao: 'verão',
  outono: 'outono',
  inverno: 'inverno',
  primavera: 'primavera',
};

export function chaveGrupo(l: LactacaoEntrada, classe: ClasseParto): string {
  return `${l.propriedadeId}|${l.anoEstacao}|${l.estacao}|${classe}`;
}

/** '234|2023|verao|primipara' → 'verão de 2023 · primíparas'. */
export function rotuloGrupo(chave: string): string {
  const [, ano, estacao, classe] = chave.split('|');
  return `${ROTULO_ESTACAO[estacao] ?? estacao} de ${ano} · ${classe === 'primipara' ? 'primíparas' : 'adultas'}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Preparação
// ─────────────────────────────────────────────────────────────────────────────

export type MotivoExclusao =
  | 'sintetica'
  | 'aberta'
  | 'sem_valor'
  | 'duracao_curta'
  | 'duracao_longa'
  | 'grupo_pequeno';

export const MOTIVOS_EXCLUSAO: MotivoExclusao[] = [
  'sintetica',
  'aberta',
  'sem_valor',
  'duracao_curta',
  'duracao_longa',
  'grupo_pequeno',
];

export const ROTULO_MOTIVO: Record<MotivoExclusao, string> = {
  sintetica: 'sintéticas (teste do app)',
  aberta: 'ainda abertas',
  sem_valor: 'sem o valor da característica',
  duracao_curta: 'duração curta demais',
  duracao_longa: 'duração longa demais',
  grupo_pequeno: 'em grupo de contemporâneas pequeno',
};

/** Uma lactação que entrou na análise. */
export interface Registro {
  lactacaoId: number;
  animalId: number;
  dataInicio: string;
  classe: ClasseParto;
  grupo: string;
  y: number;
  metodo: string | null;
}

export interface DistribuicaoGrupos {
  total: number;
  tamanho1: number;
  tamanho2a4: number;
  tamanho5a9: number;
  tamanho10mais: number;
}

export interface Preparacao {
  caracteristica: CaracteristicaChave;
  registros: Registro[];
  excluidas: Record<MotivoExclusao, number>;
  /** Distribuição do tamanho dos grupos ANTES do corte de tamanho mínimo. */
  gruposAntesDoCorte: DistribuicaoGrupos;
  /** Grupos que ficaram, com o número de registros de cada. */
  grupos: Map<string, number>;
}

export function distribuicaoDeTamanhos(tamanhos: Iterable<number>): DistribuicaoGrupos {
  const d: DistribuicaoGrupos = { total: 0, tamanho1: 0, tamanho2a4: 0, tamanho5a9: 0, tamanho10mais: 0 };
  for (const t of tamanhos) {
    d.total += 1;
    if (t <= 1) d.tamanho1 += 1;
    else if (t <= 4) d.tamanho2a4 += 1;
    else if (t <= 9) d.tamanho5a9 += 1;
    else d.tamanho10mais += 1;
  }
  return d;
}

/**
 * Da lista crua de lactações aos registros de UMA característica.
 *
 * Ordem dos filtros (cada lactação cai no primeiro que a pega): sintética,
 * aberta, sem valor, duração fora da faixa e, por último, grupo pequeno — que
 * só pode ser decidido depois que os outros filtros fixaram quem sobrou.
 * Lactação sem duração conhecida mas encerrada passa: a média diária já é
 * total ÷ dias e o filtro de duração só existe para cortar o absurdo.
 */
export function prepararRegistros(
  lactacoes: readonly LactacaoEntrada[],
  caracteristica: CaracteristicaChave,
  config: ConfigAnalise,
): Preparacao {
  const info = CARACTERISTICAS[caracteristica];
  const excluidas: Record<MotivoExclusao, number> = {
    sintetica: 0,
    aberta: 0,
    sem_valor: 0,
    duracao_curta: 0,
    duracao_longa: 0,
    grupo_pequeno: 0,
  };
  const candidatos: Registro[] = [];
  for (const l of lactacoes) {
    if (l.sintetica) {
      excluidas.sintetica += 1;
      continue;
    }
    if (!l.encerrada) {
      excluidas.aberta += 1;
      continue;
    }
    const y = info.valor(l);
    if (y == null || !Number.isFinite(y)) {
      excluidas.sem_valor += 1;
      continue;
    }
    if (l.duracaoDias != null && l.duracaoDias < config.duracaoMinima) {
      excluidas.duracao_curta += 1;
      continue;
    }
    if (l.duracaoDias != null && l.duracaoDias > config.duracaoMaxima) {
      excluidas.duracao_longa += 1;
      continue;
    }
    const classe = classificarParto(l);
    candidatos.push({
      lactacaoId: l.lactacaoId,
      animalId: l.animalId,
      dataInicio: l.dataInicio,
      classe,
      grupo: chaveGrupo(l, classe),
      y,
      metodo: l.metodo,
    });
  }

  const tamanhos = new Map<string, number>();
  for (const r of candidatos) tamanhos.set(r.grupo, (tamanhos.get(r.grupo) ?? 0) + 1);
  const registros = candidatos.filter((r) => (tamanhos.get(r.grupo) ?? 0) >= config.tamanhoMinimoGrupo);
  excluidas.grupo_pequeno = candidatos.length - registros.length;

  const grupos = new Map<string, number>();
  for (const r of registros) grupos.set(r.grupo, (grupos.get(r.grupo) ?? 0) + 1);

  // Ordem estável: animal, depois data — é a ordem em que "a última lactação"
  // da validação é escolhida, e o resultado não pode depender da ordem da view.
  registros.sort(
    (a, b) => a.animalId - b.animalId || a.dataInicio.localeCompare(b.dataInicio) || a.lactacaoId - b.lactacaoId,
  );

  return {
    caracteristica,
    registros,
    excluidas,
    gruposAntesDoCorte: distribuicaoDeTamanhos(tamanhos.values()),
    grupos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Desvios das contemporâneas
// ─────────────────────────────────────────────────────────────────────────────

export interface Desvios {
  /** Média de cada grupo, sobre os registros dados. */
  mediaGrupo: Map<string, number>;
  /**
   * Desvio de cada registro (mesma ordem da entrada) em relação às OUTRAS do
   * grupo — a média sem a própria. null quando ela é a única do grupo.
   *
   * Sem a própria, e não com ela, porque incluí-la encolhe o desvio por
   * (n − 1)/n: num grupo de 5, 20% a menos, e o coeficiente de regressão da
   * validação sairia 20% abaixo de 1 por causa da conta, não do modelo.
   */
  desvio: (number | null)[];
  /**
   * Variância fenotípica DENTRO de grupo, Σ(y − ȳ_g)²/(N − nGrupos). Só dá a
   * escala (litros²) da PEV: EBV, ranking e confiabilidade não dependem dela.
   * null quando não há grau de liberdade ou não há variação.
   */
  sigma2p: number | null;
}

export function desviosDasContemporaneas(registros: readonly { grupo: string; y: number }[]): Desvios {
  const soma = new Map<string, number>();
  const n = new Map<string, number>();
  for (const r of registros) {
    soma.set(r.grupo, (soma.get(r.grupo) ?? 0) + r.y);
    n.set(r.grupo, (n.get(r.grupo) ?? 0) + 1);
  }
  const mediaGrupo = new Map<string, number>();
  for (const [g, s] of soma) mediaGrupo.set(g, s / n.get(g)!);
  let ss = 0;
  const desvio = registros.map((r) => {
    const ng = n.get(r.grupo)!;
    ss += (r.y - mediaGrupo.get(r.grupo)!) ** 2;
    if (ng < 2) return null;
    return r.y - (soma.get(r.grupo)! - r.y) / (ng - 1);
  });
  const gl = registros.length - mediaGrupo.size;
  const sigma2p = gl > 0 && ss > 0 ? ss / gl : null;
  return { mediaGrupo, desvio, sigma2p };
}
