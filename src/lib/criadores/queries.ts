import { vitrineClient } from '@/lib/supabase/vitrine-server';
import { ordenarAnimais } from './normalize';
import type { Animal, Criador, PaginaAnimal, PaginaCriador } from './types';

/**
 * Camada de leitura da vitrine. Paginacao com .range() desde o dia 1 (o
 * teto-1000 do PostgREST fica invisivel ate um criador grande entrar).
 * Erro de leitura => throw (a rota tem error.tsx e distingue de "vazio").
 */
const PAGE = 500;      // < db-max-rows (1000)
const HARD_CAP = 5;    // 2500 linhas; acima disso e bug, nao crescimento

type QueryFactory = () => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

async function paginar<T>(fabrica: (from: number, to: number) => QueryFactory, label: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; page < HARD_CAP; page++) {
    const from = page * PAGE;
    const to = from + PAGE - 1;
    const { data, error } = await fabrica(from, to)();
    if (error) {
      console.error('[vitrine] falha de leitura', label, error.message);
      throw new Error(`[vitrine] ${label}: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < PAGE) break;
    if (page === HARD_CAP - 1) {
      console.warn(`[vitrine] ${label}: HARD_CAP (${HARD_CAP * PAGE}) atingido — lista truncada`);
    }
  }
  return out;
}

/** Todos os criadores publicados (indice). Vazio legitimo => []. */
export async function getCriadores(): Promise<Criador[]> {
  const supa = vitrineClient();
  if (!supa) throw new Error('[vitrine] cliente indisponivel (env NEXT_PUBLIC_SUPABASE_URL / SUPABASE_ANON_KEY)');
  return paginar<Criador>(
    (from, to) => () => supa.from('criadores').select('*').order('ordem', { ascending: true }).order('criador', { ascending: true }).range(from, to),
    'criadores',
  );
}

/** Pagina de um criador: header + animais (machos primeiro). null => 404. */
export async function getPaginaCriador(slug: string): Promise<PaginaCriador | null> {
  const supa = vitrineClient();
  if (!supa) throw new Error('[vitrine] cliente indisponivel');
  const { data, error } = await supa.from('criadores').select('*').eq('slug', slug).limit(1);
  if (error) {
    console.error('[vitrine] falha de leitura criador', slug, error.message);
    throw new Error(`[vitrine] criador ${slug}: ${error.message}`);
  }
  const criador = (data as Criador[] | null)?.[0];
  if (!criador) return null;

  const animais = await paginar<Animal>(
    (from, to) => () => supa.from('animais').select('*').eq('criador_slug', slug).order('ordem', { ascending: true }).range(from, to),
    `animais:${slug}`,
  );
  return { criador, animais: ordenarAnimais(animais) };
}

/** Ficha de um animal, com vizinhos (anterior/proximo) na ordem do criador. */
export async function getPaginaAnimal(criadorSlug: string, animalSlug: string): Promise<PaginaAnimal | null> {
  const pag = await getPaginaCriador(criadorSlug);
  if (!pag) return null;
  const { animais, criador } = pag;
  const idx = animais.findIndex((a) => a.animal_slug === animalSlug);
  if (idx < 0) return null;
  return {
    criador,
    animal: animais[idx],
    indice: idx + 1,
    total: animais.length,
    anteriorSlug: idx > 0 ? animais[idx - 1].animal_slug : null,
    proximoSlug: idx < animais.length - 1 ? animais[idx + 1].animal_slug : null,
  };
}

/** Slugs para generateStaticParams. NUNCA quebra o build: erro => []. */
export async function getTodosSlugsCriadores(): Promise<string[]> {
  try {
    const supa = vitrineClient();
    if (!supa) return [];
    const rows = await paginar<{ slug: string }>(
      (from, to) => () => supa.from('criadores').select('slug').range(from, to),
      'slugs:criadores',
    );
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export async function getTodosSlugsAnimais(): Promise<{ criador: string; animal: string }[]> {
  try {
    const supa = vitrineClient();
    if (!supa) return [];
    const rows = await paginar<{ criador_slug: string; animal_slug: string }>(
      (from, to) => () => supa.from('animais').select('criador_slug,animal_slug').range(from, to),
      'slugs:animais',
    );
    return rows.map((r) => ({ criador: r.criador_slug, animal: r.animal_slug }));
  } catch {
    return [];
  }
}

/** Contagem para /api/criadores/health (distingue "vazio" de "quebrado"). */
export async function contarVitrine(): Promise<{ criadores: number; animais: number }> {
  const supa = vitrineClient();
  if (!supa) throw new Error('[vitrine] cliente indisponivel');
  const [c, a] = await Promise.all([
    supa.from('criadores').select('slug', { count: 'exact', head: true }),
    supa.from('animais').select('animal_slug', { count: 'exact', head: true }),
  ]);
  if (c.error) throw new Error(`[vitrine] health criadores: ${c.error.message}`);
  if (a.error) throw new Error(`[vitrine] health animais: ${a.error.message}`);
  return { criadores: c.count ?? 0, animais: a.count ?? 0 };
}
