/**
 * Grupos reprodutivos: quanto rebanho sustenta uma meta de lactantes.
 *
 * O CONCEITO (Felipe, 28/09/2026), genérico — não é o rebanho de ninguém:
 * a cada `intervaloGrupos` dias abre um grupo de cobertura, com estação de
 * `duracaoEstacao` dias. A matriz volta para a cobertura ao completar
 * `diasPosParto` dias de parida e entra no grupo que estiver aberto (ou no
 * próximo). A cabrita entra com `idadeCabritaMeses`. Quem não emprenha
 * passa para o grupo seguinte. Gestação `gestacaoDias`; seca
 * `secaAntesDias` antes do parto. Cada parto dá `prolificidade` crias, com
 * `femeas` de fêmeas, e `mortalidade` delas morre na recria. Todo ano
 * `reposicaoAnual` das matrizes sai (descarte) e é reposta por cabritas.
 *
 * COMO CALCULA: o rebanho de matrizes é simulado dia a dia, em coortes
 * (grupos de cabras com as mesmas datas), com 100 matrizes fixas —
 * descarte e reposição se equilibram — por vários anos, até o ritmo dos
 * grupos se estabelecer. Do último ano sai quantas estão em lactação,
 * secas e vazias. O modelo é linear no tamanho do rebanho, então a meta
 * de lactantes só escala o resultado. A recria é conta de fluxo: as
 * cabritas necessárias para a reposição ficam no rebanho do nascimento
 * até a cobertura; as demais são excedente (venda).
 */

export interface ParametrosGrupos {
  /** Lactantes que o rebanho deve sustentar, em média. */
  metaLactantes: number;
  /** L/cabra/dia, para converter lactantes em litros. */
  mediaLitros: number;
  /** Dias entre a abertura de um grupo e a do seguinte (30 a 90 é o comum). */
  intervaloGrupos: number;
  /** Dias de cada estação de monta (não passa do intervalo). */
  duracaoEstacao: number;
  /** A matriz volta a ser coberta com tantos dias de parida (30 a 210 é o comum). */
  diasPosParto: number;
  idadeCabritaMeses: number;
  /** Só informativo: o peso mínimo que o criador usa junto com a idade. */
  pesoCabritaKg: number;
  gestacaoDias: number;
  secaAntesDias: number;
  /** 0 a 1: fração das cobertas que emprenham em cada grupo. */
  prenhez: number;
  /** Crias por parto. */
  prolificidade: number;
  /** 0 a 1: fração de fêmeas nas crias. */
  femeas: number;
  /** 0 a 1: mortalidade das crias até entrarem na reprodução. */
  mortalidade: number;
  /** 0 a 1: fração das matrizes adultas repostas por ano. */
  reposicaoAnual: number;
  /** Matrizes por reprodutor (monta natural). */
  matrizesPorReprodutor: number;
  /** Idade (meses) com que as cabritas que não vão para a reposição saem do rebanho (venda). */
  saidaExcedenteMeses: number;
  /** Idade (meses) com que os cabritos machos saem do rebanho. */
  saidaMachosMeses: number;
}

export const GRUPOS_PADRAO: ParametrosGrupos = {
  metaLactantes: 70,
  mediaLitros: 2.8,
  intervaloGrupos: 90,
  duracaoEstacao: 45,
  diasPosParto: 210,
  idadeCabritaMeses: 7,
  pesoCabritaKg: 35,
  gestacaoDias: 150,
  secaAntesDias: 60,
  prenhez: 0.95,
  prolificidade: 1.5,
  femeas: 0.5,
  mortalidade: 0,
  reposicaoAnual: 0.2,
  matrizesPorReprodutor: 25,
  saidaExcedenteMeses: 7,
  saidaMachosMeses: 3,
};

export interface Faixa {
  min: number;
  media: number;
  max: number;
}

export interface GrupoNoAno {
  /** Ordem do grupo no ano (1, 2, …). */
  numero: number;
  /** Dia do ano (0 = abertura do 1º grupo) em que a estação abre. */
  abre: number;
  coberturas: number;
  /** Das cobertas, quantas são cabritas (primeira cobertura). */
  cabritas: number;
  prenhes: number;
  /** Dia do ano do primeiro e do último parto deste grupo. */
  partoDe: number;
  partoAte: number;
}

