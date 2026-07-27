'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { projetarCurva } from '@/lib/criadores/curva';

type Aberta = { dias: number; med: number; pts: [number, number][] };

/**
 * Lactação aberta (em curso): card com média/dias + curva SVG de pontos
 * dia×kg (protótipo v12, lactLive). Cada ponto rotulado com kg (acima) e
 * dia (abaixo); o último ponto é destacado em verde.
 */
export function LactacaoAberta({ aberta }: { aberta: Aberta }) {
  const t = useTranslations('criadores');
  const gid = `lac${useId().replace(/[:]/g, '')}`;
  const caixa = { x: 4, xr: 95, yt: 26, yb: 80 };
  const { P, days, vals, line, area, grid } = projetarCurva(aberta.pts, caixa);

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
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="lac-svg">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.22" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {grid.map((y, i) => (
            <line key={i} x1={caixa.x} y1={y} x2={caixa.xr} y2={y} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="2 4" />
          ))}
          <path d={area} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="lac-pts">
          {P.map((pt, i) => (
            <div key={i} className={`lac-pt${i === P.length - 1 ? ' last' : ''}`} style={{ left: `${pt[0].toFixed(2)}%`, top: `${pt[1].toFixed(2)}%` }}>
              <span className="lpv">{vals[i]}</span>
              <i />
              <span className="lpd">{days[i]}d</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
