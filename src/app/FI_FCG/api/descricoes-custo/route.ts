import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { criarDescricaoCusto, excluirDescricaoCusto, renomearDescricaoCusto } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { nome } = (await request.json()) as { nome?: string };
  if (!nome?.trim()) return NextResponse.json({ erro: 'nome obrigatório' }, { status: 400 });

  const { ok, id } = await criarDescricaoCusto({ nome });
  if (!ok) return NextResponse.json({ erro: 'falha ao gravar na planilha' }, { status: 502 });

  invalidarCache();
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { id, nome } = (await request.json()) as { id?: string; nome?: string };
  if (!id?.trim() || !nome?.trim()) return NextResponse.json({ erro: 'id e nome obrigatórios' }, { status: 400 });

  const ok = await renomearDescricaoCusto(id.trim(), { nome });
  if (!ok) return NextResponse.json({ erro: 'descrição não encontrada ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { id } = (await request.json()) as { id?: string };
  if (!id?.trim()) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 });

  const ok = await excluirDescricaoCusto(id.trim());
  if (!ok) return NextResponse.json({ erro: 'descrição não encontrada ou falha ao apagar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
