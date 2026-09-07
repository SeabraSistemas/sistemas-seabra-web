import { NextResponse } from 'next/server';

import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { contentDisposition } from '@/lib/adm/export-tabular';
import { formatarValorCru } from '@/lib/adm/format';
import { getAdmSession } from '@/lib/adm/guard';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { lerOpcoesTabela } from '@/lib/adm/params';
import { SUFIXO_ROTULO, cursorDaLinha, getEscopo, listarTabela } from '@/lib/adm/queries';
import { getColuna, getRegistro } from '@/lib/adm/tabelas';
import type { TabelaCatalogo } from '@/lib/adm/tabelas';
import type { ColunaRegistro, Escopo } from '@/lib/adm/types';
import {
  CELULA_VAZIA,
  XLSX_CONTENT_TYPE,
  type CelulaXlsx,
  booleano,
  data as celulaData,
  gerarXlsx,
  numero,
  texto,
} from '@/lib/adm/xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Exportação de qualquer tabela do painel, em CSV ou XLSX.
 *
 * A URL desta rota é a URL DA TELA mais `formato` — é o que garante que o
 * arquivo baixado seja exatamente o conjunto que está na grade, incluindo cada
 * faceta que alguém adicionar no futuro sem lembrar de mexer aqui.
 *
 * OS DOIS FORMATOS SÃO COISAS DIFERENTES, e não duas opções do mesmo botão:
 *
 *   CSV  sai em FLUXO, uma página de banco por vez, e por isso não tem teto de
 *        linhas. A memória da função nunca segura mais do que uma página.
 *   XLSX é montado inteiro em memória, porque o ZIP precisa do CRC e do tamanho
 *        de cada entrada antes dos dados (ver src/lib/adm/xlsx.ts). Daí o teto.
 *
 * O PDF não passa por aqui: por decisão D4 ele é a página /dossie com CSS de
 * impressão, que preserva a marca. Um PDF de tabela crua não é o que o Felipe
 * pediu — ele quer uma peça para mandar ao cliente.
 */

/** Teto do XLSX. Não é o limite do formato (1.048.576), é o da memória da função. */
const TETO_XLSX = 50_000;

/** Tamanho da página de banco em cada volta do fluxo. */
const PAGINA = 500;

/** Trava de segurança do CSV: 200 páginas de 500 = 100.000 linhas. */
const MAX_PAGINAS = 200;

function erroJson(status: number, mensagem: string) {
  return NextResponse.json({ erro: mensagem }, { status });
}

/**
 * A célula como TEXTO, para o CSV. Passa pelo rótulo resolvido quando existe:
 * `rebanho.categoria` guarda o UUID da categoria, e exportar o UUID em vez de
 * "Lactante" transforma a planilha em lixo para quem vai lê-la.
 */
function valorTexto(linha: Record<string, unknown>, coluna: ColunaRegistro): string {
  const rotulo = linha[`${coluna.chave}${SUFIXO_ROTULO}`];
  if (rotulo != null && rotulo !== '') return String(rotulo);
  return formatarValorCru(linha[coluna.chave]);
}

/**
 * A célula TIPADA, para o XLSX. Número vai como número e data como data, para
 * o Excel somar e filtrar de verdade — a diferença que justifica o formato
 * existir ao lado do CSV.
 */
function valorCelula(linha: Record<string, unknown>, coluna: ColunaRegistro): CelulaXlsx {
  const rotulo = linha[`${coluna.chave}${SUFIXO_ROTULO}`];
  if (rotulo != null && rotulo !== '') return texto(String(rotulo));

  const bruto = linha[coluna.chave];
  if (bruto == null || bruto === '') return CELULA_VAZIA;

  switch (coluna.tipo) {
    case 'numero': {
      const n = typeof bruto === 'number' ? bruto : Number(bruto);
      return Number.isFinite(n) ? numero(n) : texto(String(bruto));
    }
    case 'booleano':
      return typeof bruto === 'boolean' ? booleano(bruto) : texto(String(bruto));
    case 'data':
    case 'datahora': {
      const d = new Date(String(bruto));
      return Number.isNaN(d.getTime()) ? texto(String(bruto)) : celulaData(d);
    }
    default:
      return texto(formatarValorCru(bruto));
  }
}

