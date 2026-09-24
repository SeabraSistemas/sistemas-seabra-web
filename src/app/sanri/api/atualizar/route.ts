import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { invalidarCache } from '@/lib/sanri/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Botão "Atualizar": relê User Manager e tanque_regua sem esperar o TTL de 5 min. */
export async function POST() {
  if (!(await sessaoApi())) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  invalidarCache();
  return new NextResponse(null, { status: 204 });
}
