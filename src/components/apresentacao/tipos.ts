/**
 * Contrato entre o arquivo de dados de uma apresentação
 * (src/data/apresentacoes/*.ts) e os layouts de slide. Editar texto, notas ou
 * foto é só mexer no arquivo de dados; os layouts leem daqui.
 *
 * Títulos ficam em caixa normal nos dados — a caixa alta é aplicada pelo CSS
 * (.deck-titulo). Assim o leitor de tela lê a frase, não letra por letra, e
 * trocar o estilo depois não exige reescrever o texto.
 *
 * Seção e número de seção não se escrevem à mão: saem dos slides `divisor`
 * (ver contextosDosSlides). Reordenar as seções renumera tudo, inclusive a
 * agenda.
 */

export interface Foto {
  /** Caminho público, numerado pelo slide: '/images/apresentacao-ovinos/12-santa-ines.jpg'. */
  src: string;
  alt: string;
  /**
   * O que fotografar. Enquanto o arquivo não existir em public/, o slide
   * mostra este texto no lugar da foto — a apresentação diz o que falta.
   */
  briefing: string;
  /** object-position, para escolher o recorte: '50% 30%'. */
  posicao?: string;
  /** 'conter' para foto de produto com fundo transparente (sem recorte). */
  ajuste?: 'cobrir' | 'conter';
}

export interface Logo {
  src: string;
  alt: string;
  /** Tamanho real do arquivo, em px. */
  largura: number;
  altura: number;
}

/** Ícones disponíveis nos diagramas — mapeados para o lucide em Icone.tsx. */
export type NomeIcone =
  | 'frigorifico'
  | 'grupo'
  | 'calendario'
  | 'caminhao'
  | 'brinco'
  | 'leitura'
  | 'abate'
  | 'higienizacao'
  | 'reutilizacao'
  | 'balanca'
  | 'ficha'
  | 'selo';

interface SlideBase {
  /** Estável e único — vira key do React e referência nas notas. */
  id: string;
  /** Texto do apresentador. Aparece com a tecla N, nunca na projeção. */
  notas?: string;
  /** Sobrescreve a seção herdada do último `divisor`. */
  secao?: string;
}

