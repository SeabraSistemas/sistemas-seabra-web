import type { Metadata } from 'next';
import { IBM_Plex_Mono, Schibsted_Grotesk } from 'next/font/google';
import './painel.css';

/**
 * Área privada fora do [locale]: root layout próprio, sem next-intl, sem
 * cabeçalho/rodapé do site público. Textos em pt-BR direto no componente —
 * quem lança é a equipe da fazenda, não visitante.
 *
 * ESPELHO do /painel de ~/Projects/sanri (casa definitiva do painel): mesma
 * interface, com as cores do Sanri e CSS próprio (painel.css, não o
 * globals.css da Seabra). Aqui é o ambiente controlado de teste. Os arquivos
 * de components/sanri e lib/sanri são os mesmos de lá, mudando só os
 * caminhos (/painel ↔ /sanri) — mudança num lado vai pro outro.
 */
const schibsted = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Capril Sanri',
  robots: { index: false, follow: false },
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${schibsted.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
