'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';

export function ServicosHero() {
  const t = useTranslations('servicos.hero');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale, service: 'geral' });

  const handleScrollToPlanos = () => {
    const el = document.getElementById('planos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="container-tight relative z-10 text-center space-y-10">
        {/* Badge */}
        <Badge
          variant="outline"
          className="px-4 py-1.5 rounded-full border-border bg-muted backdrop-blur-sm text-foreground font-medium"
        >
          {t('badge')}
        </Badge>

        {/* Headline */}
        <div className="space-y-6">
          <h1 className="heading-display max-w-4xl mx-auto">
            {t('title')}
          </h1>
          <p className="body-large max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="btn-modern rounded-full px-8 h-14 text-base gap-3"
            >
              {t('cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </a>
          <Button
            variant="outline"
            size="lg"
            className="btn-ghost-modern rounded-full px-8 h-14 text-base"
            onClick={handleScrollToPlanos}
          >
            {t('secondary')}
          </Button>
        </div>
      </div>
    </section>
  );
}
