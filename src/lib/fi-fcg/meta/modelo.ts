/**
 * Modelo travado da aba Meta: funções puras, sem rede. Recebe as contagens
 * que painel_meta_bovino_dados() fez dentro do banco e os campos que o
 * Sérgio gravou; devolve indicadores, alertas, avisos, rebanho-meta e
 * projeção. Nenhum número é inventado: sem o dado, o resultado é `null` e
 * vem acompanhado da lista do que falta.
 *
 * Desenho: seabra-app, docs/planos/PAINEL_BENONI_3_MODELO.md e _6_META_PELO_QUESTIONARIO.md.
 */
import type { Citacao } from '@/lib/fi-fcg/questionario/perguntas';

// ── Entrada ───────────────────────────────────────────────────────────────

export interface Estacao {
  y: number;
  tocadas: number;
  prenhes: number;
  primeiro_toque: string | null;
  ultimo_toque: string | null;
  nascidos_vivos: number;
  natimortos: number;
  vivos_210_elegiveis: number;
  mortos_antes_210: number;
  pesados_desmama: number;
  kg_desmama: number;
}

export interface Anual {
  y: number;
  vacas_inicio: number;
  vacas_baixa: number;
  vacas_morte: number;
  novilhas_entraram: number;
}

export interface Faixa {
  sexo: 'femea' | 'macho';
  /** idade em anos ("0".."19", "20" = 20 ou mais), "touro" ou "sem_idade" */
  faixa: string;
  n: number;
  com_peso: number;
  soma_peso: number;
}

export interface DadosFazenda {
  propriedade_id: number;
  lido_em: string;
  estacoes: Estacao[];
  anual: Anual[];
  faixas: Faixa[];
  vazias_ultimo_toque: number;
  ultimos_lancamentos: { toque: string | null; parto: string | null; pesagem: string | null; baixa: string | null };
}

export type Parametros = Record<string, number | string | undefined>;

// ── Metas sugeridas pela literatura ───────────────────────────────────────

export type ChaveIndicador = 'prenhez' | 'nascidos' | 'desmama' | 'mortalidade' | 'kg_matriz' | 'kg_ha' | 'descarte' | 'reposicao' | 'lotacao';

export interface MetaSugerida {
  valor: number | null;
  texto: string;
  fontes: Citacao[];
}

export const METAS_SUGERIDAS: Record<ChaveIndicador, MetaSugerida> = {
  prenhez: { valor: 0.91, texto: '91%: menor valor da faixa de 91–97% ao fim de uma estação de 120 dias com IATF e repasse, em experimento no Pantanal', fontes: [{ ref: 'R13', pagina: 'p.13' }] },
  nascidos: { valor: 0.7, texto: '70%: meta de natalidade da Embrapa Pantanal na Nhecolândia', fontes: [{ ref: 'R5', pagina: 'p.31' }] },
  desmama: { valor: 0.7, texto: '70%: meta de desmama da Embrapa Pantanal na Nhecolândia', fontes: [{ ref: 'R5', pagina: 'p.31' }] },
  mortalidade: { valor: 0.05, texto: 'até 5%: menor valor da faixa de 5–10% do Pantanal com tecnologia', fontes: [{ ref: 'R4', pagina: 'p.24' }] },
  kg_matriz: { valor: 121, texto: '121 kg: desmama de 70% vezes a média de 180 kg (macho) e 165 kg (fêmea) aos 8 meses', fontes: [{ ref: 'R5', pagina: 'p.31' }, { ref: 'R2', pagina: 'p.5' }] },
  kg_ha: { valor: null, texto: 'sem referência publicada para o Pantanal; defina a sua', fontes: [] },
  descarte: { valor: 0.14, texto: '14% ao ano: descarte de matrizes da fazenda típica de 2023 no Pantanal', fontes: [{ ref: 'R2', pagina: 'p.4' }] },
  reposicao: { valor: null, texto: 'igual às saídas de vacas (descarte + mortes), para o número de vacas ficar estável', fontes: [{ ref: 'R51', pagina: 'p.21' }] },
  lotacao: { valor: null, texto: 'a capacidade do pasto, que depende da área por tipo de pasto', fontes: [{ ref: 'R25', pagina: 'p.16, 20' }, { ref: 'R28', pagina: 'p.10–12' }] },
};

/** Semáforo: regra minha, não da literatura. Aparece como sugestão aguardando aprovação. */
export const SEMAFORO_SUGERIDO = { verde: 0.1, amarelo: 0.25 };