export interface ResultadoGrupos {
  matrizes: number;
  lactantes: Faixa;
  /** Gestantes nos últimos `secaAntesDias` dias: fora da ordenha. */
  secas: Faixa;
  /** Novilhas (1ª gestação) ainda antes de secar: não lactam, não pariram. */
  novilhasPrenhes: Faixa;
  /** Nem lactando nem gestante (esperando cobertura, vazias do repasse). */
  vazias: Faixa;
  /** Fração média das matrizes em lactação. */
  fracaoLactacao: number;
  litrosSemana: Faixa;
  /** Dias médios entre partos de uma matriz. */
  intervaloPartos: number;
  /** Dias médios de lactação. */
  diasLactacao: number;
  grupos: GrupoNoAno[];
  partosAno: number;
  cabritasNascidasAno: number;
  cabritasVivasAno: number;
  reposicaoAno: number;
  excedenteCabritasAno: number;
  /** Cabritas de reposição no rebanho em média (do nascimento à cobertura). */
  recria: number;
  /** Cabritas excedentes no rebanho em média, até a idade de saída. */
  cabritasExcedentes: number;
  cabritosMachosAno: number;
  /** Cabritos machos no rebanho em média, até a idade de saída. */
  cabritosMachos: number;
  reprodutores: number;
  total: number;
  /** Lactantes ÷ rebanho total. */
  pctLactacao: number;
  /** Lactantes por semana ao longo de um ano (para o gráfico). */
  serie: Array<{ semana: number; lactantes: number; secas: number; vazias: number }>;
  /** Dias do período medido (um número inteiro de grupos, perto de um ano). */
  periodo: number;
  alertas: string[];
}

const ANOS = 8;
const BASE = 100;

interface Coorte {
  qtd: number;
  /** Dia do último parto (null = nunca pariu: cabrita/novilha). */
  parto: number | null;
  /** Dia da concepção da gestação atual (null = vazia). */
  concep: number | null;
  /** A partir deste dia pode ser coberta. */
  apta: number;
  /** Índice do último grupo em que foi tentada (para não cobrir duas vezes no mesmo grupo). */
  tentou: number;
  /** Primeira cobertura (cabrita de reposição). */
  cabrita: boolean;
}

function lim(n: number, min: number, max: number): number {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
}

/** Normaliza os parâmetros: fora da faixa vai para o limite, lixo vai para o padrão. */
export function normalizarGrupos(bruto: unknown): ParametrosGrupos {
  const b = (bruto && typeof bruto === 'object' ? bruto : {}) as Partial<Record<keyof ParametrosGrupos, unknown>>;
  const n = (k: keyof ParametrosGrupos, min: number, max: number) => {
    const v = b[k];
    return typeof v === 'number' && Number.isFinite(v) ? lim(v, min, max) : GRUPOS_PADRAO[k];
  };
  const intervalo = Math.round(n('intervaloGrupos', 15, 180));
  return {
    metaLactantes: n('metaLactantes', 1, 5000),
    mediaLitros: n('mediaLitros', 0, 20),
    intervaloGrupos: intervalo,
    duracaoEstacao: Math.round(lim(n('duracaoEstacao', 1, 180), 1, intervalo)),
    diasPosParto: Math.round(n('diasPosParto', 20, 400)),
    idadeCabritaMeses: n('idadeCabritaMeses', 4, 24),
    pesoCabritaKg: n('pesoCabritaKg', 0, 100),
    gestacaoDias: Math.round(n('gestacaoDias', 140, 160)),
    secaAntesDias: Math.round(n('secaAntesDias', 0, 120)),
    prenhez: n('prenhez', 0.05, 1),
    prolificidade: n('prolificidade', 0, 4),
    femeas: n('femeas', 0, 1),
    mortalidade: n('mortalidade', 0, 1),
    reposicaoAnual: n('reposicaoAnual', 0, 1),
    matrizesPorReprodutor: n('matrizesPorReprodutor', 1, 200),
    saidaExcedenteMeses: n('saidaExcedenteMeses', 0, 24),
    saidaMachosMeses: n('saidaMachosMeses', 0, 24),
  };
}

