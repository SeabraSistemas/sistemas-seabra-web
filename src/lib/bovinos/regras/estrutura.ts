import { U, t } from '@/lib/bovinos/texto';
import { celula, coluna, type Tabela } from '@/lib/bovinos/tabela';
import type { Modelo } from '@/lib/bovinos/modelo';
import type { Indices } from '@/lib/bovinos/identidade';
import type { Cliente } from '@/lib/bovinos/clientes';
import type { Problema, TrocaCelula } from '@/lib/bovinos/tipos';
import { ehFormula, normalizarFormula } from '@/lib/bovinos/formulas';

const TESTE = /\btestes?\b/i;

/**
 * Linhas do RebanhoProd sem nenhuma das três identificações (ID rebanho, ID A,
 * ID animal). São as candidatas a "linha em branco" — a leitura seguinte traz
 * a linha inteira como fórmula para decidir se dá para excluir.
 */
export function candidatasLinhaVazia(rebanho: Tabela): number[] {
  const c = [coluna(rebanho, 'ID rebanho'), coluna(rebanho, 'ID A'), coluna(rebanho, 'ID animal')];
  const out: number[] = [];
  rebanho.linhas.forEach((l, k) => {
    if (c.every((i) => !celula(l, i))) out.push(k + 2);
  });
  return out;
}

export interface EntradaEstrutura {
  rebanho: Tabela;
  modelo: Modelo;
  ind: Indices;
  cliente: Cliente;
  /** Render FORMULA de cada coluna de fórmula do cliente: coluna → células por linha da planilha (índice 0 = cabeçalho). */
  formulas: Map<string, string[]>;
  /** Render FORMULA da linha inteira de cada candidata a linha vazia. */
  linhasCompletas: Map<number, string[]>;
}

