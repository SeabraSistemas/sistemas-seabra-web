'use client';

import { useId } from 'react';
import { projetarCurva, type Caixa, type Ponto } from '@/lib/criadores/curva';

/**
 * SVG da curva dia×kg (gradiente + grid + área + linha + pontos) — compartilhado
 * entre a lactação aberta e o card de lactação encerrada (miniatura e expandido).
 * Não inclui o wrapper de tamanho: quem chama decide (`.lac-chart` 172px ou
 * `.lcard-chart` 58px).
 *
 * Com mais de 8 pontos só o primeiro e o último ganham rótulo (kg/dia) — a
 * curva aberta na prática nunca passou disso, mas uma lactação encerrada densa
 * pode ter até ~22 pontos, e rotular todos sobrepõe texto.
 */
export function CurvaSvg({
  pts,
  caixa,
  mostrarRotulos = true,
}: {
  pts: Ponto[];
  caixa: Caixa;
  mostrarRotulos?: boolean;
}) {
  const gid = `crv${useId().replace(/[:]/g, '')}`;
  const { P, days, vals, line, area, grid } = projetarCurva(pts, caixa);
  const rotuloVisivel = (i: number) => mostrarRotulos && (pts.length <= 8 || i === 0 || i === P.length - 1);

  return (
    <>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="lac-svg" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--vit-primary)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--vit-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((y, i) => (
          <line
            key={i}
            x1={caixa.x}
            y1={y}
            x2={caixa.xr}
            y2={y}
            stroke="var(--vit-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 4"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--vit-primary)"
          strokeWidth={mostrarRotulos ? '2.5' : '2'}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="lac-pts">
        {P.map((pt, i) => (
          <div
            key={i}
            className={`lac-pt${!mostrarRotulos ? ' mini' : ''}${i === P.length - 1 ? ' last' : ''}`}
            style={{ left: `${pt[0].toFixed(2)}%`, top: `${pt[1].toFixed(2)}%` }}
          >
            {rotuloVisivel(i) && <span className="lpv">{vals[i]}</span>}
            <i />
            {rotuloVisivel(i) && <span className="lpd">{days[i]}d</span>}
          </div>
        ))}
      </div>
    </>
  );
}
