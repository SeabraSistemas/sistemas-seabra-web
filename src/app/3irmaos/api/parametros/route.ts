import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { lerRebanho, salvarParametros } from '@/lib/tres-irmaos/dados';
import { hojeBrasilia } from '@/lib/tres-irmaos/datas';
import { normalizarParametros, parametrosIniciais } from '@/lib/tres-irmaos/projecao';
import { sessaoApi } from '@/lib/tres-irmaos/sessao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Salva os parâmetros da projeção (uma linha por fazenda, sobrescreve). */
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!mesmaOrigem(request, url)) return NextResponse.json({ erro: 'Origem inválida.' }, { status: 403 });
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Sessão expirada. Entre de novo.' }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }

  // Normaliza contra os valores iniciais: o que chegar torto vira o padrão, nunca vai cru para o jsonb.
  const rebanho = await lerRebanho(hojeBrasilia());
  const iniciais = parametrosIniciais(rebanho.ok ? rebanho.dados : { lactantes: 0, mediaUltimoControle: null });
  const parametros = normalizarParametros(corpo, iniciais);

  const r = await salvarParametros(parametros, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 500 });
  return NextResponse.json({ ok: true, atualizadoEm: r.dados.atualizadoEm, atualizadoPor: email, parametros });
}