/** Escape de CSV. Delimitador ';' — ver o cabeçalho de gerarCsv(). */
function escaparCsv(valor: string): string {
  return /[",;\n\r]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

interface Contexto {
  registro: TabelaCatalogo;
  colunas: ColunaRegistro[];
  escopo: Escopo;
  opcoes: ReturnType<typeof lerOpcoesTabela>['opcoes'];
}

/**
 * Percorre a tabela inteira em páginas keyset. Generator para que o CSV possa
 * emitir cada página assim que ela chega, em vez de esperar a última.
 */
async function* paginas(ctx: Contexto, maxPaginas: number) {
  let cursor: string | null = null;

  for (let i = 0; i < maxPaginas; i++) {
    const res = await listarTabela(ctx.registro, ctx.escopo, {
      ...ctx.opcoes,
      cursor,
      limite: PAGINA,
      // A contagem custa uma segunda ida ao banco por página e ninguém a lê aqui.
      contarTotal: false,
    });
    if (!res.ok) throw new Error(res.detalhe);

    const { linhas } = res.dados;
    if (linhas.length === 0) return;
    yield linhas;
    if (linhas.length < PAGINA) return;

    cursor = cursorDaLinha(ctx.registro, ctx.opcoes.ordem, linhas[linhas.length - 1]);
    // Sem cursor não há como avançar sem repetir a mesma página para sempre.
    if (!cursor) return;
  }
}

/**
 * CSV em fluxo. Delimitador ';' e BOM UTF-8 na frente: é o par que faz o Excel
 * em pt-BR abrir o arquivo com duplo clique, sem assistente de importação. Com
 * ',' o Excel brasileiro trata a vírgula como separador decimal e joga a linha
 * inteira numa célula só.
 */
function gerarCsv(ctx: Contexto, nomeArquivo: string, maxPaginas = MAX_PAGINAS): Response {
  const codificador = new TextEncoder();

  const fluxo = new ReadableStream<Uint8Array>({
    async start(controle) {
      try {
        controle.enqueue(codificador.encode('﻿'));
        controle.enqueue(codificador.encode(ctx.colunas.map((c) => escaparCsv(c.rotulo)).join(';') + '\r\n'));

        for await (const linhas of paginas(ctx, maxPaginas)) {
          // Uma string por página, não por linha: menos idas ao controle do
          // fluxo, e o pedaço continua pequeno o bastante para não pesar.
          const pedaco = linhas
            .map((linha) => ctx.colunas.map((c) => escaparCsv(valorTexto(linha, c))).join(';'))
            .join('\r\n');
          controle.enqueue(codificador.encode(pedaco + '\r\n'));
        }
        controle.close();
      } catch (e) {
        // O cabeçalho HTTP já foi enviado — não há como virar isto em 500. O
        // que dá para fazer é abortar o fluxo, e aí o navegador mostra download
        // interrompido em vez de entregar um arquivo truncado como se fosse bom.
        console.error('[adm] exportação CSV interrompida', e);
        controle.error(e);
      }
    },
  });

  return new Response(fluxo, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': contentDisposition(nomeArquivo, 'csv'),
      'Cache-Control': 'no-store',
    },
  });
}

async function gerarPlanilha(
  ctx: Contexto,
  nomeArquivo: string,
  maxPaginas = Math.ceil(TETO_XLSX / PAGINA),
): Promise<Response> {
  const linhas: CelulaXlsx[][] = [];
  let truncado = false;

  for await (const pagina of paginas(ctx, maxPaginas)) {
    for (const linha of pagina) {
      if (linhas.length >= TETO_XLSX) {
        truncado = true;
        break;
      }
      linhas.push(ctx.colunas.map((c) => valorCelula(linha, c)));
    }
    if (truncado) break;
  }

  const arquivo = gerarXlsx({
    cabecalho: ctx.colunas.map((c) => c.rotulo),
    linhas,
    nomeAba: ctx.registro.rotulo,
  });

  return new Response(new Uint8Array(arquivo), {
    headers: {
      'Content-Type': XLSX_CONTENT_TYPE,
      'Content-Disposition': contentDisposition(nomeArquivo, 'xlsx'),
      'Cache-Control': 'no-store',
      // O teto não pode ser silencioso: um arquivo cortado que se apresenta
      // como completo é pior que um erro. A tela lê este header para avisar.
      ...(truncado ? { 'X-Adm-Truncado': String(TETO_XLSX) } : {}),
    },
  });
}

