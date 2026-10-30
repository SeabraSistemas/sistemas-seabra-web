import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/sanri/sessao';
import { acrescentarNomes, excluir, renomear } from '@/lib/sanri/nomes-mutations';
import { separarNomes, type Sexo } from '@/lib/sanri/nomes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Teto de sanidade por colagem: um ano inteiro de crias cabe folgado. */
const MAXIMO_POR_VEZ = 300;

function inteiro(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isInteger(n) ? n : null;
}

function sexo(v: unknown): Sexo | null {
  return v === 'fêmea' || v === 'macho' ? v : null;
}

/** Acrescenta nomes: { ano, sexo, texto } — texto com um nome por linha (ou vírgula). */
export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const ano = inteiro(c.ano);
  const s = sexo(c.sexo);
  if (ano == null || ano < 2000 || ano > 2100) return NextResponse.json({ erro: 'ano inválido' }, { status: 400 });
  if (!s) return NextResponse.json({ erro: 'sexo inválido' }, { status: 400 });
  const nomes = separarNomes(typeof c.texto === 'string' ? c.texto : '');
  if (nomes.length === 0) return NextResponse.json({ erro: 'nenhum nome informado' }, { status: 400 });
  if (nomes.length > MAXIMO_POR_VEZ) return NextResponse.json({ erro: `no máximo ${MAXIMO_POR_VEZ} nomes por vez` }, { status: 400 });

  const r = await acrescentarNomes(ano, s, nomes, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json(r, { status: 201 });
}

/** Troca um nome livre: { id, nome }. */
export async function PATCH(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = inteiro(c.id);
  const nome = typeof c.nome === 'string' ? c.nome.trim().toUpperCase() : '';
  if (id == null || !nome) return NextResponse.json({ erro: 'informe o nome' }, { status: 400 });

  const r = await renomear(id, nome);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json(r);
}

/** Exclui um nome livre: { id }. */
export async function DELETE(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = inteiro(c.id);
  if (id == null) return NextResponse.json({ erro: 'nome inválido' }, { status: 400 });

  const r = await excluir(id);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json(r);
}
