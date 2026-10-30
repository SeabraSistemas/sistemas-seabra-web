/**
 * PARENTESCO — pedigree, matriz A, endogamia e A⁻¹.
 *
 * Duas camadas, como em numerico.ts:
 *
 * 1. A PORTA do motor (`ordenar_pedigree`, `matriz_A`, `coeficientes_F`,
 *    `inversa_A`, `F_acasalamento`, `tabela_F_acasalamentos`): mesmos nomes,
 *    argumentos e formas de saída de melhoramento/parentesco.py e de
 *    lab/calculadoras.js, conferidas contra vetores_teste.json. Lançam erro em
 *    ciclo e em animal duplicado, como o Python — são para pedigrees pequenos e
 *    limpos, digitados ou de livro.
 *
 * 2. A MONTAGEM DE UMA FAZENDA REAL (`montarPedigree`, `podarPedigree`,
 *    `endogamia`, `inversaAEsparsa`). O cadastro de um produtor não é um
 *    exemplo de livro: tem animal repetido, pai que aponta para um animal que
 *    não veio na leitura, às vezes um ciclo. Aqui NADA lança e NADA é
 *    silencioso: cada problema é corrigido do jeito mais conservador possível
 *    (o vínculo duvidoso vira "desconhecido") e entra em `problemas`, que a
 *    tela mostra. Um pedigree consertado em silêncio produz um EBV que ninguém
 *    sabe de onde veio.
 *
 *    A endogamia é calculada por Meuwissen e Luo (1992), sem montar A: com
 *    2.000 animais, A densa teria 4 milhões de células só para tirar a
 *    diagonal. A⁻¹ sai pelas regras de Henderson (1976) com a correção de Quaas
 *    (1976), como contribuições esparsas que vão direto para as MME. As duas
 *    conferem com a porta nos testes.
 */

export type IdAnimal = string;
type Pais = [IdAnimal | null, IdAnimal | null];
export type PedigreeEntrada =
  | Record<string, readonly [unknown, unknown]>
  | Map<unknown, readonly [unknown, unknown]>
  | readonly (readonly [unknown, unknown, unknown])[];

const DESCONHECIDOS = new Set(['0', '', '-', 'NA']);

/** true se o identificador aponta para um animal (e não para pai/mãe desconhecido). */
export function conhecido(animal: unknown): boolean {
  if (animal === null || animal === undefined || animal === 0 || animal === false) return false;
  return !(typeof animal === 'string' && DESCONHECIDOS.has(animal));
}

/** Normaliza o pedigree em linhas [animal, pai|null, mãe|null] com identificadores em texto. */
function linhasPedigree(ped: PedigreeEntrada): [IdAnimal, IdAnimal | null, IdAnimal | null][] {
  let linhas: [unknown, unknown, unknown][];
  if (Array.isArray(ped)) {
    linhas = (ped as readonly (readonly [unknown, unknown, unknown])[]).map((l) => [l[0], l[1], l[2]]);
  } else if (ped instanceof Map) {
    linhas = Array.from(ped, ([a, pais]) => [a, pais[0], pais[1]]);
  } else {
    const obj = ped as Record<string, readonly [unknown, unknown]>;
    linhas = Object.keys(obj).map((a) => [a, obj[a][0], obj[a][1]]);
  }
  const vistos = new Set<string>();
  return linhas.map(([a, p, m]) => {
    if (!conhecido(a)) throw new Error('há uma linha do pedigree sem identificação do animal');
    const id = String(a);
    if (vistos.has(id)) throw new Error(`o animal ${id} aparece em mais de uma linha do pedigree`);
    vistos.add(id);
    return [id, conhecido(p) ? String(p) : null, conhecido(m) ? String(m) : null];
  });
}

/**
 * Ordena com os pais antes dos filhos (ordenação topológica estável, igual à do
 * Python). Devolve [ids, completo]: completo é animal → [pai, mãe] e inclui
 * como fundadores os pais citados sem linha própria. Lança erro se houver ciclo.
 */
