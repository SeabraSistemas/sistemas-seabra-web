'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

interface LandingProofsProps {
  segmentSlug: string;
}

export function LandingProofs({ segmentSlug }: LandingProofsProps) {
  const t = useTranslations('proofs');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({
    locale,
    segment: segmentSlug,
    utm: { utm_source: 'site', utm_campaign: 'demo', utm_content: segmentSlug },
  });

  return (
    <section className="section-padding band">
      <div className="container-tight">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="heading-2 text-foreground">{t('title')}</h2>
            <p className="body-large text-muted-foreground">{t('ctaMessage')}</p>
          </div>

          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button className="rounded-full px-8 h-14 text-base gap-2.5 bg-[#25D366] text-background hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300 ">
              <WhatsAppIcon className="h-5 w-5" />
              {t('ctaButton')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>

          <p className="text-xs text-muted-foreground">{t('ctaNote')}</p>
        </div>
      </div>
    </section>
  );
}
