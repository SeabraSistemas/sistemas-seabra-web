import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Quais produtos o coletor acompanha o preço (~/.seabra-pedidos/ajustes.json).
 * O coletor lê esse arquivo; a página só liga/desliga. Só no Mac: na Vercel não grava nada.
 */
const DIR = () => process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');
const PADRAO = { acompanhar: { microchip: true, leitor: false } as Record<string, boolean> };

async function ler() {
  try {
    const a = JSON.parse(await readFile(join(DIR(), 'ajustes.json'), 'utf8')) as { acompanhar?: Record<string, boolean> } & Record<string, unknown>;
    return { ...a, acompanhar: { ...PADRAO.acompanhar, ...(a.acompanhar ?? {}) } };
  } catch {
    return { ...PADRAO };
  }
}

export async function GET() {
  return NextResponse.json({ ajustes: await ler(), local: !process.env.VERCEL }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (process.env.VERCEL) return NextResponse.json({ erro: 'só no Mac' }, { status: 404 });
  const corpo = (await req.json().catch(() => null)) as { grupo?: string; acompanhar?: boolean } | null;
  if (!corpo || (corpo.grupo !== 'microchip' && corpo.grupo !== 'leitor') || typeof corpo.acompanhar !== 'boolean') {
    return NextResponse.json({ erro: 'pedido inválido' }, { status: 400 });
  }
  const atual = await ler();
  const novo = { ...atual, acompanhar: { ...atual.acompanhar, [corpo.grupo]: corpo.acompanhar } };
  await mkdir(DIR(), { recursive: true, mode: 0o700 });
  const arq = join(DIR(), 'ajustes.json');
  await writeFile(arq, JSON.stringify(novo, null, 2), { mode: 0o600 });
  await chmod(arq, 0o600);
  return NextResponse.json({ ajustes: novo });
}
