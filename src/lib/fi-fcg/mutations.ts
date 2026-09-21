import 'server-only';
import {
  adicionarLinha,
  encontrarLinhaPorId,
  escreverCelulas,
  escreverLinha,
  lerAba,
  limparLinha,
  type CelulasParaEscrever,
} from '@/lib/sheets/server';
import { formatDia, formatMoeda, formatNumber } from '@/lib/painel/format';
import { recalcularGmdDoLote, type AnimalParaRecalculo } from '@/lib/fi-fcg/gmd';
import { spreadsheetId } from './config';
import type { DiaCompacto, TipoCusto } from './types';

/**
 * Escrita do /FI_FCG — Custos e Categorias de Custo (15/09/2026), as duas
 * abas criadas pra guardar o que o usuário digita no site (não vêm do
 * AppSheet do cliente). Primeira escrita do FI_FCG; segue o mesmo padrão
 * de cuidado descoberto no incidente do Katmandu (09/09/2026): data SEMPRE
 * `USER_ENTERED`, nunca RAW (RAW não reconhece "dd/mm/aaaa" como data e
 * quebra a formatação da célula). "Excluir" nunca remove a linha de
 * verdade — limpa o conteúdo (ver `limparLinha`), e a linha com ID vazio
 * já é ignorada por `mapCustos`/`mapCategoriasCusto`.
 */
const ABA_CATEGORIAS = 'Categorias de Custo';
const ABA_CUSTOS = 'Custos';

function citar(aba: string): string {
  return `'${aba}'`;
}

function gerarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface DadosCategoriaCusto {
  nome: string;
}

export async function criarCategoriaCusto(dados: DadosCategoriaCusto): Promise<{ ok: boolean; id: string | null }> {
  const sid = spreadsheetId();
  const nome = dados.nome.trim();
  if (!sid || !nome) return { ok: false, id: null };
  const id = gerarId();
  const ok = await adicionarLinha(sid, ABA_CATEGORIAS, [id, nome], 'RAW');
  return { ok, id: ok ? id : null };
}

export async function renomearCategoriaCusto(id: string, dados: DadosCategoriaCusto): Promise<boolean> {
  const sid = spreadsheetId();
  const nome = dados.nome.trim();
  if (!sid || !nome) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_CATEGORIAS, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_CATEGORIAS)}!A${linha}:B${linha}`, [id, nome], 'RAW');
}

export async function excluirCategoriaCusto(id: string): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_CATEGORIAS, 'ID', id);
  if (linha == null) return false;
  return limparLinha(sid, `${citar(ABA_CATEGORIAS)}!A${linha}:B${linha}`);
}

export interface DadosCusto {
  descricao: string;
  categoria: string | null;
  /** Obrigatória (16/09/2026) — todo custo é de uma fazenda específica, nunca "Geral"/toda a operação. */
  fazenda: string;
  tipo: TipoCusto;
  valor: number;
  dataInicio: DiaCompacto;
  dataFim: DiaCompacto | null;
  observacao: string | null;
}

function linhaCusto(id: string, d: DadosCusto): string[] {
  return [
    id,
    d.descricao.trim(),
    d.categoria ?? '',
    d.fazenda ?? '',
    d.tipo,
    formatMoeda(d.valor),
    formatDia(d.dataInicio),
    d.dataFim != null ? formatDia(d.dataFim) : '',
    d.observacao ?? '',
  ];
}

export async function criarCusto(dados: DadosCusto): Promise<{ ok: boolean; id: string | null }> {
  const sid = spreadsheetId();
  if (!sid || !dados.descricao.trim()) return { ok: false, id: null };
  const id = gerarId();
  const ok = await adicionarLinha(sid, ABA_CUSTOS, linhaCusto(id, dados), 'USER_ENTERED');
  return { ok, id: ok ? id : null };
}

export async function atualizarCusto(id: string, dados: DadosCusto): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !dados.descricao.trim()) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_CUSTOS, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_CUSTOS)}!A${linha}:I${linha}`, linhaCusto(id, dados), 'USER_ENTERED');
}

export async function excluirCusto(id: string): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_CUSTOS, 'ID', id);
  if (linha == null) return false;
  return limparLinha(sid, `${citar(ABA_CUSTOS)}!A${linha}:I${linha}`);
}

