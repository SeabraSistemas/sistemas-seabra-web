import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * /bovinos: painel interno do Sistema Seabra que confere as planilhas
 * AppSheet dos clientes de bovino (Benoni, Bonito, Santo Antônio). Fora do
 * [locale] e do root layout do site — mesmo padrão de src/app/FI_FCG/layout.tsx
 * (sem <html>/<body> próprios o Next quebra em runtime).
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Bovinos · conferência',
  robots: { index: false, follow: false },
};

export default function BovinosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
