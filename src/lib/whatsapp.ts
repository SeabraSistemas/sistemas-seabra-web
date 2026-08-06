import { Locale } from '@/i18n/config';

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface WhatsAppMessageConfig {
  locale: Locale;
  segment?: string;
  service?: string;
  utm?: UTMParams;
}

export const WHATSAPP_NUMBER = '5521999366784';

const messages: Record<Locale, { default: string; segment: string; service: string }> = {
  pt: {
    default: 'Olá! Quero saber mais sobre as soluções da Seabra.',
    segment:
      'Olá! Quero uma demonstração da solução para {segment}. {origin}',
    service:
      'Olá! Tenho interesse no plano {service} de desenvolvimento web. {origin}',
  },
  es: {
    default: '¡Hola! Quiero saber más sobre las soluciones de Seabra.',
    segment:
      '¡Hola! Quiero una demostración de la solución para {segment}. {origin}',
    service:
      '¡Hola! Tengo interés en el plan {service} de desarrollo web. {origin}',
  },
  en: {
    default: 'Hello! I want to know more about Seabra.',
    segment: 'Hello! I want a demo of the {segment} solution. {origin}',
    service:
      'Hello! I\'m interested in the {service} web development plan. {origin}',
  },
};

const segmentNames: Record<Locale, Record<string, string>> = {
  pt: {
    'bovinos-leite': 'Bovinos Leiteiros',
    'bovinos-corte': 'Bovinos de Corte',
    'caprinos-leite': 'Caprinos Leiteiros',
    'caprinos-corte': 'Caprinos de Corte',
    'ovinos-leite': 'Ovinos Leiteiros',
    'ovinos-corte': 'Ovinos de Corte',
  },
  es: {
    'bovinos-leite': 'Bovinos de Leche',
    'bovinos-corte': 'Bovinos de Carne',
    'caprinos-leite': 'Caprinos Lecheros',
    'caprinos-corte': 'Caprinos de Carne',
    'ovinos-leite': 'Ovinos Lecheros',
    'ovinos-corte': 'Ovinos de Carne',
  },
  en: {
    'bovinos-leite': 'Dairy Cattle',
    'bovinos-corte': 'Beef Cattle',
    'caprinos-leite': 'Dairy Goats',
    'caprinos-corte': 'Meat Goats',
    'ovinos-leite': 'Dairy Sheep',
    'ovinos-corte': 'Meat Sheep',
  },
};

function formatOrigin(utm?: UTMParams, locale?: Locale): string {
  if (!utm?.utm_source) return '';

  const labels: Record<Locale, string> = {
    pt: 'Origem',
    es: 'Origen',
    en: 'Source',
  };

  const label = labels[locale || 'pt'];
  const parts = [utm.utm_source];
  if (utm.utm_campaign) parts.push(utm.utm_campaign);

  return `${label}: ${parts.join(' / ')}`;
}

const serviceNames: Record<Locale, Record<string, string>> = {
  pt: {
    tier1: 'Landing Page',
    tier2: 'E-commerce',
    tier3: 'Marketplace',
    geral: 'Desenvolvimento Web',
    consultoria: 'Consultoria em Pequenos Ruminantes',
  },
  es: {
    tier1: 'Landing Page',
    tier2: 'E-commerce',
    tier3: 'Marketplace',
    geral: 'Desarrollo Web',
    consultoria: 'Consultoría en Pequeños Rumiantes',
  },
  en: {
    tier1: 'Landing Page',
    tier2: 'E-commerce',
    tier3: 'Marketplace',
    geral: 'Web Development',
    consultoria: 'Small Ruminant Consulting',
  },
};

// Mensagem de cabeçalho do pedido (carrinho de produtos RFID → WhatsApp).
const orderIntro: Record<Locale, { intro: string; subtotal: string }> = {
  pt: { intro: 'Olá! Quero finalizar este pedido na Seabra:', subtotal: 'Subtotal' },
  es: { intro: '¡Hola! Quiero finalizar este pedido en Seabra:', subtotal: 'Subtotal' },
  en: { intro: 'Hello! I want to place this order with Seabra:', subtotal: 'Subtotal' },
};

export interface OrderItem {
  name: string;
  qty: number;
  unitPriceBRL: number;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Monta a URL do WhatsApp com o pedido itemizado (sem gateway de pagamento). */
export function buildWhatsAppOrderUrl(config: {
  locale: Locale;
  items: OrderItem[];
  utm?: UTMParams;
}): string {
  const { locale, items, utm } = config;
  const m = orderIntro[locale];
  const lines = items.map(
    (it) => `• ${it.qty}x ${it.name} — ${formatBRL(it.unitPriceBRL * it.qty)}`
  );
  const subtotal = items.reduce((acc, it) => acc + it.unitPriceBRL * it.qty, 0);
  const origin = formatOrigin(utm, locale);

  const text = [m.intro, '', ...lines, '', `${m.subtotal}: ${formatBRL(subtotal)}`, origin]
    .join('\n')
    .trim();

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppMessage(config: WhatsAppMessageConfig): string {
  const { locale, segment, service, utm } = config;

  if (service) {
    const serviceName = serviceNames[locale][service] || service;
    const origin = formatOrigin(utm, locale);
    return messages[locale].service
      .replace('{service}', serviceName)
      .replace('{origin}', origin)
      .trim();
  }

  if (!segment) {
    return messages[locale].default;
  }

  const segmentName = segmentNames[locale][segment] || segment;
  const origin = formatOrigin(utm, locale);

  return messages[locale].segment
    .replace('{segment}', segmentName)
    .replace('{origin}', origin)
    .trim();
}

export function buildWhatsAppUrl(config: WhatsAppMessageConfig): string {
  const message = buildWhatsAppMessage(config);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getUTMFromUrl(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
}
