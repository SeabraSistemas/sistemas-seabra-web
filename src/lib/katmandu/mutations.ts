import { appendRow, batchUpdateCells, getSheetValues } from './sheets-server';
import { parseText } from './format';
import { SEM_LOCAL, SEM_LOCAL_LABEL } from './types';

/**
 * Camada de ESCRITA do /katmandu — separada de queries.ts (que é só leitura).
 * Único ponto de mutação hoje: mover um conjunto de animais ativos de um
 * local pro outro.
 */

/** Lê a aba "local" (lookup), devolve os nomes da coluna B ("Local"), pulando o header. */
export async function getLocais(): Promise<string[]> {
  const rows = await getSheetValues('local');
  if (!rows || rows.length === 0) return [];
  return rows.slice(1).map((r) => parseText(r[1])).filter((v): v is string => v != null);
}

/** Índice de coluna (0-based) => letra A1 ("DA" pra índice 104). */
function colunaParaLetra(indiceZeroBased: number): string {
  let n = indiceZeroBased + 1;
  let letra = '';
  while (n > 0) {
    const resto = (n - 1) % 26;
    letra = String.fromCharCode(65 + resto) + letra;
    n = Math.floor((n - 1) / 26);
  }
  return letra;
}

function dataHojeBR(): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

/**
 * Move os animais de `ids` que ainda estão ATIVOS em `origem` pra `destino`:
 * atualiza a coluna `local` de cada linha casada em RebanhoProd e loga uma
 * linha agregada em `movimentacao` (não por animal — a origem é a mesma pra
 * todos, então uma linha `de → para` descreve o lote inteiro).
 *
 * A seleção vem em IDs, não em filtros (lote/destino são resolvidos na tela):
 * o que o usuário viu na conferência é exatamente o que se move, e um animal
 * que trocou de lote na planilha nesse meio-tempo não entra de carona.
 *
 * Relê RebanhoProd fresco (não reusa nenhuma posição de linha vinda de fora)
 * pra minimizar — não eliminar — a janela de corrida com o AppSheet do
 * cliente, que pode editar a mesma planilha a qualquer momento. `origem` e a
 * ausência de baixa são reconferidos nessa leitura fresca; quem não bate mais
 * volta em `ignorados` em vez de ser movido às cegas. Não há
 * compare-and-swap por célula na Sheets API; risco aceito pro volume de uso
 * interno atual.
 */
export async function moverAnimais(
  origem: string,
  destino: string,
  ids: string[],
): Promise<{ movidos: number; ignorados: number; logFalhou?: boolean }> {
  const alvo = new Set(ids);
  if (alvo.size === 0) return { movidos: 0, ignorados: 0 };

  const rows = await getSheetValues('RebanhoProd');
  if (!rows || rows.length === 0) return { movidos: 0, ignorados: alvo.size };

  const header = rows[0];
  const idxId = header.indexOf('ID animal');
  const idxLocal = header.indexOf('local');
  const idxBaixa = header.indexOf('Causa da baixa');
  if (idxId === -1 || idxLocal === -1 || idxBaixa === -1) return { movidos: 0, ignorados: alvo.size };

  const letraLocal = colunaParaLetra(idxLocal);
  const updates: { range: string; value: string }[] = [];
  const casados = new Set<string>();

  rows.slice(1).forEach((row, i) => {
    const idAnimal = parseText(row[idxId]);
    const local = parseText(row[idxLocal]) ?? SEM_LOCAL;
    const baixa = parseText(row[idxBaixa]);
    if (!idAnimal || !alvo.has(idAnimal) || baixa != null || local !== origem) return;
    casados.add(idAnimal);
    const numeroDaLinha = i + 2; // linha 1 é header, dados começam na 2
    updates.push({ range: `RebanhoProd!${letraLocal}${numeroDaLinha}`, value: destino });
  });

  const ignorados = alvo.size - casados.size;
  if (updates.length === 0) return { movidos: 0, ignorados };

  const ok = await batchUpdateCells(updates);
  if (!ok) return { movidos: 0, ignorados: alvo.size };

  const origemLog = origem === SEM_LOCAL ? SEM_LOCAL_LABEL : origem;
  const logOk = await appendRow('movimentacao', [crypto.randomUUID(), origemLog, destino, dataHojeBR()]);
  return { movidos: updates.length, ignorados, logFalhou: !logOk };
}
