import React from 'react';

/**
 * Procedural red silk ribbon: a twisting band whose shading follows the twist
 * (front face bright, back face deep) — reads as satin in motion.
 */
const mix = (a: number[], b: number[], p: number) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
const DARK = [74, 6, 14];
const BASE = [183, 25, 38]; // #B71926
const HI = [246, 120, 120];

export const SilkRibbon: React.FC<{
  t: number; y0: number; amp?: number; width?: number; k?: number; speed?: number; twist?: number;
  x0?: number; x1?: number; rotate?: number; opacity?: number; blur?: number; seed?: number; reveal?: number; shadow?: boolean;
}> = ({ t, y0, amp = 140, width = 120, k = 0.0042, speed = 1, twist = 0.0036, x0 = -300, x1 = 1380, rotate = 0, opacity = 1, blur = 0, seed = 0, reveal = 1, shadow = true }) => {
  const N = 150;
  const xs = Array.from({ length: N + 1 }, (_, i) => x0 + ((x1 - x0) * i) / N);
  const pts = xs.map((x) => {
    const cy = y0 + amp * Math.sin(x * k + t * 1.1 * speed + seed) + amp * 0.35 * Math.sin(x * k * 2.3 - t * 0.7 * speed + seed * 2);
    const tw = Math.cos(x * twist + t * 0.9 * speed + seed * 3);
    const hw = (width / 2) * (0.12 + 0.88 * Math.abs(tw));
    // slight slant of the band gives the satin a 3D lean
    const lean = 18 * tw;
    return { x, cy, tw, hw, lean };
  });
  const visibleN = Math.max(1, Math.floor(N * reveal));
  const segs = [];
  for (let i = 0; i < visibleN; i++) {
    const a = pts[i], b = pts[i + 1];
    const tw = (a.tw + b.tw) / 2;
    const front = tw > 0;
    const m = Math.abs(tw) ** 0.7;
    let col = front ? mix(BASE, HI, Math.max(0, m - 0.55) * 1.6) : mix(DARK, BASE, m * 0.75);
    // fold crease darkening near twist zero-crossing
    if (Math.abs(tw) < 0.18) col = mix(col, DARK, 0.5);
    const c = `rgb(${col.join(',')})`;
    segs.push(
      <polygon key={i} fill={c} stroke={c} strokeWidth={1.2}
        points={`${a.x - a.lean},${a.cy - a.hw} ${b.x - b.lean},${b.cy - b.hw} ${b.x + b.lean},${b.cy + b.hw} ${a.x + a.lean},${a.cy + a.hw}`} />,
    );
  }
  // satin specular streak along the band
  const streak = pts.slice(0, visibleN + 1).map((p, i) => `${i ? 'L' : 'M'}${p.x - p.lean * 0.3},${p.cy - p.hw * 0.35 * Math.sign(p.tw)}`).join(' ');
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity, transform: `rotate(${rotate}deg)`, filter: `${blur ? `blur(${blur}px) ` : ''}${shadow ? 'drop-shadow(0 30px 30px rgba(60,0,8,0.35))' : ''}` }}>
      {segs}
      <path d={streak} fill="none" stroke="rgba(255,190,190,0.35)" strokeWidth={width * 0.06} strokeLinecap="round" style={{ filter: 'blur(3px)' }} />
    </svg>
  );
};
