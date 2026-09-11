/**
 * As FACETAS de um registro do catálogo — a tradução de `ColunaRegistro` em
 * `FacetaDef`, compartilhada entre a grade (TabelaGenerica) e a exportação.
 *
 * Saiu de TabelaGenerica.tsx pelo motivo de sempre: a rota de exportação
 * precisa das MESMAS facetas, com as MESMAS funções de valor, para filtrar o
 * arquivo do jeito que a tela filtra. Em especial o rótulo da FK: a faceta
 * "Categoria" de `rebanho` compara 'Lactante', não o uuid — e um servidor que
 * comparasse o uuid com 'Lactante' devolvia zero linhas sem erro nenhum.
 */

import { colunasComFaceta, type TabelaCatalogo } from '@/lib/adm/tabelas';
import { SEGMENTO_ROTULO, type ColunaRegistro } from '@/lib/adm/types';
import type { FacetaDef, ValorFaceta } from '@/lib/adm/facetas';

export type LinhaGrade = Record<string, unknown>;

/** Sufixo da coluna sintética com o rótulo de uma FK resolvida (`categoria` →
 *  `categoria__rotulo`). É o mesmo `SUFIXO_ROTULO` de queries.ts, que é
 *  server-only e por isso não pode ser importado por quem roda no browser. */
export const SUFIXO_ROTULO = '__rotulo';

/**
 * A chave estável de cada linha. Espelha `chaveDaTabela()` de queries.ts — `id`
 * em quase todo o schema, `animal_id` nas 1:1 com `rebanho` (que não têm `id`).
 */
export function chaveDaLinha(registro: TabelaCatalogo): string {
  const tem = (c: string) => registro.colunas.some((k) => k.chave === c);
  if (!tem('id') && tem('animal_id')) return 'animal_id';
  return 'id';
}

export function valorDeFaceta(linha: LinhaGrade, coluna: ColunaRegistro): ValorFaceta {
  const rotulo = linha[`${coluna.chave}${SUFIXO_ROTULO}`];
  if (typeof rotulo === 'string' && rotulo.trim() !== '') return rotulo;
  const bruto = linha[coluna.chave];
  if (bruto === null || bruto === undefined) return bruto;
  if (typeof bruto === 'string' || typeof bruto === 'number' || typeof bruto === 'boolean') return bruto;
  // `text[]` do Postgres (propriedades.segmentos): a linha pertence a vários
  // valores da mesma faceta, e o filtro já sabe lidar com o array.
  if (Array.isArray(bruto)) return bruto.map((v) => (v === null ? null : String(v)));
  return String(bruto);
}

/** Rótulos fechados que o painel inteiro já traduz. O resto sai como está — o
 *  catálogo guarda o valor cru do banco, e inventar tradução por heurística
 *  ('nao_lactante' → 'Não lactante') criaria rótulos que não batem com o app. */
export function rotuloDeValor(valor: string): string {
  return SEGMENTO_ROTULO[valor as keyof typeof SEGMENTO_ROTULO] ?? valor;
}

export function facetasDoRegistro(registro: TabelaCatalogo): FacetaDef<LinhaGrade>[] {
  return colunasComFaceta(registro).map((coluna) => ({
    chave: coluna.chave,
    rotulo: coluna.rotulo,
    tipo: coluna.faceta ?? 'texto',
    // O valor da faceta é o RÓTULO da FK quando ele existe. Sem isto, o chip de
    // "Categoria" listaria UUIDs de 36 caracteres.
    valor: (linha) => valorDeFaceta(linha, coluna),
    rotuloValor: rotuloDeValor,
  }));
}
