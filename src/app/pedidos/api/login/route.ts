import { NextResponse } from 'next/server';
import { mesmaOrigem } from '@/lib/adm/auth';
import { extrairIp } from '@/lib/adm/audit';
import { normalizarGesto } from '@/lib/adm/gesto';
import { decomporHash, verificarSenha } from '@/lib/adm/password';
import { aplicarPisoDeLatencia, registrarTentativa, verificarBloqueio } from '@/lib/adm/rate-limit';
import { assinarSessao, opcoesCookie, PEDIDOS_COOKIE } from '@/lib/pedidos/auth';

/**
 * Login do /pedidos: SÓ o gesto (grade 3x3), conferido contra o mesmo hash do /adm (ADM_GESTO_HASH)
 * e com o mesmo rate limit — ver o trade-off em src/lib/pedidos/auth.ts. A tela e a resposta não
 * dizem nada além de "não confere"; o tempo de resposta tem piso fixo.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const USUARIO = 'pedidos';

function paraLogin(origem: string, params: Record<string, string>): NextResponse {
  const url = new URL('/pedidos/login', origem);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = NextResponse.redirect(url, 303);
  r.headers.set('Cache-Control', 'no-store');
  return r;
}

export async function POST(request: Request) {
  const inicio = Date.now();
  const url = new URL(request.url);
  const ip = extrairIp(request.headers);

  if (!mesmaOrigem(request, url)) {
    await aplicarPisoDeLatencia(inicio);
    return new NextResponse('Origem inválida.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  const bloqueio = await verificarBloqueio(ip, USUARIO);
  if (bloqueio.bloqueado) {
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(url.origin, { erro: 'bloqueado', espera: String(bloqueio.esperaSegundos) });
  }

  const hash = process.env.ADM_GESTO_HASH;
  if (!decomporHash(hash)) {
    console.error('[pedidos] login indisponível: ADM_GESTO_HASH ausente/inválido');
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(url.origin, { erro: 'config' });
  }

  let gestoDigitado = '';
  try {
    gestoDigitado = String((await request.formData()).get('gesto') ?? '').trim();
  } catch {
    // Corpo que não é formulário: sondagem. Cai no "não confere" abaixo, com o mesmo custo.
  }
  const confere = await verificarSenha(normalizarGesto(gestoDigitado) ?? '', hash);
  if (!confere) {
    await registrarTentativa({ ip, usuario: USUARIO, sucesso: false, motivo: 'gesto' });
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(url.origin, { erro: 'credenciais' });
  }

  const valor = assinarSessao();
  if (!valor) {
    console.error('[pedidos] PEDIDOS_SESSION_SECRET ausente ou curto demais');
    await aplicarPisoDeLatencia(inicio);
    return paraLogin(url.origin, { erro: 'config' });
  }
  await registrarTentativa({ ip, usuario: USUARIO, sucesso: true, motivo: 'ok' });
  await aplicarPisoDeLatencia(inicio);

  const resposta = NextResponse.redirect(new URL('/pedidos', url.origin), 303);
  resposta.headers.set('Cache-Control', 'no-store');
  resposta.cookies.set(PEDIDOS_COOKIE, valor, opcoesCookie());
  return resposta;
}
