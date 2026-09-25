/**
 * Conferência de baia — puro (sem rede), testável.
 *
 * Quem está no curral conta os animais de uma baia e digita o total; o painel
 * compara com o que a planilha (AppSheet) diz que está naquela baia. Se não
 * bate, a pessoa marca "vi aqui" animal a animal para achar quem falta, e
 * procura o "animal a mais" (que está na baia mas a planilha põe em outra).
 *
 * A referência é SÓ leitura do RebanhoProd. O painel grava apenas o resultado
 * da conferência, na aba própria `conferencia_baia` (uma linha por conferência,
 * nunca editada) — nada do AppSheet é tocado (decisão de 25/09/2026).
 *
 * Quem "está" na baia: linha VIVA do RebanhoProd com a coluna BAIA preenchida
 * e igual à baia. Vendido/morto com a baia ainda preenchida não conta (mas o
 * painel avisa, porque o "Animais: N" do AppSheet pode estar contando eles).
 * Contagem por NÚMERO do animal, não por linha.
 */
import { diaDe, parseNumber, parseText } from '@/lib/painel/format';
import { normalizarBaia } from '@/lib/sanri/dieta';
import { toObjects, type Animal } from '@/lib/sanri/monta';

/** Header da aba conferencia_baia, na ordem em que é criada. Listas de animais são números separados por ";". */
export const COLUNAS_CONFERENCIA = ['id', 'data', 'baia', 'contados', 'esperados', 'diferenca', 'vistos', 'nao_vistos', 'a_mais', 'obs', 'lancado_por'];

/** Teto de sanidade: nenhuma baia da Sanri chega perto disso. */
export const MAXIMO_CONTADOS = 500;

export interface AnimalNaBaia {
  chave: string;
  numero: string;
  nome: string | null;
  categoria: string | null;
  /** Outras baias em que o MESMO número aparece em linha viva do RebanhoProd (cadastro repetido). */
  tambemEm: string[];
}

function comparar(a: { nome: string | null; numero: string }, b: { nome: string | null; numero: string }): number {
  return (a.nome ?? a.numero).localeCompare(b.nome ?? b.numero, 'pt-BR') || a.numero.localeCompare(b.numero);
}

/** Vivos com baia preenchida, agrupados por número: número -> baias em que aparece. */
function baiasPorNumero(animais: Animal[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const a of animais) {
    const b = normalizarBaia(a.baia);
    if (!a.vivo || !b) continue;
    (m.get(a.numero) ?? m.set(a.numero, new Set()).get(a.numero)!).add(b);
  }
  return m;
}

/** Animais que a planilha põe nesta baia — um por número, em ordem alfabética. */
export function animaisDaBaia(animais: Animal[], baia: string): AnimalNaBaia[] {
  const alvo = normalizarBaia(baia);
  if (!alvo) return [];
  const baias = baiasPorNumero(animais);
  const vistos = new Set<string>();
  const out: AnimalNaBaia[] = [];
  for (const a of animais) {
    if (!a.vivo || normalizarBaia(a.baia) !== alvo || vistos.has(a.numero)) continue;
    vistos.add(a.numero);
    out.push({
      chave: a.chave,
      numero: a.numero,
      nome: a.nome,
      categoria: a.categoria,
      tambemEm: [...(baias.get(a.numero) ?? [])].filter((b) => b !== alvo).sort(),
    });
  }
  return out.sort(comparar);
}

/** Vendidos/mortos que continuam com esta baia preenchida na planilha — não entram na contagem. */
export function foraDaContagem(animais: Animal[], baia: string): Animal[] {
  const alvo = normalizarBaia(baia);
  if (!alvo) return [];
  const numeros = new Set<string>();
  return animais
    .filter((a) => {
      if (a.vivo || normalizarBaia(a.baia) !== alvo || numeros.has(a.numero)) return false;
      numeros.add(a.numero);
      return true;
    })
    .sort(comparar);
}

/** Animais esperados por baia (número de animais distintos vivos). */
export function contagemPorBaia(animais: Animal[]): Map<string, number> {
  const contagem = new Map<string, number>();
  for (const numeros of baiasPorNumero(animais).values()) {
    // Cadastro repetido em duas baias conta nas duas: a baia não sabe qual é a certa.
    for (const b of numeros) contagem.set(b, (contagem.get(b) ?? 0) + 1);
  }
  return contagem;
}

export type Situacao = 'bate' | 'falta' | 'sobra';

