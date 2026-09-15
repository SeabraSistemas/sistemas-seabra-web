import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { atualizarGmdCategoria } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Só PATCH — as 7 linhas (uma por categoria do funil) são fixas, ver mutations.ts. */
export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as { id?: string; gmdKgDia?: number };
  const id = corpo.id?.trim();
  if (!id || typeof corpo.gmdKgDia !== 'number' || !Number.isFinite(corpo.gmdKgDia)) {
    return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });
  }

  const ok = await atualizarGmdCategoria(id, corpo.gmdKgDia);
  if (!ok) return NextResponse.json({ erro: 'categoria não encontrada ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
