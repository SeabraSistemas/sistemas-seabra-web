import { DIA_INICIO_SEMANA, diasEntre, inicioDaSemana, mesDe, somarDias, somarMeses } from '@/lib/tres-irmaos/datas';

/**
 * Projeção de produção de leite, semana a semana, de 1 a 12 meses.
 *
 * A conta é a mesma que o Felipe faz à mão na planilha — lactantes × média ×
 * 7 dias — só que o rebanho MUDA ao longo do tempo: entra quem pare, sai quem
 * seca. O produtor controla essas duas linhas (partos e secagens previstos);
 * quando o app tiver a reprodução registrada, ela chega pré-preenchida
 * (`partosDoApp`), mas nada depende disso — produtor que está começando, como
 * o Lucas, digita "13 partos até a 2ª semana de outubro" e a conta anda.
 *
 * Depois de produzir, a semana é DISTRIBUÍDA entre os compradores na ordem de
 * prioridade (quem paga mais primeiro), cada um até o seu máximo semanal, e
 * tudo limitado pelo teto semanal de venda. O que sobra é excedente: leite sem
 * comprador.
 */

export interface Comprador {
  id: string;
  nome: string;
  /** 0 = domingo … 6 = sábado. Só informativo: a conta é semanal. */
  diaColeta: number;
  minSemanal: number;
  maxSemanal: number;
  /** Nomes de destino da Saída de Leite do app que são deste comprador (ex.: "Leite Rose"). */
  destinosApp: string[];
}

/** Uma quantidade de animais numa data (partos ou secagens previstos). */
export interface Previsao {
  data: string;
  quantidade: number;
}

export interface Parametros {
  versao: 1;
  /** 1 a 12. */
  horizonteMeses: number;
  tetoSemanal: number;
  /** Litros que cabem no tanque de resfriamento (o do Lucas: 1.200 L). */
  capacidadeTanque: number;
  /** Em ordem de prioridade: o primeiro enche antes do segundo receber. */
  compradores: Comprador[];
  lactantesIniciais: number;
  /**
   * Efetivo das OUTRAS categorias no início (seca, pré-parto, recria…),
   * editável. Seca + pré-parto é de onde saem os partos e para onde vão as
   * secagens — a projeção acompanha esse estoque para mostrar o rebanho
   * mudando e avisar quando se prevê mais partos do que cabras para parir.
   */
  efetivoInicial: Record<string, number>;
  /** L/cabra/dia das lactantes de hoje. */
  mediaLitros: number;
  /** L/cabra/dia de quem pare dentro da projeção. */
  mediaRecemParida: number;
  /** Quem pare dentro da projeção seca depois de tantos dias. null = não seca. */
  diasLactacaoNovas: number | null;
  partos: Previsao[];
  secagens: Previsao[];
  /** Coberturas sem diagnóstico: viram parto `gestacaoDias` depois, na proporção `taxaPrenhez`. */
  coberturas: Previsao[];
  taxaPrenhez: number;
  gestacaoDias: number;
  /** Somar os partos previstos que o app já conhece (gestação confirmada). */
  usarPartosDoApp: boolean;
}

export interface Entrega {
  compradorId: string;
  litros: number;
  /** Recebeu menos que o mínimo semanal combinado. */
  abaixoDoMinimo: boolean;
}

export interface SemanaProjetada {
  inicio: string;
  /** Último dia da semana (segunda), ou o fim da projeção se vier antes. */
  fim: string;
  dias: number;
  partos: number;
  secagens: number;
  lactantes: number;
  /** Secas + pré-parto: as adultas fora da ordenha. */
  secasEPreParto: number;
  /** Partos previstos acima das secas + pré-parto disponíveis (conta furada). */
  partosSemMae: number;
  litrosDia: number;
  litrosSemana: number;
  entregas: Entrega[];
  vendido: number;
  /** Produziu e ninguém comprou (passou do máximo dos compradores ou do teto). */
  excedente: number;
  /** Quanto a PRODUÇÃO passou do teto semanal — o número que importa para o laticínio. */
  acimaDoTeto: number;
  /** Maior nível do tanque na semana: logo antes de uma coleta (ver `simularTanque`). */
  picoTanque: number;
  /** Quanto o pico passa da capacidade do tanque. */
  acimaDaCapacidade: number;
}