export function ordenar_pedigree(ped: PedigreeEntrada): [IdAnimal[], Map<IdAnimal, Pais>] {
  const completo = new Map<IdAnimal, Pais>();
  for (const [a, p, m] of linhasPedigree(ped)) completo.set(a, [p, m]);
  for (const pais of Array.from(completo.values())) {
    for (const p of pais) if (p !== null && !completo.has(p)) completo.set(p, [null, null]);
  }
  const ordem: IdAnimal[] = [];
  const feito = new Set<IdAnimal>();
  const emVisita = new Set<IdAnimal>();
  for (const raiz of Array.from(completo.keys())) {
    if (feito.has(raiz)) continue;
    const pilha: [IdAnimal, boolean][] = [[raiz, false]];
    while (pilha.length) {
      const [animal, paisProntos] = pilha.pop()!;
      if (feito.has(animal)) continue;
      if (paisProntos) {
        emVisita.delete(animal);
        feito.add(animal);
        ordem.push(animal);
        continue;
      }
      if (emVisita.has(animal)) throw new Error(`pedigree circular: ${animal} é ancestral de si mesmo`);
      emVisita.add(animal);
      pilha.push([animal, true]);
      const pais = completo.get(animal)!;
      for (let k = pais.length - 1; k >= 0; k--) {
        // o pai é visitado antes da mãe
        const p = pais[k];
        if (p !== null && !feito.has(p)) pilha.push([p, false]);
      }
    }
  }
  return [ordem, completo];
}

function indicesDosPais(ids: IdAnimal[], completo: Map<IdAnimal, Pais>): [number, number][] {
  const pos = new Map(ids.map((a, i) => [a, i]));
  return ids.map((a) => {
    const [pai, mae] = completo.get(a)!;
    return [pai !== null ? pos.get(pai)! : -1, mae !== null ? pos.get(mae)! : -1];
  });
}

/** A pelo método tabular: A_ij = ½(A_j,pai + A_j,mãe); A_ii = 1 + ½A_pai,mãe. Devolve [A, ids]. */
export function matriz_A(ped: PedigreeEntrada): [number[][], IdAnimal[]] {
  const [ids, completo] = ordenar_pedigree(ped);
  const pais = indicesDosPais(ids, completo);
  const n = ids.length;
  const A = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    const [s, d] = pais[i];
    for (let j = 0; j < i; j++) {
      let v = 0;
      if (s >= 0) v += 0.5 * A[s][j];
      if (d >= 0) v += 0.5 * A[d][j];
      A[i][j] = v;
      A[j][i] = v;
    }
    A[i][i] = 1.0 + (s >= 0 && d >= 0 ? 0.5 * A[s][d] : 0.0);
  }
  return [A, ids];
}

/** F_i = A_ii − 1 de cada animal: {animal: F}. */
export function coeficientes_F(ped: PedigreeEntrada): Record<IdAnimal, number> {
  const [A, ids] = matriz_A(ped);
  const F: Record<IdAnimal, number> = {};
  ids.forEach((a, i) => {
    F[a] = A[i][i] - 1.0;
  });
  return F;
}

/** A⁻¹ pelas regras de Henderson (1976) com a correção de Quaas (1976). Devolve [A⁻¹, ids]. */
export function inversa_A(
  ped: PedigreeEntrada,
  F: Record<string, number> | null = null,
  considerar_endogamia = true,
): [number[][], IdAnimal[]] {
  const [ids, completo] = ordenar_pedigree(ped);
  const pais = indicesDosPais(ids, completo);
  const n = ids.length;
  let Fv: number[];
  if (!considerar_endogamia) {
    Fv = new Array<number>(n).fill(0);
  } else if (F == null) {
    const [A] = matriz_A(ped);
    Fv = A.map((linha, i) => linha[i] - 1.0);
  } else {
    Fv = ids.map((a) => (Object.prototype.hasOwnProperty.call(F, a) ? Number(F[a]) : 0.0));
  }
  const Ainv = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  pais.forEach(([s, d], i) => {
    const conhecidos = [s, d].filter((p) => p >= 0);
    let di: number;
    if (conhecidos.length === 2) di = 0.5 - 0.25 * (Fv[s] + Fv[d]);
    else if (conhecidos.length === 1) di = 0.75 - 0.25 * Fv[conhecidos[0]];
    else di = 1.0;
    const alfa = 1.0 / di;
    const posicoes = [i].concat(conhecidos);
    const coef = [1.0].concat(conhecidos.map(() => -0.5));
    for (let u = 0; u < posicoes.length; u++) {
      for (let v = 0; v < posicoes.length; v++) Ainv[posicoes[u]][posicoes[v]] += alfa * coef[u] * coef[v];
    }
  });
  return [Ainv, ids];
}

