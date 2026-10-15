/**
 * Avisos diários do grupo de WhatsApp da Sanri — regras puras (sem banco, sem tela).
 *
 * Quem monta e manda as mensagens é o banco do app (aviso_grupo_textos e
 * aviso_grupo_enviar, migration 20261015160000_aviso_grupo_whatsapp_sanri.sql):
 * o robô posta no grupo às 06:00. O painel só mostra o mesmo texto, deixa
 * copiar ou abrir no WhatsApp, e diz se o envio do dia saiu.
 */

export type TipoAviso = 'dg' | 'manejos';

export interface TextosAviso {
  data: string;
  dg: string;
  dgQtd: number;
  manejos: string;
  manejosQtd: number;
  dgDiasMin: number;
}

export interface EnvioAviso {
  data: string;
  tipo: TipoAviso;
  enviadoEm: string;
  tentativas: number;
  statusHttp: number | null;
  erro: string | null;
}

export type SituacaoEnvio = 'enviado' | 'falhou' | 'aguardando';

/** 2xx = saiu; sem resposta ainda = aguardando; o resto (ou erro de rede) = falhou. */
export function situacaoDoEnvio(e: Pick<EnvioAviso, 'statusHttp' | 'erro'>): SituacaoEnvio {
  if (e.statusHttp != null && e.statusHttp >= 200 && e.statusHttp < 300) return 'enviado';
  if (e.statusHttp == null && !e.erro) return 'aguardando';
  return 'falhou';
}

export const ROTULO_SITUACAO: Record<SituacaoEnvio, string> = {
  enviado: 'Enviado',
  falhou: 'Falhou',
  aguardando: 'Aguardando',
};

export const ROTULO_TIPO: Record<TipoAviso, string> = {
  dg: 'Diagnóstico de gestação',
  manejos: 'Manejos do dia',
};

/** Link que abre o WhatsApp com o texto pronto — a pessoa escolhe o grupo. */
export function linkWhatsapp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

/** "2026-10-15" válido → ele mesmo; qualquer outra coisa → null. */
export function dataValida(v: string | null | undefined): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : v;
}

/** Hoje em Brasília, "AAAA-MM-DD" — o mesmo dia que o banco usa para o envio. */
export function hojeBrasilia(agora: Date = new Date()): string {
  return agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

/** Linha do jsonb de aviso_grupo_textos → TextosAviso (null se faltar o essencial). */
export function mapTextos(v: unknown): TextosAviso | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.dg !== 'string' || typeof o.manejos !== 'string') return null;
  return {
    data: String(o.data ?? ''),
    dg: o.dg,
    dgQtd: Number(o.dg_qtd) || 0,
    manejos: o.manejos,
    manejosQtd: Number(o.manejos_qtd) || 0,
    dgDiasMin: Number(o.dg_dias_min) || 60,
  };
}
