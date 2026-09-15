import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { atualizarInsumo, criarInsumo, excluirInsumo, type DadosInsumo } from '@/lib/fi-fcg/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CorpoInsumo {
  nome?: string;
  tipo?: string | null;
  valorKg?: number;
}

function dadosDe(corpo: CorpoInsumo): DadosInsumo | null {
  const nome = corpo.nome?.trim();
  if (!nome || typeof corpo.valorKg !== 'number' || !Number.isFinite(corpo.valorKg)) return null;
  return { nome, tipo: corpo.tipo?.trim() || null, valorKg: corpo.valorKg };
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const dados = dadosDe((await request.json()) as CorpoInsumo);
  if (!dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const { ok, id } = await criarInsumo(dados);
  if (!ok) return NextResponse.json({ erro: 'falha ao gravar na planilha' }, { status: 502 });

  invalidarCache();
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as CorpoInsumo & { id?: string };
  const id = corpo.id?.trim();
  const dados = id ? dadosDe(corpo) : null;
  if (!id || !dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const ok = await atualizarInsumo(id, dados);
  if (!ok) return NextResponse.json({ erro: 'insumo não encontrado ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { id } = (await request.json()) as { id?: string };
  if (!id?.trim()) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 });

  const ok = await excluirInsumo(id.trim());
  if (!ok) return NextResponse.json({ erro: 'insumo não encontrado ou falha ao apagar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
