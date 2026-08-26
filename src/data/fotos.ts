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

/**
 * Slide do carrossel do hero — uma funcionalidade por imagem.
 *
 * Cada arquivo já vem pronto com o ícone da funcionalidade composto sobre o
 * cenário real (a composição é feita fora do site, não é gerada aqui). Mesma
 * proporção do container em HeroSection.tsx (4:5).
 */
export interface SlideCarrossel {
  src: string | null;
  alt: string;
  /** Nome curto da funcionalidade — aparece no placeholder e no aria-label do ponto. */
  funcionalidade: string;
  briefing: string;
}

/**
 * Rascunho de funcionalidades para o carrossel do hero — mesma lista de
 * `landing/Modules.tsx`. Livre para reordenar, trocar ou remover; é só um
 * array, nenhum componente precisa mudar.
 */
export const heroCarousel: SlideCarrossel[] = [
  {
    src: '/images/campo/carrossel-padronizado/cadastro.jpg',
    alt: 'Cadastro de animais no SeabraApp — telas do aplicativo e ícone de cadastro',
    funcionalidade: 'Cadastro de Animais',
    briefing:
      'Curral ou capril ao fundo, celular com a tela de cadastro de animal em primeiro plano.',
  },
  {
    src: '/images/campo/carrossel-padronizado/controle-leiteiro-v5.jpg',
    alt: 'Controle leiteiro no SeabraApp — telas do aplicativo e ícone de controle leiteiro',
    funcionalidade: 'Controle Leiteiro',
    briefing:
      'Ordenha em andamento, celular registrando volume de produção na hora.',
  },
  {
    src: '/images/campo/carrossel-padronizado/reproducao.jpg',
    alt: 'Manejo reprodutivo no SeabraApp — telas do aplicativo e ícone de reprodução',
    funcionalidade: 'Manejo Reprodutivo',
    briefing:
      'Avaliação de fêmea prenha ou registro de cobertura, celular com a tela de manejo reprodutivo.',
  },
  {
    src: '/images/campo/carrossel-padronizado/financeiro.jpg',
    alt: 'Controle financeiro do rebanho no SeabraApp — telas do aplicativo e ícone financeiro',
    funcionalidade: 'Controle Financeiro',
    briefing:
      'Ambiente de trabalho da fazenda (escritório rural ou galpão), celular com a tela financeira.',
  },
  {
    src: '/images/campo/carrossel-padronizado/lista-de-animais-v2.jpg',
    alt: 'Lista de animais no SeabraApp — telas do aplicativo e visão do rebanho',
    funcionalidade: 'Lista de Animais',
    briefing:
      'Rebanho ao fundo, celular com a lista de animais e seus dados principais.',
  },
  {
    src: '/images/campo/carrossel-padronizado/pesagem.jpg',
    alt: 'Pesagem de animais no SeabraApp — telas do aplicativo e ícone de pesagem',
    funcionalidade: 'Pesagem',
    briefing:
      'Pesagem de animal no curral, celular com a tela de pesagem/GMD aberta.',
  },
  {
    src: '/images/campo/carrossel-padronizado/avaliacao-morfologica.jpg',
    alt: 'Avaliação morfológica linear no SeabraApp — telas do aplicativo e ícone de avaliação',
    funcionalidade: 'Avaliação Morfológica Linear',
    briefing:
      'Avaliação linear de conformação do animal no curral, celular com a tela de avaliação aberta.',
  },
  {
    src: '/images/campo/carrossel-padronizado/manejo.jpg',
    alt: 'Manejo de animais no SeabraApp — telas do aplicativo e ícone de manejo',
    funcionalidade: 'Manejo',
    briefing: 'Manejo de animal no curral, celular com a tela de manejo aberta.',
  },
  {
    src: '/images/campo/carrossel-padronizado/colaboradores.jpg',
    alt: 'Gestão de colaboradores no SeabraApp — telas do aplicativo e equipe em campo',
    funcionalidade: 'Colaboradores',
    briefing:
      'Equipe em atividade no campo, celular com a tela de colaboradores e permissões.',
  },
];

/**
 * Carrossel do card "Produtos" — os 3 produtos que já vendemos, recortados
 * com transparência real a partir das fotos de estúdio em
 * public/images/produtos/ (script em scripts/ não versionado, rodado à mão;
 * ver public/images/produtos/transparent/). Renderiza com `fit="contain"` no
 * FieldPhotoCarousel — produto isolado sobre o fundo do card, não foto
 * full-bleed como o carrossel do hero.
 */
export const produtosCarousel: SlideCarrossel[] = [
  {
    src: '/images/produtos/transparent/microchip.png',
    alt: 'Microchip RFID com seringa aplicadora, certificado ICAR',
    funcionalidade: 'Microchip',
    briefing: 'Microchip com seringa aplicadora.',
  },
  {
    src: '/images/produtos/transparent/leitor-portatil.png',
    alt: 'Leitor RFID portátil em uso, lendo o chip do animal',
    funcionalidade: 'Leitor Portátil',
    briefing: 'Leitor portátil FDX-B em uso.',
  },
  {
    src: '/images/produtos/transparent/leitor-bastao.png',
    alt: 'Leitor RFID bastão',
    funcionalidade: 'Leitor Bastão',
    briefing: 'Leitor bastão RFID.',
  },
];

export const fotos = {
  sistemas: {
    src: '/images/campo/sistemas.jpg',
    alt: 'Produtor usando o sistema durante a ordenha, lendo o chip do animal',
    briefing:
      'Produtor com o celular na mão dentro do curral, registrando um animal. Precisa ler como trabalho, não como demonstração.',
  },

  servicos: {
    src: '/images/campo/servicos.jpg',
    alt: 'Consultor avaliando o rebanho com leitor RFID no curral',
    briefing:
      'Consultoria acontecendo: avaliação de animal, conversa técnica no curral, prancheta ou avaliação linear.',
  },

  sobre: {
    src: '/images/campo/sobre.jpg',
    alt: 'Felipe Seabra no curral, junto ao rebanho',
    briefing:
      'Felipe em campo, não em estúdio. De pé no curral ou avaliando um animal, luz natural.',
  },
} satisfies Record<string, SlotFoto>;

export type SlotFotoKey = keyof typeof fotos;
