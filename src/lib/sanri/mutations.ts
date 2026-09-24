import 'server-only';
import { adicionarLinha, escreverCelulas, lerAba, limparLinha, type CelulasParaEscrever } from '@/lib/sheets/server';
import { formatDia } from '@/lib/painel/format';
import { ABA_PRODUCAO, spreadsheetId } from './config';
import { getTabelaRegua } from './queries';
import { DESTINOS, destinoPorChave, litrosDaRegua, mapProducao, normalizarRegua, type ChaveDestino, type DiaCompacto } from './producao';

/**
 * Escrita em producao_diaria. Uma linha por lançamento: a régua (entrada) e
 * cada saída viram linhas separadas. Tudo é escrito pelo NOME do header, não
 * pela letra da coluna — a aba é do AppSheet e pode ganhar/perder colunas.
 * Data sempre em USER_ENTERED (RAW grava a data como texto — incidente do
 * Katmandu, 09/09/2026).
 */
const COLUNA_USUARIO = 'lancado_por';
const CAMPOS_LEITURA = ['data', 'tanque', 'regua', 'regua_litros', 'extra', 'tanque_extra', 'regua_extra', 'regua_extra_litros', 'total_animais', 'obs'];

export type Resultado = { ok: true; id?: string } | { ok: false; status: number; erro: string };

function falha(status: number, erro: string): { ok: false; status: number; erro: string } {
  return { ok: false, status, erro };
}

function gerarId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** 0 -> "A", 25 -> "Z", 26 -> "AA". */
function letraDaColuna(indice: number): string {
  let letras = '';
  let n = indice;
  while (n >= 0) {
    letras = String.fromCharCode(65 + (n % 26)) + letras;
    n = Math.floor(n / 26) - 1;
  }
  return letras;
}

/** Vírgula decimal, sem milhar — a planilha é pt-BR e lê isso como número no USER_ENTERED. */
function numeroPlanilha(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 2, useGrouping: false });
}

/** Apóstrofo força texto: sem ele "24.7" numa planilha pt-BR pode virar data (24/07). */
function textoPlanilha(s: string): string {
  return `'${s}`;
}

interface Aba {
  sid: string;
  linhas: string[][];
  header: string[];
}

async function lerProducao(): Promise<Aba | null> {
  const sid = spreadsheetId();
  if (!sid) return null;
  const linhas = await lerAba(sid, ABA_PRODUCAO);
  if (!linhas || linhas.length === 0) return null;
  return { sid, linhas, header: linhas[0].map((h) => h.trim()) };
}

/** Garante a coluna "lancado_por" no fim do header (a aba original do AppSheet não tem). */
async function garantirColunaUsuario(aba: Aba): Promise<void> {
  if (aba.header.includes(COLUNA_USUARIO)) return;
  const i = aba.header.length;
  const { ok } = await escreverCelulas(aba.sid, [{ range: `'${ABA_PRODUCAO}'!${letraDaColuna(i)}1`, valores: [[COLUNA_USUARIO]] }], 'RAW');
  if (ok) aba.header.push(COLUNA_USUARIO);
}

function linhaDoId(aba: Aba, id: string): number | null {
  const col = aba.header.indexOf('id');
  if (col < 0) return null;
  const i = aba.linhas.findIndex((l, n) => n > 0 && (l[col] ?? '').trim() === id);
  return i < 0 ? null : i + 1;
}

function celulas(aba: Aba, linha: number, valores: Record<string, string>): CelulasParaEscrever[] | null {
  const out: CelulasParaEscrever[] = [];
  for (const [campo, valor] of Object.entries(valores)) {
    const col = aba.header.indexOf(campo);
    if (col < 0) {
      if (campo === COLUNA_USUARIO) continue;
      return null;
    }
    out.push({ range: `'${ABA_PRODUCAO}'!${letraDaColuna(col)}${linha}`, valores: [[valor]] });
  }
  return out;
}

