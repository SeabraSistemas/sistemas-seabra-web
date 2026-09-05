import type { Metadata } from 'next';
import { Archivo, Newsreader } from 'next/font/google';
import '../globals.css';

/**
 * Layout RAIZ do /adm. O painel vive fora do segmento [locale] (é ferramenta
 * interna, só pt-BR — mesma decisão do /katmandu e do /elmate), e este repo não
 * tem src/app/layout.tsx: quem desenha <html>/<body> é o layout de cada área.
 * Sem esta duplicação o Next quebra em runtime com "Missing <html> and <body>".
 *
 * Não importa Header/Footer/WhatsAppButton/GA de propósito: nada do site
 * institucional entra aqui. Um script de analytics numa tela que exibe dado
 * pessoal de cliente mandaria a URL (que carrega o id do usuário) para fora.
 *
 * NOINDEX EM VEZ DE Disallow NO robots.txt: `Disallow` impede o rastreamento, e
 * um robô que não rastreia nunca lê o noindex — a URL nua ainda pode acabar
 * indexada. Deixar rastrear e devolver noindex é o que remove de verdade. E
 * public/robots.txt é arquivo público: listar /adm entregaria o caminho a
 * qualquer scanner. Por isso o /adm é a única área do repo que NÃO aparece lá.
 */
const archivo = Archivo({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Adm · Sistema Seabra',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

/**
 * Vale para TODO o segmento /adm, inclusive as páginas dos outros agentes.
 * O site está atrás do CDN da Vercel: um payload RSC com a carteira de clientes
 * guardado em cache compartilhado é vazamento silencioso — não dá erro, só
 * entrega o dado de novo para outra requisição. Nenhuma página do /adm pode ser
 * estática ou revalidada.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdmLayout({ children }: { children: React.ReactNode }) {
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
