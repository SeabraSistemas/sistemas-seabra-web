'use client';

import { useTranslations } from 'next-intl';
import type { AmlPonto } from '@/lib/criadores/normalize';
import { pathFechado, pontoRadar, radarGeometria } from '@/lib/criadores/radar';

const DIM = 240;
const CENTRO = DIM / 2;
const RAIO_GRADE = 88;
const RAIO_BADGE = 106;
const R_BADGE = 11;
const R_MEDALHAO = 24;

/**
 * Radar do perfil morfológico (AML) — eixos numerados 1-16, ao lado das
 * barras em AmlBloco.tsx. Espelha o gráfico que o app monta no compartilhar
 * perfil (ver src/lib/criadores/radar.ts para a matemática e a fonte).
 *
 * Fica ao lado das barras, não no lugar delas: a nota exata de cada eixo só
 * está legível na barra (destaqueIndex sincroniza os dois ao passar o mouse).
 * aria-hidden porque a lista de barras já é o equivalente acessível — mesma
 * decisão de CurvaSvg.tsx para a curva de lactação.
 */
export function RadarAml({
  pts,
  totalInt,
  destaqueIndex,
  onDestaqueIndexChange,
}: {
  pts: AmlPonto[];
  totalInt: number | null;
  destaqueIndex: number | null;
  onDestaqueIndexChange: (index: number | null) => void;
}) {
  const t = useTranslations('criadores');
  const n = pts.length;
  if (n < 3) return null;

  const { aneis, raios, poligono } = radarGeometria(
    pts.map((p) => p.valor),
    RAIO_GRADE,
    CENTRO,
    CENTRO,
  );
  const polPath = pathFechado(poligono);

  return (
    <svg viewBox={`0 0 ${DIM} ${DIM}`} className="aml-radar-svg" aria-hidden="true">
      {aneis.map((anel, i) => (
        <path key={`anel${i}`} d={pathFechado(anel)} className="rd-grid" />
      ))}
      {raios.map(([[x1, y1], [x2, y2]], i) => (
        <line key={`raio${i}`} x1={x1} y1={y1} x2={x2} y2={y2} className="rd-grid" />
      ))}
      <path d={polPath} className="rd-area" />
      <path d={polPath} className="rd-line" />
      {poligono.map(([x, y], i) => (
        <circle key={`vtx${i}`} cx={x} cy={y} r={3.2} className={`rd-vtx${i === destaqueIndex ? ' on' : ''}`} />
      ))}
      {pts.map((p, i) => {
        const [x, y] = pontoRadar(i, n, 1, RAIO_BADGE, CENTRO, CENTRO);
        return (
          <g
            key={`badge${i}`}
            className={`rd-badge${i === destaqueIndex ? ' on' : ''}`}
            onMouseEnter={() => onDestaqueIndexChange(i)}
            onMouseLeave={() => onDestaqueIndexChange(null)}
          >
            <circle cx={x} cy={y} r={R_BADGE} />
            {p.n != null && (
              <text x={x} y={y}>
                {p.n}
              </text>
            )}
          </g>
        );
      })}
      {totalInt != null && (
        <g className="rd-medalhao">
          <circle cx={CENTRO} cy={CENTRO} r={R_MEDALHAO} />
          <text x={CENTRO} y={CENTRO - 3} className="rd-total">
            {totalInt}
          </text>
          <text x={CENTRO} y={CENTRO + 11} className="rd-pontos">
            {t('amlPontosLabel')}
          </text>
        </g>
      )}
    </svg>
  );
}
