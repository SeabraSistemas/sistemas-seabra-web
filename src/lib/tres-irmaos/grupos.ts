import { diasEntre, somarMeses } from '@/lib/tres-irmaos/datas';

/**
 * Grupos reprodutivos: quanto rebanho sustenta uma meta de lactantes.
 *
 * O CONCEITO (Felipe, 28/09/2026), genérico — não é o rebanho de ninguém:
 * abre um grupo de cobertura a cada `intervaloMeses` meses a partir do 1º
 * grupo — ou nos meses do ano que o criador escolher (`mesesCobertura`) —,
 * com estação de `duracaoEstacao` dias. A matriz volta para a cobertura ao completar
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
  /**
   * Dia em que o 1º grupo abre ("aaaa-mm-dd"). Os grupos abrem sempre nesse
   * dia do mês. Vazio = a tela sugere o dia 1 do mês que vem. O resultado é
   * o rebanho já em ritmo, com o calendário a partir dessa data.
   */
  inicioPrimeiroGrupo: string;
  /** 'intervalo' = um grupo a cada `intervaloMeses`; 'meses' = nos meses marcados. */
  calendario: 'intervalo' | 'meses';
  /** De quantos em quantos meses abre um grupo (2, 3…). */
  intervaloMeses: number;
  /** Meses do ano com cobertura (1 = janeiro … 12 = dezembro), no modo 'meses'. */
  mesesCobertura: number[];
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
  /** Matrizes por reprodutor (monta natural): dá a sugestão de bodes por grupo. */
  matrizesPorReprodutor: number;
  /** Bodes em cada grupo. 0 = automático: cobertas do grupo ÷ matrizes por bode. */
  bodesPorGrupo: number;
  /**
   * true = os mesmos bodes servem a todos os grupos (as estações não se
   * sobrepõem), então o rebanho precisa do maior grupo; false = cada grupo
   * tem os seus (ex.: para trocar a genética), e os bodes somam.
   */
  bodesCompartilhados: boolean;
  /** Idade (meses) com que as cabritas que não vão para a reposição saem do rebanho (venda). */
  saidaExcedenteMeses: number;
  /** Idade (meses) com que os cabritos machos saem do rebanho. */
  saidaMachosMeses: number;
  /**
   * 0 a 1: fração do rebanho TOTAL que deve estar em lactação (Lucas: 55%).
   * 0 = desligado (usa as idades de saída acima). Ligado, o rebanho total é
   * lactantes ÷ meta, e as idades de saída das cabritas que sobram e dos
   * machos passam a ser CALCULADAS: é o espaço que sobra depois de matrizes,
   * recria e reprodutores, que a biologia fixa.
   */
  metaPctLactacao: number;
}

export const GRUPOS_PADRAO: ParametrosGrupos = {
  metaLactantes: 70,
  mediaLitros: 2.8,
  inicioPrimeiroGrupo: '',
  calendario: 'intervalo',
  intervaloMeses: 3,
  mesesCobertura: [1, 4, 7, 10],
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
  bodesPorGrupo: 0,
  bodesCompartilhados: true,
  saidaExcedenteMeses: 7,
  saidaMachosMeses: 3,
  metaPctLactacao: 0.55,
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
  /** Bodes que o grupo usa. */
  bodes: number;
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
  /** Com a meta de % ligada: idade (meses) com que cabritas que sobram e machos precisam sair. null = meta desligada. */
  saidaCalculadaMeses: number | null;
  /** Maior % possível: vendendo as crias que sobram ao nascer. */
  pctMaximo: number;
  /** Lactantes por semana ao longo de um ano (para o gráfico). */
  serie: Array<{ semana: number; lactantes: number; secas: number; vazias: number }>;
  /** Data de referência usada (o 1º grupo, ou o padrão quando vazio). */
  inicio: string;
  alertas: string[];
}

const ANOS = 8;
const BASE = 100;
/**
 * Ciclo estral da cabra: quem já está esperando quando o grupo abre entra
 * no cio ao longo dos primeiros 21 dias da estação, não toda no primeiro
 * dia. Sem isso, com 210 dias de parida (todas já aptas na abertura) os
 * partos de um grupo cabiam em uma semana.
 */
