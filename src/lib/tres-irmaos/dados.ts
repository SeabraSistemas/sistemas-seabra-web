import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ProducaoDoApp, SaidaDoApp } from '@/lib/tres-irmaos/acompanhamento';
import { PROPRIEDADE_ID } from '@/lib/tres-irmaos/config';
import { diasEntre, somarDias } from '@/lib/tres-irmaos/datas';
import { CHAVES_GRUPO, type ChaveGrupo, type DietaCadastrada, type InsumoApp, type ItemFormulacao } from '@/lib/tres-irmaos/insumos';
import {
  normalizarParametros,
  parametrosIniciais,
  type DadosDoApp,
  type Parametros,
  type Previsao,
} from '@/lib/tres-irmaos/projecao';

/**
 * Leitura e escrita do /3irmaos no banco do app, com a chave de serviço —
 * a mesma SUPABASE_SERVICE_ROLE_KEY do /adm, sem NEXT_PUBLIC_ (ver o porquê
 * em src/lib/adm/supabase-admin.ts). Ela ignora a RLS, então a trava é este
 * módulo: TODA query filtra por PROPRIEDADE_ID, fixo no código, e nenhuma
 * recebe propriedade de fora. As tabelas leite_* têm RLS ligada e nenhuma
 * policy — só este caminho as alcança. Do app, só LÊ (rebanho, Produção
 * Diária, Saída de Leite); a única escrita é a dos parâmetros da projeção.
 *
 * Nunca lança: sem env ou com erro, devolve { ok: false } e a página mostra
 * o motivo em vez de um 500.
 */

let cliente: SupabaseClient | null = null;

function supa(): SupabaseClient | null {
  if (cliente) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  cliente = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-client-info': 'sistemaseabra-web/3irmaos' } },
  });
  return cliente;
}

export type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

const SEM_CONFIG = 'Falta configurar no servidor: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.';
const PAGINA = 1000; // teto do PostgREST — paginar sempre (regra dura do app)

async function paginado<T>(consulta: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const todos: T[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await consulta(de, de + PAGINA - 1);
    if (error) throw new Error(error.message);
    todos.push(...(data ?? []));
    if (!data || data.length < PAGINA) return todos;
  }
}

export interface Categoria {
  nome: string;
  quantidade: number;
}

/** Resumo dos dias mais recentes da Produção Diária (a média do tanque). */
export interface ProducaoRecente {
  dias: number;
  de: string;
  ate: string;
  litrosDia: number;
  lactantesDia: number;
  /** Litros ÷ lactantes, somados nos dias (dia com mais cabras pesa mais). */
  media: number;
}

export interface RebanhoDoApp extends DadosDoApp {
  categorias: Categoria[];
  /** Média do último controle leiteiro (só as cabras medidas nele). */
  mediaUltimoControle: number | null;
  producaoRecente: ProducaoRecente | null;
  /** De onde veio `mediaInicial`. */
  fonteMedia: 'producao_diaria' | 'controle' | null;
  /** Lactantes com mais de 305 dias do último parto — candidatas a secar logo. */
  lactantesAcimaDe305: number;
  /** Quantas lactantes têm produção no último controle (a média vem só delas). */
  lactantesMedidas: number;
  dataUltimoControle: string | null;
  partosPrevistos: Previsao[];
}

interface LinhaRebanho {
  categoria: string | null;
  data_ultimo_parto: string | null;
  ultima_producao: number | null;
  data_ultimo_controle: string | null;
  parto_estimado: string | null;
  gestacao_ativa: boolean | null;
}

