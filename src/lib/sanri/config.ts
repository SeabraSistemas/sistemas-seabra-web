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
export const ABA_REBANHO = 'RebanhoProd';
export const ABA_REPRODUCAO = 'Reproduçao';
export const ABA_DIAGNOSTICO = 'DiagnosticoGestaçao';
export const ABA_PARTOS = 'Partos';
export const ABA_IA = 'IA';
/** A "view" das estações de monta — criada pelo painel no 1º salvamento, o AppSheet não usa. */
export const ABA_ESTACOES = 'estacao_monta';
/** Resultado de cada conferência de baia — criada pelo painel no 1º salvamento, o AppSheet não usa. */
export const ABA_CONFERENCIA = 'conferencia_baia';

export const LINKS: NavLink[] = [
  { href: '/sanri/producao', label: 'Produção' },
  { href: '/sanri/regua', label: 'Régua' },
  { href: '/sanri/saidas', label: 'Saídas' },
  { href: '/sanri/dieta', label: 'Dieta' },
  { href: '/sanri/conferencia', label: 'Conferência' },
  { href: '/sanri/reproducao', label: 'Reprodução' },
  { href: '/sanri/lactacoes', label: 'Lactações' },
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

export const LOGIN_HREF = '/sanri';
export const HOME_HREF = '/sanri/producao';
