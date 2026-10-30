/**
 * DIAGNÓSTICO DOS DADOS de uma fazenda para melhoramento — antes de qualquer
 * modelo, o que os dados permitem concluir.
 *
 * Tudo aqui é CONTAGEM sobre os dados da fazenda; nenhum número é suposto. O
 * veredito no fim é uma lista de frases, cada uma presa a um número calculado
 * acima e a um limiar escrito em LIMIARES — quem discordar do limiar muda o
 * limiar, não a frase.
 */

import {
  desviosDasContemporaneas,
  type DistribuicaoGrupos,
  type MotivoExclusao,
  type Preparacao,
} from '@/lib/melhoramento/contemporaneas';
import type { PedigreeMontado } from '@/lib/melhoramento/parentesco';
import type { CaracteristicaChave, ConfigAnalise, LactacaoEntrada } from '@/lib/melhoramento/tipos';

export const LIMIARES = {
  /** Abaixo disto, nenhum modelo tem o que dizer. */
  registrosMinimos: 30,
  /** Fêmeas com 2+ lactações para a validação ser mais que indicativa. */
  validacaoInformativa: 30,
  /** Filhas com lactação para um reprodutor ter ranking útil. */
  filhasReprodutor: 10,
  /** Fração das fêmeas com pai conhecido abaixo da qual o BLUP pouco usa parentesco. */
  completudePaiBaixa: 0.3,
  completudePaiBoa: 0.7,
  /** Fração das lactações perdidas por grupo pequeno que já pede atenção. */
  perdaPorGrupo: 0.2,
} as const;

export interface Completude {
  /** Fêmeas com lactação aproveitável — o denominador. */
  femeas: number;
  pai: number;
  mae: number;
  avoPaterno: number;
  avoPaterna: number;
  avoMaterno: number;
  avoMaterna: number;
}

export interface CaracteristicaDiagnostico {
  caracteristica: CaracteristicaChave;
  registros: number;
  femeas: number;
  excluidas: Record<MotivoExclusao, number>;
  /** Correlação da característica com a duração da lactação. */
  correlacaoDuracao: number | null;
  /** Correlação entre desvios de lactações seguidas da mesma fêmea (≈ repetibilidade). */
  correlacaoConsecutivas: number | null;
  paresConsecutivos: number;
}

export interface TomConclusao {
  tom: 'ok' | 'atencao' | 'bloqueio';
  texto: string;
}

export interface DiagnosticoFazenda {
  lactacoesReais: number;
  lactacoesEncerradas: number;
  lactacoesSinteticas: number;
  femeasComLactacao: number;
  /** Da característica principal, que é a do diagnóstico. */
  principal: CaracteristicaChave;
  caracteristicas: CaracteristicaDiagnostico[];
  completude: Completude;
  lactacoesPorFemea: { uma: number; duas: number; tres: number; quatroOuMais: number };
  femeasDuasOuMais: number;
  grupos: DistribuicaoGrupos & { tamanhoMinimo: number; registrosForaPorTamanho: number };
  reprodutores: { comFilhas: number; comDezOuMais: number; maiorNumeroFilhas: number };
  procedencia: { definitivo: number; inferido: number; estimativa: number; outro: number };
  pedigree: {
    animais: number;
    duplicados: number;
    autoparentesco: number;
    paisAusentes: number;
    ciclosCortados: number;
    sexoIncoerente: number;
    nascimentoIncoerente: number;
  };
  nivel: 'bom' | 'limitado' | 'insuficiente';
  conclusoes: TomConclusao[];
}

function pearson(x: readonly number[], y: readonly number[]): number | null {
  const n = x.length;
  if (n < 3) return null;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += x[i];
    my += y[i];
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
    sxy += (x[i] - mx) * (y[i] - my);
  }
  if (sxx <= 0 || syy <= 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

function diagnosticoDaCaracteristica(
  prep: Preparacao,
  lactacoes: readonly LactacaoEntrada[],
): CaracteristicaDiagnostico {
  const porId = new Map(lactacoes.map((l) => [l.lactacaoId, l]));
  const dur: number[] = [];
  const val: number[] = [];
  for (const r of prep.registros) {
    const d = porId.get(r.lactacaoId)?.duracaoDias;
    if (d != null) {
      dur.push(d);
      val.push(r.y);
    }
  }
  // Repetibilidade aproximada: desvio de uma lactação contra o da seguinte da
  // mesma fêmea (registros já vêm ordenados por animal e data).
  const desv = desviosDasContemporaneas(prep.registros).desvio;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 1; i < prep.registros.length; i++) {
    if (prep.registros[i].animalId !== prep.registros[i - 1].animalId) continue;
    const d0 = desv[i - 1];
    const d1 = desv[i];
    if (d0 != null && d1 != null) {
      a.push(d0);
      b.push(d1);
    }
  }
  return {
    caracteristica: prep.caracteristica,
    registros: prep.registros.length,
    femeas: new Set(prep.registros.map((r) => r.animalId)).size,
    excluidas: prep.excluidas,
    correlacaoDuracao: pearson(val, dur),
    correlacaoConsecutivas: pearson(a, b),
    paresConsecutivos: a.length,
  };
}

