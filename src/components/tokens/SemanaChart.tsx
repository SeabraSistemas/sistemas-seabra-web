'use client';

import { useEffect, useRef, useState } from 'react';
import type { Plano } from '@/lib/tokens/ciclo';
import { formatPct, quando, SEMANA } from './formato';

const ALTURA = 220;
const M = { top: 12, right: 12, bottom: 28, left: 40 };
const EIXO_Y = [0, 25, 50, 75, 100];

/**
 * Medidor acumulado do ciclo (0 → 100%) contra o gasto por igual desde o
 * reset. SVG na mão em vez de recharts: o eixo x é tempo contínuo com
 * divisões de dia às 02:00, e as leituras caem em horários quaisquer.
 */
export function SemanaChart({ plano }: { plano: Plano }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  const [foco, setFoco] = useState<number | null>(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setLargura(Math.round(e.contentRect.width)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { ciclo, dias, hoje, leituras } = plano;
  const iw = Math.max(0, largura - M.left - M.right);
  const ih = ALTURA - M.top - M.bottom;
  const x = (t: number) => M.left + ((t - ciclo.inicio) / (ciclo.fim - ciclo.inicio)) * iw;
  const y = (v: number) => M.top + (1 - Math.min(100, Math.max(0, v)) / 100) * ih;
  const linearEm = (t: number) => (100 * (t - ciclo.inicio)) / (ciclo.fim - ciclo.inicio);

  const pontos = [{ t: ciclo.inicio, pct: 0 }, ...leituras];
  const caminho = pontos.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.pct).toFixed(1)}`).join(' ');

  function mover(ev: React.PointerEvent<SVGSVGElement>) {
    if (!leituras.length) return;
    const mx = ev.clientX - ev.currentTarget.getBoundingClientRect().left;
    let melhor = 0;
    leituras.forEach((l, i) => {
      if (Math.abs(x(l.t) - mx) < Math.abs(x(leituras[melhor].t) - mx)) melhor = i;
    });
    setFoco(Math.abs(x(leituras[melhor].t) - mx) <= 32 ? melhor : null);
  }

  const lf = foco != null ? leituras[foco] : null;

  return (
    <div ref={caixa} className="relative w-full" style={{ height: ALTURA }}>
      {largura > 0 && (
        <svg
          width={largura}
          height={ALTURA}
          className="block touch-pan-y select-none"
          onPointerMove={mover}
          onPointerDown={mover}
          onPointerLeave={() => setFoco(null)}
          role="img"
          aria-label={`Medidor em ${formatPct(plano.atual)} de 100%; limite de hoje ${formatPct(plano.limiteHoje)}.`}
        >
          <rect x={x(hoje.inicio)} y={M.top} width={x(hoje.fim) - x(hoje.inicio)} height={ih} fill="var(--secondary)" />

          {EIXO_Y.map((v) => (
            <g key={v}>
              <line x1={M.left} x2={M.left + iw} y1={y(v)} y2={y(v)} stroke="var(--border)" />
              <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted-foreground)" className="tabular-nums">
                {v}%
              </text>
            </g>
          ))}

          {dias.map((d, i) => {
            const meio = (x(d.inicio) + x(d.fim)) / 2;
            const cabe = x(d.fim) - x(d.inicio) >= 22;
            return (
              <g key={d.inicio}>
                {i > 0 && <line x1={x(d.inicio)} x2={x(d.inicio)} y1={M.top} y2={M.top + ih} stroke="var(--border)" />}
                {cabe && (
                  <text
                    x={meio}
                    y={ALTURA - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill={d.fase === 'hoje' ? 'var(--foreground)' : 'var(--muted-foreground)'}
                    fontWeight={d.fase === 'hoje' ? 600 : 400}
                  >
                    {SEMANA[new Date(d.rotulo).getDay()]}
                  </text>
                )}
              </g>
            );
          })}

          <line x1={x(ciclo.inicio)} y1={y(0)} x2={x(ciclo.fim)} y2={y(100)} stroke="var(--ink-2)" strokeWidth={2} strokeLinecap="round" />

          <line
            x1={x(hoje.inicio) + 2}
            x2={x(hoje.fim) - 2}
            y1={y(plano.limiteHoje)}
            y2={y(plano.limiteHoje)}
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          <path d={caminho} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {lf && <line x1={x(lf.t)} x2={x(lf.t)} y1={M.top} y2={M.top + ih} stroke="var(--line-strong)" />}

          {leituras.map((l, i) => (
            <circle key={`${l.t}-${i}`} cx={x(l.t)} cy={y(l.pct)} r={i === foco ? 5.5 : 4} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
          ))}
        </svg>
      )}

      {lf && (
        <div
          className="pointer-events-none absolute z-10 w-max rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg"
          style={{
            left: Math.min(Math.max(x(lf.t) - 80, 0), Math.max(0, largura - 160)),
            top: Math.max(0, y(lf.pct) - 76),
          }}
        >
          <p className="text-muted-foreground">{quando(lf.t)}</p>
          <p className="mt-1 tabular-nums">
            Medidor <span className="font-semibold">{formatPct(lf.pct)}</span>
          </p>
          <p className="tabular-nums text-muted-foreground">Ritmo linear {formatPct(linearEm(lf.t))}</p>
        </div>
      )}
    </div>
  );
}