/**
 * Escrita do "Custo de formação" (16/09/2026) — 3 abas novas, mesmo padrão
 * de cuidado acima (data/número sempre `USER_ENTERED`, "excluir" limpa a
 * linha). "GMD por Categoria" não tem criarGmdCategoria/excluirGmdCategoria
 * — as 7 linhas (uma por categoria do funil) são fixas, semeadas uma vez na
 * criação da aba; só se edita o valor.
 */
const ABA_INSUMOS = 'Insumos';
const ABA_DIETA = 'Dieta por Categoria';
const ABA_GMD_CATEGORIA = 'GMD por Categoria';

export interface DadosInsumo {
  nome: string;
  tipo: string | null;
  valorKg: number;
}

function linhaInsumo(id: string, d: DadosInsumo): string[] {
  return [id, d.nome.trim(), d.tipo ?? '', formatMoeda(d.valorKg)];
}

export async function criarInsumo(dados: DadosInsumo): Promise<{ ok: boolean; id: string | null }> {
  const sid = spreadsheetId();
  if (!sid || !dados.nome.trim()) return { ok: false, id: null };
  const id = gerarId();
  const ok = await adicionarLinha(sid, ABA_INSUMOS, linhaInsumo(id, dados), 'USER_ENTERED');
  return { ok, id: ok ? id : null };
}

export async function atualizarInsumo(id: string, dados: DadosInsumo): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !dados.nome.trim()) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_INSUMOS, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_INSUMOS)}!A${linha}:D${linha}`, linhaInsumo(id, dados), 'USER_ENTERED');
}

export async function excluirInsumo(id: string): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_INSUMOS, 'ID', id);
  if (linha == null) return false;
  return limparLinha(sid, `${citar(ABA_INSUMOS)}!A${linha}:D${linha}`);
}

export interface DadosItemDieta {
  categoria: string;
  insumo: string;
  /** % que esse insumo representa DENTRO do seu tipo (Concentrado/Volumoso/Sal mineral) — não kg/dia direto, ver types.ts. */
  percentual: number;
}

function linhaItemDieta(id: string, d: DadosItemDieta): string[] {
  return [id, d.categoria.trim(), d.insumo.trim(), formatNumber(d.percentual)];
}

export async function criarItemDieta(dados: DadosItemDieta): Promise<{ ok: boolean; id: string | null }> {
  const sid = spreadsheetId();
  if (!sid || !dados.categoria.trim() || !dados.insumo.trim()) return { ok: false, id: null };
  const id = gerarId();
  const ok = await adicionarLinha(sid, ABA_DIETA, linhaItemDieta(id, dados), 'USER_ENTERED');
  return { ok, id: ok ? id : null };
}

export async function atualizarItemDieta(id: string, dados: DadosItemDieta): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !dados.categoria.trim() || !dados.insumo.trim()) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_DIETA, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_DIETA)}!A${linha}:D${linha}`, linhaItemDieta(id, dados), 'USER_ENTERED');
}

export async function excluirItemDieta(id: string): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_DIETA, 'ID', id);
  if (linha == null) return false;
  return limparLinha(sid, `${citar(ABA_DIETA)}!A${linha}:D${linha}`);
}

/** Só edita o GMD (kg/dia) de uma categoria já existente — não cria nem apaga linha. */
export async function atualizarGmdCategoria(id: string, gmdKgDia: number): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !Number.isFinite(gmdKgDia)) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_GMD_CATEGORIA, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_GMD_CATEGORIA)}!C${linha}`, [formatNumber(gmdKgDia)], 'USER_ENTERED');
}

const ABA_MARCOS_IDADE = 'Idades por Marco';

/** Só edita a idade (dias) de um marco já existente — as 5 linhas são fixas, mesmo padrão de `atualizarGmdCategoria`. */
export async function atualizarMarcoIdade(id: string, idadeDias: number): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !Number.isFinite(idadeDias)) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_MARCOS_IDADE, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_MARCOS_IDADE)}!C${linha}`, [formatNumber(idadeDias)], 'USER_ENTERED');
}

const ABA_CONSUMO_CATEGORIA = 'Consumo por Categoria';

