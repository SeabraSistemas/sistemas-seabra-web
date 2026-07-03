import { setRequestLocale, getTranslations } from 'next-intl/server';
import { LandingHero } from '@/components/landing/LandingHero';
import { PainPoints } from '@/components/landing/PainPoints';
import { Benefits } from '@/components/landing/Benefits';
import { Modules } from '@/components/landing/Modules';
import { LandingProofs } from '@/components/landing/LandingProofs';
import { FAQ } from '@/components/landing/FAQ';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { RelatedArticles } from '@/components/blog/RelatedArticles';

const SEGMENT_KEY = 'cattleBeef';
const SEGMENT_SLUG = 'bovinos-corte';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hubs.beefCattle' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function BovinosCorteHub({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <LandingHero segmentKey={SEGMENT_KEY} segmentSlug={SEGMENT_SLUG} />
      <PainPoints />
      <Benefits />
      <Modules />
      <LandingProofs segmentSlug={SEGMENT_SLUG} />
      <FAQ />
      <RelatedArticles
        slugs={[
          'custo-por-arroba-confinamento-como-calcular',
          'confinamento-bovino-cresce-brasil-2025',
          'brs-capiacu-silagem-pros-contras',
          'qualidade-fibra-bovinos-corte-confinamento',
        ]}
        locale={locale}
      />
      <LandingCTA segmentSlug={SEGMENT_SLUG} />
    </>
  );
}
