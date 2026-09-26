import 'server-only';
import { lerRanges, listarAbas, rangeA1 } from '@/lib/sheets/server';
import { criarCache } from '@/lib/sheets/cache';
import { clientePorSlug, planilhaDe, type SlugCliente } from '@/lib/bovinos/clientes';
import { coluna, letraColuna, montarTabela } from '@/lib/bovinos/tabela';
import { candidatasLinhaVazia } from '@/lib/bovinos/regras/estrutura';
import { montarRelatorio, type EntradaRelatorio } from '@/lib/bovinos/relatorio';
import { hojeSerial } from '@/lib/bovinos/texto';
import type { Relatorio } from '@/lib/bovinos/tipos';

/**
 * Leitura das planilhas para o /bovinos. Três requisições por cliente:
 *  1. lista de abas;
 *  2. valores exibidos de RebanhoProd, Reproduçao e partos + a linha 1 de
 *     todas as outras abas (para achar a coluna Fazenda);
 *  3. as colunas Fazenda, as colunas de fórmula do RebanhoProd e as linhas
 *     candidatas a "em branco" — as duas últimas no render FORMULA.
 * Pesagem (33 mil linhas na Benoni) nunca é lida.
 *
 * O relatório calculado fica 5 min em cache por cliente. Depois de corrigir,
 * a página passa `fresco` para ler de novo (o cache é por módulo — um route
 * handler limpando o seu não limpa o da página; ver lib/fi-fcg/queries.ts).
 */
export interface LeituraRelatorio {
  relatorio: Relatorio | null;
  configurado: boolean;
  stale: boolean;
  carregadoEm: number | null;
  erro: string | null;
}

const cache = criarCache<Relatorio>(5 * 60 * 1000);

export async function lerEntrada(spreadsheetId: string, slug: SlugCliente): Promise<EntradaRelatorio> {
  const cliente = clientePorSlug(slug)!;
  const abas = await listarAbas(spreadsheetId);
  if (!abas) throw new Error('Não foi possível listar as abas da planilha.');

  const principais = ['RebanhoProd', 'Reproduçao', ...cliente.abasParto].filter((a) => abas.includes(a));
  const outras = abas.filter((a) => !principais.includes(a));
  const r1 = await lerRanges(spreadsheetId, [...principais.map((a) => rangeA1(a)), ...outras.map((a) => rangeA1(a, '1:1'))]);
  if (!r1) throw new Error('Falha ao ler a planilha.');
  const valores = new Map<string, string[][]>();
  principais.forEach((a, i) => valores.set(a, r1[i]));

  // Onde está a coluna Fazenda em cada aba.
  const alvosFazenda: { aba: string; letra: string }[] = [];
  const cabecalhos = new Map<string, string[][]>();
  principais.forEach((a) => cabecalhos.set(a, (valores.get(a) ?? []).slice(0, 1)));
  outras.forEach((a, i) => cabecalhos.set(a, r1[principais.length + i]));
  for (const [aba, cab] of cabecalhos) {
    const tab = montarTabela(aba, cab);
    if (!tab) continue;
    const i = coluna(tab, 'Fazenda');
    if (i >= 0) alvosFazenda.push({ aba, letra: letraColuna(i) });
  }

  // Colunas de fórmula e linhas candidatas a vazia, no render FORMULA.
  const rebanho = montarTabela('RebanhoProd', valores.get('RebanhoProd'));
  const alvosFormula: { col: string; letra: string }[] = [];
  let candidatas: number[] = [];
  if (rebanho) {
    for (const c of cliente.colunasFormula) {
      const i = coluna(rebanho, c);
      if (i >= 0) alvosFormula.push({ col: c, letra: letraColuna(i) });
    }
    candidatas = candidatasLinhaVazia(rebanho).slice(0, 200);
  }

  const [rFaz, rForm] = await Promise.all([
    lerRanges(spreadsheetId, alvosFazenda.map((x) => rangeA1(x.aba, `${x.letra}:${x.letra}`))),
    lerRanges(spreadsheetId, [
      ...alvosFormula.map((x) => rangeA1('RebanhoProd', `${x.letra}:${x.letra}`)),
      ...candidatas.map((l) => rangeA1('RebanhoProd', `${l}:${l}`)),
    ], 'FORMULA'),
  ]);
  if (!rFaz || !rForm) throw new Error('Falha ao ler colunas de Fazenda/fórmulas.');

  const col = (m: string[][]) => m.map((l) => l[0] ?? '');
  return {
    rebanho: valores.get('RebanhoProd') ?? null,
    reproducao: valores.get('Reproduçao') ?? null,
    partos: cliente.abasParto.map((aba) => ({ aba, valores: valores.get(aba) ?? null })),
    fazendas: alvosFazenda.map((x, i) => ({ aba: x.aba, valores: col(rFaz[i]) })),
    formulas: alvosFormula.map((x, i) => ({ col: x.col, valores: col(rForm[i]) })),
    linhasCompletas: candidatas.map((linha, k) => ({ linha, valores: rForm[alvosFormula.length + k][0] ?? [] })),
  };
}

export async function obterRelatorio(slug: SlugCliente, opcoes: { fresco?: boolean } = {}): Promise<LeituraRelatorio> {
  const cliente = clientePorSlug(slug);
  const id = cliente ? planilhaDe(cliente) : null;
  if (!cliente || !id) return { relatorio: null, configurado: false, stale: false, carregadoEm: null, erro: null };

  const chave = `bovinos:${slug}`;
  if (opcoes.fresco) cache.invalidar(chave);
  try {
    const r = await cache.obter(chave, async () => montarRelatorio(await lerEntrada(id, slug), cliente, hojeSerial()));
    return { relatorio: r.valor, configurado: true, stale: r.stale, carregadoEm: r.carregadoEm, erro: null };
  } catch (err) {
    console.error('[bovinos] falha ao montar relatório', slug, err);
    return { relatorio: null, configurado: true, stale: false, carregadoEm: null, erro: err instanceof Error ? err.message : 'Falha ao ler a planilha.' };
  }
}
