import { NextResponse } from 'next/server';
import { diaDeInput } from '@/lib/painel/format';
import { sessaoApi } from '@/lib/sanri/sessao';
import { atualizarLeitura, criarLeitura, excluirLeitura, type DadosLeitura, type Resultado } from '@/lib/sanri/mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  id?: unknown;
  data?: unknown;
  tanque?: unknown;
  regua?: unknown;
  tanqueExtra?: unknown;
  reguaExtra?: unknown;
  totalAnimais?: unknown;
  obs?: unknown;
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function dadosDe(c: Corpo): DadosLeitura | null {
  const data = diaDeInput(texto(c.data));
  const tanque = texto(c.tanque);
  const regua = texto(c.regua);
  const totalAnimais = Number(c.totalAnimais);
  if (data == null || !tanque || !regua || !Number.isInteger(totalAnimais) || totalAnimais <= 0) return null;
  const tanqueExtra = texto(c.tanqueExtra) || null;
  return {
    data,
    tanque,
    regua,
    tanqueExtra,
    reguaExtra: tanqueExtra ? texto(c.reguaExtra) || null : null,
    totalAnimais,
    obs: texto(c.obs),
  };
}

function responder(r: Resultado, sucesso: number) {
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return sucesso === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json({ id: r.id }, { status: sucesso });
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const dados = dadosDe((await request.json()) as Corpo);
  if (!dados) return NextResponse.json({ erro: 'preencha data, animais, tanque e régua' }, { status: 400 });
  return responder(await criarLeitura(dados, email), 201);
}

export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const corpo = (await request.json()) as Corpo;
  const id = texto(corpo.id);
  const dados = dadosDe(corpo);
  if (!id || !dados) return NextResponse.json({ erro: 'preencha data, animais, tanque e régua' }, { status: 400 });
  return responder(await atualizarLeitura(id, dados, email), 204);
}

export async function DELETE(request: Request) {
  if (!(await sessaoApi())) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const id = texto(((await request.json()) as Corpo).id);
  if (!id) return NextResponse.json({ erro: 'id ausente' }, { status: 400 });
  return responder(await excluirLeitura(id), 204);
}
