const TOTAL_BARS = 14;
const EMPTY_BAR_COLOR = "#e5e7eb";

const GRADIENT_STOPS: [number, number, number][] = [
  [251, 146, 60], // orange-400
  [250, 204, 21], // yellow-400
  [132, 204, 22], // lime-500
];

export function getScoreBarColors(score: number): string[] {
  const filled = Math.round((score / 100) * TOTAL_BARS);
  return Array.from({ length: TOTAL_BARS }, (_, i) =>
    i < filled ? interpolateGradient(i / (TOTAL_BARS - 1)) : EMPTY_BAR_COLOR,
  );
}

function interpolateGradient(t: number): string {
  const seg = t * (GRADIENT_STOPS.length - 1);
  const i = Math.min(Math.floor(seg), GRADIENT_STOPS.length - 2);
  const f = seg - i;
  const [r1, g1, b1] = GRADIENT_STOPS[i];
  const [r2, g2, b2] = GRADIENT_STOPS[i + 1];
  const mix = (a: number, b: number) => Math.round(a + (b - a) * f);
  return `rgb(${mix(r1, r2)} ${mix(g1, g2)} ${mix(b1, b2)})`;
}
