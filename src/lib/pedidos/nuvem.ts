import 'server-only';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { publicClient } from '@/lib/adm/supabase-admin';
import { modoNuvem } from '@/lib/pedidos/auth';

/**
 * Armazenamento dos documentos do /pedidos: Supabase na Vercel, arquivos em
 * ~/.seabra-pedidos no Mac. Mesma interface nos dois lados.
 */
export type Doc = 'snapshot' | 'precos' | 'estado';

const ARQUIVO: Record<Doc, string> = { snapshot: 'pedidos.json', precos: 'precos.json', estado: 'estado.json' };
const dir = () => process.env.PEDIDOS_DIR ?? join(homedir(), '.seabra-pedidos');

export async function lerDoc(chave: Doc): Promise<unknown | null> {
  if (modoNuvem()) {
    const c = publicClient();
    if (!c) return null;
    const { data } = await c.from('pedidos_dados').select('valor').eq('chave', chave).maybeSingle();
    return data?.valor ?? null;
  }
  try {
    return JSON.parse(await readFile(join(dir(), ARQUIVO[chave]), 'utf8'));
  } catch {
    return null;
  }
}

export async function gravarDoc(chave: Doc, valor: unknown): Promise<boolean> {
  if (modoNuvem()) {
    const c = publicClient();
    if (!c) return false;
    const { error } = await c.from('pedidos_dados').upsert({ chave, valor, atualizado_em: new Date().toISOString() });
    return !error;
  }
  await mkdir(dir(), { recursive: true, mode: 0o700 });
  const arq = join(dir(), ARQUIVO[chave]);
  await writeFile(arq, JSON.stringify(valor, null, 2), { mode: 0o600 });
  await chmod(arq, 0o600);
  return true;
}
