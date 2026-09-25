import 'server-only';
import { adicionarLinha, lerAba } from '@/lib/sheets/server';
import { formatDia, hojeCompacto } from '@/lib/painel/format';
import { ABA_CONFERENCIA, ABA_REBANHO, spreadsheetId } from './config';
import { COLUNAS_CONFERENCIA, animaisDaBaia, apurar } from './conferencia';
import { getBaias } from './queries';
import { mapAnimais } from './monta';
import { falha, garantirAbaDoPainel, gerarId, type Resultado } from './mutations';

/**
 * Escrita em conferencia_baia — a ÚNICA escrita da Conferência: uma linha por
 * conferência, só acrescenta (nunca edita nem apaga). O que era "esperado" é
 * recalculado aqui, com o RebanhoProd lido agora; a planilha do AppSheet não
 * é tocada.
 */
export interface PedidoConferencia {
  baia: string;
  contados: number;
  /** Números dos animais marcados "vi aqui". */
  vistos: string[];
  /** Números dos animais que estão na baia mas a planilha põe em outra. */
  aMais: string[];
  obs: string;
}

export async function salvarConferencia(p: PedidoConferencia, email: string): Promise<Resultado & { esperados?: number; diferenca?: number }> {
  const sid = spreadsheetId();
  if (!sid) return falha(503, 'planilha não configurada');
  const aba = await garantirAbaDoPainel(sid, ABA_CONFERENCIA, COLUNAS_CONFERENCIA);
  if (!aba) return falha(502, 'não foi possível preparar a aba conferencia_baia');

  const rebanho = await lerAba(sid, ABA_REBANHO);
  if (!rebanho) return falha(502, 'não foi possível ler o rebanho na planilha');
  const animais = mapAnimais(rebanho);
  // Baia da aba Baias, ou que tem animal vivo na planilha (a tela oferece as duas).
  if (animaisDaBaia(animais, p.baia).length === 0 && !(await getBaias())?.some((b) => b.nome === p.baia)) return falha(400, 'baia inválida');
  const r = apurar(animais, p.baia, p.contados, p.vistos, p.aMais);
  if ('erro' in r) return falha(400, r.erro);

  const id = gerarId();
  const valores: Record<string, string> = {
    id,
    data: formatDia(hojeCompacto()),
    baia: p.baia,
    contados: String(r.contados),
    esperados: String(r.esperados),
    diferenca: String(r.diferenca),
    vistos: r.vistos.join(';'),
    nao_vistos: r.naoVistos.join(';'),
    a_mais: r.aMais.join(';'),
    obs: p.obs,
    lancado_por: email,
  };
  const ok = await adicionarLinha(sid, ABA_CONFERENCIA, aba.header.map((h) => valores[h] ?? ''), 'USER_ENTERED');
  return ok ? { ok: true, id, esperados: r.esperados, diferenca: r.diferenca } : falha(502, 'falha ao gravar na planilha');
}
