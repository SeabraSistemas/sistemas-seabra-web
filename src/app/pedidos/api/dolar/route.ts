import { NextResponse } from 'next/server';

/**
 * Cotação do dólar (USD→BRL) para comparar o que o Felipe pagou com o câmbio do dia.
 * Fonte pública e sem chave (AwesomeAPI). Dado público: não há nada pessoal aqui,
 * então esta rota funciona também fora do Mac.
 */
export const revalidate = 1800;

interface Cotacao {
  bid: string;
  timestamp: string;
}

const dia = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

export async function GET() {
  try {
    const r = await fetch('https://economia.awesomeapi.com.br/json/daily/USD-BRL/200', { next: { revalidate: 1800 } });
    if (!r.ok) throw new Error(String(r.status));
    const brutos = (await r.json()) as Cotacao[];
    // Um valor por dia (o mais recente de cada dia), do mais antigo ao mais novo.
    const porDia = new Map<string, number>();
    for (const c of [...brutos].reverse()) {
      const v = Number(c.bid);
      if (Number.isFinite(v) && v > 0) porDia.set(dia(Number(c.timestamp)), v);
    }
    const serie = [...porDia].map(([data, valor]) => ({ data, valor }));
    const ultima = serie.at(-1) ?? null;
    return NextResponse.json({ atual: ultima, serie });
  } catch {
    return NextResponse.json({ atual: null, serie: [] });
  }
}