/** contados − esperados. Negativo: faltam animais na baia; positivo: sobram. */
export function compararContagem(esperados: number, contados: number): { diferenca: number; situacao: Situacao } {
  const diferenca = contados - esperados;
  return { diferenca, situacao: diferenca === 0 ? 'bate' : diferenca < 0 ? 'falta' : 'sobra' };
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Procura por número (inteiro ou só o final, como "25285"), microchip ou nome.
 * Vivos primeiro; um resultado por número.
 */
export function buscarAnimais(animais: Animal[], termo: string, limite = 8): Animal[] {
  const t = semAcento(termo.trim());
  if (t.length < 2) return [];
  const digitos = t.replace(/\s+/g, '');
  const soNumero = /^\d+$/.test(digitos);
  const palavras = t.split(/\s+/);
  const achados = animais.filter((a) => {
    if (soNumero) return a.numero.includes(digitos) || (a.chip?.includes(digitos) ?? false);
    const nome = semAcento(a.nome ?? '');
    return palavras.every((p) => nome.includes(p));
  });
  const visto = new Set<string>();
  return achados
    .sort((a, b) => Number(b.vivo) - Number(a.vivo) || Number(soNumero && b.numero.endsWith(digitos)) - Number(soNumero && a.numero.endsWith(digitos)) || comparar(a, b))
    .filter((a) => (visto.has(a.numero) ? false : (visto.add(a.numero), true)))
    .slice(0, limite);
}

export interface Apuracao {
  esperados: number;
  contados: number;
  diferenca: number;
  vistos: string[];
  /** Esperados na baia que não foram marcados — só se a pessoa usou a lista. */
  naoVistos: string[];
  aMais: string[];
}

/**
 * Confere o pedido contra a planilha e devolve o que vai ser gravado. Os
 * números vêm do cliente, mas quem decide o que é "esperado" é a planilha
 * lida agora — nunca o que a tela mostrava.
 */
export function apurar(animais: Animal[], baia: string, contados: number, vistos: string[], aMais: string[]): Apuracao | { erro: string } {
  if (!Number.isInteger(contados) || contados < 0 || contados > MAXIMO_CONTADOS) return { erro: 'informe quantos animais você contou (0 se a baia está vazia)' };
  const daBaia = animaisDaBaia(animais, baia);
  const naBaia = new Set(daBaia.map((a) => a.numero));
  const conhecidos = new Set(animais.map((a) => a.numero));

  const vistosUnicos = [...new Set(vistos)];
  const invalido = vistosUnicos.find((n) => !naBaia.has(n));
  if (invalido) return { erro: `o animal ${invalido} não está nesta baia na planilha` };
  const aMaisUnicos = [...new Set(aMais)];
  const desconhecido = aMaisUnicos.find((n) => !conhecidos.has(n));
  if (desconhecido) return { erro: `o animal ${desconhecido} não existe na planilha` };
  const jaNaBaia = aMaisUnicos.find((n) => naBaia.has(n));
  if (jaNaBaia) return { erro: `o animal ${jaNaBaia} já está na lista desta baia` };

  const esperados = daBaia.length;
  const usouLista = vistosUnicos.length > 0;
  return {
    esperados,
    contados,
    diferenca: contados - esperados,
    vistos: vistosUnicos,
    naoVistos: usouLista ? daBaia.map((a) => a.numero).filter((n) => !vistosUnicos.includes(n)) : [],
    aMais: aMaisUnicos,
  };
}

// ---------------------------------------------------------------- histórico (aba conferencia_baia)

export interface Conferencia {
  id: string;
  /** aaaammdd */
  data: number;
  baia: string;
  contados: number;
  esperados: number;
  diferenca: number;
  vistos: string[];
  naoVistos: string[];
  aMais: string[];
  obs: string | null;
  lancadoPor: string | null;
}

function lista(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(';')
    .map((n) => n.replace(/\D/g, ''))
    .filter(Boolean);
}

/** Todas as conferências, na ordem da planilha (a mais recente de cada baia é a última). */
export function mapConferencias(rows: string[][] | null): Conferencia[] {
  const out: Conferencia[] = [];
  for (const r of toObjects(rows)) {
    const id = parseText(r['id']);
    const baia = normalizarBaia(r['baia']);
    const data = diaDe(r['data']);
    const contados = parseNumber(r['contados']);
    const esperados = parseNumber(r['esperados']);
    if (!id || !baia || data == null || contados == null || esperados == null) continue;
    out.push({
      id,
      data,
      baia,
      contados: Math.round(contados),
      esperados: Math.round(esperados),
      diferenca: Math.round(contados) - Math.round(esperados),
      vistos: lista(r['vistos']),
      naoVistos: lista(r['nao_vistos']),
      aMais: lista(r['a_mais']),
      obs: parseText(r['obs']),
      lancadoPor: parseText(r['lancado_por']),
    });
  }
  return out;
}

/** Última conferência de cada baia. */
export function ultimaPorBaia(historico: Conferencia[]): Map<string, Conferencia> {
  const m = new Map<string, Conferencia>();
  for (const c of historico) m.set(c.baia, c);
  return m;
}
