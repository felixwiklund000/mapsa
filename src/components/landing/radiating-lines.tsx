// Tunna kurvor som strålar in från sidorna mot mitten, med små fyrkantiga
// prickar längs vägen och några orange prickar som åker inåt ("kunder som
// hittar dit"). Ren SVG – ritas på servern, rörelsen är SMIL.

const W = 1440;
const H = 640;
const CX = W / 2;
const CY = H / 2;
const GAP = 230; // tomrum i mitten för texten
const LINES = 13;

type P = [number, number];

function bezier(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const u = 1 - t;
  return [
    u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1],
  ];
}

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const curves = Array.from({ length: LINES * 2 }, (_, k) => {
  const side = k < LINES ? -1 : 1;
  const i = k % LINES;
  const y0 = -60 + (i / (LINES - 1)) * (H + 120);
  const yEnd = CY + (y0 - CY) * 0.06;
  const xs = (x: number) => (side < 0 ? x : W - x);
  const p: [P, P, P, P] = [
    [xs(-20), y0],
    [xs(CX * 0.42), y0],
    [xs(CX * 0.62), yEnd],
    [xs(CX - GAP), yEnd],
  ];
  const d = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;
  const dots = [0.25, 0.5, 0.72].map((t, j) => {
    const tt = Math.min(0.95, t + (rand(k * 7 + j) - 0.5) * 0.25);
    return { at: bezier(...p, tt), flame: rand(k * 13 + j) > 0.86 };
  });
  return { d, dots };
});

const MOVING = [2, 5, 9, 15, 18, 23];

export function RadiatingLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {curves.map((c, k) => (
        <path key={k} d={c.d} fill="none" stroke="#141312" strokeOpacity="0.09" strokeWidth="1" />
      ))}
      {curves.flatMap((c, k) =>
        c.dots.map((dot, j) => (
          <rect
            key={`${k}-${j}`}
            x={dot.at[0] - 2.5}
            y={dot.at[1] - 2.5}
            width="5"
            height="5"
            fill={dot.flame ? "#ff5a1f" : "#141312"}
            fillOpacity={dot.flame ? 1 : 0.18}
          />
        )),
      )}
      <g className="landing-motion">
        {MOVING.map((k, n) => (
          <rect key={k} width="6" height="6" x="-3" y="-3" fill="#ff5a1f">
            <animateMotion dur={`${3.2 + (n % 3) * 0.7}s`} begin={`${n * 0.55}s`} repeatCount="indefinite" path={curves[k].d} />
          </rect>
        ))}
      </g>
    </svg>
  );
}
