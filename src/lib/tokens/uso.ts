/**
 * Uso do Claude Code medido no PC (scripts/tokens-coletor.mjs) e a conta que
 * transforma tokens em %. Puro — sem React nem rede — para poder testar.
 *
 * O Claude não publica o limite em tokens, só o %. Então o % aqui é ESTIMADO:
 * o usuário digita o % real uma vez e o painel descobre quantos tokens valem
 * 100% (a "calibração"). Daí em diante, tokens ÷ limite.
 *
 * Só entra o que o Claude Code grava no disco: uso no app/site do claude.ai não
 * aparece. A calibração absorve a fatia média desse uso, mas não o acompanha.
 */

export const HORA_MS = 3_600_000;
/** Duração da sessão do Claude (janela de 5h). */
export const SESSAO_MS = 5 * HORA_MS;

/** Um balde de 1 hora. `t` = input + output + cache criado; `c` = cache lido (barato, fora da conta). */
export interface Balde {
  h: number;
  t: number;
  c: number;
}

export interface Uso {
  /** Soma dos baldes de todas as máquinas, ordenada por hora. */
  horas: Balde[];
  /** Último envio de qualquer coletor (ms epoch); null se nunca chegou nada. */
  coletadoEm: number | null;
  maquinas: number;
}

export const USO_VAZIO: Uso = { horas: [], coletadoEm: null, maquinas: 0 };

/** Tokens dos baldes que começam em `desde` ou depois. Reset sempre cai em hora cheia. */
export function tokensDesde(horas: Balde[], desde: number): number {
  let soma = 0;
  for (const b of horas) if (b.h >= desde) soma += b.t;
  return soma;
}

export interface Sessao {
  inicio: number;
  fim: number;
  tokens: number;
}

/**
 * Sessão de 5h em andamento, do jeito do ccusage: abre na hora cheia da primeira
 * mensagem e vale 5h; a mensagem seguinte depois disso abre outra. Com baldes de
 * hora a precisão é a hora cheia, que é a mesma do bloco. Devolve null se a
 * última sessão já acabou (o contador do Claude está zerado).
 */
export function sessaoAtual(horas: Balde[], agora: number): Sessao | null {
  let atual: Sessao | null = null;
  for (const b of horas) {
    if (b.t <= 0 && b.c <= 0) continue;
    if (!atual || b.h >= atual.fim) atual = { inicio: b.h, fim: b.h + SESSAO_MS, tokens: 0 };
    atual.tokens += b.t;
  }
  return atual && agora < atual.fim ? atual : null;
}

/** Quantos tokens valem 100%, dado um % real lido agora. null se não dá para calibrar. */
export function limiteDe(tokens: number, pct: number): number | null {
  if (!(tokens > 0) || !(pct > 0) || pct > 100) return null;
  return tokens / (pct / 100);
}

/** Tokens → %, sem passar de 100. */
export function pctDe(tokens: number, limite: number | null): number | null {
  if (limite == null || !(limite > 0)) return null;
  return Math.min(100, (100 * tokens) / limite);
}

/** Aceita só o que o coletor manda: lista de baldes finitos, não negativos, em hora cheia. */
export function baldesValidos(entrada: unknown, max = 24 * 10): Balde[] | null {
  if (!Array.isArray(entrada) || entrada.length > max) return null;
  const saida: Balde[] = [];
  for (const x of entrada) {
    if (typeof x !== 'object' || x === null) return null;
    const { h, t, c } = x as Record<string, unknown>;
    if (typeof h !== 'number' || typeof t !== 'number' || typeof c !== 'number') return null;
    if (![h, t, c].every(Number.isFinite) || t < 0 || c < 0 || h <= 0 || h % HORA_MS !== 0) return null;
    saida.push({ h, t: Math.round(t), c: Math.round(c) });
  }
  return saida;
}

/** Junta as linhas de várias máquinas numa série só. */
export function somarMaquinas(linhas: { horas: Balde[]; coletadoEm: number }[]): Uso {
  const porHora = new Map<number, Balde>();
  let coletadoEm: number | null = null;
  for (const l of linhas) {
    coletadoEm = Math.max(coletadoEm ?? 0, l.coletadoEm);
    for (const b of l.horas) {
      const m = porHora.get(b.h);
      if (m) {
        m.t += b.t;
        m.c += b.c;
      } else porHora.set(b.h, { ...b });
    }
  }
  return { horas: [...porHora.values()].sort((a, b) => a.h - b.h), coletadoEm, maquinas: linhas.length };
}