const CICLO_ESTRAL = 21;

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
  type Numerico = Exclude<keyof ParametrosGrupos, 'inicioPrimeiroGrupo' | 'calendario' | 'mesesCobertura' | 'bodesCompartilhados'>;
  const n = (k: Numerico, min: number, max: number) => {
    const v = b[k];
    return typeof v === 'number' && Number.isFinite(v) ? lim(v, min, max) : (GRUPOS_PADRAO[k] as number);
  };
  const meses = Array.isArray(b.mesesCobertura)
    ? [...new Set(b.mesesCobertura.filter((m): m is number => Number.isInteger(m) && m >= 1 && m <= 12))].sort((x, y) => x - y)
    : [];
  const inicio = typeof b.inicioPrimeiroGrupo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.inicioPrimeiroGrupo) ? b.inicioPrimeiroGrupo : '';
  // Salvo antes de 28/09 com o intervalo em dias: converte para meses.
  const intervaloDias = (b as Record<string, unknown>).intervaloGrupos;
  const intervaloMeses =
    typeof b.intervaloMeses === 'number' ? Math.round(n('intervaloMeses', 1, 12)) : typeof intervaloDias === 'number' ? Math.round(lim(intervaloDias / 30.4, 1, 12)) : GRUPOS_PADRAO.intervaloMeses;
  return {
    metaLactantes: n('metaLactantes', 1, 5000),
    mediaLitros: n('mediaLitros', 0, 20),
    inicioPrimeiroGrupo: inicio,
    calendario: b.calendario === 'meses' ? 'meses' : 'intervalo',
    intervaloMeses,
    mesesCobertura: meses.length ? meses : GRUPOS_PADRAO.mesesCobertura,
    duracaoEstacao: Math.round(n('duracaoEstacao', 1, 180)),
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
    bodesPorGrupo: Math.round(n('bodesPorGrupo', 0, 100)),
    bodesCompartilhados: typeof b.bodesCompartilhados === 'boolean' ? b.bodesCompartilhados : GRUPOS_PADRAO.bodesCompartilhados,
    saidaExcedenteMeses: n('saidaExcedenteMeses', 0, 24),
    saidaMachosMeses: n('saidaMachosMeses', 0, 24),
    metaPctLactacao: n('metaPctLactacao', 0, 1),
  };
}

/** Data usada quando o 1º grupo está em branco (só para a conta não depender de "hoje"). */
const INICIO_PADRAO = '2026-01-01';

/**
 * Dias (relativos ao 1º grupo, que é o dia 0) em que um grupo abre, de `de` a `ate`.
 * O dia do mês é sempre o do 1º grupo (dia 31 vira o último dia dos meses curtos).
 */
export function aberturas(p: ParametrosGrupos, inicio: string, de: number, ate: number): number[] {
  const dias = new Set<number>();
  if (p.calendario === 'meses') {
    const ano = Number(inicio.slice(0, 4));
    const base = (a: number) => `${a}-01-${inicio.slice(8, 10)}`;
    const anos = Math.ceil(Math.max(-de, ate) / 365) + 1;
    for (let a = ano - anos; a <= ano + anos; a++) for (const m of p.mesesCobertura) dias.add(diasEntre(inicio, somarMeses(base(a), m - 1)));
  } else {
    const passos = Math.ceil((Math.max(-de, ate) / 365) * (12 / p.intervaloMeses)) + 2;
    for (let k = -passos; k <= passos; k++) dias.add(diasEntre(inicio, somarMeses(inicio, k * p.intervaloMeses)));
  }
  return [...dias].filter((d) => d >= de && d <= ate).sort((a, b) => a - b);
}

