import { SITE_URL } from '@/lib/seo';

/** Injeta um bloco JSON-LD (schema.org). Aceita um objeto ou um array de objetos. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Schema da organização (empresa de software/serviços — não é fazenda/LocalBusiness). */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Seabra Solutions',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.png`,
        description:
          'Sistemas sob medida para gestão de rebanhos — pequenos ruminantes e bovinos de corte, com suporte de quem é do setor.',
        // TODO: adicionar URLs reais das redes (Instagram, etc.) para reforçar a entidade no Google.
        sameAs: [],
      }}
    />
  );
}

/** Schema do site (ajuda o Google a entender a entidade/marca). */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Seabra Solutions',
        url: SITE_URL,
        inLanguage: ['pt-BR', 'es', 'en'],
      }}
    />
  );
}
