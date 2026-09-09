import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';
import { alterarCategoria } from '@/lib/katmandu/mutations';
import { FAIXAS_CATEGORIA, type FaixaCategoria } from '@/lib/katmandu/categoria';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const usuario = verifySession(cookieStore.get(KATMANDU_COOKIE)?.value);
  if (!usuario) {
    return NextResponse.json({ ok: false, erro: 'sessao-invalida' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { faixa?: unknown; ids?: unknown } | null;
  const faixa = typeof body?.faixa === 'string' ? body.faixa : '';
  // A lista de IDs é obrigatória (não "vazio = todos"): a tela sempre manda o
  // recorte que o usuário conferiu, e um corpo malformado tem que virar erro,
  // nunca "alterar a categoria de todo mundo".
  const ids = Array.isArray(body?.ids)
    ? Array.from(new Set(body.ids.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)))
    : [];

  const faixaValida = FAIXAS_CATEGORIA.some((f) => f.valor === faixa);
  if (!faixaValida || ids.length === 0) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  const { alterados, ignorados } = await alterarCategoria(faixa as FaixaCategoria, ids);
  return NextResponse.json({ ok: true, alterados, ignorados });
}
