'use client';

import { useTranslations } from 'next-intl';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
              className={cn(
                'group h-full border-border bg-card',
                'transition-all duration-300 ease-out',
                'hover:shadow-md hover:border-border ',
                'fade-in-up opacity-0'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 flex items-start gap-4">
                {/* Icon container with enhanced effects */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'relative h-12 w-12 rounded-2xl flex items-center justify-center',
                      'transition-all duration-300',
                      'bg-secondary',
                      'group-hover:bg-primary/20',
                      'group- group-hover:rotate-3'
                    )}
                  >

                    <Check
                      className={cn(
                        'h-6 w-6 relative z-10 transition-transform duration-300',
                        'text-primary',
                        'group-'
                      )}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {benefit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
