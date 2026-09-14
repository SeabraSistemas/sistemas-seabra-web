import { NextResponse } from 'next/server';
import { emailPermitido } from '@/lib/fi-fcg/allowlist';
import { FI_FCG_COOKIE, FI_FCG_COOKIE_PATH, SESSAO_DIAS, assinarSessao } from '@/lib/fi-fcg/auth';
import { HOME_HREF, LOGIN_HREF } from '@/lib/fi-fcg/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Gate do /FI_FCG: só e-mail, conferido contra a allowlist estática. Mesmo padrão de /katmandu e /cursoidiomas. */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const manter = form.get('manter') === '1';
  const origin = new URL(request.url).origin;

  if (!email) {
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=vazio`, origin), 303);
  }
  if (!emailPermitido(email)) {
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=nao-encontrado`, origin), 303);
  }

  const valor = assinarSessao(email);
  if (!valor) {
    console.error('[fi-fcg] FI_FCG_SESSION_SECRET ausente ou curto — login bloqueado');
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=config`, origin), 303);
  }

  const response = NextResponse.redirect(new URL(HOME_HREF, origin), 303);
  response.cookies.set(FI_FCG_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: FI_FCG_COOKIE_PATH,
    // Sem "manter conectado", cookie de sessão de navegador (some ao fechar a aba).
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
