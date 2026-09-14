import type { NavLink } from '@/components/painel/PainelNav';

/** Id da planilha "Produção - Benoni" (FI = Inhumas, FCG = Campina grande). null se a env não estiver configurada. */
export function spreadsheetId(): string | null {
  const id = process.env.FI_FCG_SPREADSHEET_ID;
  return id && id.trim() ? id.trim() : null;
}

/** Ordem das abas do header — mesma ordem dos dashboards no Looker (Rebanho é a home). */
export const LINKS: NavLink[] = [
  { href: '/FI_FCG/rebanho', label: 'Rebanho' },
  { href: '/FI_FCG/iatf', label: 'IATF' },
  { href: '/FI_FCG/toque', label: 'Toque' },
  { href: '/FI_FCG/partos', label: 'Partos' },
  { href: '/FI_FCG/pesagem', label: 'Pesagem' },
  { href: '/FI_FCG/baixas', label: 'Baixas' },
  { href: '/FI_FCG/financeiro', label: 'Financeiro' },
];

export const LOGIN_HREF = '/FI_FCG';
export const HOME_HREF = '/FI_FCG/rebanho';
