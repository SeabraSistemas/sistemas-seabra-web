'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { FieldPhoto } from '@/components/shared/FieldPhoto';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale });
  const { ref, isVisible } = useScrollAnimation(0.1);

  const bullets = [t('bullet1'), t('bullet2'), t('bullet3')];

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24" ref={ref}>
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16 items-center">
          <div className={`space-y-7 scroll-fade-up ${isVisible ? 'visible' : ''}`}>
            <h1 className="heading-display">{t('headline')}</h1>

            <p className="body-large max-w-lg">{t('subheadline')}</p>

            <ul className="space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <Check className="h-4 w-4 shrink-0 mt-1 text-primary" />
                  <span className="text-sm text-muted-foreground">{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto"
              >
                {/* Verde de WhatsApp (--wa), texto branco: reconhecimento de marca
                    priorizado sobre contraste — ver nota em globals.css. */}
                <Button className="rounded-full px-8 h-13 text-base gap-2 w-full sm:w-auto bg-wa text-wa-ink hover:bg-wa-hover transition-colors">
                  <WhatsAppIcon className="h-5 w-5" />
                  {t('cta')}
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-3">{t('responseTime')}</p>
            </div>
          </div>

          {/* Antes havia aqui um painel com +30% / 100% / >15 anos. Número
              redondo em card com ícone é o padrão que lê como inventado —
              e nenhum daqueles era rastreável. No lugar entra a única prova
              que não se falsifica: a operação real. */}
          <div
            className={`scroll-fade-up scroll-fade-up-delay-2 ${isVisible ? 'visible' : ''}`}
          >
            <FieldPhoto
              slot="hero"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
              className="aspect-[4/5] w-full rounded-2xl min-h-[320px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