export const IDADE_LIMITE_PADRAO = 12; // resposta do Sérgio na ligação de 17/11/2026 (12–13 anos)
export const MORTALIDADE_RECRIA = 0.01; // 1% ao ano depois da desmama, fazenda típica de 2023 [R2 p.4]
export const MORTALIDADE_POTENCIAL = 0.02; // mortalidade até a desmama no nível "potencial" [R39 p.12]

// ── Utilidades ────────────────────────────────────────────────────────────

const num = (p: Parametros, k: string): number | null => {
  const v = p[k];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
};

const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);

function data(s: string | null): Date | null {
  return s ? new Date(`${s.slice(0, 10)}T12:00:00Z`) : null;
}

// ── Completude das estações ───────────────────────────────────────────────

export type Completude = 'completa' | 'parcial' | 'andamento';

/** Prenhez do ano Y: completa se o toque final (jun–jul) já passou e o histórico cobre o ano desde março. */
export function completudePrenhez(e: Estacao, hoje: Date): Completude {
  if (hoje < new Date(Date.UTC(e.y, 8, 1))) return 'andamento';
  const primeiro = data(e.primeiro_toque);
  if (!primeiro || primeiro > new Date(Date.UTC(e.y, 2, 31))) return 'parcial';
  return 'completa';
}

/** Nascimentos da estação Y (partos de jul/Y a jun/Y+1). */
export function completudeNascimento(e: Estacao, hoje: Date): Completude {
  const p = completudePrenhez(e, hoje);
  if (hoje < new Date(Date.UTC(e.y + 1, 6, 1))) return 'andamento';
  return p === 'completa' ? 'completa' : 'parcial';
}

/** Desmama da estação Y: todas as crias nascidas vivas já passaram de 210 dias. */
export function completudeDesmama(e: Estacao, hoje: Date): Completude {
  const n = completudeNascimento(e, hoje);
  if (n === 'andamento' || e.vivos_210_elegiveis < e.nascidos_vivos) return 'andamento';
  return n;
}

// ── Indicadores ───────────────────────────────────────────────────────────

export interface Ponto {
  y: number;
  valor: number | null;
  completude: Completude;
  numerador: number;
  denominador: number;
  /** motivo de não ter número, quando houver */
  falta?: string;
}

export interface Ficha {
  formula: string;
  numerador: string;
  denominador: string;
  janela: string;
  unidade: string;
  fonte: string;
}

export interface Indicador {
  chave: ChaveIndicador;
  nome: string;
  unidade: '%' | 'kg' | 'kg/ha' | 'UA/ha';
  periodo: 'estação' | 'ano' | 'hoje';
  maiorMelhor: boolean | null;
  pontos: Ponto[];
  atual: Ponto | null;
  anterior: Ponto | null;
  media: { valor: number | null; n: number; anos: number[] };
  meta: { valor: number | null; origem: 'sergio' | 'sugerida'; texto: string; fontes: Citacao[] };
  ficha: Ficha;
  /** dados que faltam para o indicador inteiro */
  faltam: string[];
  avisos: string[];
}

function somaEstacoes(fazendas: DadosFazenda[]): Estacao[] {
  const anos = [...new Set(fazendas.flatMap((f) => f.estacoes.map((e) => e.y)))].sort();
  return anos.map((y) => {
    const es = fazendas.map((f) => f.estacoes.find((e) => e.y === y)).filter((e): e is Estacao => !!e);
    const primeiros = es.map((e) => e.primeiro_toque).filter((x): x is string => !!x).sort();
    const s = (k: keyof Estacao) => es.reduce((a, e) => a + Number(e[k] ?? 0), 0);
    return {
      y,
      tocadas: s('tocadas'),
      prenhes: s('prenhes'),
      // o grupo só é completo se as duas fazendas forem: vale o primeiro toque mais tardio
      primeiro_toque: primeiros.length === es.length && primeiros.length ? primeiros[primeiros.length - 1] : null,
      ultimo_toque: null,
      nascidos_vivos: s('nascidos_vivos'),
      natimortos: s('natimortos'),
      vivos_210_elegiveis: s('vivos_210_elegiveis'),
      mortos_antes_210: s('mortos_antes_210'),
      pesados_desmama: s('pesados_desmama'),
      kg_desmama: s('kg_desmama'),
    };
  });
}

function somaAnual(fazendas: DadosFazenda[]): Anual[] {
  const anos = [...new Set(fazendas.flatMap((f) => f.anual.map((a) => a.y)))].sort();
  return anos.map((y) => {
    const as = fazendas.map((f) => f.anual.find((a) => a.y === y)).filter((a): a is Anual => !!a);
    const s = (k: keyof Anual) => as.reduce((t, a) => t + Number(a[k] ?? 0), 0);
    return { y, vacas_inicio: s('vacas_inicio'), vacas_baixa: s('vacas_baixa'), vacas_morte: s('vacas_morte'), novilhas_entraram: s('novilhas_entraram') };
  });
}

