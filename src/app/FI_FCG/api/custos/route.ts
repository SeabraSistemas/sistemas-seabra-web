import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { atualizarCusto, criarCusto, excluirCusto, type DadosCusto } from '@/lib/fi-fcg/mutations';
import { diaDeInput } from '@/lib/painel/format';
import type { TipoCusto } from '@/lib/fi-fcg/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CorpoCusto {
  descricao?: string;
  categoria?: string | null;
  fazenda?: string | null;
  tipo?: string;
  valor?: number;
  dataInicio?: string; // "aaaa-mm-dd", do <input type=date>
  dataFim?: string | null;
  observacao?: string | null;
}

/** Valida e converte o corpo bruto (datas em "aaaa-mm-dd") pro formato que `mutations.ts` espera. null se faltar campo obrigatório. */
function dadosDe(corpo: CorpoCusto): DadosCusto | null {
  const descricao = corpo.descricao?.trim();
  const tipo = corpo.tipo;
  const dataInicio = corpo.dataInicio ? diaDeInput(corpo.dataInicio) : null;
  if (!descricao || (tipo !== 'Mensal' && tipo !== 'Anual') || typeof corpo.valor !== 'number' || !Number.isFinite(corpo.valor) || dataInicio == null) {
    return null;
  }
  return {
    descricao,
    categoria: corpo.categoria ?? null,
    fazenda: corpo.fazenda ?? null,
    tipo: tipo as TipoCusto,
    valor: corpo.valor,
    dataInicio,
    dataFim: corpo.dataFim ? diaDeInput(corpo.dataFim) : null,
    observacao: corpo.observacao ?? null,
  };
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const dados = dadosDe((await request.json()) as CorpoCusto);
  if (!dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const { ok, id } = await criarCusto(dados);
  if (!ok) return NextResponse.json({ erro: 'falha ao gravar na planilha' }, { status: 502 });

  invalidarCache();
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const corpo = (await request.json()) as CorpoCusto & { id?: string };
  const id = corpo.id?.trim();
  const dados = id ? dadosDe(corpo) : null;
  if (!id || !dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const ok = await atualizarCusto(id, dados);
  if (!ok) return NextResponse.json({ erro: 'custo não encontrado ou falha ao gravar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const { id } = (await request.json()) as { id?: string };
  if (!id?.trim()) return NextResponse.json({ erro: 'id obrigatório' }, { status: 400 });

  const ok = await excluirCusto(id.trim());
  if (!ok) return NextResponse.json({ erro: 'custo não encontrado ou falha ao apagar' }, { status: 404 });

  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