/** Só edita o consumo total (kg/dia) de um tipo (Concentrado/Volumoso/Sal mineral) já existente por categoria — as 21 linhas (7 categorias × 3 tipos) são fixas, mesmo padrão de `atualizarGmdCategoria`. */
export async function atualizarConsumoCategoria(id: string, kgDia: number): Promise<boolean> {
  const sid = spreadsheetId();
  if (!sid || !Number.isFinite(kgDia)) return false;
  const linha = await encontrarLinhaPorId(sid, ABA_CONSUMO_CATEGORIA, 'ID', id);
  if (linha == null) return false;
  return escreverLinha(sid, `${citar(ABA_CONSUMO_CATEGORIA)}!D${linha}`, [formatNumber(kgDia)], 'USER_ENTERED');
}

/* ------------------------------------------------------------------ *
 * Formar lote + iniciar/editar GMD (21/09/2026)
 *
 * PRIMEIRA escrita do site nas abas do PRÓPRIO AppSheet do cliente
 * (RebanhoProd, Pesagem, Engorda, Lotes) — até aqui só escrevíamos em abas
 * nossas (Custos, Insumos...). Por isso, três cuidados extras:
 *
 * 1. Coluna é resolvida pelo NOME do header a cada escrita (mesmo princípio
 *    dos mapeadores) — se alguém reordenar coluna na planilha, a escrita
 *    acompanha em vez de acertar a célula errada. Header faltando => aborta
 *    sem escrever nada.
 * 2. Número vai sem separador de milhar ("1095", não "1.095") e data sempre
 *    `USER_ENTERED` (lição do incidente do Katmandu).
 * 3. Tudo tem uma prévia (`previewInicioGmd`) que calcula sem gravar.
 *
 * Escrita via API NÃO dispara bot do AppSheet — então gravamos o estado
 * derivado (Dias em engorda/GMD) nós mesmos, em vez de esperar que ele
 * recalcule.
 * ------------------------------------------------------------------ */
const ABA_REBANHO_PROD = 'RebanhoProd';
const ABA_PESAGEM = 'Pesagem';
const ABA_ENGORDA = 'Engorda';
const ABA_LOTES = 'Lotes';

/** 0 -> "A", 25 -> "Z", 26 -> "AA", 92 -> "CO". */
function letraDaColuna(indice: number): string {
  let letras = '';
  let n = indice;
  while (n >= 0) {
    letras = String.fromCharCode(65 + (n % 26)) + letras;
    n = Math.floor(n / 26) - 1;
  }
  return letras;
}

/** Número pro Sheets: vírgula decimal, SEM separador de milhar (evita "1.095" virar outra coisa no USER_ENTERED). */
function numeroPlanilha(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 2, useGrouping: false });
}

/** Índice de cada header pedido. null se QUALQUER um faltar — melhor abortar do que escrever na coluna errada. */
function indicesDeHeader(header: string[] | undefined, nomes: string[]): Record<string, number> | null {
  if (!header) return null;
  const achados: Record<string, number> = {};
  for (const nome of nomes) {
    const i = header.findIndex((h) => String(h).trim() === nome);
    if (i < 0) return null;
    achados[nome] = i;
  }
  return achados;
}

function celula(aba: string, indiceColuna: number, linha: number, valor: string): CelulasParaEscrever {
  return { range: `'${aba}'!${letraDaColuna(indiceColuna)}${linha}`, valores: [[valor]] };
}

export interface ResultadoFormarLote {
  ok: boolean;
  erro?: string;
  atualizados: number;
  naoEncontrados: string[];
  loteCadastrado: boolean;
}

/**
 * Grava o `lote` em RebanhoProd pros animais escolhidos e, se o nome ainda
 * não existir na aba `Lotes`, cadastra lá também (é de onde sai o dropdown
 * do AppSheet — sem isso o lote existiria no animal mas não na lista).
 */
