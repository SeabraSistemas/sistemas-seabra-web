import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * /3irmaos: projeção de leite e acompanhamento do fornecimento do Capril
 * Rancho 3 Irmãos (propriedade 262 do app). Fora do [locale] e do root
 * layout do site — mesmo padrão de src/app/bovinos/layout.tsx (sem
 * <html>/<body> próprios o Next quebra em runtime).
 *
 * É o protótipo da área de projeção de produção do segmento leiteiro que
 * depois entra no app.
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: '3 Irmãos · leite',
  robots: { index: false, follow: false },
};

export default function TresIrmaosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark">
      <body className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