function resumir(pontos: Ponto[]): Pick<Indicador, 'atual' | 'anterior' | 'media'> {
  const completos = pontos.filter((p) => p.completude === 'completa' && p.valor != null);
  const atual = completos.at(-1) ?? null;
  // só estação completa é comparável; 2024 é parcial (o histórico começa em jun/2024)
  const antes = atual ? completos.filter((p) => p.y < atual.y) : [];
  const anterior = antes.at(-1) ?? null;
  const ult3 = completos.slice(-3);
  const media = ult3.length ? ult3.reduce((a, p) => a + (p.valor as number), 0) / ult3.length : null;
  return { atual, anterior, media: { valor: media, n: ult3.length, anos: ult3.map((p) => p.y) } };
}

function metaDe(chave: ChaveIndicador, p: Parametros, unidade: Indicador['unidade']): Indicador['meta'] {
  const minha = num(p, `meta.${chave}`);
  const sug = METAS_SUGERIDAS[chave];
  if (minha != null) {
    const valor = unidade === '%' ? minha / 100 : minha;
    return { valor, origem: 'sergio', texto: 'meta gravada por você', fontes: [] };
  }
  return { valor: sug.valor, origem: 'sugerida', texto: sug.texto, fontes: sug.fontes };
}

export interface Contexto {
  hoje: Date;
  fazendas: DadosFazenda[];
  parametros: Parametros;
  /** área útil somada das fazendas do contexto (null se alguma estiver vazia) */
  areaUtil: number | null;
}

