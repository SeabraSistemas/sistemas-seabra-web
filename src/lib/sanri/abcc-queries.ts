import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from '@/lib/sanri/config';
import type { CabecalhoCdc, CabecalhoCdn, CoberturaCdc, CriaCdn, LinhaCdc, LinhaCdn, Metodo } from '@/lib/sanri/abcc/regras';
import { numeroDoModeloCdc } from '@/lib/sanri/abcc/folhas';

/** Uma CDN ou CDC registrada (abcc_comunicacoes). */
export interface Comunicacao {
  id: number;
  tipo: 'cdn' | 'cdc';
  ano: number;
  numero: number;
  texto: string;
  data: string;
  metodo: Metodo | null;
  reprodutorId: number | null;
  periodoDe: string | null;
  periodoAte: string | null;
  externa: boolean;
  cabecalho: Partial<CabecalhoCdn & CabecalhoCdc>;
  criadoEm: string;
  cancelada: boolean;
  linhas: { linha: number; animalId: number; coberturaId: number | null; dataCobertura: string | null; dados: Partial<LinhaCdn & LinhaCdc> }[];
}

export interface LeituraAbcc {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  /** Os modelos (a folha oficial do criador) que estão no banco. */
  modelos: { cdn: boolean; cdc: boolean };
  crias: CriaCdn[];
  coberturas: CoberturaCdc[];
  comunicacoes: Comunicacao[];
  /** "519/2026": o número da CDC que está no modelo do criador (ajuda a sugerir a próxima). */
  numeroModeloCdc: string | null;
  /** Desde quando as listas vêm ("AAAA-MM-DD"). As crias vêm desde 1º/jan do
   *  ano ANTERIOR; o filtro da tela começa no ano corrente (inicioDoAno). */
  criasDesde: string;
  inicioDoAno: string;
  coberturasDesde: string;
}

type Bruto = Record<string, unknown>;

const num = (v: unknown): number | null => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null);
const str = (v: unknown): string | null => (v == null ? null : String(v));

function ref(v: unknown): { id: number; nome: string | null; numero: string | null } | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Bruto;
  return { id: Number(o.id), nome: str(o.nome), numero: str(o.numero) };
}

function metodo(v: unknown): Metodo | null {
  return v === 'mn' || v === 'ia' || v === 'te' ? v : null;
}

export function mapCria(o: Bruto): CriaCdn {
  return {
    id: Number(o.id),
    numero: str(o.numero),
    nome: str(o.nome),
    sexo: str(o.sexo),
    pelagem: str(o.pelagem),
    raca: str(o.raca),
    nascimento: String(o.nascimento),
    peso: num(o.peso),
    status: str(o.status),
    pai: ref(o.pai),
    mae: ref(o.mae),
    metodo: metodo(o.metodo),
    dataCobertura: str(o.data_cobertura),
    cdc: str(o.cdc),
    enviada: o.enviada === true,
    cdn: str(o.cdn),
  };
}

export function mapCobertura(o: Bruto): CoberturaCdc {
  const f = (o.femea ?? {}) as Bruto;
  const r = o.reprodutor as Bruto | null;
  return {
    id: Number(o.id),
    data: String(o.data),
    femea: { id: Number(f.id), nome: str(f.nome), numero: str(f.numero), status: str(f.status) },
    reprodutor: r ? { id: Number(r.id), nome: str(r.nome), numero: str(r.numero), raca: str(r.raca) } : null,
    cdc: str(o.cdc),
  };
}

export function mapComunicacao(o: Bruto): Comunicacao {
  return {
    id: Number(o.id),
    tipo: o.tipo === 'cdc' ? 'cdc' : 'cdn',
    ano: Number(o.ano),
    numero: Number(o.numero),
    texto: String(o.texto),
    data: String(o.data),
    metodo: metodo(o.metodo),
    reprodutorId: num(o.reprodutor_id),
    periodoDe: str(o.periodo_de),
    periodoAte: str(o.periodo_ate),
    externa: o.externa === true,
    cabecalho: (o.cabecalho ?? {}) as Comunicacao['cabecalho'],
    criadoEm: String(o.criado_em),
    cancelada: o.cancelada_em != null,
    linhas: ((o.linhas as Bruto[]) ?? []).map((l) => ({
      linha: Number(l.linha),
      animalId: Number(l.animal_id),
      coberturaId: num(l.cobertura_id),
      dataCobertura: str(l.data_cobertura),
      dados: (l.dados ?? {}) as Comunicacao['linhas'][number]['dados'],
    })),
  };
}

