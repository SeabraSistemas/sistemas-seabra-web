'use client';

import { useTranslations } from 'next-intl';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  const t = useTranslations('landing.faq');

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];

  return (
    <section className="section-padding relative overflow-hidden">

      <div className="container-tight relative">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Dúvidas Frequentes</span>
          </div>

          <h2 className="heading-2 text-foreground">
            {t('title')}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group border border-border rounded-2xl px-6 bg-card shadow-sm data-[state=open]:bg-card/80 data-[state=open]:border-primary/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary py-5 hover:no-underline transition-colors duration-300">
                  <span className="pr-4 font-semibold">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
