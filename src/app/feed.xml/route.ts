import { blogPosts } from '@/data/blog-posts';
import { SITE_URL, localizedUrl } from '@/lib/seo';

export const dynamic = 'force-static';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Feed RSS do blog (conteúdo pt). Ajuda distribuição e descoberta por leitores/agregadores/IA. */
export async function GET() {
  const items = blogPosts
    .map((post) => {
      const url = localizedUrl('pt', `/blog/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog — Seabra Solutions</title>
    <link>${localizedUrl('pt', '/blog')}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Artigos sobre gestão pecuária, rastreabilidade e tecnologia para o rebanho — caprinos, ovinos e bovinos de corte.</description>
    <language>pt-BR</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
