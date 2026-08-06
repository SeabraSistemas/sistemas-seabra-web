'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function ServicesCTA() {
  const t = useTranslations('servicos.cta');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale, service: 'geral' });
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 md:py-32" ref={ref}>
      <div className="container-tight">
        <div
          className={`max-w-3xl mx-auto text-center space-y-10 scroll-fade-up ${isVisible ? 'visible' : ''}`}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 ">
            <ArrowUpRight className="h-8 w-8 text-primary" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="heading-1 text-foreground">{t('title')}</h2>
            <p className="body-large max-w-xl mx-auto">{t('subtitle')}</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-base gap-3 bg-[#25D366] text-background hover:bg-[#20BD5A] shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t('button')}
              </Button>
            </a>
          </div>

          {/* Trust text */}
          <p className="text-sm text-muted-foreground">
            Sem compromisso. Resposta em até 24h.
          </p>
        </div>
      </div>
    </section>
  );
}
