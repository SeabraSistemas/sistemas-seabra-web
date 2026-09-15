import 'server-only';
import { adicionarLinha, encontrarLinhaPorId, escreverLinha, limparLinha } from '@/lib/sheets/server';
import { formatDia, formatMoeda } from '@/lib/painel/format';
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
  fazenda: string | null;
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
