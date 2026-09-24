/**
 * Contrato entre o arquivo de dados de uma apresentação
 * (src/data/apresentacoes/*.ts) e os layouts de slide. Editar texto, notas ou
 * foto é só mexer no arquivo de dados; os layouts leem daqui.
 *
 * Títulos ficam em caixa normal nos dados — a caixa alta é aplicada pelo CSS
 * (.deck-titulo). Assim o leitor de tela lê a frase, não letra por letra, e
 * trocar o estilo depois não exige reescrever o texto.
 */

export interface Foto {
  /** Caminho público, numerado pelo slide: '/images/apresentacao-ovinos/03-santa-ines.jpg'. */
  src: string;
  alt: string;
  /**
   * O que fotografar. Enquanto o arquivo não existir em public/, o slide
   * mostra este texto no lugar da foto — a apresentação diz o que falta.
   */
  briefing: string;
  /** object-position, para escolher o recorte: '50% 30%'. */
  posicao?: string;
}

export interface Logo {
  src: string;
  alt: string;
  /** Tamanho real do arquivo, em px. */
  largura: number;
  altura: number;
}

interface SlideBase {
  /** Estável e único — vira key do React e referência nas notas. */
  id: string;
  /** Texto do apresentador. Aparece com a tecla N, nunca na projeção. */
  notas?: string;
}

export interface SlideCapa extends SlideBase {
  tipo: 'capa';
  titulo: string;
  apresentador: string;
  cargo?: string;
  /** Nome do evento, se houver — aparece acima do título. */
  evento?: string;
  foto?: Foto;
}

export interface ItemBio {
  texto: string;
  instituicao?: string;
}

export interface SlideBio extends SlideBase {
  tipo: 'bio';
  rotulo: string;
  nome: string;
  itens: ItemBio[];
  logos?: Logo[];
  foto?: Foto;
}

export interface SlideFotoCheia extends SlideBase {
  tipo: 'foto-cheia';
  /** Seção do roteiro, em destaque acima do título. */
  secao?: string;
  titulo: string;
  legenda?: string;
  foto: Foto;
}

export type Slide = SlideCapa | SlideBio | SlideFotoCheia;

export interface Apresentacao {
  titulo: string;
  slides: Slide[];
}

/** Título curto do slide — usado nas notas ("Próximo: …") e no aria-label. */
export function tituloDoSlide(slide: Slide): string {
  switch (slide.tipo) {
    case 'capa':
      return slide.titulo;
    case 'bio':
      return slide.nome;
    case 'foto-cheia':
      return slide.titulo;
  }
}
