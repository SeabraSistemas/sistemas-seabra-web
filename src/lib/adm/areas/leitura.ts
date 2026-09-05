import 'server-only';

import { erro, ok, semConfig, type Resultado } from '@/lib/adm/types';

/**
 * A leitura paginada das views de `adm`, e a classificação de erro que a
 * acompanha.
 *
 * POR QUE ISTO É UM MÓDULO: `cobrancas.ts` tinha esse bloco inteiro dentro de
 * si — a lista de códigos "sem-config", a mensagem que ensina a rodar o SQL, o
 * teto de páginas. O segundo módulo que precisou do mesmo comportamento tinha
 * duas saídas ruins: copiar (e divergir na primeira manutenção — provavelmente
 * na lista de códigos, que é a que mais muda) ou ler sem paginação e perder a
 * trava de truncamento. Extrair foi a terceira.
 */

export type Linha = Record<string, unknown>;

export type ErroPostgrest = { message: string; code?: string };

type Resposta = { data: unknown[] | null; error: ErroPostgrest | null };

/** Superfície mínima do query builder do supabase-js usada aqui. */
export type Consulta = {
  order(coluna: string, opcoes?: { ascending?: boolean; nullsFirst?: boolean }): Consulta;
  range(de: number, ate: number): Consulta;
} & PromiseLike<Resposta>;

/**
 * PGRST106 schema fora do Exposed schemas · PGRST205/42P01 view inexistente ·
 * 42501 sem privilégio · 3F000 schema inexistente. Nos cinco a ação é a mesma: o
 * banco não foi preparado. Isso é 'sem-config', não 'erro' — e a diferença
 * importa: uma tela de receita vazia por falta de migration é indistinguível de
 * uma carteira que não fatura nada.
 */
const CODIGOS_SEM_CONFIG = new Set(['PGRST106', 'PGRST205', '42P01', '42501', '3F000']);

export function falhaDeLeitura<T>(view: string, arquivoSql: string, e: ErroPostgrest): Resultado<T> {
  console.error('[adm] falha de leitura', `adm.${view}`, e.code ?? '', e.message);
  if (e.code && CODIGOS_SEM_CONFIG.has(e.code)) {
    return semConfig(
      `A view "adm.${view}" não está acessível (${e.code}). Rode ${arquivoSql}, confirme que o ` +
        'schema "adm" está em Settings → API → Exposed schemas e recarregue o cache do PostgREST ' +
        '(Settings → API → Reload schema cache) — view nova em schema já exposto só aparece depois disso.',
    );
  }
  return erro(`[adm] ${view}: ${e.message}`);
}

/** 1000 = o `db-max-rows` do PostgREST; pedir mais numa página não traz nada a mais. */
const PAGE = 1000;

/** 20 páginas = 20.000 linhas. Uma ordem de grandeza acima do volume real. */
const HARD_CAP = 20;

/**
 * Lê a view inteira, página por página.
 *
 * Acima do teto devolve ERRO, e não a lista truncada: uma tabela de dinheiro
 * cortada pela metade continua parecendo uma tabela de dinheiro — é o pior
 * jeito de errar nestas telas.
 *
 * ⚠️ A ordem passada pela fábrica precisa ser TOTAL (terminar numa coluna
 * única). `range` sobre ordem com empate pode repetir e pular linha entre
 * páginas, e o sintoma é um total errado sem nenhum erro.
 */
export async function paginarView(
  view: string,
  arquivoSql: string,
  fabrica: (de: number, ate: number) => Consulta,
): Promise<Resultado<Linha[]>> {
  const saida: Linha[] = [];
  for (let pagina = 0; pagina < HARD_CAP; pagina++) {
    const de = pagina * PAGE;
    const { data, error } = await fabrica(de, de + PAGE - 1);
    if (error) return falhaDeLeitura<Linha[]>(view, arquivoSql, error);
    if (!data || data.length === 0) break;
    saida.push(...comoLinhas(data));
    if (data.length < PAGE) break;
    if (pagina === HARD_CAP - 1) {
      return erro(
        `[adm] ${view}: passou de ${HARD_CAP * PAGE} linhas e o resultado seria truncado. ` +
          'A tela precisa passar a filtrar no banco antes de somar qualquer coisa.',
      );
    }
  }
  return ok(saida);
}

export function comoLinhas(valores: unknown[]): Linha[] {
  return valores.filter((v): v is Linha => typeof v === 'object' && v !== null);
}

export function textoDe(v: unknown): string | null {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (typeof v === 'number') return String(v);
  return null;
}

/**
 * `numeric(10,2)` do Postgres chega como STRING pelo PostgREST sempre que a
 * precisão não cabe em double. Ignorar isso zeraria a coluna de valor da tela
 * de receita inteira, sem uma linha de erro em lugar nenhum.
 */
export function numeroDe(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
