import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';
import type { Criador } from '@/lib/criadores/types';

/**
 * Botao de contato do criador. Cascata: WhatsApp curado -> e-mail publico ->
 * site -> WhatsApp da Seabra (fallback). NUNCA fica sem botao, nunca botao
 * desabilitado cinza (plano secao 6.1). Sem preco, sem checkout.
 */
export function CriadorContatos({
  criador,
  label,
  className,
}: {
  criador: Pick<Criador, 'whatsapp' | 'email_publico' | 'site_url' | 'criador'>;
  label: string;
  className?: string;
}) {
  const msg = `Olá! Vi ${criador.criador} na vitrine de criadores do Sistema Seabra.`;
  let href: string;
  if (criador.whatsapp) {
    href = `https://wa.me/${criador.whatsapp}?text=${encodeURIComponent(msg)}`;
  } else if (criador.email_publico) {
    href = `mailto:${criador.email_publico}?subject=${encodeURIComponent('Vitrine Sistema Seabra')}`;
  } else if (criador.site_url) {
    href = criador.site_url;
  } else {
    href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  );
}
