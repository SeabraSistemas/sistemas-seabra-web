/**
 * Fotografias de campo do site.
 *
 * COMO PREENCHER
 * 1. Coloque o arquivo em `public/images/campo/` (JPG, ~1920px de largura,
 *    comprimido para ≤300KB).
 * 2. Troque o `src: null` pelo caminho, ex: `src: '/images/campo/ordenha.jpg'`.
 *
 * Enquanto `src` for null, o site mostra um espaço reservado com o briefing —
 * ou seja, a própria página diz qual foto está faltando ali. Nenhum componente
 * precisa ser editado.
 *
 * O `briefing` é a instrução de o que fotografar. Foto real de capril, mesmo
 * imperfeita, vale mais que banco de imagens: é ela que separa este site de um
 * template gerado.
 */
export interface SlotFoto {
  /** Caminho público da imagem, ou null enquanto não houver foto. */
  src: string | null;
  /** Texto alternativo, para leitor de tela e SEO. */
  alt: string;
  /** O que fotografar. Aparece no espaço reservado enquanto src for null. */
  briefing: string;
}

export const fotos = {
  hero: {
    src: null,
    alt: 'Manejo de rebanho em capril',
    briefing:
      'Ordenha ou manejo num capril real, luz natural do início da manhã. Enquadramento largo, pessoa trabalhando em primeiro plano.',
  },

  sistemas: {
    src: null,
    alt: 'Produtor usando o sistema no curral',
    briefing:
      'Produtor com o celular na mão dentro do curral, registrando um animal. Precisa ler como trabalho, não como demonstração.',
  },

  servicos: {
    src: null,
    alt: 'Consultoria técnica em campo',
    briefing:
      'Consultoria acontecendo: avaliação de animal, conversa técnica no curral, prancheta ou avaliação linear.',
  },

  produtos: {
    src: null,
    alt: 'Leitor RFID em uso no animal',
    briefing:
      'Brinco ou bolus aplicado no animal, ou o leitor portátil em uso. Produto no contexto real, não em fundo branco de estúdio.',
  },

  sobre: {
    src: null,
    alt: 'Felipe Seabra em campo',
    briefing:
      'Felipe em campo, não em estúdio. De pé no curral ou avaliando um animal, luz natural.',
  },
} satisfies Record<string, SlotFoto>;

export type SlotFotoKey = keyof typeof fotos;