export interface MesProjetado {
  mes: string;
  dias: number;
  partos: number;
  secagens: number;
  lactantesMedias: number;
  secasEPrePartoMedias: number;
  litrosDiaMedio: number;
  litrosMes: number;
  vendido: number;
  excedente: number;
}

export interface Projecao {
  inicio: string;
  fim: string;
  semanas: SemanaProjetada[];
  meses: MesProjetado[];
  /** Primeira semana em que a produção passa do teto, ou null. */
  primeiraSemanaAcimaDoTeto: string | null;
  /** Primeira semana em que o tanque não comporta o leite até a coleta, ou null. */
  primeiraSemanaTanqueCheio: string | null;
}

export const HORIZONTE_MIN = 1;
export const HORIZONTE_MAX = 12;
/** Categorias do app de onde saem os partos e para onde vão as secagens. */
export const CATEGORIAS_FORA_DA_ORDENHA = ['seca', 'pre-parto'];

function limitar(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function positivo(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/**
 * Soma as previsões por semana (chave = terça da semana). Previsão antes do
 * início é ignorada: quem já pariu já está nas lactantes de hoje.
 */
function porSemana(previsoes: Previsao[], inicio: string, fator = 1, deslocamentoDias = 0): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const p of previsoes) {
    const qtd = positivo(p.quantidade) * fator;
    if (!p.data || qtd === 0) continue;
    const data = somarDias(p.data, deslocamentoDias);
    if (data < inicio) continue;
    const semana = inicioDaSemana(data);
    mapa.set(semana, (mapa.get(semana) ?? 0) + qtd);
  }
  return mapa;
}

/** Distribui a produção da semana na ordem de prioridade, respeitando o teto. */
export function distribuir(litros: number, compradores: Comprador[], teto: number, fracaoDaSemana = 1): Entrega[] {
  let disponivel = Math.min(litros, positivo(teto) * fracaoDaSemana);
  return compradores.map((c) => {
    const max = positivo(c.maxSemanal) * fracaoDaSemana;
    const litrosComprador = Math.max(0, Math.min(disponivel, max));
    disponivel -= litrosComprador;
    return {
      compradorId: c.id,
      litros: litrosComprador,
      abaixoDoMinimo: litrosComprador + 1e-9 < positivo(c.minSemanal) * fracaoDaSemana,
    };
  });
}

/**
 * O tanque ao longo da semana. Os compradores recolhem depois da 1ª ordenha
 * do seu dia, então o tanque está no máximo logo antes de cada coleta: tem o
 * leite de todos os dias desde a coleta anterior mais o que ela deixou. Com
 * Rose na terça e Marina na quinta, a janela da Rose é de 5 dias (qui tarde →
 * ter manhã) e a da Marina de 2 (ter tarde → qui manhã).
 *
 * Devolve uma função que recebe os litros/dia da semana e diz o pico; a sobra
 * de uma coleta passa para a seguinte, inclusive de uma semana para outra.
 * O que não cabe no tanque transborda (não é carregado adiante).
 */
export function simularTanque(compradores: Comprador[], teto: number, capacidade: number) {
  const eventos = compradores
    .map((c, prioridade) => ({ c, prioridade, offset: (c.diaColeta - DIA_INICIO_SEMANA + 7) % 7 }))
    .sort((a, b) => a.offset - b.offset || a.prioridade - b.prioridade);
  const janelas = eventos.map((e, i) => {
    const anterior = i === 0 ? eventos[eventos.length - 1].offset - 7 : eventos[i - 1].offset;
    return e.offset - anterior;
  });
  const cap = positivo(capacidade) || Infinity;
  let sobra = 0;
  return (litrosDia: number): number => {
    if (eventos.length === 0) return litrosDia * 7;
    let vendido = 0;
    let pico = 0;
    eventos.forEach((e, i) => {
      const tanque = sobra + litrosDia * janelas[i];
      pico = Math.max(pico, tanque);
      const cabe = Math.min(tanque, cap);
      const leva = Math.max(0, Math.min(cabe, positivo(e.c.maxSemanal), positivo(teto) - vendido));
      vendido += leva;
      sobra = cabe - leva;
    });
    return pico;
  };
}

