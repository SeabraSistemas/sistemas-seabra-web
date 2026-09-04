import type { Metadata } from 'next';
import { Archivo, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';

/**
 * Apresentação do contrato Elmate × Seabra, fora do [locale] — e por isso fora
 * do root layout do site também: src/app/[locale]/layout.tsx é quem desenha
 * <html>/<body> hoje (não existe src/app/layout.tsx). Sem este layout duplicar
 * isso, o Next quebra em runtime ("Missing <html> and <body> tags").
 *
 * Não importa globals.css nem Header/Footer/GA — é material comercial
 * confidencial, não página institucional. O deck traz o próprio CSS completo,
 * isolado do Tailwind do site. robots noindex, mesmo padrão do /katmandu, e
 * Disallow no public/robots.txt.
 */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-deck-display',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-deck-body',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-deck-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Contrato Elmate × Seabra',
  description: 'Sistema de gestão modular em regime de subscrição.',
  robots: { index: false, follow: false },
};

export default function ElmateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className={`${archivo.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