function posicaoDe(ids: IdAnimal[], animal: unknown): number {
  const i = ids.indexOf(String(animal));
  if (i < 0) throw new Error(`o animal ${String(animal)} não está no pedigree`);
  return i;
}

/** Parentesco aditivo a_xy (elemento de A). */
export function parentesco(ped: PedigreeEntrada, x: unknown, y: unknown): number {
  const [A, ids] = matriz_A(ped);
  return A[posicaoDe(ids, x)][posicaoDe(ids, y)];
}

/** F do filho de um acasalamento: ½·a_pai,mãe. */
export function F_acasalamento(ped: PedigreeEntrada, pai: unknown, mae: unknown): number {
  return 0.5 * parentesco(ped, pai, mae);
}

/** F esperado de todos os pares: {macho: {fêmea: F}}. */
export function tabela_F_acasalamentos(
  ped: PedigreeEntrada,
  machos: readonly unknown[],
  femeas: readonly unknown[],
): Record<string, Record<string, number>> {
  const [A, ids] = matriz_A(ped);
  const saida: Record<string, Record<string, number>> = {};
  for (const m of machos) {
    const im = posicaoDe(ids, m);
    const linha: Record<string, number> = {};
    for (const f of femeas) linha[String(f)] = 0.5 * A[im][posicaoDe(ids, f)];
    saida[String(m)] = linha;
  }
  return saida;
}

// ─────────────────────────────────────────────────────────────────────────────
// Montagem do pedigree de uma fazenda real
// ─────────────────────────────────────────────────────────────────────────────

export interface AnimalPedigreeEntrada {
  id: number;
  pai: number | null;
  mae: number | null;
  /** 'macho' | 'fêmea' | outro texto do cadastro | null. Só para conferir coerência. */
  sexo?: string | null;
  /** 'YYYY-MM-DD'. Só para conferir se o pai nasceu antes do filho. */
  nascimento?: string | null;
}

export interface ProblemasPedigree {
  /** Ids que apareceram em mais de uma linha. Fica a PRIMEIRA linha. */
  duplicados: number[];
  /** Animais cujo pai ou mãe é ele mesmo. O vínculo vira desconhecido. */
  autoparentesco: number[];
  /** Pais citados que não estão nas linhas lidas (viraram desconhecidos). */
  paisAusentes: number[];
  /** Vínculos cortados para desfazer um ciclo: [animal, pai ou mãe removido]. */
  ciclosCortados: [number, number][];
  /** Animais usados como pai com sexo de fêmea, ou como mãe com sexo de macho. */
  sexoIncoerente: number[];
  /** Animais que aparecem ao mesmo tempo como pai e como mãe. */
  paiEMae: number[];
  /** Filhos que nasceram antes (ou no dia) do pai ou da mãe. Só contados. */
  nascimentoIncoerente: number;
}

export interface PedigreeMontado {
  /** Ids na ordem pais-antes-dos-filhos. */
  ids: number[];
  indice: Map<number, number>;
  /** Posição do pai e da mãe em `ids`; −1 = desconhecido. */
  pai: Int32Array;
  mae: Int32Array;
  problemas: ProblemasPedigree;
}

