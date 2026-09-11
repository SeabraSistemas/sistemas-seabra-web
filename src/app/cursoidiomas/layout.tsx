import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * Layout RAIZ do /cursoidiomas — curso interno de alemão e francês, para duas
 * pessoas. Vive fora do segmento [locale] (mesma decisão do /katmandu e do
 * /adm): sem Header/Footer/WhatsApp/GA do site, sem link de lugar nenhum,
 * noindex aqui e por header em next.config.ts. Não entra no robots.txt de
 * propósito, pra não publicar o caminho.
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Curso de idiomas', template: '%s · Curso de idiomas' },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

/** Área com login por cookie: nada aqui pode ser estático nem ficar em cache compartilhado. */
export const dynamic = 'force-dynamic';

export default function CursoIdiomasLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${archivo.variable} ${newsreader.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
