'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { FieldPhoto } from '@/components/shared/FieldPhoto';

export function AboutSection() {
  const t = useTranslations('about');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding band" id="about" ref={ref}>
      <div className="container-wide">
        <div
          className={`grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-16 items-start scroll-fade-up ${
            isVisible ? 'visible' : ''
          }`}
        >
          {/* Foto substitui os cartões 2011 / 100% / 24h que existiam aqui.
              Ano de fundação e promessa de suporte pertencem ao texto, não a
              um painel de números — que é o formato que lê como inventado. */}
          <FieldPhoto
            slot="sobre"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="aspect-[4/5] w-full rounded-2xl min-h-[320px]"
          />

          <div className="space-y-6">
            <h2 className="heading-2">{t('title')}</h2>

            <div className="space-y-5">
              <p className="body-large">{t('p1')}</p>
              <p className="body-large">{t('p2')}</p>
              <p className="body-large">{t('p3')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
