import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';
import { getLocais, moverAnimais } from '@/lib/katmandu/mutations';
import { SEM_LOCAL } from '@/lib/katmandu/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const usuario = verifySession(cookieStore.get(KATMANDU_COOKIE)?.value);
  if (!usuario) {
    return NextResponse.json({ ok: false, erro: 'sessao-invalida' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { origem?: unknown; destino?: unknown } | null;
  const origem = typeof body?.origem === 'string' ? body.origem.trim() : '';
  const destino = typeof body?.destino === 'string' ? body.destino.trim() : '';

  if (!origem || !destino || origem === destino) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  const locais = await getLocais();
  const origemValida = origem === SEM_LOCAL || locais.includes(origem);
  if (!origemValida || !locais.includes(destino)) {
    return NextResponse.json({ ok: false, erro: 'local-desconhecido' }, { status: 400 });
  }

  const { movidos, logFalhou } = await moverAnimais(origem, destino);
  return NextResponse.json({ ok: true, movidos, logFalhou });
}
