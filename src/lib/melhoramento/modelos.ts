/**
 * OS MODELOS, todos sobre a MESMA característica e os mesmos registros:
 *
 *   a) desvio das contemporâneas — a linha de base: média dos desvios da
 *      fêmea, sem encolhimento nenhum. Se um modelo não bate isto, não serve.
 *   b) MPPA com r 0,36, 0,44 e 0,50 — o desvio encolhido por n·r/[1+(n−1)r].
 *   c) BLUP de repetibilidade com h² 0,20 e 0,30 (r 0,36): GC fixo, valor
 *      genético com A⁻¹ e ambiente permanente. EBV, PEV e confiabilidade.
 *   d) índice da fêmea: registros próprios + o EBV do pai tirado do BLUP de
 *      mesma h² (e a REL dele). Atenção a uma limitação conhecida, escrita
 *      aqui para não ser esquecida: o EBV do pai já contém as lactações da
 *      própria filha, então o índice conta essa informação duas vezes. É a
 *      leitura de "índice com o EBV do pai" que se usa no campo; o BLUP é a
 *      versão sem dupla contagem, e a validação mostra quanto isso pesa.
 *
 * Cada modelo devolve, por fêmea, duas coisas diferentes:
 *   `valor`     o que o ranking ordena (EBV para BLUP e índice, MPPA para a
 *               MPPA, a média dos desvios para a linha de base);
 *   `previsao`  o que ele espera da PRÓXIMA lactação, em desvio das
 *               contemporâneas — o que a validação compara. Para o BLUP é
 *               â + p̂; para o índice, a versão com alvo na capacidade de
 *               produção (ver capacidade_producao_femea em indices.ts).
 */

import { modeloRepetibilidade, variancias, type ResultadoRepetibilidade } from '@/lib/melhoramento/blup';
import { desviosDasContemporaneas, type Registro } from '@/lib/melhoramento/contemporaneas';
import { capacidade_producao_femea, fator_mppa, indice_femea } from '@/lib/melhoramento/indices';
import { media } from '@/lib/melhoramento/numerico';
import { podarPedigree, type PedigreeMontado } from '@/lib/melhoramento/parentesco';
import { modelosDaConfig, type ConfigAnalise, type ModeloInfo } from '@/lib/melhoramento/tipos';

export interface ResultadoFemea {
  valor: number;
  previsao: number;
  /** null quando o modelo não tem confiabilidade (linha de base) ou ela não pôde ser calculada. */
  confiabilidade: number | null;
  /** Lactações da fêmea que entraram. */
  n: number;
}

export interface ResultadoReprodutor {
  valor: number;
  confiabilidade: number | null;
  /** Filhas com pelo menos uma lactação nos registros. */
  filhas: number;
  lactacoesFilhas: number;
}

export interface ResumoBlup {
  modelo: string;
  metodo: ResultadoRepetibilidade['metodo'];
  incognitas: number;
  iteracoes: number | null;
  convergiu: boolean;
  pevCalculada: boolean;
}

export interface AjusteModelos {
  modelos: ModeloInfo[];
  registros: number;
  femeas: number;
  grupos: number;
  /** Escala (L² ou (L/dia)²); não muda EBV, ranking nem confiabilidade. */
  sigma2p: number | null;
  /** Por modelo → por fêmea. Fêmea sem desvio calculável não aparece. */
  femea: Map<string, Map<number, ResultadoFemea>>;
  /** Por modelo (só desvio_gc e BLUP) → por reprodutor. */
  reprodutor: Map<string, Map<number, ResultadoReprodutor>>;
  blup: ResumoBlup[];
  /** Por que algum modelo não rodou (sem variação, por exemplo). */
  avisos: string[];
}

export interface OpcoesAjuste {
  /** 'femeas_e_reprodutores' para o ranking; 'reprodutores' basta para a validação. */
  pev: 'femeas_e_reprodutores' | 'reprodutores';
}

