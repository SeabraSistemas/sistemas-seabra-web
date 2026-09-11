import { ESTRUTURA, IDIOMAS, IDIOMA_IDS, NIVEL_IDS } from '@/data/cursoidiomas/estrutura';
import type { ConteudoIdioma, ConteudoNivel, ModuloId } from '@/data/cursoidiomas/estrutura';
import type { Curso, IdiomaId, Licao, Modulo, Nivel, NivelId } from '@/data/cursoidiomas/types';
import { alemao } from '@/data/cursoidiomas/alemao/index';
import { frances } from '@/data/cursoidiomas/frances/index';
import { ingles } from '@/data/cursoidiomas/ingles/index';

export { ESTRUTURA, IDIOMAS, IDIOMA_IDS, NIVEL_IDS } from '@/data/cursoidiomas/estrutura';
export type * from '@/data/cursoidiomas/types';

function montarNivel<N extends NivelId>(id: N, conteudo: ConteudoNivel<N>): Nivel {
  const info = ESTRUTURA[id];
  const modulos = Object.entries(info.modulos) as [ModuloId<N>, { titulo: string; descricao: string }][];
  return {
    id,
    sigla: info.sigla,
    numero: info.numero,
    nome: info.nome,
    descricao: info.descricao,
    modulos: modulos.map(([moduloId, m]) => ({
      id: moduloId,
      titulo: m.titulo,
      descricao: m.descricao,
      licoes: conteudo[moduloId],
    })),
  };
}

function montarCurso(idioma: IdiomaId, conteudo: ConteudoIdioma): Curso {
  return {
    idioma: IDIOMAS[idioma],
    niveis: NIVEL_IDS.map((n) => montarNivel(n, conteudo[n])),
  };
}

export const CURSOS: Record<IdiomaId, Curso> = {
  alemao: montarCurso('alemao', alemao),
  frances: montarCurso('frances', frances),
  ingles: montarCurso('ingles', ingles),
};

export function ehIdioma(valor: string): valor is IdiomaId {
  return (IDIOMA_IDS as string[]).includes(valor);
}

export function ehNivel(valor: string): valor is NivelId {
  return (NIVEL_IDS as string[]).includes(valor);
}

export function getCurso(idioma: IdiomaId): Curso {
  return CURSOS[idioma];
}

export function getNivel(idioma: IdiomaId, nivel: NivelId): Nivel {
  return CURSOS[idioma].niveis.find((n) => n.id === nivel)!;
}

/** Chave estável de uma lição, usada pelo progresso local. */
export function chaveLicao(idioma: IdiomaId, nivel: NivelId, licao: string): string {
  return `${idioma}/${nivel}/${licao}`;
}

export interface LicaoLocalizada {
  licao: Licao;
  modulo: Modulo;
  nivel: Nivel;
  /** Posição 1-based dentro do nível. */
  indice: number;
  total: number;
  anterior: { licao: Licao; modulo: Modulo } | null;
  proxima: { licao: Licao; modulo: Modulo } | null;
}

/** Lições de um nível em ordem de leitura, com o módulo de cada uma. */
export function licoesDoNivel(nivel: Nivel): { licao: Licao; modulo: Modulo }[] {
  return nivel.modulos.flatMap((modulo) => modulo.licoes.map((licao) => ({ licao, modulo })));
}

export function getLicao(idioma: IdiomaId, nivelId: NivelId, licaoId: string): LicaoLocalizada | null {
  const nivel = getNivel(idioma, nivelId);
  const lista = licoesDoNivel(nivel);
  const i = lista.findIndex((x) => x.licao.id === licaoId);
  if (i < 0) return null;
  return {
    licao: lista[i].licao,
    modulo: lista[i].modulo,
    nivel,
    indice: i + 1,
    total: lista.length,
    anterior: i > 0 ? lista[i - 1] : null,
    proxima: i < lista.length - 1 ? lista[i + 1] : null,
  };
}

/** Todas as chaves de lição de um idioma, na ordem da trilha. */
export function chavesDoCurso(idioma: IdiomaId): string[] {
  return CURSOS[idioma].niveis.flatMap((nivel) =>
    licoesDoNivel(nivel).map(({ licao }) => chaveLicao(idioma, nivel.id, licao.id)),
  );
}

export function chavesDoNivel(idioma: IdiomaId, nivel: Nivel): string[] {
  return licoesDoNivel(nivel).map(({ licao }) => chaveLicao(idioma, nivel.id, licao.id));
}

export function contarLicoes(curso: Curso): number {
  return curso.niveis.reduce((soma, n) => soma + licoesDoNivel(n).length, 0);
}
