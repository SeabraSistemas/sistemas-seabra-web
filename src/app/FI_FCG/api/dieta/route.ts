import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { atualizarItemDieta, criarItemDieta, excluirItemDieta, type DadosItemDieta } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CorpoItemDieta {
  categoria?: string;
  insumo?: string;
  percentual?: number;
}

function dadosDe(corpo: CorpoItemDieta): DadosItemDieta | null {
  const categoria = corpo.categoria?.trim();
  const insumo = corpo.insumo?.trim();
  if (!categoria || !insumo || typeof corpo.percentual !== 'number' || !Number.isFinite(corpo.percentual)) return null;
  return { categoria, insumo, percentual: corpo.percentual };
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const dados = dadosDe((await request.json()) as CorpoItemDieta);
  if (!dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const { ok, id } = await criarItemDieta(dados);
  if (!ok) return NextResponse.json({ erro: 'falha ao gravar na planilha' }, { status: 502 });

  invalidarCache();
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as CorpoItemDieta & { id?: string };
  const id = corpo.id?.trim();
  const dados = id ? dadosDe(corpo) : null;
  if (!id || !dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const ok = await atualizarItemDieta(id, dados);
  if (!ok) return NextResponse.json({ erro: 'item não encontrado ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { id } = (await request.json()) as { id?: string };
  if (!id?.trim()) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 });

  const ok = await excluirItemDieta(id.trim());
  if (!ok) return NextResponse.json({ erro: 'item não encontrado ou falha ao apagar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
