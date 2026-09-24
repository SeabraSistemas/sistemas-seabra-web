import { NextResponse } from 'next/server';
import { SANRI_COOKIE, SANRI_COOKIE_PATH, SESSAO_DIAS, assinarSessao } from '@/lib/sanri/auth';
import { HOME_HREF, LOGIN_HREF } from '@/lib/sanri/config';
import { getUsuarios } from '@/lib/sanri/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Gate do /sanri: só e-mail, conferido AO VIVO na aba "User Manager" da planilha (quem a fazenda cadastrar lá entra). */
export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const manter = form.get('manter') === '1';
  const origin = new URL(request.url).origin;
  const voltar = (erro: string) => NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=${erro}`, origin), 303);

  if (!email) return voltar('vazio');

  const usuarios = await getUsuarios(true);
  if (usuarios == null) return voltar('planilha');
  if (!usuarios.some((u) => u.email === email)) return voltar('nao-encontrado');

  const valor = assinarSessao(email);
  if (!valor) {
    console.error('[sanri] SANRI_SESSION_SECRET ausente ou curto — login bloqueado');
    return voltar('config');
  }

  const response = NextResponse.redirect(new URL(HOME_HREF, origin), 303);
  response.cookies.set(SANRI_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: SANRI_COOKIE_PATH,
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
