import type { FiltroTabela, OpcoesTabela } from '@/lib/adm/queries';
import type { TabelaCatalogo } from '@/lib/adm/tabelas';
import { getColuna, parseColunasParam, validarOrdenacao } from '@/lib/adm/tabelas';
import {
  BOOLEANO_NAO,
  BOOLEANO_SIM,
  PREFIXO_FILTRO,
  SEM_VALOR,
  SEPARADOR_INTERVALO,
  SEPARADOR_VALORES,
  ehPeriodoRelativo,
  inicioDoPeriodo,
} from '@/lib/adm/url';

/**
 * Traduz a query string da tela para `OpcoesTabela` — o que faz a exportação
 * devolver EXATAMENTE o conjunto que está na grade.
 *
 * POR QUE ISSO PRECISA EXISTIR NO SERVIDOR: `AdmFilters` sabe filtrar em
 * memória, o que basta para uma página de 50 linhas. Exportar "tudo que os
 * filtros selecionam" num rebanho de 4.820 animais não pode passar por ali —
 * o navegador teria que baixar a tabela inteira antes de filtrar. Aqui o filtro
 * vira predicado de SQL e desce para o Postgres.
 *
 * ALLOWLIST EM TUDO: cada nome de coluna é conferido contra o catálogo antes de
 * virar predicado, e o que não passar é DESCARTADO em silêncio em vez de virar
 * erro. O motivo é concreto: um link salvo nos favoritos do Felipe pode citar
 * uma coluna que foi renomeada no app meses depois, e o comportamento certo é
 * abrir a tabela sem aquele filtro — não uma tela de erro que ele não sabe
 * consertar. O que foi descartado volta em `ignorados`, para a tela avisar.
 */

/** Só o que se lê de um URLSearchParams — aceita o objeto do hook e o do request. */
export interface LeitorParams {
  get(chave: string): string | null;
  entries?(): IterableIterator<[string, string]>;
}

export interface OpcoesLidas {
  opcoes: OpcoesTabela;
  /** Chaves de faceta que não existem mais no catálogo, para avisar na tela. */
  ignorados: string[];
  /** Colunas pedidas que foram rejeitadas pela allowlist. */
  colunasRejeitadas: string[];
}

/**
 * Um valor de faceta pode ser texto, número ou data conforme o tipo declarado
 * no catálogo. Converter na hora certa importa: `f.peso=40..80` precisa virar
 * número, senão o Postgres compara '40' com '9' como texto e '9' ganha.
 */
function converter(coluna: ReturnType<typeof getColuna>, bruto: string): string | number | boolean {
  if (!coluna) return bruto;
  if (coluna.tipo === 'numero') {
    const n = Number(bruto.replace(',', '.'));
    return Number.isFinite(n) ? n : bruto;
  }
  if (coluna.tipo === 'booleano') return bruto === BOOLEANO_SIM;
  return bruto;
}

/** Recorta `de..ate` aceitando extremo vazio dos dois lados. */
function partirIntervalo(bruto: string): { de: string | null; ate: string | null } | null {
  if (!bruto.includes(SEPARADOR_INTERVALO)) return null;
  const [de, ate] = bruto.split(SEPARADOR_INTERVALO, 2);
  const limpo = (v: string) => (v.trim() === '' ? null : v.trim());
  return { de: limpo(de ?? ''), ate: limpo(ate ?? '') };
}

function todasAsChaves(params: LeitorParams): string[] {
  // URLSearchParams tem entries(); o ReadonlyURLSearchParams do Next também.
  // O tipo mínimo do LeitorParams não obriga, então há o caminho de fallback.
  if (typeof params.entries === 'function') {
    return Array.from(params.entries(), ([chave]) => chave);
  }
  return [];
}

