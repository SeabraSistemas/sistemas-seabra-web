import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { sessaoApi } from '@/lib/bovinos/sessao';
import { clientePorSlug, planilhaDe } from '@/lib/bovinos/clientes';
import { escritaHabilitada } from '@/lib/bovinos/correcao';
import { verificarLote } from '@/lib/bovinos/lote-assinatura';
import { executarLote } from '@/lib/bovinos/escrita';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MENSAGEM: Record<string, string> = {
  formato: 'Prévia inválida — gere de novo.',
  assinatura: 'Prévia adulterada ou de outra sessão — gere de novo.',
  expirado: 'A prévia passou de 15 minutos — gere de novo.',
  email: 'Esta prévia é de outro usuário.',
};

/** Grava um lote assinado por /api/previa (e só ele). */
export async function POST(request: Request) {
  if (!mesmaOrigem(request, new URL(request.url))) return NextResponse.json({ erro: 'Origem inválida.' }, { status: 403 });
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Sessão expirada — entre de novo.' }, { status: 401 });
  if (!escritaHabilitada()) return NextResponse.json({ erro: 'Correção desligada (BOVINOS_ESCRITA_HABILITADA).' }, { status: 403 });

  let corpo: { token?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }
  const v = verificarLote(String(corpo.token ?? ''), process.env.BOVINOS_SESSION_SECRET ?? '', email);
  if (!v.ok) return NextResponse.json({ erro: MENSAGEM[v.motivo] }, { status: 400 });

  // A planilha do lote tem que ser a do cliente HOJE (variável trocada = prévia velha).
  const cliente = clientePorSlug(v.lote.cliente);
  if (!cliente || planilhaDe(cliente) !== v.lote.planilha) return NextResponse.json({ erro: 'A planilha deste cliente mudou — gere a prévia de novo.' }, { status: 409 });

  const resultado = await executarLote(v.lote);
  return NextResponse.json(resultado, { status: resultado.aplicados > 0 || resultado.ok ? 200 : 409, headers: { 'Cache-Control': 'no-store' } });
}