export function indicadores(ctx: Contexto): Indicador[] {
  const { hoje, parametros: p } = ctx;
  const est = somaEstacoes(ctx.fazendas);
  const anual = somaAnual(ctx.fazendas);
  const out: Indicador[] = [];

  const mk = (
    chave: ChaveIndicador,
    nome: string,
    unidade: Indicador['unidade'],
    maiorMelhor: boolean | null,
    pontos: Ponto[],
    ficha: Ficha,
    faltam: string[] = [],
    avisos: string[] = [],
  ) =>
    out.push({
      chave,
      nome,
      unidade,
      periodo: chave === 'descarte' || chave === 'reposicao' ? 'ano' : chave === 'lotacao' ? 'hoje' : 'estação',
      maiorMelhor,
      pontos,
      ...resumir(pontos),
      meta: metaDe(chave, p, unidade),
      ficha,
      faltam,
      avisos,
    });

  const FONTE = 'Banco do Sistema Seabra (cópia da planilha Produção - Benoni), contado dentro do banco';

  mk(
    'prenhez',
    'Prenhez',
    '%',
    true,
    est.map((e) => ({ y: e.y, valor: div(e.prenhes, e.tocadas), completude: completudePrenhez(e, hoje), numerador: e.prenhes, denominador: e.tocadas })),
    {
      formula: 'fêmeas prenhes ÷ fêmeas tocadas',
      numerador: 'fêmeas cujo último toque do ano deu positivo',
      denominador: 'fêmeas tocadas no ano (vacas e novilhas); a exposição à monta não é lançada, então uso as tocadas',
      janela: 'toques de 1/jan a 31/dez do ano da estação',
      unidade: '% das fêmeas tocadas',
      fonte: FONTE,
    },
  );

  mk(
    'nascidos',
    'Nascidos vivos',
    '%',
    true,
    est.map((e) => ({ y: e.y, valor: div(e.nascidos_vivos, e.tocadas), completude: completudeNascimento(e, hoje), numerador: e.nascidos_vivos, denominador: e.tocadas })),
    {
      formula: 'crias nascidas vivas ÷ fêmeas tocadas',
      numerador: 'crias nascidas vivas nos partos de jul/Y a jun/Y+1',
      denominador: 'fêmeas tocadas no ano Y',
      janela: 'estação Y: toque no ano Y, partos de 1/jul/Y a 30/jun/Y+1',
      unidade: '% das fêmeas tocadas',
      fonte: FONTE,
    },
    [],
    est.some((e) => e.nascidos_vivos > 0) && est.every((e) => e.natimortos === 0) ? ['Nenhum natimorto lançado: os nascidos vivos podem estar contando natimorto.'] : [],
  );

  mk(
    'desmama',
    'Desmama',
    '%',
    true,
    est.map((e) => ({ y: e.y, valor: div(e.nascidos_vivos - e.mortos_antes_210, e.tocadas), completude: completudeDesmama(e, hoje), numerador: e.nascidos_vivos - e.mortos_antes_210, denominador: e.tocadas })),
    {
      formula: '(nascidos vivos − mortos antes de 210 dias) ÷ fêmeas tocadas',
      numerador: 'crias nascidas vivas que chegaram vivas aos 210 dias (a desmama não é lançada)',
      denominador: 'fêmeas tocadas no ano Y',
      janela: 'estação Y; só fecha quando todas as crias passaram de 210 dias',
      unidade: '% das fêmeas tocadas',
      fonte: FONTE,
    },
    [],
    ['A desmama não é lançada: conto a cria viva aos 210 dias (7 meses).'],
  );

  const mortPontos = est.map((e) => ({ y: e.y, valor: div(e.mortos_antes_210, e.nascidos_vivos), completude: completudeDesmama(e, hoje), numerador: e.mortos_antes_210, denominador: e.nascidos_vivos }));
  const mortAtual = resumir(mortPontos).atual;
  mk(
    'mortalidade',
    'Mortalidade pré-desmama',
    '%',
    false,
    mortPontos,
    {
      formula: 'crias mortas antes de 210 dias ÷ crias nascidas vivas',
      numerador: 'crias com baixa por morte ou matula antes de 210 dias de vida',
      denominador: 'crias nascidas vivas na estação',
      janela: 'estação Y',
      unidade: '% dos nascidos vivos',
      fonte: FONTE,
    },
    [],
    mortAtual?.valor != null && mortAtual.valor < MORTALIDADE_POTENCIAL
      ? [`Abaixo de 2%, o nível potencial da Embrapa Pantanal [R39 p.12]: o mais provável é morte de bezerro novo sem lançamento.`]
      : [],
  );

  const kgPontos: Ponto[] = est.map((e) => {
    const desm = e.nascidos_vivos - e.mortos_antes_210;
    const cob = div(e.pesados_desmama, desm);
    const c = completudeDesmama(e, hoje);
    if (c !== 'andamento' && (cob == null || cob < 0.8)) {
      return { y: e.y, valor: null, completude: c, numerador: e.kg_desmama, denominador: e.tocadas, falta: `só ${cob == null ? 0 : Math.round(cob * 100)}% das crias têm pesagem entre 210 e 300 dias` };
    }
    return { y: e.y, valor: div(e.kg_desmama, e.tocadas), completude: c, numerador: e.kg_desmama, denominador: e.tocadas };
  });
  mk(
    'kg_matriz',
    'Kg desmamados por matriz',
    'kg',
    true,
    kgPontos,
    {
      formula: 'soma do peso de desmama das crias ÷ fêmeas tocadas',
      numerador: 'peso de cada cria na pesagem entre 210 e 300 dias de idade, a mais próxima de 240 dias',
      denominador: 'fêmeas tocadas no ano Y',
      janela: 'estação Y; só mostro se 80% ou mais das crias vivas têm essa pesagem',
      unidade: 'kg por fêmea tocada',
      fonte: FONTE,
    },
  );

  const area = ctx.areaUtil;
  mk(
    'kg_ha',
    'Kg desmamados por hectare',
    'kg/ha',
    true,
    kgPontos.map((k) => ({ ...k, valor: area && k.valor != null ? k.numerador / area : null, denominador: area ?? 0 })),
    {
      formula: 'soma do peso de desmama das crias ÷ área de pasto útil',
      numerador: 'o mesmo do kg por matriz',
      denominador: 'área de pasto útil que você informa',
      janela: 'estação Y',
      unidade: 'kg por hectare',
      fonte: `${FONTE}; área: campo preenchido por você`,
    },
    area ? [] : ['Área de pasto útil'],
  );

  mk(
    'descarte',
    'Descarte de vacas',
    '%',
    null,
    anual.map((a) => ({
      y: a.y,
      valor: div(a.vacas_baixa, a.vacas_inicio),
      completude: a.y < hoje.getUTCFullYear() ? (a.y === 2024 ? 'parcial' : 'completa') : 'andamento',
      numerador: a.vacas_baixa,
      denominador: a.vacas_inicio,
    })),
    {
      formula: 'vacas que saíram no ano ÷ vacas em 1º de janeiro',
      numerador: 'fêmeas com 3 anos ou mais com baixa no ano (venda, morte ou matula)',
      denominador: 'fêmeas com 3 anos ou mais em 1º de janeiro',
      janela: 'ano civil; o histórico de baixas começa em setembro de 2024',
      unidade: '% das vacas',
      fonte: FONTE,
    },
  );

  mk(
    'reposicao',
    'Reposição de vacas',
    '%',
    null,
    anual.map((a) => ({
      y: a.y,
      valor: div(a.novilhas_entraram, a.vacas_inicio),
      completude: a.y < hoje.getUTCFullYear() ? (a.y === 2024 ? 'parcial' : 'completa') : 'andamento',
      numerador: a.novilhas_entraram,
      denominador: a.vacas_inicio,
    })),
    {
      formula: 'novilhas que fizeram 3 anos no ano ÷ vacas em 1º de janeiro',
      numerador: 'fêmeas que completaram 3 anos no ano, ainda no rebanho',
      denominador: 'fêmeas com 3 anos ou mais em 1º de janeiro',
      janela: 'ano civil',
      unidade: '% das vacas',
      fonte: FONTE,
    },
  );

  // meta da reposição = a saída de vacas do mesmo ano (rebanho estável) [R51 p.21]
  const desc = out.find((i) => i.chave === 'descarte');
  const repo = out.find((i) => i.chave === 'reposicao');
  if (desc && repo && repo.meta.origem === 'sugerida' && desc.atual?.valor != null) {
    repo.meta = { ...repo.meta, valor: desc.atual.valor, texto: `${(Math.round(desc.atual.valor * 1000) / 10).toLocaleString('pt-BR')}%: igual às saídas de vacas de ${desc.atual.y} (descarte + mortes), para o número de vacas ficar estável` };
  }

  const ua = uaAtual(ctx.fazendas);
  mk(
    'lotacao',
    'Lotação',
    'UA/ha',
    false,
    [{ y: hoje.getUTCFullYear(), valor: area ? ua.ua / area : null, completude: 'completa', numerador: ua.ua, denominador: area ?? 0 }],
    {
      formula: 'UA do rebanho de hoje ÷ área de pasto útil',
      numerador: 'soma do peso da última pesagem de cada animal ÷ 450; animal sem pesagem pela tabela de UA por idade',
      denominador: 'área de pasto útil que você informa',
      janela: 'rebanho ativo na data da leitura',
      unidade: 'UA por hectare (1 UA = 450 kg) [R51 p.19]',
      fonte: `${FONTE}; tabela de UA sem pesagem [R50 p.8]`,
    },
    area ? [] : ['Área de pasto útil'],
  );

  return out;
}

