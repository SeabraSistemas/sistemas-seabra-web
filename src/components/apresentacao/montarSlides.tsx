import { SlideView } from './SlideView';
import { contextosDosSlides, tituloDoSlide, type Apresentacao } from './tipos';

/**
 * Renderiza os slides no servidor (fotos conferidas em disco, sem JS de
 * layout no navegador) para a projeção e para a janela do apresentador.
 * As notas só vão para a janela do apresentador: a projeção nem as recebe.
 */
export function montarSlides(apresentacao: Apresentacao) {
  const contextos = contextosDosSlides(apresentacao.slides);
  return apresentacao.slides.map((slide, i) => ({
    id: slide.id,
    titulo: tituloDoSlide(slide),
    notas: slide.notas,
    conteudo: <SlideView slide={slide} contexto={contextos[i]} />,
  }));
}

export function montarSlidesProjecao(apresentacao: Apresentacao) {
  return montarSlides(apresentacao).map(({ id, titulo, conteudo }) => ({ id, titulo, conteudo }));
}