async function acrescentar(aba: Aba, valores: Record<string, string>): Promise<boolean> {
  const faltando = Object.keys(valores).filter((c) => c !== COLUNA_USUARIO && !aba.header.includes(c));
  if (faltando.length > 0) {
    console.error('[sanri] colunas ausentes em producao_diaria', faltando);
    return false;
  }
  return adicionarLinha(aba.sid, ABA_PRODUCAO, aba.header.map((h) => valores[h] ?? ''), 'USER_ENTERED');
}

async function limparLinhaInteira(aba: Aba, linha: number): Promise<boolean> {
  return limparLinha(aba.sid, `'${ABA_PRODUCAO}'!A${linha}:${letraDaColuna(aba.header.length - 1)}${linha}`);
}

// ---------------------------------------------------------------- régua

export interface DadosLeitura {
  data: DiaCompacto;
  tanque: string;
  regua: string;
  tanqueExtra: string | null;
  reguaExtra: string | null;
  totalAnimais: number;
  obs: string;
}

type Valores = { ok: true; valores: Record<string, string> } | { ok: false; status: number; erro: string };

async function valoresLeitura(d: DadosLeitura): Promise<Valores> {
  const tabela = await getTabelaRegua();
  if (!tabela) return falha(502, 'não foi possível ler a tabela tanque_regua');

  const regua = normalizarRegua(d.regua);
  const litros = regua == null ? null : litrosDaRegua(tabela, d.tanque, regua);
  if (regua == null || litros == null) return falha(400, `régua ${d.regua} não existe na tabela do ${d.tanque}`);

  let extra = { extra: '', tanque_extra: '', regua_extra: '', regua_extra_litros: '' };
  if (d.tanqueExtra) {
    const reguaExtra = normalizarRegua(d.reguaExtra);
    const litrosExtra = reguaExtra == null ? null : litrosDaRegua(tabela, d.tanqueExtra, reguaExtra);
    if (reguaExtra == null || litrosExtra == null) return falha(400, `régua ${d.reguaExtra ?? ''} não existe na tabela do ${d.tanqueExtra}`);
    extra = { extra: 'sim', tanque_extra: d.tanqueExtra, regua_extra: textoPlanilha(reguaExtra), regua_extra_litros: numeroPlanilha(litrosExtra) };
  }

  return {
    ok: true,
    valores: {
      data: formatDia(d.data),
      tanque: d.tanque,
      regua: textoPlanilha(regua),
      regua_litros: numeroPlanilha(litros),
      ...extra,
      total_animais: String(d.totalAnimais),
      obs: d.obs,
    },
  };
}

function leituraNoDia(aba: Aba, data: DiaCompacto, excetoId?: string): boolean {
  return mapProducao(aba.linhas).leituras.some((l) => l.data === data && l.id !== excetoId);
}

export async function criarLeitura(d: DadosLeitura, email: string): Promise<Resultado> {
  const aba = await lerProducao();
  if (!aba) return falha(502, 'não foi possível ler producao_diaria');
  if (leituraNoDia(aba, d.data)) return falha(409, `já existe régua lançada em ${formatDia(d.data)} — edite a existente`);

  const v = await valoresLeitura(d);
  if (!v.ok) return v;

  await garantirColunaUsuario(aba);
  const id = gerarId();
  const ok = await acrescentar(aba, { id, ...v.valores, [COLUNA_USUARIO]: email });
  return ok ? { ok: true, id } : falha(502, 'falha ao gravar na planilha');
}

export async function atualizarLeitura(id: string, d: DadosLeitura, email: string): Promise<Resultado> {
  const aba = await lerProducao();
  if (!aba) return falha(502, 'não foi possível ler producao_diaria');
  const linha = linhaDoId(aba, id);
  if (linha == null) return falha(404, 'lançamento não encontrado');
  if (leituraNoDia(aba, d.data, id)) return falha(409, `já existe régua lançada em ${formatDia(d.data)}`);

  const v = await valoresLeitura(d);
  if (!v.ok) return v;

  await garantirColunaUsuario(aba);
  const cels = celulas(aba, linha, { ...v.valores, [COLUNA_USUARIO]: email });
  if (!cels) return falha(500, 'colunas ausentes em producao_diaria');
  const { ok } = await escreverCelulas(aba.sid, cels, 'USER_ENTERED');
  return ok ? { ok: true, id } : falha(502, 'falha ao gravar na planilha');
}

