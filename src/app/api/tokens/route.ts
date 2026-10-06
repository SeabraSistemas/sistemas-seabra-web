import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/adm/supabase-admin';
import { baldesValidos, somarMaquinas, type Balde } from '@/lib/tokens/uso';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Ponte entre o coletor (scripts/tokens-coletor.mjs, no PC) e o painel /tokens.
 *
 *   POST  o coletor manda os baldes de 1h da máquina. Exige o segredo
 *         TOKENS_COLETOR_SECRET no Authorization: Bearer.
 *   GET   o painel lê a soma de todas as máquinas. Sem login, como o próprio
 *         /tokens: são só contagens de tokens, sem texto de conversa.
 *
 * Tabela: supabase/tokens/tokens_01_uso.sql. Nada aqui chama o Claude.
 */

const SEM_CACHE = { 'Cache-Control': 'no-store' };
/** O coletor manda 8 dias; linha parada há mais que isso é de máquina aposentada. */
const VALIDADE_MS = 10 * 24 * 3_600_000;

function segredoOk(request: Request): boolean {
  const esperado = process.env.TOKENS_COLETOR_SECRET;
  if (!esperado || esperado.length < 24) return false;
  const recebido = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  // Hash dos dois lados: timingSafeEqual exige o mesmo tamanho e não vaza o do segredo.
  const a = createHash('sha256').update(recebido).digest();
  const b = createHash('sha256').update(esperado).digest();
  return timingSafeEqual(a, b);
}

export async function GET() {
  const supa = publicClient();
  if (!supa) return NextResponse.json({ erro: 'Supabase não configurado.' }, { status: 503, headers: SEM_CACHE });

  const { data, error } = await supa.from('tokens_uso').select('maquina, coletado_em, horas');
  if (error) return NextResponse.json({ erro: 'Não consegui ler o uso.' }, { status: 500, headers: SEM_CACHE });

  const agora = Date.now();
  const linhas = (data ?? [])
    .map((l) => ({ horas: baldesValidos(l.horas) ?? ([] as Balde[]), coletadoEm: Date.parse(l.coletado_em) }))
    .filter((l) => Number.isFinite(l.coletadoEm) && agora - l.coletadoEm < VALIDADE_MS);

  return NextResponse.json({ ...somarMaquinas(linhas), agora }, { headers: SEM_CACHE });
}

export async function POST(request: Request) {
  if (!segredoOk(request)) return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401, headers: SEM_CACHE });

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400, headers: SEM_CACHE });
  }

  const { maquina, horas } = (corpo ?? {}) as { maquina?: unknown; horas?: unknown };
  const nome = typeof maquina === 'string' ? maquina.trim().slice(0, 64) : '';
  const baldes = baldesValidos(horas);
  if (!nome || !baldes) return NextResponse.json({ erro: 'Payload inválido.' }, { status: 400, headers: SEM_CACHE });

  const supa = publicClient();
  if (!supa) return NextResponse.json({ erro: 'Supabase não configurado.' }, { status: 503, headers: SEM_CACHE });

  const { error } = await supa
    .from('tokens_uso')
    .upsert({ maquina: nome, horas: baldes, coletado_em: new Date().toISOString() }, { onConflict: 'maquina' });
  if (error) return NextResponse.json({ erro: 'Não consegui gravar.' }, { status: 500, headers: SEM_CACHE });

  return NextResponse.json({ ok: true, baldes: baldes.length }, { headers: SEM_CACHE });
}
