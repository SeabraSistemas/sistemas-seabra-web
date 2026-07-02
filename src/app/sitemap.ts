import type { MetadataRoute } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { blogPosts } from '@/data/blog-posts';
import { localizedUrl, alternateLanguages } from '@/lib/seo';

/**
 * Rotas institucionais — existem nos 3 locales (pt/es/en) e recebem hreflang recíproco.
 * /cases é noindex e fica de fora; /docs-seabra, /apresentacao e /planos não são páginas.
 */
const localizedPaths = [
  '',
  '/pequenos-ruminantes',
  '/bovinos-corte',
  '/solucoes/caprinos/leite',
  '/solucoes/caprinos/corte',
  '/solucoes/ovinos/leite',
  '/solucoes/ovinos/corte',
  '/solucoes/bovinos/leite',
  '/solucoes/bovinos/corte',
  '/servicos',
  '/vendas',
  '/vendas/consultoria',
  '/vendas/produtos',
  '/blog',
  '/contato',
  '/privacidade',
  '/termos',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const institutional: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    localizedPaths.map((path) => ({
      url: localizedUrl(locale, path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: { languages: alternateLanguages(path) },
    })),
  );

  // Blog: conteúdo só em pt -> indexar apenas a URL pt (sem alternates es/en quebrados).
  const blog: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: localizedUrl(defaultLocale, `/blog/${post.slug}`),
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...institutional, ...blog];
}
