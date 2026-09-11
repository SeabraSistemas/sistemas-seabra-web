import { notFound } from 'next/navigation';
import { AdmNav } from '@/components/adm/AdmNav';
import { requireAdmSession } from '@/lib/adm/guard';

/**
 * O GATE do painel. Tudo dentro do route group (app) — carteira, usuários,
 * ficha do cliente, escape hatch — passa por aqui antes de renderizar.
 *
 * POR QUE O GATE MORA NO LAYOUT E NÃO NO MIDDLEWARE
 *
 * 1. Middleware é FILTRO, não fronteira. O CVE-2025-29927 (header
 *    `x-middleware-subrequest`) permitia pular a autorização feita no middleware
 *    do Next; a versão deste repo já está corrigida, mas a lição arquitetural
 *    fica de pé: a decisão de autorização precisa acontecer no MESMO processo
 *    que lê o dado, não numa camada anterior que pode ser contornada.
 * 2. Runtime. O middleware roda no Edge por padrão, e a verificação de sessão
 *    usa node:crypto (createHmac/timingSafeEqual) — o login usa scrypt, que
 *    sequer existe no WebCrypto. Seria mais uma peça (runtime nodejs no
 *    middleware) para fazer pior o que o layout faz de graça.
 * 3. O src/middleware.ts deste repo é do next-intl e é compartilhado com o SITE
 *    INTEIRO (matcher ['/', '/(pt|es|en)/:path*'], que nem toca em /adm).
 *    Compor um gate de autenticação com o matcher de i18n num arquivo só é
 *    fonte real de bug: uma ordem errada desliga em silêncio ou o i18n ou o
 *    gate — e um erro ali derruba as páginas institucionais junto.
 *
 * O QUE ESTE LAYOUT **NÃO** PROTEGE, e é o erro clássico: layout não cobre
 * Route Handler nem Server Action. Qualquer rota sob /adm/api/* roda sem passar
 * por aqui. Por isso o gate é uma FUNÇÃO usada em três lugares — (a) este
 * layout, (b) a primeira linha de cada route handler, (c) a primeira linha de
 * cada Server Action — e não um lugar só.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdmAppLayout({ children }: { children: React.ReactNode }) {
  // Mesma trava de src/app/adm/login/page.tsx: preview da Vercel é URL pública
  // de branch, seria uma segunda porta para a mesma base. Só preview — dev e
  // produção seguem normais.
  if (process.env.VERCEL_ENV === 'preview') notFound();

  // requireAdmSession() já redireciona para /adm/login quando não há sessão
  // válida (assinatura, prazo absoluto de 8h, inatividade de 30min e allowlist),
  // e o redirect() lança por dentro: nada abaixo desta linha roda sem sessão.
  const sessao = await requireAdmSession();

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8">
      <AdmNav usuario={sessao.sub} />
      <main className="py-5">{children}</main>
    </div>
  );
}
