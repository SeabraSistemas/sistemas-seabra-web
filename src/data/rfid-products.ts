// Catálogo de microchips + leitores RFID vendidos em /vendas/produtos.
// Preços reais (valores PJ). Microchip usa preço fixo, mas só vende em lotes
// de 100 (minQty/qtyStep = 100); leitores usam preço fixo, unidade a unidade.
// Nome/descrição traduzíveis ficam em messages
// (`vendas.produtos.items.<slug>.{name,desc}`); fatos/preços ficam aqui.

export type RFIDCategory = 'microchip' | 'leitor';

/** Faixa de preço por volume: a partir de `minQty` unidades, paga `unitBRL`/un. */
export interface PriceTier {
  minQty: number;
  unitBRL: number;
}

export interface RFIDProduct {
  slug: string;
  category: RFIDCategory;
  nameKey: string;
  descKey: string;
  image: string;
  specs: { labelKey: string; value: string }[];
  /** preço fixo por unidade (leitores). null quando usa priceTiers. */
  priceBRL: number | null;
  /** faixas de preço por quantidade (microchip). Ordenar por minQty asc. */
  priceTiers?: PriceTier[];
  /** quantidade mínima de pedido (microchip = 100). default 1. */
  minQty?: number;
  /** incremento permitido de quantidade (microchip = 100, só compra de 100 em 100). default 1. */
  qtyStep?: number;
  unit?: string;
  highlighted?: boolean;
}

/** Preço unitário aplicável para a quantidade, dada a tabela de faixas. */
export function unitPriceForQty(tiers: PriceTier[], qty: number): number {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let price = sorted[0]?.unitBRL ?? 0;
  for (const tier of sorted) {
    if (qty >= tier.minQty) price = tier.unitBRL;
  }
  return price;
}

export const rfidProducts: RFIDProduct[] = [
  {
    slug: 'microchip-icar',
    category: 'microchip',
    nameKey: 'microchip-icar',
    descKey: 'microchip-icar',
    image: '/images/produtos/microchip_c_seringa.png',
    specs: [
      { labelKey: 'frequency', value: '134,2 kHz' },
      { labelKey: 'protocol', value: 'ISO 11784/11785 · FDX-B (ICAR)' },
      { labelKey: 'size', value: '2,12 × 12 mm' },
      { labelKey: 'application', value: 'com seringa aplicadora' },
    ],
    priceBRL: 8.6,
    minQty: 100,
    qtyStep: 100,
    unit: 'unidade',
    highlighted: true,
  },
  {
    slug: 'leitor-rfid',
    category: 'leitor',
    nameKey: 'leitor-rfid',
    descKey: 'leitor-rfid',
    image: '/images/produtos/leitor_portatil_sem_bt.png',
    specs: [{ labelKey: 'protocol', value: 'FDX-B · 132,2 kHz' }],
    priceBRL: 180,
    unit: 'unidade',
  },
  {
    slug: 'leitor-rfid-bluetooth',
    category: 'leitor',
    nameKey: 'leitor-rfid-bluetooth',
    descKey: 'leitor-rfid-bluetooth',
    image: '/images/produtos/leitor_portatil_bt.png',
    specs: [
      { labelKey: 'protocol', value: 'FDX-B · 132,2 kHz' },
      { labelKey: 'connectivity', value: 'Bluetooth' },
    ],
    priceBRL: 280,
    unit: 'unidade',
    highlighted: true,
  },
  {
    slug: 'leitor-bastao',
    category: 'leitor',
    nameKey: 'leitor-bastao',
    descKey: 'leitor-bastao',
    image: '/images/produtos/leitor_bastao.png',
    specs: [
      { labelKey: 'protocol', value: 'FDX-B · 132,2 kHz' },
      { labelKey: 'connectivity', value: 'Bluetooth' },
    ],
    priceBRL: 4950,
    unit: 'unidade',
  },
];
