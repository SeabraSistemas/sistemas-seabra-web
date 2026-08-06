'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';

export function CTASection() {
  const t = useTranslations('ctaSection');
  const locale = useLocale() as Locale;

  const whatsappUrl = buildWhatsAppUrl({ locale });
  const { ref, isVisible } = useScrollAnimation();

  return (
    // Era uma faixa inteira em bg-primary com texto branco. Com o ocre no
    // lugar do azul, uma faixa cheia dessa cor dominaria a página — e o
    // acento só deve aparecer umas duas vezes por tela. A ênfase agora vem
    // da superfície e do espaço; a única cor forte é o botão.
    <section className="py-20 md:py-24 band" ref={ref}>
      <div className="container-tight">
        <div
          className={`max-w-2xl mx-auto text-center space-y-8 scroll-fade-up ${
            isVisible ? 'visible' : ''
          }`}
        >
          <div className="space-y-5">
            <h2 className="heading-1">{t('title')}</h2>
            <p className="body-large max-w-xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="flex justify-center">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-base gap-3 bg-[#25D366] text-background hover:bg-[#20BD5A] transition-colors"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t('cta')}
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">{t('trust')}</p>
        </div>
      </div>
    </section>
  );
}
