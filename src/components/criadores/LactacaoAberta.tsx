'use client';

import { useTranslations } from 'next-intl';
import { CurvaSvg } from './CurvaSvg';

type Aberta = { dias: number; med: number; pts: [number, number][] };

const CAIXA = { x: 4, xr: 95, yt: 26, yb: 80 };

/**
 * Lactação aberta (em curso): card com média/dias + curva SVG de pontos
 * dia×kg (protótipo v12, lactLive). Cada ponto rotulado com kg (acima) e
 * dia (abaixo); o último ponto é destacado em verde.
 */
export function LactacaoAberta({ aberta }: { aberta: Aberta }) {
  const t = useTranslations('criadores');

  return (
    <div className="lac-open">
      <div className="lh">
        <span className="dot" />
        <b>{t('lactacaoAberta')}</b>
        <span className="k">
          {aberta.dias} {t('lactacaoDiasSufixo')}
        </span>
      </div>
      <div className="lac-stat-row">
        <div className="s">
          <div className="v">
            {aberta.med}
            <small> {t('lactacaoKgDia')}</small>
          </div>
          <div className="l">{t('lactacaoMedia')}</div>
        </div>
        <div className="s">
          <div className="v">
            {aberta.dias}
            <small> d</small>
          </div>
          <div className="l">{t('lactacaoDias')}</div>
        </div>
      </div>
      <div className="lac-chart">
        <CurvaSvg pts={aberta.pts} caixa={CAIXA} />
      </div>
    </div>
  );
}
