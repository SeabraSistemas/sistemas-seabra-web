import { Locale } from '@/i18n/config';
import type { UTMParams } from '@/lib/whatsapp';

/**
 * Página de agendamentos do Google Calendar (conta sistemaseabra@gmail.com).
 * O link é público — aparece no HTML — então fica embutido como fallback, no
 * mesmo padrão de GA_ID e APP_URL. NEXT_PUBLIC_AGENDA_URL tem prioridade.
 *
 * A duração de 1 hora, os buffers e o limite de reuniões por dia são
 * configurados NA página do Google, não aqui: o visitante só escolhe entre os
 * horários que o Google oferece. Este módulo só monta a URL.
 *
 * Enquanto a URL estiver vazia, os CTAs não são renderizados — prometer
 * "agendar" e entregar 404 frustra o visitante (mesma regra do APK_URL).
 */
export const AGENDA_URL = process.env.NEXT_PUBLIC_AGENDA_URL || '';

/** Duração da reunião, em minutos. Só para copy — quem impõe é o Google. */
export const AGENDA_DURACAO_MIN = 60;

export function isAgendaEnabled(): boolean {
  return AGENDA_URL.length > 0;
}

export interface AgendaLinkConfig {
  locale: Locale;
  /** Segmento de origem do clique (ex. 'caprinos-leite'), para leitura no GA. */
  segment?: string;
  utm?: UTMParams;
}

/**
 * Monta a URL da agenda com origem anexada.
 *
 * ATENÇÃO: o Google NÃO repassa query params para o evento criado — o UTM não
 * chega ao calendário. Ele serve para (a) o relatório de cliques de saída do
 * GA4 e (b) diferenciar de onde o visitante saiu. Para saber a origem DENTRO
 * do evento, use uma pergunta no formulário de reserva do Google.
 */
export function buildAgendaUrl(config: AgendaLinkConfig): string {
  if (!AGENDA_URL) return '';

  const { locale, segment, utm } = config;
  const params = new URLSearchParams();

  params.set('utm_source', utm?.utm_source || 'sistemaseabra.com.br');
  params.set('utm_medium', utm?.utm_medium || 'site');
  if (utm?.utm_campaign) params.set('utm_campaign', utm.utm_campaign);
  if (utm?.utm_content) params.set('utm_content', utm.utm_content);
  if (segment) params.set('utm_term', segment);
  params.set('hl', locale);

  const separator = AGENDA_URL.includes('?') ? '&' : '?';
  return `${AGENDA_URL}${separator}${params.toString()}`;
}
