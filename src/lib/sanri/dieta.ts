/**
 * Dieta por baia — puro (sem rede), testável.
 *
 * Substitui a planilha de Excel "Alimentação" que a equipe usava: para cada
 * baia, o nº de cabras e quanto dar de silagem, ração e feno em cada turno.
 * Silagem e ração se medem em BALDE (é o que o tratador enxerga); feno em kg.
 *
 * Tudo mora na aba `dieta_baia`, UMA LINHA POR ALTERAÇÃO (nunca se edita
 * linha): a dieta atual de uma baia é a última linha dela na planilha, e as
 * anteriores são o histórico. Quantidades e nº de cabras são digitados —
 * decisão de 24/09/2026: o Excel não segue regra por categoria, e o nº de
 * cabras do RebanhoProd não bate com o do curral.
 */
import { diaDe, parseNumber, parseText } from '@/lib/painel/format';

export const ALIMENTOS = [
  { chave: 'silagem', nome: 'Silagem', unidade: 'baldes', kgPorUnidade: 20 },
  { chave: 'racao', nome: 'Ração', unidade: 'baldes', kgPorUnidade: 2 },
  { chave: 'feno', nome: 'Feno', unidade: 'kg', kgPorUnidade: 1 },
] as const;

export const TURNOS = [
  { chave: 'manha', nome: 'Manhã' },
  { chave: '12h', nome: '12h' },
  { chave: 'tarde', nome: 'Tarde' },
] as const;

export type ChaveAlimento = (typeof ALIMENTOS)[number]['chave'];
export type ChaveTurno = (typeof TURNOS)[number]['chave'];
export type Alimento = (typeof ALIMENTOS)[number];

/** Quantidade na unidade do alimento (baldes ou kg). null = não se dá nada. */
export type Quantidades = Record<ChaveAlimento, Record<ChaveTurno, number | null>>;

/** Nome da coluna em dieta_baia: "silagem_manha_baldes", "feno_12h_kg". */
export function colunaDe(alimento: Alimento, turno: ChaveTurno): string {
  return `${alimento.chave}_${turno}_${alimento.unidade}`;
}

/** Header da aba dieta_baia, na ordem em que é criada. */
export const COLUNAS_DIETA = [
  'id',
  'data',
  'baia',
  'categoria',
  'cabras',
  ...TURNOS.flatMap((t) => ALIMENTOS.map((a) => colunaDe(a, t.chave))),
  'obs',
  'lancado_por',
];

export interface Baia {
  nome: string;
  galpao: string;
  /** Da aba Baia_categoria (do AppSheet) — só sugestão para a dieta. */
  categoria: string | null;
}

export interface DietaBaia {
  id: string;
  /** aaaammdd da alteração. */
  data: number;
  baia: string;
  categoria: string | null;
  cabras: number | null;
  quantidades: Quantidades;
  obs: string | null;
  lancadoPor: string | null;
}

