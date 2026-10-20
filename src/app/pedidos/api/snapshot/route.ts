import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Entrega o snapshot que o coletor grava no Mac (~/.seabra-pedidos/pedidos.json).
 *
 * Só funciona rodando na própria máquina (npm run dev / npm start). Na Vercel
 * não existe esse arquivo, então a rota devolve vazio e a página segue como
 * controle manual — e o conteúdo da conta da AliExpress nunca passa por servidor
 * público.
 */
export async function GET() {
  const vazio = NextResponse.json({ snapshot: null }, { headers: { 'Cache-Control': 'no-store' } });
  if (process.env.VERCEL) return vazio;
  const arquivo = process.env.PEDIDOS_ARQUIVO ?? join(homedir(), '.seabra-pedidos', 'pedidos.json');
  try {
    const snapshot = JSON.parse(await readFile(arquivo, 'utf8'));
    return NextResponse.json({ snapshot }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return vazio;
  }
}
