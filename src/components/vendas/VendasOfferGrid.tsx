'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Stethoscope, Cpu } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const offers = [
  { key: 'consultoria', href: '/vendas/consultoria', icon: Stethoscope, iconBg: 'bg-secondary', iconText: 'text-foreground', border: 'hover:border-input' },
  { key: 'produtos', href: '/vendas/produtos', icon: Cpu, iconBg: 'bg-secondary', iconText: 'text-foreground', border: 'hover:border-input' },
] as const;

export function VendasOfferGrid() {
  const t = useTranslations('vendas.offerGrid');

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {offers.map((o) => {
            const Icon = o.icon;
            return (
              <Link key={o.key} href={o.href} className="group">
                <Card
                  className={cn(
                    'h-full border-border bg-card transition-all duration-300 hover:shadow-xl ',
                    o.border
                  )}
                >
                  <CardContent className="p-8 flex flex-col h-full min-h-[220px]">
                    <div className={cn('mb-6 inline-flex w-fit rounded-2xl p-3', o.iconBg)}>
                      <Icon className={cn('h-8 w-8', o.iconText)} />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {t(`${o.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">{t(`${o.key}.desc`)}</p>
                    <div className="mt-auto flex items-center gap-2 text-sm font-medium text-primary">
                      <span>{t(`${o.key}.cta`)}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
