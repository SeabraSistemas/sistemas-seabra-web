import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { apagarLancamento, gravarLancamento } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia, somarDias } from '@/lib/tres-irmaos/datas';
import { sessaoApi } from '@/lib/tres-irmaos/sessao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LITROS_MAX = 100_000; // um dígito a mais digitado sem querer não vira dado

async function autorizar(request: Request): Promise<string | NextResponse> {
  if (!mesmaOrigem(request, new URL(request.url))) return NextResponse.json({ erro: 'Origem inválida.' }, { status: 403 });
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Sessão expirada. Entre de novo.' }, { status: 401 });
  return email;
}

/** Grava um lançamento: produção do tanque ou uma coleta de comprador. */
export async function POST(request: Request) {
  const email = await autorizar(request);
  if (typeof email !== 'string') return email;

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }

  const data = String(corpo.data ?? '');
  const tipo = corpo.tipo === 'coleta' ? 'coleta' : corpo.tipo === 'producao' ? 'producao' : null;
  const comprador = tipo === 'coleta' ? String(corpo.comprador ?? '').trim() : null;
  const litros = Number(corpo.litros);
  const observacao = String(corpo.observacao ?? '').trim().slice(0, 500) || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return NextResponse.json({ erro: 'Data inválida.' }, { status: 400 });
  if (data > somarDias(hojeBrasilia(), 1)) return NextResponse.json({ erro: 'A data não pode ser no futuro.' }, { status: 400 });
  if (!tipo) return NextResponse.json({ erro: 'Escolha produção ou coleta.' }, { status: 400 });
  if (tipo === 'coleta' && !comprador) return NextResponse.json({ erro: 'Escolha o comprador.' }, { status: 400 });
  if (!Number.isFinite(litros) || litros <= 0 || litros > LITROS_MAX) return NextResponse.json({ erro: 'Litros inválidos.' }, { status: 400 });

  const r = await gravarLancamento({ data, tipo, comprador, litros: Math.round(litros * 100) / 100, observacao }, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 500 });
  return NextResponse.json({ ok: true, lancamento: r.dados });
}

export async function DELETE(request: Request) {
  const email = await autorizar(request);
  if (typeof email !== 'string') return email;
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ erro: 'Id inválido.' }, { status: 400 });
  const r = await apagarLancamento(id);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.erro === 'Lançamento não encontrado.' ? 404 : 500 });
  return NextResponse.json({ ok: true });
}