export function projetar(p: Parametros, hoje: string, partosDoApp: Previsao[] = []): Projecao {
  const horizonte = limitar(Math.round(p.horizonteMeses) || HORIZONTE_MAX, HORIZONTE_MIN, HORIZONTE_MAX);
  const inicio = inicioDaSemana(hoje);
  const fim = somarMeses(hoje, horizonte); // exclusivo
  const media = positivo(p.mediaLitros);
  const mediaNova = positivo(p.mediaRecemParida);
  const semanasLactacao = p.diasLactacaoNovas == null ? null : Math.max(1, Math.round(positivo(p.diasLactacaoNovas) / 7));

  const partosManuais = porSemana(p.partos, inicio);
  const partosCobertura = porSemana(p.coberturas, inicio, limitar(Number(p.taxaPrenhez) || 0, 0, 1), Math.round(positivo(p.gestacaoDias)));
  const partosApp = p.usarPartosDoApp ? porSemana(partosDoApp, inicio) : new Map<string, number>();
  const secagensManuais = porSemana(p.secagens, inicio);

  const semanas: SemanaProjetada[] = [];
  const partosPorIndice: number[] = [];
  let base = positivo(p.lactantesIniciais); // as lactantes de hoje
  let novas = 0; // quem pariu dentro da projeção
  let foraDaOrdenha = CATEGORIAS_FORA_DA_ORDENHA.reduce((t, c) => t + positivo(p.efetivoInicial?.[c]), 0);
  const tanque = simularTanque(p.compradores, p.tetoSemanal, p.capacidadeTanque);

  for (let i = 0, semana = inicio; semana < fim; i++, semana = somarDias(semana, 7)) {
    const partos = (partosManuais.get(semana) ?? 0) + (partosCobertura.get(semana) ?? 0) + (partosApp.get(semana) ?? 0);
    partosPorIndice.push(partos);
    novas += partos;
    const partosSemMae = Math.max(0, partos - foraDaOrdenha);
    foraDaOrdenha = Math.max(0, foraDaOrdenha - partos);

    // Secagem manual tira primeiro das lactantes de hoje (as mais adiantadas);
    // se pedir mais do que elas, o resto sai das recém-paridas.
    let secagens = 0;
    const pedidas = secagensManuais.get(semana) ?? 0;
    const daBase = Math.min(base, pedidas);
    base -= daBase;
    const dasNovas = Math.min(novas, pedidas - daBase);
    novas -= dasNovas;
    secagens += daBase + dasNovas;

    if (semanasLactacao != null && i >= semanasLactacao) {
      const secaAgora = Math.min(novas, partosPorIndice[i - semanasLactacao]);
      novas -= secaAgora;
      secagens += secaAgora;
    }
    foraDaOrdenha += secagens;

    const ultimoDia = somarDias(semana, 6);
    const fimSemana = ultimoDia < fim ? ultimoDia : somarDias(fim, -1);
    const dias = diasEntre(semana, fimSemana) + 1;
    const litrosDia = base * media + novas * mediaNova;
    const litrosSemana = litrosDia * dias;
    const fracao = dias / 7;
    const entregas = distribuir(litrosSemana, p.compradores, p.tetoSemanal, fracao);
    const vendido = entregas.reduce((s, e) => s + e.litros, 0);
    const picoTanque = tanque(litrosDia);

    semanas.push({
      inicio: semana,
      fim: fimSemana,
      dias,
      partos,
      secagens,
      lactantes: base + novas,
      secasEPreParto: foraDaOrdenha,
      partosSemMae,
      litrosDia,
      litrosSemana,
      entregas,
      vendido,
      excedente: Math.max(0, litrosSemana - vendido),
      acimaDoTeto: Math.max(0, litrosSemana - positivo(p.tetoSemanal) * fracao),
      picoTanque,
      acimaDaCapacidade: positivo(p.capacidadeTanque) ? Math.max(0, picoTanque - positivo(p.capacidadeTanque)) : 0,
    });
  }

  return {
    inicio,
    fim: somarDias(fim, -1),
    semanas,
    meses: agruparPorMes(semanas, hoje),
    primeiraSemanaAcimaDoTeto: semanas.find((s) => s.acimaDoTeto > 0.5)?.inicio ?? null,
    primeiraSemanaTanqueCheio: semanas.find((s) => s.acimaDaCapacidade > 0.5)?.inicio ?? null,
  };
}

