import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from './config';
import { mapAnimais, mapLactacoes, recortar, type AnimalApp, type LactacaoApp, type LinhaLactacao, type LinhaRebanho } from './reprodutores';

const PAGINA = 1000;

type Pagina = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/** O PostgREST corta em 1.000 linhas: pagina até a última, sempre com `.order('id')` para a paginação não repetir nem pular linha. */
async function paginar<T>(consulta: (de: number, ate: number) => Pagina): Promise<T[]> {
  const out: T[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await consulta(de, de + PAGINA - 1);
    if (error) throw new Error(error.message);
    const linhas = (data ?? []) as T[];
    out.push(...linhas);
    if (linhas.length < PAGINA) return out;
  }
}

export interface LeituraReprodutores {
  configurado: boolean;
  /** false se a leitura do banco do app falhou. */
  ok: boolean;
  carregadoEm: number | null;
  /** Já recortado: filhas com lactação encerrada, seus reprodutores e os pais deles. */
  animais: AnimalApp[];
  lactacoes: LactacaoApp[];
}

/**
 * Lactações ENCERRADAS da propriedade do Sanri e o rebanho que as explica.
 * Só leitura, sempre fresco (poucas centenas de linhas): a lactação que a
 * equipe encerra no app aparece no painel na hora.
 */
export async function getReprodutores(): Promise<LeituraReprodutores> {
  const supa = publicClient();
  if (!supa) return { configurado: false, ok: false, carregadoEm: null, animais: [], lactacoes: [] };
  const propriedade = propriedadeApp();
  try {
    const [categorias, rebanho, lactacoes] = await Promise.all([
      supa.from('categoria_animal').select('id, nome'),
      paginar<LinhaRebanho>((de, ate) =>
        supa
          .from('rebanho')
          .select('id, numero_animal, nome_animal, sexo, pai_id, mae_id, partos, categoria, status')
          .eq('propriedade_id', propriedade)
          .order('id')
          .range(de, ate),
      ),
      paginar<LinhaLactacao>((de, ate) =>
        supa
          .from('lactacao')
          .select('id, animal_id, data_inicio, data_fim, dias_em_lactacao, total_leite, media_leite, media_corrigida, confianca_inferencia, rebanho!inner(propriedade_id)')
          .eq('rebanho.propriedade_id', propriedade)
          .not('data_fim', 'is', null)
          .order('id')
          .range(de, ate),
      ),
    ]);
    if (categorias.error) throw new Error(categorias.error.message);
    const nomes = new Map((categorias.data ?? []).map((c: { id: string; nome: string }) => [c.id, c.nome]));
    const { animais, lactacoes: lact } = recortar(mapAnimais(rebanho, nomes), mapLactacoes(lactacoes));
    return { configurado: true, ok: true, carregadoEm: Date.now(), animais, lactacoes: lact };
  } catch (err) {
    console.error('[sanri] falha ao ler reprodutores do app', err);
    return { configurado: true, ok: false, carregadoEm: Date.now(), animais: [], lactacoes: [] };
  }
}
