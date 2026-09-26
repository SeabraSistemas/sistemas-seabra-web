import { U } from '@/lib/bovinos/texto';
import type { Modelo, RegIatf, RegParto, RegRebanho } from '@/lib/bovinos/modelo';

/**
 * Identidade dos animais entre RebanhoProd, Reproduçao e Parto(s).
 *
 * O AppSheet casa a mãe com as IATFs só por `ID animal = ID Mãe`. Isso falha
 * quando o animal foi recadastrado, trocou de brinco, ou quando a
 * Reproduçao foi lançada pelo N° de manejo/SISBOV (Bonito e Santo Antônio).
 * Aqui a mãe é achada por qualquer um: chave (ID A), ID animal, N° de
 * manejo, Identificação e brinco/SISBOV — com um salto pelo brinco para
 * pegar o outro cadastro do mesmo animal.
 */

export interface IatfVia extends RegIatf {
  /** Por onde a IATF foi ligada à mãe (para a prova). */
  via: string[];
}

export interface Indices {
  porA: Map<string, RegRebanho>;
  nome2A: Map<string, Set<string>>;
  tag2A: Map<string, Set<string>>;
  A2nomes: Map<string, Set<string>>;
  A2tags: Map<string, Set<string>>;
  iatfPorNome: Map<string, RegIatf[]>;
  iatfPorTag: Map<string, RegIatf[]>;
  iatfPorA: Map<string, RegIatf[]>;
  /** Rebanho pelo brinco ATUAL e pelo ID animal (para achar recadastro). */
  rebPorTag: Map<string, RegRebanho[]>;
  rebPorId: Map<string, RegRebanho[]>;
  /** Chaves do Rebanho que já são o bezerro de algum parto (não podem ser o recadastro de outro). */
  asDePartos: Set<string>;
}

function add<K, V>(m: Map<K, Set<V>>, k: K, v: V) {
  if (!k || !v) return;
  let s = m.get(k);
  if (!s) m.set(k, (s = new Set()));
  s.add(v);
}

function push<K, V>(m: Map<K, V[]>, k: K, v: V) {
  if (!k) return;
  let l = m.get(k);
  if (!l) m.set(k, (l = []));
  l.push(v);
}

export function criarIndices(m: Modelo): Indices {
  const ind: Indices = {
    porA: new Map(),
    nome2A: new Map(),
    tag2A: new Map(),
    A2nomes: new Map(),
    A2tags: new Map(),
    iatfPorNome: new Map(),
    iatfPorTag: new Map(),
    iatfPorA: new Map(),
    rebPorTag: new Map(),
    rebPorId: new Map(),
    asDePartos: new Set(),
  };

  for (const r of m.rebanho) {
    if (r.id) push(ind.rebPorId, U(r.id), r);
    if (r.tag) push(ind.rebPorTag, r.tag, r);
    if (!r.A) continue;
    if (!ind.porA.has(r.A)) ind.porA.set(r.A, r);
    for (const n of [U(r.id), U(r.manejo)]) {
      add(ind.nome2A, n, r.A);
      add(ind.A2nomes, r.A, n);
    }
    add(ind.tag2A, r.tag, r.A);
    add(ind.A2tags, r.A, r.tag);
  }

  // Histórico de nomes/brincos que a Reproduçao guardou junto com uma chave real.
  for (const x of m.iatfs) {
    for (const n of x.nomes) push(ind.iatfPorNome, n, x);
    for (const g of x.tags) push(ind.iatfPorTag, g, x);
    if (x.A) push(ind.iatfPorA, x.A, x);
    if (!ind.porA.has(x.A)) continue;
    for (const n of x.nomes) {
      add(ind.nome2A, n, x.A);
      add(ind.A2nomes, x.A, n);
    }
    for (const g of x.tags) {
      add(ind.tag2A, g, x.A);
      add(ind.A2tags, x.A, g);
    }
  }

  for (const p of m.partos) {
    if (ind.porA.has(p.A)) {
      ind.asDePartos.add(p.A);
      add(ind.nome2A, U(p.id), p.A);
      add(ind.A2nomes, p.A, U(p.id));
      add(ind.tag2A, p.tag, p.A);
      add(ind.A2tags, p.A, p.tag);
    }
    // Nome da mãe → chave, só quando o parto é coerente (a chave aponta mesmo para esse nome).
    const alvo = ind.porA.get(p.idM);
    if (alvo && maeCoerente(alvo, p.mae)) add(ind.nome2A, U(p.mae), p.idM);
  }
  return ind;
}

