/**
 * Geometria pura do radar da AML (perfil morfológico) — mesma separação de
 * curva.ts/CurvaSvg.tsx: a matemática mora aqui, o componente só desenha.
 *
 * Ângulos portados de radarPointFor/_paintRadar em seabra-app-main
 * (lib/services/relatorios/ficha_animal_jpg.dart) para o desenho da vitrine
 * bater com o PDF que o criador compartilha do app: eixo 0 no topo (12h),
 * avançando em sentido horário conforme o índice cresce.
 *
 * A AML é 1-9 (não 0-10): a fração de cada eixo é valor/9. O app divide por
 * 10 nesse cálculo — bug dele, não replicado aqui (o polígono do app nunca
 * encosta no anel externo por causa disso).
 */

const AML_ESCALA_MAX = 9;

export type PontoRadar = [number, number];

/** Ângulo (rad) do eixo `index` dentre `axisCount` eixos, partindo do topo. */
export function anguloEixo(index: number, axisCount: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / axisCount;
}

/** Ponto no eixo `index`, a `fracao` (0..1) do `raio`, centrado em (cx, cy). */
export function pontoRadar(
  index: number,
  axisCount: number,
  fracao: number,
  raio: number,
  cx: number,
  cy: number,
): PontoRadar {
  const ang = anguloEixo(index, axisCount);
  return [cx + raio * fracao * Math.cos(ang), cy + raio * fracao * Math.sin(ang)];
}

/** Nota 1-9 (fora da faixa é grampeada) normalizada para fração 0..1. */
export function fracaoNota(valor: number): number {
  return Math.min(AML_ESCALA_MAX, Math.max(0, valor)) / AML_ESCALA_MAX;
}

/** Path SVG fechado (M...L...Z) a partir de uma lista de pontos já projetados. */
export function pathFechado(pts: PontoRadar[]): string {
  if (pts.length === 0) return '';
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join('') + 'Z';
}

/** Geometria completa do radar: anéis de grade (0.25/0.5/0.75/1), raios (eixos) e o polígono de dados. */
export function radarGeometria(valores: number[], raio: number, cx: number, cy: number) {
  const n = valores.length;
  const aneis = [0.25, 0.5, 0.75, 1].map((f) =>
    Array.from({ length: n }, (_, i) => pontoRadar(i, n, f, raio, cx, cy)),
  );
  const raios: [PontoRadar, PontoRadar][] = Array.from({ length: n }, (_, i) => [
    [cx, cy],
    pontoRadar(i, n, 1, raio, cx, cy),
  ]);
  const poligono = valores.map((v, i) => pontoRadar(i, n, fracaoNota(v), raio, cx, cy));
  return { aneis, raios, poligono };
}
