import { setRequestLocale, getTranslations } from 'next-intl/server';
import { RFIDProducts } from '@/components/vendas/RFIDProducts';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'vendas.produtos' });

  return {
    title: `${t('metaTitle')} | Seabra Solutions`,
    description: t('metaDescription'),
  };
}

export default async function ProdutosPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'vendas.produtos' });

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: t('metaTitle'),
          description: t('metaDescription'),
          category: 'Identificação eletrônica e rastreabilidade animal (RFID)',
          brand: { '@type': 'Brand', name: 'Seabra Solutions' },
          image: `${SITE_URL}/images/logo.png`,
        }}
      />
      <RFIDProducts />
    </>
  );
}