export async function lerRebanho(hoje: string): Promise<Resultado<RebanhoDoApp>> {
  const s = supa();
  if (!s) return { ok: false, erro: SEM_CONFIG };
  try {
    const { data: cats, error: erroCats } = await s.from('categoria_animal').select('id, nome');
    if (erroCats) throw new Error(erroCats.message);
    const nomes = new Map((cats ?? []).map((c: { id: string; nome: string }) => [c.id, c.nome]));

    const linhas = await paginado<LinhaRebanho>((de, ate) =>
      s
        .from('rebanho')
        .select('categoria, data_ultimo_parto, ultima_producao, data_ultimo_controle, parto_estimado, gestacao_ativa')
        .eq('propriedade_id', PROPRIEDADE_ID)
        .eq('status', 'ativo')
        .order('id')
        .range(de, ate),
    );

    const contagem = new Map<string, number>();
    const lactantes: LinhaRebanho[] = [];
    const partos = new Map<string, number>();
    for (const l of linhas) {
      const nome = (l.categoria && nomes.get(l.categoria)) || 'sem categoria';
      contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
      if (nome === 'lactante') lactantes.push(l);
      if (l.gestacao_ativa && l.parto_estimado && l.parto_estimado >= hoje) {
        partos.set(l.parto_estimado, (partos.get(l.parto_estimado) ?? 0) + 1);
      }
    }

    // A média do app é a do ÚLTIMO controle: quem foi medida nele. Produção de
    // controles antigos puxaria a média para uma lactação que já passou.
    const ultimoControle = lactantes.reduce<string | null>((max, l) => (l.data_ultimo_controle && (!max || l.data_ultimo_controle > max) ? l.data_ultimo_controle : max), null);
    const medidas = lactantes.filter((l) => l.data_ultimo_controle === ultimoControle && Number(l.ultima_producao) > 0);
    const media = medidas.length ? medidas.reduce((t, l) => t + Number(l.ultima_producao), 0) / medidas.length : null;

    // A média inicial preferida é a do TANQUE (Produção Diária): é o leite que
    // de fato vai para o comprador. O controle leiteiro mede cabra a cabra, de
    // tempos em tempos, e às vezes só parte delas (em 12/09, 39 de 67).
    // Janela: a semana que termina no ÚLTIMO dia lançado (até 30 dias atrás).
    // Contar a partir de hoje misturaria dias antigos quando o produtor pula
    // lançamentos — em 28/09 o Lucas tinha 28/09 (67 cabras) e depois só
    // 29–31/08 (44 cabras), e a média saía de dois rebanhos diferentes.
    // Só dias com as DUAS ordenhas: um dia só com a manhã lançada puxaria a média para baixo.
    const producoes = (await lerProducoesDiarias(somarDias(hoje, -30)))
      .filter((p) => p.lactantes && p.lactantes > 0 && p.data <= hoje && p.litros1 != null && p.litros2 != null)
      .map((p) => ({ data: p.data, lactantes: p.lactantes!, litros: p.litros1! + p.litros2! }));
    const ultimoDia = producoes.at(-1)?.data;
    const recentes = ultimoDia ? producoes.filter((p) => p.data > somarDias(ultimoDia, -7)) : [];
    const producaoRecente: ProducaoRecente | null = recentes.length
      ? {
          dias: recentes.length,
          de: recentes[0].data,
          ate: recentes[recentes.length - 1].data,
          litrosDia: recentes.reduce((t, p) => t + p.litros, 0) / recentes.length,
          lactantesDia: recentes.reduce((t, p) => t + p.lactantes, 0) / recentes.length,
          media: recentes.reduce((t, p) => t + p.litros, 0) / recentes.reduce((t, p) => t + p.lactantes, 0),
        }
      : null;

    return {
      ok: true,
      dados: {
        lactantes: lactantes.length,
        mediaInicial: producaoRecente?.media ?? media,
        fonteMedia: producaoRecente ? 'producao_diaria' : media != null ? 'controle' : null,
        producaoRecente,
        efetivo: Object.fromEntries(contagem),
        mediaUltimoControle: media,
        lactantesMedidas: medidas.length,
        dataUltimoControle: ultimoControle,
        lactantesAcimaDe305: lactantes.filter((l) => l.data_ultimo_parto && diasEntre(l.data_ultimo_parto, hoje) > 305).length,
        categorias: [...contagem.entries()].map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade),
        partosPrevistos: [...partos.entries()].map(([data, quantidade]) => ({ data, quantidade })).sort((a, b) => (a.data < b.data ? -1 : 1)),
      },
    };
  } catch (e) {
    console.error('[3irmaos] lerRebanho', e);
    return { ok: false, erro: 'Não foi possível ler o rebanho do app agora.' };
  }
}

export interface ParametrosSalvos {
  parametros: Parametros;
  salvo: boolean;
  atualizadoEm: string | null;
  atualizadoPor: string | null;
}

