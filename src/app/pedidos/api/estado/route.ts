import { NextResponse } from 'next/server';
import { sessaoValida } from '@/lib/pedidos/sessao';
import { gravarDoc, lerDoc } from '@/lib/pedidos/nuvem';

/** Estoque, vendas e ponto de partida: fonte da verdade no servidor (o localStorage é só cache). */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEM_CACHE = { 'Cache-Control': 'no-store' };
const nao = () => NextResponse.json({ erro: 'não autorizado' }, { status: 401, headers: SEM_CACHE });

interface Doc {
  estado: unknown;
  rev: number;
}
const doc = (v: unknown): Doc | null => {
  const o = v as Partial<Doc> | null;
  return o && typeof o.rev === 'number' && o.estado && typeof o.estado === 'object' ? (o as Doc) : null;
};

export async function GET() {
  if (!(await sessaoValida())) return nao();
  const d = doc(await lerDoc('estado'));
  return NextResponse.json({ estado: d?.estado ?? null, rev: d?.rev ?? 0 }, { headers: SEM_CACHE });
}

export async function PUT(request: Request) {
  if (!(await sessaoValida())) return nao();
  const texto = await request.text();
  if (texto.length > 1_000_000) return NextResponse.json({ erro: 'grande demais' }, { status: 413 });
  let corpo: Partial<Doc>;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ erro: 'json inválido' }, { status: 400 });
  }
  if (typeof corpo.rev !== 'number' || !corpo.estado || typeof corpo.estado !== 'object') return NextResponse.json({ erro: 'pedido inválido' }, { status: 400 });

  // Última escrita vence, mas nunca uma MAIS VELHA sobre uma mais nova (aba esquecida aberta).
  const atual = doc(await lerDoc('estado'));
  if (atual && corpo.rev < atual.rev) return NextResponse.json({ estado: atual.estado, rev: atual.rev }, { status: 409, headers: SEM_CACHE });
  const ok = await gravarDoc('estado', { estado: corpo.estado, rev: corpo.rev });
  return NextResponse.json({ ok }, { status: ok ? 200 : 500, headers: SEM_CACHE });
}