// ── UA e capacidade ───────────────────────────────────────────────────────

/** UA por idade para animal sem pesagem: planilha Gerencial da Embrapa Gado de Corte [R50 p.8]. */
export function uaTabela(sexo: 'femea' | 'macho', faixa: string): number | null {
  if (faixa === 'touro') return 1.25;
  if (faixa === 'sem_idade') return null;
  const i = Number(faixa);
  if (i === 0) return 0.25;
  if (i === 1) return sexo === 'femea' ? 0.45 : 0.55;
  if (i === 2) return sexo === 'femea' ? 0.7 : 0.8;
  return sexo === 'femea' ? 0.9 : 0.8;
}

export function uaAtual(fazendas: DadosFazenda[]): { ua: number; cabecas: number; semPeso: number; semIdade: number } {
  let ua = 0;
  let cabecas = 0;
  let semPeso = 0;
  let semIdade = 0;
  for (const f of fazendas)
    for (const x of f.faixas) {
      cabecas += x.n;
      ua += Number(x.soma_peso) / 450;
      const faltam = x.n - x.com_peso;
      if (faltam > 0) {
        semPeso += faltam;
        const t = uaTabela(x.sexo, x.faixa);
        if (t == null) semIdade += faltam;
        else ua += faltam * t;
      }
    }
  return { ua, cabecas, semPeso, semIdade };
}

export interface Capacidade {
  uaCapacidade: number | null;
  uaCheia: number | null;
  limite: number | null;
  faltam: string[];
  conta: string[];
}

