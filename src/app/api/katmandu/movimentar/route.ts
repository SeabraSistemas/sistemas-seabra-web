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

  const body = (await request.json().catch(() => null)) as {
    origem?: unknown;
    destino?: unknown;
    ids?: unknown;
  } | null;
  const origem = typeof body?.origem === 'string' ? body.origem.trim() : '';
  const destino = typeof body?.destino === 'string' ? body.destino.trim() : '';
  // A lista de IDs é obrigatória (não "vazio = todos"): a tela sempre manda o
  // recorte que o usuário conferiu, e um corpo malformado tem que virar erro,
  // nunca "mover o local inteiro".
  const ids = Array.isArray(body?.ids)
    ? Array.from(new Set(body.ids.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)))
    : [];

  if (!origem || !destino || origem === destino || ids.length === 0) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  const locais = await getLocais();
  const origemValida = origem === SEM_LOCAL || locais.includes(origem);
  if (!origemValida || !locais.includes(destino)) {
    return NextResponse.json({ ok: false, erro: 'local-desconhecido' }, { status: 400 });
  }

  const { movidos, ignorados, logFalhou } = await moverAnimais(origem, destino, ids);
  return NextResponse.json({ ok: true, movidos, ignorados, logFalhou });
}
