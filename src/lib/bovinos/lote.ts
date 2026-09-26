import type { SlugCliente } from '@/lib/bovinos/clientes';
import type { Problema, RegraId } from '@/lib/bovinos/tipos';

/**
 * Lote de correção: os problemas escolhidos viram operações concretas,
 * célula a célula, com o valor que precisa estar lá na hora de gravar (`de`).
 * O lote vai assinado para a tela (ver lote-assinatura.ts) e a prévia é
 * desenhada a partir DO PRÓPRIO token — o que o Felipe vê é exatamente o que
 * o servidor aceita gravar. Módulo puro, roda no servidor e no navegador.
 */

export type OpLote =
  /** Troca o valor de uma célula (vazio = limpar). */
  | { tipo: 'valor'; aba: string; linha: number; col: string; de: string; para: string }
  /** Copia a fórmula da linha doadora (mesma coluna) para esta linha. `formula` = forma normalizada da doadora. */
  | { tipo: 'formula'; aba: string; linha: number; col: string; doadora: number; formula: string }
  /** Exclui a linha. `acima`/`abaixo` = ID A das vizinhas na prévia (a linha tem que estar no mesmo lugar). */
  | { tipo: 'excluir'; aba: string; linha: number; acima: string; abaixo: string };

export interface ItemLote {
  problemaId: string;
  regra: RegraId;
  animal: string;
  resumo: string;
  /** A linha ainda é o mesmo animal? (null para correção em massa de coluna, conferida só pelo `de`). */
  guarda: { aba: string; linha: number; idA: string; idAnimal: string } | null;
  ops: OpLote[];
}

export interface Lote {
  v: 1;
  idLote: string;
  email: string;
  cliente: SlugCliente;
  planilha: string;
  criadoEm: number;
  expiraEm: number;
  /** Exclusão de linha nunca vai junto com outra correção (as linhas de baixo mudam de número). */
  tipo: 'celulas' | 'exclusao';
  itens: ItemLote[];
}

export const LOTE_VALIDADE_MS = 15 * 60 * 1000;
export const MAX_CELULAS = 5000;
export const MAX_EXCLUSOES = 200;

/** Chave nova no formato do UNIQUEID() do AppSheet (8 hex), fora do conjunto já usado. */
export function novaChave(emUso: Set<string>, rng: () => string = hex8): string {
  for (let i = 0; i < 1000; i++) {
    const k = rng();
    if (!emUso.has(k)) {
      emUso.add(k);
      return k;
    }
  }
  throw new Error('Não foi possível gerar uma chave nova sem colisão.');
}