/** Hoje em Brasília ("AAAA-MM-DD"). */
export function hojeBrasilia(agora = new Date()): string {
  return agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function menosDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Categoria de registro (rebanho.grau_sangue_animal: PO, PC, PA…) da cria e
 * dos pais — a CDN leva a CATEGORIA desde 21/10/2026. Lida à parte, em
 * blocos (o PostgREST corta em 1000 linhas), sempre na fazenda do painel.
 */
async function categorias(ids: number[]): Promise<Map<number, string | null>> {
  const supa = publicClient();
  const out = new Map<number, string | null>();
  if (!supa || ids.length === 0) return out;
  const unicos = [...new Set(ids)];
  for (let i = 0; i < unicos.length; i += 300) {
    const { data, error } = await supa
      .from('rebanho')
      .select('id, grau_sangue_animal')
      .eq('propriedade_id', propriedadeApp())
      .in('id', unicos.slice(i, i + 300));
    if (error) throw new Error(error.message);
    for (const r of (data as { id: number; grau_sangue_animal: string | null }[]) ?? []) out.set(Number(r.id), r.grau_sangue_animal);
  }
  return out;
}

export async function lerCrias(desde: string): Promise<CriaCdn[]> {
  const supa = publicClient();
  if (!supa) throw new Error('banco do app não configurado');
  const { data, error } = await supa.rpc('abcc_cdn_crias', { p_propriedade: propriedadeApp(), p_desde: desde });
  if (error) throw new Error(error.message);
  const crias = ((data as Bruto[]) ?? []).map(mapCria);
  const cat = await categorias(crias.flatMap((c) => [c.id, c.pai?.id ?? 0, c.mae?.id ?? 0]).filter((id) => id > 0));
  return crias.map((c) => ({
    ...c,
    categoria: cat.get(c.id) ?? null,
    pai: c.pai ? { ...c.pai, categoria: cat.get(c.pai.id) ?? null } : null,
    mae: c.mae ? { ...c.mae, categoria: cat.get(c.mae.id) ?? null } : null,
  }));
}

export async function lerCoberturas(desde: string): Promise<CoberturaCdc[]> {
  const supa = publicClient();
  if (!supa) throw new Error('banco do app não configurado');
  const { data, error } = await supa.rpc('abcc_cdc_coberturas', { p_propriedade: propriedadeApp(), p_desde: desde });
  if (error) throw new Error(error.message);
  return ((data as Bruto[]) ?? []).map(mapCobertura);
}

export async function lerComunicacoes(): Promise<Comunicacao[]> {
  const supa = publicClient();
  if (!supa) throw new Error('banco do app não configurado');
  const { data, error } = await supa.rpc('abcc_comunicacoes', { p_propriedade: propriedadeApp(), p_limite: 500 });
  if (error) throw new Error(error.message);
  return ((data as Bruto[]) ?? []).map(mapComunicacao);
}

/**
 * O que as abas CDN e CDC leem (cada uma pede só a sua parte): as crias deste ano e do anterior (com quem já foi em CDN), as coberturas dos
 * últimos 6 meses (as que ainda dão cria) e as comunicações emitidas.
 */
export async function getAbcc(partes: { crias?: boolean; coberturas?: boolean } = { crias: true, coberturas: true }, agora = new Date()): Promise<LeituraAbcc> {
  const hoje = hojeBrasilia(agora);
  const inicioDoAno = `${hoje.slice(0, 4)}-01-01`;
  const criasDesde = `${Number(hoje.slice(0, 4)) - 1}-01-01`;
  const coberturasDesde = menosDias(hoje, 180);
  const vazio = { modelos: { cdn: false, cdc: false }, crias: [], coberturas: [], comunicacoes: [], numeroModeloCdc: null, criasDesde, inicioDoAno, coberturasDesde };
  const supa = publicClient();
  if (!supa) return { configurado: false, ok: false, carregadoEm: null, ...vazio };
  try {
    const [modelos, crias, coberturas, comunicacoes] = await Promise.all([
      supa.from('abcc_modelo').select('tipo').eq('propriedade_id', propriedadeApp()),
      partes.crias ? lerCrias(criasDesde) : Promise.resolve([]),
      partes.coberturas ? lerCoberturas(coberturasDesde) : Promise.resolve([]),
      lerComunicacoes(),
    ]);
    if (modelos.error) throw new Error(modelos.error.message);
    const tipos = new Set(((modelos.data as { tipo: string }[]) ?? []).map((m) => m.tipo));
    let numeroModeloCdc: string | null = null;
    if (partes.coberturas && tipos.has('cdc')) {
      const { data: m } = await supa.from('abcc_modelo').select('arquivo_base64').eq('propriedade_id', propriedadeApp()).eq('tipo', 'cdc').maybeSingle();
      const b64 = (m as { arquivo_base64?: string } | null)?.arquivo_base64;
      if (b64) numeroModeloCdc = numeroDoModeloCdc(new Uint8Array(Buffer.from(b64, 'base64')));
    }
    return {
      configurado: true,
      ok: true,
      carregadoEm: Date.now(),
      modelos: { cdn: tipos.has('cdn'), cdc: tipos.has('cdc') },
      crias,
      coberturas,
      comunicacoes,
      numeroModeloCdc,
      criasDesde,
      inicioDoAno,
      coberturasDesde,
    };
  } catch (err) {
    console.error('[sanri] falha ao ler CDN/CDC', err);
    return { configurado: true, ok: false, carregadoEm: Date.now(), ...vazio };
  }
}
