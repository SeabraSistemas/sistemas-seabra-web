import type { NavLink } from '@/components/painel/PainelNav';

/** Capril Rancho 3 Irmãos — propriedade 262 do app (dono: Lucas Furtado). */
export const PROPRIEDADE_ID = 262;
export const NOME_FAZENDA = 'Capril Rancho 3 Irmãos';

export const LOGIN_HREF = '/3irmaos';
export const HOME_HREF = '/3irmaos/projecao';

export const LINKS: NavLink[] = [
  { href: HOME_HREF, label: 'Projeção' },
  { href: '/3irmaos/acompanhamento', label: 'Acompanhamento' },
];
