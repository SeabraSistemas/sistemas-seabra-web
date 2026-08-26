import { setRequestLocale, getTranslations } from 'next-intl/server';
import { VendasHero } from '@/components/vendas/VendasHero';
import { VendasOfferGrid } from '@/components/vendas/VendasOfferGrid';
import { VendasCTA } from '@/components/vendas/VendasCTA';
import { LogosSection } from '@/components/home/LogosSection';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'vendas.metadata' });

  return {
    title: `${t('title')} | Seabra`,
    description: t('description'),
  };
}

export default async function VendasPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <VendasHero />
      <VendasOfferGrid />
      <LogosSection />
      <VendasCTA />
    </>
  );
}
