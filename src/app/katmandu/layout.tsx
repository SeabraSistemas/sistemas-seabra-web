import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * Área privada, fora do [locale] — e por isso fora do root layout do site
 * também: src/app/[locale]/layout.tsx é quem desenha <html>/<body>, fonte e
 * globals.css hoje (não existe src/app/layout.tsx). Sem este layout duplicar
 * isso, o Next quebra em runtime ("Missing <html> and <body> tags").
 *
 * Não importa Header/Footer/WhatsAppButton/GA — é ferramenta interna, não
 * página institucional. robots noindex, mesmo padrão do /criadores.
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Katmandu',
  robots: { index: false, follow: false },
};

export default function KatmanduLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
