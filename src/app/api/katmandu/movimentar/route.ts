import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';
import { getLocais, getLotes, moverAnimais, moverAnimaisPorLote } from '@/lib/katmandu/mutations';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const usuario = verifySession(cookieStore.get(KATMANDU_COOKIE)?.value);
  if (!usuario) {
    return NextResponse.json({ ok: false, erro: 'sessao-invalida' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    campo?: unknown;
    origem?: unknown;
    destino?: unknown;
    ids?: unknown;
  } | null;
  const campo = body?.campo === 'lote' ? 'lote' : 'local';
  const origem = typeof body?.origem === 'string' ? body.origem.trim() : '';
  const destino = typeof body?.destino === 'string' ? body.destino.trim() : '';
  // A lista de IDs é obrigatória (não "vazio = todos"): a tela sempre manda o
  // recorte que o usuário conferiu, e um corpo malformado tem que virar erro,
  // nunca "mover o local/lote inteiro".
  const ids = Array.isArray(body?.ids)
    ? Array.from(new Set(body.ids.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)))
    : [];

  if (!origem || !destino || origem === destino || ids.length === 0) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  // Só o DESTINO precisa estar no cadastro: gravar um nome fora da aba
  // Lotes/local quebra a referência no AppSheet. A origem pode ser um lote que
  // já saiu do cadastro mas ainda tem animal — e ela não é fronteira de
  // segurança: a mutation relê a planilha e só move quem de fato está nela.
  if (campo === 'lote') {
    const lotes = await getLotes();
    if (!lotes.includes(destino)) {
      return NextResponse.json({ ok: false, erro: 'lote-desconhecido' }, { status: 400 });
    }
    const { movidos, ignorados, logFalhou } = await moverAnimaisPorLote(origem, destino, ids);
    return NextResponse.json({ ok: true, movidos, ignorados, logFalhou });
  }

  const locais = await getLocais();
  if (!locais.includes(destino)) {
    return NextResponse.json({ ok: false, erro: 'local-desconhecido' }, { status: 400 });
  }

  const { movidos, ignorados, logFalhou } = await moverAnimais(origem, destino, ids);
  return NextResponse.json({ ok: true, movidos, ignorados, logFalhou });
}
