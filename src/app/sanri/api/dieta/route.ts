import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { getBaias } from '@/lib/sanri/queries';
import { salvarDieta } from '@/lib/sanri/dieta-mutations';
import { ALIMENTOS, TURNOS, normalizarBaia, quantidadesVazias } from '@/lib/sanri/dieta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Teto de sanidade por campo: 200 baldes de silagem já são 4 toneladas num trato. */
const MAXIMO = 200;

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** "2,5" | "2.5" | 2.5 => 2.5; vazio => null; inválido => NaN. */
function numero(v: unknown): number | null {
  if (typeof v === 'number') return v;
  const t = texto(v);
  if (!t) return null;
  return Number(t.replace(',', '.'));
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json()) as Record<string, unknown>;
  const baia = normalizarBaia(texto(c.baia));
  const baias = await getBaias();
  if (!baia || !baias?.some((b) => b.nome === baia)) return NextResponse.json({ erro: 'baia inválida' }, { status: 400 });

  const cabras = numero(c.cabras);
  if (cabras == null || !Number.isInteger(cabras) || cabras < 0 || cabras > 1000) {
    return NextResponse.json({ erro: 'informe o nº de cabras (0 se a baia está vazia)' }, { status: 400 });
  }

  const recebido = (c.quantidades ?? {}) as Record<string, Record<string, unknown>>;
  const quantidades = quantidadesVazias();
  for (const a of ALIMENTOS) {
    for (const t of TURNOS) {
      const v = numero(recebido[a.chave]?.[t.chave]);
      if (v == null || v === 0) continue;
      if (!Number.isFinite(v) || v < 0 || v > MAXIMO) {
        return NextResponse.json({ erro: `quantidade inválida em ${a.nome} (${t.nome})` }, { status: 400 });
      }
      quantidades[a.chave][t.chave] = v;
    }
  }

  const r = await salvarDieta({ baia, categoria: texto(c.categoria), cabras, quantidades, obs: texto(c.obs) }, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json({ id: r.id }, { status: 201 });
}
