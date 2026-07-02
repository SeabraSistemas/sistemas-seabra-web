import { setRequestLocale, getTranslations } from 'next-intl/server';
import { RFIDProducts } from '@/components/vendas/RFIDProducts';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';
import { rfidProducts } from '@/data/rfid-products';

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

  // ItemList com os produtos reais + Offer/AggregateOffer (preços em BRL do catálogo).
  // Habilita rich results de produto com preço nas buscas transacionais.
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('metaTitle'),
    itemListElement: rfidProducts.map((p, i) => {
      const tierPrices = p.priceTiers?.map((tier) => tier.unitBRL) ?? [];
      const offers = p.priceTiers
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'BRL',
            lowPrice: Math.min(...tierPrices),
            highPrice: Math.max(...tierPrices),
            offerCount: p.priceTiers.length,
            availability: 'https://schema.org/InStock',
          }
        : {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: p.priceBRL,
            availability: 'https://schema.org/InStock',
          };
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: t(`items.${p.slug}.name`),
          description: t(`items.${p.slug}.desc`),
          category: p.category === 'microchip' ? 'Microchip RFID' : 'Leitor RFID',
          brand: { '@type': 'Brand', name: 'Seabra Solutions' },
          image: `${SITE_URL}${p.image}`,
          offers,
        },
      };
    }),
  };

  return (
    <>
      <JsonLd data={itemList} />
      <RFIDProducts />
    </>
  );
}
