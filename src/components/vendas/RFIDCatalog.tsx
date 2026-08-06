'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import {
  rfidProducts,
  rfidCategories,
  unitPriceForQty,
  type RFIDProduct,
} from '@/data/rfid-products';
import { useCart } from './cart/CartContext';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ProductCard({ product }: { product: RFIDProduct }) {
  const t = useTranslations('vendas.produtos');
  const { add } = useCart();
  const minQty = product.minQty ?? 1;
  const [qty, setQty] = useState(minQty);

  const name = t(`items.${product.slug}.name`);
  const tiered = !!product.priceTiers?.length;
  const step = tiered ? 10 : 1;
  const unit = tiered
    ? unitPriceForQty(product.priceTiers as NonNullable<typeof product.priceTiers>, qty)
    : product.priceBRL ?? 0;
  const lineTotal = unit * qty;

  return (
    <Card className="border-border bg-card h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="relative aspect-square rounded-xl overflow-hidden border border-border bg-card mb-4">
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-contain p-4"
          />
        </div>

        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {t(`items.${product.slug}.desc`)}
        </p>

        <ul className="space-y-1.5 text-xs mb-4">
          {product.specs.map((s, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-muted-foreground">{t(`specLabels.${s.labelKey}`)}</span>
              <span className="text-foreground text-right">{s.value}</span>
            </li>
          ))}
        </ul>

        {tiered && product.priceTiers && (
          <div className="rounded-lg border border-border overflow-hidden mb-4">
            <div className="bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex justify-between">
              <span>{t('priceTableTitle')}</span>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {product.priceTiers.map((tier, i) => {
                  const next = product.priceTiers![i + 1];
                  const active = qty >= tier.minQty && (!next || qty < next.minQty);
                  return (
                    <tr key={i} className={active ? 'bg-primary/5' : ''}>
                      <td className={`px-3 py-1 ${active ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {tier.minQty}+
                      </td>
                      <td className={`px-3 py-1 text-right ${active ? 'font-semibold text-primary' : 'text-foreground'}`}>
                        {formatBRL(tier.unitBRL)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-foreground">{formatBRL(unit)}</span>
              <span className="text-xs text-muted-foreground ml-1">{t('perUnit')}</span>
            </div>
            {qty > 1 && <span className="text-sm text-muted-foreground">{formatBRL(lineTotal)}</span>}
          </div>

          {tiered && (
            <p className="text-[11px] text-muted-foreground">{t('minQtyNote', { min: minQty })}</p>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-border shrink-0">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQty((q) => Math.max(minQty, q - step))}
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                min={minQty}
                value={qty}
                onChange={(e) => setQty(Math.max(minQty, Number(e.target.value) || minQty))}
                className="w-12 text-center bg-transparent text-sm text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="+"
                onClick={() => setQty((q) => q + step)}
                className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              onClick={() =>
                add(
                  {
                    slug: product.slug,
                    name,
                    flatPriceBRL: product.priceBRL,
                    tiers: product.priceTiers ?? null,
                    minQty,
                  },
                  qty
                )
              }
              className="flex-1 rounded-full gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {t('addToCart')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RFIDCatalog() {
  const t = useTranslations('vendas.produtos');

  return (
    <section className="section-padding bg-muted border-t border-border">
      <div className="container-wide space-y-14">
        {rfidCategories.map((category) => {
          const products = rfidProducts.filter((p) => p.category === category);
          if (products.length === 0) return null;
          return (
            <div key={category}>
              <h2 className="heading-3 text-foreground mb-6">{t(`categories.${category}`)}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
