import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Histórico diário de preços que o coletor grava (~/.seabra-pedidos/precos.json). Só no Mac, como o snapshot. */
export async function GET() {
  const vazio = NextResponse.json({ historico: [] }, { headers: { 'Cache-Control': 'no-store' } });
  if (process.env.VERCEL) return vazio;
  try {
    const historico = JSON.parse(await readFile(join(process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos'), 'precos.json'), 'utf8'));
    return NextResponse.json({ historico: Array.isArray(historico) ? historico : [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return vazio;
  }
}
