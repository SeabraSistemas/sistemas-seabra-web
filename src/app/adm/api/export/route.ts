import { NextResponse } from 'next/server';

import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { contentDisposition } from '@/lib/adm/export-tabular';
import { lerIds, naOrdemDosIds, preFiltroServidor, projecaoParaExport } from '@/lib/adm/export-grade';
import { filtrarLinhas, lerFiltros, type FacetaDef, type Filtros } from '@/lib/adm/facetas';
import { chaveDaLinha, facetasDoRegistro, type LinhaGrade } from '@/lib/adm/facetas-catalogo';
import { formatarValorCru } from '@/lib/adm/format';
import { getAdmSession } from '@/lib/adm/guard';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { lerOrdens, ordenarLinhas, type Ordem } from '@/lib/adm/ordenacao';
import { lerOpcoesTabela } from '@/lib/adm/params';
import { SUFIXO_ROTULO, cursorDaLinha, getEscopo, listarTabela } from '@/lib/adm/queries';
import { colunasPermitidas, getColuna, getRegistro } from '@/lib/adm/tabelas';
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
 * O FILTRO É O DA GRADE, RODADO AQUI. A grade filtra em memória — rótulo da FK
 * ('Lactante', não o uuid), texto sem acento, "(vazio)" como valor — e esta
 * rota refazia o filtro no banco com outra gramática: `eq categoria 'Lactante'`
 * numa coluna uuid estourava, `ilike` não ignorava acento, e "só a página atual"
 * mandava um cursor que a paginação em memória não tem. O arquivo não trazia o
 * que a tela mostrava. Agora as facetas e o `filtrarLinhas` são os MESMOS
 * módulos puros que a grade usa (facetas.ts, facetas-catalogo.ts); o banco só
 * recebe um pré-filtro de data que é superconjunto, e a página atual vem pelas
 * CHAVES das linhas visíveis (`?ids=`), na ordem da tela.
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
  /** As colunas que saem no arquivo. */
  colunas: ColunaRegistro[];
  escopo: Escopo;
  /** O que vai ao banco: projeção ampliada, ordem de nível 1 e o pré-filtro de data. */
  opcoes: ReturnType<typeof lerOpcoesTabela>['opcoes'];
  /** O filtro da GRADE, aplicado em memória a cada página — a mesma função da tela. */
  facetas: FacetaDef<LinhaGrade>[];
  filtros: Filtros;
  /** A ordenação multi-nível da tela, aplicada ao XLSX (que é montado inteiro). */
  ordens: Ordem[];
}

/**
 * Percorre a tabela inteira em páginas keyset e devolve de cada página só o
 * que passa no filtro da grade. Generator para que o CSV possa emitir cada
 * página assim que ela chega, em vez de esperar a última.
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
    // O filtro exato, em memória, sobre a página bruta — página que ficou vazia
    // depois dele não encerra a varredura: a próxima pode ter o que se procura.
    const aprovadas = filtrarLinhas(linhas, ctx.facetas, ctx.filtros);
    if (aprovadas.length > 0) yield aprovadas;
    if (linhas.length < PAGINA) return;

    cursor = cursorDaLinha(ctx.registro, ctx.opcoes.ordem, linhas[linhas.length - 1]);
    // Sem cursor não há como avançar sem repetir a mesma página para sempre.
    if (!cursor) return;
  }
}

/**
 * "Só a página atual": as linhas cujas chaves a grade mandou, na ordem em que
 * a grade as mostra. O banco não conhece a paginação em memória da tela; as
 * chaves são o único endereço fiel.
 */
async function linhasDaPagina(ctx: Contexto, chave: string, ids: string[]): Promise<LinhaGrade[]> {
  const res = await listarTabela(ctx.registro, ctx.escopo, {
    colunas: ctx.opcoes.colunas,
    filtros: [{ coluna: chave, op: 'in', valores: ids }],
    limite: ids.length,
    contarTotal: false,
  });
  if (!res.ok) throw new Error(res.detalhe);
  return naOrdemDosIds(res.dados.linhas, chave, ids);
}

/** Uma página só, como fonte assíncrona — para a página atual passar pelo mesmo
 *  gerador de arquivo que a varredura. */
async function* umaPagina(promessa: Promise<LinhaGrade[]>) {
  const linhas = await promessa;
  if (linhas.length > 0) yield linhas;
}

/**
 * CSV em fluxo. Delimitador ';' e BOM UTF-8 na frente: é o par que faz o Excel
 * em pt-BR abrir o arquivo com duplo clique, sem assistente de importação. Com
 * ',' o Excel brasileiro trata a vírgula como separador decimal e joga a linha
 * inteira numa célula só.
 */
