/**
 * CDN e CDC da ABCC — regras puras (sem banco, sem tela, sem arquivo).
 *
 * CDN = Comunicação de Nascimento: até 25 crias por folha, todas do mesmo
 * método (o "( x )" do cabeçalho: Monta, IA ou TE).
 * CDC = Comunicação de Cobertura: um reprodutor, um período e as matrizes.
 * O "CDC Nº" de cada cria é o da CDC que trouxe a cobertura da mãe; o banco
 * acha (abcc_cdc_da_cria) — migration do app 20261016100000_abcc_cdn_cdc.sql.
 *
 * Decisões do produtor (16/10/2026): a numeração é do criador (informa a
 * primeira, o resto segue); macho sem nome sai DESCARTE; C/M sempre "C".
 */

export type Metodo = 'mn' | 'ia' | 'te';

export const METODOS: { chave: Metodo; rotulo: string }[] = [
  { chave: 'mn', rotulo: 'Monta natural / controlada' },
  { chave: 'ia', rotulo: 'Inseminação artificial' },
  { chave: 'te', rotulo: 'Transferência de embriões' },
];

/** Linhas da folha oficial da CDN (15 a 39 no modelo da Sanri). */
export const CRIAS_POR_CDN = 25;

export interface AnimalRef {
  id: number;
  nome: string | null;
  numero: string | null;
}

/** Uma cria como o banco devolve (abcc_cdn_crias). */
export interface CriaCdn {
  id: number;
  numero: string | null;
  nome: string | null;
  sexo: string | null;
  pelagem: string | null;
  raca: string | null;
  nascimento: string;
  peso: number | null;
  status: string | null;
  pai: AnimalRef | null;
  mae: AnimalRef | null;
  metodo: Metodo | null;
  dataCobertura: string | null;
  /** "NNN/AAAA" da CDC da cobertura da mãe, se o sistema tem. */
  cdc: string | null;
  /** rebanho.cdn = 'enviado' (o mesmo campo do filtro do app). */
  enviada: boolean;
  /** "NNN/AAAA" da CDN emitida pelo painel, se foi por aqui. */
  cdn: string | null;
}

/** Uma linha da CDN, exatamente o que vai em cada coluna da folha. */
export interface LinhaCdn {
  animalId: number;
  nome: string;
  /** true = macho sem nome: sai "DESCARTE", na cor do modelo. */
  descarte: boolean;
  numero: string;
  sexo: string;
  pelagem: string;
  /** "AAAA-MM-DD" */
  nascimento: string;
  peso: number | null;
  cm: string;
  usoDdg: string;
  pai: string;
  regPai: string;
  mae: string;
  regMae: string;
  cdc: string;
}

export interface CabecalhoCdn {
  numero: number;
  ano: number;
  /** "AAAA-MM-DD" — a data do canto (DATA:). */
  data: string;
  metodo: Metodo;
}

/** Uma cobertura como o banco devolve (abcc_cdc_coberturas). */
export interface CoberturaCdc {
  id: number;
  data: string;
  femea: AnimalRef & { status: string | null };
  reprodutor: (AnimalRef & { raca: string | null }) | null;
  cdc: string | null;
}

export interface LinhaCdc {
  animalId: number;
  coberturaId: number;
  nome: string;
  rgn: string;
  rgd: string;
  /** "AAAA-MM-DD" — a data da cobertura controlada. */
  data: string;
}

export interface CabecalhoCdc {
  numero: number;
  ano: number;
  /** Data de preenchimento ("AAAA-MM-DD"). */
  data: string;
  reprodutorId: number | null;
  reprodutor: string;
  registro: string;
  raca: string;
  periodoDe: string;
  periodoAte: string;
}

export function numeroTexto(numero: number, ano: number): string {
  return `${numero}/${ano}`;
}

/** Caixa alta, sem espaço sobrando — o padrão de nome da Sanri ("AMORA SANRI"). */
export function maiusculo(s: string | null | undefined): string {
  return (s ?? '').trim().replace(/\s+/g, ' ').toUpperCase();
}

function sexoCurto(sexo: string | null): string {
  const s = (sexo ?? '').trim().toLowerCase();
  if (s === 'macho' || s === 'm') return 'M';
  if (s === 'fêmea' || s === 'femea' || s === 'f') return 'F';
  return '';
}

/**
 * Pelagem da folha. Vazia na ficha e raça Saanen = BRANCA: o padrão racial da
 * Saanen é branco, e é o que a Sanri escreve (CDN 301: 21 de 21 BRANCA). Outra
 * raça sem pelagem fica vazia e o painel avisa.
 */
