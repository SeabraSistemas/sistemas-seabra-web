import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { mesmaOrigem } from '@/lib/adm/auth';
import { extrairIp } from '@/lib/adm/audit';
import { aplicarPisoDeLatencia, registrarTentativa, verificarBloqueio } from '@/lib/adm/rate-limit';
import { emailPermitido } from '@/lib/tres-irmaos/allowlist';
import { SESSAO_DIAS, TRES_IRMAOS_COOKIE, TRES_IRMAOS_COOKIE_PATH, assinarSessao, segredoConfigurado } from '@/lib/tres-irmaos/auth';
import { HOME_HREF, LOGIN_HREF } from '@/lib/tres-irmaos/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Login do /3irmaos: e-mail da allowlist + a senha do APP (decisão do Felipe,
 * 28/09/2026: "pelo mesmo login meu e do Lucas"). A senha é conferida no
 * Supabase Auth com a anon key — o site nunca a guarda. A sessão aberta lá
 * para conferir é encerrada em seguida, só ela (scope 'local'): 'global'
 * deslogaria o celular do Lucas.
 *
 * Do /adm vêm o rate limit (mesmo balde), a checagem de origem e o piso de
 * latência. E-mail fora da lista nem chega ao Supabase, e o piso iguala o
 * tempo de resposta dos dois casos.
 */
export async function POST(request: Request) {
  const inicio = Date.now();
  const url = new URL(request.url);
  const origin = url.origin;
  const volta = async (erro: string, extras = '') => {
    await aplicarPisoDeLatencia(inicio, 800);
    return NextResponse.redirect(new URL(`${LOGIN_HREF}?erro=${erro}${extras}`, origin), 303);
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
  const ip = extrairIp(request.headers);
  const ator = `3irmaos:${email}`;

  const bloqueio = await verificarBloqueio(ip, ator);
  if (bloqueio.bloqueado) return volta('bloqueado', `&espera=${bloqueio.esperaSegundos}`);

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!supaUrl || !anon || !segredoConfigurado()) {
    console.error('[3irmaos] NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY ou TRES_IRMAOS_SESSION_SECRET ausente — login bloqueado');
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
    await registrarTentativa({ ip, usuario: ator, sucesso: false, motivo: emailPermitido(email) ? 'senha' : 'usuario' });
    return volta('credenciais');
  }

  const valor = assinarSessao(email);
  if (!valor) return volta('config');
  await registrarTentativa({ ip, usuario: ator, sucesso: true, motivo: 'ok' });
  await aplicarPisoDeLatencia(inicio, 800);

  const response = NextResponse.redirect(new URL(HOME_HREF, origin), 303);
  response.cookies.set(TRES_IRMAOS_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: TRES_IRMAOS_COOKIE_PATH,
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
