'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

export function VendasHero() {
  const t = useTranslations('vendas.hero');

  return (
    <section className="relative pt-32 pb-16 overflow-hidden ">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container-tight relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
          <ShoppingBag className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{t('badge')}</span>
        </div>
        <h1 className="heading-display text-foreground max-w-3xl mx-auto">{t('title')}</h1>
        <p className="body-large max-w-2xl mx-auto text-muted-foreground">{t('subtitle')}</p>
      </div>
    </section>
  );
}
