'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Monitor,
  ShoppingCart,
  Store,
  Check,
  Layers,
  Plus,
} from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

const tiers = [
  {
    key: 'tier1',
    icon: Monitor,
    color: 'blue',
    featureCount: 9,
    includesPlan: null,
    highlighted: false,
  },
  {
    key: 'tier2',
    icon: ShoppingCart,
    color: 'emerald',
    featureCount: 9,
    includesPlan: 'Landing Page',
    highlighted: true,
  },
  {
    key: 'tier3',
    icon: Store,
    color: 'purple',
    featureCount: 11,
    includesPlan: 'E-commerce',
    highlighted: false,
  },
] as const;

const colorClasses: Record<
  string,
  {
    iconBg: string;
    iconText: string;
    hoverBorder: string;
    checkBg: string;
    checkText: string;
    glowShadow: string;
    ring: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  blue: {
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-500',
    hoverBorder: 'group-hover:border-blue-500/30',
    checkBg: 'bg-blue-500/10',
    checkText: 'text-blue-500',
    glowShadow: 'group-hover:shadow-blue-500/10',
    ring: '',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-600',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-500',
    hoverBorder: 'group-hover:border-emerald-500/30',
    checkBg: 'bg-emerald-500/10',
    checkText: 'text-emerald-500',
    glowShadow: 'group-hover:shadow-emerald-500/10',
    ring: 'ring-2 ring-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-600',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-500',
    hoverBorder: 'group-hover:border-purple-500/30',
    checkBg: 'bg-purple-500/10',
    checkText: 'text-purple-500',
    glowShadow: 'group-hover:shadow-purple-500/10',
    ring: '',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-600',
  },
};

export function ServiceTiers() {
  const t = useTranslations('servicos.tiers');
  const locale = useLocale() as Locale;
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="planos" className="section-padding bg-gray-50/50" ref={ref}>
      <div className="container-wide">
        {/* Section Header */}
        <div
          className={`text-center space-y-4 mb-16 scroll-fade-up ${isVisible ? 'visible' : ''}`}
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-gray-300 bg-white backdrop-blur-sm text-gray-700 font-medium"
          >
            <Layers className="h-3.5 w-3.5 mr-2 text-primary" />
            {t('badge')}
          </Badge>
          <h2 className="heading-2 text-gray-900">{t('title')}</h2>
          <p className="body-large max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Tier Cards */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {tiers.map((tier, index) => {
            const colors = colorClasses[tier.color];
            const Icon = tier.icon;
            const whatsappUrl = buildWhatsAppUrl({
              locale,
              service: tier.key,
            });

            return (
              <div
                key={tier.key}
                className={cn(
                  'group relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300',
                  'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl',
                  colors.hoverBorder,
                  colors.glowShadow,
                  tier.highlighted
                    ? `${colors.ring} border-emerald-200 shadow-lg`
                    : 'border-gray-200 shadow-sm',
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
                        colors.badgeBg,
                        colors.badgeText,
                        'border-emerald-200'
                      )}
                    >
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                {/* Icon + Title */}
                <div className="space-y-4 mb-6">
                  <div
                    className={cn(
                      'h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                      colors.iconBg,
                      'group-hover:scale-110 group-hover:rotate-3'
                    )}
                  >
                    <Icon className={cn('h-7 w-7', colors.iconText)} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t(`${tier.key}.name`)}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t(`${tier.key}.description`)}
                    </p>
                  </div>

                  {/* Includes Previous */}
                  {tier.includesPlan && (
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-300 text-gray-500 font-normal"
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
                        <div
                          className={cn(
                            'h-5 w-5 shrink-0 rounded-full flex items-center justify-center mt-0.5',
                            colors.checkBg
                          )}
                        >
                          <Check
                            className={cn('h-3 w-3', colors.checkText)}
                          />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {t(featureKey)}
                          </span>
                          <span className="text-xs text-gray-500 block mt-0.5">
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
                        'bg-[#25D366] text-white hover:bg-[#20BD5A]',
                        'shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30',
                        'transition-all duration-300 hover:-translate-y-0.5'
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
