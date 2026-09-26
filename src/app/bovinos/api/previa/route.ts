import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { sessaoApi } from '@/lib/bovinos/sessao';
import { clientePorSlug } from '@/lib/bovinos/clientes';
import { escritaHabilitada, prepararLote } from '@/lib/bovinos/correcao';
import { assinarLote } from '@/lib/bovinos/lote-assinatura';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Prévia de correção: relê a planilha, monta o lote com os problemas
 * escolhidos e devolve o lote ASSINADO. A tela desenha a prévia a partir do
 * próprio token — e é só esse token que /api/gravar aceita.
 */
export async function POST(request: Request) {
  if (!mesmaOrigem(request, new URL(request.url))) return NextResponse.json({ erro: 'Origem inválida.' }, { status: 403 });
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Sessão expirada — entre de novo.' }, { status: 401 });
  if (!escritaHabilitada()) return NextResponse.json({ erro: 'Correção desligada (BOVINOS_ESCRITA_HABILITADA).' }, { status: 403 });
  const segredo = process.env.BOVINOS_SESSION_SECRET ?? '';

  let corpo: { cliente?: unknown; ids?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }
  const cliente = typeof corpo.cliente === 'string' ? clientePorSlug(corpo.cliente) : null;
  const ids = Array.isArray(corpo.ids) ? corpo.ids.filter((x): x is string => typeof x === 'string').slice(0, 10000) : [];
  if (!cliente || ids.length === 0) return NextResponse.json({ erro: 'Escolha ao menos um problema.' }, { status: 400 });

  const { lote, recusados, erro } = await prepararLote(cliente.slug, ids, email);
  if (erro) return NextResponse.json({ erro }, { status: 502 });
  return NextResponse.json({ token: lote ? assinarLote(lote, segredo) : null, recusados }, { headers: { 'Cache-Control': 'no-store' } });
}
