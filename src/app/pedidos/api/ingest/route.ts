import { NextResponse } from 'next/server';
import { segredoDoColetorConfere } from '@/lib/pedidos/auth';
import { gravarDoc, lerDoc } from '@/lib/pedidos/nuvem';

/**
 * O coletor do Mac manda aqui o snapshot e o histórico de preços depois de cada leitura
 * (Authorization: Bearer PEDIDOS_COLETOR_SECRET). `estadoInicial` só vale se ainda não existe
 * estoque na nuvem: serve para semear o ponto de partida uma vez, sem sobrescrever o que o Felipe
 * já editou na página.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIMITE_BYTES = 3_000_000;
const negar = () => NextResponse.json({ erro: 'não autorizado' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (!segredoDoColetorConfere(request.headers.get('authorization'))) return negar();
  const texto = await request.text();
  if (texto.length > LIMITE_BYTES) return NextResponse.json({ erro: 'grande demais' }, { status: 413 });

  let corpo: { snapshot?: { versao?: number; pedidos?: unknown }; precos?: unknown; estadoInicial?: unknown; historicoManual?: unknown };
  try {
    corpo = JSON.parse(texto);
  } catch {
    return NextResponse.json({ erro: 'json inválido' }, { status: 400 });
  }

  const gravados: string[] = [];
  if (corpo.snapshot) {
    if (corpo.snapshot.versao !== 1 || !Array.isArray(corpo.snapshot.pedidos)) return NextResponse.json({ erro: 'snapshot inválido' }, { status: 400 });
    if (await gravarDoc('snapshot', corpo.snapshot)) gravados.push('snapshot');
  }
  if (Array.isArray(corpo.precos) && (await gravarDoc('precos', corpo.precos))) gravados.push('precos');
  if (corpo.estadoInicial && typeof corpo.estadoInicial === 'object' && !(await lerDoc('estado'))) {
    if (await gravarDoc('estado', { estado: corpo.estadoInicial, rev: Date.now() })) gravados.push('estado');
  }
  // Operações antigas (fora da AliExpress): entram no estado por id, sem apagar nada do que já existe.
  if (Array.isArray(corpo.historicoManual) && corpo.historicoManual.length) {
    const grupos = ['microchip', 'leitor', 'outro'];
    const validas = corpo.historicoManual.filter((h): h is Record<string, unknown> => {
      const o = h as Record<string, unknown>;
      return !!o && typeof o.id === 'string' && grupos.includes(String(o.grupo)) && Number(o.unidades) >= 1 && Number(o.custoUnit) >= 0 && Number(o.vendaUnit) >= 0;
    });
    const atual = (await lerDoc('estado')) as { estado?: Record<string, unknown> } | null;
    const estado = { ...(atual?.estado ?? {}) };
    const existentes = (Array.isArray(estado.historico) ? estado.historico : []) as Array<{ id: string }>;
    // Por id: cria se não existe, atualiza os campos se já existe. Repetir o envio não duplica nada.
    const porId = new Map(existentes.map((x) => [x.id, x as Record<string, unknown>]));
    let mudou = false;
    for (const v of validas) {
      const antes = porId.get(String(v.id));
      if (!antes || JSON.stringify({ ...antes, ...v }) !== JSON.stringify(antes)) mudou = true;
      porId.set(String(v.id), { ...(antes ?? {}), ...v });
    }
    if (mudou) {
      estado.historico = [...porId.values()];
      if (await gravarDoc('estado', { estado, rev: Date.now() })) gravados.push('historico');
    }
  }
  return NextResponse.json({ ok: gravados.length > 0, gravados }, { headers: { 'Cache-Control': 'no-store' } });
}
