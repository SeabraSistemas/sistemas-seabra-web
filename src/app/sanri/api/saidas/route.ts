import { NextResponse } from 'next/server';
import { diaDeInput } from '@/lib/painel/format';
import { sessaoApi } from '@/lib/sanri/sessao';
import { criarSaida, excluirSaida, type Resultado } from '@/lib/sanri/mutations';
import { destinoPorChave } from '@/lib/sanri/producao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  id?: unknown;
  data?: unknown;
  destino?: unknown;
  litros?: unknown;
  obs?: unknown;
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function responder(r: Resultado, sucesso: number) {
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return sucesso === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json({ id: r.id }, { status: sucesso });
}

export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const c = (await request.json()) as Corpo;
  const data = diaDeInput(texto(c.data));
  const destino = destinoPorChave(texto(c.destino));
  const litros = Number(texto(c.litros).replace(',', '.'));
  if (data == null || !destino || !Number.isFinite(litros) || litros <= 0) {
    return NextResponse.json({ erro: 'preencha data, destino e litros' }, { status: 400 });
  }
  return responder(await criarSaida({ data, destino: destino.chave, litros, obs: texto(c.obs) }, email), 201);
}

export async function DELETE(request: Request) {
  if (!(await sessaoApi())) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });
  const c = (await request.json()) as Corpo;
  const id = texto(c.id);
  const destino = destinoPorChave(texto(c.destino));
  if (!id || !destino) return NextResponse.json({ erro: 'id ou destino ausente' }, { status: 400 });
  return responder(await excluirSaida(id, destino.chave), 204);
}