export interface SlideCapa extends SlideBase {
  tipo: 'capa';
  titulo: string;
  apresentador: string;
  cargo?: string;
  /** Nome do evento, se houver — aparece acima do título. */
  evento?: string;
  logo?: Logo;
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

/** Lista as seções (títulos dos divisores) — a agenda se monta sozinha. */
export interface SlideAgenda extends SlideBase {
  tipo: 'agenda';
  titulo: string;
  foto?: Foto;
}

/** Abertura de seção. O número (01, 02…) vem da ordem dos divisores. */
export interface SlideDivisor extends SlideBase {
  tipo: 'divisor';
  titulo: string;
  subtitulo?: string;
  foto?: Foto;
}

export interface Topico {
  texto: string;
  detalhe?: string;
}

/**
 * `topicos`: o texto domina, foto opcional à direita.
 * `texto-foto`: a foto domina (mais da metade do slide).
 */
export interface SlideTopicos extends SlideBase {
  tipo: 'topicos' | 'texto-foto';
  titulo: string;
  lead?: string;
  itens?: Topico[];
  /** lista: marcador · numerado: 01, 02… · passos: sequência ligada por linha. */
  estilo?: 'lista' | 'numerado' | 'passos';
  foto?: Foto;
}

export interface SlideFotoCheia extends SlideBase {
  tipo: 'foto-cheia';
  titulo: string;
  legenda?: string;
  foto: Foto;
}

export interface Coluna {
  titulo: string;
  subtitulo?: string;
  itens?: string[];
  foto?: Foto;
}

export interface SlideColunas extends SlideBase {
  tipo: 'colunas';
  titulo: string;
  lead?: string;
  colunas: Coluna[];
}

export interface Etapa {
  /** Rótulo curto acima do ponto: 'D0', '+48 h', 'Embarque'. */
  marco: string;
  titulo: string;
  detalhe?: string;
}

export interface SlideTimeline extends SlideBase {
  tipo: 'timeline';
  titulo: string;
  lead?: string;
  etapas: Etapa[];
  /** Período desenhado sobre a linha, entre duas etapas (índices). */
  faixa?: { de: number; ate: number; rotulo: string; tom?: 'neutro' | 'bloqueio' };
  /** Índice da etapa em destaque. */
  destaque?: number;
  nota?: string;
}

export interface Passo {
  titulo: string;
  detalhe?: string;
  icone?: NomeIcone;
}

export interface SlideFluxo extends SlideBase {
  tipo: 'fluxo';
  titulo: string;
  lead?: string;
  /** linha: etapas lado a lado · ciclo: etapas em roda, voltando ao início. */
  forma?: 'linha' | 'ciclo';
  /** Texto no meio da roda (forma 'ciclo'). */
  centro?: string;
  passos: Passo[];
}

export interface SlideTabela extends SlideBase {
  tipo: 'tabela';
  titulo: string;
  lead?: string;
  /** Cabeçalho. A primeira coluna é o rótulo de cada linha. */
  colunas: string[];
  linhas: string[][];
  nota?: string;
}

export interface Numero {
  rotulo: string;
  valor: string;
  unidade?: string;
  detalhe?: string;
}

export interface SlideNumeros extends SlideBase {
  tipo: 'numeros';
  titulo: string;
  lead?: string;
  numeros: Numero[];
  /** Mostra o selo "Dados ilustrativos". */
  ilustrativo?: boolean;
}

/** Barras mês a mês, um painel por cenário, todos na mesma escala. */
export interface SlideGrafico extends SlideBase {
  tipo: 'grafico';
  titulo: string;
  lead?: string;
  rotulos: string[];
  unidade: string;
  paineis: { titulo: string; valores: number[] }[];
  referencia?: { valor: number; rotulo: string };
  ilustrativo?: boolean;
}

export interface Mensagem {
  de: 'sistema' | 'produtor';
  texto: string;
  hora: string;
}

export interface SlideWhatsapp extends SlideBase {
  tipo: 'whatsapp';
  titulo: string;
  lead?: string;
  itens?: string[];
  /** Nome do contato no topo da conversa. */
  contato: string;
  mensagens: Mensagem[];
  ilustrativo?: boolean;
}

export interface SlideFechamento extends SlideBase {
  tipo: 'fechamento';
  titulo: string;
  subtitulo?: string;
  apresentador: string;
  logoApresentador?: Logo;
  /** Endereço mostrado por extenso ao lado do QR code. */
  site: string;
  /** SVG do QR code (aponta para o site). */
  qr: string;
  /** Mostra o WhatsApp comercial do site (src/lib/whatsapp.ts). */
  whatsapp?: boolean;
  logoSistema: Logo;
}

export interface SlideCiclo extends SlideBase {
  tipo: 'ciclo';
  titulo: string;
  lead?: string;
  /** Duração total do ciclo, em dias. */
  dias: number;
  /** Fases em dias a partir do estro (dia 0). */
  fases: { nome: string; inicio: number; fim: number; destaque?: boolean }[];
  marcos: { dia: number; rotulo: string }[];
  itens?: string[];
}

/**
 * Um lote coberto por mês. Cada linha percorre o ano: cobertura, gestação,
 * cria e terminação, abate — deslocada um mês em relação à anterior.
 */
export interface SlideCalendario extends SlideBase {
  tipo: 'calendario';
  titulo: string;
  lead?: string;
  /** Rótulos dos 12 meses. */
  meses: string[];
  /** Meses de gestação e de cria + terminação (o abate é o mês seguinte). */
  gestacao: number;
  terminacao: number;
  ilustrativo?: boolean;
}

export interface SlideRede extends SlideBase {
  tipo: 'rede';
  titulo: string;
  lead?: string;
  centro: { nome: string; detalhe?: string };
  nos: { nome: string; detalhe?: string }[];
}

export type NivelAlerta = 'info' | 'ok' | 'alerta' | 'critico';

/** Pedaços de uma tela do sistema, desenhados como no app (claro). */
export type BlocoSistema =
  | { tipo: 'metricas'; itens: { rotulo: string; valor: string; detalhe?: string }[] }
  | {
      tipo: 'tabela';
      colunas: string[];
      linhas: string[][];
      /** Estado de cada linha, na mesma ordem; null = normal. */
      estados?: (NivelAlerta | null)[];
    }
  | { tipo: 'alertas'; itens: { nivel: NivelAlerta; texto: string }[] }
  | {
      tipo: 'grafico';
      forma: 'linha' | 'colunas';
      titulo: string;
      rotulos: string[];
      valores: number[];
      unidade: string;
      /** Meta: colunas abaixo dela ganham destaque. */
      referencia?: { valor: number; rotulo: string };
      /** Altura do gráfico em px do palco (padrão 230). */
      altura?: number;
    };

/** "No sistema": o assunto do bloco mostrado numa tela do Sistema Seabra. */
export interface SlideSistema extends SlideBase {
  tipo: 'sistema';
  titulo: string;
  itens?: string[];
  tela: { titulo: string; blocos: BlocoSistema[] };
  ilustrativo?: boolean;
  /**
   * Recurso que o app publicado ainda não tem (conferido no seabra-app-main
   * em 24/09/2026). Mostra o selo "Em desenvolvimento" — tirar quando lançar.
   */
  emDesenvolvimento?: boolean;
}

export interface SlideArquitetura extends SlideBase {
  tipo: 'arquitetura';
  titulo: string;
  lead?: string;
  /** Cabeçalho das três etapas: Entrada, Processamento, Saída. */
  etapas: [string, string, string];
  modulos: { nome: string; entrada: string; processamento: string; saida: string }[];
}

export type Slide =
  | SlideCapa
  | SlideBio
  | SlideAgenda
  | SlideDivisor
  | SlideTopicos
  | SlideFotoCheia
  | SlideColunas
  | SlideTimeline
  | SlideFluxo
  | SlideTabela
  | SlideNumeros
  | SlideGrafico
  | SlideWhatsapp
  | SlideFechamento
  | SlideCiclo
  | SlideCalendario
  | SlideRede
  | SlideSistema
  | SlideArquitetura;

export interface Apresentacao {
  titulo: string;
  slides: Slide[];
}

/** Título curto do slide — usado nas notas ("Próximo: …") e no aria-label. */
export function tituloDoSlide(slide: Slide): string {
  switch (slide.tipo) {
    case 'bio':
      return slide.nome;
    case 'fechamento':
      return slide.subtitulo ? `${slide.titulo} · ${slide.subtitulo}` : slide.titulo;
    default:
      return slide.titulo;
  }
}

export interface Secao {
  numero: string;
  titulo: string;
}

/** O que cada slide herda da posição no deck. */
export interface ContextoSlide {
  /** Título da seção atual (do último divisor), para o rótulo do slide. */
  secao?: string;
  /** Número do próprio divisor: '01', '02'… */
  numero?: string;
  /** Todas as seções, para a agenda. */
  secoes: Secao[];
}

export function contextosDosSlides(slides: Slide[]): ContextoSlide[] {
  const secoes = slides
    .filter((s): s is SlideDivisor => s.tipo === 'divisor')
    .map((s, i) => ({ numero: String(i + 1).padStart(2, '0'), titulo: s.titulo }));

  const contextos: ContextoSlide[] = [];
  let atual: Secao | undefined;
  let vistos = 0;
  for (const slide of slides) {
    if (slide.tipo === 'divisor') {
      atual = secoes[vistos++];
      contextos.push({ numero: atual.numero, secoes });
    } else {
      contextos.push({ secao: slide.secao ?? atual?.titulo, secoes });
    }
  }
  return contextos;
}