function normalizarSexo(s: string | null | undefined): 'macho' | 'femea' | null {
  if (!s) return null;
  const t = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
  if (t.startsWith('mach')) return 'macho';
  if (t.startsWith('feme')) return 'femea';
  return null;
}

/**
 * Monta o pedigree de uma fazenda a partir das linhas do cadastro. Nunca lança.
 *
 * Regras, nesta ordem, cada uma com o seu contador em `problemas`:
 *   1. id repetido: fica a primeira linha;
 *   2. animal que é pai ou mãe de si mesmo: o vínculo vira desconhecido;
 *   3. pai ou mãe que não está nas linhas: vira DESCONHECIDO. Não o promovemos a
 *      fundador porque, sem cadastro único de reprodutores, um id que veio de
 *      fora pode não ser o mesmo animal de que o produtor fala — inventar
 *      meio-irmãs a partir disso seria pior que perdê-las;
 *   4. ciclo (A é ancestral de A): o vínculo que fecha o ciclo é cortado.
 * Sexo incoerente e pai mais novo que o filho são só contados — não mudam o
 * cálculo, mas dizem muito da qualidade do cadastro.
 */
export function montarPedigree(linhas: readonly AnimalPedigreeEntrada[]): PedigreeMontado {
  const problemas: ProblemasPedigree = {
    duplicados: [],
    autoparentesco: [],
    paisAusentes: [],
    ciclosCortados: [],
    sexoIncoerente: [],
    paiEMae: [],
    nascimentoIncoerente: 0,
  };

  const porId = new Map<number, { pai: number | null; mae: number | null; sexo: string | null; nascimento: string | null }>();
  const duplicados = new Set<number>();
  for (const l of linhas) {
    if (porId.has(l.id)) {
      duplicados.add(l.id);
      continue;
    }
    porId.set(l.id, { pai: l.pai, mae: l.mae, sexo: l.sexo ?? null, nascimento: l.nascimento ?? null });
  }
  problemas.duplicados = [...duplicados].sort((a, b) => a - b);

  const ausentes = new Set<number>();
  const auto = new Set<number>();
  for (const [id, a] of porId) {
    for (const campo of ['pai', 'mae'] as const) {
      const p = a[campo];
      if (p == null) continue;
      if (p === id) {
        auto.add(id);
        a[campo] = null;
      } else if (!porId.has(p)) {
        ausentes.add(p);
        a[campo] = null;
      }
    }
  }
  problemas.autoparentesco = [...auto].sort((a, b) => a - b);
  problemas.paisAusentes = [...ausentes].sort((a, b) => a - b);

  // Coerência de sexo e de nascimento — só diagnóstico.
  const comoPai = new Set<number>();
  const comoMae = new Set<number>();
  for (const a of porId.values()) {
    if (a.pai != null) comoPai.add(a.pai);
    if (a.mae != null) comoMae.add(a.mae);
  }
  const sexoIncoerente = new Set<number>();
  for (const p of comoPai) if (normalizarSexo(porId.get(p)?.sexo) === 'femea') sexoIncoerente.add(p);
  for (const m of comoMae) if (normalizarSexo(porId.get(m)?.sexo) === 'macho') sexoIncoerente.add(m);
  problemas.sexoIncoerente = [...sexoIncoerente].sort((a, b) => a - b);
  problemas.paiEMae = [...comoPai].filter((p) => comoMae.has(p)).sort((a, b) => a - b);
  for (const a of porId.values()) {
    for (const p of [a.pai, a.mae]) {
      const np = p != null ? porId.get(p)?.nascimento : null;
      if (np && a.nascimento && np >= a.nascimento) problemas.nascimentoIncoerente += 1;
    }
  }

  // Ordenação topológica estável (pai antes da mãe), cortando o vínculo que
  // fecharia um ciclo em vez de lançar.
  const ordem: number[] = [];
  const estado = new Map<number, 1 | 2>(); // 1 = em visita, 2 = feito
  for (const raiz of porId.keys()) {
    if (estado.get(raiz) === 2) continue;
    const pilha: [number, boolean][] = [[raiz, false]];
    while (pilha.length) {
      const [animal, paisProntos] = pilha.pop()!;
      if (estado.get(animal) === 2) continue;
      if (paisProntos) {
        estado.set(animal, 2);
        ordem.push(animal);
        continue;
      }
      estado.set(animal, 1);
      pilha.push([animal, true]);
      const a = porId.get(animal)!;
      for (const campo of ['mae', 'pai'] as const) {
        const p = a[campo];
        if (p == null) continue;
        const e = estado.get(p);
        if (e === 1) {
          // p está na pilha de visita: ligar animal → p fecharia um ciclo.
          problemas.ciclosCortados.push([animal, p]);
          a[campo] = null;
        } else if (e !== 2) {
          pilha.push([p, false]);
        }
      }
    }
  }

  const indice = new Map(ordem.map((id, i) => [id, i]));
  const pai = new Int32Array(ordem.length).fill(-1);
  const mae = new Int32Array(ordem.length).fill(-1);
  ordem.forEach((id, i) => {
    const a = porId.get(id)!;
    if (a.pai != null) pai[i] = indice.get(a.pai)!;
    if (a.mae != null) mae[i] = indice.get(a.mae)!;
  });
  return { ids: ordem, indice, pai, mae, problemas };
}

