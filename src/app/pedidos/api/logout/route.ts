import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { opcoesCookie, PEDIDOS_COOKIE } from '@/lib/pedidos/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!mesmaOrigem(request, url)) return new NextResponse('Origem inválida.', { status: 403 });
  const r = NextResponse.redirect(new URL('/pedidos/login', url.origin), 303);
  r.headers.set('Cache-Control', 'no-store');
  // Mesmos atributos do login: senão o navegador guarda dois cookies de mesmo nome.
  r.cookies.set(PEDIDOS_COOKIE, '', { ...opcoesCookie(), maxAge: 0 });
  return r;
}
