import { NextResponse } from 'next/server';
import { KATMANDU_COOKIE } from '@/lib/katmandu/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL('/katmandu', origin), 303);
  response.cookies.delete(KATMANDU_COOKIE);
  return response;
}
