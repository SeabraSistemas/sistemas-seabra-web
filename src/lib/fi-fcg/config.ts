import type { NavLink } from '@/components/painel/PainelNav';

/** Id da planilha "Produção - Benoni" (FI = Inhumas, FCG = Campina grande). null se a env não estiver configurada. */
export function spreadsheetId(): string | null {
  const id = process.env.FI_FCG_SPREADSHEET_ID;
  return id && id.trim() ? id.trim() : null;
}

/**
 * Abas do header. Em 18/11/2026 as nove abas antigas (Rebanho, IATF, Toque,
 * Partos, Pesagem, Baixas, Financeiro, Projeção, Monitorar) saíram: tudo isso
 * já está no Sistema Seabra, que o Sérgio usa. As páginas antigas redirecionam
 * para a Meta e o código continua no repositório (ver ABAS_OCULTAS).
 */
export const LINKS: NavLink[] = [
  { href: '/FI_FCG/meta', label: 'Meta' },
  { href: '/FI_FCG/questionario', label: 'Questionário' },
];

/** Abas tiradas do header em 18/11/2026; a página de cada uma redireciona para HOME_HREF. */
export const ABAS_OCULTAS = [
  'rebanho',
  'iatf',
  'toque',
  'partos',
  'pesagem',
  'baixas',
  'financeiro',
  'projecao',
  'monitorar',
] as const;

export const LOGIN_HREF = '/FI_FCG';
export const HOME_HREF = '/FI_FCG/meta';
