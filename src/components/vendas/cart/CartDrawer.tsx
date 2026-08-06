'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { type Locale } from '@/i18n/config';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { useCart, unitPrice, lineTotal } from './CartContext';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartDrawer() {
  const t = useTranslations('vendas.produtos.cart');
  const tp = useTranslations('vendas.produtos');
  const locale = useLocale() as Locale;
  const { items, setQty, remove, clear, count, subtotal } = useCart();

  const checkout = () => {
    const url = buildWhatsAppOrderUrl({
      locale,
      items: items.map((i) => ({ name: i.name, qty: i.qty, unitPriceBRL: unitPrice(i) })),
    });
    window.open(url, '_blank');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 h-14 px-5 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-medium">{t('open')}</span>
          {count > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-primary text-xs font-bold">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-white border-gray-200 p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b border-gray-200">
          <SheetTitle className="text-gray-900">{t('title')}</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-16 text-center px-6">{t('empty')}</p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((i) => (
                <div key={i.slug} className="flex gap-3 items-start border-b border-gray-100 pb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{i.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatBRL(unitPrice(i))} {tp('perUnit')}
                    </p>
                    <div className="flex items-center rounded-full border border-gray-200 w-fit mt-2">
                      <button
                        type="button"
                        aria-label="-"
                        onClick={() => setQty(i.slug, i.qty - (i.tiers ? 10 : 1))}
                        className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm text-gray-900">{i.qty}</span>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() => setQty(i.slug, i.qty + (i.tiers ? 10 : 1))}
                        className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{formatBRL(lineTotal(i))}</p>
                    <button
                      type="button"
                      aria-label={t('remove')}
                      onClick={() => remove(i.slug)}
                      className="text-gray-400 hover:text-red-500 mt-2 inline-flex"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between text-gray-900">
                <span>{t('subtotal')}</span>
                <span className="font-semibold">{formatBRL(subtotal)}</span>
              </div>
              <Button
                onClick={checkout}
                className="w-full rounded-full h-12 gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-lg shadow-[#25D366]/30"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t('checkout')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">{t('note')}</p>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-gray-900 w-full"
              >
                {t('clear')}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
