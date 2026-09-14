import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * Área privada, fora do [locale] — e por isso fora do root layout do site
 * também: src/app/[locale]/layout.tsx desenha <html>/<body> hoje (não existe
 * src/app/layout.tsx). Mesmo padrão de src/app/katmandu/layout.tsx e
 * src/app/cursoidiomas/layout.tsx — sem duplicar isso o Next quebra em
 * runtime ("Missing <html> and <body> tags").
 *
 * Não importa Header/Footer/WhatsAppButton/GA — é dashboard de cliente, não
 * página institucional. robots noindex (reforçado por header em
 * next.config.ts, fora do robots.txt — ver o comentário lá).
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'FI_FCG',
  robots: { index: false, follow: false },
};

export default function FiFcgLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