/** Capacidade pelo método da Embrapa Pantanal, em UA de 450 kg comendo 2% do peso vivo. */
export function capacidade(p: Parametros, areaPorFazenda: { limpo: number | null; caronal: number | null; cerrado: number | null; cultivada: number | null; alaga: number | null }[]): Capacidade {
  const faltam: string[] = [];
  const somar = (k: 'limpo' | 'caronal' | 'cerrado' | 'cultivada' | 'alaga') => {
    if (areaPorFazenda.some((a) => a[k] == null)) return null;
    return areaPorFazenda.reduce((t, a) => t + (a[k] as number), 0);
  };
  const limpo = somar('limpo');
  const caronal = somar('caronal');
  const cerrado = somar('cerrado');
  const cultivada = somar('cultivada');
  if (limpo == null || caronal == null || cerrado == null || cultivada == null) faltam.push('Área por tipo de pasto (campo limpo, caronal, campo cerrado e cultivado; 0 onde não houver)');
  const reserva = num(p, 'reserva_pasto_pct');
  if (reserva == null) faltam.push('Reserva de pasto');
  const alaga = somar('alaga');
  if (alaga == null) faltam.push('Área que alaga na cheia (0 se não alaga)');
  if (limpo == null || caronal == null || cerrado == null || cultivada == null) return { uaCapacidade: null, uaCheia: null, limite: null, faltam, conta: [] };

  const consumoUA = 450 * 0.02 * 365; // kg MS por UA por ano
  const ms = limpo * 3000 * 0.48 + caronal * 4500 * 0.24 + cerrado * 2200 * 0.48;
  const nativo = ms / consumoUA;
  const cult = cultivada * 0.8;
  const uaCapacidade = nativo + cult;
  const limpoCheia = alaga == null ? null : Math.max(0, limpo - alaga);
  const uaCheia = limpoCheia == null ? null : (limpoCheia * 3000 * 0.48 + caronal * 4500 * 0.24 + cerrado * 2200 * 0.48) / consumoUA + cult;
  const base = uaCheia ?? uaCapacidade;
  const limite = reserva == null ? null : base * (1 - reserva / 100);
  return {
    uaCapacidade,
    uaCheia,
    limite,
    faltam,
    conta: [
      'Campo limpo e baixadas: 3.000 kg de matéria seca por ha no ano, 48% de uso [R25 p.20].',
      'Caronal: 4.500 kg/ha/ano, 24% de uso [R25 p.20]. Campo cerrado: 2.200 kg/ha/ano, 48% de uso [R25 p.20].',
      'Consumo: 2% do peso vivo, 9 kg de matéria seca por dia para 1 UA de 450 kg [R25 p.16; R28 p.12].',
      'Pasto cultivado de humidícola: 0,8 UA/ha no ano [R29 p.141].',
      'Na cheia, a área que alaga sai do campo limpo e das baixadas [R25 p.20–21; R41 p.104].',
    ],
  };
}

// ── Rebanho por idade ─────────────────────────────────────────────────────

export function vacasPorIdade(fazendas: DadosFazenda[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const f of fazendas)
    for (const x of f.faixas) {
      if (x.sexo !== 'femea' || x.faixa === 'touro' || x.faixa === 'sem_idade') continue;
      const i = Number(x.faixa);
      if (i >= 3) m.set(i, (m.get(i) ?? 0) + x.n);
    }
  return m;
}

export function femeasPorIdade(fazendas: DadosFazenda[], idade: number): number {
  return fazendas.reduce((t, f) => t + f.faixas.filter((x) => x.sexo === 'femea' && x.faixa === String(idade)).reduce((a, x) => a + x.n, 0), 0);
}

export function machosDepoisDaDesmama(fazendas: DadosFazenda[]): number {
  return fazendas.reduce((t, f) => t + f.faixas.filter((x) => x.sexo === 'macho' && x.faixa !== 'touro' && x.faixa !== 'sem_idade' && Number(x.faixa) >= 1).reduce((a, x) => a + x.n, 0), 0);
}

export function touros(fazendas: DadosFazenda[]): number {
  return fazendas.reduce((t, f) => t + f.faixas.filter((x) => x.faixa === 'touro').reduce((a, x) => a + x.n, 0), 0);
}

export function idadeLimite(p: Parametros): { valor: number; origem: 'sergio' | 'ligacao' } {
  const v = num(p, 'idade_limite');
  return v != null ? { valor: v, origem: 'sergio' } : { valor: IDADE_LIMITE_PADRAO, origem: 'ligacao' };
}

// ── Taxas observadas (base do cenário "como estou") ──────────────────────

export interface Taxas {
  nascidosPorTocada: number;
  mortPreDesmama: number;
  saidaVacas: number;
  morteVacas: number;
  prenhez: number;
  anos: { nascidos: number; saida: number; prenhez: number };
}

export function taxasObservadas(ctx: Contexto): Taxas | null {
  const ind = indicadores(ctx);
  const g = (k: ChaveIndicador) => ind.find((i) => i.chave === k)?.atual ?? null;
  const nasc = g('nascidos');
  const mort = g('mortalidade');
  const desc = g('descarte');
  const pren = g('prenhez');
  if (!nasc?.valor || mort?.valor == null || desc?.valor == null || !pren?.valor) return null;
  const anual = somaAnual(ctx.fazendas).find((a) => a.y === desc.y);
  return {
    nascidosPorTocada: nasc.valor,
    mortPreDesmama: mort.valor,
    saidaVacas: desc.valor,
    morteVacas: anual ? (div(anual.vacas_morte, anual.vacas_inicio) ?? 0) : 0,
    prenhez: pren.valor,
    anos: { nascidos: nasc.y, saida: desc.y, prenhez: pren.y },
  };
}

