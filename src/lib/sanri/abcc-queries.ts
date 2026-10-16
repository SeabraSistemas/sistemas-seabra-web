import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from '@/lib/sanri/config';
import type { CabecalhoCdc, CabecalhoCdn, CoberturaCdc, CriaCdn, LinhaCdc, LinhaCdn, Metodo } from '@/lib/sanri/abcc/regras';

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
  /** Desde quando as listas vêm ("AAAA-MM-DD"). */
  criasDesde: string;
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

export async function lerCrias(desde: string): Promise<CriaCdn[]> {
  const supa = publicClient();
  if (!supa) throw new Error('banco do app não configurado');
  const { data, error } = await supa.rpc('abcc_cdn_crias', { p_propriedade: propriedadeApp(), p_desde: desde });
  if (error) throw new Error(error.message);
  return ((data as Bruto[]) ?? []).map(mapCria);
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
 * Tudo da aba: as crias do ano (com quem já foi em CDN), as coberturas dos
 * últimos 6 meses (as que ainda dão cria) e as comunicações emitidas.
 */
export async function getAbcc(agora = new Date()): Promise<LeituraAbcc> {
  const hoje = hojeBrasilia(agora);
  const criasDesde = `${hoje.slice(0, 4)}-01-01`;
  const coberturasDesde = menosDias(hoje, 180);
  const vazio = { modelos: { cdn: false, cdc: false }, crias: [], coberturas: [], comunicacoes: [], criasDesde, coberturasDesde };
  const supa = publicClient();
  if (!supa) return { configurado: false, ok: false, carregadoEm: null, ...vazio };
  try {
    const [modelos, crias, coberturas, comunicacoes] = await Promise.all([
      supa.from('abcc_modelo').select('tipo').eq('propriedade_id', propriedadeApp()),
      lerCrias(criasDesde),
      lerCoberturas(coberturasDesde),
      lerComunicacoes(),
    ]);
    if (modelos.error) throw new Error(modelos.error.message);
    const tipos = new Set(((modelos.data as { tipo: string }[]) ?? []).map((m) => m.tipo));
    return {
      configurado: true,
      ok: true,
      carregadoEm: Date.now(),
      modelos: { cdn: tipos.has('cdn'), cdc: tipos.has('cdc') },
      crias,
      coberturas,
      comunicacoes,
      criasDesde,
      coberturasDesde,
    };
  } catch (err) {
    console.error('[sanri] falha ao ler CDN/CDC', err);
    return { configurado: true, ok: false, carregadoEm: Date.now(), ...vazio };
  }
}
