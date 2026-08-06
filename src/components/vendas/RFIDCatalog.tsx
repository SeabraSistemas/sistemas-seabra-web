'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { rfidProducts, unitPriceForQty, type RFIDProduct } from '@/data/rfid-products';
import { useCart } from './cart/CartContext';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * `wide`: o microchip é o único produto com tabela de faixa de preço — isso
 * o deixa bem mais alto que os leitores. Numa grade comum ele estica a
 * linha inteira, deixando espaço vazio embaixo dos cards de leitor ao lado.
 * Em vez de conviver na mesma grade, ele vira um card largo horizontal
 * abaixo dos leitores: grande de propósito, não alto por acidente.
 */
function ProductCard({ product, wide = false }: { product: RFIDProduct; wide?: boolean }) {
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

  const image = (
    <div
      className={
        wide
          ? 'relative w-full md:w-64 aspect-square shrink-0 rounded-xl overflow-hidden border border-border bg-card'
          : 'relative aspect-square rounded-xl overflow-hidden border border-border bg-card mb-4'
      }
    >
      <Image
        src={product.image}
        alt={name}
        fill
        sizes={wide ? '(max-width: 768px) 100vw, 256px' : '(max-width: 640px) 100vw, 300px'}
        className="object-contain p-4"
      />
    </div>
  );

  const specs = (
    <ul className="space-y-1.5 text-xs mb-4">
      {product.specs.map((s, i) => (
        <li key={i} className="flex justify-between gap-3">
          <span className="text-muted-foreground">{t(`specLabels.${s.labelKey}`)}</span>
          <span className="text-foreground text-right">{s.value}</span>
        </li>
      ))}
    </ul>
  );

  const priceTable = tiered && product.priceTiers && (
    <div className="rounded-lg border border-border overflow-hidden mb-4">
      <div className="bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {t('priceTableTitle')}
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
  );

  const actions = (
    <div className={wide ? 'space-y-3 md:w-64 shrink-0' : 'mt-auto space-y-3'}>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xl font-bold text-foreground">{formatBRL(unit)}</span>
          <span className="text-xs text-muted-foreground ml-1">{t('perUnit')}</span>
        </div>
        {qty > 1 && <span className="text-sm text-muted-foreground">{formatBRL(lineTotal)}</span>}
      </div>

      {tiered && <p className="text-[11px] text-muted-foreground">{t('minQtyNote', { min: minQty })}</p>}

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
  );

  if (wide) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          {image}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{t(`items.${product.slug}.desc`)}</p>
            <div className="grid sm:grid-cols-2 gap-x-8">
              {specs}
              {priceTable}
            </div>
          </div>
          {actions}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {image}
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">{t(`items.${product.slug}.desc`)}</p>
        {specs}
        {priceTable}
        {actions}
      </CardContent>
    </Card>
  );
}

export function RFIDCatalog() {
  const microchip = rfidProducts.find((p) => p.priceTiers?.length);
  const readers = rfidProducts.filter((p) => p !== microchip);

  return (
    <section className="section-padding bg-muted border-t border-border">
      <div className="container-wide space-y-6">
        {/* Os 3 leitores têm altura parecida entre si — ficam juntos numa
            grade pareada. O microchip, bem mais alto por causa da tabela de
            faixas de preço, vem depois como card largo (ver `wide` acima). */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {readers.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {microchip && <ProductCard product={microchip} wide />}
      </div>
    </section>
  );
}