export function calcularGrupos(entrada: ParametrosGrupos): ResultadoGrupos {
  const p = normalizarGrupos(entrada);
  const inicio = p.inicioPrimeiroGrupo || INICIO_PADRAO;
  const G = p.gestacaoDias;
  const S = Math.min(p.secaAntesDias, G);
  const D = p.diasPosParto;
  // O dia 0 é o 1º grupo; mede-se um ano a partir dele, depois de ANOS−1 anos de ritmo.
  const T0 = -(ANOS - 1) * 365;
  const medirDesde = 0;
  const medirAte = 365;
  const descarteDia = p.reposicaoAnual / 365;

  // Janelas de cobertura: [abertura, fim), com a estação cortada na abertura seguinte.
  const abre = aberturas(p, inicio, T0 - 400, medirAte + 400);
  const fimJanela = abre.map((a, k) => Math.min(a + p.duracaoEstacao, abre[k + 1] ?? Infinity));
  const aberturaSet = new Set(abre);

  // Partida com os grupos do MESMO tamanho: o criador monta os grupos assim. Cada grupo
  // do primeiro ano simulado pariu um ano antes, espalhado nos dias da sua estação.
  let coortes: Coorte[] = [];
  const doPrimeiroAno = abre.map((a, k) => ({ a, k })).filter(({ a }) => a >= T0 && a < T0 + 365);
  for (const { a, k } of doPrimeiroAno) {
    const dur = fimJanela[k] - a;
    for (let d = 0; d < dur; d++) {
      const parto = a + d + G - 365;
      coortes.push({ qtd: BASE / (doPrimeiroAno.length * dur), parto, concep: null, apta: parto + D, tentou: -1, cabrita: false });
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

  let w = abre.findIndex((a) => a > T0) - 1;
  // Passa do ano medido só para fechar a estação do último grupo dele.
  for (let dia = T0; dia < medirAte + 200; dia++) {
    while (w + 1 < abre.length && abre[w + 1] <= dia) w++;
    const indiceGrupo = w;
    const naEstacao = w >= 0 && dia < fimJanela[w];
    const medindo = dia >= medirDesde && dia < medirAte;

    // Descarte contínuo, proporcional em todos os estados.
    if (descarteDia > 0) for (const c of coortes) c.qtd *= 1 - descarteDia;

    // Reposição: na abertura de cada grupo entram cabritas para voltar às 100 matrizes.
    if (aberturaSet.has(dia)) {
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
      // Cobertura: vazia, apta e ainda não tentada neste grupo. Quem já esperava na abertura
      // é coberta aos poucos nos primeiros dias da estação (ciclo estral); quem fica apta
      // durante a estação, no dia em que fica.
      if (naEstacao && c.concep == null && c.apta <= dia && c.tentou !== indiceGrupo) {
        const j = dia - abre[w];
        const ciclo = Math.min(CICLO_ESTRAL, fimJanela[w] - abre[w]);
        const fracao = c.apta > abre[w] || j >= ciclo ? 1 : 1 / (ciclo - j);
        const cobertas = c.qtd * fracao;
        const esperando = c.qtd - cobertas;
        if (esperando > 1e-12) proximas.push({ ...c, qtd: esperando });
        const prenhes = cobertas * p.prenhez;
        if (abre[indiceGrupo] >= medirDesde && abre[indiceGrupo] < medirAte) {
          const numero = indiceGrupo;
          const g = grupos.get(numero) ?? { numero, abre: abre[numero], coberturas: 0, cabritas: 0, prenhes: 0, bodes: 0, partoDe: Infinity, partoAte: -Infinity };
          g.coberturas += cobertas;
          if (c.cabrita) g.cabritas += cobertas;
          g.prenhes += prenhes;
          g.partoDe = Math.min(g.partoDe, dia + G);
          g.partoAte = Math.max(g.partoAte, dia + G);
          grupos.set(numero, g);
        }
        if (prenhes > 0) proximas.push({ ...c, qtd: prenhes, concep: dia, tentou: indiceGrupo });
        const falhas = cobertas - prenhes;
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

  const partosAno = partosMedidos * escala;
  const cabritasNascidasAno = partosAno * p.prolificidade * p.femeas;
  const cabritasVivasAno = cabritasNascidasAno * (1 - p.mortalidade);
  const reposicaoAno = matrizes * p.reposicaoAnual;
  const excedenteCabritasAno = Math.max(0, cabritasVivasAno - reposicaoAno);
  const cabritosMachosAno = partosAno * p.prolificidade * (1 - p.femeas) * (1 - p.mortalidade);
  // Estoque médio = entradas por ano × tempo que fica (Little). A reposição fica até a cobertura.
  const recria = reposicaoAno * (p.idadeCabritaMeses / 12);
  // Bodes por grupo: fixado pelo criador, ou cobertas ÷ matrizes por bode (arredondado para cima).
  const bodesDe = (coberturas: number) => (p.bodesPorGrupo > 0 ? p.bodesPorGrupo : Math.max(1, Math.ceil(coberturas / p.matrizesPorReprodutor - 1e-9)));
  const bodesGrupos = [...grupos.values()].filter((g) => g.abre >= medirDesde && g.abre < medirAte).map((g) => bodesDe(g.coberturas * escala));
  const reprodutores = matrizes <= 0 || bodesGrupos.length === 0 ? 0 : p.bodesCompartilhados ? Math.max(...bodesGrupos) : bodesGrupos.reduce((t, b) => t + b, 0);
  const fixo = matrizes + recria + reprodutores; // a biologia manda: não dá para ter menos
  const pctMaximo = fixo > 0 ? lactantes.media / fixo : 0;

  // Com a meta de %, o rebanho total é lactantes ÷ meta; o espaço que sobra é das crias até a venda.
  let saidaExcedente = p.saidaExcedenteMeses;
  let saidaMachos = p.saidaMachosMeses;
  let saidaCalculadaMeses: number | null = null;
  if (p.metaPctLactacao > 0) {
    const vagas = lactantes.media / p.metaPctLactacao - fixo;
    const fluxo = excedenteCabritasAno + cabritosMachosAno;
    saidaCalculadaMeses = vagas <= 0 || fluxo <= 0 ? 0 : Math.min(24, (vagas * 12) / fluxo);
    saidaExcedente = saidaCalculadaMeses;
    saidaMachos = saidaCalculadaMeses;
  }
  const cabritasExcedentes = excedenteCabritasAno * (saidaExcedente / 12);
  const cabritosMachos = cabritosMachosAno * (saidaMachos / 12);
  const total = fixo + cabritasExcedentes + cabritosMachos;

  // Grupos do ano medido: os que abrem dentro dele, numerados a partir de 1.
  const gruposAno = [...grupos.values()]
    .filter((g) => g.abre >= medirDesde && g.abre < medirAte)
    .sort((a, b) => a.numero - b.numero)
    .map((g, k) => ({
      numero: k + 1,
      abre: g.abre - medirDesde,
      coberturas: g.coberturas * escala,
      cabritas: g.cabritas * escala,
      prenhes: g.prenhes * escala,
      bodes: bodesDe(g.coberturas * escala),
      partoDe: g.partoDe - medirDesde,
      partoAte: g.partoAte - medirDesde,
    }));

  const alertas: string[] = [];
  if (p.metaPctLactacao > 0 && pctMaximo + 1e-9 < p.metaPctLactacao) {
    alertas.push(
      `${Math.round(p.metaPctLactacao * 100)}% em lactação não fecha com esses números: só matrizes, recria e reprodutores já dão ${Math.round(pctMaximo * 100)}%, mesmo vendendo as crias que sobram ao nascer.`,
    );
  }
  if (saidaCalculadaMeses != null && saidaCalculadaMeses >= 24) {
    alertas.push(`Para ${Math.round(p.metaPctLactacao * 100)}% em lactação, as crias que sobram poderiam ficar mais de 2 anos: o rebanho tem espaço de sobra para crescer.`);
  }
  if (cabritasVivasAno + 1e-9 < reposicaoAno) {
    alertas.push(
      `As cabritas que nascem (${cabritasVivasAno.toFixed(0)}/ano) não repõem o descarte (${reposicaoAno.toFixed(0)}/ano): vai precisar comprar matrizes ou baixar a reposição.`,
    );
  }
  if (p.diasPosParto + p.gestacaoDias - S <= 0) alertas.push('Com esses dias, a cabra seca antes de parir: confira dias pós-parto e seca.');
  const tamanhos = gruposAno.map((g) => g.coberturas);
  if (tamanhos.length > 1 && Math.min(...tamanhos) < 0.6 * Math.max(...tamanhos)) {
    alertas.push(
      `Os grupos ficam desiguais (de ${Math.round(Math.min(...tamanhos))} a ${Math.round(Math.max(...tamanhos))} cobertas): com ${p.diasPosParto} dias de parida, a cabra volta num mês que não casa com o calendário. Ajuste os meses ou os dias pós-parto.`,
    );
  }
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
    saidaCalculadaMeses,
    pctMaximo,
    serie: serie.map((s) => ({ semana: s.semana, lactantes: s.lactantes * escala, secas: s.secas * escala, vazias: s.vazias * escala })),
    inicio,
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
