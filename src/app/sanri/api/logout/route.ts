import { NextResponse } from 'next/server';
import { SANRI_COOKIE, SANRI_COOKIE_PATH } from '@/lib/sanri/auth';
import { LOGIN_HREF } from '@/lib/sanri/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL(LOGIN_HREF, origin), 303);
  response.cookies.set(SANRI_COOKIE, '', { path: SANRI_COOKIE_PATH, maxAge: 0 });
  return response;
}
