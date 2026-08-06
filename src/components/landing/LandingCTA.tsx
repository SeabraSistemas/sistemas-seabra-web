'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
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
    <section className="py-24 md:py-32 bg-primary">
      <div className="container-tight">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          {/* Icon */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 border border-white/20">
            <ArrowUpRight className="h-8 w-8 text-white" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="heading-1 text-white">
              {t('title')}
            </h2>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* CTA */}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 text-base gap-3 bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t('button')}
            </Button>
          </a>

          {/* Trust text */}
          <p className="text-sm text-blue-200">
            Sem compromisso. Resposta em até 24h.
          </p>
        </div>
      </div>
    </section>
  );
}
