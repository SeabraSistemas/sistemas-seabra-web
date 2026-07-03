import { Link } from '@/i18n/routing';
import { getPostBySlug } from '@/data/blog-posts';

const LABEL: Record<string, string> = {
  pt: 'Artigos relacionados',
  es: 'Artículos relacionados',
  en: 'Related articles',
};

/**
 * Seção de "artigos relacionados" — cria o link página -> blog (o inverso do que os posts
 * já fazem), reforçando o linking interno e mantendo o visitante no site.
 * Recebe os slugs dos posts relevantes; usa o título/resumo já localizado por getPostBySlug.
 */
export function RelatedArticles({ slugs, locale }: { slugs: string[]; locale: string }) {
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (posts.length === 0) return null;

  return (
    <section className="section-padding bg-gray-50/50">
      <div className="container-wide max-w-4xl mx-auto">
        <h2 className="heading-2 text-gray-900 mb-8 text-center">
          {LABEL[locale] ?? LABEL.pt}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {post.category}
              </span>
              <h3 className="mt-2 font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
