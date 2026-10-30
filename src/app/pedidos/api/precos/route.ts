import { NextResponse } from 'next/server';
import { sessaoValida } from '@/lib/pedidos/sessao';
import { lerDoc } from '@/lib/pedidos/nuvem';

export const dynamic = 'force-dynamic';

/** Histórico diário de preços que o coletor grava (arquivo no Mac em dev; Supabase na Vercel, depois do login). */
export async function GET() {
  const sem = { 'Cache-Control': 'no-store' };
  if (!(await sessaoValida())) return NextResponse.json({ erro: 'não autorizado' }, { status: 401, headers: sem });
  const h = await lerDoc('precos');
  return NextResponse.json({ historico: Array.isArray(h) ? h : [] }, { headers: sem });
}
