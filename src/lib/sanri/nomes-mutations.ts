import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from './config';
import { traduzirErro, type Sexo } from './nomes';

export type Falha = { ok: false; status: number; erro: string };

export interface ResultadoAcrescentar {
  ok: true;
  acrescentados: string[];
  recusados: { nome: string; motivo: string }[];
  /** Crias que estavam sem nome e receberam um dos nomes novos. */
  nomeadas: number;
}

const SEM_BANCO: Falha = { ok: false, status: 503, erro: 'banco do app não configurado' };

/**
 * Grava os nomes UM A UM: um nome recusado (repetido, letra errada) não pode
 * derrubar os outros da mesma colagem. Depois, as crias que ficaram sem nome
 * com a lista vazia recebem os novos (nome_automatico_nomear_pendentes).
 */
export async function acrescentarNomes(ano: number, sexo: Sexo, nomes: string[], email: string): Promise<ResultadoAcrescentar | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const propriedade = propriedadeApp();

  const acrescentados: string[] = [];
  const recusados: { nome: string; motivo: string }[] = [];
  for (const nome of nomes) {
    const { data, error } = await supa
      .from('nome_automatico_lista')
      .insert({ propriedade_id: propriedade, ano, sexo, nome, criado_por: email })
      .select('nome')
      .single();
    if (error) recusados.push({ nome, motivo: traduzirErro(error) });
    else acrescentados.push((data as { nome: string }).nome);
  }

  let nomeadas = 0;
  if (acrescentados.length > 0) {
    const { data, error } = await supa.rpc('nome_automatico_nomear_pendentes', { p_propriedade: propriedade });
    if (error) console.error('[sanri] nomear pendentes falhou', error);
    else nomeadas = Number(data) || 0;
  }
  return { ok: true, acrescentados, recusados, nomeadas };
}

/** Troca um nome LIVRE. O banco recusa (NOME_EM_USO) se ele já foi dado a um animal. */
export async function renomear(id: number, nome: string): Promise<{ ok: true; nome: string } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const { data, error } = await supa
    .from('nome_automatico_lista')
    .update({ nome })
    .eq('id', id)
    .eq('propriedade_id', propriedadeApp())
    .select('nome')
    .maybeSingle();
  if (error) return { ok: false, status: 400, erro: traduzirErro(error) };
  if (!data) return { ok: false, status: 404, erro: 'nome não encontrado' };
  return { ok: true, nome: (data as { nome: string }).nome };
}

/** Exclui um nome LIVRE. O banco recusa (NOME_EM_USO) se ele já foi dado a um animal. */
export async function excluir(id: number): Promise<{ ok: true } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const { data, error } = await supa
    .from('nome_automatico_lista')
    .delete()
    .eq('id', id)
    .eq('propriedade_id', propriedadeApp())
    .select('id');
  if (error) return { ok: false, status: 400, erro: traduzirErro(error) };
  if (!data || data.length === 0) return { ok: false, status: 404, erro: 'nome não encontrado' };
  return { ok: true };
}
