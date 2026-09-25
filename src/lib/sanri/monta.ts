/**
 * Estação de monta (monta livre) — puro (sem rede), testável.
 *
 * O painel SÓ ACOMPANHA. Cobertura, DG e parto são lançados no app
 * (AppSheet) e lidos das abas Reproduçao, DiagnosticoGestaçao, Partos e IA.
 * O que o painel grava é só a "view" da estação — reprodutor, período e
 * quais fêmeas cobertas entram — na aba própria `estacao_monta`, que o
 * AppSheet não usa. Uma fêmea só entra se tiver cobertura lançada no app
 * com aquele reprodutor dentro do período (decisão de 25/09/2026).
 *
 * Regras de acompanhamento espelham a Estação de Monta do SeabraApp
 * (lib/services/reproducao/estacao_monta.dart), sem as pontas soltas dela:
 * - DG que vale: o mais recente a partir da ÚLTIMA cobertura na estação e
 *   até o primeiro serviço fora dela (outro reprodutor, IA).
 * - Parto da estação: entre 1ª cobertura + 135 e última + 165 dias, e antes
 *   de serviço fora + 135 (senão o parto é daquele serviço).
 * - Gestação de 150 dias (a mesma do "Parto estimado" da planilha).
 *
 * "Dias de gestação = 30" na DiagnosticoGestaçao é PADRÃO do formulário, não
 * medida (383 de 806 DGs têm exatamente 30 — ex.: DG em 28/05 com "30 d" e
 * parto em 11/07). Com 30, a "Data da cobertura estimada" e o "Parto
 * estimado" da planilha saem errados, então o painel os ignora. Sem DG
 * medido, o parto previsto é uma JANELA: 1ª cobertura + 150 até o fim da
 * estação + 150 — na monta livre o app grava a entrada no lote, não o salto.
 */
import { diaDe, diasEntre, parseNumber, parseText, somarDias } from '@/lib/painel/format';

export const DIAS_GESTACAO = 150;
export const PARTO_JANELA_INICIO = 135;
export const PARTO_JANELA_FIM = 165;
/** Sem "DATA US" na cobertura, o US é previsto para 30 dias depois — é o que o app grava. */
export const DIAS_ATE_US = 30;
/** Folga para a cobertura estimada pelo ultrassom ainda contar como "da estação". */
export const FOLGA_COBERTURA_ESTIMADA = 7;
/** Valor padrão do formulário de DG do app — não é idade gestacional medida. */
export const DIAS_GESTACAO_PADRAO_DG = 30;

// ---------------------------------------------------------------- identidade

export interface Animal {
  /** ID da linha no RebanhoProd — a chave estável do AppSheet. */
  chave: string;
  numero: string;
  nome: string | null;
  chip: string | null;
  sexo: string | null;
  categoria: string | null;
  baia: string | null;
  vivo: boolean;
}

/** "14213 25274" => "1421325274". A planilha tem o mesmo animal com e sem espaço. */
export function normalizarNumero(raw: string | null | undefined): string | null {
  const t = parseText(raw);
  return t ? t.replace(/\s+/g, '') : null;
}

function normalizarChip(raw: string | null | undefined): string | null {
  const t = normalizarNumero(raw);
  return t && /^\d{10,}$/.test(t) ? t : null;
}

function toObjects(rows: string[][] | null): Record<string, string>[] {
  if (!rows || rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((col, i) => {
      obj[col.trim()] = row[i] ?? '';
    });
    return obj;
  });
}

export function mapAnimais(rows: string[][] | null): Animal[] {
  const out: Animal[] = [];
  for (const r of toObjects(rows)) {
    const numero = normalizarNumero(r['N° DO ANIMAL']);
    if (!numero) continue;
    const categoria = parseText(r['CATEGORIA']);
    const morto = parseText(r['DATA DO OBITO']) != null || parseText(r['DATA DA VENDA']) != null;
    out.push({
      chave: parseText(r['ID']) ?? `n:${numero}`,
      numero,
      nome: parseText(r['NOME']),
      chip: normalizarChip(r['MICROCHIP']),
      sexo: parseText(r['SEXO']),
      categoria,
      baia: parseText(r['BAIA']),
      vivo: !morto && !['Óbito', 'Obito', 'Venda', 'Descarte'].includes(categoria ?? ''),
    });
  }
  return out;
}

export interface Indice {
  porChave: Map<string, Animal>;
  porChip: Map<string, Animal>;
  porNumero: Map<string, Animal>;
}

