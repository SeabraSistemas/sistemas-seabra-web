import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { cancelar, emitirCdc, emitirCdn, marcar } from '@/lib/sanri/abcc-mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Teto de sanidade por pedido: um ano inteiro de crias cabe folgado. */
const MAXIMO = 400;

function inteiro(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isInteger(n) ? n : null;
}

function ids(v: unknown): number[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAXIMO) return null;
  const out = v.map(inteiro);
  return out.every((x): x is number => x != null && x > 0) ? [...new Set(out)] : null;
}

function dataIso(v: unknown): string | null {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

const ruim = (erro: string) => NextResponse.json({ erro }, { status: 400 });

/**
 * Ações da aba CDN e CDC: { acao: 'cdn' | 'cdc' | 'cancelar' | 'marcar', … }.
 * Tudo grava pelas funções abcc_* do banco do app, que conferem a fazenda.
 */
export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const c = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  if (c.acao === 'cdn') {
    const lista = ids(c.ids);
    const numero = inteiro(c.numero);
    const data = dataIso(c.data);
    if (!lista) return ruim('escolha as crias');
    if (numero == null || numero < 1) return ruim('informe o número da CDN');
    if (!data) return ruim('data inválida');
    const cdc: Record<string, string> = {};
    if (c.cdc && typeof c.cdc === 'object') {
      for (const [k, v] of Object.entries(c.cdc as Record<string, unknown>)) if (typeof v === 'string') cdc[k] = v.slice(0, 20);
    }
    const r = await emitirCdn(lista, numero, data, cdc, email);
    return r.ok ? NextResponse.json(r, { status: 201 }) : NextResponse.json({ erro: r.erro }, { status: r.status });
  }

  if (c.acao === 'cdc') {
    const lista = ids(c.ids);
    const numero = inteiro(c.numero);
    const data = dataIso(c.data);
    const de = dataIso(c.periodoDe);
    const ate = dataIso(c.periodoAte);
    if (!lista) return ruim('escolha as coberturas');
    if (numero == null || numero < 1) return ruim('informe o número da CDC');
    if (!data) return ruim('data inválida');
    if (!de || !ate || de > ate) return ruim('período inválido');
    const r = await emitirCdc({ coberturaIds: lista, numero, data, periodoDe: de, periodoAte: ate, externa: c.externa === true }, email);
    return r.ok ? NextResponse.json(r, { status: 201 }) : NextResponse.json({ erro: r.erro }, { status: r.status });
  }

  if (c.acao === 'cancelar') {
    const id = inteiro(c.id);
    if (id == null) return ruim('comunicação inválida');
    const r = await cancelar(id);
    return r.ok ? NextResponse.json(r) : NextResponse.json({ erro: r.erro }, { status: r.status });
  }

  if (c.acao === 'marcar') {
    const lista = ids(c.ids);
    if (!lista) return ruim('escolha as crias');
    const r = await marcar(lista, c.enviada === true);
    return r.ok ? NextResponse.json(r) : NextResponse.json({ erro: r.erro }, { status: r.status });
  }

  return ruim('ação desconhecida');
}
