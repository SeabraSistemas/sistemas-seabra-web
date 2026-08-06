import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { ServicosHero } from '@/components/servicos/ServicosHero';
import { ServiceTiers } from '@/components/servicos/ServiceTiers';
import { ServicesCTA } from '@/components/servicos/ServicesCTA';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'servicos.metadata' });

  return {
    title: `${t('title')} | Seabra`,
    description: t('description'),
  };
}

export default async function ServicosPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ServicosHero />
      <ServiceTiers />
      <ServicesCTA />
    </>
  );
}
