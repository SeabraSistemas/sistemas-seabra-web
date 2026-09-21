import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { formarLote } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Grava o `lote` em RebanhoProd dos animais escolhidos (aba Pesagem -> Formar lote). */
export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as { nomeLote?: string; ids?: string[] };
  const nomeLote = corpo.nomeLote?.trim();
  const ids = Array.isArray(corpo.ids) ? corpo.ids.filter((i) => typeof i === 'string' && i.trim() !== '') : [];
  if (!nomeLote || ids.length === 0) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const resultado = await formarLote(nomeLote, ids);
  if (!resultado.ok) return NextResponse.json({ erro: resultado.erro ?? 'falha ao gravar' }, { status: 502 });

  invalidarCache();
  return NextResponse.json(resultado);
}
