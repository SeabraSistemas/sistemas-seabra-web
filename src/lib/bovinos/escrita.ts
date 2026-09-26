import 'server-only';
import { batchUpdatePlanilha, lerRanges, metadadosAbas, rangeA1, type RenderValor } from '@/lib/sheets/server';
import { coluna, letraColuna, montarTabela } from '@/lib/bovinos/tabela';
import { ehFormula, normalizarFormula } from '@/lib/bovinos/formulas';
import { horaBrasilia, loteJaExecutado, registrarLog } from '@/lib/bovinos/log';
import { t } from '@/lib/bovinos/texto';
import type { ItemLote, Lote, OpLote } from '@/lib/bovinos/lote';

/**
 * Gravação de um lote já conferido e assinado. Sequência:
 *  1. relê as células-alvo e confere, item por item, que nada mudou desde a
 *     prévia (linha ainda é o mesmo animal; cada célula ainda tem o `de`;
 *     fórmula doadora igual; linha a excluir ainda vazia e no mesmo lugar)
 *     — um item com qualquer diferença é pulado INTEIRO;
 *  2. registra no LOG_SEABRA o valor anterior de cada operação (sem log, não grava);
 *  3. grava tudo num único batchUpdate (atômico);
 *  4. relê e confere cada célula gravada.
 */

export interface ResultadoLote {
  ok: boolean;
  erro: string | null;
  /** Operações (células/linhas) gravadas. */
  aplicados: number;
  itensAplicados: number;
  pulados: { problemaId: string; animal: string; motivo: string }[];
  verificacao: { conferidos: number; divergencias: string[] };
}

/** Uma gravação por planilha por vez, nesta instância. */
const emAndamento = new Set<string>();

type Leitor = { valor: (aba: string, col: string, linha: number) => string; formula: (aba: string, col: string, linha: number) => string; linhaFormula: (aba: string, linha: number) => string[] };

async function ler(
  planilha: string,
  cols: Map<string, Map<string, number>>,
  pedidos: { formatado: Set<string>; formula: Set<string>; linhas: Set<string> },
): Promise<Leitor | null> {
  const chaves = { formatado: [...pedidos.formatado], formula: [...pedidos.formula], linhas: [...pedidos.linhas] };
  const range = (k: string, render: 'col' | 'linha') => {
    const [aba, x] = k.split('|');
    if (render === 'linha') return rangeA1(aba, `${x}:${x}`);
    const L = letraColuna(cols.get(aba)!.get(x)!);
    return rangeA1(aba, `${L}:${L}`);
  };
  const lerTodos = async (lista: string[], tipo: 'col' | 'linha', render: RenderValor) => (lista.length ? await lerRanges(planilha, lista.map((k) => range(k, tipo)), render) : []);
  const [rf, rF, rl] = await Promise.all([
    lerTodos(chaves.formatado, 'col', 'FORMATTED_VALUE'),
    lerTodos(chaves.formula, 'col', 'FORMULA'),
    lerTodos(chaves.linhas, 'linha', 'FORMULA'),
  ]);
  if (!rf || !rF || !rl) return null;
  const mf = new Map(chaves.formatado.map((k, i) => [k, rf[i]]));
  const mF = new Map(chaves.formula.map((k, i) => [k, rF[i]]));
  const ml = new Map(chaves.linhas.map((k, i) => [k, rl[i]]));
  return {
    valor: (aba, col, linha) => t(mf.get(`${aba}|${col}`)?.[linha - 1]?.[0]),
    formula: (aba, col, linha) => t(mF.get(`${aba}|${col}`)?.[linha - 1]?.[0]),
    linhaFormula: (aba, linha) => (ml.get(`${aba}|${linha}`)?.[0] ?? []).map((c) => t(c)),
  };
}

