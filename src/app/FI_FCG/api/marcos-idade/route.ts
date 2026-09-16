import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { atualizarMarcoIdade } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Só PATCH — as 5 linhas (marcos fixos) são semeadas na criação da aba, ver mutations.ts. */
export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as { id?: string; idadeDias?: number };
  const id = corpo.id?.trim();
  if (!id || typeof corpo.idadeDias !== 'number' || !Number.isFinite(corpo.idadeDias)) {
    return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });
  }

  const ok = await atualizarMarcoIdade(id, corpo.idadeDias);
  if (!ok) return NextResponse.json({ erro: 'marco não encontrado ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