export function calcularGrupos(entrada: ParametrosGrupos): ResultadoGrupos {
  const p = normalizarGrupos(entrada);
  const I = p.intervaloGrupos;
  const E = p.duracaoEstacao;
  const G = p.gestacaoDias;
  const S = Math.min(p.secaAntesDias, G);
  const D = p.diasPosParto;
  // Período medido: um número inteiro de grupos perto de um ano (4 × 90 = 360, 12 × 30 = 360),
  // começando na abertura de um grupo — assim cada grupo aparece uma vez.
  const nGrupos = Math.max(1, Math.round(365 / I));
  const periodo = nGrupos * I;
  const medirDesde = Math.ceil(((ANOS - 1) * 365) / periodo) * periodo;
  const medirAte = medirDesde + periodo;
  const descarteDia = p.reposicaoAnual / 365;

  // Partida com os grupos do MESMO tamanho: o criador monta os grupos assim. Cada grupo
  // pariu no ano anterior, espalhado nos dias da sua estação.
  let coortes: Coorte[] = [];
  for (let g = 0; g < nGrupos; g++) {
    for (let d = 0; d < E; d++) {
      const parto = g * I + d + G - periodo;
      coortes.push({ qtd: BASE / (nGrupos * E), parto, concep: null, apta: parto + D, tentou: -1, cabrita: false });
    }
  }

  const soma = { lact: 0, secas: 0, novilhas: 0, vazias: 0, dias: 0 };
  const faixas = { lact: [Infinity, -Infinity], secas: [Infinity, -Infinity], novilhas: [Infinity, -Infinity], vazias: [Infinity, -Infinity] };
  const serie: ResultadoGrupos['serie'] = [];
  const grupos = new Map<number, GrupoNoAno>();
  let partosMedidos = 0;
  let somaIntervalo = 0;
  let pesoIntervalo = 0;
  let somaLactacao = 0;
  let pesoLactacao = 0;

  for (let dia = 0; dia < medirAte + G + E; dia++) {
    const indiceGrupo = Math.floor(dia / I);
    const naEstacao = dia - indiceGrupo * I < E;
    const medindo = dia >= medirDesde && dia < medirAte;

    // Descarte contínuo, proporcional em todos os estados.
    if (descarteDia > 0) for (const c of coortes) c.qtd *= 1 - descarteDia;

    // Reposição: na abertura de cada grupo entram cabritas para voltar às 100 matrizes.
    if (dia % I === 0) {
      const falta = BASE - coortes.reduce((t, c) => t + c.qtd, 0);
      if (falta > 1e-9) coortes.push({ qtd: falta, parto: null, concep: null, apta: dia, tentou: -1, cabrita: true });
    }

    const proximas: Coorte[] = [];
    for (const c of coortes) {
      // Parto
      if (c.concep != null && dia === c.concep + G) {
        if (c.parto != null && medindo) {
          somaIntervalo += (dia - c.parto) * c.qtd;
          pesoIntervalo += c.qtd;
        }
        if (c.parto != null && medindo) {
          somaLactacao += (c.concep + G - S - c.parto) * c.qtd;
          pesoLactacao += c.qtd;
        }
        if (medindo) partosMedidos += c.qtd;
        c.parto = dia;
        c.concep = null;
        c.apta = dia + D;
        c.cabrita = false;
      }
      // Cobertura: vazia, apta e ainda não tentada neste grupo.
      if (naEstacao && c.concep == null && c.apta <= dia && c.tentou !== indiceGrupo) {
        const prenhes = c.qtd * p.prenhez;
        if (medindo) {
          const numero = indiceGrupo;
          const g = grupos.get(numero) ?? { numero, abre: numero * I, coberturas: 0, cabritas: 0, prenhes: 0, partoDe: Infinity, partoAte: -Infinity };
          g.coberturas += c.qtd;
          if (c.cabrita) g.cabritas += c.qtd;
          g.prenhes += prenhes;
          g.partoDe = Math.min(g.partoDe, dia + G);
          g.partoAte = Math.max(g.partoAte, dia + G);
          grupos.set(numero, g);
        }
        if (prenhes > 0) proximas.push({ ...c, qtd: prenhes, concep: dia, tentou: indiceGrupo });
        const falhas = c.qtd - prenhes;
        if (falhas > 1e-12) proximas.push({ ...c, qtd: falhas, tentou: indiceGrupo });
        continue;
      }
      proximas.push(c);
    }
    coortes = juntar(proximas);

    if (medindo) {
      let lact = 0;
      let secas = 0;
      let novilhas = 0;
      let vazias = 0;
      for (const c of coortes) {
        const secou = c.concep != null && dia >= c.concep + G - S;
        if (secou) secas += c.qtd;
        else if (c.parto != null) lact += c.qtd;
        else if (c.concep != null) novilhas += c.qtd;
        else vazias += c.qtd;
      }
      soma.lact += lact;
      soma.secas += secas;
      soma.novilhas += novilhas;
      soma.vazias += vazias;
      soma.dias++;
      const faixa = (f: number[], v: number) => [Math.min(f[0], v), Math.max(f[1], v)];
      faixas.lact = faixa(faixas.lact, lact);
      faixas.secas = faixa(faixas.secas, secas);
      faixas.novilhas = faixa(faixas.novilhas, novilhas);
      faixas.vazias = faixa(faixas.vazias, vazias);
      if ((dia - medirDesde) % 7 === 0) serie.push({ semana: (dia - medirDesde) / 7, lactantes: lact, secas, vazias });
    }
  }

  const fracao = soma.lact / soma.dias / BASE;
  const escala = fracao > 0 ? p.metaLactantes / (fracao * BASE) : 0;
  const matrizes = BASE * escala;
  const faixa = (f: number[], total: number): Faixa => ({ min: f[0] * escala, media: (total / soma.dias) * escala, max: f[1] * escala });
  const lactantes = faixa(faixas.lact, soma.lact);

  const partosAno = (partosMedidos * escala * 365) / periodo;
  const cabritasNascidasAno = partosAno * p.prolificidade * p.femeas;
  const cabritasVivasAno = cabritasNascidasAno * (1 - p.mortalidade);
  const reposicaoAno = matrizes * p.reposicaoAnual;
  const excedenteCabritasAno = Math.max(0, cabritasVivasAno - reposicaoAno);
  const cabritosMachosAno = partosAno * p.prolificidade * (1 - p.femeas) * (1 - p.mortalidade);
  // Estoque médio = entradas por ano × tempo que fica (Little). A reposição fica até a cobertura.
  const recria = reposicaoAno * (p.idadeCabritaMeses / 12);
  const cabritasExcedentes = excedenteCabritasAno * (p.saidaExcedenteMeses / 12);
  const cabritosMachos = cabritosMachosAno * (p.saidaMachosMeses / 12);
  const reprodutores = matrizes > 0 ? Math.ceil(matrizes / p.matrizesPorReprodutor) : 0;
  const total = matrizes + recria + cabritasExcedentes + cabritosMachos + reprodutores;

  // Grupos do ano medido: os que abrem dentro dele, numerados a partir de 1.
  const primeiroGrupo = medirDesde / I;
  const gruposAno = [...grupos.values()]
    .filter((g) => g.abre >= medirDesde && g.abre < medirAte)
    .sort((a, b) => a.numero - b.numero)
    .map((g) => ({
      numero: g.numero - primeiroGrupo + 1,
      abre: g.abre - medirDesde,
      coberturas: g.coberturas * escala,
      cabritas: g.cabritas * escala,
      prenhes: g.prenhes * escala,
      partoDe: g.partoDe - medirDesde,
      partoAte: g.partoAte - medirDesde,
    }));

  const alertas: string[] = [];
  if (cabritasVivasAno + 1e-9 < reposicaoAno) {
    alertas.push(
      `As cabritas que nascem (${cabritasVivasAno.toFixed(0)}/ano) não repõem o descarte (${reposicaoAno.toFixed(0)}/ano): vai precisar comprar matrizes ou baixar a reposição.`,
    );
  }
  if (p.diasPosParto + p.gestacaoDias - S <= 0) alertas.push('Com esses dias, a cabra seca antes de parir: confira dias pós-parto e seca.');
  if (lactantes.max - lactantes.min > 0.3 * lactantes.media) {
    alertas.push('As lactantes variam mais de 30% ao longo do ano: grupos mais próximos ou estação mais longa deixam a produção mais homogênea.');
  }

  return {
    matrizes,
    lactantes,
    secas: faixa(faixas.secas, soma.secas),
    novilhasPrenhes: faixa(faixas.novilhas, soma.novilhas),
    vazias: faixa(faixas.vazias, soma.vazias),
    fracaoLactacao: fracao,
    litrosSemana: { min: lactantes.min * p.mediaLitros * 7, media: lactantes.media * p.mediaLitros * 7, max: lactantes.max * p.mediaLitros * 7 },
    intervaloPartos: pesoIntervalo ? somaIntervalo / pesoIntervalo : 0,
    diasLactacao: pesoLactacao ? somaLactacao / pesoLactacao : 0,
    grupos: gruposAno,
    partosAno,
    cabritasNascidasAno,
    cabritasVivasAno,
    reposicaoAno,
    excedenteCabritasAno,
    recria,
    cabritasExcedentes,
    cabritosMachosAno,
    cabritosMachos,
    reprodutores,
    total,
    pctLactacao: total > 0 ? lactantes.media / total : 0,
    serie: serie.map((s) => ({ semana: s.semana, lactantes: s.lactantes * escala, secas: s.secas * escala, vazias: s.vazias * escala })),
    periodo,
    alertas,
  };
}

/** Junta coortes com as mesmas datas — sem isso o número de coortes cresce a cada grupo. */
function juntar(coortes: Coorte[]): Coorte[] {
  const mapa = new Map<string, Coorte>();
  for (const c of coortes) {
    if (c.qtd < 1e-9) continue;
    const chave = `${c.parto}|${c.concep}|${c.apta}|${c.tentou}|${c.cabrita ? 1 : 0}`;
    const existente = mapa.get(chave);
    if (existente) existente.qtd += c.qtd;
    else mapa.set(chave, { ...c });
  }
  return [...mapa.values()];
}
