import type { Metadata, Viewport } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * /nutricao: laboratório PESSOAL do Felipe para validar o modelo de nutrição de
 * cabra leiteira antes de ele virar tela do módulo Nutrição & Custo do app.
 * Fora do [locale] e do root layout do site — mesmo padrão de /3irmaos (sem
 * <html>/<body> próprios o Next quebra em runtime). Tema claro de campo
 * (.tema-campo), pensado para ler no sol.
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Nutrição · laboratório',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfaf6',
};

export default function NutricaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ colorScheme: 'light' }}>
      <body className={`${archivo.variable} ${newsreader.variable} tema-campo min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