function motivoDoItem(item: ItemLote, lt: Leitor, cols: Map<string, Map<string, number>>): string | null {
  const temCol = (aba: string, col: string) => cols.get(aba)?.has(col) ?? false;
  if (item.guarda) {
    const g = item.guarda;
    const idA = temCol(g.aba, 'ID A') ? lt.valor(g.aba, 'ID A', g.linha) : '';
    const idAnimal = temCol(g.aba, 'ID animal') ? lt.valor(g.aba, 'ID animal', g.linha) : '';
    if (idA !== t(g.idA) || idAnimal !== t(g.idAnimal)) return `A linha ${g.linha} agora é ${idAnimal || '(vazia)'}${idA ? ` / ${idA}` : ''} — a planilha mudou.`;
  }
  for (const o of item.ops) {
    if (o.tipo === 'valor') {
      if (!temCol(o.aba, o.col)) return `A aba ${o.aba} não tem a coluna "${o.col}" (ou ela aparece duas vezes).`;
      const atual = lt.valor(o.aba, o.col, o.linha);
      if (atual !== t(o.de)) return `${o.col} na linha ${o.linha} agora é "${atual || '(vazio)'}", não "${o.de || '(vazio)'}".`;
    } else if (o.tipo === 'formula') {
      if (!temCol(o.aba, o.col)) return `Coluna "${o.col}" não encontrada.`;
      if (lt.formula(o.aba, o.col, o.linha)) return `${o.col} na linha ${o.linha} já tem valor.`;
      const doadora = lt.formula(o.aba, o.col, o.doadora);
      if (!ehFormula(doadora) || normalizarFormula(doadora, o.doadora) !== o.formula) return `A fórmula da linha ${o.doadora} (${o.col}) mudou.`;
    } else {
      const literais = lt.linhaFormula(o.aba, o.linha).filter((c) => c && !ehFormula(c));
      if (literais.length) return `A linha ${o.linha} não está mais vazia.`;
      const acima = temCol(o.aba, 'ID A') ? lt.valor(o.aba, 'ID A', o.linha - 1) : '';
      const abaixo = temCol(o.aba, 'ID A') ? lt.valor(o.aba, 'ID A', o.linha + 1) : '';
      if (acima !== t(o.acima) || abaixo !== t(o.abaixo)) return `As linhas vizinhas da ${o.linha} mudaram — outra linha entrou ou saiu.`;
    }
  }
  return null;
}

function gridCelula(sheetId: number, linha: number, ci: number) {
  return { sheetId, startRowIndex: linha - 1, endRowIndex: linha, startColumnIndex: ci, endColumnIndex: ci + 1 };
}

