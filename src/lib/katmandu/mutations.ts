import { appendRow, batchUpdateCells, getSheetValues } from './sheets-server';
import { parseText } from './format';
import { getLocalMap, getLoteMap, resolverComMapa } from './queries';
import { FAIXAS_CATEGORIA, type FaixaCategoria } from './categoria';
import { SEM_LOCAL, SEM_LOCAL_LABEL, SEM_LOTE, SEM_LOTE_LABEL } from './types';

/**
 * Camada de ESCRITA do /katmandu — separada de queries.ts (que é só leitura,
 * mas de onde importamos os mapas de lookup pra resolver ID cru x nome do
 * jeito que a leitura resolve, senão a checagem de origem abaixo erra pra
 * qualquer linha gravada com o ID em vez do nome).
 *
 * Movimentação: mudar local e/ou lote de um conjunto de animais ativos —
 * por recorte (tudo de uma origem) ou animal a animal, mesma mecânica.
 */

/** Lê a aba "local" (lookup), devolve os nomes da coluna B ("Local"), pulando o header. */
export async function getLocais(): Promise<string[]> {
  const rows = await getSheetValues('local');
  if (!rows || rows.length === 0) return [];
  return rows.slice(1).map((r) => parseText(r[1])).filter((v): v is string => v != null);
}

