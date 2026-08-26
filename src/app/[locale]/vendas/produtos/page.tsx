import { setRequestLocale, getTranslations } from 'next-intl/server';
import { RFIDProducts } from '@/components/vendas/RFIDProducts';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/seo';
import { rfidProducts } from '@/data/rfid-products';
import { produtosFaq } from '@/data/produtos-faq';
import { RelatedArticles } from '@/components/blog/RelatedArticles';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'vendas.produtos' });

  return {
    title: `${t('metaTitle')} | Seabra`,
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
          brand: { '@type': 'Brand', name: 'Seabra' },
          image: `${SITE_URL}${p.image}`,
          offers,
        },
      };
    }),
  };

  const faq = produtosFaq[locale as 'pt' | 'es' | 'en'] ?? produtosFaq.pt;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <JsonLd data={[itemList, faqSchema]} />
      <RFIDProducts />

      <section className="section-padding">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-foreground mb-6">{faq.title}</h2>
          <div className="space-y-3">
            {faq.items.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border p-4 open:bg-muted transition-colors"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                  {item.q}
                  <span className="ml-4 text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedArticles
        slugs={[
          'microchip-e-brinco-eletronico-rfid-precos',
          'como-implementar-rastreabilidade-no-rebanho',
          'rfid-obrigatorio-brasil-rastreabilidade-bovina',
        ]}
        locale={locale}
      />
    </>
  );
}
