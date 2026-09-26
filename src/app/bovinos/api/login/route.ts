import { NextResponse } from 'next/server';
import { emailPermitido } from '@/lib/bovinos/allowlist';
import { BOVINOS_COOKIE, BOVINOS_COOKIE_PATH, SESSAO_DIAS, assinarSessao } from '@/lib/bovinos/auth';
import { HOME_HREF, LOGIN_HREF } from '@/lib/bovinos/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Gate do /bovinos: e-mail conferido contra a allowlist estática (src/lib/bovinos/allowlist.ts). */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const manter = form.get('manter') === '1';
  const origin = new URL(request.url).origin;

  if (!email) return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=vazio`, origin), 303);
  if (!emailPermitido(email)) return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=nao-encontrado`, origin), 303);

  const valor = assinarSessao(email);
  if (!valor) {
    console.error('[bovinos] BOVINOS_SESSION_SECRET ausente ou curto — login bloqueado');
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=config`, origin), 303);
  }

  const response = NextResponse.redirect(new URL(HOME_HREF, origin), 303);
  response.cookies.set(BOVINOS_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: BOVINOS_COOKIE_PATH,
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
