'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { BulletDot } from '@/components/shared/BulletDot';

export function Benefits() {
  const t = useTranslations('landing.benefits');

  const benefits = [
    t('benefit1'),
    t('benefit2'),
    t('benefit3'),
    t('benefit4'),
    t('benefit5'),
  ];

  return (
    <section className="section-padding relative overflow-hidden band">

      <div className="container-tight relative">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-4">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Vantagens</span>
          </div>

          <h2 className="heading-2 text-foreground">
            {t('title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className={cn('h-full border-border bg-card', 'fade-in-up opacity-0')}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 flex items-start gap-3">
                <BulletDot className="mt-2" />
                <p className="text-foreground leading-relaxed">{benefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