/**
 * Fica só com os animais de `manter` e os ancestrais deles, na mesma ordem.
 *
 * É exato para o BLUP: um animal sem registro e sem descendente com registro
 * não muda a solução de nenhum outro (a linha dele nas MME só o liga aos pais,
 * e absorvê-la devolve exatamente a contribuição que a poda tira). Os
 * problemas do pedigree original são mantidos, porque dizem respeito ao
 * cadastro inteiro.
 */
export function podarPedigree(ped: PedigreeMontado, manter: Iterable<number>): PedigreeMontado {
  const marcado = new Uint8Array(ped.ids.length);
  const pilha: number[] = [];
  for (const id of manter) {
    const i = ped.indice.get(id);
    if (i != null && !marcado[i]) {
      marcado[i] = 1;
      pilha.push(i);
    }
  }
  while (pilha.length) {
    const i = pilha.pop()!;
    for (const p of [ped.pai[i], ped.mae[i]]) {
      if (p >= 0 && !marcado[p]) {
        marcado[p] = 1;
        pilha.push(p);
      }
    }
  }
  const ids: number[] = [];
  const antigoParaNovo = new Int32Array(ped.ids.length).fill(-1);
  ped.ids.forEach((id, i) => {
    if (marcado[i]) {
      antigoParaNovo[i] = ids.length;
      ids.push(id);
    }
  });
  const pai = new Int32Array(ids.length);
  const mae = new Int32Array(ids.length);
  ids.forEach((id, novo) => {
    const antigo = ped.indice.get(id)!;
    pai[novo] = ped.pai[antigo] >= 0 ? antigoParaNovo[ped.pai[antigo]] : -1;
    mae[novo] = ped.mae[antigo] >= 0 ? antigoParaNovo[ped.mae[antigo]] : -1;
  });
  return { ids, indice: new Map(ids.map((id, i) => [id, i])), pai, mae, problemas: ped.problemas };
}

/** O formato `{animal: [pai, mãe]}` da porta, para conferir montagem contra o motor. */
export function comoPedigreeDoMotor(ped: PedigreeMontado): Record<string, [string, string]> {
  const saida: Record<string, [string, string]> = {};
  ped.ids.forEach((id, i) => {
    saida[String(id)] = [
      ped.pai[i] >= 0 ? String(ped.ids[ped.pai[i]]) : '0',
      ped.mae[i] >= 0 ? String(ped.ids[ped.mae[i]]) : '0',
    ];
  });
  return saida;
}

