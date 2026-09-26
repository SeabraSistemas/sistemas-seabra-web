import { NextResponse } from 'next/server';
import { BOVINOS_COOKIE, BOVINOS_COOKIE_PATH } from '@/lib/bovinos/auth';
import { LOGIN_HREF } from '@/lib/bovinos/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL(LOGIN_HREF, origin), 303);
  response.cookies.set(BOVINOS_COOKIE, '', { path: BOVINOS_COOKIE_PATH, maxAge: 0 });
  return response;
}
