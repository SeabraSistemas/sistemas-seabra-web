import { useMemo, useSyncExternalStore } from 'react';
import { CONTROLE_VAZIO, ESTADO_INICIAL, type BaseEstoque, type Controle, type EstadoPedidos, type Grupo, type OperacaoAntiga, type PedidoManual, type Venda } from './tipos';

/*
 * Estoque, vendas e ponto de partida. A FONTE DA VERDADE é o servidor (/pedidos/api/estado: Supabase
 * na Vercel, arquivo no Mac em dev), para o celular e o computador mostrarem o mesmo. O localStorage
 * é cache: abre a página já com o último estado e funciona sem rede. Cada gravação leva uma "rev"
 * (ms); a mais nova vence, e uma escrita mais velha nunca cobre uma mais nova. Sem localStorage
 * (aba privada), segue na memória.
 */

const CHAVE = 'seabra:pedidos:v1';
const EVENTO = 'seabra:pedidos';
const CHAVE_REV = 'seabra:pedidos:rev';
const CHAVE_BASE = 'seabra:pedidos:base-rev';

let memoria: string | null = null;

function ler(): string | null {
  try {
    return window.localStorage.getItem(CHAVE) ?? memoria;
  } catch {
    return memoria;
  }
}

function assinar(avisar: () => void) {
  window.addEventListener('storage', avisar);
  window.addEventListener(EVENTO, avisar);
  return () => {
    window.removeEventListener('storage', avisar);
    window.removeEventListener(EVENTO, avisar);
  };
}

const inteiro = (v: unknown, minimo = 0): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(minimo, Math.floor(v)) : undefined;
const dinheiro = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : undefined);

const grupo = (v: unknown): Grupo | undefined => (v === 'microchip' || v === 'leitor' || v === 'outro' ? v : undefined);

function controle(o: unknown): Controle {
  const r = (o ?? {}) as Record<string, unknown>;
  return {
    qtd: inteiro(r.qtd, 0),
    recebido: r.recebido === true ? true : undefined,
    grupo: grupo(r.grupo),
    foraDoEstoque: typeof r.foraDoEstoque === 'boolean' ? r.foraDoEstoque : undefined,
    custo: dinheiro(r.custo),
    notas: typeof r.notas === 'string' && r.notas ? r.notas : undefined,
    arquivado: r.arquivado === true ? true : undefined,
  };
}

/** Aceita qualquer JSON (localStorage ou arquivo importado) e devolve um estado válido. */
export function interpretar(bruto: string | null): EstadoPedidos {
  if (!bruto) return ESTADO_INICIAL;
  try {
    const o = JSON.parse(bruto) as Record<string, unknown>;
    const controles: Record<string, Controle> = {};
    for (const [id, c] of Object.entries((o.controles ?? {}) as Record<string, unknown>)) controles[id] = controle(c);
    const manuais: PedidoManual[] = [];
    for (const m of Array.isArray(o.manuais) ? o.manuais : []) {
      const r = m as Record<string, unknown>;
      if (typeof r?.id === 'string' && typeof r.titulo === 'string') {
        manuais.push({ id: r.id, titulo: r.titulo, qtd: inteiro(r.qtd, 1) ?? 1, grupo: grupo(r.grupo) ?? 'outro', data: typeof r.data === 'string' ? r.data : '' });
      }
    }
    const vendas: Venda[] = [];
    for (const v of Array.isArray(o.vendas) ? o.vendas : []) {
      const r = v as Record<string, unknown>;
      const g = grupo(r?.grupo);
      const qtd = inteiro(r?.qtd, 1);
      if (typeof r?.id === 'string' && g && qtd && typeof r.data === 'string') {
        vendas.push({ id: r.id, grupo: g, qtd, preco: dinheiro(r.preco), data: r.data, nota: typeof r.nota === 'string' && r.nota ? r.nota : undefined });
      }
    }
    const base: Partial<Record<Grupo, BaseEstoque>> = {};
    for (const [g, b] of Object.entries((o.base ?? {}) as Record<string, unknown>)) {
      const r = b as Record<string, unknown>;
      const gr = grupo(g);
      const qtd = inteiro(r?.qtd, 0);
      if (gr && qtd !== undefined && typeof r.em === 'string') {
        base[gr] = { qtd, em: r.em, excluidos: Array.isArray(r.excluidos) ? r.excluidos.filter((x): x is string => typeof x === 'string') : [] };
      }
    }
    const precosVenda: Partial<Record<Grupo, number>> = {};
    for (const [g, v] of Object.entries((o.precosVenda ?? {}) as Record<string, unknown>)) {
      const gr = grupo(g);
      const n = dinheiro(v);
      if (gr && n !== undefined) precosVenda[gr] = n;
    }
    const historico: OperacaoAntiga[] = [];
    for (const h of Array.isArray(o.historico) ? o.historico : []) {
      const r = h as Record<string, unknown>;
      const gr = grupo(r?.grupo);
      const un = inteiro(r?.unidades, 1);
      const custo = dinheiro(r?.custoUnit);
      const venda = dinheiro(r?.vendaUnit);
      if (typeof r?.id === 'string' && gr && un && custo !== undefined && venda !== undefined) {
        historico.push({ id: r.id, grupo: gr, descricao: typeof r.descricao === 'string' ? r.descricao : '', data: typeof r.data === 'string' && r.data ? r.data : undefined, unidades: un, custoUnit: custo, vendaUnit: venda });
      }
    }
    return { controles, manuais, vendas, base, precosVenda, historico, vistoEm: typeof o.vistoEm === 'string' ? o.vistoEm : null };
  } catch {
    return ESTADO_INICIAL;
  }
}

