import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Mantido '**' de proposito: restringir ao host do Supabase fecharia o
    // proxy de otimizacao aberto, mas arrisca quebrar imagens de blog/outras
    // fontes. Essa restricao (host especifico) fica como hardening a parte.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Ganho seguro para as fotos da vitrine (461 KB -> ~40 KB a 640px em avif):
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000, // 30 dias (nomes de foto no Storage sao epoch, imutaveis)
    qualities: [75, 90], // Next 16 rejeita quality fora desta lista
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 56, 64, 96, 128, 220, 256, 384],
  },
  async headers() {
    return [
      {
        // O /adm lê a base inteira de clientes. Estes headers são a camada que
        // não depende de nenhum código nosso rodar certo: valem inclusive numa
        // rota que esqueça o gate.
        //
        // X-Robots-Tag em vez de (só) robots.txt: o Disallow pede para não
        // RASTREAR, mas uma URL descoberta por link ainda pode ser indexada.
        // O header remove de fato — e, ao contrário do robots.txt, não publica
        // o caminho para quem lê o arquivo procurando o que vale atacar. É por
        // isso que /adm é a única rota privada do site fora do robots.txt.
        // Cobre também /adm/api/* — os route handlers do painel moram sob
        // /adm justamente para receber o cookie de sessão (path: '/adm').
        source: '/adm/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
          // Nada do painel pode ficar em cache compartilhado nem no disco do
          // navegador: são dados pessoais de clientes reais.
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          // Sem Referer, o id do cliente aberto não vaza para nenhum destino
          // externo em que o Felipe clique a partir do painel (wa.me, por ex.).
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/apresentacao',    destination: '/docs-seabra/apresentacao.html' },
      { source: '/apresentacao-es', destination: '/docs-seabra/apresentacao-es.html' },
      { source: '/apresentacao-en', destination: '/docs-seabra/apresentacao-en.html' },
      { source: '/planos',          destination: '/docs-seabra/planos.html' },
      { source: '/planos-es',       destination: '/docs-seabra/planos-es.html' },
      { source: '/planos-en',       destination: '/docs-seabra/planos-en.html' },
    ];
  },
  async redirects() {
    return [
      { source: '/privacidade', destination: '/pt/privacidade', permanent: true },
      { source: '/termos',      destination: '/pt/termos',      permanent: true },
      // /criadores sem prefixo de locale dava 404 (o middleware next-intl só
      // casa '/' e '/(pt|es|en)/...'). 307 pro pt — o link no termo e as URLs
      // compartilhadas usam a forma sem prefixo.
      { source: '/criadores',        destination: '/pt/criadores',        permanent: false },
      { source: '/criadores/:path*', destination: '/pt/criadores/:path*', permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
