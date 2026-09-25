import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { salvarConferencia } from '@/lib/sanri/conferencia-mutations';
import { normalizarBaia } from '@/lib/sanri/dieta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Lista de números de animal: só dígitos, sem repetir, no máximo 500. */
function numeros(v: unknown): string[] | null {
  if (v == null) return [];
  if (!Array.isArray(v) || v.length > 500) return null;
  const out: string[] = [];
  for (const n of v) {
    const t = typeof n === 'string' ? n.replace(/\s+/g, '') : '';
    if (!/^\d{4,20}$/.test(t)) return null;
    out.push(t);
  }
  return out;
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return NextResponse.json({ erro: 'pedido inválido' }, { status: 400 });

  const baia = normalizarBaia(texto(c.baia));
  if (!baia) return NextResponse.json({ erro: 'baia inválida' }, { status: 400 });

  const contados = typeof c.contados === 'number' ? c.contados : Number(texto(c.contados).replace(',', '.'));
  const vistos = numeros(c.vistos);
  const aMais = numeros(c.aMais);
  if (!vistos || !aMais) return NextResponse.json({ erro: 'lista de animais inválida' }, { status: 400 });

  const r = await salvarConferencia({ baia, contados, vistos, aMais, obs: texto(c.obs).slice(0, 500) }, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json({ id: r.id, esperados: r.esperados, diferenca: r.diferenca }, { status: 201 });
}
