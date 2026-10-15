import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from './config';
import type { ConfigNomes, CriaSemNome, NomeLista, Sexo } from './nomes';

const PAGINA = 1000;

type Pagina = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/** O PostgREST corta em 1.000 linhas: pagina até a última, sempre com `.order('id')`. */
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

interface LinhaStatus {
  id: number;
  ano: number;
  sexo: string;
  nome: string;
  animal_id: number | null;
  numero_animal: string | null;
  nome_animal: string | null;
  data_de_nascimento: string | null;
  status_animal: string | null;
  situacao: string | null;
}

interface LinhaCria {
  id: number;
  numero_animal: string | null;
  sexo: string;
  data_de_nascimento: string;
}

export interface LeituraNomes {
  configurado: boolean;
  /** false se a leitura do banco do app falhou. */
  ok: boolean;
  carregadoEm: number | null;
  /** null = o recurso não está ligado para a fazenda no banco. */
  config: ConfigNomes | null;
  nomes: NomeLista[];
  /** Crias lançadas desde que o recurso foi ligado que ainda estão sem nome. */
  semNome: CriaSemNome[];
}

function sexo(s: string): Sexo | null {
  return s === 'fêmea' || s === 'macho' ? s : null;
}

/**
 * Lista de nomes da fazenda, com quem tem cada um (view
 * nome_automatico_lista_status) e as crias que ficaram sem nome. Sempre
 * fresca: o nome é dado no banco na hora em que a equipe lança o parto.
 */
export async function getNomes(): Promise<LeituraNomes> {
  const supa = publicClient();
  const vazio = { config: null, nomes: [], semNome: [] };
  if (!supa) return { configurado: false, ok: false, carregadoEm: null, ...vazio };
  const propriedade = propriedadeApp();
  try {
    const cfg = await supa
      .from('nome_automatico_config')
      .select('ativo, sufixo, ano_base, letra_base, inicio')
      .eq('propriedade_id', propriedade)
      .maybeSingle();
    if (cfg.error) throw new Error(cfg.error.message);
    if (!cfg.data || !cfg.data.ativo) return { configurado: true, ok: true, carregadoEm: Date.now(), ...vazio };
    // created_at é timestamp sem fuso gravado em UTC: compara com o início em UTC, sem o "+00".
    const inicio = new Date(cfg.data.inicio as string).toISOString().slice(0, 19);

    const [lista, crias] = await Promise.all([
      paginar<LinhaStatus>((de, ate) =>
        supa
          .from('nome_automatico_lista_status')
          .select('id, ano, sexo, nome, animal_id, numero_animal, nome_animal, data_de_nascimento, status_animal, situacao')
          .eq('propriedade_id', propriedade)
          .order('id')
          .range(de, ate),
      ),
      paginar<LinhaCria>((de, ate) =>
        supa
          .from('rebanho')
          .select('id, numero_animal, sexo, data_de_nascimento')
          .eq('propriedade_id', propriedade)
          .eq('origem', 'nascido')
          .eq('status', 'ativo')
          .eq('natimorto', false)
          .or('nome_animal.is.null,nome_animal.eq.')
          .not('data_de_nascimento', 'is', null)
          .gte('created_at', inicio)
          .order('id')
          .range(de, ate),
      ),
    ]);

    const nomes: NomeLista[] = [];
    for (const l of lista) {
      const s = sexo(l.sexo);
      if (!s) continue;
      nomes.push({
        id: l.id,
        ano: l.ano,
        sexo: s,
        nome: l.nome,
        animal:
          l.animal_id == null
            ? null
            : { id: l.animal_id, numero: l.numero_animal, nome: l.nome_animal, nascimento: l.data_de_nascimento, ativo: l.status_animal === 'ativo' },
        situacao: l.situacao === 'dado' || l.situacao === 'existe' ? l.situacao : null,
      });
    }

    const semNome: CriaSemNome[] = [];
    for (const c of crias) {
      const s = sexo(c.sexo);
      if (s) semNome.push({ id: c.id, numero: c.numero_animal, sexo: s, nascimento: c.data_de_nascimento });
    }

    return {
      configurado: true,
      ok: true,
      carregadoEm: Date.now(),
      config: { sufixo: cfg.data.sufixo as string, anoBase: cfg.data.ano_base as number, letraBase: cfg.data.letra_base as string },
      nomes,
      semNome,
    };
  } catch (err) {
    console.error('[sanri] falha ao ler a lista de nomes', err);
    return { configurado: true, ok: false, carregadoEm: Date.now(), ...vazio };
  }
}