/**
 * `sinteticasForaDaLeitura`: quando a leitura já filtrou as sintéticas no
 * banco (para não trafegar 1.500 linhas de teste), quem chama passa quantas
 * eram, e o diagnóstico continua contando.
 */
export function diagnosticar(
  lactacoes: readonly LactacaoEntrada[],
  preparacoes: readonly Preparacao[],
  ped: PedigreeMontado,
  config: ConfigAnalise,
  sinteticasForaDaLeitura = 0,
): DiagnosticoFazenda {
  const reais = lactacoes.filter((l) => !l.sintetica);
  const principal = preparacoes[0];
  const regs = principal.registros;

  // Completude: fêmeas com lactação aproveitável, e quem dos ascendentes é conhecido.
  const femeas = [...new Set(regs.map((r) => r.animalId))];
  const paiDe = (id: number | null) => {
    if (id == null) return null;
    const i = ped.indice.get(id);
    return i != null && ped.pai[i] >= 0 ? ped.ids[ped.pai[i]] : null;
  };
  const maeDe = (id: number | null) => {
    if (id == null) return null;
    const i = ped.indice.get(id);
    return i != null && ped.mae[i] >= 0 ? ped.ids[ped.mae[i]] : null;
  };
  const completude: Completude = {
    femeas: femeas.length,
    pai: 0,
    mae: 0,
    avoPaterno: 0,
    avoPaterna: 0,
    avoMaterno: 0,
    avoMaterna: 0,
  };
  for (const f of femeas) {
    const p = paiDe(f);
    const m = maeDe(f);
    if (p != null) completude.pai += 1;
    if (m != null) completude.mae += 1;
    if (paiDe(p) != null) completude.avoPaterno += 1;
    if (maeDe(p) != null) completude.avoPaterna += 1;
    if (paiDe(m) != null) completude.avoMaterno += 1;
    if (maeDe(m) != null) completude.avoMaterna += 1;
  }

  const porFemea = new Map<number, number>();
  for (const r of regs) porFemea.set(r.animalId, (porFemea.get(r.animalId) ?? 0) + 1);
  const lactacoesPorFemea = { uma: 0, duas: 0, tres: 0, quatroOuMais: 0 };
  for (const n of porFemea.values()) {
    if (n === 1) lactacoesPorFemea.uma += 1;
    else if (n === 2) lactacoesPorFemea.duas += 1;
    else if (n === 3) lactacoesPorFemea.tres += 1;
    else lactacoesPorFemea.quatroOuMais += 1;
  }
  const femeasDuasOuMais = femeas.length - lactacoesPorFemea.uma;

  const filhas = new Map<number, number>();
  for (const f of femeas) {
    const p = paiDe(f);
    if (p != null) filhas.set(p, (filhas.get(p) ?? 0) + 1);
  }
  const reprodutores = {
    comFilhas: filhas.size,
    comDezOuMais: [...filhas.values()].filter((n) => n >= LIMIARES.filhasReprodutor).length,
    maiorNumeroFilhas: Math.max(0, ...filhas.values()),
  };

  const procedencia = { definitivo: 0, inferido: 0, estimativa: 0, outro: 0 };
  for (const r of regs) {
    const m = (r.metodo ?? '').toUpperCase();
    if (m.startsWith('DEFINITIVO') || m === 'MANUAL') procedencia.definitivo += 1;
    else if (m.startsWith('INFERIDO')) procedencia.inferido += 1;
    else if (m.includes('ESTIMATIVA')) procedencia.estimativa += 1;
    else procedencia.outro += 1;
  }

  const grupos = {
    ...principal.gruposAntesDoCorte,
    tamanhoMinimo: config.tamanhoMinimoGrupo,
    registrosForaPorTamanho: principal.excluidas.grupo_pequeno,
  };

  const pr = ped.problemas;
  const pedigree = {
    animais: ped.ids.length,
    duplicados: pr.duplicados.length,
    autoparentesco: pr.autoparentesco.length,
    paisAusentes: pr.paisAusentes.length,
    ciclosCortados: pr.ciclosCortados.length,
    sexoIncoerente: pr.sexoIncoerente.length,
    nascimentoIncoerente: pr.nascimentoIncoerente,
  };

  // ── Veredito ────────────────────────────────────────────────────────────────
  const conclusoes: TomConclusao[] = [];
  if (regs.length < LIMIARES.registrosMinimos) {
    conclusoes.push({
      tom: 'bloqueio',
      texto: `Só ${regs.length} lactações aproveitáveis (mínimo ${LIMIARES.registrosMinimos}): nenhum modelo tem o que dizer sobre esta fazenda ainda.`,
    });
  } else {
    conclusoes.push({
      tom: 'ok',
      texto: `${regs.length} lactações aproveitáveis de ${femeas.length} fêmeas, em ${principal.grupos.size} grupos de contemporâneas.`,
    });
  }
  if (femeasDuasOuMais < config.minimoValidacao) {
    conclusoes.push({
      tom: 'bloqueio',
      texto: `Não dá para validar modelos: só ${femeasDuasOuMais} fêmeas com 2 ou mais lactações aproveitáveis (a validação pede ${config.minimoValidacao}).`,
    });
  } else if (femeasDuasOuMais < LIMIARES.validacaoInformativa) {
    conclusoes.push({
      tom: 'atencao',
      texto: `Validação só indicativa: ${femeasDuasOuMais} fêmeas com 2+ lactações. Os intervalos ficam largos e nenhum modelo é declarado melhor.`,
    });
  } else {
    conclusoes.push({
      tom: 'ok',
      texto: `${femeasDuasOuMais} fêmeas com 2+ lactações: dá para comparar os modelos pela previsão da última lactação.`,
    });
  }
  const fracPai = femeas.length > 0 ? completude.pai / femeas.length : 0;
  if (fracPai < LIMIARES.completudePaiBaixa) {
    conclusoes.push({
      tom: 'atencao',
      texto: `Pai conhecido em só ${pct(fracPai)} das fêmeas: o BLUP quase não usa parentesco aqui, e fica perto da MPPA.`,
    });
  } else if (fracPai < LIMIARES.completudePaiBoa) {
    conclusoes.push({ tom: 'atencao', texto: `Pai conhecido em ${pct(fracPai)} das fêmeas: parentesco parcial.` });
  } else {
    conclusoes.push({ tom: 'ok', texto: `Pai conhecido em ${pct(fracPai)} das fêmeas.` });
  }
  if (reprodutores.comDezOuMais === 0) {
    conclusoes.push({
      tom: 'atencao',
      texto: `Nenhum reprodutor com ${LIMIARES.filhasReprodutor}+ filhas com lactação (o maior tem ${reprodutores.maiorNumeroFilhas}): ranking de reprodutores sem confiabilidade útil.`,
    });
  } else {
    conclusoes.push({
      tom: 'ok',
      texto: `${reprodutores.comDezOuMais} reprodutor(es) com ${LIMIARES.filhasReprodutor}+ filhas com lactação (o maior tem ${reprodutores.maiorNumeroFilhas}).`,
    });
  }
  const candidatosGrupo = regs.length + principal.excluidas.grupo_pequeno;
  const perda = candidatosGrupo > 0 ? principal.excluidas.grupo_pequeno / candidatosGrupo : 0;
  if (perda > LIMIARES.perdaPorGrupo) {
    conclusoes.push({
      tom: 'atencao',
      texto: `${pct(perda)} das lactações caíram em grupos com menos de ${config.tamanhoMinimoGrupo} contemporâneas e ficaram de fora.`,
    });
  }
  const problemasPed =
    pedigree.duplicados + pedigree.autoparentesco + pedigree.paisAusentes + pedigree.ciclosCortados + pedigree.sexoIncoerente;
  if (problemasPed > 0) {
    conclusoes.push({
      tom: 'atencao',
      texto:
        `Pedigree com problemas corrigidos de forma conservadora: ${pedigree.duplicados} id(s) duplicado(s), ` +
        `${pedigree.autoparentesco} autoparentesco, ${pedigree.paisAusentes} pai(s)/mãe(s) fora do cadastro, ` +
        `${pedigree.ciclosCortados} ciclo(s) cortado(s), ${pedigree.sexoIncoerente} com sexo incoerente.`,
    });
  }

  const nivel = conclusoes.some((c) => c.tom === 'bloqueio')
    ? 'insuficiente'
    : conclusoes.some((c) => c.tom === 'atencao')
      ? 'limitado'
      : 'bom';

  return {
    lactacoesReais: reais.length,
    lactacoesEncerradas: reais.filter((l) => l.encerrada).length,
    lactacoesSinteticas: lactacoes.length - reais.length + sinteticasForaDaLeitura,
    femeasComLactacao: new Set(reais.map((l) => l.animalId)).size,
    principal: principal.caracteristica,
    caracteristicas: preparacoes.map((p) => diagnosticoDaCaracteristica(p, lactacoes)),
    completude,
    lactacoesPorFemea,
    femeasDuasOuMais,
    grupos,
    reprodutores,
    procedencia,
    pedigree,
    nivel,
    conclusoes,
  };
}

