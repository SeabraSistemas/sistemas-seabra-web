import 'server-only';
import { adicionarLinha, criarAba, escreverCelulas, garantirColunasNaGrade, lerAba, listarAbas } from '@/lib/sheets/server';
import { formatDia, hojeCompacto } from '@/lib/painel/format';
import { ABA_DIETA, spreadsheetId } from './config';
import { ALIMENTOS, COLUNAS_DIETA, TURNOS, colunaDe, type Quantidades } from './dieta';
import { falha, gerarId, letraDaColuna, numeroPlanilha, type Resultado } from './mutations';

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

/** Header atual da aba, criando a aba e/ou as colunas que faltarem. null se não der. */
async function garantirAba(sid: string): Promise<string[] | null> {
  let linhas = await lerAba(sid, ABA_DIETA);
  if (linhas == null) {
    const abas = await listarAbas(sid);
    if (abas == null || abas.includes(ABA_DIETA)) return null; // erro de leitura, não aba ausente
    if (!(await criarAba(sid, ABA_DIETA))) return null;
    linhas = [];
  }

  const header = (linhas[0] ?? []).map((h) => h.trim());
  const faltando = COLUNAS_DIETA.filter((c) => !header.includes(c));
  if (faltando.length === 0) return header;

  // Colunas novas entram no fim — quem mexeu na aba à mão não perde a ordem dela.
  const inicio = header.length;
  if (!(await garantirColunasNaGrade(sid, ABA_DIETA, inicio + faltando.length))) return null;
  const { ok } = await escreverCelulas(
    sid,
    [{ range: `'${ABA_DIETA}'!${letraDaColuna(inicio)}1:${letraDaColuna(inicio + faltando.length - 1)}1`, valores: [faltando] }],
    'RAW',
  );
  return ok ? [...header, ...faltando] : null;
}

export async function salvarDieta(d: DadosDieta, email: string): Promise<Resultado> {
  const sid = spreadsheetId();
  if (!sid) return falha(503, 'planilha não configurada');
  const header = await garantirAba(sid);
  if (!header) return falha(502, 'não foi possível preparar a aba dieta_baia');

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