export function lerOpcoesTabela(
  registro: TabelaCatalogo,
  params: LeitorParams,
  { agora = new Date(), limitePadrao = 50 }: { agora?: Date; limitePadrao?: number } = {},
): OpcoesLidas {
  const ignorados: string[] = [];
  const filtros: FiltroTabela[] = [];
  let periodo: OpcoesTabela['periodo'];

  for (const chaveCrua of todasAsChaves(params)) {
    if (!chaveCrua.startsWith(PREFIXO_FILTRO)) continue;
    const nome = chaveCrua.slice(PREFIXO_FILTRO.length);
    const bruto = (params.get(chaveCrua) ?? '').trim();
    if (bruto === '') continue;

    const coluna = getColuna(registro, nome);
    if (!coluna) {
      ignorados.push(nome);
      continue;
    }

    // ── data: período relativo, absoluto, ou um dia só ──────────────────────
    if (coluna.tipo === 'data' || coluna.tipo === 'datahora') {
      if (ehPeriodoRelativo(bruto)) {
        const de = inicioDoPeriodo(bruto, agora).toISOString();
        // A coluna de data do registro ganha `periodo`; as demais viram gte.
        if (nome === registro.colunaData) periodo = { de, ate: null };
        else filtros.push({ coluna: nome, op: 'gte', valor: de });
        continue;
      }
      const faixa = partirIntervalo(bruto);
      if (faixa) {
        if (nome === registro.colunaData) periodo = faixa;
        else {
          if (faixa.de) filtros.push({ coluna: nome, op: 'gte', valor: faixa.de });
          if (faixa.ate) filtros.push({ coluna: nome, op: 'lte', valor: faixa.ate });
        }
        continue;
      }
      filtros.push({ coluna: nome, op: 'eq', valor: bruto });
      continue;
    }

    // ── numérico: intervalo ou igualdade ────────────────────────────────────
    if (coluna.tipo === 'numero') {
      const faixa = partirIntervalo(bruto);
      if (faixa) {
        if (faixa.de != null) filtros.push({ coluna: nome, op: 'gte', valor: converter(coluna, faixa.de) as number });
        if (faixa.ate != null) filtros.push({ coluna: nome, op: 'lte', valor: converter(coluna, faixa.ate) as number });
        continue;
      }
      filtros.push({ coluna: nome, op: 'eq', valor: converter(coluna, bruto) });
      continue;
    }

    // ── booleano tri-state ──────────────────────────────────────────────────
    if (coluna.tipo === 'booleano') {
      if (bruto === BOOLEANO_SIM) filtros.push({ coluna: nome, op: 'eq', valor: true });
      else if (bruto === BOOLEANO_NAO) filtros.push({ coluna: nome, op: 'eq', valor: false });
      continue;
    }

    // ── texto livre ─────────────────────────────────────────────────────────
    // Coluna de texto SEM faceta declarada é busca por conteúdo; com faceta
    // 'enum' cai no bloco seguinte, que trata o valor como escolha fechada.
    // (O contrato não prevê faceta 'texto': o tipo da coluna já diz isso.)
    if (coluna.tipo === 'texto' && coluna.faceta !== 'enum') {
      filtros.push({ coluna: nome, op: 'ilike', valor: bruto });
      continue;
    }

    // ── enum multi-seleção ──────────────────────────────────────────────────
    const valores = bruto
      .split(SEPARADOR_VALORES)
      .map((v) => v.trim())
      .filter((v) => v !== '');
    if (valores.length === 0) continue;

    // "(vazio)" é um valor de negócio, não ausência de filtro: sozinho vira
    // IS NULL; misturado a outros valores, o OR não cabe no PostgREST via
    // `.in()` e o caso raro fica de fora com o filtro dos demais aplicado.
    const semValor = valores.includes(SEM_VALOR);
    const reais = valores.filter((v) => v !== SEM_VALOR);
    if (semValor && reais.length === 0) {
      filtros.push({ coluna: nome, op: 'nulo' });
      continue;
    }
    if (reais.length === 1) {
      filtros.push({ coluna: nome, op: 'eq', valor: converter(coluna, reais[0]) });
    } else {
      filtros.push({ coluna: nome, op: 'in', valores: reais.map((v) => converter(coluna, v) as string | number) });
    }
  }

  const cols = parseColunasParam(registro, params.get('cols'));
  // A grade aceita ordenação multi-coluna (`?sort=-peso,numero`), o servidor
  // ordena só pelo NÍVEL 1 — é o que o keyset de listarTabela() sabe paginar.
  // Sem este corte a string inteira vai para validarOrdenacao(), não casa
  // nenhuma coluna, e o arquivo sai numa ordem diferente da tela sem avisar.
  const ordem = validarOrdenacao(registro, (params.get('sort') ?? '').split(',')[0] ?? null);

  const tamanhoBruto = Number(params.get('size'));
  const limite = Number.isFinite(tamanhoBruto) && tamanhoBruto > 0 ? Math.floor(tamanhoBruto) : limitePadrao;

  return {
    opcoes: {
      colunas: cols.colunas,
      ordem: ordem.coluna ? { coluna: ordem.coluna, ascendente: ordem.ascendente } : undefined,
      cursor: params.get('cursor'),
      limite,
      filtros,
      periodo,
    },
    ignorados,
    colunasRejeitadas: cols.rejeitadas,
  };
}
