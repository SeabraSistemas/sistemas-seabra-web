import 'server-only';

import { formatarData, formatarInteiro, formatarNumero, VAZIO } from '@/lib/adm/format';
import {
  CELULA_VAZIA,
  booleano as celulaBooleano,
  data as celulaData,
  gerarXlsx,
  numero as celulaNumero,
  texto as celulaTexto,
  type CelulaXlsx,
} from '@/lib/adm/xlsx';

/**
 * EXPORTAÇÃO TABULAR — o par CSV/XLSX para conjuntos PEQUENOS e já em memória
 * (as quatro telas de carteira: dezenas a poucas centenas de linhas, nunca a
 * milhares que exigem manter só uma página por vez).
 *
 * POR QUE NÃO É `src/app/adm/api/export/route.ts`: aquela rota existe para as
 * tabelas CRUAS de UM cliente por vez (rebanho, produção...), com paginação
 * keyset porque um rebanho tem milhares de linhas, e com escopo por
 * `usuario`+`prop` porque cada tabela pertence a uma conta. As telas de
 * carteira são o oposto nos três eixos: agregam a base inteira, cabem inteiras
 * em memória, e não pertencem a ninguém em particular. Enfiar as duas formas
 * na mesma rota misturaria dois contratos que não têm nada em comum além do
 * nome do botão.
 *
 * O QUE NÃO MUDA, porque é a mesma decisão de `src/app/adm/api/export/route.ts`
 * e de `ExportMenu.tsx`, e as três verdades não podem divergir:
 *
 *   CSV    ';' como separador e BOM UTF-8 na frente — é o que faz o Excel em
 *          pt-BR abrir com acento certo e cada campo na própria coluna, sem
 *          assistente de importação (com ',' ele confunde com separador
 *          decimal e empilha a linha inteira numa célula só).
 *   XLSX   número e data com TIPO de verdade, não texto — é a diferença que
 *          justifica o formato existir ao lado do CSV.
 *   nulo   nunca vira 0 nem string vazia. No CSV é '—' (mesmo símbolo da
 *          tela); no XLSX é `CELULA_VAZIA`, célula ausente de verdade — porque
 *          '0' numa coluna de dinheiro ou contagem é uma afirmação, e '—' é a
 *          confissão de que não há uma.
 */

export interface ColunaExportTabular<T> {
  rotulo: string;
  /** Célula do CSV, já como texto final — quem ESCREVE o CSV escapa, não aqui. */
  texto: (linha: T) => string;
  /** Célula do XLSX, tipada. */
  celula: (linha: T) => CelulaXlsx;
}

/** Coluna de texto livre. `null`/vazio é ausência nos dois formatos. */
export function colunaTexto<T>(rotulo: string, valor: (linha: T) => string | null): ColunaExportTabular<T> {
  return {
    rotulo,
    texto: (l) => {
      const v = valor(l);
      return v == null || v === '' ? VAZIO : v;
    },
    celula: (l) => {
      const v = valor(l);
      return v == null || v === '' ? CELULA_VAZIA : celulaTexto(v);
    },
  };
}

/** Número com casas decimais fixas — dinheiro, fração, o que precisa de vírgula. */
export function colunaNumero<T>(rotulo: string, valor: (linha: T) => number | null, casas = 2): ColunaExportTabular<T> {
  return {
    rotulo,
    texto: (l) => formatarNumero(valor(l), casas),
    celula: (l) => {
      const v = valor(l);
      return v == null ? CELULA_VAZIA : celulaNumero(v);
    },
  };
}

/** Contagem — sem casa decimal. */
export function colunaInteiro<T>(rotulo: string, valor: (linha: T) => number | null): ColunaExportTabular<T> {
  return {
    rotulo,
    texto: (l) => formatarInteiro(valor(l)),
    celula: (l) => {
      const v = valor(l);
      return v == null ? CELULA_VAZIA : celulaNumero(Math.round(v));
    },
  };
}

/** Data pura ('YYYY-MM-DD' ou timestamptz) — chega como texto do PostgREST nos dois casos. */
export function colunaData<T>(rotulo: string, valor: (linha: T) => string | null): ColunaExportTabular<T> {
  return {
    rotulo,
    texto: (l) => formatarData(valor(l)),
    celula: (l) => {
      const bruto = valor(l);
      if (!bruto) return CELULA_VAZIA;
      const d = new Date(bruto);
      // Uma string que não é data de jeito nenhum ainda merece sair no arquivo,
      // como texto — sumir a linha inteira por uma célula estranha é pior.
      return Number.isNaN(d.getTime()) ? celulaTexto(bruto) : celulaData(d);
    },
  };
}

/** Booleano — 'Sim'/'Não' no CSV (mesma regra de `formatarBooleano`), tipado no XLSX. */
export function colunaBooleano<T>(rotulo: string, valor: (linha: T) => boolean | null): ColunaExportTabular<T> {
  return {
    rotulo,
    texto: (l) => {
      const v = valor(l);
      return v == null ? VAZIO : v ? 'Sim' : 'Não';
    },
    celula: (l) => {
      const v = valor(l);
      return v == null ? CELULA_VAZIA : celulaBooleano(v);
    },
  };
}

/** Escape de CSV. Delimitador ';' — ver o cabeçalho do arquivo. */
function escaparCsv(valor: string): string {
  return /[",;\n\r]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

/**
 * O arquivo inteiro de uma vez — nunca em fluxo. É a diferença de propósito
 * com `route.ts`: aqueles conjuntos são grandes o bastante para exigir streaming;
 * estes cabem inteiros em memória, e um `ReadableStream` aqui seria máquina a
 * mais para nenhum ganho.
 */
export function gerarCsvTabular<T>(colunas: readonly ColunaExportTabular<T>[], linhas: readonly T[]): string {
  const cabecalho = colunas.map((c) => escaparCsv(c.rotulo)).join(';');
  const corpo = linhas.map((l) => colunas.map((c) => escaparCsv(c.texto(l))).join(';')).join('\r\n');
  return '\uFEFF' + cabecalho + '\r\n' + corpo + (linhas.length > 0 ? '\r\n' : '');
}

export function gerarXlsxTabular<T>(
  colunas: readonly ColunaExportTabular<T>[],
  linhas: readonly T[],
  nomeAba: string,
  agora?: Date,
): Buffer {
  return gerarXlsx({
    cabecalho: colunas.map((c) => c.rotulo),
    linhas: linhas.map((l) => colunas.map((c) => c.celula(l))),
    nomeAba,
    agora,
  });
}

/**
 * Nome do arquivo, nos dois parâmetros que o RFC 5987 pede. Vai em `filename*`
 * porque nome de cliente tem acento, e navegador que só lê `filename=` puro
 * entrega "Fazenda SÃ£o JosÃ©.csv" — o `asciiSeguro` é a rede de segurança para
 * quem ainda ignora `filename*`.
 *
 * ÚNICA FONTE: era duplicado em `src/app/adm/api/export/route.ts` com o mesmo
 * corpo — a exportação de carteira precisou da mesma função, e duas cópias de
 * uma normalização Unicode são duas chances de divergir sem que ninguém note.
 */
export function contentDisposition(base: string, extensao: string): string {
  const limpo = base.replace(/[^\p{L}\p{N} ._-]/gu, '').trim() || 'export';
  const asciiSeguro = limpo.normalize('NFD').replace(/[\u0300-\u036F]/g, '').replace(/[^\w .-]/g, '_');
  return `attachment; filename="${asciiSeguro}.${extensao}"; filename*=UTF-8''${encodeURIComponent(limpo)}.${extensao}`;
}