/** A chave (ID M) do parto aponta para um animal com esse ID Mãe (pelo ID animal ou N° de manejo)? */
export function maeCoerente(alvo: RegRebanho, idMae: string): boolean {
  const u = U(idMae);
  return !!u && (U(alvo.id) === u || U(alvo.manejo) === u);
}

/**
 * Todas as IATFs da mãe de um parto, em ordem de data.
 *
 * Com a chave (ID M) coerente com o ID Mãe, parte só dela — o nome sozinho
 * pode ser de outra vaca. Se a chave aponta para OUTRO animal, o parto é
 * incoerente e nada é ligado (`conflito` explica; quem chama bloqueia).
 * Um nome (ID animal, N° de manejo, Identificação) só liga IATF se não for
 * também de outro animal — na Bonito, o N° de manejo de uma novilha é o
 * número de outra vaca.
 */
export function iatfsDaMae(ind: Indices, idM: string, idMae: string): { lista: IatfVia[]; conflito: string | null } {
  const As = new Set<string>();
  const nomes = new Set<string>();
  const tags = new Set<string>();
  const um = U(idMae);
  const alvo = idM ? ind.porA.get(idM) : undefined;
  if (alvo && um && !maeCoerente(alvo, idMae)) {
    return { lista: [], conflito: `O parto diz mãe ${idMae}, mas a chave (ID M) aponta para ${alvo.id}.` };
  }
  if (um) nomes.add(um);
  if (alvo) As.add(idM);
  else for (const a of ind.nome2A.get(um) ?? []) As.add(a);

  for (const a of [...As]) {
    for (const n of ind.A2nomes.get(a) ?? []) nomes.add(n);
    for (const g of ind.A2tags.get(a) ?? []) tags.add(g);
  }
  // Um salto pelo brinco: o outro cadastro do mesmo animal (recadastro / troca de chave).
  for (const g of [...tags]) {
    for (const a of ind.tag2A.get(g) ?? []) {
      if (As.has(a)) continue;
      As.add(a);
      for (const n of ind.A2nomes.get(a) ?? []) nomes.add(n);
    }
  }
  // Nome que também é de outro animal não serve para ligar.
  for (const n of [...nomes]) {
    const donos = ind.nome2A.get(n);
    if (donos && [...donos].some((a) => !As.has(a))) nomes.delete(n);
  }

  const out = new Map<number, IatfVia>();
  const put = (x: RegIatf, via: string) => {
    const e = out.get(x.linha) ?? { ...x, via: [] };
    if (!e.via.includes(via)) e.via.push(via);
    out.set(x.linha, e);
  };
  for (const n of nomes) for (const x of ind.iatfPorNome.get(n) ?? []) put(x, U(x.idTxt) === um ? 'ID animal = ID Mãe' : 'nome/manejo');
  for (const a of As) for (const x of ind.iatfPorA.get(a) ?? []) put(x, 'chave');
  for (const g of tags) for (const x of ind.iatfPorTag.get(g) ?? []) put(x, 'brinco');
  return { lista: [...out.values()].sort((a, b) => (a.data ?? 0) - (b.data ?? 0)), conflito: null };
}

/**
 * O cadastro do bezerro no Rebanho. Primeiro pela chave do parto (ID A); se
 * ela não existe mais, procura um recadastro: mesmo brinco, ou mesmo ID
 * animal (quando esse nome é único), que ainda não seja bezerro de outro
 * parto. Mais de um candidato = não decide (null).
 */
export function acharBezerro(ind: Indices, p: RegParto): { rb: RegRebanho; recadastrado: boolean } | null {
  const direto = ind.porA.get(p.A);
  if (direto) return { rb: direto, recadastrado: false };

  const cands = new Map<string, RegRebanho>();
  const juntar = (l: RegRebanho[] | undefined) => {
    for (const r of l ?? []) if (r.A && !ind.asDePartos.has(r.A)) cands.set(r.A, r);
  };
  if (p.tag) juntar(ind.rebPorTag.get(p.tag));
  // Na Benoni o ID animal do bezerro no parto É o número do brinco.
  if (p.id) juntar(ind.rebPorTag.get(p.id));
  const porNome = ind.rebPorId.get(U(p.id));
  if (porNome && porNome.length === 1) juntar(porNome);

  if (cands.size === 1) return { rb: [...cands.values()][0], recadastrado: true };
  if (cands.size > 1) return null;

  // Parto lançado duas vezes: a outra linha já ligou o bezerro pela chave. Pelo
  // nome único ele é o mesmo animal — a checagem de duplicado decide se a mãe bate.
  if (porNome && porNome.length === 1 && porNome[0].A) return { rb: porNome[0], recadastrado: false };
  return null;
}
