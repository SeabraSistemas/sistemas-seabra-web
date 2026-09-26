import 'server-only';
import { adicionarLinhas, criarAba, lerRanges, listarAbas, rangeA1 } from '@/lib/sheets/server';

/**
 * Trilha das correções do /bovinos, numa aba da própria planilha do cliente
 * (sem depender de mais nada para funcionar). Cada operação é registrada
 * ANTES de gravar, com o valor anterior — é o que permite desfazer. Se o
 * registro falhar, a gravação não acontece.
 *
 * O nome começa com "LOG" de propósito: a checagem de Fazenda ignora abas
 * de log (regras/fazenda.ts).
 */
export const ABA_LOG = 'LOG_SEABRA';
const CABECALHO = ['Quando', 'Lote', 'E-mail', 'Aba', 'Linha', 'ID A', 'Animal', 'Regra', 'Problema', 'Ação', 'Coluna', 'De', 'Para', 'Fase', 'Detalhe'];

async function garantirAba(planilha: string): Promise<boolean> {
  const abas = await listarAbas(planilha);
  if (!abas) return false;
  if (abas.includes(ABA_LOG)) return true;
  if (!(await criarAba(planilha, ABA_LOG))) return false;
  return (await adicionarLinhas(planilha, ABA_LOG, [CABECALHO], 'RAW')) === 1;
}

/** Acrescenta linhas no log (já no formato de CABECALHO). false = não registrou. */
export async function registrarLog(planilha: string, linhas: string[][]): Promise<boolean> {
  if (linhas.length === 0) return true;
  if (!(await garantirAba(planilha))) return false;
  return (await adicionarLinhas(planilha, ABA_LOG, linhas, 'RAW')) === linhas.length;
}

/** O lote já foi gravado? (proteção contra duplo clique / reenvio). null = não deu para ler. */
export async function loteJaExecutado(planilha: string, idLote: string): Promise<boolean | null> {
  const abas = await listarAbas(planilha);
  if (!abas) return null;
  if (!abas.includes(ABA_LOG)) return false;
  const r = await lerRanges(planilha, [rangeA1(ABA_LOG, 'B:B'), rangeA1(ABA_LOG, 'N:N')]);
  if (!r) return null;
  const [lotes, fases] = r;
  return lotes.some((l, i) => l[0] === idLote && (fases[i]?.[0] ?? '') === 'resultado');
}

export function horaBrasilia(agora = Date.now()): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(agora));
}
