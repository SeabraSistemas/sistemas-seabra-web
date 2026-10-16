import type { NavLink } from '@/components/sanri/PainelNav';

/** Id da planilha "Producao - Sanri (atual)". null se a env não estiver configurada. */
export function spreadsheetId(): string | null {
  const id = process.env.SANRI_SPREADSHEET_ID;
  return id && id.trim() ? id.trim() : null;
}

export const ABA_USUARIOS = 'User Manager';
export const ABA_PRODUCAO = 'producao_diaria';
export const ABA_TANQUE_REGUA = 'tanque_regua';
export const ABA_BAIAS = 'Baias';
export const ABA_BAIA_CATEGORIA = 'Baia_categoria';
/** Criada pelo painel no 1º salvamento — não existe no AppSheet. */
export const ABA_DIETA = 'dieta_baia';

export const LINKS: NavLink[] = [
  // Régua e Saídas moram dentro de Produção (sub-abas); as rotas continuam as mesmas.
  { href: '/sanri/producao', label: 'Produção', tambem: ['/sanri/regua', '/sanri/saidas'] },
  // Os mesmos avisos que o robô manda no grupo do WhatsApp às 6h (15/10/2026).
  { href: '/sanri/avisos', label: 'Avisos' },
  { href: '/sanri/dieta', label: 'Dieta' },
  // Conferência, Reprodução e Lactações saíram em 15/10/2026: a equipe passou a
  // lançar no app, e essas abas liam a planilha aposentada.
  { href: '/sanri/nomes', label: 'Nomes' },
  // CDN e CDC na planilha oficial, com quem já foi comunicado (16/10/2026).
  { href: '/sanri/cdn-cdc', label: 'CDN e CDC' },
];

/**
 * Propriedade do Capril Sanri no SeabraApp (Supabase). O painel lê o banco do
 * app com a chave de serviço, que ignora a RLS — por isso TODA consulta filtra
 * por esta propriedade, nunca por "tudo que a chave enxerga".
 */
export function propriedadeApp(): number {
  const n = Number(process.env.SANRI_APP_PROPRIEDADE_ID);
  return Number.isInteger(n) && n > 0 ? n : 244;
}

/** Sub-abas da Produção: o resumo do dia a dia, a régua do tanque e as saídas de leite. */
export const LINKS_PRODUCAO: NavLink[] = [
  { href: '/sanri/producao', label: 'Resumo' },
  { href: '/sanri/regua', label: 'Régua' },
  { href: '/sanri/saidas', label: 'Saídas' },
];

export const LOGIN_HREF = '/sanri';
export const HOME_HREF = '/sanri/producao';