function lerRev(): number {
  try {
    return Number(window.localStorage.getItem(CHAVE_REV)) || 0;
  } catch {
    return 0;
  }
}

/** Última rev do SERVIDOR que este aparelho viu. O servidor recusa uma escrita feita em cima de uma rev mais velha. */
function lerBase(): number {
  try {
    return Number(window.localStorage.getItem(CHAVE_BASE)) || 0;
  } catch {
    return 0;
  }
}

function guardarBase(rev: number) {
  try {
    window.localStorage.setItem(CHAVE_BASE, String(rev));
  } catch {
    // Sem armazenamento.
  }
}

/** Guarda no cache local, sem mexer no servidor. */
function guardar(estado: EstadoPedidos, rev: number) {
  const texto = JSON.stringify(estado);
  memoria = texto;
  try {
    window.localStorage.setItem(CHAVE, texto);
    window.localStorage.setItem(CHAVE_REV, String(rev));
  } catch {
    // Sem armazenamento: fica só na memória desta aba.
  }
  window.dispatchEvent(new Event(EVENTO));
}

let agendado: number | undefined;

/** Manda o estado local ao servidor (agrupa gravações seguidas). Se o servidor tem algo mais novo, adota. */
function empurrar() {
  window.clearTimeout(agendado);
  agendado = window.setTimeout(async () => {
    try {
      const r = await fetch('/pedidos/api/estado', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: interpretar(ler()), rev: lerRev(), baseRev: lerBase() }) });
      if (r.status === 409) {
        // O servidor tem algo mais novo (ex.: o coletor gravou): adota em vez de apagar.
        const j = (await r.json()) as { estado: unknown; rev: number };
        guardar(interpretar(JSON.stringify(j.estado)), j.rev);
        guardarBase(j.rev);
      } else if (r.ok) guardarBase(lerRev());
    } catch {
      // Sem rede: fica no cache e vai na próxima gravação ou sincronização.
    }
  }, 600);
}

function gravar(estado: EstadoPedidos) {
  // Gravação que não muda nada (ex.: sair de um campo sem editar) não pode virar "versão mais nova".
  if (JSON.stringify(estado) === ler()) return;
  guardar(estado, Date.now());
  empurrar();
}

/** Puxa o estado do servidor se for mais novo que o local; se o local for mais novo, empurra. */
export async function sincronizarEstado() {
  try {
    const r = await fetch('/pedidos/api/estado', { cache: 'no-store' });
    if (r.status === 401) {
      window.location.assign('/pedidos/login');
      return;
    }
    if (!r.ok) return;
    const j = (await r.json()) as { estado: unknown | null; rev: number };
    const local = lerRev();
    if (j.estado && j.rev > local) {
      guardar(interpretar(JSON.stringify(j.estado)), j.rev);
      guardarBase(j.rev);
    } else if (local > j.rev && lerBase() >= j.rev) empurrar();
    else if (local > j.rev) guardarBase(0);
  } catch {
    // Sem rede.
  }
}

export function alterarEstado(mudar: (e: EstadoPedidos) => EstadoPedidos) {
  gravar(mudar(interpretar(ler())));
}

export function alterarControle(id: string, mudar: (c: Controle) => Controle) {
  alterarEstado((e) => ({ ...e, controles: { ...e.controles, [id]: controle(mudar(e.controles[id] ?? CONTROLE_VAZIO)) } }));
}

export function registrarVenda(venda: Omit<Venda, 'id' | 'data'> & { data?: string }) {
  const nova: Venda = { ...venda, id: `v-${Date.now().toString(36)}`, data: venda.data ?? new Date().toISOString() };
  alterarEstado((e) => ({ ...e, vendas: [nova, ...e.vendas] }));
}

/** "Tenho N agora": tudo que já foi recebido sai da conta e o estoque passa a andar a partir de N. */
export function acertarEstoque(g: Grupo, qtd: number, recebidosAgora: string[]) {
  alterarEstado((e) => ({ ...e, base: { ...e.base, [g]: { qtd: Math.max(0, Math.floor(qtd)), excluidos: recebidosAgora, em: new Date().toISOString() } } }));
}

export function definirPrecoVenda(g: Grupo, valor: number) {
  alterarEstado((e) => ({ ...e, precosVenda: { ...e.precosVenda, [g]: valor } }));
}

export function adicionarOperacaoAntiga(op: Omit<OperacaoAntiga, 'id'>) {
  alterarEstado((e) => ({ ...e, historico: [...(e.historico ?? []), { ...op, id: `op-${Date.now().toString(36)}` }] }));
}

export function removerOperacaoAntiga(id: string) {
  alterarEstado((e) => ({ ...e, historico: (e.historico ?? []).filter((o) => o.id !== id) }));
}

export function desfazerVenda(id: string) {
  alterarEstado((e) => ({ ...e, vendas: e.vendas.filter((v) => v.id !== id) }));
}

export function substituirEstado(texto: string): boolean {
  try {
    JSON.parse(texto);
  } catch {
    return false;
  }
  gravar(interpretar(texto));
  return true;
}

export function exportarEstado(): string {
  return JSON.stringify(interpretar(ler()), null, 2);
}

/** `null` até hidratar — no servidor não há localStorage. */
export function useEstadoPedidos(): EstadoPedidos | null {
  const bruto = useSyncExternalStore(assinar, ler, () => undefined);
  return useMemo(() => (bruto === undefined ? null : interpretar(bruto)), [bruto]);
}
