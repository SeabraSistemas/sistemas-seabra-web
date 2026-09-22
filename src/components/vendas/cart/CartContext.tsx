'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { unitPriceForQty, type PriceTier } from '@/data/rfid-products';

export interface CartItem {
  slug: string;
  name: string;
  qty: number;
  /** preço fixo por unidade (leitores); null quando usa tiers */
  flatPriceBRL: number | null;
  /** faixas de preço por quantidade (microchip); null quando flat */
  tiers: PriceTier[] | null;
  /** quantidade mínima do produto */
  minQty: number;
  /** incremento permitido de quantidade (ex.: microchip só vende de 100 em 100) */
  qtyStep: number;
}

/** Preço unitário do item considerando a quantidade atual (faixa de volume). */
export function unitPrice(item: CartItem): number {
  if (item.tiers && item.tiers.length) return unitPriceForQty(item.tiers, item.qty);
  return item.flatPriceBRL ?? 0;
}

export function lineTotal(item: CartItem): number {
  return unitPrice(item) * item.qty;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'seabra-vendas-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // storage indisponível
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota/privado
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      if (existing) {
        return prev.map((i) => (i.slug === item.slug ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty: Math.max(qty, item.minQty) }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.slug !== slug) return [i];
        if (qty < i.minQty) {
          // abaixo do mínimo: remove se cair abaixo do mínimo (passo no botão -)
          return qty <= 0 ? [] : [{ ...i, qty: i.minQty }];
        }
        return [{ ...i, qty }];
      })
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => acc + lineTotal(i), 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>');
  return ctx;
}