/** Lê a aba "Lotes" (lookup), devolve os nomes da coluna B ("Lote"), pulando o header. */
export async function getLotes(): Promise<string[]> {
  const rows = await getSheetValues('Lotes');
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
 * "Hoje − dias" em America/Sao_Paulo, formatado "DD/MM/AAAA" (mesmo padrão
 * de `dataHojeBR`). Usado só pra escrever em célula de DATA — e só funciona
 * como data de verdade gravando com `valueInputOption: 'USER_ENTERED'`
 * (`batchUpdateCells(updates, 'USER_ENTERED')`), nunca RAW: já quebrou em
 * produção uma vez gravando o serial numérico cru (RAW não reconhece
 * "08/09/2025" como data, e reconhece "45908" só como número puro — a coluna
 * ficava certa no VALOR mas perdia a formatação de data, e a fórmula de
 * "Idade (dias)" passava a exibir o resultado como data também).
 */
function hojeMenosDiasBR(dias: number): string {
  const hojeBR = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const [ano, mes, dia] = hojeBR.split('-').map(Number);
  const alvo = new Date(Date.UTC(ano, mes - 1, dia - dias));
  const dd = String(alvo.getUTCDate()).padStart(2, '0');
  const mm = String(alvo.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${alvo.getUTCFullYear()}`;
}

export type CampoMovimentacao = 'local' | 'lote';

/** Coluna da RebanhoProd, lookup de ID cru x nome e sentinela de vazio de cada campo movível. */
const CAMPOS: Record<
  CampoMovimentacao,
  { coluna: string; mapa: () => Promise<Map<string, string>>; sentinela: string; sentinelaLabel: string }
> = {
  local: { coluna: 'local', mapa: getLocalMap, sentinela: SEM_LOCAL, sentinelaLabel: SEM_LOCAL_LABEL },
  lote: { coluna: 'Lote', mapa: getLoteMap, sentinela: SEM_LOTE, sentinelaLabel: SEM_LOTE_LABEL },
};

export interface Mudanca {
  campo: CampoMovimentacao;
  destino: string;
  /**
   * Com origem (movimentação por recorte), só move quem ainda está nela. Sem
   * origem (seleção animal a animal), move de onde o animal estiver — quem o
   * usuário marcou é o próprio alvo, não um recorte que pode ter mudado.
   */
  origem?: string;
}

/**
 * Move os animais de `ids` que ainda estão ATIVOS: grava cada mudança
 * (local e/ou lote) na linha deles em RebanhoProd e loga uma linha agregada
 * por mudança em `movimentacao` (não por animal — decisão do Felipe; sem
 * origem fixa, o "de" junta as origens distintas: "Baia 03, Sem local").
 *
 * A seleção vem em IDs, não em filtros (lote/destino são resolvidos na tela):
 * o que o usuário viu na conferência é exatamente o que se move, e um animal
 * que trocou de lote na planilha nesse meio-tempo não entra de carona.
 *
 * Relê RebanhoProd fresco (não reusa nenhuma posição de linha vinda de fora)
 * pra minimizar — não eliminar — a janela de corrida com o AppSheet do
 * cliente, que pode editar a mesma planilha a qualquer momento. `origem` e a
 * ausência de baixa são reconferidos nessa leitura fresca; quem não bate mais
 * (ou já está no destino) volta em `ignorados` em vez de ser movido às cegas.
 * Não há compare-and-swap por célula na Sheets API; risco aceito pro volume
 * de uso interno atual.
 */
export async function moverAnimais(
  ids: string[],
  mudancas: Mudanca[],
): Promise<{ movidos: number; ignorados: number; logFalhou?: boolean }> {
  const alvo = new Set(ids);
  if (alvo.size === 0 || mudancas.length === 0) return { movidos: 0, ignorados: alvo.size };

  const [rows, ...mapas] = await Promise.all([
    getSheetValues('RebanhoProd'),
    ...mudancas.map((m) => CAMPOS[m.campo].mapa()),
  ]);
  if (!rows || rows.length === 0) return { movidos: 0, ignorados: alvo.size };

  const header = rows[0];
  const idxId = header.indexOf('ID animal');
  const idxBaixa = header.indexOf('Causa da baixa');
  const idxCampos = mudancas.map((m) => header.indexOf(CAMPOS[m.campo].coluna));
  if (idxId === -1 || idxBaixa === -1 || idxCampos.includes(-1)) return { movidos: 0, ignorados: alvo.size };

  const updates: { range: string; value: string }[] = [];
  const casados = new Set<string>();
  const origensVistas = mudancas.map(() => new Set<string>());
  let linhasMovidas = 0;

  rows.slice(1).forEach((row, i) => {
    const idAnimal = parseText(row[idxId]);
    if (!idAnimal || !alvo.has(idAnimal) || parseText(row[idxBaixa]) != null) return;
    // Resolvido do mesmo jeito que a leitura (queries.ts): a célula pode
    // trazer o nome direto ou o ID cru da aba lookup — comparar cru contra
    // `origem` (que é sempre o nome, vindo do <select>) erraria pra metade
    // dos formatos gravados na planilha.
    const atuais = mudancas.map((m, k) => resolverComMapa(row[idxCampos[k]], mapas[k]) ?? CAMPOS[m.campo].sentinela);
    if (mudancas.some((m, k) => m.origem != null && atuais[k] !== m.origem)) return;
    const numeroDaLinha = i + 2; // linha 1 é header, dados começam na 2
    let mexeu = false;
    mudancas.forEach((m, k) => {
      if (atuais[k] === m.destino) return;
      updates.push({ range: `RebanhoProd!${colunaParaLetra(idxCampos[k])}${numeroDaLinha}`, value: m.destino });
      origensVistas[k].add(atuais[k]);
      mexeu = true;
    });
    if (!mexeu) return;
    casados.add(idAnimal);
    linhasMovidas += 1;
  });

  const ignorados = alvo.size - casados.size;
  if (updates.length === 0) return { movidos: 0, ignorados };

  const ok = await batchUpdateCells(updates);
  if (!ok) return { movidos: 0, ignorados: alvo.size };

  let logFalhou = false;
  for (const [k, m] of mudancas.entries()) {
    if (origensVistas[k].size === 0) continue;
    const { sentinela, sentinelaLabel } = CAMPOS[m.campo];
    const de = [...origensVistas[k]].map((o) => (o === sentinela ? sentinelaLabel : o)).join(', ');
    const logOk = await appendRow('movimentacao', [crypto.randomUUID(), de, m.destino, dataHojeBR()]);
    if (!logOk) logFalhou = true;
  }
  return { movidos: linhasMovidas, ignorados, logFalhou };
}

/**
 * Corrige a categoria de um lote de animais empurrando a "Data de
 * nascimento" pro primeiro dia da faixa `faixa` (hoje − diasMin). Categoria e
 * Idade (dias) são fórmulas vivas na RebanhoProd — não escrevemos Categoria
 * em si, o sexo já gravado de cada animal decide sozinho o rótulo final
 * (Garrote vs Recria etc.) a partir da nova idade.
 *
 * Mesmo racional de releitura fresca de `moverAnimais`: relê RebanhoProd na
 * hora (não reusa posição de linha vinda de fora) e pula quem já recebeu
 * baixa nesse meio-tempo.
 */
export async function alterarCategoria(
  faixa: FaixaCategoria,
  ids: string[],
): Promise<{ alterados: number; ignorados: number }> {
  const alvo = new Set(ids);
  if (alvo.size === 0) return { alterados: 0, ignorados: 0 };

  const diasMin = FAIXAS_CATEGORIA.find((f) => f.valor === faixa)?.diasMin;
  if (diasMin == null) return { alterados: 0, ignorados: alvo.size };

  const rows = await getSheetValues('RebanhoProd');
  if (!rows || rows.length === 0) return { alterados: 0, ignorados: alvo.size };

  const header = rows[0];
  const idxId = header.indexOf('ID animal');
  const idxNascimento = header.indexOf('Data de nascimento');
  const idxBaixa = header.indexOf('Causa da baixa');
  if (idxId === -1 || idxNascimento === -1 || idxBaixa === -1) return { alterados: 0, ignorados: alvo.size };

  const novaData = hojeMenosDiasBR(diasMin);
  const letraNascimento = colunaParaLetra(idxNascimento);
  const updates: { range: string; value: string }[] = [];
  const casados = new Set<string>();

  rows.slice(1).forEach((row, i) => {
    const idAnimal = parseText(row[idxId]);
    const baixa = parseText(row[idxBaixa]);
    if (!idAnimal || !alvo.has(idAnimal) || baixa != null) return;
    casados.add(idAnimal);
    const numeroDaLinha = i + 2;
    updates.push({ range: `RebanhoProd!${letraNascimento}${numeroDaLinha}`, value: novaData });
  });

  const ignorados = alvo.size - casados.size;
  if (updates.length === 0) return { alterados: 0, ignorados };

  const ok = await batchUpdateCells(updates, 'USER_ENTERED');
  return ok ? { alterados: updates.length, ignorados } : { alterados: 0, ignorados: alvo.size };
}
