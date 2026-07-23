'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

type Aberta = { dias: number; med: number; pts: [number, number][] };

/** Curva suave (Catmull-Rom) — portada do protótipo v12 (smooth()). */
function smooth(P: [number, number][]): string {
  if (P.length < 2) return '';
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Lactação aberta (em curso): card com média/dias + curva SVG de pontos
 * dia×kg (protótipo v12, lactLive). Cada ponto rotulado com kg (acima) e
 * dia (abaixo); o último ponto é destacado em verde.
 */
export function LactacaoAberta({ aberta }: { aberta: Aberta }) {
  const t = useTranslations('criadores');
  const gid = `lac${useId().replace(/[:]/g, '')}`;
  const pts = aberta.pts;
  const days = pts.map((p) => p[0]);
  const vals = pts.map((p) => p[1]);
  const maxD = Math.max(...days) || 1;
  const maxV = Math.max(...vals) * 1.18 || 1;
  const X = 4;
  const Xr = 95;
  const Yt = 26;
  const Yb = 80;
  const pw = Xr - X;
  const ph = Yb - Yt;
  const P: [number, number][] = pts.map((_, i) => [X + pw * (days[i] / maxD), Yt + ph * (1 - vals[i] / maxV)]);
  const line = smooth(P);
  const area = `${line}L${P[P.length - 1][0].toFixed(2)},${Yb}L${P[0][0].toFixed(2)},${Yb}Z`;
  const grid = [0, 0.5, 1].map((f) => (Yt + ph * f).toFixed(2));

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
            <line key={i} x1={X} y1={y} x2={Xr} y2={y} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="2 4" />
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
