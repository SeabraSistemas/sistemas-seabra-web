import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { invalidarCache } from '@/lib/fi-fcg/queries';
import { aplicarInicioGmd, previewInicioGmd } from '@/lib/fi-fcg/mutations';
import { diaDeInput } from '@/lib/painel/format';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  ids?: string[];
  /** "aaaa-mm-dd" (input date do navegador). */
  dataInicio?: string;
}

function lerCorpo(corpo: Corpo): { ids: string[]; dataInicio: number } | null {
  const ids = Array.isArray(corpo.ids) ? corpo.ids.filter((i) => typeof i === 'string' && i.trim() !== '') : [];
  const dataInicio = diaDeInput(corpo.dataInicio ?? '');
  if (ids.length === 0 || dataInicio == null) return null;
  return { ids, dataInicio };
}

/** POST = prévia (não grava nada) — é o que a tela mostra antes de confirmar. */
export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const dados = lerCorpo((await request.json()) as Corpo);
  if (!dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const previa = await previewInicioGmd(dados.ids, dados.dataInicio);
  if (!previa.ok) return NextResponse.json({ erro: previa.erro ?? 'falha ao calcular' }, { status: 502 });
  return NextResponse.json(previa);
}

/** PUT = grava de verdade (RebanhoProd + Pesagem + aba Engorda). */
export async function PUT(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const dados = lerCorpo((await request.json()) as Corpo);
  if (!dados) return NextResponse.json({ erro: 'dados incompletos' }, { status: 400 });

  const resultado = await aplicarInicioGmd(dados.ids, dados.dataInicio);
  if (!resultado.ok) return NextResponse.json({ erro: resultado.erro ?? 'falha ao gravar' }, { status: 502 });

  invalidarCache();
  return NextResponse.json(resultado);
}
