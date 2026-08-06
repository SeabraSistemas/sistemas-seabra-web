import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { LogosSection } from '@/components/home/LogosSection';
import { RelatedArticles } from '@/components/blog/RelatedArticles';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hubs.smallRuminants' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

const products = [
  { slug: 'caprinos-leite', href: '/solucoes/caprinos/leite', key: 'goatDairy', iconSrc: '/images/icons/mono/caprinos-leite.png' },
  { slug: 'caprinos-corte', href: '/solucoes/caprinos/corte', key: 'goatBeef', iconSrc: '/images/icons/mono/caprinos-corte.png' },
  { slug: 'ovinos-leite', href: '/solucoes/ovinos/leite', key: 'sheepDairy', iconSrc: '/images/icons/mono/ovinos-leite.png' },
  { slug: 'ovinos-corte', href: '/solucoes/ovinos/corte', key: 'sheepBeef', iconSrc: '/images/icons/mono/ovinos-corte.png' },
] as const;

export default async function PequenosRuminantesHub({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      <section className="relative pt-32 pb-16 overflow-hidden ">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="container-tight relative z-10 text-center space-y-6">
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-border bg-secondary text-foreground font-medium"
          >
            {t('hubs.smallRuminants.badge')}
          </Badge>
          <h1 className="heading-display text-foreground max-w-3xl mx-auto">
            {t('hubs.smallRuminants.title')}
          </h1>
          <p className="body-large max-w-2xl mx-auto text-muted-foreground">
            {t('hubs.smallRuminants.subtitle')}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center space-y-4 mb-12">
            <h2 className="heading-2 text-foreground">{t('hubs.smallRuminants.productsTitle')}</h2>
            <p className="body-large max-w-2xl mx-auto text-muted-foreground">
              {t('hubs.smallRuminants.productsSubtitle')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {products.map((product) => {
                            return (
                <Link key={product.slug} href={product.href} className="group">
                  <Card className="h-full border-border bg-card transition-colors group-hover:border-input">
                    <CardContent className="p-6 flex flex-col h-full min-h-[180px]">
                      <div className="mb-4">
                        <Image src={product.iconSrc} alt={t(`segments.${product.key}`)} width={64} height={64} className="object-contain transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {t(`segments.${product.key}`)}
                      </h3>
                      <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
                        <span>{t('hubs.viewSolution')}</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <LogosSection />
      <RelatedArticles
        slugs={[
          'como-escolher-software-caprinos-ovinos',
          'planilha-ou-software-gestao-de-rebanho',
          'quanto-leite-produz-uma-cabra-por-dia',
          'indicadores-criador-cabra-leiteira',
        ]}
        locale={locale}
      />
      <LandingCTA segmentSlug="caprinos-corte" />
    </>
  );
}