/** Primeiro cadastro vence: o RebanhoProd tem animal repetido (ex.: Campeão com e sem espaço no número). */
export function criarIndice(animais: Animal[]): Indice {
  const porChave = new Map<string, Animal>();
  const porChip = new Map<string, Animal>();
  const porNumero = new Map<string, Animal>();
  for (const a of animais) {
    if (!porChave.has(a.chave)) porChave.set(a.chave, a);
    if (a.chip && !porChip.has(a.chip)) porChip.set(a.chip, a);
    if (!porNumero.has(a.numero)) porNumero.set(a.numero, a);
  }
  return { porChave, porChip, porNumero };
}

/** Chave do animal: pelo microchip primeiro (o número às vezes vem curto, ex. "25285"), depois pelo número. */
export function chaveDe(indice: Indice, numero: string | null | undefined, chip: string | null | undefined): string | null {
  const c = normalizarChip(chip);
  if (c && indice.porChip.has(c)) return indice.porChip.get(c)!.chave;
  const n = normalizarNumero(numero);
  if (n && indice.porNumero.has(n)) return indice.porNumero.get(n)!.chave;
  if (n) return `n:${n}`;
  return c ? `c:${c}` : null;
}

// ---------------------------------------------------------------- eventos do app

export interface Cobertura {
  id: string;
  femea: string;
  reprodutor: string;
  data: number;
  dataUs: number | null;
}

export type ResultadoDg = 'gestante' | 'vazia' | 'confirmar' | 'outro';

export interface Diagnostico {
  id: string;
  femea: string;
  data: number;
  resultado: ResultadoDg;
  texto: string;
  diasGestacao: number | null;
  coberturaEstimada: number | null;
  partoEstimado: number | null;
}

export interface Cria {
  id: string;
  mae: string;
  nascimento: number;
  sexo: 'macho' | 'femea' | null;
  pai: string | null;
  numero: string | null;
  nome: string | null;
}

export interface ServicoIA {
  femea: string;
  data: number;
}

export function mapCoberturas(rows: string[][] | null, indice: Indice): Cobertura[] {
  const out: Cobertura[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['ID']);
    const data = diaDe(r['DATA']);
    const femea = chaveDe(indice, r['N° DO ANIMAL'], r['MICROCHIP']);
    const reprodutor = chaveDe(indice, r['REPRODUTOR'] || r['ID número|Reprodutor'], r['ID eletrônica|Reprodutor']);
    if (!id || data == null || !femea || !reprodutor) continue;
    out.push({ id, femea, reprodutor, data, dataUs: diaDe(r['DATA US']) });
  }
  return out;
}

export function classificarDg(texto: string | null): ResultadoDg {
  const t = (texto ?? '').toLowerCase();
  if (t.startsWith('gestante')) return 'gestante';
  if (t.startsWith('vazia')) return 'vazia';
  if (t.startsWith('confirmar')) return 'confirmar';
  return 'outro';
}

export function mapDiagnosticos(rows: string[][] | null, indice: Indice): Diagnostico[] {
  const out: Diagnostico[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['ID']);
    const data = diaDe(r['DATA DO DIAGNOSTICO']);
    const femea = chaveDe(indice, r['N° DO ANIMAL'], r['MICROCHIP']);
    const texto = parseText(r['DIAGNOSTICO']);
    if (!id || data == null || !femea || !texto) continue;
    out.push({
      id,
      femea,
      data,
      resultado: classificarDg(texto),
      texto,
      diasGestacao: parseNumber(r['Dias de gestação']),
      coberturaEstimada: diaDe(r['Data da cobertura estimada']) ?? diaDe(r['Data da cobertura|IA']),
      partoEstimado: diaDe(r['Parto estimado']),
    });
  }
  return out;
}

export function mapCrias(rows: string[][] | null, indice: Indice): Cria[] {
  const out: Cria[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['ID']);
    const nascimento = diaDe(r['Nascimento']);
    const mae = chaveDe(indice, r['Mãe'] || r['ID número|mãe'], r['ID eletrônica|mãe']);
    if (!id || nascimento == null || !mae) continue;
    const sexo = (parseText(r['Sexo']) ?? '').toLowerCase();
    const paiTexto = parseText(r['Pai']) ?? parseText(r['ID número|pai']);
    out.push({
      id,
      mae,
      nascimento,
      sexo: sexo.startsWith('m') ? 'macho' : sexo.startsWith('f') ? 'femea' : null,
      pai: paiTexto && paiTexto.toLowerCase() !== 'desconhecido' ? chaveDe(indice, paiTexto, r['ID eletrônica|pai']) : null,
      numero: normalizarNumero(r['Identificação']),
      nome: parseText(r['Nome da cria']),
    });
  }
  return out;
}

