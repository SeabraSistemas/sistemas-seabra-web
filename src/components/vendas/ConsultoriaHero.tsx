'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

const stats = ['years', 'reach', 'count'] as const;

export function ConsultoriaHero() {
  const t = useTranslations('vendas.consultoria');
  const locale = useLocale() as Locale;
  const whatsappUrl = buildWhatsAppUrl({ locale, service: 'consultoria' });

  return (
    <section className="relative pt-32 pb-16 overflow-hidden ">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container-tight relative z-10 text-center space-y-6">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary border border-border">
          <span className="text-sm font-medium text-foreground">{t('hero.badge')}</span>
        </div>
        <h1 className="heading-display text-foreground max-w-3xl mx-auto">{t('hero.title')}</h1>
        <p className="body-large max-w-2xl mx-auto text-muted-foreground">{t('hero.subtitle')}</p>

        {/* Assinatura Seabra Consultoria: a arte tem azul/verde/navy e o
            navy some sobre o fundo escuro do site — a placa clara isola a
            marca em vez de repintá-la. Logo grande e padding enxuto: pouco
            respiro em volta pra marca não se perder num retângulo branco. */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-2xl border border-black/5 bg-[#f4f4f2] px-5 py-3">
            <Image
              src="/images/consultoria/seabra-consultoria.png"
              alt={t('hero.logoAlt')}
              width={1451}
              height={697}
              priority
              className="h-24 sm:h-28 w-auto"
            />
          </div>
        </div>

        <div className="pt-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button
              size="lg"
              className="rounded-full px-8 h-14 text-base gap-2 bg-wa text-wa-ink hover:bg-wa-hover shadow-lg transition-all duration-300"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t('hero.cta')}
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto pt-8 items-stretch">
          {stats.map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-border bg-card p-4 min-h-[132px] flex flex-col items-center justify-center text-center"
            >
              <p className="text-base sm:text-lg font-bold text-foreground leading-snug text-balance">
                {t(`stats.${s}`)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 text-balance">
                {t(`stats.${s}Label`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
