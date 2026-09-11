import type { Idioma, IdiomaId, Licao, ModuloInfo, NivelId } from '@/data/cursoidiomas/types';

export const IDIOMAS: Record<IdiomaId, Idioma> = {
  alemao: { id: 'alemao', nome: 'Alemão', nomeNativo: 'Deutsch', sigla: 'DE', bcp47: 'de-DE' },
  frances: { id: 'frances', nome: 'Francês', nomeNativo: 'Français', sigla: 'FR', bcp47: 'fr-FR' },
};

export const IDIOMA_IDS = Object.keys(IDIOMAS) as IdiomaId[];

/**
 * A trilha A1 → C2 é a mesma para os dois idiomas (decisão do Felipe, ver a
 * estrutura que ele passou em 11/09/2026). Só as lições mudam de língua para
 * língua. Os ids dos módulos são chaves de tipo: um arquivo de nível que
 * esqueça um módulo não compila (ver `ConteudoNivel`).
 */
export const ESTRUTURA = {
  a1: {
    sigla: 'A1',
    numero: 1,
    nome: 'Iniciação',
    descricao: 'Compreender e usar expressões muito básicas.',
    modulos: {
      fundamentos: { titulo: 'Fundamentos', descricao: 'Alfabeto, sons, saudações, números e as primeiras regras.' },
      pronuncia: { titulo: 'Pronúncia', descricao: 'Os sons que não existem em português e como produzi-los.' },
      vocabulario: { titulo: 'Vocabulário essencial', descricao: 'As palavras do dia a dia: família, comida, casa, cidade.' },
      frases: { titulo: 'Frases', descricao: 'Frases prontas para perguntar, pedir, comprar e se orientar.' },
      conversacao: { titulo: 'Conversação básica', descricao: 'Apresentar-se, falar da rotina e sustentar um primeiro diálogo.' },
    },
  },
  a2: {
    sigla: 'A2',
    numero: 2,
    nome: 'Básico',
    descricao: 'Comunicar-se em situações cotidianas simples.',
    modulos: {
      'conversacao-cotidiana': { titulo: 'Conversação cotidiana', descricao: 'Compras, saúde, viagem e trabalho em diálogos reais.' },
      'tempos-verbais': { titulo: 'Tempos verbais fundamentais', descricao: 'Presente, passado, futuro e imperativo: o esqueleto da língua.' },
      'compreensao-oral': { titulo: 'Compreensão oral', descricao: 'Ouvir e entender recados, diálogos e números com o sintetizador de voz.' },
      'escrita-simples': { titulo: 'Escrita simples', descricao: 'E-mails informais, formulários e descrições curtas.' },
    },
  },
  b1: {
    sigla: 'B1',
    numero: 3,
    nome: 'Intermediário',
    descricao: 'Lidar com a maioria das situações do dia a dia e falar sobre experiências, planos e opiniões.',
    modulos: {
      'conversacao-independente': { titulo: 'Conversação independente', descricao: 'Falar de experiências, planos e resolver problemas sem apoio.' },
      narrativas: { titulo: 'Narrativas', descricao: 'Contar histórias no passado com conectores e discurso indireto.' },
      opinioes: { titulo: 'Opiniões', descricao: 'Opinar, concordar, discordar e justificar.' },
      'situacoes-reais': { titulo: 'Situações reais', descricao: 'Moradia, burocracia e entrevista de emprego.' },
      'precisao-gramatical': { titulo: 'Maior precisão gramatical', descricao: 'As estruturas que separam quem "se vira" de quem fala certo.' },
    },
  },
  b2: {
    sigla: 'B2',
    numero: 4,
    nome: 'Intermediário-avançado',
    descricao: 'Comunicar-se com bastante espontaneidade e discutir temas mais complexos.',
    modulos: {
      'fluencia-funcional': { titulo: 'Fluência funcional', descricao: 'Reuniões, processos, grau de certeza.' },
      debates: { titulo: 'Debates', descricao: 'Estrutura, vocabulário e temas para argumentar ao vivo.' },
      profissional: { titulo: 'Linguagem profissional', descricao: 'E-mail formal, negócios e apresentação de produto.' },
      autenticos: { titulo: 'Compreensão de conteúdos autênticos', descricao: 'Notícias, entrevistas e textos técnicos como eles são.' },
      'escrita-avancada': { titulo: 'Escrita avançada', descricao: 'Texto argumentativo, relatório e coesão.' },
    },
  },
  c1: {
    sigla: 'C1',
    numero: 5,
    nome: 'Avançado',
    descricao: 'Utilizar a língua de forma flexível, profissional e acadêmica.',
    modulos: {
      'fluencia-avancada': { titulo: 'Fluência avançada', descricao: 'Registros, espontaneidade e reformulação.' },
      nuances: { titulo: 'Nuances', descricao: 'Partículas, colocações e modalidade: o que muda o tom.' },
      argumentacao: { titulo: 'Argumentação', descricao: 'Tese, contra-argumento e retórica.' },
      apresentacoes: { titulo: 'Apresentações', descricao: 'Estrutura, dados e transições para falar em público.' },
      academica: { titulo: 'Linguagem acadêmica/profissional', descricao: 'Estilo nominal, vocabulário científico e citação.' },
    },
  },
  c2: {
    sigla: 'C2',
    numero: 6,
    nome: 'Domínio',
    descricao: 'Compreensão e expressão extremamente elevadas, próximas de um falante altamente competente.',
    modulos: {
      dominio: { titulo: 'Domínio', descricao: 'Textos densos, variantes regionais e os erros fossilizados de quem fala português.' },
      sutilezas: { titulo: 'Sutilezas', descricao: 'Conotação, ênfase e ordem das palavras.' },
      idiomatico: { titulo: 'Linguagem idiomática', descricao: 'Expressões, provérbios e referências culturais.' },
      estilo: { titulo: 'Precisão estilística', descricao: 'Conciso ou elaborado, figuras e revisão.' },
      sofisticada: { titulo: 'Comunicação altamente sofisticada', descricao: 'Discurso formal e ensaio.' },
    },
  },
} as const satisfies Record<
  NivelId,
  { sigla: string; numero: number; nome: string; descricao: string; modulos: Record<string, ModuloInfo> }
>;

export const NIVEL_IDS = Object.keys(ESTRUTURA) as NivelId[];

export type ModuloId<N extends NivelId> = keyof (typeof ESTRUTURA)[N]['modulos'] & string;

/** Um arquivo de nível de um idioma: lições por módulo, todos obrigatórios. */
export type ConteudoNivel<N extends NivelId> = Record<ModuloId<N>, Licao[]>;

export type ConteudoIdioma = { [N in NivelId]: ConteudoNivel<N> };
