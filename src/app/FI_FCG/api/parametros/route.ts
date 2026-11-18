import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { publicClient } from '@/lib/adm/supabase-admin';
import { CAMPO_POR_CHAVE, validarValor } from '@/lib/fi-fcg/meta/campos';
import { FAZENDAS, PRODUTOR_ID } from '@/lib/fi-fcg/meta/fazendas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  valores?: { chave?: string; propriedadeId?: number | null; valor?: unknown }[];
}

/**
 * Grava os campos da aba Meta em painel_parametro_bovino. Só inserção: cada
 * mudança vira uma linha nova, com quem gravou. Não toca no rebanho nem na
 * planilha do AppSheet.
 */
export async function POST(req: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Entre de novo.' }, { status: 401 });
  const supa = publicClient();
  if (!supa) return NextResponse.json({ erro: 'Falta configurar o acesso ao banco.' }, { status: 503 });

  let corpo: Corpo;
  try {
    corpo = (await req.json()) as Corpo;
  } catch {
    return NextResponse.json({ erro: 'Pedido inválido.' }, { status: 400 });
  }
  const valores = Array.isArray(corpo.valores) ? corpo.valores : [];
  if (valores.length === 0 || valores.length > 80) return NextResponse.json({ erro: 'Nada para gravar.' }, { status: 400 });

  const linhas = [];
  for (const v of valores) {
    const campo = v.chave ? CAMPO_POR_CHAVE.get(v.chave) : undefined;
    if (!campo) return NextResponse.json({ erro: `Campo desconhecido: ${v.chave}` }, { status: 400 });
    const prop = v.propriedadeId ?? null;
    if (campo.escopo === 'fazenda' && !FAZENDAS.some((f) => f.id === prop)) return NextResponse.json({ erro: `${campo.rotulo}: fazenda inválida` }, { status: 400 });
    if (campo.escopo === 'grupo' && prop != null) return NextResponse.json({ erro: `${campo.rotulo}: vale para as duas fazendas` }, { status: 400 });
    const r = validarValor(campo, v.valor);
    if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: 400 });
    linhas.push({ produtor_id: PRODUTOR_ID, propriedade_id: prop, chave: campo.chave, valor: r.valor === null ? { vazio: true } : r.valor, gravado_por: email });
  }

  const { error } = await supa.from('painel_parametro_bovino').insert(linhas);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gravados: linhas.length });
}
