import { NextResponse } from 'next/server';
import { emailPermitido } from '@/lib/cursoidiomas/allowlist';
import { CURSO_COOKIE, CURSO_COOKIE_PATH, SESSAO_DIAS, assinarSessao } from '@/lib/cursoidiomas/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Gate do /cursoidiomas: só e-mail, conferido contra a allowlist estática.
 * Form puro (sem JS) — a página de login faz POST direto para cá.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const origin = new URL(request.url).origin;

  if (!email) {
    return NextResponse.redirect(new URL('/cursoidiomas?erro=vazio', origin), 303);
  }
  if (!emailPermitido(email)) {
    return NextResponse.redirect(new URL('/cursoidiomas?erro=nao-encontrado', origin), 303);
  }

  const valor = assinarSessao(email);
  if (!valor) {
    console.error('[cursoidiomas] CURSOIDIOMAS_SESSION_SECRET ausente ou curto — login bloqueado');
    return NextResponse.redirect(new URL('/cursoidiomas?erro=config', origin), 303);
  }

  const response = NextResponse.redirect(new URL('/cursoidiomas/inicio', origin), 303);
  response.cookies.set(CURSO_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: CURSO_COOKIE_PATH,
    maxAge: SESSAO_DIAS * 24 * 60 * 60,
  });
  return response;
}
