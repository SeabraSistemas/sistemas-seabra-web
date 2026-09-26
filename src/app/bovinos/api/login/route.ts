import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { extrairIp } from '@/lib/adm/audit';
import { decomporHash, verificarSenha } from '@/lib/adm/password';
import { aplicarPisoDeLatencia, registrarTentativa, verificarBloqueio } from '@/lib/adm/rate-limit';
import { emailPermitido } from '@/lib/bovinos/allowlist';
import { BOVINOS_COOKIE, BOVINOS_COOKIE_PATH, SESSAO_DIAS, assinarSessao } from '@/lib/bovinos/auth';
import { HOME_HREF, LOGIN_HREF } from '@/lib/bovinos/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Login do /bovinos: e-mail da allowlist + a MESMA senha do /adm
 * (ADM_PASSWORD_HASH, scrypt — decisão do Felipe, 26/09/2026: o painel grava
 * nas planilhas de clientes, só o e-mail não basta). Reaproveita do /adm o
 * rate limit (mesmo balde: força bruta aqui conta lá), a checagem de origem e
 * o piso de latência. A senha é conferida mesmo com e-mail errado (hash nulo),
 * para a resposta custar o mesmo tempo nos dois casos.
 */
export async function POST(request: Request) {
  const inicio = Date.now();
  const url = new URL(request.url);
  const origin = url.origin;
  const volta = async (erro: string, extras = '') => {
    await aplicarPisoDeLatencia(inicio);
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
  const ator = `bovinos:${email}`;

  const bloqueio = await verificarBloqueio(ip, ator);
  if (bloqueio.bloqueado) return volta('bloqueado', `&espera=${bloqueio.esperaSegundos}`);

  const hash = process.env.ADM_PASSWORD_HASH;
  if (!decomporHash(hash) || !process.env.BOVINOS_SESSION_SECRET) {
    console.error('[bovinos] ADM_PASSWORD_HASH ou BOVINOS_SESSION_SECRET ausente — login bloqueado');
    return volta('config');
  }

  const emailOk = emailPermitido(email);
  const senhaOk = await verificarSenha(senha, emailOk ? hash : null);
  if (!emailOk || !senhaOk) {
    await registrarTentativa({ ip, usuario: ator, sucesso: false, motivo: emailOk ? 'senha' : 'usuario' });
    return volta('credenciais');
  }

  const valor = assinarSessao(email);
  if (!valor) return volta('config');
  await registrarTentativa({ ip, usuario: ator, sucesso: true, motivo: 'ok' });
  await aplicarPisoDeLatencia(inicio);

  const response = NextResponse.redirect(new URL(HOME_HREF, origin), 303);
  response.cookies.set(BOVINOS_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: BOVINOS_COOKIE_PATH,
    ...(manter ? { maxAge: SESSAO_DIAS * 24 * 60 * 60 } : {}),
  });
  return response;
}
