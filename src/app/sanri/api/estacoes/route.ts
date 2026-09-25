import { NextResponse } from 'next/server';
import { diaDeInput } from '@/lib/painel/format';
import { sessaoApi } from '@/lib/sanri/sessao';
import { salvarEstacao, type PedidoEstacao } from '@/lib/sanri/estacao-mutations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Única escrita da Reprodução: a "view" da estação na aba estacao_monta. Nada nas abas do app. */
export async function POST(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const c = (await request.json()) as Record<string, unknown>;
  const acao = texto(c.acao);
  const estacaoId = texto(c.estacaoId);
  let pedido: PedidoEstacao;

  if (acao === 'finalizar' || acao === 'reabrir' || acao === 'excluir') {
    if (!estacaoId) return NextResponse.json({ erro: 'estação ausente' }, { status: 400 });
    pedido = { acao, estacaoId };
  } else if (acao === 'criar' || acao === 'alterar') {
    const inicio = diaDeInput(texto(c.inicio));
    const fim = diaDeInput(texto(c.fim));
    const femeas = Array.isArray(c.femeas) ? c.femeas.map(texto).filter(Boolean) : [];
    if (inicio == null || fim == null) return NextResponse.json({ erro: 'informe início e fim' }, { status: 400 });
    if (acao === 'criar') {
      const reprodutor = texto(c.reprodutor);
      if (!reprodutor) return NextResponse.json({ erro: 'escolha o reprodutor' }, { status: 400 });
      pedido = { acao, reprodutor, inicio, fim, femeas, obs: texto(c.obs) };
    } else {
      if (!estacaoId) return NextResponse.json({ erro: 'estação ausente' }, { status: 400 });
      pedido = { acao, estacaoId, inicio, fim, femeas, obs: texto(c.obs) };
    }
  } else {
    return NextResponse.json({ erro: 'ação inválida' }, { status: 400 });
  }

  const r = await salvarEstacao(pedido, email);
  if (!r.ok) return NextResponse.json({ erro: r.erro }, { status: r.status });
  return NextResponse.json({ id: r.id }, { status: acao === 'criar' ? 201 : 200 });
}
