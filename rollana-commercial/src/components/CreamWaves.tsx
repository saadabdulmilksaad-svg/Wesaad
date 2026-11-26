import React from 'react';

/** Flowing white-chocolate / cream silk waves (procedural). */
export const CreamWaves: React.FC<{ t: number; y: number; layers?: number; amp?: number; tone?: 'white' | 'ivory' }> = ({ t, y, layers = 4, amp = 60, tone = 'white' }) => {
  const W = 1080;
  return (
    <svg width={W} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        {Array.from({ length: layers }).map((_, l) => (
          <linearGradient key={l} id={`cw${l}${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tone === 'white' ? '#ffffff' : '#fffaf0'} />
            <stop offset="0.35" stopColor={l % 2 ? '#f6efe2' : '#fbf7ef'} />
            <stop offset="1" stopColor={l % 2 ? '#e2d5bd' : '#ece2cf'} />
          </linearGradient>
        ))}
      </defs>
      {Array.from({ length: layers }).map((_, l) => {
        const base = y + l * 70;
        const ph = t * (0.8 + l * 0.25) + l * 1.7;
        const N = 48;
        const pts = Array.from({ length: N + 1 }, (_, i) => {
          const x = -40 + ((W + 80) * i) / N;
          const yy = base + Math.sin(x * 0.0065 + ph) * amp * (1 - l * 0.12) + Math.sin(x * 0.013 - ph * 1.3) * amp * 0.35;
          return [x, yy];
        });
        const d = `M${pts.map((p) => p.join(',')).join(' L')} L${W + 40},2000 L-40,2000 Z`;
        const crest = `M${pts.map((p) => `${p[0]},${p[1] + 6}`).join(' L')}`;
        return (
          <g key={l} style={{ filter: `drop-shadow(0 -10px 18px rgba(120,90,50,${0.16 - l * 0.02}))` }}>
            <path d={d} fill={`url(#cw${l}${tone})`} />
            <path d={crest} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={5} style={{ filter: 'blur(2px)' }} />
            <path d={crest} fill="none" stroke="rgba(197,164,109,0.25)" strokeWidth={1.5} transform="translate(0,10)" />
          </g>
        );
      })}
    </svg>
  );
};
