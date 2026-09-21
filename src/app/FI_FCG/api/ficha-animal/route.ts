import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import { getIatf, getPartos, getPesagem, getToque } from '@/lib/fi-fcg/queries';
import { formatNumber } from '@/lib/painel/format';
import type { DiaCompacto } from '@/lib/fi-fcg/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface EventoHistorico {
  tipo: 'Pesagem' | 'Toque' | 'IATF' | 'Parto';
  data: DiaCompacto;
  resumo: string;
}

/**
 * Histórico de eventos de UM animal (página Monitorar, 21/09/2026) — mesmas
 * 4 fontes de `lib/fi-fcg/manejo.ts` (Pesagem/Toque/IATF/Parto como mãe),
 * mas aqui devolve o EVENTO inteiro pra montar a ficha, não só a data mais
 * recente. Lê as abas via o cache por aba de `queries.ts` — se a página
 * Monitorar já rodou nos últimos 5 min (ela lê as 4 abas pra calcular "dias
 * sem manejo"), isto não bate na planilha de novo.
 */
export async function GET(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id) return NextResponse.json({ erro: 'id ausente' }, { status: 400 });

  const [pesagem, toque, iatf, partos] = await Promise.all([getPesagem(), getToque(), getIatf(), getPartos()]);

  const eventos: EventoHistorico[] = [];

  for (const r of pesagem.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [`Peso ${formatNumber(r.pesoKg)}kg`];
    if (r.diferencaKg != null) partes.push(`${r.diferencaKg >= 0 ? '+' : ''}${formatNumber(r.diferencaKg)}kg desde a anterior`);
    if (r.gmd != null) partes.push(`GMD ${formatNumber(r.gmd)}`);
    eventos.push({ tipo: 'Pesagem', data: r.data, resumo: partes.join(' · ') });
  }

  for (const r of toque.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [`Diagnóstico: ${r.diagnostico ?? '—'}`];
    if (r.status) partes.push(r.status);
    if (r.escore) partes.push(`Escore ${r.escore}`);
    eventos.push({ tipo: 'Toque', data: r.data, resumo: partes.join(' · ') });
  }

  for (const r of iatf.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [];
    if (r.partida) partes.push(`Partida: ${r.partida}`);
    if (r.inseminador) partes.push(r.inseminador);
    eventos.push({ tipo: 'IATF', data: r.data, resumo: partes.length > 0 ? partes.join(' · ') : 'Cobertura registrada' });
  }

  for (const r of partos.itens) {
    if (r.idMae !== id || r.nascimento == null) continue;
    eventos.push({
      tipo: 'Parto',
      data: r.nascimento,
      resumo: `Deu à luz${r.sexo ? ` (${r.sexo})` : ''}${r.pesoNascimento != null ? ` · ${formatNumber(r.pesoNascimento)}kg ao nascer` : ''}`,
    });
  }

  eventos.sort((a, b) => b.data - a.data);

  return NextResponse.json({ eventos });
}
