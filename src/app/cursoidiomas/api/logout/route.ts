import { NextResponse } from 'next/server';
import { CURSO_COOKIE, CURSO_COOKIE_PATH } from '@/lib/cursoidiomas/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL('/cursoidiomas', origin), 303);
  response.cookies.set(CURSO_COOKIE, '', { path: CURSO_COOKIE_PATH, maxAge: 0 });
  return response;
}
