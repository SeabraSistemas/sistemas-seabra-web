'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function VendasCTA() {
  const t = useTranslations('vendas.cta');
  const locale = useLocale() as Locale;
  const whatsappUrl = buildWhatsAppUrl({ locale });

  return (
    <section className="py-14 md:py-16 bg-primary">
      <div className="container-tight">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="heading-1 text-primary-foreground">{t('title')}</h2>
          <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mx-auto">{t('subtitle')}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 text-base gap-3 bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t('button')}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
