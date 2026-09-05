import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADM_COOKIE, assinarSessao, opcoesCookie, renovarIdle, verificarSessao } from '@/lib/adm/auth';
import type { SessaoAdm } from '@/lib/adm/types';

/**
 * O gate do /adm. Uma função, chamada em TRÊS lugares — não um lugar só.
 *
 * POR QUE AQUI E NÃO NO MIDDLEWARE
 * 1. Middleware é FILTRO, não fronteira. O CVE-2025-29927 (header
 *    `x-middleware-subrequest`) permitia pular a autorização feita no middleware
 *    do Next; o 16.1.6 deste repo já está corrigido, mas a lição arquitetural
 *    fica: a fronteira de autorização tem que estar no MESMO processo que lê o
 *    dado, e não numa camada que roda antes e pode ser contornada.
 * 2. Runtime: middleware roda no Edge por default, e a verificação usa
 *    node:crypto (createHmac/timingSafeEqual) — o login usa scrypt, que não
 *    existe no WebCrypto.
 * 3. O middleware deste repo é compartilhado com o next-intl. Compor o gate com
 *    o matcher de i18n num arquivo só é fonte real de bug: uma ordem errada
 *    desliga em silêncio ou o i18n ou o gate — e derruba o site institucional
 *    junto.
 *
 * O QUE O LAYOUT NÃO PROTEGE (o erro clássico): layouts NÃO cobrem Route
 * Handlers nem Server Actions. `/adm/api/export` roda sem passar por layout
 * nenhum. Por isso:
 *   (a) layout do painel        → requireAdmSession()
 *   (b) PRIMEIRA linha de cada route handler sob /adm/api → getAdmSession() + 401
 *   (c) PRIMEIRA linha de cada Server Action              → requireAdmSession()
 *
 * Lembrete para as páginas (não é responsabilidade deste arquivo):
 * `export const dynamic = 'force-dynamic'` e `revalidate = 0` em todo o
 * segmento /adm — um payload RSC com dado de cliente cacheado no CDN da Vercel
 * é vazamento silencioso.
 */

/**
 * Segunda tranca. A allowlist existe porque `regra_de_acesso = 'administrador'`
 * é AUTO-ATRIBUÍVEL no banco (policy `update_own_user` com `USING(true)` sem
 * `WITH CHECK`) — papel no banco não serve de gate. Hoje o login já é usuário +
 * senha + TOTP guardados fora do Supabase, então a lista é opcional: vazia
 * significa "não em uso", e não "ninguém entra". Quando o dia chegar de amarrar
 * a sessão a um uuid do Supabase Auth, esta é a checagem que impede um
 * auto-promovido de entrar.
 */
export function operadorPermitido(sub: string): boolean {
  const bruto = process.env.ADM_ALLOWED_UUIDS;
  if (!bruto) return true;
  const permitidos = bruto.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (permitidos.length === 0) return true;
  return permitidos.includes(sub.trim().toLowerCase());
}

/**
 * Sessão válida ou null. Use em ROUTE HANDLERS, que precisam responder 401 em
 * JSON — um redirect() dentro de um fetch vira 200 com HTML de login, e o
 * cliente interpreta como sucesso.
 *
 * Renova o idle de quebra: cada request desliza os 30 min sem tocar no absExp.
 */
export async function getAdmSession(): Promise<SessaoAdm | null> {
  const cookieStore = await cookies();
  const sessao = verificarSessao(cookieStore.get(ADM_COOKIE)?.value);
  if (!sessao) return null;

  if (!operadorPermitido(sessao.sub)) {
    // Sem o valor de `sub` no log: o login do operador é dado de identificação.
    console.warn('[adm] sessão válida rejeitada pela allowlist ADM_ALLOWED_UUIDS');
    return null;
  }

  const renovada = renovarIdle(sessao);
  if (!renovada) return null;

  const valor = assinarSessao(renovada);
  if (valor) {
    try {
      cookieStore.set(ADM_COOKIE, valor, opcoesCookie(renovada));
    } catch {
      // O Next só deixa MUTAR cookie em Server Action e Route Handler; num
      // Server Component (o layout do painel) o set lança
      // ReadonlyRequestCookiesError. Engolir é correto: a sessão continua
      // válida, só não desliza nesta navegação. Consequência prática a cobrir
      // na integração: navegar por páginas não renova o idle — o painel precisa
      // de um POST leve (ex.: /adm/api/sessao) chamando getAdmSession() para
      // manter os 30 min vivos enquanto o Felipe está trabalhando.
    }
  }

  return renovada;
}

/**
 * Sessão válida ou redirect para o login. Use em LAYOUT, PAGE e Server Action.
 * `redirect()` lança por dentro (retorno `never`), então nada depois dele roda.
 */
export async function requireAdmSession(): Promise<SessaoAdm> {
  const sessao = await getAdmSession();
  if (!sessao) redirect('/adm/login');
  return sessao;
}
