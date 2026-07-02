import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { locales, type Locale } from '@/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sistemaseabra.com.br'),
  title: {
    default: 'Seabra Solutions — Tecnologia para Pecuária de Precisão',
    template: '%s | Seabra Solutions',
  },
  description:
    'Sistemas sob medida para gestão de rebanhos. Pequenos ruminantes e bovinos de corte, com suporte direto de quem é do setor.',
  applicationName: 'Seabra Solutions',
  icons: {
    icon: '/images/logo-icon.png',
    shortcut: '/images/logo-icon.png',
    apple: '/images/logo-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Seabra Solutions',
    title: 'Seabra Solutions — Tecnologia para Pecuária de Precisão',
    description:
      'Sistemas sob medida para gestão de rebanhos. Pequenos ruminantes e bovinos de corte.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Seabra Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seabra Solutions',
    description: 'Tecnologia para pecuária de precisão.',
    images: ['/images/logo.png'],
  },
  // Token de verificação do Google Search Console (propriedade sob sistemaseabra@gmail.com).
  // Fica hardcoded como fallback porque a Vercel (conta do sócio) não está acessível para
  // definir env vars; se a env var existir um dia, ela tem prioridade. Token não é segredo
  // (aparece publicamente no HTML de qualquer forma).
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      'xSHog5VZdsQ4-vJcL4Ca30YXDoJNFuTFT0kMgENM7AE',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
