'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Stethoscope } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

const stats = ['years', 'reach', 'count'] as const;

export function ConsultoriaHero() {
  const t = useTranslations('vendas.consultoria');
  const locale = useLocale() as Locale;
  const whatsappUrl = buildWhatsAppUrl({ locale, service: 'consultoria' });

  return (
    <section className="relative pt-32 pb-16 overflow-hidden ">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container-tight relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
          <Stethoscope className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">{t('hero.badge')}</span>
        </div>
        <h1 className="heading-display text-foreground max-w-3xl mx-auto">{t('hero.title')}</h1>
        <p className="body-large max-w-2xl mx-auto text-muted-foreground">{t('hero.subtitle')}</p>
        <div className="pt-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button
              size="lg"
              className="rounded-full px-8 h-14 text-base gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/30 transition-all duration-300"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t('hero.cta')}
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto pt-8 items-stretch">
          {stats.map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-border bg-card p-4 min-h-[132px] flex flex-col items-center justify-center text-center"
            >
              <p className="text-base sm:text-lg font-bold text-foreground leading-snug text-balance">
                {t(`stats.${s}`)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 text-balance">
                {t(`stats.${s}Label`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
