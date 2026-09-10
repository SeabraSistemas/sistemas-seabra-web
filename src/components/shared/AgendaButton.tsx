'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { CalendarClock } from 'lucide-react';
import { buildAgendaUrl, isAgendaEnabled } from '@/lib/agenda';
import { type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Botão flutuante da agenda, empilhado ACIMA do WhatsApp.
 *
 * O do WhatsApp é `bottom-6` com `h-16` (1.5rem + 4rem = 5.5rem de topo).
 * Este senta em 6.25rem para deixar 0.75rem de respiro entre os dois — se
 * mexer no tamanho de um, revisar o offset do outro.
 *
 * Ícone: calendário com relógio (CalendarClock), a convenção de "agendar
 * horário" que Calendly, Cal.com e o próprio Google usam.
 *
 * Sem estado nem efeito de propósito: o fade-in é CSS (tw-animate-css) e a
 * origem do clique é fixa em `utm_content=botao-flutuante` — de qual página
 * o visitante saiu já vem no evento de clique de saída do GA4.
 */
export function AgendaButton() {
  const locale = useLocale() as Locale;
  const t = useTranslations('agenda');
  const pathname = usePathname();

  // Mesma regra do WhatsAppButton: a vitrine /criadores tem CTA próprio.
  if (pathname.startsWith('/criadores')) return null;
  if (!isAgendaEnabled()) return null;

  const agendaUrl = buildAgendaUrl({
    locale,
    utm: { utm_content: 'botao-flutuante' },
  });

  return (
    <a
      href={agendaUrl}
      target="_blank"
      rel="noopener noreferrer"
      // Entra depois do WhatsApp (1000ms) para os dois não pularem juntos.
      style={{ animationDelay: '1.3s', animationFillMode: 'both' }}
      className={cn(
        'group fixed bottom-[6.25rem] right-6 z-50',
        'flex items-center justify-center',
        'h-16 w-16 rounded-2xl',
        'bg-primary text-primary-foreground',
        'border border-primary/40 shadow-lg',
        'animate-in fade-in duration-300'
      )}
      aria-label={t('cta')}
    >
      <CalendarClock className="h-7 w-7 relative z-10" strokeWidth={1.8} />

      {/* Tooltip */}
      <span
        className={cn(
          'absolute right-full mr-4 px-4 py-2',
          'bg-popover text-popover-foreground border border-border text-sm font-medium',
          'rounded-xl whitespace-nowrap',
          'opacity-0 pointer-events-none',
          'group-hover:opacity-100',
          'transition-all duration-300',
          'hidden lg:block'
        )}
      >
        {t('tooltip')}
      </span>
    </a>
  );
}