function gerarCsv(ctx: Contexto, nomeArquivo: string, fonte: AsyncIterable<LinhaGrade[]>): Response {
  const codificador = new TextEncoder();

  const fluxo = new ReadableStream<Uint8Array>({
    async start(controle) {
      try {
        controle.enqueue(codificador.encode('﻿'));
        controle.enqueue(codificador.encode(ctx.colunas.map((c) => escaparCsv(c.rotulo)).join(';') + '\r\n'));

        for await (const linhas of fonte) {
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
  fonte: AsyncIterable<LinhaGrade[]>,
  /** Ordena como a tela quando a fonte é a varredura; a página atual já vem na ordem certa. */
  ordenar: boolean,
): Promise<Response> {
  const brutas: LinhaGrade[] = [];
  let truncado = false;

  for await (const pagina of fonte) {
    for (const linha of pagina) {
      if (brutas.length >= TETO_XLSX) {
        truncado = true;
        break;
      }
      brutas.push(linha);
    }
    if (truncado) break;
  }

  // O XLSX é montado inteiro em memória de qualquer jeito, então cabe ordená-lo
  // como a grade — multi-nível, nulo por último. O CSV, que sai em fluxo, fica
  // na ordem do banco (o nível 1 da tela), e o menu diz isso.
  const ordenadas = ordenar
    ? ordenarLinhas(brutas, ctx.ordens, colunasPermitidas(ctx.registro).map((c) => ({ chave: c.chave })))
    : brutas;
  const linhas: CelulaXlsx[][] = ordenadas.map((linha) => ctx.colunas.map((c) => valorCelula(linha, c)));

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

  // `cols` e `sort` passam pela allowlist de sempre; os `f.*` NÃO entram daqui
  // — eles são lidos pela gramática da grade, abaixo.
  const { opcoes } = lerOpcoesTabela(registro, params, { limitePadrao: PAGINA });
  const agora = new Date();

  const colunas = (opcoes.colunas ?? [])
    .map((chave) => getColuna(registro, chave))
    .filter((c): c is ColunaRegistro => c !== null);
  if (colunas.length === 0) return erroJson(400, 'Nenhuma coluna válida para exportar.');

  // O MESMO filtro da tela: mesmas facetas, mesma leitura da URL, mesma função.
  const facetas = facetasDoRegistro(registro);
  const filtros = lerFiltros(facetas, params, agora);
  const permitidas = new Set(colunasPermitidas(registro).map((c) => c.chave));
  const ordens = lerOrdens(params.get('sort'), permitidas);
  const chave = chaveDaLinha(registro);

  // A projeção que vai ao banco é maior que a do arquivo: o filtro e a ordem
  // precisam ler as colunas deles, mesmo que não saiam na planilha.
  const projecao = projecaoParaExport(
    chave,
    colunas.map((c) => c.chave),
    filtros,
    ordens,
  ).filter((c) => permitidas.has(c) || c === chave);

  // Duas intenções diferentes, e o rádio do ExportMenu manda qual é:
  //  · 'pagina'   — exatamente as linhas que estão na grade, pelas CHAVES delas;
  //  · 'filtrado' — todo o conjunto que os filtros selecionam (varre em fluxo).
  const soPagina = params.get('escopo') === 'pagina';
  const ids = soPagina ? lerIds(params.get('ids')) : [];

  const ctx: Contexto = {
    registro,
    colunas,
    escopo: escopoRes.dados,
    opcoes: {
      ...opcoes,
      colunas: projecao,
      cursor: null,
      limite: PAGINA,
      // Só o pré-filtro de data (superconjunto) vai ao banco; o resto é memória.
      ...preFiltroServidor(registro, facetas, filtros),
    },
    facetas,
    filtros,
    ordens,
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
    if (soPagina) {
      // Link antigo sem `ids` (menu de antes desta correção): cai no conjunto
      // filtrado, que é o mais próximo honesto do que o botão prometia.
      const fonte = ids.length > 0 ? umaPagina(linhasDaPagina(ctx, chave, ids)) : paginas(ctx, 1);
      return formato === 'xlsx'
        ? await gerarPlanilha(ctx, base, fonte, ids.length === 0)
        : gerarCsv(ctx, base, fonte);
    }
    return formato === 'xlsx'
      ? await gerarPlanilha(ctx, base, paginas(ctx, Math.ceil(TETO_XLSX / PAGINA)), true)
      : gerarCsv(ctx, base, paginas(ctx, MAX_PAGINAS));
  } catch (e) {
    console.error('[adm] falha ao exportar', registro.nome, e);
    return erroJson(500, 'Não foi possível gerar o arquivo.');
  }
}