export function ajustarModelos(
  registros: readonly Registro[],
  pedCompleto: PedigreeMontado,
  config: ConfigAnalise,
  opcoes: OpcoesAjuste,
): AjusteModelos {
  const modelos = modelosDaConfig(config);
  const femea = new Map<string, Map<number, ResultadoFemea>>();
  const reprodutor = new Map<string, Map<number, ResultadoReprodutor>>();
  const avisos: string[] = [];
  const blup: ResumoBlup[] = [];
  for (const m of modelos) femea.set(m.chave, new Map());

  const d = desviosDasContemporaneas(registros);
  const desviosDe = new Map<number, number[]>();
  const nDe = new Map<number, number>();
  registros.forEach((r, i) => {
    nDe.set(r.animalId, (nDe.get(r.animalId) ?? 0) + 1);
    const dv = d.desvio[i];
    if (dv == null) return;
    const lista = desviosDe.get(r.animalId) ?? [];
    lista.push(dv);
    desviosDe.set(r.animalId, lista);
  });

  // a) linha de base e b) MPPA
  for (const [animal, ds] of desviosDe) {
    const m = media(ds);
    femea.get('desvio_gc')!.set(animal, { valor: m, previsao: m, confiabilidade: null, n: ds.length });
    for (const r of config.rMppa) {
      const f = fator_mppa(ds.length, r);
      femea.get(`mppa_r${r}`)!.set(animal, { valor: f * m, previsao: f * m, confiabilidade: f, n: ds.length });
    }
  }

  // Pai de cada fêmea com registro, pelo pedigree já consertado.
  const paiDe = new Map<number, number>();
  for (const animal of nDe.keys()) {
    const i = pedCompleto.indice.get(animal);
    if (i != null && pedCompleto.pai[i] >= 0) paiDe.set(animal, pedCompleto.ids[pedCompleto.pai[i]]);
  }
  const filhasDe = new Map<number, number[]>();
  for (const [animal, pai] of paiDe) {
    const lista = filhasDe.get(pai) ?? [];
    lista.push(animal);
    filhasDe.set(pai, lista);
  }

  // Reprodutor na linha de base: média dos desvios de todas as lactações das filhas.
  const baseRep = new Map<number, ResultadoReprodutor>();
  for (const [pai, filhas] of filhasDe) {
    const ds = filhas.flatMap((f) => desviosDe.get(f) ?? []);
    if (ds.length === 0) continue;
    baseRep.set(pai, {
      valor: media(ds),
      confiabilidade: null,
      filhas: filhas.length,
      lactacoesFilhas: filhas.reduce((s, f) => s + (nDe.get(f) ?? 0), 0),
    });
  }
  reprodutor.set('desvio_gc', baseRep);

  const base = {
    modelos,
    registros: registros.length,
    femeas: nDe.size,
    grupos: d.mediaGrupo.size,
    sigma2p: d.sigma2p,
    femea,
    reprodutor,
    blup,
    avisos,
  };

  if (d.sigma2p == null) {
    avisos.push('Sem variação dentro dos grupos de contemporâneas: BLUP e índice não rodam.');
    return base;
  }

  // c) BLUP — sobre o pedigree podado às fêmeas com registro e seus ancestrais.
  const ped = podarPedigree(pedCompleto, nDe.keys());
  const indiceGrupo = new Map([...d.mediaGrupo.keys()].map((g, i) => [g, i]));
  const regsBlup = registros.map((r) => ({
    animal: ped.indice.get(r.animalId)!,
    grupo: indiceGrupo.get(r.grupo)!,
    y: r.y,
  }));
  const posFemeas = [...nDe.keys()].map((a) => ped.indice.get(a)!);
  const posPais = [...filhasDe.keys()].map((p) => ped.indice.get(p)!).filter((p) => p != null);
  const pevPara = opcoes.pev === 'femeas_e_reprodutores' ? [...new Set([...posFemeas, ...posPais])] : posPais;
  const sigmaP = Math.sqrt(d.sigma2p);
  const finitoOuNull = (x: number) => (Number.isFinite(x) ? x : null);

  for (const h2 of config.h2) {
    const chaveBlup = `blup_h2${h2}_r${config.rBlup}`;
    const chaveIndice = `indice_h2${h2}_r${config.rBlup}`;
    const res = modeloRepetibilidade(ped, regsBlup, indiceGrupo.size, variancias(h2, config.rBlup, d.sigma2p), {
      pevPara,
      limiteDenso: config.limiteDenso,
    });
    blup.push({
      modelo: chaveBlup,
      metodo: res.metodo,
      incognitas: res.incognitas,
      iteracoes: res.iteracoes,
      convergiu: res.convergiu,
      pevCalculada: res.pevCalculada,
    });
    if (!res.convergiu) avisos.push(`${chaveBlup}: Gauss-Seidel não convergiu no teto de voltas.`);

    const porFemea = femea.get(chaveBlup)!;
    for (const [animal, n] of nDe) {
      const i = ped.indice.get(animal)!;
      porFemea.set(animal, {
        valor: res.ebv[i],
        previsao: res.ebv[i] + res.pe[i],
        confiabilidade: finitoOuNull(res.confiabilidade[i]),
        n,
      });
    }
    const porRep = new Map<number, ResultadoReprodutor>();
    for (const [pai, filhas] of filhasDe) {
      const i = ped.indice.get(pai);
      if (i == null) continue;
      porRep.set(pai, {
        valor: res.ebv[i],
        confiabilidade: finitoOuNull(res.confiabilidade[i]),
        filhas: filhas.length,
        lactacoesFilhas: filhas.reduce((s, f) => s + (nDe.get(f) ?? 0), 0),
      });
    }
    reprodutor.set(chaveBlup, porRep);

    // d) índice da fêmea com o EBV do pai deste BLUP.
    const porIndice = femea.get(chaveIndice)!;
    for (const [animal, ds] of desviosDe) {
      const pai = paiDe.get(animal);
      const ip = pai != null ? ped.indice.get(pai) : undefined;
      const relPai = ip != null ? res.confiabilidade[ip] : Number.NaN;
      const temPai = ip != null && Number.isFinite(relPai) && relPai > 0;
      const ebvPai = temPai ? res.ebv[ip!] : null;
      const rel = temPai ? relPai : 0;
      const ind = indice_femea(ds, h2, config.rBlup, sigmaP, ebvPai, rel, 'EBV');
      const pa = capacidade_producao_femea(ds, h2, config.rBlup, sigmaP, ebvPai, rel, 'EBV');
      porIndice.set(animal, { valor: ind.ebv, previsao: pa.ebv, confiabilidade: ind.confiabilidade, n: ds.length });
    }
  }
  if (blup.some((b) => !b.pevCalculada)) {
    avisos.push(
      'Fazenda grande demais para a matriz densa: o BLUP foi resolvido por Gauss-Seidel e a PEV não foi ' +
        'calculada — sem confiabilidade do BLUP, e o índice da fêmea usa só os registros próprios.',
    );
  }
  return base;
}
