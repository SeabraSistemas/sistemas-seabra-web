import type { Metadata } from 'next';
import { Deck } from '@/components/apresentacao/Deck';
import { SlideView } from '@/components/apresentacao/SlideView';
import { contextosDosSlides, tituloDoSlide } from '@/components/apresentacao/tipos';
import { ovinosCorte } from '@/data/apresentacoes/ovinos-corte';

export const metadata: Metadata = {
  title: 'Ovinos de corte — Dr. Geraldo Jonas da Silva',
  description: 'Produção contínua e tecnificada de ovinos de corte.',
  robots: { index: false, follow: false },
};

/**
 * Os slides são renderizados aqui, no servidor (fotos conferidas em disco,
 * sem JS de layout no navegador); o Deck só cuida de navegação, escala e
 * impressão. Conteúdo: src/data/apresentacoes/ovinos-corte.ts.
 */
export default function ApresentacaoOvinosCorte() {
  const contextos = contextosDosSlides(ovinosCorte.slides);
  return (
    <Deck
      titulo={ovinosCorte.titulo}
      slides={ovinosCorte.slides.map((slide, i) => ({
        id: slide.id,
        titulo: tituloDoSlide(slide),
        notas: slide.notas,
        conteudo: <SlideView slide={slide} contexto={contextos[i]} />,
      }))}
    />
  );
}
