import 'server-only';
import { adicionarLinha } from '@/lib/sheets/server';
import { formatDia, hojeCompacto } from '@/lib/painel/format';
import { ABA_DIETA, spreadsheetId } from './config';
import { ALIMENTOS, COLUNAS_DIETA, TURNOS, colunaDe, type Quantidades } from './dieta';
import { falha, garantirAbaDoPainel, gerarId, numeroPlanilha, type Resultado } from './mutations';

/**
 * Escrita em dieta_baia — só ACRESCENTA linha (cada alteração de dieta é uma
 * linha nova; a atual é a última da baia). Nunca edita nem apaga, então não
 * há como duas pessoas salvando juntas sobrescreverem uma à outra.
 */
export interface DadosDieta {
  baia: string;
  categoria: string;
  cabras: number;
  quantidades: Quantidades;
  obs: string;
}

export async function salvarDieta(d: DadosDieta, email: string): Promise<Resultado> {
  const sid = spreadsheetId();
  if (!sid) return falha(503, 'planilha não configurada');
  const aba = await garantirAbaDoPainel(sid, ABA_DIETA, COLUNAS_DIETA);
  if (!aba) return falha(502, 'não foi possível preparar a aba dieta_baia');
  const { header } = aba;

  const id = gerarId();
  const valores: Record<string, string> = {
    id,
    data: formatDia(hojeCompacto()),
    baia: d.baia,
    categoria: d.categoria,
    cabras: String(d.cabras),
    obs: d.obs,
    lancado_por: email,
  };
  for (const t of TURNOS) {
    for (const a of ALIMENTOS) {
      const v = d.quantidades[a.chave][t.chave];
      valores[colunaDe(a, t.chave)] = v == null ? '' : numeroPlanilha(v);
    }
  }

  const ok = await adicionarLinha(sid, ABA_DIETA, header.map((h) => valores[h] ?? ''), 'USER_ENTERED');
  return ok ? { ok: true, id } : falha(502, 'falha ao gravar na planilha');
}
