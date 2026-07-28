/**
 * Curva de lactação (dia × kg) — compartilhada pela lactação aberta e pelos
 * cards de lactação encerrada. Portada do protótipo v12 (smooth()).
 */

export type Ponto = [number, number];

/** Caixa de desenho dentro do viewBox 0..100 (SVG usa preserveAspectRatio="none"). */
export type Caixa = { x: number; xr: number; yt: number; yb: number };

/** Path SVG suave (Catmull-Rom) entre os pontos já projetados. */
export function smooth(P: Ponto[]): string {
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

/** Projeta os pontos [dia,kg] na caixa e devolve o que o SVG precisa desenhar. */
export function projetarCurva(pts: Ponto[], caixa: Caixa) {
  const days = pts.map((p) => p[0]);
  const vals = pts.map((p) => p[1]);
  const maxD = Math.max(...days) || 1;
  const maxV = Math.max(...vals) * 1.18 || 1;
  const pw = caixa.xr - caixa.x;
  const ph = caixa.yb - caixa.yt;
  const P: Ponto[] = pts.map((_, i) => [
    caixa.x + pw * (days[i] / maxD),
    caixa.yt + ph * (1 - vals[i] / maxV),
  ]);
  const line = smooth(P);
  const area = line
    ? `${line}L${P[P.length - 1][0].toFixed(2)},${caixa.yb}L${P[0][0].toFixed(2)},${caixa.yb}Z`
    : '';
  const grid = [0, 0.5, 1].map((f) => (caixa.yt + ph * f).toFixed(2));
  return { P, days, vals, line, area, grid };
}
