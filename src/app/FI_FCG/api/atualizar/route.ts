import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Botão "Atualizar" de cada página: limpa o cache em memória (só desta
 * instância — ver a limitação documentada em lib/sheets/cache.ts) pra
 * próxima leitura ir buscar a planilha de novo, em vez de esperar o TTL de
 * 5 min. O client faz `router.refresh()` depois de um 204.
 */
export async function POST() {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