export function quantidadesVazias(): Quantidades {
  const q = {} as Quantidades;
  for (const a of ALIMENTOS) q[a.chave] = { manha: null, '12h': null, tarde: null };
  return q;
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

/** "g1-4 " => "G1-4". A planilha do AppSheet tem nome de baia com espaço sobrando. */
export function normalizarBaia(raw: string | null | undefined): string | null {
  const t = parseText(raw);
  return t ? t.toUpperCase() : null;
}

/** "G1-5" => "Galpão 1"; "BODIL" => "Bodil". */
export function galpaoDe(baia: string): string {
  const m = baia.match(/^G(\d+)-/);
  if (m) return `Galpão ${m[1]}`;
  return baia.charAt(0) + baia.slice(1).toLowerCase();
}

/** Galpões numerados primeiro (G1, G2…), baia por número dentro do galpão; o resto (Bodil, Maternidade) no fim, por nome. */
function chaveOrdem(baia: string): [number, number, string] {
  const m = baia.match(/^G(\d+)-(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), ''] : [Number.MAX_SAFE_INTEGER, 0, baia];
}

export function compararBaias(a: string, b: string): number {
  const [ga, na, sa] = chaveOrdem(a);
  const [gb, nb, sb] = chaveOrdem(b);
  return ga - gb || na - nb || sa.localeCompare(sb);
}

/** Categorias que não são animal em baia (o BOTIJÃO guarda sêmen). */
const NAO_E_BAIA = new Set(['SÊMEN', 'SEMEN', 'EMBRIÃO', 'EMBRIAO']);

/** Baias da aba `Baias`, com a categoria de `Baia_categoria`. Sem duplicata, na ordem do curral. */
export function mapBaias(baiasRows: string[][] | null, categoriaRows: string[][] | null): Baia[] {
  const categoria = new Map<string, string>();
  for (const r of toObjects(categoriaRows)) {
    const nome = normalizarBaia(r['Baia']);
    const cat = parseText(r['Categoria']);
    if (nome && cat) categoria.set(nome, cat);
  }
  const vistos = new Set<string>();
  const baias: Baia[] = [];
  for (const r of toObjects(baiasRows)) {
    const nome = normalizarBaia(r['baias']);
    if (!nome || vistos.has(nome)) continue;
    const cat = categoria.get(nome) ?? null;
    if (cat && NAO_E_BAIA.has(cat.toUpperCase())) continue;
    vistos.add(nome);
    baias.push({ nome, galpao: galpaoDe(nome), categoria: cat });
  }
  return baias.sort((a, b) => compararBaias(a.nome, b.nome));
}

/** Todas as linhas de dieta_baia, na ordem da planilha (a mais recente de cada baia é a última). */
export function mapDieta(rows: string[][] | null): DietaBaia[] {
  const out: DietaBaia[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['id']);
    const baia = normalizarBaia(r['baia']);
    const data = diaDe(r['data']);
    if (!id || !baia || data == null) continue;
    const quantidades = quantidadesVazias();
    for (const t of TURNOS) {
      for (const a of ALIMENTOS) {
        const n = parseNumber(r[colunaDe(a, t.chave)]);
        quantidades[a.chave][t.chave] = n != null && n > 0 ? n : null;
      }
    }
    const cabras = parseNumber(r['cabras']);
    out.push({
      id,
      data,
      baia,
      categoria: parseText(r['categoria']),
      cabras: cabras != null && cabras >= 0 ? Math.round(cabras) : null,
      quantidades,
      obs: parseText(r['obs']),
      lancadoPor: parseText(r['lancado_por']),
    });
  }
  return out;
}

/** Dieta atual de cada baia = última linha dela. */
export function dietaAtual(historico: DietaBaia[]): Map<string, DietaBaia> {
  const atual = new Map<string, DietaBaia>();
  for (const d of historico) atual.set(d.baia, d);
  return atual;
}

function arred(n: number): number {
  return Math.round(n * 100) / 100;
}

export function kgDe(alimento: Alimento, quantidade: number | null): number | null {
  return quantidade == null ? null : arred(quantidade * alimento.kgPorUnidade);
}

/** kg por dia de cada alimento (soma dos turnos). */
export function kgPorDia(q: Quantidades): Record<ChaveAlimento, number> {
  const out = {} as Record<ChaveAlimento, number>;
  for (const a of ALIMENTOS) {
    out[a.chave] = arred(TURNOS.reduce((s, t) => s + (kgDe(a, q[a.chave][t.chave]) ?? 0), 0));
  }
  return out;
}

/** kg por cabra por dia de cada alimento. null se a baia não tem cabra informada. */
export function kgPorCabra(d: Pick<DietaBaia, 'cabras' | 'quantidades'>): Record<ChaveAlimento, number> | null {
  if (!d.cabras) return null;
  const dia = kgPorDia(d.quantidades);
  const out = {} as Record<ChaveAlimento, number>;
  for (const a of ALIMENTOS) out[a.chave] = arred(dia[a.chave] / d.cabras);
  return out;
}

export function temAlimento(q: Quantidades): boolean {
  return ALIMENTOS.some((a) => TURNOS.some((t) => q[a.chave][t.chave] != null));
}

/** Baia vazia: 0 cabras, ou sem cabra informada e sem nada de comida. */
export function baiaVazia(d: Pick<DietaBaia, 'cabras' | 'quantidades'>): boolean {
  return d.cabras === 0 || (d.cabras == null && !temAlimento(d.quantidades));
}

/** Soma de todas as baias, por turno e alimento, na unidade do alimento — o que preparar para cada trato. */
export function totaisPorTurno(dietas: DietaBaia[]): Quantidades {
  const total = quantidadesVazias();
  for (const d of dietas) {
    if (baiaVazia(d)) continue;
    for (const a of ALIMENTOS) {
      for (const t of TURNOS) {
        const v = d.quantidades[a.chave][t.chave];
        if (v != null) total[a.chave][t.chave] = arred((total[a.chave][t.chave] ?? 0) + v);
      }
    }
  }
  return total;
}