/**
 * Endogamia de cada animal por Meuwissen e Luo (1992, GSE 24:305), sem A.
 *
 * F_i = Σ_j L_ij²·D_j − 1, percorrendo os ancestrais de i do mais novo para o
 * mais velho; D_j = ½ − ¼(F_pai + F_mãe), com F = −1 para pai desconhecido (o
 * que devolve D = 1 para fundador e ¾ − ¼F para um pai só). Exige a ordem
 * pais-antes-dos-filhos de montarPedigree.
 */
export function endogamia(ped: PedigreeMontado): Float64Array {
  const n = ped.ids.length;
  const F = new Float64Array(n);
  const D = new Float64Array(n);
  const L = new Float64Array(n);
  const Fde = (p: number) => (p >= 0 ? F[p] : -1);
  for (let i = 0; i < n; i++) {
    const s = ped.pai[i];
    const d = ped.mae[i];
    D[i] = 0.5 - 0.25 * (Fde(s) + Fde(d));
    if (s < 0 || d < 0) {
      // Sem os dois pais não há caminho comum: F = 0.
      F[i] = 0;
      continue;
    }
    if (i > 0 && s === ped.pai[i - 1] && d === ped.mae[i - 1]) {
      // Irmão completo do anterior: mesmo F.
      F[i] = F[i - 1];
      continue;
    }
    // Fila de ancestrais em ordem decrescente de posição (heap de máximo).
    const heap: number[] = [i];
    const naFila = new Set<number>([i]);
    L[i] = 1;
    let fi = 0;
    while (heap.length) {
      const j = popMax(heap);
      naFila.delete(j);
      const lj = L[j];
      L[j] = 0;
      for (const p of [ped.pai[j], ped.mae[j]]) {
        if (p < 0) continue;
        if (!naFila.has(p)) {
          naFila.add(p);
          pushMax(heap, p);
        }
        L[p] += 0.5 * lj;
      }
      fi += lj * lj * D[j];
    }
    F[i] = fi - 1;
  }
  return F;
}

function pushMax(h: number[], v: number): void {
  h.push(v);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p] >= h[i]) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}

function popMax(h: number[]): number {
  const topo = h[0];
  const ultimo = h.pop()!;
  if (h.length) {
    h[0] = ultimo;
    let i = 0;
    for (;;) {
      const e = 2 * i + 1;
      const d = e + 1;
      let m = i;
      if (e < h.length && h[e] > h[m]) m = e;
      if (d < h.length && h[d] > h[m]) m = d;
      if (m === i) break;
      [h[m], h[i]] = [h[i], h[m]];
      i = m;
    }
  }
  return topo;
}

/**
 * A⁻¹ como contribuições esparsas (Henderson 1976, Quaas 1976): para cada
 * animal, as posições [animal, pai?, mãe?], os coeficientes [1, −½, −½] e
 * α = 1/D. A⁻¹ = Σ α·c·cᵀ. `aplicar` soma cada termo onde quem chama quiser —
 * nas MME, já multiplicado por λ = σ²e/σ²a.
 */
export function inversaAEsparsa(
  ped: PedigreeMontado,
  F: Float64Array,
  aplicar: (i: number, j: number, valor: number) => void,
): void {
  const n = ped.ids.length;
  for (let i = 0; i < n; i++) {
    const conhecidos: number[] = [];
    if (ped.pai[i] >= 0) conhecidos.push(ped.pai[i]);
    if (ped.mae[i] >= 0) conhecidos.push(ped.mae[i]);
    let di: number;
    if (conhecidos.length === 2) di = 0.5 - 0.25 * (F[conhecidos[0]] + F[conhecidos[1]]);
    else if (conhecidos.length === 1) di = 0.75 - 0.25 * F[conhecidos[0]];
    else di = 1.0;
    const alfa = 1.0 / di;
    const posicoes = [i, ...conhecidos];
    const coef = [1.0, ...conhecidos.map(() => -0.5)];
    for (let u = 0; u < posicoes.length; u++) {
      for (let v = 0; v < posicoes.length; v++) aplicar(posicoes[u], posicoes[v], alfa * coef[u] * coef[v]);
    }
  }
}
