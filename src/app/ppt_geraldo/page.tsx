import type { Metadata } from 'next';
import { Deck } from '@/components/apresentacao/Deck';
import { montarSlidesProjecao } from '@/components/apresentacao/montarSlides';
import { ovinosCorte } from '@/data/apresentacoes/ovinos-corte';

export const metadata: Metadata = {
  title: 'Ovinos de corte — M.Sc. Geraldo Jonas da Silva',
  description: 'Produção contínua e tecnificada de ovinos de corte.',
  robots: { index: false, follow: false },
};

/**
 * Tela de projeção. O Deck só cuida de navegação, escala e impressão; os
 * slides chegam prontos do servidor. Conteúdo: src/data/apresentacoes/ovinos-corte.ts.
 * Tecla P abre a janela do apresentador (./apresentador), sincronizada.
 */
export default function ApresentacaoOvinosCorte() {
  return (
    <Deck
      titulo={ovinosCorte.titulo}
      slides={montarSlidesProjecao(ovinosCorte)}
      canal="deck:ovinos-corte"
      rotaApresentador="/ppt_geraldo/apresentador"
    />
  );
}
