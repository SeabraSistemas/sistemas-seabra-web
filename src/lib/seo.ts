import { locales, defaultLocale } from '@/i18n/config';

/** Origem canônica do site (sem barra final). Espelha o metadataBase do layout. */
export const SITE_URL = 'https://sistemaseabra.com.br';

/** URL absoluta de um caminho num locale específico (ex.: localizedUrl('pt', '/blog')). */
export function localizedUrl(locale: string, path = ''): string {
  const clean = path && !path.startsWith('/') ? `/${path}` : path;
  return `${SITE_URL}/${locale}${clean}`;
}

/**
 * Mapa de alternates (hreflang) para um caminho, em todos os locales + x-default.
 * Usado no sitemap — o Google aceita hreflang declarado via sitemap.
 */
export function alternateLanguages(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = localizedUrl(locale, path);
  languages['x-default'] = localizedUrl(defaultLocale, path);
  return languages;
}
