import type { Slide } from './tipos';
import { Bio } from './slides/Bio';
import { Capa } from './slides/Capa';
import { FotoCheia } from './slides/FotoCheia';

/** Escolhe o layout pelo `tipo` do slide no arquivo de dados. */
export function SlideView({ slide }: { slide: Slide }) {
  switch (slide.tipo) {
    case 'capa':
      return <Capa slide={slide} />;
    case 'bio':
      return <Bio slide={slide} />;
    case 'foto-cheia':
      return <FotoCheia slide={slide} />;
  }
}
