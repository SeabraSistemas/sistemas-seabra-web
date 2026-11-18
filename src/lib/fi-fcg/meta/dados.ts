import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import type { DadosFazenda, Parametros } from './modelo';
import { FAZENDAS, PRODUTOR_ID, chaveParam } from './fazendas';

export interface Gravacao {
  valor: number | string | null;
  gravado_por: string;
  gravado_em: string;
}

/** Leitura dos indicadores (contados dentro do banco) e dos campos gravados. Só leitura. */
export async function lerMeta(): Promise<
  { ok: true; fazendas: DadosFazenda[]; parametros: Parametros; gravacoes: Record<string, Gravacao> } | { ok: false; erro: string }
> {
  const supa = publicClient();
  if (!supa) return { ok: false, erro: 'Falta configurar o acesso ao banco neste servidor.' };

  const fazendas: DadosFazenda[] = [];
  for (const f of FAZENDAS) {
    const { data, error } = await supa.rpc('painel_meta_bovino_dados', { p_propriedade: f.id });
    if (error) return { ok: false, erro: error.message };
    fazendas.push(data as DadosFazenda);
  }

  // campos gravados: paginado (teto de 1000 linhas), o mais recente de cada chave vale
  const linhas: { chave: string; propriedade_id: number | null; valor: unknown; gravado_por: string; gravado_em: string }[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supa
      .from('painel_parametro_bovino')
      .select('chave, propriedade_id, valor, gravado_por, gravado_em, id')
      .eq('produtor_id', PRODUTOR_ID)
      .order('gravado_em', { ascending: false })
      .order('id', { ascending: false })
      .range(de, de + 999);
    if (error) return { ok: false, erro: error.message };
    linhas.push(...((data ?? []) as typeof linhas));
    if (!data || data.length < 1000) break;
  }
  const parametros: Parametros = {};
  const gravacoes: Record<string, Gravacao> = {};
  for (const l of linhas) {
    const k = chaveParam(l.chave, l.propriedade_id);
    if (k in gravacoes) continue;
    const v = typeof l.valor === 'number' || typeof l.valor === 'string' ? l.valor : null;
    gravacoes[k] = { valor: v, gravado_por: l.gravado_por, gravado_em: l.gravado_em };
    if (v != null) parametros[k] = v;
  }
  return { ok: true, fazendas, parametros, gravacoes };
}
