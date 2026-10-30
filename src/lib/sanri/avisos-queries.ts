import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from './config';
import { mapTextos, TIPOS_AVISO, type EnvioAviso, type TextosAviso, type TipoAviso } from './avisos';

export interface LeituraAvisos {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  textos: TextosAviso | null;
  /** O robô já está num grupo? (sem grupo, nada sai sozinho) */
  grupo: { nome: string | null; ativo: boolean } | null;
  envios: EnvioAviso[];
}

interface LinhaStatus {
  data: string;
  tipo: string;
  enviado_em: string;
  tentativas: number;
  status_http: number | null;
  erro: string | null;
}

/** Os dois avisos de um dia (os mesmos que o robô manda) e os últimos envios. */
export async function getAvisos(data: string): Promise<LeituraAvisos> {
  const supa = publicClient();
  const vazio = { textos: null, grupo: null, envios: [] };
  if (!supa) return { configurado: false, ok: false, carregadoEm: null, ...vazio };
  const propriedade = propriedadeApp();
  try {
    const [textos, cfg, status] = await Promise.all([
      supa.rpc('aviso_grupo_textos', { p_propriedade: propriedade, p_data: data }),
      supa.from('aviso_grupo_whatsapp').select('grupo_jid, grupo_nome, ativo').eq('propriedade_id', propriedade).maybeSingle(),
      supa.rpc('aviso_grupo_status', { p_propriedade: propriedade, p_limite: 14 }),
    ]);
    if (textos.error) throw new Error(textos.error.message);
    if (cfg.error) throw new Error(cfg.error.message);
    if (status.error) throw new Error(status.error.message);

    const c = cfg.data as { grupo_jid: string | null; grupo_nome: string | null; ativo: boolean } | null;
    const envios: EnvioAviso[] = ((status.data ?? []) as LinhaStatus[])
      .filter((l) => (TIPOS_AVISO as string[]).includes(l.tipo))
      .map((l) => ({
        data: l.data,
        tipo: l.tipo as TipoAviso,
        enviadoEm: l.enviado_em,
        tentativas: l.tentativas,
        statusHttp: l.status_http,
        erro: l.erro,
      }));

    return {
      configurado: true,
      ok: true,
      carregadoEm: Date.now(),
      textos: mapTextos(textos.data),
      grupo: c && c.grupo_jid ? { nome: c.grupo_nome, ativo: c.ativo } : null,
      envios,
    };
  } catch (err) {
    console.error('[sanri] falha ao ler os avisos', err);
    return { configurado: true, ok: false, carregadoEm: Date.now(), ...vazio };
  }
}
