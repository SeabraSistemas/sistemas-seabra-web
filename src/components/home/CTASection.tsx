'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function CTASection() {
  const t = useTranslations('ctaSection');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale });
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-14 md:py-16 bg-primary" ref={ref}>
      <div className="container-tight">
        <div className={`max-w-3xl mx-auto text-center space-y-8 scroll-fade-up ${isVisible ? 'visible' : ''}`}>
          {/* Content */}
          <div className="space-y-6">
            <h2 className="heading-1 text-white">
              {t('title')}
            </h2>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-base gap-3 bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t('cta')}
              </Button>
            </a>
          </div>

          {/* Trust text */}
          <p className="text-sm text-blue-200">
            Sem compromisso. Resposta em até 30 minutos.
          </p>
        </div>
      </div>
    </section>
  );
}
