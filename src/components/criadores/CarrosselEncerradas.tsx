'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { projetarCurva } from '@/lib/criadores/curva';

type Enc = {
  ordem: number;
  ano: number;
  total: number;
  dias: number;
  media: number;
  pts?: [number, number][];
};

/** Caixa da miniatura: quase toda a altura, já que não há rótulos por ponto. */
const CAIXA = { x: 3, xr: 97, yt: 8, yb: 92 };

/** Miniatura da curva dia×kg da lactação encerrada (mesma projeção da aberta). */
function CurvaMini({ pts }: { pts: [number, number][] }) {
  const gid = `enc${useId().replace(/[:]/g, '')}`;
  const { P, line, area, grid } = projetarCurva(pts, CAIXA);

  return (
    <div className="lcard-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="lac-svg" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((y, i) => (
          <line
            key={i}
            x1={CAIXA.x}
            y1={y}
            x2={CAIXA.xr}
            y2={y}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 4"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="lac-pts">
        {P.map((pt, i) => (
          <div
            key={i}
            className="lac-pt mini"
            style={{ left: `${pt[0].toFixed(2)}%`, top: `${pt[1].toFixed(2)}%` }}
          >
            <i />
          </div>
        ))}
      </div>
    </div>
  );
}

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
            {l.pts && l.pts.length > 1 && <CurvaMini pts={l.pts} />}
          </div>
        ))}
      </div>
    </div>
  );
}
