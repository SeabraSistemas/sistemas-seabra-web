'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Layers, Plus } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

const tiers = [
  {
    key: 'tier1',
    featureCount: 9,
    includesPlan: null,
    highlighted: false,
  },
  {
    key: 'tier2',
    featureCount: 9,
    includesPlan: 'Landing Page',
    highlighted: true,
  },
  {
    key: 'tier3',
    featureCount: 11,
    includesPlan: 'E-commerce',
    highlighted: false,
  },
] as const;

export function ServiceTiers() {
  const t = useTranslations('servicos.tiers');
  const locale = useLocale() as Locale;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="planos" className="section-padding bg-muted" ref={ref}>
      <div className="container-wide">
        {/* Section Header */}
        <div
          className={`text-center space-y-4 mb-16 scroll-fade-up ${isVisible ? 'visible' : ''}`}
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-border bg-card backdrop-blur-sm text-foreground font-medium"
          >
            <Layers className="h-3.5 w-3.5 mr-2 text-primary" />
            {t('badge')}
          </Badge>
          <h2 className="heading-2 text-foreground">{t('title')}</h2>
          <p className="body-large max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Tier Cards */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {tiers.map((tier, index) => {
            const whatsappUrl = buildWhatsAppUrl({
              locale,
              service: tier.key,
            });

            return (
              <div
                key={tier.key}
                className={cn(
                  'group relative flex flex-col rounded-2xl border bg-card p-8 transition-colors',
                  tier.highlighted
                    ? 'border-primary/60'
                    : 'border-border hover:border-input',
                  `scroll-fade-up ${isVisible ? 'visible' : ''}`
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Popular Badge */}
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        'px-4 py-1 rounded-full text-xs font-semibold',
                        'bg-primary text-primary-foreground border-transparent'
                      )}
                    >
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                {/* Icon + Title */}
                <div className="space-y-4 mb-6">
                  <span className="font-display text-3xl text-muted-foreground/70 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {t(`${tier.key}.name`)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`${tier.key}.description`)}
                    </p>
                  </div>

                  {/* Includes Previous */}
                  {tier.includesPlan && (
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground font-normal"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('includesPrevious', { plan: tier.includesPlan })}
                    </Badge>
                  )}
                </div>

                <Separator className="mb-6" />

                {/* Feature List */}
                <ul className="space-y-4 flex-1">
                  {Array.from({ length: tier.featureCount }, (_, i) => {
                    const featureKey = `${tier.key}.f${i + 1}`;
                    const descKey = `${tier.key}.f${i + 1}desc`;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-1 text-primary" />
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {t(featureKey)}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {t(descKey)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA Button */}
                <div className="mt-8">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      size="lg"
                      className={cn(
                        'w-full rounded-full h-12 text-sm gap-2',
                        'bg-[#25D366] text-background hover:bg-[#20BD5A]',
                        'shadow-lg hover:shadow-xl',
                        'transition-all duration-300 '
                      )}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      {t('cta')}
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
