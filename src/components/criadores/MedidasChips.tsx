'use client';

import { useTranslations } from 'next-intl';

/** Medida do snapshot: [label, valor, unidade]. */
type Medida = [string, number, string];

/**
 * Bloco Medidas corporais: chips com valor + unidade (protótipo v12, .mchips).
 * Só medidas de armação em cm (whitelist do vitrine_10); úbere fica de fora.
 */
export function MedidasChips({ medidas }: { medidas: Medida[] }) {
  const t = useTranslations('criadores');
  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('medidasTitulo')}</h3>
      </div>
      <div className="mchips">
        {medidas.map(([label, valor, unidade]) => (
          <div className="mchip" key={label}>
            <div className="l">{label}</div>
            <div className="v">
              {valor}
              <small> {unidade}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
