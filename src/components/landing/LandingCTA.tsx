'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

interface LandingCTAProps {
  segmentSlug: string;
}

export function LandingCTA({ segmentSlug }: LandingCTAProps) {
  const t = useTranslations('landing.cta');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale, segment: segmentSlug });

  return (
    // Era uma faixa inteira em bg-primary — com o ocre no lugar do azul,
    // uma seção cheia dessa cor domina a página (o acento deve aparecer
    // umas duas vezes por tela). Mesmo tratamento do CTA da home.
    <section className="py-24 md:py-32 band">
      <div className="container-tight">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-5">
            <h2 className="heading-1">{t('title')}</h2>
            <p className="body-large max-w-xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="flex justify-center">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full px-10 h-14 text-base gap-3 bg-wa text-wa-ink hover:bg-wa-hover transition-colors">
                <WhatsAppIcon className="h-5 w-5" />
                {t('button')}
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">{t('trust')}</p>
        </div>
      </div>
    </section>
  );
}