export async function lerParametros(app: DadosDoApp): Promise<Resultado<ParametrosSalvos>> {
  const s = supa();
  if (!s) return { ok: false, erro: SEM_CONFIG };
  const iniciais = parametrosIniciais(app);
  const { data, error } = await s
    .from('leite_projecao_config')
    .select('parametros, updated_at, atualizado_por')
    .eq('propriedade_id', PROPRIEDADE_ID)
    .maybeSingle();
  if (error) {
    console.error('[3irmaos] lerParametros', error);
    return { ok: false, erro: 'Não foi possível ler os parâmetros salvos.' };
  }
  if (!data) return { ok: true, dados: { parametros: iniciais, salvo: false, atualizadoEm: null, atualizadoPor: null } };
  return {
    ok: true,
    dados: {
      parametros: normalizarParametros(data.parametros, iniciais),
      salvo: true,
      atualizadoEm: data.updated_at,
      atualizadoPor: data.atualizado_por,
    },
  };
}

export async function salvarParametros(parametros: Parametros, email: string): Promise<Resultado<{ atualizadoEm: string }>> {
  const s = supa();
  if (!s) return { ok: false, erro: SEM_CONFIG };
  const agora = new Date().toISOString();
  const { error } = await s
    .from('leite_projecao_config')
    .upsert({ propriedade_id: PROPRIEDADE_ID, parametros, updated_at: agora, atualizado_por: email }, { onConflict: 'propriedade_id' });
  if (error) {
    console.error('[3irmaos] salvarParametros', error);
    return { ok: false, erro: 'Não foi possível salvar.' };
  }
  return { ok: true, dados: { atualizadoEm: agora } };
}

interface LinhaProducao {
  data_producao: string;
  total_lactantes: number | null;
  litros_1_ordenha: number | null;
  litros_2_ordenha: number | null;
}

/**
 * Produção Diária do app, do dia `desde` em diante (null = tudo), com as
 * duas ordenhas separadas — o acompanhamento precisa saber a manhã e a
 * tarde, porque os compradores recolhem depois da 1ª ordenha. Ordenha não
 * lançada vem null (dia com modo 'ordenha_1' só tem a manhã). Só o
 * segmento leiteiro caprino.
 */
async function lerProducoesDiarias(desde: string | null): Promise<ProducaoDoApp[]> {
  const s = supa();
  if (!s) return [];
  const linhas = await paginado<LinhaProducao>((de, ate) => {
    let q = s
      .from('producao_diaria')
      .select('data_producao, total_lactantes, litros_1_ordenha, litros_2_ordenha')
      .eq('propriedade_id', PROPRIEDADE_ID)
      .or('segmento.is.null,segmento.eq.caprino_leiteiro');
    if (desde) q = q.gte('data_producao', desde);
    return q.order('data_producao').order('id').range(de, ate);
  });
  return linhas.map((l) => ({
    data: l.data_producao,
    lactantes: l.total_lactantes,
    litros1: l.litros_1_ordenha == null ? null : Number(l.litros_1_ordenha),
    litros2: l.litros_2_ordenha == null ? null : Number(l.litros_2_ordenha),
  }));
}

interface LinhaSaida {
  data_saida: string;
  litros: number | null;
  destino: string[] | null;
}

export interface DoApp {
  producoes: ProducaoDoApp[];
  saidas: SaidaDoApp[];
}

/** O que o produtor lança no app: Produção Diária e Saída de Leite. Só leitura. */
export async function lerDoApp(): Promise<Resultado<DoApp>> {
  const s = supa();
  if (!s) return { ok: false, erro: SEM_CONFIG };
  try {
    const [producoes, saidas] = await Promise.all([
      lerProducoesDiarias(null),
      paginado<LinhaSaida>((de, ate) =>
        s
          .from('saida_leite')
          .select('data_saida, litros, destino')
          .eq('propriedade_id', PROPRIEDADE_ID)
          .or('segmento.is.null,segmento.eq.caprino_leiteiro')
          .order('data_saida')
          .order('id')
          .range(de, ate),
      ),
    ]);
    return {
      ok: true,
      dados: {
        producoes,
        saidas: saidas
          .filter((x) => Number(x.litros) > 0 && x.data_saida)
          .map((x) => ({ data: x.data_saida, litros: Number(x.litros), destinos: x.destino ?? [] })),
      },
    };
  } catch (e) {
    console.error('[3irmaos] lerDoApp', e);
    return { ok: false, erro: 'Não foi possível ler a Produção Diária e as saídas de leite do app.' };
  }
}

