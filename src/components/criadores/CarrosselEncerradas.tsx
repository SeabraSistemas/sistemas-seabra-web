'use client';

import { useTranslations } from 'next-intl';

type Enc = { ordem: number; ano: number; total: number; dias: number; media: number };

/** Carrossel de lactações encerradas (protótipo v12): card por lactação. */
export function CarrosselEncerradas({ enc }: { enc: Enc[] }) {
  const t = useTranslations('criadores');
  return (
    <div className="block">
      <div className="block-h">
        <h3>{t('lactacoesEncerradas')}</h3>
        <span className="k">{enc.length}</span>
      </div>
      <div className="carousel">
        {enc.map((l) => (
          <div className="lcard" key={l.ordem}>
            <div className="lo">
              <b>{t('lactacaoOrdinal', { n: l.ordem })}</b>
              <span>{l.ano}</span>
            </div>
            <div className="big">
              {l.total}
              <small> kg</small>
            </div>
            <div className="sub">
              <span>{l.media} kg/d</span>
              <span>{l.dias} d</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
