'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { buildWhatsAppUrl, getUTMFromUrl, type UTMParams } from '@/lib/whatsapp';
import { type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppButtonProps {
  segment?: string;
  className?: string;
}

export function WhatsAppButton({ segment, className }: WhatsAppButtonProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [utm, setUtm] = useState<UTMParams>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setUtm(getUTMFromUrl());

    // Delay appearance for smoother UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // A vitrine /criadores tem CTA proprio (contato do criador); o botao flutuante
  // da Seabra por cima quebraria o objetivo comercial da tela.
  if (pathname.startsWith('/criadores')) return null;

  const whatsappUrl = buildWhatsAppUrl({ locale, segment, utm });

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'flex items-center justify-center',
        'h-16 w-16 rounded-2xl',
        'bg-[#25D366]',
        'text-white',
        'shadow-2xl shadow-[#25D366]/30',
        'transition-all duration-500 ease-out',
        'hover:scale-110 hover:shadow-[#25D366]/50',
        'hover:rotate-[5deg]',
        // Entrance animation
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0',
        // Pulse ring effect
        'before:absolute before:inset-0 before:rounded-2xl',
        'before:bg-[#25D366] before:animate-ping before:opacity-20',
        className
      )}
      aria-label="WhatsApp"
    >
      <WhatsAppIcon className="h-8 w-8 relative z-10" />

      {/* Tooltip */}
      <span
        className={cn(
          'absolute right-full mr-4 px-4 py-2',
          'bg-white text-black text-sm font-medium',
          'rounded-xl shadow-xl',
          'whitespace-nowrap',
          'opacity-0 pointer-events-none',
          'group-hover:opacity-100',
          'transition-all duration-300',
          'hidden lg:block'
        )}
      >
        Fale conosco
      </span>
    </a>
  );
}
