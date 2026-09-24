import type { NavLink } from '@/components/painel/PainelNav';

/** Id da planilha "Producao - Sanri (atual)". null se a env não estiver configurada. */
export function spreadsheetId(): string | null {
  const id = process.env.SANRI_SPREADSHEET_ID;
  return id && id.trim() ? id.trim() : null;
}

export const ABA_USUARIOS = 'User Manager';
export const ABA_PRODUCAO = 'producao_diaria';
export const ABA_TANQUE_REGUA = 'tanque_regua';

export const LINKS: NavLink[] = [
  { href: '/sanri/producao', label: 'Produção' },
  { href: '/sanri/regua', label: 'Régua' },
  { href: '/sanri/saidas', label: 'Saídas' },
];

export const LOGIN_HREF = '/sanri';
export const HOME_HREF = '/sanri/producao';
