import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailPermitido } from '@/lib/nutricao/acesso/allowlist';
import { NUTRICAO_COOKIE, NUTRICAO_COOKIE_PATH, SESSAO_DIAS, assinarSessao, segredoConfigurado } from '@/lib/nutricao/acesso/auth';
import { aplicarPisoDeLatencia, bloqueioRestanteSegundos, ipDaRequisicao, limparFalhas, mesmaOrigem, registrarFalha } from '@/lib/nutricao/acesso/tentativas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOGIN_HREF = '/nutricao';

/**
 * Login do /nutricao: e-mail da allowlist + a senha do APP, conferida no
 * Supabase Auth com a anon key (o site nunca a guarda; nada de service_role).
 * A sessão aberta lá só para conferir é encerrada em seguida, só ela
 * (scope 'local'): 'global' deslogaria o app do celular.
 */
export async function POST(request: Request) {
  const inicio = Date.now();
  const url = new URL(request.url);
  const origin = url.origin;
  const volta = async (erro: string) => {
    await aplicarPisoDeLatencia(inicio);
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=${erro}`, origin), 303);
  };

  if (!mesmaOrigem(request, url)) {
    await aplicarPisoDeLatencia(inicio);
    return new NextResponse('Origem inválida.', { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return volta('credenciais');
  }
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const senha = String(form.get('senha') ?? '');
  const manter = form.get('manter') === '1';
  const chave = `${ipDaRequisicao(request.headers)}|${email}`;

  if (bloqueioRestanteSegundos(chave) > 0) return volta('bloqueado');

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!supaUrl || !anon || !segredoConfigurado()) {
    console.error('[nutricao] NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY ou NUTRICAO_SESSION_SECRET ausente — login bloqueado');
    return volta('config');
  }

  let senhaOk = false;
  if (emailPermitido(email) && senha) {
    const auth = createClient(supaUrl, anon, { auth: { persistSession: false, autoRefreshToken: false } }).auth;
    const { data, error } = await auth.signInWithPassword({ email, password: senha });
    senhaOk = !error && !!data.session && data.user?.email?.toLowerCase() === email;
    if (data.session) await auth.signOut({ scope: 'local' }).catch(() => undefined);
  }

  if (!senhaOk) {
    registrarFalha(chave);
    return volta('credenciais');
  }

  const valor = assinarSessao(email);
  if (!valor) return volta('config');
  limparFalhas(chave);
  await aplicarPisoDeLatencia(inicio);

  const response = NextResponse.redirect(new URL(LOGIN_HREF, origin), 303);
  response.cookies.set(NUTRICAO_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: NUTRICAO_COOKIE_PATH,
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
