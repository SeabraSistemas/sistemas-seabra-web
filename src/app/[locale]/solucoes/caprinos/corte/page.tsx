import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { LandingHero } from '@/components/landing/LandingHero';
import { PainPoints } from '@/components/landing/PainPoints';
import { Benefits } from '@/components/landing/Benefits';
import { Modules } from '@/components/landing/Modules';
import { LandingProofs } from '@/components/landing/LandingProofs';
import { FAQ } from '@/components/landing/FAQ';
import { LandingCTA } from '@/components/landing/LandingCTA';

const SEGMENT_KEY = 'goatBeef';
const SEGMENT_SLUG = 'caprinos-corte';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'segments' });

  return {
    title: `${t(SEGMENT_KEY)} | Seabra`,
    description: `Sistema completo para gestão de ${t(SEGMENT_KEY).toLowerCase()}. Controle de produção, manejo reprodutivo e muito mais.`,
  };
}

export default async function CaprinosCortePage({ params }: PageProps) {
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
      <LandingCTA segmentSlug={SEGMENT_SLUG} />
    </>
  );
}
