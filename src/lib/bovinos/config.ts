import type { NavLink } from '@/components/painel/PainelNav';
import { CLIENTES } from '@/lib/bovinos/clientes';

export const LOGIN_HREF = '/bovinos';
export const HOME_HREF = '/bovinos/geral';

export const LINKS: NavLink[] = [
  { href: HOME_HREF, label: 'Geral' },
  ...CLIENTES.map((c) => ({ href: `/bovinos/${c.slug}`, label: c.nome })),
];
