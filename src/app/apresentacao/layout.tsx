import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * Apresentações ao vivo (/apresentacao/<nome>), fora do [locale] — e por isso
 * fora do root layout do site também: src/app/[locale]/layout.tsx é quem
 * desenha <html>/<body> hoje (não existe src/app/layout.tsx). Sem este layout
 * duplicar isso, o Next quebra em runtime ("Missing <html> and <body> tags").
 *
 * Não existe page.tsx em /apresentacao de propósito: essa URL é o rewrite para
 * public/docs-seabra/apresentacao.html (next.config.ts), já divulgada. Uma
 * página aqui passaria na frente do rewrite.
 *
 * Mesmas fontes e tokens do site. A Archivo carrega o eixo de largura (wdth)
 * para os títulos condensados em caixa alta dos slides. robots noindex, e o
 * Disallow: /apresentacao do public/robots.txt já cobre as subpáginas.
 */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Apresentação',
  robots: { index: false, follow: false },
};

export default function ApresentacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${archivo.variable} ${newsreader.variable} bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
