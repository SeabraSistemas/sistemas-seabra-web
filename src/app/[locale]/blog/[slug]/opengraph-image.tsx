import { ImageResponse } from 'next/og';
import { getPostBySlug, blogPosts } from '@/data/blog-posts';

export const alt = 'Seabra Solutions';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

/** Card OG por post (título + categoria + marca) para compartilhamento em redes/WhatsApp. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  const title = post?.title ?? 'Blog';
  const category = (post?.category ?? 'BLOG').toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
          padding: '72px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            letterSpacing: 3,
            color: '#6ee7b7',
            fontWeight: 700,
          }}
        >
          {category}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.12,
            maxWidth: '92%',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700 }}>
          Seabra Solutions
        </div>
      </div>
    ),
    { ...size },
  );
}
