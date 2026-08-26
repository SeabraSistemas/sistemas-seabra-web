import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ConsultoriaHero } from '@/components/vendas/ConsultoriaHero';
import { ConsultorProfile } from '@/components/vendas/ConsultorProfile';
import { ConsultoriaServicos } from '@/components/vendas/ConsultoriaServicos';
import { VendasCTA } from '@/components/vendas/VendasCTA';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'vendas.consultoria' });

  return {
    title: `${t('metaTitle')} | Seabra`,
    description: t('metaDescription'),
  };
}

export default async function ConsultoriaPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'vendas.consultoria' });

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Consultoria em pequenos ruminantes (caprinos e ovinos)',
          name: t('metaTitle'),
          description: t('metaDescription'),
          areaServed: 'BR',
          provider: {
            '@type': 'Organization',
            name: 'Seabra',
            url: SITE_URL,
          },
        }}
      />
      <ConsultoriaHero />
      <ConsultorProfile />
      <ConsultoriaServicos />
      <RelatedArticles
        slugs={['vale-a-pena-consultoria-caprinocultura', 'como-escolher-software-caprinos-ovinos']}
        locale={locale}
      />
      <VendasCTA />
    </>
  );
}