function hex8(): string {
  const b = new Uint8Array(4);
  globalThis.crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

/** Todo texto de 8 caracteres alfanuméricos das abas lidas — uma chave nova não pode repetir nenhum. */
export function coletarChavesEmUso(matrizes: (string[][] | null | undefined)[]): Set<string> {
  const s = new Set<string>();
  for (const m of matrizes) for (const l of m ?? []) for (const c of l) {
    const v = String(c ?? '').trim();
    if (/^[0-9a-z]{8}$/i.test(v)) s.add(v);
  }
  return s;
}

export interface EntradaLote {
  problemas: Problema[];
  ids: string[];
  cliente: SlugCliente;
  planilha: string;
  email: string;
  agora: number;
  chavesEmUso: Set<string>;
  /** ID A das linhas vizinhas no RebanhoProd (para excluir linha com segurança). */
  vizinhos: (linha: number) => { acima: string; abaixo: string };
  /** Fórmula NORMALIZADA da linha doadora (ver formulas.ts) — a gravação confere que não mudou. */
  formulaDoadora: (col: string, linha: number) => string;
  gerarChave?: () => string;
  idLote?: string;
}

export function montarLote(e: EntradaLote): { lote: Lote | null; recusados: { id: string; motivo: string }[] } {
  const porId = new Map(e.problemas.map((p) => [p.id, p]));
  const recusados: { id: string; motivo: string }[] = [];
  const itens: ItemLote[] = [];

  for (const id of new Set(e.ids)) {
    const p = porId.get(id);
    if (!p) {
      recusados.push({ id, motivo: 'Não está mais pendente (a planilha mudou).' });
      continue;
    }
    if (p.severidade !== 'corrigivel' || !p.correcao) {
      recusados.push({ id, motivo: 'Não tem correção automática.' });
      continue;
    }
    const c = p.correcao;
    const base = { problemaId: p.id, regra: p.regra, animal: p.animal, resumo: p.resumo };
    switch (c.tipo) {
      case 'celulas':
        itens.push({
          ...base,
          guarda: { aba: c.aba, linha: c.linha, ...c.guarda },
          ops: c.set.map((s) => ({ tipo: 'valor' as const, aba: c.aba, linha: c.linha, col: s.col, de: s.de, para: s.para })),
        });
        break;
      case 'chave':
        itens.push({
          ...base,
          guarda: { aba: c.aba, linha: c.linha, ...c.guarda },
          ops: [
            ...c.recuperar.map((s) => ({ tipo: 'valor' as const, aba: c.aba, linha: c.linha, col: s.col, de: s.de, para: s.para })),
            ...c.gerar.map((col) => ({ tipo: 'valor' as const, aba: c.aba, linha: c.linha, col, de: '', para: novaChave(e.chavesEmUso, e.gerarChave) })),
          ],
        });
        break;
      case 'coluna-valor':
        itens.push({
          ...base,
          guarda: null,
          ops: c.linhas.map((linha) => ({ tipo: 'valor' as const, aba: c.aba, linha, col: c.col, de: c.de, para: c.para })),
        });
        break;
      case 'formula':
        itens.push({
          ...base,
          guarda: { aba: c.aba, linha: c.linha, ...c.guarda },
          ops: c.colunas.map((f) => ({ tipo: 'formula' as const, aba: c.aba, linha: c.linha, col: f.col, doadora: f.linhaDoadora, formula: e.formulaDoadora(f.col, f.linhaDoadora) })),
        });
        break;
      case 'excluir-linha':
        itens.push({ ...base, guarda: null, ops: [{ tipo: 'excluir', aba: c.aba, linha: c.linha, ...e.vizinhos(c.linha) }] });
        break;
    }
  }

  // Exclusão nunca vai misturada: as linhas abaixo mudam de número.
  const temExclusao = itens.some((i) => i.ops.some((o) => o.tipo === 'excluir'));
  const temOutras = itens.some((i) => i.ops.some((o) => o.tipo !== 'excluir'));
  let finais = itens;
  if (temExclusao && temOutras) {
    finais = itens.filter((i) => !i.ops.some((o) => o.tipo === 'excluir'));
    for (const i of itens) if (i.ops.some((o) => o.tipo === 'excluir')) recusados.push({ id: i.problemaId, motivo: 'Exclusão de linha vai num lote separado — grave as outras correções primeiro.' });
  }

  // Duas correções na mesma célula com valores diferentes: nenhuma das duas vai.
  const destino = new Map<string, string>();
  const conflito = new Set<string>();
  for (const i of finais) for (const o of i.ops) {
    if (o.tipo !== 'valor') continue;
    const k = `${o.aba}|${o.linha}|${o.col}`;
    if (destino.has(k) && destino.get(k) !== o.para) conflito.add(k);
    destino.set(k, o.para);
  }
  if (conflito.size) {
    finais = finais.filter((i) => {
      const bate = i.ops.some((o) => o.tipo === 'valor' && conflito.has(`${o.aba}|${o.linha}|${o.col}`));
      if (bate) recusados.push({ id: i.problemaId, motivo: 'Outra correção escolhida grava um valor diferente na mesma célula.' });
      return !bate;
    });
  }

  const nCelulas = finais.reduce((s, i) => s + i.ops.length, 0);
  const exclusao = temExclusao && !temOutras;
  if (exclusao && finais.length > MAX_EXCLUSOES) {
    for (const i of finais.slice(MAX_EXCLUSOES)) recusados.push({ id: i.problemaId, motivo: `Até ${MAX_EXCLUSOES} exclusões por vez.` });
    finais = finais.slice(0, MAX_EXCLUSOES);
  } else if (nCelulas > MAX_CELULAS) {
    let soma = 0;
    finais = finais.filter((i) => {
      soma += i.ops.length;
      if (soma <= MAX_CELULAS) return true;
      recusados.push({ id: i.problemaId, motivo: `Até ${MAX_CELULAS} células por vez — grave e rode de novo.` });
      return false;
    });
  }

  if (finais.length === 0) return { lote: null, recusados };
  return {
    lote: {
      v: 1,
      idLote: e.idLote ?? `L${e.agora.toString(36)}${hex8()}`,
      email: e.email,
      cliente: e.cliente,
      planilha: e.planilha,
      criadoEm: e.agora,
      expiraEm: e.agora + LOTE_VALIDADE_MS,
      tipo: exclusao ? 'exclusao' : 'celulas',
      itens: finais,
    },
    recusados,
  };
}

/** Quantas células/linhas o lote mexe. */
export function tamanhoLote(l: Lote): number {
  return l.itens.reduce((s, i) => s + i.ops.length, 0);
}

// ---- base64url universal (Node e navegador) -------------------------------

export function paraB64url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function deB64url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Lê o lote de dentro do token SEM conferir a assinatura — só para a tela desenhar a prévia. */
export function decodificarLote(token: string): Lote | null {
  const [payload] = token.split('.');
  if (!payload) return null;
  try {
    const l = JSON.parse(deB64url(payload)) as Lote;
    return l && l.v === 1 && Array.isArray(l.itens) ? l : null;
  } catch {
    return null;
  }
}
