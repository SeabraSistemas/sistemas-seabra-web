import { NextResponse } from 'next/server';
import { sessaoApi } from '@/lib/fi-fcg/sessao';
import {
  getAbortos,
  getClinica,
  getD8,
  getEmbarque,
  getEngordaEventos,
  getIatf,
  getManejoSanitario,
  getPartos,
  getPesagem,
  getProtocolo,
  getToque,
  getTransferir,
} from '@/lib/fi-fcg/queries';
import { formatNumber } from '@/lib/painel/format';
import type { DiaCompacto } from '@/lib/fi-fcg/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface EventoHistorico {
  tipo:
    | 'Pesagem'
    | 'Toque'
    | 'IATF'
    | 'Parto'
    | 'Manejo'
    | 'D8'
    | 'Protocolo'
    | 'Transferência'
    | 'Engorda'
    | 'Clínica'
    | 'Aborto'
    | 'Embarque';
  data: DiaCompacto;
  resumo: string;
}

/**
 * Histórico de eventos de UM animal (página Monitorar, 21/09/2026 e
 * ampliado em 22/09/2026 com as mesmas `FontesManejo` de `manejo.ts`) —
 * devolve o EVENTO inteiro pra montar a ficha, não só a data mais recente.
 * Lê as abas via o cache por aba de `queries.ts` — se a página Monitorar já
 * rodou nos últimos 5 min (ela lê as mesmas abas pra calcular "dias sem
 * manejo"), isto não bate na planilha de novo.
 */
export async function GET(request: Request) {
  const email = await sessaoApi();
  if (!email) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id) return NextResponse.json({ erro: 'id ausente' }, { status: 400 });

  const [pesagem, toque, iatf, partos, manejo, d8, protocolo, transferir, engorda, clinica, abortos, embarque] = await Promise.all([
    getPesagem(),
    getToque(),
    getIatf(),
    getPartos(),
    getManejoSanitario(),
    getD8(),
    getProtocolo(),
    getTransferir(),
    getEngordaEventos(),
    getClinica(),
    getAbortos(),
    getEmbarque(),
  ]);

  const eventos: EventoHistorico[] = [];

  for (const r of pesagem.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [`${formatNumber(r.pesoKg)}kg`];
    if (r.diferencaKg != null) partes.push(`${r.diferencaKg >= 0 ? '+' : ''}${formatNumber(r.diferencaKg)}kg`);
    if (r.gmd != null) partes.push(`GMD ${formatNumber(r.gmd)}`);
    eventos.push({ tipo: 'Pesagem', data: r.data, resumo: partes.join(' · ') });
  }

  for (const r of toque.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [r.diagnostico ?? '—'];
    if (r.status) partes.push(r.status);
    if (r.escore) partes.push(`Escore ${r.escore}`);
    eventos.push({ tipo: 'Toque', data: r.data, resumo: partes.join(' · ') });
  }

  for (const r of iatf.itens) {
    if (r.id !== id || r.data == null) continue;
    const partes = [r.partida, r.inseminador].filter((v): v is string => Boolean(v));
    eventos.push({ tipo: 'IATF', data: r.data, resumo: partes.length > 0 ? partes.join(' · ') : '—' });
  }

  for (const r of partos.itens) {
    if (r.idMae !== id || r.nascimento == null) continue;
    eventos.push({ tipo: 'Parto', data: r.nascimento, resumo: r.sexo ?? '—' });
  }

  for (const r of manejo.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    const aplicados = [
      r.brucelose === 'Sim' && 'Brucelose',
      r.carbunculo === 'Sim' && 'Carbúnculo',
      r.vermifugo === 'Sim' && 'Vermífugo',
      r.carrapato === 'Sim' && 'Carrapato',
      r.mosca === 'Sim' && 'Mosca',
    ].filter((v): v is string => Boolean(v));
    eventos.push({ tipo: 'Manejo', data: r.data, resumo: aplicados.length > 0 ? aplicados.join(' · ') : '—' });
  }

  for (const r of d8.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'D8', data: r.data, resumo: r.produto ?? '—' });
  }

  for (const r of protocolo.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'Protocolo', data: r.data, resumo: r.produto ?? '—' });
  }

  for (const r of transferir.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'Transferência', data: r.data, resumo: r.fazenda ?? '—' });
  }

  for (const r of engorda.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'Engorda', data: r.data, resumo: r.pesoEntrada != null ? `${formatNumber(r.pesoEntrada)}kg` : '—' });
  }

  for (const r of clinica.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    const partes = [r.caso, r.diagnostico].filter((v): v is string => Boolean(v));
    eventos.push({ tipo: 'Clínica', data: r.data, resumo: partes.length > 0 ? partes.join(' · ') : '—' });
  }

  for (const r of abortos.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'Aborto', data: r.data, resumo: r.suspeita ?? '—' });
  }

  for (const r of embarque.itens) {
    if (r.idAnimal !== id || r.data == null) continue;
    eventos.push({ tipo: 'Embarque', data: r.data, resumo: r.embarcado ?? '—' });
  }

  eventos.sort((a, b) => b.data - a.data);

  return NextResponse.json({ eventos });
}
