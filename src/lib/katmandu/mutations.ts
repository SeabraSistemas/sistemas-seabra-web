import { appendRow, batchUpdateCells, getSheetValues } from './sheets-server';
import { parseText } from './format';
import { SEM_LOCAL, SEM_LOCAL_LABEL } from './types';

/**
 * Camada de ESCRITA do /katmandu — separada de queries.ts (que é só leitura).
 * Único ponto de mutação hoje: mover animais ativos de um local pro outro.
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
 * Move todos os animais ATIVOS que estão em `origem` pra `destino`: atualiza
 * a coluna `local` de cada linha casada em RebanhoProd e loga uma linha
 * agregada em `movimentacao` (não por animal — a seleção por local de
 * origem garante que todo animal movido tem o mesmo `de`).
 *
 * Relê RebanhoProd fresco (não reusa nenhuma posição de linha vinda de fora)
 * pra minimizar — não eliminar — a janela de corrida com o AppSheet do
 * cliente, que pode editar a mesma planilha a qualquer momento. Não há
 * compare-and-swap por célula na Sheets API; risco aceito pro volume de uso
 * interno atual.
 */
export async function moverAnimais(
  origem: string,
  destino: string,
): Promise<{ movidos: number; logFalhou?: boolean }> {
  const rows = await getSheetValues('RebanhoProd');
  if (!rows || rows.length === 0) return { movidos: 0 };

  const header = rows[0];
  const idxId = header.indexOf('ID animal');
  const idxLocal = header.indexOf('local');
  const idxBaixa = header.indexOf('Causa da baixa');
  if (idxId === -1 || idxLocal === -1 || idxBaixa === -1) return { movidos: 0 };

  const letraLocal = colunaParaLetra(idxLocal);
  const updates: { range: string; value: string }[] = [];

  rows.slice(1).forEach((row, i) => {
    const idAnimal = parseText(row[idxId]);
    const local = parseText(row[idxLocal]) ?? SEM_LOCAL;
    const baixa = parseText(row[idxBaixa]);
    if (!idAnimal || baixa != null || local !== origem) return;
    const numeroDaLinha = i + 2; // linha 1 é header, dados começam na 2
    updates.push({ range: `RebanhoProd!${letraLocal}${numeroDaLinha}`, value: destino });
  });

  if (updates.length === 0) return { movidos: 0 };

  const ok = await batchUpdateCells(updates);
  if (!ok) return { movidos: 0 };

  const origemLog = origem === SEM_LOCAL ? SEM_LOCAL_LABEL : origem;
  const logOk = await appendRow('movimentacao', [crypto.randomUUID(), origemLog, destino, dataHojeBR()]);
  return { movidos: updates.length, logFalhou: !logOk };
}
