import type { ContextoSlide, Slide } from './tipos';
import { Agenda } from './slides/Agenda';
import { Arquitetura } from './slides/Arquitetura';
import { Bio } from './slides/Bio';
import { Calendario } from './slides/Calendario';
import { Capa } from './slides/Capa';
import { Ciclo } from './slides/Ciclo';
import { Colunas } from './slides/Colunas';
import { Divisor } from './slides/Divisor';
import { Fechamento } from './slides/Fechamento';
import { Fluxo } from './slides/Fluxo';
import { FotoCheia } from './slides/FotoCheia';
import { Grafico } from './slides/Grafico';
import { Numeros } from './slides/Numeros';
import { Rede } from './slides/Rede';
import { Sistema } from './slides/Sistema';
import { Tabela } from './slides/Tabela';
import { Timeline } from './slides/Timeline';
import { Topicos } from './slides/Topicos';
import { Whatsapp } from './slides/Whatsapp';

/** Escolhe o layout pelo `tipo` do slide no arquivo de dados. */
export function SlideView({ slide, contexto }: { slide: Slide; contexto: ContextoSlide }) {
  const { secao } = contexto;
  switch (slide.tipo) {
    case 'capa':
      return <Capa slide={slide} />;
    case 'bio':
      return <Bio slide={slide} />;
    case 'agenda':
      return <Agenda slide={slide} secoes={contexto.secoes} />;
    case 'divisor':
      return <Divisor slide={slide} numero={contexto.numero} />;
    case 'topicos':
    case 'texto-foto':
      return <Topicos slide={slide} secao={secao} />;
    case 'foto-cheia':
      return <FotoCheia slide={slide} secao={secao} />;
    case 'colunas':
      return <Colunas slide={slide} secao={secao} />;
    case 'timeline':
      return <Timeline slide={slide} secao={secao} />;
    case 'fluxo':
      return <Fluxo slide={slide} secao={secao} />;
    case 'tabela':
      return <Tabela slide={slide} secao={secao} />;
    case 'numeros':
      return <Numeros slide={slide} secao={secao} />;
    case 'grafico':
      return <Grafico slide={slide} secao={secao} />;
    case 'whatsapp':
      return <Whatsapp slide={slide} secao={secao} />;
    case 'fechamento':
      return <Fechamento slide={slide} />;
    case 'ciclo':
      return <Ciclo slide={slide} secao={secao} />;
    case 'calendario':
      return <Calendario slide={slide} secao={secao} />;
    case 'rede':
      return <Rede slide={slide} secao={secao} />;
    case 'sistema':
      return <Sistema slide={slide} />;
    case 'arquitetura':
      return <Arquitetura slide={slide} secao={secao} />;
  }
}
