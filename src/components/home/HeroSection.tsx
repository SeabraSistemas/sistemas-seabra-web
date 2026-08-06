'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, TrendingUp, Award, Code } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale });
  const { ref, isVisible } = useScrollAnimation(0.1);

  const bullets = [t('bullet1'), t('bullet2'), t('bullet3')];

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 bg-gradient-to-b from-white via-white to-gray-50" ref={ref}>
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text Content */}
          <div className={`space-y-6 scroll-fade-up ${isVisible ? 'visible' : ''}`}>
            <h1 className="heading-1 text-gray-900">
              {t('headline')}
            </h1>

            <p className="body-large max-w-lg">
              {t('subheadline')}
            </p>

            <ul className="space-y-3 pt-2">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-gray-600 text-sm">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
                <Button className="rounded-full px-8 h-14 text-base gap-2 w-full sm:w-auto bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 hover:-translate-y-0.5">
                  <WhatsAppIcon className="h-5 w-5" />
                  {t('cta')}
                </Button>
              </a>
              <p className="text-xs text-gray-500 mt-3">{t('responseTime')}</p>
            </div>
          </div>

          {/* Stats Cards (esconde no celular para acelerar above-the-fold) */}
          <div className={`relative hidden lg:flex justify-center lg:justify-end scroll-fade-up scroll-fade-up-delay-2 ${isVisible ? 'visible' : ''}`}>
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div className="glass-card p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-gray-900">+30%</p>
                    <p className="text-sm text-gray-500">Produtividade média</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-gray-900">100%</p>
                    <p className="text-sm text-gray-500">Funciona offline</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-gray-900">&gt;15 anos</p>
                    <p className="text-sm text-gray-500">No mercado de pecuária</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-gray-900">&gt;5 anos</p>
                    <p className="text-sm text-gray-500">Em desenvolvimento de sistemas/web</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
