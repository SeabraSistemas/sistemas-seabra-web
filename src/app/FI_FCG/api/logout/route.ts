import { NextResponse } from 'next/server';
import { FI_FCG_COOKIE, FI_FCG_COOKIE_PATH } from '@/lib/fi-fcg/auth';
import { LOGIN_HREF } from '@/lib/fi-fcg/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL(LOGIN_HREF, origin), 303);
  response.cookies.set(FI_FCG_COOKIE, '', { path: FI_FCG_COOKIE_PATH, maxAge: 0 });
  return response;
}
