/**
 * Modelo de conteúdo do /cursoidiomas. Tudo tipado para que o TypeScript
 * acuse módulo faltando e o teste (curso.test.ts) acuse lição malformada.
 *
 * Convenção: explicações em pt-BR; `termo`, `texto`, `frase` etc. na língua
 * estudada. No alemão, substantivos sempre com artigo ("der Hund").
 */
export type IdiomaId = 'alemao' | 'frances' | 'ingles';
export type NivelId = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export interface Idioma {
  id: IdiomaId;
  nome: string;
  nomeNativo: string;
  sigla: string;
  /** Tag BCP-47 usada pelo sintetizador de voz do navegador. */
  bcp47: 'de-DE' | 'fr-FR' | 'en-US';
}

export interface ItemVocabulario {
  termo: string;
  traducao: string;
  exemplo?: string;
  exemploTraducao?: string;
  nota?: string;
}

export interface Frase {
  texto: string;
  traducao: string;
  nota?: string;
}

export interface Fala {
  quem: string;
  texto: string;
  traducao: string;
}

export type Questao =
  | {
      tipo: 'escolha';
      pergunta: string;
      opcoes: string[];
      /** Índice em `opcoes`. */
      correta: number;
      explicacao?: string;
    }
  | {
      tipo: 'lacuna';
      /** Frase na língua estudada com `___` no lugar da resposta. */
      frase: string;
      resposta: string | string[];
      dica?: string;
      traducao?: string;
    }
  | {
      tipo: 'traducao';
      /** Frase em português para verter para a língua estudada. */
      origem: string;
      resposta: string | string[];
      dica?: string;
    }
  | {
      tipo: 'ditado';
      /** O navegador lê em voz alta; o aluno escreve o que ouviu. */
      texto: string;
      traducao?: string;
    }
  | {
      tipo: 'ordenar';
      /** Frase correta; as palavras são embaralhadas na tela. */
      resposta: string;
      traducao?: string;
    };

export type Bloco =
  | { tipo: 'texto'; titulo?: string; markdown: string }
  | { tipo: 'vocabulario'; titulo?: string; itens: ItemVocabulario[] }
  | { tipo: 'frases'; titulo?: string; itens: Frase[] }
  | { tipo: 'dialogo'; titulo?: string; falas: Fala[] }
  | { tipo: 'tabela'; titulo?: string; cabecalho: string[]; linhas: string[][]; nota?: string }
  | { tipo: 'dica'; titulo?: string; texto: string }
  | { tipo: 'exercicio'; titulo?: string; questoes: Questao[] };

export interface Licao {
  /** Único dentro do nível; vira o último segmento da URL. */
  id: string;
  titulo: string;
  resumo: string;
  blocos: Bloco[];
}

export interface ModuloInfo {
  titulo: string;
  descricao: string;
}

export interface Modulo extends ModuloInfo {
  id: string;
  licoes: Licao[];
}

export interface NivelInfo {
  id: NivelId;
  sigla: string;
  numero: number;
  nome: string;
  descricao: string;
}

export interface Nivel extends NivelInfo {
  modulos: Modulo[];
}

export interface Curso {
  idioma: Idioma;
  niveis: Nivel[];
}
