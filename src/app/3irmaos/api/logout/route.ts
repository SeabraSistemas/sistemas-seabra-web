import { NextResponse } from 'next/server';
import { TRES_IRMAOS_COOKIE, TRES_IRMAOS_COOKIE_PATH } from '@/lib/tres-irmaos/auth';
import { LOGIN_HREF } from '@/lib/tres-irmaos/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL(LOGIN_HREF, origin), 303);
  response.cookies.set(TRES_IRMAOS_COOKIE, '', { path: TRES_IRMAOS_COOKIE_PATH, maxAge: 0 });
  return response;
}
