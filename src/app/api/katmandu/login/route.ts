import { NextResponse } from 'next/server';
import { usuarioValido } from '@/lib/katmandu/queries';
import { KATMANDU_COOKIE, signSession } from '@/lib/katmandu/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias, espelha SESSION_DAYS de auth.ts

/**
 * Gate do /katmandu: usuário sem senha, validado contra a lista da aba
 * "User Manager" (coluna C) na planilha do cliente — ver src/lib/katmandu/queries.ts.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const usuario = String(form.get('usuario') ?? '').trim();
  const manterConectado = form.get('manter') != null;
  const origin = new URL(request.url).origin;

  if (!usuario) {
    return NextResponse.redirect(new URL('/katmandu?erro=vazio', origin), 303);
  }

  const ok = await usuarioValido(usuario);
  if (!ok) {
    return NextResponse.redirect(new URL('/katmandu?erro=nao-encontrado', origin), 303);
  }

  const cookieValue = signSession(usuario);
  if (!cookieValue) {
    console.error('[katmandu] KATMANDU_SESSION_SECRET ausente — login bloqueado');
    return NextResponse.redirect(new URL('/katmandu?erro=config', origin), 303);
  }

  const response = NextResponse.redirect(new URL('/katmandu/rebanho', origin), 303);
  response.cookies.set(KATMANDU_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // "Manter conectado" desmarcado => cookie de sessão (some ao fechar o
    // navegador). O token assinado continua válido por 30 dias de qualquer
    // forma (auth.ts) — isso só controla quanto tempo o cookie persiste local.
    ...(manterConectado ? { maxAge: SESSION_MAX_AGE } : {}),
  });
  return response;
}