export async function formarLote(nomeLote: string, idsAnimais: string[]): Promise<ResultadoFormarLote> {
  const sid = spreadsheetId();
  const nome = nomeLote.trim();
  if (!sid || !nome || idsAnimais.length === 0) {
    return { ok: false, erro: 'dados incompletos', atualizados: 0, naoEncontrados: [], loteCadastrado: false };
  }

  const linhas = await lerAba(sid, ABA_REBANHO_PROD);
  const idx = indicesDeHeader(linhas?.[0], ['ID animal', 'lote']);
  if (!linhas || !idx) {
    return { ok: false, erro: 'não consegui ler RebanhoProd', atualizados: 0, naoEncontrados: [], loteCadastrado: false };
  }

  const linhaPorId = new Map<string, number>();
  linhas.forEach((linha, i) => {
    if (i === 0) return;
    const id = (linha[idx['ID animal']] ?? '').trim();
    if (id && !linhaPorId.has(id)) linhaPorId.set(id, i + 1); // +1: a planilha é 1-based e a linha 1 é o header
  });

  const atualizacoes: CelulasParaEscrever[] = [];
  const naoEncontrados: string[] = [];
  for (const id of idsAnimais) {
    const linha = linhaPorId.get(id.trim());
    if (linha == null) {
      naoEncontrados.push(id);
      continue;
    }
    atualizacoes.push(celula(ABA_REBANHO_PROD, idx['lote'], linha, nome));
  }

  const { ok } = await escreverCelulas(sid, atualizacoes, 'USER_ENTERED');
  if (!ok) return { ok: false, erro: 'falha ao gravar na planilha', atualizados: 0, naoEncontrados, loteCadastrado: false };

  // cadastra o nome na aba Lotes se for novo (comparação sem diferenciar maiúscula/acento de espaço extra)
  let loteCadastrado = false;
  const lotes = await lerAba(sid, ABA_LOTES);
  const jaExiste = (lotes ?? []).slice(1).some((l) => (l[1] ?? '').trim().toLowerCase() === nome.toLowerCase());
  if (!jaExiste) loteCadastrado = await adicionarLinha(sid, ABA_LOTES, [gerarId(), nome], 'RAW');

  return { ok: true, atualizados: atualizacoes.length, naoEncontrados, loteCadastrado };
}

export interface MudancaGmdAnimal {
  id: string;
  pesoEntradaKg: number;
  dataPesoEntrada: DiaCompacto;
  /** O que está hoje na planilha (RebanhoProd), pra prévia mostrar "de -> para". */
  diasDe: number | null;
  gmdDe: number | null;
  diasPara: number;
  gmdPara: number | null;
  pesagensAfetadas: number;
}

export interface PreviaInicioGmd {
  ok: boolean;
  erro?: string;
  totalAnimais: number;
  totalPesagens: number;
  semPesagemNoPeriodo: string[];
  naoEncontrados: string[];
  mudancas: MudancaGmdAnimal[];
}