export function pelagemCdn(pelagem: string | null, raca: string | null): string {
  const p = maiusculo(pelagem);
  if (p) return p;
  return maiusculo(raca) === 'SAANEN' ? 'BRANCA' : '';
}

export function linhaCdn(c: CriaCdn): LinhaCdn {
  const nome = maiusculo(c.nome);
  const sexo = sexoCurto(c.sexo);
  const descarte = !nome && sexo === 'M';
  return {
    animalId: c.id,
    nome: descarte ? 'DESCARTE' : nome,
    descarte,
    numero: (c.numero ?? '').trim(),
    sexo,
    pelagem: pelagemCdn(c.pelagem, c.raca),
    nascimento: c.nascimento,
    peso: c.peso != null && c.peso > 0 ? Math.round(c.peso * 10) / 10 : null,
    cm: 'C',
    usoDdg: '',
    pai: maiusculo(c.pai?.nome),
    regPai: (c.pai?.numero ?? '').trim(),
    mae: maiusculo(c.mae?.nome),
    regMae: (c.mae?.numero ?? '').trim(),
    cdc: c.cdc ?? '',
  };
}

/** O que falta na cria para a folha sair completa (o painel avisa; não trava). */
export function faltasCdn(c: CriaCdn): string[] {
  const l = linhaCdn(c);
  const out: string[] = [];
  if (!l.nome) out.push('sem nome');
  if (!l.sexo) out.push('sem sexo');
  if (!l.pelagem) out.push('sem pelagem');
  if (l.peso == null) out.push('sem peso');
  if (!l.pai) out.push('sem pai');
  if (!l.mae) out.push('sem mãe');
  if (!c.metodo) out.push('cobertura não lançada');
  else if (c.metodo === 'mn' && !l.cdc) out.push('sem CDC');
  return out;
}

/** Método da cria; sem cobertura no sistema vale Monta, como a Sanri sempre fez. */
export function metodoDaCria(c: Pick<CriaCdn, 'metodo'>): Metodo {
  return c.metodo ?? 'mn';
}

/** Ordem da folha: pelo número da cria (a ordem de nascimento da ABCC). */
export function ordenarCrias<T extends Pick<CriaCdn, 'numero' | 'nascimento' | 'id'>>(crias: T[]): T[] {
  return [...crias].sort((a, b) => {
    const na = a.numero ?? '';
    const nb = b.numero ?? '';
    if (na.length !== nb.length) return na.length - nb.length;
    if (na !== nb) return na < nb ? -1 : 1;
    return a.nascimento < b.nascimento ? -1 : a.nascimento > b.nascimento ? 1 : a.id - b.id;
  });
}

/** Nascida entre `de` e `ate` ("AAAA-MM-DD", inclusive). Vazio = sem limite daquele lado. */
export function nasceuNoPeriodo(nascimento: string, de: string, ate: string): boolean {
  const d = nascimento.slice(0, 10);
  return (!de || d >= de) && (!ate || d <= ate);
}

/**
 * Ordem da LISTA na tela: a última que nasceu no topo (empate: o número
 * maior). A folha da CDN continua na ordem dos números — ver separarEmFolhas.
 */
export function recentesPrimeiro<T extends Pick<CriaCdn, 'numero' | 'nascimento' | 'id'>>(crias: T[]): T[] {
  return [...crias].sort((a, b) => {
    if (a.nascimento !== b.nascimento) return a.nascimento < b.nascimento ? 1 : -1;
    const na = a.numero ?? '';
    const nb = b.numero ?? '';
    if (na.length !== nb.length) return nb.length - na.length;
    if (na !== nb) return na < nb ? 1 : -1;
    return b.id - a.id;
  });
}

/**
 * Crias escolhidas -> folhas: uma por método, de 25 em 25, na ordem dos
 * números. 30 crias de monta viram uma folha de 25 e outra de 5.
 */
export function separarEmFolhas<T extends Pick<CriaCdn, 'numero' | 'nascimento' | 'id' | 'metodo'>>(
  crias: T[],
  porFolha = CRIAS_POR_CDN,
): { metodo: Metodo; crias: T[] }[] {
  const folhas: { metodo: Metodo; crias: T[] }[] = [];
  for (const { chave } of METODOS) {
    const doMetodo = ordenarCrias(crias.filter((c) => metodoDaCria(c) === chave));
    for (let i = 0; i < doMetodo.length; i += porFolha) folhas.push({ metodo: chave, crias: doMetodo.slice(i, i + porFolha) });
  }
  return folhas;
}

