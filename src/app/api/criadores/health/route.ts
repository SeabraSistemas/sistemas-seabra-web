import { NextResponse } from 'next/server';
import { contarVitrine } from '@/lib/criadores/queries';

// Teste de fumaca da leitura server-side da vitrine. O Felipe faz curl disto
// depois de cada deploy: distingue "vitrine vazia" (ok:true, criadores:0) de
// "leitura quebrada" (ok:false). Sem isso, uma falha silenciosa passa batido.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { criadores, animais } = await contarVitrine();
    return NextResponse.json({ ok: true, criadores, animais }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[vitrine] health falhou', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'erro desconhecido' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
