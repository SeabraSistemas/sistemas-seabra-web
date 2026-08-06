import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts, getPostBySlug, postLocales } from '@/data/blog-posts';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, localizedUrl } from '@/lib/seo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) return {};

  const hasEs = postLocales(slug).includes('es');
  // pt sempre tem conteúdo; es só quando traduzido. Demais locales (en) apontam para pt.
  const canonicalLocale = locale === 'es' && hasEs ? 'es' : 'pt';

  return {
    title: `${post.title} | Seabra Solutions`,
    description: post.excerpt,
    alternates: {
      canonical: localizedUrl(canonicalLocale, `/blog/${slug}`),
      // Só emite hreflang pt<->es quando existe a versão es (evita alternates quebrados).
      ...(hasEs
        ? {
            languages: {
              pt: localizedUrl('pt', `/blog/${slug}`),
              es: localizedUrl('es', `/blog/${slug}`),
            },
          }
        : {}),
    },
  };
}

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(
    locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  ).format(date);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });
  const tWhatsapp = await getTranslations({ locale, namespace: 'whatsapp' });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(tWhatsapp('defaultMessage'))}`;

  const hasEs = postLocales(slug).includes('es');
  const contentLocale = locale === 'es' && hasEs ? 'es' : 'pt';
  const inLanguage = contentLocale === 'es' ? 'es' : 'pt-BR';
  const postUrl = localizedUrl(contentLocale, `/blog/${post.slug}`);

  return (
    <div className="section-padding">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
            inLanguage,
            mainEntityOfPage: postUrl,
            image: localizedUrl(contentLocale, `/blog/${post.slug}/opengraph-image`),
            author: {
              '@type': 'Person',
              name: 'Felipe Seabra',
              url: localizedUrl(contentLocale, '/vendas/consultoria'),
            },
            publisher: {
              '@type': 'Organization',
              name: 'Seabra Solutions',
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Blog', item: localizedUrl(contentLocale, '/blog') },
              { '@type': 'ListItem', position: 2, name: post.title, item: postUrl },
            ],
          },
        ]}
      />
      <div className="max-w-3xl mx-auto px-4">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToList')}
        </Link>

        {/* Header */}
        <header className="space-y-4 mb-10">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-primary font-medium uppercase tracking-wide">
              {post.category}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.date, locale)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-muted-foreground">
            {post.excerpt}
          </p>
        </header>

        {/* Content */}
        {/* As classes prose-* que estavam aqui nunca produziram uma única
            regra: @tailwindcss/typography não está instalado e não há @plugin
            em globals.css. O corpo dos artigos vinha sem estilo nenhum. A
            classe .article em globals.css substitui isso usando os tokens do
            tema — sem trazer o plugin, que embute defaults de modo claro e
            exigiria prose-invert por cima. */}
        <article className="article">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>

        {/* Source */}
        {post.source && (
          <div className="mt-10 p-4 rounded-xl bg-muted border border-border">
            <p className="text-sm text-muted-foreground">
              {t('source')}:{' '}
              <a
                href={post.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {post.source.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            {t('ctaTitle')}
          </h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('ctaDescription')}
          </p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-full gap-2 mt-2">
              {t('ctaButton')}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