/**
 * Meses-calendário, dia a dia: uma semana que atravessa a virada do mês
 * reparte os litros entre os dois pelos dias de cada um. Dias antes de hoje
 * (o começo da primeira semana) não entram — o laticínio quer "daqui pra
 * frente".
 */
function agruparPorMes(semanas: SemanaProjetada[], hoje: string): MesProjetado[] {
  const meses = new Map<string, MesProjetado & { somaLactantes: number; somaFora: number }>();
  for (const s of semanas) {
    for (let d = 0; d < s.dias; d++) {
      const dia = somarDias(s.inicio, d);
      if (dia < hoje) continue;
      const chave = mesDe(dia);
      let m = meses.get(chave);
      if (!m) {
        m = { mes: chave, dias: 0, partos: 0, secagens: 0, lactantesMedias: 0, secasEPrePartoMedias: 0, litrosDiaMedio: 0, litrosMes: 0, vendido: 0, excedente: 0, somaLactantes: 0, somaFora: 0 };
        meses.set(chave, m);
      }
      m.dias++;
      m.somaLactantes += s.lactantes;
      m.somaFora += s.secasEPreParto;
      m.litrosMes += s.litrosDia;
      m.vendido += s.vendido / s.dias;
      m.excedente += s.excedente / s.dias;
    }
    // Parto e secagem contam no mês em que a semana começa.
    const m = meses.get(mesDe(s.inicio < hoje ? hoje : s.inicio));
    if (m) {
      m.partos += s.partos;
      m.secagens += s.secagens;
    }
  }
  return [...meses.values()].map(({ somaLactantes, somaFora, ...m }) => ({
    ...m,
    lactantesMedias: somaLactantes / m.dias,
    secasEPrePartoMedias: somaFora / m.dias,
    litrosDiaMedio: m.litrosMes / m.dias,
  }));
}

export interface DadosDoApp {
  lactantes: number;
  /** Média inicial em L/cabra/dia (Produção Diária, ou o controle leiteiro na falta dela). null = sem nenhuma. */
  mediaInicial: number | null;
  /** Efetivo ativo por categoria do app (nome da categoria → cabeças). */
  efetivo: Record<string, number>;
}

/** Ponto de partida quando a fazenda ainda não salvou parâmetros. */
export function parametrosIniciais(app: DadosDoApp): Parametros {
  const media = app.mediaInicial != null ? Math.round(app.mediaInicial * 100) / 100 : 2.7;
  const efetivoInicial = Object.fromEntries(Object.entries(app.efetivo).filter(([nome]) => nome !== 'lactante'));
  return {
    versao: 1,
    horizonteMeses: 12,
    tetoSemanal: 1300,
    // O Lucas (28/09/2026): tanque de 1.200 L.
    capacidadeTanque: 1200,
    compradores: [
      { id: 'rose', nome: 'Rose', diaColeta: 2, minSemanal: 600, maxSemanal: 800, destinosApp: ['Leite Rose'] },
      // A Marina é do Capril Chaparral: no app do Lucas a saída dela é "Leite Chaparral".
      { id: 'marina', nome: 'Marina', diaColeta: 4, minSemanal: 100, maxSemanal: 500, destinosApp: ['Leite Chaparral'] },
    ],
    lactantesIniciais: app.lactantes,
    efetivoInicial,
    mediaLitros: media,
    mediaRecemParida: media,
    diasLactacaoNovas: 300,
    // O Lucas (28/09/2026): 13 para parir, 3 delas na semana que vem, todas
    // até a 2ª semana de outubro. A divisão exata é dele — está editável.
    partos: [
      { data: '2026-10-06', quantidade: 3 },
      { data: '2026-10-13', quantidade: 10 },
    ],
    secagens: [],
    coberturas: [],
    taxaPrenhez: 0.7,
    gestacaoDias: 150,
    usarPartosDoApp: true,
  };
}

