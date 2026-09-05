import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADM_COOKIE, OPCOES_COOKIE_LIMPEZA, verificarSessao } from '@/lib/adm/auth';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';

/**
 * Logout do /adm: apaga o cookie E registra a saída na auditoria.
 *
 * O registro não é capricho. A trilha só serve para responder "quem viu o quê e
 * quando" se as sessões tiverem começo E fim: sem o `logout`, todo acesso fica
 * com duração aberta, e a diferença entre "abriu e fechou em 2 minutos" e
 * "ficou 8 horas dentro" desaparece justamente na hora de investigar.
 *
 * runtime 'nodejs' porque verificarSessao() usa node:crypto (HMAC), que não
 * existe no Edge.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** sid = randomBytes(16).toString('hex') em auth.ts — 32 hexadecimais, nada mais. */
const FORMATO_SID = /^[0-9a-f]{32}$/;

function mesmaOrigem(request: Request, url: URL): boolean {
  const origem = request.headers.get('origin');
  if (!origem) return true;
  try {
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Sem esta checagem, qualquer página do mundo consegue escrever linhas de
  // 'logout' na trilha de auditoria do Felipe via um <form> escondido. O cookie
  // é sameSite 'strict' (nada é deslogado de fora), mas o ruído no log é real.
  if (!mesmaOrigem(request, url)) {
    return new NextResponse('Origem inválida.', { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  /**
   * O cookie CHEGA aqui — e é por isso que este handler mora em
   * src/app/adm/api/, e não em src/app/api/adm/.
   *
   * opcoesCookie() em src/lib/adm/auth.ts fixa `path: '/adm'`, de propósito: é
   * o que impede o cookie de sessão de viajar junto com as requisições do site
   * institucional e aparecer em log de CDN. Só que o casamento de path do
   * RFC 6265 é por prefixo de segmento — '/api/adm/logout' NÃO começa com
   * '/adm', e o navegador não anexaria o cookie. Com a rota sob /adm/api/, o
   * cookie chega, o `sid` vai para a auditoria e a saída fica amarrada a UMA
   * sessão específica.
   *
   * A alternativa seria afrouxar o cookie para `path: '/'` — descartada: o
   * ganho é nenhum e o custo é o cookie do painel acompanhar toda navegação
   * pelo site público.
   */
  const cookieStore = await cookies();
  const sessao = verificarSessao(cookieStore.get(ADM_COOKIE)?.value);

  let sid: string | null = sessao?.sid ?? null;
  if (!sid) {
    try {
      const bruto = String((await request.formData()).get('sid') ?? '').trim();
      if (FORMATO_SID.test(bruto)) sid = bruto;
    } catch {
      // Sem corpo de formulário: segue sem sid. Nunca falhar o logout por causa
      // do log — o cookie tem que sair de qualquer maneira.
    }
  }

  const resposta = NextResponse.redirect(new URL('/adm/login?saiu=1', url.origin), 303);
  resposta.headers.set('Cache-Control', 'no-store');
  // Limpeza ANTES da auditoria na ordem de escrita da resposta, mas o await
  // abaixo é o que garante a gravação: na Vercel a lambda pode congelar assim
  // que a resposta sai, e uma promessa solta some sem gravar nada.
  resposta.cookies.set(ADM_COOKIE, '', OPCOES_COOKIE_LIMPEZA);

  await registrarAcesso('logout', {
    sid,
    ip: extrairIp(request.headers),
    userAgent: extrairUserAgent(request.headers),
  });

  return resposta;
}
