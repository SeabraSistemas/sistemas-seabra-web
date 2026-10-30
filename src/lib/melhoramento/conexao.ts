/**
 * CONEXÃO GENÉTICA ENTRE FAZENDAS — o que decide se um EBV de uma fazenda se
 * compara com o de outra.
 *
 * O BLUP só põe duas fazendas na mesma régua quando elas compartilham
 * parentesco: um reprodutor com filhas nas duas (ou parentes próximos). Sem
 * isso, o grupo de contemporâneas de cada fazenda absorve toda a diferença
 * entre elas, e "o melhor bode da fazenda A tem EBV maior que o melhor da B"
 * não quer dizer nada — cada EBV está medido contra a própria fazenda.
 *
 * Duas contas, ambas sobre o pedigree de todas as fazendas da espécie:
 *
 *   reprodutoresConectores   reprodutores (pelo id do app) com filhas em 2+
 *                            fazendas. É a conexão de verdade.
 *   candidatosMesmoAnimal    reprodutores de fazendas DIFERENTES com o mesmo
 *                            nome ou o mesmo número (normalizados). Hoje o app
 *                            não tem cadastro único de reprodutores, então o
 *                            mesmo bode comprado ou usado em IA vira um animal
 *                            novo em cada fazenda. Estes são CANDIDATOS: nome
 *                            repetido pode ser coincidência. Só a página
 *                            interna /adm/melhoramento os lista — nunca a ficha
 *                            de um cliente, que não pode ver animal de outro.
 */

import type { AnimalEntrada } from '@/lib/melhoramento/tipos';

export interface ReprodutorConector {
  animalId: number;
  propriedades: number[];
  filhas: number;
}

function ehFemea(sexo: string | null): boolean {
  if (!sexo) return false;
  return sexo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .startsWith('feme');
}

/** Filhas de cada reprodutor, por fazenda da FILHA. */
function filhasPorReprodutor(animais: readonly AnimalEntrada[]): Map<number, Map<number, number>> {
  const saida = new Map<number, Map<number, number>>();
  for (const a of animais) {
    if (a.paiId == null || !ehFemea(a.sexo)) continue;
    const porFazenda = saida.get(a.paiId) ?? new Map<number, number>();
    porFazenda.set(a.propriedadeId, (porFazenda.get(a.propriedadeId) ?? 0) + 1);
    saida.set(a.paiId, porFazenda);
  }
  return saida;
}

export function reprodutoresConectores(animais: readonly AnimalEntrada[]): ReprodutorConector[] {
  const saida: ReprodutorConector[] = [];
  for (const [animalId, porFazenda] of filhasPorReprodutor(animais)) {
    if (porFazenda.size < 2) continue;
    saida.push({
      animalId,
      propriedades: [...porFazenda.keys()].sort((a, b) => a - b),
      filhas: [...porFazenda.values()].reduce((s, n) => s + n, 0),
    });
  }
  return saida.sort((a, b) => b.filhas - a.filhas || a.animalId - b.animalId);
}

/** 'Bode Ágata-II ' → 'BODEAGATAII'. Caixa, acento, espaço e pontuação não distinguem animal. */
export function normalizarIdentificacao(v: string | null): string {
  if (!v) return '';
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Mínimos de tamanho da chave. Nome com menos de 3 letras ("A", "B2") e número
 * com menos de 5 dígitos ("12", "0034") se repetem entre fazendas por acaso —
 * são numerações locais, não identidade. Número de 5+ caracteres já parece
 * registro genealógico ou brinco de origem.
 */
export const MINIMO_CHAVE_NOME = 3;
export const MINIMO_CHAVE_NUMERO = 5;

export interface CandidatoMesmoAnimal {
  criterio: 'nome' | 'numero';
  chave: string;
  reprodutores: {
    animalId: number;
    propriedadeId: number;
    numero: string | null;
    nome: string | null;
    filhas: number;
  }[];
}

export function candidatosMesmoAnimal(animais: readonly AnimalEntrada[]): CandidatoMesmoAnimal[] {
  const filhas = filhasPorReprodutor(animais);
  const reprodutores = animais.filter((a) => filhas.has(a.animalId));
  const saida: CandidatoMesmoAnimal[] = [];
  for (const criterio of ['nome', 'numero'] as const) {
    const grupos = new Map<string, AnimalEntrada[]>();
    for (const r of reprodutores) {
      const chave = normalizarIdentificacao(criterio === 'nome' ? r.nome : r.numero);
      if (chave.length < (criterio === 'nome' ? MINIMO_CHAVE_NOME : MINIMO_CHAVE_NUMERO)) continue;
      const lista = grupos.get(chave) ?? [];
      lista.push(r);
      grupos.set(chave, lista);
    }
    for (const [chave, lista] of grupos) {
      if (new Set(lista.map((r) => r.propriedadeId)).size < 2) continue;
      saida.push({
        criterio,
        chave,
        reprodutores: lista
          .map((r) => ({
            animalId: r.animalId,
            propriedadeId: r.propriedadeId,
            numero: r.numero,
            nome: r.nome,
            filhas: [...(filhas.get(r.animalId)?.values() ?? [])].reduce((s, n) => s + n, 0),
          }))
          .sort((a, b) => a.propriedadeId - b.propriedadeId || a.animalId - b.animalId),
      });
    }
  }
  return saida.sort(
    (a, b) => a.criterio.localeCompare(b.criterio) || b.reprodutores.length - a.reprodutores.length || a.chave.localeCompare(b.chave),
  );
}
