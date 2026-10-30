import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/** Ferramenta pessoal fora do [locale] (sem root layout) — desenha <html>/<body> como /tokens e /sanri. */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Meus pedidos',
  robots: { index: false, follow: false },
};

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
