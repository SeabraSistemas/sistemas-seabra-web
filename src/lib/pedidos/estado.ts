import { useMemo, useSyncExternalStore } from 'react';
import { CONTROLE_VAZIO, ESTADO_INICIAL, type BaseEstoque, type Controle, type EstadoPedidos, type Grupo, type PedidoManual, type Venda } from './tipos';

/*
 * O /pedidos guarda estoque e baixas no localStorage deste navegador (decisão
 * do Felipe: sem banco). O preço é não sincronizar entre aparelhos — por isso
 * existe exportar/importar. Sem localStorage (aba privada), segue na memória.
 */

const CHAVE = 'seabra:pedidos:v1';
const EVENTO = 'seabra:pedidos';

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
    return { controles, manuais, vendas, base, vistoEm: typeof o.vistoEm === 'string' ? o.vistoEm : null };
  } catch {
    return ESTADO_INICIAL;
  }
}

function gravar(estado: EstadoPedidos) {
  const texto = JSON.stringify(estado);
  memoria = texto;
  try {
    window.localStorage.setItem(CHAVE, texto);
  } catch {
    // Sem armazenamento: fica só na memória desta aba.
  }
  window.dispatchEvent(new Event(EVENTO));
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
