import { NextResponse } from 'next/server';
import { sessaoValida } from '@/lib/pedidos/sessao';
import { lerDoc } from '@/lib/pedidos/nuvem';

export const dynamic = 'force-dynamic';

/**
 * Snapshot que o coletor grava (arquivo no Mac em dev; Supabase na Vercel, depois do login).
 * Vazio se ainda não houve leitura.
 */
export async function GET() {
  const sem = { 'Cache-Control': 'no-store' };
  if (!(await sessaoValida())) return NextResponse.json({ erro: 'não autorizado' }, { status: 401, headers: sem });
  return NextResponse.json({ snapshot: await lerDoc('snapshot') }, { headers: sem });
}