// ── Reposição do próximo ano ──────────────────────────────────────────────

export interface Reposicao {
  porIdade: number;
  vazias: number;
  mortesEsperadas: number;
  necessarias: number;
  disponiveis: number;
  saldo: number;
  idadeLimite: number;
}

export function reposicaoProximoAno(ctx: Contexto): Reposicao | null {
  const t = taxasObservadas(ctx);
  if (!t) return null;
  const lim = idadeLimite(ctx.parametros).valor;
  const vacas = vacasPorIdade(ctx.fazendas);
  let total = 0;
  let porIdade = 0;
  for (const [i, n] of vacas) {
    total += n;
    if (i >= lim - 1) porIdade += n; // quem já passou ou chega à idade-limite no próximo ano
  }
  const vazias = ctx.fazendas.reduce((a, f) => a + f.vazias_ultimo_toque, 0);
  const mortesEsperadas = Math.round((total - porIdade) * t.morteVacas);
  const necessarias = porIdade + mortesEsperadas;
  const disponiveis = Math.round(femeasPorIdade(ctx.fazendas, 2) * (1 - MORTALIDADE_RECRIA));
  return { porIdade, vazias, mortesEsperadas, necessarias, disponiveis, saldo: disponiveis - necessarias, idadeLimite: lim };
}

// ── Projeção (coortes) ────────────────────────────────────────────────────

export type Cenario = 'como_estou' | 'metas' | 'melhora_prenhez' | 'seca' | 'preco' | 'reducao_area' | 'aumento_lotacao';

export const CENARIOS: { id: Cenario; nome: string; precisa: string[] }[] = [
  { id: 'como_estou', nome: 'Como estou', precisa: [] },
  { id: 'metas', nome: 'Com as metas', precisa: [] },
  { id: 'melhora_prenhez', nome: 'Melhora da prenhez', precisa: [] },
  { id: 'seca', nome: 'Seca severa', precisa: ['Área por tipo de pasto', 'Reserva de pasto'] },
  { id: 'preco', nome: 'Queda do preço do bezerro', precisa: ['Preço do bezerro', 'Custos'] },
  { id: 'reducao_area', nome: 'Redução de área', precisa: ['Área por tipo de pasto'] },
  { id: 'aumento_lotacao', nome: 'Aumento de lotação', precisa: ['Área por tipo de pasto', 'Reserva de pasto'] },
];

export interface AnoProjecao {
  ano: number;
  vacas: number;
  saidas: number;
  novilhasEntram: number;
  novilhasSobram: number;
  falta: number;
  desmamados: number;
  vacasAcimaDoLimite: number;
}

/**
 * Projeção de 5 anos. Mantém o número de vacas na meta (ou nas de hoje) enquanto
 * houver novilha; a sobra é fêmea para vender, a falta aparece como falta.
 * Saídas: todas as vacas que chegam à idade-limite + as outras pela taxa de saída
 * observada (que já inclui as mortes).
 */
export function projetar(ctx: Contexto, cenario: Cenario, anos = 5): AnoProjecao[] | null {
  if (!['como_estou', 'metas', 'melhora_prenhez'].includes(cenario)) return null;
  const t = taxasObservadas(ctx);
  if (!t) return null;
  const metas = Object.fromEntries(indicadores(ctx).map((i) => [i.chave, i.meta.valor]));
  let nasc = t.nascidosPorTocada;
  let mort = t.mortPreDesmama;
  let saida = t.saidaVacas;
  if (cenario === 'metas') {
    if (metas.nascidos != null) nasc = metas.nascidos;
    if (metas.mortalidade != null) mort = metas.mortalidade;
    if (metas.descarte != null) saida = metas.descarte;
  }
  if (cenario === 'melhora_prenhez' && metas.prenhez != null && metas.prenhez > t.prenhez) nasc = t.nascidosPorTocada * (metas.prenhez / t.prenhez);

  const lim = idadeLimite(ctx.parametros).valor;
  const vacas = new Map(vacasPorIdade(ctx.fazendas));
  let f0 = femeasPorIdade(ctx.fazendas, 0);
  let f1 = femeasPorIdade(ctx.fazendas, 1);
  let f2 = femeasPorIdade(ctx.fazendas, 2);
  const somaVacas = () => [...vacas.values()].reduce((a, b) => a + b, 0);
  const metaV = ctx.fazendas.length === 1 ? num(ctx.parametros, `meta_matrizes@${ctx.fazendas[0].propriedade_id}`) : null;
  const alvo = metaV ?? somaVacas();
  const ano0 = ctx.hoje.getUTCFullYear();
  const out: AnoProjecao[] = [];

  for (let k = 1; k <= anos; k++) {
    // nascem as crias das vacas e das novilhas de 2 anos expostas
    const expostas = somaVacas() + f2;
    const desm = expostas * nasc * (1 - mort);
    // envelhece um ano
    let saidas = 0;
    const nova = new Map<number, number>();
    for (const [i, n] of vacas) {
      if (i + 1 >= lim) {
        saidas += n;
        continue;
      }
      const sai = n * saida;
      saidas += sai;
      nova.set(i + 1, (nova.get(i + 1) ?? 0) + n - sai);
    }
    const chegam = f2 * (1 - MORTALIDADE_RECRIA);
    const atual = [...nova.values()].reduce((a, b) => a + b, 0);
    const precisa = Math.max(0, alvo - atual);
    const entram = Math.min(chegam, precisa);
    nova.set(3, (nova.get(3) ?? 0) + entram);
    vacas.clear();
    for (const [i, n] of nova) vacas.set(i, n);
    f2 = f1 * (1 - MORTALIDADE_RECRIA);
    f1 = f0 * (1 - MORTALIDADE_RECRIA);
    f0 = desm / 2;
    let acima = 0;
    for (const [i, n] of vacas) if (i >= lim) acima += n;
    out.push({
      ano: ano0 + k,
      vacas: Math.round(somaVacas()),
      saidas: Math.round(saidas),
      novilhasEntram: Math.round(entram),
      novilhasSobram: Math.round(chegam - entram),
      falta: Math.round(Math.max(0, precisa - chegam)),
      desmamados: Math.round(desm),
      vacasAcimaDoLimite: Math.round(acima),
    });
  }
  return out;
}