export async function GET(request: Request) {
  // O gate não redireciona aqui: uma rota de arquivo tem que responder 401 em
  // JSON, senão o navegador baixa a página de login com extensão .csv.
  const sessao = await getAdmSession();
  if (!sessao) return erroJson(401, 'Sessão expirada. Entre novamente.');

  const url = new URL(request.url);
  const params = url.searchParams;

  const formato = params.get('formato') === 'xlsx' ? 'xlsx' : 'csv';

  const registro = getRegistro(params.get('tabela') ?? '');
  if (!registro) return erroJson(404, 'Tabela desconhecida.');

  const usuarioId = Number(params.get('usuario'));
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) return erroJson(400, 'Usuário inválido.');

  // `prop=todas` é seleção válida (carteira consolidada do técnico, produtor
  // com várias fazendas). Descartá-la fazia a tela mostrar N propriedades e o
  // arquivo trazer só a primeira — divergência silenciosa entre o que se vê e
  // o que se baixa.
  const prop = lerSelecaoParam(params.get('prop'));

  const escopoRes = await getEscopo(usuarioId, prop);
  if (!escopoRes.ok) {
    return erroJson(escopoRes.motivo === 'sem-config' ? 503 : 500, escopoRes.detalhe);
  }

  const { opcoes } = lerOpcoesTabela(registro, params, { limitePadrao: PAGINA });

  // Duas intenções diferentes, e o rádio do ExportMenu manda qual é:
  //  · 'pagina'   — exatamente as linhas carregadas na grade (uma página só);
  //  · 'filtrado' — todo o conjunto que os filtros selecionam (varre em fluxo).
  // Sem honrar isso, a opção "só a página atual" baixava a tabela inteira —
  // e um botão que promete o que não cumpre é pior que um botão ausente.
  const soPagina = params.get('escopo') === 'pagina';
  const tamanhoTela = Number(params.get('size'));
  const limitePagina =
    Number.isFinite(tamanhoTela) && tamanhoTela > 0 ? Math.min(Math.floor(tamanhoTela), PAGINA) : PAGINA;

  const opcoesExport = soPagina
    ? { ...opcoes, cursor: params.get('cursor'), limite: limitePagina }
    : { ...opcoes, cursor: null, limite: PAGINA };

  const colunas = (opcoes.colunas ?? [])
    .map((chave) => getColuna(registro, chave))
    .filter((c): c is ColunaRegistro => c !== null);
  if (colunas.length === 0) return erroJson(400, 'Nenhuma coluna válida para exportar.');

  const ctx: Contexto = {
    registro,
    colunas,
    escopo: escopoRes.dados,
    opcoes: opcoesExport,
  };

  const base =
    params.get('nome')?.trim() ||
    `${registro.nome}-${escopoRes.dados.selecionada?.nome ?? escopoRes.dados.usuario.nome}`;

  // A trilha registra a EXPORTAÇÃO, não o conteúdo: id, tabela e contagem de
  // colunas. Um arquivo saindo do painel é o evento que mais importa numa
  // resposta a incidente — é ele que responde "o que exatamente vazou".
  await registrarAcesso('exportou', {
    sid: sessao.sid,
    ator: sessao.sub,
    alvoTipo: 'tabela',
    alvoId: usuarioId,
    detalhes: {
      tabela: registro.nome,
      formato,
      colunas: colunas.length,
      propriedade: escopoRes.dados.selecionada?.id ?? null,
    },
    ip: extrairIp(request.headers),
    userAgent: extrairUserAgent(request.headers),
  });

  try {
    const maxPaginas = soPagina ? 1 : undefined;
    return formato === 'xlsx'
      ? await gerarPlanilha(ctx, base, maxPaginas)
      : gerarCsv(ctx, base, maxPaginas);
  } catch (e) {
    console.error('[adm] falha ao exportar', registro.nome, e);
    return erroJson(500, 'Não foi possível gerar o arquivo.');
  }
}
