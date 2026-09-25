import 'server-only';
import { lerAba, listarAbas } from '@/lib/sheets/server';
import { criarCache } from '@/lib/sheets/cache';
import {
  ABA_BAIAS,
  ABA_BAIA_CATEGORIA,
  ABA_DIAGNOSTICO,
  ABA_DIETA,
  ABA_ESTACOES,
  ABA_IA,
  ABA_PARTOS,
  ABA_PRODUCAO,
  ABA_REBANHO,
  ABA_REPRODUCAO,
  ABA_TANQUE_REGUA,
  ABA_USUARIOS,
  spreadsheetId,
} from './config';
import { mapBaias, mapDieta, type Baia, type DietaBaia } from './dieta';
import { hojeCompacto, somarDias } from '@/lib/painel/format';
import {
  criarIndice,
  mapAnimais,
  mapCoberturas,
  mapCrias,
  mapDiagnosticos,
  mapEstacoes,
  mapIA,
  type Animal,
  type DadosReproducao,
  type Estacao,
} from './monta';
import { mapProducao, mapTabelaRegua, mapUsuarios, type Leitura, type Saida, type TabelaRegua, type Usuario } from './producao';

const TTL_MS = 5 * 60 * 1000;
const cache = criarCache<string[][]>(TTL_MS);

/**
 * Só abas que o site NÃO escreve passam pelo cache (User Manager,
 * tanque_regua, Baias, Baia_categoria e as abas de reprodução do app).
 * producao_diaria, dieta_baia e estacao_monta são lidas sempre frescas: `invalidarCache()`
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

/** Só o último ano e pouco interessa: estação é formada com cobertura recente, e o parto cai até ~165 dias depois. */
const JANELA_REPRODUCAO_DIAS = 400;

export interface LeituraReproducao {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  /** Só os animais citados nos eventos da janela e nas estações, mais os reprodutores. */
  animais: Animal[];
  dados: DadosReproducao;
  estacoes: Estacao[];
}

/** Aba que o painel cria no 1º salvamento: ausente = lista vazia, não erro. */
async function lerAbaDoPainel(id: string, aba: string): Promise<string[][] | null> {
  const linhas = await lerAba(id, aba);
  if (linhas != null) return linhas;
  const abas = await listarAbas(id);
  return abas != null && !abas.includes(aba) ? [] : null;
}

/**
 * Tudo que a Reprodução precisa. As abas do app passam pelo cache de 5 min
 * (o painel não escreve nelas; "Atualizar" relê); estacao_monta vem fresca.
 */
export async function getReproducao(): Promise<LeituraReproducao> {
  const vazio = { animais: [], dados: { coberturas: [], diagnosticos: [], crias: [], ia: [] }, estacoes: [] };
  const id = spreadsheetId();
  if (!id) return { configurado: false, ok: false, carregadoEm: null, ...vazio };

  const [rebanho, reproducao, dg, partos, ia, estacoes] = await Promise.all([
    lerAbaCache(ABA_REBANHO),
    lerAbaCache(ABA_REPRODUCAO),
    lerAbaCache(ABA_DIAGNOSTICO),
    lerAbaCache(ABA_PARTOS),
    lerAbaCache(ABA_IA),
    lerAbaDoPainel(id, ABA_ESTACOES),
  ]);
  const ok = [rebanho, reproducao, dg, partos, ia].every((l) => l.linhas != null) && estacoes != null;
  const carregadoEm = Math.min(...[rebanho, reproducao, dg, partos, ia].map((l) => l.carregadoEm ?? Date.now()));

  const todos = mapAnimais(rebanho.linhas);
  const indice = criarIndice(todos);
  const corte = somarDias(hojeCompacto(), -JANELA_REPRODUCAO_DIAS)!;
  const dados: DadosReproducao = {
    coberturas: mapCoberturas(reproducao.linhas, indice).filter((c) => c.data >= corte),
    diagnosticos: mapDiagnosticos(dg.linhas, indice).filter((d) => d.data >= corte),
    crias: mapCrias(partos.linhas, indice).filter((c) => c.nascimento >= corte),
    ia: mapIA(ia.linhas, indice).filter((s) => s.data >= corte),
  };
  const lista = mapEstacoes(estacoes);

  const citados = new Set<string>();
  for (const c of dados.coberturas) citados.add(c.femea).add(c.reprodutor);
  for (const e of lista) [e.reprodutor, ...e.femeas].forEach((k) => citados.add(k));
  const animais = todos.filter((a) => citados.has(a.chave) || (a.categoria === 'Reprodutor' && a.vivo));

  return { configurado: true, ok, carregadoEm, animais, dados, estacoes: lista };
}

