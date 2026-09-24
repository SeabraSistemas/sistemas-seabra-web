import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { KATMANDU_COOKIE, verifySession } from '@/lib/katmandu/auth';
import { getLocais, getLotes, moverAnimais, type Mudanca } from '@/lib/katmandu/mutations';

export const runtime = 'nodejs';

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

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
    porAnimal?: unknown;
    local?: unknown;
    lote?: unknown;
  } | null;
  // A lista de IDs é obrigatória (não "vazio = todos"): a tela sempre manda o
  // recorte que o usuário conferiu, e um corpo malformado tem que virar erro,
  // nunca "mover o local/lote inteiro".
  const ids = Array.isArray(body?.ids)
    ? Array.from(new Set(body.ids.filter((v): v is string => typeof v === 'string').map((v) => v.trim()).filter(Boolean)))
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  // Dois formatos: por recorte (um campo, origem fixa) ou animal a animal
  // (sem origem — cada um sai de onde estiver —, local e/ou lote de uma vez).
  const mudancas: Mudanca[] = [];
  if (body?.porAnimal === true) {
    const local = texto(body.local);
    const lote = texto(body.lote);
    if (local) mudancas.push({ campo: 'local', destino: local });
    if (lote) mudancas.push({ campo: 'lote', destino: lote });
  } else {
    const origem = texto(body?.origem);
    const destino = texto(body?.destino);
    if (origem && destino && origem !== destino) {
      mudancas.push({ campo: body?.campo === 'lote' ? 'lote' : 'local', destino, origem });
    }
  }
  if (mudancas.length === 0) {
    return NextResponse.json({ ok: false, erro: 'parametros-invalidos' }, { status: 400 });
  }

  // Só o DESTINO precisa estar no cadastro: gravar um nome fora da aba
  // Lotes/local quebra a referência no AppSheet. A origem pode ser um lote que
  // já saiu do cadastro mas ainda tem animal — e ela não é fronteira de
  // segurança: a mutation relê a planilha e só move quem de fato está nela.
  const [locais, lotes] = await Promise.all([
    mudancas.some((m) => m.campo === 'local') ? getLocais() : [],
    mudancas.some((m) => m.campo === 'lote') ? getLotes() : [],
  ]);
  for (const m of mudancas) {
    if (!(m.campo === 'local' ? locais : lotes).includes(m.destino)) {
      return NextResponse.json({ ok: false, erro: `${m.campo}-desconhecido` }, { status: 400 });
    }
  }

  const { movidos, ignorados, logFalhou } = await moverAnimais(ids, mudancas);
  return NextResponse.json({ ok: true, movidos, ignorados, logFalhou });
}
