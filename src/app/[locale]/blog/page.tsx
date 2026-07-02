import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { blogPosts, getPostBySlug } from '@/data/blog-posts';

interface PageProps {
  params: Promise<{ locale: string }>;
}

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(
    locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  ).format(date);
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return {
    title: `${t('title')} | Seabra Solutions`,
    description: t('subtitle'),
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <div className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-gray-900">
            {t('title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((base) => {
            const post = getPostBySlug(base.slug, locale) ?? base;
            return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <Card className="h-full border-gray-200 hover:border-primary/30 transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="text-primary font-semibold uppercase tracking-wide">
                      {post.category}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatDate(post.date, locale)} · {post.readTime} min
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-3 leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify flex-1">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="flex items-center text-sm font-medium text-primary mt-5 pt-4 border-t border-gray-100">
                    <span>{t('readMore')}</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t('empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