interface LinhaConsumo {
  categoria_id: string;
  kg_concentrado_dia: number | null;
  kg_volumoso_dia: number | null;
  kg_sal_dia: number | null;
  updated_at: string | null;
}

interface LinhaFormulacao {
  categoria_id: string;
  insumo_id: number;
  proporcao: number | null;
  updated_at: string | null;
}

interface LinhaInsumo {
  id: number;
  nome: string;
  tipo: string;
  unidade: string | null;
  valor_unitario: number | null;
  ativo: boolean | null;
}

export interface DietaDoApp {
  /** Catálogo de insumos de dieta da fazenda (concentrado, volumoso, sal mineral). */
  insumos: InsumoApp[];
  dietas: DietaCadastrada[];
  /** Última mexida na dieta no app (consumo ou formulação). */
  atualizadoEm: string | null;
}

/**
 * A dieta como o produtor cadastrou no app: quanto cada categoria come por
 * dia (`consumo_categoria`) e de que insumos a ração é feita
 * (`formulacao_categoria`), com o catálogo de preços (`insumo`). Só leitura —
 * a dieta se edita no app, aqui ela só vira pedido de compra.
 */
export async function lerDieta(): Promise<Resultado<DietaDoApp>> {
  const s = supa();
  if (!s) return { ok: false, erro: SEM_CONFIG };
  try {
    const [cats, consumos, formulacoes, insumos] = await Promise.all([
      s.from('categoria_animal').select('id, nome'),
      paginado<LinhaConsumo>((de, ate) =>
        s
          .from('consumo_categoria')
          .select('categoria_id, kg_concentrado_dia, kg_volumoso_dia, kg_sal_dia, updated_at')
          .eq('propriedade_id', PROPRIEDADE_ID)
          .or('segmento.is.null,segmento.eq.caprino_leiteiro')
          .order('id')
          .range(de, ate),
      ),
      paginado<LinhaFormulacao>((de, ate) =>
        s
          .from('formulacao_categoria')
          .select('categoria_id, insumo_id, proporcao, updated_at')
          .eq('propriedade_id', PROPRIEDADE_ID)
          .or('segmento.is.null,segmento.eq.caprino_leiteiro')
          .order('id')
          .range(de, ate),
      ),
      paginado<LinhaInsumo>((de, ate) =>
        s
          .from('insumo')
          .select('id, nome, tipo, unidade, valor_unitario, ativo')
          .eq('propriedade_id', PROPRIEDADE_ID)
          .in('tipo', CHAVES_GRUPO)
          .order('id')
          .range(de, ate),
      ),
    ]);
    if (cats.error) throw new Error(cats.error.message);
    const nomes = new Map((cats.data ?? []).map((c: { id: string; nome: string }) => [c.id, c.nome]));

    const porCategoria = new Map<string, ItemFormulacao[]>();
    for (const f of formulacoes) {
      const itens = porCategoria.get(f.categoria_id) ?? [];
      itens.push({ insumoId: f.insumo_id, proporcao: Number(f.proporcao) || 0 });
      porCategoria.set(f.categoria_id, itens);
    }

    const datas = [...consumos, ...formulacoes].map((l) => l.updated_at).filter((d): d is string => !!d);

    return {
      ok: true,
      dados: {
        insumos: insumos.map((i) => ({
          id: i.id,
          nome: i.nome,
          grupo: i.tipo as ChaveGrupo,
          unidade: i.unidade ?? 'kg',
          // 0 no app é "não informado": virar 0 no custo faria o pedido parecer de graça.
          valorUnitario: Number(i.valor_unitario) > 0 ? Number(i.valor_unitario) : null,
          ativo: i.ativo !== false,
        })),
        dietas: consumos.map((c) => ({
          categoria: nomes.get(c.categoria_id) ?? 'sem categoria',
          porCabeca: {
            concentrado: Number(c.kg_concentrado_dia) || 0,
            volumoso: Number(c.kg_volumoso_dia) || 0,
            sal_mineral: Number(c.kg_sal_dia) || 0,
          },
          formulacao: porCategoria.get(c.categoria_id) ?? [],
        })),
        atualizadoEm: datas.length ? datas.reduce((max, d) => (d > max ? d : max)) : null,
      },
    };
  } catch (e) {
    console.error('[3irmaos] lerDieta', e);
    return { ok: false, erro: 'Não foi possível ler a dieta cadastrada no app.' };
  }
}