export function mapIA(rows: string[][] | null, indice: Indice): ServicoIA[] {
  const out: ServicoIA[] = [];
  for (const r of toObjects(rows)) {
    const data = diaDe(r['DATA']);
    const femea = chaveDe(indice, r['N° DO ANIMAL'], r['MICROCHIP']);
    if (data != null && femea) out.push({ femea, data });
  }
  return out;
}

export interface DadosReproducao {
  coberturas: Cobertura[];
  diagnosticos: Diagnostico[];
  crias: Cria[];
  ia: ServicoIA[];
}

// ---------------------------------------------------------------- estação (a "view")

export interface Estacao {
  id: string;
  reprodutor: string;
  reprodutorNumero: string | null;
  reprodutorNome: string | null;
  inicio: number;
  fim: number;
  finalizadaEm: number | null;
  femeas: string[];
  obs: string | null;
  /** Data e autor da versão atual. */
  alteradaEm: number;
  alteradaPor: string | null;
  criadaEm: number;
}

export const COLUNAS_ESTACAO = [
  'id',
  'estacao_id',
  'data',
  'acao',
  'reprodutor',
  'reprodutor_numero',
  'reprodutor_nome',
  'inicio',
  'fim',
  'finalizada_em',
  'femeas',
  'femeas_numeros',
  'obs',
  'lancado_por',
];

export type AcaoEstacao = 'criada' | 'alterada' | 'finalizada' | 'reaberta' | 'excluida';

/**
 * Uma linha por versão (nunca se edita linha): a estação atual é a última
 * linha do seu estacao_id; "excluida" some da lista. Ordem da planilha.
 */
export function mapEstacoes(rows: string[][] | null): Estacao[] {
  const atual = new Map<string, Estacao | null>();
  const criada = new Map<string, number>();
  for (const r of toObjects(rows)) {
    const id = parseText(r['estacao_id']);
    const data = diaDe(r['data']);
    const reprodutor = parseText(r['reprodutor']);
    const inicio = diaDe(r['inicio']);
    const fim = diaDe(r['fim']);
    if (!id || data == null) continue;
    if (!criada.has(id)) criada.set(id, data);
    if (parseText(r['acao']) === 'excluida') {
      atual.set(id, null);
      continue;
    }
    if (!reprodutor || inicio == null || fim == null) continue;
    atual.set(id, {
      id,
      reprodutor,
      reprodutorNumero: parseText(r['reprodutor_numero']),
      reprodutorNome: parseText(r['reprodutor_nome']),
      inicio,
      fim,
      finalizadaEm: diaDe(r['finalizada_em']),
      femeas: (parseText(r['femeas']) ?? '').split(';').map((s) => s.trim()).filter(Boolean),
      obs: parseText(r['obs']),
      alteradaEm: data,
      alteradaPor: parseText(r['lancado_por']),
      criadaEm: criada.get(id)!,
    });
  }
  return [...atual.values()].filter((e): e is Estacao => e != null);
}

/** Último dia em que cobertura conta: o fim previsto, ou o dia em que foi finalizada, se antes. */
export function fimEfetivo(e: Pick<Estacao, 'fim' | 'finalizadaEm'>): number {
  return e.finalizadaEm != null && e.finalizadaEm < e.fim ? e.finalizadaEm : e.fim;
}

export function estacaoAtiva(e: Pick<Estacao, 'fim' | 'finalizadaEm'>, hoje: number): boolean {
  return e.finalizadaEm == null && hoje <= e.fim;
}

function sobrepoe(a: { inicio: number; fim: number }, b: { inicio: number; fim: number }): boolean {
  return a.inicio <= b.fim && b.inicio <= a.fim;
}

/** Outra estação do MESMO reprodutor com período que se sobrepõe. */
export function conflitoReprodutor(estacoes: Estacao[], reprodutor: string, periodo: { inicio: number; fim: number }, ignorarId?: string): Estacao | null {
  return estacoes.find((e) => e.id !== ignorarId && e.reprodutor === reprodutor && sobrepoe({ inicio: e.inicio, fim: fimEfetivo(e) }, periodo)) ?? null;
}

/** Estação (outra) em que a fêmea já está, com período que se sobrepõe. */
export function estacaoDaFemea(estacoes: Estacao[], femea: string, periodo: { inicio: number; fim: number }, ignorarId?: string): Estacao | null {
  return estacoes.find((e) => e.id !== ignorarId && e.femeas.includes(femea) && sobrepoe({ inicio: e.inicio, fim: fimEfetivo(e) }, periodo)) ?? null;
}