export async function executarLote(lote: Lote): Promise<ResultadoLote> {
  const vazio = (erro: string): ResultadoLote => ({ ok: false, erro, aplicados: 0, itensAplicados: 0, pulados: [], verificacao: { conferidos: 0, divergencias: [] } });
  if (emAndamento.has(lote.planilha)) return vazio('Já há uma gravação em andamento nesta planilha. Espere terminar.');
  emAndamento.add(lote.planilha);
  try {
    const ja = await loteJaExecutado(lote.planilha, lote.idLote);
    if (ja === null) return vazio('Não foi possível ler o LOG_SEABRA para conferir se o lote já foi gravado.');
    if (ja) return vazio('Este lote já foi gravado. Leia a planilha de novo e faça uma nova prévia.');

    const meta = await metadadosAbas(lote.planilha);
    if (!meta) return vazio('Não foi possível ler as abas da planilha.');
    const sheetId = new Map(meta.map((m) => [m.titulo, m.sheetId]));

    // Colunas de cada aba envolvida, pelo nome.
    const abas = new Set<string>();
    for (const i of lote.itens) {
      if (i.guarda) abas.add(i.guarda.aba);
      for (const o of i.ops) abas.add(o.aba);
    }
    const listaAbas = [...abas];
    for (const aba of listaAbas) if (!sheetId.has(aba)) return vazio(`A aba ${aba} não existe mais.`);
    const cabs = await lerRanges(lote.planilha, listaAbas.map((a) => rangeA1(a, '1:1')));
    if (!cabs) return vazio('Não foi possível ler os cabeçalhos.');
    const cols = new Map<string, Map<string, number>>();
    listaAbas.forEach((aba, k) => {
      const tab = montarTabela(aba, cabs[k]);
      const m = new Map<string, number>();
      if (tab) for (const h of new Set(tab.cabecalho)) {
        const i = coluna(tab, h);
        if (h && i >= 0) m.set(h, i);
      }
      cols.set(aba, m);
    });

    // O que precisa ser relido.
    const pedidos = { formatado: new Set<string>(), formula: new Set<string>(), linhas: new Set<string>() };
    const pedirCol = (aba: string, col: string, render: 'formatado' | 'formula') => {
      if (cols.get(aba)?.has(col)) pedidos[render].add(`${aba}|${col}`);
    };
    for (const i of lote.itens) {
      if (i.guarda) {
        pedirCol(i.guarda.aba, 'ID A', 'formatado');
        pedirCol(i.guarda.aba, 'ID animal', 'formatado');
      }
      for (const o of i.ops) {
        if (o.tipo === 'valor') pedirCol(o.aba, o.col, 'formatado');
        else if (o.tipo === 'formula') pedirCol(o.aba, o.col, 'formula');
        else {
          pedirCol(o.aba, 'ID A', 'formatado');
          pedidos.linhas.add(`${o.aba}|${o.linha}`);
        }
      }
    }
    const antes = await ler(lote.planilha, cols, pedidos);
    if (!antes) return vazio('Falha ao reler a planilha antes de gravar.');

    // 1) Conferência item a item.
    const pulados: ResultadoLote['pulados'] = [];
    const aceitos: ItemLote[] = [];
    for (const i of lote.itens) {
      const motivo = motivoDoItem(i, antes, cols);
      if (motivo) pulados.push({ problemaId: i.problemaId, animal: i.animal, motivo });
      else aceitos.push(i);
    }
    if (aceitos.length === 0) return { ...vazio('Nada para gravar: todos os itens mudaram desde a prévia.'), pulados };

    // 2) Log ANTES de gravar.
    const quando = horaBrasilia();
    const linhaLog = (i: ItemLote, o: OpLote, fase: string, detalhe = ''): string[] => [
      quando,
      lote.idLote,
      lote.email,
      o.aba,
      String(o.linha),
      i.guarda?.idA ?? '',
      i.animal,
      i.regra,
      i.problemaId,
      o.tipo === 'valor' ? 'valor' : o.tipo === 'formula' ? `fórmula da linha ${o.doadora}` : 'excluir linha',
      o.tipo === 'excluir' ? '' : o.col,
      o.tipo === 'valor' ? o.de : o.tipo === 'excluir' ? JSON.stringify(antes.linhaFormula(o.aba, o.linha)) : '',
      o.tipo === 'valor' ? o.para : '',
      fase,
      detalhe,
    ];
    const registrado = await registrarLog(lote.planilha, aceitos.flatMap((i) => i.ops.map((o) => linhaLog(i, o, 'antes'))));
    if (!registrado) return { ...vazio('Não foi possível registrar no LOG_SEABRA — nada foi gravado.'), pulados };

    // 3) Um batchUpdate atômico.
    const requests: object[] = [];
    const exclusoes: { aba: string; linha: number }[] = [];
    for (const i of aceitos) for (const o of i.ops) {
      const sid = sheetId.get(o.aba)!;
      if (o.tipo === 'valor') {
        const ci = cols.get(o.aba)!.get(o.col)!;
        requests.push({
          updateCells: {
            range: gridCelula(sid, o.linha, ci),
            rows: [{ values: [o.para ? { userEnteredValue: { stringValue: o.para } } : {}] }],
            fields: 'userEnteredValue',
          },
        });
      } else if (o.tipo === 'formula') {
        const ci = cols.get(o.aba)!.get(o.col)!;
        requests.push({ copyPaste: { source: gridCelula(sid, o.doadora, ci), destination: gridCelula(sid, o.linha, ci), pasteType: 'PASTE_FORMULA', pasteOrientation: 'NORMAL' } });
      } else exclusoes.push({ aba: o.aba, linha: o.linha });
    }
    // De baixo para cima: excluir uma linha não muda o número das de cima.
    exclusoes.sort((a, b) => b.linha - a.linha);
    for (const x of exclusoes) requests.push({ deleteDimension: { range: { sheetId: sheetId.get(x.aba)!, dimension: 'ROWS', startIndex: x.linha - 1, endIndex: x.linha } } });

    const idsAntes = new Map<string, string[]>();
    for (const aba of new Set(exclusoes.map((x) => x.aba))) {
      const r = await lerRanges(lote.planilha, [rangeA1(aba, `${letraColuna(cols.get(aba)!.get('ID A')!)}:${letraColuna(cols.get(aba)!.get('ID A')!)}`)]);
      idsAntes.set(aba, (r?.[0] ?? []).map((l) => t(l[0])).filter(Boolean));
    }

    const g = await batchUpdatePlanilha(lote.planilha, requests);
    const nOps = aceitos.reduce((s, i) => s + i.ops.length, 0);
    if (!g.ok) {
      await registrarLog(lote.planilha, [[quando, lote.idLote, lote.email, '', '', '', '', '', '', 'lote', '', '', '', 'resultado', `FALHOU: ${g.erro}`]]);
      return { ...vazio(g.erro ?? 'Falha ao gravar.'), pulados };
    }

    // 4) Releitura e conferência.
    const divergencias: string[] = [];
    let conferidos = 0;
    if (exclusoes.length === 0) {
      const depois = await ler(lote.planilha, cols, { formatado: pedidos.formatado, formula: pedidos.formula, linhas: new Set() });
      if (!depois) divergencias.push('Não foi possível reler para conferir.');
      else for (const i of aceitos) for (const o of i.ops) {
        if (o.tipo === 'valor') {
          const v = depois.valor(o.aba, o.col, o.linha);
          if (v === t(o.para)) conferidos++;
          else divergencias.push(`${o.aba} L${o.linha} ${o.col}: esperado "${o.para}", lido "${v}"`);
        } else if (o.tipo === 'formula') {
          const f = depois.formula(o.aba, o.col, o.linha);
          if (ehFormula(f) && normalizarFormula(f, o.linha) === o.formula) conferidos++;
          else divergencias.push(`${o.aba} L${o.linha} ${o.col}: fórmula não confere ("${f.slice(0, 40)}")`);
        }
      }
    } else {
      // Exclusão: a sequência de animais (ID A) tem que continuar exatamente a mesma.
      for (const [aba, ids] of idsAntes) {
        const L = letraColuna(cols.get(aba)!.get('ID A')!);
        const r = await lerRanges(lote.planilha, [rangeA1(aba, `${L}:${L}`)]);
        const agora = (r?.[0] ?? []).map((l) => t(l[0])).filter(Boolean);
        if (agora.length === ids.length && agora.every((x, k) => x === ids[k])) conferidos += exclusoes.filter((x) => x.aba === aba).length;
        else divergencias.push(`${aba}: a sequência de animais mudou depois da exclusão — conferir o LOG_SEABRA.`);
      }
    }

    await registrarLog(lote.planilha, [[
      quando, lote.idLote, lote.email, '', '', '', '', '', '', 'lote', '', '', '', 'resultado',
      JSON.stringify({ itens: aceitos.length, operacoes: nOps, pulados: pulados.length, conferidos, divergencias: divergencias.length }),
    ]]);
    return { ok: divergencias.length === 0, erro: divergencias.length ? 'Gravou, mas a releitura encontrou diferenças.' : null, aplicados: nOps, itensAplicados: aceitos.length, pulados, verificacao: { conferidos, divergencias } };
  } finally {
    emAndamento.delete(lote.planilha);
  }
}
