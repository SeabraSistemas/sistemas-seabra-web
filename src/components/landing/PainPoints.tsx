'use client';

import { useTranslations } from 'next-intl';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export function PainPoints() {
  const t = useTranslations('landing.pains');

  const pains = [
    t('pain1'),
    t('pain2'),
    t('pain3'),
    t('pain4'),
    t('pain5'),
  ];

  return (
    <section className="section-padding relative overflow-hidden">

      <div className="container-tight relative">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Desafios</span>
          </div>

          <h2 className="heading-2 text-foreground">
            {t('title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pains.map((pain, index) => (
            <Card
              key={index}
              className={cn(
                'group h-full border-border bg-card',
                'transition-all duration-300 ease-out',
                '',
                'hover:shadow-xl',
                'hover:border-destructive/30',
                'group-hover:',
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
                      'bg-destructive/10',
                      'group-hover:bg-destructive/20',
                      'group- group-hover:rotate-3'
                    )}
                  >

                    <X
                      className={cn(
                        'h-6 w-6 relative z-10 transition-transform duration-300',
                        'text-destructive',
                        'group-'
                      )}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {pain}
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