function paraNumero(bruto: string | undefined): number | null {
  if (bruto == null) return null;
  const limpo = String(bruto).trim().replace(/\./g, '').replace(',', '.');
  if (limpo === '') return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

function paraDia(bruto: string | undefined): DiaCompacto | null {
  const texto = String(bruto ?? '').trim();
  const m = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return Number(`${m[3]}${m[2]}${m[1]}`);
}

/** Lê RebanhoProd + Pesagem e monta o recálculo — base da prévia e da gravação (as duas veem exatamente a mesma conta). */
async function montarRecalculo(sid: string, idsAnimais: string[], dataInicio: DiaCompacto) {
  const [rebanho, pesagem] = await Promise.all([lerAba(sid, ABA_REBANHO_PROD), lerAba(sid, ABA_PESAGEM)]);
  const idxReb = indicesDeHeader(rebanho?.[0], [
    'ID animal',
    'ID eletrônica',
    'Entrada engorda',
    'Peso entrada engorda',
    'Dias em engorda',
    'GMD',
    'Fazenda',
    'lote',
  ]);
  const idxPes = indicesDeHeader(pesagem?.[0], [
    'ID animal',
    'Data da pesagem',
    'Peso/kg',
    'Peso entrada engorda',
    'Dias em engorda',
    'GMD',
  ]);
  if (!rebanho || !pesagem || !idxReb || !idxPes) return null;

  const alvo = new Set(idsAnimais.map((i) => i.trim()).filter(Boolean));

  const linhaRebanhoPorId = new Map<string, number>();
  const dadosRebanhoPorId = new Map<string, string[]>();
  rebanho.forEach((linha, i) => {
    if (i === 0) return;
    const id = (linha[idxReb['ID animal']] ?? '').trim();
    if (!id || !alvo.has(id) || linhaRebanhoPorId.has(id)) return;
    linhaRebanhoPorId.set(id, i + 1);
    dadosRebanhoPorId.set(id, linha);
  });

  const pesagensPorId = new Map<string, { linha: number; data: DiaCompacto; pesoKg: number }[]>();
  pesagem.forEach((linha, i) => {
    if (i === 0) return;
    const id = (linha[idxPes['ID animal']] ?? '').trim();
    if (!id || !alvo.has(id)) return;
    const data = paraDia(linha[idxPes['Data da pesagem']]);
    const pesoKg = paraNumero(linha[idxPes['Peso/kg']]);
    if (data == null || pesoKg == null) return;
    if (!pesagensPorId.has(id)) pesagensPorId.set(id, []);
    pesagensPorId.get(id)!.push({ linha: i + 1, data, pesoKg });
  });

  const naoEncontrados = [...alvo].filter((id) => !linhaRebanhoPorId.has(id));
  const entrada: AnimalParaRecalculo[] = [...linhaRebanhoPorId.entries()].map(([id, linhaRebanho]) => ({
    id,
    linhaRebanho,
    pesagens: pesagensPorId.get(id) ?? [],
  }));

  return {
    recalculo: recalcularGmdDoLote(entrada, dataInicio),
    naoEncontrados,
    idxReb,
    idxPes,
    dadosRebanhoPorId,
  };
}

/** Calcula tudo e NÃO grava — é o que a tela mostra antes de o usuário confirmar. */
export async function previewInicioGmd(idsAnimais: string[], dataInicio: DiaCompacto): Promise<PreviaInicioGmd> {
  const sid = spreadsheetId();
  if (!sid || idsAnimais.length === 0) {
    return { ok: false, erro: 'dados incompletos', totalAnimais: 0, totalPesagens: 0, semPesagemNoPeriodo: [], naoEncontrados: [], mudancas: [] };
  }
  const montado = await montarRecalculo(sid, idsAnimais, dataInicio);
  if (!montado) {
    return { ok: false, erro: 'não consegui ler a planilha', totalAnimais: 0, totalPesagens: 0, semPesagemNoPeriodo: [], naoEncontrados: [], mudancas: [] };
  }

  const { recalculo, naoEncontrados, idxReb, dadosRebanhoPorId } = montado;
  const mudancas: MudancaGmdAnimal[] = recalculo.animais.map((a) => {
    const atual = dadosRebanhoPorId.get(a.id) ?? [];
    return {
      id: a.id,
      pesoEntradaKg: a.pesoEntradaKg,
      dataPesoEntrada: a.dataPesoEntrada,
      diasDe: paraNumero(atual[idxReb['Dias em engorda']]),
      gmdDe: paraNumero(atual[idxReb['GMD']]),
      diasPara: a.diasEngordaAtual,
      gmdPara: a.gmdAtual,
      pesagensAfetadas: a.pesagens.length,
    };
  });

  return {
    ok: true,
    totalAnimais: recalculo.animais.length,
    totalPesagens: recalculo.totalPesagens,
    semPesagemNoPeriodo: recalculo.semPesagemNoPeriodo,
    naoEncontrados,
    mudancas,
  };
}

export interface ResultadoInicioGmd {
  ok: boolean;
  erro?: string;
  animaisAtualizados: number;
  pesagensAtualizadas: number;
  linhasEngordaCriadas: number;
  semPesagemNoPeriodo: string[];
}

/**
 * Grava de verdade: `Entrada engorda`/`Peso entrada engorda`/`Dias em
 * engorda`/`GMD` em RebanhoProd, as 3 colunas de cada pesagem a partir da
 * data, e o evento na aba `Engorda`.
 */
export async function aplicarInicioGmd(idsAnimais: string[], dataInicio: DiaCompacto): Promise<ResultadoInicioGmd> {
  const sid = spreadsheetId();
  if (!sid || idsAnimais.length === 0) {
    return { ok: false, erro: 'dados incompletos', animaisAtualizados: 0, pesagensAtualizadas: 0, linhasEngordaCriadas: 0, semPesagemNoPeriodo: [] };
  }
  const montado = await montarRecalculo(sid, idsAnimais, dataInicio);
  if (!montado) {
    return { ok: false, erro: 'não consegui ler a planilha', animaisAtualizados: 0, pesagensAtualizadas: 0, linhasEngordaCriadas: 0, semPesagemNoPeriodo: [] };
  }
  const { recalculo, idxReb, idxPes, dadosRebanhoPorId } = montado;
  if (recalculo.animais.length === 0) {
    return { ok: true, animaisAtualizados: 0, pesagensAtualizadas: 0, linhasEngordaCriadas: 0, semPesagemNoPeriodo: recalculo.semPesagemNoPeriodo };
  }

  const dataTexto = formatDia(dataInicio);
  const atualizacoes: CelulasParaEscrever[] = [];

  for (const a of recalculo.animais) {
    atualizacoes.push(celula(ABA_REBANHO_PROD, idxReb['Entrada engorda'], a.linhaRebanho, dataTexto));
    atualizacoes.push(celula(ABA_REBANHO_PROD, idxReb['Peso entrada engorda'], a.linhaRebanho, numeroPlanilha(a.pesoEntradaKg)));
    atualizacoes.push(celula(ABA_REBANHO_PROD, idxReb['Dias em engorda'], a.linhaRebanho, numeroPlanilha(a.diasEngordaAtual)));
    atualizacoes.push(
      celula(ABA_REBANHO_PROD, idxReb['GMD'], a.linhaRebanho, a.gmdAtual == null ? '' : numeroPlanilha(a.gmdAtual)),
    );

    for (const p of a.pesagens) {
      atualizacoes.push(celula(ABA_PESAGEM, idxPes['Peso entrada engorda'], p.linha, numeroPlanilha(p.pesoEntradaKg)));
      atualizacoes.push(celula(ABA_PESAGEM, idxPes['Dias em engorda'], p.linha, numeroPlanilha(p.diasEngorda)));
      atualizacoes.push(celula(ABA_PESAGEM, idxPes['GMD'], p.linha, p.gmd == null ? '' : numeroPlanilha(p.gmd)));
    }
  }

  const { ok } = await escreverCelulas(sid, atualizacoes, 'USER_ENTERED');
  if (!ok) {
    return { ok: false, erro: 'falha ao gravar na planilha', animaisAtualizados: 0, pesagensAtualizadas: 0, linhasEngordaCriadas: 0, semPesagemNoPeriodo: recalculo.semPesagemNoPeriodo };
  }

  // evento na aba Engorda — pula quem já tem linha com a MESMA data (reeditar a data não duplica o histórico)
  let linhasEngordaCriadas = 0;
  const engorda = await lerAba(sid, ABA_ENGORDA);
  const idxEng = indicesDeHeader(engorda?.[0], ['ID animal', 'Entrada engorda']);
  if (engorda && idxEng) {
    const jaTem = new Set(
      engorda.slice(1).map((l) => `${(l[idxEng['ID animal']] ?? '').trim()}|${(l[idxEng['Entrada engorda']] ?? '').trim()}`),
    );
    const novas = recalculo.animais
      .filter((a) => !jaTem.has(`${a.id}|${dataTexto}`))
      .map((a) => {
        const reb = dadosRebanhoPorId.get(a.id) ?? [];
        return [
          gerarId(),
          '',
          a.id,
          (reb[idxReb['ID eletrônica']] ?? '').trim(),
          numeroPlanilha(a.pesoEntradaKg),
          dataTexto,
          (reb[idxReb['Fazenda']] ?? '').trim(),
          'Início de GMD pelo dashboard',
          (reb[idxReb['lote']] ?? '').trim(),
          '',
        ];
      });
    for (const linha of novas) {
      if (await adicionarLinha(sid, ABA_ENGORDA, linha, 'USER_ENTERED')) linhasEngordaCriadas++;
    }
  }

  return {
    ok: true,
    animaisAtualizados: recalculo.animais.length,
    pesagensAtualizadas: recalculo.totalPesagens,
    linhasEngordaCriadas,
    semPesagemNoPeriodo: recalculo.semPesagemNoPeriodo,
  };
}
