/** As fazendas do painel. Produtor 12521 no Sistema Seabra. */
export const PRODUTOR_ID = 12521;

export const FAZENDAS = [
  { id: 739, nome: 'Fazenda Inhumas' },
  { id: 740, nome: 'Fazenda Campina Grande' },
] as const;

export type Visao = 739 | 740 | 'grupo';

export function visaoDe(bruto: string | undefined): Visao {
  if (bruto === '739') return 739;
  if (bruto === '740') return 740;
  return 'grupo';
}

/** Chave no mapa de parâmetros: campo de fazenda leva "@<id>". */
export function chaveParam(chave: string, propriedadeId: number | null): string {
  return propriedadeId == null ? chave : `${chave}@${propriedadeId}`;
}