export interface ComunicacaoResumo {
  tipo: 'cdn' | 'cdc';
  ano: number;
  numero: number;
  cancelada: boolean;
}

/**
 * Próximo número do tipo no ano: o maior já usado + 1 (cancelada não conta).
 * Sem nenhum ainda = null: o criador informa o primeiro.
 */
export function proximoNumero(comunicacoes: ComunicacaoResumo[], tipo: 'cdn' | 'cdc', ano: number): number | null {
  const usados = comunicacoes.filter((c) => c.tipo === tipo && c.ano === ano && !c.cancelada).map((c) => c.numero);
  return usados.length ? Math.max(...usados) + 1 : null;
}

export function linhaCdc(c: CoberturaCdc): LinhaCdc {
  return {
    animalId: c.femea.id,
    coberturaId: c.id,
    nome: maiusculo(c.femea.nome),
    rgn: (c.femea.numero ?? '').trim(),
    rgd: '',
    data: c.data,
  };
}

/** Ordem da folha da CDC: pela data da cobertura, depois pelo número da matriz. */
export function ordenarCoberturas(cs: CoberturaCdc[]): CoberturaCdc[] {
  return [...cs].sort((a, b) => {
    if (a.data !== b.data) return a.data < b.data ? -1 : 1;
    const na = a.femea.numero ?? '';
    const nb = b.femea.numero ?? '';
    if (na.length !== nb.length) return na.length - nb.length;
    return na < nb ? -1 : na > nb ? 1 : a.id - b.id;
  });
}

/** Coberturas agrupadas por reprodutor, maior grupo primeiro. */
export function porReprodutor(cs: CoberturaCdc[]): { reprodutor: CoberturaCdc['reprodutor']; coberturas: CoberturaCdc[] }[] {
  const grupos = new Map<string, { reprodutor: CoberturaCdc['reprodutor']; coberturas: CoberturaCdc[] }>();
  for (const c of cs) {
    const k = c.reprodutor ? String(c.reprodutor.id) : 'sem';
    const g = grupos.get(k) ?? { reprodutor: c.reprodutor, coberturas: [] };
    g.coberturas.push(c);
    grupos.set(k, g);
  }
  return [...grupos.values()]
    .map((g) => ({ ...g, coberturas: ordenarCoberturas(g.coberturas) }))
    .sort((a, b) => b.coberturas.length - a.coberturas.length || maiusculo(a.reprodutor?.nome).localeCompare(maiusculo(b.reprodutor?.nome)));
}

/**
 * Erro do banco -> frase. As recusas das funções abcc_* começam com uma MARCA.
 */
export function traduzirErroAbcc(erro: { message?: string } | null | undefined): string {
  const msg = erro?.message ?? '';
  const depois = (m: string) => msg.slice(m.length + 1).trim();
  if (msg.startsWith('ABCC_NUMERO_USADO')) return `esse número já foi usado (${depois('ABCC_NUMERO_USADO').replace(/^a /, '')})`;
  if (msg.startsWith('ABCC_JA_EM_CDN')) return depois('ABCC_JA_EM_CDN');
  if (msg.startsWith('ABCC_JA_EM_CDC')) return depois('ABCC_JA_EM_CDC');
  if (msg.startsWith('ABCC_LINHAS_DEMAIS')) return 'animais demais para uma folha';
  if (msg.startsWith('ABCC_SEM_LINHAS')) return 'nenhum animal escolhido';
  if (msg.startsWith('ABCC_NAO_ENCONTRADA')) return 'comunicação não encontrada (já cancelada?)';
  if (msg.startsWith('ABCC_NAO_CANCELADA')) return 'cancele antes de excluir';
  if (msg.startsWith('ABCC_ANIMAL_FORA') || msg.startsWith('ABCC_COBERTURA_FORA')) return 'um dos animais não é desta fazenda';
  return 'não foi possível gravar';
}

/** "2026-10-16" -> "16/10/2026". */
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/** Nome do arquivo, no jeito dela: "CDN 302.2026.xlsx", "CDC 520.2026 DOURO SANRI.xlsx". */
export function nomeArquivo(tipo: 'cdn' | 'cdc', numero: number, ano: number, reprodutor?: string): string {
  const extra = tipo === 'cdc' && reprodutor ? ` ${maiusculo(reprodutor).replace(/[\\/:*?"<>|]/g, '')}` : '';
  return `${tipo.toUpperCase()} ${numero}.${ano}${extra}.xlsx`;
}
