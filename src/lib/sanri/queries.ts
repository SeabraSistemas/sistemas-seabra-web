import 'server-only';
import { lerAba, listarAbas } from '@/lib/sheets/server';
import { criarCache } from '@/lib/sheets/cache';
import { ABA_BAIAS, ABA_BAIA_CATEGORIA, ABA_DIETA, ABA_PRODUCAO, ABA_TANQUE_REGUA, ABA_USUARIOS, spreadsheetId } from './config';
import { mapBaias, mapDieta, type Baia, type DietaBaia } from './dieta';
import { mapProducao, mapTabelaRegua, mapUsuarios, type Leitura, type Saida, type TabelaRegua, type Usuario } from './producao';

const TTL_MS = 5 * 60 * 1000;
const cache = criarCache<string[][]>(TTL_MS);

/**
 * Só abas que o site NÃO escreve passam pelo cache (User Manager,
 * tanque_regua, Baias, Baia_categoria). producao_diaria e dieta_baia são
 * lidas sempre frescas: `invalidarCache()`
 * chamado numa rota de API não limpa o cache que o render da página vê
 * (módulos separados por rota no Next).
 */
async function lerAbaCache(aba: string): Promise<{ linhas: string[][] | null; stale: boolean; carregadoEm: number | null }> {
  const id = spreadsheetId();
  if (!id) return { linhas: null, stale: false, carregadoEm: null };
  try {
    const { valor, stale, carregadoEm } = await cache.obter(`sanri:${aba}`, async () => {
      const linhas = await lerAba(id, aba);
      // Lança pra não guardar "falhou" no cache por 5 min — o cache tenta de novo e, se houver, devolve o último bom.
      if (linhas == null) throw new Error(`leitura de "${aba}" falhou`);
      return linhas;
    });
    return { linhas: valor, stale, carregadoEm };
  } catch {
    return { linhas: null, stale: false, carregadoEm: null };
  }
}

export function invalidarCache(): void {
  cache.invalidar('sanri:');
}

/** Usuários da User Manager. null se a planilha não puder ser lida (≠ lista vazia). */
export async function getUsuarios(fresco = false): Promise<Usuario[] | null> {
  const id = spreadsheetId();
  if (!id) return null;
  const linhas = fresco ? await lerAba(id, ABA_USUARIOS) : (await lerAbaCache(ABA_USUARIOS)).linhas;
  return linhas == null ? null : mapUsuarios(linhas);
}

export async function getTabelaRegua(): Promise<TabelaRegua | null> {
  const { linhas } = await lerAbaCache(ABA_TANQUE_REGUA);
  return linhas == null ? null : mapTabelaRegua(linhas);
}

export interface LeituraProducao {
  configurado: boolean;
  /** false se a leitura da planilha falhou. */
  ok: boolean;
  carregadoEm: number | null;
  leituras: Leitura[];
  saidas: Saida[];
}

export async function getProducao(): Promise<LeituraProducao> {
  const id = spreadsheetId();
  if (!id) return { configurado: false, ok: false, carregadoEm: null, leituras: [], saidas: [] };
  const linhas = await lerAba(id, ABA_PRODUCAO);
  const { leituras, saidas } = mapProducao(linhas);
  return { configurado: true, ok: linhas != null, carregadoEm: Date.now(), leituras, saidas };
}

/** Baias do curral (abas Baias + Baia_categoria, do AppSheet). null se a leitura falhar. */
export async function getBaias(): Promise<Baia[] | null> {
  const [baias, categorias] = await Promise.all([lerAbaCache(ABA_BAIAS), lerAbaCache(ABA_BAIA_CATEGORIA)]);
  if (baias.linhas == null) return null;
  return mapBaias(baias.linhas, categorias.linhas);
}

export interface LeituraDieta {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  /** Todas as alterações, na ordem da planilha. */
  historico: DietaBaia[];
}

/**
 * dieta_baia só existe depois do 1º salvamento. Se a leitura falha, confere
 * se é porque a aba ainda não foi criada (normal, lista vazia) ou erro de
 * verdade — a API do Sheets responde igual aos dois casos.
 */
export async function getDieta(): Promise<LeituraDieta> {
  const id = spreadsheetId();
  if (!id) return { configurado: false, ok: false, carregadoEm: null, historico: [] };
  const linhas = await lerAba(id, ABA_DIETA);
  if (linhas != null) return { configurado: true, ok: true, carregadoEm: Date.now(), historico: mapDieta(linhas) };
  const abas = await listarAbas(id);
  const aindaNaoExiste = abas != null && !abas.includes(ABA_DIETA);
  return { configurado: true, ok: aindaNaoExiste, carregadoEm: Date.now(), historico: [] };
}