export interface Candidata {
  femea: string;
  /** Datas das coberturas com o reprodutor no período, em ordem. */
  datas: number[];
  /** Outra estação que já tem esta fêmea no período — não pode entrar. */
  ocupadaEm: Estacao | null;
}

/** Fêmeas que podem formar a estação: só quem tem cobertura lançada no app com o reprodutor dentro do período. */
export function candidatas(
  coberturas: Cobertura[],
  estacoes: Estacao[],
  reprodutor: string,
  periodo: { inicio: number; fim: number },
  ignorarId?: string,
): Candidata[] {
  const porFemea = new Map<string, number[]>();
  for (const c of coberturas) {
    if (c.reprodutor !== reprodutor || c.data < periodo.inicio || c.data > periodo.fim) continue;
    porFemea.set(c.femea, [...(porFemea.get(c.femea) ?? []), c.data]);
  }
  return [...porFemea.entries()].map(([femea, datas]) => ({
    femea,
    datas: datas.sort((a, b) => a - b),
    ocupadaEm: estacaoDaFemea(estacoes, femea, periodo, ignorarId),
  }));
}

// ---------------------------------------------------------------- acompanhamento

export type Situacao = 'pariu' | 'gestante' | 'vazia' | 'confirmar' | 'us-atrasado' | 'aguardando-us' | 'sem-cobertura';

export interface Parto {
  data: number;
  crias: Cria[];
  /** Todo pai informado é o reprodutor da estação. */
  paiConfere: boolean;
}

export interface Acompanhamento {
  femea: string;
  coberturas: number[];
  usPrevisto: number | null;
  dg: Diagnostico | null;
  /** Início da janela de parto (ou a data, se o DG mediu a gestação). */
  partoPrevisto: number | null;
  /** Fim da janela de parto; igual a partoPrevisto quando o DG mediu. */
  partoPrevistoAte: number | null;
  parto: Parto | null;
  situacao: Situacao;
  /** Gestante, mas o ultrassom põe a cobertura fora do período (ex.: já entrou prenhe). */
  coberturaForaDaEstacao: boolean;
}

export function acompanharFemea(femea: string, e: Estacao, dados: DadosReproducao, hoje: number): Acompanhamento {
  const fim = fimEfetivo(e);
  const daEstacao = dados.coberturas
    .filter((c) => c.femea === femea && c.reprodutor === e.reprodutor && c.data >= e.inicio && c.data <= fim)
    .sort((a, b) => a.data - b.data);
  const vazio = { femea, coberturas: [], usPrevisto: null, dg: null, partoPrevisto: null, partoPrevistoAte: null, parto: null, coberturaForaDaEstacao: false };
  if (daEstacao.length === 0) return { ...vazio, situacao: 'sem-cobertura' };

  const primeira = daEstacao[0].data;
  const ultima = daEstacao[daEstacao.length - 1].data;
  const ids = new Set(daEstacao.map((c) => c.id));

  // Primeiro serviço FORA da estação depois da última cobertura: fecha a janela do DG e a do parto.
  const fora = [
    ...dados.coberturas.filter((c) => c.femea === femea && !ids.has(c.id) && c.data > ultima).map((c) => c.data),
    ...dados.ia.filter((s) => s.femea === femea && s.data > ultima).map((s) => s.data),
  ];
  const servicoFora = fora.length > 0 ? Math.min(...fora) : null;

  let dg: Diagnostico | null = null;
  for (const d of dados.diagnosticos) {
    if (d.femea !== femea || d.data < ultima || (servicoFora != null && d.data > servicoFora)) continue;
    if (!dg || d.data >= dg.data) dg = d;
  }

  const janelaIni = somarDias(primeira, PARTO_JANELA_INICIO)!;
  const janelaFim = somarDias(ultima, PARTO_JANELA_FIM)!;
  const corte = servicoFora != null ? somarDias(servicoFora, PARTO_JANELA_INICIO)! : null;
  const criasJanela = dados.crias.filter((c) => c.mae === femea && c.nascimento >= janelaIni && c.nascimento <= janelaFim && (corte == null || c.nascimento < corte));
  let parto: Parto | null = null;
  if (criasJanela.length > 0) {
    const data = Math.min(...criasJanela.map((c) => c.nascimento));
    const crias = criasJanela.filter((c) => c.nascimento === data);
    parto = { data, crias, paiConfere: crias.every((c) => c.pai == null || c.pai === e.reprodutor) };
  }

  const usPrevisto = daEstacao[daEstacao.length - 1].dataUs ?? somarDias(ultima, DIAS_ATE_US);
  const gestante = dg?.resultado === 'gestante';
  // Cobertura estimada pelo ultrassom só vale com idade gestacional medida (≠ padrão 30).
  const medido = gestante && dg!.coberturaEstimada != null && dg!.diasGestacao != null && dg!.diasGestacao !== DIAS_GESTACAO_PADRAO_DG;
  const est = medido ? dg!.coberturaEstimada! : null;
  const dentro = est != null && est >= somarDias(e.inicio, -FOLGA_COBERTURA_ESTIMADA)! && est <= somarDias(fim, FOLGA_COBERTURA_ESTIMADA)!;
  const coberturaForaDaEstacao = est != null && !dentro;
  let partoPrevisto: number | null = null;
  let partoPrevistoAte: number | null = null;
  if (gestante && !parto) {
    if (dentro) {
      partoPrevisto = partoPrevistoAte = somarDias(est, DIAS_GESTACAO)!;
    } else {
      partoPrevisto = somarDias(primeira, DIAS_GESTACAO)!;
      partoPrevistoAte = somarDias(Math.max(ultima, fim), DIAS_GESTACAO)!;
    }
  }

  let situacao: Situacao;
  if (parto) situacao = 'pariu';
  else if (dg?.resultado === 'gestante') situacao = 'gestante';
  else if (dg?.resultado === 'vazia') situacao = 'vazia';
  else if (dg?.resultado === 'confirmar') situacao = 'confirmar';
  else situacao = usPrevisto != null && hoje > usPrevisto ? 'us-atrasado' : 'aguardando-us';

  return { femea, coberturas: daEstacao.map((c) => c.data), usPrevisto, dg, partoPrevisto, partoPrevistoAte, parto, situacao, coberturaForaDaEstacao };
}