/** Linha só de régua é limpa inteira; linha antiga do AppSheet com saídas junto perde só os campos da régua. */
export async function excluirLeitura(id: string): Promise<Resultado> {
  const aba = await lerProducao();
  if (!aba) return falha(502, 'não foi possível ler producao_diaria');
  const linha = linhaDoId(aba, id);
  if (linha == null) return falha(404, 'lançamento não encontrado');

  const temSaidas = mapProducao([aba.linhas[0], aba.linhas[linha - 1]]).saidas.length > 0;
  if (!temSaidas) return (await limparLinhaInteira(aba, linha)) ? { ok: true } : falha(502, 'falha ao apagar na planilha');

  const vazios = Object.fromEntries(CAMPOS_LEITURA.filter((c) => c !== 'data').map((c) => [c, '']));
  const cels = celulas(aba, linha, vazios);
  if (!cels) return falha(500, 'colunas ausentes em producao_diaria');
  const { ok } = await escreverCelulas(aba.sid, cels, 'USER_ENTERED');
  return ok ? { ok: true } : falha(502, 'falha ao apagar na planilha');
}

// ---------------------------------------------------------------- saídas

export interface DadosSaida {
  data: DiaCompacto;
  destino: ChaveDestino;
  litros: number;
  obs: string;
}

export async function criarSaida(d: DadosSaida, email: string): Promise<Resultado> {
  const destino = destinoPorChave(d.destino);
  if (!destino) return falha(400, 'destino inválido');
  const aba = await lerProducao();
  if (!aba) return falha(502, 'não foi possível ler producao_diaria');

  await garantirColunaUsuario(aba);
  const id = gerarId();
  const litros = numeroPlanilha(d.litros);
  const ok = await acrescentar(aba, {
    id,
    data: formatDia(d.data),
    destino: destino.nome,
    destino_litros: litros,
    [destino.coluna]: litros,
    obs: d.obs,
    [COLUNA_USUARIO]: email,
  });
  return ok ? { ok: true, id } : falha(502, 'falha ao gravar na planilha');
}

/** Limpa a coluna do destino; se a linha ficar sem régua e sem outra saída, limpa a linha inteira. */
export async function excluirSaida(id: string, chave: ChaveDestino): Promise<Resultado> {
  const destino = destinoPorChave(chave);
  if (!destino) return falha(400, 'destino inválido');
  const aba = await lerProducao();
  if (!aba) return falha(502, 'não foi possível ler producao_diaria');
  const linha = linhaDoId(aba, id);
  if (linha == null) return falha(404, 'lançamento não encontrado');

  const { leituras, saidas } = mapProducao([aba.linhas[0], aba.linhas[linha - 1]]);
  if (!saidas.some((s) => s.destino === chave)) return falha(404, 'saída não encontrada');
  const restantes = saidas.filter((s) => s.destino !== chave);

  if (leituras.length === 0 && restantes.length === 0) {
    return (await limparLinhaInteira(aba, linha)) ? { ok: true } : falha(502, 'falha ao apagar na planilha');
  }

  const valores: Record<string, string> = { [destino.coluna]: '' };
  if (aba.header.includes('destino')) {
    valores.destino = restantes.map((s) => DESTINOS.find((x) => x.chave === s.destino)!.nome).join(' , ');
  }
  const cels = celulas(aba, linha, valores);
  if (!cels) return falha(500, 'colunas ausentes em producao_diaria');
  const { ok } = await escreverCelulas(aba.sid, cels, 'USER_ENTERED');
  return ok ? { ok: true } : falha(502, 'falha ao apagar na planilha');
}
