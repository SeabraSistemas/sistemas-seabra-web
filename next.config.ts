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
