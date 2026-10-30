import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { arquivo } from '@/lib/sanri/abcc-mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Baixa a folha de uma CDN/CDC emitida: GET ?id=123. */
export async function GET(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ erro: 'comunicação inválida' }, { status: 400 });

  const r = await arquivo(id);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  const ascii = r.nome.normalize('NFD').replace(/[^\x20-\x7e]/g, '');
  return new Response(Buffer.from(r.bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(r.nome)}`,
      'Cache-Control': 'no-store',
    },
  });
}