/**
 * O jsonb salvo pode ser de uma versão antiga ou ter sido editado à mão:
 * tudo que faltar ou vier com tipo errado cai no valor inicial.
 */
export function normalizarParametros(bruto: unknown, iniciais: Parametros): Parametros {
  if (!bruto || typeof bruto !== 'object') return iniciais;
  const b = bruto as Partial<Record<keyof Parametros, unknown>>;
  const num = (v: unknown, padrao: number) => (typeof v === 'number' && Number.isFinite(v) ? v : padrao);
  const previsoes = (v: unknown, padrao: Previsao[]): Previsao[] =>
    Array.isArray(v)
      ? v
          .filter((x): x is Previsao => !!x && typeof x === 'object' && typeof (x as Previsao).data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test((x as Previsao).data))
          .map((x) => ({ data: x.data, quantidade: num(x.quantidade, 0) }))
      : padrao;
  const efetivo = (v: unknown): Record<string, number> =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, n]) => [k, Math.max(0, num(n, 0))]))
      : iniciais.efetivoInicial;
  const padraoComprador = new Map(iniciais.compradores.map((c) => [c.id, c]));
  const compradores = Array.isArray(b.compradores)
    ? (b.compradores as Comprador[])
        .filter((c) => c && typeof c.id === 'string' && typeof c.nome === 'string')
        .map((c) => ({
          id: c.id,
          nome: c.nome,
          diaColeta: limitar(Math.round(num(c.diaColeta, 2)), 0, 6),
          minSemanal: num(c.minSemanal, 0),
          maxSemanal: num(c.maxSemanal, 0),
          destinosApp: Array.isArray(c.destinosApp)
            ? c.destinosApp.filter((d): d is string => typeof d === 'string')
            : (padraoComprador.get(c.id)?.destinosApp ?? []),
        }))
    : iniciais.compradores;

  return {
    versao: 1,
    horizonteMeses: limitar(Math.round(num(b.horizonteMeses, iniciais.horizonteMeses)), HORIZONTE_MIN, HORIZONTE_MAX),
    tetoSemanal: num(b.tetoSemanal, iniciais.tetoSemanal),
    capacidadeTanque: num(b.capacidadeTanque, iniciais.capacidadeTanque),
    compradores,
    lactantesIniciais: num(b.lactantesIniciais, iniciais.lactantesIniciais),
    efetivoInicial: efetivo(b.efetivoInicial),
    mediaLitros: num(b.mediaLitros, iniciais.mediaLitros),
    mediaRecemParida: num(b.mediaRecemParida, iniciais.mediaRecemParida),
    diasLactacaoNovas: b.diasLactacaoNovas === null ? null : num(b.diasLactacaoNovas, iniciais.diasLactacaoNovas ?? 300),
    partos: previsoes(b.partos, iniciais.partos),
    secagens: previsoes(b.secagens, iniciais.secagens),
    coberturas: previsoes(b.coberturas, iniciais.coberturas),
    taxaPrenhez: limitar(num(b.taxaPrenhez, iniciais.taxaPrenhez), 0, 1),
    gestacaoDias: num(b.gestacaoDias, iniciais.gestacaoDias),
    usarPartosDoApp: typeof b.usarPartosDoApp === 'boolean' ? b.usarPartosDoApp : iniciais.usarPartosDoApp,
  };
}
