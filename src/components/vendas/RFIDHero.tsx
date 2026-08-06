'use client';

import { useTranslations } from 'next-intl';
import { Cpu } from 'lucide-react';

export function RFIDHero() {
  const t = useTranslations('vendas.produtos');

  return (
    <section className="relative pt-32 pb-12 overflow-hidden ">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container-tight relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border">
          <Cpu className="h-4 w-4 text-foreground" />
          <span className="text-sm font-medium text-foreground">{t('hero.badge')}</span>
        </div>
        <h1 className="heading-display text-foreground max-w-3xl mx-auto">{t('hero.title')}</h1>
        <p className="body-large max-w-2xl mx-auto text-muted-foreground">{t('hero.subtitle')}</p>
      </div>
    </section>
  );
}