export function acompanharEstacao(e: Estacao, dados: DadosReproducao, hoje: number): Acompanhamento[] {
  return e.femeas.map((f) => acompanharFemea(f, e, dados, hoje));
}

export interface Indicadores {
  femeas: number;
  /** Com cobertura do reprodutor no período ainda lançada no app. */
  cobertas: number;
  gestantes: number;
  /** Gestantes cuja janela de parto já fechou sem parto lançado. */
  partoAtrasado: number;
  paridas: number;
  /** Gestantes + paridas. */
  prenhes: number;
  vazias: number;
  confirmar: number;
  aguardandoDg: number;
  usAtrasado: number;
  repasses: number;
  semCobertura: number;
  crias: number;
  criasMachos: number;
  criasFemeas: number;
  /** % sobre as cobertas; null sem cobertas. */
  taxaPrenhez: number | null;
  prolificidade: number | null;
  proximoParto: number | null;
}

export function indicadores(linhas: Acompanhamento[], hoje: number): Indicadores {
  const conta = (s: Situacao) => linhas.filter((l) => l.situacao === s).length;
  const cobertas = linhas.filter((l) => l.situacao !== 'sem-cobertura').length;
  const gestantes = conta('gestante');
  const paridas = conta('pariu');
  const crias = linhas.flatMap((l) => l.parto?.crias ?? []);
  // Próximo parto: início da janela mais cedo entre as que ainda não fecharam.
  const futuros = linhas.filter((l) => l.partoPrevistoAte != null && l.partoPrevistoAte >= hoje).map((l) => Math.max(l.partoPrevisto!, hoje));
  const arred = (n: number) => Math.round(n * 100) / 100;
  return {
    femeas: linhas.length,
    cobertas,
    gestantes,
    partoAtrasado: linhas.filter((l) => l.situacao === 'gestante' && l.partoPrevistoAte != null && l.partoPrevistoAte < hoje).length,
    paridas,
    prenhes: gestantes + paridas,
    vazias: conta('vazia'),
    confirmar: conta('confirmar'),
    aguardandoDg: conta('aguardando-us') + conta('us-atrasado'),
    usAtrasado: conta('us-atrasado'),
    repasses: linhas.filter((l) => l.coberturas.length >= 2).length,
    semCobertura: conta('sem-cobertura'),
    crias: crias.length,
    criasMachos: crias.filter((c) => c.sexo === 'macho').length,
    criasFemeas: crias.filter((c) => c.sexo === 'femea').length,
    taxaPrenhez: cobertas > 0 ? arred(((gestantes + paridas) / cobertas) * 100) : null,
    prolificidade: paridas > 0 ? arred(crias.length / paridas) : null,
    proximoParto: futuros.length > 0 ? Math.min(...futuros) : null,
  };
}

/** Dias de atraso do US previsto (positivo = atrasado). */
export function diasDeAtraso(previsto: number | null, hoje: number): number | null {
  return previsto == null ? null : diasEntre(previsto, hoje);
}
