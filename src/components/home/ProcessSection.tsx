'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

/**
 * As quatro etapas diferenciadas por NUMERAÇÃO, não por cor.
 *
 * Antes cada etapa tinha sua cor (azul, verde, roxo, âmbar) e um ícone Lucide
 * genérico dentro de um círculo colorido. Cor decorativa atribuída por índice é
 * a assinatura mais reconhecível de layout gerado — e brigava de frente com a
 * paleta quase monocromática. A hierarquia agora vem do número em serifa, do
 * peso tipográfico e do espaço.
 */
const steps = ['step1', 'step2', 'step3', 'step4'] as const;

export function ProcessSection() {
  const t = useTranslations('process');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding" ref={ref}>
      <div className="container-wide">
        <div
          className={`max-w-2xl mb-14 space-y-4 scroll-fade-up ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2">{t('title')}</h2>
          <p className="body-large">{t('subtitle')}</p>
        </div>

        <ol
          className={`grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 scroll-fade-up scroll-fade-up-delay-2 ${
            isVisible ? 'visible' : ''
          }`}
        >
          {steps.map((step, index) => (
            <li key={step} className="border-t border-border pt-5">
              <span className="font-display text-3xl text-muted-foreground/70 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg mt-3 mb-2">{t(`${step}.title`)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`${step}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
