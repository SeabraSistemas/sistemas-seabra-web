import { getTranslations } from 'next-intl/server';

/**
 * Disclaimer juridico (plano secao 9.4): mantem a Seabra como provedora de
 * aplicacao (Marco Civil art. 19) e fora da cadeia de consumo do CDC.
 * Renderizado no rodape da pagina do criador e da ficha.
 */
export async function Disclaimer() {
  const t = await getTranslations('criadores');
  return <p className="text-[11px] leading-relaxed text-gray-500">{t('disclaimer')}</p>;
}