// ── Alertas e avisos ──────────────────────────────────────────────────────

export interface Alerta {
  nivel: 'alto' | 'dados';
  texto: string;
}

export function alertas(ctx: Contexto, ind: Indicador[], cap: Capacidade | null, custosPreenchidos: boolean): { alertas: Alerta[]; semDados: string[] } {
  const a: Alerta[] = [];
  const semDados: string[] = [];
  const by = (k: ChaveIndicador) => ind.find((i) => i.chave === k)!;
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  const pr = by('prenhez');
  if (pr.atual?.valor != null && pr.meta.valor != null && pr.atual.valor < pr.meta.valor)
    a.push({ nivel: 'alto', texto: `Prenhez de ${pct(pr.atual.valor)} em ${pr.atual.y}, abaixo da meta de ${pct(pr.meta.valor)}.` });

  const mo = by('mortalidade');
  if (mo.atual?.valor != null && mo.meta.valor != null && mo.atual.valor > mo.meta.valor)
    a.push({ nivel: 'alto', texto: `Mortalidade pré-desmama de ${pct(mo.atual.valor)}, acima da meta.` });

  const lim = idadeLimite(ctx.parametros).valor;
  let acima = 0;
  for (const [i, n] of vacasPorIdade(ctx.fazendas)) if (i >= lim) acima += n;
  if (acima > 0) a.push({ nivel: 'alto', texto: `Descarte represado: ${acima} vacas com ${lim} anos ou mais ainda no rebanho.` });

  const rep = reposicaoProximoAno(ctx);
  if (rep && rep.saldo < 0) a.push({ nivel: 'alto', texto: `Faltam novilhas: ${rep.disponiveis} chegam aos 3 anos no próximo ano para ${rep.necessarias} vacas que devem sair.` });

  const lot = by('lotacao');
  if (cap?.limite != null && lot.pontos[0]?.numerador != null) {
    if (lot.pontos[0].numerador > cap.limite) a.push({ nivel: 'alto', texto: `Lotação acima do limite: ${Math.round(lot.pontos[0].numerador)} UA para um limite de ${Math.round(cap.limite)} UA.` });
  } else semDados.push('Excesso de lotação e risco de falta de pasto: faltam a área por tipo de pasto e a reserva.');

  if (!custosPreenchidos) semDados.push('Custo acima da meta: faltam os custos.');
  return { alertas: a, semDados };
}

/** Lançamento mais recente recebido da planilha; acima de 7 dias, os dados estão desatualizados. */
export function frescor(fazendas: DadosFazenda[], hoje: Date): { ultimo: string | null; dias: number | null; desatualizado: boolean } {
  const datas = fazendas.flatMap((f) => Object.values(f.ultimos_lancamentos)).filter((x): x is string => !!x).sort();
  const ultimo = datas.at(-1) ?? null;
  const d = data(ultimo);
  const dias = d ? Math.floor((hoje.getTime() - d.getTime()) / 86400000) : null;
  return { ultimo, dias, desatualizado: dias == null || dias > 7 };
}