export function regrasEstrutura(e: EntradaEstrutura): Problema[] {
  const { rebanho, modelo, ind, cliente } = e;
  const out: Problema[] = [];

  // 1) Linha em branco / sem identificação.
  for (const linha of candidatasLinhaVazia(rebanho)) {
    const completa = e.linhasCompletas.get(linha) ?? [];
    const literais = completa
      .map((v, i) => ({ v: t(v), h: rebanho.cabecalho[i] || `col ${i + 1}` }))
      .filter((x) => x.v && !ehFormula(x.v));
    if (literais.length === 0) {
      out.push({
        id: `linha-em-branco|L${linha}`,
        regra: 'linha-em-branco',
        severidade: 'corrigivel',
        aba: 'RebanhoProd',
        linha,
        animal: '',
        resumo: `Linha ${linha} vazia${completa.some(ehFormula) ? ' (só fórmulas)' : ''}.`,
        prova: ['Sem ID rebanho, ID A, ID animal e nenhum valor digitado — resto de uma exclusão pelo app.'],
        bloqueios: [],
        correcao: { tipo: 'excluir-linha', aba: 'RebanhoProd', linha },
      });
    } else {
      out.push({
        id: `linha-sem-identificacao|L${linha}`,
        regra: 'linha-sem-identificacao',
        severidade: 'manual',
        aba: 'RebanhoProd',
        linha,
        animal: '',
        resumo: `Linha ${linha} sem ID, mas com ${literais.length} valor(es) digitado(s).`,
        prova: literais.slice(0, 6).map((x) => `${x.h}: ${x.v}`),
        bloqueios: [],
        correcao: null,
      });
    }
  }

  // 2) Fórmula que parou / foi sobrescrita.
  const vazias = new Set(candidatasLinhaVazia(rebanho));
  const colsFormula = cliente.colunasFormula.filter((c) => e.formulas.has(c));
  // Fórmula "modelo" de cada coluna: a forma normalizada mais comum.
  const modeloCol = new Map<string, string>();
  for (const c of colsFormula) {
    const cont = new Map<string, number>();
    e.formulas.get(c)!.forEach((v, i) => {
      if (i === 0 || !ehFormula(v)) return;
      const n = normalizarFormula(v, i + 1);
      cont.set(n, (cont.get(n) ?? 0) + 1);
    });
    const top = [...cont].sort((a, b) => b[1] - a[1])[0];
    if (top) modeloCol.set(c, top[0]);
  }
  const ultimaComDado = Math.max(1, ...modelo.rebanho.filter((r) => r.A || r.id).map((r) => r.linha));
  const faltas: Problema[] = [];
  for (const r of modelo.rebanho) {
    if (!(r.A || r.id) || vazias.has(r.linha)) continue;
    const faltando: { col: string; linhaDoadora: number | null }[] = [];
    const sobrescritas: string[] = [];
    for (const c of colsFormula) {
      const vals = e.formulas.get(c)!;
      const v = t(vals[r.linha - 1]);
      if (ehFormula(v)) continue;
      if (v) {
        sobrescritas.push(`${c}: "${v}"`);
        continue;
      }
      // Doadora: a linha mais próxima ACIMA com a fórmula modelo.
      let doadora: number | null = null;
      const alvo = modeloCol.get(c);
      for (let l = r.linha - 1; l >= 2; l--) {
        if (vazias.has(l)) continue; // a linha em branco vai ser excluída — não pode ser doadora
        const f = vals[l - 1];
        if (ehFormula(f) && normalizarFormula(f, l) === alvo) {
          doadora = l;
          break;
        }
      }
      faltando.push({ col: c, linhaDoadora: doadora });
    }
    const guarda = { idA: r.A, idAnimal: r.id };
    if (faltando.length) {
      const semDoadora = faltando.filter((f) => f.linhaDoadora == null).map((f) => f.col);
      const ultima = r.linha === ultimaComDado;
      faltas.push({
        id: `formula-ausente|${r.A || `L${r.linha}`}`,
        regra: 'formula-ausente',
        severidade: semDoadora.length ? 'manual' : 'corrigivel',
        aba: 'RebanhoProd',
        linha: r.linha,
        animal: r.id,
        resumo: `${r.id || `Linha ${r.linha}`}: sem fórmula em ${faltando.map((f) => f.col).join(', ')}${ultima ? ' — É A ÚLTIMA LINHA: os próximos animais também vão ficar sem' : ''}.`,
        prova: faltando.map((f) => (f.linhaDoadora ? `${f.col}: copiar da linha ${f.linhaDoadora}` : `${f.col}: nenhuma linha acima com a fórmula modelo`)),
        bloqueios: semDoadora.length ? [`Sem linha doadora para: ${semDoadora.join(', ')}.`] : [],
        correcao: semDoadora.length
          ? null
          : { tipo: 'formula', aba: 'RebanhoProd', linha: r.linha, guarda, colunas: faltando.map((f) => ({ col: f.col, linhaDoadora: f.linhaDoadora as number })) },
      });
    }
    if (sobrescritas.length) {
      out.push({
        id: `formula-sobrescrita|${r.A || `L${r.linha}`}`,
        regra: 'formula-sobrescrita',
        severidade: 'manual',
        aba: 'RebanhoProd',
        linha: r.linha,
        animal: r.id,
        resumo: `${r.id}: valor digitado no lugar da fórmula.`,
        prova: sobrescritas,
        bloqueios: [],
        correcao: null,
      });
    }
  }
  // A última linha primeiro: é dela que o app copia para o próximo animal.
  faltas.sort((a, b) => (b.linha ?? 0) - (a.linha ?? 0));
  out.push(...faltas);

  // 3) Animal sem chave: recuperar pelo parto ou gerar.
  const temIdRebanho = coluna(rebanho, 'ID rebanho') >= 0;
  const semChave = modelo.rebanho.filter((r) => r.id && (!r.A || (temIdRebanho && !r.idRebanho)));
  // Quantas linhas sem chave reivindicam cada chave candidata (a mesma chave não pode ir para duas).
  const candidatas = new Map<number, { A: string; idRebanho: string; origem: string }[]>();
  const reivindicadas = new Map<string, number>();
  for (const r of semChave) {
    const cands = new Map<string, { A: string; idRebanho: string; origem: string }>();
    for (const p of modelo.partos) {
      if (p.A && !ind.porA.has(p.A) && (U(p.id) === U(r.id) || (p.tag && p.tag === r.tag))) {
        cands.set(p.A, { A: p.A, idRebanho: p.idRebanho, origem: `bezerro do parto ${p.aba} L${p.linha}` });
      }
    }
    // Mãe: o ID M do parto mais recente em que ela aparece.
    const comoMae = modelo.partos.filter((p) => p.idM && !ind.porA.has(p.idM) && U(p.mae) === U(r.id)).sort((a, b) => (b.nasc ?? 0) - (a.nasc ?? 0));
    if (comoMae.length && !r.A) cands.set(comoMae[0].idM, { A: comoMae[0].idM, idRebanho: '', origem: `ID M do parto ${comoMae[0].aba} L${comoMae[0].linha}` });
    const lista = [...cands.values()];
    candidatas.set(r.linha, lista);
    for (const c of lista) reivindicadas.set(c.A, (reivindicadas.get(c.A) ?? 0) + 1);
  }
  for (const r of semChave) {
    const lista = candidatas.get(r.linha) ?? [];
    const guarda = { idA: r.A, idAnimal: r.id };
    const faltam = [...(!r.A ? ['ID A'] : []), ...(temIdRebanho && !r.idRebanho ? ['ID rebanho'] : [])];
    const base = {
      id: `sem-chave|animal:${U(r.id)}|L${r.linha}`,
      regra: 'sem-chave' as const,
      aba: 'RebanhoProd',
      linha: r.linha,
      animal: r.id,
    };
    if (lista.length > 1 || lista.some((c) => (reivindicadas.get(c.A) ?? 0) > 1)) {
      out.push({
        ...base,
        severidade: 'manual',
        resumo: `${r.id}: sem ${faltam.join(' e ')}, e há mais de uma chave possível.`,
        prova: lista.map((c) => `${c.A} (${c.origem})`),
        bloqueios: ['Chave original ambígua.'],
        correcao: null,
      });
      continue;
    }
    const recuperar: TrocaCelula[] = [];
    const gerar: string[] = [];
    const c = lista[0];
    if (!r.A) {
      if (c) recuperar.push({ col: 'ID A', de: '', para: c.A });
      else gerar.push('ID A');
    }
    if (temIdRebanho && !r.idRebanho) {
      if (c?.idRebanho && !modelo.rebanho.some((x) => x.idRebanho === c.idRebanho)) recuperar.push({ col: 'ID rebanho', de: '', para: c.idRebanho });
      else gerar.push('ID rebanho');
    }
    out.push({
      ...base,
      severidade: 'corrigivel',
      resumo: `${r.id}: sem ${faltam.join(' e ')}${c ? ' — chave original achada no parto' : ' — recebe chave nova'}.`,
      prova: c ? [`${c.A} (${c.origem})`] : ['Nenhum parto aponta para este animal; a chave nova é gerada na prévia.'],
      bloqueios: [],
      correcao: { tipo: 'chave', aba: 'RebanhoProd', linha: r.linha, guarda, recuperar, gerar },
    });
  }

  // 4) Chave repetida.
  for (const [nome, get] of [
    ['ID A', (x: (typeof modelo.rebanho)[number]) => x.A],
    ['ID rebanho', (x: (typeof modelo.rebanho)[number]) => x.idRebanho],
  ] as const) {
    const cont = new Map<string, number[]>();
    for (const r of modelo.rebanho) {
      const k = get(r);
      if (!k) continue;
      cont.set(k, [...(cont.get(k) ?? []), r.linha]);
    }
    for (const [k, linhas] of cont) {
      if (linhas.length < 2) continue;
      out.push({
        id: `chave-duplicada|${nome}|${k}`,
        regra: 'chave-duplicada',
        severidade: 'manual',
        aba: 'RebanhoProd',
        linha: linhas[0],
        animal: linhas.map((l) => modelo.rebanho[l - 2]?.id).filter(Boolean).join(', '),
        resumo: `${nome} ${k} em ${linhas.length} linhas: ${linhas.join(', ')}.`,
        prova: [],
        bloqueios: [],
        correcao: null,
      });
    }
  }

  // 5) Nascimento de mentira e registros de teste.
  for (const data of cliente.datasPlaceholder) {
    const regs = modelo.rebanho.filter((r) => r.id && t(r.nascTxt) === data);
    if (regs.length === 0) continue;
    out.push({
      id: `data-placeholder|${data}`,
      regra: 'data-placeholder',
      severidade: 'info',
      aba: 'RebanhoProd',
      linha: null,
      animal: '',
      resumo: `${regs.length} animais com nascimento ${data}.`,
      prova: [regs.slice(0, 20).map((r) => r.id).join(', ') + (regs.length > 20 ? ' …' : '')],
      bloqueios: [],
      correcao: null,
    });
  }
  for (const r of modelo.rebanho) {
    if (!TESTE.test(r.id) && !TESTE.test(r.mae)) continue;
    out.push({
      id: `linha-teste|RebanhoProd|L${r.linha}`,
      regra: 'linha-teste',
      severidade: 'info',
      aba: 'RebanhoProd',
      linha: r.linha,
      animal: r.id,
      resumo: `Animal de teste: ${r.id}.`,
      prova: [],
      bloqueios: [],
      correcao: null,
    });
  }
  return out;
}
