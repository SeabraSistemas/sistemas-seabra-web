import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { publicClient } from '@/lib/adm/supabase-admin';
import { TODAS, chaveResposta, temCampoDeResposta } from '@/lib/fi-fcg/questionario/perguntas';
import { PRODUTOR_ID } from '@/lib/fi-fcg/meta/fazendas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Grava a resposta do proprietário a uma pergunta do questionário (painel_parametro_bovino, chave questionario.pNN). Só inserção. */
export async function POST(req: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'Entre de novo.' }, { status: 401 });
  const supa = publicClient();
  if (!supa) return NextResponse.json({ erro: 'Falta configurar o acesso ao banco.' }, { status: 503 });

  let corpo: { n?: number; resposta?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: 'Pedido inválido.' }, { status: 400 });
  }
  const p = TODAS.find((x) => x.n === corpo.n);
  if (!p || !temCampoDeResposta(p)) return NextResponse.json({ erro: 'Pergunta inválida.' }, { status: 400 });
  const texto = typeof corpo.resposta === 'string' ? corpo.resposta.trim() : '';
  if (texto.length > 2000) return NextResponse.json({ erro: 'Resposta longa demais.' }, { status: 400 });

  const { error } = await supa.from('painel_parametro_bovino').insert({
    produtor_id: PRODUTOR_ID,
    propriedade_id: null,
    chave: chaveResposta(p.n),
    valor: texto ? texto : { vazio: true },
    gravado_por: email,
  });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

