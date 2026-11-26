import React from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';

/** Shredded-coconut flakes tumbling in 3D space (procedural, not product pixels). */
export const CoconutFlakes: React.FC<{
  count: number; seed: string; speed?: number; dir?: number; sizeMul?: number;
  lightX?: number; dark?: boolean; opacity?: number; swirl?: number; area?: [number, number, number, number];
}> = ({ count, seed, speed = 1, dir = 1, sizeMul = 1, dark = false, opacity = 1, swirl = 0, area = [-80, -120, 1160, 2040] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const [ax, ay, aw, ah] = area;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', perspective: 900 }}>
      {Array.from({ length: count }).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const depth = r('d'); // 0 far .. 1 near
        const sz = (9 + 26 * depth ** 1.4) * sizeMul;
        const vy = (30 + 90 * depth) * speed * dir;
        const x0 = ax + r('x') * aw;
        const y0 = ay + r('y') * ah;
        let y = ((y0 - ay + vy * t) % ah + ah) % ah + ay;
        let x = x0 + Math.sin(t * (0.4 + r('w')) + r('p') * 6.28) * (20 + 40 * depth);
        if (swirl) {
          const a = swirl * t * (0.3 + depth) + r('a') * 6.28;
          const rad = 180 + r('r') * 520;
          x = 540 + Math.cos(a) * rad;
          y = 900 + Math.sin(a) * rad * 0.55 + (y - 900) * 0.15;
        }
        const blur = depth > 0.82 ? (depth - 0.82) * 30 : depth < 0.25 ? (0.25 - depth) * 10 : 0;
        const rx = t * (60 + 140 * r('rx')) + r('rx0') * 360;
        const ry = t * (50 + 120 * r('ry')) + r('ry0') * 360;
        const rz = r('rz') * 360 + t * 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: sz, height: sz * (0.32 + 0.18 * r('h')),
              borderRadius: '45% 55% 50% 50% / 60% 40% 60% 40%',
              background: dark
                ? 'linear-gradient(160deg, #fffaf0 0%, #efe6d6 55%, #b9ad98 100%)'
                : 'linear-gradient(160deg, #ffffff 0%, #f3ede1 60%, #d9cfbd 100%)',
              boxShadow: dark ? '0 0 10px rgba(255,230,180,0.25)' : '0 3px 6px rgba(90,70,40,0.18)',
              transform: `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg)`,
              filter: blur ? `blur(${blur}px)` : undefined,
              opacity: opacity * (0.55 + 0.45 * depth),
            }}
          />
        );
      })}
    </div>
  );
};

/** Floating gold dust / bokeh. */
export const GoldDust: React.FC<{ count: number; seed: string; opacity?: number; rise?: number; big?: boolean }> = ({ count, seed, opacity = 1, rise = 18, big = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const d = r('d');
        const s = big ? 30 + 90 * d : 3 + 9 * d ** 2;
        const x = r('x') * 1080 + Math.sin(t * 0.5 + r('p') * 9) * 30;
        const y = ((r('y') * 2000 - rise * (0.4 + d) * t) % 2000 + 2000) % 2000 - 40;
        const tw2 = 0.55 + 0.45 * Math.sin(t * (1.5 + 2 * r('f')) + r('q') * 6.28);
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%',
            background: big
              ? 'radial-gradient(circle, rgba(247,224,170,0.55) 0%, rgba(197,164,109,0.25) 45%, rgba(197,164,109,0) 70%)'
              : 'radial-gradient(circle, rgba(255,243,210,1) 0%, rgba(232,196,120,0.7) 35%, rgba(197,164,109,0) 70%)',
            opacity: opacity * tw2 * (big ? 0.6 : 1),
            filter: big ? `blur(${4 + 6 * d}px)` : undefined,
          }} />
        );
      })}
    </div>
  );
};
