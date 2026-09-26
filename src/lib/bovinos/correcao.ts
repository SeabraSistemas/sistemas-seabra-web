import 'server-only';
import { clientePorSlug, planilhaDe, type SlugCliente } from '@/lib/bovinos/clientes';
import { lerEntrada } from '@/lib/bovinos/leitura';
import { montarRelatorio } from '@/lib/bovinos/relatorio';
import { coletarChavesEmUso, montarLote, type Lote } from '@/lib/bovinos/lote';
import { coluna, montarTabela } from '@/lib/bovinos/tabela';
import { normalizarFormula } from '@/lib/bovinos/formulas';
import { hojeSerial, t } from '@/lib/bovinos/texto';

/** A escrita só existe com a flag ligada — desligar a flag desarma o painel sem deploy de código. */
export function escritaHabilitada(): boolean {
  return process.env.BOVINOS_ESCRITA_HABILITADA === '1';
}

/**
 * Prévia de correção: relê a planilha AGORA (nunca do cache), recalcula os
 * problemas e monta o lote com os ids escolhidos. Um id que deixou de ser
 * corrigível volta em `recusados`.
 */
export async function prepararLote(
  slug: SlugCliente,
  ids: string[],
  email: string,
): Promise<{ lote: Lote | null; recusados: { id: string; motivo: string }[]; erro: string | null }> {
  const cliente = clientePorSlug(slug);
  const planilha = cliente ? planilhaDe(cliente) : null;
  if (!cliente || !planilha) return { lote: null, recusados: [], erro: 'Planilha não configurada.' };

  let entrada;
  try {
    entrada = await lerEntrada(planilha, slug);
  } catch (err) {
    return { lote: null, recusados: [], erro: err instanceof Error ? err.message : 'Falha ao ler a planilha.' };
  }
  const relatorio = montarRelatorio(entrada, cliente, hojeSerial());

  const reb = montarTabela('RebanhoProd', entrada.rebanho);
  const iA = reb ? coluna(reb, 'ID A') : -1;
  const idADaLinha = (linha: number) => (iA >= 0 && linha >= 2 ? t(entrada.rebanho?.[linha - 1]?.[iA]) : '');
  const formulas = new Map(entrada.formulas.map((f) => [f.col, f.valores]));

  const { lote, recusados } = montarLote({
    problemas: relatorio.problemas,
    ids,
    cliente: slug,
    planilha,
    email,
    agora: Date.now(),
    chavesEmUso: coletarChavesEmUso([entrada.rebanho, entrada.reproducao, ...entrada.partos.map((p) => p.valores)]),
    vizinhos: (linha) => ({ acima: idADaLinha(linha - 1), abaixo: idADaLinha(linha + 1) }),
    formulaDoadora: (col, linha) => normalizarFormula(formulas.get(col)?.[linha - 1] ?? '', linha),
  });
  return { lote, recusados, erro: null };
}
