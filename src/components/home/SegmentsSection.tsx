'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { FieldPhoto } from '@/components/shared/FieldPhoto';
import type { SlotFotoKey } from '@/data/fotos';

/**
 * Os três pilares da empresa como cartões editoriais: imagem dominante,
 * categoria e título. Substituiu o grid antigo de cards iguais com ícone
 * Lucide dentro de quadradinho colorido.
 *
 * A hierarquia é deliberadamente assimétrica — Sistemas ocupa o dobro. Três
 * cartões idênticos lado a lado é justamente a assinatura de layout gerado.
 */
const pillars = [
  { key: 'systems', href: '/pequenos-ruminantes', slot: 'sistemas', featured: true },
  { key: 'services', href: '/vendas/consultoria', slot: 'servicos', featured: false },
  { key: 'products', href: '/vendas/produtos', slot: 'produtos', featured: false },
] as const satisfies ReadonlyArray<{
  key: string;
  href: string;
  slot: SlotFotoKey;
  featured: boolean;
}>;

export function SegmentsSection() {
  const t = useTranslations('pillars');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="section-padding" id="segments" ref={ref}>
      <div className="container-wide">
        <div
          className={`max-w-2xl mb-12 space-y-4 scroll-fade-up ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="heading-2">{t('title')}</h2>
          <p className="body-large">{t('subtitle')}</p>
        </div>

        <div
          className={`grid gap-4 md:grid-cols-2 scroll-fade-up scroll-fade-up-delay-2 ${
            isVisible ? 'visible' : ''
          }`}
        >
          {pillars.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border',
                'transition-colors hover:border-input',
                pillar.featured && 'md:col-span-2'
              )}
            >
              <FieldPhoto
                slot={pillar.slot}
                sizes={
                  pillar.featured
                    ? '(max-width: 768px) 100vw, 1152px'
                    : '(max-width: 768px) 100vw, 576px'
                }
                className={cn(
                  'w-full',
                  pillar.featured ? 'aspect-[16/9] min-h-[280px]' : 'aspect-[4/3] min-h-[260px]'
                )}
              />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground mb-2">
                  {t(`${pillar.key}.eyebrow`)}
                </p>
                <h3
                  className={cn(
                    'text-foreground mb-2',
                    pillar.featured ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                  )}
                >
                  {t(`${pillar.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  {t(`${pillar.key}.desc`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground">
                  {t(`${pillar.key}.cta`)}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
