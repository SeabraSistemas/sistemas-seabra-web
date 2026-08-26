import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Gera uma sessão Supabase para o usuário demo do SeabraApp.
 *
 * Chamado pelo iframe em `ProofsSection` no mount — retorna tokens que são
 * injetados na URL do iframe (`?demo=true&refresh_token=...`). O app Flutter
 * (main.dart → tryDemoAutoLogin) consome e chama setSession, ficando logado.
 *
 * Segurança: escritas do usuário demo são bloqueadas via triggers Postgres
 * `demo_block_writes` no banco. Credenciais nunca saem do servidor.
 */
export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!url || !anonKey || !email || !password) {
    return NextResponse.json(
      { error: 'demo_misconfigured' },
      { status: 500 },
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    console.error('[demo-session] signInWithPassword falhou:', error);
    return NextResponse.json(
      { error: 'demo_unavailable' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
